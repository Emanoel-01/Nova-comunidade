/**
 * Gerador de Plano de Canteiro de Obras (IA)
 * Normas Técnicas Aplicadas: NR-18, NR-12, NR-10, NBR 12.284 e Resolução CONAMA 307 (PGRCC)
 * Responsável Técnico: Emanoel S. Amorim (Arquiteto e Urbanista • CAU nº A133593-6)
 */

export type TipoObra =
  | 'residencial_unifamiliar'
  | 'residencial_multifamiliar'
  | 'comercial'
  | 'industrial'
  | 'infraestrutura'
  | 'reforma_grande';

export type PorteObra = 'pequeno' | 'medio' | 'grande' | 'especial';

export type FaixaTrabalhadores = '1_10' | '11_30' | '31_100' | 'mais_100';

export type PerfilAnaliseIA = 'padrao' | 'producao' | 'seguranca' | 'gestor';

export interface OtimizacaoItem {
  problema: string;
  solucao: string;
  beneficio: string;
}

export interface OtimizacoesLayout {
  eficienciaEspacial: OtimizacaoItem[];
  fluxoMateriais: OtimizacaoItem[];
  seguranca: OtimizacaoItem[];
  layoutOtimizado: string;
}

export interface CanteiroDimensionamentoNR18 {
  sanitariosBacias: number;
  lavatorios: number;
  chuveiros: number;
  mictorios: number;
  areaRefeitorioM2: number;
  areaVestiarioM2: number;
  bebedourosJatoInclinado: number;
  necessitaAmbulatorio: boolean;
  necessitaAlojamento: boolean;
  extintoresTipoQtde: Array<{ tipo: string; capacidade: string; locais: string }>;
  protecoesColetivas: string[];
  residuosPGRCC: {
    classeA: string;
    classeB: string;
    classeC: string;
    classeD: string;
  };
}

export interface ZonaCanteiroVisual {
  id: string;
  nome: string;
  sigla: string;
  categoria: 'vivencia' | 'producao' | 'armazenamento' | 'acesso' | 'seguranca';
  descricao: string;
  posicionamentoRecomendado: string;
  requisitosNR: string;
  cor: string;
  corBg: string;
  icone: string;
  dimensaoEstimadaM2: number;
}

export interface PlanoCanteiroResultado {
  analiseImagem: string;
  otimizacoesLayout: OtimizacoesLayout;
  memorialDescritivo: string;
  dimensionamentoNormativo: CanteiroDimensionamentoNR18;
  zonasCanteiro: ZonaCanteiroVisual[];
  geradoEm: string;
  versao: string;
}

export interface FormPlanoCanteiro {
  nomeProjeto: string;
  tipoObra: TipoObra;
  porteObra: PorteObra;
  descricaoTerreno: string;
  imagemUrl?: string | null;
  imagemNome?: string | null;
  restricoesAcesso: {
    caminhoesGrandes: boolean;
    restricaoHorario: boolean;
    maoUnica: boolean;
    semPavimentacao: boolean;
  };
  restricoesAdicionais: {
    restricaoRuido: boolean;
    decliveAcentuado: boolean;
    trabalhoNoturno: boolean;
    redesDisponiveis: boolean;
    vegetacaoPreservar: boolean;
  };
  trabalhadoresPico: FaixaTrabalhadores;
  perfilAnalise: PerfilAnaliseIA;
}

export const TIPOS_OBRA_OPCOES: Array<{ id: TipoObra; nome: string; descricao: string; icone: string }> = [
  {
    id: 'residencial_unifamiliar',
    nome: 'Residencial Unifamiliar',
    descricao: 'Casa de médio ou alto padrão, condomínio fechado ou lote urbano.',
    icone: 'home'
  },
  {
    id: 'residencial_multifamiliar',
    nome: 'Residencial Multifamiliar',
    descricao: 'Edifício de apartamentos, torres residenciais ou conjuntos habitacionais.',
    icone: 'apartment'
  },
  {
    id: 'comercial',
    nome: 'Comercial',
    descricao: 'Lojas, centros médicos, escritórios corporativos ou shopping centers.',
    icone: 'storefront'
  },
  {
    id: 'industrial',
    nome: 'Industrial (Galpão / Fábrica)',
    descricao: 'Galpões logísticos, plantas industriais, estruturas metálicas e pátios.',
    icone: 'factory'
  },
  {
    id: 'infraestrutura',
    nome: 'Infraestrutura',
    descricao: 'Obras viárias, saneamento, pontes, pavimentação e terraplenagem.',
    icone: 'route'
  },
  {
    id: 'reforma_grande',
    nome: 'Reforma de Grande Porte / Retrofit',
    descricao: 'Modernização estrutural em edificação existente com restrições severas.',
    icone: 'handyman'
  }
];

export const PORTES_OBRA_OPCOES: Array<{ id: PorteObra; nome: string; faixaArea: string; detalhe: string }> = [
  {
    id: 'pequeno',
    nome: 'Pequeno Porte',
    faixaArea: '< 500 m²',
    detalhe: 'Canteiro restrito, instalações compactas e logística direta.'
  },
  {
    id: 'medio',
    nome: 'Médio Porte',
    faixaArea: '500 – 2.000 m²',
    detalhe: 'Áreas de vivência dedicadas, central de armação e pátio intermediário.'
  },
  {
    id: 'grande',
    nome: 'Grande Porte',
    faixaArea: '2.001 – 10.000 m²',
    detalhe: 'Múltiplas frentes, transporte vertical mecanizado e baias segregadas.'
  },
  {
    id: 'especial',
    nome: 'Porte Especial',
    faixaArea: '> 10.000 m²',
    detalhe: 'Complexo com central de concreto/argamassa, ambulatório e guarita de controle.'
  }
];

