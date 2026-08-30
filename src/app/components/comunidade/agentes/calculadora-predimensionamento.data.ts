// Módulo 2 — Calculadora de Pré-dimensionamento
// Nível 1: sistemas com fórmula direta (1-2 inputs → resultado numérico)
// Fórmulas extraídas do livro "A Bíblia da Edificação" (11 sistemas) e
// complementadas por pesquisa de mercado/normativa (7 sistemas), conforme
// documentado em TABELA_FORMULAS_COMPLETA_41.md — nenhuma fórmula inventada.

export type TipoCalculo = 'divisor' | 'multiplicador' | 'faixa_divisor' | 'faixa_multiplicador' | 'formula_customizada';

export interface CampoEntrada {
  id: string;
  label: string;
  unidade: string;
  placeholder: string;
  min?: number;
}

export interface SistemaCalculavel {
  id: string;
  tipologiaId: string; // referência ao id em tipologias_prediais, para linkar com o Guia de Consulta
  nome: string;
  categoria: string;
  tipoCalculo: TipoCalculo;
  campos: CampoEntrada[];
  divisor?: number; // para tipo 'divisor'
  divisorMin?: number; // para tipo 'faixa_divisor'
  divisorMax?: number;
  multiplicador?: number; // para tipo 'multiplicador'
  multiplicadorMin?: number; // para tipo 'faixa_multiplicador'
  multiplicadorMax?: number;
  unidadeResultado: string;
  minimoAbsoluto?: number; // ex: laje nunca menor que 10cm mesmo se a conta der menos
  formatoResultado: (valor: number) => string;
  observacao: string;
  fonte: string;
}

const cmFormatado = (v: number) => `${v.toFixed(1)} cm`;
const btuFormatado = (v: number) => `${Math.round(v).toLocaleString('pt-BR')} BTU/h`;
const unidadeInteira = (v: number) => `${Math.ceil(v)}`;
const kvaFormatado = (v: number) => `${v.toFixed(1)} kVA`;
const m3hFormatado = (v: number) => `${Math.round(v).toLocaleString('pt-BR')} m³/h`;
const kgFormatado = (v: number) => `${v.toFixed(1)} kg`;
const ampereFormatado = (v: number) => `${Math.round(v)} A`;
const percentualFormatado = (v: number) => `${v.toFixed(0)}%`;

