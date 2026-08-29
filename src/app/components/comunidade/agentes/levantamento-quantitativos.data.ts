export interface BitolaAcoConfig {
  bitola: string;
  bitolaNum: number;
  pesoLinear: number; // kg/m
  descricao: string;
}

export const TABELA_BITOLAS_PADRAO: BitolaAcoConfig[] = [
  { bitola: '3.4mm', bitolaNum: 3.4, pesoLinear: 0.07, descricao: '3,4 mm (CA-60)' },
  { bitola: '4.2mm', bitolaNum: 4.2, pesoLinear: 0.11, descricao: '4,2 mm (CA-60)' },
  { bitola: '6.3mm', bitolaNum: 6.3, pesoLinear: 0.25, descricao: '6,3 mm (CA-50)' },
  { bitola: '8.0mm', bitolaNum: 8.0, pesoLinear: 0.40, descricao: '8,0 mm (CA-50)' },
  { bitola: '10.0mm', bitolaNum: 10.0, pesoLinear: 0.63, descricao: '10,0 mm (CA-50)' },
  { bitola: '12.5mm', bitolaNum: 12.5, pesoLinear: 1.00, descricao: '12,5 mm (CA-50)' },
  { bitola: '16.0mm', bitolaNum: 16.0, pesoLinear: 1.60, descricao: '16,0 mm (CA-50)' },
  { bitola: '20.0mm', bitolaNum: 20.0, pesoLinear: 2.50, descricao: '20,0 mm (CA-50)' },
  { bitola: '22.3mm', bitolaNum: 22.3, pesoLinear: 3.00, descricao: '22,3 mm (CA-50)' },
  { bitola: '25.0mm', bitolaNum: 25.0, pesoLinear: 4.00, descricao: '25,0 mm (CA-50)' },
  { bitola: '32.0mm', bitolaNum: 32.0, pesoLinear: 6.30, descricao: '32,0 mm (CA-50)' }
];

// ==================== 8 SISTEMAS DE FUNDAÇÃO E ESTRUTURA ====================

// 1. Baldrame
export interface ItemBaldrame {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  profundidade: number; // P (m)
  qtd: number;
  espessuraLastro: number; // default 0.05
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = Qtd × (C × H × 2)
  escavacao: number; // m³ = (L + 0.6) × P × C × Qtd
  lastro: number; // m³ = (L + 0.1) × C × EspessuraLastro × Qtd
  reaterro: number; // m³ = Escavação − Concreto − Lastro
  botaFora: number; // m³ = (Escavação × 1.3) − Concreto − Lastro
  aco: number; // kg
}

// 2. Blocos de Fundação
export interface ItemBloco {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  profundidade: number; // P (m)
  qtd: number;
  espessuraLastro: number; // default 0.05
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = Qtd × (C × H × 2 + L × H × 2)
  escavacao: number; // m³ = (L + 0.6) × P × C × Qtd
  lastro: number; // m³ = (L + 0.1) × C × EspessuraLastro × Qtd
  reaterro: number; // m³ = Escavação − Concreto − Lastro
  botaFora: number; // m³ = (Escavação × 1.3) − Concreto − Lastro
  aco: number; // kg
}

// 3. Sapatas
export interface ItemSapata {
  id: string;
  nome?: string;
  larguraBase: number; // Lb (m)
  comprimentoBase: number; // Cb (m)
  larguraFuste: number; // Lf (m)
  comprimentoFuste: number; // Cf (m)
  alturaTronco: number; // H (m)
  alturaBase: number; // B (m)
  profundidade: number; // P (m)
  qtd: number;
  espessuraLastro: number; // default 0.05
  concreto: number; // m³ = (H/6 × ((2×Lb+Lf)×Cb + (2×Lf+Lb)×Cf) + Lb×Cb×B) × Qtd
  forma: number; // m² = ((Cb+Cf) × √( (Cb/2−Cf/2)² + H² ) + (Lb+Lf) × √( (Lb/2−Lf/2)² + H² ) + (Lb+Cb) × 2 × B) × Qtd
  escavacao: number; // m³ = (Lb + 0.6) × (Cb + 0.6) × P × Qtd
  lastro: number; // m³ = (Lb + 0.2) × (Cb + 0.2) × Qtd × EspessuraLastro
  reaterro: number; // m³ = Escavação − Concreto − Lastro
  botaFora: number; // m³ = (Escavação × 1.3) − Concreto − Lastro
  aco: number; // kg
}

