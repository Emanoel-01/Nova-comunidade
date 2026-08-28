import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

interface NotificacaoItem {
  id: string;
  titulo: string;
  mensagem: string;
  tipo?: string;
  destinatario_id?: string | null;
  criado_em?: string;
  criado_por?: string;
}

interface MembroSelecionado {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  nivel_atual?: string | null;
}

@Component({
  selector: 'app-admin-notificacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Central de Notificações
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Envie comunicados segmentados por perfil, módulo, membros individuais ou broadcast multi-canal.
          </p>
        </div>

        <button
          type="button"
          (click)="carregarDadosIniciais()"
          [disabled]="carregando()"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          title="Atualizar lista"
        >
          <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      <!-- Alertas de Feedback -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-emerald-950">Disparo concluído!</p>
              <p class="text-emerald-800 leading-relaxed">{{ mensagemSucesso() }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
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
            ✕
          </button>
        </div>
      }

      <!-- Bloco Especial: JSON do Predial 4.0 Gerado -->
      @if (jsonPredialGerado()) {
        <div class="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 space-y-3 shadow-lg animate-fadeIn">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                JSON
              </div>
              <div>
                <h5 class="text-sm font-bold text-white">Canal Predial 4.0 — Snippet de Aviso</h5>
                <p class="text-xs text-slate-400">Cole este bloco no array do arquivo <code class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">avisos.json</code> na raiz do repositório Predial 4.0.</p>
              </div>
            </div>

            <button
              type="button"
              (click)="copiarJsonPredial()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              [ngClass]="copiadoSucesso() ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'"
            >
              @if (copiadoSucesso()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copiado! ✓</span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copiar JSON</span>
              }
            </button>
          </div>

          <pre class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto selection:bg-emerald-900 selection:text-white leading-relaxed">{{ jsonPredialGerado() }}</pre>
        </div>
      }

      <!-- Formulário de Envio de Notificação -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900">
              Nova Notificação & Comunicado
            </h4>
            <p class="text-xs text-slate-500">
              Configure os destinatários e selecione os canais de entrega simultâneos.
            </p>
          </div>
        </div>

        <form (submit)="enviarNotificacao($event)" class="space-y-5">
          
          <!-- 1. SELETOR DE DESTINATÁRIOS (4 MODOS MUTUAMENTE EXCLUSIVOS) -->
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Selecione os Destinatários
            </label>

            <!-- Abas / Radio Cards de Modo -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
              
              <!-- Modo: Todos -->
              <button
                type="button"
                (click)="selecionarModo('todos')"
                class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1"
                [ngClass]="modoDestinatario() === 'todos' ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Todos os Membros</span>
                  <span class="w-3 h-3 rounded-full border flex items-center justify-center" [ngClass]="modoDestinatario() === 'todos' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'">
                    @if (modoDestinatario() === 'todos') {
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    }
                  </span>
                </div>
                <span class="text-[11px] text-slate-500 leading-tight">Broadcast geral para toda a comunidade</span>
              </button>

              <!-- Modo: Por Perfil -->
              <button
                type="button"
                (click)="selecionarModo('perfil')"
                class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1"
                [ngClass]="modoDestinatario() === 'perfil' ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Por Perfil de Acesso</span>
                  <span class="w-3 h-3 rounded-full border flex items-center justify-center" [ngClass]="modoDestinatario() === 'perfil' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'">
                    @if (modoDestinatario() === 'perfil') {
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    }
                  </span>
                </div>
                <span class="text-[11px] text-slate-500 leading-tight">Filtra por nível (Trainee, Especialista, etc.)</span>
              </button>

              <!-- Modo: Por Módulo -->
              <button
                type="button"
                (click)="selecionarModo('modulo')"
                class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1"
                [ngClass]="modoDestinatario() === 'modulo' ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Por Módulo Liberado</span>
                  <span class="w-3 h-3 rounded-full border flex items-center justify-center" [ngClass]="modoDestinatario() === 'modulo' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'">
                    @if (modoDestinatario() === 'modulo') {
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    }
                  </span>
                </div>
                <span class="text-[11px] text-slate-500 leading-tight">Quem tem permissão em um módulo ativo</span>
              </button>

              <!-- Modo: Individual -->
              <button
                type="button"
                (click)="selecionarModo('individual')"
                class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1"
                [ngClass]="modoDestinatario() === 'individual' ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950' : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">Membros Individuais</span>
                  <span class="w-3 h-3 rounded-full border flex items-center justify-center" [ngClass]="modoDestinatario() === 'individual' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'">
                    @if (modoDestinatario() === 'individual') {
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    }
                  </span>
                </div>
                <span class="text-[11px] text-slate-500 leading-tight">Escolha membros específicos com busca</span>
              </button>

            </div>

            <!-- Painéis Contextuais de Segmentação -->
            @if (modoDestinatario() === 'perfil') {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                <label class="block text-xs font-bold text-slate-700">Selecione o Perfil de Acesso:</label>
                <select
                  #perfilSelect
                  [value]="perfilSelecionado()"
                  (change)="perfilSelecionado.set(perfilSelect.value)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  @for (perfil of listaPerfis(); track perfil) {
                    <option [value]="perfil">{{ perfil }}</option>
                  }
                </select>
                <p class="text-[11px] text-slate-500">A notificação será direcionada aos membros registrados com o perfil <strong>{{ perfilSelecionado() }}</strong>.</p>
              </div>
            }

            @if (modoDestinatario() === 'modulo') {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-fadeIn">
                <label class="block text-xs font-bold text-slate-700">Selecione o Módulo Ativo:</label>
                <select
                  #moduloSelect
                  [value]="moduloSelecionado()"
                  (change)="moduloSelecionado.set(moduloSelect.value)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Selecione um módulo --</option>
                  @for (mod of listaModulos(); track mod) {
                    <option [value]="mod">{{ formatarNomeModulo(mod) }} ({{ mod }})</option>
                  }
                </select>
                <p class="text-[11px] text-slate-500">Apenas os profissionais que possuem a flag de liberação ativa para este módulo receberão o comunicado.</p>
              </div>
            }

            @if (modoDestinatario() === 'individual') {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-slate-700">Buscar e Adicionar Membros:</label>
                  <span class="text-xs font-semibold text-indigo-700">
                    {{ membrosSelecionados().length }} membro(s) selecionado(s)
                  </span>
                </div>

                <!-- Input com Autocomplete -->
                <div class="relative">
                  <div class="relative">
                    <input
                      type="text"
                      #buscaInput
                      [value]="termoBusca()"
                      (input)="aoDigitarBusca(buscaInput.value)"
                      placeholder="Digite o nome ou e-mail do membro..."
                      class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <!-- Dropdown de Resultados da Busca -->
                  @if (buscandoMembros()) {
                    <div class="absolute left-0 right-0 mt-1 p-3 rounded-xl bg-white border border-slate-200 shadow-lg text-center text-xs text-slate-500 z-20">
                      Buscando membros...
                    </div>
                  } @else if (resultadosBusca().length > 0) {
                    <div class="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100 z-20">
                      @for (membro of resultadosBusca(); track membro.id) {
                        <button
                          type="button"
                          (click)="adicionarMembro(membro)"
                          class="w-full p-2.5 text-left hover:bg-indigo-50 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                        >
                          <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              @if (membro.avatar_url) {
                                <img [src]="membro.avatar_url" [alt]="membro.full_name" class="w-full h-full object-cover" />
                              } @else {
                                <span>{{ obterIniciais(membro.full_name) }}</span>
                              }
                            </div>
                            <div class="min-w-0">
                              <p class="text-xs font-bold text-slate-900 truncate">{{ membro.full_name }}</p>
                              <p class="text-[11px] text-slate-500 truncate">{{ membro.email }}</p>
                            </div>
                          </div>
                          <span class="text-[11px] font-semibold text-indigo-600 shrink-0">
                            + Adicionar
                          </span>
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- Chips dos Membros Selecionados -->
                @if (membrosSelecionados().length > 0) {
                  <div class="flex flex-wrap gap-2 pt-1">
                    @for (membro of membrosSelecionados(); track membro.id) {
                      <div class="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-950 text-xs font-medium shadow-2xs">
                        <div class="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                          @if (membro.avatar_url) {
                            <img [src]="membro.avatar_url" [alt]="membro.full_name" class="w-full h-full object-cover" />
                          } @else {
                            <span>{{ obterIniciais(membro.full_name) }}</span>
                          }
                        </div>
                        <span class="truncate max-w-[150px]">{{ membro.full_name }}</span>
                        <button
                          type="button"
                          (click)="removerMembro(membro.id)"
                          class="w-4 h-4 rounded-full hover:bg-indigo-300/80 flex items-center justify-center text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                          title="Remover membro"
                        >
                          ✕
                        </button>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                    Adicione pelo menos 1 membro na lista acima para habilitar o envio individual.
                  </p>
                }
              </div>
            }
          </div>

          <!-- 2. SELETOR DE CANAIS INDEPENDENTES -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Canais de Disparo (Simultâneos)
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <!-- Canal: Sino Comunidade -->
              <label
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                [ngClass]="canalSino() ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-600'"
              >
                <input
                  type="checkbox"
                  [checked]="canalSino()"
                  (change)="canalSino.set(!canalSino())"
                  class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer mt-0.5"
                />
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-slate-900 block">Sino da Comunidade</span>
                  <p class="text-[11px] text-slate-500 leading-tight">Alerta no ícone de notificações do portal.</p>
                </div>
              </label>

              <!-- Canal: E-mail Resend -->
              <label
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                [ngClass]="canalEmail() ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-600'"
              >
                <input
                  type="checkbox"
                  [checked]="canalEmail()"
                  (change)="canalEmail.set(!canalEmail())"
                  class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer mt-0.5"
                />
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-slate-900 block">E-mail via Resend</span>
                  <p class="text-[11px] text-slate-500 leading-tight">Disparo com layout AmorimTech.</p>
                </div>
              </label>

              <!-- Canal: Predial 4.0 -->
              <label
                class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                [ngClass]="canalPredial() ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-400' : 'bg-slate-50 border-slate-200 text-slate-600'"
              >
                <input
                  type="checkbox"
                  [checked]="canalPredial()"
                  (change)="canalPredial.set(!canalPredial())"
                  class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer mt-0.5"
                />
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-slate-900 block">Aviso no Predial 4.0</span>
                  <p class="text-[11px] text-slate-500 leading-tight">Gera JSON formatado pronto para cópia.</p>
                </div>
              </label>

            </div>

            @if (!canalSino() && !canalEmail() && !canalPredial()) {
              <p class="text-xs text-rose-600 font-semibold pt-1">
                ⚠️ Selecione pelo menos um canal de envio para prosseguir.
              </p>
            }
          </div>

          <!-- 3. CONTEÚDO DO COMUNICADO -->
          <div class="space-y-3 pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              3. Conteúdo da Mensagem
            </label>

            <!-- Campo Título -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Título da Notificação *</label>
              <input
                type="text"
                #tituloInput
                [value]="formTitulo"
                (input)="formTitulo = tituloInput.value"
                placeholder="Ex: Nova Masterclass de Inspeção Predial disponível!"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <!-- Campo Mensagem -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Mensagem *</label>
              <textarea
                #mensagemInput
                rows="3"
                [value]="formMensagem"
                (input)="formMensagem = mensagemInput.value"
                placeholder="Escreva a mensagem completa que os membros visualizarão..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
              ></textarea>
            </div>
          </div>

          <!-- Ação de Envio -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <span class="text-[11px] text-slate-400">
              * Título, mensagem e ao menos 1 canal são obrigatórios
            </span>

            <button
              type="submit"
              [disabled]="enviando() || !formularioValido()"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (enviando()) {
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Processando Disparo...</span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{{ obterTextoBotaoEnvio() }}</span>
              }
            </button>
          </div>

        </form>
      </div>

      <!-- Histórico de Notificações Enviadas -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Histórico de Notificações Registradas</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {{ notificacoes().length }}
            </span>
          </h4>
        </div>

        @if (carregando()) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500 font-medium">Carregando histórico de notificações...</p>
          </div>
        } @else if (notificacoes().length === 0) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h5 class="text-sm font-bold text-slate-800">Nenhuma notificação enviada ainda.</h5>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Use o formulário acima para disparar comunicados segmentados ou broadcast.</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (notif of notificacoes(); track notif.id) {
              <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    @if (!notif.destinatario_id) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                        Broadcast Geral
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                        Segmentada / Individual
                      </span>
                    }

                    <h5 class="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {{ notif.titulo }}
                    </h5>
                  </div>

                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ notif.mensagem }}
                  </p>

                  <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatarData(notif.criado_em) }}</span>
                    </span>
                  </div>
                </div>

                <!-- Botão de Exclusão com Confirmação em Dois Cliques -->
                <div class="shrink-0 self-end sm:self-start">
                  @if (confirmandoExclusaoId() === notif.id) {
                    <div class="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-scaleUp">
                      <button
                        type="button"
                        (click)="excluirNotificacao(notif.id)"
                        class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirmar?
                      </button>
                      <button
                        type="button"
                        (click)="confirmandoExclusaoId.set(null)"
                        class="px-2 py-1 rounded-lg text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="confirmandoExclusaoId.set(notif.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
                      title="Excluir notificação"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Excluir</span>
                    </button>
                  }
                </div>

              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class AdminNotificacoesComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly notificacoes = signal<NotificacaoItem[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly enviando = signal<boolean>(false);
  readonly confirmandoExclusaoId = signal<string | null>(null);

  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  // 1. Modo Destinatário
  readonly modoDestinatario = signal<'todos' | 'perfil' | 'modulo' | 'individual'>('todos');
  readonly listaPerfis = signal<string[]>([
    'Membro Free',
    'Membro Trainee',
    'Perito Júnior',
    'Especialista 4.0',
    'Administrador Geral',
  ]);
  readonly perfilSelecionado = signal<string>('Membro Trainee');

  readonly listaModulos = signal<string[]>([]);
  readonly moduloSelecionado = signal<string>('');

  readonly termoBusca = signal<string>('');
  readonly buscandoMembros = signal<boolean>(false);
  readonly resultadosBusca = signal<MembroSelecionado[]>([]);
  readonly membrosSelecionados = signal<MembroSelecionado[]>([]);

  // 2. Canais de Envio
  readonly canalSino = signal<boolean>(true);
  readonly canalEmail = signal<boolean>(false);
  readonly canalPredial = signal<boolean>(false);

  // 3. Conteúdo
  formTitulo = '';
  formMensagem = '';

  // 4. Predial 4.0 Snippet
  readonly jsonPredialGerado = signal<string | null>(null);
  readonly copiadoSucesso = signal<boolean>(false);

  private timeoutBusca: any = null;

  async ngOnInit(): Promise<void> {
    await this.carregarDadosIniciais();
  }

  async carregarDadosIniciais(): Promise<void> {
    await Promise.all([
      this.carregarNotificacoes(),
      this.carregarPerfisAcesso(),
      this.carregarModulosDisponiveis(),
    ]);
  }

  async carregarNotificacoes(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarNotificacoesEnviadas();
      this.notificacoes.set(data || []);
    } catch {
      this.exibirErro('Não foi possível carregar as notificações.');
    } finally {
      this.carregando.set(false);
    }
  }

  async carregarPerfisAcesso(): Promise<void> {
    try {
      const perfis = await this.supabaseService.listarPerfisAcesso();
      if (perfis && perfis.length > 0) {
        const nomesPerfis = perfis.map((p) => p.nome).filter(Boolean);
        const combinados = [...new Set([...this.listaPerfis(), ...nomesPerfis])];
        this.listaPerfis.set(combinados);
      }
    } catch (e) {
      console.warn('Aviso ao carregar perfis_acesso:', e);
    }
  }

  async carregarModulosDisponiveis(): Promise<void> {
    try {
      const modulos = await this.supabaseService.listarModulosDistintosPermissoes();
      const padroes = [
        'feed',
        'forum',
        'cursos',
        'materiais',
        'eventos',
        'networking',
        'vagas',
        'agentes_ia',
        'inspecao_predial',
        'laudos_tecnicos',
        'vistoria_cautelar',
      ];
      const combinados = [...new Set([...modulos, ...padroes])].sort();
      this.listaModulos.set(combinados);
      if (combinados.length > 0 && !this.moduloSelecionado()) {
        this.moduloSelecionado.set(combinados[0]);
      }
    } catch (e) {
      console.warn('Aviso ao carregar módulos:', e);
    }
  }

  selecionarModo(modo: 'todos' | 'perfil' | 'modulo' | 'individual'): void {
    this.modoDestinatario.set(modo);
    this.mensagemErro.set(null);
  }

  aoDigitarBusca(valor: string): void {
    this.termoBusca.set(valor);
    if (this.timeoutBusca) {
      clearTimeout(this.timeoutBusca);
    }

    const termo = valor.trim();
    if (!termo || termo.length < 2) {
      this.resultadosBusca.set([]);
      this.buscandoMembros.set(false);
      return;
    }

    this.buscandoMembros.set(true);
    this.timeoutBusca = setTimeout(async () => {
      try {
        const resultados = await this.supabaseService.buscarProfissionaisParaNotificacao(termo);
        const jaSelecionadosIds = new Set(this.membrosSelecionados().map((m) => m.id));
        const filtrados = (resultados || []).filter((r: any) => !jaSelecionadosIds.has(r.id));
        this.resultadosBusca.set(filtrados);
      } catch {
        this.resultadosBusca.set([]);
      } finally {
        this.buscandoMembros.set(false);
      }
    }, 300);
  }

  adicionarMembro(membro: MembroSelecionado): void {
    this.membrosSelecionados.update((lista) => [...lista, membro]);
    this.resultadosBusca.update((lista) => lista.filter((m) => m.id !== membro.id));
    this.termoBusca.set('');
  }

  removerMembro(id: string): void {
    this.membrosSelecionados.update((lista) => lista.filter((m) => m.id !== id));
  }

  obterIniciais(nome?: string): string {
    if (!nome) return 'U';
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarNomeModulo(mod: string): string {
    return mod
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formularioValido(): boolean {
    const titulo = this.formTitulo.trim();
    const mensagem = this.formMensagem.trim();
    if (!titulo || !mensagem) return false;

    // Ao menos 1 canal
    if (!this.canalSino() && !this.canalEmail() && !this.canalPredial()) {
      return false;
    }

    const modo = this.modoDestinatario();
    if (modo === 'perfil' && !this.perfilSelecionado()) return false;
    if (modo === 'modulo' && !this.moduloSelecionado()) return false;
    if (modo === 'individual' && this.membrosSelecionados().length === 0) return false;

    return true;
  }

  obterTextoBotaoEnvio(): string {
    const modo = this.modoDestinatario();
    if (modo === 'todos') return 'Disparar para Todos os Membros';
    if (modo === 'perfil') return `Disparar para Perfil: ${this.perfilSelecionado()}`;
    if (modo === 'modulo') return `Disparar para Módulo: ${this.formatarNomeModulo(this.moduloSelecionado())}`;
    return `Disparar para ${this.membrosSelecionados().length} membro(s) selecionado(s)`;
  }

  async enviarNotificacao(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.formularioValido()) {
      this.exibirErro('Por favor, preencha todos os campos obrigatórios e configure os destinatários.');
      return;
    }

    const titulo = this.formTitulo.trim();
    const mensagem = this.formMensagem.trim();

    this.enviando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
    this.jsonPredialGerado.set(null);

    try {
      const modo = this.modoDestinatario();
      const destinatariosIds = modo === 'individual'
        ? this.membrosSelecionados().map((m) => m.id)
        : undefined;

      const { error, totalDestinatarios, totalEmailsEnviados, jsonPredial } =
        await this.supabaseService.enviarNotificacaoSegmentada({
          titulo,
          mensagem,
          modoDestinatario: modo,
          perfilNome: modo === 'perfil' ? this.perfilSelecionado() : undefined,
          moduloNome: modo === 'modulo' ? this.moduloSelecionado() : undefined,
          destinatariosIds,
          canalSino: this.canalSino(),
          canalEmail: this.canalEmail(),
          canalPredial: this.canalPredial(),
        });

      if (error) {
        this.exibirErro('Erro ao enviar notificação: ' + error.message);
        return;
      }

      // Se gerou JSON para o Predial 4.0
      if (jsonPredial) {
        this.jsonPredialGerado.set(jsonPredial);
      }

      // Monta mensagem de feedback detalhada
      let feedback = '';
      if (modo === 'todos') {
        feedback = 'Notificação broadcast registrada com sucesso!';
      } else if (modo === 'perfil') {
        feedback = `Notificação enviada para os membros com perfil "${this.perfilSelecionado()}" (${totalDestinatarios ?? 0} destinatário(s)).`;
      } else if (modo === 'modulo') {
        feedback = `Notificação enviada para membros com acesso ao módulo "${this.formatarNomeModulo(this.moduloSelecionado())}" (${totalDestinatarios ?? 0} destinatário(s)).`;
      } else {
        feedback = `Notificação enviada com sucesso para os ${totalDestinatarios ?? this.membrosSelecionados().length} membro(s) selecionado(s).`;
      }

      if (this.canalEmail() && totalEmailsEnviados !== undefined && totalEmailsEnviados > 0) {
        feedback += ` Além disso, ${totalEmailsEnviados} e-mail(s) foram disparados via Resend.`;
      } else if (this.canalEmail()) {
        feedback += ' Disparo de e-mail processado via Resend.';
      }

      if (this.canalPredial()) {
        feedback += ' O JSON para o Predial 4.0 foi gerado abaixo pronto para cópia.';
      }

      this.exibirSucesso(feedback);

      // Limpar campos
      this.formTitulo = '';
      this.formMensagem = '';
      if (modo === 'individual') {
        this.membrosSelecionados.set([]);
      }

      await this.carregarNotificacoes();
    } catch (e: any) {
      this.exibirErro('Falha ao processar disparo: ' + (e?.message || e));
    } finally {
      this.enviando.set(false);
    }
  }

  async copiarJsonPredial(): Promise<void> {
    const json = this.jsonPredialGerado();
    if (!json) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = json;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.copiadoSucesso.set(true);
      setTimeout(() => this.copiadoSucesso.set(false), 3000);
    } catch {
      this.exibirErro('Não foi possível copiar automaticamente para a área de transferência.');
    }
  }

  async excluirNotificacao(id: string): Promise<void> {
    this.confirmandoExclusaoId.set(null);
    try {
      const { error } = await this.supabaseService.excluirNotificacao(id);
      if (error) {
        this.exibirErro('Erro ao excluir notificação: ' + error.message);
        return;
      }

      this.exibirSucesso('Notificação excluída com sucesso.');
      await this.carregarNotificacoes();
    } catch {
      this.exibirErro('Erro ao excluir notificação.');
    }
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return 'Data não informada';
    try {
      const d = new Date(dataIso);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return dataIso;
    }
  }

  private exibirErro(msg: string): void {
    this.mensagemErro.set(msg);
    this.mensagemSucesso.set(null);
  }

  private exibirSucesso(msg: string): void {
    this.mensagemSucesso.set(msg);
    this.mensagemErro.set(null);
  }
}
