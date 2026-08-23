import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

interface ForumRespostaAdmin {
  id: string;
  topico_id: string;
  autor_id: string;
  texto: string;
  criado_em?: string;
  autor?: {
    id: string;
    full_name?: string;
    professional_title?: string;
    email?: string;
  } | null;
}

interface ForumTopicoAdmin {
  id: string;
  autor_id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  criado_em?: string;
  autor?: {
    id: string;
    full_name?: string;
    professional_title?: string;
    email?: string;
  } | null;
  respostas?: ForumRespostaAdmin[];
}

@Component({
  selector: 'app-admin-forum',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Moderação do Fórum Técnico
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Acompanhe tópicos criados por membros, modere conteúdos e gerencie respostas.
          </p>
        </div>

        <!-- Botão Atualizar Lista -->
        <button
          type="button"
          (click)="carregarTopicos()"
          [disabled]="carregando()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
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
        
        <!-- Filtros por Categoria -->
        <div class="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          @for (cat of categoriasDisponiveis; track cat) {
            <button
              type="button"
              (click)="filtroCategoria.set(cat)"
              [class]="filtroCategoria() === cat
                ? 'px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs transition-all'
                : 'px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-all'"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Campo de Busca -->
        <div class="relative w-full sm:w-64">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar título, autor ou conteúdo..."
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
          <p class="text-xs text-slate-500 font-medium">Buscando tópicos do fórum no Supabase...</p>
        </div>
      } @else if (topicosFiltrados().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 class="text-sm font-bold text-slate-800">Nenhum tópico encontrado</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Não há publicações correspondentes aos filtros selecionados.
          </p>
        </div>
      } @else {
        <!-- Lista de Tópicos -->
        <div class="space-y-4">
          @for (topico of topicosFiltrados(); track topico.id) {
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4">
              
              <!-- Topo do Card do Tópico -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    {{ topico.categoria || 'Geral' }}
                  </span>
                  
                  <span class="text-xs text-slate-400 font-medium">
                    {{ formatarData(topico.criado_em) }}
                  </span>

                  <span class="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{{ (topico.respostas || []).length }} respostas</span>
                  </span>
                </div>

                <!-- Ações do Tópico (Moderação) -->
                <div class="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    (click)="toggleExpandir(topico.id)"
                    class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {{ topicoExpandidoId() === topico.id ? 'Recolher' : 'Ver Respostas (' + ((topico.respostas || []).length) + ')' }}
                  </button>

                  <!-- Botão Excluir com 2 cliques -->
                  @if (confirmarExclusaoTopicoId() === topico.id) {
                    <div class="flex items-center gap-1.5 animate-fadeIn">
                      <button
                        type="button"
                        (click)="executarExcluirTopico(topico.id)"
                        [disabled]="processandoId() === topico.id"
                        class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {{ processandoId() === topico.id ? 'Excluindo...' : 'Confirmar?' }}
                      </button>
                      <button
                        type="button"
                        (click)="confirmarExclusaoTopicoId.set(null)"
                        class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="confirmarExclusaoTopicoId.set(topico.id)"
                      class="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir tópico"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  }
                </div>
              </div>

              <!-- Título e Autor -->
              <div class="space-y-1.5">
                <h4 class="text-base font-bold text-slate-900">
                  {{ topico.titulo }}
                </h4>
                
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="font-semibold text-slate-700">
                    {{ topico.autor?.full_name || 'Membro' }}
                  </span>
                  @if (topico.autor?.professional_title) {
                    <span>•</span>
                    <span>{{ topico.autor?.professional_title }}</span>
                  }
                  @if (topico.autor?.email) {
                    <span class="text-slate-400">({{ topico.autor?.email }})</span>
                  }
                </div>

                <p class="text-xs text-slate-600 leading-relaxed pt-1 whitespace-pre-line">
                  {{ topico.conteudo }}
                </p>
              </div>

              <!-- Seção Expandida: Respostas do Tópico -->
              @if (topicoExpandidoId() === topico.id) {
                <div class="border-t border-slate-100 pt-4 mt-4 space-y-3 bg-slate-50/70 p-4 rounded-xl animate-fadeIn">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Respostas Publicadas ({{ (topico.respostas || []).length }})
                    </h5>
                  </div>

                  @if (!topico.respostas || topico.respostas.length === 0) {
                    <p class="text-xs text-slate-400 italic py-2">
                      Nenhuma resposta publicada neste tópico ainda.
                    </p>
                  } @else {
                    <div class="space-y-2.5">
                      @for (resposta of topico.respostas; track resposta.id) {
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-start justify-between gap-3">
                          <div class="space-y-1 flex-1">
                            <div class="flex items-center gap-2 text-xs">
                              <span class="font-bold text-slate-800">
                                {{ resposta.autor?.full_name || 'Membro' }}
                              </span>
                              @if (resposta.autor?.professional_title) {
                                <span class="text-slate-400 text-[11px]">• {{ resposta.autor?.professional_title }}</span>
                              }
                              <span class="text-slate-400 text-[10px]">
                                {{ formatarData(resposta.criado_em) }}
                              </span>
                            </div>
                            <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                              {{ resposta.texto }}
                            </p>
                          </div>

                          <!-- Excluir Resposta (2 cliques) -->
                          <div class="shrink-0">
                            @if (confirmarExclusaoRespostaId() === resposta.id) {
                              <div class="flex items-center gap-1 animate-fadeIn">
                                <button
                                  type="button"
                                  (click)="executarExcluirResposta(topico.id, resposta.id)"
                                  [disabled]="processandoId() === resposta.id"
                                  class="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {{ processandoId() === resposta.id ? '...' : 'Excluir?' }}
                                </button>
                                <button
                                  type="button"
                                  (click)="confirmarExclusaoRespostaId.set(null)"
                                  class="px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            } @else {
                              <button
                                type="button"
                                (click)="confirmarExclusaoRespostaId.set(resposta.id)"
                                class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Excluir resposta"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

            </div>
          }
        </div>
      }

    </div>
  `
})
export class AdminForumComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly topicos = signal<ForumTopicoAdmin[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly processandoId = signal<string | null>(null);
  readonly topicoExpandidoId = signal<string | null>(null);
  readonly confirmarExclusaoTopicoId = signal<string | null>(null);
  readonly confirmarExclusaoRespostaId = signal<string | null>(null);

  readonly filtroCategoria = signal<string>('Todos');
  readonly termoBusca = signal<string>('');

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly categoriasDisponiveis: string[] = [
    'Todos',
    'Geral',
    'Projetos',
    'Laudos & Vistorias',
    'Normas & Legislação',
    'Dúvidas Técnicas'
  ];

  readonly topicosFiltrados = computed(() => {
    let lista = this.topicos();
    const cat = this.filtroCategoria();
    if (cat !== 'Todos') {
      lista = lista.filter(t => (t.categoria || 'Geral').toLowerCase() === cat.toLowerCase());
    }
    const busca = this.termoBusca().toLowerCase().trim();
    if (busca) {
      lista = lista.filter(t =>
        (t.titulo || '').toLowerCase().includes(busca) ||
        (t.conteudo || '').toLowerCase().includes(busca) ||
        (t.autor?.full_name || '').toLowerCase().includes(busca) ||
        (t.autor?.email || '').toLowerCase().includes(busca)
      );
    }
    return lista;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarTopicos();
  }

  async carregarTopicos(): Promise<void> {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    try {
      const data = await this.supabaseService.listarTodosTopicosForum();
      this.topicos.set(data);
    } catch (e: any) {
      this.mensagemErro.set('Erro ao carregar tópicos do fórum: ' + (e?.message || e));
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value || '');
  }

  toggleExpandir(topicoId: string): void {
    if (this.topicoExpandidoId() === topicoId) {
      this.topicoExpandidoId.set(null);
    } else {
      this.topicoExpandidoId.set(topicoId);
    }
  }

  async executarExcluirTopico(topicoId: string): Promise<void> {
    this.processandoId.set(topicoId);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const { error } = await this.supabaseService.excluirTopicoForum(topicoId);
    this.processandoId.set(null);
    this.confirmarExclusaoTopicoId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao excluir tópico: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.topicos.update(lista => lista.filter(t => t.id !== topicoId));
    if (this.topicoExpandidoId() === topicoId) {
      this.topicoExpandidoId.set(null);
    }
    this.mensagemSucesso.set('Tópico e suas respostas associadas foram excluídos com sucesso.');
  }

  async executarExcluirResposta(topicoId: string, respostaId: string): Promise<void> {
    this.processandoId.set(respostaId);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const { error } = await this.supabaseService.excluirRespostaForum(respostaId);
    this.processandoId.set(null);
    this.confirmarExclusaoRespostaId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao excluir resposta: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.topicos.update(lista =>
      lista.map(t => {
        if (t.id === topicoId) {
          return {
            ...t,
            respostas: (t.respostas || []).filter(r => r.id !== respostaId)
          };
        }
        return t;
      })
    );

    this.mensagemSucesso.set('Resposta moderada e excluída com sucesso.');
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return 'Recente';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recente';
    }
  }
}
