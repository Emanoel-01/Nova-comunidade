import { Component, inject, OnInit, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface MembroCard {
  id: string;
  full_name: string;
  professional_title?: string;
  bio?: string;
  crea_cau?: string;
  especializacao?: string;
  categoria_profissional?: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  nivel_atual?: string;
  email?: string;
}

@Component({
  selector: 'app-comunidade-membros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fadeIn">

      <!-- Feedback Flutuante -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <div class="flex items-center gap-2">
            <span>{{ tipoFeedback() === 'sucesso' ? '✓' : '⚠️' }}</span>
            <span>{{ mensagemFeedback() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemFeedback.set(null)"
            class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      <!-- 1. Banner Principal: Rede de Membros & Networking -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Networking Técnico & Parcerias</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Rede de Membros</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Descubra, conecte-se e faça parcerias com engenheiros civis, peritos judiciais, arquitetos e especialistas em engenharia diagnóstica de todo o Brasil.
            </p>
          </div>

          <!-- Estatísticas Rápidas -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                {{ totalMembros() }}
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Membros Ativos</div>
                <div class="text-[11px] text-indigo-200">Cadastrados na Comunidade</div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                {{ totalSeguindo() }}
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Você Segue</div>
                <div class="text-[11px] text-emerald-200">Suas conexões ativas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Filtros, Busca & Segmentações -->
      <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <!-- Campo de Busca em Tempo Real -->
          <div class="relative flex-1">
            <input
              type="text"
              id="input-busca-membros"
              [value]="buscaTexto()"
              (input)="onBuscaInput($event)"
              placeholder="Buscar por nome, especialidade, CREA/CAU ou cidade..."
              class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-2xl pl-10 pr-4 py-3 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
            />
            <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            @if (buscaTexto()) {
              <button
                type="button"
                (click)="buscaTexto.set('')"
                class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            }
          </div>

          <!-- Filtro de Conexão: Todos / Apenas Seguindo -->
          <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              (click)="filtroConexao.set('todos')"
              [class]="filtroConexao() === 'todos' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Todos ({{ totalMembros() }})
            </button>
            <button
              type="button"
              (click)="filtroConexao.set('seguindo')"
              [class]="filtroConexao() === 'seguindo' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Seguindo</span>
              <span class="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px]">
                {{ totalSeguindo() }}
              </span>
            </button>
          </div>
        </div>

        <!-- Chips de Especialização / Categoria -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span class="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1">Área:</span>
          @for (cat of categoriasDisponiveis(); track cat) {
            <button
              type="button"
              (click)="categoriaFiltro.set(cat)"
              [class]="categoriaFiltro() === cat
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'"
              class="px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              {{ cat }}
            </button>
          }
        </div>

      </div>

      <!-- 3. Grid de Cards de Membros -->
      @if (carregando()) {
        <!-- Skeleton Loading Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of [1, 2, 3, 4, 5, 6]; track item) {
            <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
              <div class="h-24 bg-slate-200"></div>
              <div class="p-6 pt-0 relative space-y-4">
                <div class="w-18 h-18 rounded-2xl bg-slate-300 border-4 border-white -mt-9 shadow-xs"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
                  <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
                </div>
                <div class="h-12 bg-slate-50 rounded-xl"></div>
                <div class="flex gap-2 pt-2 border-t border-slate-100">
                  <div class="h-9 bg-slate-200 rounded-xl flex-1"></div>
                  <div class="h-9 bg-slate-200 rounded-xl w-24"></div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else if (membrosFiltrados().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="max-w-md mx-auto space-y-1">
            <h4 class="text-lg font-black text-slate-900">Nenhum membro encontrado</h4>
            <p class="text-xs sm:text-sm text-slate-500">
              @if (buscaTexto() || categoriaFiltro() !== 'Todos' || filtroConexao() === 'seguindo') {
                Nenhum membro corresponde aos filtros aplicados. Tente ajustar os termos da pesquisa.
              } @else {
                Ainda não há outros membros cadastrados na comunidade.
              }
            </p>
          </div>
          @if (buscaTexto() || categoriaFiltro() !== 'Todos' || filtroConexao() === 'seguindo') {
            <button
              type="button"
              (click)="limparFiltros()"
              class="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Limpar Filtros
            </button>
          }
        </div>
      } @else {
        <!-- Grid Real de Cards de Membro -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (membro of membrosFiltrados(); track membro.id) {
            <div
              class="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group hover:border-indigo-200"
            >
              
              <!-- Banner Superior do Card -->
              <div class="h-24 sm:h-28 relative overflow-hidden bg-slate-900">
                @if (membro.banner_url) {
                  <img
                    [src]="membro.banner_url"
                    [alt]="'Banner de ' + membro.full_name"
                    class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                } @else {
                  <!-- Gradiente Decorativo Padrão -->
                  <div
                    [class]="getGradienteBanner(membro.id)"
                    class="w-full h-full relative"
                  >
                    <div class="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:12px_12px] opacity-15"></div>
                  </div>
                }

                <!-- Badge de Nível no Canto do Banner -->
                <div class="absolute top-3 right-3">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/40 text-amber-300 border border-amber-400/30">
                    {{ membro.nivel_atual || 'Membro Ativo' }}
                  </span>
                </div>
              </div>

              <!-- Conteúdo do Card -->
              <div class="p-5 sm:p-6 pt-0 relative flex-1 flex flex-col justify-between space-y-4">
                
                <!-- Avatar do Membro -->
                <div class="flex items-end justify-between -mt-10 sm:-mt-12 mb-2">
                  <div class="relative">
                    @if (membro.avatar_url) {
                      <img
                        [src]="membro.avatar_url"
                        [alt]="membro.full_name"
                        class="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover object-center border-4 border-white shadow-md bg-white"
                      />
                    } @else {
                      <div class="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#132A41] to-[#1E3A5F] text-[#E59866] font-black text-xl sm:text-2xl flex items-center justify-center border-4 border-white shadow-md">
                        {{ getIniciais(membro.full_name) }}
                      </div>
                    }

                    <!-- Indicador de Sou Eu -->
                    @if (membro.id === meuId()) {
                      <span class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider border-2 border-white shadow-xs">
                        Você
                      </span>
                    }
                  </div>

                  <!-- CREA/CAU Badge -->
                  @if (membro.crea_cau) {
                    <span class="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                      {{ membro.crea_cau }}
                    </span>
                  }
                </div>

                <!-- Informações Principais -->
                <div class="space-y-1.5">
                  <h4 class="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {{ membro.full_name }}
                  </h4>

                  <p class="text-xs font-semibold text-slate-600 line-clamp-1">
                    {{ membro.professional_title || 'Profissional da Engenharia & Perícias' }}
                  </p>

                  <!-- Tags de Especialização / Categoria -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-1">
                    @if (membro.especializacao) {
                      <span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                        {{ membro.especializacao }}
                      </span>
                    }
                    @if (membro.categoria_profissional && membro.categoria_profissional !== membro.especializacao) {
                      <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {{ membro.categoria_profissional }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Bio / Resumo -->
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                  {{ membro.bio || 'Membro dedicado ao aprimoramento técnico, elaboração de laudos periciais e boas práticas na construção civil.' }}
                </p>

                <!-- Barra de Ações do Card -->
                <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
                  
                  @if (membro.id === meuId()) {
                    <!-- Meu próprio card -->
                    <button
                      type="button"
                      (click)="verMeuPerfil()"
                      class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Ver Meu Perfil</span>
                    </button>
                  } @else {
                    
                    <!-- Botão Seguir / Deixar de Seguir -->
                    <button
                      type="button"
                      [id]="'btn-seguir-' + membro.id"
                      (click)="toggleSeguir(membro)"
                      [disabled]="processandoSeguirId() === membro.id"
                      [class]="isSeguindo(membro.id)
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'"
                      class="flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      @if (processandoSeguirId() === membro.id) {
                        <span class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      } @else if (isSeguindo(membro.id)) {
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Seguindo</span>
                      } @else {
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Seguir</span>
                      }
                    </button>

                    <!-- Botão Enviar Mensagem Direta -->
                    <button
                      type="button"
                      [id]="'btn-msg-' + membro.id"
                      (click)="iniciarConversa(membro)"
                      class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 hover:border-indigo-200"
                      title="Enviar Mensagem Direta"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span class="hidden sm:inline">Mensagem</span>
                    </button>

                  }

                </div>

              </div>

            </div>
          }
        </div>
      }

    </div>
  `
})
export class ComunidadeMembrosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly abrirConversaCom = output<any>();
  readonly verPerfil = output<void>();

  readonly membros = signal<MembroCard[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly meuId = signal<string | null>(null);

  // Set de IDs dos membros que o usuário atual segue
  readonly seguindoIds = signal<Set<string>>(new Set());
  readonly processandoSeguirId = signal<string | null>(null);

  // Filtros
  readonly buscaTexto = signal<string>('');
  readonly categoriaFiltro = signal<string>('Todos');
  readonly filtroConexao = signal<'todos' | 'seguindo'>('todos');

  // Feedback
  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');

  readonly totalMembros = computed(() => this.membros().length);
  readonly totalSeguindo = computed(() => this.seguindoIds().size);

  readonly categoriasDisponiveis = computed(() => {
    const cats = new Set<string>();
    cats.add('Todos');
    for (const m of this.membros()) {
      if (m.especializacao?.trim()) cats.add(m.especializacao.trim());
      if (m.categoria_profissional?.trim()) cats.add(m.categoria_profissional.trim());
    }
    return Array.from(cats);
  });

  readonly membrosFiltrados = computed(() => {
    const termo = this.buscaTexto().toLowerCase().trim();
    const cat = this.categoriaFiltro();
    const conexao = this.filtroConexao();
    const seguindo = this.seguindoIds();

    return this.membros().filter(m => {
      // Filtro de Conexão
      if (conexao === 'seguindo' && !seguindo.has(m.id)) {
        return false;
      }

      // Filtro de Categoria
      if (cat !== 'Todos') {
        const matchEspec = (m.especializacao || '').toLowerCase() === cat.toLowerCase();
        const matchCat = (m.categoria_profissional || '').toLowerCase() === cat.toLowerCase();
        if (!matchEspec && !matchCat) return false;
      }

      // Filtro de Texto
      if (termo) {
        const nome = (m.full_name || '').toLowerCase();
        const cargo = (m.professional_title || '').toLowerCase();
        const espec = (m.especializacao || '').toLowerCase();
        const crea = (m.crea_cau || '').toLowerCase();
        const bio = (m.bio || '').toLowerCase();

        return (
          nome.includes(termo) ||
          cargo.includes(termo) ||
          espec.includes(termo) ||
          crea.includes(termo) ||
          bio.includes(termo)
        );
      }

      return true;
    });
  });

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      const session = await this.supabaseService.getSession();
      if (session?.user) {
        this.meuId.set(session.user.id);
      }

      const [listaMembros, conexoes] = await Promise.all([
        this.supabaseService.listarMembrosComunidade(),
        this.supabaseService.obterMinhasConexoes()
      ]);

      this.membros.set(listaMembros || []);
      this.seguindoIds.set(new Set(conexoes.seguindoIds || []));
    } catch (e: any) {
      console.warn('Erro ao carregar rede de membros:', e);
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Não foi possível carregar a lista de membros.');
    } finally {
      this.carregando.set(false);
    }
  }

  isSeguindo(membroId: string): boolean {
    return this.seguindoIds().has(membroId);
  }

  async toggleSeguir(membro: MembroCard): Promise<void> {
    if (!membro?.id || this.processandoSeguirId() === membro.id) return;
    const jaSegue = this.isSeguindo(membro.id);

    this.processandoSeguirId.set(membro.id);

    // Atualização otimista
    this.seguindoIds.update(set => {
      const novoSet = new Set(set);
      if (jaSegue) {
        novoSet.delete(membro.id);
      } else {
        novoSet.add(membro.id);
      }
      return novoSet;
    });

    try {
      if (jaSegue) {
        const { error } = await this.supabaseService.deixarDeSeguirMembro(membro.id);
        if (error) {
          // Reverter
          this.seguindoIds.update(set => new Set(set).add(membro.id));
          this.tipoFeedback.set('erro');
          this.mensagemFeedback.set('Erro ao deixar de seguir. Tente novamente.');
        } else {
          this.tipoFeedback.set('sucesso');
          this.mensagemFeedback.set(`Você deixou de seguir ${membro.full_name}.`);
        }
      } else {
        const { error } = await this.supabaseService.seguirMembro(membro.id);
        if (error) {
          // Reverter
          this.seguindoIds.update(set => {
            const s = new Set(set);
            s.delete(membro.id);
            return s;
          });
          this.tipoFeedback.set('erro');
          this.mensagemFeedback.set('Erro ao seguir membro. Tente novamente.');
        } else {
          this.tipoFeedback.set('sucesso');
          this.mensagemFeedback.set(`Você começou a seguir ${membro.full_name}!`);
        }
      }
    } catch (e: any) {
      // Reverter
      this.seguindoIds.update(set => {
        const s = new Set(set);
        if (jaSegue) s.add(membro.id);
        else s.delete(membro.id);
        return s;
      });
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Exceção de rede: ' + (e?.message || e));
    } finally {
      this.processandoSeguirId.set(null);
    }
  }

  iniciarConversa(membro: MembroCard): void {
    this.abrirConversaCom.emit(membro);
  }

  verMeuPerfil(): void {
    this.verPerfil.emit();
  }

  onBuscaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.buscaTexto.set(target.value);
  }

  limparFiltros(): void {
    this.buscaTexto.set('');
    this.categoriaFiltro.set('Todos');
    this.filtroConexao.set('todos');
  }

  getIniciais(nome: string | undefined): string {
    if (!nome) return '👤';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  getGradienteBanner(id: string): string {
    const gradientes = [
      'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900',
      'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950',
      'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950',
      'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-900'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash + id.charCodeAt(i)) % gradientes.length;
    }
    return gradientes[hash];
  }
}
