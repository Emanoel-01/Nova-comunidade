export interface ItemChecklistLicitacao {
  id: string;
  categoria: 'Habilitação Jurídica' | 'Regularidade Fiscal e Trabalhista' | 'Qualificação Econômico-Financeira' | 'Qualificação Técnica';
  item: string;
  obrigatorio: boolean;
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
