// Supabase Edge Function: evte-analise
// Módulo 3 do agente "Guia de Consulta — Bíblia da Edificação"
// Compara tipologias construtivas escolhidas pelo profissional contra as
// restrições do projeto dele. NUNCA aprova/reprova uma tipologia — só
// apresenta pontos positivos/negativos e um ranking das 3 mais indicadas.
// A decisão de engenharia continua sendo do profissional responsável.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://emanoelamorim.com',
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aistudio.google.com',
];

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

const LIMITE_ANALISES_ANO = 60;

serve(async (req: Request) => {
  const requestOrigin = req.headers.get('Origin');
  const corsHeaders = buildCorsHeaders(requestOrigin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

    // 1. Validar autenticação do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado. Token de sessão ausente.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await clientUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Sessão de usuário inválida ou expirada.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const clientAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Checar permissão de módulo (mesmo padrão de permissoes_acesso do resto do sistema)
    const { data: permissao } = await clientAdmin
      .from('permissoes_acesso')
      .select('liberado')
      .eq('profissional_id', userId)
      .eq('produto', 'comunidade')
      .eq('modulo', 'evte-tipologias')
      .maybeSingle();

    if (!permissao?.liberado) {
      return new Response(JSON.stringify({
        error: 'O Estudo de Viabilidade Técnica e Econômica é exclusivo para membros com acesso liberado a este módulo.',
        codigo: 'SEM_PERMISSAO',
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Checar limite anual de 60 análises
    let totalAnalisesAno = 0;
    try {
      const { data: rpcCount, error: rpcErr } = await clientAdmin.rpc('contar_evte_analises_ano_atual', {
        p_profissional_id: userId,
      });
      if (!rpcErr && typeof rpcCount === 'number') {
        totalAnalisesAno = rpcCount;
      }
    } catch (e) {
      console.warn('Erro ao contar análises EVTE do ano:', e);
    }

    if (totalAnalisesAno >= LIMITE_ANALISES_ANO) {
      return new Response(JSON.stringify({
        error: `Limite anual de ${LIMITE_ANALISES_ANO} análises EVTE atingido (${totalAnalisesAno}/${LIMITE_ANALISES_ANO} utilizadas este ano). O saldo será renovado no próximo ano civil.`,
        codigo: 'LIMITE_ANALISES_EXCEDIDO',
        usoAtual: totalAnalisesAno,
        limite: LIMITE_ANALISES_ANO,
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Extrair dados da requisição
    const body = await req.json();
    const { tipologiasIds, restricoes } = body;

    if (!Array.isArray(tipologiasIds) || tipologiasIds.length < 2) {
      return new Response(JSON.stringify({ error: 'Selecione pelo menos 2 tipologias para comparar.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (tipologiasIds.length > 8) {
      return new Response(JSON.stringify({ error: 'Selecione no máximo 8 tipologias por análise, para manter a comparação legível.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Buscar o conteúdo real das tipologias selecionadas (nunca inventar dado)
    const { data: tipologias, error: tipologiasError } = await clientAdmin
      .from('tipologias_prediais')
      .select('id, numero, titulo, categoria, subtitulo, analise_viabilidade, conflitos_interfaciais, predimensionamento_texto, enquadramento_normativo')
      .in('id', tipologiasIds);

    if (tipologiasError || !tipologias || tipologias.length === 0) {
      return new Response(JSON.stringify({ error: 'Não foi possível carregar as tipologias selecionadas.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Montar o contexto das tipologias (só o que está de fato no banco, nunca inventado)
    const contextoTipologias = tipologias.map((t: any) => `
### ${t.titulo} (Cap. ${t.numero} — ${t.categoria})
${t.subtitulo || ''}

VIABILIDADE E CUSTOS:
${t.analise_viabilidade || 'Não catalogado.'}

CONFLITOS INTERFACIAIS CONHECIDOS:
${t.conflitos_interfaciais || 'Não catalogado.'}

PRÉ-DIMENSIONAMENTO:
${t.predimensionamento_texto || 'Não catalogado.'}

ENQUADRAMENTO NORMATIVO:
${t.enquadramento_normativo || 'Não catalogado.'}
`).join('\n---\n');

    const restricoesTexto = JSON.stringify(restricoes, null, 2);

    // 7. Prompt do sistema — trava explícita contra veredito de aprovação/reprovação
    const systemPrompt = `Você é um consultor técnico sênior de engenharia e arquitetura, auxiliando profissionais a comparar sistemas construtivos para um projeto específico.

REGRA ABSOLUTA E INEGOCIÁVEL: você NUNCA aprova, reprova, ou dá veredito de "pode/não pode usar" sobre nenhuma tipologia. Você é uma ferramenta de TRIAGEM COMPARATIVA, não um substituto do julgamento do engenheiro ou arquiteto responsável. A decisão final é sempre do profissional habilitado, com ART/RRT.

Sua tarefa: para cada tipologia fornecida, você deve:
1. Listar pontos POSITIVOS relevantes para as restrições do caso específico do usuário.
2. Listar pontos de ATENÇÃO ou desvantagens relevantes para as restrições do caso.
3. Citar a norma técnica aplicável, quando disponível no contexto.
4. NUNCA usar palavras como "aprovado", "reprovado", "recomendado" isoladamente, "pode usar", "não pode usar", "está liberado", "está vetado". Em vez disso, use linguagem de comparação: "apresenta vantagem em relação a X", "exige atenção especial devido a Y", "tende a ser mais adequado quando Z".

Ao final, monte um RANKING dos 3 sistemas mais alinhados às restrições informadas — não porque "aprovados", mas porque, cruzando as informações fornecidas, parecem apresentar melhor equilíbrio entre as vantagens e desvantagens descritas para o caso. Deixe claro que esse ranking é um ponto de partida para a análise do profissional, nunca uma decisão de projeto.

Sempre finalize com um lembrete claro de que esta análise é uma ferramenta de organização de informação, e que o dimensionamento, a viabilidade estrutural e a decisão final do sistema construtivo exigem projeto e responsabilidade técnica de profissional habilitado (ART/RRT).

Responda em formato JSON estruturado, seguindo este schema exato:
{
  "comparacoes": [
    {
      "tipologiaId": "string (id exato da tipologia)",
      "titulo": "string",
      "pontosPositivos": ["string", "string", ...],
      "pontosAtencao": ["string", "string", ...],
      "normaAplicavel": "string ou null"
    }
  ],
  "ranking": [
    { "posicao": 1, "tipologiaId": "string", "titulo": "string", "justificativa": "string, sem usar linguagem de aprovação/reprovação" },
    { "posicao": 2, "tipologiaId": "string", "titulo": "string", "justificativa": "string" },
    { "posicao": 3, "tipologiaId": "string", "titulo": "string", "justificativa": "string" }
  ],
  "avisoFinal": "string com o lembrete de responsabilidade técnica"
}

Responda APENAS com o JSON, sem texto antes ou depois, sem markdown de código.`;

    const userPrompt = `RESTRIÇÕES DO PROJETO INFORMADAS PELO PROFISSIONAL:
${restricoesTexto}

TIPOLOGIAS A COMPARAR (conteúdo extraído do livro técnico de referência, use apenas o que está aqui — não complete com conhecimento próprio sobre custos ou normas não mencionados):
${contextoTipologias}

Gere a comparação e o ranking conforme as instruções do sistema.`;

    // 8. Chamada ao Claude
    let resultadoTexto = '';
    if (anthropicApiKey) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 3000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (anthropicRes.ok) {
          const resJson = await anthropicRes.json();
          resultadoTexto = resJson.content?.[0]?.text || '';
        } else {
          const errText = await anthropicRes.text();
          console.error('Anthropic EVTE retornou status não-ok:', anthropicRes.status, errText);
        }
      } catch (anthropicErr) {
        console.error('Erro na chamada Anthropic EVTE:', anthropicErr);
      }
    }

    if (!resultadoTexto) {
      return new Response(JSON.stringify({ error: 'Não foi possível gerar a análise no momento. Tente novamente em instantes.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let resultadoJson: any;
    try {
      const limpo = resultadoTexto.replace(/```json\n?|```\n?/g, '').trim();
      resultadoJson = JSON.parse(limpo);
    } catch (parseErr) {
      console.error('Erro ao parsear resposta da IA como JSON:', parseErr, resultadoTexto);
      return new Response(JSON.stringify({ error: 'A análise foi gerada em formato inesperado. Tente novamente.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 9. Registrar a análise no histórico (permite reabrir/exportar e contar uso)
    const { data: registro, error: registroError } = await clientAdmin
      .from('evte_analises')
      .insert({
        profissional_id: userId,
        tipologias_ids: tipologiasIds,
        restricoes,
        resultado: resultadoJson,
      })
      .select('id, criado_em')
      .single();

    if (registroError) {
      console.warn('Análise gerada mas não registrada no histórico:', registroError);
    }

    return new Response(JSON.stringify({
      id: registro?.id || null,
      criadoEm: registro?.criado_em || new Date().toISOString(),
      resultado: resultadoJson,
      usoAtual: totalAnalisesAno + 1,
      limite: LIMITE_ANALISES_ANO,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('Erro geral na Edge Function evte-analise:', e);
    return new Response(JSON.stringify({ error: 'Erro interno ao processar a análise.' }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
    });
  }
});
