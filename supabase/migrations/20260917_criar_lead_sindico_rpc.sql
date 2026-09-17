-- ============================================================================
-- 20260917_criar_lead_sindico_rpc.sql
--
-- Alô, Síndico! — criação de lead com retorno mínimo (só o id).
--
-- MOTIVO: `criarLeadSindico` fazia .insert().select() direto na tabela, e por
-- isso existia a policy "Leitura pública para retorno após inserção" com
-- USING (true) para anon — o que permitia baixar a base inteira de leads com a
-- chave pública. Exposição de dado pessoal.
--
-- Trocar as colunas do .select() NÃO resolve: RLS é por linha, não por coluna.
-- Verificado em tabela de rascunho isolada:
--   SEM policy de SELECT  -> INSERT ... RETURNING id falha
--                            ("new row violates row-level security policy")
--   COM policy de SELECT  -> RETURNING id funciona
--
-- Esta função insere e devolve apenas o id, rodando como dona da tabela.
-- Com ela, `anon` não precisa de SELECT em alo_sindico_leads.
--
-- ESTADO: aplicado no projeto kvesxatnmgvflqzuqgrz em 17/09/2026.
-- ============================================================================

create or replace function public.criar_lead_sindico(
  p_nome            text,
  p_telefone        text,
  p_email           text,
  p_nome_condominio text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $fn$
declare
  v_id uuid;
begin
  -- A função é chamável por anônimo: tudo que entra é hostil até prova em contrário.
  if p_nome is null or length(btrim(p_nome)) < 2 then
    raise exception 'Nome inválido' using errcode = '22023';
  end if;
  if p_telefone is null or length(btrim(p_telefone)) < 8 then
    raise exception 'Telefone inválido' using errcode = '22023';
  end if;
  if p_email is null or btrim(p_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'E-mail inválido' using errcode = '22023';
  end if;

  insert into public.alo_sindico_leads (nome, telefone, email, nome_condominio, status)
  values (
    left(btrim(p_nome), 120),
    left(btrim(p_telefone), 30),
    left(lower(btrim(p_email)), 160),
    nullif(left(btrim(coalesce(p_nome_condominio, '')), 160), ''),
    'novo'
  )
  returning id into v_id;

  return v_id;   -- só o id. Nada mais sai desta função.
end;
$fn$;

-- O padrão do Postgres concede EXECUTE a PUBLIC. Revogar antes de conceder.
revoke all on function public.criar_lead_sindico(text, text, text, text) from public;
grant execute on function public.criar_lead_sindico(text, text, text, text) to anon, authenticated;

-- ============================================================================
-- PASSO SEGUINTE — rodar SOMENTE depois do deploy novo no ar e do formulário
-- do Alô Síndico testado ao vivo. Antes disso, este DROP quebra a captação.
-- ============================================================================
-- drop policy "Leitura pública para retorno após inserção" on public.alo_sindico_leads;
--
-- Teste de fechamento (deve dizer 0 leads, não 8):
-- create or replace function public._check_leads_anon() returns text
-- language plpgsql as $$
-- declare n int;
-- begin
--   set local role anon;
--   select count(*) into n from public.alo_sindico_leads;
--   set local role postgres;
--   return 'anon enxerga ' || n || ' leads';
-- exception when others then
--   set local role postgres;
--   return 'anon bloqueado: ' || SQLERRM;
-- end $$;
-- select public._check_leads_anon();
-- drop function public._check_leads_anon();
