export interface SkillCatalogo {
  id: string;
  nome: string;
  descricaoResumo: string;
  descricaoCompleta: string;
  categoria: string;
  linkDownload: string;
  compativelCom: ('claude-code' | 'claude-cowork' | 'claude-chat')[];
}

export const SKILLS_CATALOGO: SkillCatalogo[] = [
  {
    id: 'orcamento-executivo-obras',
    nome: 'Orçamento Executivo de Obras',
    descricaoResumo: 'Gera as 11 peças de um orçamento de obra à prova de auditoria.',
    descricaoCompleta: 'Cobre Quadro de Quantidades, Memória de Cálculo, Composições de Preço Unitário, Planilha Orçamentária, BDI (Acórdão TCU 2622/2013), Encargos Sociais, Cronograma Físico-Financeiro, Curva ABC, Mapa de Cotações, Critérios de Medição e Histograma de Recursos — seguindo SINAPI/SICRO, Lei 14.133/2021 e Decreto 7.983/2013. Funciona para o pacote completo ou para uma peça isolada (ex: só o cálculo de BDI).',
    categoria: 'Orçamento',
    linkDownload: 'LINK_DRIVE_PENDENTE_ORCAMENTO',
    compativelCom: ['claude-code', 'claude-cowork', 'claude-chat']
  },
  {
    id: 'projeto-arquitetura-amorim-tech',
    nome: 'Projeto Arquitetura Amorim Tech',
    descricaoResumo: 'Roteador de 21 fluxos para conduzir um projeto de arquitetura do briefing à entrega.',
    descricaoCompleta: 'Cobre todo o ciclo: captação de cliente, briefing, contrato, análise de terreno, programa de necessidades, viabilidade, memorial descritivo, compatibilização entre disciplinas, verificação de acessibilidade (NBR 9050) e desempenho (NBR 15575), planta humanizada, renders, quantitativo e orçamento preliminar por ambiente, e relatório de visita técnica. Funciona 100% por conversa — a cada uso, pergunta os dados e a identidade visual do escritório para montar os documentos.',
    categoria: 'Projetos',
    linkDownload: 'LINK_DRIVE_PENDENTE_PROJETOS',
    compativelCom: ['claude-code', 'claude-cowork', 'claude-chat']
  }
];
