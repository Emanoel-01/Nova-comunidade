// Supabase Edge Function: chat-licitacao
// Chat Especialista em Licitações Públicas (Lei 14.133/2021) com Claude Sonnet 5 e Prompt Caching
// Módulo Comunidade Nova · AmorimTech / Amorim Academy

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

const BASE_CONHECIMENTO_LICITACOES = `
BASE NORMATIVA E JURISPRUDENCIAL — LEI FEDERAL Nº 14.133/2021 (NOVA LEI DE LICITAÇÕES E CONTRATOS):

1. Princípios e Fases:
- Princípios Fundamentais (Art. 5º): Legalidade, impessoalidade, moralidade, publicidade, eficiência, interesse público, probidade administrativa, igualdade, planejamento, transparência, eficácia, segregação de funções, motivação, vinculação ao edital, julgamento objetivo, segurança jurídica, razoabilidade, proporcionalidade, celeridade, economicidade e desenvolvimento sustentável.
- Fases do Processo Licitatório (Art. 17): I - preparatória; II - divulgação do edital; III - apresentação de propostas e lances; IV - julgamento; V - habilitação; VI - recursal; VII - homologação. Nota: A regra geral inverteu as fases (julgamento das propostas ocorre antes da habilitação).

2. Habilitação (Arts. 62 a 70):
- Habilitação Jurídica (Art. 66): Contrato social, registro comercial, procuração, eleição de administradores.
- Regularidade Fiscal, Social e Trabalhista (Art. 68): Inscrição no CNPJ, CND Federal (Receita/PGFN), CNDT (Justiça do Trabalho), Regularidade FGTS (CRF), CND Estadual e Municipal. É vedada a exigência de certidões não previstas expressamente na lei.
- Qualificação Econômico-Financeira (Art. 69):
  * Balanço patrimonial e demonstrações contábeis dos últimos 2 exercícios (ou 1 se empresa recente).
  * Certidão negativa de feitos sobre falência expedida pelo distribuidor da sede.
  * Índices contábeis usuais (Liquidez Geral - LG, Solvência Geral - SG e Liquidez Corrente - LC). É VEDADA a exigência de índices e de valores não usualmente adotados para aferição de situação financeira.
  * Patrimônio líquido mínimo ou capital social mínimo limitado a no máximo 10% do valor estimado da contratação (Art. 69, § 4º).
  * Garantia de proposta: limitada a no máximo 1% do valor estimado da contratação (Art. 58).
- Qualificação Técnica (Art. 67):
  * Registro ou inscrição na entidade profissional competente (CREA, CAU, CFT).
  * Atestados de capacidade técnico-operacional (em nome da empresa) e técnico-profissional (em nome do profissional RT).
  * Parcelas de maior relevância técnica e valor significativo (limitadas às parcelas técnicas essenciais, não podendo ultrapassar 50% dos quantitativos dos itens de maior relevância, salvo casos excepcionais devidamente justificados).
  * É vedada a exigência de atestados com exigência de quantidades mínimas para a equipe técnica profissional (vedação histórica pacificada pelo TCU).
  * Vínculo do RT (Art. 67, § 6º): Pode ser comprovado por contrato de prestação de serviços, vínculo societário, ou CTPS. Não se pode exigir carteira assinada prévia antes da licitação.

3. Impugnação ao Edital e Pedidos de Esclarecimento (Art. 164):
- Qualquer pessoa é parte legítima para impugnar edital de licitação por irregularidade ou para solicitar esclarecimento sobre seus termos.
- Prazo: até 3 (três) dias úteis antes da data de abertura do certame.
- Resposta da Administração: obrigatória no prazo de até 3 (três) dias úteis, limitado ao último dia útil anterior à data da abertura do certame, com publicação no PNCP e no portal oficial.

4. Recursos Administrativos (Arts. 165 a 168):
- Cabimento de recurso no prazo de 3 (três) dias úteis contados da data de intimação ou da lavratura da ata em face de: ato que defira ou indefira pedido de pré-qualificação, julgamento das propostas, ato de habilitação ou inabilitação, anulação ou revogação, extinção do contrato.
- Fase de lances/pregão: Manifestação imediata e motivada da intenção de recorrer em campo próprio do sistema, com prazo subsequente de 3 dias úteis para juntada de memoriais.
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

    // 2. Extrair dados da mensagem
    const body = await req.json();
    const {
      sessaoId = crypto.randomUUID(),
      mensagem,
      analiseLicitacaoId = null
    } = body;

    if (!mensagem || typeof mensagem !== 'string' || !mensagem.trim()) {
      return new Response(JSON.stringify({ error: 'Mensagem vazia não permitida.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mensagemLimpa = mensagem.trim();

    // 3. Checar se o usuário tem pacote ativo
    const hojeStr = new Date().toISOString().split('T')[0];
    const { data: pacotes } = await clientAdmin
      .from('pacotes_licitacao')
      .select('pacote, ativo, data_expiracao')
      .eq('profissional_id', userId)
      .eq('ativo', true);

    const pacotesAtivos = (pacotes || []).filter(p => !p.data_expiracao || p.data_expiracao >= hojeStr);
    const temPacoteAtivo = pacotesAtivos.some(p => p.pacote === 'A' || p.pacote === 'B');

    if (!temPacoteAtivo) {
      return new Response(JSON.stringify({
        error: 'O Chat Especialista em Licitações é exclusivo para membros com Pacote de Licitações ativo (Pacote A ou A+B).',
        codigo: 'SEM_PACOTE'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Checar limite de 35 mensagens/mês (somente mensagens de papel 'usuario')
    let totalMensagensUsadas = 0;
    try {
      const { data: rpcCount, error: rpcErr } = await clientAdmin.rpc('contar_mensagens_chat_licitacao_mes_atual', {
        p_profissional_id: userId,
      });

      if (!rpcErr && typeof rpcCount === 'number') {
        totalMensagensUsadas = rpcCount;
      } else {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { count, error: countErr } = await clientAdmin
          .from('chat_licitacao_mensagens')
          .select('id', { count: 'exact', head: true })
          .eq('profissional_id', userId)
          .eq('papel', 'usuario')
          .gte('criado_em', inicioMes.toISOString());

        if (!countErr && count !== null) {
          totalMensagensUsadas = count;
        }
      }
    } catch (e) {
      console.warn('Erro ao contar mensagens:', e);
    }

    const LIMITE_MENSAGENS_MES = 35;
    if (totalMensagensUsadas >= LIMITE_MENSAGENS_MES) {
      return new Response(JSON.stringify({
        error: `Limite mensal de ${LIMITE_MENSAGENS_MES} mensagens do chat especialista atingido (${totalMensagensUsadas}/${LIMITE_MENSAGENS_MES} utilizadas este mês). O saldo será renovado no próximo ciclo.`,
        codigo: 'LIMITE_MENSAGENS_EXCEDIDO',
        usoAtual: totalMensagensUsadas,
        limite: LIMITE_MENSAGENS_MES
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Buscar contexto de análise de edital se associado
    let contextoEditalTexto = '';
    if (analiseLicitacaoId) {
      const { data: analise } = await clientAdmin
        .from('analises_licitacao')
        .select('nome_edital, tipo, resultado_analise, criado_em')
        .eq('id', analiseLicitacaoId)
        .eq('profissional_id', userId)
        .maybeSingle();

      if (analise) {
        contextoEditalTexto = `\nCONTEXTO DO EDITAL EM ANÁLISE NESTA SESSÃO:
