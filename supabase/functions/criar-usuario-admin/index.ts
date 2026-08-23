// Supabase Edge Function: criar-usuario-admin
// Utilizada para criar contas de autenticação com segurança no servidor usando a chave service_role.
// Valida que quem chama é administrador ativo e gera senha provisória aleatória.
// Nunca expor a chave service_role no front-end!

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
      return new Response(JSON.stringify({ error: 'Apenas administradores podem criar novos usuários.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extrair e validar dados do corpo da requisição
    const { email, password, full_name, nivel_atual } = await req.json();

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Nome completo e e-mail são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Gerar senha provisória aleatória caso não seja fornecida
    const senhaFinal = password && password.trim().length >= 6 ? password.trim() : gerarSenhaProvisoria();

    // 6. Criar usuário em auth.users com e-mail confirmado
    const { data: authData, error: authError } = await clientAdmin.auth.admin.createUser({
      email,
      password: senhaFinal,
      email_confirm: true,
      user_metadata: { full_name, nivel_atual: nivel_atual || 'Membro Trainee' },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 7. Criar/atualizar registro na tabela profissionais
    const { data: profData, error: profError } = await clientAdmin
      .from('profissionais')
      .upsert({
        id: authData.user?.id,
        email,
        full_name,
        nivel_atual: nivel_atual || 'Membro Trainee',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 8. Retornar resposta segura com a senha provisória
    return new Response(JSON.stringify({
      user: authData.user,
      profissional: profData,
      senhaProvisoria: senhaFinal,
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