// 4. Radier
export interface ItemRadier {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  profundidade: number; // P (m)
  qtd: number;
  espessuraLastro: number; // default 0.05
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = Qtd × (C × H × 2 + L × H × 2)
  escavacao: number; // m³ = (L + 0.6) × P × C × Qtd
  lastro: number; // m³ = L × C × 0.05 × Qtd
  reaterro: number; // m³ = Escavação − Concreto
  botaFora: number; // m³ = (Escavação × 1.3) − Concreto
  aco: number; // kg
}

// 5. Tubulões
export interface ItemTubulao {
  id: string;
  nome?: string;
  diametroFuste: number; // Df (m)
  alturaFuste: number; // Hf (m)
  diametroBase: number; // Db (m)
  alturaBase: number; // Hb (m)
  alturaB: number; // b (m) - porção cilíndrica da base
  qtd: number;
  concreto: number; // m³ = (π×Db²/4×b + 1/3×π×(Hb−b)×(Db²/4 + Db×Df/4 + Df²/4) + π×Df²/4×Hf) × Qtd
  escavacao: number; // m³ = Concreto
  botaFora: number; // m³ = Escavação × 1.3
  aco: number; // kg
}

// 6. Pilares
export interface ItemPilar {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  qtd: number;
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = (C + L) × 2 × H × Qtd
  aco: number; // kg
  solda: number; // h = Aço × tempoSolda
}

// 7. Vigas (Superiores)
export interface ItemViga {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  alturaFundoViga: number; // Hfv (m)
  qtd: number;
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = (L + 2×H) × C × Qtd
  escoramento: number; // m³ = L × Hfv × C × Qtd (volume de escoramento sob a viga)
  aco: number; // kg
  solda: number; // h = Aço × tempoSolda
}

// 8. Lajes
export interface ItemLaje {
  id: string;
  nome?: string;
  largura: number; // L (m)
  altura: number; // H (m)
  comprimento: number; // C (m)
  peDireito: number; // Pd (m)
  qtd: number;
  concreto: number; // m³ = Qtd × L × H × C
  forma: number; // m² = Qtd × L × C
  escoramento: number; // m³ = Forma × Pd
  aco: number; // kg
  solda: number; // h = Aço × tempoSolda
}

// Interfaces legadas (para compatibilidade segura com sessões antigas)
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

// ==================== 4 SISTEMAS REAIS DE INSTALAÇÕES PREDIAIS ====================

export type SistemaInstalacao =
  | 'distribuicao-eletrica'
  | 'prumadas-eletricas'
  | 'esgoto-pluvial'
  | 'hidraulica';

export interface ItemInstalacaoPredial {
  id: string;
  sistema: SistemaInstalacao;
  categoria: string; // uma das categorias específicas de cada sistema
  especificacao: string; // texto livre, ex: "PVC Ø 3/4\""
  local?: string; // texto livre, opcional
  quantidade: number;
  unidade: string; // 'm' ou 'un', conforme a categoria
  margemPerda: number; // % já resolvido pela categoria no momento do lançamento (ex: 5 para 5%)
  quantidadeComPerda: number; // calculado: quantidade * (1 + margemPerda / 100)
}

export interface CategoriaConfig {
  nome: string;
  percentualPerda: number;
  unidadePadrao: string;
}

