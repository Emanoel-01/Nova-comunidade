-- Migration: 20260902_frente6_trilhas_reforma_condominio.sql
-- Frente 6: Suporte às trilhas de Reforma/Ampliação PF e Crédito Condominial

-- 1. Adiciona coluna segmento na tabela de linhas_credito
alter table linhas_credito
  add column if not exists segmento text default 'pessoa_fisica_construcao';

comment on column linhas_credito.segmento is 'Segmento de atuação: pessoa_fisica_construcao, pessoa_fisica_reforma ou condominio';

-- 2. Adiciona colunas de suporte a projetos de reforma e condomínio na tabela projetos_credito
alter table projetos_credito
  add column if not exists tipo_intervencao text,
  add column if not exists arrecadacao_mensal_condominio numeric,
  add column if not exists percentual_inadimplencia_condominio numeric,
  add column if not exists valor_obra_indicado_laudo numeric,
  add column if not exists laudo_inspecao_confirmado boolean default false,
  add column if not exists ata_age_confirmada boolean default false;

comment on column projetos_credito.tipo_intervencao is 'Tipo de intervenção para reforma/condomínio: reforma_sem_ampliacao, ampliacao_com_area_nova, manutencao_predial';
comment on column projetos_credito.arrecadacao_mensal_condominio is 'Arrecadação mensal do condomínio em R$';
comment on column projetos_credito.percentual_inadimplencia_condominio is 'Percentual médio de inadimplência do condomínio em %';
comment on column projetos_credito.valor_obra_indicado_laudo is 'Valor da obra indicado no laudo de inspeção predial em R$';
