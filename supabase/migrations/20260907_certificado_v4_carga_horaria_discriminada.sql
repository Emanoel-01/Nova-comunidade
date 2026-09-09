-- Migration: Certificado v4 - Carga Horária Discriminada e Ajustes de Certificado
-- Data: 2026-09-07

-- 1. Adiciona coluna JSONB carga_horaria_discriminada na tabela cursos
ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS carga_horaria_discriminada jsonb;

COMMENT ON COLUMN public.cursos.carga_horaria_discriminada IS 'Discriminação detalhada de carga horária (lista JSON: [{"atividade": "...", "horas": "..."}])';

-- 2. Atualiza a RPC de verificação pública para retornar também a discriminação caso exista
CREATE OR REPLACE FUNCTION public.verificar_certificado_publico(p_codigo text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res json;
  v_codigo_limpo text;
BEGIN
  v_codigo_limpo := UPPER(TRIM(p_codigo));

  IF v_codigo_limpo IS NULL OR v_codigo_limpo = '' THEN
    RETURN json_build_object(
      'valido', false,
      'mensagem', 'Código de verificação não informado.'
    );
  END IF;

  SELECT json_build_object(
    'valido', true,
    'codigo_verificacao', m.codigo_verificacao,
    'nome_aluno', COALESCE(p.full_name, 'Membro da Comunidade'),
    'nome_curso', c.titulo,
    'data_emissao', m.certificado_emitido_em,
    'carga_horaria', COALESCE(c.carga_horaria_certificado, ''),
    'carga_horaria_discriminada', c.carga_horaria_discriminada,
    'texto_normativo', COALESCE(c.texto_certificado, ''),
    'modulo_predial', COALESCE(c.modulo_predial_vinculado, '')
  )
  INTO v_res
  FROM public.cursos_matriculas m
  JOIN public.cursos c ON c.id = m.curso_id
  JOIN public.profissionais p ON p.id = m.profissional_id
  WHERE UPPER(m.codigo_verificacao) = v_codigo_limpo
    AND m.certificado_emitido_em IS NOT NULL
  LIMIT 1;

  IF v_res IS NULL THEN
    RETURN json_build_object(
      'valido', false,
      'mensagem', 'Certificado não localizado ou ainda não emitido. Verifique o código digitado.'
    );
  END IF;

  RETURN v_res;
END;
$$;
