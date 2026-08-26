-- Migration: Adiciona colunas para Licença Global em profissionais
-- licenca_tipo: '6_meses' | '1_ano' | 'vitalicia' | 'personalizada'
-- licenca_validade: null quando licenca_tipo = 'vitalicia', preenchida nos demais casos

ALTER TABLE public.profissionais
  ADD COLUMN IF NOT EXISTS licenca_validade date,
  ADD COLUMN IF NOT EXISTS licenca_tipo text;

COMMENT ON COLUMN public.profissionais.licenca_tipo IS 'Tipo de licença global: 6_meses, 1_ano, vitalicia, personalizada';
COMMENT ON COLUMN public.profissionais.licenca_validade IS 'Data de expiração da licença global. NULL para licença vitalícia.';
