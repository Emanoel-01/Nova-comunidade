import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

interface VagaAdminItem {
  id: string;
  titulo: string;
  empresa?: string;
  descricao: string;
  localizacao?: string;
  tipo_contrato?: string;
  remuneracao?: string;
  requisitos?: string | string[];
  beneficios?: string | string[];
  ativa: boolean;
  criado_em?: string;
}

interface CandidaturaAdminItem {
  id: string;
  vaga_id: string;
  profissional_id: string;
  mensagem?: string | null;
  criado_em?: string;
  candidato?: {
    id: string;
    full_name?: string;
    professional_title?: string;
    email?: string;
  } | null;
}

@Component({
  selector: 'app-admin-vagas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Gestão do Mural de Vagas & Oportunidades
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Crie novas vagas, gerencie status de publicação e visualize candidaturas de membros.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <!-- Botão Recarregar -->
          <button
            type="button"
            (click)="carregarVagas()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar lista"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>

          <!-- Botão Nova Vaga -->
          <button
            type="button"
            (click)="abrirModalNovaVaga()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nova Vaga</span>
          </button>
        </div>
      </div>

      <!-- Alerta de Sucesso -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="space-y-1">
              <p class="font-bold text-emerald-950">Sucesso!</p>
              <p class="text-emerald-800 leading-relaxed">{{ mensagemSucesso() }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Alerta de Erro -->
      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-rose-800 leading-relaxed">{{ mensagemErro() }}</p>
          </div>
          <button
            type="button"
            (click)="mensagemErro.set(null)"
            class="text-rose-600 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100/50 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Barra de Filtros e Busca -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        
        <!-- Filtros por Status -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            type="button"
            (click)="filtroStatus.set('todas')"
            [class]="filtroStatus() === 'todas'
              ? 'px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Todas ({{ vagas().length }})
          </button>

          <button
            type="button"
            (click)="filtroStatus.set('ativas')"
            [class]="filtroStatus() === 'ativas'
              ? 'px-3 py-1.5 rounded-lg bg-white text-emerald-800 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Ativas ({{ totalAtivas() }})
          </button>

          <button
            type="button"
            (click)="filtroStatus.set('inativas')"
            [class]="filtroStatus() === 'inativas'
              ? 'px-3 py-1.5 rounded-lg bg-white text-amber-800 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Inativas ({{ totalInativas() }})
          </button>
        </div>

        <!-- Campo de Busca -->
        <div class="relative w-full sm:w-64">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar cargo, empresa, local..."
            (input)="onBuscaInput($event)"
            [value]="termoBusca()"
            class="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <!-- Conteúdo: Carregando -->
      @if (carregando()) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-500 font-medium">Buscando vagas no banco de dados...</p>
        </div>
      } @else if (vagasFiltradas().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 class="text-sm font-bold text-slate-800">Nenhuma vaga encontrada</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Publique novas oportunidades para os membros da comunidade ou ajuste seus filtros de busca.
          </p>
          <div class="pt-2">
            <button
              type="button"
              (click)="abrirModalNovaVaga()"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Criar Primeira Vaga
            </button>
          </div>
        </div>
      } @else {
        <!-- Lista de Vagas -->
        <div class="space-y-4">
          @for (vaga of vagasFiltradas(); track vaga.id) {
            <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4">
              
              <!-- Linha Superior: Status Toggle + Badges + Ações -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <!-- Toggle Status Ativa/Inativa -->
                  <button
                    type="button"
                    (click)="toggleStatusVaga(vaga)"
                    [disabled]="processandoId() === vaga.id"
                    [class]="vaga.ativa
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50"
                    title="Clique para alternar status"
                  >
                    <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="vaga.ativa" [class.bg-slate-400]="!vaga.ativa"></span>
                    <span>{{ vaga.ativa ? 'Ativa no Mural' : 'Pausada / Inativa' }}</span>
                  </button>

                  <!-- Badge de Contrato -->
                  <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    {{ vaga.tipo_contrato || 'CLT' }}
                  </span>

                  <!-- Data de Criação -->
                  <span class="text-xs text-slate-400 font-medium">
                    {{ formatarData(vaga.criado_em) }}
                  </span>
                </div>

                <!-- Botões de Ação na Vaga -->
                <div class="flex items-center gap-2 self-end sm:self-auto">
                  <!-- Ver Candidaturas -->
                  <button
                    type="button"
                    (click)="abrirCandidaturas(vaga)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Candidaturas</span>
                  </button>

                  <!-- Editar Vaga -->
                  <button
                    type="button"
                    (click)="abrirModalEditarVaga(vaga)"
                    class="p-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Editar vaga"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Excluir Vaga com 2 cliques -->
                  @if (confirmarExclusaoVagaId() === vaga.id) {
                    <div class="flex items-center gap-1 animate-fadeIn">
                      <button
                        type="button"
                        (click)="executarExcluirVaga(vaga.id)"
                        [disabled]="processandoId() === vaga.id"
                        class="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        {{ processandoId() === vaga.id ? 'Excluindo...' : 'Confirmar?' }}
                      </button>
                      <button
                        type="button"
                        (click)="confirmarExclusaoVagaId.set(null)"
                        class="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="confirmarExclusaoVagaId.set(vaga.id)"
                      class="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir vaga"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  }
                </div>
              </div>

              <!-- Informações Principais da Vaga -->
              <div class="space-y-2">
                <h4 class="text-base sm:text-lg font-black text-slate-900">
                  {{ vaga.titulo }}
                </h4>

                <div class="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                  @if (vaga.empresa) {
                    <span class="font-bold text-slate-800 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {{ vaga.empresa }}
                    </span>
                    <span>•</span>
                  }

                  @if (vaga.localizacao) {
                    <span class="flex items-center gap-1 text-slate-500">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ vaga.localizacao }}
                    </span>
                    <span>•</span>
                  }

                  @if (vaga.remuneracao) {
                    <span class="font-semibold text-emerald-700">
                      💰 {{ vaga.remuneracao }}
                    </span>
                  }
                </div>

                <p class="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1">
                  {{ vaga.descricao }}
                </p>
              </div>

            </div>
          }
        </div>
      }

      <!-- ======================================================= -->
      <!-- MODAL: CRIAR / EDITAR VAGA                              -->
      <!-- ======================================================= -->
      @if (modalAberto()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 class="text-lg sm:text-xl font-black text-slate-900">
                  {{ vagaEditando() ? 'Editar Vaga' : 'Criar Nova Vaga' }}
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  Preencha as informações da oportunidade de trabalho.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModalVaga()"
                class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Formulário -->
            <div class="space-y-4">
              
              <!-- Título da Vaga -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">
                  Título do Cargo / Oportunidade <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Engenheiro Diagnóstico Pleno"
                  (input)="formTitulo.set($any($event.target).value)"
                  [value]="formTitulo()"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Empresa e Localização -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-700">
                    Empresa Contratante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amorim Engenharia & Consultoria"
                    (input)="formEmpresa.set($any($event.target).value)"
                    [value]="formEmpresa()"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-700">
                    Localização / Modalidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo / SP - Híbrido"
                    (input)="formLocalizacao.set($any($event.target).value)"
                    [value]="formLocalizacao()"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Tipo de Contrato e Remuneração -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-700">
                    Tipo de Contrato
                  </label>
                  <select
                    (change)="formTipoContrato.set($any($event.target).value)"
                    [value]="formTipoContrato()"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Freelance">Freelance / Consultoria</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-bold text-slate-700">
                    Faixa Salarial / Remuneração
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 8.000 a R$ 11.000 / mês"
                    (input)="formRemuneracao.set($any($event.target).value)"
                    [value]="formRemuneracao()"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Descrição Detalhada -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">
                  Descrição da Vaga <span class="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Descreva as principais responsabilidades, projetos e atividades do dia a dia..."
                  (input)="formDescricao.set($any($event.target).value)"
                  [value]="formDescricao()"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                ></textarea>
              </div>

              <!-- Requisitos -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">
                  Requisitos e Qualificações (um por linha)
                </label>
                <textarea
                  rows="3"
                  placeholder="Ex: Experiência com inspeção predial (NBR 16747)&#10;CREA ativo&#10;Domínio do AutoCad e Excel"
                  (input)="formRequisitos.set($any($event.target).value)"
                  [value]="formRequisitos()"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                ></textarea>
              </div>

              <!-- Benefícios -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">
                  Benefícios & Diferenciais (um por linha)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Vale Refeição (R$ 45/dia)&#10;Plano de Saúde Bradesco&#10;Bônus por produtividade"
                  (input)="formBeneficios.set($any($event.target).value)"
                  [value]="formBeneficios()"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                ></textarea>
              </div>

              <!-- Checkbox Ativa -->
              <label class="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  (change)="formAtiva.set($any($event.target).checked)"
                  [checked]="formAtiva()"
                  class="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span class="text-xs font-bold text-slate-800">Publicar imediatamente como ativa no mural</span>
              </label>

            </div>

            <!-- Botões de Ação do Modal -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="fecharModalVaga()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                (click)="salvarVaga()"
                [disabled]="salvandoVaga() || !formTitulo().trim() || !formDescricao().trim()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {{ salvandoVaga() ? 'Salvando...' : (vagaEditando() ? 'Atualizar Vaga' : 'Criar Vaga') }}
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ======================================================= -->
      <!-- MODAL: VISUALIZAR CANDIDATURAS                          -->
      <!-- ======================================================= -->
      @if (modalCandidaturasAberto()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 class="text-lg font-black text-slate-900">
                  Candidaturas Recebidas
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  Vaga: <strong class="text-indigo-600">{{ vagaSelecionadaCandidaturas()?.titulo }}</strong>
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModalCandidaturas()"
                class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            @if (carregandoCandidaturas()) {
              <div class="py-12 text-center space-y-3">
                <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs text-slate-500">Carregando candidatos...</p>
              </div>
            } @else if (candidaturas().length === 0) {
              <div class="py-12 text-center space-y-2">
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h5 class="text-xs font-bold text-slate-700">Nenhum membro se candidatou ainda</h5>
                <p class="text-[11px] text-slate-400">Assim que os profissionais aplicarem, eles aparecerão nesta lista.</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (cand of candidaturas(); track cand.id) {
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h5 class="text-xs font-bold text-slate-900">
                          {{ cand.candidato?.full_name || 'Profissional da Comunidade' }}
                        </h5>
                        <p class="text-[11px] text-slate-500">
                          {{ cand.candidato?.professional_title || 'Especialista' }}
                          @if (cand.candidato?.email) {
                            <span>• {{ cand.candidato?.email }}</span>
                          }
                        </p>
                      </div>
                      <span class="text-[11px] text-slate-400 font-medium shrink-0">
                        {{ formatarData(cand.criado_em) }}
                      </span>
                    </div>

                    @if (cand.mensagem) {
                      <div class="bg-white p-3 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        <strong class="text-slate-900 block text-[11px] uppercase tracking-wider mb-1">Apresentação:</strong>
                        {{ cand.mensagem }}
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <div class="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                (click)="fecharModalCandidaturas()"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminVagasComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly vagas = signal<VagaAdminItem[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly processandoId = signal<string | null>(null);
  readonly confirmarExclusaoVagaId = signal<string | null>(null);

  readonly filtroStatus = signal<'todas' | 'ativas' | 'inativas'>('todas');
  readonly termoBusca = signal<string>('');

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Modal de Vaga (Criar / Editar)
  readonly modalAberto = signal<boolean>(false);
  readonly vagaEditando = signal<VagaAdminItem | null>(null);
  readonly salvandoVaga = signal<boolean>(false);

  readonly formTitulo = signal<string>('');
  readonly formEmpresa = signal<string>('');
  readonly formDescricao = signal<string>('');
  readonly formLocalizacao = signal<string>('');
  readonly formTipoContrato = signal<string>('CLT');
  readonly formRemuneracao = signal<string>('');
  readonly formRequisitos = signal<string>('');
  readonly formBeneficios = signal<string>('');
  readonly formAtiva = signal<boolean>(true);

  // Modal de Candidaturas
  readonly modalCandidaturasAberto = signal<boolean>(false);
  readonly vagaSelecionadaCandidaturas = signal<VagaAdminItem | null>(null);
  readonly candidaturas = signal<CandidaturaAdminItem[]>([]);
  readonly carregandoCandidaturas = signal<boolean>(false);

  readonly totalAtivas = computed(() => this.vagas().filter(v => v.ativa).length);
  readonly totalInativas = computed(() => this.vagas().filter(v => !v.ativa).length);

  readonly vagasFiltradas = computed(() => {
    let lista = this.vagas();
    const st = this.filtroStatus();
    if (st === 'ativas') lista = lista.filter(v => v.ativa);
    if (st === 'inativas') lista = lista.filter(v => !v.ativa);

    const busca = this.termoBusca().toLowerCase().trim();
    if (busca) {
      lista = lista.filter(v =>
        (v.titulo || '').toLowerCase().includes(busca) ||
        (v.empresa || '').toLowerCase().includes(busca) ||
        (v.localizacao || '').toLowerCase().includes(busca) ||
        (v.descricao || '').toLowerCase().includes(busca)
      );
    }
    return lista;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarVagas();
  }

  async carregarVagas(): Promise<void> {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    try {
      const data = await this.supabaseService.listarTodasVagas();
      this.vagas.set(data);
    } catch (e: any) {
      this.mensagemErro.set('Erro ao carregar vagas: ' + (e?.message || e));
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value || '');
  }

  async toggleStatusVaga(vaga: VagaAdminItem): Promise<void> {
    this.processandoId.set(vaga.id);
    this.mensagemErro.set(null);
    const novoStatus = !vaga.ativa;

    const { error } = await this.supabaseService.atualizarVaga(vaga.id, { ativa: novoStatus });
    this.processandoId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao alterar status da vaga: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.vagas.update(lista =>
      lista.map(v => v.id === vaga.id ? { ...v, ativa: novoStatus } : v)
    );
    this.mensagemSucesso.set(`Vaga "${vaga.titulo}" foi ${novoStatus ? 'ativada' : 'pausada'} com sucesso.`);
  }

  abrirModalNovaVaga(): void {
    this.vagaEditando.set(null);
    this.formTitulo.set('');
    this.formEmpresa.set('');
    this.formDescricao.set('');
    this.formLocalizacao.set('');
    this.formTipoContrato.set('CLT');
    this.formRemuneracao.set('');
    this.formRequisitos.set('');
    this.formBeneficios.set('');
    this.formAtiva.set(true);
    this.modalAberto.set(true);
  }

  abrirModalEditarVaga(vaga: VagaAdminItem): void {
    this.vagaEditando.set(vaga);
    this.formTitulo.set(vaga.titulo || '');
    this.formEmpresa.set(vaga.empresa || '');
    this.formDescricao.set(vaga.descricao || '');
    this.formLocalizacao.set(vaga.localizacao || '');
    this.formTipoContrato.set(vaga.tipo_contrato || 'CLT');
    this.formRemuneracao.set(vaga.remuneracao || '');
    
    const reqStr = Array.isArray(vaga.requisitos) ? vaga.requisitos.join('\n') : (vaga.requisitos || '');
    this.formRequisitos.set(reqStr);

    const benStr = Array.isArray(vaga.beneficios) ? vaga.beneficios.join('\n') : (vaga.beneficios || '');
    this.formBeneficios.set(benStr);

    this.formAtiva.set(vaga.ativa ?? true);
    this.modalAberto.set(true);
  }

  fecharModalVaga(): void {
    this.modalAberto.set(false);
    this.vagaEditando.set(null);
  }

  async salvarVaga(): Promise<void> {
    const titulo = this.formTitulo().trim();
    const descricao = this.formDescricao().trim();
    if (!titulo || !descricao) return;

    this.salvandoVaga.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const dados = {
      titulo,
      empresa: this.formEmpresa().trim(),
      descricao,
      localizacao: this.formLocalizacao().trim(),
      tipo_contrato: this.formTipoContrato(),
      remuneracao: this.formRemuneracao().trim(),
      requisitos: this.formRequisitos().trim(),
      beneficios: this.formBeneficios().trim(),
      ativa: this.formAtiva()
    };

    const editando = this.vagaEditando();
    if (editando) {
      const { error } = await this.supabaseService.atualizarVaga(editando.id, dados);
      this.salvandoVaga.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao atualizar vaga: ' + (error.message || 'Tente novamente.'));
        return;
      }

      this.vagas.update(lista =>
        lista.map(v => v.id === editando.id ? { ...v, ...dados } : v)
      );
      this.mensagemSucesso.set(`Vaga "${titulo}" atualizada com sucesso.`);
    } else {
      const { error, data } = await this.supabaseService.criarVaga(dados);
      this.salvandoVaga.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao criar vaga: ' + (error.message || 'Tente novamente.'));
        return;
      }

      if (data) {
        this.vagas.update(lista => [data, ...lista]);
      } else {
        await this.carregarVagas();
      }
      this.mensagemSucesso.set(`Vaga "${titulo}" criada e publicada com sucesso.`);
    }

    this.fecharModalVaga();
  }

  async executarExcluirVaga(vagaId: string): Promise<void> {
    this.processandoId.set(vagaId);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const { error } = await this.supabaseService.excluirVaga(vagaId);
    this.processandoId.set(null);
    this.confirmarExclusaoVagaId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao excluir vaga: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.vagas.update(lista => lista.filter(v => v.id !== vagaId));
    this.mensagemSucesso.set('Vaga excluída com sucesso.');
  }

  async abrirCandidaturas(vaga: VagaAdminItem): Promise<void> {
    this.vagaSelecionadaCandidaturas.set(vaga);
    this.modalCandidaturasAberto.set(true);
    this.carregandoCandidaturas.set(true);
    try {
      const lista = await this.supabaseService.listarCandidaturasDaVaga(vaga.id);
      this.candidaturas.set(lista);
    } catch (e: any) {
      console.warn('Erro ao carregar candidaturas:', e);
      this.candidaturas.set([]);
    } finally {
      this.carregandoCandidaturas.set(false);
    }
  }

  fecharModalCandidaturas(): void {
    this.modalCandidaturasAberto.set(false);
    this.vagaSelecionadaCandidaturas.set(null);
    this.candidaturas.set([]);
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return 'Recente';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return 'Recente';
    }
  }
}
