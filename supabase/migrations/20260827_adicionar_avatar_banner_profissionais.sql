-- Migration: Adicionar colunas avatar_url e banner_url na tabela profissionais
-- Frente 2/7: Avatar e Banner de Perfil da Comunidade Nova

ALTER TABLE public.profissionais
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS banner_url text;

COMMENT ON COLUMN public.profissionais.avatar_url IS 'URL da foto de perfil/avatar do profissional no storage';
COMMENT ON COLUMN public.profissionais.banner_url IS 'URL da imagem de banner/capa do perfil do profissional no storage';
