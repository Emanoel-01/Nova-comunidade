import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SISTEMAS_CALCULAVEIS,
  SistemaCalculavel,
} from './calculadora-predimensionamento.data';
import {
  SISTEMAS_TABELA_ESCOLHA,
  SistemaTabelaEscolha,
  OpcaoEscolha,
} from './calculadora-nivel2.data';
import {
  SISTEMAS_MULTIVARIAVEL,
  SistemaMultiVariavel,
} from './calculadora-nivel3.data';

@Component({
  selector: 'app-calculadora-predimensionamento',
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
              <span>📐</span>
              <span>Calculadora Rápida de Anteprojeto</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span>Pré-dimensionamento</span>
            </h2>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Regras práticas de anteprojeto para {{ sistemas.length }} sistemas construtivos —
              cálculo instantâneo, sem IA, direto no navegador.
            </p>
          </div>
        </div>
      </div>

      <!-- Aviso legal fixo -->
      <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <span class="text-lg shrink-0">⚠️</span>
        <p class="text-xs text-amber-900 leading-relaxed">
          <strong>Estimativa de anteprojeto.</strong> Estas regras práticas servem para dimensionar rapidamente
          uma ideia inicial de projeto. O dimensionamento definitivo, com memória de cálculo completa, exige
          profissional habilitado com ART/RRT recolhida. Não use estes resultados como especificação final de obra.
        </p>
      </div>

      <!-- Abas de modo: Cálculo Direto vs. Consulta de Referência vs. Cálculo de Engenharia -->
      <div class="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
        <button
          type="button"
          (click)="modoAtivo.set('calculo'); sistemaAtivo.set(null); tabelaAtiva.set(null); multivarAtivo.set(null); termoBusca.set('')"
          [class]="modoAtivo() === 'calculo'
            ? 'bg-white text-[#132A41] shadow-sm font-black'
            : 'text-slate-500 hover:text-slate-700'"
          class="flex-1 py-2.5 px-3 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap"
        >
          📐 Cálculo Direto ({{ sistemas.length }})
        </button>
        <button
          type="button"
          (click)="modoAtivo.set('tabela'); sistemaAtivo.set(null); tabelaAtiva.set(null); multivarAtivo.set(null); termoBusca.set('')"
          [class]="modoAtivo() === 'tabela'
            ? 'bg-white text-[#132A41] shadow-sm font-black'
            : 'text-slate-500 hover:text-slate-700'"
          class="flex-1 py-2.5 px-3 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap"
        >
          📋 Consulta ({{ sistemasTabela.length }})
        </button>
        <button
          type="button"
          (click)="modoAtivo.set('multivar'); sistemaAtivo.set(null); tabelaAtiva.set(null); multivarAtivo.set(null); termoBusca.set('')"
          [class]="modoAtivo() === 'multivar'
            ? 'bg-white text-[#132A41] shadow-sm font-black'
            : 'text-slate-500 hover:text-slate-700'"
          class="flex-1 py-2.5 px-3 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap"
        >
          🏗️ Engenharia ({{ sistemasMultivar.length }})
        </button>
      </div>

      @if (modoAtivo() === 'calculo') {

      <!-- Busca -->
      <div class="relative">
        <svg class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          [value]="termoBusca()"
          (input)="termoBusca.set($any($event.target).value); sistemaAtivo.set(null)"
          placeholder="Buscar sistema (ex: laje, viga, ar-condicionado, gerador...)"
          class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
        />
      </div>

      <!-- Se nenhum sistema selecionado: grid de escolha -->
      @if (!sistemaAtivo()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (s of sistemasFiltrados(); track s.id) {
            <button
              type="button"
              (click)="selecionarSistema(s)"
              class="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#B5642A] hover:shadow-md transition-all cursor-pointer group"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#B5642A] border border-amber-100">
                    {{ s.categoria }}
                  </span>
                  <h4 class="text-sm font-black text-slate-900 mt-1.5 group-hover:text-[#B5642A] transition-colors">
                    {{ s.nome }}
                  </h4>
                </div>
                <svg class="w-4 h-4 text-slate-300 group-hover:text-[#B5642A] shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          }
        </div>

        @if (sistemasFiltrados().length === 0) {
          <div class="py-16 text-center text-slate-400">
            <p class="text-sm font-bold">Nenhum sistema encontrado com esse termo.</p>
          </div>
        }
      }

      <!-- Sistema selecionado: formulário de cálculo -->
      @if (sistemaAtivo(); as sistema) {
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#B5642A] border border-amber-100">
                {{ sistema.categoria }}
              </span>
              <h3 class="text-lg font-black text-slate-900 mt-1.5">{{ sistema.nome }}</h3>
            </div>
            <button
              type="button"
              (click)="voltar()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Trocar sistema</span>
            </button>
          </div>

          <div class="p-5 sm:p-6 space-y-4">
            <!-- Campos de entrada -->
            @for (campo of sistema.campos; track campo.id) {
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  {{ campo.label }} <span class="text-slate-400 font-normal">({{ campo.unidade }})</span>
                </label>
                <input
                  type="number"
                  [value]="valores()[campo.id] || ''"
                  (input)="atualizarValor(campo.id, $any($event.target).value)"
                  [placeholder]="campo.placeholder"
                  min="0"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
                />
              </div>
            }

            <!-- Resultado -->
            @if (resultado(); as res) {
              <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#132A41] text-white space-y-2">
                <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Resultado estimado</div>
                <div class="text-3xl font-black">{{ res }}</div>
              </div>
            }

            <!-- Observação técnica -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p class="text-xs text-slate-600 leading-relaxed">{{ sistema.observacao }}</p>
              <p class="text-[10px] text-slate-400 mt-2 font-medium">Fonte: {{ sistema.fonte }}</p>
            </div>

            <!-- Disclaimer -->
            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <span class="text-sm shrink-0">⚠️</span>
              <p class="text-[11px] text-amber-900 leading-relaxed">
                Estimativa de anteprojeto. O dimensionamento definitivo exige cálculo por profissional
                habilitado, com ART/RRT recolhida.
              </p>
            </div>
          </div>
        </div>
      }

      } <!-- fecha modoAtivo === 'calculo' -->

      @if (modoAtivo() === 'tabela') {

        <!-- Busca -->
        <div class="relative">
          <svg class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [value]="termoBusca()"
            (input)="termoBusca.set($any($event.target).value); tabelaAtiva.set(null)"
            placeholder="Buscar (ex: elétrica, manta, ACM, radier...)"
            class="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
          />
        </div>

        <!-- Grid de escolha -->
        @if (!tabelaAtiva()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (s of sistemasTabelaFiltrados(); track s.id) {
              <button
                type="button"
                (click)="selecionarTabela(s)"
                class="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#B5642A] hover:shadow-md transition-all cursor-pointer group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#B5642A] border border-amber-100">
                      {{ s.categoria }}
                    </span>
                    <h4 class="text-sm font-black text-slate-900 mt-1.5 group-hover:text-[#B5642A] transition-colors">
                      {{ s.nome }}
                    </h4>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 group-hover:text-[#B5642A] shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            }
          </div>

          @if (sistemasTabelaFiltrados().length === 0) {
            <div class="py-16 text-center text-slate-400">
              <p class="text-sm font-bold">Nenhum sistema encontrado com esse termo.</p>
            </div>
          }
        }

        <!-- Sistema de tabela selecionado -->
        @if (tabelaAtiva(); as tab) {
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#B5642A] border border-amber-100">
                  {{ tab.categoria }}
                </span>
                <h3 class="text-lg font-black text-slate-900 mt-1.5">{{ tab.nome }}</h3>
              </div>
              <button
                type="button"
                (click)="tabelaAtiva.set(null)"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Trocar sistema</span>
              </button>
            </div>

            <div class="p-5 sm:p-6 space-y-4">
              <p class="text-xs font-bold text-slate-700">{{ tab.perguntaEscolha }}</p>

              <div class="grid grid-cols-1 gap-2.5">
                @for (opcao of tab.opcoes; track opcao.id) {
                  <button
                    type="button"
                    (click)="opcaoSelecionada.set(opcao)"
                    [class]="opcaoSelecionada()?.id === opcao.id
                      ? 'border-[#B5642A] bg-amber-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'"
                    class="text-left p-4 rounded-2xl border-2 transition-all cursor-pointer"
                  >
                    <div class="text-sm font-black text-slate-900">{{ opcao.label }}</div>
                  </button>
                }
              </div>

              <!-- Resultado -->
              @if (opcaoSelecionada(); as op) {
                <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#132A41] text-white space-y-2">
                  <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Referência</div>
                  <div class="text-2xl font-black">{{ op.resultado }}</div>
                  @if (op.detalhe) {
                    <p class="text-xs text-slate-300 leading-relaxed pt-1">{{ op.detalhe }}</p>
                  }
                </div>
              }

              <!-- Observação técnica -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p class="text-xs text-slate-600 leading-relaxed">{{ tab.observacao }}</p>
                <p class="text-[10px] text-slate-400 mt-2 font-medium">Fonte: {{ tab.fonte }}</p>
              </div>

              <!-- Disclaimer -->
              <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <span class="text-sm shrink-0">⚠️</span>
                <p class="text-[11px] text-amber-900 leading-relaxed">
                  Estimativa de anteprojeto. O dimensionamento definitivo exige cálculo por profissional
                  habilitado, com ART/RRT recolhida.
                </p>
              </div>
            </div>
          </div>
        }

      }

      @if (modoAtivo() === 'multivar') {

        <!-- Aviso reforçado — cálculo de engenharia real -->
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <span class="text-lg shrink-0">🏗️</span>
          <p class="text-xs text-rose-900 leading-relaxed">
            <strong>Cálculo de engenharia com múltiplas variáveis.</strong> Estas fórmulas envolvem dados
            geotécnicos (SPT) e hidráulicos reais — o resultado mostra cada etapa do cálculo, mas ainda é uma
            estimativa de pré-dimensionamento. Nunca substitui a memória de cálculo completa assinada por
            profissional habilitado, com ART/RRT.
          </p>
        </div>

        <!-- Grid de escolha -->
        @if (!multivarAtivo()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (s of sistemasMultivar; track s.id) {
              <button
                type="button"
                (click)="selecionarMultivar(s)"
                class="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#B5642A] hover:shadow-md transition-all cursor-pointer group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                      {{ s.categoria }}
                    </span>
                    <h4 class="text-sm font-black text-slate-900 mt-1.5 group-hover:text-[#B5642A] transition-colors">
                      {{ s.nome }}
                    </h4>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 group-hover:text-[#B5642A] shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            }
          </div>
        }

        <!-- Sistema multi-variável selecionado -->
        @if (multivarAtivo(); as sistema) {
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                  {{ sistema.categoria }}
                </span>
                <h3 class="text-lg font-black text-slate-900 mt-1.5">{{ sistema.nome }}</h3>
              </div>
              <button
                type="button"
                (click)="multivarAtivo.set(null)"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Trocar sistema</span>
              </button>
            </div>

            <div class="p-5 sm:p-6 space-y-4">
              <!-- Campos de entrada -->
              @for (campo of sistema.campos; track campo.id) {
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    {{ campo.label }} <span class="text-slate-400 font-normal">({{ campo.unidade }})</span>
                  </label>
                  <input
                    type="number"
                    [value]="valoresMultivar()[campo.id] || ''"
                    (input)="atualizarValorMultivar(campo.id, $any($event.target).value)"
                    [placeholder]="campo.placeholder"
                    min="0"
                    step="any"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#B5642A]/40 focus:border-[#B5642A] transition-all"
                  />
                </div>
              }

              <!-- Resultado passo a passo -->
              @if (resultadosMultivar(); as passos) {
                <div class="space-y-2">
                  <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Memória de cálculo</div>
                  @for (p of passos; track $index) {
                    <div
                      [class]="$index === passos.length - 1
                        ? 'bg-gradient-to-r from-slate-900 to-[#132A41] text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-700'"
                      class="p-4 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <span [class]="$index === passos.length - 1 ? 'text-xs text-amber-300 font-bold' : 'text-xs font-medium'">
                        {{ p.label }}
                      </span>
                      <span [class]="$index === passos.length - 1 ? 'text-xl font-black' : 'text-sm font-bold'" class="shrink-0">
                        {{ p.valorFormatado }}
                      </span>
                    </div>
                  }
                </div>
              }

              <!-- Observação técnica -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p class="text-xs text-slate-600 leading-relaxed">{{ sistema.observacao }}</p>
                <p class="text-[10px] text-slate-400 mt-2 font-medium">Fonte: {{ sistema.fonte }}</p>
              </div>

              <!-- Disclaimer reforçado -->
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                <span class="text-sm shrink-0">🏗️</span>
                <p class="text-[11px] text-rose-900 leading-relaxed">
                  Cálculo de engenharia — pré-dimensionamento apenas. Exige memória de cálculo completa
                  e responsabilidade técnica de profissional habilitado (ART/RRT) antes de qualquer execução.
                </p>
              </div>
            </div>
          </div>
        }

      }
    </div>
  `,
})
export class CalculadoraPredimensionamentoComponent {
  readonly sistemas = SISTEMAS_CALCULAVEIS;
  readonly sistemasTabela = SISTEMAS_TABELA_ESCOLHA;
  readonly sistemasMultivar = SISTEMAS_MULTIVARIAVEL;

  readonly modoAtivo = signal<'calculo' | 'tabela' | 'multivar'>('calculo');
  readonly termoBusca = signal('');
  readonly sistemaAtivo = signal<SistemaCalculavel | null>(null);
  readonly valores = signal<Record<string, string>>({});
  readonly tabelaAtiva = signal<SistemaTabelaEscolha | null>(null);
  readonly opcaoSelecionada = signal<OpcaoEscolha | null>(null);
  readonly multivarAtivo = signal<SistemaMultiVariavel | null>(null);
  readonly valoresMultivar = signal<Record<string, string>>({});

  readonly sistemasFiltrados = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    if (!busca) return this.sistemas;
    return this.sistemas.filter(s =>
      s.nome.toLowerCase().includes(busca) || s.categoria.toLowerCase().includes(busca)
    );
  });

  readonly sistemasTabelaFiltrados = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    if (!busca) return this.sistemasTabela;
    return this.sistemasTabela.filter(s =>
      s.nome.toLowerCase().includes(busca) || s.categoria.toLowerCase().includes(busca)
    );
  });

  readonly resultado = computed<string | null>(() => {
    const sistema = this.sistemaAtivo();
    if (!sistema) return null;

    const vals = this.valores();
    const entradas: Record<string, number> = {};
    for (const campo of sistema.campos) {
      const bruto = vals[campo.id];
      if (bruto === undefined || bruto === '') return null;
      const num = parseFloat(bruto);
      if (isNaN(num) || num <= 0) return null;
      entradas[campo.id] = num;
    }

    let valorCalculado: number | null = null;

    switch (sistema.tipoCalculo) {
      case 'divisor': {
        const vao = entradas[sistema.campos[0].id];
        valorCalculado = vao / (sistema.divisor as number);
        break;
      }
      case 'faixa_divisor': {
        const vao = entradas[sistema.campos[0].id];
        const min = vao / (sistema.divisorMax as number);
        const max = vao / (sistema.divisorMin as number);
        return this.formatarFaixa(sistema, min, max);
      }
      case 'multiplicador': {
        const base = entradas[sistema.campos[0].id];
        valorCalculado = base * (sistema.multiplicador as number);
        break;
      }
      case 'faixa_multiplicador': {
        const base = entradas[sistema.campos[0].id];
        const min = base * (sistema.multiplicadorMin as number);
        const max = base * (sistema.multiplicadorMax as number);
        return this.formatarFaixa(sistema, min, max);
      }
      case 'formula_customizada': {
        valorCalculado = this.calcularCustomizado(sistema.id, entradas);
        break;
      }
    }

    if (valorCalculado === null) return null;
    if (sistema.minimoAbsoluto !== undefined && valorCalculado < sistema.minimoAbsoluto) {
      valorCalculado = sistema.minimoAbsoluto;
    }
    return sistema.formatoResultado(valorCalculado);
  });

  private formatarFaixa(sistema: SistemaCalculavel, min: number, max: number): string {
    const minTexto = sistema.formatoResultado(min);
    const maxTexto = sistema.formatoResultado(max);
    if (minTexto === maxTexto) return minTexto;
    // Extrai só o número da string formatada do mínimo, mantém a unidade só uma vez no final
    return `${minTexto} a ${maxTexto}`;
  }

  private calcularCustomizado(sistemaId: string, entradas: Record<string, number>): number | null {
    switch (sistemaId) {
      case 'grupo-gerador-kva': {
        const kw = entradas['kw'];
        const kva = kw / 0.8;
        return kva * 1.25; // margem de 25%
      }
      case 'barramento-blindado-corrente': {
        const potenciaW = entradas['potencia'] * 1000; // kW → W
        const tensao = entradas['tensao'];
        const cosPhi = 0.92;
        const raizDe3 = 1.732; // circuito trifásico
        return potenciaW / (raizDe3 * tensao * cosPhi);
      }
      case 'extintores-quantidade': {
        const area = entradas['area'];
        const areaPorExtintorRiscoMedio = 135; // m² por unidade, risco médio (referência conservadora)
        const qtd = Math.ceil(area / areaPorExtintorRiscoMedio);
        return Math.max(qtd, 2); // mínimo 2 unidades por pavimento
      }
      case 'escada-rolante-capacidade': {
        const v = entradas['velocidade'];
        const largura = entradas['largura'];
        let k = 1.0;
        if (largura >= 1000) k = 2.0;
        else if (largura >= 800) k = 1.5;
        return (3600 * v * k) / 0.4;
      }
      default:
        return null;
    }
  }

  selecionarSistema(sistema: SistemaCalculavel): void {
    this.sistemaAtivo.set(sistema);
    this.valores.set({});
  }

  selecionarTabela(sistema: SistemaTabelaEscolha): void {
    this.tabelaAtiva.set(sistema);
    this.opcaoSelecionada.set(null);
  }

  selecionarMultivar(sistema: SistemaMultiVariavel): void {
    this.multivarAtivo.set(sistema);
    this.valoresMultivar.set({});
  }

  atualizarValorMultivar(campoId: string, valor: string): void {
    this.valoresMultivar.set({ ...this.valoresMultivar(), [campoId]: valor });
  }

  readonly resultadosMultivar = computed<{ label: string; valorFormatado: string }[] | null>(() => {
    const sistema = this.multivarAtivo();
    if (!sistema) return null;

    const vals = this.valoresMultivar();
    const entradas: Record<string, number> = {};
    for (const campo of sistema.campos) {
      const bruto = vals[campo.id];
      if (bruto === undefined || bruto === '') return null;
      const num = parseFloat(bruto);
      if (isNaN(num) || num <= 0) return null;
      entradas[campo.id] = num;
    }

    try {
      return sistema.passos.map((passo) => {
        const valor = passo.formula(entradas);
        const casas = passo.casasDecimais ?? 2;
        const valorFormatado = `${valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })} ${passo.unidade}`;
        return { label: passo.label, valorFormatado };
      });
    } catch {
      return null;
    }
  });

  voltar(): void {
    this.sistemaAtivo.set(null);
    this.valores.set({});
  }

  atualizarValor(campoId: string, valor: string): void {
    this.valores.set({ ...this.valores(), [campoId]: valor });
  }
}
