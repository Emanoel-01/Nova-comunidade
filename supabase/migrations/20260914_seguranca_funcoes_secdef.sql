-- =====================================================================
-- 20260914_seguranca_funcoes_secdef.sql
--
-- Bloco 1 da Auditoria AmorimTech — endurecimento das funções do schema
-- public. Aplicado no projeto kvesxatnmgvflqzuqgrz em 14/09/2026.
--
-- Este arquivo registra, de forma reproduzível, alterações que já foram
-- executadas diretamente no banco. É idempotente: pode ser reaplicado
-- sem efeito colateral.
--
-- Contexto do problema:
--   O PostgreSQL concede EXECUTE ao papel PUBLIC em toda função criada.
--   Como anon e authenticated herdam de PUBLIC, 37 funções SECURITY
--   DEFINER eram chamáveis sem autenticação via /rest/v1/rpc/, entre
--   elas resetar_pontos_ano() e listar_profissionais_com_ultimo_acesso().
--   Além disso, 28 funções tinham search_path mutável.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Remover o acesso herdado de PUBLIC e de anon
--
-- Exceção: verificar_certificado_publico serve a rota /verificar-certificado,
-- que é pública por desenho e não exige autenticação.
--
-- service_role recebe concessão explícita para que as Edge Functions
-- continuem operando após a remoção do PUBLIC.
-- ---------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public'
      and p.prosecdef
      and p.proname <> 'verificar_certificado_publico'
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    execute format('grant  execute on function %s to service_role',   r.sig);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 2. Devolver acesso ao usuário autenticado apenas onde o cliente chama
--
-- Levantado por varredura de `.rpc('...')` nos repositórios
-- Nova-comunidade e Replica-Predial-4.0.
-- ---------------------------------------------------------------------
grant execute on function public.registrar_atividade_diaria(text)                    to authenticated;
grant execute on function public.modulo_curso_liberado(uuid, uuid)                   to authenticated;
grant execute on function public.listar_profissionais_com_ultimo_acesso()            to authenticated;
grant execute on function public.emitir_certificado(uuid)                            to authenticated;
grant execute on function public.creditar_pontos_leitura_artigo(uuid, text)          to authenticated;
grant execute on function public.contar_analises_licitacao_mes_atual(uuid)           to authenticated;
grant execute on function public.contar_mensagens_chat_licitacao_mes_atual(uuid)     to authenticated;


-- ---------------------------------------------------------------------
-- 3. Remover o acesso do usuário autenticado onde ele não é necessário
--
--   * funções de gatilho: disparadas pelo próprio PostgreSQL, nunca por RPC
--   * funções agendadas: executadas pelo pg_cron como postgres (superusuário),
--     portanto não afetadas por esta revogação
--   * contar_evte_analises_ano_atual: sem chamada no cliente
--
-- NÃO revogar de: eh_admin_comunidade, eh_admin_predial, tem_acesso_material,
-- tem_licenca_ativa, tem_permissao_curso. Essas são usadas dentro de
-- expressões de policy de RLS, que executam no contexto de quem consulta.
-- Revogá-las quebraria as consultas do usuário autenticado.
-- ---------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public'
      and p.prosecdef
      and ( p.prorettype = 'trigger'::regtype
            or p.proname in (
                 'resetar_pontos_semana',
                 'resetar_pontos_mes',
                 'resetar_pontos_ano',
                 'incrementar_pontos_ficticios',
                 'lembrar_atualizar_cub',
                 'lembrar_atualizar_indices_sinaenco',
                 'publicar_posts_agendados',
                 'fechar_ranking_mensal',
                 'fechar_ranking_anual',
                 'contar_evte_analises_ano_atual'
               ) )
  loop
    execute format('revoke execute on function %s from authenticated', r.sig);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. Fixar search_path em todas as funções do schema
--
-- `extensions` é incluído de propósito: funções que chamam gen_random_uuid()
-- sem qualificar dependem desse schema no Supabase. Fixar apenas `public`
-- quebraria essas funções em tempo de execução.
-- ---------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public'
      and p.prokind = 'f'
      and ( p.proconfig is null
            or not exists (
                 select 1 from unnest(p.proconfig) c where c like 'search_path=%'
               ) )
  loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', r.sig);
  end loop;
end $$;


-- =====================================================================
-- Verificação — resultado esperado após a aplicação:
--
--   anon com EXECUTE ............................ 1  (verificar_certificado_publico)
--   authenticated com EXECUTE .................. 13  (7 do cliente + 6 auxiliares de RLS)
--   funções com search_path mutável ............. 0
--
-- select
--   count(*) filter (where has_function_privilege('anon', p.oid, 'EXECUTE'))          as anon,
--   count(*) filter (where has_function_privilege('authenticated', p.oid, 'EXECUTE')) as autenticado
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.prosecdef;
--
--
-- PENDENTE, fora do alcance de SQL:
--   Ativar a proteção contra senha vazada em Authentication, no painel
--   do Supabase. Exige login e não pode ser feito por migração.
-- =====================================================================
