// Supabase Edge Function: enviar-email
// Envio transacional e broadcast via Resend (resend.com) com template visual AmorimTech
// Frente 5/7: Gestão de Usuários em Massa, Perfis Customizados e E-mail Automático
// CORRIGIDO: CNPJ do rodapé ajustado para o CNPJ real da empresa
// v2: adicionado aistudio.google.com para permitir testes direto do preview do AI Studio

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

interface TemplateEmailOptions {
  tipo: 'boas-vindas' | 'notificacao' | 'personalizado';
  nome?: string;
  email?: string;
  senhaProvisoria?: string;
  titulo?: string;
  mensagem?: string;
  perfilNome?: string;
  conteudoHtmlPersonalizado?: string;
  linkAcesso?: string;
}

export function gerarTemplateEmailAmorimTech(options: TemplateEmailOptions): { assunto: string; html: string } {
  const urlAcesso = options.linkAcesso || 'https://emanoelamorim.com';

  let tituloAssunto = '';
  let corpoPrincipalHtml = '';

  if (options.tipo === 'boas-vindas') {
    tituloAssunto = 'Bem-vindo à Comunidade Amorim Academy · Seus Dados de Acesso';
    corpoPrincipalHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">
        Olá, <strong>${options.nome || 'Membro'}</strong>!
      </p>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
        É um prazer ter você conosco no <strong>Ecossistema de Formação 4.0 da Amorim Academy</strong>. Sua conta foi criada com sucesso e seu acesso já está liberado.
      </p>
      
      ${options.perfilNome ? `
        <div style="margin: 16px 0; padding: 12px 16px; background-color: #f1f5f9; border-left: 4px solid #B5642A; border-radius: 6px;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Perfil de Acesso:</span>
          <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; color: #132A41;">${options.perfilNome}</p>
        </div>
      ` : ''}

      <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
          Credenciais de Acesso
        </p>
        <p style="margin: 0 0 4px 0; font-size: 15px; color: #334155;">
          <strong>E-mail:</strong> ${options.email || ''}
        </p>
        ${options.senhaProvisoria ? `
          <div style="margin: 12px auto; padding: 10px 20px; background-color: #ffffff; border: 2px dashed #B5642A; border-radius: 8px; display: inline-block;">
            <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Senha Provisória</span>
            <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #132A41; letter-spacing: 2px;">${options.senhaProvisoria}</span>
          </div>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">
            Recomendamos alterar sua senha após o primeiro acesso no menu de Perfil.
          </p>
        ` : ''}
      </div>

      <div style="margin: 28px 0 20px 0; text-align: center;">
        <a href="${urlAcesso}" target="_blank" style="background-color: #132A41; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(19, 42, 65, 0.15);">
          Acessar a Plataforma →
        </a>
      </div>
    `;
  } else if (options.tipo === 'notificacao') {
    tituloAssunto = options.titulo || 'Comunicado Importante · Comunidade Amorim Academy';
    corpoPrincipalHtml = `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">
        Olá, ${options.nome ? `<strong>${options.nome}</strong>` : 'membro da comunidade'}!
      </p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; border-left: 4px solid #132A41;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #132A41; font-weight: bold;">
          ${options.titulo || 'Comunicado Oficial'}
        </h3>
        <div style="font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-line;">
          ${options.mensagem || ''}
        </div>
      </div>

      <div style="margin: 28px 0 20px 0; text-align: center;">
        <a href="${urlAcesso}" target="_blank" style="background-color: #132A41; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">
          Ir para a Comunidade
        </a>
      </div>
    `;
  } else {
    tituloAssunto = options.titulo || 'Amorim Academy';
    corpoPrincipalHtml = options.conteudoHtmlPersonalizado || `<p>${options.mensagem || ''}</p>`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tituloAssunto}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 24px 12px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Cabeçalho Navy com Linha Copper -->
              <tr>
                <td style="background-color: #132A41; padding: 28px 24px; text-align: center; border-bottom: 3px solid #B5642A;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
                    AMORIM ACADEMY
                  </h1>
                  <p style="margin: 6px 0 0 0; color: #B5642A; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                    Ecossistema de Formação 4.0
                  </p>
                </td>
              </tr>

              <!-- Conteúdo Principal -->
              <tr>
                <td style="padding: 32px 28px; background-color: #ffffff;">
                  ${corpoPrincipalHtml}
                </td>
              </tr>

              <!-- Rodapé Institucional -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #64748b;">
                    Amorim Arquitetura, Tech & Academy
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                    CNPJ 35.673.731/0001-82 · Todos os direitos reservados.<br>
                    Este é um e-mail transacional automático. Por favor, não responda a esta mensagem.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { assunto: tituloAssunto, html };
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'Amorim Academy <notificacoes@emanoelamorim.com>';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientCaller = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await clientCaller.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: permissaoAdmin } = await clientAdmin
      .from('permissoes_acesso')
      .select('id')
      .eq('profissional_id', userData.user.id)
      .in('modulo', ['admin', 'admin_comunidade', 'admin_predial'])
      .eq('liberado', true)
      .limit(1);

    if (!permissaoAdmin || permissaoAdmin.length === 0) {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem disparar e-mails da plataforma.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      tipo = 'personalizado',
      destinatarios,
      assunto: assuntoManual,
      html: htmlManual,
      nome,
      email,
      senhaProvisoria,
      titulo,
      mensagem,
      perfilNome,
      linkAcesso,
    } = body;

    const listaDestinatarios: string[] = Array.isArray(destinatarios)
      ? destinatarios.filter(Boolean)
      : [email || destinatarios].filter(Boolean);

    if (listaDestinatarios.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum destinatário informado.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const template = gerarTemplateEmailAmorimTech({
      tipo,
      nome,
      email: listaDestinatarios[0],
      senhaProvisoria,
      titulo,
      mensagem,
      perfilNome,
      conteudoHtmlPersonalizado: htmlManual,
      linkAcesso,
    });

    const assuntoFinal = assuntoManual || template.assunto;
    const htmlFinal = htmlManual || template.html;

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY não configurada no ambiente. E-mail simulado com sucesso.');
      return new Response(JSON.stringify({
        sucesso: true,
        simulado: true,
        mensagem: 'RESEND_API_KEY não configurada nas variáveis de ambiente do Supabase. O disparo foi simulado com sucesso.',
        totalDestinatarios: listaDestinatarios.length,
        destinatarios: listaDestinatarios,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resultadosEnvio: Array<{ email: string; sucesso: boolean; id?: string; error?: string }> = [];

    for (const dest of listaDestinatarios) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: resendFromEmail,
            to: [dest],
            subject: assuntoFinal,
            html: htmlFinal,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          resultadosEnvio.push({ email: dest, sucesso: false, error: resData?.message || 'Falha no envio Resend' });
        } else {
          resultadosEnvio.push({ email: dest, sucesso: true, id: resData?.id });
        }
      } catch (err: any) {
        resultadosEnvio.push({ email: dest, sucesso: false, error: err?.message || 'Exceção de rede' });
      }
    }

    const totalSucesso = resultadosEnvio.filter(r => r.sucesso).length;

    return new Response(JSON.stringify({
      sucesso: totalSucesso > 0,
      totalEnviados: totalSucesso,
      totalFalhas: listaDestinatarios.length - totalSucesso,
      resultados: resultadosEnvio,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno no envio de e-mail.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
