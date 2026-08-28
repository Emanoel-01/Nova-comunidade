import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-admin-viabiliza-ia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabeçalho do Admin Viabiliza IA -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#132A41] text-white">
              Administração
            </span>
            <span class="text-xs text-slate-500 font-medium">Módulo de Crédito Imobiliário</span>
          </div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight mt-1">
            Gestão Viabiliza IA
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Cadastre as linhas bancárias disponíveis para os membros e acompanhe os agendamentos de assessoria.
          </p>
        </div>

        <!-- Abas de Navegação Interna -->
        <div class="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            (click)="subAbaAtiva.set('linhas')"
            [class]="subAbaAtiva() === 'linhas' ? 'bg-white text-[#132A41] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <span>🏦 Linhas de Crédito</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {{ linhas().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="subAbaAtiva.set('solicitacoes')"
            [class]="subAbaAtiva() === 'solicitacoes' ? 'bg-white text-[#132A41] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📋 Solicitações de Assessoria</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">
              {{ solicitacoes().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="subAbaAtiva.set('cub')"
            [class]="subAbaAtiva() === 'cub' ? 'bg-white text-[#132A41] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📊 Tabela CUB por Estado</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-900 font-bold">
              {{ cubs().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="subAbaAtiva.set('sinaenco')"
            [class]="subAbaAtiva() === 'sinaenco' ? 'bg-white text-[#132A41] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <span>📈 Índices SINAENCO</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
              {{ indicesSinaenco().length }}
            </span>
          </button>
        </div>
      </div>

      <!-- Feedback -->
      @if (alertaSucesso()) {
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {{ alertaSucesso() }}</span>
          <button type="button" (click)="alertaSucesso.set(null)" class="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      }

      @if (alertaErro()) {
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
          <span>⚠️ {{ alertaErro() }}</span>
          <button type="button" (click)="alertaErro.set(null)" class="text-rose-600 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      }

      <!-- ABA 1: LINHAS DE CRÉDITO -->
      @if (subAbaAtiva() === 'linhas') {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800">Linhas de Financiamento Cadastradas</h3>

            <button
              type="button"
              (click)="abrirModalNovaLinha()"
              class="px-4 py-2 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>+ Nova Linha de Crédito</span>
            </button>
          </div>

          @if (carregandoLinhas()) {
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Carregando linhas de crédito...
            </div>
          } @else if (linhas().length === 0) {
            <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-3">
              <p>Nenhuma linha de crédito bancária cadastrada no banco.</p>
              <button
                type="button"
                (click)="abrirModalNovaLinha()"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
              >
                Cadastrar Primeira Linha
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (linha of linhas(); track linha.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <h4 class="text-base font-black text-[#132A41]">{{ linha.banco }}</h4>
                      <span class="text-xs font-black text-[#B5642A]">{{ linha.taxa_juros_min }}% - {{ linha.taxa_juros_max || linha.taxa_juros_min }}% a.a.</span>
                    </div>

                    <div class="text-xs font-bold text-slate-700">{{ linha.produto }}</div>

                    <div class="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div>
                        <span class="text-slate-400">Prazo Máx:</span>
                        <strong class="text-slate-800 ml-1">{{ linha.prazo_max_anos || 30 }} anos</strong>
                      </div>
                      <div>
                        <span class="text-slate-400">Financ. Máx:</span>
                        <strong class="text-slate-800 ml-1">{{ linha.percentual_financiamento_max || 80 }}%</strong>
                      </div>
                      <div>
                        <span class="text-slate-400">Renda Mín:</span>
                        <strong class="text-slate-800 ml-1">R$ {{ linha.renda_minima || '0' }}</strong>
                      </div>
                      <div>
                        <span class="text-slate-400">Prioridade:</span>
                        <strong class="text-slate-800 ml-1">{{ linha.ordem_prioridade || 0 }}</strong>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-1 text-[10px]">
                      @if (linha.juros_na_obra) {
                        <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Juros na Obra</span>
                      }
                      @if (linha.carencia_meses) {
                        <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Carência {{ linha.carencia_meses }}m</span>
                      }
                      <span class="px-2 py-0.5 rounded font-bold"
                        [ngClass]="linha.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                      >
                        {{ linha.ativo ? 'Ativa' : 'Inativa' }}
                      </span>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      (click)="excluirLinha(linha.id)"
                      class="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      Excluir
                    </button>

                    <button
                      type="button"
                      (click)="editarLinha(linha)"
                      class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ABA 2: SOLICITAÇÕES DE ASSESSORIA -->
      @if (subAbaAtiva() === 'solicitacoes') {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800">Solicitações Recebidas</h3>

            <div class="flex items-center gap-2">
              <label class="text-xs text-slate-500 font-medium">Status:</label>
              <select
                [value]="filtroStatus()"
                (change)="onFiltroStatusChange($event)"
                class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="novo">Novas</option>
                <option value="contatado">Contatadas</option>
                <option value="finalizado">Finalizadas</option>
              </select>
            </div>
          </div>

          @if (carregandoSolicitacoes()) {
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Carregando solicitações de assessoria...
            </div>
          } @else if (solicitacoes().length === 0) {
            <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              Nenhuma solicitação de assessoria encontrada para este filtro.
            </div>
          } @else {
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3.5">Data</th>
                      <th class="p-3.5">Solicitante</th>
                      <th class="p-3.5">Projeto</th>
                      <th class="p-3.5">Contato</th>
                      <th class="p-3.5">Status</th>
                      <th class="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (sol of solicitacoes(); track sol.id) {
                      <tr class="hover:bg-slate-50/80">
                        <td class="p-3.5 text-slate-500 whitespace-nowrap">
                          {{ sol.criado_em | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="p-3.5 font-bold text-slate-900">
                          <div>{{ sol.nome }}</div>
                          <div class="text-[11px] font-normal text-slate-500">{{ sol.email }}</div>
                        </td>
                        <td class="p-3.5">
                          <div class="font-bold text-slate-800">{{ sol.projetos_credito?.nome_projeto || 'Projeto' }}</div>
                          <div class="text-[11px] text-[#B5642A] font-semibold">
                            {{ (sol.projetos_credito?.custo_total_estimado || 0) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </div>
                        </td>
                        <td class="p-3.5 font-medium text-slate-800">
                          {{ sol.telefone }}
                        </td>
                        <td class="p-3.5">
                          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            [ngClass]="{
                              'bg-amber-100 text-amber-800': sol.status === 'novo',
                              'bg-blue-100 text-blue-800': sol.status === 'contatado',
                              'bg-emerald-100 text-emerald-800': sol.status === 'finalizado'
                            }"
                          >
                            {{ sol.status }}
                          </span>
                        </td>
                        <td class="p-3.5 text-right whitespace-nowrap">
                          <select
                            [value]="sol.status"
                            (change)="onAlterarStatusSelect(sol.id, $event)"
                            class="px-2 py-1 rounded-lg border border-slate-300 text-[11px] font-bold bg-white"
                          >
                            <option value="novo">Novo</option>
                            <option value="contatado">Contatado</option>
                            <option value="finalizado">Finalizado</option>
                          </select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ABA 3: TABELA CUB POR ESTADO -->
      @if (subAbaAtiva() === 'cub') {
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-bold text-slate-800">Tabela de Custo Unitário Básico (CUB/m²)</h3>
              <p class="text-xs text-slate-500">Valores de referência da construção civil utilizados nas estimativas automáticas do Viabiliza IA.</p>
            </div>

            <div class="flex items-center gap-2">
              <input
                type="text"
                [value]="filtroBuscaCub()"
                (input)="filtroBuscaCub.set($any($event.target).value)"
                placeholder="Filtrar por UF ou Estado..."
                class="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white w-56 font-medium"
              />
            </div>
          </div>

          @if (carregandoCubs()) {
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Carregando dados do CUB por estado...
            </div>
          } @else if (cubsFiltrados().length === 0) {
            <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              Nenhum estado encontrado para o filtro digitado.
            </div>
          } @else {
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3.5">UF</th>
                      <th class="p-3.5">Estado / Região</th>
                      <th class="p-3.5">CUB Médio / m²</th>
                      <th class="p-3.5">Mês/Ano Ref.</th>
                      <th class="p-3.5">Observação / Fonte</th>
                      <th class="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (cub of cubsFiltrados(); track cub.uf) {
                      <tr class="hover:bg-slate-50/80">
                        <td class="p-3.5 font-black text-[#132A41]">
                          <span class="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs">
                            {{ cub.uf }}
                          </span>
                        </td>
                        <td class="p-3.5 font-bold text-slate-800">
                          {{ cub.nome_estado || cub.estado || cub.uf }}
                        </td>
                        <td class="p-3.5 font-black text-indigo-700 text-sm">
                          {{ cub.valor_m2 | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </td>
                        <td class="p-3.5 font-semibold text-slate-600">
                          {{ getReferenciaCub(cub) }}
                        </td>
                        <td class="p-3.5 text-slate-500">
                          {{ cub.sinduscon_responsavel || cub.observacao || 'Sinduscon Regional' }}
                        </td>
                        <td class="p-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            (click)="editarCub(cub)"
                            class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#132A41] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- ABA 4: GESTÃO DE ÍNDICES SINAENCO (REAJUSTE DE CONTRATOS) -->
      @if (subAbaAtiva() === 'sinaenco') {
        <div class="space-y-6 animate-fadeIn">
          <!-- Header com ação de adicionar índice e filtros -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Reajuste Contratual FGV / SINAENCO
                </span>
                <span class="text-xs text-slate-400 font-medium">Lembrete trimestral ativo</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 mt-1">
                Índices Mensais SINAENCO (Colunas 35 e 39)
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Tabela central alimentada para o cálculo do Reajuste de Contratos Públicos. Fonte oficial:
                <a href="http://sinaenco.com.br/indices" target="_blank" rel="noopener noreferrer" class="text-emerald-700 underline font-semibold">sinaenco.com.br/indices</a>.
              </p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                (click)="abrirModalNovoIndice()"
                class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Adicionar Novo Mês</span>
              </button>
            </div>
          </div>

          <!-- Filtros de Busca -->
          <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-600">Coluna:</span>
                <select
                  [value]="filtroColunaSinaenco()"
                  (change)="filtroColunaSinaenco.set($any($event.target).value)"
                  class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="todos">Todas as Colunas (35 e 39)</option>
                  <option value="coluna35">Coluna 35 — Edificação</option>
                  <option value="coluna39">Coluna 39 — Consultoria e Projetos</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-600">Ano:</span>
                <select
                  [value]="filtroAnoSinaenco()"
                  (change)="filtroAnoSinaenco.set($any($event.target).value)"
                  class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="todos">Todos os Anos</option>
                  @for (ano of anosDisponiveisSinaenco; track ano) {
                    <option [value]="ano">{{ ano }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="text-xs text-slate-500 font-semibold">
              Exibindo {{ indicesSinaencoFiltrados().length }} registros
            </div>
          </div>

          <!-- Tabela de Índices -->
          @if (carregandoIndicesSinaenco()) {
            <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-500 font-medium">Carregando índices SINAENCO...</p>
            </div>
          } @else if (indicesSinaencoFiltrados().length === 0) {
            <div class="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <p class="text-xs text-slate-500 font-medium">Nenhum índice encontrado para os filtros selecionados.</p>
              <button
                type="button"
                (click)="abrirModalNovoIndice()"
                class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                + Cadastrar Primeiro Índice
              </button>
            </div>
          } @else {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div class="overflow-x-auto max-h-[500px]">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th class="p-3.5">Coluna / Finalidade</th>
                      <th class="p-3.5">Ano</th>
                      <th class="p-3.5">Mês de Referência</th>
                      <th class="p-3.5">Valor Oficial</th>
                      <th class="p-3.5">Última Atualização</th>
                      <th class="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (ind of indicesSinaencoFiltrados(); track (ind.coluna + '_' + ind.ano + '_' + ind.mes)) {
                      <tr class="hover:bg-slate-50/80">
                        <td class="p-3.5">
                          <span
                            class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold"
                            [class]="ind.coluna === 'coluna35' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
                          >
                            {{ ind.coluna === 'coluna35' ? 'Coluna 35 (Edificação)' : 'Coluna 39 (Consultoria)' }}
                          </span>
                        </td>
                        <td class="p-3.5 font-bold text-slate-800">
                          {{ ind.ano }}
                        </td>
                        <td class="p-3.5 font-semibold text-slate-700">
                          {{ getNomeMes(ind.mes) }} ({{ getMesFormatado(ind.mes) }}/{{ ind.ano }})
                        </td>
                        <td class="p-3.5 font-mono font-black text-emerald-700 text-sm">
                          {{ ind.valor | number:'1.3-3':'pt-BR' }}
                        </td>
                        <td class="p-3.5 text-slate-400 text-[11px]">
                          {{ ind.atualizado_em ? (ind.atualizado_em | date:'dd/MM/yyyy HH:mm') : '—' }}
                        </td>
                        <td class="p-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            (click)="editarIndice(ind)"
                            class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#132A41] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            (click)="excluirIndice(ind)"
                            class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- MODAL: EDITAR VALOR DO CUB -->
      @if (modalCubAberto()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-[#132A41] text-white font-mono font-bold text-xs">
                  {{ formCub.uf }}
                </span>
                <h3 class="text-lg font-black text-slate-900">
                  Editar CUB — {{ formCub.estado }}
                </h3>
              </div>
              <button type="button" (click)="modalCubAberto.set(false)" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Valor do CUB por m² (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  [value]="formCub.valor_m2"
                  (input)="formCub.valor_m2 = +$any($event.target).value"
                  placeholder="Ex: 2650.00"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-black text-indigo-700 text-base"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Mês / Ano de Referência</label>
                <input
                  type="text"
                  [value]="formCub.mes_ano_referencia"
                  (input)="formCub.mes_ano_referencia = $any($event.target).value"
                  placeholder="Ex: Fev/2025"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Observação / Fonte</label>
                <input
                  type="text"
                  [value]="formCub.observacao"
                  (input)="formCub.observacao = $any($event.target).value"
                  placeholder="Ex: Sinduscon-SP R8N Desonerado"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="modalCubAberto.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="salvarCub()"
                [disabled]="formCub.valor_m2 <= 0 || salvandoCub()"
                class="px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {{ salvandoCub() ? 'Salvando...' : 'Salvar CUB' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: NOVA / EDITAR LINHA DE CRÉDITO -->
      @if (modalLinhaAberto()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-lg font-black text-slate-900">
                {{ linhaEmEdicaoId ? 'Editar Linha de Crédito' : 'Nova Linha de Crédito' }}
              </h3>
              <button type="button" (click)="modalLinhaAberto.set(false)" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Instituição Bancária</label>
                <input
                  type="text"
                  [value]="formLinha.banco"
                  (input)="formLinha.banco = $any($event.target).value"
                  placeholder="Ex: Caixa Econômica, Itaú, Bradesco, Santander"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  [value]="formLinha.produto"
                  (input)="formLinha.produto = $any($event.target).value"
                  placeholder="Ex: Aquisição de Terreno e Construção (SBPE)"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Taxa de Juros Mínima (% a.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  [value]="formLinha.taxa_juros_min"
                  (input)="formLinha.taxa_juros_min = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Taxa de Juros Máxima (% a.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  [value]="formLinha.taxa_juros_max"
                  (input)="formLinha.taxa_juros_max = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Prazo Máximo (Anos)</label>
                <input
                  type="number"
                  [value]="formLinha.prazo_max_anos"
                  (input)="formLinha.prazo_max_anos = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">% Financiamento Máximo</label>
                <input
                  type="number"
                  [value]="formLinha.percentual_financiamento_max"
                  (input)="formLinha.percentual_financiamento_max = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Renda Mínima Recomendada (R$)</label>
                <input
                  type="number"
                  [value]="formLinha.renda_minima"
                  (input)="formLinha.renda_minima = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Idade Máxima Solicitante</label>
                <input
                  type="number"
                  [value]="formLinha.idade_maxima"
                  (input)="formLinha.idade_maxima = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Sistema de Amortização</label>
                <input
                  type="text"
                  [value]="formLinha.sistema_amortizacao"
                  (input)="formLinha.sistema_amortizacao = $any($event.target).value"
                  placeholder="Ex: SAC / Price"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Ordem de Prioridade (Destaque)</label>
                <input
                  type="number"
                  [value]="formLinha.ordem_prioridade"
                  (input)="formLinha.ordem_prioridade = +$any($event.target).value"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div class="sm:col-span-2 flex items-center gap-6 pt-2">
                <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    [checked]="formLinha.juros_na_obra"
                    (change)="formLinha.juros_na_obra = $any($event.target).checked"
                    class="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Possui Juros na Obra</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    [checked]="formLinha.ativo"
                    (change)="formLinha.ativo = $any($event.target).checked"
                    class="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Linha Ativa</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="modalLinhaAberto.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="salvarLinha()"
                [disabled]="!formLinha.banco || !formLinha.produto || salvandoLinha()"
                class="px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {{ salvandoLinha() ? 'Salvando...' : 'Salvar Linha de Crédito' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: CADASTRAR / EDITAR ÍNDICE SINAENCO -->
      @if (modalSinaencoAberto()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-mono font-bold text-xs">
                  SINAENCO
                </span>
                <h3 class="text-lg font-black text-slate-900">
                  {{ modoEdicaoSinaenco ? 'Editar Índice Mensal' : 'Novo Índice Mensal' }}
                </h3>
              </div>
              <button type="button" (click)="modalSinaencoAberto.set(false)" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Coluna / Categoria *</label>
                <select
                  [value]="formSinaenco.coluna"
                  (change)="formSinaenco.coluna = $any($event.target).value"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                >
                  <option value="coluna35">Coluna 35 — Edificação (INCC / Execução de Obra)</option>
                  <option value="coluna39">Coluna 39 — Consultoria (Supervisão e Projetos)</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Ano *</label>
                  <input
                    type="number"
                    [value]="formSinaenco.ano"
                    (input)="formSinaenco.ano = +$any($event.target).value"
                    placeholder="Ex: 2026"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">Mês *</label>
                  <select
                    [value]="formSinaenco.mes"
                    (change)="formSinaenco.mes = +$any($event.target).value"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                  >
                    @for (m of listaMesesSinaenco; track m.num) {
                      <option [value]="m.num">{{ m.num }} - {{ m.nome }}</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Valor Oficial do Índice *</label>
                <input
                  type="number"
                  step="0.001"
                  [value]="formSinaenco.valor"
                  (input)="formSinaenco.valor = +$any($event.target).value"
                  placeholder="Ex: 1237.036"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-black text-emerald-700 text-base"
                />
                <p class="text-[11px] text-slate-500 mt-1">
                  Valor publicado oficialmente pela FGV / SINAENCO.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="modalSinaencoAberto.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="salvarIndiceSinaenco()"
                [disabled]="formSinaenco.valor <= 0 || salvandoSinaenco()"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {{ salvandoSinaenco() ? 'Salvando...' : 'Salvar Índice' }}
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminViabilizaIaComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly subAbaAtiva = signal<'linhas' | 'solicitacoes' | 'cub' | 'sinaenco'>('linhas');
  readonly linhas = signal<any[]>([]);
  readonly solicitacoes = signal<any[]>([]);
  readonly cubs = signal<any[]>([]);
  readonly indicesSinaenco = signal<any[]>([]);

  readonly carregandoLinhas = signal(false);
  readonly carregandoSolicitacoes = signal(false);
  readonly carregandoCubs = signal(false);
  readonly carregandoIndicesSinaenco = signal(false);

  readonly alertaSucesso = signal<string | null>(null);
  readonly alertaErro = signal<string | null>(null);

  readonly modalLinhaAberto = signal(false);
  readonly salvandoLinha = signal(false);
  linhaEmEdicaoId: string | null = null;

  readonly modalCubAberto = signal(false);
  readonly salvandoCub = signal(false);
  readonly filtroBuscaCub = signal('');

  // SINAENCO
  readonly modalSinaencoAberto = signal(false);
  readonly salvandoSinaenco = signal(false);
  readonly filtroColunaSinaenco = signal<string>('todos');
  readonly filtroAnoSinaenco = signal<string>('todos');
  modoEdicaoSinaenco = false;

  readonly listaMesesSinaenco = [
    { num: 1, nome: 'Janeiro' },
    { num: 2, nome: 'Fevereiro' },
    { num: 3, nome: 'Março' },
    { num: 4, nome: 'Abril' },
    { num: 5, nome: 'Maio' },
    { num: 6, nome: 'Junho' },
    { num: 7, nome: 'Julho' },
    { num: 8, nome: 'Agosto' },
    { num: 9, nome: 'Setembro' },
    { num: 10, nome: 'Outubro' },
    { num: 11, nome: 'Novembro' },
    { num: 12, nome: 'Dezembro' }
  ];

  readonly anosDisponiveisSinaenco = [2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  formSinaenco: {
    id: string;
    coluna: 'coluna35' | 'coluna39';
    ano: number;
    mes: number;
    valor: number;
  } = {
    id: '',
    coluna: 'coluna39',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    valor: 0
  };

  readonly indicesSinaencoFiltrados = computed(() => {
    let lista = this.indicesSinaenco();
    const col = this.filtroColunaSinaenco();
    const ano = this.filtroAnoSinaenco();

    if (col !== 'todos') {
      lista = lista.filter(i => i.coluna === col);
    }
    if (ano !== 'todos') {
      const numAno = parseInt(ano, 10);
      lista = lista.filter(i => i.ano === numAno);
    }
    return lista;
  });

  formCub = {
    uf: '',
    estado: '',
    valor_m2: 0,
    mes_ano_referencia: '',
    observacao: ''
  };

  readonly cubsFiltrados = computed(() => {
    const termo = this.filtroBuscaCub().trim().toLowerCase();
    const lista = this.cubs();
    if (!termo) return lista;
    return lista.filter(c =>
      (c.uf && c.uf.toLowerCase().includes(termo)) ||
      (c.nome_estado && c.nome_estado.toLowerCase().includes(termo)) ||
      (c.estado && c.estado.toLowerCase().includes(termo)) ||
      (c.sinduscon_responsavel && c.sinduscon_responsavel.toLowerCase().includes(termo)) ||
      (c.observacao && c.observacao.toLowerCase().includes(termo))
    );
  });

  readonly filtroStatus = signal<string>('todos');

  formLinha = {
    banco: '',
    produto: '',
    taxa_juros_min: 9.5,
    taxa_juros_max: 11.2,
    prazo_max_anos: 35,
    percentual_financiamento_max: 80,
    renda_minima: 5000,
    idade_maxima: 80,
    juros_na_obra: true,
    carencia_meses: 0,
    sistema_amortizacao: 'SAC / Price',
    ordem_prioridade: 10,
    ativo: true
  };

  async ngOnInit(): Promise<void> {
    await this.carregarLinhas();
    await this.carregarSolicitacoes();
    await this.carregarCubs();
    await this.carregarIndicesSinaenco();
  }

  onFiltroStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroStatus.set(val);
    this.carregarSolicitacoes();
  }

  onAlterarStatusSelect(id: string, event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.alterarStatusSolicitacao(id, val);
  }

  async carregarLinhas(): Promise<void> {
    this.carregandoLinhas.set(true);
    try {
      const lista = await this.supabaseService.listarTodasLinhasCreditoAdmin();
      this.linhas.set(lista || []);
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao carregar linhas de crédito');
    } finally {
      this.carregandoLinhas.set(false);
    }
  }

  async carregarSolicitacoes(): Promise<void> {
    this.carregandoSolicitacoes.set(true);
    try {
      const lista = await this.supabaseService.listarSolicitacoesAssessoriaAdmin(this.filtroStatus());
      this.solicitacoes.set(lista || []);
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao carregar solicitações');
    } finally {
      this.carregandoSolicitacoes.set(false);
    }
  }

  abrirModalNovaLinha(): void {
    this.linhaEmEdicaoId = null;
    this.formLinha = {
      banco: '',
      produto: '',
      taxa_juros_min: 9.5,
      taxa_juros_max: 11.2,
      prazo_max_anos: 35,
      percentual_financiamento_max: 80,
      renda_minima: 5000,
      idade_maxima: 80,
      juros_na_obra: true,
      carencia_meses: 0,
      sistema_amortizacao: 'SAC / Price',
      ordem_prioridade: 10,
      ativo: true
    };
    this.modalLinhaAberto.set(true);
  }

  editarLinha(linha: any): void {
    this.linhaEmEdicaoId = linha.id;
    this.formLinha = {
      banco: linha.banco || '',
      produto: linha.produto || '',
      taxa_juros_min: linha.taxa_juros_min ?? 9.5,
      taxa_juros_max: linha.taxa_juros_max ?? 11.2,
      prazo_max_anos: linha.prazo_max_anos ?? 35,
      percentual_financiamento_max: linha.percentual_financiamento_max ?? 80,
      renda_minima: linha.renda_minima ?? 5000,
      idade_maxima: linha.idade_maxima ?? 80,
      juros_na_obra: linha.juros_na_obra ?? true,
      carencia_meses: linha.carencia_meses ?? 0,
      sistema_amortizacao: linha.sistema_amortizacao || 'SAC / Price',
      ordem_prioridade: linha.ordem_prioridade ?? 10,
      ativo: linha.ativo ?? true
    };
    this.modalLinhaAberto.set(true);
  }

  async salvarLinha(): Promise<void> {
    if (!this.formLinha.banco || !this.formLinha.produto) return;
    this.salvandoLinha.set(true);
    try {
      if (this.linhaEmEdicaoId) {
        const { error } = await this.supabaseService.atualizarLinhaCredito(this.linhaEmEdicaoId, this.formLinha);
        if (error) throw error;
        this.alertaSucesso.set('Linha de crédito atualizada!');
      } else {
        const { error } = await this.supabaseService.criarLinhaCredito(this.formLinha);
        if (error) throw error;
        this.alertaSucesso.set('Linha de crédito criada com sucesso!');
      }
      this.modalLinhaAberto.set(false);
      await this.carregarLinhas();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao salvar linha');
    } finally {
      this.salvandoLinha.set(false);
    }
  }

  async excluirLinha(id: string): Promise<void> {
    if (!confirm('Deseja realmente excluir esta linha de crédito?')) return;
    try {
      const { error } = await this.supabaseService.excluirLinhaCredito(id);
      if (error) throw error;
      this.alertaSucesso.set('Linha excluída.');
      await this.carregarLinhas();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao excluir linha');
    }
  }

  async alterarStatusSolicitacao(id: string, status: any): Promise<void> {
    try {
      const { error } = await this.supabaseService.atualizarStatusSolicitacaoAssessoria(id, status);
      if (error) throw error;
      this.alertaSucesso.set('Status da solicitação atualizado!');
      await this.carregarSolicitacoes();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao atualizar status');
    }
  }

  async carregarCubs(): Promise<void> {
    this.carregandoCubs.set(true);
    try {
      const lista = await this.supabaseService.listarCubsTodosEstados();
      this.cubs.set(lista || []);
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao carregar tabela CUB');
    } finally {
      this.carregandoCubs.set(false);
    }
  }

  getReferenciaCub(cub: any): string {
    if (cub.mes_referencia && cub.ano_referencia) {
      return `${String(cub.mes_referencia).padStart(2, '0')}/${cub.ano_referencia}`;
    }
    return cub.mes_ano_referencia || '—';
  }

  editarCub(cub: any): void {
    this.formCub = {
      uf: cub.uf,
      estado: cub.nome_estado || cub.estado || cub.uf,
      valor_m2: cub.valor_m2 || 0,
      mes_ano_referencia: this.getReferenciaCub(cub) === '—' ? '' : this.getReferenciaCub(cub),
      observacao: cub.sinduscon_responsavel || cub.observacao || ''
    };
    this.modalCubAberto.set(true);
  }

  async salvarCub(): Promise<void> {
    if (!this.formCub.uf || this.formCub.valor_m2 <= 0) return;
    this.salvandoCub.set(true);
    try {
      // Parse mês e ano se formato MM/AAAA
      let mesRef: number | undefined;
      let anoRef: number | undefined;
      if (this.formCub.mes_ano_referencia && this.formCub.mes_ano_referencia.includes('/')) {
        const parts = this.formCub.mes_ano_referencia.split('/');
        const m = parseInt(parts[0], 10);
        const a = parseInt(parts[1], 10);
        if (!isNaN(m) && m >= 1 && m <= 12) mesRef = m;
        if (!isNaN(a) && a >= 2000) anoRef = a;
      }

      const { error } = await this.supabaseService.atualizarCubEstado(this.formCub.uf, {
        valor_m2: this.formCub.valor_m2,
        mes_referencia: mesRef,
        ano_referencia: anoRef,
        mes_ano_referencia: this.formCub.mes_ano_referencia || null,
        sinduscon_responsavel: this.formCub.observacao || undefined,
        observacao: this.formCub.observacao || null
      });
      if (error) throw error;
      this.alertaSucesso.set(`CUB de ${this.formCub.estado} (${this.formCub.uf}) atualizado com sucesso!`);
      this.modalCubAberto.set(false);
      await this.carregarCubs();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao salvar valor do CUB');
    } finally {
      this.salvandoCub.set(false);
    }
  }

  // MÉTODOS SINAENCO
  async carregarIndicesSinaenco(): Promise<void> {
    this.carregandoIndicesSinaenco.set(true);
    try {
      const lista = await this.supabaseService.listarIndicesSinaenco();
      this.indicesSinaenco.set(lista || []);
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao carregar índices SINAENCO');
    } finally {
      this.carregandoIndicesSinaenco.set(false);
    }
  }

  abrirModalNovoIndice(): void {
    this.modoEdicaoSinaenco = false;
    this.formSinaenco = {
      id: '',
      coluna: 'coluna39',
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      valor: 0
    };
    this.modalSinaencoAberto.set(true);
  }

  editarIndice(ind: any): void {
    this.modoEdicaoSinaenco = true;
    this.formSinaenco = {
      id: ind.id || '',
      coluna: ind.coluna || 'coluna39',
      ano: ind.ano || new Date().getFullYear(),
      mes: ind.mes || 1,
      valor: ind.valor || 0
    };
    this.modalSinaencoAberto.set(true);
  }

  async salvarIndiceSinaenco(): Promise<void> {
    if (this.formSinaenco.valor <= 0) return;
    this.salvandoSinaenco.set(true);
    try {
      const { error } = await this.supabaseService.adicionarIndiceMensal({
        coluna: this.formSinaenco.coluna,
        ano: Number(this.formSinaenco.ano),
        mes: Number(this.formSinaenco.mes),
        valor: Number(this.formSinaenco.valor)
      });

      if (error) throw error;
      this.alertaSucesso.set(`Índice de ${this.getNomeMes(this.formSinaenco.mes)}/${this.formSinaenco.ano} salvo com sucesso!`);
      this.modalSinaencoAberto.set(false);
      await this.carregarIndicesSinaenco();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao salvar índice SINAENCO');
    } finally {
      this.salvandoSinaenco.set(false);
    }
  }

  async excluirIndice(ind: any): Promise<void> {
    if (!confirm(`Deseja realmente remover o índice de ${this.getNomeMes(ind.mes)}/${ind.ano}?`)) return;
    try {
      const { error } = await this.supabaseService.excluirIndiceSinaenco(ind.coluna, ind.ano, ind.mes);
      if (error) throw error;
      this.alertaSucesso.set('Índice excluído.');
      await this.carregarIndicesSinaenco();
    } catch (e: any) {
      this.alertaErro.set(e?.message || 'Erro ao excluir índice');
    }
  }

  getNomeMes(mes: number): string {
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return nomes[mes - 1] || `${mes}`;
  }

  getMesFormatado(mes: number): string {
    return String(mes).padStart(2, '0');
  }
}
