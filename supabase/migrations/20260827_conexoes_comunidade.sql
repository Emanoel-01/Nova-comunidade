-- Migration: Tabela de conexões da comunidade (Seguir / Conexões entre membros)
-- Frente 3/7: Rede de Membros (Listagem + Seguir)

CREATE TABLE IF NOT EXISTS public.conexoes_comunidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  seguido_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_conexoes_seguidor_seguido UNIQUE (seguidor_id, seguido_id),
  CONSTRAINT chk_nao_seguir_a_si_mesmo CHECK (seguidor_id <> seguido_id)
);

-- Índices para buscas rápidas de seguidores e seguindo
CREATE INDEX IF NOT EXISTS idx_conexoes_seguidor_id ON public.conexoes_comunidade(seguidor_id);
CREATE INDEX IF NOT EXISTS idx_conexoes_seguido_id ON public.conexoes_comunidade(seguido_id);

-- Comentários da tabela e colunas
COMMENT ON TABLE public.conexoes_comunidade IS 'Conexões de seguimento e rede entre membros da comunidade';
COMMENT ON COLUMN public.conexoes_comunidade.seguidor_id IS 'ID do profissional que está seguindo';
COMMENT ON COLUMN public.conexoes_comunidade.seguido_id IS 'ID do profissional que está sendo seguido';

-- Habilitação de RLS
ALTER TABLE public.conexoes_comunidade ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- 1. Leitura aberta para qualquer usuário autenticado
DROP POLICY IF EXISTS "Permitir leitura de conexoes para autenticados" ON public.conexoes_comunidade;
CREATE POLICY "Permitir leitura de conexoes para autenticados"
  ON public.conexoes_comunidade
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Inserção restrita: o seguidor_id deve ser o próprio usuário logado (auth.uid())
DROP POLICY IF EXISTS "Permitir usuario autenticado seguir" ON public.conexoes_comunidade;
CREATE POLICY "Permitir usuario autenticado seguir"
  ON public.conexoes_comunidade
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seguidor_id);

-- 3. Exclusão restrita: o seguidor_id deve ser o próprio usuário logado (auth.uid())
DROP POLICY IF EXISTS "Permitir usuario deixar de seguir" ON public.conexoes_comunidade;
CREATE POLICY "Permitir usuario deixar de seguir"
  ON public.conexoes_comunidade
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seguidor_id);
