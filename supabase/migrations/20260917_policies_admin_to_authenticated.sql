-- ============================================================================
-- 20260917_policies_admin_to_authenticated.sql
--
-- Registra em migração o que já foi aplicado direto no Supabase em 17/09/2026:
-- as 29 policies de administrador passaram de PUBLIC para TO authenticated.
--
-- MOTIVO: a migração 20260914_seguranca_funcoes_secdef.sql revogou EXECUTE de
-- `anon` em eh_admin_predial() e eh_admin_comunidade(). Como o Postgres avalia
-- TODAS as policies permissivas antes de combinar com OR, qualquer consulta de
-- visitante deslogado nas 19 tabelas abaixo abortava com
-- "permission denied for function eh_admin_predial" — mesmo quando a policy
-- pública, sozinha, já autorizava a leitura. Foi isso que derrubou o blog.
--
-- Restringir a `authenticated` resolve sem afrouxar o hardening: o planejador
-- não avalia essas policies quando o papel é `anon`, e o EXECUTE segue revogado.
--
-- ESTADO: já aplicado no projeto kvesxatnmgvflqzuqgrz. Rodar aqui é idempotente
-- e reproduz o estado atual. Necessário para qualquer outro ambiente.
-- ============================================================================

drop policy if exists acessos_item_delete_admin on public.acessos_item;
create policy acessos_item_delete_admin on public.acessos_item as permissive for delete to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists acessos_item_insert_admin on public.acessos_item;
create policy acessos_item_insert_admin on public.acessos_item as permissive for insert to authenticated
  with check ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists acessos_item_select_admin on public.acessos_item;
create policy acessos_item_select_admin on public.acessos_item as permissive for select to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists acessos_item_update_admin on public.acessos_item;
create policy acessos_item_update_admin on public.acessos_item as permissive for update to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists "Admin pode atualizar alo_sindico_leads" on public.alo_sindico_leads;
create policy "Admin pode atualizar alo_sindico_leads" on public.alo_sindico_leads as permissive for update to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists "Admin pode ler alo_sindico_leads" on public.alo_sindico_leads;
create policy "Admin pode ler alo_sindico_leads" on public.alo_sindico_leads as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists "Admin pode ler alo_sindico_mensagens" on public.alo_sindico_mensagens;
create policy "Admin pode ler alo_sindico_mensagens" on public.alo_sindico_mensagens as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists analises_licitacao_select_admin on public.analises_licitacao;
create policy analises_licitacao_select_admin on public.analises_licitacao as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists "Admin gerencia CUB" on public.cub_por_estado;
create policy "Admin gerencia CUB" on public.cub_por_estado as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists cursos_modulos_avaliacoes_select_matriculado on public.cursos_modulos_avaliacoes;
create policy cursos_modulos_avaliacoes_select_matriculado on public.cursos_modulos_avaliacoes as permissive for select to authenticated
  using (((EXISTS ( SELECT 1
   FROM (cursos_modulos cm
     JOIN cursos_matriculas mat ON ((mat.curso_id = cm.curso_id)))
  WHERE ((cm.id = cursos_modulos_avaliacoes.modulo_id) AND (mat.profissional_id = auth.uid())))) OR eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists cursos_modulos_avaliacoes_write_admin on public.cursos_modulos_avaliacoes;
create policy cursos_modulos_avaliacoes_write_admin on public.cursos_modulos_avaliacoes as permissive for all to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()))
  with check ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists cursos_modulos_materiais_select_matriculado on public.cursos_modulos_materiais;
create policy cursos_modulos_materiais_select_matriculado on public.cursos_modulos_materiais as permissive for select to authenticated
  using (((EXISTS ( SELECT 1
   FROM (cursos_modulos cm
     JOIN cursos_matriculas mat ON ((mat.curso_id = cm.curso_id)))
  WHERE ((cm.id = cursos_modulos_materiais.modulo_id) AND (mat.profissional_id = auth.uid())))) OR eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists cursos_modulos_materiais_write_admin on public.cursos_modulos_materiais;
create policy cursos_modulos_materiais_write_admin on public.cursos_modulos_materiais as permissive for all to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()))
  with check ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists cursos_progresso_modulo_select_proprio on public.cursos_progresso_modulo;
