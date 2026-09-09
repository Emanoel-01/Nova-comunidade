// Supabase Edge Function: excluir-usuario-admin
// Exclui com segurança a conta de autenticação (auth.users) e registros do profissional
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
      return new Response(JSON.stringify({ error: 'Apenas administradores podem excluir usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extrair ID do usuário a ser excluído
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'O ID do usuário a ser excluído é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Proteção: o administrador não pode excluir a si mesmo
    if (userId === userData.user.id) {
      return new Response(JSON.stringify({ error: 'Você não pode excluir sua própria conta de administrador.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Excluir dados dependentes em tabelas públicas para garantir integridade
    await clientAdmin.from('permissoes_acesso').delete().eq('profissional_id', userId);
    await clientAdmin.from('conexoes_comunidade').delete().or(`seguidor_id.eq.${userId},seguido_id.eq.${userId}`);
    await clientAdmin.from('feed_curtidas').delete().eq('profissional_id', userId);
    await clientAdmin.from('feed_comentarios').delete().eq('autor_id', userId);
    await clientAdmin.from('feed_posts').delete().eq('autor_id', userId);
    await clientAdmin.from('mensagens_comunidade').delete().or(`remetente_id.eq.${userId},destinatario_id.eq.${userId}`);
    await clientAdmin.from('profissionais').delete().eq('id', userId);

    // 6. Excluir a conta de autenticação no Supabase Auth via Admin API
    const { error: deleteAuthError } = await clientAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.warn('Aviso ao excluir conta em auth.users:', deleteAuthError.message);
      // Mesmo se o usuário não estava em auth.users, se os dados públicos foram removidos, sucesso
    }

    return new Response(JSON.stringify({
      sucesso: true,
      mensagem: 'Usuário e acessos excluídos com sucesso.',
      userId,
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
