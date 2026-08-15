import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHECKLIST_LICITACAO_PADRAO, ItemChecklistLicitacao } from './checklist-licitacao.data';

type CategoriaLicitacao = ItemChecklistLicitacao['categoria'];

@Component({
  selector: 'app-checklist-licitacao',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- 1. Cabeçalho do Módulo -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full pointer-events-none blur-2xl"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold text-sm shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-wider text-emerald-700">Lei 14.133/2021 · Habilitação</span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Checklist de Licitação
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Confira a documentação de habilitação antes de submeter sua proposta e evite inabilitação por pendências documentais.
            </p>
          </div>

          <!-- Botão Reiniciar Checklist -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="reiniciarChecklist()"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200/80 active:scale-95"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reiniciar Checklist</span>
            </button>
          </div>
        </div>

        <!-- Aviso em destaque -->
        <div class="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <span class="text-base leading-none shrink-0 mt-0.5">⚠️</span>
          <p class="text-xs text-amber-900 leading-relaxed font-medium">
            <strong>Checklist genérico de referência:</strong> Sempre confira os requisitos específicos do edital, que podem incluir exigências adicionais, prazos de validade específicos de certidões e índices contábeis customizados.
          </p>
        </div>
      </div>

      <!-- 2. Bloco de Referência do Edital + Barra de Progresso Geral -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Informações do Edital em Análise (Em memória) -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Edital em Análise (Sessão Atual)</span>
            </h4>
            <span class="text-[10px] font-bold text-slate-400">Armazenado em memória</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="nome-edital-input" class="block text-xs font-bold text-slate-700 mb-1.5">
                Identificação do Edital
              </label>
              <input
                id="nome-edital-input"
                type="text"
                [value]="nomeEdital()"
                (input)="atualizarNomeEdital($event)"
                placeholder="Ex: Pregão 001/2026 — Prefeitura Municipal X"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label for="link-edital-input" class="block text-xs font-bold text-slate-700 mb-1.5">
                Link do Edital / Portal de Compras
              </label>
              <div class="relative">
                <input
                  id="link-edital-input"
                  type="url"
                  [value]="linkEdital()"
                  (input)="atualizarLinkEdital($event)"
                  placeholder="Ex: https://pncp.gov.br/... ou link do Compras.gov"
                  class="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                @if (linkEdital()) {
                  <a
                    [href]="linkEdital()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
                    title="Abrir edital em nova aba"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                }
              </div>
            </div>
          </div>

          @if (nomeEdital()) {
            <div class="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Conferindo documentação para: <strong class="text-slate-700">{{ nomeEdital() }}</strong></span>
            </div>
          }
        </div>

        <!-- Card de Progresso Obrigatório -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Itens Obrigatórios</span>
              <span class="text-slate-900 font-black text-sm">{{ obrigatoriosMarcados() }} / {{ totalObrigatorios() }}</span>
            </div>

            <!-- Barra de Progresso -->
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                class="h-full rounded-full transition-all duration-300"
                [class]="todosObrigatoriosConcluidos() ? 'bg-emerald-500' : 'bg-[#132A41]'"
                [style.width.%]="porcentagemProgresso()"
              ></div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Status de Habilitação:</span>
            @if (todosObrigatoriosConcluidos()) {
              <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                100% Obrigatórios Prontos
              </span>
            } @else {
              <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                {{ totalObrigatorios() - obrigatoriosMarcados() }} pendente(s)
              </span>
            }
          </div>
        </div>

      </div>

      <!-- 3. Checklist dividido por Categorias -->
      <div class="space-y-6">

        @for (cat of categoriasComItens(); track cat.nome) {
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            <!-- Cabeçalho da Categoria -->
            <div class="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  {{ cat.itens.length }}
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900">
                    {{ cat.nome }}
                  </h4>
                  <span class="text-[11px] text-slate-500">
                    {{ contarMarcadosCategoria(cat.itens) }} de {{ cat.itens.length }} conferidos ({{ contarObrigatoriosCategoria(cat.itens) }} obrigatórios)
                  </span>
                </div>
              </div>

              <!-- Botão rápido: Marcar / Desmarcar todos da categoria -->
              <button
                type="button"
                (click)="toggleTodosCategoria(cat.itens)"
                class="self-start sm:self-auto text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {{ todosCategoriaMarcados(cat.itens) ? 'Desmarcar todos' : 'Marcar todos' }}
              </button>
            </div>

            <!-- Lista de Itens -->
            <div class="divide-y divide-slate-100">
              @for (item of cat.itens; track item.id) {
                <div
                  (click)="toggleItem(item.id)"
                  [class.bg-emerald-50/25]="isMarcado(item.id)"
                  class="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/75 transition-colors cursor-pointer group select-none"
                >
                  <div class="flex items-center gap-3.5 min-w-0">
                    <!-- Checkbox Customizado -->
                    <div
                      class="w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0"
                      [class]="isMarcado(item.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' : 'border-slate-300 bg-white group-hover:border-slate-400'"
                    >
                      @if (isMarcado(item.id)) {
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    </div>

                    <!-- Descrição do Item -->
                    <span
                      class="text-xs sm:text-sm font-medium transition-colors"
                      [class]="isMarcado(item.id) ? 'text-slate-800 line-through opacity-80' : 'text-slate-700 group-hover:text-slate-900'"
                    >
                      {{ item.item }}
                    </span>
                  </div>

                  <!-- Badge de Obrigatoriedade -->
                  <div class="shrink-0">
                    @if (item.obrigatorio) {
                      <span class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200/80">
                        Obrigatório
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider border border-slate-200/60">
                        Se aplicável
                      </span>
                    }
                  </div>
                </div>
              }
            </div>

          </div>
        }

      </div>

    </div>
  `
})
export class ChecklistLicitacaoComponent {
  // Estado do Edital em Memória
  readonly nomeEdital = signal<string>('');
  readonly linkEdital = signal<string>('');

  // Itens Marcados (Set de IDs)
  readonly itensMarcados = signal<Set<string>>(new Set<string>());

  // Todos os itens carregados
  readonly checklist = CHECKLIST_LICITACAO_PADRAO;

  // Categorias organizadas
  readonly categoriasComItens = computed(() => {
    const categorias: CategoriaLicitacao[] = [
      'Habilitação Jurídica',
      'Regularidade Fiscal e Trabalhista',
      'Qualificação Econômico-Financeira',
      'Qualificação Técnica'
    ];

    return categorias.map(nome => ({
      nome,
      itens: this.checklist.filter(item => item.categoria === nome)
    }));
  });

  // Cálculos de Progresso (apenas obrigatórios)
  readonly totalObrigatorios = computed(() => {
    return this.checklist.filter(item => item.obrigatorio).length;
  });

  readonly obrigatoriosMarcados = computed(() => {
    const marcados = this.itensMarcados();
    return this.checklist.filter(item => item.obrigatorio && marcados.has(item.id)).length;
  });

  readonly porcentagemProgresso = computed(() => {
    const total = this.totalObrigatorios();
    if (total === 0) return 0;
    return Math.round((this.obrigatoriosMarcados() / total) * 100);
  });

  readonly todosObrigatoriosConcluidos = computed(() => {
    return this.totalObrigatorios() > 0 && this.obrigatoriosMarcados() === this.totalObrigatorios();
  });

  // Métodos de Interação
  isMarcado(id: string): boolean {
    return this.itensMarcados().has(id);
  }

  toggleItem(id: string): void {
    this.itensMarcados.update(set => {
      const novoSet = new Set(set);
      if (novoSet.has(id)) {
        novoSet.delete(id);
      } else {
        novoSet.add(id);
      }
      return novoSet;
    });
  }

  atualizarNomeEdital(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nomeEdital.set(input.value);
  }

  atualizarLinkEdital(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.linkEdital.set(input.value);
  }

  contarMarcadosCategoria(itens: ItemChecklistLicitacao[]): number {
    const marcados = this.itensMarcados();
    return itens.filter(i => marcados.has(i.id)).length;
  }

  contarObrigatoriosCategoria(itens: ItemChecklistLicitacao[]): number {
    return itens.filter(i => i.obrigatorio).length;
  }

  todosCategoriaMarcados(itens: ItemChecklistLicitacao[]): boolean {
    const marcados = this.itensMarcados();
    return itens.length > 0 && itens.every(i => marcados.has(i.id));
  }

  toggleTodosCategoria(itens: ItemChecklistLicitacao[]): void {
    const marcados = this.itensMarcados();
    const todosMarcados = itens.every(i => marcados.has(i.id));

    this.itensMarcados.update(set => {
      const novoSet = new Set(set);
      if (todosMarcados) {
        itens.forEach(i => novoSet.delete(i.id));
      } else {
        itens.forEach(i => novoSet.add(i.id));
      }
      return novoSet;
    });
  }

  reiniciarChecklist(): void {
    this.nomeEdital.set('');
    this.linkEdital.set('');
    this.itensMarcados.set(new Set<string>());
  }
}
