import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { MotorPdfService } from '../../../services/motor-pdf.service';
import {
  coeficientesDB,
  etapasDB,
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
            <!-- Projetos Salvos -->
            <button
              type="button"
              (click)="abrirModalMeusProjetos()"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Ver meus estudos de viabilidade salvos"
            >
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Meus Projetos</span>
            </button>

            <button
              type="button"
              (click)="clicarSalvarProjeto()"
              [disabled]="salvandoProjeto()"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              [title]="projetoAtualId() ? 'Atualizar estudo salvo' : 'Salvar estudo de viabilidade'"
            >
              @if (salvandoProjeto()) {
                <svg class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Salvando...</span>
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{{ projetoAtualId() ? 'Salvar Alterações' : 'Salvar' }}</span>
              }
            </button>

            @if (projetoAtualId()) {
              <button
                type="button"
                (click)="clicarSalvarComoNovo()"
                class="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                title="Salvar como um novo projeto"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Como Novo</span>
              </button>
            }

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
                  <div class="font-bold text-slate-900 flex items-center gap-2">
                    <span>{{ params().tipo }} — {{ params().padrao }} ({{ params().indice }})</span>
                    @if (params().isPlaceholder) {
                      <span class="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300" title="Valor estimado com base na média regional até publicação pelo Sinduscon">
                        Estimativa
                      </span>
                    }
                  </div>
                  <div class="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span>Custo Unitário Básico Sinduscon/{{ estado() }}</span>
                    @if (carregandoCub()) {
                      <span class="inline-flex items-center text-[10px] text-indigo-600">
                        <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        atualizando...
                      </span>
                    }
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

      <!-- MODAL: SALVAR PROJETO -->
      @if (modalSalvarAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Salvar Estudo de Viabilidade</h4>
                  <p class="text-xs text-slate-500">Dê um nome para identificar este estudo econômico</p>
                </div>
              </div>
              <button
                type="button"
                (click)="modalSalvarAberto.set(false)"
                class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700">Nome do Empreendimento / Estudo</label>
              <input
                type="text"
                [value]="modalSalvarNomeInput()"
                (input)="modalSalvarNomeInput.set($any($event.target).value)"
                (keydown.enter)="confirmarSalvarNovoProjeto()"
                placeholder="Ex: Residencial Acácias — Estudo CUB R-8"
                class="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-amber-600 focus:bg-white outline-hidden transition-all"
                autofocus
              />
              <p class="text-[11px] text-slate-400">Texto livre para localização em sua lista de projetos.</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                (click)="modalSalvarAberto.set(false)"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmarSalvarNovoProjeto()"
                [disabled]="salvandoProjeto() || !modalSalvarNomeInput().trim()"
                class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                @if (salvandoProjeto()) {
                  <svg class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Salvando...</span>
                } @else {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Salvar Projeto</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: MEUS PROJETOS SALVOS -->
      @if (modalProjetosAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <!-- Header do Modal -->
            <div class="flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Meus Projetos Salvos (Viabilidade)</h4>
                  <p class="text-xs text-slate-500">Selecione um estudo de viabilidade para carregar e continuar analisando</p>
                </div>
              </div>
              <button
                type="button"
                (click)="modalProjetosAberto.set(false)"
                class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Lista de Projetos com Scroll -->
            <div class="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
              @if (carregandoProjetos()) {
                <div class="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <svg class="animate-spin w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-xs font-semibold">Carregando seus estudos salvos...</span>
                </div>
              } @else if (listaProjetosSalvos().length === 0) {
                <div class="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-xs font-bold text-slate-600">Nenhum estudo salvo ainda</p>
                  <p class="text-[11px] text-slate-400 max-w-xs">Preencha as premissas econômicas e clique em "Salvar" para armazenar seus estudos de viabilidade.</p>
                </div>
              } @else {
                @for (proj of listaProjetosSalvos(); track proj.id) {
                  <div
                    class="p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group"
                    [class]="projetoAtualId() === proj.id
                      ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'"
                  >
                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <h5 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {{ proj.nome_projeto }}
                        </h5>
                        @if (projetoAtualId() === proj.id) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shrink-0">
                            Aberto
                          </span>
                        }
                      </div>
                      <p class="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Atualizado em: {{ formatarDataProjeto(proj.atualizado_em) }}</span>
                      </p>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        (click)="abrirProjetoSalvo(proj)"
                        class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Abrir</span>
                      </button>

                      <button
                        type="button"
                        (click)="confirmarExcluirProjeto(proj, $event)"
                        class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir estudo salvo"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Rodapé do Modal -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                type="button"
                (click)="modalProjetosAberto.set(false)"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TOAST DE FEEDBACK -->
      @if (toastMensagem()) {
        <div class="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            class="px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold"
            [class]="toastMensagem()?.tipo === 'sucesso'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700/60 shadow-emerald-950/30'
              : toastMensagem()?.tipo === 'erro'
                ? 'bg-rose-900/95 text-rose-100 border-rose-700/60 shadow-rose-950/30'
                : 'bg-slate-900/95 text-slate-100 border-slate-700/60 shadow-slate-950/30'"
          >
            @if (toastMensagem()?.tipo === 'sucesso') {
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            } @else if (toastMensagem()?.tipo === 'erro') {
              <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            <span>{{ toastMensagem()?.texto }}</span>
          </div>
        </div>
      }

    </div>
  `
})
export class CustosViabilidadeComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly motorPdfService = inject(MotorPdfService);

  // Controle de Projetos Salvos
  readonly projetoAtualId = signal<string | null>(null);
  readonly projetoAtualNome = signal<string>('');
  readonly salvandoProjeto = signal<boolean>(false);
  readonly modalSalvarAberto = signal<boolean>(false);
  readonly modalSalvarNomeInput = signal<string>('');
  readonly modalProjetosAberto = signal<boolean>(false);
  readonly carregandoProjetos = signal<boolean>(false);
  readonly listaProjetosSalvos = signal<any[]>([]);
  readonly toastMensagem = signal<{ texto: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);

  // Dados de CUB carregados do Supabase
  readonly cubLista = signal<any[]>([]);
  readonly carregandoCub = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      if (perfil) {
        if (perfil.full_name) this.responsavelTecnico.set(perfil.full_name);
        if (perfil.crea_cau) this.creaCau.set(perfil.crea_cau);
      }
    } catch (e) {
      console.warn('Carregamento de perfil para custos:', e);
    }

    await this.carregarDadosCub();
  }

  async carregarDadosCub(): Promise<void> {
    this.carregandoCub.set(true);
    try {
      const lista = await this.supabaseService.listarCubPorEstado();
      this.cubLista.set(lista || []);
    } catch (e) {
      console.warn('Erro ao carregar dados de CUB:', e);
    } finally {
      this.carregandoCub.set(false);
    }
  }

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

  // Estados disponíveis (carregados do Supabase ou fallback padrão)
  readonly states = computed(() => {
    const lista = this.cubLista();
    if (!lista || lista.length === 0) {
      return [
        'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
        'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
        'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
        'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
        'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
      ].sort();
    }
    const setEstados = new Set<string>();
    for (const item of lista) {
      const nome = item.nome_estado || item.uf;
      if (nome) setEstados.add(nome);
    }
    return Array.from(setEstados).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  });

  // Parâmetros do Estado e Índice
  readonly params = computed(() => {
    const estado = this.estado();
    const indice = this.indice();
    const lista = this.cubLista();

    if (!lista || lista.length === 0) {
      return {
        estado,
        tipo: 'Padrão Residenciais',
        padrao: 'Padrão Normal',
        indice,
        custoBaseM2: 2611.19,
        refMes: 'Março',
        refAno: 2025,
        isPlaceholder: false
      };
    }

    const registrosEstado = lista.filter(
      item => (item.nome_estado && item.nome_estado.toLowerCase() === estado.toLowerCase()) ||
              (item.uf && item.uf.toLowerCase() === estado.toLowerCase())
    );

    const mesesNomes = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const formatarMes = (item: any): string => {
      if (item.mes_referencia && typeof item.mes_referencia === 'number' && mesesNomes[item.mes_referencia]) {
        return mesesNomes[item.mes_referencia];
      }
      if (typeof item.mes_referencia === 'string' && isNaN(Number(item.mes_referencia))) {
        return item.mes_referencia;
      }
      if (item.mes_ano_referencia) {
        return item.mes_ano_referencia;
      }
      return 'Atual';
    };

    if (registrosEstado.length > 0) {
      // Procura primeiro pelo subtipo (ex: R-8, PP-4, CAL-8)
      let match = registrosEstado.find(
        r => (r.subtipo && r.subtipo.trim().toUpperCase() === indice.trim().toUpperCase()) ||
             (r.padrao && r.padrao.trim().toUpperCase() === indice.trim().toUpperCase())
      );

      if (!match) {
        match = registrosEstado[0];
      }

      if (match) {
        const tipoStr = match.tipologia || 'Padrão Residenciais';
        const padraoStr = match.padrao || 'Padrão Normal';
        const subtipoStr = match.subtipo || indice;
        const valorM2 = Number(match.valor_m2) || 2611.19;
        const refAno = match.ano_referencia || 2025;
        const refMes = formatarMes(match);
        const isPlaceholder = !!(match.sinduscon_responsavel && match.sinduscon_responsavel.includes('Estimativa'));

        return {
          estado,
          tipo: tipoStr,
          padrao: padraoStr,
          indice: subtipoStr,
          custoBaseM2: valorM2,
          refMes,
          refAno,
          isPlaceholder
        };
      }
    }

    return {
      estado,
      tipo: 'Padrão Residenciais',
      padrao: 'Padrão Normal',
      indice,
      custoBaseM2: 2611.19,
      refMes: 'Março',
      refAno: 2025,
      isPlaceholder: false
    };
  });

  readonly availableIndices = computed(() => {
    const estado = this.estado();
    const lista = this.cubLista();
    if (!lista || lista.length === 0) {
      // Fallback default de opções
      return [
        { group: 'Padrão Residenciais - Padrão Baixo', value: 'R-1' },
        { group: 'Padrão Residenciais - Padrão Baixo', value: 'PP-4' },
        { group: 'Padrão Residenciais - Padrão Baixo', value: 'R-8' },
        { group: 'Padrão Residenciais - Padrão Baixo', value: 'PIS' },
        { group: 'Padrão Residenciais - Padrão Normal', value: 'R-1' },
        { group: 'Padrão Residenciais - Padrão Normal', value: 'PP-4' },
        { group: 'Padrão Residenciais - Padrão Normal', value: 'R-8' },
        { group: 'Padrão Residenciais - Padrão Normal', value: 'R-16' },
        { group: 'Padrão Residenciais - Padrão Alto', value: 'R-1' },
        { group: 'Padrão Residenciais - Padrão Alto', value: 'R-8' },
        { group: 'Padrão Residenciais - Padrão Alto', value: 'R-16' },
        { group: 'Padrão Comerciais - Padrão Normal', value: 'CAL-8' },
        { group: 'Padrão Comerciais - Padrão Normal', value: 'CSL-8' },
        { group: 'Padrão Comerciais - Padrão Normal', value: 'CSL-16' },
        { group: 'Padrão Comerciais - Padrão Alto', value: 'CAL-8' },
        { group: 'Padrão Comerciais - Padrão Alto', value: 'CSL-8' },
        { group: 'Padrão Comerciais - Padrão Alto', value: 'CSL-16' },
        { group: 'Padrão Galpão Industrial - Padrão Normal', value: 'RP1Q' },
        { group: 'Padrão Galpão Industrial - Padrão Normal', value: 'G1' }
      ];
    }

    const registrosEstado = lista.filter(
      item => (item.nome_estado && item.nome_estado.toLowerCase() === estado.toLowerCase()) ||
              (item.uf && item.uf.toLowerCase() === estado.toLowerCase())
    );

    if (registrosEstado.length === 0) {
      return [{ group: 'Padrão Residenciais - Padrão Normal', value: 'R-8' }];
    }

    const indices: { group: string; value: string }[] = [];
    registrosEstado.forEach(reg => {
      const tipo = reg.tipologia || 'Padrão Residenciais';
      const padrao = reg.padrao || 'Padrão Normal';
      const subtipo = reg.subtipo || reg.padrao || 'R-8';
      indices.push({
        group: `${tipo} - ${padrao}`,
        value: subtipo
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
      if (!group.items.some(i => i.value === index.value)) {
        group.items.push({ value: index.value });
      }
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
    const lista = this.cubLista();
    if (!currentParams.tipo || !currentParams.padrao || !currentParams.indice || totalAreaEquivalente === 0 || !lista || lista.length === 0) return [];

    const estadosMap = new Map<string, number>();

    // Agrupa por estado encontrando a melhor correspondência para o índice/subtipo atual
    lista.forEach(reg => {
      const nomeEst = reg.nome_estado || reg.uf;
      if (!nomeEst || nomeEst.toLowerCase() === currentParams.estado.toLowerCase()) return;

      const subtipoReg = (reg.subtipo || reg.padrao || '').trim().toUpperCase();
      const indiceAlvo = currentParams.indice.trim().toUpperCase();

      if (subtipoReg === indiceAlvo) {
        estadosMap.set(nomeEst, Number(reg.valor_m2) || 0);
      } else if (!estadosMap.has(nomeEst) && reg.valor_m2) {
        // Fallback para caso o estado só tenha padrão genérico (ex: R-8)
        estadosMap.set(nomeEst, Number(reg.valor_m2) || 0);
      }
    });

    const resultados: { estado: string; costo: number; diferenca: number; percentual: number }[] = [];

    estadosMap.forEach((stateCubValue, estado) => {
      if (stateCubValue > 0) {
        const stateCost = totalAreaEquivalente * stateCubValue * (1 + ((this.bdi() || 0) / 100));
        const difference = stateCost - baseCustoTotalComBDI;
        const percentageDiff = baseCustoTotalComBDI > 0 ? (difference / baseCustoTotalComBDI) : 0;
        resultados.push({
          estado,
          costo: stateCost,
          diferenca: difference,
          percentual: percentageDiff
        });
      }
    });

    return resultados.sort((a, b) => a.costo - b.costo);
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
      const nomeProj = (this.nomeProjeto() || 'Residencial Padrão').trim();
      const estadoProj = this.estado() || 'Brasil';
      const tipologia = `${this.params().tipo} (${this.params().padrao} - ${this.params().indice})`;
      const cubRef = `R$ ${this.formatarMoeda(this.params().custoBaseM2)}/m² (${this.params().refMes}/${this.params().refAno})`;
      const multipliers = this.currentScenarioMultipliers();
      const cenarioStr = `${multipliers.name} (Venda: ${multipliers.sales}x | Custo: ${multipliers.cost}x)`;
      const regimeStr = `${this.regimeTributario().toUpperCase()} (${this.aliquotaImposto().toFixed(2)}%)`;
      const dataHoje = new Date().toLocaleDateString('pt-BR');

      const areaBruta = this.areaTotals().totalAreaBruta;
      const areaEquiv = this.areaTotals().totalAreaEquivalente;
      const areaPriv = this.areaVendavel();
      const eficiencia = areaBruta > 0 ? ((areaPriv / areaBruta) * 100).toFixed(1) : '0.0';

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

      const metrics = this.financialMetrics();
      const tirStr = `${(metrics.tir * 100).toFixed(1)}% a.a.`;
      const vplStr = `R$ ${this.formatarMoeda(metrics.vpl)}`;
      const expStr = `R$ ${this.formatarMoeda(metrics.exposicaoMaxima)}`;
      const margemBrutaStr = `${(kpi.scenarioMargemBruta * 100).toFixed(2)}%`;
      const lucroM2Str = `R$ ${this.formatarMoeda(kpi.lucroPorM2Privativo)}/m²`;
      const prazosStr = `${this.prazoConstrucaoMeses()}m obra / ${this.prazoVendasMeses()}m vendas`;

      // 1. Linhas da Tabela de Áreas NBR 12.721
      const areasFiltradas = this.areas().filter(a => (a.area || 0) > 0);
      const areasList = areasFiltradas.length > 0 ? areasFiltradas : this.areas();
      const areasRows = areasList.map(a => {
        const qty = a.nome === 'TIPO' && a.qty >= 1 ? a.qty : 1;
        const bruta = (a.area || 0) * qty;
        const equiv = (a.area || 0) * a.coef * qty;
        return `
          <tr>
            <td><strong>${a.nome}</strong></td>
            <td class="td-center font-mono">${a.coef.toFixed(2)}</td>
            <td class="td-right font-mono">${(a.area || 0).toFixed(2)}</td>
            <td class="td-center font-mono">${qty}</td>
            <td class="td-right font-mono">${bruta.toFixed(2)} m²</td>
            <td class="td-right font-mono font-bold" style="color: var(--p4-navy, #132A41);">${equiv.toFixed(2)} m²</td>
          </tr>
        `;
      }).join('');

      // 2. Terreno
      const tipoT = this.tipoTerreno();
      let tipoTerrenoLabel = 'Compra Direta';
      let tipoTerrenoDetalhe = `Valor de Aquisição: R$ ${this.formatarMoeda(this.custoTerreno())}`;
      if (tipoT === 'permuta_financeira') {
        tipoTerrenoLabel = 'Permuta Financeira';
        tipoTerrenoDetalhe = `${(this.permutaFinanceiraPerc() || 0).toFixed(1)}% sobre o VGV Total`;
      } else if (tipoT === 'permuta_fisica') {
        tipoTerrenoLabel = 'Permuta Física';
        tipoTerrenoDetalhe = `${(this.permutaFisicaPerc() || 0).toFixed(1)}% em Unidades / Área`;
      }

      // 5. Matriz de Sensibilidade Bidirecional
      let sensibilidadeTableHtml = '';
      const matrix = this.sensitivityMatrix();
      if (matrix) {
        const headerCols = matrix.variacoesCusto.map(vc => `
          <th class="th-center" style="font-size: 6.8pt; padding: 4px 6px;">
            ${vc > 0 ? '+' : ''}${(vc * 100).toFixed(0)}% Custo
          </th>
        `).join('');

        const bodyRows = matrix.rows.map(row => {
          const cells = row.cells.map(cell => {
            const isBase = row.varPreco === 0 && cell.varCusto === 0;
            const bgStyle = isBase
              ? 'background-color: #FEF3C7; font-weight: 700; border: 1.5px solid #D97706;'
              : cell.margemLiquida >= 0.20
                ? 'background-color: #ECFDF5;'
                : cell.margemLiquida >= 0.10
                  ? 'background-color: #F0FDF4;'
                  : cell.margemLiquida >= 0
                    ? 'background-color: #FFFBEB;'
                    : 'background-color: #FEF2F2; color: #991B1B;';
            return `
              <td class="td-center" style="padding: 4px 6px; ${bgStyle}">
                <div style="font-weight: 700; font-size: 7.2pt;">${(cell.margemLiquida * 100).toFixed(1)}%</div>
                <div style="font-size: 6.2pt; color: #64748B;">R$ ${this.formatarMoeda(cell.lucroLiquido)}</div>
              </td>
            `;
          }).join('');

          return `
            <tr>
              <td style="background-color: #F8FAFC; font-weight: 600; font-size: 7.2pt; white-space: nowrap; padding: 4px 6px;">
                <strong>R$ ${this.formatarMoeda(row.precoM2)}/m²</strong>
                <span style="font-size: 6.2pt; color: #64748B; display: block;">(${row.varPreco > 0 ? '+' : ''}${(row.varPreco * 100).toFixed(0)}% Preço)</span>
              </td>
              ${cells}
            </tr>
          `;
        }).join('');

        sensibilidadeTableHtml = `
          <table class="doc-table" style="font-size: 7pt; width: 100%; border-collapse: collapse; margin: 6px 0 10px 0;">
            <thead>
              <tr>
                <th style="width: 25%; font-size: 6.8pt; padding: 4px 6px;">Preço / Custo Obra</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>
              ${bodyRows}
            </tbody>
          </table>
        `;
      }

      // 6. Fluxo de Caixa Mensal
      const fluxoCaixaRows = metrics.meses.map(m => `
        <tr>
          <td class="td-center font-bold" style="color: var(--p4-navy, #132A41); padding: 3px 5px;">Mês ${m.mes}</td>
          <td class="td-right" style="color: var(--p4-green, #16A34A); font-weight: ${m.receita > 0 ? '600' : 'normal'}; padding: 3px 5px;">
            ${m.receita > 0 ? `R$ ${this.formatarMoeda(m.receita)}` : '-'}
          </td>
          <td class="td-right" style="color: var(--p4-red, #C75D45); padding: 3px 5px;">
            ${m.custoObra > 0 ? `R$ ${this.formatarMoeda(m.custoObra)}` : '-'}
          </td>
          <td class="td-right" style="padding: 3px 5px;">
            ${(m.custoTerreno + m.custoProjetos + m.custoComercialImpostos + m.custoFinanciamento) > 0
              ? `R$ ${this.formatarMoeda(m.custoTerreno + m.custoProjetos + m.custoComercialImpostos + m.custoFinanciamento)}`
              : '-'}
          </td>
          <td class="td-right font-bold" style="color: var(--p4-red, #C75D45); padding: 3px 5px;">
            R$ ${this.formatarMoeda(m.totalSaidas)}
          </td>
          <td class="td-right font-bold" style="color: ${m.fluxoLiquido >= 0 ? 'var(--p4-green, #16A34A)' : 'var(--p4-red, #C75D45)'}; padding: 3px 5px;">
            R$ ${this.formatarMoeda(m.fluxoLiquido)}
          </td>
          <td class="td-right font-bold" style="color: ${m.saldoAcumulado >= 0 ? 'var(--p4-green, #16A34A)' : 'var(--p4-red, #C75D45)'}; padding: 3px 5px;">
            R$ ${this.formatarMoeda(m.saldoAcumulado)}
          </td>
          <td class="td-center font-bold" style="color: var(--p4-navy, #132A41); padding: 3px 5px;">
            ${m.percentualObraAcum.toFixed(1)}%
          </td>
        </tr>
      `).join('');

      // 7. Benchmarking Nacional
      const benchmarkingRows = this.stateComparison().slice(0, 12).map(item => {
        const isPos = item.diferenca > 0;
        return `
          <tr>
            <td><strong>${item.estado}</strong></td>
            <td class="td-right font-mono font-bold">R$ ${this.formatarMoeda(item.costo)}</td>
            <td class="td-right font-mono" style="color: ${isPos ? 'var(--p4-red, #C75D45)' : 'var(--p4-green, #16A34A)'};">
              ${isPos ? '+' : ''}R$ ${this.formatarMoeda(item.diferenca)}
            </td>
            <td class="td-center font-bold" style="color: ${isPos ? 'var(--p4-red, #C75D45)' : 'var(--p4-green, #16A34A)'};">
              ${isPos ? '+' : ''}${(item.percentual * 100).toFixed(1)}%
            </td>
          </tr>
        `;
      }).join('');

      // 8. Engenharia de Valor & Distribuição de Etapas
      const etapasRows = this.etapasObra().map(et => {
        const custoEtapa = kpi.scenarioCustoCUB * et.perc;
        const m2Etapa = areaEquiv > 0 ? custoEtapa / areaEquiv : 0;
        return `
          <tr>
            <td><strong>${et.nome}</strong></td>
            <td class="td-center font-mono font-bold">${(et.perc * 100).toFixed(2)}%</td>
            <td class="td-right font-mono">R$ ${this.formatarMoeda(custoEtapa)}</td>
            <td class="td-right font-mono">R$ ${this.formatarMoeda(m2Etapa)}/m²</td>
          </tr>
        `;
      }).join('');

      const corpoHtml = `
        <!-- IDENTIFICAÇÃO DO PROJETO & PREMISSAS GERAIS -->
        <div class="doc-card-info">
          <div class="doc-grid-4">
            <div class="doc-info-item">
              <span class="doc-info-label">Empreendimento</span>
              <span class="doc-info-value">${nomeProj}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Localização</span>
              <span class="doc-info-value">${estadoProj}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Tipologia NBR 12.721</span>
              <span class="doc-info-value">${tipologia}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">CUB de Referência</span>
              <span class="doc-info-value">${cubRef}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Cenário Adotado</span>
              <span class="doc-info-value">${cenarioStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Regime Tributário</span>
              <span class="doc-info-value">${regimeStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">BDI Adotado</span>
              <span class="doc-info-value">${(this.bdi() || 0).toFixed(2)}% (R$ ${this.formatarMoeda(this.params().custoBaseM2 * (1 + (this.bdi() || 0) / 100))}/m²)</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Data de Emissão</span>
              <span class="doc-info-value">${dataHoje}</span>
            </div>
          </div>
        </div>

        <!-- 1. PREMISSAS, NBR 12.721 & CUB SINDUSCON -->
        <div class="doc-section">
          <div class="doc-section-title">1. Premissas, Quadro de Áreas NBR 12.721 & Receitas</div>
          
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 28%;">Pavimento / Ambiente</th>
                <th class="th-center" style="width: 12%;">Coef. NBR</th>
                <th class="th-right" style="width: 15%;">Área Unit. (m²)</th>
                <th class="th-center" style="width: 10%;">Qtd</th>
                <th class="th-right" style="width: 17%;">Área Bruta (m²)</th>
                <th class="th-right" style="width: 18%;">Área Eq. (m²)</th>
              </tr>
            </thead>
            <tbody>
              ${areasRows}
            </tbody>
            <tfoot>
              <tr class="highlight-gray">
                <td colspan="4" style="font-weight: 700; text-transform: uppercase;">Totais Globais NBR 12.721:</td>
                <td class="td-right font-bold">${areaBruta.toFixed(2)} m²</td>
                <td class="td-right font-bold" style="color: var(--p4-navy, #132A41);">${areaEquiv.toFixed(2)} m²</td>
              </tr>
            </tfoot>
          </table>

          <!-- Síntese de Eficiência e Receitas -->
          <table class="doc-table" style="margin-top: 4px;">
            <tbody>
              <tr>
                <td style="width: 25%; font-weight:700; background-color:#F8FAFC;">Área Vendável Privativa:</td>
                <td class="td-right" style="width: 25%; font-weight:700; color: var(--p4-green, #16A34A);">${areaPriv.toFixed(2)} m²</td>
                <td style="width: 25%; font-weight:700; background-color:#F8FAFC;">Eficiência Privativa (Priv/Bruta):</td>
                <td class="td-right" style="width: 25%; font-weight:700; color: var(--p4-copper, #B5642A);">${eficiencia}%</td>
              </tr>
              <tr>
                <td style="font-weight:700; background-color:#F8FAFC;">Preço Médio de Venda:</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.precoM2())}/m² priv.</td>
                <td style="font-weight:700; background-color:#F8FAFC;">Receitas Extras / Vagas:</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.receitasExtras())}</td>
              </tr>
              <tr class="highlight-emerald">
                <td colspan="2" style="font-weight: 700;">VALOR GERAL DE VENDAS (VGV TOTAL PROJETADO):</td>
                <td colspan="2" class="td-right font-bold" style="font-size: 8.5pt;">R$ ${this.formatarMoeda(vgv)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. TERRENO & CUSTOS EXTRACONTRATUAIS -->
        <div class="doc-section">
          <div class="doc-section-title">2. Terreno & Custos Extracontratuais (Fora do CUB)</div>
          
          <!-- 2.1 Terreno -->
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 38%;">Aquisição do Terreno</th>
                <th style="width: 24%;">Parâmetro Adotado</th>
                <th class="th-right" style="width: 20%;">Valor Total (R$)</th>
                <th class="th-right" style="width: 18%;">% s/ VGV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${tipoTerrenoLabel}</strong></td>
                <td>${tipoTerrenoDetalhe}</td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(cTerreno)}</td>
                <td class="td-right">${this.getPercVgv(cTerreno)}%</td>
              </tr>
            </tbody>
          </table>

          <!-- 2.2 Custos Extracontratuais -->
          <table class="doc-table" style="margin-top: 4px;">
            <thead>
              <tr>
                <th style="width: 44%;">Custos Extracontratuais (Fora da NBR 12.721)</th>
                <th class="th-right" style="width: 20%;">Valor Total (R$)</th>
                <th class="th-right" style="width: 18%;">R$ / m² Priv.</th>
                <th class="th-right" style="width: 18%;">% s/ VGV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fundações Especiais / Contenções / Estacas</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.custoFundacoesEspeciais() * multipliers.cost)}</td>
                <td class="td-right">${formatM2(this.custoFundacoesEspeciais() * multipliers.cost)}</td>
                <td class="td-right">${this.getPercVgv(this.custoFundacoesEspeciais() * multipliers.cost)}%</td>
              </tr>
              <tr>
                <td>Elevadores & Equipamentos Especiais</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.custoElevadores() * multipliers.cost)}</td>
                <td class="td-right">${formatM2(this.custoElevadores() * multipliers.cost)}</td>
                <td class="td-right">${this.getPercVgv(this.custoElevadores() * multipliers.cost)}%</td>
              </tr>
              <tr>
                <td>Instalações Especiais (Gerador, Pressurização, Climatização)</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.custoInstalacoesEspeciais() * multipliers.cost)}</td>
                <td class="td-right">${formatM2(this.custoInstalacoesEspeciais() * multipliers.cost)}</td>
                <td class="td-right">${this.getPercVgv(this.custoInstalacoesEspeciais() * multipliers.cost)}%</td>
              </tr>
              <tr>
                <td>Lazer, Decoração & Mobiliário de Áreas Comuns</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.custoLazerDecoracao() * multipliers.cost)}</td>
                <td class="td-right">${formatM2(this.custoLazerDecoracao() * multipliers.cost)}</td>
                <td class="td-right">${this.getPercVgv(this.custoLazerDecoracao() * multipliers.cost)}%</td>
              </tr>
              <tr>
                <td>Paisagismo & Urbanização Externa</td>
                <td class="td-right">R$ ${this.formatarMoeda(this.custoPaisagismoUrbanizacao() * multipliers.cost)}</td>
                <td class="td-right">${formatM2(this.custoPaisagismoUrbanizacao() * multipliers.cost)}</td>
                <td class="td-right">${this.getPercVgv(this.custoPaisagismoUrbanizacao() * multipliers.cost)}%</td>
              </tr>
              <tr class="highlight-gray">
                <td><strong>TOTAL CUSTOS EXTRACONTRATUAIS</strong></td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(kpi.scenarioCustosExtracontratuais)}</td>
                <td class="td-right font-bold">${formatM2(kpi.scenarioCustosExtracontratuais)}</td>
                <td class="td-right font-bold">${this.getPercVgv(kpi.scenarioCustosExtracontratuais)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. COMERCIAL, INCORPORAÇÃO & TRIBUTOS -->
        <div class="doc-section">
          <div class="doc-section-title">3. Despesas Comerciais, Projetos & Regime Tributário</div>
          
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 38%;">Despesa / Tributo</th>
                <th style="width: 20%;">Base / Alíquota</th>
                <th class="th-right" style="width: 22%;">Valor Total (R$)</th>
                <th class="th-right" style="width: 20%;">% s/ VGV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Projetos, Sondagens & Licenciamento</td>
                <td>${(this.custoProjetos() || 0).toFixed(1)}% s/ Obra</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.custoProjetosValor)}</td>
                <td class="td-right">${this.getPercVgv(kpi.custoProjetosValor)}%</td>
              </tr>
              <tr>
                <td>Comissão de Corretagem</td>
                <td>${(this.custoCorretagem() || 0).toFixed(1)}% s/ VGV</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.custoCorretagemValor)}</td>
                <td class="td-right">${this.getPercVgv(kpi.custoCorretagemValor)}%</td>
              </tr>
              <tr>
                <td>Marketing & Propaganda</td>
                <td>${(this.custoMarketing() || 0).toFixed(1)}% s/ VGV</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.custoMarketingValor)}</td>
                <td class="td-right">${this.getPercVgv(kpi.custoMarketingValor)}%</td>
              </tr>
              <tr>
                <td>Despesas Legais & Cartório</td>
                <td>${(this.custoDespesasLegais() || 0).toFixed(1)}% s/ VGV</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.custoDespesasLegaisValor)}</td>
                <td class="td-right">${this.getPercVgv(kpi.custoDespesasLegaisValor)}%</td>
              </tr>
              <tr>
                <td>Tributos da Incorporação (${this.regimeTributario().toUpperCase()})</td>
                <td>${this.aliquotaImposto().toFixed(2)}% s/ VGV</td>
                <td class="td-right font-bold" style="color: var(--p4-blue, #2C5AA0);">R$ ${this.formatarMoeda(cImpostos)}</td>
                <td class="td-right">${this.getPercVgv(cImpostos)}%</td>
              </tr>
              ${cFinanc > 0 ? `
                <tr>
                  <td>Custos Financeiros / Juros</td>
                  <td>Taxa / Encargos</td>
                  <td class="td-right">R$ ${this.formatarMoeda(cFinanc)}</td>
                  <td class="td-right">${this.getPercVgv(cFinanc)}%</td>
                </tr>
              ` : ''}
              <tr class="highlight-gray">
                <td colspan="2"><strong>TOTAL COMERCIAL, PROJETOS & TRIBUTOS</strong></td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(cComProj + cImpostos + cFinanc)}</td>
                <td class="td-right font-bold">${this.getPercVgv(cComProj + cImpostos + cFinanc)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. DEMONSTRAÇÃO DE RESULTADOS (DRE DO EMPREENDIMENTO) -->
        <div class="doc-section">
          <div class="doc-section-title">4. Demonstração de Resultados do Exercício (DRE Imobiliário)</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 48%;">Rubrica / Conta Contábil</th>
                <th class="th-right" style="width: 22%;">Valor Total (R$)</th>
                <th class="th-right" style="width: 18%;">R$ / m² Priv.</th>
                <th class="th-right" style="width: 12%;">% s/ VGV</th>
              </tr>
            </thead>
            <tbody>
              <tr class="highlight-emerald">
                <td><strong>(+) VALOR GERAL DE VENDAS (VGV TOTAL)</strong></td>
                <td class="td-right"><strong>R$ ${this.formatarMoeda(vgv)}</strong></td>
                <td class="td-right">${formatM2(vgv)}</td>
                <td class="td-right"><strong>100,0%</strong></td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Custo Base de Construção (CUB NBR 12.721 c/ BDI)</td>
                <td class="td-right" style="color: var(--p4-red, #C75D45);">R$ ${this.formatarMoeda(kpi.scenarioCustoCUB)}</td>
                <td class="td-right">${formatM2(kpi.scenarioCustoCUB)}</td>
                <td class="td-right">${this.getPercVgv(kpi.scenarioCustoCUB)}%</td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Custos Extracontratuais (Fundações, Elevadores, Lazer, etc.)</td>
                <td class="td-right" style="color: var(--p4-red, #C75D45);">R$ ${this.formatarMoeda(kpi.scenarioCustosExtracontratuais)}</td>
                <td class="td-right">${formatM2(kpi.scenarioCustosExtracontratuais)}</td>
                <td class="td-right">${this.getPercVgv(kpi.scenarioCustosExtracontratuais)}%</td>
              </tr>
              <tr class="highlight-gray">
                <td><strong>(=) CUSTO TOTAL DIRETO DE OBRA</strong></td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(cObra)}</td>
                <td class="td-right font-bold">${formatM2(cObra)}</td>
                <td class="td-right font-bold">${this.getPercVgv(cObra)}%</td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Terreno / Permuta</td>
                <td class="td-right">R$ ${this.formatarMoeda(cTerreno)}</td>
                <td class="td-right">${formatM2(cTerreno)}</td>
                <td class="td-right">${this.getPercVgv(cTerreno)}%</td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Projetos, Sondagens & Licenciamento</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.custoProjetosValor)}</td>
                <td class="td-right">${formatM2(kpi.custoProjetosValor)}</td>
                <td class="td-right">${this.getPercVgv(kpi.custoProjetosValor)}%</td>
              </tr>
              <tr style="background-color: #EEF2FF;">
                <td style="font-weight: 700; color: var(--p4-navy, #132A41);">(=) LUCRO BRUTO OPERACIONAL</td>
                <td class="td-right font-bold" style="color: var(--p4-navy, #132A41);">R$ ${this.formatarMoeda(kpi.scenarioLucroBruto)}</td>
                <td class="td-right font-bold" style="color: var(--p4-navy, #132A41);">${formatM2(kpi.scenarioLucroBruto)}</td>
                <td class="td-right font-bold" style="color: var(--p4-navy, #132A41);">${margemBrutaStr}</td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Despesas Comerciais (Corretagem + Marketing + Legais)</td>
                <td class="td-right">R$ ${this.formatarMoeda(kpi.totalCustosComerciais)}</td>
                <td class="td-right">${formatM2(kpi.totalCustosComerciais)}</td>
                <td class="td-right">${this.getPercVgv(kpi.totalCustosComerciais)}%</td>
              </tr>
              <tr>
                <td style="padding-left: 14px;">(-) Tributos da Incorporação (${this.regimeTributario().toUpperCase()})</td>
                <td class="td-right">R$ ${this.formatarMoeda(cImpostos)}</td>
                <td class="td-right">${formatM2(cImpostos)}</td>
                <td class="td-right">${this.getPercVgv(cImpostos)}%</td>
              </tr>
              ${cFinanc > 0 ? `
                <tr>
                  <td style="padding-left: 14px;">(-) Custos Financeiros / Juros</td>
                  <td class="td-right">R$ ${this.formatarMoeda(cFinanc)}</td>
                  <td class="td-right">${formatM2(cFinanc)}</td>
                  <td class="td-right">${this.getPercVgv(cFinanc)}%</td>
                </tr>
              ` : ''}
              <tr class="highlight-gray">
                <td><strong>(=) CUSTO TOTAL GLOBAL DO EMPREENDIMENTO</strong></td>
                <td class="td-right font-bold" style="color: var(--p4-red, #C75D45);">R$ ${this.formatarMoeda(cTotal)}</td>
                <td class="td-right font-bold">${formatM2(cTotal)}</td>
                <td class="td-right font-bold">${this.getPercVgv(cTotal)}%</td>
              </tr>
              <tr class="highlight-emerald" style="border-top: 2px solid var(--p4-green, #2E7D5B);">
                <td style="font-size: 8.5pt;"><strong>(=) LUCRO LÍQUIDO FINAL (RESULTADO REAL)</strong></td>
                <td class="td-right font-bold" style="font-size: 8.5pt;"><strong>R$ ${this.formatarMoeda(lucroLiq)}</strong></td>
                <td class="td-right font-bold" style="font-size: 8.5pt;"><strong>${formatM2(lucroLiq)}</strong></td>
                <td class="td-right font-bold" style="font-size: 8.5pt;"><strong>${margemLiqPerc}%</strong></td>
              </tr>
            </tbody>
          </table>

          <!-- Indicadores de Rentabilidade -->
          <div class="doc-kpi-grid">
            <div class="doc-kpi-card emerald">
              <div class="doc-kpi-label">Margem Líquida</div>
              <div class="doc-kpi-val">${margemLiqPerc}%</div>
            </div>
            <div class="doc-kpi-card navy">
              <div class="doc-kpi-label">TIR Projetada</div>
              <div class="doc-kpi-val">${tirStr}</div>
            </div>
            <div class="doc-kpi-card">
              <div class="doc-kpi-label">VPL (TMA ${(this.tmaAnual() || 12).toFixed(1)}%)</div>
              <div class="doc-kpi-val" style="font-size: 8.5pt;">${vplStr}</div>
            </div>
            <div class="doc-kpi-card">
              <div class="doc-kpi-label">Exposição Máx. Caixa</div>
              <div class="doc-kpi-val" style="font-size: 8.5pt; color: var(--p4-red, #C75D45);">${expStr}</div>
            </div>
          </div>
        </div>

        <!-- 5. MATRIZ DE SENSIBILIDADE -->
        <div class="doc-section">
          <div class="doc-section-title">5. Matriz de Sensibilidade Bidirecional (Preço vs. Custo)</div>
          <p style="font-size: 7.2pt; color: #64748B; margin: 0 0 6px 0;">Impacto de variações simultâneas no Preço de Venda e no Custo Direto de Obra sobre a Margem Líquida (%) e Lucro Real (R$). A célula em destaque amarelo representa o Cenário Base.</p>
          ${sensibilidadeTableHtml}
        </div>

        <!-- 6. CURVA S & FLUXO DE CAIXA MENSAL -->
        <div class="doc-section">
          <div class="doc-section-title">6. Cronograma Físico-Financeiro, Curva S & Fluxo de Caixa Mensal</div>
          <table class="doc-table" style="font-size: 6.8pt; line-height: 1.2;">
            <thead>
              <tr>
                <th class="th-center" style="width: 8%;">Mês</th>
                <th class="th-right" style="width: 14%;">Entradas (R$)</th>
                <th class="th-right" style="width: 14%;">Custo Obra (R$)</th>
                <th class="th-right" style="width: 15%;">Terreno + Taxas (R$)</th>
                <th class="th-right" style="width: 15%;">Total Saídas (R$)</th>
                <th class="th-right" style="width: 15%;">Fluxo Líquido (R$)</th>
                <th class="th-right" style="width: 15%;">Saldo Acum. (R$)</th>
                <th class="th-center" style="width: 9%;">Obra (%)</th>
              </tr>
            </thead>
            <tbody>
              ${fluxoCaixaRows}
            </tbody>
          </table>
        </div>

        <!-- 7. BENCHMARKING DO CUB NACIONAL -->
        <div class="doc-section">
          <div class="doc-section-title">7. Benchmarking do CUB Nacional (Sinduscon Brasil)</div>
          <p style="font-size: 7.2pt; color: #64748B; margin: 0 0 6px 0;">Comparativo do custo direto desta mesma tipologia (${this.params().tipo} - ${this.params().padrao}) em diferentes estados da federação.</p>
          
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 30%;">Estado (UF)</th>
                <th class="th-right" style="width: 25%;">Custo Estimado c/ BDI (R$)</th>
                <th class="th-right" style="width: 25%;">Diferença vs ${estadoProj}</th>
                <th class="th-center" style="width: 20%;">Variação (%)</th>
              </tr>
            </thead>
            <tbody>
              ${benchmarkingRows}
            </tbody>
          </table>
        </div>

        <!-- 8. ENGENHARIA DE VALOR & OTIMIZAÇÃO DE CUSTOS -->
        <div class="doc-section">
          <div class="doc-section-title">8. Engenharia de Valor & Otimização Construtiva</div>
          
          <!-- 8.1 Distribuição por Etapas -->
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 45%;">Etapa Construtiva</th>
                <th class="th-center" style="width: 15%;">Peso (%)</th>
                <th class="th-right" style="width: 22%;">Custo Estimado (R$)</th>
                <th class="th-right" style="width: 18%;">R$ / m² Eq.</th>
              </tr>
            </thead>
            <tbody>
              ${etapasRows}
            </tbody>
            <tfoot>
              <tr class="highlight-gray">
                <td><strong>TOTAL CUSTO CUB DA OBRA</strong></td>
                <td class="td-center font-bold">100,0%</td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(kpi.scenarioCustoCUB)}</td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(areaEquiv > 0 ? kpi.scenarioCustoCUB / areaEquiv : 0)}/m²</td>
              </tr>
            </tfoot>
          </table>

          <!-- 8.2 Oportunidades de Otimização -->
          <div style="background-color: #F8FAFC; border: 1px solid var(--p4-rule, #CBD5E1); border-radius: 6px; padding: 10px 12px; margin-top: 8px;">
            <div style="font-family: 'Poppins', sans-serif; font-size: 8pt; font-weight: 700; color: var(--p4-navy, #132A41); margin-bottom: 6px; text-transform: uppercase;">
              Diretrizes Técnicas de Redução de Desperdício e Engenharia de Valor
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 7.2pt; color: #334155; line-height: 1.45;">
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px;">
                <strong style="color: var(--p4-copper, #B5642A); display: block; margin-bottom: 2px;">1. Superestrutura & Alvenaria</strong>
                Avaliar lajes nervuradas com cubetas plásticas ou alvenaria de vedação com bloco cerâmico de precisão para reduzir consumo de concreto e espessura de argamassa/reboco.
              </div>
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px;">
                <strong style="color: var(--p4-navy, #132A41); display: block; margin-bottom: 2px;">2. Revestimentos & Pisos</strong>
                Padronizar modulação de porcelanatos nos banheiros, cozinhas e sacadas para limitar perda por corte e desperdício de peças a menos de 5%.
              </div>
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px;">
                <strong style="color: var(--p4-green, #16A34A); display: block; margin-bottom: 2px;">3. Esquadrias & Vidros</strong>
                Fechamento de pacotes em lote único com linhas padronizadas de alumínio anodizado garantindo ganhos de escala de 10% a 15% junto a fornecedores certificados.
              </div>
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px;">
                <strong style="color: var(--p4-blue, #2C5AA0); display: block; margin-bottom: 2px;">4. Fundações & Contenções</strong>
                Compatibilização de sondagens SPT e CPTu com modelos de interação solo-estrutura para otimização de estacas e blocos de coroamento.
              </div>
            </div>
          </div>
        </div>

        <!-- NOTA METODOLÓGICA LEGAL -->
        <div class="doc-legal-note" style="margin-top: 14px; font-size: 7pt; color: #64748B; border-top: 1px solid var(--p4-rule, #CBD5E1); padding-top: 6px;">
          <strong>Nota Metodológica:</strong> Estudo paramétrico de viabilidade fundamentado na NBR 12.721 (Avaliação de custos unitários e preparo de orçamento para incorporação de edifício) e índices do Custo Unitário Básico (CUB/m²) divulgados pelos respectivos Sinduscons estaduais. Os valores extracontratuais, tributários e comerciais devem ser confirmados com os projetos executivos de engenharia e sondagem geológica.
        </div>
      `;

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: 'Relatório Executivo de Viabilidade Imobiliária',
          subtituloDocumento: 'Engenharia de Custos & Avaliações • NBR 12.721 / CUB-Sinduscon',
          nomeAgente: 'Agente de Custos e Viabilidade'
        },
        corpoHtml
      );
    } catch (err) {
      console.error('Erro ao gerar relatório de viabilidade em PDF:', err);
      this.motorPdfService.exibirToast('Ocorreu um erro ao emitir o relatório em PDF. Verifique seus dados e tente novamente.', 'erro');
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

  // =========================================================================
  // GESTÃO DE PROJETOS SALVOS (Viabilidade Imobiliária)
  // =========================================================================

  exibirToast(texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    this.toastMensagem.set({ texto, tipo });
    setTimeout(() => {
      this.toastMensagem.set(null);
    }, 3500);
  }

  obterNomeProjetoSugerido(): string {
    const nome = this.nomeProjeto()?.trim() || 'Residencial';
    const ind = this.indice() || 'R-8';
    return `${nome} (${ind})`;
  }

  serializarDadosFormulario(): any {
    return {
      nomeProjeto: this.nomeProjeto(),
      responsavelTecnico: this.responsavelTecnico(),
      creaCau: this.creaCau(),
      estado: this.estado(),
      indice: this.indice(),
      bdi: this.bdi(),
      areaVendavel: this.areaVendavel(),
      precoM2: this.precoM2(),
      receitasExtras: this.receitasExtras(),
      tipoTerreno: this.tipoTerreno(),
      custoTerreno: this.custoTerreno(),
      permutaFisicaPerc: this.permutaFisicaPerc(),
      permutaFinanceiraPerc: this.permutaFinanceiraPerc(),
      custoFundacoesEspeciais: this.custoFundacoesEspeciais(),
      custoElevadores: this.custoElevadores(),
      custoInstalacoesEspeciais: this.custoInstalacoesEspeciais(),
      custoLazerDecoracao: this.custoLazerDecoracao(),
      custoPaisagismoUrbanizacao: this.custoPaisagismoUrbanizacao(),
      custoProjetos: this.custoProjetos(),
      custoMarketing: this.custoMarketing(),
      custoCorretagem: this.custoCorretagem(),
      custoDespesasLegais: this.custoDespesasLegais(),
      custoFinanciamento: this.custoFinanciamento(),
      regimeTributario: this.regimeTributario(),
      prazoConstrucaoMeses: this.prazoConstrucaoMeses(),
      prazoVendasMeses: this.prazoVendasMeses(),
      tmaAnual: this.tmaAnual(),
      areas: this.areas(),
      abaAtiva: this.abaAtiva(),
      cenarioAtivo: this.cenarioAtivo()
    };
  }

  deserializarDadosFormulario(dados: any): void {
    if (!dados) return;

    if (dados.nomeProjeto !== undefined) this.nomeProjeto.set(dados.nomeProjeto);
    if (dados.responsavelTecnico !== undefined) this.responsavelTecnico.set(dados.responsavelTecnico);
    if (dados.creaCau !== undefined) this.creaCau.set(dados.creaCau);
    if (dados.estado !== undefined) this.estado.set(dados.estado);
    if (dados.indice !== undefined) this.indice.set(dados.indice);
    if (dados.bdi !== undefined) this.bdi.set(dados.bdi);
    if (dados.areaVendavel !== undefined) this.areaVendavel.set(dados.areaVendavel);
    if (dados.precoM2 !== undefined) this.precoM2.set(dados.precoM2);
    if (dados.receitasExtras !== undefined) this.receitasExtras.set(dados.receitasExtras);

    if (dados.tipoTerreno !== undefined) this.tipoTerreno.set(dados.tipoTerreno);
    if (dados.custoTerreno !== undefined) this.custoTerreno.set(dados.custoTerreno);
    if (dados.permutaFisicaPerc !== undefined) this.permutaFisicaPerc.set(dados.permutaFisicaPerc);
    if (dados.permutaFinanceiraPerc !== undefined) this.permutaFinanceiraPerc.set(dados.permutaFinanceiraPerc);

    if (dados.custoFundacoesEspeciais !== undefined) this.custoFundacoesEspeciais.set(dados.custoFundacoesEspeciais);
    if (dados.custoElevadores !== undefined) this.custoElevadores.set(dados.custoElevadores);
    if (dados.custoInstalacoesEspeciais !== undefined) this.custoInstalacoesEspeciais.set(dados.custoInstalacoesEspeciais);
    if (dados.custoLazerDecoracao !== undefined) this.custoLazerDecoracao.set(dados.custoLazerDecoracao);
    if (dados.custoPaisagismoUrbanizacao !== undefined) this.custoPaisagismoUrbanizacao.set(dados.custoPaisagismoUrbanizacao);

    if (dados.custoProjetos !== undefined) this.custoProjetos.set(dados.custoProjetos);
    if (dados.custoMarketing !== undefined) this.custoMarketing.set(dados.custoMarketing);
    if (dados.custoCorretagem !== undefined) this.custoCorretagem.set(dados.custoCorretagem);
    if (dados.custoDespesasLegais !== undefined) this.custoDespesasLegais.set(dados.custoDespesasLegais);
    if (dados.custoFinanciamento !== undefined) this.custoFinanciamento.set(dados.custoFinanciamento);

    if (dados.regimeTributario !== undefined) this.regimeTributario.set(dados.regimeTributario);
    if (dados.prazoConstrucaoMeses !== undefined) this.prazoConstrucaoMeses.set(dados.prazoConstrucaoMeses);
    if (dados.prazoVendasMeses !== undefined) this.prazoVendasMeses.set(dados.prazoVendasMeses);
    if (dados.tmaAnual !== undefined) this.tmaAnual.set(dados.tmaAnual);

    if (dados.areas !== undefined) this.areas.set(dados.areas);
    if (dados.abaAtiva !== undefined) this.abaAtiva.set(dados.abaAtiva);
    if (dados.cenarioAtivo !== undefined) this.cenarioAtivo.set(dados.cenarioAtivo);
  }

  clicarSalvarProjeto(): void {
    if (this.projetoAtualId()) {
      this.executarAtualizarProjeto();
    } else {
      const sugerido = this.obterNomeProjetoSugerido();
      this.modalSalvarNomeInput.set(sugerido);
      this.modalSalvarAberto.set(true);
    }
  }

  clicarSalvarComoNovo(): void {
    const sugerido = `${this.obterNomeProjetoSugerido()} (Cópia)`;
    this.modalSalvarNomeInput.set(sugerido);
    this.modalSalvarAberto.set(true);
  }

  async confirmarSalvarNovoProjeto(): Promise<void> {
    const nome = this.modalSalvarNomeInput().trim();
    if (!nome) {
      this.exibirToast('Digite um nome para o estudo de viabilidade.', 'erro');
      return;
    }

    this.salvandoProjeto.set(true);
    try {
      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.salvarProjeto('viabilidade', nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao salvar: ${res.error.message}`, 'erro');
      } else {
        this.projetoAtualId.set(res.id || null);
        this.projetoAtualNome.set(nome);
        this.modalSalvarAberto.set(false);
        this.exibirToast(`Estudo "${nome}" salvo com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao salvar estudo: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async executarAtualizarProjeto(): Promise<void> {
    const id = this.projetoAtualId();
    if (!id) return;

    this.salvandoProjeto.set(true);
    try {
      const nome = this.projetoAtualNome() || this.obterNomeProjetoSugerido();
      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.atualizarProjeto(id, nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao atualizar: ${res.error.message}`, 'erro');
      } else {
        this.exibirToast(`Estudo "${nome}" atualizado com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao atualizar estudo: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async abrirModalMeusProjetos(): Promise<void> {
    this.modalProjetosAberto.set(true);
    this.carregandoProjetos.set(true);
    try {
      const lista = await this.supabaseService.listarMeusProjetos('viabilidade');
      this.listaProjetosSalvos.set(lista);
    } catch (err) {
      console.error('Erro ao listar estudos salvos:', err);
    } finally {
      this.carregandoProjetos.set(false);
    }
  }

  abrirProjetoSalvo(proj: any): void {
    try {
      this.deserializarDadosFormulario(proj.dados_formulario);
      this.projetoAtualId.set(proj.id);
      this.projetoAtualNome.set(proj.nome_projeto);
      this.modalProjetosAberto.set(false);
      this.exibirToast(`Estudo "${proj.nome_projeto}" carregado com sucesso!`, 'sucesso');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      this.exibirToast(`Erro ao carregar estudo: ${err?.message || err}`, 'erro');
    }
  }

  async confirmarExcluirProjeto(proj: any, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Deseja realmente excluir o estudo de viabilidade "${proj.nome_projeto}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await this.supabaseService.excluirProjeto(proj.id);
      if (res.error) {
        this.exibirToast(`Erro ao excluir: ${res.error.message}`, 'erro');
      } else {
        if (this.projetoAtualId() === proj.id) {
          this.projetoAtualId.set(null);
          this.projetoAtualNome.set('');
        }
        this.listaProjetosSalvos.update(l => l.filter(p => p.id !== proj.id));
        this.exibirToast(`Estudo "${proj.nome_projeto}" excluído.`, 'info');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao excluir estudo: ${err?.message || err}`, 'erro');
    }
  }

  formatarDataProjeto(dataIso: string): string {
    if (!dataIso) return '-';
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
      return dataIso;
    }
  }
}
