-- Migration: Ajustes no Certificado, Separação de Campos e Verificação Pública
-- Data: 2026-08-27

-- 1. Coluna de carga horária no cadastro de cursos
ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS carga_horaria_certificado text;

COMMENT ON COLUMN public.cursos.carga_horaria_certificado IS 'Carga horária certificada do curso (ex: 20 horas, 40 horas)';

-- 2. Coluna de código de verificação único e persistido nas matrículas
ALTER TABLE public.cursos_matriculas
  ADD COLUMN IF NOT EXISTS codigo_verificacao text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_cursos_matriculas_codigo_verificacao 
  ON public.cursos_matriculas (codigo_verificacao);

COMMENT ON COLUMN public.cursos_matriculas.codigo_verificacao IS 'Código de verificação de autenticidade no formato AMTECH-XXXXXXXX';

-- 3. Função RPC de verificação pública e segura de certificados (SECURITY DEFINER)
-- Retorna apenas os dados estritamente necessários para validação pública, sem dados sensíveis
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
      'mensagem', 'Código não encontrado. Verifique se digitou corretamente.'
    );
  END IF;

  RETURN v_res;
END;
$$;

-- Permite que usuários anônimos e autenticados consultem a autenticidade do certificado
GRANT EXECUTE ON FUNCTION public.verificar_certificado_publico(text) TO anon, authenticated, service_role;