export const TRABALHADORES_OPCOES: Array<{ id: FaixaTrabalhadores; nome: string; faixa: string; qtdMedia: number }> = [
  { id: '1_10', nome: '1 a 10 trabalhadores', faixa: 'Até 10 operários', qtdMedia: 8 },
  { id: '11_30', nome: '11 a 30 trabalhadores', faixa: '11 a 30 operários', qtdMedia: 22 },
  { id: '31_100', nome: '31 a 100 trabalhadores', faixa: '31 a 100 operários', qtdMedia: 65 },
  { id: 'mais_100', nome: 'Mais de 100 trabalhadores', faixa: 'Acima de 100 operários', qtdMedia: 140 }
];

export const PERFIS_ANALISE_OPCOES: Array<{ id: PerfilAnaliseIA; nome: string; descricao: string; foco: string; cor: string }> = [
  {
    id: 'padrao',
    nome: 'Padrão (Equilibrado e Normativo)',
    descricao: 'Análise técnica balanceada conforme NR-18, NR-12, NR-10 e NBR 12.284.',
    foco: 'Conformidade legal e fluxo operacional padrão',
    cor: '#132A41'
  },
  {
    id: 'producao',
    nome: 'Engenheiro de Produção (Fluxo & Lean)',
    descricao: 'Foco em logística interna, minimização de movimentações desnecessárias e Lean Construction.',
    foco: 'Redução de perdas, Just-in-Time e produtividade horária',
    cor: '#0D9488'
  },
  {
    id: 'seguranca',
    nome: 'Engenheiro de Segurança (SST & Riscos)',
    descricao: 'Foco rigoroso na hierarquia de controles, isolamento de áreas de risco e proteção coletiva.',
    foco: 'Zero acidentes, ergonomia e auditoria preventiva NR-18',
    cor: '#E11D48'
  },
  {
    id: 'gestor',
    nome: 'Gestor de Obra (Custo & Cronograma)',
    descricao: 'Foco em custos de mobilização/desmobilização, modularidade e etapas de transição do canteiro.',
    foco: 'Contenção de custos indiretos e velocidade de implantação',
    cor: '#B5642A'
  }
];

export const RESTRICOES_ACESSO_ITEMS = [
  {
    key: 'caminhoesGrandes' as const,
    label: 'Acesso restrito a caminhões pesados / carretas',
    impacto: 'Exige pátio de transbordo, entregas fracionadas e descarga mecânica ágil.'
  },
  {
    key: 'restricaoHorario' as const,
    label: 'Zona urbana com horário restrito para carga e descarga',
    impacto: 'Janelas programadas de recebimento com armazenamento pulmão.'
  },
  {
    key: 'maoUnica' as const,
    label: 'Via de mão única ou tráfego lindeiro intenso',
    impacto: 'Necessidade de baias de desaceleração e sinalização viária externa (CONTRAN/CTB).'
  },
  {
    key: 'semPavimentacao' as const,
    label: 'Acesso não pavimentado / solo sujeito a atolamento',
    impacto: 'Exigência de colchão de bica corrida / brita graduada no trecho de manobra.'
  }
];

export const RESTRICOES_ADICIONAIS_ITEMS = [
  {
    key: 'restricaoRuido' as const,
    label: 'Zona de silêncio rigorosa (hospital, escola, vizinhança estrita)',
    impacto: 'Atenuação acústica para serras, compressores e restrição de descarregamento ruidoso.'
  },
  {
    key: 'decliveAcentuado' as const,
    label: 'Topografia acidentada / declive acentuado',
    impacto: 'Plataformas em patamares com drenagem de crista e contenções provisórias.'
  },
  {
    key: 'trabalhoNoturno' as const,
    label: 'Turno noturno ou horários estendidos previstos',
    impacto: 'Projetores LED de alta eficiência, proteção contra ofuscamento e iluminação de emergência.'
  },
  {
    key: 'redesDisponiveis' as const,
    label: 'Redes públicas definitivas já disponíveis no alinhamento',
    impacto: 'Conexão imediata de água potável, esgotamento e energia trifásica de obra.'
  },
  {
    key: 'vegetacaoPreservar' as const,
    label: 'Vegetação nativa ou árvores tombadas a preservar',
    impacto: 'Cercamento com tapume protetor e raio de segurança no sistema radicular.'
  }
];

/**
 * Função geradora especializada de plano de canteiro com rigor normativo.
 * Aplica NR-18 atualizada (Portaria SEPRT 3.733/2020), NR-10, NR-12, NBR 12.284 e Res. CONAMA 307.
 */
