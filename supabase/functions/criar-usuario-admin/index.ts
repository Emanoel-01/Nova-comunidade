// Supabase Edge Function: criar-usuario-admin
// Utilizada para criar contas de autenticação com segurança no servidor usando a chave service_role.
// Não expor service_role no cliente frontend!

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Configuração do servidor incompleta (service role).' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validação do solicitante (Admin)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { email, password, full_name, nivel_atual } = await req.json();

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: 'Nome e e-mail são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar usuário em auth.users
    const { data: authData, error: authError } = await clientAdmin.auth.admin.createUser({
      email,
      password: password || 'Mudar123!',
      email_confirm: true,
      user_metadata: { full_name, nivel_atual: nivel_atual || 'Membro Trainee' },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar/atualizar linha correspondente em profissionais
    const { data: profData, error: profError } = await clientAdmin
      .from('profissionais')
      .upsert({
        id: authData.user?.id,
        email,
        full_name,
        nivel_atual: nivel_atual || 'Membro Trainee',
      })
      .select()
      .single();

    return new Response(JSON.stringify({ user: authData.user, profissional: profData, error: profError?.message || null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
