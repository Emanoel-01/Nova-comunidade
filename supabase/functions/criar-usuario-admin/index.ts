// Supabase Edge Function: criar-usuario-admin
// Criação individual e em lote de usuários com service_role, aplicação de perfis de acesso e e-mail via Resend.
// Frente 5/7: Gestão de Usuários em Massa, Perfis Customizados e E-mail Automático

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

async function dispararEmailBoasVindas(params: {
  resendApiKey?: string;
  resendFromEmail?: string;
  email: string;
  nome: string;
  senhaProvisoria: string;
  perfilNome?: string;
}): Promise<void> {
  if (!params.resendApiKey) return;

  const urlAcesso = 'https://emanoelamorim.com';
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.06);" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#132A41;padding:28px 24px;text-align:center;border-bottom:3px solid #B5642A;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">AMORIM ACADEMY</h1>
                  <p style="margin:6px 0 0 0;color:#B5642A;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Ecossistema de Formação 4.0</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px;">
                  <p style="margin:0 0 16px 0;font-size:16px;color:#1e293b;">Olá, <strong>${params.nome}</strong>!</p>
                  <p style="margin:0 0 16px 0;font-size:15px;color:#334155;line-height:1.6;">
                    Seu acesso à <strong>Comunidade Amorim Academy</strong> foi liberado com sucesso.
                  </p>
                  ${params.perfilNome ? `
                    <div style="margin:16px 0;padding:12px 16px;background-color:#f1f5f9;border-left:4px solid #B5642A;border-radius:6px;">
                      <span style="font-size:12px;color:#64748b;font-weight:bold;text-transform:uppercase;">Perfil de Acesso:</span>
                      <p style="margin:4px 0 0 0;font-size:15px;font-weight:bold;color:#132A41;">${params.perfilNome}</p>
                    </div>
                  ` : ''}
                  <div style="margin:24px 0;padding:20px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
                    <p style="margin:0 0 8px 0;font-size:12px;color:#64748b;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">Credenciais de Acesso</p>
                    <p style="margin:0 0 4px 0;font-size:15px;color:#334155;"><strong>E-mail:</strong> ${params.email}</p>
                    <div style="margin:12px auto;padding:10px 20px;background-color:#ffffff;border:2px dashed #B5642A;border-radius:8px;display:inline-block;">
                      <span style="font-size:11px;color:#64748b;display:block;">Senha Provisória</span>
                      <span style="font-family:monospace;font-size:20px;font-weight:bold;color:#132A41;letter-spacing:2px;">${params.senhaProvisoria}</span>
                    </div>
                    <p style="margin:6px 0 0 0;font-size:12px;color:#94a3b8;">Altere sua senha no menu de Perfil após o primeiro login.</p>
                  </div>
                  <div style="margin:20px 0;padding:14px 16px;background-color:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #B5642A;border-radius:8px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      <strong>Aviso importante:</strong> Quando for completar seu perfil, você vai encontrar uma seção de <strong>Dados para Documentos Técnicos</strong> (nome completo para laudos, empresa, CNPJ, CREA/CAU, logo, etc.). Preencha com atenção: depois de confirmados, esses dados só podem ser alterados por um administrador.
                    </p>
                  </div>
                  <div style="margin:28px 0 20px 0;text-align:center;">
                    <a href="${urlAcesso}" target="_blank" style="background-color:#132A41;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">
                      Acessar a Plataforma →
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:11px;color:#94a3b8;">Amorim Academy · CNPJ 43.834.786/0001-90</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.resendFromEmail || 'Amorim Academy <notificacoes@emanoelamorim.com>',
        to: [params.email],
        subject: 'Bem-vindo à Comunidade Amorim Academy · Seus Dados de Acesso',
        html,
      }),
    });
  } catch (e) {
    console.warn('Falha no envio de boas-vindas via Resend:', e);
  }
}

