import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { MotorPdfService } from '../../../services/motor-pdf.service';

export type MesChave = 'jan' | 'fev' | 'mar' | 'abr' | 'mai' | 'jun' | 'jul' | 'ago' | 'set' | 'out' | 'nov' | 'dez';

export type IndiceMensal = Record<MesChave, number | null>;

export type TipoDocumento = 'parecer' | 'oficio' | 'resumo' | 'pontos' | 'estruturado';

export const BANCO_DE_INDICES: Record<string, Record<number, IndiceMensal>> = {
  // Coluna 35 (Edificação):
  coluna35: {
    2017: { jan: 691.792, fev: 696.314, mar: 697.410, abr: 697.244, mai: 701.664, jun: 708.197, jul: 710.355, ago: 712.884, set: 713.330, out: 715.527, nov: 717.751, dez: 718.276 },
    2018: { jan: 720.495, fev: 721.414, mar: 723.163, abr: 725.245, mai: 726.923, jun: 733.984, jul: 738.487, ago: 739.583, set: 741.305, out: 743.866, nov: 744.865, dez: 745.856 },
    2019: { jan: 749.517, fev: 750.180, mar: 752.524, abr: 755.373, mai: 755.625, jun: 762.304, jul: 766.699, ago: 769.951, set: 773.520, out: 774.939, nov: 775.225, dez: 776.839 },
    2020: { jan: 779.766, fev: 782.336, mar: 784.338, abr: 786.070, mai: 787.666, jun: 790.331, jul: 799.589, ago: 805.356, set: 814.701, out: 828.778, nov: 839.382, dez: 845.268 },
    2021: { jan: 852.809, fev: 868.929, mar: 880.265, abr: 888.191, mai: 907.899, jun: 927.512, jul: 935.359, ago: 939.699, set: 944.520, out: 952.596, nov: 959.001, dez: 962.321 },
    2022: { jan: 969.184, fev: 972.904, mar: 981.244, abr: 990.543, mai: 1013.164, jun: 1034.824, jul: 1043.760, ago: 1044.679, set: 1045.616, out: 1046.896, nov: 1050.701, dez: 1051.632 },
    2023: { jan: 1056.418, fev: 1056.896, mar: 1060.116, abr: 1061.635, mai: 1067.919, jun: 1075.540, jul: 1076.626, ago: 1078.412, set: 1082.104, out: 1084.242, nov: 1084.986, dez: 1088.312 },
    2024: { jan: 1091.250, fev: 1092.685, mar: 1095.738, abr: 1101.389, mai: 1110.887, jun: 1118.827, jul: 1126.916, ago: 1134.775, set: 1141.398, out: 1149.170, nov: 1153.725, dez: 1159.536 },
    2025: { jan: 1169.116, fev: 1173.775, mar: 1178.386, abr: 1184.462, mai: 1191.327, jun: 1199.509, jul: 1210.471, ago: 1216.706, set: 1218.747, out: 1222.356, nov: 1225.633, dez: 1228.161 },
    2026: { jan: 1237.036, fev: null, mar: null, abr: null, mai: null, jun: null, jul: null, ago: null, set: null, out: null, nov: null, dez: null }
  },

  // Coluna 39 (Consultoria — Supervisão e Projetos):
  coluna39: {
    2017: { jan: 213.434, fev: 214.391, mar: 213.959, abr: 215.335, mai: 215.284, jun: 216.176, jul: 216.619, ago: 216.648, set: 216.929, out: 217.651, nov: 218.058, dez: 218.489 },
    2018: { jan: 220.124, fev: 220.741, mar: 221.529, abr: 222.090, mai: 222.637, jun: 223.109, jul: 223.233, ago: 223.328, set: 223.666, out: 224.273, nov: 225.130, dez: 225.392 },
    2019: { jan: 226.409, fev: 226.117, mar: 225.755, abr: 226.119, mai: 227.136, jun: 229.966, jul: 230.827, ago: 230.783, set: 231.019, out: 231.095, nov: 234.647, dez: 236.550 },
    2020: { jan: 239.086, fev: 239.690, mar: 239.613, abr: 239.055, mai: 239.395, jun: 240.003, jul: 240.929, ago: 242.103, set: 243.718, out: 244.381, nov: 244.838, dez: 245.291 },
    2021: { jan: 245.714, fev: 245.836, mar: 245.977, abr: 247.326, mai: 247.645, jun: 249.937, jul: 251.077, ago: 251.964, set: 252.425, out: 255.766, nov: 256.725, dez: 257.148 },
    2022: { jan: 258.009, fev: 259.050, mar: 259.785, abr: 259.913, mai: 260.548, jun: 263.502, jul: 266.491, ago: 269.720, set: 270.288, out: 271.372, nov: 273.773, dez: 273.676 },
    2023: { jan: 276.133, fev: 277.437, mar: 277.093, abr: 277.972, mai: 277.437, jun: 282.935, jul: 287.460, ago: 289.599, set: 289.838, out: 291.498, nov: 290.486, dez: 290.189 },
    2024: { jan: 290.267, fev: 288.772, mar: 289.857, abr: 289.583, mai: 290.572, jun: 293.836, jul: 295.845, ago: 297.481, set: 298.840, out: 299.182, nov: 299.315, dez: 300.001 },
    2025: { jan: 302.160, fev: 302.831, mar: 303.687, abr: 303.675, mai: 303.563, jun: 304.106, jul: 307.564, ago: 307.870, set: 309.407, out: 309.985, nov: 309.818, dez: 310.838 },
    2026: { jan: 311.800, fev: null, mar: null, abr: null, mai: null, jun: null, jul: null, ago: null, set: null, out: null, nov: null, dez: null }
  }
};

export const LISTA_MESES: { id: MesChave; nome: string }[] = [
  { id: 'jan', nome: 'Janeiro' },
  { id: 'fev', nome: 'Fevereiro' },
  { id: 'mar', nome: 'Março' },
  { id: 'abr', nome: 'Abril' },
  { id: 'mai', nome: 'Maio' },
  { id: 'jun', nome: 'Junho' },
  { id: 'jul', nome: 'Julho' },
  { id: 'ago', nome: 'Agosto' },
  { id: 'set', nome: 'Setembro' },
  { id: 'out', nome: 'Outubro' },
  { id: 'nov', nome: 'Novembro' },
  { id: 'dez', nome: 'Dezembro' }
];

export const LISTA_ANOS: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

