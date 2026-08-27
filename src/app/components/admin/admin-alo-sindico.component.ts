import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface AloSindicoLead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  nome_condominio?: string | null;
  condominio?: string | null;
  status: 'novo' | 'em_atendimento' | 'concluido' | 'descartado';
  criado_em?: string;
  created_at?: string;
}

export interface AloSindicoMensagem {
  id?: string;
  lead_id: string;
  role: 'user' | 'model' | 'assistant';
  texto?: string;
  conteudo?: string;
  criado_em?: string;
  created_at?: string;
}

@Component({
  selector: 'app-admin-alo-sindico',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      
      <!-- Topo: Título e Ações -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Atendimento Alô Síndico</span>
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">
            Leads e Conversas com IA
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe em tempo real síndicos e gestores prediais que iniciaram contato pelo site.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="carregarLeads()"
            [disabled]="carregando()"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <!-- Resumo Numérico (Cards) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total de Leads</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">{{ leads().length }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span class="text-xs font-semibold text-amber-700 block uppercase tracking-wider">Novos</span>
          <span class="text-2xl font-black text-amber-600 mt-1 block">{{ totalNovos() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span class="text-xs font-semibold text-blue-700 block uppercase tracking-wider">Em Atendimento</span>
          <span class="text-2xl font-black text-blue-600 mt-1 block">{{ totalEmAtendimento() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span class="text-xs font-semibold text-emerald-700 block uppercase tracking-wider">Concluídos</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">{{ totalConcluidos() }}</span>
        </div>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <input
            type="text"
            [value]="buscaTexto()"
            (input)="onBuscaInput($event)"
            placeholder="Buscar por nome, condomínio, e-mail..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 bg-slate-50"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filtros de Status (Tabs/Pills) -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            (click)="filtroStatus.set('todos')"
            [class]="filtroStatus() === 'todos' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            Todos
          </button>
          <button
            type="button"
            (click)="filtroStatus.set('novo')"
            [class]="filtroStatus() === 'novo' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Novos</span>
            @if (totalNovos() > 0) {
              <span class="w-4 h-4 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">{{ totalNovos() }}</span>
            }
          </button>
          <button
            type="button"
            (click)="filtroStatus.set('em_atendimento')"
            [class]="filtroStatus() === 'em_atendimento' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            Em Atendimento
          </button>
          <button
            type="button"
            (click)="filtroStatus.set('concluido')"
            [class]="filtroStatus() === 'concluido' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            Concluídos
          </button>
        </div>
      </div>

      <!-- Layout 2 Colunas: Lista de Leads à esquerda + Detalhes/Conversa à direita -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Coluna Esquerda: Lista de Leads (5 colunas) -->
        <div class="lg:col-span-5 space-y-3">
          @if (carregando()) {
            <div class="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Carregando leads...</span>
            </div>
          } @else if (leadsFiltrados().length === 0) {
            <div class="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700">Nenhum lead encontrado</p>
              <p class="text-xs text-slate-400">Não há registros para os filtros selecionados.</p>
            </div>
          } @else {
            <div class="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              @for (lead of leadsFiltrados(); track lead.id) {
                <div
                  (click)="selecionarLead(lead)"
                  [class]="leadSelecionado()?.id === lead.id ? 'ring-2 ring-amber-500 bg-amber-50/40 border-amber-300' : 'bg-white hover:bg-slate-50 border-slate-200'"
                  class="p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-xs"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-0.5">
                      <h4 class="text-sm font-bold text-slate-900 leading-tight">
                        {{ lead.nome }}
                      </h4>
                      @if (lead.nome_condominio || lead.condominio) {
                        <p class="text-xs text-amber-700 font-medium flex items-center gap-1">
                          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{{ lead.nome_condominio || lead.condominio }}</span>
                        </p>
                      }
                    </div>

                    <!-- Status Badge -->
                    <span
                      [class]="obterEstiloStatus(lead.status)"
                      class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shrink-0"
                    >
                      {{ formatarStatus(lead.status) }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{{ lead.telefone }}</span>
                    </span>

                    <span class="text-[11px] text-slate-400">
                      {{ formatarData(lead.criado_em || lead.created_at) }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Coluna Direita: Detalhes do Lead & Histórico de Mensagens (7 colunas) -->
        <div class="lg:col-span-7">
          @if (leadSelecionado(); as lead) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full min-h-[500px]">
              
              <!-- Header do Lead Selecionado -->
              <div class="p-6 border-b border-slate-200 bg-slate-50/60 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-black text-slate-900 tracking-tight">
                      {{ lead.nome }}
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ lead.email }} · {{ lead.telefone }}
                    </p>
                    @if (lead.nome_condominio || lead.condominio) {
                      <div class="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/60">
                        <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Condomínio: {{ lead.nome_condominio || lead.condominio }}</span>
                      </div>
                    }
                  </div>

                  <!-- Botão WhatsApp com o Lead -->
                  <a
                    [href]="gerarLinkWhatsappLead(lead)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                    </svg>
                    <span>Chamar no WhatsApp</span>
                  </a>
                </div>

                <!-- Alterar Status -->
                <div class="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                  <span class="font-bold text-slate-700">Alterar Status:</span>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="alterarStatusLead(lead.id, 'novo')"
                      [class]="lead.status === 'novo' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                      class="px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Novo
                    </button>
                    <button
                      type="button"
                      (click)="alterarStatusLead(lead.id, 'em_atendimento')"
                      [class]="lead.status === 'em_atendimento' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                      class="px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Em Atendimento
                    </button>
                    <button
                      type="button"
                      (click)="alterarStatusLead(lead.id, 'concluido')"
                      [class]="lead.status === 'concluido' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                      class="px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Concluído
                    </button>
                    <button
                      type="button"
                      (click)="alterarStatusLead(lead.id, 'descartado')"
                      [class]="lead.status === 'descartado' ? 'bg-slate-800 text-slate-200 font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                      class="px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Descartado
                    </button>
                  </div>
                </div>
              </div>

              <!-- Histórico de Mensagens do Chat -->
              <div class="p-6 flex-1 space-y-4 bg-slate-900 overflow-y-auto max-h-[500px]">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Histórico da Conversa com a IA</span>
                  </h4>
                  <span class="text-[11px] text-slate-500">{{ mensagensLead().length }} mensagens gravadas</span>
                </div>

                @if (carregandoMensagens()) {
                  <div class="text-center py-8 text-slate-500 text-xs flex items-center justify-center gap-2">
                    <svg class="animate-spin h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Carregando mensagens da conversa...</span>
                  </div>
                } @else if (mensagensLead().length === 0) {
                  <div class="text-center py-10 text-slate-500 text-xs space-y-1">
                    <p class="text-slate-400 font-bold">Nenhuma mensagem registrada no banco ainda.</p>
                    <p>O lead cadastrou seus dados, mas pode ainda não ter enviado mensagens adicionais ao chat.</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (msg of mensagensLead(); track $index) {
                      @if (msg.role === 'model' || msg.role === 'assistant') {
                        <!-- Resposta da IA -->
                        <div class="flex items-start gap-3 max-w-[90%]">
                          <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                            IA
                          </div>
                          <div class="space-y-1">
                            <div class="p-3.5 rounded-xl rounded-tl-xs bg-slate-800 text-slate-100 text-xs leading-relaxed border border-slate-700 whitespace-pre-line">
                              {{ msg.texto || msg.conteudo }}
                            </div>
                            <span class="text-[11px] text-slate-500 block px-1">
                              Assistente IA · {{ formatarData(msg.criado_em || msg.created_at) }}
                            </span>
                          </div>
                        </div>
                      } @else {
                        <!-- Pergunta do Síndico -->
                        <div class="flex items-start justify-end gap-3 max-w-[90%] ml-auto">
                          <div class="space-y-1 text-right">
                            <div class="p-3.5 rounded-xl rounded-tr-xs bg-amber-500 text-slate-950 font-medium text-xs leading-relaxed whitespace-pre-line text-left">
                              {{ msg.texto || msg.conteudo }}
                            </div>
                            <span class="text-[11px] text-slate-500 block px-1">
                              {{ lead.nome }} · {{ formatarData(msg.criado_em || msg.created_at) }}
                            </span>
                          </div>
                        </div>
                      }
                    }
                  </div>
                }
              </div>

            </div>
          } @else {
            <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px] space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-slate-700">Nenhum lead selecionado</h4>
                <p class="text-xs text-slate-500 max-w-sm">
                  Clique em qualquer lead da coluna ao lado para visualizar os detalhes de contato e o histórico da conversa com a inteligência artificial.
                </p>
              </div>
            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class AdminAloSindicoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly leads = signal<AloSindicoLead[]>([]);
  readonly carregando = signal(false);
  readonly buscaTexto = signal('');
  readonly filtroStatus = signal<'todos' | 'novo' | 'em_atendimento' | 'concluido' | 'descartado'>('todos');

  readonly leadSelecionado = signal<AloSindicoLead | null>(null);
  readonly mensagensLead = signal<AloSindicoMensagem[]>([]);
  readonly carregandoMensagens = signal(false);

  // Computeds
  readonly totalNovos = computed(() => this.leads().filter(l => l.status === 'novo').length);
  readonly totalEmAtendimento = computed(() => this.leads().filter(l => l.status === 'em_atendimento').length);
  readonly totalConcluidos = computed(() => this.leads().filter(l => l.status === 'concluido').length);

  readonly leadsFiltrados = computed(() => {
    let lista = this.leads();
    const status = this.filtroStatus();
    const busca = this.buscaTexto().toLowerCase().trim();

    if (status !== 'todos') {
      lista = lista.filter(l => l.status === status);
    }

    if (busca) {
      lista = lista.filter(l =>
        (l.nome && l.nome.toLowerCase().includes(busca)) ||
        (l.email && l.email.toLowerCase().includes(busca)) ||
        (l.telefone && l.telefone.includes(busca)) ||
        (l.nome_condominio && l.nome_condominio.toLowerCase().includes(busca)) ||
        (l.condominio && l.condominio.toLowerCase().includes(busca))
      );
    }

    return lista;
  });

  ngOnInit(): void {
    this.carregarLeads();
  }

  async carregarLeads(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarLeadsSindico();
      this.leads.set(data || []);
      if (this.leadSelecionado()) {
        const atualizado = (data || []).find((l: AloSindicoLead) => l.id === this.leadSelecionado()?.id);
        if (atualizado) this.leadSelecionado.set(atualizado);
      }
    } catch (e) {
      console.warn('Erro ao carregar leads:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.buscaTexto.set(target.value);
  }

  async selecionarLead(lead: AloSindicoLead): Promise<void> {
    this.leadSelecionado.set(lead);
    this.carregandoMensagens.set(true);
    try {
      const msgs = await this.supabaseService.obterMensagensLeadSindico(lead.id);
      this.mensagensLead.set(msgs || []);
    } catch (e) {
      console.warn('Erro ao carregar mensagens:', e);
      this.mensagensLead.set([]);
    } finally {
      this.carregandoMensagens.set(false);
    }
  }

  async alterarStatusLead(leadId: string, novoStatus: 'novo' | 'em_atendimento' | 'concluido' | 'descartado'): Promise<void> {
    try {
      const { error } = await this.supabaseService.atualizarStatusLeadSindico(leadId, novoStatus);
      if (!error) {
        this.leads.update(lista =>
          lista.map(item => item.id === leadId ? { ...item, status: novoStatus } : item)
        );
        if (this.leadSelecionado()?.id === leadId) {
          this.leadSelecionado.update(l => l ? { ...l, status: novoStatus } : null);
        }
      }
    } catch (e) {
      console.warn('Erro ao atualizar status do lead:', e);
    }
  }

  gerarLinkWhatsappLead(lead: AloSindicoLead): string {
    const digitos = lead.telefone.replace(/\D/g, '');
    const primeiroNome = lead.nome.trim().split(' ')[0] || 'Síndico(a)';
    const nomeCondo = lead.nome_condominio || lead.condominio || 'seu edifício';
    const mensagem = `Olá, ${primeiroNome}! Aqui é da equipe técnica da Amorim Tech. Vimos seu contato pelo Alô Síndico sobre o condomínio ${nomeCondo} e estamos à disposição para auxiliar com sua cotação e inspeção predial.`;
    return `https://wa.me/55${digitos}?text=${encodeURIComponent(mensagem)}`;
  }

  formatarStatus(status: string): string {
    switch (status) {
      case 'novo': return 'Novo Lead';
      case 'em_atendimento': return 'Em Atendimento';
      case 'concluido': return 'Concluído';
      case 'descartado': return 'Descartado';
      default: return status;
    }
  }

  obterEstiloStatus(status: string): string {
    switch (status) {
      case 'novo': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'em_atendimento': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'concluido': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'descartado': return 'bg-slate-100 text-slate-700 border border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return '';
    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataIso;
    }
  }
}