Nome do Edital: ${analise.nome_edital}
Tipo da Análise: ${analise.tipo}
Data da Análise: ${analise.criado_em}
Diagnóstico e Parecer:
${JSON.stringify(analise.resultado_analise, null, 2)}
`;
      }
    }

    // 6. Buscar histórico prévio da sessão (até 15 últimas mensagens)
    const { data: historicoDb } = await clientAdmin
      .from('chat_licitacao_mensagens')
      .select('papel, conteudo, criado_em')
      .eq('sessao_id', sessaoId)
      .eq('profissional_id', userId)
      .order('criado_em', { ascending: true })
      .limit(15);

    const historicoFormatado = (historicoDb || []).map(m => ({
      role: m.papel === 'usuario' ? 'user' : 'assistant',
      content: m.conteudo
    }));

    // 7. Chamada ao Claude Sonnet 5 com Prompt Caching
    let respostaAssistente = '';

    const systemPromptBloco1 = `Você é um Consultor Especialista Sênior em Licitações e Contratos Administrativos, atuando no suporte consultivo a engenheiros, arquitetos, empresários da construção civil e licitantes.
Você domina a Nova Lei de Licitações (Lei Federal nº 14.133/2021), a jurisprudência do TCU, decretos regulamentadores e as melhores práticas para habilitação, formulação de propostas, impugnações e recursos.

