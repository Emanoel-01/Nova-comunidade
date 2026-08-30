// Módulo 2 — Calculadora de Pré-dimensionamento
// Nível 2: sistemas de "tabela de escolha" — o usuário seleciona o contexto/
// categoria e recebe o valor de referência já tabelado, sem cálculo aritmético.
// Dados extraídos do livro (Radier, Drywall EIFS, Esgoto) ou de pesquisa
// normativa/mercado confirmada (Elétrica, Manta Asfáltica, Fachada ACM,
// Revestimento Cerâmico) — nenhum valor foi inventado.

export interface OpcaoEscolha {
  id: string;
  label: string;
  resultado: string;
  detalhe?: string;
}

export interface SistemaTabelaEscolha {
  id: string;
  tipologiaId: string;
  nome: string;
  categoria: string;
  perguntaEscolha: string;
  opcoes: OpcaoEscolha[];
  observacao: string;
  fonte: string;
}

export const SISTEMAS_TABELA_ESCOLHA: SistemaTabelaEscolha[] = [
  {
    id: 'eletrica-bitola',
    tipologiaId: 'quadros-de-forca-e-cabeamento-bt-mt',
    nome: 'Elétrica — Bitola de Fio e Disjuntor',
    categoria: 'Sistemas Elétricos',
    perguntaEscolha: 'Qual o tipo de circuito?',
    opcoes: [
      { id: 'iluminacao', label: 'Iluminação', resultado: '1,5 mm² — Disjuntor 10 A', detalhe: 'Bitola mínima permitida só para circuito exclusivo de iluminação, nunca compartilhado com tomadas.' },
      { id: 'tug', label: 'Tomadas de Uso Geral (TUG)', resultado: '2,5 mm² — Disjuntor 16 A', detalhe: 'Bitola mínima obrigatória por norma para qualquer tomada de uso geral, mesmo com carga baixa — o circuito pode receber equipamento de maior potência no futuro.' },
      { id: 'tue-leve', label: 'Tomada de Uso Específico leve (ar-condicionado, forno pequeno)', resultado: '4 mm² — Disjuntor 20 A', detalhe: 'Circuito exclusivo obrigatório, sem outras tomadas no mesmo circuito.' },
      { id: 'tue-pesado', label: 'Tomada de Uso Específico pesada (chuveiro, forno elétrico)', resultado: '6 mm² — Disjuntor 32 A', detalhe: 'Circuito exclusivo obrigatório. Chuveiros acima de 7.000W podem exigir bitola maior — confirmar com projetista.' },
      { id: 'alimentador', label: 'Alimentador do quadro geral', resultado: '10 mm² ou maior — dimensionar por projeto', detalhe: 'Depende da soma de todas as cargas do quadro — sempre calculado por profissional, este valor é só ponto de partida de referência.' },
    ],
    observacao: 'Condutor de proteção (terra) deve ter a mesma bitola do condutor de fase para cabos até 16mm². Considerar queda de tensão em circuitos com mais de 30m.',
    fonte: 'NBR 5410, tabelas 36-39 e 47',
  },
  {
    id: 'manta-asfaltica-camadas',
    tipologiaId: 'manta-asfaltica-macarico',
    nome: 'Manta Asfáltica — Número de Camadas',
    categoria: 'Sistemas de Impermeabilização',
    perguntaEscolha: 'Qual é a situação da laje?',
    opcoes: [
      { id: 'nova', label: 'Laje nova ou renovação completa', resultado: '2 camadas (padrão)', detalhe: 'Primeira camada de regularização + segunda camada de acabamento com proteção UV. Espessura de 3-4mm por camada.' },
      { id: 'reparo', label: 'Reparo localizado sobre manta existente em bom estado', resultado: '1 camada', detalhe: 'Só recomendado como cobertura provisória ou reparo pontual — nunca como sistema definitivo em laje nova.' },
    ],
    observacao: 'Sempre com caimento mínimo de 1-2% em direção aos ralos, e a manta deve subir no mínimo 30cm nas paredes.',
    fonte: 'NBR 9575 / NBR 9574 / NBR 9952',
  },
  {
    id: 'fachada-acm-parametros',
    tipologiaId: 'fachada-ventilada-e-acm',
    nome: 'Fachada ACM — Parâmetros de Instalação',
    categoria: 'Sistemas de Vedação',
    perguntaEscolha: 'Qual parâmetro você precisa?',
    opcoes: [
      { id: 'espessura', label: 'Espessura do painel', resultado: '3 a 6 mm', detalhe: '3mm para uso interno ou fachadas pequenas; 4-6mm para fachadas externas de maior porte.' },
      { id: 'afastamento', label: 'Afastamento da parede (sistema ventilado)', resultado: '90 a 100 mm', detalhe: 'Vão mínimo entre o painel e a parede para permitir circulação de ar e isolamento térmico.' },
      { id: 'junta', label: 'Largura da junta de dilatação', resultado: '8 a 15 mm', detalhe: 'Varia conforme o tamanho do painel — painéis maiores exigem juntas mais largas para absorver a dilatação térmica do alumínio.' },
    ],
    observacao: 'Painéis com área acima de 1,50 m² precisam de reforço interno a cada 50cm.',
    fonte: 'NBR 15446 — pesquisa de fabricantes',
  },
  {
    id: 'revestimento-ceramico-emboco',
    tipologiaId: 'revestimento-ceramico-externo-pastilhas-porcelanato',
    nome: 'Revestimento Cerâmico — Espessura do Emboço',
    categoria: 'Sistemas de Vedação',
    perguntaEscolha: 'Qual informação você precisa?',
    opcoes: [
      { id: 'espessura-total', label: 'Espessura total da camada de argamassa', resultado: '20 a 80 mm', detalhe: 'Espessuras fora desta faixa exigem projeto com detalhamento específico, fora do escopo padrão da norma.' },
      { id: 'espessura-minima', label: 'Espessura mínima de uma única camada', resultado: '20 mm', detalhe: 'Limite inferior — abaixo disso a aderência não é garantida pela norma.' },
    ],
    observacao: 'A largura da junta de movimentação depende do tamanho do painel e das movimentações previstas — calculada em projeto, não é um valor fixo único.',
    fonte: 'NBR 13755:2017',
  },
  {
    id: 'radier-espessura',
    tipologiaId: 'radier-laje-de-fundacao',
    nome: 'Radier — Espessura por Contexto',
    categoria: 'Sistemas de Fundações',
    perguntaEscolha: 'Qual é o uso da edificação?',
    opcoes: [
      { id: 'casa-terrea', label: 'Casa térrea (uso residencial leve)', resultado: '12 a 15 cm', detalhe: 'Radier padrão para uso residencial, terreno plano.' },
      { id: 'galpao', label: 'Galpão com tráfego de empilhadeira', resultado: '20 a 30 cm reforçado', detalhe: 'Exige viga de borda de 30-40cm para conter o perímetro.' },
    ],
    observacao: 'O radier exige terreno 100% plano — terrenos inclinados exigem platôs com muro de contenção antes do radier.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 09',
  },
  {
    id: 'drywall-eifs-espessura',
    tipologiaId: 'drywall-externo-sistema-eifs',
    nome: 'Drywall Externo (EIFS) — Espessura da Parede',
    categoria: 'Sistemas de Vedação',
    perguntaEscolha: 'Qual dado você precisa?',
    opcoes: [
      { id: 'total', label: 'Espessura total da parede', resultado: '15 a 20 cm', detalhe: 'Perfil de aço (90mm) + placa de EPS (30-50mm) + acabamento.' },
    ],
    observacao: 'Peitoris de janela devem ter pingadeira avançando 3-5cm para fora da textura, evitando que a água escorra pela fachada.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 15',
  },
  {
    id: 'esgoto-rebaixo',
    tipologiaId: 'esgoto-sanitario-e-drenagem-pluvial',
    nome: 'Esgoto Sanitário — Rebaixo de Laje',
    categoria: 'Sistemas Hidrossanitários',
    perguntaEscolha: 'Qual dado você precisa?',
    opcoes: [
      { id: 'rebaixo', label: 'Rebaixo de laje em banheiros/áreas molhadas', resultado: '15 a 20 cm', detalhe: 'Necessário para acomodar o caimento de 1-2% dos tubos de esgoto sem furar a laje do vizinho de baixo.' },
      { id: 'tubo-bacia', label: 'Diâmetro da tubulação da bacia sanitária', resultado: '100 mm (fixo)', detalhe: 'Sempre 100mm, independente do porte da edificação — é padrão de mercado para vaso sanitário.' },
    ],
    observacao: 'A bacia sanitária deve ficar o mais próxima possível do shaft vertical de descida para evitar problemas de escoamento.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 23',
  },
];
