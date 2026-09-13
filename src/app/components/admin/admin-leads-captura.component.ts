import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface LeadCaptura {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string | null;
  interesse: 'predial-4-0' | 'academy-cursos' | 'consultoria-arquitetura' | 'comunidade' | 'outro';
  origem: string;
  mensagem?: string | null;
  status: 'novo' | 'em-contato' | 'qualificado' | 'convertido' | 'descartado';
  criado_em: string;
}

@Component({
  selector: 'app-admin-leads-captura',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- Topo: Título e Ações -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            <span>Minisite Bio · Instagram</span>
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">
            Leads Capturados
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerencie os contatos recebidos através da rota /links do Instagram.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="carregarLeads()"
            [disabled]="carregando()"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg class="w-4 h-4" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Recarregar</span>
          </button>
        </div>
      </div>

      <!-- Notificação de Erro (se houver) -->
      @if (erroMensagem()) {
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{{ erroMensagem() }}</span>
          <button type="button" (click)="erroMensagem.set(null)" class="text-rose-600 font-bold ml-4 hover:underline">Fechar</button>
        </div>
      }

      <!-- 2.1 Cabeçalho com contadores -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Total</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">{{ leads().length }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span class="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">Novos</span>
          <span class="text-2xl font-black text-amber-600 mt-1 block">{{ totalNovos() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span class="text-[11px] font-semibold text-blue-700 block uppercase tracking-wider">Em Contato</span>
          <span class="text-2xl font-black text-blue-600 mt-1 block">{{ totalEmContato() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
          <span class="text-[11px] font-semibold text-purple-700 block uppercase tracking-wider">Qualificados</span>
          <span class="text-2xl font-black text-purple-600 mt-1 block">{{ totalQualificados() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span class="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">Convertidos</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">{{ totalConvertidos() }}</span>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200 bg-slate-50/40 shadow-xs">
          <span class="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Descartados</span>
          <span class="text-2xl font-black text-slate-600 mt-1 block">{{ totalDescartados() }}</span>
        </div>
      </div>

      <!-- 2.2 Barra de Filtros e Busca -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        <!-- Campo de busca por texto (nome e e-mail) -->
        <div class="relative flex-1 max-w-md">
          <input
            type="text"
            [value]="buscaTexto()"
            (input)="onBuscaInput($event)"
            placeholder="Buscar por nome ou e-mail..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-400 bg-slate-50"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          @if (buscaTexto()) {
            <button
              type="button"
              (click)="buscaTexto.set('')"
              class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Seletor de Interesse -->
          <div class="flex items-center gap-1.5">
            <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Interesse:</label>
            <select
              [value]="filtroInteresse()"
              (change)="onInteresseChange($event)"
              class="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer font-medium"
            >
              <option value="todos">Todos os Interesses</option>
              <option value="predial-4-0">Plataforma Predial 4.0</option>
              <option value="academy-cursos">Cursos e certificações</option>
              <option value="consultoria-arquitetura">Consultoria e laudos</option>
              <option value="comunidade">Comunidade profissional</option>
              <option value="outro">Outro assunto</option>
            </select>
          </div>

          <!-- Seletor de Status (Pills) -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              (click)="filtroStatus.set('todos')"
              [class]="filtroStatus() === 'todos' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Todos
            </button>
            <button
              type="button"
              (click)="filtroStatus.set('novo')"
              [class]="filtroStatus() === 'novo' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Novo</span>
              @if (totalNovos() > 0) {
                <span class="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">{{ totalNovos() }}</span>
              }
            </button>
            <button
              type="button"
              (click)="filtroStatus.set('em-contato')"
              [class]="filtroStatus() === 'em-contato' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Em contato
            </button>
            <button
              type="button"
              (click)="filtroStatus.set('qualificado')"
              [class]="filtroStatus() === 'qualificado' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Qualificado
            </button>
            <button
              type="button"
              (click)="filtroStatus.set('convertido')"
              [class]="filtroStatus() === 'convertido' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Convertido
            </button>
            <button
              type="button"
              (click)="filtroStatus.set('descartado')"
              [class]="filtroStatus() === 'descartado' ? 'bg-slate-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Descartado
            </button>
          </div>
        </div>
      </div>

      <!-- 2.3 & 2.5 Estados: Carregando, Vazio e Lista de Leads -->
      @if (carregando()) {
        <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="font-medium text-slate-600">Carregando leads capturados...</span>
        </div>
      } @else if (leadsFiltrados().length === 0) {
        <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          @if (leads().length === 0) {
            <div class="space-y-1">
              <p class="font-bold text-slate-800 text-sm">Ainda não há leads capturados</p>
              <p class="text-slate-400">Os formulários preenchidos no minisite da bio (/links) aparecerão aqui automaticamente.</p>
            </div>
          } @else {
            <div class="space-y-1">
              <p class="font-bold text-slate-800 text-sm">Nenhum lead encontrado</p>
              <p class="text-slate-400">Tente ajustar os filtros de busca, interesse ou status.</p>
            </div>
          }
        </div>
      } @else {
        <!-- Lista de Leads -->
        <div class="space-y-3">
          @for (lead of leadsFiltrados(); track lead.id) {
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3">
              
              <!-- Linha Superior: Identificação, Badges, Status e Ações Rápidas -->
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                
                <!-- Nome, Interesse e Origem -->
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900">
                      {{ lead.nome }}
                    </h3>

                    <!-- Rótulo do Interesse -->
                    <span [class]="obterClasseInteresse(lead.interesse)" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border">
                      {{ obterRotuloInteresse(lead.interesse) }}
                    </span>

                    <!-- Origem -->
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                      {{ lead.origem || 'instagram-bio' }}
                    </span>
                  </div>

                  <!-- Contatos e Data -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="text-slate-700 font-medium">{{ lead.email }}</span>
                    </span>

                    @if (lead.whatsapp) {
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-slate-700 font-medium">{{ lead.whatsapp }}</span>
                      </span>
                    }

                    <span class="flex items-center gap-1 text-slate-400">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatarData(lead.criado_em) }}</span>
                    </span>
                  </div>
                </div>

                <!-- Seletor de Status e Ações Rápidas -->
                <div class="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <!-- Seletor de Status -->
                  <div class="flex items-center gap-1.5">
                    <label class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:inline">Status:</label>
                    <div class="relative">
                      <select
                        [value]="lead.status"
                        (change)="alterarStatus(lead, $event)"
                        [disabled]="salvandoStatusId() === lead.id"
                        [class]="obterClasseStatusSelect(lead.status)"
                        class="px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none pr-7 transition-colors"
                      >
                        <option value="novo">Novo</option>
                        <option value="em-contato">Em contato</option>
                        <option value="qualificado">Qualificado</option>
                        <option value="convertido">Convertido</option>
                        <option value="descartado">Descartado</option>
                      </select>
                      <svg class="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <!-- 2.4 Ações Rápidas por Lead -->
                  <!-- WhatsApp (visível apenas se whatsapp preenchido) -->
                  @if (lead.whatsapp) {
                    <a
                      [href]="gerarLinkWhatsapp(lead.whatsapp)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Conversar no WhatsApp"
                    >
                      <svg class="w-3.5 h-3.5 fill-emerald-600" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  }

                  <!-- E-mail (mailto) -->
                  <a
                    [href]="'mailto:' + lead.email"
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Enviar e-mail"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>E-mail</span>
                  </a>
                </div>
              </div>

              <!-- Mensagem (se houver) -->
              @if (lead.mensagem) {
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5">
                  <svg class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div class="space-y-0.5">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mensagem enviada:</span>
                    <p class="whitespace-pre-line text-slate-700 leading-relaxed">{{ lead.mensagem }}</p>
                  </div>
                </div>
              }

            </div>
          }
        </div>
      }

    </div>
  `
})
export class AdminLeadsCapturaComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly leads = signal<LeadCaptura[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly salvandoStatusId = signal<string | null>(null);
  readonly erroMensagem = signal<string | null>(null);

  readonly buscaTexto = signal<string>('');
  readonly filtroStatus = signal<string>('todos');
  readonly filtroInteresse = signal<string>('todos');

  // Contadores
  readonly totalNovos = computed(() => this.leads().filter(l => l.status === 'novo').length);
  readonly totalEmContato = computed(() => this.leads().filter(l => l.status === 'em-contato').length);
  readonly totalQualificados = computed(() => this.leads().filter(l => l.status === 'qualificado').length);
  readonly totalConvertidos = computed(() => this.leads().filter(l => l.status === 'convertido').length);
  readonly totalDescartados = computed(() => this.leads().filter(l => l.status === 'descartado').length);

  // Filtros client-side com computed
  readonly leadsFiltrados = computed(() => {
    const termo = this.buscaTexto().trim().toLowerCase();
    const status = this.filtroStatus();
    const interesse = this.filtroInteresse();

    return this.leads().filter(lead => {
      if (status !== 'todos' && lead.status !== status) {
        return false;
      }
      if (interesse !== 'todos' && lead.interesse !== interesse) {
        return false;
      }
      if (termo) {
        const nome = (lead.nome || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        if (!nome.includes(termo) && !email.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  });

  readonly INTERESSE_LABELS: Record<string, string> = {
    'predial-4-0': 'Plataforma Predial 4.0',
    'academy-cursos': 'Cursos e certificações',
    'consultoria-arquitetura': 'Consultoria e laudos',
    'comunidade': 'Comunidade profissional',
    'outro': 'Outro assunto',
  };

  async ngOnInit(): Promise<void> {
    await this.carregarLeads();
  }

  async carregarLeads(): Promise<void> {
    this.carregando.set(true);
    this.erroMensagem.set(null);
    try {
      const lista = await this.supabaseService.listarLeadsCaptura();
      this.leads.set(lista);
    } catch {
      this.erroMensagem.set('Ocorreu um erro ao carregar os leads.');
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.buscaTexto.set(input.value || '');
  }

  onInteresseChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroInteresse.set(select.value || 'todos');
  }

  async alterarStatus(lead: LeadCaptura, event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const novoStatus = select.value as LeadCaptura['status'];
    if (!novoStatus || novoStatus === lead.status) {
      return;
    }

    const statusAnterior = lead.status;

    // Atualização otimista local
    this.leads.update(itens =>
      itens.map(item => (item.id === lead.id ? { ...item, status: novoStatus } : item))
    );

    this.salvandoStatusId.set(lead.id);
    const res = await this.supabaseService.atualizarStatusLeadCaptura(lead.id, novoStatus);
    this.salvandoStatusId.set(null);

    if (res.error) {
      // Reverter se falhou
      this.leads.update(itens =>
        itens.map(item => (item.id === lead.id ? { ...item, status: statusAnterior } : item))
      );
      this.erroMensagem.set('Falha ao atualizar o status do lead no banco de dados.');
      setTimeout(() => this.erroMensagem.set(null), 4000);
    }
  }

  obterRotuloInteresse(interesse?: string | null): string {
    if (!interesse) return 'Outro assunto';
    return this.INTERESSE_LABELS[interesse] || interesse;
  }

  obterClasseInteresse(interesse?: string | null): string {
    switch (interesse) {
      case 'predial-4-0':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'academy-cursos':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'consultoria-arquitetura':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'comunidade':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  obterClasseStatusSelect(status: LeadCaptura['status']): string {
    switch (status) {
      case 'novo':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'em-contato':
        return 'bg-blue-50 text-blue-900 border-blue-300';
      case 'qualificado':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'convertido':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'descartado':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-white text-slate-800 border-slate-300';
    }
  }

  formatarData(dataIso?: string | null): string {
    if (!dataIso) return '—';
    try {
      const data = new Date(dataIso);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataIso;
    }
  }

  gerarLinkWhatsapp(whatsapp?: string | null): string {
    if (!whatsapp) return '#';
    const digitos = whatsapp.replace(/\D/g, '');
    if (!digitos) return '#';
    const numeroCompleto = digitos.length <= 11 ? `55${digitos}` : digitos;
    return `https://wa.me/${numeroCompleto}`;
  }
}
