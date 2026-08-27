import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

export interface PostAnalyticsItem {
  id: string;
  titulo: string;
  categoria: string;
  publicado: boolean;
  criado_em: string;
  totalVisualizacoes: number;
}

@Component({
  selector: 'app-admin-blog-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabeçalho com Ações -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">
            Analytics do Blog Mundo 4.0
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Métricas de audiência, alcance técnico e desempenho individual dos artigos.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            (click)="carregarDados()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar métricas agora"
          >
            <svg
              class="w-3.5 h-3.5"
              [class.animate-spin]="carregando()"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar Métricas</span>
          </button>
        </div>
      </div>

      <!-- Grid de 4 Cards de Métricas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <!-- Card 1: Total de Visualizações -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Visualizações Totais</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900">
            @if (carregando()) {
              <span class="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md"></span>
            } @else {
              {{ totalVisualizacoes() }}
            }
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Leituras registradas em blog_analytics</p>
        </div>

        <!-- Card 2: Posts Publicados -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Posts Publicados</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900">
            @if (carregando()) {
              <span class="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md"></span>
            } @else {
              {{ totalPostsPublicados() }}
            }
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Artigos no ar acessíveis ao público</p>
        </div>

        <!-- Card 3: Média de Visualizações -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Média por Artigo</span>
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900">
            @if (carregando()) {
              <span class="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md"></span>
            } @else {
              {{ mediaVisualizacoes() }}
            }
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Visualizações médias por post no ar</p>
        </div>

        <!-- Card 4: Total de Artigos (Geral) -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Acervo Total</span>
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-black text-slate-900">
            @if (carregando()) {
              <span class="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md"></span>
            } @else {
              {{ totalPostsGeral() }}
            }
          </div>
          <p class="text-[11px] text-slate-400 font-medium">Inclui rascunhos e publicações</p>
        </div>

      </div>

      <!-- Seção Principal: Ranking dos Artigos -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 class="text-base font-bold text-slate-900">
              Ranking de Desempenho dos Artigos
            </h4>
            <p class="text-xs text-slate-500 mt-0.5">
              Classificação por número de leituras consolidadas no banco de dados.
            </p>
          </div>

          <!-- Campo de Busca Rápida -->
          <div class="relative w-full sm:w-64">
            <input
              type="text"
              #buscaInput
              [value]="termoBusca()"
              (input)="termoBusca.set(buscaInput.value)"
              placeholder="Buscar por título..."
              class="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        @if (carregando()) {
          <div class="p-12 text-center space-y-3">
            <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500 font-medium">Carregando métricas do Supabase...</p>
          </div>
        } @else if (rankingFiltrado().length === 0) {
          <div class="p-12 text-center space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">Nenhum artigo encontrado</p>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              @if (termoBusca()) {
                Nenhum resultado corresponde ao termo pesquisado.
              } @else {
                Ainda não há posts cadastrados no blog para exibição de métricas.
              }
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th class="py-3 px-4 w-14 text-center">Pos.</th>
                  <th class="py-3 px-4">Artigo & Categoria</th>
                  <th class="py-3 px-4 w-28 text-center">Status</th>
                  <th class="py-3 px-4 w-32">Publicação</th>
                  <th class="py-3 px-4 w-44 text-right">Visualizações</th>
                  <th class="py-3 px-4 w-20 text-center">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (item of rankingFiltrado(); track item.id; let i = $index) {
                  <tr class="hover:bg-slate-50/80 transition-colors group">
                    
                    <!-- Posição no Ranking -->
                    <td class="py-3.5 px-4 text-center">
                      @if (i === 0) {
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs shadow-2xs" title="1º Lugar">
                          🥇
                        </span>
                      } @else if (i === 1) {
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs shadow-2xs" title="2º Lugar">
                          🥈
                        </span>
                      } @else if (i === 2) {
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-black text-xs shadow-2xs" title="3º Lugar">
                          🥉
                        </span>
                      } @else {
                        <span class="text-slate-400 font-bold">
                          #{{ i + 1 }}
                        </span>
                      }
                    </td>

                    <!-- Título e Categoria -->
                    <td class="py-3.5 px-4">
                      <div class="space-y-1">
                        <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {{ item.titulo }}
                        </div>
                        <div class="flex items-center gap-2">
                          <span [class]="obterEstiloCategoria(item.categoria)" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {{ item.categoria }}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-4 text-center">
                      @if (item.publicado) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          No Ar
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px] border border-slate-200">
                          <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Rascunho
                        </span>
                      }
                    </td>

                    <!-- Data -->
                    <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {{ formatarData(item.criado_em) }}
                    </td>

                    <!-- Total de Visualizações com Barra Visual -->
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex flex-col items-end gap-1">
                        <div class="font-black text-slate-900 text-sm">
                          {{ item.totalVisualizacoes }}
                          <span class="text-[10px] font-normal text-slate-400 ml-0.5">views</span>
                        </div>
                        
                        <!-- Barra proporcional -->
                        <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            [style.width.%]="calcularPercentualVisualizacoes(item.totalVisualizacoes)"
                          ></div>
                        </div>
                      </div>
                    </td>

                    <!-- Ação: Abrir no Blog Público -->
                    <td class="py-3.5 px-4 text-center">
                      <a
                        [routerLink]="['/blog']"
                        [queryParams]="{ post: item.id }"
                        target="_blank"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="Visualizar post no Blog"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

      </div>

    </div>
  `
})
export class AdminBlogAnalyticsComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly carregando = signal(true);
  readonly termoBusca = signal('');
  
  readonly totalVisualizacoes = signal(0);
  readonly totalPostsPublicados = signal(0);
  readonly totalPostsGeral = signal(0);
  readonly mediaVisualizacoes = signal(0);
  readonly rankingPosts = signal<PostAnalyticsItem[]>([]);

  readonly rankingFiltrado = computed(() => {
    const lista = this.rankingPosts();
    const termo = this.termoBusca().trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(item =>
      item.titulo.toLowerCase().includes(termo) ||
      item.categoria.toLowerCase().includes(termo)
    );
  });

  readonly maiorContagemViews = computed(() => {
    const lista = this.rankingPosts();
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(i => i.totalVisualizacoes), 1);
  });

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      const dados = await this.supabaseService.obterAnalyticsBlog();
      this.totalVisualizacoes.set(dados.totalVisualizacoes);
      this.totalPostsPublicados.set(dados.totalPostsPublicados);
      this.totalPostsGeral.set(dados.totalPostsGeral);
      this.mediaVisualizacoes.set(dados.mediaVisualizacoesPorPost);
      this.rankingPosts.set(dados.rankingPosts);
    } catch (err) {
      console.warn('Erro ao carregar analytics do blog:', err);
    } finally {
      this.carregando.set(false);
    }
  }

  calcularPercentualVisualizacoes(views: number): number {
    const max = this.maiorContagemViews();
    if (max <= 0) return 0;
    return Math.min(100, Math.round((views / max) * 100));
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '—';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dataStr;
    }
  }

  obterEstiloCategoria(cat: string): string {
    switch (cat) {
      case 'Gestão 4.0':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Manutenção Predial':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Tecnologia BIM':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Engenharia Legal':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Carreira':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }
}
