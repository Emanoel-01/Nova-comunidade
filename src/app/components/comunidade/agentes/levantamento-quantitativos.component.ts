import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ItemFundacao,
  ItemEstrutura,
  ItemArquitetonico,
  ItemEsquadria,
  ItemCobertura,
  ItemPergolado,
  ItemInstalacao,
  ItemPaisagismo,
  ItemResumoConsolidado,
  RegraAuditoria,
  ParametrosCalculo,
  MargensPerda,
  CHECKLIST_INSTALACOES_GUIA
} from './levantamento-quantitativos.data';

type AbaDisciplina =
  | 'fundacoes'
  | 'estrutura'
  | 'arquitetonico'
  | 'esquadrias'
  | 'cobertura'
  | 'pergolados'
  | 'instalacoes'
  | 'paisagismo'
  | 'resumo';

@Component({
  selector: 'app-levantamento-quantitativos',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- 1. Cabeçalho Principal -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full pointer-events-none blur-2xl"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center font-bold text-sm shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-wider text-indigo-700">Engenharia de Custos & Planejamento</span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Levantamento de Quantitativos
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calcule automaticamente concreto, forma, aço, escavação e demais insumos por disciplina — organize seu levantamento de quantitativos antes de partir para o orçamento executivo.
            </p>
          </div>

          <!-- Ações de Sessão e Exportação -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              (click)="salvarSessaoJson()"
              class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 active:scale-95"
              title="Baixa um arquivo .json com todos os lançamentos e configurações"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Salvar sessão (.json)</span>
            </button>

            <label
              class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200 active:scale-95"
              title="Carrega um arquivo .json salvo anteriormente"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Carregar sessão</span>
              <input type="file" accept="application/json" (change)="carregarSessaoJson($event)" class="hidden" />
            </label>

            <button
              type="button"
              (click)="exportarCsv()"
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              title="Exporta a planilha de quantitativos consolidados em CSV"
            >
              <svg class="w-4 h-4 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        @if (mensagemNotificacao()) {
          <div class="mt-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-indigo-600 font-bold">ℹ️</span>
              <span>{{ mensagemNotificacao() }}</span>
            </div>
            <button type="button" (click)="mensagemNotificacao.set(null)" class="text-indigo-500 hover:text-indigo-700 font-bold text-xs">
              Fechar
            </button>
          </div>
        }
      </div>

      <!-- 2. Barra de Estatísticas Rápidas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-[#132A41] text-white p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Total de Itens</div>
          <div class="text-2xl font-black text-white mt-1">{{ totalItensLancados() }}</div>
        </div>

        <div class="bg-[#132A41] text-white p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Concreto Total</div>
          <div class="text-2xl font-black text-[#E59866] mt-1">{{ totalConcretoGeral().toFixed(2) }} <span class="text-xs font-normal text-slate-300">m³</span></div>
        </div>

        <div class="bg-[#132A41] text-white p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Forma Total</div>
          <div class="text-2xl font-black text-amber-300 mt-1">{{ totalFormaGeral().toFixed(2) }} <span class="text-xs font-normal text-slate-300">m²</span></div>
        </div>

        <div class="bg-[#132A41] text-white p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Aço Total</div>
          <div class="text-2xl font-black text-emerald-400 mt-1">{{ totalAcoGeral().toFixed(0) }} <span class="text-xs font-normal text-slate-300">kg</span></div>
        </div>

        <div class="bg-[#132A41] text-white p-4 rounded-2xl border border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Escavação Total</div>
          <div class="text-2xl font-black text-sky-300 mt-1">{{ totalEscavacaoGeral().toFixed(2) }} <span class="text-xs font-normal text-slate-300">m³</span></div>
        </div>
      </div>

      <!-- 3. Navegação de Abas por Disciplina -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          type="button"
          (click)="abaAtiva.set('fundacoes')"
          [class]="abaAtiva() === 'fundacoes' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Fundações</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ fundacoes().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('estrutura')"
          [class]="abaAtiva() === 'estrutura' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Estrutura</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ estrutura().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('arquitetonico')"
          [class]="abaAtiva() === 'arquitetonico' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Arquitetônico</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ arquitetonico().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('esquadrias')"
          [class]="abaAtiva() === 'esquadrias' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Esquadrias</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ esquadrias().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('cobertura')"
          [class]="abaAtiva() === 'cobertura' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Cobertura</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ cobertura().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('pergolados')"
          [class]="abaAtiva() === 'pergolados' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Pergolados</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ pergolados().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('instalacoes')"
          [class]="abaAtiva() === 'instalacoes' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Instalações</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ instalacoes().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('paisagismo')"
          [class]="abaAtiva() === 'paisagismo' ? 'bg-[#132A41] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Paisagismo</span>
          <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-black">
            {{ paisagismo().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('resumo')"
          [class]="abaAtiva() === 'resumo' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'"
          class="px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-2 ml-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Resumo & Auditoria</span>
        </button>
      </div>

      <!-- 4. Conteúdo das Abas -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">

        <!-- ==================== ABA 1: FUNDAÇÕES ==================== -->
        @if (abaAtiva() === 'fundacoes') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Fundações</h4>
              <p class="text-xs text-slate-500 mt-1">
                Sapatas, baldrames ou blocos de fundação. Informe as dimensões do elemento e a profundidade de escavação — o sistema calcula concreto, forma, volume escavado, reaproveitamento no reaterro, bota-fora e armadura de aço.
              </p>
            </div>

            <!-- Parâmetros de Cálculo da Disciplina -->
            <details class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <summary class="font-bold text-slate-800 cursor-pointer flex items-center justify-between">
                <span>⚙️ Parâmetros de cálculo de fundações</span>
                <span class="text-[11px] text-slate-400 font-normal">Clique para ajustar</span>
              </summary>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <label class="block text-slate-600 font-bold mb-1">Reaproveitamento no reaterro (% da escavação)</label>
                  <input
                    type="number"
                    [value]="parametros().reaproveitamentoSolo"
                    (input)="atualizarParametro('reaproveitamentoSolo', $event)"
                    min="0"
                    max="100"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <span class="text-[11px] text-slate-400">Faixa usual: 60% a 80% conforme o solo.</span>
                </div>
                <div>
                  <label class="block text-slate-600 font-bold mb-1">Índice de aço (kg por m³ de concreto)</label>
                  <input
                    type="number"
                    [value]="parametros().acoFundacao"
                    (input)="atualizarParametro('acoFundacao', $event)"
                    min="0"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <span class="text-[11px] text-slate-400">Referência de mercado: 60 a 90 kg/m³.</span>
                </div>
              </div>
            </details>

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Elemento</label>
                <select #fTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="sapata-isolada">Sapata isolada</option>
                  <option value="sapata-corrida">Sapata corrida</option>
                  <option value="baldrame">Baldrame</option>
                  <option value="bloco">Bloco de fundação</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                <input #fLargura type="number" step="0.01" min="0" placeholder="Ex: 1.00" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                <input #fAltura type="number" step="0.01" min="0" placeholder="Ex: 0.50" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                <input #fComprimento type="number" step="0.01" min="0" placeholder="Ex: 1.00" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Profund. escav. (m)</label>
                <input #fProfundidade type="number" step="0.01" min="0" placeholder="Ex: 1.20" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Qtd (un)</label>
                <input #fQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarFundacao(fTipo.value, fLargura.value, fAltura.value, fComprimento.value, fProfundidade.value, fQtd.value); fLargura.value=''; fAltura.value=''; fComprimento.value=''; fProfundidade.value=''; fQtd.value='1'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Fundação
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (fundacoes().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Elemento</th>
                      <th class="p-3">Dimensões (L×A×C)</th>
                      <th class="p-3">Qtd</th>
                      <th class="p-3">Concreto (m³)</th>
                      <th class="p-3">Forma (m²)</th>
                      <th class="p-3">Escavação (m³)</th>
                      <th class="p-3">Reaprov. (m³)</th>
                      <th class="p-3">Bota-Fora (m³)</th>
                      <th class="p-3">Aço (kg)</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of fundacoes(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800 capitalize">{{ formatarNomeTipo(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.largura }} × {{ item.altura }} × {{ item.comprimento }}m</td>
                        <td class="p-3 text-slate-600">{{ item.qtd }}</td>
                        <td class="p-3 font-semibold text-slate-800">{{ item.concreto.toFixed(2) }}</td>
                        <td class="p-3 font-semibold text-slate-800">{{ item.forma.toFixed(2) }}</td>
                        <td class="p-3 text-slate-600">{{ item.escavacao.toFixed(2) }}</td>
                        <td class="p-3 text-slate-600">{{ item.reaproveitamento.toFixed(2) }}</td>
                        <td class="p-3 text-slate-600">{{ item.botaFora.toFixed(2) }}</td>
                        <td class="p-3 font-semibold text-emerald-700">{{ item.aco.toFixed(1) }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerFundacao(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum elemento de fundação lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 2: ESTRUTURA ==================== -->
        @if (abaAtiva() === 'estrutura') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Estrutura</h4>
              <p class="text-xs text-slate-500 mt-1">
                Pilares, vigas e lajes de concreto armado. O sistema calcula volume de concreto, área de forma, cimbramento, consumo de aço e tempo estimado de solda/amarração.
              </p>
            </div>

            <!-- Parâmetros de Cálculo da Disciplina -->
            <details class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <summary class="font-bold text-slate-800 cursor-pointer flex items-center justify-between">
                <span>⚙️ Parâmetros de cálculo de estrutura</span>
                <span class="text-[11px] text-slate-400 font-normal">Clique para ajustar</span>
              </summary>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <label class="block text-slate-600 font-bold mb-1">Índice de aço (kg por m³ de concreto)</label>
                  <input
                    type="number"
                    [value]="parametros().acoEstrutura"
                    (input)="atualizarParametro('acoEstrutura', $event)"
                    min="0"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <span class="text-[11px] text-slate-400">Padrão: 100 kg/m³. Faixa de mercado: 80 a 130 kg/m³.</span>
                </div>
                <div>
                  <label class="block text-slate-600 font-bold mb-1">Tempo de solda/amarração (h por kg de aço)</label>
                  <input
                    type="number"
                    step="0.01"
                    [value]="parametros().tempoSolda"
                    (input)="atualizarParametro('tempoSolda', $event)"
                    min="0"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <span class="text-[11px] text-slate-400">Padrão de referência: 0.05 h/kg.</span>
                </div>
              </div>
            </details>

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Elemento</label>
                <select #eTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="pilar">Pilar</option>
                  <option value="viga">Viga</option>
                  <option value="laje">Laje</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                <input #eLargura type="number" step="0.01" min="0" placeholder="Ex: 0.20" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                <input #eAltura type="number" step="0.01" min="0" placeholder="Ex: 0.40" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                <input #eComprimento type="number" step="0.01" min="0" placeholder="Ex: 5.00" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Qtd (un)</label>
                <input #eQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarEstrutura(eTipo.value, eLargura.value, eAltura.value, eComprimento.value, eQtd.value); eLargura.value=''; eAltura.value=''; eComprimento.value=''; eQtd.value='1'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Elemento Estrutural
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (estrutura().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Elemento</th>
                      <th class="p-3">Dimensões (L×A×C)</th>
                      <th class="p-3">Qtd</th>
                      <th class="p-3">Concreto (m³)</th>
                      <th class="p-3">Forma (m²)</th>
                      <th class="p-3">Cimbramento (m³)</th>
                      <th class="p-3">Aço (kg)</th>
                      <th class="p-3">Solda (h)</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of estrutura(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800 capitalize">{{ formatarNomeTipo(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.largura }} × {{ item.altura }} × {{ item.comprimento }}m</td>
                        <td class="p-3 text-slate-600">{{ item.qtd }}</td>
                        <td class="p-3 font-semibold text-slate-800">{{ item.concreto.toFixed(2) }}</td>
                        <td class="p-3 font-semibold text-slate-800">{{ item.forma.toFixed(2) }}</td>
                        <td class="p-3 text-slate-600">{{ item.cimbramento.toFixed(2) }}</td>
                        <td class="p-3 font-semibold text-emerald-700">{{ item.aco.toFixed(1) }}</td>
                        <td class="p-3 text-slate-600">{{ item.solda.toFixed(1) }}h</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerEstrutura(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum elemento estrutural lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 3: ARQUITETÔNICO ==================== -->
        @if (abaAtiva() === 'arquitetonico') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Arquitetônico</h4>
              <p class="text-xs text-slate-500 mt-1">
                Alvenarias de vedação/estrutural, revestimento de paredes, pisos e pinturas. Meça o comprimento e altura dos panos ou ambientes e desconte os vãos de portas e janelas.
              </p>
            </div>

            <!-- Alerta de referência das Esquadrias -->
            @if (totalAreaEsquadrias() > 0) {
              <div class="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
                <span>💡 <strong>Área total de esquadrias cadastradas:</strong> {{ totalAreaEsquadrias().toFixed(2) }} m². Use este valor como base para o desconto de vãos de alvenaria.</span>
                <button type="button" (click)="abaAtiva.set('esquadrias')" class="text-indigo-700 font-bold hover:underline">
                  Ver Esquadrias
                </button>
              </div>
            }

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Serviço</label>
                <select #aTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="alvenaria-ceramica">Alvenaria — bloco cerâmico</option>
                  <option value="alvenaria-bloco">Alvenaria — bloco de concreto</option>
                  <option value="revestimento-parede">Revestimento de parede (emboço/reboco)</option>
                  <option value="piso-ceramico">Piso cerâmico / porcelanato</option>
                  <option value="pintura">Pintura látex / acrílica</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                <input #aComprimento type="number" step="0.01" min="0" placeholder="Ex: 8.50" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                <input #aAltura type="number" step="0.01" min="0" placeholder="Ex: 2.80" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Qtd Panos/Ambientes</label>
                <input #aQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Desconto vãos (m²)</label>
                <input #aDesconto type="number" step="0.01" min="0" value="0" placeholder="Ex: 3.20" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarArquitetonico(aTipo.value, aComprimento.value, aAltura.value, aQtd.value, aDesconto.value); aComprimento.value=''; aAltura.value=''; aQtd.value='1'; aDesconto.value='0'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Item Arquitetônico
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (arquitetonico().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Serviço</th>
                      <th class="p-3">Dimensões (C×A)</th>
                      <th class="p-3">Qtd Panos</th>
                      <th class="p-3">Área Bruta (m²)</th>
                      <th class="p-3">Desconto (m²)</th>
                      <th class="p-3">Área Líquida (m²)</th>
                      <th class="p-3">Encunhamento (m)</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of arquitetonico(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800">{{ formatarNomeServico(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.comprimento }} × {{ item.altura }}m</td>
                        <td class="p-3 text-slate-600">{{ item.qtd }}</td>
                        <td class="p-3 text-slate-600">{{ item.areaBruta.toFixed(2) }}</td>
                        <td class="p-3 text-amber-700">-{{ item.desconto.toFixed(2) }}</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.areaLiquida.toFixed(2) }} m²</td>
                        <td class="p-3 text-slate-600">{{ item.encunhamento > 0 ? item.encunhamento.toFixed(2) + ' m' : '—' }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerArquitetonico(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum serviço arquitetônico lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 4: ESQUADRIAS ==================== -->
        @if (abaAtiva() === 'esquadrias') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Esquadrias</h4>
              <p class="text-xs text-slate-500 mt-1">
                Portas, janelas, portões e gradis. O sistema calcula a área total dos vãos (para verificação de vidro/folhas e desconto de alvenaria) e consolida no resumo de arquitetura.
              </p>
            </div>

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Elemento</label>
                <select #qTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="porta-lisa">Porta lisa de madeira</option>
                  <option value="porta-veneziana">Porta veneziana / alumínio</option>
                  <option value="janela-correr">Janela de correr (2 ou 4 folhas)</option>
                  <option value="janela-basculante">Janela basculante / maxim-ar</option>
                  <option value="portao">Portão metálico / acesso</option>
                  <option value="guarda-corpo">Guarda-corpo / gradil</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                <input #qLargura type="number" step="0.01" min="0" placeholder="Ex: 0.80" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                <input #qAltura type="number" step="0.01" min="0" placeholder="Ex: 2.10" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Quantidade (un)</label>
                <input #qQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarEsquadria(qTipo.value, qLargura.value, qAltura.value, qQtd.value); qLargura.value=''; qAltura.value=''; qQtd.value='1'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Esquadria
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (esquadrias().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Elemento</th>
                      <th class="p-3">Dimensões (L×A)</th>
                      <th class="p-3">Quantidade (un)</th>
                      <th class="p-3">Área Total (m²)</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of esquadrias(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800">{{ formatarNomeEsquadria(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.largura }} × {{ item.altura }}m</td>
                        <td class="p-3 font-semibold text-slate-800">{{ item.qtd }} un</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.area.toFixed(2) }} m²</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerEsquadria(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhuma esquadria lançada ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 5: COBERTURA ==================== -->
        @if (abaAtiva() === 'cobertura') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Cobertura</h4>
              <p class="text-xs text-slate-500 mt-1">
                Telhas, estrutura metálica/madeira, calhas e rufos. Informe a dimensão unitária do elemento (área ou comprimento) e a quantidade de módulos.
              </p>
            </div>

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Elemento</label>
                <select #cTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="telha-ceramica">Telha cerâmica / termoacústica</option>
                  <option value="estrutura-metalica">Estrutura metálica de cobertura</option>
                  <option value="estrutura-madeira">Estrutura de madeira (tesouras/ripas)</option>
                  <option value="calha">Calha / rufo galvanizado</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Dimensão unitária</label>
                <input #cDimensao type="number" step="0.01" min="0" placeholder="Ex: 50.00" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                <select #cUnidade class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="m²">m² (área)</option>
                  <option value="m">m (comprimento linear)</option>
                  <option value="un">un (unidades)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Qtd Módulos</label>
                <input #cQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarCobertura(cTipo.value, cDimensao.value, cUnidade.value, cQtd.value); cDimensao.value=''; cQtd.value='1'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Item de Cobertura
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (cobertura().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Elemento</th>
                      <th class="p-3">Dimensão Unitária</th>
                      <th class="p-3">Qtd Módulos</th>
                      <th class="p-3">Total Calculado</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of cobertura(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800">{{ formatarNomeCobertura(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.dimensao }} {{ item.unidade }}</td>
                        <td class="p-3 text-slate-600">{{ item.qtd }}</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.total.toFixed(2) }} {{ item.unidade }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerCobertura(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum item de cobertura lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 6: PERGOLADOS ==================== -->
        @if (abaAtiva() === 'pergolados') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Pergolados e Estruturas de Sombreamento</h4>
              <p class="text-xs text-slate-500 mt-1">
                Pergolados de madeira ou metálicos, treliças e brises de sombreamento. Consolida com as estruturas de paisagismo e áreas externas no resumo.
              </p>
            </div>

            <!-- Formulário de Adição -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Elemento</label>
                <select #gTipo class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="pergolado-madeira">Pergolado de madeira tratada</option>
                  <option value="pergolado-metalico">Pergolado metálico / perfil tubular</option>
                  <option value="trelica">Treliça / brise de sombreamento</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Dimensão unitária</label>
                <input #gDimensao type="number" step="0.01" min="0" placeholder="Ex: 18.00" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                <select #gUnidade class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="m²">m² (área)</option>
                  <option value="m">m (comprimento)</option>
                  <option value="un">un (unidades)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Qtd Módulos</label>
                <input #gQtd type="number" step="1" min="1" value="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarPergolado(gTipo.value, gDimensao.value, gUnidade.value, gQtd.value); gDimensao.value=''; gQtd.value='1'"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Pergolado
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (pergolados().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Elemento</th>
                      <th class="p-3">Dimensão Unitária</th>
                      <th class="p-3">Qtd Módulos</th>
                      <th class="p-3">Total Calculado</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of pergolados(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800">{{ formatarNomePergolado(item.tipo) }}</td>
                        <td class="p-3 text-slate-600">{{ item.dimensao }} {{ item.unidade }}</td>
                        <td class="p-3 text-slate-600">{{ item.qtd }}</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.total.toFixed(2) }} {{ item.unidade }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerPergolado(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum pergolado lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 7: INSTALAÇÕES ==================== -->
        @if (abaAtiva() === 'instalacoes') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Hidrossanitário e Elétrico — Levantamento Guiado</h4>
              <p class="text-xs text-slate-500 mt-1">
                Percorra a planta baixa disciplina por disciplina, confira as legendas e registre as tubulações, pontos elétricos, quadros, e as louças e metais sanitários.
              </p>
            </div>

            <!-- Checklist Rápido de Verificação de Legendas -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div class="text-xs font-black text-slate-800 uppercase tracking-wider">Checklist de Itens para Conferência em Planta</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                @for (check of checklistGuia; track check.id) {
                  <label class="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" class="rounded text-indigo-600 focus:ring-indigo-500" />
                    <span class="truncate">{{ check.label }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Formulário de Adição de Instalação -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Disciplina</label>
                <select #iDisciplina class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="hidrossanitario">Hidrossanitário (tubos e conexões)</option>
                  <option value="eletrico">Elétrico (cabos, pontos, quadro)</option>
                  <option value="pecas-sanitarias">Louças e metais sanitários</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Item / Descrição</label>
                <input #iItem type="text" placeholder="Ex: Tubo PVC Esgoto 100mm ou Ponto de Tomada 2P+T" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Quantidade</label>
                <input #iQtd type="number" step="0.01" min="0" placeholder="Ex: 32" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                <input #iUnidade type="text" placeholder="Ex: m, un, pt, cj" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarInstalacao(iDisciplina.value, iItem.value, iQtd.value, iUnidade.value); iItem.value=''; iQtd.value=''; iUnidade.value=''"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Item de Instalações
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (instalacoes().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Disciplina</th>
                      <th class="p-3">Item / Material</th>
                      <th class="p-3">Quantidade</th>
                      <th class="p-3">Unidade</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of instalacoes(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800 capitalize">{{ item.disciplina }}</td>
                        <td class="p-3 text-slate-800 font-medium">{{ item.item }}</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.qtd }}</td>
                        <td class="p-3 text-slate-600">{{ item.unidade }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerInstalacao(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum item de instalações lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 8: PAISAGISMO ==================== -->
        @if (abaAtiva() === 'paisagismo') {
          <div class="space-y-6">
            <div>
              <h4 class="text-base font-black text-slate-900">Paisagismo e Áreas Externas</h4>
              <p class="text-xs text-slate-500 mt-1">
                Registre os quantitativos de forração de grama, mudas, árvores, preparo de solo/terra vegetal e pisos drenantes das áreas externas.
              </p>
            </div>

            <!-- Formulário de Adição de Paisagismo -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Item / Descrição</label>
                <input #pItem type="text" placeholder="Ex: Grama esmeralda em placas ou Mudas de arbusto" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Quantidade</label>
                <input #pQtd type="number" step="0.01" min="0" placeholder="Ex: 250" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                <input #pUnidade type="text" placeholder="Ex: m², un, m³" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                (click)="adicionarPaisagismo(pItem.value, pQtd.value, pUnidade.value); pItem.value=''; pQtd.value=''; pUnidade.value=''"
                class="px-4 py-2.5 bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Adicionar Item de Paisagismo
              </button>
            </div>

            <!-- Tabela de Itens -->
            @if (paisagismo().length > 0) {
              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Item / Material</th>
                      <th class="p-3">Quantidade</th>
                      <th class="p-3">Unidade</th>
                      <th class="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of paisagismo(); track item.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="p-3 font-bold text-slate-800">{{ item.item }}</td>
                        <td class="p-3 font-bold text-indigo-900">{{ item.qtd }}</td>
                        <td class="p-3 text-slate-600">{{ item.unidade }}</td>
                        <td class="p-3 text-right">
                          <button type="button" (click)="removerPaisagismo(item.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum item de paisagismo lançado ainda.
              </div>
            }
          </div>
        }

        <!-- ==================== ABA 9: RESUMO & AUDITORIA ==================== -->
        @if (abaAtiva() === 'resumo') {
          <div class="space-y-8">
            
            <!-- 1. Bloco de Autoauditoria de Inconsistências -->
            <div class="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span class="text-base">🛡️</span>
                    <span>Autoauditoria — antes de fechar a lista, confira</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Verificação automática de regras de coerência construtiva e detecção de serviços complementares esquecidos.
                  </p>
                </div>

                <div class="flex items-center gap-1.5">
                  <span class="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                    {{ regrasAuditoria().length }} Regras Avaliadas
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                @for (regra of regrasAuditoria(); track regra.id) {
                  <div
                    class="p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-all"
                    [class]="regra.status === 'ok' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : (regra.status === 'alerta' ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-2xs' : 'bg-slate-100/70 border-slate-200 text-slate-600')"
                  >
                    <span class="text-sm shrink-0 mt-0.5">
                      {{ regra.status === 'ok' ? '✅' : (regra.status === 'alerta' ? '⚠️' : '⚪') }}
                    </span>
                    <div class="space-y-1">
                      <div class="font-bold">{{ regra.titulo }}</div>
                      <div class="text-[11px] leading-relaxed opacity-90">{{ regra.mensagem }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- 2. Margens de Perda por Disciplina -->
            <details class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <summary class="font-bold text-slate-800 cursor-pointer flex items-center justify-between">
                <span>⚙️ Configuração de Margens de Perda Operacional (%)</span>
                <span class="text-[11px] text-slate-400 font-normal">Ajuste os percentuais aplicados ao resumo</span>
              </summary>
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Fundações (%)</label>
                  <input type="number" [value]="margensPerda().fundacoes" (input)="atualizarMargemPerda('fundacoes', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Estrutura (%)</label>
                  <input type="number" [value]="margensPerda().estrutura" (input)="atualizarMargemPerda('estrutura', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Arquitetura (%)</label>
                  <input type="number" [value]="margensPerda().arquitetonico" (input)="atualizarMargemPerda('arquitetonico', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Cobertura (%)</label>
                  <input type="number" [value]="margensPerda().cobertura" (input)="atualizarMargemPerda('cobertura', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Esquadrias (%)</label>
                  <input type="number" [value]="margensPerda().esquadrias" (input)="atualizarMargemPerda('esquadrias', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Instalações (%)</label>
                  <input type="number" [value]="margensPerda().instalacoes" (input)="atualizarMargemPerda('instalacoes', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Paisagismo (%)</label>
                  <input type="number" [value]="margensPerda().paisagismo" (input)="atualizarMargemPerda('paisagismo', $event)" min="0" max="50" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
              </div>
            </details>

            <!-- 3. Tabela Consolidada de Quantitativos e Produtividade -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-black text-slate-900">Resumo Consolidado</h4>
                  <p class="text-xs text-slate-500">
                    Quantitativos totais com aplicação de perda operacional e estimativa de duração por produtividade técnica.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="exportarCsv()"
                  class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Exportar Planilha (CSV)</span>
                </button>
              </div>

              @if (resumoConsolidado().length > 0) {
                <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table class="w-full text-xs text-left">
                    <thead class="bg-[#132A41] text-white font-bold">
                      <tr>
                        <th class="p-3">Disciplina</th>
                        <th class="p-3">Serviço / Insumo</th>
                        <th class="p-3">Unidade</th>
                        <th class="p-3">Qtd. Calculada</th>
                        <th class="p-3">Perda (%)</th>
                        <th class="p-3">Qtd. com Perda</th>
                        <th class="p-3">Produtividade (h/un)</th>
                        <th class="p-3">Duração (h equipe)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (item of resumoConsolidado(); track item.servico) {
                        <tr class="hover:bg-slate-50/60">
                          <td class="p-3 font-semibold text-slate-700">{{ item.disciplina }}</td>
                          <td class="p-3 font-bold text-slate-900">{{ item.servico }}</td>
                          <td class="p-3 text-slate-600">{{ item.unidade }}</td>
                          <td class="p-3 text-slate-700">{{ item.qtdCalculada.toFixed(2) }}</td>
                          <td class="p-3 text-amber-700">+{{ item.margemPerda }}%</td>
                          <td class="p-3 font-black text-indigo-900">{{ item.qtdComPerda.toFixed(2) }}</td>
                          <td class="p-3 text-slate-600">{{ item.produtividade.toFixed(2) }} h/{{ item.unidade }}</td>
                          <td class="p-3 font-bold text-slate-800">{{ item.duracaoHoras.toFixed(1) }} h</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Lance itens nas abas anteriores para gerar o resumo consolidado.
                </div>
              }
            </div>

          </div>
        }

      </div>

      <!-- Rodapé Institucional e Orientação -->
      <div class="text-center text-[11px] text-slate-400 pt-2">
        Levantamento de Quantitativos · Amorim Tech · Nada é salvo automaticamente — use "Salvar sessão" para continuar depois.
      </div>

    </div>
  `
})
export class LevantamentoQuantitativosComponent {
  readonly abaAtiva = signal<AbaDisciplina>('fundacoes');
  readonly mensagemNotificacao = signal<string | null>(null);

  readonly checklistGuia = CHECKLIST_INSTALACOES_GUIA;

  // Estados Reativos por Disciplina
  readonly fundacoes = signal<ItemFundacao[]>([]);
  readonly estrutura = signal<ItemEstrutura[]>([]);
  readonly arquitetonico = signal<ItemArquitetonico[]>([]);
  readonly esquadrias = signal<ItemEsquadria[]>([]);
  readonly cobertura = signal<ItemCobertura[]>([]);
  readonly pergolados = signal<ItemPergolado[]>([]);
  readonly instalacoes = signal<ItemInstalacao[]>([]);
  readonly paisagismo = signal<ItemPaisagismo[]>([]);

  // Parâmetros Globais de Cálculo
  readonly parametros = signal<ParametrosCalculo>({
    reaproveitamentoSolo: 70,
    acoFundacao: 80,
    acoEstrutura: 100,
    tempoSolda: 0.05
  });

  // Margens de Perda por Disciplina (%)
  readonly margensPerda = signal<MargensPerda>({
    fundacoes: 5,
    estrutura: 5,
    arquitetonico: 8,
    cobertura: 5,
    esquadrias: 0,
    instalacoes: 7,
    paisagismo: 5
  });

  // Totais Gerais Computados
  readonly totalItensLancados = computed(() => {
    return (
      this.fundacoes().length +
      this.estrutura().length +
      this.arquitetonico().length +
      this.esquadrias().length +
      this.cobertura().length +
      this.pergolados().length +
      this.instalacoes().length +
      this.paisagismo().length
    );
  });

  readonly totalConcretoGeral = computed(() => {
    const f = this.fundacoes().reduce((acc, item) => acc + item.concreto, 0);
    const e = this.estrutura().reduce((acc, item) => acc + item.concreto, 0);
    return f + e;
  });

  readonly totalFormaGeral = computed(() => {
    const f = this.fundacoes().reduce((acc, item) => acc + item.forma, 0);
    const e = this.estrutura().reduce((acc, item) => acc + item.forma, 0);
    return f + e;
  });

  readonly totalAcoGeral = computed(() => {
    const f = this.fundacoes().reduce((acc, item) => acc + item.aco, 0);
    const e = this.estrutura().reduce((acc, item) => acc + item.aco, 0);
    return f + e;
  });

  readonly totalEscavacaoGeral = computed(() => {
    return this.fundacoes().reduce((acc, item) => acc + item.escavacao, 0);
  });

  readonly totalAreaEsquadrias = computed(() => {
    return this.esquadrias().reduce((acc, item) => acc + item.area, 0);
  });

  // ==================== MÉTODOS DE FUNDAÇÕES ====================
  adicionarFundacao(
    tipoStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    profundidadeStr: string,
    qtdStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const profundidade = parseFloat(profundidadeStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!largura || !altura || !comprimento || isNaN(profundidade) || profundidade < 0) {
      this.exibirNotificacao('Por favor, informe largura, altura, comprimento e profundidade válidos.');
      return;
    }

    const cfg = this.parametros();
    const tipo = tipoStr as ItemFundacao['tipo'];

    // Fórmulas exatas do artefato de engenharia
    const concreto = largura * altura * comprimento * qtd;
    let forma = 0;
    if (tipo === 'sapata-isolada' || tipo === 'bloco') {
      forma = 2 * (largura + comprimento) * altura * qtd;
    } else {
      forma = 2 * comprimento * altura * qtd;
    }

    const escavacao = largura * comprimento * profundidade * qtd;
    const reaproveitamento = escavacao * (cfg.reaproveitamentoSolo / 100);
    const botaFora = Math.max(0, escavacao - reaproveitamento);
    const aco = concreto * cfg.acoFundacao;

    const novoItem: ItemFundacao = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      largura,
      altura,
      comprimento,
      profundidade,
      qtd,
      concreto,
      forma,
      escavacao,
      reaproveitamento,
      botaFora,
      aco
    };

    this.fundacoes.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Elemento de fundação adicionado com sucesso!');
  }

  removerFundacao(id: string): void {
    this.fundacoes.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE ESTRUTURA ====================
  adicionarEstrutura(
    tipoStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    qtdStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Por favor, preencha largura, altura e comprimento do elemento estrutural.');
      return;
    }

    const cfg = this.parametros();
    const tipo = tipoStr as ItemEstrutura['tipo'];

    const concreto = largura * altura * comprimento * qtd;
    let forma = 0;
    let cimbramento = 0;

    if (tipo === 'pilar') {
      forma = 2 * (largura + altura) * comprimento * qtd;
      cimbramento = 0;
    } else if (tipo === 'viga') {
      forma = (largura + 2 * altura) * comprimento * qtd;
      cimbramento = largura * altura * comprimento * qtd;
    } else if (tipo === 'laje') {
      forma = largura * comprimento * qtd;
      cimbramento = largura * comprimento * altura * qtd;
    }

    const aco = concreto * cfg.acoEstrutura;
    const solda = aco * cfg.tempoSolda;

    const novoItem: ItemEstrutura = {
      id: 'e_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      largura,
      altura,
      comprimento,
      qtd,
      concreto,
      forma,
      cimbramento,
      aco,
      solda
    };

    this.estrutura.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Elemento estrutural adicionado com sucesso!');
  }

  removerEstrutura(id: string): void {
    this.estrutura.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE ARQUITETÔNICO ====================
  adicionarArquitetonico(
    tipoStr: string,
    comprimentoStr: string,
    alturaStr: string,
    qtdStr: string,
    descontoStr: string
  ): void {
    const comprimento = parseFloat(comprimentoStr);
    const altura = parseFloat(alturaStr);
    const qtd = parseInt(qtdStr, 10) || 1;
    const desconto = parseFloat(descontoStr) || 0;

    if (!comprimento || !altura) {
      this.exibirNotificacao('Por favor, informe o comprimento e altura do pano ou ambiente.');
      return;
    }

    const tipo = tipoStr as ItemArquitetonico['tipo'];
    const areaBruta = comprimento * altura * qtd;
    const areaLiquida = Math.max(0, areaBruta - desconto);
    const encunhamento = tipo.startsWith('alvenaria') ? comprimento * qtd : 0;

    const novoItem: ItemArquitetonico = {
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      comprimento,
      altura,
      qtd,
      desconto,
      areaBruta,
      areaLiquida,
      encunhamento
    };

    this.arquitetonico.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item arquitetônico adicionado com sucesso!');
  }

  removerArquitetonico(id: string): void {
    this.arquitetonico.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE ESQUADRIAS ====================
  adicionarEsquadria(tipoStr: string, larguraStr: string, alturaStr: string, qtdStr: string): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!largura || !altura) {
      this.exibirNotificacao('Informe largura e altura da esquadria.');
      return;
    }

    const tipo = tipoStr as ItemEsquadria['tipo'];
    const area = largura * altura * qtd;

    const novoItem: ItemEsquadria = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      largura,
      altura,
      qtd,
      area
    };

    this.esquadrias.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Esquadria cadastrada com sucesso!');
  }

  removerEsquadria(id: string): void {
    this.esquadrias.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE COBERTURA ====================
  adicionarCobertura(tipoStr: string, dimensaoStr: string, unidadeStr: string, qtdStr: string): void {
    const dimensao = parseFloat(dimensaoStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!dimensao) {
      this.exibirNotificacao('Informe a dimensão unitária do elemento de cobertura.');
      return;
    }

    const tipo = tipoStr as ItemCobertura['tipo'];
    const unidade = unidadeStr as ItemCobertura['unidade'];
    const total = dimensao * qtd;

    const novoItem: ItemCobertura = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      dimensao,
      unidade,
      qtd,
      total
    };

    this.cobertura.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de cobertura adicionado com sucesso!');
  }

  removerCobertura(id: string): void {
    this.cobertura.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE PERGOLADOS ====================
  adicionarPergolado(tipoStr: string, dimensaoStr: string, unidadeStr: string, qtdStr: string): void {
    const dimensao = parseFloat(dimensaoStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!dimensao) {
      this.exibirNotificacao('Informe a dimensão unitária do pergolado.');
      return;
    }

    const tipo = tipoStr as ItemPergolado['tipo'];
    const unidade = unidadeStr as ItemPergolado['unidade'];
    const total = dimensao * qtd;

    const novoItem: ItemPergolado = {
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      dimensao,
      unidade,
      qtd,
      total
    };

    this.pergolados.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Pergolado adicionado com sucesso!');
  }

  removerPergolado(id: string): void {
    this.pergolados.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE INSTALAÇÕES ====================
  adicionarInstalacao(disciplinaStr: string, itemStr: string, qtdStr: string, unidadeStr: string): void {
    const item = itemStr.trim();
    const qtd = parseFloat(qtdStr);
    const unidade = unidadeStr.trim() || 'un';

    if (!item || isNaN(qtd) || qtd <= 0) {
      this.exibirNotificacao('Informe a descrição e uma quantidade válida do item de instalação.');
      return;
    }

    const disciplina = disciplinaStr as ItemInstalacao['disciplina'];

    const novoItem: ItemInstalacao = {
      id: 'i_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      disciplina,
      item,
      qtd,
      unidade
    };

    this.instalacoes.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de instalação adicionado com sucesso!');
  }

  removerInstalacao(id: string): void {
    this.instalacoes.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE PAISAGISMO ====================
  adicionarPaisagismo(itemStr: string, qtdStr: string, unidadeStr: string): void {
    const item = itemStr.trim();
    const qtd = parseFloat(qtdStr);
    const unidade = unidadeStr.trim() || 'm²';

    if (!item || isNaN(qtd) || qtd <= 0) {
      this.exibirNotificacao('Informe a descrição e a quantidade do item de paisagismo.');
      return;
    }

    const novoItem: ItemPaisagismo = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      item,
      qtd,
      unidade
    };

    this.paisagismo.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de paisagismo adicionado com sucesso!');
  }

  removerPaisagismo(id: string): void {
    this.paisagismo.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== RESUMO CONSOLIDADO ====================
  readonly resumoConsolidado = computed<ItemResumoConsolidado[]>(() => {
    const lista: ItemResumoConsolidado[] = [];
    const margens = this.margensPerda();

    // 1. Escavação (Fundações)
    const escavacao = this.fundacoes().reduce((acc, i) => acc + i.escavacao, 0);
    if (escavacao > 0) {
      const perda = margens.fundacoes;
      const comPerda = escavacao * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Escavação manual/mecânica de valas e cavas',
        unidade: 'm³',
        qtdCalculada: escavacao,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.5,
        duracaoHoras: comPerda * 1.5
      });
    }

    // 2. Reaterro e Compactação
    const reaprov = this.fundacoes().reduce((acc, i) => acc + i.reaproveitamento, 0);
    if (reaprov > 0) {
      const perda = margens.fundacoes;
      const comPerda = reaprov * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Reaterro e compactação com solo local',
        unidade: 'm³',
        qtdCalculada: reaprov,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.8,
        duracaoHoras: comPerda * 0.8
      });
    }

    // 3. Bota-fora
    const botaFora = this.fundacoes().reduce((acc, i) => acc + i.botaFora, 0);
    if (botaFora > 0) {
      lista.push({
        disciplina: 'Fundações',
        servico: 'Bota-fora / remoção de terra excedente',
        unidade: 'm³',
        qtdCalculada: botaFora,
        margemPerda: 0,
        qtdComPerda: botaFora,
        produtividade: 0.3,
        duracaoHoras: botaFora * 0.3
      });
    }

    // 4. Concreto em Fundações
    const concFund = this.fundacoes().reduce((acc, i) => acc + i.concreto, 0);
    if (concFund > 0) {
      const perda = margens.fundacoes;
      const comPerda = concFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Concreto usinado fck ≥ 25 MPa em fundações',
        unidade: 'm³',
        qtdCalculada: concFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.2,
        duracaoHoras: comPerda * 2.2
      });
    }

    // 5. Forma em Fundações
    const formaFund = this.fundacoes().reduce((acc, i) => acc + i.forma, 0);
    if (formaFund > 0) {
      const perda = margens.fundacoes;
      const comPerda = formaFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Forma de madeira / tábua para fundações',
        unidade: 'm²',
        qtdCalculada: formaFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.1,
        duracaoHoras: comPerda * 1.1
      });
    }

    // 6. Aço em Fundações
    const acoFund = this.fundacoes().reduce((acc, i) => acc + i.aco, 0);
    if (acoFund > 0) {
      const perda = margens.fundacoes;
      const comPerda = acoFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Armadura de aço CA-50/60 em fundações',
        unidade: 'kg',
        qtdCalculada: acoFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.08,
        duracaoHoras: comPerda * 0.08
      });
    }

    // 7. Concreto em Estrutura
    const concEst = this.estrutura().reduce((acc, i) => acc + i.concreto, 0);
    if (concEst > 0) {
      const perda = margens.estrutura;
      const comPerda = concEst * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Concreto usinado fck ≥ 30 MPa em superestrutura',
        unidade: 'm³',
        qtdCalculada: concEst,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.5,
        duracaoHoras: comPerda * 2.5
      });
    }

    // 8. Forma em Estrutura
    const formaEst = this.estrutura().reduce((acc, i) => acc + i.forma, 0);
    if (formaEst > 0) {
      const perda = margens.estrutura;
      const comPerda = formaEst * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Forma compensada resinada para pilares/vigas/lajes',
        unidade: 'm²',
        qtdCalculada: formaEst,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.3,
        duracaoHoras: comPerda * 1.3
      });
    }

    // 9. Cimbramento
    const cimbramento = this.estrutura().reduce((acc, i) => acc + i.cimbramento, 0);
    if (cimbramento > 0) {
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Cimbramento e escoramento metálico/madeira',
        unidade: 'm³',
        qtdCalculada: cimbramento,
        margemPerda: 0,
        qtdComPerda: cimbramento,
        produtividade: 0.4,
        duracaoHoras: cimbramento * 0.4
      });
    }

    // 10. Aço em Estrutura
    const acoEst = this.estrutura().reduce((acc, i) => acc + i.aco, 0);
    if (acoEst > 0) {
      const perda = margens.estrutura;
      const comPerda = acoEst * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Armadura de aço CA-50 corte/dobra/montagem',
        unidade: 'kg',
        qtdCalculada: acoEst,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.09,
        duracaoHoras: comPerda * 0.09
      });
    }

    // 11. Itens Arquitetônicos agrupados por tipo
    const arqItens = this.arquitetonico();
    const gruposArq = new Map<string, number>();
    let totalEncunhamento = 0;

    arqItens.forEach(item => {
      const atual = gruposArq.get(item.tipo) || 0;
      gruposArq.set(item.tipo, atual + item.areaLiquida);
      totalEncunhamento += item.encunhamento;
    });

    gruposArq.forEach((areaLiquida, tipo) => {
      const perda = margens.arquitetonico;
      const comPerda = areaLiquida * (1 + perda / 100);
      let prod = 0.8;
      if (tipo.startsWith('alvenaria')) prod = 0.9;
      else if (tipo === 'revestimento-parede') prod = 0.7;
      else if (tipo === 'pintura') prod = 0.4;

      lista.push({
        disciplina: 'Arquitetônico',
        servico: this.formatarNomeServico(tipo),
        unidade: 'm²',
        qtdCalculada: areaLiquida,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: prod,
        duracaoHoras: comPerda * prod
      });
    });

    if (totalEncunhamento > 0) {
      lista.push({
        disciplina: 'Arquitetônico',
        servico: 'Encunhamento e aperto de alvenaria em topo de viga',
        unidade: 'm',
        qtdCalculada: totalEncunhamento,
        margemPerda: 0,
        qtdComPerda: totalEncunhamento,
        produtividade: 0.25,
        duracaoHoras: totalEncunhamento * 0.25
      });
    }

    // 12. Esquadrias agrupadas
    const esqItens = this.esquadrias();
    const gruposEsq = new Map<string, { un: number; area: number }>();
    esqItens.forEach(item => {
      const cur = gruposEsq.get(item.tipo) || { un: 0, area: 0 };
      gruposEsq.set(item.tipo, { un: cur.un + item.qtd, area: cur.area + item.area });
    });

    gruposEsq.forEach((val, tipo) => {
      lista.push({
        disciplina: 'Esquadrias',
        servico: this.formatarNomeEsquadria(tipo) + ` (${val.area.toFixed(1)} m²)`,
        unidade: 'un',
        qtdCalculada: val.un,
        margemPerda: margens.esquadrias,
        qtdComPerda: val.un,
        produtividade: 1.6,
        duracaoHoras: val.un * 1.6
      });
    });

    // 13. Cobertura agrupada
    this.cobertura().forEach(item => {
      const perda = margens.cobertura;
      const comPerda = item.total * (1 + perda / 100);
      lista.push({
        disciplina: 'Cobertura',
        servico: this.formatarNomeCobertura(item.tipo),
        unidade: item.unidade,
        qtdCalculada: item.total,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.6,
        duracaoHoras: comPerda * 0.6
      });
    });

    // 14. Pergolados
    this.pergolados().forEach(item => {
      const perda = margens.paisagismo;
      const comPerda = item.total * (1 + perda / 100);
      lista.push({
        disciplina: 'Paisagismo',
        servico: this.formatarNomePergolado(item.tipo),
        unidade: item.unidade,
        qtdCalculada: item.total,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.0,
        duracaoHoras: comPerda * 1.0
      });
    });

    // 15. Instalações
    this.instalacoes().forEach(item => {
      const perda = margens.instalacoes;
      const comPerda = item.qtd * (1 + perda / 100);
      lista.push({
        disciplina: 'Instalações',
        servico: `[${item.disciplina.toUpperCase()}] ${item.item}`,
        unidade: item.unidade,
        qtdCalculada: item.qtd,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.5,
        duracaoHoras: comPerda * 0.5
      });
    });

    // 16. Paisagismo
    this.paisagismo().forEach(item => {
      const perda = margens.paisagismo;
      const comPerda = item.qtd * (1 + perda / 100);
      lista.push({
        disciplina: 'Paisagismo',
        servico: item.item,
        unidade: item.unidade,
        qtdCalculada: item.qtd,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.3,
        duracaoHoras: comPerda * 0.3
      });
    });

    return lista;
  });

  // ==================== REGRAS DE AUTOAUDITORIA ====================
  readonly regrasAuditoria = computed<RegraAuditoria[]>(() => {
    const regras: RegraAuditoria[] = [];

    const f = this.fundacoes();
    const e = this.estrutura();
    const a = this.arquitetonico();
    const q = this.esquadrias();
    const c = this.cobertura();
    const i = this.instalacoes();
    const cfg = this.parametros();

    // Regra 1: Alvenaria vs. Desconto de Vãos
    const temAlvenaria = a.some(item => item.tipo.startsWith('alvenaria'));
    const totalDesconto = a.reduce((acc, item) => acc + item.desconto, 0);
    const totalEsqArea = q.reduce((acc, item) => acc + item.area, 0);

    if (temAlvenaria && totalEsqArea > 0 && totalDesconto === 0) {
      regras.push({
        id: 'r1',
        titulo: 'Desconto de Vãos em Alvenaria',
        status: 'alerta',
        mensagem: `Existem ${totalEsqArea.toFixed(1)} m² de esquadrias lançadas, mas o desconto de vãos na alvenaria está zerado. Verifique se os vãos de portas e janelas devem ser descontados da área bruta.`
      });
    } else if (temAlvenaria) {
      regras.push({
        id: 'r1',
        titulo: 'Desconto de Vãos em Alvenaria',
        status: 'ok',
        mensagem: 'Descontos de vãos devidamente considerados nas alvenarias lançadas.'
      });
    }

    // Regra 2: Alvenaria vs. Revestimento / Pintura
    const temRevestimento = a.some(item => item.tipo === 'revestimento-parede' || item.tipo === 'pintura');
    if (temAlvenaria && !temRevestimento) {
      regras.push({
        id: 'r2',
        titulo: 'Revestimento e Pintura de Paredes',
        status: 'alerta',
        mensagem: 'Alvenarias foram cadastradas, mas ainda não foram identificados serviços de revestimento de parede (emboço/reboco) ou pintura.'
      });
    } else if (temAlvenaria && temRevestimento) {
      regras.push({
        id: 'r2',
        titulo: 'Revestimento e Pintura de Paredes',
        status: 'ok',
        mensagem: 'Alvenaria acompanhada de serviços de revestimento e acabamento.'
      });
    }

    // Regra 3: Fundações vs. Profundidade de Escavação
    const temFundacaoSemProf = f.some(item => item.profundidade <= 0);
    if (f.length > 0 && temFundacaoSemProf) {
      regras.push({
        id: 'r3',
        titulo: 'Profundidade de Escavação em Fundações',
        status: 'alerta',
        mensagem: 'Existem elementos de fundação sem profundidade de escavação informada. O volume de escavação e reaterro pode estar subdimensionado.'
      });
    } else if (f.length > 0) {
      regras.push({
        id: 'r3',
        titulo: 'Escavação e Movimentação de Terra',
        status: 'ok',
        mensagem: `Volume escavado de ${this.totalEscavacaoGeral().toFixed(1)} m³ calculado com sucesso para todas as fundações.`
      });
    }

    // Regra 4: Estrutura vs. Forma e Cimbramento
    const temLajesOuVigas = e.some(item => item.tipo === 'viga' || item.tipo === 'laje');
    const totalCimbramento = e.reduce((acc, item) => acc + item.cimbramento, 0);
    if (temLajesOuVigas && totalCimbramento === 0) {
      regras.push({
        id: 'r4',
        titulo: 'Cimbramento e Escoramento de Vigas/Lajes',
        status: 'alerta',
        mensagem: 'Vigas ou lajes lançadas sem cimbramento computado. Verifique as alturas e escoramentos de laje.'
      });
    } else if (temLajesOuVigas) {
      regras.push({
        id: 'r4',
        titulo: 'Cimbramento de Estruturas',
        status: 'ok',
        mensagem: `Cimbramento de ${totalCimbramento.toFixed(1)} m³ devidamente dimensionado para as vigas e lajes.`
      });
    }

    // Regra 5: Cobertura vs. Calhas e Drenagem Pluvial
    const temTelhado = c.some(item => item.tipo.startsWith('telha') || item.tipo.startsWith('estrutura'));
    const temCalha = c.some(item => item.tipo === 'calha');
    if (temTelhado && !temCalha) {
      regras.push({
        id: 'r5',
        titulo: 'Drenagem Pluvial de Cobertura (Calhas e Rufos)',
        status: 'alerta',
        mensagem: 'Cobertura cadastrada sem calhas ou condutores pluviais. Verifique se o projeto prevê calhas, rufos ou beirais livres.'
      });
    } else if (temTelhado && temCalha) {
      regras.push({
        id: 'r5',
        titulo: 'Drenagem de Cobertura',
        status: 'ok',
        mensagem: 'Estrutura de cobertura e sistema de calhas/rufos lançados.'
      });
    }

    // Regra 6: Instalações vs. Peças e Metais Sanitários
    const temTuboHidro = i.some(item => item.disciplina === 'hidrossanitario');
    const temPecasSanitarias = i.some(item => item.disciplina === 'pecas-sanitarias');
    if (temTuboHidro && !temPecasSanitarias) {
      regras.push({
        id: 'r6',
        titulo: 'Louças e Metais Sanitários',
        status: 'alerta',
        mensagem: 'Tubulações hidrossanitárias foram lançadas, mas nenhuma louça ou metal sanitário (bacias, lavatórios, registros) foi cadastrado.'
      });
    } else if (temTuboHidro && temPecasSanitarias) {
      regras.push({
        id: 'r6',
        titulo: 'Equipamentos Hidrossanitários',
        status: 'ok',
        mensagem: 'Tubulações e aparelhos hidrossanitários devidamente contemplados.'
      });
    }

    // Regra 7: Reaproveitamento de Solo vs. Bota-fora
    if (cfg.reaproveitamentoSolo > 85 || cfg.reaproveitamentoSolo < 40) {
      regras.push({
        id: 'r7',
        titulo: 'Percentual de Reaproveitamento de Solo',
        status: 'alerta',
        mensagem: `O reaproveitamento de solo está configurado em ${cfg.reaproveitamentoSolo}%. Valores muito fora da faixa de 60% a 80% requerem conferência com o laudo de sondagem.`
      });
    } else {
      regras.push({
        id: 'r7',
        titulo: 'Reaproveitamento de Solo',
        status: 'ok',
        mensagem: `Reaproveitamento de solo dentro da faixa técnica usual (${cfg.reaproveitamentoSolo}%).`
      });
    }

    return regras;
  });

  // ==================== MÉTODOS DE ATUALIZAÇÃO DE PARÂMETROS ====================
  atualizarParametro(chave: keyof ParametrosCalculo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value) || 0;
    this.parametros.update(p => ({ ...p, [chave]: val }));
  }

  atualizarMargemPerda(chave: keyof MargensPerda, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value) || 0;
    this.margensPerda.update(m => ({ ...m, [chave]: val }));
  }

  // ==================== SESSÃO JSON E EXPORTAÇÃO CSV ====================
  salvarSessaoJson(): void {
    const estado = {
      versao: '1.0',
      dataExportacao: new Date().toISOString(),
      parametros: this.parametros(),
      margensPerda: this.margensPerda(),
      fundacoes: this.fundacoes(),
      estrutura: this.estrutura(),
      arquitetonico: this.arquitetonico(),
      esquadrias: this.esquadrias(),
      cobertura: this.cobertura(),
      pergolados: this.pergolados(),
      instalacoes: this.instalacoes(),
      paisagismo: this.paisagismo()
    };

    const jsonStr = JSON.stringify(estado, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `levantamento_quantitativos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.exibirNotificacao('Sessão salva com sucesso! Arquivo .json baixado.');
  }

  carregarSessaoJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dados = JSON.parse(conteudo);

        if (dados.parametros) this.parametros.set(dados.parametros);
        if (dados.margensPerda) this.margensPerda.set(dados.margensPerda);
        if (dados.fundacoes) this.fundacoes.set(dados.fundacoes);
        if (dados.estrutura) this.estrutura.set(dados.estrutura);
        if (dados.arquitetonico) this.arquitetonico.set(dados.arquitetonico);
        if (dados.esquadrias) this.esquadrias.set(dados.esquadrias);
        if (dados.cobertura) this.cobertura.set(dados.cobertura);
        if (dados.pergolados) this.pergolados.set(dados.pergolados);
        if (dados.instalacoes) this.instalacoes.set(dados.instalacoes);
        if (dados.paisagismo) this.paisagismo.set(dados.paisagismo);

        this.exibirNotificacao('Sessão carregada com sucesso a partir do arquivo JSON!');
      } catch (err) {
        this.exibirNotificacao('Erro ao ler o arquivo JSON. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(arquivo);
    input.value = '';
  }

  exportarCsv(): void {
    const consolidado = this.resumoConsolidado();
    if (consolidado.length === 0) {
      this.exibirNotificacao('Não há itens cadastrados para exportar no resumo.');
      return;
    }

    let csvContent = '\uFEFFDisciplina;Serviço / Insumo;Unidade;Qtd. Calculada;Margem Perda (%);Qtd. com Perda;Produtividade (h/un);Duração Estimada (h)\n';

    consolidado.forEach(item => {
      const linha = [
        `"${item.disciplina}"`,
        `"${item.servico.replace(/"/g, '""')}"`,
        `"${item.unidade}"`,
        item.qtdCalculada.toFixed(2).replace('.', ','),
        item.margemPerda.toString(),
        item.qtdComPerda.toFixed(2).replace('.', ','),
        item.produtividade.toFixed(2).replace('.', ','),
        item.duracaoHoras.toFixed(1).replace('.', ',')
      ].join(';');
      csvContent += linha + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo_quantitativos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.exibirNotificacao('Planilha CSV exportada com sucesso!');
  }

  exibirNotificacao(texto: string): void {
    this.mensagemNotificacao.set(texto);
    setTimeout(() => {
      if (this.mensagemNotificacao() === texto) {
        this.mensagemNotificacao.set(null);
      }
    }, 5000);
  }

  // Formatadores visuais de rótulos
  formatarNomeTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      'sapata-isolada': 'Sapata Isolada',
      'sapata-corrida': 'Sapata Corrida',
      'baldrame': 'Viga Baldrame',
      'bloco': 'Bloco de Fundação',
      'pilar': 'Pilar',
      'viga': 'Viga de Concreto',
      'laje': 'Laje Maciça/Nervurada'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomeServico(tipo: string): string {
    const mapa: Record<string, string> = {
      'alvenaria-ceramica': 'Alvenaria de vedação em bloco cerâmico',
      'alvenaria-bloco': 'Alvenaria estrutural em bloco de concreto',
      'revestimento-parede': 'Revestimento de parede (emboço/reboco)',
      'piso-ceramico': 'Piso cerâmico / porcelanato retificado',
      'pintura': 'Pintura látex acrílica em paredes'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomeEsquadria(tipo: string): string {
    const mapa: Record<string, string> = {
      'porta-lisa': 'Porta lisa de madeira semi-oca',
      'porta-veneziana': 'Porta veneziana de alumínio',
      'janela-correr': 'Janela de correr em alumínio e vidro',
      'janela-basculante': 'Janela basculante / maxim-ar',
      'portao': 'Portão metálico de acesso',
      'guarda-corpo': 'Guarda-corpo / gradil de proteção'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomeCobertura(tipo: string): string {
    const mapa: Record<string, string> = {
      'telha-ceramica': 'Telhamento cerâmico / termoacústico',
      'estrutura-metalica': 'Estrutura metálica de cobertura (perfis)',
      'estrutura-madeira': 'Estrutura de madeira aparelhada (tesouras)',
      'calha': 'Calha e rufo em chapa galvanizada'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomePergolado(tipo: string): string {
    const mapa: Record<string, string> = {
      'pergolado-madeira': 'Pergolado em madeira tratada/aparelhada',
      'pergolado-metalico': 'Pergolado metálico em perfis tubulares',
      'trelica': 'Treliça / brise de sombreamento'
    };
    return mapa[tipo] || tipo;
  }
}