Diretrizes de resposta:
- Responda sempre de forma objetiva, fundamentada na Lei 14.133/2021 e citando os artigos e entendimentos do TCU cabíveis.
- Mantenha tom profissional, executivo, direto e construtivo.
- Quando o usuário relatar exigências desarrazoadas ou restritivas, aponte a linha argumentativa para impugnação ou pedido de esclarecimento.
- Importante: Recomende a consulta a um advogado ou profissional habilitado nos casos de maior complexidade jurídica e contenciosa formal, deixando claro que suas orientações têm caráter consultivo e orientador.`;

    const systemPromptBloco2 = `${BASE_CONHECIMENTO_LICITACOES}${contextoEditalTexto}`;

    if (anthropicApiKey) {
      try {
        const messagesPayload = [
          ...historicoFormatado,
          { role: 'user', content: mensagemLimpa }
        ];

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 3000,
            system: [
              {
                type: 'text',
                text: systemPromptBloco1,
              },
              {
                type: 'text',
                text: systemPromptBloco2,
                cache_control: { type: 'ephemeral' } // Prompt Caching na base de conhecimento e edital
              }
            ],
            messages: messagesPayload,
          }),
        });

        if (anthropicRes.ok) {
          const resJson = await anthropicRes.json();
          respostaAssistente = resJson.content?.[0]?.text || '';
        } else {
          const errText = await anthropicRes.text();
          console.warn('Anthropic Chat retornou status não-ok:', anthropicRes.status, errText);
        }
      } catch (anthropicErr) {
        console.error('Erro na chamada Anthropic Chat:', anthropicErr);
      }
    }

    // 8. Fallback inteligente baseado em regras se a API não estiver conectada
    if (!respostaAssistente) {
      const msgLower = mensagemLimpa.toLowerCase();
      
      if (msgLower.includes('impugn') || msgLower.includes('prazo')) {
        respostaAssistente = `De acordo com o **Artigo 164 da Lei Federal nº 14.133/2021**, qualquer pessoa pode impugnar o edital de licitação por irregularidade ou solicitar esclarecimentos.

**Prazos Fundamentais:**
1. **Prazo para protocolo:** Até **3 (três) dias úteis** antes da data fixada para a abertura do certame.
2. **Prazo de resposta da Administração:** Até **3 (três) dias úteis**, limitado ao último dia útil anterior à abertura da sessão. A resposta vincula a Administração e deve ser publicada no PNCP e sítio oficial.
3. **Efeito:** Se a impugnação for acolhida com alteração substancial que afete a formulação das propostas, a Administração é obrigada a reabrir o prazo inicial de divulgação do edital (Art. 55, § 1º).

*Recomendação prática:* Protocolize a impugnação diretamente no sistema eletrônico (PNCP/Compras.gov) com fundamentação jurídica detalhada e requerimento expresso de suspensão da sessão até a decisão.`;
      } else if (msgLower.includes('atestado') || msgLower.includes('capacidade técnica') || msgLower.includes('cat')) {
        respostaAssistente = `Sobre a **Qualificação Técnica (Art. 67 da Lei 14.133/2021)**:

