import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaMaterial, ComunidadeStateService } from './comunidade-state.service';

@Component({
  selector: 'app-comunidade-materiais',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

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

          <!-- Contador de Materiais Disponíveis -->
          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ materiais().length }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Recursos no Acervo</div>
              <div class="text-[11px] text-indigo-200">Arquivos técnicos padronizados</div>
            </div>
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
            }
            <span>{{ cat }}</span>
            <span
              [class]="categoriaSelecionada() === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
              class="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1"
            >
              {{ contarPorCategoria(cat) }}
            </span>
          </button>
        }
      </div>

      <!-- 3. Grade / Lista de Materiais -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        @for (item of materiaisFiltrados(); track item.id) {
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-5">
            
            <!-- Topo do Card: Ícone de Arquivo + Categoria + Formato -->
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <span
                  [class]="getBadgeEstilo(item.categoria)"
                  class="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                >
                  <span>{{ item.categoria }}</span>
                </span>

                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
                    {{ item.formato }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">
                    {{ item.tamanho }}
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
            </div>

            <!-- Rodapé: Estatísticas + Botão Baixar / Solicitado -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{{ item.downloads }} downloads</span>
                </div>

                <button
                  type="button"
                  (click)="state.solicitarMaterial(item.id)"
                  [class]="item.solicitado
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-transparent cursor-pointer"
                >
                  @if (item.solicitado) {
                    <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>✓ Solicitado</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Baixar Arquivo</span>
                  }
                </button>
              </div>

              <!-- Nota explicativa quando solicitado -->
              @if (item.solicitado) {
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5 animate-fadeIn">
                  <span class="text-indigo-600 font-bold">ℹ</span>
                  <span>Download disponível quando os materiais reais forem cadastrados.</span>
                </div>
              }
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class ComunidadeMateriaisComponent {
  readonly state = inject(ComunidadeStateService);
  readonly materiais = this.state.materiais;

  readonly categorias: CategoriaMaterial[] = [
    'Todos',
    'Planilhas',
    'Modelos de Laudo',
    'Checklists',
    'E-books'
  ];

  readonly categoriaSelecionada = signal<CategoriaMaterial>('Todos');

  readonly materiaisFiltrados = computed(() => {
    const cat = this.categoriaSelecionada();
    const lista = this.materiais();
    if (cat === 'Todos') return lista;
    return lista.filter(m => m.categoria === cat);
  });

  contarPorCategoria(cat: CategoriaMaterial): number {
    if (cat === 'Todos') return this.materiais().length;
    return this.materiais().filter(m => m.categoria === cat).length;
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
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
