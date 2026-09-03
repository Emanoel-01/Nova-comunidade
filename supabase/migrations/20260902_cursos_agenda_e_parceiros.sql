-- Migration: Adicionar campos de agenda na tabela cursos e criar tabelas de parceiros
-- Cursos (Agenda Pública), Professores Parceiros, Softwares Parceiros e Empresas Parceiras

-- 1.1 Estender a tabela "cursos" com campos da agenda pública
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS data_inicio date;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS data_fim date;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS formato text
  CHECK (formato IN ('gravado', 'ao_vivo', 'presencial_hibrido'));
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS local text;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS imagem_capa_url text;
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS exibir_na_agenda boolean NOT NULL DEFAULT false;

-- Índice para busca rápida de cursos na agenda pública
CREATE INDEX IF NOT EXISTS idx_cursos_exibir_agenda ON public.cursos(exibir_na_agenda, data_inicio);

-- 1.2 Criar tabela "professores_parceiros"
CREATE TABLE IF NOT EXISTS public.professores_parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  disciplina_area text,
  foto_url text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_professores_parceiros_ordem ON public.professores_parceiros(ativo, ordem);

-- 1.3 Criar tabela "softwares_parceiros"
CREATE TABLE IF NOT EXISTS public.softwares_parceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  logo_url text,
  link_site text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_softwares_parceiros_ordem ON public.softwares_parceiros(ativo, ordem);

-- 1.4 Criar tabela "empresas_parceiras"
CREATE TABLE IF NOT EXISTS public.empresas_parceiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  logo_url text,
  link_site text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empresas_parceiras_ordem ON public.empresas_parceiras(ativo, ordem);

-- 1.5 Habilitar RLS nas 3 tabelas novas
ALTER TABLE public.professores_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.softwares_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_parceiras ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para professores_parceiros
-- Leitura pública para o site institucional exibir
DROP POLICY IF EXISTS "Permitir leitura publica de professores_parceiros" ON public.professores_parceiros;
CREATE POLICY "Permitir leitura publica de professores_parceiros"
  ON public.professores_parceiros
  FOR SELECT
  TO public
  USING (true);

-- Escrita restrita a administradores
DROP POLICY IF EXISTS "Permitir admin gerenciar professores_parceiros" ON public.professores_parceiros;
CREATE POLICY "Permitir admin gerenciar professores_parceiros"
  ON public.professores_parceiros
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  );

-- Políticas de RLS para softwares_parceiros
DROP POLICY IF EXISTS "Permitir leitura publica de softwares_parceiros" ON public.softwares_parceiros;
CREATE POLICY "Permitir leitura publica de softwares_parceiros"
  ON public.softwares_parceiros
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Permitir admin gerenciar softwares_parceiros" ON public.softwares_parceiros;
CREATE POLICY "Permitir admin gerenciar softwares_parceiros"
  ON public.softwares_parceiros
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  );

-- Políticas de RLS para empresas_parceiras
DROP POLICY IF EXISTS "Permitir leitura publica de empresas_parceiras" ON public.empresas_parceiras;
CREATE POLICY "Permitir leitura publica de empresas_parceiras"
  ON public.empresas_parceiras
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Permitir admin gerenciar empresas_parceiras" ON public.empresas_parceiras;
CREATE POLICY "Permitir admin gerenciar empresas_parceiras"
  ON public.empresas_parceiras
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  );
