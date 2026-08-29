-- Migration: Rastreio de Primeiro Acesso de Usuários (auth.users.last_sign_in_at)
-- Função com SECURITY DEFINER para que administradores possam consultar o histórico de primeiro acesso dos usuários

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
  email_confirmed_at timestamptz
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
    u.email_confirmed_at
  FROM public.profissionais p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.full_name ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.listar_profissionais_com_ultimo_acesso() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_profissionais_com_ultimo_acesso() TO authenticated;
