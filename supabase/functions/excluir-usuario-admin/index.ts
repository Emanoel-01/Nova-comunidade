// Supabase Edge Function: excluir-usuario-admin
// Exclui com segurança a conta de autenticação (auth.users) e registros do profissional
// Frente 5/7: Gestão de Usuários em Massa, Perfis Customizados e E-mail Automático
// CORRIGIDO: nomes reais de tabelas (mensagens/conversas, não mensagens_comunidade)
// v3: adicionado aistudio.google.com para permitir testes direto do preview do AI Studio

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://emanoelamorim.com',
  'http://localhost:4200',
  'http://localhost:5173',
  'https://aistudio.google.com',
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: permissaoAdmin, error: erroPermissao } = await clientAdmin
      .from('permissoes_acesso')
      .select('id')
      .eq('profissional_id', userData.user.id)
      .in('modulo', ['admin', 'admin_comunidade', 'admin_predial'])
      .eq('liberado', true)
      .limit(1);

    if (erroPermissao || !permissaoAdmin || permissaoAdmin.length === 0) {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem excluir usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'O ID do usuário a ser excluído é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (userId === userData.user.id) {
      return new Response(JSON.stringify({ error: 'Você não pode excluir sua própria conta de administrador.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Excluir dados dependentes em tabelas públicas para garantir integridade
    // Nomes reais confirmados no schema: mensagens (não mensagens_comunidade), conversas
    const avisos: string[] = [];

    const tentarExcluir = async (label: string, promise: Promise<{ error: any }>) => {
      const { error } = await promise;
      if (error) avisos.push(`${label}: ${error.message}`);
    };

    await tentarExcluir('permissoes_acesso', clientAdmin.from('permissoes_acesso').delete().eq('profissional_id', userId));
    await tentarExcluir('conexoes_comunidade', clientAdmin.from('conexoes_comunidade').delete().or(`seguidor_id.eq.${userId},seguido_id.eq.${userId}`));
    await tentarExcluir('feed_curtidas', clientAdmin.from('feed_curtidas').delete().eq('profissional_id', userId));
    await tentarExcluir('feed_comentarios', clientAdmin.from('feed_comentarios').delete().eq('autor_id', userId));
    await tentarExcluir('feed_posts', clientAdmin.from('feed_posts').delete().eq('autor_id', userId));

    // Mensagens: apagar via conversas em que o usuário participa
    const { data: conversasDoUsuario } = await clientAdmin
      .from('conversas')
      .select('id')
      .or(`participante_1.eq.${userId},participante_2.eq.${userId}`);

    if (conversasDoUsuario && conversasDoUsuario.length > 0) {
      const idsConversas = conversasDoUsuario.map((c: any) => c.id);
      await tentarExcluir('mensagens', clientAdmin.from('mensagens').delete().in('conversa_id', idsConversas));
      await tentarExcluir('conversas', clientAdmin.from('conversas').delete().in('id', idsConversas));
    }

    await tentarExcluir('cursos_matriculas', clientAdmin.from('cursos_matriculas').delete().eq('profissional_id', userId));
    await tentarExcluir('profissionais', clientAdmin.from('profissionais').delete().eq('id', userId));

    // 6. Excluir a conta de autenticação no Supabase Auth via Admin API
    const { error: deleteAuthError } = await clientAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      avisos.push(`auth.users: ${deleteAuthError.message}`);
    }

    return new Response(JSON.stringify({
      sucesso: true,
      mensagem: 'Usuário e acessos excluídos com sucesso.',
      userId,
      avisos: avisos.length > 0 ? avisos : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno ao excluir usuário.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
