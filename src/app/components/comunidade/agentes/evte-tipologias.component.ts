import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';

interface TipologiaResumo {
  id: string;
  numero: string;
  titulo: string;
  categoria: string;
}

interface ComparacaoEvte {
  tipologiaId: string;
  titulo: string;
  pontosPositivos: string[];
  pontosAtencao: string[];
  normaAplicavel: string | null;
}

interface RankingItemEvte {
  posicao: number;
  tipologiaId: string;
  titulo: string;
  justificativa: string;
}

interface ResultadoEvte {
  comparacoes: ComparacaoEvte[];
  ranking: RankingItemEvte[];
  avisoFinal: string;
}

@Component({
  selector: 'app-evte-tipologias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho -->
      <div class="bg-gradient-to-r from-[#132A41] via-slate-900 to-[#132A41] rounded-3xl p-6 sm:p-8 text-white border border-amber-800/20 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#B5642A_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

        <div class="relative z-10 space-y-2 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <span>🏗️</span>
            <span>Estudo de Viabilidade Técnica e Econômica</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">EVTE — Comparação de Sistemas</h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Escolha as tipologias que quer comparar, descreva as restrições do seu projeto, e receba uma
            comparação de pontos positivos e de atenção — nunca um veredito de aprovação. A decisão é sempre sua.
          </p>
        </div>
      </div>

      <!-- Aviso permanente -->
      <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
        <span class="text-lg shrink-0">⚖️</span>
        <p class="text-xs text-rose-900 leading-relaxed">
          <strong>Esta ferramenta nunca aprova ou reprova uma tipologia.</strong> Ela organiza pontos positivos,
          pontos de atenção e um ranking comparativo, para apoiar sua análise — não substitui projeto nem
          responsabilidade técnica (ART/RRT) de profissional habilitado.
        </p>
      </div>

      @if (!resultado()) {

        <!-- ETAPA 1: Seleção de tipologias -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <h3 class="text-sm font-black text-slate-900">1. Escolha de 2 a 8 tipologias para comparar</h3>

          <div class="relative">
            <svg class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [value]="termoBusca()"
              (input)="termoBusca.set($any($event.target).value)"
              placeholder="Buscar tipologia (ex: laje, fundação, cobertura...)"
              class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
            />
          </div>

          @if (carregandoTipologias()) {
            <div class="py-8 text-center text-slate-400 text-xs font-bold">Carregando tipologias...</div>
          } @else {
            <div class="max-h-80 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (t of tipologiasFiltradas(); track t.id) {
                <button
                  type="button"
                  (click)="toggleSelecao(t)"
                  [disabled]="!selecionadas().has(t.id) && selecionadas().size >= 8"
                  [class]="selecionadas().has(t.id)
                    ? 'border-[#B5642A] bg-amber-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed'"
                  class="text-left p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <div
                    [class]="selecionadas().has(t.id) ? 'bg-[#B5642A] border-[#B5642A]' : 'border-slate-300'"
                    class="w-4 h-4 rounded-md border-2 shrink-0 flex items-center justify-center"
                  >
                    @if (selecionadas().has(t.id)) {
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-black text-slate-900 truncate">{{ t.titulo }}</div>
                    <div class="text-[10px] text-slate-400">{{ t.categoria }}</div>
                  </div>
                </button>
              }
            </div>
          }

          <div class="text-xs font-bold text-slate-500">
            {{ selecionadas().size }} de 8 selecionadas
            @if (selecionadas().size < 2) {
              <span class="text-amber-600"> — escolha ao menos 2 para comparar</span>
            }
          </div>
        </div>

        <!-- ETAPA 2: Restrições do projeto -->
        @if (selecionadas().size >= 2) {
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <h3 class="text-sm font-black text-slate-900">2. Restrições do seu projeto</h3>
            <p class="text-xs text-slate-500">Preencha o que for relevante — quanto mais contexto, mais útil a comparação.</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Vão livre desejado (m)</label>
                <input type="text" [value]="restricoes().vaoLivre" (input)="atualizarRestricao('vaoLivre', $any($event.target).value)" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40" placeholder="Ex: 8">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Orçamento-teto (R$/m²)</label>
                <input type="text" [value]="restricoes().orcamento" (input)="atualizarRestricao('orcamento', $any($event.target).value)" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40" placeholder="Ex: 1800">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Tipo de solo / terreno</label>
                <input type="text" [value]="restricoes().solo" (input)="atualizarRestricao('solo', $any($event.target).value)" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40" placeholder="Ex: argiloso, aterro, plano">
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Entorno / vizinhança</label>
                <input type="text" [value]="restricoes().entorno" (input)="atualizarRestricao('entorno', $any($event.target).value)" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40" placeholder="Ex: vizinhança sensível, via estreita">
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700">Outras observações</label>
                <textarea [value]="restricoes().observacoes" (input)="atualizarRestricao('observacoes', $any($event.target).value)" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 resize-none" placeholder="Prazo de obra, exigências específicas, uso da edificação..."></textarea>
              </div>
            </div>

            @if (erro()) {
              <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {{ erro() }}
              </div>
            }

            <button
              type="button"
              (click)="gerarAnalise()"
              [disabled]="gerando()"
              class="w-full py-3.5 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              @if (gerando()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Gerando comparação...</span>
              } @else {
                <span>Gerar Comparação e Ranking</span>
              }
            </button>
          </div>
        }
      }

      <!-- RESULTADO -->
      @if (resultado(); as res) {
        <div class="space-y-6">

          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-900">Resultado da Comparação</h3>
            <button
              type="button"
              (click)="reiniciar()"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Nova comparação</span>
            </button>
          </div>

          <!-- Ranking -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6">
            <h4 class="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>🏆</span>
              <span>Ranking comparativo (ponto de partida, não veredito)</span>
            </h4>
            <div class="space-y-2.5">
              @for (item of res.ranking; track item.tipologiaId) {
                <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#132A41] text-white flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#B5642A] flex items-center justify-center font-black text-sm shrink-0">
                    {{ item.posicao }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-black">{{ item.titulo }}</div>
                    <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ item.justificativa }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Comparações detalhadas -->
          <div class="space-y-3">
            @for (comp of res.comparacoes; track comp.tipologiaId) {
              <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6">
                <h4 class="text-sm font-black text-slate-900 mb-3">{{ comp.titulo }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <div class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✓</span><span>Pontos positivos</span>
                    </div>
                    <ul class="space-y-1.5">
                      @for (p of comp.pontosPositivos; track $index) {
                        <li class="text-xs text-slate-700 leading-relaxed pl-3 border-l-2 border-emerald-200">{{ p }}</li>
                      }
                    </ul>
                  </div>
                  <div class="space-y-2">
                    <div class="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠</span><span>Pontos de atenção</span>
                    </div>
                    <ul class="space-y-1.5">
                      @for (p of comp.pontosAtencao; track $index) {
                        <li class="text-xs text-slate-700 leading-relaxed pl-3 border-l-2 border-amber-200">{{ p }}</li>
                      }
                    </ul>
                  </div>
                </div>
                @if (comp.normaAplicavel) {
                  <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    Norma aplicável: {{ comp.normaAplicavel }}
                  </div>
                }
              </div>
            }
          </div>

          <!-- Aviso final -->
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <span class="text-lg shrink-0">⚖️</span>
            <p class="text-xs text-rose-900 leading-relaxed">{{ res.avisoFinal }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class EvteTipologiasComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  readonly tipologias = signal<TipologiaResumo[]>([]);
  readonly carregandoTipologias = signal(true);
  readonly termoBusca = signal('');
  readonly selecionadas = signal<Set<string>>(new Set());
  readonly gerando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly resultado = signal<ResultadoEvte | null>(null);

  restricoes = signal<Record<string, string>>({
    vaoLivre: '',
    orcamento: '',
    solo: '',
    entorno: '',
    observacoes: '',
  });

  atualizarRestricao(campo: string, valor: string): void {
    this.restricoes.set({ ...this.restricoes(), [campo]: valor });
  }

  readonly tipologiasFiltradas = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    if (!busca) return this.tipologias();
    return this.tipologias().filter(t =>
      t.titulo.toLowerCase().includes(busca) || t.categoria.toLowerCase().includes(busca)
    );
  });

  async ngOnInit(): Promise<void> {
    this.carregandoTipologias.set(true);
    const dados = await this.supabaseService.listarTipologiasPrediais();
    this.tipologias.set((dados as any[]).map(d => ({
      id: d.id, numero: d.numero, titulo: d.titulo, categoria: d.categoria,
    })));
    this.carregandoTipologias.set(false);
  }

  toggleSelecao(t: TipologiaResumo): void {
    const atual = new Set(this.selecionadas());
    if (atual.has(t.id)) {
      atual.delete(t.id);
    } else if (atual.size < 8) {
      atual.add(t.id);
    }
    this.selecionadas.set(atual);
  }

  async gerarAnalise(): Promise<void> {
    this.erro.set(null);
    this.gerando.set(true);
    try {
      const ids = Array.from(this.selecionadas());
      const res = await this.supabaseService.gerarAnaliseEvte(ids, this.restricoes());
      if (res.error) {
        this.erro.set(res.error.message || 'Erro ao gerar a análise. Tente novamente.');
        return;
      }
      this.resultado.set(res.data?.resultado || null);
    } catch (e: any) {
      this.erro.set('Erro inesperado ao gerar a análise.');
    } finally {
      this.gerando.set(false);
    }
  }

  reiniciar(): void {
    this.resultado.set(null);
    this.selecionadas.set(new Set());
    this.restricoes.set({ vaoLivre: '', orcamento: '', solo: '', entorno: '', observacoes: '' });
    this.erro.set(null);
  }
}