export const SISTEMAS_CALCULAVEIS: SistemaCalculavel[] = [
  {
    id: 'laje-macica',
    tipologiaId: 'concreto-armado-in-loco',
    nome: 'Laje Maciça (Concreto Armado)',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'divisor',
    campos: [{ id: 'vao', label: 'Menor vão da laje', unidade: 'cm', placeholder: 'Ex: 400' }],
    divisor: 40,
    unidadeResultado: 'cm',
    minimoAbsoluto: 10,
    formatoResultado: cmFormatado,
    observacao: 'Espessura estimada. A norma permite mínimo de 7 cm, mas recomenda-se nunca menos que 10 cm para evitar vibração ao caminhar.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 01',
  },
  {
    id: 'viga-concreto',
    tipologiaId: 'concreto-armado-in-loco',
    nome: 'Viga de Concreto Armado',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'divisor',
    campos: [{ id: 'vao', label: 'Vão livre entre pilares', unidade: 'cm', placeholder: 'Ex: 600' }],
    divisor: 10,
    unidadeResultado: 'cm',
    minimoAbsoluto: 14,
    formatoResultado: cmFormatado,
    observacao: 'Altura estimada da viga. Largura mínima de 14 cm (norma) para caber na alvenaria sem gerar dentes na parede.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 01',
  },
  {
    id: 'laje-protendida-plana',
    tipologiaId: 'concreto-protendido',
    nome: 'Laje Protendida Plana',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'faixa_divisor',
    campos: [{ id: 'vao', label: 'Maior vão livre', unidade: 'cm', placeholder: 'Ex: 900' }],
    divisorMin: 40,
    divisorMax: 45,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Faixa de espessura estimada — quanto maior o divisor usado, mais otimizada (e mais cara) é a protensão.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 02',
  },
  {
    id: 'laje-nervurada-protendida',
    tipologiaId: 'concreto-protendido',
    nome: 'Laje Nervurada Protendida',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'divisor',
    campos: [{ id: 'vao', label: 'Vão livre', unidade: 'cm', placeholder: 'Ex: 1000' }],
    divisor: 35,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Vence distâncias de 10 a 14 m tipicamente, ideal para subsolos e shoppings.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 02',
  },
  {
    id: 'viga-metalica-piso',
    tipologiaId: 'estrutura-metalica-aco',
    nome: 'Viga Metálica de Piso',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'faixa_divisor',
    campos: [{ id: 'vao', label: 'Vão livre entre colunas', unidade: 'cm', placeholder: 'Ex: 900' }],
    divisorMin: 18,
    divisorMax: 20,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Altura estimada. Perfis metálicos permitem colunas praticamente invisíveis dentro de paredes de gesso.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 04',
  },
  {
    id: 'viga-metalica-cobertura',
    tipologiaId: 'estrutura-metalica-aco',
    nome: 'Viga Metálica de Cobertura (Galpão)',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'faixa_divisor',
    campos: [{ id: 'vao', label: 'Vão livre do galpão', unidade: 'cm', placeholder: 'Ex: 2500' }],
    divisorMin: 25,
    divisorMax: 30,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Estimativa para telhas leves de cobertura, sem carga de piso.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 04',
  },
  {
    id: 'viga-mlc-madeira',
    tipologiaId: 'estruturas-em-madeira-paineis-clt',
    nome: 'Viga MLC (Madeira Laminada Colada)',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'faixa_divisor',
    campos: [{ id: 'vao', label: 'Vão livre', unidade: 'cm', placeholder: 'Ex: 600' }],
    divisorMin: 14,
    divisorMax: 18,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Estimativa para vigas de madeira laminada colada estruturalmente aparente.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 06',
  },
  {
    id: 'painel-clt',
    tipologiaId: 'estruturas-em-madeira-paineis-clt',
    nome: 'Painel CLT (Laje de Madeira Maciça)',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'faixa_divisor',
    campos: [{ id: 'vao', label: 'Vão livre', unidade: 'cm', placeholder: 'Ex: 400' }],
    divisorMin: 30,
    divisorMax: 35,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Espessura estimada do painel de madeira cruzada laminada, atuando como laje maciça pronta.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 06',
  },
  {
    id: 'laje-alveolar',
    tipologiaId: 'pre-moldados-e-pre-fabricados-de-concreto',
    nome: 'Laje Alveolar (Pré-moldado)',
    categoria: 'Sistemas Estruturais',
    tipoCalculo: 'divisor',
    campos: [{ id: 'vao', label: 'Vão livre', unidade: 'cm', placeholder: 'Ex: 1200' }],
    divisor: 35,
    unidadeResultado: 'cm',
    formatoResultado: cmFormatado,
    observacao: 'Vence até 12 m sem pilares. Peças acima de 12 m de comprimento ou 3,20 m de largura exigem Autorização Especial de Trânsito (AET) para transporte.',
    fonte: 'Livro — A Bíblia da Edificação, Cap. 07',
  },
  {
    id: 'ar-condicionado-btu',
    tipologiaId: 'ar-condicionado-vrf-fluxo-variavel',
    nome: 'Ar-Condicionado (Split / VRF / Multi Split)',
    categoria: 'Climatização e Exaustão',
    tipoCalculo: 'multiplicador',
    campos: [{ id: 'area', label: 'Área do ambiente', unidade: 'm²', placeholder: 'Ex: 20' }],
    multiplicador: 700,
    unidadeResultado: 'BTU/h',
    formatoResultado: btuFormatado,
    observacao: 'Estimativa usando 700 BTU/m² (meio da faixa de mercado 600-800). Some 600 BTU por pessoa acima da ocupação padrão e por equipamento que gera calor no ambiente.',
    fonte: 'Pesquisa de mercado — convergência entre múltiplas fontes',
  },
  {
    id: 'spda-descidas',
    tipologiaId: 'spda-protecao-contra-raios-e-aterramento',
    nome: 'SPDA — Número de Descidas',
    categoria: 'Sistemas de Incêndio',
    tipoCalculo: 'divisor',
    campos: [{ id: 'perimetro', label: 'Perímetro da edificação', unidade: 'm', placeholder: 'Ex: 60' }],
    divisor: 15,
    unidadeResultado: 'descidas',
    formatoResultado: unidadeInteira,
    observacao: 'Referência para Nível de Proteção III (perímetro ÷ 15 m). Para Nível II, usar perímetro ÷ 10 m. ATENÇÃO: a NBR 5419 foi revisada em 2026 — confirmar se a metodologia de cálculo mudou antes de aplicar.',
    fonte: 'NBR 5419 — pesquisa de mercado, revisão 2026 ainda não auditada',
  },
  {
    id: 'exaustao-garagem',
    tipologiaId: 'exaustao-de-garagens-e-cozinhas',
    nome: 'Exaustão de Garagem (Vazão de Ar)',
    categoria: 'Climatização e Exaustão',
    tipoCalculo: 'faixa_multiplicador',
    campos: [{ id: 'volume', label: 'Volume do ambiente (comprimento × largura × pé-direito)', unidade: 'm³', placeholder: 'Ex: 500' }],
    multiplicadorMin: 6,
    multiplicadorMax: 10,
    unidadeResultado: 'm³/h',
    formatoResultado: m3hFormatado,
    observacao: 'Vazão de ar necessária, considerando de 6 a 10 renovações completas de ar por hora — a NBR 16401 recomenda o mínimo de 4 a 6 para garagens fechadas.',
    fonte: 'Boas práticas de mercado + NBR 16401',
  },
  {
    id: 'grupo-gerador-kva',
    tipologiaId: 'grupo-gerador',
    nome: 'Grupo Gerador (Potência em kVA)',
    categoria: 'Sistemas Elétricos',
    tipoCalculo: 'formula_customizada',
    campos: [{ id: 'kw', label: 'Soma da potência das cargas essenciais', unidade: 'kW', placeholder: 'Ex: 80' }],
    unidadeResultado: 'kVA',
    formatoResultado: kvaFormatado,
    observacao: 'kVA = (kW ÷ 0,8 fator de potência) + 25% de margem para absorver o pico de partida de motores.',
    fonte: 'Pesquisa de mercado',
  },
  {
    id: 'ventilacao-mecanica-escritorio',
    tipologiaId: 'ventilacao-mecanica',
    nome: 'Ventilação Mecânica (Escritório)',
    categoria: 'Climatização e Exaustão',
    tipoCalculo: 'multiplicador',
    campos: [{ id: 'ocupantes', label: 'Número de ocupantes do ambiente', unidade: 'pessoas', placeholder: 'Ex: 15' }],
    multiplicador: 27,
    unidadeResultado: 'm³/h',
    formatoResultado: m3hFormatado,
    observacao: 'Vazão mínima de ar exterior por pessoa em ambiente de escritório, conforme NBR 16401.',
    fonte: 'NBR 16401',
  },
  {
    id: 'cabeamento-estruturado-pontos',
    tipologiaId: 'cabeamento-estruturado-e-automacao-predial',
    nome: 'Cabeamento Estruturado (Pontos de Rede)',
    categoria: 'Comunicação e Automação',
    tipoCalculo: 'multiplicador',
    campos: [{ id: 'area', label: 'Área do ambiente', unidade: 'm²', placeholder: 'Ex: 100' }],
    multiplicador: 0.1,
    unidadeResultado: 'pontos',
    formatoResultado: unidadeInteira,
    observacao: 'Estimativa de 1 ponto de rede a cada 10 m². Distância máxima do ponto até o rack (patch panel) não deve ultrapassar 90 m.',
    fonte: 'ANSI/TIA-568 / NBR 14565',
  },
  {
    id: 'manta-liquida-pu',
    tipologiaId: 'manta-liquida-de-poliuretano-pu',
    nome: 'Manta Líquida de Poliuretano (Consumo)',
    categoria: 'Sistemas de Impermeabilização',
    tipoCalculo: 'faixa_multiplicador',
    campos: [{ id: 'area', label: 'Área a impermeabilizar', unidade: 'm²', placeholder: 'Ex: 50' }],
    multiplicadorMin: 1.2,
    multiplicadorMax: 1.5,
    unidadeResultado: 'kg',
    formatoResultado: kgFormatado,
    observacao: 'Consumo total estimado para as 3 demãos recomendadas (1,2 a 1,5 kg/m² no total).',
    fonte: 'Fabricantes — pesquisa de mercado',
  },
  {
    id: 'cristalizacao-capilar',
    tipologiaId: 'cristalizacao-capilar-por-pressao-negativa',
    nome: 'Cristalização Capilar (Consumo)',
    categoria: 'Sistemas de Impermeabilização',
    tipoCalculo: 'multiplicador',
    campos: [{ id: 'area', label: 'Área de concreto a tratar', unidade: 'm²', placeholder: 'Ex: 30' }],
    multiplicador: 1.6,
    unidadeResultado: 'kg',
    formatoResultado: kgFormatado,
    observacao: 'Consumo total para 2 demãos de 0,8 kg/m² cada. Uso restrito: só funciona sobre concreto maciço, nunca sobre alvenaria, e a superfície deve estar sempre úmida.',
    fonte: 'Fabricantes — pesquisa de mercado',
  },
  {
    id: 'barramento-blindado-corrente',
    tipologiaId: 'barramento-blindado-busway',
    nome: 'Barramento Blindado (Corrente Nominal)',
    categoria: 'Sistemas Elétricos',
    tipoCalculo: 'formula_customizada',
    campos: [
      { id: 'potencia', label: 'Potência total instalada', unidade: 'kW', placeholder: 'Ex: 200' },
      { id: 'tensao', label: 'Tensão de linha', unidade: 'V', placeholder: 'Ex: 380' },
    ],
    unidadeResultado: 'A',
    formatoResultado: ampereFormatado,
    observacao: 'Corrente nominal estimada (In = P ÷ (U × cosφ), com cosφ = 0,92 e fator de diversidade não aplicado aqui — consulte o fabricante para o fator real do seu carregamento).',
    fonte: 'IEC 61439-6 / NBR 16019 — pesquisa de mercado',
  },
  {
    id: 'extintores-quantidade',
    tipologiaId: 'extintores',
    nome: 'Extintores — Quantidade Mínima por Pavimento',
    categoria: 'Sistemas de Incêndio',
    tipoCalculo: 'formula_customizada',
    campos: [
      { id: 'area', label: 'Área do pavimento', unidade: 'm²', placeholder: 'Ex: 500' },
    ],
    unidadeResultado: 'unidades',
    formatoResultado: unidadeInteira,
    observacao: 'Estimativa para risco médio (área de cobertura de 135 m² por unidade extintora classe A). Risco pequeno cobre 270 m²/unidade, risco grande cobre só 90 m²/unidade — ajuste conforme classificação real do ambiente. Mínimo de 2 unidades por pavimento, distância máxima de caminhamento de 20 m em qualquer caso.',
    fonte: 'NBR 12693 — Tabela 4/6',
  },
  {
    id: 'escada-rolante-capacidade',
    tipologiaId: 'escadas-rolantes',
    nome: 'Escada Rolante — Capacidade de Transporte',
    categoria: 'Transporte Vertical',
    tipoCalculo: 'formula_customizada',
    campos: [
      { id: 'velocidade', label: 'Velocidade nominal', unidade: 'm/s', placeholder: 'Ex: 0.5' },
      { id: 'largura', label: 'Largura do degrau (600, 800 ou 1000)', unidade: 'mm', placeholder: 'Ex: 600' },
    ],
    unidadeResultado: 'pessoas/h',
    formatoResultado: (v: number) => `${Math.round(v).toLocaleString('pt-BR')} pessoas/h`,
    observacao: 'Capacidade teórica de transporte (c = 3600 × v × k ÷ 0,4). O coeficiente k é 1,0 para degrau de 600mm, 1,5 para 800mm e 2,0 para 1000mm — aplicado automaticamente conforme a largura informada.',
    fonte: 'Fabricantes — pesquisa de mercado',
  },
];