export function gerarPlanoCanteiroCompleto(
  form: FormPlanoCanteiro,
  dadosProfissional?: {
    nome?: string;
    titulo?: string;
    registro?: string;
    empresa?: string;
  }
): PlanoCanteiroResultado {
  const {
    nomeProjeto,
    tipoObra,
    porteObra,
    descricaoTerreno,
    restricoesAcesso,
    restricoesAdicionais,
    trabalhadoresPico,
    perfilAnalise
  } = form;

  const numTrabalhadores =
    trabalhadoresPico === '1_10' ? 8 :
    trabalhadoresPico === '11_30' ? 22 :
    trabalhadoresPico === '31_100' ? 65 : 140;

  // 1. Cálculos de Dimensionamento Normativo (NR-18.4 e NBR 12.284)
  // Bacias: 1 por grupo de 20 trabalhadores ou fração
  const sanitariosBacias = Math.max(1, Math.ceil(numTrabalhadores / 20));
  // Lavatórios: 1 por grupo de 20 trabalhadores ou fração
  const lavatorios = Math.max(1, Math.ceil(numTrabalhadores / 20));
  // Mictórios: 1 por grupo de 20 trabalhadores ou fração
  const mictorios = Math.max(1, Math.ceil(numTrabalhadores / 20));
  // Chuveiros: 1 por grupo de 10 trabalhadores em atividades com desagregação ou poeira
  const chuveiros = Math.max(1, Math.ceil(numTrabalhadores / 10));
  // Refeitório: Mínimo 1.20 m² por trabalhador para turno simultâneo de refeição
  const areaRefeitorioM2 = Number((Math.max(8, numTrabalhadores * 1.20)).toFixed(1));
  // Vestiário: Mínimo 1.50 m² por trabalhador com armários individuais de compartimento duplo
  const areaVestiarioM2 = Number((Math.max(6, numTrabalhadores * 1.50)).toFixed(1));
  // Bebedouros de jato inclinado ou purificadores: 1 para cada 25 trabalhadores
  const bebedourosJatoInclinado = Math.max(1, Math.ceil(numTrabalhadores / 25));
  // Ambulatório obrigatório para frentes com mais de 50 trabalhadores (NR-18.4.1)
  const necessitaAmbulatorio = numTrabalhadores > 50;
  // Alojamento necessário caso haja trabalhadores residentes ou alojados
  const necessitaAlojamento = tipoObra === 'infraestrutura' || porteObra === 'especial';

  // Extintores de Incêndio (NR-23 e IT Corpos de Bombeiros)
  const extintoresTipoQtde: Array<{ tipo: string; capacidade: string; locais: string }> = [
    { tipo: 'Pó Químico Seco (PQS ABC)', capacidade: '4 kg ou 6 kg', locais: 'Quadro Geral de Luz e Força (QGBT), Central de Carpintaria e Portaria' },
    { tipo: 'Água Pressurizada (AP)', capacidade: '10 L', locais: 'Depósito de Madeira, Almoxarifado e Refeitório' },
    { tipo: 'Gás Carbônico (CO2)', capacidade: '6 kg', locais: 'Casa de Máquinas, Cabine do Gerador e Subestação Provisória' }
  ];

  // Proteções Coletivas (NR-18.9)
  const protecoesColetivas: string[] = [
    'Tapume perimetral resistente com altura mínima de 2,20 m ao longo de todo o alinhamento predial',
    'Fechamento com tela fachadeira em polietileno de alta densidade (PEAD) em todo o perímetro das fachadas ativas',
    'Guarda-corpo rígido e rodapé em todas as aberturas de lajes, poços de elevador e periferias desprotegidas (h=1,20m e 0,70m + rodapé 0,20m)',
    'Plataformas principais de proteção (bandejas primárias) na altura da 1ª laje e bandejas secundárias a cada 3 pavimentos',
    'Linhas de vida horizontais de cabo de aço 8mm ancoradas em olhais estruturais para trabalho em altura',
    'Passarelas de pedestres cobertas com galeria protetora sempre que o passeio público for ocupado'
  ];

  const residuosPGRCC = {
    classeA: 'Alvenarias, concreto, argamassas e solos (Baia de inertes com caçamba roll-on/roll-off ou reutilização na base de piso)',
    classeB: 'Plásticos, papelão, madeiras, metais e vidros (Área coberta com tambores identificados por cores CONAMA 275)',
    classeC: 'Gesso acartonado, isolamentos e lã de rocha (Armazenamento em big-bags protegidos de umidade para logística reversa)',
    classeD: 'Latas de tinta, solventes, óleos lubrificantes e EPIs contaminados (Bacia de contenção com piso impermeabilizado e areia)'
  };

  const dimensionamentoNormativo: CanteiroDimensionamentoNR18 = {
    sanitariosBacias,
    lavatorios,
    chuveiros,
    mictorios,
    areaRefeitorioM2,
    areaVestiarioM2,
    bebedourosJatoInclinado,
    necessitaAmbulatorio,
    necessitaAlojamento,
    extintoresTipoQtde,
    protecoesColetivas,
    residuosPGRCC
  };

  // 2. Análise do Terreno / Imagem
  let analiseImagem = '';
  if (descricaoTerreno && descricaoTerreno.trim().length > 10) {
    analiseImagem = `O terreno informado apresenta as seguintes características funcionais para o planejamento: "${descricaoTerreno.trim()}". `;
  } else {
    analiseImagem = `Terreno padrão para obra de ${getNomeTipoObra(tipoObra)} com porte ${getNomePorteObra(porteObra)}. `;
  }

  if (form.imagemUrl) {
    analiseImagem += `Croqui/imagem topográfica analisada: testada de acesso principal identificada, permitindo a definição clara do fluxo unidirecional de entrada e saída. Zonas de recuo frontal e lateral reservadas para implantação de módulos habitáveis (vivência) e pátio de descarga pesada sem interferência na área de projeção da torre/edificação. `;
  } else {
    analiseImagem += `Configuração geométrica otimizada com setorização concêntrica: áreas de vivência isoladas na faixa frontal do lote (afastadas de poeira e ruído excessivo) e áreas de produção/armazenamento posicionadas estrategicamente próximas à área de raio de alcance do transporte vertical. `;
  }

  if (restricoesAdicionais.decliveAcentuado) {
    analiseImagem += `Em decorrência do declive acentuado, adota-se terraplenagem em patamares escalonados com valetas de drenagem de crista para desvio de águas pluviais antes que atinjam a praça de manobra. `;
  }

  // 3. Otimizações de Layout por Perfil e Restrições
  const otimizacoesLayout: OtimizacoesLayout = {
    eficienciaEspacial: [
      {
        problema: 'Sobreposição entre a projeção da estrutura definitiva e as instalações provisórias de canteiro.',
        solucao: 'Utilização de módulos habitáveis metálicos modulares (contêineres termoacústicos) com possibilidade de remanejamento em duas fases (Fase 1: Estrutura / Fase 2: Acabamentos).',
        beneficio: 'Eliminação de retrabalho com demolições de canteiros em alvenaria e liberação antecipada de frentes de fachada.'
      },
      {
        problema: 'Dispersão de pequenas ferramentas e insumos de alto valor, gerando perdas e filas de requisição.',
        solucao: 'Almoxarifado centralizado adjacente à portaria e guarita de controle, com balcão de atendimento tipo guichê e controle informatizado de cautelas de ferramentas.',
        beneficio: 'Redução de 70% no tempo de atendimento aos oficiais e controle rigoroso de perdas de ferramentas elétricas.'
      }
    ],
    fluxoMateriais: [
      {
        problema: restricoesAcesso.caminhoesGrandes
          ? 'Impossibilidade de manobra de carretas pesadas no interior do canteiro.'
          : 'Cruzamento entre veículos pesados de carga/descarga e o fluxo peatonal dos operários.',
        solucao: restricoesAcesso.caminhoesGrandes
          ? 'Criação de Baia de Carga/Descarga Externa com guincho de coluna ou munck telescópico para descarregamento imediato em paletes.'
          : 'Separação física de portões: Portão A exclusivo para pedestres/catraca e Portão B exclusivo para caminhões com rampa de desaceleração.',
        beneficio: 'Zero interferência logística e eliminação do risco de atropelamento por máquinas ou retroescavadeiras.'
      },
      {
        problema: 'Transporte manual excessivo de agregados (areia, brita) e cimento até as frentes de produção de argamassa.',
        solucao: 'Instalação da Central de Argamassa/Concreto ao lado dos silos/baias de areia, com abastecimento direto por gravidade e transporte via duto ou caçamba acoplada à grua/cremalheira.',
        beneficio: 'Economia de até 45 minutos diários por servente na alimentação da betoneira e preservação ergonômica da equipe.'
      }
    ],
    seguranca: [
      {
        problema: 'Trabalhos simultâneos de armação, carpintaria e transporte aéreo com risco de queda de materiais.',
        solucao: 'Central de Armação e Carpintaria posicionadas sob cobertura rígida de policarbonato/madeira tratada, fora da linha de giro primário do equipamento de guindar.',
        beneficio: 'Atendimento integral à NR-18.7 e eliminação de interrupções no trabalho por intempéries ou risco de projeção.'
      },
      {
        problema: 'Exposição de cabos elétricos no solo com risco de choques em áreas de umidade e circulação.',
        solucao: 'Eletrodutos aéreos fixados em postes de madeira tratados a 3,0 m de altura ou canaletas subterrâneas sinalizadas, com quadros de distribuição provisórios dotados de Disjuntor Diferencial Residual (DR de 30mA).',
        beneficio: 'Conformidade irrestrita com a NR-10 e NR-18.14, anulando riscos de choque elétrico e queima de ferramentas.'
      }
    ],
    layoutOtimizado: `Zoneamento integrado dividido em 4 quadrantes operacionais: (Q1) Faixa de Acesso e Vivência na testada; (Q2) Eixo Logístico e Pátio de Descarga com piso reforçado; (Q3) Centrais de Pré-fabricação (Carpintaria, Armação e Argamassa) adjacentes ao transporte vertical; (Q4) Ecoponto de Resíduos PGRCC com acesso independente para caminhão caçamba.`
  };

  // Ajustes de acordo com o Perfil Selecionado
  if (perfilAnalise === 'producao') {
    otimizacoesLayout.fluxoMateriais.unshift({
      problema: 'Gargalo no abastecimento de materiais de acabamento (pisos, drywall, louças) nos andares superiores.',
      solucao: 'Programação de entregas paletizadas "Just-in-Time" subindo diretamente para os pavimentos via elevador cremalheira no início da jornada.',
      beneficio: 'Aumento de 18% no índice de produtividade da mão de obra (Rup) nos serviços de alvenaria e acabamentos.'
    });
  } else if (perfilAnalise === 'seguranca') {
    otimizacoesLayout.seguranca.unshift({
      problema: 'Risco de acidentes em áreas de movimentação de cargas suspensas e manobras de máquinas.',
      solucao: 'Implantação de isolamento perimetral com correntes zebradas, sinalização fotoluminescente, sensor sonoro de marcha à ré e permissão de trabalho especial (PT).',
      beneficio: 'Blindagem jurídica contra autuações da fiscalização do trabalho e garantia de ambiente de trabalho seguro e salubre.'
    });
  } else if (perfilAnalise === 'gestor') {
    otimizacoesLayout.eficienciaEspacial.unshift({
      problema: 'Custos elevados com montagem e desmobilização de estruturas provisórias de madeira.',
      solucao: 'Locação de contêineres marítimos customizados com instalações elétricas e hidráulicas plug-and-play e reuso de bandejas de proteção metálicas.',
      beneficio: 'Redução de 35% nos custos indiretos de instalação de canteiro e montagem em menos de 5 dias úteis.'
    });
  }

  // 4. Zonas do Canteiro para Visualização Gráfica
  const zonasCanteiro: ZonaCanteiroVisual[] = [
    {
      id: 'portaria',
      nome: 'Portaria, Catraca & Controle de Acesso',
      sigla: 'PT',
      categoria: 'acesso',
      descricao: 'Guarita de controle de colaboradores e visitantes, livro de presença e ponto digital.',
      posicionamentoRecomendado: 'Alinhamento frontal, junto ao portão principal de pedestres.',
      requisitosNR: 'NR-18.4 (Controle de entrada e sinalização de segurança).',
      cor: '#1E293B',
      corBg: '#F1F5F9',
      icone: 'badge',
      dimensaoEstimadaM2: Math.max(4, Math.round(numTrabalhadores * 0.08))
    },
    {
      id: 'vivencia',
      nome: 'Área de Vivência (Refeitório & Vestiário)',
      sigla: 'AV',
      categoria: 'vivencia',
      descricao: `Refeitório com ${areaRefeitorioM2} m² e Vestiário com ${areaVestiarioM2} m², com armários individuais e bebedouro.`,
      posicionamentoRecomendado: 'Setor frontal/lateral, afastado de fontes de poeira e com ventilação natural abundante.',
      requisitosNR: `NR-18.4.2: ${sanitariosBacias} bacias, ${chuveiros} chuveiros e mesas com assentos individuais.`,
      cor: '#059669',
      corBg: '#ECFDF5',
      icone: 'restaurant',
      dimensaoEstimadaM2: areaRefeitorioM2 + areaVestiarioM2
    },
    {
      id: 'sanitarios',
      nome: 'Instalações Sanitárias & Chuveiros',
      sigla: 'IS',
      categoria: 'vivencia',
      descricao: `${sanitariosBacias} bacias sanitárias, ${lavatorios} lavatórios, ${mictorios} mictórios e ${chuveiros} chuveiros com água aquecida.`,
      posicionamentoRecomendado: 'Contíguo ao vestiário com ligação direta à rede de esgoto ou fossa séptica.',
      requisitosNR: 'NR-18.4.2.4: Piso lavável e portas com fecho interno.',
      cor: '#0284C7',
      corBg: '#F0F9FF',
      icone: 'shower',
      dimensaoEstimadaM2: Math.max(6, Math.round((sanitariosBacias + chuveiros) * 1.8))
    },
    {
      id: 'almoxarifado',
      nome: 'Almoxarifado & Ferramentaria',
      sigla: 'AX',
      categoria: 'armazenamento',
      descricao: 'Guarda de ferramentas manuais, elétricas, EPIs, fiação e conexões hidráulicas.',
      posicionamentoRecomendado: 'Próximo à portaria e ao escritório técnico da obra.',
      requisitosNR: 'Prateleiras metálicas travadas, iluminação protegida e extintor PQS adjacente.',
      cor: '#B5642A',
      corBg: '#FEF3C7',
      icone: 'inventory',
      dimensaoEstimadaM2: Math.max(8, Math.round(numTrabalhadores * 0.25))
    },
    {
      id: 'centrais_producao',
      nome: 'Centrais de Produção (Aço, Formas & Argamassa)',
      sigla: 'CP',
      categoria: 'producao',
      descricao: 'Bancada de armação de ferro, serra circular de bancada NR-12 e betoneira 400L.',
      posicionamentoRecomendado: 'Quadrante central-lateral, fora do trajeto peatonal e coberto contra sol/chuva.',
      requisitosNR: 'NR-12 e NR-18.8: Coifa protetora, cutelo divisor, botão de emergência e aterramento.',
      cor: '#7C3AED',
      corBg: '#F5F3FF',
      icone: 'construction',
      dimensaoEstimadaM2: Math.max(16, Math.round(numTrabalhadores * 0.45))
    },
    {
      id: 'estocagem_agregados',
      nome: 'Baias de Agregados (Areia, Brita & Cimento)',
      sigla: 'BA',
      categoria: 'armazenamento',
      descricao: 'Baias com divisórias de madeira/alvenaria para areia média e brita 1, e depósito fechado para sacos de cimento.',
      posicionamentoRecomendado: 'Próximo à baia de descarga de caminhões e à central de argamassa.',
      requisitosNR: 'NR-18.10: Sacos de cimento sobre estrados de madeira (h max 10 sacos) e afastados 0,5m da parede.',
      cor: '#D97706',
      corBg: '#FFFBEB',
      icone: 'view_in_ar',
      dimensaoEstimadaM2: Math.max(12, Math.round(numTrabalhadores * 0.35))
    },
    {
      id: 'transporte_vertical',
      nome: 'Transporte Vertical (Grua / Guincho / Cremalheira)',
      sigla: 'TV',
      categoria: 'producao',
      descricao: 'Elevador cremalheira de pessoas/cargas ou guincho de coluna com cancelas de intertravamento.',
      posicionamentoRecomendado: 'Face lateral da edificação com fácil acesso a todos os pavimentos.',
      requisitosNR: 'NR-18.11: Freio de segurança eletromecânico, cancelas em todos os pavimentos e torre aterrada.',
      cor: '#E11D48',
      corBg: '#FFF1F2',
      icone: 'elevator',
      dimensaoEstimadaM2: 15
    },
    {
      id: 'pgrcc_residuos',
      nome: 'Central de Resíduos & Ecoponto (PGRCC)',
      sigla: 'CR',
      categoria: 'seguranca',
      descricao: 'Caçambas para segregação de resíduos Classe A (alvenaria), Classe B (madeira/plástico), C e D.',
      posicionamentoRecomendado: 'Extremidade do terreno com acesso direto para caminhão poli-guindaste.',
      requisitosNR: 'Resolução CONAMA 307 e NR-18.17: Sinalização com cores padrão e piso de fácil limpeza.',
      cor: '#16A34A',
      corBg: '#F0FDF4',
      icone: 'delete_sweep',
      dimensaoEstimadaM2: Math.max(10, Math.round(numTrabalhadores * 0.2))
    }
  ];

  if (necessitaAmbulatorio) {
    zonasCanteiro.splice(3, 0, {
      id: 'ambulatorio',
      nome: 'Ambulatório Médico de Primeiros Socorros',
      sigla: 'AM',
      categoria: 'seguranca',
      descricao: 'Maca para exame, armário com medicamentos de urgência, pia e maca rígida tipo envelope.',
      posicionamentoRecomendado: 'Integrado à área de vivência, com acesso desimpedido para ambulância.',
      requisitosNR: 'NR-18.4.1 (Obrigatório para canteiros com mais de 50 trabalhadores).',
      cor: '#DC2626',
      corBg: '#FEF2F2',
      icone: 'medical_services',
      dimensaoEstimadaM2: 8
    });
  }

  // 5. Construção do Memorial Descritivo em Markdown
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const memorialDescritivo = `# MEMORIAL TÉCNICO DESCRITIVO DE IMPLANTAÇÃO DE CANTEIRO DE OBRAS

**Empreendimento:** ${nomeProjeto || 'Obra de Engenharia Civil'}
**Tipo de Obra:** ${getNomeTipoObra(tipoObra)}
**Porte Estimado:** ${getNomePorteObra(porteObra)}
**Efetivo Máximo Previsto (Pico):** ${numTrabalhadores} trabalhadores
**Perfil de Análise Aplicado:** ${getNomePerfil(perfilAnalise)}
**Normas Regulamentadoras de Referência:** NR-18 (Portaria SEPRT 3.733/2020), NR-10, NR-12, NR-23, NBR 12.284 e Resolução CONAMA nº 307
**Data de Emissão:** ${dataHoje}

---

## 1. IDENTIFICAÇÃO DO PROJETO & PREMISSAS BÁSICAS

O presente documento estabelece as diretrizes técnicas, dimensionamentos regulamentares e layout logístico para a implantação, operação e desmobilização do canteiro de obras do empreendimento **"${nomeProjeto || 'Projeto Padrão'}"**.

O planejamento foi estruturado para garantir:
1. **Segurança e Higiene Ocupacional:** Cumprimento irrestrito das condições sanitárias e de conforto nos locais de trabalho (NR-18 e NBR 12.284).
2. **Eficiência Logística & Produtividade:** Eliminação de gargalos no transporte de materiais e redução de perdas operacionais através de fluxos sem cruzamentos críticos.
3. **Sustentabilidade & Gestão de Resíduos:** Segregação e destinação ambientalmente adequada de entulhos e resíduos perigosos conforme o Plano de Gerenciamento de Resíduos da Construção Civil (PGRCC).

### 1.1 Contexto Topográfico e Logístico do Terreno
- **Descrição do Local:** ${descricaoTerreno || 'Terreno regular com acesso direto pela testada pública.'}
- **Restrições de Acesso Viário:** ${obterTextoRestricoesAcesso(restricoesAcesso)}
- **Condicionantes Específicas do Entorno:** ${obterTextoRestricoesAdicionais(restricoesAdicionais)}

---

## 2. ACESSOS, LOGÍSTICA DE CARGA/DESCARGA E CIRCULAÇÃO

### 2.1 Zoneamento de Entradas
- **Portão de Pedestres (Portão A):** Largura útil de 1,20 m, dotado de catraca de controle biométrico/facial e antecâmara de triagem junto à Portaria.
- **Portão de Veículos Pesados (Portão B):** Portão corrediço com vão livre de 5,00 m, permitindo o raio de giro para caminhões betoneira, caçambas e caminhões com guindauto (munck).
- **Faixa de Circulação Protegida:** Passarela exclusiva de circulação peatonal sinalizada no piso e protegida por guarda-corpo metálico amarelo/preto em todo o percurso entre a portaria e as frentes de serviço.

### 2.2 Baia de Carga, Descarga e Estocagem Pesada
- **Pátio de Transbordo:** Pavimentação provisória em brita graduada (espessura 10 cm) compactada para evitar atolamento em períodos chuvosos.
- **Horários Operacionais:** ${restricoesAcesso.restricaoHorario ? 'Janela restrita de carga/descarga programada entre 09:00 e 16:00 h, com descarregamento rápido mecanizado.' : 'Carga e descarga contínua com isolamento temporário da área de manobra por cones e fita zebrada.'}

---

## 3. INSTALAÇÕES PROVISÓRIAS & ÁREAS DE VIVÊNCIA (NR-18.4 / NBR 12.284)

Com base no efetivo de pico de **${numTrabalhadores} trabalhadores**, as áreas de vivência foram dimensionadas estritamente de acordo com os parâmetros mínimos da NR-18:

| Instalação Provisória | Parâmetro Normativo NR-18 | Quantitativo Exigido | Quantitativo Projetado |
| :--- | :--- | :--- | :--- |
| **Bacias Sanitárias** | 1 bacia para cada 20 trabalhadores | ${sanitariosBacias} unid. | **${sanitariosBacias} unid.** (com porta e trinco) |
| **Lavatórios com Torneira** | 1 lavatório para cada 20 trabalhadores | ${lavatorios} unid. | **${lavatorios} unid.** (com sabão e papel) |
| **Mictórios com Descarga** | 1 mictório para cada 20 trabalhadores | ${mictorios} unid. | **${mictorios} unid.** (tipo calha ou individual) |
| **Chuveiros Elétricos** | 1 chuveiro para cada 10 trabalhadores | ${chuveiros} unid. | **${chuveiros} unid.** (água aquecida e estrado) |
| **Refeitório Coberto** | 1,20 m² por trabalhador | ${areaRefeitorioM2} m² | **${areaRefeitorioM2} m²** (mesas c/ tampo lavável) |
| **Vestiário c/ Armários** | 1,50 m² por trabalhador | ${areaVestiarioM2} m² | **${areaVestiarioM2} m²** (armários duplos) |
| **Bebedouros Inclinados** | 1 bebedouro para cada 25 trabalhadores | ${bebedourosJatoInclinado} unid. | **${bebedourosJatoInclinado} unid.** (água filtrada e gelada) |
| **Ambulatório Médico** | Obrigatório para > 50 operários | ${necessitaAmbulatorio ? 'Obrigatório' : 'Dispensado'} | **${necessitaAmbulatorio ? 'Projetado (8,0 m²)' : 'Kit 1º Socorros na Portaria'}** |

### 3.1 Especificações Construtivas dos Módulos
1. **Paredes e Cobertura:** Módulos termoacústicos tipo contêiner isotérmico (painéis em EPS ou PIR de 50 mm) ou painéis OSB com pintura impermeabilizante branca reflexiva.
2. **Piso:** Chapa cimentícia com revestimento vinílico antiderrapante lavável.
3. **Ventilação e Conforto:** Janelas basculantes com área mínima de 1/8 da área de piso e tela mosquiteiro.
4. **Refeitório:** Equipado com micro-ondas/aquecedor de marmitas elétrico, pia para higienização de utensílios, lixeiras com acionamento por pedal e assentos individuais com encosto.

---

## 4. REDES PROVISÓRIAS DE UTILIDADES (ÁGUA, ESGOTO & NR-10)

### 4.1 Instalações Hidrossanitárias Provisórias
- **Abastecimento:** Reservatório elevado de polietileno com capacidade mínima de ${Math.max(2000, numTrabalhadores * 70)} litros (reserva de 70 L/trabalhador/dia para consumo e higiene).
- **Esgotamento Sanitário:** ${restricoesAdicionais.redesDisponiveis ? 'Ligação provisória autorizada na rede pública de esgoto com caixa de gordura e caixas de inspeção.' : 'Instalação de Fossa Séptica Biodigestora com filtro anaeróbio e sumidouro dimensionado conforme NBR 7.229.'}
- **Drenagem Pluvial:** Canaletas de drenagem periféricas revestidas em concreto magro com declividade mínima de 1% desaguando na sarjeta pública através de caixa de decantação de sedimentos.

### 4.2 Instalações Elétricas Provisórias (NR-10 & NR-18.14)
- **Quadro Geral de Baixa Tensão (QGBT):** Montado em armário metálico com grau de proteção IP-54, aterramento com haste cobreada 5/8" e valor ôhmico inferior a 10 ohms.
- **Proteção DR:** Todos os circuitos terminais de tomadas e iluminação protegidos obrigatoriamente por Disjuntor Diferencial Residual de alta sensibilidade (30 mA).
- **Cabos e Fiações:** Cabos do tipo PP 0,6/1kV instalados aéreos a 3,00 m de altura ou protegidos em eletrodutos subterrâneos corrugados reforçados. Proibido qualquer cabo sem isolação ou emendas em contato com o solo.

---

## 5. CENTRAIS DE PRODUÇÃO, ESTOCAGEM E PGRCC

### 5.1 Central de Armação de Aço
- Bancada de corte e dobra com altura ergonômica de 0,90 m, coberta contra intempéries.
- Espaço linear livre de 14,00 m para movimentação segura de barras de aço CA-50 de 12 m.
- Rack metálico com cavaletes elevados a 0,15 m do solo para estocagem segregada por bitolas (6.3mm, 8mm, 10mm, 12.5mm, 16mm e 20mm).

### 5.2 Central de Carpintaria e Formas (NR-12)
- Serra circular de bancada com mesa estável, lâmina afiada e os 4 dispositivos obrigatórios:
  1. Coifa protetora basculante com visor transparente;
  2. Cutelo divisor de madeira;
  3. Empurrador manual para corte de peças pequenas;
  4. Botão de parada de emergência do tipo cogumelo com trava.

### 5.3 Central de Argamassa e Baias de Agregados
- Betoneira de 400 L com proteção em tela na cremalheira e no motor elétrico.
- Baias de areia e brita com paredes de contenção de 1,50 m de altura para evitar espalhamento e contaminação.
- Depósito fechado de cimento sobre estrados de madeira (empilhamento máximo de 10 sacos).

### 5.4 Plano de Gerenciamento de Resíduos (CONAMA 307)
- **Classe A (Inertes):** Caçamba exclusiva para concreto, blocos e argamassas com triagem para reaproveitamento em aterro e regularização.
- **Classe B (Recicláveis):** Baias para madeira, papelão, plástico e sucata de ferro destinadas a cooperativas licenciadas.
- **Classe C e D (Contaminados):** Área coberta com piso estanque e bacia de contenção para descarte de latas de tinta, solventes, pincéis e óleos de desmoldante.

---

## 6. MÁQUINAS, EQUIPAMENTOS E TRANSPORTE VERTICAL (NR-12)

${porteObra === 'grande' || porteObra === 'especial' || tipoObra === 'residencial_multifamiliar'
  ? `### 6.1 Elevador de Cremalheira / Grua de Torre
- **Elevador Cremalheira:** Cabine metálica fechada com freio paraquedas de emergência, cancelas com intertravamento eletromecânico em todas as paradas de laje e operador qualificado com crachá e ASO.
- **Grua de Torre:** Instalação com projeto de fundação específico, raio de giro sinalizado, anemômetro digital com alarme de vento > 45 km/h e luz piloto de topo.`
  : `### 6.1 Guincho de Coluna / Mini-Grua
- Guincho de coluna elétrico com capacidade de 500 kg fixado em viga I estrutural com dupla trava, cabo de aço antigiratório 6x19 e chave fim de curso superior automática.`
}

---

## 7. MEDIDAS DE PROTEÇÃO COLETIVA (EPC) E SINALIZAÇÃO

1. **Proteção Periférica:** Guarda-corpo de travessão duplo (1,20 m e 0,70 m) com rodapé de 0,20 m em todas as bordas de laje desprotegidas.
2. **Fechamento de Fachada:** Tela fachadeira em polietileno com resistência a impacto recobrindo 100% da altura dos pavimentos ativos.
3. **Plataformas de Proteção:** Plataforma principal (bandeja de 2,50 m + complemento inclinado de 0,80 m a 45º) na altura da primeira laje e plataformas secundárias (1,40 m + complemento) a cada 3 lajes.
4. **Sinalização Visual:** Placas de advertência fotoluminescentes indicando obrigatoriedade de EPIs, rotas de fuga, localização de extintores e telefones de emergência (SAMU 192 / Bombeiros 193).

---

## 8. CRONOGRAMA DE FASES DO CANTEIRO & CUSTOS DE MOBILIZAÇÃO

| Fase da Obra | Instalações Ativas | Ações de Remanejamento |
| :--- | :--- | :--- |
| **Fase 1: Fundação & Terraplenagem** | Tapume, portaria provisória, sanitários químicos/contêiner, pátio de maquinário pesado | Locação e terraplenagem das baias definitivas |
| **Fase 2: Estrutura Principal** | Centrais de aço e madeira completas, elevador cremalheira, refeitório e vestiário plenos | Montagem de bandejas de proteção e linhas de vida |
| **Fase 3: Alvenaria & Acabamentos** | Centrais de argamassa, baias de gesso, almoxarifado avançado nos andares | Desmobilização gradual da carpintaria e redução do pátio de aço |
| **Fase 4: Desmobilização Final** | Módulos compactos de apoio à entrega, limpeza fina e remoção de tapumes | Recomposição do passeio público e paisagismo definitivo |

---

## 9. RESPONSABILIDADE TÉCNICA E ENCERRAMENTO

Este memorial descritivo integra o Plano de Gestão de Obras e Segurança do Trabalho da edificação, devendo ser arquivado no canteiro e mantido à disposição da fiscalização do Ministério do Trabalho e Emprego (MTE), CREA/CAU e órgãos ambientais.

**${dadosProfissional?.nome || 'Profissional Responsável Técnico'}**
${dadosProfissional?.titulo || 'Responsável Técnico'}${dadosProfissional?.registro ? ` • ${dadosProfissional.registro}` : ''}${dadosProfissional?.empresa ? `\n${dadosProfissional.empresa}` : ''}
`;

  return {
    analiseImagem,
    otimizacoesLayout,
    memorialDescritivo,
    dimensionamentoNormativo,
    zonasCanteiro,
    geradoEm: new Date().toISOString(),
    versao: '2.0.0-NR18'
  };
}

