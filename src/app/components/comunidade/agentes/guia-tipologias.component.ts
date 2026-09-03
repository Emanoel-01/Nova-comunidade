import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';

interface AtividadeManutencao {
  atividade: string;
  tipo: string;
  periodicidade: string;
  recomendacao: string;
}

interface TipologiaPredial {
  id: string;
  numero: string;
  titulo: string;
  categoria: string;
  subtitulo: string | null;
  fundamentos_composicao: string | null;
  execucao: string | null;
  analise_viabilidade: string | null;
  patologia_diagnostico: string | null;
  predimensionamento_texto: string | null;
  conflitos_interfaciais: string | null;
  enquadramento_normativo: string | null;
  plano_manutencao: AtividadeManutencao[] | null;
}

interface BlocoTextoFormatado {
  titulo: string | null;
  paragrafo: string;
}

type AbaFrente =
  | 'fundamentos_composicao'
  | 'execucao'
  | 'analise_viabilidade'
  | 'patologia_diagnostico'
  | 'plano_manutencao'
  | 'predimensionamento_texto'
  | 'conflitos_interfaciais'
  | 'enquadramento_normativo';

const ABAS: { key: AbaFrente; label: string; icone: string }[] = [
  { key: 'fundamentos_composicao', label: 'Fundamentos', icone: '🧱' },
  { key: 'execucao', label: 'Execução', icone: '🔧' },
  { key: 'analise_viabilidade', label: 'Viabilidade', icone: '📊' },
  { key: 'patologia_diagnostico', label: 'Patologia', icone: '⚠️' },
  { key: 'plano_manutencao', label: 'Manutenção', icone: '🗓️' },
  { key: 'predimensionamento_texto', label: 'Pré-dimensionamento', icone: '📐' },
  { key: 'conflitos_interfaciais', label: 'Conflitos', icone: '🔀' },
  { key: 'enquadramento_normativo', label: 'Normas', icone: '📘' },
];

