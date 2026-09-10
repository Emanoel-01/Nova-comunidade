// Supabase Edge Function: analisar-licitacao
// Análise automatizada de Editais e Documentos de Habilitação via Claude Sonnet 5 (Anthropic)
// Módulo Comunidade Nova · Checklist de Licitação (Lei 14.133/2021)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://emanoelamorim.com',
  'http://localhost:4200',
  'http://localhost:5173',
  'http://localhost:3000',
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

const CHECKLIST_PADRAO_TEXTO = `
1. Habilitação Jurídica:
- hj01: Ato constitutivo, estatuto ou contrato social consolidado (Obrigatório)
- hj02: Documento de eleição dos administradores, se aplicável (Obrigatório)
- hj03: Registro comercial (empresário individual) ou inscrição no órgão de classe (Opcional)
- hj04: Procuração com poderes específicos, se representante não for sócio (Opcional)

2. Regularidade Fiscal e Trabalhista:
- rf01: Prova de inscrição no CNPJ (Obrigatório)
- rf02: Certidão Negativa de Débitos Federais / CND conjunta Receita/PGFN (Obrigatório)
- rf03: Certidão de Regularidade do FGTS / CRF (Obrigatório)
- rf04: Certidão Negativa de Débitos Trabalhistas / CNDT (Obrigatório)
- rf05: Certidão de Regularidade com a Fazenda Estadual (Obrigatório)
- rf06: Certidão de Regularidade com a Fazenda Municipal (Obrigatório)

3. Qualificação Econômico-Financeira:
- ef01: Balanço patrimonial e demonstrações contábeis do último exercício social (Obrigatório)
- ef02: Certidão negativa de falência ou recuperação judicial (Obrigatório)
- ef03: Comprovação de capital social ou patrimônio líquido mínimo (conforme edital)
- ef04: Garantia de proposta, se exigida no edital (Opcional)

4. Qualificação Técnica:
- qt01: Registro ou inscrição da empresa no CREA/CAU (Obrigatório)
- qt02: ART/RRT de cargo e função do responsável técnico (Obrigatório)
- qt03: Atestado(s) de Capacidade Técnica compatíveis com o objeto (Obrigatório)
- qt04: CAT — Certidão de Acervo Técnico do responsável técnico (Obrigatório)
- qt05: Comprovação de vínculo do responsável técnico com a empresa (Obrigatório)
- qt06: Declaração de disponibilidade de equipamento/equipe (Opcional)
`;

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

    // 2. Extrair dados da requisição
    const body = await req.json();
    const {
      tipo, // 'edital' | 'documentacao'
      nomeEdital = 'Edital de Licitação',
      textoEdital = '',
      arquivos = [], // Array<{ nome: string; url?: string; caminhoStorage?: string; tipoMime?: string; itemId?: string; descricao?: string }>
      analisePreviaId = null
    } = body;

    if (!tipo || (tipo !== 'edital' && tipo !== 'documentacao')) {
      return new Response(JSON.stringify({ error: 'Tipo de análise inválido. Informe "edital" ou "documentacao".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Checar pacotes ativos do profissional
    const hojeStr = new Date().toISOString().split('T')[0];
    const { data: pacotes, error: pacotesErr } = await clientAdmin
      .from('pacotes_licitacao')
      .select('pacote, ativo, data_expiracao')
      .eq('profissional_id', userId)
      .eq('ativo', true);

    if (pacotesErr) {
      console.error('Erro ao consultar pacotes:', pacotesErr);
    }

    const pacotesAtivos = (pacotes || []).filter(p => {
      if (!p.data_expiracao) return true;
      return p.data_expiracao >= hojeStr;
    });

    const temPacoteA = pacotesAtivos.some(p => p.pacote === 'A');
    const temPacoteB = pacotesAtivos.some(p => p.pacote === 'B');

    // Regra de negócio: Exige Pacote A ativo para rodar análises.
    if (!temPacoteA && !temPacoteB) {
      return new Response(JSON.stringify({
        error: 'Você não possui pacote de análises de licitação ativo. Adquira o Pacote A (5 análises/mês) ou Pacote A+B (10 análises/mês) para utilizar a IA.',
        codigo: 'SEM_PACOTE'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limite: 5 se apenas A; 10 se A+B (ou se B estiver presente)
    const limiteAnalises = (temPacoteA && temPacoteB) ? 10 : (temPacoteA ? 5 : 10);

    // 4. Checar consumo do mês atual
    let totalUsadasMes = 0;
    try {
      const { data: rpcCount, error: rpcErr } = await clientAdmin.rpc('contar_analises_licitacao_mes_atual', {
        p_profissional_id: userId,
      });

      if (!rpcErr && typeof rpcCount === 'number') {
        totalUsadasMes = rpcCount;
      } else {
        // Fallback direto via count na tabela
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { count, error: countErr } = await clientAdmin
          .from('analises_licitacao')
          .select('id', { count: 'exact', head: true })
          .eq('profissional_id', userId)
          .gte('criado_em', inicioMes.toISOString());

        if (!countErr && count !== null) {
          totalUsadasMes = count;
        }
      }
    } catch (e) {
      console.warn('Erro ao contar análises:', e);
    }

    if (totalUsadasMes >= limiteAnalises) {
      return new Response(JSON.stringify({
        error: `Limite mensal de ${limiteAnalises} análises atingido (${totalUsadasMes}/${limiteAnalises} utilizadas este mês). Faça upgrade para o Pacote B (+5 análises) ou aguarde o próximo ciclo.`,
        codigo: 'LIMITE_EXCEDIDO',
        usoAtual: totalUsadasMes,
        limite: limiteAnalises
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Obter contexto prévio se for análise de documentação
    let contextoEditalPrevio: any = null;
    if (tipo === 'documentacao' && analisePreviaId) {
      const { data: analiseEdital } = await clientAdmin
        .from('analises_licitacao')
        .select('resultado_analise, nome_edital')
        .eq('id', analisePreviaId)
        .eq('profissional_id', userId)
        .maybeSingle();

      if (analiseEdital) {
        contextoEditalPrevio = analiseEdital.resultado_analise;
      }
    }

    // 6. Montar o Prompt de Sistema e Mensagem para o Claude Sonnet 5
    let resultadoAnalise: any = null;

    if (anthropicApiKey) {
      try {
        let systemPrompt = '';
        let userContent = '';

        if (tipo === 'edital') {
          systemPrompt = `Você é um Consultor Sênior e Advogado Especialista em Licitações Públicas no Brasil, com profundo domínio da Nova Lei de Licitações e Contratos Administrativos (Lei Federal nº 14.133/2021), jurisprudência do Tribunal de Contas da União (TCU) e práticas de contratação de obras e serviços de engenharia.

Sua missão é realizar a ANÁLISE CRÍTICA DE EDITAL e produzir um parecer técnico-jurídico estruturado em JSON com rigor absoluto.

Instruções fundamentais:
1. Extraia o objeto, valor estimado (se houver), modalidade (Pregão, Concorrência, etc.), critério de julgamento e prazos.
2. Identifique TODAS as exigências de habilitação (Jurídica, Fiscal/Trabalhista, Econômico-Financeira e Técnica).
3. Compare com o CHECKLIST PADRÃO de referência:
${CHECKLIST_PADRAO_TEXTO}
4. Identifique exigências ESPECÍFICAS/EXTRAS que vão além do padrão (ex: exigência de visita técnica obrigatória, índices contábeis específicos com faixas restritivas, capital social mínimo, atestados com quantidades elevadas de serviços secundários, prazos de validade de certidões não usuais).
5. Mapeie TODAS as DECLARAÇÕES EXIGIDAS no edital (ex: Inexistência de Fatos Impeditivos, Não Emprego de Menores, Cumprimento dos Requisitos de Habilitação, Elaboração Independente de Proposta, Enquadramento ME/EPP, Vistoria ou Renúncia de Vistoria, Reserva de Vagas PCD, Inexistência de Vínculo com Servidor Público, Responsabilidade Técnica). Se o edital contiver minuta/anexo com modelo, use o texto do modelo com placeholders; caso contrário, gere o modelo padrão fundamentado na Lei 14.133/2021.
6. Aponte CLÁUSULAS RESTRITIVAS ou ILEGAIS com fundamentação legal na Lei 14.133/2021 (ex: art. 67, art. 69, vedações de marcas, etc.) e defina recomendações práticas (Pedido de Esclarecimento, Impugnação de Edital, ou Providência Imediata).
7. Calcule o Nível Geral de Risco da Licitação ('Baixo', 'Médio', 'Alto', 'Crítico').

Responda ESTRITAMENTE em formato JSON com o seguinte schema TypeScript:
{
  "nome_edital": string,
  "orgao_licitante": string,
  "modalidade": string,
  "objeto_resumo": string,
  "valor_estimado": string | null,
  "data_abertura": string | null,
  "nivel_risco_geral": "Baixo" | "Médio" | "Alto" | "Crítico",
  "score_risco": number, // 0 a 100
  "resumo_executivo_risco": string,
  "declaracoes_exigidas_edital": Array<{
    "id": string,
    "nome": string,
    "obrigatorio": boolean,
    "origem": "Modelo do Edital (Anexo)" | "Padrão Lei 14.133/2021 (Mercado)",
    "base_legal": string,
    "texto_modelo": string, // Texto estruturado com placeholders: {{RAZAO_SOCIAL}}, {{CNPJ}}, {{REPRESENTANTE_LEGAL}}, {{CPF_REPRESENTANTE}}, {{NUMERO_EDITAL}}, {{ORGAO_LICITANTE}}, {{OBJETO}}, {{CIDADE}}, {{DATA}}
    "orientacao_preenchimento": string
  }>,
  "exigencias_extras_edital": Array<{
    "categoria": "Habilitação Jurídica" | "Regularidade Fiscal" | "Qualificação Econômico-Financeira" | "Qualificação Técnica" | "Condições Gerais",
    "item": string,
    "descricao_detalhada": string,
    "impacto": "Crítico" | "Médio" | "Baixo",
    "artigo_lei_14133": string
  }>,
  "clausulas_restritivas_alertas": Array<{
    "clausula_ou_item": string,
    "problema_identificado": string,
    "nivel_gravidade": "Alto" | "Médio" | "Baixo",
    "fundamento_legal": string,
    "acao_recomendada": "Impugnar Edital" | "Pedir Esclarecimento" | "Providenciar Documento com Urgência" | "Monitorar"
  }>,
  "indices_contabeis_exigidos": Array<{
    "indice": string, // ex: "Liquidez Geral (LG)", "Liquidez Corrente (LC)", "Solvência Geral (SG)", "Patrimônio Líquido"
    "valor_exigido": string,
    "observacao": string
  }>,
  "prazos_criticos": Array<{
    "evento": string,
    "prazo_legal": string,
    "data_limite_estimada": string,
    "observacao": string
  }>,
  "parecer_conclusivo": string
}`;

          userContent = `Analise o seguinte edital de licitação:
Nome do Edital: ${nomeEdital}
Texto / Trechos / Documentos fornecidos:
${textoEdital || 'Edital: ' + nomeEdital + '. Arquivos anexos: ' + JSON.stringify(arquivos.map((a: any) => a.nome))}`;

        } else {
          // tipo === 'documentacao'
          systemPrompt = `Você é um Auditor Sênior de Documentação de Licitações Públicas (Lei Federal nº 14.133/2021).
Sua missão é auditar os documentos de habilitação enviados pelo licitante para conferir se cumprem as exigências da lei e do edital, identificando pendências, certidões vencidas, inconsistências técnicas ou riscos de inabilitação.

Checklist padrão de referência:
${CHECKLIST_PADRAO_TEXTO}

Contexto do Edital analisado:
${contextoEditalPrevio ? JSON.stringify(contextoEditalPrevio) : 'Edital: ' + nomeEdital}

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "nome_edital": string,
  "status_habilitacao_geral": "Apto para Participar" | "Apto com Ressalvas" | "Risco Elevado de Inabilitação" | "Inapto (Pendências Críticas)",
  "percentual_conformidade": number, // 0 a 100
  "total_documentos_analisados": number,
  "total_conformes": number,
  "total_pendentes": number,
  "total_criticos": number,
  "auditoria_por_item": Array<{
    "item_id": string,
    "categoria": string,
    "item_nome": string,
    "obrigatorio": boolean,
    "status": "Conforme" | "Pendente" | "Vencido / Inválido" | "Risco de Inabilitação",
    "documento_enviado_nome": string | null,
    "parecer_auditoria": string,
    "recomendacao_corretiva": string | null
  }>,
  "principais_alertas": string[],
  "parecer_final_auditoria": string
}`;

          userContent = `Realize a auditoria documental para os seguintes arquivos enviados pelo licitante:
Edital: ${nomeEdital}
Arquivos enviados:
${JSON.stringify(arquivos, null, 2)}`;
        }

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }],
          }),
        });

        if (anthropicRes.ok) {
          const resJson = await anthropicRes.json();
          const rawText = resJson.content?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            resultadoAnalise = JSON.parse(cleanedJson);
          } catch (pe) {
            console.warn('Falha ao fazer parse do JSON da Anthropic, usando raw:', pe);
            resultadoAnalise = {
              nome_edital: nomeEdital,
              texto_bruto: rawText,
              parecer_conclusivo: rawText
            };
          }
        } else {
          const errBody = await anthropicRes.text();
          console.warn('Anthropic API retornou status não-ok:', anthropicRes.status, errBody);
        }
      } catch (anthropicErr) {
        console.error('Erro na chamada Anthropic:', anthropicErr);
      }
    }

    // 7. Se não houver resultado (chave ausente ou falha na API), retornar serviço indisponível
    if (!resultadoAnalise) {
      return new Response(
        JSON.stringify({
          error: 'servico_indisponivel',
          message: 'Análise indisponível no momento. Tente novamente mais tarde.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Gravar registro em public.analises_licitacao
    const { data: novaAnalise, error: insertErr } = await clientAdmin
      .from('analises_licitacao')
      .insert({
        profissional_id: userId,
        tipo,
        nome_edital: nomeEdital,
        resultado_analise: resultadoAnalise,
      })
      .select('id, criado_em')
      .single();

    if (insertErr) {
      console.error('Erro ao gravar analises_licitacao:', insertErr);
    }

    const analiseId = novaAnalise?.id || crypto.randomUUID();
    const novoUsoTotal = totalUsadasMes + 1;

    return new Response(JSON.stringify({
      sucesso: true,
      analiseId,
      tipo,
      nomeEdital,
      resultado: resultadoAnalise,
      usoMes: novoUsoTotal,
      limiteMes: limiteAnalises,
      saldoRestante: Math.max(0, limiteAnalises - novoUsoTotal),
      pacotesAtivos: {
        pacoteA: temPacoteA,
        pacoteB: temPacoteB,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Exceção na Edge Function analisar-licitacao:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Erro interno no processamento da análise de licitação.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
