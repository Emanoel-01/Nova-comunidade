import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  coeficientesDB,
  etapasDB,
  custosDB,
  CoeficienteItem,
  EtapaCustoItem
} from './custos-viabilidade.data';

export interface AreaInput {
  nome: string;
  coef: number;
  area: number;
  qty: number;
}

export type AbaViabilidade =
  | 'premissas'
  | 'terreno-custos'
  | 'comercial-tributos'
  | 'kpis'
  | 'sensibilidade'
  | 'fluxo-caixa'
  | 'benchmarking'
  | 'engenharia-valor';

export interface MonthFlowItem {
  mes: number;
  receita: number;
  custoObra: number;
  custoTerreno: number;
  custoProjetos: number;
  custoComercialImpostos: number;
  custoFinanciamento: number;
  totalSaidas: number;
  fluxoLiquido: number;
  saldoAcumulado: number;
  percentualObraMes: number;
  percentualObraAcum: number;
}

@Component({
  selector: 'app-custos-viabilidade',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- 1. Cabeçalho Principal do Agente -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/5 rounded-full pointer-events-none blur-2xl"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center font-bold text-sm shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-xs font-black uppercase tracking-wider text-amber-800">Engenharia de Custos & Viabilidade Imobiliária</span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Análise de Viabilidade Imobiliária (NBR 12.721)
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Modelagem econômica e orçamentação paramétrica com base no CUB Sinduscon, áreas equivalentes NBR 12.721, VGV, custos extracontratuais, matriz de sensibilidade, fluxo de caixa e TIR/VPL.
            </p>
          </div>

          <!-- Ações Rápidas & Relatório -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <!-- Seletor de Cenário -->
            <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                (click)="cenarioAtivo.set('pessimistic')"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                [class]="cenarioAtivo() === 'pessimistic' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Pessimista
              </button>
              <button
                type="button"
                (click)="cenarioAtivo.set('realistic')"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                [class]="cenarioAtivo() === 'realistic' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Realista
              </button>
              <button
                type="button"
                (click)="cenarioAtivo.set('optimistic')"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                [class]="cenarioAtivo() === 'optimistic' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              >
                Otimista
              </button>
            </div>

            <!-- Botão Emitir Relatório -->
            <button
              type="button"
              (click)="modalRelatorioAberto.set(true)"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Relatório Executivo</span>
            </button>
          </div>
        </div>

        <!-- Banner de KPIs Rápidos Resumidos -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">VGV Estimado</span>
            <div class="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">
              {{ kpis().scenarioVgvTotal | currency:'BRL':'symbol':'1.0-0' }}
            </div>
            <div class="text-[11px] text-slate-500">Área Privativa: {{ areaVendavel() }} m²</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Custo Total Global</span>
            <div class="text-base sm:text-lg font-black text-rose-700 mt-0.5 truncate">
              {{ kpis().scenarioCustoTotalEmpreendimento | currency:'BRL':'symbol':'1.0-0' }}
            </div>
            <div class="text-[11px] text-slate-500">Obra + Terreno + Taxas</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Lucro Líquido Real</span>
            <div class="text-base sm:text-lg font-black text-emerald-900 mt-0.5 truncate">
              {{ kpis().scenarioLucroLiquido | currency:'BRL':'symbol':'1.0-0' }}
            </div>
            <div class="text-[11px] font-bold text-emerald-700">Margem: {{ (kpis().scenarioMargemLiquida * 100).toFixed(1) }}%</div>
          </div>

          <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/60">
            <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Retorno Financeiro</span>
            <div class="text-base sm:text-lg font-black text-indigo-950 mt-0.5 truncate">
              TIR: {{ (financialMetrics().tir * 100).toFixed(1) }}% a.a.
            </div>
            <div class="text-[11px] text-indigo-700">VPL: {{ financialMetrics().vpl | currency:'BRL':'symbol':'1.0-0' }}</div>
          </div>
        </div>
      </div>

      <!-- 2. Navegação por Abas do Estudo -->
      <div class="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl overflow-x-auto shadow-inner">
        <button
          type="button"
          (click)="abaAtiva.set('premissas')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'premissas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📐</span>
          <span>1. NBR 12.721 & CUB</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('terreno-custos')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'terreno-custos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>🏗️</span>
          <span>2. Terreno & Extracontratuais</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('comercial-tributos')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'comercial-tributos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📊</span>
          <span>3. Comercial & Tributos</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('kpis')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'kpis' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>🎯</span>
          <span>4. Demonstração de Resultados</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('sensibilidade')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'sensibilidade' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>🎲</span>
          <span>5. Matriz de Sensibilidade</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('fluxo-caixa')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'fluxo-caixa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📈</span>
          <span>6. Curva S & Fluxo de Caixa</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('benchmarking')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'benchmarking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>🗺️</span>
          <span>7. CUB Nacional</span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('engenharia-valor')"
          class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          [class]="abaAtiva() === 'engenharia-valor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>💡</span>
          <span>8. Engenharia de Valor & IA</span>
        </button>
      </div>

      <!-- ========================================================= -->
      <!-- ABA 1: PREMISSAS, NBR 12.721 & CUB                        -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'premissas') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          <!-- Coluna 1 & 2: Localização, CUB e Tabela de Áreas NBR 12.721 -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Bloco 1: Seleção de Estado e Índice CUB -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <span>1.1 Localização & Parâmetro CUB Sinduscon</span>
                </h4>
                <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  Ref: {{ params().refMes }} / {{ params().refAno }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <!-- Estado -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Estado (UF)</label>
                  <select
                    [value]="estado()"
                    (change)="estado.set($any($event.target).value)"
                    class="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                  >
                    @for (uf of states(); track uf) {
                      <option [value]="uf">{{ uf }}</option>
                    }
                  </select>
                </div>

                <!-- Índice / Tipologia -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Tipologia NBR 12.721</label>
                  <select
                    [value]="indice()"
                    (change)="indice.set($any($event.target).value)"
                    class="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                  >
                    @for (grp of groupedAvailableIndices(); track grp.name) {
                      <optgroup [label]="grp.name">
                        @for (item of grp.items; track item.value) {
                          <option [value]="item.value">{{ item.value }}</option>
                        }
                      </optgroup>
                    }
                  </select>
                </div>

                <!-- BDI de Obra -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">BDI Adicional (%)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.5"
                      [value]="bdi()"
                      (input)="bdi.set(parseNumber($event))"
                      class="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs pr-8"
                    />
                    <span class="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <!-- Destaque do Custo CUB Base -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div class="font-bold text-slate-900">
                    {{ params().tipo }} — {{ params().padrao }} ({{ params().indice }})
                  </div>
                  <div class="text-slate-500 text-[11px]">
                    Custo Unitário Básico Sinduscon/{{ estado() }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-black text-indigo-900">
                    {{ params().custoBaseM2 | currency:'BRL':'symbol':'1.2-2' }}/m²
                  </div>
                  <div class="text-[11px] text-slate-500 font-medium">
                    c/ BDI ({{ bdi() }}%): {{ (params().custoBaseM2 * (1 + bdi() / 100)) | currency:'BRL':'symbol':'1.2-2' }}/m²
                  </div>
                </div>
              </div>
            </div>

            <!-- Bloco 2: Tabela de Áreas Reais & Equivalentes NBR 12.721 -->
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>1.2 Quadro de Áreas e Coeficientes de Equivalência</span>
                  </h4>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Preencha as áreas brutas para cálculo da Área Equivalente de Construção.
                  </p>
                </div>

                <button
                  type="button"
                  (click)="zerarAreas()"
                  class="text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  Limpar Áreas
                </button>
              </div>

              <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-xs text-left">
                  <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th class="p-3">Pavimento / Ambiente</th>
                      <th class="p-3 text-center">Coef. NBR</th>
                      <th class="p-3 text-center">Área Unitária (m²)</th>
                      <th class="p-3 text-center">Qtd / Repetições</th>
                      <th class="p-3 text-right">Área Bruta (m²)</th>
                      <th class="p-3 text-right">Área Equivalente (m²)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    @for (area of areas(); track area.nome; let idx = $index) {
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="p-3 font-semibold text-slate-900">{{ area.nome }}</td>
                        <td class="p-3 text-center font-mono text-slate-600">{{ area.coef.toFixed(2) }}</td>
                        <td class="p-3 text-center w-36">
                          <input
                            type="number"
                            step="0.1"
                            [value]="area.area"
                            (input)="updateAreaItem(idx, 'area', $event)"
                            class="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            placeholder="0.00"
                          />
                        </td>
                        <td class="p-3 text-center w-28">
                          @if (area.nome === 'TIPO') {
                            <input
                              type="number"
                              min="1"
                              step="1"
                              [value]="area.qty"
                              (input)="updateAreaItem(idx, 'qty', $event)"
                              class="w-full text-center px-2 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50/50 font-mono text-xs font-bold text-indigo-900 focus:border-indigo-500 shadow-2xs"
                            />
                          } @else {
                            <span class="text-slate-400 font-mono">1</span>
                          }
                        </td>
                        <td class="p-3 text-right font-mono text-slate-800">
                          {{ (area.area * (area.nome === 'TIPO' ? area.qty : 1)).toFixed(2) }} m²
                        </td>
                        <td class="p-3 text-right font-mono font-bold text-indigo-900">
                          {{ (area.area * area.coef * (area.nome === 'TIPO' ? area.qty : 1)).toFixed(2) }} m²
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td colspan="4" class="p-3.5 text-right uppercase tracking-wider text-xs">Totais Globais NBR 12.721:</td>
                      <td class="p-3.5 text-right font-mono text-sm text-slate-900">
                        {{ areaTotals().totalAreaBruta.toFixed(2) }} m²
                      </td>
                      <td class="p-3.5 text-right font-mono text-sm text-indigo-900 font-black">
                        {{ areaTotals().totalAreaEquivalente.toFixed(2) }} m²
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Coluna 3: Receitas, Preço de Venda & VGV Estimado -->
          <div class="space-y-6">
            
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>1.3 Receitas & VGV do Projeto</span>
              </h4>

              <div class="space-y-4 text-xs">
                <!-- Nome do Empreendimento -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Nome do Empreendimento</label>
                  <input
                    type="text"
                    [value]="nomeProjeto()"
                    (input)="nomeProjeto.set($any($event.target).value)"
                    placeholder="Ex: Residencial Horizonte Jardins"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                  />
                </div>

                <!-- Área Vendável Privativa -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Área Vendável Privativa Total (m²)</label>
                  <input
                    type="number"
                    step="1"
                    [value]="areaVendavel()"
                    (input)="areaVendavel.set(parseNumber($event))"
                    placeholder="Ex: 3200"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                  />
                  <span class="text-[11px] text-slate-400 mt-1 block">Somatório das áreas privativas dos apartamentos/salas</span>
                </div>

                <!-- Preço Médio de Venda -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Preço Médio de Venda (R$/m² privativo)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="100"
                      [value]="precoM2()"
                      (input)="precoM2.set(parseNumber($event))"
                      placeholder="Ex: 8500"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs pl-10"
                    />
                    <span class="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
                  </div>
                </div>

                <!-- Receitas Extras -->
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Receitas Adicionais (Vagas extras, Depósitos)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="1000"
                      [value]="receitasExtras()"
                      (input)="receitasExtras.set(parseNumber($event))"
                      placeholder="0.00"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs pl-10"
                    />
                    <span class="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
                  </div>
                </div>

                <!-- Card de VGV Total Calculado -->
                <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 mt-2">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Valor Geral de Vendas (VGV) Total
                  </div>
                  <div class="text-xl font-black text-emerald-950">
                    {{ baseVgvTotal() | currency:'BRL':'symbol':'1.0-0' }}
                  </div>
                  <div class="text-[11px] text-emerald-800">
                    Custo CUB Base: {{ costCalculations().baseCustoTotalComBDI | currency:'BRL':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Dicas de Eficiência NBR 12.721 -->
            <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 space-y-2">
              <div class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Índice de Eficiência de Projeto</span>
              </div>
              <p class="text-[11px] leading-relaxed text-indigo-800">
                A relação entre <strong>Área Privativa</strong> e <strong>Área Equivalente</strong> indica a eficiência do empreendimento. Quanto maior a proporção privativa em relação à área equivalente, maior a margem de lucro operacional.
              </p>
            </div>

          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 2: TERRENO & CUSTOS EXTRACONTRATUAIS                  -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'terreno-custos') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          <!-- Terreno & Modalidade de Aquisição -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>2.1 Modalidade de Aquisição do Terreno</span>
            </h4>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">Tipo de Aquisição do Terreno</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="tipoTerreno.set('compra')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="tipoTerreno() === 'compra' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    Compra Direta (R$)
                  </button>
                  <button
                    type="button"
                    (click)="tipoTerreno.set('permuta_financeira')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="tipoTerreno() === 'permuta_financeira' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    Permuta Financeira (%)
                  </button>
                  <button
                    type="button"
                    (click)="tipoTerreno.set('permuta_fisica')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="tipoTerreno() === 'permuta_fisica' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    Permuta Física (%)
                  </button>
                </div>
              </div>

              <!-- Inputs condicionais conforme modalidade -->
              @if (tipoTerreno() === 'compra') {
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Valor de Compra do Terreno (R$)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="10000"
                      [value]="custoTerreno()"
                      (input)="custoTerreno.set(parseNumber($event))"
                      placeholder="0.00"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pl-10 shadow-2xs"
                    />
                    <span class="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
                  </div>
                </div>
              } @else if (tipoTerreno() === 'permuta_financeira') {
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Percentual de Permuta Financeira sobre VGV (%)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.5"
                      [value]="permutaFinanceiraPerc()"
                      (input)="permutaFinanceiraPerc.set(parseNumber($event))"
                      placeholder="Ex: 12"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                    />
                    <span class="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              } @else {
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Percentual de Permuta Física em Unidades (%)</label>
                  <div class="relative">
                    <input
                      type="number"
                      step="0.5"
                      [value]="permutaFisicaPerc()"
                      (input)="permutaFisicaPerc.set(parseNumber($event))"
                      placeholder="Ex: 15"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                    />
                    <span class="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              }

              <!-- Resumo do Terreno -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div class="text-slate-500 font-medium">Impacto do Terreno no Empreendimento:</div>
                <div class="text-base font-black text-slate-900">
                  {{ kpis().scenarioCustoTerreno | currency:'BRL':'symbol':'1.0-0' }}
                </div>
                <div class="text-[11px] text-slate-500">
                  Representa {{ baseVgvTotal() > 0 ? ((kpis().scenarioCustoTerreno / baseVgvTotal()) * 100).toFixed(1) : 0 }}% do VGV Total
                </div>
              </div>
            </div>
          </div>

          <!-- Custos Extracontratuais (Fora do CUB NBR 12.721) -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>2.2 Custos Extracontratuais (Fora da NBR 12.721)</span>
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">
                Itens que não estão incluídos no CUB padrão do Sinduscon.
              </p>
            </div>

            <div class="space-y-3.5 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Fundações Especiais / Contenções / Estacas (R$)</label>
                <input
                  type="number"
                  step="5000"
                  [value]="custoFundacoesEspeciais()"
                  (input)="custoFundacoesEspeciais.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Elevadores & Equipamentos Especiais (R$)</label>
                <input
                  type="number"
                  step="5000"
                  [value]="custoElevadores()"
                  (input)="custoElevadores.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Instalações Especiais (Gerador, Ar Condicionado Central, Pressurização) (R$)</label>
                <input
                  type="number"
                  step="5000"
                  [value]="custoInstalacoesEspeciais()"
                  (input)="custoInstalacoesEspeciais.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Lazer, Decoração & Mobiliário de Áreas Comuns (R$)</label>
                <input
                  type="number"
                  step="5000"
                  [value]="custoLazerDecoracao()"
                  (input)="custoLazerDecoracao.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Paisagismo & Urbanização Externa (R$)</label>
                <input
                  type="number"
                  step="5000"
                  [value]="custoPaisagismoUrbanizacao()"
                  (input)="custoPaisagismoUrbanizacao.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <!-- Total Extracontratuais -->
              <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <span class="font-bold text-rose-900 text-xs">Total Extracontratuais:</span>
                <span class="font-black text-rose-950 text-sm font-mono">
                  {{ totalCustosExtracontratuais() | currency:'BRL':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>
          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 3: COMERCIAL & TRIBUTOS                               -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'comercial-tributos') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          <!-- Regime Tributário -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>3.1 Regime Tributário da Incorporação</span>
            </h4>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">Escolha o Regime Fiscal</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="regimeTributario.set('ret')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="regimeTributario() === 'ret' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    RET (4,0%)
                  </button>
                  <button
                    type="button"
                    (click)="regimeTributario.set('lucro_presumido')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="regimeTributario() === 'lucro_presumido' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    Lucro Presumido (5,93%)
                  </button>
                  <button
                    type="button"
                    (click)="regimeTributario.set('isento')"
                    class="py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer"
                    [class]="regimeTributario() === 'isento' ? 'bg-[#132A41] text-white border-[#132A41] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                  >
                    Isento (0%)
                  </button>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                <div class="font-bold text-indigo-950">
                  Alíquota Aplicada sobre Receita Bruta (VGV): {{ aliquotaImposto() }}%
                </div>
                <div class="text-lg font-black text-indigo-950">
                  {{ kpis().scenarioImpostos | currency:'BRL':'symbol':'1.0-0' }}
                </div>
                <p class="text-[11px] text-indigo-800 leading-relaxed">
                  O <strong>Regime Especial de Tributação (RET)</strong> unifica IRPJ, CSLL, PIS e COFINS com alíquota única de 4%, sendo o padrão mais recomendado para SPEs imobiliárias.
                </p>
              </div>
            </div>
          </div>

          <!-- Despesas Comerciais e de Incorporação -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>3.2 Despesas de Incorporação & Comerciais</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Projetos & Licenciamento (% s/ Obra)</label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.5"
                    [value]="custoProjetos()"
                    (input)="custoProjetos.set(parseNumber($event))"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Comissão de Corretagem (% s/ VGV)</label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.5"
                    [value]="custoCorretagem()"
                    (input)="custoCorretagem.set(parseNumber($event))"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Marketing & Propaganda (% s/ VGV)</label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.5"
                    [value]="custoMarketing()"
                    (input)="custoMarketing.set(parseNumber($event))"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Despesas Legais / Cartório (% s/ VGV)</label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.5"
                    [value]="custoDespesasLegais()"
                    (input)="custoDespesasLegais.set(parseNumber($event))"
                    class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Custos Financeiros / Juros de Financiamento (R$)</label>
                <input
                  type="number"
                  step="10000"
                  [value]="custoFinanciamento()"
                  (input)="custoFinanciamento.set(parseNumber($event))"
                  placeholder="0.00"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>
            </div>

            <!-- Total Despesas Comerciais -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700">Total Comercial + Projetos:</span>
              <span class="font-black text-slate-900 text-sm font-mono">
                {{ (kpis().totalCustosComerciais + kpis().custoProjetosValor) | currency:'BRL':'symbol':'1.0-0' }}
              </span>
            </div>
          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 4: DEMONSTRAÇÃO DE RESULTADOS (KPIS)                  -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'kpis') {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- DRE do Empreendimento Imobiliário -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 class="text-lg font-black text-slate-900">
                  Demonstração do Resultado do Exercício (DRE Imobiliário)
                </h4>
                <p class="text-xs text-slate-500">
                  Cenário selecionado: <strong class="text-indigo-900 uppercase">{{ currentScenarioMultipliers().name }}</strong>
                </p>
              </div>

              <div class="text-right">
                <span class="text-xs font-bold text-slate-500">Margem Líquida Real</span>
                <div class="text-2xl font-black text-emerald-800">
                  {{ (kpis().scenarioMargemLiquida * 100).toFixed(2) }}%
                </div>
              </div>
            </div>

            <div class="overflow-x-auto border border-slate-200 rounded-2xl">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-3.5">Rubrica / Conta</th>
                    <th class="p-3.5 text-right">Valor Total (R$)</th>
                    <th class="p-3.5 text-right">% s/ VGV</th>
                    <th class="p-3.5 text-right">R$/m² Privativo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <!-- Receita Bruta / VGV -->
                  <tr class="bg-emerald-50/50 font-bold text-emerald-950">
                    <td class="p-3.5">(+) VALOR GERAL DE VENDAS (VGV)</td>
                    <td class="p-3.5 text-right font-mono">{{ kpis().scenarioVgvTotal | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">100,0%</td>
                    <td class="p-3.5 text-right font-mono">{{ (areaVendavel() > 0 ? kpis().scenarioVgvTotal / areaVendavel() : 0) | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>

                  <!-- Custo CUB da Obra -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Custo Base de Construção (CUB NBR 12.721 c/ BDI)</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().scenarioCustoCUB | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoCUB) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioCustoCUB) }}</td>
                  </tr>

                  <!-- Custos Extracontratuais -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Custos Extracontratuais (Fundações, Elevadores, Lazer, etc.)</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().scenarioCustosExtracontratuais | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioCustosExtracontratuais) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioCustosExtracontratuais) }}</td>
                  </tr>

                  <!-- Total de Obra -->
                  <tr class="bg-slate-50/70 font-semibold text-slate-900">
                    <td class="p-3.5">(=) CUSTO TOTAL DIRETO DE OBRA</td>
                    <td class="p-3.5 text-right font-mono text-rose-800 font-bold">{{ kpis().scenarioCustoObra | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoObra) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioCustoObra) }}</td>
                  </tr>

                  <!-- Terreno -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Terreno / Permuta</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().scenarioCustoTerreno | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoTerreno) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioCustoTerreno) }}</td>
                  </tr>

                  <!-- Projetos -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Projetos, Sondagens e Licenciamento</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().custoProjetosValor | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().custoProjetosValor) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().custoProjetosValor) }}</td>
                  </tr>

                  <!-- Lucro Bruto -->
                  <tr class="bg-indigo-50/60 font-bold text-indigo-950">
                    <td class="p-3.5">(=) LUCRO BRUTO OPERACIONAL</td>
                    <td class="p-3.5 text-right font-mono">{{ kpis().scenarioLucroBruto | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ (kpis().scenarioMargemBruta * 100).toFixed(1) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioLucroBruto) }}</td>
                  </tr>

                  <!-- Despesas Comerciais -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Despesas Comerciais (Corretagem + Marketing + Legais)</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().totalCustosComerciais | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().totalCustosComerciais) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().totalCustosComerciais) }}</td>
                  </tr>

                  <!-- Tributos -->
                  <tr>
                    <td class="p-3.5 pl-6">(-) Tributos ({{ regimeTributario().toUpperCase() }})</td>
                    <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().scenarioImpostos | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioImpostos) }}%</td>
                    <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioImpostos) }}</td>
                  </tr>

                  <!-- Custo Financiamento -->
                  @if (kpis().scenarioCustoFinanciamento > 0) {
                    <tr>
                      <td class="p-3.5 pl-6">(-) Custos de Financiamento</td>
                      <td class="p-3.5 text-right font-mono text-rose-700">{{ kpis().scenarioCustoFinanciamento | currency:'BRL':'symbol':'1.0-0' }}</td>
                      <td class="p-3.5 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoFinanciamento) }}%</td>
                      <td class="p-3.5 text-right font-mono">{{ getValorM2(kpis().scenarioCustoFinanciamento) }}</td>
                    </tr>
                  }

                  <!-- LUCRO LÍQUIDO FINAL -->
                  <tr class="bg-emerald-100 font-black text-emerald-950 border-t-2 border-emerald-300">
                    <td class="p-4 text-sm">(=) LUCRO LÍQUIDO FINAL (RESULTADO REAL)</td>
                    <td class="p-4 text-right font-mono text-base">{{ kpis().scenarioLucroLiquido | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-4 text-right font-mono text-sm">{{ (kpis().scenarioMargemLiquida * 100).toFixed(2) }}%</td>
                    <td class="p-4 text-right font-mono text-sm">{{ kpis().lucroPorM2Privativo | currency:'BRL':'symbol':'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 5: MATRIZ DE SENSIBILIDADE                            -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'sensibilidade') {
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div>
            <h4 class="text-lg font-black text-slate-900">
              Matriz de Sensibilidade Bidirecional (Preço de Venda vs. Custo de Obra)
            </h4>
            <p class="text-xs text-slate-500 mt-1">
              Avaliação do impacto de oscilações de mercado na Margem Líquida e no Lucro do Empreendimento.
            </p>
          </div>

          @if (sensitivityMatrix(); as matrix) {
            <div class="overflow-x-auto border border-slate-200 rounded-2xl">
              <table class="w-full text-xs text-center border-collapse">
                <thead class="bg-slate-900 text-white font-bold">
                  <tr>
                    <th class="p-3 text-left border-r border-slate-700">Preço / Custo Obra</th>
                    @for (vc of matrix.variacoesCusto; track vc) {
                      <th class="p-3 border-r border-slate-700">
                        {{ vc > 0 ? '+' : '' }}{{ (vc * 100).toFixed(0) }}% Custo
                      </th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-800">
                  @for (row of matrix.rows; track row.varPreco) {
                    <tr>
                      <td class="p-3 text-left font-bold bg-slate-100 border-r border-slate-200 whitespace-nowrap">
                        <div class="text-slate-900">{{ row.precoM2 | currency:'BRL':'symbol':'1.0-0' }}/m²</div>
                        <div class="text-[11px] text-slate-500 font-normal">
                          ({{ row.varPreco > 0 ? '+' : '' }}{{ (row.varPreco * 100).toFixed(0) }}% no Preço)
                        </div>
                      </td>
                      @for (cell of row.cells; track cell.varCusto) {
                        <td
                          class="p-3 border-r border-slate-200 font-mono transition-colors"
                          [class]="getCellClass(cell.margemLiquida)"
                        >
                          <div class="font-black text-xs">
                            {{ (cell.margemLiquida * 100).toFixed(1) }}%
                          </div>
                          <div class="text-[11px] opacity-80">
                            {{ cell.lucroLiquido | currency:'BRL':'symbol':'1.0-0' }}
                          </div>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              Preencha os dados de Área Vendável, Preço por m² e Custos para gerar a Matriz de Sensibilidade.
            </div>
          }
        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 6: FLUXO DE CAIXA, CURVA S & TIR/VPL                  -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'fluxo-caixa') {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Configuração dos Prazos -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 class="text-base font-bold text-slate-900">
              6.1 Parâmetros Financeiros & Cronograma Físico
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Prazo de Construção (meses)</label>
                <input
                  type="number"
                  min="6"
                  max="60"
                  [value]="prazoConstrucaoMeses()"
                  (input)="prazoConstrucaoMeses.set(parseNumber($event))"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Prazo de Comercialização (meses)</label>
                <input
                  type="number"
                  min="6"
                  max="72"
                  [value]="prazoVendasMeses()"
                  (input)="prazoVendasMeses.set(parseNumber($event))"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Taxa Mínima de Atratividade - TMA (% a.a.)</label>
                <div class="relative">
                  <input
                    type="number"
                    step="0.5"
                    [value]="tmaAnual()"
                    (input)="tmaAnual.set(parseNumber($event))"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-semibold text-slate-800 pr-8 shadow-2xs"
                  />
                  <span class="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Indicadores de Retorno Financeiro -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Taxa Interna de Retorno (TIR)</span>
              <div class="text-2xl font-black text-indigo-900">
                {{ (financialMetrics().tir * 100).toFixed(1) }}% a.a.
              </div>
              <div class="text-xs text-slate-500">Rentabilidade anualizada do fluxo</div>
            </div>

            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Valor Presente Líquido (VPL)</span>
              <div class="text-2xl font-black text-emerald-800">
                {{ financialMetrics().vpl | currency:'BRL':'symbol':'1.0-0' }}
              </div>
              <div class="text-xs text-slate-500">Descontado a {{ tmaAnual() }}% a.a.</div>
            </div>

            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exposição Máxima de Caixa</span>
              <div class="text-2xl font-black text-rose-700">
                {{ financialMetrics().exposicaoMaxima | currency:'BRL':'symbol':'1.0-0' }}
              </div>
              <div class="text-xs text-slate-500">Pico de capital próprio necessário</div>
            </div>
          </div>

          <!-- Tabela de Fluxo de Caixa Mensal -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 class="text-base font-bold text-slate-900">
              6.2 Tabela de Desembolso e Curva S Mensal
            </h4>

            <div class="overflow-x-auto border border-slate-200 rounded-2xl max-h-96">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th class="p-3 text-center">Mês</th>
                    <th class="p-3 text-right">Entradas (R$)</th>
                    <th class="p-3 text-right">Custo Obra (R$)</th>
                    <th class="p-3 text-right">Terreno + Taxas (R$)</th>
                    <th class="p-3 text-right">Total Saídas (R$)</th>
                    <th class="p-3 text-right">Fluxo Líquido (R$)</th>
                    <th class="p-3 text-right">Saldo Acumulado (R$)</th>
                    <th class="p-3 text-center">Obra Acum. (%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700 font-mono">
                  @for (m of financialMetrics().meses; track m.mes) {
                    <tr class="hover:bg-slate-50">
                      <td class="p-2.5 text-center font-bold text-slate-900">Mês {{ m.mes }}</td>
                      <td class="p-2.5 text-right text-emerald-800">{{ m.receita | currency:'BRL':'symbol':'1.0-0' }}</td>
                      <td class="p-2.5 text-right text-rose-700">{{ m.custoObra | currency:'BRL':'symbol':'1.0-0' }}</td>
                      <td class="p-2.5 text-right text-slate-600">{{ (m.custoTerreno + m.custoProjetos + m.custoComercialImpostos) | currency:'BRL':'symbol':'1.0-0' }}</td>
                      <td class="p-2.5 text-right text-rose-900 font-semibold">{{ m.totalSaidas | currency:'BRL':'symbol':'1.0-0' }}</td>
                      <td class="p-2.5 text-right font-bold" [class]="m.fluxoLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                        {{ m.fluxoLiquido | currency:'BRL':'symbol':'1.0-0' }}
                      </td>
                      <td class="p-2.5 text-right font-bold" [class]="m.saldoAcumulado >= 0 ? 'text-emerald-800' : 'text-rose-800'">
                        {{ m.saldoAcumulado | currency:'BRL':'symbol':'1.0-0' }}
                      </td>
                      <td class="p-2.5 text-center font-sans text-[11px] text-indigo-900 font-semibold">
                        {{ m.percentualObraAcum.toFixed(1) }}%
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 7: BENCHMARKING DO CUB NACIONAL                       -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'benchmarking') {
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          <div>
            <h4 class="text-lg font-black text-slate-900">
              Benchmarking Nacional do CUB (Sinduscon Brasil)
            </h4>
            <p class="text-xs text-slate-500 mt-1">
              Comparativo de quanto custaria construir esta mesma tipologia ({{ params().tipo }} - {{ params().padrao }}) em outros estados.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (item of stateComparison(); track item.estado) {
              <div class="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-slate-900">{{ item.estado }}</span>
                  <span
                    class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    [class]="item.diferenca <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                  >
                    {{ item.diferenca <= 0 ? '' : '+' }}{{ (item.percentual * 100).toFixed(1) }}%
                  </span>
                </div>

                <div class="text-base font-black text-slate-900">
                  {{ item.costo | currency:'BRL':'symbol':'1.0-0' }}
                </div>

                <div class="text-[11px] text-slate-500">
                  Diferença: {{ item.diferenca | currency:'BRL':'symbol':'1.0-0' }} vs {{ estado() }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ========================================================= -->
      <!-- ABA 8: ENGENHARIA DE VALOR & IA                           -->
      <!-- ========================================================= -->
      @if (abaAtiva() === 'engenharia-valor') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          <!-- Lista de Etapas de Obra e Distribuição -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span>8.1 Distribuição de Custos por Etapa de Obra</span>
            </h4>

            <div class="overflow-x-auto border border-slate-200 rounded-2xl">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-3">Etapa Construtiva</th>
                    <th class="p-3 text-center">Peso (%)</th>
                    <th class="p-3 text-right">Custo Estimado (R$)</th>
                    <th class="p-3 text-right">R$/m² Eq.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (et of etapasObra(); track et.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-semibold text-slate-900">{{ et.nome }}</td>
                      <td class="p-3 text-center font-mono">{{ (et.perc * 100).toFixed(2) }}%</td>
                      <td class="p-3 text-right font-mono font-bold text-slate-900">
                        {{ (kpis().scenarioCustoCUB * et.perc) | currency:'BRL':'symbol':'1.0-0' }}
                      </td>
                      <td class="p-3 text-right font-mono text-slate-500">
                        {{ (areaTotals().totalAreaEquivalente > 0 ? (kpis().scenarioCustoCUB * et.perc) / areaTotals().totalAreaEquivalente : 0) | currency:'BRL':'symbol':'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sugestões de Engenharia de Valor -->
          <div class="space-y-6">
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>💡</span>
                <span>Oportunidades de Otimização</span>
              </h4>

              <p class="text-xs text-slate-600 leading-relaxed">
                As três etapas mais representativas neste padrão são <strong>Revestimentos (27%)</strong>, <strong>Superestrutura (14-19%)</strong> e <strong>Esquadrias (10-13%)</strong>.
              </p>

              <div class="space-y-3 text-xs">
                <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div class="font-bold text-amber-950">Superestrutura & Alvenaria</div>
                  <div class="text-[11px] text-amber-900 leading-relaxed">
                    Avalie lajes nervuradas com cubetas plásticas ou alvenaria de vedação com bloco cerâmico de precisão para reduzir espessura de reboco.
                  </div>
                </div>

                <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                  <div class="font-bold text-indigo-950">Revestimentos & Pisos</div>
                  <div class="text-[11px] text-indigo-900 leading-relaxed">
                    Padronize modulação de porcelanatos nos banheiros e cozinhas para limitar perda por corte a menos de 5%.
                  </div>
                </div>

                <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <div class="font-bold text-emerald-950">Esquadrias & Vidros</div>
                  <div class="text-[11px] text-emerald-900 leading-relaxed">
                    Fechamento em lote único com linhas padronizadas de alumínio anodizado garante descontos de escala de 10% a 15%.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      }

    </div>

    <!-- ======================================================= -->
    <!-- MODAL DE RELATÓRIO EXECUTIVO (LAUDO / IMPRESSÃO)         -->
    <!-- ======================================================= -->
    @if (modalRelatorioAberto()) {
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Cabeçalho do Modal -->
          <div class="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#132A41] text-[#E59866] flex items-center justify-center font-black text-sm shadow-xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900 leading-tight">
                  Relatório Executivo de Viabilidade Imobiliária
                </h4>
                <p class="text-xs text-slate-500">
                  {{ nomeProjeto() || 'Empreendimento Sem Título' }} — {{ params().estado }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="baixarRelatorioPDF()"
                [disabled]="gerandoPdf()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                @if (gerandoPdf()) {
                  <svg class="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Gerando PDF...</span>
                } @else {
                  <svg class="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Baixar Relatório em PDF</span>
                }
              </button>

              <button
                type="button"
                (click)="imprimirRelatorio()"
                title="Imprimir visualização da janela"
                class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>

              <button
                type="button"
                (click)="modalRelatorioAberto.set(false)"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Corpo do Relatório (Scrollable) -->
          <div class="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800">
            
            <!-- Dados Cadastrais -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span class="text-slate-500 font-medium">Empreendimento:</span>
                <div class="font-bold text-slate-900">{{ nomeProjeto() || 'Residencial Padrão' }}</div>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Localização:</span>
                <div class="font-bold text-slate-900">{{ estado() }}</div>
              </div>
              <div>
                <span class="text-slate-500 font-medium">Tipologia CUB:</span>
                <div class="font-bold text-slate-900">{{ params().tipo }} ({{ params().padrao }} - {{ params().indice }})</div>
              </div>
              <div>
                <span class="text-slate-500 font-medium">CUB Referência:</span>
                <div class="font-bold text-slate-900">{{ params().custoBaseM2 | currency:'BRL':'symbol':'1.2-2' }}/m²</div>
              </div>
            </div>

            <!-- Síntese das Áreas -->
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <span class="text-slate-500 text-[11px] font-bold uppercase">Área Bruta Total</span>
                <div class="text-base font-black text-slate-900">{{ areaTotals().totalAreaBruta.toFixed(2) }} m²</div>
              </div>
              <div class="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50">
                <span class="text-indigo-800 text-[11px] font-bold uppercase">Área Equivalente NBR 12.721</span>
                <div class="text-base font-black text-indigo-950">{{ areaTotals().totalAreaEquivalente.toFixed(2) }} m²</div>
              </div>
              <div class="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <span class="text-emerald-800 text-[11px] font-bold uppercase">Área Vendável Privativa</span>
                <div class="text-base font-black text-emerald-950">{{ areaVendavel() }} m²</div>
              </div>
            </div>

            <!-- Resumo Financeiro Consolidado -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th class="p-3">Indicador Econômico</th>
                    <th class="p-3 text-right">Valor Total (R$)</th>
                    <th class="p-3 text-right">% s/ VGV</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr class="font-bold bg-emerald-50/40">
                    <td class="p-3">Valor Geral de Vendas (VGV)</td>
                    <td class="p-3 text-right font-mono">{{ kpis().scenarioVgvTotal | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3 text-right font-mono">100,0%</td>
                  </tr>
                  <tr>
                    <td class="p-3">Custo Direto de Obra (CUB + Extracontratuais)</td>
                    <td class="p-3 text-right font-mono text-rose-700">{{ kpis().scenarioCustoObra | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoObra) }}%</td>
                  </tr>
                  <tr>
                    <td class="p-3">Terreno / Permuta</td>
                    <td class="p-3 text-right font-mono text-rose-700">{{ kpis().scenarioCustoTerreno | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3 text-right font-mono">{{ getPercVgv(kpis().scenarioCustoTerreno) }}%</td>
                  </tr>
                  <tr>
                    <td class="p-3">Despesas Comerciais & Projetos</td>
                    <td class="p-3 text-right font-mono text-rose-700">{{ (kpis().totalCustosComerciais + kpis().custoProjetosValor) | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3 text-right font-mono">{{ getPercVgv(kpis().totalCustosComerciais + kpis().custoProjetosValor) }}%</td>
                  </tr>
                  <tr>
                    <td class="p-3">Tributação ({{ regimeTributario().toUpperCase() }})</td>
                    <td class="p-3 text-right font-mono text-rose-700">{{ kpis().scenarioImpostos | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3 text-right font-mono">{{ getPercVgv(kpis().scenarioImpostos) }}%</td>
                  </tr>
                  <tr class="bg-emerald-100 font-black text-emerald-950">
                    <td class="p-3.5 text-sm">LUCRO LÍQUIDO REAL</td>
                    <td class="p-3.5 text-right font-mono text-base">{{ kpis().scenarioLucroLiquido | currency:'BRL':'symbol':'1.0-0' }}</td>
                    <td class="p-3.5 text-right font-mono text-sm">{{ (kpis().scenarioMargemLiquida * 100).toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Dados do Responsável Técnico -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Responsável Técnico</label>
                <input
                  type="text"
                  [value]="responsavelTecnico()"
                  (input)="responsavelTecnico.set($any($event.target).value)"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Registro Profissional (CREA / CAU)</label>
                <input
                  type="text"
                  [value]="creaCau()"
                  (input)="creaCau.set($any($event.target).value)"
                  class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    }
  `
})
export class CustosViabilidadeComponent {
  readonly abaAtiva = signal<AbaViabilidade>('premissas');
  readonly cenarioAtivo = signal<'pessimistic' | 'realistic' | 'optimistic'>('realistic');
  readonly modalRelatorioAberto = signal<boolean>(false);
  readonly gerandoPdf = signal<boolean>(false);

  // Identificação do Estudo
  readonly nomeProjeto = signal<string>('Residencial Parque das Acácias');
  readonly responsavelTecnico = signal<string>('Eng. Amorim');
  readonly creaCau = signal<string>('CREA 000000/D');

  // Input Signals
  readonly estado = signal<string>('Goiás');
  readonly indice = signal<string>('R-8');
  readonly bdi = signal<number>(3.0);
  readonly areaVendavel = signal<number>(3200);
  readonly precoM2 = signal<number>(8500);
  readonly receitasExtras = signal<number>(0);

  // Terreno
  readonly tipoTerreno = signal<'compra' | 'permuta_fisica' | 'permuta_financeira'>('compra');
  readonly custoTerreno = signal<number>(2500000);
  readonly permutaFisicaPerc = signal<number>(15);
  readonly permutaFinanceiraPerc = signal<number>(12);

  // Custos Extracontratuais
  readonly custoFundacoesEspeciais = signal<number>(450000);
  readonly custoElevadores = signal<number>(320000);
  readonly custoInstalacoesEspeciais = signal<number>(180000);
  readonly custoLazerDecoracao = signal<number>(220000);
  readonly custoPaisagismoUrbanizacao = signal<number>(110000);

  // Despesas Comerciais e Incorporação
  readonly custoProjetos = signal<number>(4.0);
  readonly custoMarketing = signal<number>(2.5);
  readonly custoCorretagem = signal<number>(4.0);
  readonly custoDespesasLegais = signal<number>(1.0);
  readonly custoFinanciamento = signal<number>(0);

  // Tributação
  readonly regimeTributario = signal<'ret' | 'lucro_presumido' | 'isento'>('ret');

  // Cronograma & Financeiro
  readonly prazoConstrucaoMeses = signal<number>(24);
  readonly prazoVendasMeses = signal<number>(30);
  readonly tmaAnual = signal<number>(12);

  // Áreas NBR 12.721
  readonly areas = signal<AreaInput[]>(
    coeficientesDB.map(c => ({
      ...c,
      area: c.nome === 'TIPO' ? 420 : c.nome === '1º SUBSOLO' ? 450 : c.nome === 'TÉRREO INTERNO' ? 380 : 0,
      qty: c.nome === 'TIPO' ? 8 : 1
    }))
  );

  // Estados disponíveis
  readonly states = computed(() => Object.keys(custosDB).sort());

  // Parâmetros do Estado e Índice
  readonly params = computed(() => {
    const estado = this.estado();
    const indice = this.indice();
    const dataEstado = custosDB[estado]?.data;
    if (!dataEstado) {
      return { estado, tipo: 'Padrão Residenciais', padrao: 'Padrão Normal', indice, custoBaseM2: 2611.19, refMes: 'Março', refAno: 2025 };
    }
    for (const tipo of Object.keys(dataEstado)) {
      for (const padrao of Object.keys(dataEstado[tipo])) {
        if (dataEstado[tipo][padrao][indice]) {
          return {
            estado,
            tipo,
            padrao,
            indice,
            custoBaseM2: dataEstado[tipo][padrao][indice] || 0,
            refMes: custosDB[estado]?.mes || 'Março',
            refAno: custosDB[estado]?.ano || 2025
          };
        }
      }
    }
    return { estado, tipo: 'Padrão Residenciais', padrao: 'Padrão Normal', indice, custoBaseM2: 2611.19, refMes: 'Março', refAno: 2025 };
  });

  readonly availableIndices = computed(() => {
    const estado = this.estado();
    const dataEstado = custosDB[estado]?.data;
    if (!dataEstado) return [];
    const indices: { group: string; value: string }[] = [];
    Object.keys(dataEstado).forEach(tipo => {
      Object.keys(dataEstado[tipo]).forEach(padrao => {
        Object.keys(dataEstado[tipo][padrao]).forEach(indice => {
          indices.push({ group: `${tipo} - ${padrao}`, value: indice });
        });
      });
    });
    return indices;
  });

  readonly groupedAvailableIndices = computed(() => {
    const indices = this.availableIndices();
    const groups: { name: string; items: { value: string }[] }[] = [];
    indices.forEach(index => {
      let group = groups.find(g => g.name === index.group);
      if (!group) {
        group = { name: index.group, items: [] };
        groups.push(group);
      }
      group.items.push({ value: index.value });
    });
    return groups;
  });

  readonly totalCustosExtracontratuais = computed(() => {
    return (
      (this.custoFundacoesEspeciais() || 0) +
      (this.custoElevadores() || 0) +
      (this.custoInstalacoesEspeciais() || 0) +
      (this.custoLazerDecoracao() || 0) +
      (this.custoPaisagismoUrbanizacao() || 0)
    );
  });

  readonly aliquotaImposto = computed(() => {
    const regime = this.regimeTributario();
    if (regime === 'ret') return 4.0;
    if (regime === 'lucro_presumido') return 5.93;
    return 0.0;
  });

  readonly areaTotals = computed(() => {
    let totalAreaBruta = 0;
    let totalAreaEquivalente = 0;
    this.areas().forEach(area => {
      const currentQty = area.nome === 'TIPO' && area.qty >= 1 ? area.qty : 1;
      totalAreaBruta += (area.area || 0) * currentQty;
      totalAreaEquivalente += (area.area || 0) * area.coef * currentQty;
    });
    return { totalAreaBruta, totalAreaEquivalente };
  });

  readonly costCalculations = computed(() => {
    const bdiDecimal = (this.bdi() || 0) / 100;
    const custoTotalSemBDI = this.areaTotals().totalAreaEquivalente * this.params().custoBaseM2;
    const baseCustoTotalComBDI = custoTotalSemBDI * (1 + bdiDecimal);
    const custoM2Eq = this.areaTotals().totalAreaEquivalente > 0
      ? baseCustoTotalComBDI / this.areaTotals().totalAreaEquivalente
      : 0;
    return { custoTotalSemBDI, baseCustoTotalComBDI, custoM2Eq };
  });

  readonly baseVgvTotal = computed(() => {
    return (this.areaVendavel() * this.precoM2()) + this.receitasExtras();
  });

  readonly currentScenarioMultipliers = computed(() => {
    const scenarioName = this.cenarioAtivo();
    if (scenarioName === 'pessimistic') return { sales: 0.90, cost: 1.15, name: 'Pessimista' };
    if (scenarioName === 'optimistic') return { sales: 1.10, cost: 0.90, name: 'Otimista' };
    return { sales: 1.0, cost: 1.0, name: 'Realista' };
  });

  readonly kpis = computed(() => {
    const multipliers = this.currentScenarioMultipliers();
    const baseCustoCUB = this.costCalculations().baseCustoTotalComBDI;
    const baseVgv = this.baseVgvTotal();

    const scenarioVgvTotal = baseVgv * multipliers.sales;
    const scenarioCustoCUB = baseCustoCUB * multipliers.cost;
    const scenarioCustosExtracontratuais = this.totalCustosExtracontratuais() * multipliers.cost;
    const scenarioCustoObra = scenarioCustoCUB + scenarioCustosExtracontratuais;

    let scenarioCustoTerreno = 0;
    const tipo = this.tipoTerreno();
    if (tipo === 'compra') {
      scenarioCustoTerreno = this.custoTerreno() || 0;
    } else if (tipo === 'permuta_financeira') {
      scenarioCustoTerreno = scenarioVgvTotal * ((this.permutaFinanceiraPerc() || 0) / 100);
    } else if (tipo === 'permuta_fisica') {
      scenarioCustoTerreno = scenarioVgvTotal * ((this.permutaFisicaPerc() || 0) / 100);
    }

    const custoProjetosValor = scenarioCustoObra * ((this.custoProjetos() || 0) / 100);
    const custoCorretagemValor = scenarioVgvTotal * ((this.custoCorretagem() || 0) / 100);
    const custoMarketingValor = scenarioVgvTotal * ((this.custoMarketing() || 0) / 100);
    const custoDespesasLegaisValor = scenarioVgvTotal * ((this.custoDespesasLegais() || 0) / 100);
    const totalCustosComerciais = custoCorretagemValor + custoMarketingValor + custoDespesasLegaisValor;

    const scenarioImpostos = scenarioVgvTotal * (this.aliquotaImposto() / 100);
    const scenarioCustoFinanciamento = (this.custoFinanciamento() || 0) * multipliers.cost;
    const totalCustosAdicionais = scenarioCustoTerreno + custoProjetosValor + totalCustosComerciais + scenarioImpostos + scenarioCustoFinanciamento;

    const scenarioCustoTotalEmpreendimento = scenarioCustoObra + totalCustosAdicionais;
    const scenarioLucroBruto = scenarioVgvTotal - scenarioCustoObra - scenarioCustoTerreno - custoProjetosValor;
    const scenarioMargemBruta = scenarioVgvTotal > 0 ? (scenarioLucroBruto / scenarioVgvTotal) : 0;
    const scenarioLucroLiquido = scenarioVgvTotal - scenarioCustoTotalEmpreendimento;
    const scenarioMargemLiquida = scenarioVgvTotal > 0 ? (scenarioLucroLiquido / scenarioVgvTotal) : 0;
    const areaVendavel = this.areaVendavel();
    const lucroPorM2Privativo = areaVendavel > 0 ? (scenarioLucroLiquido / areaVendavel) : 0;
    const custoTotalM2Privativo = areaVendavel > 0 ? (scenarioCustoTotalEmpreendimento / areaVendavel) : 0;

    return {
      scenarioVgvTotal,
      scenarioCustoTotalEmpreendimento,
      scenarioCustoObra,
      scenarioCustoCUB,
      scenarioCustosExtracontratuais,
      scenarioCustoTerreno,
      custoProjetosValor,
      custoCorretagemValor,
      custoMarketingValor,
      custoDespesasLegaisValor,
      totalCustosComerciais,
      scenarioImpostos,
      scenarioCustoFinanciamento,
      totalCustosAdicionais,
      scenarioLucroBruto,
      scenarioMargemBruta,
      scenarioLucroLiquido,
      scenarioMargemLiquida,
      lucroPorM2Privativo,
      custoTotalM2Privativo
    };
  });

  readonly sensitivityMatrix = computed(() => {
    const basePreco = this.precoM2();
    const baseAreaVendavel = this.areaVendavel();
    const baseExtras = this.receitasExtras();
    const baseCustoObra = this.costCalculations().baseCustoTotalComBDI + this.totalCustosExtracontratuais();
    const aliqImposto = this.aliquotaImposto() / 100;
    const corretagemPerc = (this.custoCorretagem() || 0) / 100;
    const marketingPerc = (this.custoMarketing() || 0) / 100;
    const legaisPerc = (this.custoDespesasLegais() || 0) / 100;
    const projetosPerc = (this.custoProjetos() || 0) / 100;
    const financiamento = this.custoFinanciamento() || 0;
    const custoTerreno = this.custoTerreno() || 0;
    const tipo = this.tipoTerreno();
    const permutaFinPerc = (this.permutaFinanceiraPerc() || 0) / 100;
    const permutaFisPerc = (this.permutaFisicaPerc() || 0) / 100;

    if (basePreco <= 0 || baseAreaVendavel <= 0 || baseCustoObra <= 0) {
      return null;
    }

    const variacoesPreco = [-0.10, -0.05, 0, 0.05, 0.10];
    const variacoesCusto = [-0.10, -0.05, 0, 0.05, 0.10];

    const rows = variacoesPreco.map(vP => {
      const p = basePreco * (1 + vP);
      const vgv = (baseAreaVendavel * p) + baseExtras;

      let terreno = custoTerreno;
      if (tipo === 'permuta_financeira') terreno = vgv * permutaFinPerc;
      if (tipo === 'permuta_fisica') terreno = vgv * permutaFisPerc;

      const impostos = vgv * aliqImposto;
      const comercial = vgv * (corretagemPerc + marketingPerc + legaisPerc);

      const cells = variacoesCusto.map(vC => {
        const cObra = baseCustoObra * (1 + vC);
        const projetos = cObra * projetosPerc;
        const totalCusto = cObra + terreno + projetos + comercial + impostos + financiamento;
        const lucroLiquido = vgv - totalCusto;
        const margemLiquida = vgv > 0 ? (lucroLiquido / vgv) : 0;
        return {
          varCusto: vC,
          lucroLiquido,
          margemLiquida
        };
      });

      return {
        varPreco: vP,
        precoM2: p,
        cells
      };
    });

    return {
      variacoesCusto,
      rows
    };
  });

  readonly stateComparison = computed(() => {
    const currentParams = this.params();
    const totalAreaEquivalente = this.areaTotals().totalAreaEquivalente;
    const baseCustoTotalComBDI = this.costCalculations().baseCustoTotalComBDI;
    if (!currentParams.tipo || !currentParams.padrao || !currentParams.indice || totalAreaEquivalente === 0) return [];

    return Object.keys(custosDB)
      .map(estado => {
        const stateCubValue = custosDB[estado]?.data?.[currentParams.tipo!]?.[currentParams.padrao!]?.[currentParams.indice!];
        if (stateCubValue) {
          const stateCost = totalAreaEquivalente * stateCubValue * (1 + ((this.bdi() || 0) / 100));
          const difference = stateCost - baseCustoTotalComBDI;
          const percentageDiff = baseCustoTotalComBDI > 0 ? (difference / baseCustoTotalComBDI) : 0;
          return {
            estado,
            costo: stateCost,
            diferenca: difference,
            percentual: percentageDiff
          };
        }
        return null;
      })
      .filter((item): item is { estado: string; costo: number; diferenca: number; percentual: number } => item !== null && item.estado !== currentParams.estado)
      .sort((a, b) => a.costo - b.costo);
  });

  readonly financialMetrics = computed(() => {
    const kpi = this.kpis();
    const vgvTotal = kpi.scenarioVgvTotal;
    const custoObra = kpi.scenarioCustoObra;
    const custoTerreno = kpi.scenarioCustoTerreno;
    const custoProjetos = kpi.custoProjetosValor;
    const custosComerciais = kpi.totalCustosComerciais;
    const impostos = kpi.scenarioImpostos;
    const financiamento = kpi.scenarioCustoFinanciamento;

    const T = Math.max(6, Math.min(60, Math.round(this.prazoConstrucaoMeses() || 24)));
    const tmaAnualVal = (this.tmaAnual() || 12) / 100;
    const tmaMensal = Math.pow(1 + tmaAnualVal, 1 / 12) - 1;

    const sCurve = (fraction: number) => {
      const f = Math.max(0, Math.min(1, fraction));
      return 3 * Math.pow(f, 2) - 2 * Math.pow(f, 3);
    };

    const meses: MonthFlowItem[] = [];
    let acumulado = 0;

    // Mês 0: Aquisição do Terreno e Projetos Iniciais
    const custoTerrenoM0 = custoTerreno;
    const custoProjetosM0 = custoProjetos * 0.4;
    const totalSaidasM0 = custoTerrenoM0 + custoProjetosM0;
    acumulado -= totalSaidasM0;

    meses.push({
      mes: 0,
      receita: 0,
      custoObra: 0,
      custoTerreno: custoTerrenoM0,
      custoProjetos: custoProjetosM0,
      custoComercialImpostos: 0,
      custoFinanciamento: 0,
      totalSaidas: totalSaidasM0,
      fluxoLiquido: -totalSaidasM0,
      saldoAcumulado: acumulado,
      percentualObraMes: 0,
      percentualObraAcum: 0
    });

    let prevCumFraction = 0;
    for (let t = 1; t <= T; t++) {
      const currentCumFraction = sCurve(t / T);
      const monthFraction = currentCumFraction - prevCumFraction;
      prevCumFraction = currentCumFraction;

      const custoObraMes = custoObra * monthFraction;
      const custoProjetosMes = (custoProjetos * 0.6) / T;
      const receitaMes = vgvTotal / T;
      const comImpostosMes = (custosComerciais + impostos) / T;
      const financMes = financiamento / T;

      const totalSaidasMes = custoObraMes + custoProjetosMes + comImpostosMes + financMes;
      const fluxoLiquidoMes = receitaMes - totalSaidasMes;
      acumulado += fluxoLiquidoMes;

      meses.push({
        mes: t,
        receita: receitaMes,
        custoObra: custoObraMes,
        custoTerreno: 0,
        custoProjetos: custoProjetosMes,
        custoComercialImpostos: comImpostosMes,
        custoFinanciamento: financMes,
        totalSaidas: totalSaidasMes,
        fluxoLiquido: fluxoLiquidoMes,
        saldoAcumulado: acumulado,
        percentualObraMes: monthFraction * 100,
        percentualObraAcum: currentCumFraction * 100
      });
    }

    // Cálculo do VPL
    let vpl = 0;
    meses.forEach(m => {
      vpl += m.fluxoLiquido / Math.pow(1 + tmaMensal, m.mes);
    });

    // Cálculo da TIR (Taxa Interna de Retorno)
    const cashFlows = meses.map(m => m.fluxoLiquido);
    const tirMensal = this.calcularTIR(cashFlows);
    const tirAnual = tirMensal !== null ? Math.pow(1 + tirMensal, 12) - 1 : 0;

    // Exposição Máxima de Caixa
    const exposicaoMaxima = Math.abs(Math.min(0, ...meses.map(m => m.saldoAcumulado)));

    return {
      meses,
      vpl,
      tir: tirAnual,
      exposicaoMaxima
    };
  });

  readonly etapasObra = computed(() => {
    const padrao = this.params().padrao;
    if (padrao.includes('Baixo')) return etapasDB['Padrão Baixo'] || etapasDB['Padrão Normal'];
    if (padrao.includes('Alto')) return etapasDB['Padrão Alto'] || etapasDB['Padrão Normal'];
    return etapasDB['Padrão Normal'] || [];
  });

  updateAreaItem(index: number, field: 'area' | 'qty', event: Event): void {
    const inputVal = parseFloat((event.target as HTMLInputElement).value) || 0;
    const list = [...this.areas()];
    if (list[index]) {
      list[index] = { ...list[index], [field]: inputVal };
      this.areas.set(list);
    }
  }

  zerarAreas(): void {
    this.areas.set(this.areas().map(a => ({ ...a, area: 0, qty: a.nome === 'TIPO' ? 1 : 1 })));
  }

  parseNumber(event: Event): number {
    return parseFloat((event.target as HTMLInputElement).value) || 0;
  }

  getPercVgv(valor: number): string {
    const vgv = this.kpis().scenarioVgvTotal;
    if (vgv <= 0) return '0.0';
    return ((valor / vgv) * 100).toFixed(1);
  }

  getValorM2(valor: number): string {
    const area = this.areaVendavel();
    if (area <= 0) return 'R$ 0,00';
    return (valor / area).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getCellClass(margem: number): string {
    if (margem >= 0.25) return 'bg-emerald-200/90 text-emerald-950 font-bold';
    if (margem >= 0.18) return 'bg-emerald-100/90 text-emerald-900';
    if (margem >= 0.10) return 'bg-amber-100 text-amber-900';
    if (margem >= 0.0) return 'bg-orange-100 text-orange-950';
    return 'bg-rose-200 text-rose-950 font-bold';
  }

  imprimirRelatorio(): void {
    window.print();
  }

  formatarMoeda(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  async baixarRelatorioPDF(): Promise<void> {
    this.gerandoPdf.set(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let currentY = 14;

      const navyPrimary: [number, number, number] = [19, 42, 65]; // #132A41
      const copperAccent: [number, number, number] = [181, 100, 42]; // #B5642A
      const slateDark: [number, number, number] = [30, 41, 59]; // #1E293B
      const textWhite: [number, number, number] = [255, 255, 255];
      const bgCellLight: [number, number, number] = [248, 250, 252];
      const bgCellEmerald: [number, number, number] = [236, 253, 245];
      const borderGray: [number, number, number] = [226, 232, 240];

      // 1. Cabeçalho Institucional Faixa Navy + Linha Copper
      doc.setFillColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.rect(margin, currentY, contentWidth, 20, 'F');

      doc.setFillColor(copperAccent[0], copperAccent[1], copperAccent[2]);
      doc.rect(margin, currentY + 20, contentWidth, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text('RELATÓRIO EXECUTIVO DE VIABILIDADE IMOBILIÁRIA', margin + 6, currentY + 8.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(
        'AMORIMTECH • ENGENHARIA DE CUSTOS & AVALIAÇÕES (NBR 12.721 / CUB-SINDUSCON)',
        margin + 6,
        currentY + 15
      );

      currentY += 26;

      // 2. Dados Cadastrais & Identificação do Projeto
      const nomeProj = (this.nomeProjeto() || 'Residencial Padrão').trim();
      const estadoProj = this.estado() || 'Brasil';
      const tipologia = `${this.params().tipo} (${this.params().padrao} - ${this.params().indice})`;
      const cubRef = `R$ ${this.formatarMoeda(this.params().custoBaseM2)}/m² (${this.params().refMes}/${this.params().refAno})`;
      const cenarioStr = `${this.currentScenarioMultipliers().name} (Venda: ${this.currentScenarioMultipliers().sales}x | Custo: ${this.currentScenarioMultipliers().cost}x)`;
      const regimeStr = `${this.regimeTributario().toUpperCase()} (${this.aliquotaImposto().toFixed(2)}%)`;

      const infoCadastrais = [
        ['EMPREENDIMENTO:', nomeProj, 'LOCALIZAÇÃO:', estadoProj],
        ['TIPOLOGIA CUB:', tipologia, 'CUB DE REFERÊNCIA:', cubRef],
        ['CENÁRIO ADOTADO:', cenarioStr, 'REGIME TRIBUTÁRIO:', regimeStr],
        ['DATA DE EMISSÃO:', new Date().toLocaleDateString('pt-BR'), 'BDI ADOTADO:', `${(this.bdi() || 0).toFixed(2)}%`]
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 36 },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 38 },
          3: { cellWidth: 53 }
        },
        body: infoCadastrais
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;

      // 3. Síntese das Áreas (NBR 12.721)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('1. SÍNTESE DE ÁREAS (NBR 12.721)', margin, currentY);
      currentY += 2.5;

      const areaBruta = this.areaTotals().totalAreaBruta;
      const areaEquiv = this.areaTotals().totalAreaEquivalente;
      const areaPriv = this.areaVendavel();
      const eficiencia = areaBruta > 0 ? ((areaPriv / areaBruta) * 100).toFixed(1) : '0.0';

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: {
          fillColor: navyPrimary,
          textColor: textWhite,
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.2,
          lineColor: borderGray,
          textColor: slateDark,
          halign: 'center'
        },
        head: [['ÁREA BRUTA TOTAL', 'ÁREA EQUIVALENTE (NBR 12.721)', 'ÁREA VENDÁVEL PRIVATIVA', 'EFICIÊNCIA PRIVATIVA']],
        body: [
          [
            `${areaBruta.toFixed(2)} m²`,
            `${areaEquiv.toFixed(2)} m²`,
            `${areaPriv.toFixed(2)} m²`,
            `${eficiencia}%`
          ]
        ]
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;

      // 4. Demonstrativo Financeiro Consolidado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('2. DEMONSTRATIVO FINANCEIRO CONSOLIDADO', margin, currentY);
      currentY += 2.5;

      const kpi = this.kpis();
      const vgv = kpi.scenarioVgvTotal;
      const cObra = kpi.scenarioCustoObra;
      const cTerreno = kpi.scenarioCustoTerreno;
      const cComProj = kpi.totalCustosComerciais + kpi.custoProjetosValor;
      const cImpostos = kpi.scenarioImpostos;
      const cFinanc = kpi.scenarioCustoFinanciamento;
      const cTotal = kpi.scenarioCustoTotalEmpreendimento;
      const lucroLiq = kpi.scenarioLucroLiquido;
      const margemLiqPerc = (kpi.scenarioMargemLiquida * 100).toFixed(2);

      const formatM2 = (val: number) => (areaPriv > 0 ? `R$ ${this.formatarMoeda(val / areaPriv)}` : '-');

      const corpoFinanceiro: any[] = [
        [
          { content: 'Valor Geral de Vendas (VGV)', styles: { fontStyle: 'bold' } },
          { content: `R$ ${this.formatarMoeda(vgv)}`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatM2(vgv), styles: { halign: 'right' } },
          { content: '100,0%', styles: { fontStyle: 'bold', halign: 'right' } }
        ],
        [
          '(-) Custo Direto de Obra (CUB + Extracontratuais)',
          { content: `R$ ${this.formatarMoeda(cObra)}`, styles: { halign: 'right' } },
          { content: formatM2(cObra), styles: { halign: 'right' } },
          { content: `${this.getPercVgv(cObra)}%`, styles: { halign: 'right' } }
        ],
        [
          '(-) Terreno / Permuta',
          { content: `R$ ${this.formatarMoeda(cTerreno)}`, styles: { halign: 'right' } },
          { content: formatM2(cTerreno), styles: { halign: 'right' } },
          { content: `${this.getPercVgv(cTerreno)}%`, styles: { halign: 'right' } }
        ],
        [
          '(-) Despesas Comerciais & Projetos',
          { content: `R$ ${this.formatarMoeda(cComProj)}`, styles: { halign: 'right' } },
          { content: formatM2(cComProj), styles: { halign: 'right' } },
          { content: `${this.getPercVgv(cComProj)}%`, styles: { halign: 'right' } }
        ],
        [
          `(-) Tributação (${this.regimeTributario().toUpperCase()})`,
          { content: `R$ ${this.formatarMoeda(cImpostos)}`, styles: { halign: 'right' } },
          { content: formatM2(cImpostos), styles: { halign: 'right' } },
          { content: `${this.getPercVgv(cImpostos)}%`, styles: { halign: 'right' } }
        ]
      ];

      if (cFinanc > 0) {
        corpoFinanceiro.push([
          '(-) Custos Financeiros / Juros',
          { content: `R$ ${this.formatarMoeda(cFinanc)}`, styles: { halign: 'right' } },
          { content: formatM2(cFinanc), styles: { halign: 'right' } },
          { content: `${this.getPercVgv(cFinanc)}%`, styles: { halign: 'right' } }
        ]);
      }

      corpoFinanceiro.push(
        [
          { content: '(=) CUSTO TOTAL DO EMPREENDIMENTO', styles: { fontStyle: 'bold', fillColor: bgCellLight } },
          { content: `R$ ${this.formatarMoeda(cTotal)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellLight } },
          { content: formatM2(cTotal), styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellLight } },
          { content: `${this.getPercVgv(cTotal)}%`, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellLight } }
        ],
        [
          { content: '(=) LUCRO LÍQUIDO REAL PROJETADO', styles: { fontStyle: 'bold', fillColor: bgCellEmerald, textColor: [6, 78, 59] } },
          { content: `R$ ${this.formatarMoeda(lucroLiq)}`, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellEmerald, textColor: [6, 78, 59] } },
          { content: formatM2(lucroLiq), styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellEmerald, textColor: [6, 78, 59] } },
          { content: `${margemLiqPerc}%`, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellEmerald, textColor: [6, 78, 59] } }
        ]
      );

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: {
          fillColor: navyPrimary,
          textColor: textWhite,
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left'
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        columnStyles: {
          0: { cellWidth: 84 },
          1: { cellWidth: 36 },
          2: { cellWidth: 34 },
          3: { cellWidth: 28 }
        },
        head: [['INDICADOR ECONÔMICO', 'VALOR TOTAL (R$)', 'R$ / m² PRIV.', '% s/ VGV']],
        body: corpoFinanceiro
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;

      // 5. Indicadores de Rentabilidade & Retorno
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('3. INDICADORES DE RENTABILIDADE & RETORNO', margin, currentY);
      currentY += 2.5;

      const metrics = this.financialMetrics();
      const tirStr = `${(metrics.tir * 100).toFixed(1)}% a.a.`;
      const vplStr = `R$ ${this.formatarMoeda(metrics.vpl)}`;
      const expStr = `R$ ${this.formatarMoeda(metrics.exposicaoMaxima)}`;
      const margemBrutaStr = `${(kpi.scenarioMargemBruta * 100).toFixed(2)}%`;
      const lucroM2Str = `R$ ${this.formatarMoeda(kpi.lucroPorM2Privativo)}/m²`;
      const prazosStr = `${this.prazoConstrucaoMeses()}m obra / ${this.prazoVendasMeses()}m vendas`;

      const tabelaRetorno = [
        ['MARGEM LÍQUIDA:', `${margemLiqPerc}%`, 'MARGEM BRUTA:', margemBrutaStr],
        ['LUCRO / m² PRIVATIVO:', lucroM2Str, 'TIR PROJETADA:', tirStr],
        ['VPL (TMA 12% a.a.):', vplStr, 'EXPOSIÇÃO MÁXIMA CAIXA:', expStr],
        ['PRAZO ESTIMADO:', prazosStr, 'TMA APLICADA:', `${(this.tmaAnual() || 12).toFixed(1)}% a.a.`]
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 42 },
          1: { cellWidth: 49 },
          2: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 45 },
          3: { cellWidth: 46 }
        },
        body: tabelaRetorno
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;

      // 6. Nota Metodológica Legal & Responsabilidade Técnica
      const notaLegal =
        'Nota Metodológica: Estudo paramétrico fundamentado na NBR 12.721 (Avaliação de custos unitários e preparo de orçamento para incorporação de edifício) e índices do Custo Unitário Básico (CUB/m²) divulgados pelos respectivos Sinduscons estaduais. Os valores extracontratuais, tributários e comerciais devem ser confirmados com os projetos executivos de engenharia e sondagem geológica.';

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      const splitNota = doc.splitTextToSize(notaLegal, contentWidth);
      doc.text(splitNota, margin, currentY);
      currentY += splitNota.length * 2.8 + 8;

      // 7. Espaço de Assinatura Profissional
      const respTecnico = this.responsavelTecnico() || 'Engenheiro / Arquiteto Responsável';
      const creaCauReg = this.creaCau() || 'CREA / CAU nº 000000/D';

      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.4);
      const lineXStart = pageWidth / 2 - 45;
      const lineXEnd = pageWidth / 2 + 45;
      doc.line(lineXStart, currentY, lineXEnd, currentY);

      currentY += 3.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text(respTecnico, pageWidth / 2, currentY, { align: 'center' });

      currentY += 3;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(`Responsável Técnico • ${creaCauReg}`, pageWidth / 2, currentY, { align: 'center' });

      // 8. Rodapé com Numeração em Todas as Páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);

        // Linha divisória de rodapé
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, 287, pageWidth - margin, 287);

        doc.text(
          'AmorimTech • Agente Técnico de Viabilidade Imobiliária (NBR 12.721 & CUB)',
          margin,
          291
        );
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - margin,
          291,
          { align: 'right' }
        );
      }

      // 9. Download do Documento PDF
      const nomeSanitizado = (this.nomeProjeto() || 'Residencial_Padrao')
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 35);
      const dataStr = new Date().toISOString().split('T')[0];
      const nomeArquivo = `Viabilidade_${nomeSanitizado}_${dataStr}.pdf`;

      doc.save(nomeArquivo);
    } catch (err) {
      console.error('Erro ao gerar relatório de viabilidade em PDF:', err);
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  private calcularTIR(flows: number[]): number | null {
    let rate = 0.02; // Chute inicial 2% ao mês
    const maxIter = 100;
    const eps = 1e-6;

    for (let i = 0; i < maxIter; i++) {
      let npv = 0;
      let dNpv = 0;

      for (let t = 0; t < flows.length; t++) {
        const factor = Math.pow(1 + rate, t);
        if (factor === 0) continue;
        npv += flows[t] / factor;
        dNpv -= (t * flows[t]) / (factor * (1 + rate));
      }

      if (Math.abs(dNpv) < 1e-10) break;

      const newRate = rate - npv / dNpv;
      if (Math.abs(newRate - rate) < eps) {
        return newRate;
      }
      rate = newRate;
    }
    return rate > -1 ? rate : null;
  }
}
