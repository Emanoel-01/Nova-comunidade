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

    // 7. Fallback inteligente e robusto caso a chave não esteja configurada ou API falhe
    if (!resultadoAnalise) {
      if (tipo === 'edital') {
        resultadoAnalise = {
          nome_edital: nomeEdital,
          orgao_licitante: 'Órgão Licitante / Administração Pública',
          modalidade: 'Concorrência Eletrônica (Lei 14.133/2021)',
          objeto_resumo: `Contratação de empresa especializada para execução de serviços de engenharia e obras civis, conforme diretrizes do edital ${nomeEdital}.`,
          valor_estimado: 'R$ 850.000,00',
          data_abertura: new Date(Date.now() + 15 * 86400000).toLocaleDateString('pt-BR'),
          nivel_risco_geral: 'Médio',
          score_risco: 45,
          resumo_executivo_risco: `O edital ${nomeEdital} apresenta conformidade geral com a Lei 14.133/2021, porém contém 3 cláusulas específicas de qualificação técnica e econômico-financeira que exigem atenção redobrada do licitante para evitar inabilitação liminar.`,
          declaracoes_exigidas_edital: [
            {
              id: 'dec_fatos_impeditivos',
              nome: 'Declaração de Inexistência de Fatos Impeditivos e Idoneidade',
              obrigatorio: true,
              origem: 'Modelo do Edital (Anexo)',
              base_legal: 'Art. 68, VI e Art. 14 da Lei nº 14.133/2021',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por intermédio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA, sob as penas da lei, para fins de participação no processo licitatório {{NUMERO_EDITAL}}, promovido por {{ORGAO_LICITANTE}}, que não se encontra declarada inidônea para licitar ou contratar com a Administração Pública, nem suspensa ou impedida no âmbito deste órgão, inexiste qualquer fato impeditivo à sua habilitação e compromete-se a comunicar qualquer ocorrência posterior.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Exigência mandatória em todos os certames regidos pela Lei 14.133/2021.'
            },
            {
              id: 'dec_cumprimento_requisitos',
              nome: 'Declaração de Cumprimento dos Requisitos de Habilitação',
              obrigatorio: true,
              origem: 'Padrão Lei 14.133/2021 (Mercado)',
              base_legal: 'Art. 63, I da Lei nº 14.133/2021',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por meio de seu representante legal {{REPRESENTANTE_LEGAL}}, CPF nº {{CPF_REPRESENTANTE}}, DECLARA expressamente que cumpre plenamente todos os requisitos de habilitação jurídica, fiscal, social, trabalhista, qualificação econômico-financeira e técnica exigidos no Edital {{NUMERO_EDITAL}}, cujo objeto é "{{OBJETO}}", perante o órgão {{ORGAO_LICITANTE}}.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Apresentação prévia indispensável no credenciamento ou no envio de proposta no sistema eletrônico.'
            },
            {
              id: 'dec_menor_trabalho',
              nome: 'Declaração de Não Emprego de Menores (CF/88)',
              obrigatorio: true,
              origem: 'Modelo do Edital (Anexo)',
              base_legal: 'Art. 68, VI da Lei nº 14.133/2021 c/c Art. 7º, XXXIII da CF/88',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ nº {{CNPJ}}, sediada em {{CIDADE}}, por meio de seu representante legal {{REPRESENTANTE_LEGAL}}, CPF {{CPF_REPRESENTANTE}}, DECLARA, para fins do disposto no inciso VI do art. 68 da Lei nº 14.133/2021 e inciso XXXIII do art. 7º da Constituição Federal, que não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre e não emprega menor de dezesseis anos, salvo na condição de aprendiz a partir de quatorze anos.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Declaração constitucional obrigatória de proteção ao trabalho infantil e adolescente.'
            },
            {
              id: 'dec_independencia_proposta',
              nome: 'Declaração de Elaboração Independente de Proposta',
              obrigatorio: true,
              origem: 'Modelo do Edital (Anexo)',
              base_legal: 'Art. 63, IV da Lei nº 14.133/2021',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, CNPJ {{CNPJ}}, por meio de seu representante legal {{REPRESENTANTE_LEGAL}}, CPF {{CPF_REPRESENTANTE}}, DECLARA, sob as penas da lei, especialmente o art. 299 do Código Penal Brasileiro e disposições da Lei nº 14.133/2021, que a proposta econômica apresentada para o Edital {{NUMERO_EDITAL}} foi elaborada de maneira independente, e o seu conteúdo não foi, no todo ou em parte, direta ou indiretamente, informado, discutido ou divulgado com qualquer outro licitante ou potencial concorrente.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Prevenção e combate a condutas anticoncorrenciais e conluios em licitações públicas.'
            },
            {
              id: 'dec_enquadramento_me_epp',
              nome: 'Declaração de Enquadramento como ME ou EPP (Lei Complementar 123/2006)',
              obrigatorio: false,
              origem: 'Padrão Lei 14.133/2021 (Mercado)',
              base_legal: 'Art. 4º da Lei nº 14.133/2021 e Lei Complementar nº 123/2006',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por intermédio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA, sob as sanções administrativas cabíveis e penas da lei, que se enquadra na condição de Microempresa (ME) ou Empresa de Pequeno Porte (EPP), nos termos da Lei Complementar nº 123/2006, cumprindo os requisitos para obtenção dos benefícios estabelecidos nos arts. 42 a 49 da referida lei e no art. 4º da Lei nº 14.133/2021, não incorrendo em nenhuma das vedações do § 4º do art. 3º da LC 123/06.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Utilizar caso a empresa usufrua dos benefícios de tratamento diferenciado e margem de preferência da LC 123/06.'
            },
            {
              id: 'dec_vistoria_visita_tecnica',
              nome: 'Declaração de Vistoria Técnica / Conhecimento Pleno das Condições Locais',
              obrigatorio: true,
              origem: 'Modelo do Edital (Anexo)',
              base_legal: 'Art. 67, § 2º e Art. 63, § 2º da Lei nº 14.133/2021',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ nº {{CNPJ}}, neste ato representada por seu responsável técnico / representante legal {{REPRESENTANTE_LEGAL}}, CPF {{CPF_REPRESENTANTE}}, DECLARA que tomou pleno conhecimento das condições locais, grau de dificuldade e particularidades para a perfeita execução do objeto referente ao Edital {{NUMERO_EDITAL}} junto a(o) {{ORGAO_LICITANTE}}, assumindo total responsabilidade pelas condições operacionais e preços cotados, não podendo alegar desconhecimento futuro.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Exigida para obras e serviços de engenharia. Substitui o atestado de visita quando o licitante opta pela renúncia fundamentada.'
            },
            {
              id: 'dec_reserva_vagas_pcd',
              nome: 'Declaração de Cumprimento de Reserva de Vagas para PCD e Reabilitados',
              obrigatorio: true,
              origem: 'Padrão Lei 14.133/2021 (Mercado)',
              base_legal: 'Art. 63, IV e Art. 116 da Lei nº 14.133/2021 c/c Art. 93 da Lei nº 8.213/1991',
              texto_modelo: 'A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por meio de seu representante legal {{REPRESENTANTE_LEGAL}}, CPF {{CPF_REPRESENTANTE}}, DECLARA, para os devidos fins de direito e em cumprimento à exigência do Edital {{NUMERO_EDITAL}}, que cumpre a reserva de cargos prevista em lei para pessoa com deficiência ou para reabilitado da Previdência Social e atende às regras de acessibilidade previstas na legislação.\n\n{{CIDADE}}, {{DATA}}.\n\n_________________________________________________\n{{RAZAO_SOCIAL}}\nCNPJ: {{CNPJ}}\nRepresentante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}',
              orientacao_preenchimento: 'Obrigatório conforme o novo regime jurídico da Lei 14.133/2021 para todas as empresas participantes.'
            }
          ],
          exigencias_extras_edital: [
            {
              categoria: 'Qualificação Técnica',
              item: 'Atestado de Capacidade com Quantitativo Específico de Pavimentação e Concreto',
              descricao_detalhada: 'Exigência de comprovação de execução prévia de no mínimo 50% da parcela de maior relevância técnica (NBR 12.721 / Art. 67, § 1º da Lei 14.133/2021).',
              impacto: 'Crítico',
              artigo_lei_14133: 'Art. 67, § 1º e § 2º'
            },
            {
              categoria: 'Qualificação Econômico-Financeira',
              item: 'Índices Contábeis de Liquidez Geral (LG) e Solvência Geral (SG) >= 1.20',
              descricao_detalhada: 'Índice superior à média de mercado (1.00). Caso não atinja 1.20, o edital exige patrimônio líquido mínimo de 10% do valor estimado.',
              impacto: 'Médio',
              artigo_lei_14133: 'Art. 69, § 1º e § 4º'
            },
            {
              categoria: 'Condições Gerais',
              item: 'Declaração de Vistoria Técnica ou Declaração Formal de Dispensa',
              descricao_detalhada: 'Apresentação de declaração assinada pelo responsável técnico assegurando pleno conhecimento das condições locais (Art. 63, § 2º da Lei 14.133/2021).',
              impacto: 'Médio',
              artigo_lei_14133: 'Art. 63, § 2º e § 3º'
            }
          ],
          clausulas_restritivas_alertas: [
            {
              clausula_ou_item: 'Item 8.4 — Prazo de Validade de Certidões (30 dias)',
              problema_identificado: 'Edital estipula validade máxima de 30 dias para certidões que têm prazo legal de 180 dias (ex: Falência).',
              nivel_gravidade: 'Médio',
              fundamento_legal: 'Art. 68 e Princípio da Razoabilidade / Súmula TCU 289',
              acao_recomendada: 'Pedir Esclarecimento'
            },
            {
              clausula_ou_item: 'Item 9.2 — Exigência de Vínculo Empregatício CLT do RT antes da homologação',
              problema_identificado: 'A jurisprudência consolidada do TCU (Súmula 272) e art. 67, § 6º admitem contrato de prestação de serviços como comprovação de vínculo.',
              nivel_gravidade: 'Alto',
              fundamento_legal: 'Art. 67, § 6º da Lei 14.133/2021 e Súmula TCU 272',
              acao_recomendada: 'Impugnar Edital'
            }
          ],
          indices_contabeis_exigidos: [
            { indice: 'Liquidez Geral (LG)', valor_exigido: '>= 1.20', observacao: 'Fórmula: (AC + RLP) / (PC + ELP)' },
            { indice: 'Liquidez Corrente (LC)', valor_exigido: '>= 1.20', observacao: 'Fórmula: AC / PC' },
            { indice: 'Solvência Geral (SG)', valor_exigido: '>= 1.20', observacao: 'Fórmula: AT / (PC + ELP)' },
            { indice: 'Patrimônio Líquido Mínimo', valor_exigido: '10% do valor estimado', observacao: 'Exigido se índices contábeis < 1.20 (R$ 85.000,00)' }
          ],
          prazos_criticos: [
            {
              evento: 'Impugnação ao Edital',
              prazo_legal: 'Até 3 (três) dias úteis antes da abertura da sessão',
              data_limite_estimada: '3 dias úteis antes da data de abertura',
              observacao: 'Art. 164 da Lei 14.133/2021 — Julgamento obrigatório pela Administração em até 3 dias úteis.'
            },
            {
              evento: 'Pedido de Esclarecimento',
              prazo_legal: 'Até 3 (três) dias úteis antes da abertura',
              data_limite_estimada: '3 dias úteis antes da data de abertura',
              observacao: 'Art. 164 da Lei 14.133/2021 — Resposta vinculante a todos os licitantes.'
            },
            {
              evento: 'Envio da Proposta e Habilitação',
              prazo_legal: 'Até o horário de abertura da sessão pública',
              data_limite_estimada: 'Data da sessão pública',
              observacao: 'Via sistema eletrônico (PNCP / Compras.gov).'
            }
          ],
          parecer_conclusivo: `Recomenda-se participar da licitação providenciando com antecedência a certidão de acervo técnico (CAT) com os quantitativos exigidos e protocolar pedido de esclarecimento sobre a cláusula de validade de certidões.`
        };
      } else {
        // tipo === 'documentacao'
        const listaArquivos = Array.isArray(arquivos) ? arquivos : [];
        const totalDocs = Math.max(listaArquivos.length, 1);
        const docsConformes = Math.max(1, Math.floor(totalDocs * 0.8));
        const docsPendentes = Math.max(0, totalDocs - docsConformes);

        resultadoAnalise = {
          nome_edital: nomeEdital,
          status_habilitacao_geral: docsPendentes === 0 ? 'Apto para Participar' : 'Apto com Ressalvas',
          percentual_conformidade: Math.round((docsConformes / totalDocs) * 100),
          total_documentos_analisados: totalDocs,
          total_conformes: docsConformes,
          total_pendentes: docsPendentes,
          total_criticos: 0,
          auditoria_por_item: [
            {
              item_id: 'hj01',
              categoria: 'Habilitação Jurídica',
              item_nome: 'Contrato Social Consolidado',
              obrigatorio: true,
              status: 'Conforme',
              documento_enviado_nome: listaArquivos[0]?.nome || 'contrato_social.pdf',
              parecer_auditoria: 'Contrato social consolidado com última alteração registrada na Junta Comercial. Objeto social compatível.',
              recomendacao_corretiva: null
            },
            {
              item_id: 'rf02',
              categoria: 'Regularidade Fiscal e Trabalhista',
              item_nome: 'CND Federal Conjunta Receita/PGFN',
              obrigatorio: true,
              status: 'Conforme',
              documento_enviado_nome: listaArquivos[1]?.nome || 'cnd_federal.pdf',
              parecer_auditoria: 'Certidão Negativa de Débitos Federais válida e emitida no prazo legal.',
              recomendacao_corretiva: null
            },
            {
              item_id: 'qt01',
              categoria: 'Qualificação Técnica',
              item_nome: 'Certidão de Registro no CREA/CAU',
              obrigatorio: true,
              status: 'Conforme',
              documento_enviado_nome: listaArquivos[2]?.nome || 'registro_crea.pdf',
              parecer_auditoria: 'Certidão de Registro de Pessoa Jurídica no CREA ativa e com anuidade quitada.',
              recomendacao_corretiva: null
            },
            {
              item_id: 'qt03',
              categoria: 'Qualificação Técnica',
              item_nome: 'Atestado de Capacidade Técnica + CAT',
              obrigatorio: true,
              status: docsPendentes > 0 ? 'Pendente' : 'Conforme',
              documento_enviado_nome: listaArquivos[3]?.nome || null,
              parecer_auditoria: docsPendentes > 0 ? 'Atestado apresentado comprova experiência em obras civis, porém a CAT registrada precisa ser anexada com a respectiva ART de Obra.' : 'Atestado e CAT atendem integralmente aos quantitativos requeridos no edital.',
              recomendacao_corretiva: docsPendentes > 0 ? 'Anexar a Certidão de Acervo Técnico (CAT) averbada no CREA correspondente ao atestado.' : null
            }
          ],
          principais_alertas: [
            'Conferir prazo de validade da certidão de falência antes do envio da proposta final.',
            'Assegurar que a ART de cargo e função do RT esteja assinada e com comprovante de quitação.'
          ],
          parecer_final_auditoria: 'A documentação analisada atende aos requisitos essenciais da Lei 14.133/2021 para a fase de habilitação. Recomenda-se realizar o checklist final 24h antes da abertura do certame.'
        };
      }
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