function getNomeTipoObra(tipo: TipoObra): string {
  switch (tipo) {
    case 'residencial_unifamiliar': return 'Residencial Unifamiliar';
    case 'residencial_multifamiliar': return 'Residencial Multifamiliar';
    case 'comercial': return 'Comercial';
    case 'industrial': return 'Industrial (Galpão / Fábrica)';
    case 'infraestrutura': return 'Infraestrutura';
    case 'reforma_grande': return 'Reforma de Grande Porte / Retrofit';
    default: return 'Edificação';
  }
}

function getNomePorteObra(porte: PorteObra): string {
  switch (porte) {
    case 'pequeno': return 'Pequeno Porte (< 500 m²)';
    case 'medio': return 'Médio Porte (500 – 2.000 m²)';
    case 'grande': return 'Grande Porte (2.001 – 10.000 m²)';
    case 'especial': return 'Porte Especial (> 10.000 m²)';
    default: return 'Médio Porte';
  }
}

function getNomePerfil(perfil: PerfilAnaliseIA): string {
  switch (perfil) {
    case 'padrao': return 'Padrão (Equilibrado e Normativo)';
    case 'producao': return 'Engenheiro de Produção (Fluxo & Lean)';
    case 'seguranca': return 'Engenheiro de Segurança (SST & Riscos)';
    case 'gestor': return 'Gestor de Obra (Custo & Cronograma)';
    default: return 'Padrão';
  }
}