async function aplicarPerfilAoUsuario(clientAdmin: any, userId: string, perfilNomeOuId: string): Promise<string | null> {
  try {
    let query = clientAdmin.from('perfis_acesso').select('nome, modulos');
    // Verifica se é UUID ou nome
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(perfilNomeOuId)) {
      query = query.eq('id', perfilNomeOuId);
    } else {
      query = query.ilike('nome', perfilNomeOuId.trim());
    }

    const { data: perfilData } = await query.limit(1).maybeSingle();
    if (!perfilData || !Array.isArray(perfilData.modulos)) {
      return null;
    }

    const inserts = perfilData.modulos.map((m: any) => ({
      profissional_id: userId,
      produto: m.produto || 'comunidade',
      modulo: m.modulo,
      liberado: true,
      atualizado_em: new Date().toISOString(),
    }));

    if (inserts.length > 0) {
      await clientAdmin.from('permissoes_acesso').upsert(inserts, { onConflict: 'profissional_id,produto,modulo' });
    }

    return perfilData.nome;
  } catch (err) {
    console.warn('Aviso ao aplicar perfil ao usuário:', err);
    return null;
  }
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Amorim Academy <notificacoes@emanoelamorim.com>';

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

    // 2. Verificar identidade do usuário que está chamando a função
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

    // 3. Validar se o solicitante possui permissão de Administrador
    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: permissaoAdmin, error: erroPermissao } = await clientAdmin
      .from('permissoes_acesso')
      .select('id')
      .eq('profissional_id', userData.user.id)
      .in('modulo', ['admin', 'admin_comunidade', 'admin_predial'])
      .eq('liberado', true)
      .limit(1);

    if (erroPermissao || !permissaoAdmin || permissaoAdmin.length === 0) {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem criar novos usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Identificar se é criação em lote ou criação individual
    const body = await req.json();
    const isLote = Array.isArray(body.usuarios) && body.usuarios.length > 0;

    if (isLote) {
      // PROCESSAMENTO EM LOTE
      const resultados: Array<{
        full_name: string;
        email: string;
        sucesso: boolean;
        senhaProvisoria?: string;
        perfilAplicado?: string | null;
        error?: string;
        userId?: string;
      }> = [];

      for (const item of body.usuarios) {
        const email = (item.email || '').trim().toLowerCase();
        const full_name = (item.full_name || item.nome || '').trim();
        const perfilNome = item.perfil_nome || item.perfil || '';
        const nivel = item.nivel_atual || 'Membro Trainee';

        if (!email || !full_name) {
          resultados.push({
            full_name: full_name || 'Desconhecido',
            email: email || 'Sem e-mail',
            sucesso: false,
            error: 'Nome completo e e-mail são obrigatórios.',
          });
          continue;
        }

        const senhaFinal = item.password && item.password.trim().length >= 6
          ? item.password.trim()
          : gerarSenhaProvisoria();

        try {
          // Criar em auth.users
          const { data: authData, error: authError } = await clientAdmin.auth.admin.createUser({
            email,
            password: senhaFinal,
            email_confirm: true,
            user_metadata: { full_name, nivel_atual: nivel, must_change_password: true },
          });

          if (authError) {
            resultados.push({
              full_name,
              email,
              sucesso: false,
              error: authError.message,
            });
            continue;
          }

          const userId = authData.user?.id;

          // Criar/atualizar profissionais
          await clientAdmin.from('profissionais').upsert({
            id: userId,
            email,
            full_name,
            nivel_atual: nivel,
            created_at: new Date().toISOString(),
          });

          // Aplicar perfil se fornecido
          let perfilAplicado: string | null = null;
          if (perfilNome && userId) {
            perfilAplicado = await aplicarPerfilAoUsuario(clientAdmin, userId, perfilNome);
          }

          // Se não aplicou perfil específico, aplica base da comunidade (4 módulos)
          if (!perfilAplicado && userId) {
            const baseMods = ['forum', 'vagas', 'materiais', 'eventos'].map(m => ({
              profissional_id: userId,
              produto: 'comunidade',
              modulo: m,
              liberado: true,
            }));
            await clientAdmin.from('permissoes_acesso').upsert(baseMods, { onConflict: 'profissional_id,produto,modulo' });
          }

          // Disparar e-mail de boas-vindas se habilitado
          if (body.enviar_email !== false) {
            await dispararEmailBoasVindas({
              resendApiKey,
              resendFromEmail,
              email,
              nome: full_name,
              senhaProvisoria: senhaFinal,
              perfilNome: perfilAplicado || undefined,
            });
          }

          resultados.push({
            full_name,
            email,
            sucesso: true,
            senhaProvisoria: senhaFinal,
            perfilAplicado,
            userId,
          });
        } catch (err: any) {
          resultados.push({
            full_name,
            email,
            sucesso: false,
            error: err?.message || 'Falha ao processar cadastro.',
          });
        }
      }

      return new Response(JSON.stringify({
        sucesso: true,
        totalProcessados: body.usuarios.length,
        totalSucesso: resultados.filter(r => r.sucesso).length,
        totalFalhas: resultados.filter(r => !r.sucesso).length,
        resultados,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PROCESSAMENTO INDIVIDUAL
    const { email, password, full_name, nivel_atual, perfil_nome, perfil_id, enviar_email = true } = body;

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Nome completo e e-mail são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = full_name.trim();
    const senhaFinal = password && password.trim().length >= 6 ? password.trim() : gerarSenhaProvisoria();

    // 6. Criar usuário em auth.users com e-mail confirmado
    const { data: authData, error: authError } = await clientAdmin.auth.admin.createUser({
      email: emailLimpo,
      password: senhaFinal,
      email_confirm: true,
      user_metadata: { full_name: nomeLimpo, nivel_atual: nivel_atual || 'Membro Trainee', must_change_password: true },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = authData.user?.id;

    // 7. Criar/atualizar registro na tabela profissionais
    const { data: profData, error: profError } = await clientAdmin
      .from('profissionais')
      .upsert({
        id: userId,
        email: emailLimpo,
        full_name: nomeLimpo,
        nivel_atual: nivel_atual || 'Membro Trainee',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 8. Aplicar perfil de acesso se especificado
    let perfilAplicado: string | null = null;
    const refPerfil = perfil_id || perfil_nome;
    if (refPerfil && userId) {
      perfilAplicado = await aplicarPerfilAoUsuario(clientAdmin, userId, refPerfil);
    } else if (userId) {
      // Base padrão: 4 módulos comunitários
      const baseMods = ['forum', 'vagas', 'materiais', 'eventos'].map(m => ({
        profissional_id: userId,
        produto: 'comunidade',
        modulo: m,
        liberado: true,
      }));
      await clientAdmin.from('permissoes_acesso').upsert(baseMods, { onConflict: 'profissional_id,produto,modulo' });
    }

    // 9. Enviar e-mail de boas-vindas
    if (enviar_email !== false) {
      await dispararEmailBoasVindas({
        resendApiKey,
        resendFromEmail,
        email: emailLimpo,
        nome: nomeLimpo,
        senhaProvisoria: senhaFinal,
        perfilNome: perfilAplicado || undefined,
      });
    }

    // 10. Retornar resposta segura com a senha provisória
    return new Response(JSON.stringify({
      user: authData.user,
      profissional: profData,
      senhaProvisoria: senhaFinal,
      perfilAplicado,
      error: profError ? profError.message : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno do servidor.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
