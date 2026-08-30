// Módulo 2 — Calculadora de Pré-dimensionamento
// Nível 3: cálculo multi-variável de engenharia real (múltiplos inputs,
// fórmulas encadeadas, resultado mostrado passo a passo).
// Fontes: exemplos numéricos verificados contra fórmulas normativas antes de
// programar (NBR 6118/6122 para Sapata e Tubulão, NBR 5626 para Água Fria,
// NBR 13523/15526 para GLP, NBR 15527 para Cisterna). Estaca Hélice Contínua
// e Rede de GN (Renouard) ficaram FORA desta calculadora por decisão de
// Emanoel — exigem SPT por camada e coeficientes de perda de carga por
// diâmetro que não cabem em regra de bolso sem simplificação perigosa.

export interface CampoMultiVariavel {
  id: string;
  label: string;
  unidade: string;
  placeholder: string;
}

export interface PassoCalculo {
  label: string;
  formula: (vals: Record<string, number>) => number;
  unidade: string;
  casasDecimais?: number;
}

export interface SistemaMultiVariavel {
  id: string;
  tipologiaId: string;
  nome: string;
  categoria: string;
  campos: CampoMultiVariavel[];
  passos: PassoCalculo[]; // cada passo pode usar o resultado dos anteriores via vals['_passoN']
  observacao: string;
  fonte: string;
}

