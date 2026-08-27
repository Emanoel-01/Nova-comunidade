import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BIBLIOTECA_PROMPTS, CategoriaPrompts, PromptItem } from './biblioteca-prompts.data';

export interface PromptComCategoria extends PromptItem {
  categoriaNome: string;
  categoriaCor: string;
  categoriaIcone: string;
}

@Component({
  selector: 'app-biblioteca-prompts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- 1. Cabeçalho da Biblioteca de Prompts -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

        <div class="relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Catálogo Especializado</span>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1 max-w-3xl">
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Biblioteca de Prompts
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {{ totalPromptsGeral }} prompts especializados para engenharia civil e inspeção predial — encontre, copie e use na sua ferramenta de IA preferida.
              </p>
            </div>

            <!-- Totalizador Rápido -->
            <div class="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start lg:self-auto flex items-center gap-3">
              <div class="text-right">
                <div class="text-[11px] uppercase font-bold tracking-wider text-indigo-200">Total no Catálogo</div>
                <div class="text-xl font-black text-white">{{ totalPromptsGeral }} prompts</div>
              </div>
            </div>
          </div>

          <!-- Campo de Busca em Tempo Real -->
          <div class="pt-2">
            <div class="relative max-w-2xl">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-prompts-input"
                type="text"
                [value]="buscaTexto()"
                (input)="atualizarBusca($event)"
                placeholder="Buscar por título, descrição, assunto ou conteúdo do prompt..."
                class="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-inner"
              />
              @if (buscaTexto().length > 0) {
                <button
                  type="button"
                  (click)="limparBusca()"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title="Limpar busca"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Filtro de Categorias em Pills Horizontais -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
          <span>Filtrar por Categoria:</span>
          <span>Exibindo {{ promptsFiltrados().length }} de {{ totalPromptsGeral }}</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <!-- Pill "Todas" -->
          <button
            type="button"
            (click)="selecionarCategoria('todas')"
            [class]="categoriaSelecionada() === 'todas'
              ? 'bg-[#132A41] text-white shadow-sm ring-2 ring-[#132A41]/20 font-black'
              : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 font-semibold'"
            class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Todas</span>
            <span
              [class]="categoriaSelecionada() === 'todas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
              class="px-1.5 py-0.5 rounded-md text-[11px] font-bold"
            >
              {{ totalPromptsGeral }}
            </span>
          </button>

          <!-- Pills de Cada Categoria -->
          @for (cat of categorias; track cat.nome) {
            <button
              type="button"
              (click)="selecionarCategoria(cat.nome)"
              [class]="obterEstiloPill(cat.nome, cat.cor)"
              class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border"
            >
              <span>{{ cat.nome }}</span>
              <span
                [class]="obterEstiloBadgeContador(cat.nome, cat.cor)"
                class="px-1.5 py-0.5 rounded-md text-[11px] font-bold"
              >
                {{ cat.prompts.length }}
              </span>
            </button>
          }
        </div>
      </div>

      <!-- 3. Lista de Cards de Prompts -->
      @if (promptsFiltrados().length > 0) {
        <div class="space-y-3">
          @for (item of promptsFiltrados(); track item.id) {
            <div
              class="bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden"
              [class.border-indigo-300]="itemExpandido() === item.id && item.categoriaCor !== 'copper'"
              [class.border-[#B5642A]/50]="itemExpandido() === item.id && item.categoriaCor === 'copper'"
              [class.border-slate-200]="itemExpandido() !== item.id"
              [class.shadow-md]="itemExpandido() === item.id"
            >
              <!-- Cabeçalho do Card (Clicável para expandir) -->
              <div
                (click)="toggleExpansao(item.id)"
                class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
              >
                <div class="space-y-1.5 min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Badge da Categoria -->
                    <span [class]="obterBadgeCategoria(item.categoriaCor)" class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border">
                      {{ item.categoriaNome }}
                    </span>
                    <span class="text-[11px] font-mono font-bold text-slate-400">#{{ item.id }}</span>
                    @if (item.quandoUsar) {
                      <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#B5642A]/10 text-[#B5642A] border border-[#B5642A]/20">
                        Contexto Especializado
                      </span>
                    }
                  </div>

                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {{ item.titulo }}
                  </h3>

                  <p class="text-xs text-slate-600 line-clamp-1">
                    {{ item.descricao }}
                  </p>
                </div>

                <!-- Botões de Ação e Seta de Expansão -->
                <div class="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    (click)="copiarPrompt(item.prompt, item.id, $event)"
                    [class]="promptCopiadoId() === item.id
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Copiar Prompt para a Área de Transferência"
                  >
                    @if (promptCopiadoId() === item.id) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copiado!</span>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copiar Prompt</span>
                    }
                  </button>

                  <div class="p-1 text-slate-400 hover:text-slate-600 transition-transform duration-200" [class.rotate-180]="itemExpandido() === item.id">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Conteúdo Expandido com Prompt Formatado -->
              @if (itemExpandido() === item.id) {
                <div class="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  
                  <!-- Quando Usar (Contexto opcional) -->
                  @if (item.quandoUsar) {
                    <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs flex items-start gap-2.5">
                      <span class="text-base shrink-0">💡</span>
                      <div class="space-y-0.5">
                        <span class="font-bold text-amber-900">Quando usar:</span>
                        <p class="italic text-amber-900/90 leading-relaxed">{{ item.quandoUsar }}</p>
                      </div>
                    </div>
                  }

                  <div class="flex items-center justify-between pt-1">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Texto do Prompt para IA</span>
                    </div>

                    <span class="text-[11px] text-slate-400">
                      Campos destacados entre colchetes devem ser personalizados
                    </span>
                  </div>

                  <!-- Caixa do Prompt Formatado com Placeholders Destacados -->
                  <div class="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-mono leading-relaxed select-text shadow-inner">
                    @for (segmento of formatarSegmentosPrompt(item.prompt); track $index) {
                      @if (segmento.isPlaceholder) {
                        <span class="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-bold border border-amber-200/60">{{ segmento.texto }}</span>
                      } @else {
                        <span>{{ segmento.texto }}</span>
                      }
                    }
                  </div>

                  <!-- Exemplo de Saída (Colapsável Opcional) -->
                  @if (item.exemploSaida) {
                    <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <button
                        type="button"
                        (click)="toggleExemploSaida(item.id, $event)"
                        class="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Ver exemplo de resultado esperado</span>
                        </div>
                        <svg
                          class="w-4 h-4 text-slate-400 transition-transform duration-200"
                          [class.rotate-180]="exemploExpandido() === item.id"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      @if (exemploExpandido() === item.id) {
                        <div class="p-3.5 text-xs text-slate-700 font-sans leading-relaxed border-t border-slate-200 bg-slate-50/40">
                          <p class="whitespace-pre-line">{{ item.exemploSaida }}</p>
                        </div>
                      }
                    </div>
                  }

                  <!-- Ações do Rodapé do Card -->
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-[11px] text-slate-500">
                      Dica: cole diretamente no ChatGPT, Gemini ou Claude.
                    </span>

                    <button
                      type="button"
                      (click)="copiarPrompt(item.prompt, item.id, $event)"
                      [class]="promptCopiadoId() === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#132A41] hover:bg-[#1f3f60] text-white'"
                      class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      @if (promptCopiadoId() === item.id) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copiado com Sucesso!</span>
                      } @else {
                        <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copiar Este Prompt</span>
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Estado Vazio da Busca -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="space-y-1 max-w-md mx-auto">
            <h4 class="text-base font-bold text-slate-800">
              Nenhum prompt encontrado para "{{ buscaTexto() }}"
            </h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              Tente buscar por outros termos técnicos, palavras-chave de serviços ou selecione "Todas" as categorias.
            </p>
          </div>

          <div class="pt-2 flex justify-center gap-3">
            <button
              type="button"
              (click)="limparFiltros()"
              class="px-4 py-2.5 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Limpar Filtros e Ver Todos
            </button>
          </div>
        </div>
      }

      <!-- 4. Nota de Rodapé da Área -->
      <div class="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-slate-600 leading-relaxed">
          <strong>Nota de uso:</strong> Prompts são pontos de partida — ajuste os campos entre colchetes conforme o seu caso e cole na ferramenta de IA de sua preferência (ChatGPT, Gemini, Claude, etc.).
        </p>
      </div>

    </div>
  `
})
export class BibliotecaPromptsComponent {
  readonly categorias = BIBLIOTECA_PROMPTS;

  readonly buscaTexto = signal<string>('');
  readonly categoriaSelecionada = signal<string>('todas');
  readonly itemExpandido = signal<string | null>(null);
  readonly exemploExpandido = signal<string | null>(null);
  readonly promptCopiadoId = signal<string | null>(null);

  // Lista plana de todos os prompts com metadados de categoria
  private readonly todosPrompts: PromptComCategoria[] = BIBLIOTECA_PROMPTS.flatMap(cat =>
    cat.prompts.map(p => ({
      ...p,
      categoriaNome: cat.nome,
      categoriaCor: cat.cor,
      categoriaIcone: cat.icone
    }))
  );

  readonly totalPromptsGeral = this.todosPrompts.length;

  // Prompts filtrados em tempo real por busca e categoria
  readonly promptsFiltrados = computed(() => {
    const busca = this.buscaTexto().toLowerCase().trim();
    const cat = this.categoriaSelecionada();

    return this.todosPrompts.filter(item => {
      // Filtro por categoria
      if (cat !== 'todas' && item.categoriaNome !== cat) {
        return false;
      }

      // Filtro por busca de texto (título, descrição, ID ou prompt)
      if (busca.length > 0) {
        const matchTitulo = item.titulo.toLowerCase().includes(busca);
        const matchDesc = item.descricao.toLowerCase().includes(busca);
        const matchPrompt = item.prompt.toLowerCase().includes(busca);
        const matchId = item.id.toLowerCase().includes(busca);
        const matchCat = item.categoriaNome.toLowerCase().includes(busca);
        const matchQuando = item.quandoUsar?.toLowerCase().includes(busca) || false;

        return matchTitulo || matchDesc || matchPrompt || matchId || matchCat || matchQuando;
      }

      return true;
    });
  });

  atualizarBusca(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.buscaTexto.set(target.value);
  }

  limparBusca(): void {
    this.buscaTexto.set('');
  }

  selecionarCategoria(catNome: string): void {
    this.categoriaSelecionada.set(catNome);
  }

  limparFiltros(): void {
    this.buscaTexto.set('');
    this.categoriaSelecionada.set('todas');
  }

  toggleExpansao(id: string): void {
    if (this.itemExpandido() === id) {
      this.itemExpandido.set(null);
    } else {
      this.itemExpandido.set(id);
    }
  }

  toggleExemploSaida(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.exemploExpandido() === id) {
      this.exemploExpandido.set(null);
    } else {
      this.exemploExpandido.set(id);
    }
  }

  copiarPrompt(texto: string, id: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        this.promptCopiadoId.set(id);
        setTimeout(() => {
          if (this.promptCopiadoId() === id) {
            this.promptCopiadoId.set(null);
          }
        }, 2000);
      }).catch(() => {
        this.fallbackCopiar(texto, id);
      });
    } else {
      this.fallbackCopiar(texto, id);
    }
  }

  private fallbackCopiar(texto: string, id: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = texto;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.promptCopiadoId.set(id);
      setTimeout(() => {
        if (this.promptCopiadoId() === id) {
          this.promptCopiadoId.set(null);
        }
      }, 2000);
    } catch {
      // ignore
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Divide o texto do prompt em segmentos normais e placeholders [Texto]
  formatarSegmentosPrompt(prompt: string): { texto: string; isPlaceholder: boolean }[] {
    const regex = /(\[[^\]]+\])/g;
    const partes = prompt.split(regex);
    return partes.map(parte => ({
      texto: parte,
      isPlaceholder: parte.startsWith('[') && parte.endsWith(']')
    }));
  }

  // Estilos visuais dinâmicos conforme a cor da categoria
  obterEstiloPill(nome: string, cor: string): string {
    const selecionada = this.categoriaSelecionada() === nome;

    if (selecionada) {
      switch (cor) {
        case 'copper':
          return 'bg-[#B5642A] text-white border-[#B5642A] font-black shadow-xs ring-2 ring-[#B5642A]/20';
        case 'blue':
          return 'bg-blue-600 text-white border-blue-600 font-black shadow-xs';
        case 'emerald':
          return 'bg-emerald-600 text-white border-emerald-600 font-black shadow-xs';
        case 'orange':
          return 'bg-orange-600 text-white border-orange-600 font-black shadow-xs';
        case 'purple':
          return 'bg-purple-600 text-white border-purple-600 font-black shadow-xs';
        case 'pink':
          return 'bg-pink-600 text-white border-pink-600 font-black shadow-xs';
        case 'slate':
        default:
          return 'bg-slate-700 text-white border-slate-700 font-black shadow-xs';
      }
    }

    switch (cor) {
      case 'copper':
        return 'bg-[#B5642A]/10 text-[#B5642A] border-[#B5642A]/30 hover:bg-[#B5642A]/20 font-bold';
      case 'blue':
        return 'bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100 font-semibold';
      case 'emerald':
        return 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100 font-semibold';
      case 'orange':
        return 'bg-orange-50/70 text-orange-900 border-orange-200 hover:bg-orange-100 font-semibold';
      case 'purple':
        return 'bg-purple-50/70 text-purple-900 border-purple-200 hover:bg-purple-100 font-semibold';
      case 'pink':
        return 'bg-pink-50/70 text-pink-900 border-pink-200 hover:bg-pink-100 font-semibold';
      case 'slate':
      default:
        return 'bg-slate-50/70 text-slate-800 border-slate-200 hover:bg-slate-100 font-semibold';
    }
  }

  obterEstiloBadgeContador(nome: string, cor: string): string {
    const selecionada = this.categoriaSelecionada() === nome;
    if (selecionada) {
      return 'bg-white/20 text-white';
    }
    switch (cor) {
      case 'copper':
        return 'bg-[#B5642A]/20 text-[#B5642A] font-bold';
      case 'blue':
        return 'bg-blue-200/70 text-blue-900';
      case 'emerald':
        return 'bg-emerald-200/70 text-emerald-900';
      case 'orange':
        return 'bg-orange-200/70 text-orange-900';
      case 'purple':
        return 'bg-purple-200/70 text-purple-900';
      case 'pink':
        return 'bg-pink-200/70 text-pink-900';
      case 'slate':
      default:
        return 'bg-slate-200/70 text-slate-800';
    }
  }

  obterBadgeCategoria(cor: string): string {
    switch (cor) {
      case 'copper':
        return 'bg-[#B5642A]/10 text-[#B5642A] border-[#B5642A]/30 font-bold';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pink':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'slate':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