create policy cursos_progresso_modulo_select_proprio on public.cursos_progresso_modulo as permissive for select to authenticated
  using (((EXISTS ( SELECT 1
   FROM cursos_matriculas mat
  WHERE ((mat.id = cursos_progresso_modulo.matricula_id) AND (mat.profissional_id = auth.uid())))) OR eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists documentos_credito_select_admin on public.documentos_credito;
create policy documentos_credito_select_admin on public.documentos_credito as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists documentos_gerados_licitacao_admin_all on public.documentos_gerados_licitacao;
create policy documentos_gerados_licitacao_admin_all on public.documentos_gerados_licitacao as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists documentos_gerados_licitacao_select_admin on public.documentos_gerados_licitacao;
create policy documentos_gerados_licitacao_select_admin on public.documentos_gerados_licitacao as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists "Admin gerencia prêmios" on public.gamificacao_premios;
create policy "Admin gerencia prêmios" on public.gamificacao_premios as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists "Admin gerencia índices" on public.indices_sinaenco;
create policy "Admin gerencia índices" on public.indices_sinaenco as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists "Admin gerencia linhas de crédito" on public.linhas_credito;
create policy "Admin gerencia linhas de crédito" on public.linhas_credito as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists pacotes_licitacao_admin_all on public.pacotes_licitacao;
create policy pacotes_licitacao_admin_all on public.pacotes_licitacao as permissive for all to authenticated
  using (eh_admin_comunidade());

drop policy if exists "Permitir admin gerenciar perfis de acesso" on public.perfis_acesso;
create policy "Permitir admin gerenciar perfis de acesso" on public.perfis_acesso as permissive for all to authenticated
  using (eh_admin_comunidade())
  with check (eh_admin_comunidade());

drop policy if exists permissoes_acesso_select_admin on public.permissoes_acesso;
create policy permissoes_acesso_select_admin on public.permissoes_acesso as permissive for select to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists permissoes_acesso_update_admin on public.permissoes_acesso;
create policy permissoes_acesso_update_admin on public.permissoes_acesso as permissive for update to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists profissionais_select_admin on public.profissionais;
create policy profissionais_select_admin on public.profissionais as permissive for select to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists profissionais_update_admin on public.profissionais;
create policy profissionais_update_admin on public.profissionais as permissive for update to authenticated
  using ((eh_admin_predial() OR eh_admin_comunidade()));

drop policy if exists solicitacoes_acesso_select_admin on public.solicitacoes_acesso;
create policy solicitacoes_acesso_select_admin on public.solicitacoes_acesso as permissive for select to authenticated
  using (eh_admin_comunidade());

drop policy if exists solicitacoes_acesso_update_admin on public.solicitacoes_acesso;
create policy solicitacoes_acesso_update_admin on public.solicitacoes_acesso as permissive for update to authenticated
  using (eh_admin_comunidade());

drop policy if exists "Admin vê todas as solicitações" on public.solicitacoes_assessoria_credito;
create policy "Admin vê todas as solicitações" on public.solicitacoes_assessoria_credito as permissive for select to authenticated
  using (eh_admin_comunidade());

-- ============================================================================
-- TESTE DE REGRESSÃO — nenhuma tabela pode erguer exceção para o papel `anon`.
-- Deve retornar zero linhas.
-- ============================================================================
-- create or replace function public._check_anon_sweep()
-- returns table(tabela text, erro text) language plpgsql as $$
-- declare t text; n int;
-- begin
--   for t in select c.relname::text from pg_class c
--            join pg_namespace nn on nn.oid = c.relnamespace
--            where nn.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
--            order by 1
--   loop
--     begin
--       set local role anon;
--       execute format('select count(*) from public.%I', t) into n;
--       set local role postgres;
--     exception when others then
--       set local role postgres;
--       tabela := t; erro := SQLERRM; return next;
--     end;
--   end loop;
-- end $$;
-- select * from public._check_anon_sweep();
-- drop function public._check_anon_sweep();