export const CATEGORIAS_POR_SISTEMA: Record<SistemaInstalacao, CategoriaConfig[]> = {
  'distribuicao-eletrica': [
    { nome: 'Eletrodutos', percentualPerda: 0.05, unidadePadrao: 'm' },
    { nome: 'Eletrocalhas e Perfilados', percentualPerda: 0.01, unidadePadrao: 'm' },
    { nome: 'Fios e cabos elétricos', percentualPerda: 0.09, unidadePadrao: 'm' },
    { nome: 'Conduletes', percentualPerda: 0.20, unidadePadrao: 'un' },
    { nome: 'Tomadas', percentualPerda: 0.30, unidadePadrao: 'un' },
    { nome: 'Interruptores', percentualPerda: 0.10, unidadePadrao: 'un' },
    { nome: 'Luminárias', percentualPerda: 0.07, unidadePadrao: 'un' },
  ],
  'prumadas-eletricas': [
    { nome: 'Eletrodutos', percentualPerda: 0.25, unidadePadrao: 'm' },
    { nome: 'Eletrocalhas e Perfilados', percentualPerda: 0.02, unidadePadrao: 'm' },
    { nome: 'Fios e cabos elétricos', percentualPerda: 0.09, unidadePadrao: 'm' },
    { nome: 'Caixas', percentualPerda: 0.20, unidadePadrao: 'un' },
  ],
  'esgoto-pluvial': [
    { nome: 'Tubulação PVC', percentualPerda: 0.05, unidadePadrao: 'm' },
    { nome: 'Conexões PVC', percentualPerda: 0.01, unidadePadrao: 'un' },
    { nome: 'Tubulação Ferro Fundido', percentualPerda: 0.09, unidadePadrao: 'm' },
    { nome: 'Conexões Ferro Fundido', percentualPerda: 0.20, unidadePadrao: 'un' },
    { nome: 'Acessórios para Esgoto', percentualPerda: 0.20, unidadePadrao: 'un' },
  ],
  'hidraulica': [
    { nome: 'Tubulação PVC', percentualPerda: 0.05, unidadePadrao: 'm' },
    { nome: 'Conexões PVC', percentualPerda: 0.01, unidadePadrao: 'un' },
    { nome: 'Tubulação Cobre', percentualPerda: 0.09, unidadePadrao: 'm' },
    { nome: 'Conexões Cobre', percentualPerda: 0.20, unidadePadrao: 'un' },
    { nome: 'Registros e Válvulas', percentualPerda: 0.20, unidadePadrao: 'un' },
    { nome: 'Diversos', percentualPerda: 0.02, unidadePadrao: 'un' },
  ],
};

// Interface legada mantida para retrocompatibilidade
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

// Percentuais de perda específicos por sistema e serviço conforme planilha real do Sienge
export interface PerdasFundaçõesPadrao {
  concreto: number; // 5%
  forma: number; // 1%
  escavacao: number; // 9%
  reaterro: number; // 20%
  botaFora: number; // 30%
  lastro: number; // 10%
  aco: number; // 10%
  solda: number; // 10%
}

export interface PerdasTubuloesPadrao {
  concreto: number; // 5%
  escavacao: number; // 9%
  botaFora: number; // 30%
}

export interface PerdasEstruturaPadrao {
  concreto: number; // 5%
  forma: number; // 1%
  escoramento: number; // 9%
  aco: number; // 9%
  solda: number; // 9%
}

export interface ParametrosCalculo {
  espessuraLastroDefault: number; // m (default: 0.05)
  tempoSolda: number; // h/kg (default: 0.05)
  // Perdas editáveis Fundações comuns (Baldrame, Blocos, Sapatas, Radier)
  perdaConcretoFundacao: number; // 5%
  perdaFormaFundacao: number; // 1%
  perdaEscavacaoFundacao: number; // 9%
  perdaReaterroFundacao: number; // 20%
  perdaBotaForaFundacao: number; // 30%
  perdaLastroFundacao: number; // 10%
  perdaAcoFundacao: number; // 10%
  perdaSoldaFundacao: number; // 10%
  // Perdas Tubulões
  perdaConcretoTubulao: number; // 5%
  perdaEscavacaoTubulao: number; // 9%
  perdaBotaForaTubulao: number; // 30%
  // Perdas Estrutura (Pilares, Vigas, Lajes)
  perdaConcretoEstrutura: number; // 5%
  perdaFormaEstrutura: number; // 1%
  perdaEscoramentoEstrutura: number; // 9%
  perdaAcoEstrutura: number; // 9%
  perdaSoldaEstrutura: number; // 9%
  // Outras disciplinas
  perdaArquitetonico: number; // 8%
  perdaCobertura: number; // 5%
  perdaEsquadrias: number; // 0%
  perdaInstalacoes: number; // 7%
  perdaPaisagismo: number; // 5%
}

export interface MargensPerda {
  baldrame: number;
  blocos: number;
  sapatas: number;
  radier: number;
  tubuloes: number;
  pilares: number;
  vigas: number;
  lajes: number;
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
