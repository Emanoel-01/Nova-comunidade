import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { montarUrlPlayerVimeo } from '../../utils/vimeo.util';

export type CategoriaMaterial =
  | 'Todos'
  | 'Planilhas'
  | 'Modelos de Laudo'
  | 'Checklists'
  | 'E-books'
  | 'Vídeos';

@Component({
  selector: 'app-comunidade-materiais',
  standalone: true,
  imports: [CommonModule],
  host: {
    '(window:keydown.escape)': 'onEscape()'
  },
  template: `
    <div class="space-y-8">

      <!-- Feedback de Sucesso/Erro/Acesso Restrito -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : tipoFeedback() === 'alerta'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <div class="flex items-center gap-2">
            @if (tipoFeedback() === 'alerta') {
              <span>🔒</span>
            } @else if (tipoFeedback() === 'sucesso') {
              <span>✓</span>
            }
            <span>{{ mensagemFeedback() }}</span>
          </div>
          <button type="button" (click)="mensagemFeedback.set(null)" class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer">✕</button>
        </div>
      }

      <!-- 1. Cabeçalho da Biblioteca de Materiais (Banner Escuro Gradiente) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Acervo Técnico & Downloads</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Biblioteca de Materiais</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Modelos de laudos, planilhas automatizadas, checklists de campo e guias práticos para acelerar sua rotina técnica.
            </p>
          </div>

          <!-- Status de Acesso & Contador de Materiais -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                {{ materiais().length }}
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Recursos no Acervo</div>
                <div class="text-[11px] text-indigo-200">Arquivos técnicos padronizados</div>
              </div>
            </div>

            @if (!carregando() && !temAcesso()) {
              <div class="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5">
                <span class="text-base">🔒</span>
                <span class="font-medium">Módulo com Acesso Restrito</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- 2. Barra de Filtro de Categorias em Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        @for (cat of categorias; track cat) {
          <button
            type="button"
            (click)="categoriaSelecionada.set(cat)"
            [class]="categoriaSelecionada() === cat
              ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'"
            class="px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            @if (cat === 'Todos') {
              <span>📁</span>
            } @else if (cat === 'Planilhas') {
              <span>📊</span>
            } @else if (cat === 'Modelos de Laudo') {
              <span>📋</span>
            } @else if (cat === 'Checklists') {
              <span>☑️</span>
            } @else if (cat === 'E-books') {
              <span>📚</span>
            } @else if (cat === 'Vídeos') {
              <span>🎬</span>
            }
            <span>{{ cat }}</span>
            <span
              [class]="categoriaSelecionada() === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
              class="text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-1"
            >
              {{ contarPorCategoria(cat) }}
            </span>
          </button>
        }
      </div>

      <!-- 3. Grade / Lista de Materiais -->
      @if (carregando()) {
        <!-- Estado de Carregamento -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded-md w-24"></div>
            <div class="h-6 bg-slate-200 rounded-md w-3/4"></div>
            <div class="h-12 bg-slate-100 rounded-xl"></div>
          </div>
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded-md w-28"></div>
            <div class="h-6 bg-slate-200 rounded-md w-2/3"></div>
            <div class="h-12 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      } @else if (materiaisFiltrados().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3 shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">Nenhum material encontrado</h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Novos materiais técnicos e planilhas padronizadas serão adicionados ao acervo em breve.
          </p>
        </div>
      } @else {
        <!-- Lista de Materiais Reais -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (item of materiaisFiltrados(); track item.id) {
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-5">
              
              <!-- Topo do Card: Ícone de Arquivo + Categoria + Formato -->
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <span
                    [class]="getBadgeEstilo(item.categoria)"
                    class="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                  >
                    <span>{{ item.categoria }}</span>
                  </span>

                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
                      {{ item.formato || 'PDF' }}
                    </span>
                    <span class="text-[11px] text-slate-400 font-medium">
                      {{ item.tamanho || 'Arquivo' }}
                    </span>
                  </div>
                </div>

                <!-- Título e Descrição -->
                <div class="space-y-2">
                  <h4 class="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {{ item.titulo }}
                  </h4>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {{ item.descricao }}
                  </p>
                </div>

                <!-- Player de Vídeo Vimeo Embutido quando categoria === 'Vídeos' -->
                @if (item.categoria === 'Vídeos') {
                  @if (temAcesso()) {
                    @let videoUrl = getVimeoUrl(item.url_arquivo);
                    @if (videoUrl) {
                      <div class="space-y-1.5 pt-2">
                        <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                          <iframe
                            [src]="videoUrl"
                            class="w-full h-full"
                            frameborder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowfullscreen
                            title="Vídeo do material"
                          ></iframe>
                        </div>
                      </div>
                    } @else {
                      <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                        <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Vídeo não configurado corretamente ou em preparação.</span>
                      </div>
                    }
                  } @else {
                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                      <span>🔒</span>
                      <span>Vídeo bloqueado — exclusivo para membros autorizados.</span>
                    </div>
                  }
                }
              </div>

              <!-- Alerta Inline de Acesso Restrito no Card se clicado sem permissão -->
              @if (materialBloqueadoAberto() === item.id) {
                <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 animate-fadeIn">
                  <div class="flex items-start gap-2.5 text-xs text-amber-900">
                    <span class="text-base shrink-0">🔒</span>
                    <div class="space-y-1">
                      <strong class="font-bold block">Acesso Restrito a Membros</strong>
                      <span class="text-amber-800 leading-normal block">
                        Este material é exclusivo para membros com acesso liberado. Fale com o Admin da Comunidade para solicitar liberação deste módulo.
                      </span>
                    </div>
                  </div>
                </div>
              }

              <!-- Rodapé: Estatísticas + Botão Baixar / Solicitado ou Indicador de Vídeo -->
              <div class="pt-4 border-t border-slate-100 space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    @if (item.categoria === 'Vídeos') {
                      <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                      </svg>
                      <span>Transmissão Integrada</span>
                    } @else {
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>{{ item.downloads_count || item.downloads || 0 }} downloads</span>
                    }
                  </div>

                  @if (item.categoria === 'Vídeos') {
                    @if (temAcesso()) {
                      <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <span>▶ Assistir</span>
                      </span>
                    } @else {
                      <button
                        type="button"
                        (click)="toggleAcessoBloqueado(item.id)"
                        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer border border-slate-200"
                      >
                        <span>🔒</span>
                        <span>Acesso Restrito</span>
                      </button>
                    }
                  } @else {
                    @if (temAcesso()) {
                      <div class="flex items-center gap-2">
                        @if (isPdf(item)) {
                          <button
                            type="button"
                            (click)="abrirVisualizador(item)"
                            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer shadow-2xs"
                            title="Visualizar documento embutido"
                          >
                            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Visualizar</span>
                          </button>
                        }

                        <button
                          type="button"
                          (click)="baixarMaterial(item)"
                          [disabled]="processandoDownload() === item.id"
                          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-transparent cursor-pointer disabled:opacity-50"
                        >
                          @if (processandoDownload() === item.id) {
                            <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Baixando...</span>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Baixar Arquivo</span>
                          }
                        </button>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="toggleAcessoBloqueado(item.id)"
                        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer border border-slate-200"
                      >
                        <span>🔒</span>
                        <span>Acesso Restrito</span>
                      </button>
                    }
                  }
                </div>
              </div>

            </div>
          }
        </div>
      }

      <!-- MODAL VISUALIZADOR DE PDF EMBUTIDO -->
      @if (materialVisualizando() && urlVisualizacaoSegura()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn">
          <div class="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            
            <!-- Barra Superior do Visualizador -->
            <div class="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 text-white">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-xs shrink-0">
                  PDF
                </div>
                <div class="truncate">
                  <h4 class="text-sm font-bold text-white truncate">
                    {{ materialVisualizando()?.titulo }}
                  </h4>
                  <p class="text-[11px] text-slate-400 truncate">
                    {{ materialVisualizando()?.categoria }} • {{ materialVisualizando()?.tamanho || 'Documento Técnico' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="baixarMaterial(materialVisualizando())"
                  [disabled]="processandoDownload() === materialVisualizando()?.id"
                  class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  title="Baixar cópia do arquivo"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span class="hidden sm:inline">Baixar Arquivo</span>
                </button>

                <button
                  type="button"
                  (click)="fecharVisualizador()"
                  class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Fechar visualizador"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Corpo do Visualizador com iFrame -->
            <div class="flex-1 bg-slate-950 relative w-full h-full">
              <iframe
                [src]="urlVisualizacaoSegura()"
                class="w-full h-full border-0 bg-slate-900"
                title="Visualizador de PDF"
              ></iframe>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ComunidadeMateriaisComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly materiais = signal<any[]>([]);
  readonly temAcesso = signal<boolean>(false);
  readonly carregando = signal<boolean>(true);
  readonly processandoDownload = signal<string | null>(null);

  readonly materialBloqueadoAberto = signal<string | null>(null);
  readonly materialVisualizando = signal<any | null>(null);
  readonly urlVisualizacaoSegura = signal<SafeResourceUrl | null>(null);

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro' | 'alerta'>('sucesso');

  readonly categorias: CategoriaMaterial[] = [
    'Todos',
    'Planilhas',
    'Modelos de Laudo',
    'Checklists',
    'E-books',
    'Vídeos'
  ];

  readonly categoriaSelecionada = signal<CategoriaMaterial>('Todos');

  readonly materiaisFiltrados = computed(() => {
    const cat = this.categoriaSelecionada();
    const lista = this.materiais();
    if (cat === 'Todos') return lista;
    return lista.filter(m => m.categoria === cat);
  });

  getVimeoUrl(urlOuId?: string | null): SafeResourceUrl | null {
    const url = montarUrlPlayerVimeo(urlOuId);
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      // 1. Verifica permissão de acesso ao módulo Materiais
      const acesso = await this.supabaseService.temPermissaoModulo('comunidade', 'materiais');
      this.temAcesso.set(acesso);

      // 2. Carrega acervo de materiais ativos
      const lista = await this.supabaseService.listarMateriais();
      this.materiais.set(lista);
    } catch (e) {
      console.warn('Erro ao carregar acervo de materiais:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  contarPorCategoria(cat: CategoriaMaterial): number {
    if (cat === 'Todos') return this.materiais().length;
    return this.materiais().filter(m => m.categoria === cat).length;
  }

  isPdf(material: any): boolean {
    if (!material?.url_arquivo) return false;
    const formato = (material.formato || '').toUpperCase();
    if (formato.includes('PDF')) return true;
    const urlSemParams = material.url_arquivo.split('?')[0].toLowerCase();
    return urlSemParams.endsWith('.pdf');
  }

  abrirVisualizador(material: any): void {
    if (!this.temAcesso() || !material?.url_arquivo) return;
    this.materialVisualizando.set(material);
    this.urlVisualizacaoSegura.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(material.url_arquivo)
    );
  }

  fecharVisualizador(): void {
    this.materialVisualizando.set(null);
    this.urlVisualizacaoSegura.set(null);
  }

  onEscape(): void {
    if (this.materialVisualizando()) {
      this.fecharVisualizador();
    }
  }

  getBadgeEstilo(cat: string): string {
    switch (cat) {
      case 'Planilhas':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Modelos de Laudo':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Checklists':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'E-books':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Vídeos':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  toggleAcessoBloqueado(materialId: string): void {
    if (this.materialBloqueadoAberto() === materialId) {
      this.materialBloqueadoAberto.set(null);
    } else {
      this.materialBloqueadoAberto.set(materialId);
      this.tipoFeedback.set('alerta');
      this.mensagemFeedback.set(
        'Este material é exclusivo para membros com acesso liberado. Fale com o Admin da Comunidade para solicitar liberação deste módulo.'
      );
    }
  }

  async baixarMaterial(material: any): Promise<void> {
    if (!this.temAcesso() || this.processandoDownload()) return;

    this.processandoDownload.set(material.id);
    this.mensagemFeedback.set(null);

    const { error, urlArquivo } = await this.supabaseService.registrarDownloadMaterial(material.id);

    this.processandoDownload.set(null);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao processar download: ' + (error.message || 'Tente novamente.'));
      return;
    }

    // Atualiza contagem local de downloads
    this.materiais.update(lista =>
      lista.map(m => {
        if (m.id === material.id) {
          const count = (m.downloads_count || m.downloads || 0) + 1;
          return { ...m, downloads_count: count, downloads: count };
        }
        return m;
      })
    );

    if (urlArquivo) {
      try {
        window.open(urlArquivo, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Falha ao abrir URL em nova aba:', e);
      }
      this.tipoFeedback.set('sucesso');
      this.mensagemFeedback.set(`Download de "${material.titulo}" iniciado com sucesso!`);
    } else {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Arquivo ainda não disponível, contate o suporte.');
    }
  }
}
