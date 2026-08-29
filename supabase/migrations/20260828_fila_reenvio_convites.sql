-- ==============================================================================
-- Migration: Tabela reenvios_convite e Rastreio de Reenvio de Convites em Lote
-- Frente 2/3 (Revisado): Fila de Reenvio de Convite em Lotes Controlados + Rastreio
-- ==============================================================================

-- 1. Criação da tabela reenvios_convite
CREATE TABLE IF NOT EXISTS public.reenvios_convite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  template_chave text,
  enviado_por uuid REFERENCES public.profissionais(id) ON DELETE SET NULL
);

-- 2. Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_reenvios_convite_prof ON public.reenvios_convite(profissional_id);
CREATE INDEX IF NOT EXISTS idx_reenvios_convite_data ON public.reenvios_convite(enviado_em DESC);
CREATE INDEX IF NOT EXISTS idx_reenvios_convite_template ON public.reenvios_convite(template_chave);

-- 3. Habilitação de RLS
ALTER TABLE public.reenvios_convite ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (apenas Administradores autenticados)
DROP POLICY IF EXISTS "Admins podem visualizar reenvios_convite" ON public.reenvios_convite;
CREATE POLICY "Admins podem visualizar reenvios_convite"
  ON public.reenvios_convite FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  );

DROP POLICY IF EXISTS "Admins podem inserir reenvios_convite" ON public.reenvios_convite;
CREATE POLICY "Admins podem inserir reenvios_convite"
  ON public.reenvios_convite FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permissoes_acesso
      WHERE profissional_id = auth.uid()
        AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
        AND liberado = true
    )
  );

-- 5. Atualização da função RPC listar_profissionais_com_ultimo_acesso para incluir contagem de reenvios
CREATE OR REPLACE FUNCTION public.listar_profissionais_com_ultimo_acesso()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  professional_title text,
  avatar_url text,
  banner_url text,
  bio text,
  nivel_atual text,
  licenca_tipo text,
  licenca_validade timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  total_reenvios bigint,
  ultimo_reenvio_em timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Verificar se o solicitante possui permissão de administrador
  IF NOT EXISTS (
    SELECT 1 FROM public.permissoes_acesso
    WHERE profissional_id = auth.uid()
      AND modulo IN ('admin', 'admin_comunidade', 'admin_predial')
      AND liberado = true
  ) THEN
    RAISE EXCEPTION 'Acesso não autorizado: permissão de administrador necessária.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.professional_title,
    p.avatar_url,
    p.banner_url,
    p.bio,
    p.nivel_atual,
    p.licenca_tipo,
    p.licenca_validade,
    p.created_at,
    p.updated_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    COALESCE(r.cnt, 0)::bigint AS total_reenvios,
    r.ultimo_envio AS ultimo_reenvio_em
  FROM public.profissionais p
  LEFT JOIN auth.users u ON u.id = p.id
  LEFT JOIN (
    SELECT 
      rc.profissional_id, 
      COUNT(*)::bigint AS cnt, 
      MAX(rc.enviado_em) AS ultimo_envio
    FROM public.reenvios_convite rc
    GROUP BY rc.profissional_id
  ) r ON r.profissional_id = p.id
  ORDER BY p.full_name ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.listar_profissionais_com_ultimo_acesso() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_profissionais_com_ultimo_acesso() TO authenticated;