@Component({
  selector: 'app-reajuste-contrato',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fadeIn">

      <!-- 1. Cabeçalho Institucional do Agente -->
      <div class="bg-[#132A41] text-white rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#B5642A_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B5642A]/20 text-[#E59866] text-xs font-bold border border-[#B5642A]/40">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Agente de Automação Técnica • AmorimTech</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Reajuste de Contratos Públicos</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cálculo automatizado do índice de reajustamento por FGV/SINAENCO (Coluna 35 - Edificação ou Coluna 39 - Consultoria e Projetos) com geração e revisão editável de 4 tipos de documentos e relatório técnico em PDF.
            </p>
          </div>

          <!-- Ações do Cabeçalho -->
          <div class="shrink-0 self-start md:self-auto flex flex-wrap items-center md:justify-end gap-2.5">
            <button
              type="button"
              (click)="abrirModalMeusProjetos()"
              class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Ver meus contratos/reajustes salvos"
            >
              <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Meus Projetos Salvos</span>
            </button>

            <button
              type="button"
              (click)="clicarSalvarProjeto()"
              [disabled]="salvandoProjeto()"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
              [title]="projetoAtualId() ? 'Atualizar contrato salvo' : 'Salvar dados do contrato'"
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
                <span>{{ projetoAtualId() ? 'Salvar Alterações' : 'Salvar Projeto' }}</span>
              }
            </button>

            @if (projetoAtualId()) {
              <button
                type="button"
                (click)="clicarSalvarComoNovo()"
                class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
                title="Salvar como um novo projeto"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Como Novo</span>
              </button>
            }

            <button
              type="button"
              (click)="carregarExemploReal()"
              class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Carregar dados de exemplo Edital 001/2018"
            >
              <svg class="w-3.5 h-3.5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Exemplo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- FLUXO ETAPA 1: FORMULÁRIO E CÁLCULO PRINCIPAL -->
      <!-- ===================================================================== -->
      @if (etapa() === 'formulario') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Formulário Principal (8 Colunas) -->
          <div class="lg:col-span-8 space-y-6">

            <!-- BLOCO A: IDENTIFICAÇÃO DO CONTRATO -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-black text-xs">
                  A
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Identificação do Contrato
                  </h4>
                  <p class="text-xs text-slate-500">Dados cadastrais do edital e das partes envolvidas</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Edital -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Edital / Processo</label>
                  <input
                    type="text"
                    [value]="edital()"
                    (input)="edital.set($any($event.target).value)"
                    placeholder="Ex: 001/2018"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- Modalidade -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Modalidade de Licitação</label>
                  <input
                    type="text"
                    [value]="modalidade()"
                    (input)="modalidade.set($any($event.target).value)"
                    placeholder="Ex: Tomada de Preço / Concorrência Pública"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- Contratante -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Contratante (Órgão / Cliente)</label>
                  <input
                    type="text"
                    [value]="contratante()"
                    (input)="contratante.set($any($event.target).value)"
                    placeholder="Ex: Autarquia Federal / Prefeitura Municipal"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- Número do Contrato -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Número do Contrato</label>
                  <input
                    type="text"
                    [value]="numeroContrato()"
                    (input)="numeroContrato.set($any($event.target).value)"
                    placeholder="Ex: 042/2018"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- Empresa Contratada -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Empresa Contratada</label>
                  <input
                    type="text"
                    [value]="empresaContratada()"
                    (input)="empresaContratada.set($any($event.target).value)"
                    placeholder="Razão social da empresa contratada"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- CNPJ Contratada -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">CNPJ da Contratada</label>
                  <input
                    type="text"
                    [value]="cnpjContratada()"
                    (input)="cnpjContratada.set($any($event.target).value)"
                    placeholder="00.000.000/0000-00"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>
              </div>

              <!-- Objeto do Contrato -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">Objeto do Contrato</label>
                <textarea
                  rows="3"
                  [value]="objeto()"
                  (input)="objeto.set($any($event.target).value)"
                  placeholder="Descrição técnica dos serviços contratados..."
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                ></textarea>
              </div>
            </div>

            <!-- BLOCO B: PARÂMETROS DO CÁLCULO -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-black text-xs">
                  B
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Parâmetros do Cálculo
                  </h4>
                  <p class="text-xs text-slate-500">Seleção dos índices FGV/SINAENCO e valores da medição</p>
                </div>
              </div>

              <!-- Categoria do Índice -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">Categoria do Índice (FGV)</label>
                <select
                  [value]="categoriaIndice()"
                  (change)="onCategoriaChange($any($event.target).value)"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all font-semibold"
                >
                  <option value="coluna39">Consultoria — Projeto e Fiscalização (Coluna 39)</option>
                  <option value="coluna35">Edificação — Execução de Obra (Coluna 35 - INCC)</option>
                </select>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Período da Medição -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Período da Medição (Texto ou Intervalo)</label>
                  <input
                    type="text"
                    [value]="periodoMedicao()"
                    (input)="periodoMedicao.set($any($event.target).value)"
                    placeholder="Ex: 01/09/2020 a 30/09/2020"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>

                <!-- Número da Medição -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">Número da Medição</label>
                  <input
                    type="text"
                    [value]="numeroMedicao()"
                    (input)="numeroMedicao.set($any($event.target).value)"
                    placeholder="Ex: 22"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>
              </div>

              <!-- Seletores dos Índices Io e Ii -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <!-- Índice Inicial Io -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>📌 Índice Inicial (Io) — Base da Proposta</span>
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <select
                      [value]="mesIo()"
                      (change)="onMesIoChange($any($event.target).value)"
                      class="bg-white text-xs text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden font-medium"
                    >
                      @for (m of mesesDisponiveis; track m.id) {
                        <option [value]="m.id">{{ m.nome }}</option>
                      }
                    </select>

                    <select
                      [value]="anoIo()"
                      (change)="onAnoIoChange(+$any($event.target).value)"
                      class="bg-white text-xs text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden font-medium"
                    >
                      @for (ano of anosDisponiveis; track ano) {
                        <option [value]="ano">{{ ano }}</option>
                      }
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-semibold text-slate-600">Valor do Índice Io</label>
                    <input
                      type="number"
                      step="0.001"
                      [value]="valorIo()"
                      (input)="valorIo.set(+$any($event.target).value || 0)"
                      placeholder="Ex: 223.666"
                      class="w-full bg-white text-xs text-slate-900 font-bold rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden"
                    />
                  </div>
                </div>

                <!-- Índice Final Ii -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🎯 Índice de Reajuste (Ii) — Medição</span>
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <select
                      [value]="mesIi()"
                      (change)="onMesIiChange($any($event.target).value)"
                      class="bg-white text-xs text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden font-medium"
                    >
                      @for (m of mesesDisponiveis; track m.id) {
                        <option [value]="m.id">{{ m.nome }}</option>
                      }
                    </select>

                    <select
                      [value]="anoIi()"
                      (change)="onAnoIiChange(+$any($event.target).value)"
                      class="bg-white text-xs text-slate-900 rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden font-medium"
                    >
                      @for (ano of anosDisponiveis; track ano) {
                        <option [value]="ano">{{ ano }}</option>
                      }
                    </select>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[11px] font-semibold text-slate-600">Valor do Índice Ii</label>
                    <input
                      type="number"
                      step="0.001"
                      [value]="valorIi()"
                      (input)="valorIi.set(+$any($event.target).value || 0)"
                      placeholder="Ex: 243.718"
                      class="w-full bg-white text-xs text-slate-900 font-bold rounded-lg p-2.5 border border-slate-300 focus:border-[#132A41] outline-hidden"
                    />
                  </div>
                </div>

              </div>

              <!-- Texto explicativo da fonte dos índices -->
              <p class="text-[11px] text-slate-500 italic">
                Índices conforme SINAENCO — atualizados periodicamente pelo administrador.
              </p>

              <!-- Valor Total da Medição V -->
              <div class="space-y-1.5 pt-2">
                <label class="text-xs font-bold text-slate-700">Valor Total da Medição a Preços Iniciais (V em R$)</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    [value]="valorMedicao()"
                    (input)="valorMedicao.set(+$any($event.target).value || 0)"
                    placeholder="Ex: 22083.64"
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 font-bold rounded-xl pl-10 pr-4 py-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>

            <!-- BLOCO C: RETENÇÕES NA FONTE -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs">
                    C
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Retenções na Fonte (Opcional)
                    </h4>
                    <p class="text-xs text-slate-500">Cálculo de deduções tributárias sobre o valor do reajuste</p>
                  </div>
                </div>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="incluirRetencoes()"
                    (change)="incluirRetencoes.set(!incluirRetencoes())"
                    class="w-4 h-4 text-[#132A41] rounded-md border-slate-300 focus:ring-[#132A41]"
                  />
                  <span class="text-xs font-bold text-slate-700 select-none">Incluir Retenções</span>
                </label>
              </div>

              @if (incluirRetencoes()) {
                <div class="space-y-4 pt-1 animate-fadeIn">
                  <p class="text-xs text-slate-600">
                    Defina as alíquotas percentuais a serem retidas na fonte sobre o montante apurado de reajuste:
                  </p>

                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700">PIS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        [value]="aliquotaPis()"
                        (input)="aliquotaPis.set(+$any($event.target).value || 0)"
                        class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700">CSLL (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        [value]="aliquotaCsll()"
                        (input)="aliquotaCsll.set(+$any($event.target).value || 0)"
                        class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700">IRPJ (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        [value]="aliquotaIrpj()"
                        (input)="aliquotaIrpj.set(+$any($event.target).value || 0)"
                        class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700">COFINS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        [value]="aliquotaCofins()"
                        (input)="aliquotaCofins.set(+$any($event.target).value || 0)"
                        class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="text-[11px] font-bold text-slate-700">ISS (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        [value]="aliquotaIss()"
                        (input)="aliquotaIss.set(+$any($event.target).value || 0)"
                        class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                      />
                    </div>
                  </div>

                  <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
                    <span>Alíquota Total Acumulada de Retenções:</span>
                    <span class="font-black">{{ totalAliquotaRetencoes() | number:'1.2-2' }}%</span>
                  </div>
                </div>
              }

            </div>

          </div>

          <!-- Painel Lateral de Resultados & Geração do Documento (4 Colunas) -->
          <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

            <!-- Card de Resultados do Cálculo -->
            <div class="bg-[#132A41] text-white rounded-3xl p-6 border border-slate-700 shadow-md space-y-5">
              
              <div class="flex items-center justify-between pb-3 border-b border-slate-700">
                <span class="text-xs font-black text-[#E59866] uppercase tracking-wider">
                  Resumo do Cálculo
                </span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                  Fórmula R = (Ii - Io)/Io × V
                </span>
              </div>

              <!-- Fator de Reajuste -->
              <div class="space-y-1">
                <div class="text-[11px] text-slate-300 font-semibold">Fator de Reajuste (8 decimais)</div>
                <div class="text-xl font-mono font-black text-white tracking-wider">
                  {{ fatorCalculado() | number:'1.8-8' }}
                </div>
                <div class="text-xs text-[#E59866] font-bold">
                  Variação: +{{ percentualCalculado() | number:'1.2-2' }}%
                </div>
              </div>

              <!-- Valor Bruto do Reajuste -->
              <div class="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                <div class="text-xs text-slate-300 font-medium">Total do Reajuste (Bruto)</div>
                <div class="text-2xl sm:text-3xl font-black text-[#E59866]">
                  R$ {{ valorReajusteCalculado() | number:'1.2-2' }}
                </div>
              </div>

              <!-- Valor Total com Reajuste -->
              <div class="space-y-1 pt-1">
                <div class="text-xs text-slate-300 font-medium">Valor Total da Medição + Reajuste</div>
                <div class="text-lg font-black text-white">
                  R$ {{ valorTotalCalculado() | number:'1.2-2' }}
                </div>
              </div>

              <!-- Seção de Retenções no Resumo -->
              @if (incluirRetencoes() && valorReajusteCalculado() > 0) {
                <div class="pt-4 border-t border-slate-700 space-y-2 text-xs">
                  <div class="flex justify-between text-slate-300">
                    <span>(-) Total Retenções ({{ totalAliquotaRetencoes() | number:'1.2-2' }}%):</span>
                    <span class="font-bold text-red-300">- R$ {{ totalRetencoesCalculado() | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-700/60">
                    <span>Reajuste Líquido:</span>
                    <span class="text-emerald-400">R$ {{ reajusteLiquidoCalculado() | number:'1.2-2' }}</span>
                  </div>
                </div>
              }

              <!-- Botão Principal: Abrir Seleção de Documento -->
              <button
                type="button"
                (click)="abrirSelecaoDocumento()"
                [disabled]="valorIo() <= 0 || valorIi() <= 0 || valorMedicao() <= 0"
                [class]="valorIo() > 0 && valorIi() > 0 && valorMedicao() > 0
                  ? 'bg-[#B5642A] hover:bg-[#9c5220] text-white shadow-lg shadow-[#B5642A]/30 cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'"
                class="w-full py-4 px-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Gerar Documento</span>
              </button>

            </div>

            <!-- Card Informativo com a Fórmula Oficial -->
            <div class="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600">
              <h5 class="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>📐 Memória da Fórmula Legal</span>
              </h5>
              <div class="p-3 bg-slate-50 rounded-xl font-mono text-center text-slate-800 font-bold text-xs border border-slate-200">
                R = [(Ii - Io) / Io] × V
              </div>
              <ul class="space-y-1 text-[11px] text-slate-500">
                <li>• <strong>R</strong> = Valor do reajuste financeiro procurado</li>
                <li>• <strong>Io</strong> = Índice no mês de apresentação da proposta</li>
                <li>• <strong>Ii</strong> = Índice no mês de execução da medição</li>
                <li>• <strong>V</strong> = Valor a preços iniciais dos serviços medidos</li>
              </ul>
            </div>

          </div>

        </div>
      }

      <!-- ===================================================================== -->
      <!-- FLUXO ETAPA 2: SELEÇÃO DO TIPO DE DOCUMENTO (4 MODELOS + ESTRUTURADO) -->
      <!-- ===================================================================== -->
      @if (etapa() === 'selecao') {
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#132A41]/10 text-[#132A41] text-xs font-bold mb-2">
                <span>Etapa 2 de 3</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">
                Selecione o Tipo de Documento
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Escolha o formato e a redação adequada para o objetivo do seu reajuste contratual.
              </p>
            </div>

            <button
              type="button"
              (click)="etapa.set('formulario')"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Formulário</span>
            </button>
          </div>

          <!-- Grid dos 5 Tipos de Documentos -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <!-- 1. Parecer Técnico -->
            <div
              (click)="selecionarTipo('parecer')"
              class="group p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#132A41] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-bold">
                  <svg class="w-5 h-5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 class="font-black text-slate-900 text-base group-hover:text-[#132A41] transition-colors">
                  1. Parecer Técnico
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Documento formal completo e circunstanciado com fundamentação legal, memória de cálculo e parecer conclusivo para instrução de processo.
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#132A41]">
                <span>Revisar e Editar</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- 2. Ofício -->
            <div
              (click)="selecionarTipo('oficio')"
              class="group p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#132A41] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-bold">
                  <svg class="w-5 h-5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-black text-slate-900 text-base group-hover:text-[#132A41] transition-colors">
                  2. Ofício
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Comunicação externa formal endereçada à contratada comunicando o deferimento da repactuação e novos valores vigentes.
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#132A41]">
                <span>Revisar e Editar</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- 3. Resumo Executivo -->
            <div
              (click)="selecionarTipo('resumo')"
              class="group p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#132A41] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-bold">
                  <svg class="w-5 h-5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 class="font-black text-slate-900 text-base group-hover:text-[#132A41] transition-colors">
                  3. Resumo Executivo
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Síntese gerencial de alto nível com destaque para o impacto orçamentário e acréscimo financeiro sobre o contrato.
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#132A41]">
                <span>Revisar e Editar</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- 4. Pontos de Envio -->
            <div
              (click)="selecionarTipo('pontos')"
              class="group p-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#132A41] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-bold">
                  <svg class="w-5 h-5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h4 class="font-black text-slate-900 text-base group-hover:text-[#132A41] transition-colors">
                  4. Pontos de Envio
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Lista estruturada em tópicos rápidos para inclusão em e-mails, despachos ágeis ou memorandos internos.
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#132A41]">
                <span>Revisar e Editar</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <!-- 5. Relatório Técnico Estruturado (Tabelas) -->
            <div
              (click)="gerarRelatorioPDF()"
              class="group p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#B5642A] hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div class="space-y-2">
                <div class="w-10 h-10 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex items-center gap-2">
                  <h4 class="font-black text-slate-900 text-base group-hover:text-[#B5642A] transition-colors">
                    Relatório Estruturado
                  </h4>
                  <span class="px-2 py-0.5 rounded-full bg-[#B5642A]/10 text-[#B5642A] text-[11px] font-bold">Tabelas</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Relatório técnico clássico diagramado em tabelas com identificação, quadro de reajustamento, memória da fórmula e retenções.
                </p>
              </div>

              <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#B5642A]">
                <span>Baixar PDF Direto</span>
                <span class="group-hover:translate-x-1 transition-transform">↓</span>
              </div>
            </div>

          </div>

        </div>
      }

      <!-- ===================================================================== -->
      <!-- FLUXO ETAPA 3: TELA DE REVISÃO E EDIÇÃO COMPLETA DO TEXTO -->
      <!-- ===================================================================== -->
      @if (etapa() === 'revisao') {
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fadeIn">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#132A41]/10 text-[#132A41] text-xs font-bold mb-2">
                <span>Etapa 3 de 3 • Revisão Editável</span>
                <span class="text-slate-400">|</span>
                <span class="text-[#B5642A]">{{ getNomeTipoSelecionado() }}</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">
                Revisão do Documento
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Edite livremente o texto abaixo antes de exportar o PDF oficial.
              </p>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                (click)="etapa.set('selecao')"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Trocar Tipo</span>
              </button>

              <button
                type="button"
                (click)="restaurarTextoOriginal()"
                class="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Restaurar o modelo padrão inicial"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>

          <!-- Campo de Título Editável -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700">Título do Documento (Cabeçalho do PDF)</label>
            <input
              type="text"
              [value]="tituloDocumento()"
              (input)="tituloDocumento.set($any($event.target).value)"
              class="w-full bg-slate-50 text-sm font-bold text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all"
            />
          </div>

          <!-- Textarea Grande e Totalmente Editável -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700">Corpo do Documento (Totalmente Editável)</label>
              <span class="text-[11px] text-slate-400 font-mono">{{ corpoDocumento().length }} caracteres</span>
            </div>
            <textarea
              rows="18"
              [value]="corpoDocumento()"
              (input)="corpoDocumento.set($any($event.target).value)"
              class="w-full bg-slate-50 font-sans text-xs sm:text-sm text-slate-900 leading-relaxed rounded-2xl p-4 sm:p-5 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden transition-all resize-y"
              placeholder="Digite ou edite o conteúdo do documento..."
            ></textarea>
          </div>

          <!-- Card de Dica e Botão de Download do PDF -->
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-base">💡</span>
              <span class="font-medium">O PDF será exportado exatamente com o texto editado acima, formatado no padrão institucional da Amorim.</span>
            </div>

            <button
              type="button"
              (click)="baixarTextoPDF()"
              class="px-6 py-3.5 rounded-xl bg-[#B5642A] hover:bg-[#9c5220] text-white text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Baixar em PDF</span>
            </button>
          </div>

        </div>
      }

      <!-- MODAL: SALVAR PROJETO -->
      @if (modalSalvarAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-orange-50 text-[#B5642A] flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Salvar Contrato / Reajuste</h4>
                  <p class="text-xs text-slate-500">Dê um nome para identificar este estudo de reajuste</p>
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
              <label class="text-xs font-bold text-slate-700">Identificação do Projeto</label>
              <input
                type="text"
                [value]="modalSalvarNomeInput()"
                (input)="modalSalvarNomeInput.set($any($event.target).value)"
                (keydown.enter)="confirmarSalvarNovoProjeto()"
                placeholder="Ex: Contrato 042/2018 — Medição 22 (Autarquia Federal)"
                class="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-[#B5642A] focus:bg-white outline-hidden transition-all"
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
                class="px-5 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#9c5220] text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
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
                <div class="w-9 h-9 rounded-xl bg-orange-50 text-[#B5642A] flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Meus Projetos Salvos (Reajuste)</h4>
                  <p class="text-xs text-slate-500">Selecione um cálculo/contrato para carregar e continuar editando</p>
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
                  <svg class="animate-spin w-6 h-6 text-[#B5642A]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-xs font-semibold">Carregando seus contratos salvos...</span>
                </div>
              } @else if (listaProjetosSalvos().length === 0) {
                <div class="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-xs font-bold text-slate-600">Nenhum contrato salvo ainda</p>
                  <p class="text-[11px] text-slate-400 max-w-xs">Preencha os dados da medição e clique em "Salvar Projeto" para armazenar seus cálculos contratuais.</p>
                </div>
              } @else {
                @for (proj of listaProjetosSalvos(); track proj.id) {
                  <div
                    class="p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group"
                    [class]="projetoAtualId() === proj.id
                      ? 'border-[#B5642A] bg-orange-50/40 ring-1 ring-[#B5642A]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'"
                  >
                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <h5 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {{ proj.nome_projeto }}
                        </h5>
                        @if (projetoAtualId() === proj.id) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B5642A] text-white shrink-0">
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
                        class="px-3 py-1.5 rounded-xl bg-[#B5642A] hover:bg-[#9c5220] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                        title="Excluir contrato salvo"
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
export class ReajusteContratoComponent implements OnInit {
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

  // Controle de Fluxo
  readonly etapa = signal<'formulario' | 'selecao' | 'revisao'>('formulario');
  readonly tipoDocumentoSelecionado = signal<TipoDocumento>('parecer');
  readonly tituloDocumento = signal<string>('Parecer Técnico — Contrato 042/2018');
  readonly corpoDocumento = signal<string>('');

  // Banco de Índices Dinâmico (com fallback padrão)
  readonly bancoDeIndices = signal<Record<string, Record<number, IndiceMensal>>>(BANCO_DE_INDICES);
  readonly carregandoIndices = signal<boolean>(false);

  // Bloco A - Identificação
  readonly edital = signal<string>('001/2018');
  readonly modalidade = signal<string>('Tomada de Preço');
  readonly contratante = signal<string>('Autarquia Federal de Fiscalização e Gestão');
  readonly numeroContrato = signal<string>('042/2018');
  readonly empresaContratada = signal<string>('Amorim Engenharia e Arquitetura Ltda');
  readonly cnpjContratada = signal<string>('12.345.678/0001-90');
  readonly objeto = signal<string>('Contratação de serviços técnicos especializados de gerenciamento e fiscalização da obra de construção da nova Sede desta Autarquia Federal');

  // Bloco B - Parâmetros do Cálculo
  readonly categoriaIndice = signal<'coluna39' | 'coluna35'>('coluna39');
  readonly periodoMedicao = signal<string>('01/09/2020 a 30/09/2020');
  readonly numeroMedicao = signal<string>('22');
  readonly mesIo = signal<MesChave>('set');
  readonly anoIo = signal<number>(2018);
  readonly valorIo = signal<number>(223.666);

  readonly mesIi = signal<MesChave>('set');
  readonly anoIi = signal<number>(2020);
  readonly valorIi = signal<number>(243.718);

  readonly valorMedicao = signal<number>(22083.64);

  // Bloco C - Retenções na Fonte
  readonly incluirRetencoes = signal<boolean>(false);
  readonly aliquotaPis = signal<number>(0.65);
  readonly aliquotaCsll = signal<number>(1.00);
  readonly aliquotaIrpj = signal<number>(4.80);
  readonly aliquotaCofins = signal<number>(3.00);
  readonly aliquotaIss = signal<number>(5.00);

  readonly mesesDisponiveis = LISTA_MESES;
  readonly anosDisponiveis = LISTA_ANOS;

  // Cálculos Reativos
  readonly fatorCalculado = computed(() => {
    const io = this.valorIo();
    const ii = this.valorIi();
    if (io <= 0) return 0;
    return (ii - io) / io;
  });

  readonly percentualCalculado = computed(() => {
    return this.fatorCalculado() * 100;
  });

  readonly valorReajusteCalculado = computed(() => {
    const fator = this.fatorCalculado();
    const valor = this.valorMedicao();
    return Math.max(0, fator * valor);
  });

  readonly valorTotalCalculado = computed(() => {
    return this.valorMedicao() + this.valorReajusteCalculado();
  });

  readonly totalAliquotaRetencoes = computed(() => {
    if (!this.incluirRetencoes()) return 0;
    return (
      (this.aliquotaPis() || 0) +
      (this.aliquotaCsll() || 0) +
      (this.aliquotaIrpj() || 0) +
      (this.aliquotaCofins() || 0) +
      (this.aliquotaIss() || 0)
    );
  });

  readonly totalRetencoesCalculado = computed(() => {
    if (!this.incluirRetencoes()) return 0;
    const reajuste = this.valorReajusteCalculado();
    const aliquota = this.totalAliquotaRetencoes();
    return (reajuste * aliquota) / 100;
  });

  readonly reajusteLiquidoCalculado = computed(() => {
    return this.valorReajusteCalculado() - this.totalRetencoesCalculado();
  });

  readonly nomeColunaIndice = computed(() => {
    return this.categoriaIndice() === 'coluna39'
      ? 'Coluna 39 - Consultoria (Supervisão e Projetos)'
      : 'Coluna 35 - Edificação (INCC - Execução de Obra)';
  });

  // Mudança de Categoria / Datas
  onCategoriaChange(categoria: 'coluna39' | 'coluna35'): void {
    this.categoriaIndice.set(categoria);
    this.atualizarValorIoAutomatico();
    this.atualizarValorIiAutomatico();
  }

  onMesIoChange(mes: MesChave): void {
    this.mesIo.set(mes);
    this.atualizarValorIoAutomatico();
  }

  onAnoIoChange(ano: number): void {
    this.anoIo.set(Number(ano));
    this.atualizarValorIoAutomatico();
  }

  onMesIiChange(mes: MesChave): void {
    this.mesIi.set(mes);
    this.atualizarValorIiAutomatico();
  }

  onAnoIiChange(ano: number): void {
    this.anoIi.set(Number(ano));
    this.atualizarValorIiAutomatico();
  }

  async ngOnInit(): Promise<void> {
    await this.carregarIndices();
  }

  async carregarIndices(): Promise<void> {
    this.carregandoIndices.set(true);
    try {
      const { data, error } = await this.supabaseService.client
        .from('indices_sinaenco')
        .select('coluna, ano, mes, valor')
        .order('ano', { ascending: true })
        .order('mes', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('Índices SINAENCO mantidos com base local.');
        return;
      }

      const banco: Record<string, Record<number, IndiceMensal>> = { coluna35: {}, coluna39: {} };
      const nomesMeses: MesChave[] = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

      for (const row of data) {
        const col = row.coluna;
        if (!banco[col]) {
          banco[col] = {};
        }
        if (!banco[col][row.ano]) {
          banco[col][row.ano] = Object.fromEntries(nomesMeses.map(m => [m, null])) as unknown as IndiceMensal;
        }
        banco[col][row.ano][nomesMeses[row.mes - 1]] = row.valor;
      }

      this.bancoDeIndices.set(banco);
      this.atualizarValorIoAutomatico();
      this.atualizarValorIiAutomatico();
    } catch (e: any) {
      console.warn('Erro ao carregar índices SINAENCO:', e?.message || e);
    } finally {
      this.carregandoIndices.set(false);
    }
  }

  private atualizarValorIoAutomatico(): void {
    const cat = this.categoriaIndice();
    const ano = this.anoIo();
    const mes = this.mesIo();
    const banco = this.bancoDeIndices();
    const val = banco[cat]?.[ano]?.[mes];
    if (val !== null && val !== undefined) {
      this.valorIo.set(val);
    }
  }

  private atualizarValorIiAutomatico(): void {
    const cat = this.categoriaIndice();
    const ano = this.anoIi();
    const mes = this.mesIi();
    const banco = this.bancoDeIndices();
    const val = banco[cat]?.[ano]?.[mes];
    if (val !== null && val !== undefined) {
      this.valorIi.set(val);
    }
  }

  carregarExemploReal(): void {
    this.edital.set('001/2018');
    this.modalidade.set('Tomada de Preço');
    this.contratante.set('Autarquia Federal de Fiscalização e Gestão');
    this.numeroContrato.set('042/2018');
    this.empresaContratada.set('Amorim Engenharia e Arquitetura Ltda');
    this.cnpjContratada.set('12.345.678/0001-90');
    this.objeto.set('Contratação de serviços técnicos especializados de gerenciamento e fiscalização da obra de construção da nova Sede desta Autarquia Federal');
    this.categoriaIndice.set('coluna39');
    this.periodoMedicao.set('01/09/2020 a 30/09/2020');
    this.numeroMedicao.set('22');
    this.mesIo.set('set');
    this.anoIo.set(2018);
    this.valorIo.set(223.666);
    this.mesIi.set('set');
    this.anoIi.set(2020);
    this.valorIi.set(243.718);
    this.valorMedicao.set(22083.64);
    this.incluirRetencoes.set(false);
  }

  // =========================================================================
  // FLUXO DE DOCUMENTOS & TEMPLATES DETERMINÍSTICOS (SEM CHAMADA DE IA)
  // =========================================================================

  abrirSelecaoDocumento(): void {
    this.etapa.set('selecao');
  }

  selecionarTipo(tipo: TipoDocumento): void {
    this.tipoDocumentoSelecionado.set(tipo);

    if (tipo === 'estruturado') {
      this.gerarRelatorioPDF();
      return;
    }

    const numContrato = this.numeroContrato() || '000/2026';
    let titulo = '';
    let texto = '';

    switch (tipo) {
      case 'parecer':
        titulo = `Parecer Técnico — Contrato nº ${numContrato}`;
        texto = this.gerarTemplateParecer();
        break;
      case 'oficio':
        titulo = `Ofício de Deferimento de Reajuste — Contrato nº ${numContrato}`;
        texto = this.gerarTemplateOficio();
        break;
      case 'resumo':
        titulo = `Resumo Executivo — Reajuste Contratual nº ${numContrato}`;
        texto = this.gerarTemplateResumo();
        break;
      case 'pontos':
        titulo = `Pontos-Chave — Reajuste Contratual nº ${numContrato}`;
        texto = this.gerarTemplatePontos();
        break;
    }

    this.tituloDocumento.set(titulo);
    this.corpoDocumento.set(texto);
    this.etapa.set('revisao');
  }

  getNomeTipoSelecionado(): string {
    switch (this.tipoDocumentoSelecionado()) {
      case 'parecer': return 'Parecer Técnico';
      case 'oficio': return 'Ofício';
      case 'resumo': return 'Resumo Executivo';
      case 'pontos': return 'Pontos de Envio';
      case 'estruturado': return 'Relatório Estruturado';
      default: return 'Documento';
    }
  }

  restaurarTextoOriginal(): void {
    this.selecionarTipo(this.tipoDocumentoSelecionado());
  }

  private getDataExtenso(): string {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hoje = new Date();
    return `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  }

  private getNomeMes(mesChave: MesChave): string {
    return this.mesesDisponiveis.find(m => m.id === mesChave)?.nome || mesChave;
  }

  // 1. Template Parecer Técnico
  private gerarTemplateParecer(): string {
    const numContrato = this.numeroContrato() || '-';
    const edital = this.edital() || '-';
    const contratante = this.contratante() || 'Contratante';
    const empresa = this.empresaContratada() || 'Empresa Contratada';
    const cnpj = this.cnpjContratada() || '00.000.000/0000-00';
    const objeto = this.objeto() || '-';
    const vMed = this.formatarMoeda(this.valorMedicao());
    const nomeCol = this.nomeColunaIndice();
    const mesIoNome = this.getNomeMes(this.mesIo());
    const mesIiNome = this.getNomeMes(this.mesIi());
    const vIo = this.valorIo().toFixed(3).replace('.', ',');
    const vIi = this.valorIi().toFixed(3).replace('.', ',');
    const fator = this.fatorCalculado().toFixed(8).replace('.', ',');
    const perc = this.percentualCalculado().toFixed(2).replace('.', ',');
    const vReaj = this.formatarMoeda(this.valorReajusteCalculado());
    const vTot = this.formatarMoeda(this.valorTotalCalculado());
    const dataExtenso = this.getDataExtenso();

    return `PARECER TÉCNICO

Assunto: Reajustamento de preços — Contrato nº ${numContrato}, Edital ${edital}

Trata-se de parecer técnico para fundamentar o reajuste financeiro da medição referente ao contrato celebrado entre ${contratante} e ${empresa} (CNPJ ${cnpj}), cujo objeto é: ${objeto}.

O valor da medição base é de R$ ${vMed}, apurado no período de referência. Aplicando-se a variação do índice setorial FGV/SINAENCO (${nomeCol}) entre ${mesIoNome}/${this.anoIo()} (Io = ${vIo}) e ${mesIiNome}/${this.anoIi()} (Ii = ${vIi}), obtém-se o fator de reajuste de ${fator} (equivalente a ${perc}%).

Nesses termos, o valor do reajuste procurado corresponde a R$ ${vReaj}, elevando o valor total da medição para R$ ${vTot}.

É o parecer, ficando a critério da autoridade competente a análise final quanto à sua aprovação e efetivação.

Brasília - DF, ${dataExtenso}.

Emanoel S. Amorim
Arquiteto e Urbanista • CAU nº A133593-6`;
  }

  // 2. Template Ofício
  private gerarTemplateOficio(): string {
    const numContrato = this.numeroContrato() || '-';
    const empresa = this.empresaContratada() || 'Empresa Contratada';
    const vMed = this.formatarMoeda(this.valorMedicao());
    const nomeCol = this.nomeColunaIndice();
    const fator = this.fatorCalculado().toFixed(8).replace('.', ',');
    const perc = this.percentualCalculado().toFixed(2).replace('.', ',');
    const vReaj = this.formatarMoeda(this.valorReajusteCalculado());
    const vTot = this.formatarMoeda(this.valorTotalCalculado());
    const dataExtenso = this.getDataExtenso();
    const anoAtual = new Date().getFullYear();

    return `OFÍCIO Nº ___/${anoAtual}

Ao(À) ${empresa}
Ref.: Contrato nº ${numContrato} — Deferimento de Reajuste Contratual

Prezados(as) Senhores(as),

Comunicamos que o pedido de reajuste contratual referente ao contrato em epígrafe foi analisado e DEFERIDO, nos termos a seguir:

• Valor da medição base: R$ ${vMed}
• Índice aplicado: ${nomeCol}
• Fator de reajuste: ${fator} (${perc}%)
• Valor do reajuste: R$ ${vReaj}
• Novo valor total: R$ ${vTot}

Permanecemos à disposição para quaisquer esclarecimentos adicionais.

Atenciosamente,

Brasília - DF, ${dataExtenso}.

Emanoel S. Amorim
Arquiteto e Urbanista • CAU nº A133593-6`;
  }

  // 3. Template Resumo Executivo
  private gerarTemplateResumo(): string {
    const numContrato = this.numeroContrato() || '-';
    const edital = this.edital() || '-';
    const empresa = this.empresaContratada() || '-';
    const objeto = this.objeto() || '-';
    const perc = this.percentualCalculado().toFixed(2).replace('.', ',');
    const vMed = this.formatarMoeda(this.valorMedicao());
    const vReaj = this.formatarMoeda(this.valorReajusteCalculado());
    const vTot = this.formatarMoeda(this.valorTotalCalculado());
    const nomeCol = this.nomeColunaIndice();
    const mesIoNome = this.getNomeMes(this.mesIo());
    const mesIiNome = this.getNomeMes(this.mesIi());

    return `RESUMO EXECUTIVO — REAJUSTE CONTRATUAL

Contrato: nº ${numContrato} (${edital})
Empresa: ${empresa}
Objeto: ${objeto}

O reajuste aplicado à medição corrente resultou em um acréscimo de ${perc}% sobre o valor base de R$ ${vMed}, totalizando R$ ${vReaj} em valores adicionais. O novo valor total da medição passa a ser R$ ${vTot}.

O cálculo segue a variação do índice setorial FGV/SINAENCO (${nomeCol}) no período de ${mesIoNome}/${this.anoIo()} a ${mesIiNome}/${this.anoIi()}, em conformidade com a legislação de regência dos contratos administrativos.

Impacto orçamentário: acréscimo de R$ ${vReaj} sobre a rubrica orçamentária correspondente.`;
  }

  // 4. Template Pontos de Envio
  private gerarTemplatePontos(): string {
    const numContrato = this.numeroContrato() || '-';
    const empresa = this.empresaContratada() || '-';
    const perc = this.percentualCalculado().toFixed(2).replace('.', ',');
    const nomeCol = this.nomeColunaIndice();
    const vReaj = this.formatarMoeda(this.valorReajusteCalculado());
    const vTot = this.formatarMoeda(this.valorTotalCalculado());
    const mesIoNome = this.getNomeMes(this.mesIo());
    const mesIiNome = this.getNomeMes(this.mesIi());

    return `PONTOS-CHAVE — REAJUSTE CONTRATUAL

• Contrato nº ${numContrato} — ${empresa}
• Reajuste aplicado: ${perc}% (Índice ${nomeCol})
• Valor do reajuste: R$ ${vReaj}
• Novo valor total: R$ ${vTot}
• Período de referência: ${mesIoNome}/${this.anoIo()} a ${mesIiNome}/${this.anoIi()}
• Fundamentação: variação FGV/SINAENCO, conforme legislação aplicável`;
  }

  // =========================================================================
  // GERAÇÃO DE PDF COM TEXTO EDITADO (Design System Amorim White-Label)
  // =========================================================================
  async baixarTextoPDF(): Promise<void> {
    try {
      const tituloHeader = this.tituloDocumento() || 'Documento Técnico de Reajuste';
      const tipoStr = this.tipoDocumentoSelecionado();
      const numContrato = this.numeroContrato() || '-';
      const numMedicao = this.numeroMedicao() || '-';

      const textoCompleto = this.corpoDocumento();
      const paragrafos = textoCompleto.split('\n');

      let htmlParagrafos = '';
      let inList = false;

      for (const p of paragrafos) {
        const pTrim = p.trim();
        if (!pTrim) {
          if (inList) {
            htmlParagrafos += '</ul>';
            inList = false;
          }
          continue;
        }

        const isBullet = pTrim.startsWith('•') || pTrim.startsWith('-') || pTrim.startsWith('*');
        const isHeader = pTrim.toUpperCase() === pTrim && pTrim.length < 60 && !isBullet;

        if (isBullet) {
          if (!inList) {
            htmlParagrafos += '<ul style="margin: 6px 0 10px 18px; padding: 0; line-height: 1.5; font-size: 8.5pt;">';
            inList = true;
          }
          const itemText = pTrim.replace(/^[•\-\*]\s*/, '');
          htmlParagrafos += `<li style="margin-bottom: 4px;">${itemText}</li>`;
        } else {
          if (inList) {
            htmlParagrafos += '</ul>';
            inList = false;
          }

          if (isHeader) {
            htmlParagrafos += `<div class="doc-section-title" style="margin-top: 14px; margin-bottom: 6px;">${pTrim}</div>`;
          } else {
            htmlParagrafos += `<p style="margin-bottom: 8px; line-height: 1.6; font-size: 8.5pt; text-align: justify;">${pTrim}</p>`;
          }
        }
      }

      if (inList) {
        htmlParagrafos += '</ul>';
      }

      const corpoHtml = `
        <div class="doc-card-info" style="margin-bottom: 14px;">
          <div class="doc-grid-4">
            <div class="doc-info-item">
              <span class="doc-info-label">Tipo de Documento</span>
              <span class="doc-info-value" style="text-transform: capitalize;">${tipoStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Contrato Nº</span>
              <span class="doc-info-value">${numContrato}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Medição Nº</span>
              <span class="doc-info-value">${numMedicao}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Data de Emissão</span>
              <span class="doc-info-value">${new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div style="padding: 10px 0;">
          ${htmlParagrafos}
        </div>
      `;

      const isOficio = tipoStr === 'oficio';

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: tituloHeader,
          subtituloDocumento: isOficio ? undefined : `Contrato nº ${numContrato} • Medição nº ${numMedicao}`,
          nomeAgente: 'Agente de Reajuste de Contratos',
          cabecalhoGenerico: isOficio
        },
        corpoHtml
      );
    } catch (err) {
      console.error('Erro ao gerar documento PDF de reajuste:', err);
      this.motorPdfService.exibirToast('Ocorreu um erro ao emitir o documento em PDF.', 'erro');
    }
  }

  // =========================================================================
  // GERAÇÃO DO RELATÓRIO ESTRUTURADO EM TABELAS (Design System Amorim White-Label)
  // =========================================================================
  async gerarRelatorioPDF(): Promise<void> {
    try {
      const editalStr = this.edital() || '-';
      const modalidadeStr = this.modalidade() || '-';
      const contratoStr = this.numeroContrato() || '-';
      const medicaoStr = this.numeroMedicao() || '-';
      const periodoStr = this.periodoMedicao() || '-';
      const contratanteStr = this.contratante() || '-';
      const contratadaStr = this.empresaContratada() || '-';
      const cnpjStr = this.cnpjContratada() || '-';
      const objetoStr = this.objeto() || '-';

      const nomeColuna = this.categoriaIndice() === 'coluna39'
        ? 'Coluna 39 - Consultoria (FGV/SINAENCO)'
        : 'Coluna 35 - Edificação INCC (FGV)';

      const vMedicaoStr = this.formatarMoeda(this.valorMedicao());
      const fatorStr = this.fatorCalculado().toFixed(8).replace('.', ',');
      const reajusteStr = this.formatarMoeda(this.valorReajusteCalculado());
      const totalComReajusteStr = this.formatarMoeda(this.valorTotalCalculado());

      const nomeMesIo = this.getNomeMes(this.mesIo());
      const nomeMesIi = this.getNomeMes(this.mesIi());

      const notaLegal = this.categoriaIndice() === 'coluna39'
        ? 'Nota Legal: Reajustamento de preços fundamentado nos termos do Decreto nº 2.271/1997, Instrução Normativa MP/SLTI nº 02/2008 e disposições da Lei Federal nº 8.666/1993 e Lei nº 14.133/2021, decorrido o interregno mínimo de 12 (doze) meses a contar da data limite para apresentação da proposta comercial, aplicando-se a variação do índice setorial FGV/SINAENCO Coluna 39 (Consultoria - Projetos e Supervisão).'
        : 'Nota Legal: Reajustamento de preços fundamentado nos termos da Lei Federal nº 8.666/1993, Lei nº 14.133/2021 e disposições contratuais, decorrido o interregno mínimo de 12 (doze) meses da data-base da proposta, aplicando-se a variação do Índice Setorial de Custo da Construção Civil – FGV Coluna 35 (Edificação - INCC).';

      let retencoesHtml = '';
      if (this.incluirRetencoes()) {
        const reajuste = this.valorReajusteCalculado();
        const pisVal = (reajuste * this.aliquotaPis()) / 100;
        const csllVal = (reajuste * this.aliquotaCsll()) / 100;
        const irpjVal = (reajuste * this.aliquotaIrpj()) / 100;
        const cofinsVal = (reajuste * this.aliquotaCofins()) / 100;
        const issVal = (reajuste * this.aliquotaIss()) / 100;

        retencoesHtml = `
          <!-- 4. RETENÇÕES TRIBUTÁRIAS NA FONTE -->
          <div class="doc-section">
            <div class="doc-section-title">4. Retenções Tributárias na Fonte</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th class="th-center" style="width: 14%;">PIS (${this.aliquotaPis().toFixed(2)}%)</th>
                  <th class="th-center" style="width: 14%;">CSLL (${this.aliquotaCsll().toFixed(2)}%)</th>
                  <th class="th-center" style="width: 14%;">IRPJ (${this.aliquotaIrpj().toFixed(2)}%)</th>
                  <th class="th-center" style="width: 14%;">COFINS (${this.aliquotaCofins().toFixed(2)}%)</th>
                  <th class="th-center" style="width: 14%;">ISS (${this.aliquotaIss().toFixed(2)}%)</th>
                  <th class="th-center" style="width: 15%;">Total Retenções</th>
                  <th class="th-center" style="width: 15%;">Reajuste Líquido</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="td-center">R$ ${this.formatarMoeda(pisVal)}</td>
                  <td class="td-center">R$ ${this.formatarMoeda(csllVal)}</td>
                  <td class="td-center">R$ ${this.formatarMoeda(irpjVal)}</td>
                  <td class="td-center">R$ ${this.formatarMoeda(cofinsVal)}</td>
                  <td class="td-center">R$ ${this.formatarMoeda(issVal)}</td>
                  <td class="td-center font-bold" style="color: var(--p4-red);">R$ ${this.formatarMoeda(this.totalRetencoesCalculado())}</td>
                  <td class="td-center font-bold" style="color: var(--p4-green);">R$ ${this.formatarMoeda(this.reajusteLiquidoCalculado())}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      const corpoHtml = `
        <!-- IDENTIFICAÇÃO DO CONTRATO E MEDIÇÃO -->
        <div class="doc-card-info">
          <div class="doc-grid-4">
            <div class="doc-info-item">
              <span class="doc-info-label">Edital</span>
              <span class="doc-info-value">${editalStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Modalidade</span>
              <span class="doc-info-value">${modalidadeStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Contrato Nº</span>
              <span class="doc-info-value font-bold">${contratoStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Medição Nº</span>
              <span class="doc-info-value font-bold">${medicaoStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Período de Medição</span>
              <span class="doc-info-value">${periodoStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Contratante</span>
              <span class="doc-info-value">${contratanteStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Contratada</span>
              <span class="doc-info-value">${contratadaStr}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">CNPJ Contratada</span>
              <span class="doc-info-value">${cnpjStr}</span>
            </div>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--p4-border);">
            <span class="doc-info-label">Objeto Contratual</span>
            <div class="doc-info-value" style="margin-top: 2px;">${objetoStr}</div>
          </div>
        </div>

        <!-- 1. REAJUSTAMENTO DOS SERVIÇOS -->
        <div class="doc-section">
          <div class="doc-section-title">1. Reajustamento dos Serviços da Medição</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 40%;">Cálculo (Índice Setorial)</th>
                <th class="th-right" style="width: 20%;">Valor Medição</th>
                <th class="th-right" style="width: 20%;">Fator de Reajuste</th>
                <th class="th-right" style="width: 20%;">Total do Reajuste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${nomeColuna}</td>
                <td class="td-right">R$ ${vMedicaoStr}</td>
                <td class="td-right">${fatorStr}</td>
                <td class="td-right font-bold" style="color: var(--p4-copper);">R$ ${reajusteStr}</td>
              </tr>
              <tr class="highlight-gray">
                <td colspan="3" class="td-right"><strong>TOTAL GERAL DO REAJUSTE CONTRATUAL</strong></td>
                <td class="td-right font-bold" style="color: var(--p4-copper);">R$ ${reajusteStr}</td>
              </tr>
              <tr class="highlight-emerald">
                <td colspan="3" class="td-right"><strong>VALOR TOTAL DA MEDIÇÃO COM REAJUSTE</strong></td>
                <td class="td-right font-bold" style="color: var(--p4-green);">R$ ${totalComReajusteStr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. ÍNDICES DE REAJUSTAMENTO APLICADOS -->
        <div class="doc-section">
          <div class="doc-section-title">2. Índices de Reajustamento Aplicados</div>
          <table class="doc-table">
            <tbody>
              <tr>
                <td style="width: 30%; font-weight: 700; background-color: #F8FAFC;">Índice Setorial Adotado:</td>
                <td style="width: 70%;">${nomeColuna}</td>
              </tr>
              <tr>
                <td style="font-weight: 700; background-color: #F8FAFC;">Mês/Ano Base da Proposta (Io):</td>
                <td>${nomeMesIo}/${this.anoIo()} = <strong>${this.valorIo().toFixed(3).replace('.', ',')}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700; background-color: #F8FAFC;">Mês/Ano Reajuste da Medição (Ii):</td>
                <td>${nomeMesIi}/${this.anoIi()} = <strong>${this.valorIi().toFixed(3).replace('.', ',')}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700; background-color: #F8FAFC;">Fator de Reajuste ( (Ii - Io) / Io ):</td>
                <td><strong>${this.fatorCalculado().toFixed(8).replace('.', ',')}</strong> (+${this.percentualCalculado().toFixed(2).replace('.', ',')}%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. DESCRIÇÃO E MEMÓRIA DE CÁLCULO -->
        <div class="doc-section">
          <div class="doc-section-title">3. Descrição e Memória de Cálculo</div>
          <div style="background-color: #F8FAFC; border: 1px solid var(--p4-border); border-radius: 4px; padding: 8px 10px; font-size: 7.5pt; line-height: 1.5;">
            <div style="font-weight: 700; color: var(--p4-navy); margin-bottom: 4px;">Fórmula Aplicada: R = [ (Ii - Io) / Io ] × V</div>
            <div><strong>Onde:</strong></div>
            <div style="margin-left: 8px;">
              • <strong>R</strong> = Valor do reajustamento financeiro procurado;<br/>
              • <strong>Ii</strong> = Índice referente ao mês da medição / reajuste;<br/>
              • <strong>Io</strong> = Índice referente ao mês limite de apresentação da proposta de preços;<br/>
              • <strong>V</strong> = Valor a preços iniciais do serviço executado na respectiva medição.
            </div>
          </div>
        </div>

        ${retencoesHtml}

        <!-- NOTA LEGAL -->
        <div class="doc-legal-note">
          ${notaLegal}
        </div>
      `;

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: 'Relatório Técnico de Reajustamento de Serviços',
          subtituloDocumento: `Contrato Administrativo nº ${contratoStr} • Medição nº ${medicaoStr}`,
          nomeAgente: 'Agente de Reajuste de Contratos'
        },
        corpoHtml
      );
    } catch (err) {
      console.error('Erro ao gerar relatório de reajuste em PDF:', err);
      this.motorPdfService.exibirToast('Ocorreu um erro ao emitir o relatório de reajuste em PDF.', 'erro');
    }
  }

  private formatarMoeda(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // =========================================================================
  // GESTÃO DE PROJETOS SALVOS (Reajuste de Contratos)
  // =========================================================================

  exibirToast(texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    this.toastMensagem.set({ texto, tipo });
    setTimeout(() => {
      this.toastMensagem.set(null);
    }, 3500);
  }

  obterNomeProjetoSugerido(): string {
    const contrato = this.numeroContrato()?.trim() || 'Sem Número';
    const medicao = this.numeroMedicao()?.trim() || '1';
    return `Contrato ${contrato} — Medição ${medicao}`;
  }

  serializarDadosFormulario(): any {
    return {
      edital: this.edital(),
      modalidade: this.modalidade(),
      contratante: this.contratante(),
      numeroContrato: this.numeroContrato(),
      empresaContratada: this.empresaContratada(),
      cnpjContratada: this.cnpjContratada(),
      objeto: this.objeto(),
      categoriaIndice: this.categoriaIndice(),
      periodoMedicao: this.periodoMedicao(),
      numeroMedicao: this.numeroMedicao(),
      mesIo: this.mesIo(),
      anoIo: this.anoIo(),
      valorIo: this.valorIo(),
      mesIi: this.mesIi(),
      anoIi: this.anoIi(),
      valorIi: this.valorIi(),
      valorMedicao: this.valorMedicao(),
      incluirRetencoes: this.incluirRetencoes(),
      aliquotaPis: this.aliquotaPis(),
      aliquotaCsll: this.aliquotaCsll(),
      aliquotaIrpj: this.aliquotaIrpj(),
      aliquotaCofins: this.aliquotaCofins(),
      aliquotaIss: this.aliquotaIss(),
      etapa: this.etapa(),
      tipoDocumentoSelecionado: this.tipoDocumentoSelecionado(),
      tituloDocumento: this.tituloDocumento(),
      corpoDocumento: this.corpoDocumento()
    };
  }

  deserializarDadosFormulario(dados: any): void {
    if (!dados) return;

    if (dados.edital !== undefined) this.edital.set(dados.edital);
    if (dados.modalidade !== undefined) this.modalidade.set(dados.modalidade);
    if (dados.contratante !== undefined) this.contratante.set(dados.contratante);
    if (dados.numeroContrato !== undefined) this.numeroContrato.set(dados.numeroContrato);
    if (dados.empresaContratada !== undefined) this.empresaContratada.set(dados.empresaContratada);
    if (dados.cnpjContratada !== undefined) this.cnpjContratada.set(dados.cnpjContratada);
    if (dados.objeto !== undefined) this.objeto.set(dados.objeto);

    if (dados.categoriaIndice !== undefined) this.categoriaIndice.set(dados.categoriaIndice);
    if (dados.periodoMedicao !== undefined) this.periodoMedicao.set(dados.periodoMedicao);
    if (dados.numeroMedicao !== undefined) this.numeroMedicao.set(dados.numeroMedicao);
    if (dados.mesIo !== undefined) this.mesIo.set(dados.mesIo);
    if (dados.anoIo !== undefined) this.anoIo.set(dados.anoIo);
    if (dados.valorIo !== undefined) this.valorIo.set(dados.valorIo);
    if (dados.mesIi !== undefined) this.mesIi.set(dados.mesIi);
    if (dados.anoIi !== undefined) this.anoIi.set(dados.anoIi);
    if (dados.valorIi !== undefined) this.valorIi.set(dados.valorIi);
    if (dados.valorMedicao !== undefined) this.valorMedicao.set(dados.valorMedicao);

    if (dados.incluirRetencoes !== undefined) this.incluirRetencoes.set(dados.incluirRetencoes);
    if (dados.aliquotaPis !== undefined) this.aliquotaPis.set(dados.aliquotaPis);
    if (dados.aliquotaCsll !== undefined) this.aliquotaCsll.set(dados.aliquotaCsll);
    if (dados.aliquotaIrpj !== undefined) this.aliquotaIrpj.set(dados.aliquotaIrpj);
    if (dados.aliquotaCofins !== undefined) this.aliquotaCofins.set(dados.aliquotaCofins);
    if (dados.aliquotaIss !== undefined) this.aliquotaIss.set(dados.aliquotaIss);

    if (dados.etapa !== undefined) this.etapa.set(dados.etapa);
    if (dados.tipoDocumentoSelecionado !== undefined) this.tipoDocumentoSelecionado.set(dados.tipoDocumentoSelecionado);
    if (dados.tituloDocumento !== undefined) this.tituloDocumento.set(dados.tituloDocumento);
    if (dados.corpoDocumento !== undefined) this.corpoDocumento.set(dados.corpoDocumento);
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
      this.exibirToast('Digite uma identificação para o projeto.', 'erro');
      return;
    }

    this.salvandoProjeto.set(true);
    try {
      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.salvarProjeto('reajuste', nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao salvar: ${res.error.message}`, 'erro');
      } else {
        this.projetoAtualId.set(res.id || null);
        this.projetoAtualNome.set(nome);
        this.modalSalvarAberto.set(false);
        this.exibirToast(`Contrato "${nome}" salvo com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao salvar contrato: ${err?.message || err}`, 'erro');
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
        this.exibirToast(`Contrato "${nome}" atualizado com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao atualizar contrato: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async abrirModalMeusProjetos(): Promise<void> {
    this.modalProjetosAberto.set(true);
    this.carregandoProjetos.set(true);
    try {
      const lista = await this.supabaseService.listarMeusProjetos('reajuste');
      this.listaProjetosSalvos.set(lista);
    } catch (err) {
      console.error('Erro ao listar contratos salvos:', err);
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
      this.exibirToast(`Contrato "${proj.nome_projeto}" carregado com sucesso!`, 'sucesso');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      this.exibirToast(`Erro ao carregar contrato: ${err?.message || err}`, 'erro');
    }
  }

  async confirmarExcluirProjeto(proj: any, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Deseja realmente excluir o contrato "${proj.nome_projeto}"? Esta ação não pode ser desfeita.`)) {
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
        this.exibirToast(`Contrato "${proj.nome_projeto}" excluído.`, 'info');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao excluir contrato: ${err?.message || err}`, 'erro');
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
