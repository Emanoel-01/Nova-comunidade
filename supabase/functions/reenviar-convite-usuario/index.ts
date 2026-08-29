// Supabase Edge Function: reenviar-convite-usuario
// Gera nova senha provisória aleatória, atualiza conta no Supabase Auth e registra na tabela reenvios_convite
// Suporta execução individual e em lote (Fila de Reenvio de Convites)
// Frente 2/3 (Revisado): Fila de Reenvio de Convite em Lotes Controlados + Rastreio

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://emanoelamorim.com',
  'http://localhost:4200',
  'http://localhost:5173',
];

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function gerarSenhaProvisoria(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let senha = '';
  for (let i = 0; i < 12; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

interface ItemResultadoReenvio {
  userId: string;
  email: string;
  nome: string;
  sucesso: boolean;
  senhaProvisoria?: string;
  error?: string;
  reenvioId?: string;
}

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = buildCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Configuração do servidor incompleta (service role).' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Validar a presença do cabeçalho de autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Verificar identidade do usuário solicitante
    const clientCaller = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await clientCaller.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminUserId = userData.user.id;

    // 3. Validar se o solicitante possui permissão de Administrador
    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: permissaoAdmin, error: erroPermissao } = await clientAdmin
      .from('permissoes_acesso')
      .select('id')
      .eq('profissional_id', adminUserId)
      .in('modulo', ['admin', 'admin_comunidade', 'admin_predial'])
      .eq('liberado', true)
      .limit(1);

    if (erroPermissao || !permissaoAdmin || permissaoAdmin.length === 0) {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem resetar credenciais e reenviar convites.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extrair parâmetros da requisição
    const body = await req.json();
    const templateChave = body.template_chave || body.templateChave || null;

    // Identificar lista de IDs a processar (seja em array de IDs, array de objetos ou ID individual)
    let idsParaProcessar: string[] = [];

    if (Array.isArray(body.profissionalIds) && body.profissionalIds.length > 0) {
      idsParaProcessar = body.profissionalIds.filter(Boolean);
    } else if (Array.isArray(body.profissional_ids) && body.profissional_ids.length > 0) {
      idsParaProcessar = body.profissional_ids.filter(Boolean);
    } else if (Array.isArray(body.usuarios) && body.usuarios.length > 0) {
      idsParaProcessar = body.usuarios.map((u: any) => u.id || u.userId || u.profissional_id).filter(Boolean);
    } else if (body.userId || body.profissional_id) {
      idsParaProcessar = [body.userId || body.profissional_id];
    } else if (body.email) {
      const emailTrim = (body.email || '').trim().toLowerCase();
      const { data: prof } = await clientAdmin
        .from('profissionais')
        .select('id')
        .ilike('email', emailTrim)
        .maybeSingle();

      if (prof?.id) {
        idsParaProcessar = [prof.id];
      }
    }

    if (idsParaProcessar.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum usuário válido informado para reenvio.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resultados: ItemResultadoReenvio[] = [];
    const timestampReenvio = new Date().toISOString();

    for (const targetUserId of idsParaProcessar) {
      try {
        // 5. Buscar dados do usuário no Supabase Auth via Admin API
        const { data: authUserData, error: getUserError } = await clientAdmin.auth.admin.getUserById(targetUserId);
        
        let targetEmail = authUserData?.user?.email || '';
        let targetNome = authUserData?.user?.user_metadata?.full_name || '';

        // Buscar dados complementares na tabela profissionais
        const { data: profData } = await clientAdmin
          .from('profissionais')
          .select('full_name, email')
          .eq('id', targetUserId)
          .maybeSingle();

        if (profData) {
          if (!targetNome && profData.full_name) targetNome = profData.full_name;
          if (!targetEmail && profData.email) targetEmail = profData.email;
        }

        if (getUserError || !authUserData?.user) {
          // Se não estiver em auth.users mas estiver em profissionais, tentar localizar por e-mail se possível
          resultados.push({
            userId: targetUserId,
            email: targetEmail || 'Não localizado',
            nome: targetNome || 'Desconhecido',
            sucesso: false,
            error: getUserError?.message || 'Usuário não localizado no Supabase Auth.',
          });
          continue;
        }

        const authUser = authUserData.user;

        // 6. Gerar nova senha provisória aleatória e segura
        const novaSenhaProvisoria = gerarSenhaProvisoria();

        // 7. Atualizar a senha no Supabase Auth via Admin API
        const { error: updateAuthError } = await clientAdmin.auth.admin.updateUserById(targetUserId, {
          password: novaSenhaProvisoria,
          user_metadata: {
            ...(authUser.user_metadata || {}),
            must_change_password: true,
            ultimo_convite_reenviado_em: timestampReenvio,
          },
        });

        if (updateAuthError) {
          resultados.push({
            userId: targetUserId,
            email: targetEmail,
            nome: targetNome,
            sucesso: false,
            error: updateAuthError.message || 'Falha ao atualizar senha provisória.',
          });
          continue;
        }

        // 8. Atualizar registro em profissionais
        await clientAdmin.from('profissionais').update({
          updated_at: timestampReenvio,
        }).eq('id', targetUserId);

        // 9. Inserir auditoria na tabela reenvios_convite
        let reenvioId: string | undefined;
        try {
          const { data: reenvioInsert } = await clientAdmin
            .from('reenvios_convite')
            .insert({
              profissional_id: targetUserId,
              enviado_em: timestampReenvio,
              template_chave: templateChave,
              enviado_por: adminUserId,
            })
            .select('id')
            .maybeSingle();

          reenvioId = reenvioInsert?.id;
        } catch (eAudit) {
          console.warn('Aviso ao registrar na tabela reenvios_convite:', eAudit);
        }

        resultados.push({
          userId: targetUserId,
          email: targetEmail,
          nome: targetNome,
          sucesso: true,
          senhaProvisoria: novaSenhaProvisoria,
          reenvioId,
        });

      } catch (errUser: any) {
        resultados.push({
          userId: targetUserId,
          email: '',
          nome: '',
          sucesso: false,
          error: errUser?.message || 'Erro inesperado ao processar usuário.',
        });
      }
    }

    const totalSucesso = resultados.filter(r => r.sucesso).length;
    const totalFalhas = resultados.filter(r => !r.sucesso).length;

    // Se a requisição original pediu apenas 1 usuário e não foi em formato de lote explícito, mantém o formato de retorno individual amigável
    if (idsParaProcessar.length === 1 && !Array.isArray(body.profissionalIds) && !Array.isArray(body.profissional_ids) && !Array.isArray(body.usuarios)) {
      const primeiro = resultados[0];
      if (primeiro.sucesso) {
        return new Response(JSON.stringify({
          sucesso: true,
          userId: primeiro.userId,
          email: primeiro.email,
          nome: primeiro.nome,
          senhaProvisoria: primeiro.senhaProvisoria,
          atualizado_em: timestampReenvio,
          reenvioId: primeiro.reenvioId,
          totalProcessados: 1,
          totalSucesso: 1,
          totalFalhas: 0,
          resultados,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          sucesso: false,
          error: primeiro.error || 'Falha ao processar reenvio.',
          resultados,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Resposta em lote completa
    return new Response(JSON.stringify({
      sucesso: totalSucesso > 0,
      totalProcessados: idsParaProcessar.length,
      totalSucesso,
      totalFalhas,
      atualizado_em: timestampReenvio,
      resultados,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno ao processar reenvio de convite.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