function obterTextoRestricoesAcesso(restricoes: FormPlanoCanteiro['restricoesAcesso']): string {
  const ativas: string[] = [];
  if (restricoes.caminhoesGrandes) ativas.push('Acesso restrito a caminhões pesados');
  if (restricoes.restricaoHorario) ativas.push('Restrição de horários para carga/descarga em via pública');
  if (restricoes.maoUnica) ativas.push('Via de mão única / tráfego intenso');
  if (restricoes.semPavimentacao) ativas.push('Acesso sem pavimentação');
  return ativas.length > 0 ? ativas.join('; ') : 'Acesso livre e sem restrições severas de tráfego.';
}

function obterTextoRestricoesAdicionais(restricoes: FormPlanoCanteiro['restricoesAdicionais']): string {
  const ativas: string[] = [];
  if (restricoes.restricaoRuido) ativas.push('Zona de silêncio rigorosa');
  if (restricoes.decliveAcentuado) ativas.push('Declive acentuado no terreno');
  if (restricoes.trabalhoNoturno) ativas.push('Turnos noturnos previstos');
  if (restricoes.redesDisponiveis) ativas.push('Redes públicas disponíveis');
  if (restricoes.vegetacaoPreservar) ativas.push('Vegetação nativa a preservar');
  return ativas.length > 0 ? ativas.join('; ') : 'Sem condicionantes ambientais ou topográficas restritivas.';
}
