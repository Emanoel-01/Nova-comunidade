import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

interface EventoAdminItem {
  id: string;
  titulo: string;
  descricao?: string;
  data_hora: string;
  tag?: string;
  plataforma?: string;
  palestrante?: string;
  cargo_palestrante?: string;
  link_transmissao?: string;
  criado_em?: string;
  total_inscritos?: number;
}

interface InscritoEventoItem {
  id: string;
  evento_id: string;
  profissional_id: string;
  criado_em?: string;
  inscrito?: {
    id: string;
    full_name?: string;
    professional_title?: string;
    email?: string;
  } | null;
}

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Gestão do Calendário de Eventos & Masterclasses
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Agende webinars, controle transmissões ao vivo e visualize a lista de profissionais inscritos.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            (click)="carregarEventos()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar lista"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            (click)="abrirModalNovo()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      <!-- Alertas de Feedback -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-emerald-950">Sucesso!</p>
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
            ✕
          </button>
        </div>
      }

      <!-- Barra de Filtros e Busca -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <!-- Filtro por Época -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            type="button"
            (click)="filtroEpoca.set('todos')"
            [class]="filtroEpoca() === 'todos'
              ? 'px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Todos ({{ eventos().length }})
          </button>
          <button
            type="button"
            (click)="filtroEpoca.set('futuros')"
            [class]="filtroEpoca() === 'futuros'
              ? 'px-3 py-1.5 rounded-lg bg-white text-indigo-700 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Agendados / Futuros ({{ totalFuturos() }})
          </button>
          <button
            type="button"
            (click)="filtroEpoca.set('passados')"
            [class]="filtroEpoca() === 'passados'
              ? 'px-3 py-1.5 rounded-lg bg-white text-slate-700 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Encerrados ({{ totalPassados() }})
          </button>
        </div>

        <!-- Campo de Busca -->
        <div class="relative min-w-[240px]">
          <input
            type="text"
            [value]="termoBusca()"
            (input)="onBuscaInput($event)"
            placeholder="Buscar por título, palestrante ou tag..."
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Lista de Eventos -->
      @if (carregando()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="inline-flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <svg class="w-4 h-4 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Carregando eventos do Supabase...</span>
          </div>
        </div>
      } @else if (eventosFiltrados().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-900">Nenhum evento encontrado</p>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Não há eventos correspondentes aos filtros selecionados. Clique em "Novo Evento" para agendar uma nova sessão.
          </p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (evento of eventosFiltrados(); track evento.id) {
            @let isFuturo = isEventoFuturo(evento.data_hora);
            
            <div
              [class]="isFuturo ? 'border-indigo-200/90 bg-white' : 'border-slate-200 bg-slate-50/70'"
              class="rounded-3xl border p-5 sm:p-6 shadow-xs transition-all space-y-4"
            >
              
              <!-- Topo do Card -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <!-- Badge de Data + Tags -->
                <div class="flex items-center gap-3.5">
                  @let badge = getDataBadge(evento.data_hora);
                  <div
                    [class]="isFuturo ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'"
                    class="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-xs shrink-0"
                  >
                    <span class="text-lg font-black leading-none">{{ badge.dia }}</span>
                    <span class="text-[11px] font-bold uppercase tracking-wider" [class]="isFuturo ? 'text-indigo-200' : 'text-slate-500'">{{ badge.mes }}</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      @if (evento.tag) {
                        <span
                          [class]="isFuturo ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-200 text-slate-700 border-slate-300'"
                          class="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                        >
                          {{ evento.tag }}
                        </span>
                      }
                      <span class="text-xs text-slate-500 font-bold">
                        {{ formatarDataHora(evento.data_hora) }}
                      </span>
                      <span
                        [class]="isFuturo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-600 border-slate-300'"
                        class="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                      >
                        {{ isFuturo ? 'Agendado' : 'Encerrado' }}
                      </span>
                    </div>

                    @if (evento.plataforma) {
                      <p class="text-xs text-slate-400 font-medium pt-0.5">
                        Plataforma: <strong>{{ evento.plataforma }}</strong>
                      </p>
                    }
                  </div>
                </div>

                <!-- Ações do Topo -->
                <div class="flex items-center gap-2 self-start sm:self-auto">
                  
                  <!-- Ver Inscritos -->
                  <button
                    type="button"
                    (click)="abrirModalInscritos(evento)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Ver participantes inscritos"
                  >
                    <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{{ evento.total_inscritos ?? 0 }} inscritos</span>
                  </button>

                  <!-- Editar -->
                  <button
                    type="button"
                    (click)="abrirModalEdicao(evento)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Editar Evento"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Excluir (2 cliques) -->
                  @if (confirmarExclusaoId() === evento.id) {
                    <div class="inline-flex items-center gap-1 animate-fadeIn">
                      <button
                        type="button"
                        (click)="executarExclusao(evento.id)"
                        [disabled]="processandoExclusao() === evento.id"
                        class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        @if (processandoExclusao() === evento.id) {
                          <span>...</span>
                        } @else {
                          <span>Confirmar?</span>
                        }
                      </button>
                      <button
                        type="button"
                        (click)="confirmarExclusaoId.set(null)"
                        class="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="confirmarExclusaoId.set(evento.id)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir Evento"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  }

                </div>
              </div>

              <!-- Título & Descrição -->
              <div class="space-y-2">
                <h4 class="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {{ evento.titulo }}
                </h4>
                @if (evento.descricao) {
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ evento.descricao }}
                  </p>
                }
              </div>

              <!-- Detalhes Extras: Palestrante + Link -->
              <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                @if (evento.palestrante) {
                  <div class="flex items-center gap-2 text-slate-700">
                    <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                      👨‍🏫
                    </span>
                    <div>
                      <span class="font-bold">{{ evento.palestrante }}</span>
                      @if (evento.cargo_palestrante) {
                        <span class="text-slate-400"> ({{ evento.cargo_palestrante }})</span>
                      }
                    </div>
                  </div>
                } @else {
                  <div></div>
                }

                @if (evento.link_transmissao) {
                  <a
                    [href]="evento.link_transmissao"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Link da Transmissão / Gravação</span>
                  </a>
                }
              </div>

            </div>
          }
        </div>
      }

      <!-- MODAL DE CADASTRO / EDIÇÃO DE EVENTO -->
      @if (modalAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scaleUp">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="space-y-1">
                <h4 class="text-lg sm:text-xl font-black text-slate-900">
                  {{ eventoEmEdicao() ? 'Editar Evento' : 'Agendar Novo Evento' }}
                </h4>
                <p class="text-xs text-slate-500">
                  Defina os detalhes, data e plataforma da sessão técnica.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModal()"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form (submit)="salvarEvento($event)" class="space-y-4">
              
              <!-- Título -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  Título do Evento <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="formTitulo()"
                  (input)="formTitulo.set($any($event.target).value)"
                  placeholder="Ex: Masterclass: Perícias de Engenharia em Patologias de Fachada"
                  required
                  class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <!-- Data e Hora & Tag -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Data e Horário <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    [value]="formDataHora()"
                    (input)="formDataHora.set($any($event.target).value)"
                    required
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Tag / Formato
                  </label>
                  <input
                    type="text"
                    [value]="formTag()"
                    (input)="formTag.set($any($event.target).value)"
                    placeholder="Ex: Webinar Ao Vivo, Masterclass, Workshop"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <!-- Plataforma & Palestrante -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Plataforma
                  </label>
                  <input
                    type="text"
                    [value]="formPlataforma()"
                    (input)="formPlataforma.set($any($event.target).value)"
                    placeholder="Ex: Google Meet, Zoom, YouTube Live"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Palestrante / Facilitador
                  </label>
                  <input
                    type="text"
                    [value]="formPalestrante()"
                    (input)="formPalestrante.set($any($event.target).value)"
                    placeholder="Ex: Eng. Emanoel Amorim"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <!-- Cargo do Palestrante & Link de Transmissão -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Cargo / Bio Curta do Palestrante
                  </label>
                  <input
                    type="text"
                    [value]="formCargoPalestrante()"
                    (input)="formCargoPalestrante.set($any($event.target).value)"
                    placeholder="Ex: Especialista em Patologia das Construções"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Link de Acesso / Transmissão
                  </label>
                  <input
                    type="url"
                    [value]="formLinkTransmissao()"
                    (input)="formLinkTransmissao.set($any($event.target).value)"
                    placeholder="https://meet.google.com/... ou https://..."
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-mono text-slate-800"
                  />
                </div>
              </div>

              <!-- Descrição -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  Descrição e Tópicos Abordados
                </label>
                <textarea
                  rows="4"
                  [value]="formDescricao()"
                  (input)="formDescricao.set($any($event.target).value)"
                  placeholder="Detalhe o cronograma, objetivos técnicos da sessão e materiais de apoio..."
                  class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none leading-relaxed"
                ></textarea>
              </div>

              <!-- Rodapé do Modal -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="fecharModal()"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  [disabled]="salvando()"
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  @if (salvando()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Salvando...</span>
                  } @else {
                    <span>{{ eventoEmEdicao() ? 'Salvar Alterações' : 'Agendar Evento' }}</span>
                  }
                </button>
              </div>

            </form>

          </div>
        </div>
      }

      <!-- MODAL DE PARTICIPANTES INSCRITOS -->
      @if (modalInscritosAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scaleUp">
            
            <!-- Topo do Modal -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="space-y-1">
                <h4 class="text-lg sm:text-xl font-black text-slate-900">
                  Participantes Inscritos
                </h4>
                <p class="text-xs text-slate-500">
                  Evento: <strong class="text-slate-800">{{ eventoSelecionadoParaInscritos()?.titulo }}</strong>
                </p>
              </div>
              <button
                type="button"
                (click)="modalInscritosAberto.set(false)"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Conteúdo de Inscritos -->
            @if (carregandoInscritos()) {
              <div class="py-12 text-center text-slate-500 text-xs font-semibold">
                <div class="inline-flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Carregando inscrições...</span>
                </div>
              </div>
            } @else if (listaInscritos().length === 0) {
              <div class="py-10 text-center space-y-2">
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p class="text-xs font-bold text-slate-700">Nenhum membro inscrito ainda</p>
                <p class="text-[11px] text-slate-400">Assim que os colegas garantirem suas vagas, eles aparecerão aqui.</p>
              </div>
            } @else {
              <div class="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                @for (item of listaInscritos(); track item.id) {
                  <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {{ getIniciais(item.inscrito?.full_name) }}
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900">
                          {{ item.inscrito?.full_name || 'Profissional da Comunidade' }}
                        </div>
                        <div class="text-[11px] text-slate-500">
                          {{ item.inscrito?.professional_title || item.inscrito?.email || 'Membro' }}
                        </div>
                      </div>
                    </div>

                    @if (item.criado_em) {
                      <div class="text-right shrink-0">
                        <span class="text-[11px] text-slate-400 font-medium">
                          {{ formatarDataCurta(item.criado_em) }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                (click)="modalInscritosAberto.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
export class AdminEventosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly eventos = signal<EventoAdminItem[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);
  readonly processandoExclusao = signal<string | null>(null);
  readonly confirmarExclusaoId = signal<string | null>(null);

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Filtros
  readonly filtroEpoca = signal<'todos' | 'futuros' | 'passados'>('todos');
  readonly termoBusca = signal<string>('');

  // Modal de Cadastro/Edição
  readonly modalAberto = signal<boolean>(false);
  readonly eventoEmEdicao = signal<EventoAdminItem | null>(null);

  readonly formTitulo = signal<string>('');
  readonly formDescricao = signal<string>('');
  readonly formDataHora = signal<string>('');
  readonly formTag = signal<string>('Webinar Ao Vivo');
  readonly formPlataforma = signal<string>('Google Meet');
  readonly formPalestrante = signal<string>('');
  readonly formCargoPalestrante = signal<string>('');
  readonly formLinkTransmissao = signal<string>('');

  // Modal de Inscritos
  readonly modalInscritosAberto = signal<boolean>(false);
  readonly eventoSelecionadoParaInscritos = signal<EventoAdminItem | null>(null);
  readonly carregandoInscritos = signal<boolean>(false);
  readonly listaInscritos = signal<InscritoEventoItem[]>([]);

  // Computed
  readonly totalFuturos = computed(() => {
    const agora = new Date();
    return this.eventos().filter(e => new Date(e.data_hora) >= agora).length;
  });

  readonly totalPassados = computed(() => {
    const agora = new Date();
    return this.eventos().filter(e => new Date(e.data_hora) < agora).length;
  });

  readonly eventosFiltrados = computed(() => {
    let lista = this.eventos();
    const agora = new Date();

    if (this.filtroEpoca() === 'futuros') {
      lista = lista.filter(e => new Date(e.data_hora) >= agora);
    } else if (this.filtroEpoca() === 'passados') {
      lista = lista.filter(e => new Date(e.data_hora) < agora);
    }

    const termo = this.termoBusca().toLowerCase().trim();
    if (termo) {
      lista = lista.filter(e =>
        e.titulo.toLowerCase().includes(termo) ||
        (e.palestrante && e.palestrante.toLowerCase().includes(termo)) ||
        (e.tag && e.tag.toLowerCase().includes(termo)) ||
        (e.descricao && e.descricao.toLowerCase().includes(termo))
      );
    }

    return lista;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarEventos();
  }

  async carregarEventos(): Promise<void> {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    try {
      const lista = await this.supabaseService.listarTodosEventosAdmin();
      this.eventos.set(lista);
    } catch (e: any) {
      this.mensagemErro.set('Erro ao carregar eventos: ' + (e?.message || e));
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.termoBusca.set(val);
  }

  isEventoFuturo(dataHoraStr: string): boolean {
    if (!dataHoraStr) return true;
    try {
      return new Date(dataHoraStr) >= new Date();
    } catch {
      return true;
    }
  }

  getDataBadge(dataHoraStr: string | undefined): { dia: string; mes: string } {
    if (!dataHoraStr) return { dia: '--', mes: '---' };
    try {
      const d = new Date(dataHoraStr);
      if (isNaN(d.getTime())) return { dia: '--', mes: '---' };
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
      return { dia, mes };
    } catch {
      return { dia: '--', mes: '---' };
    }
  }

  formatarDataHora(dataHoraStr: string | undefined): string {
    if (!dataHoraStr) return 'A definir';
    try {
      const d = new Date(dataHoraStr);
      if (isNaN(d.getTime())) return dataHoraStr;
      const dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      const horaFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${dataFormatada} às ${horaFormatada}`;
    } catch {
      return dataHoraStr;
    }
  }

  formatarDataCurta(dataHoraStr: string | undefined): string {
    if (!dataHoraStr) return '';
    try {
      const d = new Date(dataHoraStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return '';
    }
  }

  getIniciais(nome?: string): string {
    if (!nome) return 'ME';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  abrirModalNovo(): void {
    this.eventoEmEdicao.set(null);
    this.formTitulo.set('');
    this.formDescricao.set('');
    
    // Default dataHora: amanhã às 19:00 no formato YYYY-MM-DDTHH:mm
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(19, 0, 0, 0);
    const isoFormat = d.toISOString().slice(0, 16);
    this.formDataHora.set(isoFormat);

    this.formTag.set('Webinar Ao Vivo');
    this.formPlataforma.set('Google Meet');
    this.formPalestrante.set('Eng. Emanoel Amorim');
    this.formCargoPalestrante.set('Fundador & Engenheiro Civil');
    this.formLinkTransmissao.set('');
    this.modalAberto.set(true);
  }

  abrirModalEdicao(evento: EventoAdminItem): void {
    this.eventoEmEdicao.set(evento);
    this.formTitulo.set(evento.titulo);
    this.formDescricao.set(evento.descricao || '');

    // Formata data_hora para datetime-local
    try {
      const d = new Date(evento.data_hora);
      const isoFormat = isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
      this.formDataHora.set(isoFormat);
    } catch {
      this.formDataHora.set('');
    }

    this.formTag.set(evento.tag || 'Webinar Ao Vivo');
    this.formPlataforma.set(evento.plataforma || 'Google Meet');
    this.formPalestrante.set(evento.palestrante || '');
    this.formCargoPalestrante.set(evento.cargo_palestrante || '');
    this.formLinkTransmissao.set(evento.link_transmissao || '');
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.eventoEmEdicao.set(null);
  }

  async salvarEvento(event: Event): Promise<void> {
    event.preventDefault();
    const titulo = this.formTitulo().trim();
    const dataHoraRaw = this.formDataHora();
    if (!titulo || !dataHoraRaw) return;

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const dataHoraIso = new Date(dataHoraRaw).toISOString();

    const dados = {
      titulo,
      descricao: this.formDescricao().trim(),
      data_hora: dataHoraIso,
      tag: this.formTag().trim(),
      plataforma: this.formPlataforma().trim(),
      palestrante: this.formPalestrante().trim(),
      cargo_palestrante: this.formCargoPalestrante().trim(),
      link_transmissao: this.formLinkTransmissao().trim(),
    };

    const edicao = this.eventoEmEdicao();

    if (edicao) {
      const { error } = await this.supabaseService.atualizarEvento(edicao.id, dados);
      this.salvando.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao atualizar evento: ' + error.message);
        return;
      }

      this.eventos.update(lista =>
        lista.map(e => (e.id === edicao.id ? { ...e, ...dados } : e))
      );
      this.mensagemSucesso.set(`Evento "${titulo}" atualizado com sucesso!`);
      this.fecharModal();
    } else {
      const { error, data } = await this.supabaseService.criarEvento(dados);
      this.salvando.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao criar evento: ' + error.message);
        return;
      }

      const novoEvento: EventoAdminItem = data || {
        id: 'tmp_' + Date.now(),
        ...dados,
        total_inscritos: 0,
      };

      this.eventos.update(lista => [novoEvento, ...lista]);
      this.mensagemSucesso.set(`Evento "${titulo}" agendado com sucesso!`);
      this.fecharModal();
    }
  }

  async executarExclusao(id: string): Promise<void> {
    this.processandoExclusao.set(id);
    this.mensagemErro.set(null);

    const { error } = await this.supabaseService.excluirEvento(id);
    this.processandoExclusao.set(null);
    this.confirmarExclusaoId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao excluir evento: ' + error.message);
      return;
    }

    this.eventos.update(lista => lista.filter(e => e.id !== id));
    this.mensagemSucesso.set('Evento e inscrições vinculadas excluídos com sucesso.');
  }

  async abrirModalInscritos(evento: EventoAdminItem): Promise<void> {
    this.eventoSelecionadoParaInscritos.set(evento);
    this.modalInscritosAberto.set(true);
    this.carregandoInscritos.set(true);
    this.listaInscritos.set([]);

    try {
      const inscritos = await this.supabaseService.listarInscritosDoEvento(evento.id);
      this.listaInscritos.set(inscritos);
    } catch (e: any) {
      console.warn('Erro ao listar inscritos:', e);
    } finally {
      this.carregandoInscritos.set(false);
    }
  }
}
