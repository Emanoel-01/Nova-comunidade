export interface ItemFundacao {
  id: string;
  tipo: 'sapata-isolada' | 'sapata-corrida' | 'baldrame' | 'bloco';
  largura: number;
  altura: number;
  comprimento: number;
  profundidade: number;
  qtd: number;
  concreto: number;
  forma: number;
  escavacao: number;
  reaproveitamento: number;
  botaFora: number;
  aco: number;
}

export interface ItemEstrutura {
  id: string;
  tipo: 'pilar' | 'viga' | 'laje';
  largura: number;
  altura: number;
  comprimento: number;
  qtd: number;
  concreto: number;
  forma: number;
  cimbramento: number;
  aco: number;
  solda: number;
}

export interface ItemArquitetonico {
  id: string;
  tipo: 'alvenaria-ceramica' | 'alvenaria-bloco' | 'revestimento-parede' | 'piso-ceramico' | 'pintura';
  comprimento: number;
  altura: number;
  qtd: number;
  desconto: number;
  areaBruta: number;
  areaLiquida: number;
  encunhamento: number;
}

export interface ItemEsquadria {
  id: string;
  tipo: 'porta-lisa' | 'porta-veneziana' | 'janela-correr' | 'janela-basculante' | 'portao' | 'guarda-corpo';
  largura: number;
  altura: number;
  qtd: number;
  area: number;
}

export interface ItemCobertura {
  id: string;
  tipo: 'telha-ceramica' | 'estrutura-metalica' | 'estrutura-madeira' | 'calha';
  dimensao: number;
  unidade: 'm²' | 'm' | 'un';
  qtd: number;
  total: number;
}

export interface ItemPergolado {
  id: string;
  tipo: 'pergolado-madeira' | 'pergolado-metalico' | 'trelica';
  dimensao: number;
  unidade: 'm²' | 'm' | 'un';
  qtd: number;
  total: number;
}

export interface ItemInstalacao {
  id: string;
  disciplina: 'hidrossanitario' | 'eletrico' | 'pecas-sanitarias';
  item: string;
  qtd: number;
  unidade: string;
}

export interface ItemPaisagismo {
  id: string;
  item: string;
  qtd: number;
  unidade: string;
}

export interface ItemResumoConsolidado {
  disciplina: string;
  servico: string;
  unidade: string;
  qtdCalculada: number;
  margemPerda: number;
  qtdComPerda: number;
  produtividade: number; // h por unidade
  duracaoHoras: number;
}

export interface RegraAuditoria {
  id: string;
  titulo: string;
  status: 'ok' | 'alerta' | 'pendente';
  mensagem: string;
  detalhe?: string;
}

export interface ParametrosCalculo {
  reaproveitamentoSolo: number; // %
  acoFundacao: number; // kg/m³
  acoEstrutura: number; // kg/m³
  tempoSolda: number; // h/kg
}

export interface MargensPerda {
  fundacoes: number;
  estrutura: number;
  arquitetonico: number;
  cobertura: number;
  esquadrias: number;
  instalacoes: number;
  paisagismo: number;
}

export const CHECKLIST_INSTALACOES_GUIA = [
  { id: 'c1', label: 'Tubulação de água fria (PVC Soldável)', disciplina: 'hidrossanitario' },
  { id: 'c2', label: 'Tubulação de esgoto primário e secundário', disciplina: 'hidrossanitario' },
  { id: 'c3', label: 'Caixas sifonadas e ralos secos', disciplina: 'hidrossanitario' },
  { id: 'c4', label: 'Caixa de gordura e de inspeção', disciplina: 'hidrossanitario' },
  { id: 'c5', label: 'Eletrodutos corrugados / rígidos em laje e parede', disciplina: 'eletrico' },
  { id: 'c6', label: 'Cabos flexíveis (circuitos de iluminação e tomadas)', disciplina: 'eletrico' },
  { id: 'c7', label: 'Quadro de Distribuição de Circuitos (QDC) e disjuntores', disciplina: 'eletrico' },
  { id: 'c8', label: 'Pontos de tomada (TUG e TUE) e interruptores', disciplina: 'eletrico' },
  { id: 'c9', label: 'Bacias sanitárias com caixa acoplada', disciplina: 'pecas-sanitarias' },
  { id: 'c10', label: 'Lavatórios e cubas de inox com bancadas', disciplina: 'pecas-sanitarias' },
  { id: 'c11', label: 'Metais, torneiras e registros de gaveta/pressão', disciplina: 'pecas-sanitarias' },
  { id: 'c12', label: 'Chuveiros e duchas higiênicas', disciplina: 'pecas-sanitarias' },
];