export const SISTEMAS_MULTIVARIAVEL: SistemaMultiVariavel[] = [
  {
    id: 'sapata-isolada',
    tipologiaId: 'sapatas-isoladas-e-corridas',
    nome: 'Sapata Isolada — Área, Lado e Altura',
    categoria: 'Sistemas de Fundações',
    campos: [
      { id: 'carga', label: 'Carga característica do pilar (Nk)', unidade: 'kN', placeholder: 'Ex: 1000' },
      { id: 'spt', label: 'Índice SPT médio (5 a 25)', unidade: 'golpes', placeholder: 'Ex: 10' },
      { id: 'pilar', label: 'Maior dimensão do pilar', unidade: 'cm', placeholder: 'Ex: 30' },
    ],
    passos: [
      {
        label: 'Tensão admissível do solo (σadm = SPT ÷ 5)',
        formula: (v) => v['spt'] / 5,
        unidade: 'kgf/cm²',
        casasDecimais: 2,
      },
      {
        label: 'Tensão admissível convertida',
        formula: (v) => (v['spt'] / 5) * 98.0665, // kgf/cm² para kN/m²
        unidade: 'kN/m²',
        casasDecimais: 0,
      },
      {
        label: 'Área necessária da sapata (S = 1,05 × Nk ÷ σadm)',
        formula: (v) => (1.05 * v['carga']) / ((v['spt'] / 5) * 98.0665),
        unidade: 'm²',
        casasDecimais: 2,
      },
      {
        label: 'Lado da sapata quadrada (B = √S)',
        formula: (v) => Math.sqrt((1.05 * v['carga']) / ((v['spt'] / 5) * 98.0665)),
        unidade: 'm',
        casasDecimais: 2,
      },
      {
        label: 'Altura mínima (h ≥ (B − pilar) ÷ 3)',
        formula: (v) => {
          const B = Math.sqrt((1.05 * v['carga']) / ((v['spt'] / 5) * 98.0665));
          const pilarM = v['pilar'] / 100;
          return Math.max((B - pilarM) / 3, 0.3);
        },
        unidade: 'm',
        casasDecimais: 2,
      },
    ],
    observacao: 'Fórmula válida para SPT entre 5 e 25 (método de Teixeira) e sapata quadrada sob carga centrada. Dimensão mínima em planta de 60cm (norma) — para pilares de edifícios, recomenda-se no mínimo 80cm. Este cálculo NÃO substitui a verificação de punção nem o dimensionamento de armadura, que exigem projeto estrutural completo.',
    fonte: 'NBR 6122:2019 / NBR 6118 — método de Teixeira (SPT) e fórmula de área de sapata rígida',
  },
  {
    id: 'tubulao',
    tipologiaId: 'tubulao',
    nome: 'Tubulão — Diâmetro da Base e Altura',
    categoria: 'Sistemas de Fundações',
    campos: [
      { id: 'carga', label: 'Carga do pilar', unidade: 'kgf', placeholder: 'Ex: 120000' },
      { id: 'spt', label: 'Índice SPT médio (5 a 25)', unidade: 'golpes', placeholder: 'Ex: 15' },
      { id: 'fuste', label: 'Diâmetro do fuste', unidade: 'cm', placeholder: 'Ex: 90' },
    ],
    passos: [
      {
        label: 'Tensão admissível do solo (σadm = SPT ÷ 5)',
        formula: (v) => v['spt'] / 5,
        unidade: 'kgf/cm²',
        casasDecimais: 2,
      },
      {
        label: 'Área necessária da base (A = carga ÷ σadm)',
        formula: (v) => v['carga'] / (v['spt'] / 5),
        unidade: 'cm²',
        casasDecimais: 0,
      },
      {
        label: 'Diâmetro da base circular (D = √(4A/π))',
        formula: (v) => Math.sqrt((4 * (v['carga'] / (v['spt'] / 5))) / Math.PI),
        unidade: 'cm',
        casasDecimais: 0,
      },
      {
        label: 'Altura da base alargada (H = 0,866 × (D − fuste))',
        formula: (v) => {
          const D = Math.sqrt((4 * (v['carga'] / (v['spt'] / 5))) / Math.PI);
          return Math.min(0.866 * (D - v['fuste']), 180);
        },
        unidade: 'cm',
        casasDecimais: 0,
      },
    ],
    observacao: 'Fórmula válida para SPT entre 5 e 25 (método de Albieiro e Cintra) e base circular. Diâmetro mínimo do fuste é 90cm (escavação manual, NR-18) ou 70cm quando justificado tecnicamente. Altura da base alargada limitada a 1,80m por segurança — acima disso exige medidas adicionais de estabilização.',
    fonte: 'NBR 6122:2019 — método de Albieiro e Cintra (SPT), inclinação de base de 60°',
  },
  {
    id: 'agua-fria-diametro',
    tipologiaId: 'abastecimento-de-agua-fria-e-quente',
    nome: 'Água Fria — Diâmetro do Trecho (Método dos Pesos)',
    categoria: 'Sistemas Hidrossanitários',
    campos: [
      { id: 'somapesos', label: 'Soma dos pesos relativos das peças do trecho', unidade: 'adimensional', placeholder: 'Ex: 2.0' },
    ],
    passos: [
      {
        label: 'Vazão de projeto (Q = 0,3 × √Σpesos)',
        formula: (v) => 0.3 * Math.sqrt(v['somapesos']),
        unidade: 'L/s',
        casasDecimais: 2,
      },
    ],
    observacao: 'Pesos de referência (NBR 5626): bacia c/ válvula de descarga = 32 · bacia c/ caixa acoplada = 0,3 · lavatório = 0,15 · chuveiro = 0,1-0,4 · pia de cozinha = 0,25 · tanque = 0,25 · torneira de jardim = 0,1-0,4. Faixa de diâmetro pela vazão: até 1,1 → 20mm · 1,1 a 3,5 → 25mm · até ~8 → 32mm · acima disso → 40mm ou maior (consultar ábaco completo). Some os pesos de todas as peças alimentadas pelo trecho, do fim para o início do traçado.',
    fonte: 'NBR 5626:1998, método dos pesos relativos e ábaco luneta',
  },
  {
    id: 'glp-botijoes',
    tipologiaId: 'sistemas-de-gas-combustivel-glp-gn',
    nome: 'Central de GLP — Número de Botijões',
    categoria: 'Sistemas de Gás',
    campos: [
      { id: 'consumo', label: 'Consumo total dos aparelhos (soma das potências)', unidade: 'kg/h', placeholder: 'Ex: 6' },
      { id: 'vazaobotijao', label: 'Vazão do botijão escolhido (P13=1,5 · P45=3,5 · P90=6 · P190=10)', unidade: 'kg/h', placeholder: 'Ex: 3.5' },
    ],
    passos: [
      {
        label: 'Número de botijões simultâneos necessários',
        formula: (v) => Math.ceil(v['consumo'] / v['vazaobotijao']),
        unidade: 'unidades',
        casasDecimais: 0,
      },
      {
        label: 'Total de botijões na central (× 2 para bateria de reserva/troca)',
        formula: (v) => Math.ceil(v['consumo'] / v['vazaobotijao']) * 2,
        unidade: 'unidades',
        casasDecimais: 0,
      },
    ],
    observacao: 'A central deve ser dobrada (2 baterias) para permitir troca de botijões vazios sem interrupção do fornecimento — prática padrão de mercado. Vazões de referência dos botijões variam por fabricante; confirmar a vazão exata do modelo antes de finalizar o projeto. Considerar fator de simultaneidade se nem todos os aparelhos operam ao mesmo tempo (reduz o consumo total considerado).',
    fonte: 'NBR 13523 — dimensionamento de central de GLP',
  },
  {
    id: 'cisterna-reuso',
    tipologiaId: 'sustentabilidade-reuso-e-agua-cinza',
    nome: 'Cisterna de Reuso — Volume do Reservatório',
    categoria: 'Sistemas Hidrossanitários',
    campos: [
      { id: 'consumo', label: 'Consumo específico de reuso por pessoa', unidade: 'L/pessoa/dia', placeholder: 'Ex: 45' },
      { id: 'moradores', label: 'Número de moradores/usuários', unidade: 'pessoas', placeholder: 'Ex: 4' },
      { id: 'dias', label: 'Dias de reserva desejados', unidade: 'dias', placeholder: 'Ex: 3' },
    ],
    passos: [
      {
        label: 'Volume mínimo do reservatório',
        formula: (v) => v['consumo'] * v['moradores'] * v['dias'],
        unidade: 'litros',
        casasDecimais: 0,
      },
      {
        label: 'Volume com margem de segurança de 20%',
        formula: (v) => v['consumo'] * v['moradores'] * v['dias'] * 1.2,
        unidade: 'litros',
        casasDecimais: 0,
      },
    ],
    observacao: 'Consumo de reuso (40-50 L/pessoa/dia) é bem menor que o consumo de água potável (150-200 L/pessoa/dia) porque cobre só usos não potáveis: descarga sanitária, lavagem de área externa e irrigação. Arredondar para o modelo comercial de cisterna imediatamente acima do volume calculado.',
    fonte: 'NBR 15527:2019 — água de chuva, requisitos para aproveitamento em áreas urbanas',
  },
];
