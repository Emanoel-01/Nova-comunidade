-- Migration: 20260903_frente3_pecas_tecnicas_engenharia.sql
-- Frente 3: Peças Técnicas de Engenharia (Viabiliza IA)
-- Adiciona colunas para orçamentação por macroetapa, cronograma físico-financeiro em curva S e memorial descritivo

alter table projetos_credito
  add column if not exists macroetapas_orcamento jsonb,
  add column if not exists cronograma_obra_curva_s jsonb,
  add column if not exists memorial_descritivo jsonb;

comment on column projetos_credito.macroetapas_orcamento is 'Discriminação do orçamento por macroetapa técnica (percentuais e valores)';
comment on column projetos_credito.cronograma_obra_curva_s is 'Cronograma físico-financeiro com distribuição sigmoide em curva S e evolução de juros de obra';
comment on column projetos_credito.memorial_descritivo is 'Memorial descritivo estruturado de materiais, sistemas construtivos e normas de desempenho';
