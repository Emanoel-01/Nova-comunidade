-- Migration para suporte à Etapa 0: Estudo de Viabilidade Prévia de Crédito no Viabiliza IA

-- 1. Extensão da tabela projetos_credito
alter table projetos_credito
  add column if not exists data_nascimento_proponente text,
  add column if not exists situacao_lote text default 'a_adquirir',
  add column if not exists area_estimada_estudo_previo numeric default 140,
  add column if not exists padrao_construtivo_estudo_previo text default 'Normal',
  add column if not exists estudo_previo_concluido boolean default false,
  add column if not exists estudo_previo_gerado_em timestamptz,
  add column if not exists elegibilidade_resultado jsonb,
  add column if not exists projeto_aprovado_confirmado boolean default false,
  add column if not exists alvara_confirmado boolean default false,
  add column if not exists art_rrt_confirmado boolean default false;

-- 2. Extensão da tabela linhas_credito para parâmetros enriquecidos
alter table linhas_credito
  add column if not exists data_referencia date,
  add column if not exists fonte_url text,
  add column if not exists nota_fonte text default 'Estimativa de pesquisa de mercado — confirmar em agência antes de publicar',
  add column if not exists permite_fgts boolean default true,
  add column if not exists idade_meses_referencia integer,
  add column if not exists composicao_renda text,
  add column if not exists vantagem_principal text,
  add column if not exists gargalos_operacionais text;