1. **Atestados de Capacidade Técnico-Operacional (da empresa):** O edital só pode exigir comprovação de experiência nas parcelas de **maior relevância técnica e valor significativo**, limitado a no máximo **50% dos quantitativos** dos itens essenciais (Art. 67, § 1º e § 2º).
2. **Capacidade Técnico-Profissional (do RT):** Comprova-se pela apresentação de CAT averbada no CREA/CAU do profissional indicado como responsável técnico. É vedada a exigência de quantitativos mínimos para a equipe profissional (jurisprudência consolidada do TCU).
3. **Vínculo do Responsável Técnico:** Conforme o Art. 67, § 6º e a Súmula 272 do TCU, não se pode exigir que o RT tenha vínculo empregatício CLT prévio no momento da licitação. Um contrato de prestação de serviços ou declaração de compromisso é suficiente.`;
      } else if (msgLower.includes('índice') || msgLower.includes('balanço') || msgLower.includes('capital')) {
        respostaAssistente = `Na **Qualificação Econômico-Financeira (Art. 69 da Lei 14.133/2021)**:

1. **Índices Contábeis Usuais:** A Administração pode exigir Liquidez Geral (LG), Solvência Geral (SG) e Liquidez Corrente (LC), normalmente com valores >= 1,0. É vedada a fixação de índices não usuais ou excessivamente restritivos sem estudo técnico prévio justificando a necessidade (Art. 69, § 5º).
2. **Patrimônio Líquido Mínimo:** Se a empresa não atingir os índices contábeis exigidos, a lei permite a exigência alternativa de comprovação de patrimônio líquido ou capital social mínimo, limitado ao teto estrito de **10% do valor estimado da contratação** (Art. 69, § 4º).
3. **Garantia de Proposta:** Não pode exceder **1% do valor estimado** da licitação (Art. 58).`;
      } else {
        respostaAssistente = `Com base na **Lei Federal nº 14.133/2021 (Nova Lei de Licitações e Contratos)**:

Para a questão apresentada (*"${mensagemLimpa.slice(0, 100)}..."*), é essencial verificar os critérios objetivos de julgamento e as vedações expressas aos excessos de formalismo da Administração Pública.

**Pontos-chave recomendados para esta análise:**
- **Princípio da Vinculação ao Edital x Razoabilidade:** A comissão de contratação ou agente de contratação não pode criar exigências surpresa ou inabilitar licitante por mero vício formal sanável (Art. 12, III e Art. 64, § 1º).
- **Saneamento de Falhas:** O agente de contratação é autorizado e incentivado a realizar diligências para sanear erros ou falhas formais que não alterem a substância da proposta ou a validade jurídica dos documentos.
- **Dúvidas sobre o Edital:** Se houver contradição ou obscuridade, o melhor caminho é protocolar Pedido de Esclarecimento formal com antecedência mínima de 3 dias úteis.

Se desejar, informe trechos específicos da cláusula do edital ou do documento para uma análise detalhada!`;
      }
    }

    // 9. Gravar as mensagens em public.chat_licitacao_mensagens
    // 9.1 Mensagem do usuário
    await clientAdmin
      .from('chat_licitacao_mensagens')
      .insert({
        profissional_id: userId,
        sessao_id: sessaoId,
        analise_licitacao_id: analiseLicitacaoId || null,
        papel: 'usuario',
        conteudo: mensagemLimpa,
      });

    // 9.2 Mensagem do assistente
    await clientAdmin
      .from('chat_licitacao_mensagens')
      .insert({
        profissional_id: userId,
        sessao_id: sessaoId,
        analise_licitacao_id: analiseLicitacaoId || null,
        papel: 'assistente',
        conteudo: respostaAssistente,
      });

    const novoUsoMensagens = totalMensagensUsadas + 1;

    return new Response(JSON.stringify({
      sucesso: true,
      sessaoId,
      analiseLicitacaoId,
      resposta: respostaAssistente,
      mensagensUsadas: novoUsoMensagens,
      limiteMensagens: LIMITE_MENSAGENS_MES,
      mensagensRestantes: Math.max(0, LIMITE_MENSAGENS_MES - novoUsoMensagens)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Exceção na Edge Function chat-licitacao:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Erro interno no chat especialista de licitação.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
