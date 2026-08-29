export interface ItemChecklistLicitacao {
  id: string;
  categoria: 'Habilitação Jurídica' | 'Regularidade Fiscal e Trabalhista' | 'Qualificação Econômico-Financeira' | 'Qualificação Técnica';
  item: string;
  obrigatorio: boolean;
}

export interface DeclaracaoLicitacaoPadrao {
  id: string;
  nome: string;
  obrigatorio: boolean;
  origem: 'Modelo do Edital (Anexo)' | 'Padrão Lei 14.133/2021 (Mercado)';
  baseLegal: string;
  textoModelo: string;
  orientacaoPreenchimento: string;
}

export const CHECKLIST_LICITACAO_PADRAO: ItemChecklistLicitacao[] = [
  // Habilitação Jurídica
  { id: 'hj01', categoria: 'Habilitação Jurídica', item: 'Ato constitutivo, estatuto ou contrato social consolidado', obrigatorio: true },
  { id: 'hj02', categoria: 'Habilitação Jurídica', item: 'Documento de eleição dos administradores (se aplicável)', obrigatorio: true },
  { id: 'hj03', categoria: 'Habilitação Jurídica', item: 'Registro comercial (empresário individual) ou inscrição no órgão de classe', obrigatorio: false },
  { id: 'hj04', categoria: 'Habilitação Jurídica', item: 'Procuração com poderes específicos, se o representante não for sócio-administrador', obrigatorio: false },

  // Regularidade Fiscal e Trabalhista
  { id: 'rf01', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Prova de inscrição no CNPJ', obrigatorio: true },
  { id: 'rf02', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Certidão Negativa de Débitos Federais (CND)', obrigatorio: true },
  { id: 'rf03', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Certidão de Regularidade do FGTS (CRF)', obrigatorio: true },
  { id: 'rf04', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', obrigatorio: true },
  { id: 'rf05', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Certidão de Regularidade com a Fazenda Estadual', obrigatorio: true },
  { id: 'rf06', categoria: 'Regularidade Fiscal e Trabalhista', item: 'Certidão de Regularidade com a Fazenda Municipal', obrigatorio: true },

  // Qualificação Econômico-Financeira
  { id: 'ef01', categoria: 'Qualificação Econômico-Financeira', item: 'Balanço patrimonial e demonstrações contábeis do último exercício', obrigatorio: true },
  { id: 'ef02', categoria: 'Qualificação Econômico-Financeira', item: 'Certidão negativa de falência ou recuperação judicial', obrigatorio: true },
  { id: 'ef03', categoria: 'Qualificação Econômico-Financeira', item: 'Comprovação de capital social ou patrimônio líquido mínimo (conforme edital)', obrigatorio: false },
  { id: 'ef04', categoria: 'Qualificação Econômico-Financeira', item: 'Garantia de proposta, se exigida no edital', obrigatorio: false },

  // Qualificação Técnica
  { id: 'qt01', categoria: 'Qualificação Técnica', item: 'Registro/inscrição da empresa no CREA/CAU', obrigatorio: true },
  { id: 'qt02', categoria: 'Qualificação Técnica', item: 'ART/RRT do responsável técnico', obrigatorio: true },
  { id: 'qt03', categoria: 'Qualificação Técnica', item: 'Atestado(s) de Capacidade Técnica compatíveis com o objeto', obrigatorio: true },
  { id: 'qt04', categoria: 'Qualificação Técnica', item: 'CAT — Certidão de Acervo Técnico do responsável', obrigatorio: true },
  { id: 'qt05', categoria: 'Qualificação Técnica', item: 'Comprovação de vínculo do responsável técnico com a empresa', obrigatorio: true },
  { id: 'qt06', categoria: 'Qualificação Técnica', item: 'Declaração de disponibilidade de equipamento/equipe, se exigida', obrigatorio: false },
];

export const DECLARACOES_PADRAO_LEI_14133: DeclaracaoLicitacaoPadrao[] = [
  {
    id: 'dec_fatos_impeditivos',
    nome: 'Declaração de Inexistência de Fatos Impeditivos e Idoneidade',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 68, VI e Art. 14 da Lei nº 14.133/2021',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, com sede em {{ENDERECO_EMPRESA}}, por intermédio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA, sob as penas da lei, para fins de participação no processo licitatório {{NUMERO_EDITAL}}, promovido por {{ORGAO_LICITANTE}}:

1. Que não se encontra declarada inidônea para licitar ou contratar com a Administração Pública direta ou indireta de qualquer esfera federativa;
2. Que inexiste qualquer fato impeditivo à sua habilitação e que não está impedida ou suspensa de licitar com este Órgão;
3. Que não possui sócio, dirigente ou responsável técnico que seja cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, de dirigente do órgão licitante ou de agente público com atuação no processo de contratação;
4. Que se compromete a comunicar formalmente a ocorrência de qualquer fato superveniente que venha a alterar as condições aqui declaradas.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Exigência mandatória em todos os certames regidos pela Lei 14.133/2021.'
  },
  {
    id: 'dec_cumprimento_requisitos',
    nome: 'Declaração de Cumprimento dos Requisitos de Habilitação',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 63, I da Lei nº 14.133/2021',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{CNPJ}}, por meio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA expressamente, sob as sanções administrativas e penais cabíveis:

Que cumpre plenamente todos os requisitos de habilitação jurídica, qualificação técnica, qualificação econômico-financeira e regularidade fiscal, social e trabalhista exigidos no Edital {{NUMERO_EDITAL}}, cujo objeto consiste em "{{OBJETO}}", perante o(a) {{ORGAO_LICITANTE}}.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Apresentação prévia indispensável no cadastramento e envio da proposta eletrônica.'
  },
  {
    id: 'dec_menor_trabalho',
    nome: 'Declaração de Não Emprego de Menores (CF/88)',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 68, VI da Lei nº 14.133/2021 c/c Art. 7º, XXXIII da CF/88',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, sediada em {{ENDERECO_EMPRESA}}, por intermédio de seu representante legal {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA, para fins do disposto no inciso VI do art. 68 da Lei nº 14.133/2021 e no inciso XXXIII do art. 7º da Constituição Federal:

Que não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre e não emprega menor de dezesseis anos em qualquer atividade, salvo na condição de aprendiz, a partir de quatorze anos de idade.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Garantia constitucional e legal contra exploração de mão-de-obra infantil.'
  },
  {
    id: 'dec_independencia_proposta',
    nome: 'Declaração de Elaboração Independente de Proposta',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 63, IV da Lei nº 14.133/2021',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por seu representante legal infra-assinado, Sr.(a) {{REPRESENTANTE_LEGAL}}, CPF nº {{CPF_REPRESENTANTE}}, DECLARA, sob as penas da lei, em especial o art. 299 do Código Penal e as disposições da Lei nº 14.133/2021:

1. Que a proposta apresentada para participar do processo licitatório {{NUMERO_EDITAL}} foi elaborada de maneira independente, e o seu conteúdo não foi, no todo ou em parte, direta ou indiretamente, informado, discutido ou divulgado a qualquer outro licitante participante ou potencial;
2. Que não tentou influir, direta ou indiretamente, na decisão de qualquer outro concorrente quanto a participar ou não da presente licitação;
3. Que os preços constantes da proposta foram fixados autonomamente, sem qualquer combinação ou ajuste com concorrentes.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Exigência de integridade concorrencial e conformidade anti-fraude.'
  },
  {
    id: 'dec_enquadramento_me_epp',
    nome: 'Declaração de Enquadramento como ME ou EPP (LC 123/2006)',
    obrigatorio: false,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 4º da Lei nº 14.133/2021 e Lei Complementar nº 123/2006',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por intermédio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA, sob as sanções administrativas cabíveis e sob as penas da lei:

Que cumpre os requisitos legais para a qualificação como Microempresa (ME) ou Empresa de Pequeno Porte (EPP), previstos no art. 3º da Lei Complementar nº 123/2006, não estando incursa em nenhuma das vedações do § 4º do mesmo artigo, fazendo jus aos benefícios e prerrogativas estabelecidos nos artigos 42 a 49 da Lei Complementar nº 123/2006 e art. 4º da Lei Federal nº 14.133/2021 no âmbito do Edital {{NUMERO_EDITAL}}.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Utilizada para usufruir de tratamento favorecido e empate ficto (LC 123/06).'
  },
  {
    id: 'dec_vistoria_visita_tecnica',
    nome: 'Declaração de Conhecimento Pleno das Condições Locais / Vistoria Técnica',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 67, § 2º e Art. 63, § 2º da Lei nº 14.133/2021',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, neste ato representada por seu responsável técnico / representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, portador(a) do CPF nº {{CPF_REPRESENTANTE}}, DECLARA para todos os fins de direito relativos ao Edital {{NUMERO_EDITAL}} perante o(a) {{ORGAO_LICITANTE}}:

Que tomou pleno e irrestrito conhecimento das condições locais, características geográficas, acessos e grau de complexidade técnica necessários para a perfeita execução dos serviços objeto da presente licitação, assumindo total responsabilidade pela integralidade dos preços ofertados e pelo cumprimento rigoroso dos prazos contratuais estabelecidos, renunciando a qualquer pleito de acréscimo de custo fundamentado em desconhecimento prévio das condições de execução.

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Fundamental para obras e serviços de engenharia quando o licitante opta pela ciência das condições.'
  },
  {
    id: 'dec_reserva_vagas_pcd',
    nome: 'Declaração de Cumprimento de Reserva de Vagas para PCD e Reabilitados',
    obrigatorio: true,
    origem: 'Padrão Lei 14.133/2021 (Mercado)',
    baseLegal: 'Art. 63, IV e Art. 116 da Lei nº 14.133/2021 c/c Art. 93 da Lei nº 8.213/1991',
    textoModelo: `A empresa {{RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{CNPJ}}, por meio de seu representante legal, Sr.(a) {{REPRESENTANTE_LEGAL}}, CPF nº {{CPF_REPRESENTANTE}}, DECLARA, para os devidos fins de direito no processo de contratação {{NUMERO_EDITAL}}:

Que cumpre fielmente a reserva de cargos prevista em lei para pessoa com deficiência (PCD) ou para beneficiário reabilitado da Previdência Social, bem como atende a todas as regras de acessibilidade previstas na legislação aplicável (Lei Federal nº 8.213/1991 e Lei Federal nº 13.146/2015).

{{CIDADE}}, {{DATA}}.

___________________________________________________
{{RAZAO_SOCIAL}}
CNPJ: {{CNPJ}}
Representante Legal: {{REPRESENTANTE_LEGAL}} - CPF: {{CPF_REPRESENTANTE}}`,
    orientacaoPreenchimento: 'Exigência expressa da Nova Lei de Licitações para garantir conformidade social.'
  }
];
