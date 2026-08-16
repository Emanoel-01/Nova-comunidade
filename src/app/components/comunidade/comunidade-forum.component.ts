import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { CategoriaForum } from './comunidade-state.service';

@Component({
  selector: 'app-comunidade-forum',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- Feedback de Sucesso/Erro Inline -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <div class="flex items-center gap-2">
            @if (tipoFeedback() === 'sucesso') {
              <span>✓</span>
            } @else {
              <span>⚠</span>
            }
            <span>{{ mensagemFeedback() }}</span>
          </div>
          <button type="button" (click)="mensagemFeedback.set(null)" class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer">✕</button>
        </div>
      }

      <!-- 1. Cabeçalho do Fórum Técnico (Banner Escuro Gradiente) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Debates Técnicos & Resolução de Dúvidas</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Fórum Técnico</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Troque experiências, tire dúvidas normativas e discuta desafios práticos com profissionais de todo o Brasil.
            </p>
          </div>

          <!-- Botão Novo Tópico -->
          <div class="shrink-0 self-start md:self-auto">
            @if (!formularioAberto()) {
              <button
                type="button"
                (click)="abrirFormulario()"
                class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-900/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Tópico</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- 2. Formulário de Criação de Novo Tópico (Quando aberto) -->
      @if (formularioAberto()) {
        <div class="bg-white rounded-3xl border-2 border-indigo-500/80 p-6 sm:p-8 shadow-md space-y-5 animate-fadeIn">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📝 Criar Novo Tópico de Discussão</span>
            </h4>

            <button
              type="button"
              (click)="fecharFormulario()"
              class="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ✕ Fechar
            </button>
          </div>

          <div class="space-y-4">
            <!-- Título do Tópico -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">
                Título da Discussão:
              </label>
              <input
                type="text"
                [value]="novoTitulo()"
                (input)="onTituloInput($event)"
                placeholder="Ex: Como proceder em caso de recusa de acesso pelo vizinho na vistoria cautelar?"
                class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
              />
            </div>

            <!-- Categoria do Tópico (Select com as 8 opções) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">
                Categoria Técnica:
              </label>
              <select
                [value]="novaCategoria()"
                (change)="onCategoriaChange($event)"
                class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden cursor-pointer"
              >
                @for (cat of todasCategorias; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>

            <!-- Conteúdo do Tópico -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">
                Detalhamento / Contexto da Dúvida:
              </label>
              <textarea
                [value]="novoConteudo()"
                (input)="onConteudoInput($event)"
                rows="4"
                placeholder="Descreva detalhadamente a situação, normas envolvidas, dados do caso e perguntas aos colegas..."
                class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl p-3.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden resize-none"
              ></textarea>
            </div>

            <!-- Botões de Ação do Formulário -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="fecharFormulario()"
                class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="publicarTopico()"
                [disabled]="!novoTitulo().trim() || !novoConteudo().trim() || salvandoTopico()"
                [class]="novoTitulo().trim() && novoConteudo().trim() && !salvandoTopico()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                class="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2"
              >
                @if (salvandoTopico()) {
                  <span class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>Publicando...</span>
                } @else {
                  <span>Publicar Tópico</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
            </div>
          </div>

        </div>
      }

      <!-- 3. Barra de Filtro de Categorias em Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          (click)="categoriaFiltro.set('Todos')"
          [class]="categoriaFiltro() === 'Todos'
            ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-200'
            : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'"
          class="px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>💬</span>
          <span>Todas as Categorias</span>
          <span
            [class]="categoriaFiltro() === 'Todos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
            class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1"
          >
            {{ topicos().length }}
          </span>
        </button>

        @for (cat of todasCategorias; track cat) {
          <button
            type="button"
            (click)="categoriaFiltro.set(cat)"
            [class]="categoriaFiltro() === cat
              ? 'bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'"
            class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{{ cat }}</span>
            <span
              [class]="categoriaFiltro() === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
              class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1"
            >
              {{ contarTopicosPorCategoria(cat) }}
            </span>
          </button>
        }
      </div>

      <!-- 4. Lista de Tópicos do Fórum -->
      @if (carregando()) {
        <!-- Skeleton Loading -->
        <div class="space-y-4">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs animate-pulse space-y-4">
            <div class="flex items-center justify-between">
              <div class="h-6 bg-slate-200 rounded-full w-28"></div>
              <div class="h-4 bg-slate-200 rounded-md w-16"></div>
            </div>
            <div class="h-5 bg-slate-200 rounded-md w-3/4"></div>
            <div class="h-12 bg-slate-100 rounded-xl"></div>
          </div>
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs animate-pulse space-y-4">
            <div class="flex items-center justify-between">
              <div class="h-6 bg-slate-200 rounded-full w-24"></div>
              <div class="h-4 bg-slate-200 rounded-md w-20"></div>
            </div>
            <div class="h-5 bg-slate-200 rounded-md w-2/3"></div>
            <div class="h-12 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      } @else if (topicosFiltrados().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3 shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">Nenhum tópico encontrado</h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            @if (categoriaFiltro() !== 'Todos') {
              Não há tópicos na categoria "{{ categoriaFiltro() }}". Seja o primeiro a iniciar uma discussão!
            } @else {
              Ainda não há discussões no fórum técnico. Inicie a primeira discussão acima!
            }
          </p>
        </div>
      } @else {
        <div class="space-y-5">
          @for (topico of topicosFiltrados(); track topico.id) {
            
            <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all space-y-4">
              
              <!-- Topo do Card: Badge de Categoria Colorido + Data -->
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <span
                  [class]="getCategoriaBadgeEstilo(topico.categoria)"
                  class="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                >
                  <span>{{ topico.categoria }}</span>
                </span>

                <span class="text-xs text-slate-400 font-medium">
                  {{ formatarTempo(topico.criado_em || topico.tempo) }}
                </span>
              </div>

              <!-- Título do Tópico & Autor -->
              <div class="space-y-2">
                <h4
                  (click)="toggleTopicoExpandido(topico.id)"
                  class="text-base sm:text-lg font-black text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer leading-snug"
                >
                  {{ topico.titulo }}
                </h4>

                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <div class="w-5 h-5 rounded-full bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {{ getIniciais(getAutorNome(topico.autor)) }}
                  </div>
                  <span class="font-bold text-slate-800">{{ getAutorNome(topico.autor) }}</span>
                  <span>•</span>
                  <span>{{ getAutorCargo(topico.autor) }}</span>
                </div>
              </div>

              <!-- Conteúdo Prévio ou Completo -->
              @if (topicosExpandidos().includes(topico.id)) {
                <div class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 whitespace-pre-line animate-fadeIn">
                  {{ topico.conteudo }}
                </div>
              } @else {
                <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {{ topico.conteudo }}
                </p>
              }

              <!-- Rodapé do Card: Curtidas + Contador de Respostas + Botão Expandir -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                
                <div class="flex items-center gap-3">
                  <!-- Botão Curtir Tópico -->
                  <button
                    type="button"
                    (click)="toggleCurtirTopico(topico)"
                    [class]="topico.curtidoPorMim
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg
                      [class]="topico.curtidoPorMim ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-500'"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ topico.curtidas }}</span>
                  </button>

                  <!-- Botão Respostas -->
                  <button
                    type="button"
                    (click)="toggleTopicoExpandido(topico.id)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ (topico.respostas || []).length }} {{ (topico.respostas || []).length === 1 ? 'resposta' : 'respostas' }}</span>
                  </button>
                </div>

                <!-- Botão Ver Discussão Completa -->
                <button
                  type="button"
                  (click)="toggleTopicoExpandido(topico.id)"
                  class="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{{ topicosExpandidos().includes(topico.id) ? 'Ocultar Respostas' : 'Ver Discussão Completa' }}</span>
                  <svg
                    class="w-3.5 h-3.5 transition-transform"
                    [class.rotate-180]="topicosExpandidos().includes(topico.id)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              </div>

              <!-- SEÇÃO EXPANDIDA DE RESPOSTAS -->
              @if (topicosExpandidos().includes(topico.id)) {
                <div class="border-t border-slate-100 pt-5 space-y-4 bg-slate-50/70 p-5 rounded-2xl animate-fadeIn">
                  
                  <h5 class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>💬 Respostas da Comunidade ({{ (topico.respostas || []).length }})</span>
                  </h5>

                  <!-- Lista de Respostas ou Estado Vazio -->
                  @if (!topico.respostas || topico.respostas.length === 0) {
                    <div class="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-1">
                      <p class="text-xs font-bold text-slate-700">Seja o primeiro a responder este tópico!</p>
                      <p class="text-[11px] text-slate-400">Contribua com seu conhecimento ou compartilhe sua experiência técnica.</p>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (resp of topico.respostas; track resp.id) {
                        <div class="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                          <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                              <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                {{ getIniciais(getAutorNome(resp.autor)) }}
                              </div>
                              <div>
                                <span class="text-xs font-bold text-slate-900">{{ getAutorNome(resp.autor) }}</span>
                                <span class="text-[11px] text-slate-400 ml-1.5">• {{ getAutorCargo(resp.autor) }}</span>
                              </div>
                            </div>
                            <span class="text-[10px] text-slate-400">{{ formatarTempo(resp.criado_em || resp.tempo) }}</span>
                          </div>

                          <p class="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-line">
                            {{ resp.texto }}
                          </p>

                          <!-- Curtir Resposta -->
                          <div class="flex items-center justify-end pt-1">
                            <button
                              type="button"
                              (click)="toggleCurtirResposta(topico, resp)"
                              [class]="resp.curtidoPorMim
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-400 hover:text-slate-600'"
                              class="text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>❤️</span>
                              <span>{{ resp.curtidas }} útil</span>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <!-- Campo de Texto para Nova Resposta -->
                  <div class="pt-3 border-t border-slate-200/80 space-y-2">
                    <label class="block text-xs font-bold text-slate-700">Sua Resposta Técnica:</label>
                    
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                      <textarea
                        [value]="getRespostaInput(topico.id)"
                        (input)="setRespostaInput(topico.id, $event)"
                        rows="2"
                        placeholder="Escreva sua resposta embasada em normas técnicas ou vivência prática..."
                        class="flex-1 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl p-3 border border-slate-200 focus:border-indigo-500 outline-hidden resize-none"
                      ></textarea>

                      <button
                        type="button"
                        (click)="enviarResposta(topico.id)"
                        [disabled]="!getRespostaInput(topico.id).trim() || enviandoRespostaId() === topico.id"
                        [class]="getRespostaInput(topico.id).trim() && enviandoRespostaId() !== topico.id
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                        class="px-5 py-3 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-2"
                      >
                        @if (enviandoRespostaId() === topico.id) {
                          <span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          <span>Enviando...</span>
                        } @else {
                          <span>Enviar Resposta</span>
                        }
                      </button>
                    </div>
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
export class ComunidadeForumComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly topicos = signal<any[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly salvandoTopico = signal<boolean>(false);
  readonly enviandoRespostaId = signal<string | null>(null);

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');

  readonly todasCategorias: CategoriaForum[] = [
    'Geral',
    'Engenharia Diagnóstica',
    'Gestão de Obras',
    'BIM',
    'Manutenção Predial',
    'Engenharia Legal',
    'Carreira',
    'Dúvidas'
  ];

  readonly categoriaFiltro = signal<string>('Todos');
  readonly topicosExpandidos = signal<string[]>([]);
  readonly respostaInputs = signal<{ [topicoId: string]: string }>({});

  // Formulário de Novo Tópico
  readonly formularioAberto = signal<boolean>(false);
  readonly novoTitulo = signal<string>('');
  readonly novaCategoria = signal<CategoriaForum>('Engenharia Diagnóstica');
  readonly novoConteudo = signal<string>('');

  readonly topicosFiltrados = computed(() => {
    const cat = this.categoriaFiltro();
    const lista = this.topicos();
    if (cat === 'Todos') return lista;
    return lista.filter(t => t.categoria === cat);
  });

  async ngOnInit(): Promise<void> {
    await this.carregarTopicos();
  }

  async carregarTopicos(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.supabaseService.listarForumTopicos();
      this.topicos.set(lista);
    } catch (e) {
      console.warn('Erro ao carregar tópicos do fórum:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  contarTopicosPorCategoria(cat: string): number {
    return this.topicos().filter(t => t.categoria === cat).length;
  }

  toggleTopicoExpandido(topicoId: string): void {
    this.topicosExpandidos.update(lista => {
      if (lista.includes(topicoId)) {
        return lista.filter(id => id !== topicoId);
      } else {
        return [...lista, topicoId];
      }
    });
  }

  getRespostaInput(topicoId: string): string {
    return this.respostaInputs()[topicoId] || '';
  }

  setRespostaInput(topicoId: string, event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.respostaInputs.update(dict => ({
      ...dict,
      [topicoId]: target.value
    }));
  }

  async enviarResposta(topicoId: string): Promise<void> {
    const texto = this.getRespostaInput(topicoId).trim();
    if (!texto || this.enviandoRespostaId() === topicoId) return;

    this.enviandoRespostaId.set(topicoId);
    this.mensagemFeedback.set(null);

    const { error } = await this.supabaseService.adicionarForumResposta(topicoId, texto);

    this.enviandoRespostaId.set(null);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao publicar resposta: ' + (error.message || 'Tente novamente.'));
      return;
    }

    // Limpa o input
    this.respostaInputs.update(dict => ({
      ...dict,
      [topicoId]: ''
    }));

    // Recarrega tópicos para exibir resposta em tempo real
    await this.carregarTopicos();

    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Resposta publicada com sucesso!');
  }

  abrirFormulario(): void {
    this.formularioAberto.set(true);
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.novoTitulo.set('');
    this.novoConteudo.set('');
  }

  onTituloInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.novoTitulo.set(target.value);
  }

  onCategoriaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.novaCategoria.set(target.value as CategoriaForum);
  }

  onConteudoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.novoConteudo.set(target.value);
  }

  async publicarTopico(): Promise<void> {
    const t = this.novoTitulo().trim();
    const c = this.novoConteudo().trim();
    const cat = this.novaCategoria();
    if (!t || !c || this.salvandoTopico()) return;

    this.salvandoTopico.set(true);
    this.mensagemFeedback.set(null);

    const { error } = await this.supabaseService.criarForumTopico(t, cat, c);

    this.salvandoTopico.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao criar tópico: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.fecharFormulario();
    await this.carregarTopicos();

    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Tópico publicado com sucesso no fórum!');
  }

  async toggleCurtirTopico(topico: any): Promise<void> {
    const curtidoAtual = !!topico.curtidoPorMim;
    const novoStatus = !curtidoAtual;
    const delta = novoStatus ? 1 : -1;

    // Atualização otimista
    this.topicos.update(lista =>
      lista.map(t => {
        if (t.id === topico.id) {
          return {
            ...t,
            curtidoPorMim: novoStatus,
            curtidas: Math.max(0, (t.curtidas || 0) + delta)
          };
        }
        return t;
      })
    );

    const { error } = await this.supabaseService.toggleForumCurtida('topico', topico.id, curtidoAtual);
    if (error) {
      // Reverter se falhou
      this.topicos.update(lista =>
        lista.map(t => {
          if (t.id === topico.id) {
            return {
              ...t,
              curtidoPorMim: curtidoAtual,
              curtidas: Math.max(0, (t.curtidas || 0) - delta)
            };
          }
          return t;
        })
      );
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao curtir tópico: ' + (error.message || 'Tente novamente.'));
    }
  }

  async toggleCurtirResposta(topico: any, resp: any): Promise<void> {
    const curtidoAtual = !!resp.curtidoPorMim;
    const novoStatus = !curtidoAtual;
    const delta = novoStatus ? 1 : -1;

    // Atualização otimista
    this.topicos.update(lista =>
      lista.map(t => {
        if (t.id === topico.id) {
          const novasRespostas = (t.respostas || []).map((r: any) => {
            if (r.id === resp.id) {
              return {
                ...r,
                curtidoPorMim: novoStatus,
                curtidas: Math.max(0, (r.curtidas || 0) + delta)
              };
            }
            return r;
          });
          return { ...t, respostas: novasRespostas };
        }
        return t;
      })
    );

    const { error } = await this.supabaseService.toggleForumCurtida('resposta', resp.id, curtidoAtual);
    if (error) {
      // Reverter se falhou
      this.topicos.update(lista =>
        lista.map(t => {
          if (t.id === topico.id) {
            const novasRespostas = (t.respostas || []).map((r: any) => {
              if (r.id === resp.id) {
                return {
                  ...r,
                  curtidoPorMim: curtidoAtual,
                  curtidas: Math.max(0, (r.curtidas || 0) - delta)
                };
              }
              return r;
            });
            return { ...t, respostas: novasRespostas };
          }
          return t;
        })
      );
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao curtir resposta: ' + (error.message || 'Tente novamente.'));
    }
  }

  getAutorNome(autor: any): string {
    if (typeof autor === 'string') return autor;
    return autor?.full_name || 'Profissional da Comunidade';
  }

  getAutorCargo(autor: any): string {
    if (typeof autor === 'string') return 'Membro da Comunidade';
    return autor?.professional_title || 'Engenheiro / Especialista';
  }

  getIniciais(nome: string): string {
    if (!nome) return '👤';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarTempo(tempoOuData: string | undefined): string {
    if (!tempoOuData) return 'Recentemente';
    if (tempoOuData.startsWith('há ') || tempoOuData.startsWith('Ontem')) return tempoOuData;

    try {
      const data = new Date(tempoOuData);
      if (isNaN(data.getTime())) return tempoOuData;

      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `há ${diffMin} min`;
      if (diffHoras < 24) return `há ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
      if (diffDias === 1) return 'Ontem';
      if (diffDias < 7) return `há ${diffDias} dias`;

      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return tempoOuData;
    }
  }

  getCategoriaBadgeEstilo(cat: string): string {
    switch (cat) {
      case 'Engenharia Diagnóstica':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Gestão de Obras':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BIM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Manutenção Predial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Engenharia Legal':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Carreira':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Dúvidas':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'Geral':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
