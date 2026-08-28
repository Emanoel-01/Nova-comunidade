-- Migration: Tabela de Perfis de Acesso Customizados (Moldes Reutilizáveis de Permissão)
-- Frente 5/7: Gestão de Usuários em Massa, Perfis Customizados e E-mail Automático

CREATE TABLE IF NOT EXISTS public.perfis_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  modulos jsonb NOT NULL DEFAULT '[]'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Índice para ordenação e busca por nome
CREATE INDEX IF NOT EXISTS idx_perfis_acesso_nome ON public.perfis_acesso(nome);

COMMENT ON TABLE public.perfis_acesso IS 'Moldes reutilizáveis de conjuntos de permissões para profissionais';
COMMENT ON COLUMN public.perfis_acesso.modulos IS 'Array JSON contendo os módulos liberados ex: [{"produto":"comunidade","modulo":"forum"}]';

-- Habilitar RLS
ALTER TABLE public.perfis_acesso ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- 1. Leitura: Usuários autenticados podem ler para listar perfis disponíveis
DROP POLICY IF EXISTS "Permitir leitura de perfis para autenticados" ON public.perfis_acesso;
CREATE POLICY "Permitir leitura de perfis para autenticados"
  ON public.perfis_acesso
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Inserção / Atualização / Exclusão: Permitido para Administradores
DROP POLICY IF EXISTS "Permitir admin gerenciar perfis de acesso" ON public.perfis_acesso;
CREATE POLICY "Permitir admin gerenciar perfis de acesso"
  ON public.perfis_acesso
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

-- Inserir Perfis de Acesso Iniciais Padrão
INSERT INTO public.perfis_acesso (nome, descricao, modulos)
VALUES 
  (
    'Membro Trainee',
    'Acesso base aos recursos da comunidade: Fórum, Vagas, Materiais e Eventos.',
    '[
      {"produto":"comunidade","modulo":"forum"},
      {"produto":"comunidade","modulo":"vagas"},
      {"produto":"comunidade","modulo":"materiais"},
      {"produto":"comunidade","modulo":"eventos"}
    ]'::jsonb
  ),
  (
    'Perito Júnior',
    'Acesso à comunidade e agentes de quantitativos e checklist de licitação.',
    '[
      {"produto":"comunidade","modulo":"forum"},
      {"produto":"comunidade","modulo":"vagas"},
      {"produto":"comunidade","modulo":"materiais"},
      {"produto":"comunidade","modulo":"eventos"},
      {"produto":"comunidade","modulo":"checklist-licitacao"},
      {"produto":"comunidade","modulo":"levantamento-quantitativos"},
      {"produto":"predial4","modulo":"inspecao_predial"}
    ]'::jsonb
  ),
  (
    'Especialista 4.0',
    'Acesso completo a todos os módulos e agentes de IA da Comunidade e Predial 4.0.',
    '[
      {"produto":"comunidade","modulo":"forum"},
      {"produto":"comunidade","modulo":"vagas"},
      {"produto":"comunidade","modulo":"materiais"},
      {"produto":"comunidade","modulo":"eventos"},
      {"produto":"comunidade","modulo":"reajuste-contrato"},
      {"produto":"comunidade","modulo":"biblioteca-prompts"},
      {"produto":"comunidade","modulo":"skills-catalogo"},
      {"produto":"comunidade","modulo":"checklist-licitacao"},
      {"produto":"comunidade","modulo":"levantamento-quantitativos"},
      {"produto":"comunidade","modulo":"custos-viabilidade"},
      {"produto":"comunidade","modulo":"gerador-canteiro"},
      {"produto":"predial4","modulo":"inspecao_predial"},
      {"produto":"predial4","modulo":"vistoria_cautelar"}
    ]'::jsonb
  ),
  (
    'Administrador Geral',
    'Acesso irrestrito incluindo todos os módulos, agentes e ferramentas administrativas.',
    '[
      {"produto":"comunidade","modulo":"forum"},
      {"produto":"comunidade","modulo":"vagas"},
      {"produto":"comunidade","modulo":"materiais"},
      {"produto":"comunidade","modulo":"eventos"},
      {"produto":"comunidade","modulo":"reajuste-contrato"},
      {"produto":"comunidade","modulo":"biblioteca-prompts"},
      {"produto":"comunidade","modulo":"skills-catalogo"},
      {"produto":"comunidade","modulo":"checklist-licitacao"},
      {"produto":"comunidade","modulo":"levantamento-quantitativos"},
      {"produto":"comunidade","modulo":"custos-viabilidade"},
      {"produto":"comunidade","modulo":"gerador-canteiro"},
      {"produto":"comunidade","modulo":"admin_comunidade"},
      {"produto":"predial4","modulo":"inspecao_predial"},
      {"produto":"predial4","modulo":"vistoria_cautelar"},
      {"produto":"predial4","modulo":"admin_predial"}
    ]'::jsonb
  )
ON CONFLICT (nome) DO NOTHING;