@Component({
  selector: 'app-guia-tipologias',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho -->
      <div class="bg-gradient-to-r from-[#132A41] via-slate-900 to-[#132A41] rounded-3xl p-6 sm:p-8 text-white border border-amber-800/20 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#B5642A_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <span>📖</span>
              <span>Guia de Consulta Rápida</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span>Bíblia da Edificação</span>
            </h2>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Os 41 sistemas construtivos do livro, organizados em 13 grupos, com Fundamentos, Execução,
              Patologias, Manutenção, Pré-dimensionamento, Conflitos e Normas — direto ao ponto.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ tipologias().length }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Sistemas Catalogados</div>
              <div class="text-[11px] text-amber-200">Consulta gratuita, sem limite</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Busca -->
      <div class="relative">
        <svg class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          [value]="termoBusca()"
          (input)="termoBusca.set($any($event.target).value)"
          placeholder="Buscar por nome do sistema (ex: Steel Frame, SPDA, Radier...)"
          class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
        />
      </div>

      <!-- Filtro por categoria -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          (click)="categoriaAtiva.set(null)"
          [class]="categoriaAtiva() === null
            ? 'bg-[#132A41] text-white border-[#132A41] font-black shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border"
        >
          Todos ({{ tipologias().length }})
        </button>
        @for (cat of categorias(); track cat.nome) {
          <button
            type="button"
            (click)="categoriaAtiva.set(categoriaAtiva() === cat.nome ? null : cat.nome)"
            [class]="categoriaAtiva() === cat.nome
              ? 'bg-[#132A41] text-white border-[#132A41] font-black shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
            class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border"
          >
            {{ cat.nome }} ({{ cat.total }})
          </button>
        }
      </div>

      <!-- Carregando -->
      @if (carregando()) {
        <div class="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="text-xs font-bold">Carregando os 41 sistemas...</span>
        </div>
      }

      <!-- Vazio -->
      @if (!carregando() && tipologiasFiltradas().length === 0) {
        <div class="py-16 text-center text-slate-400">
          <p class="text-sm font-bold">Nenhum sistema encontrado com esse filtro.</p>
        </div>
      }

      <!-- Grid de cards -->
      @if (!carregando() && tipologiasFiltradas().length > 0) {
        <div class="space-y-4">
          @for (t of tipologiasFiltradas(); track t.id) {
            <div
              class="bg-white rounded-3xl border transition-all duration-200 shadow-2xs overflow-hidden"
              [class.border-amber-300]="tipologiaExpandida() === t.id"
              [class.border-slate-200]="tipologiaExpandida() !== t.id"
              [class.shadow-md]="tipologiaExpandida() === t.id"
            >
              <!-- Cabeçalho do card -->
              <div
                (click)="toggleExpandir(t.id)"
                class="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="space-y-2 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-[#B5642A] border border-amber-100">
                        {{ t.categoria }}
                      </span>
                      <span class="text-xs font-mono font-bold text-slate-400">Cap. {{ t.numero }}</span>
                    </div>

                    <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {{ t.titulo }}
                    </h3>

                    @if (t.subtitulo) {
                      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl line-clamp-2">
                        {{ t.subtitulo }}
                      </p>
                    }
                  </div>

                  <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#B5642A] shrink-0">
                    <span>{{ tipologiaExpandida() === t.id ? 'Recolher' : 'Ver as 8 frentes' }}</span>
                    <svg
                      class="w-4 h-4 transition-transform duration-200"
                      [class.rotate-180]="tipologiaExpandida() === t.id"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Conteúdo expandido -->
              @if (tipologiaExpandida() === t.id) {
                <div class="px-5 pb-6 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">

                  <!-- Abas -->
                  <div class="flex flex-wrap gap-1.5 py-4">
                    @for (aba of abas; track aba.key) {
                      <button
                        type="button"
                        (click)="abaAtiva.set(aba.key)"
                        [class]="abaAtiva() === aba.key
                          ? 'bg-[#132A41] text-white border-[#132A41] font-black'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
                        class="px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer border flex items-center gap-1.5"
                      >
                        <span>{{ aba.icone }}</span>
                        <span>{{ aba.label }}</span>
                      </button>
                    }
                  </div>

                  <!-- Conteúdo da aba ativa -->
                  <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    @if (abaAtiva() === 'plano_manutencao') {
                      @if (t.plano_manutencao && t.plano_manutencao.length > 0) {
                        <div class="space-y-3">
                          @for (item of t.plano_manutencao; track $index) {
                            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <span class="text-xs font-black text-slate-900">{{ item.atividade }}</span>
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-[#B5642A] border border-amber-100 shrink-0">
                                  {{ item.periodicidade }}
                                </span>
                              </div>
                              @if (item.recomendacao) {
                                <p class="text-[11px] text-slate-600 leading-relaxed">{{ item.recomendacao }}</p>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-slate-400 italic">Tabela de manutenção não disponível no livro para este sistema.</p>
                      }
                    } @else {
                      @for (bloco of formatarTextoEmBlocos(textoAbaAtiva(t), abaAtiva()); track $index) {
                        <div class="mb-3 last:mb-0">
                          @if (bloco.titulo) {
                            <h4 class="text-xs sm:text-sm font-bold text-slate-800 mb-1">{{ bloco.titulo }}</h4>
                          }
                          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ bloco.paragrafo }}</p>
                        </div>
                      }
                    }
                  </div>

                  <!-- Aviso de caráter consultivo -->
                  <div class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span class="text-sm shrink-0">ℹ️</span>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      Conteúdo de referência técnica consultiva. Para dimensionamento e execução, consulte projeto elaborado por profissional habilitado.
                    </p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class GuiaTipologiasComponent implements OnInit {
  private supabaseService = inject(SupabaseService);

  readonly abas = ABAS;

  readonly tipologias = signal<TipologiaPredial[]>([]);
  readonly carregando = signal(true);
  readonly categoriaAtiva = signal<string | null>(null);
  readonly termoBusca = signal('');
  readonly tipologiaExpandida = signal<string | null>(null);
  readonly abaAtiva = signal<AbaFrente>('fundamentos_composicao');

  readonly categorias = computed(() => {
    const mapa = new Map<string, number>();
    for (const t of this.tipologias()) {
      mapa.set(t.categoria, (mapa.get(t.categoria) || 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly tipologiasFiltradas = computed(() => {
    let lista = this.tipologias();
    const cat = this.categoriaAtiva();
    if (cat) {
      lista = lista.filter(t => t.categoria === cat);
    }
    const busca = this.termoBusca().trim().toLowerCase();
    if (busca) {
      lista = lista.filter(t =>
        t.titulo.toLowerCase().includes(busca) ||
        (t.subtitulo && t.subtitulo.toLowerCase().includes(busca))
      );
    }
    return lista;
  });

  async ngOnInit(): Promise<void> {
    this.carregando.set(true);
    const dados = await this.supabaseService.listarTipologiasPrediais();
    this.tipologias.set(dados as TipologiaPredial[]);
    this.carregando.set(false);
  }

  toggleExpandir(id: string): void {
    this.tipologiaExpandida.set(this.tipologiaExpandida() === id ? null : id);
    this.abaAtiva.set('fundamentos_composicao');
  }

  // Rótulos internos conhecidos que aparecem dentro dos textos vindos do
  // banco, coladas ao restante do parágrafo. Cada um vira um subtítulo
  // separado quando encontrado. A lista é por campo, porque cada campo do
  // livro tem seu próprio conjunto de rótulos internos típicos.
  private readonly ROTULOS_INTERNOS: Record<string, string[]> = {
    fundamentos_composicao: ['Componentes', 'Aplicações típicas'],
    execucao: ['Canteiro de obras'],
    analise_viabilidade: ['Vantagens', 'Desvantagens', 'Viabilidade econômica'],
    patologia_diagnostico: ['Sintomas', 'Causas prováveis', 'Diagnóstico'],
    predimensionamento_texto: ['Critérios', 'Parâmetros de referência'],
    conflitos_interfaciais: ['Interfaces críticas', 'Recomendações'],
    enquadramento_normativo: ['Normas aplicáveis', 'Exigências'],
  };

  formatarTextoEmBlocos(texto: string, campo: string): BlocoTextoFormatado[] {
    if (!texto) return [];
    const rotulos = this.ROTULOS_INTERNOS[campo] || [];
    if (rotulos.length === 0) {
      return [{ titulo: null, paragrafo: texto }];
    }

    // Localiza a posição de cada rótulo conhecido dentro do texto, na
    // ordem em que aparecem. Divide o texto nesses pontos.
    const posicoes: { rotulo: string; index: number }[] = [];
    for (const rotulo of rotulos) {
      const idx = texto.indexOf(rotulo);
      if (idx !== -1) posicoes.push({ rotulo, index: idx });
    }
    posicoes.sort((a, b) => a.index - b.index);

    if (posicoes.length === 0) {
      return [{ titulo: null, paragrafo: texto }];
    }

    const blocos: BlocoTextoFormatado[] = [];

    // Texto antes do primeiro rótulo (se houver conteúdo relevante)
    const inicio = texto.slice(0, posicoes[0].index).trim();
    if (inicio.length > 0) {
      blocos.push({ titulo: null, paragrafo: inicio });
    }

    for (let i = 0; i < posicoes.length; i++) {
      const atual = posicoes[i];
      const proximo = posicoes[i + 1];
      const fim = proximo ? proximo.index : texto.length;
      const conteudo = texto.slice(atual.index + atual.rotulo.length, fim).trim();
      blocos.push({ titulo: atual.rotulo, paragrafo: conteudo });
    }

    return blocos;
  }

  textoAbaAtiva(t: TipologiaPredial): string {
    const key = this.abaAtiva();
    if (key === 'plano_manutencao') return '';
    const valor = t[key];
    return typeof valor === 'string' ? valor : '';
  }
}
