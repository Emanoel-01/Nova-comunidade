import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface IndiceMensal {
  jan: number | null;
  fev: number | null;
  mar: number | null;
  abr: number | null;
  mai: number | null;
  jun: number | null;
  jul: number | null;
  ago: number | null;
  set: number | null;
  out: number | null;
  nov: number | null;
  dez: number | null;
}

export type MesChave = keyof IndiceMensal;

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
              <span>Agente de Automação Técnica • Amorim Group</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Reajuste de Contratos Públicos</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Cálculo automatizado do índice de reajustamento por FGV/SINAENCO (Coluna 35 - Edificação ou Coluna 39 - Consultoria e Projetos) com geração do parecer formal em PDF no padrão executivo da Amorim.
            </p>
          </div>

          <!-- Ação Rápida: Carregar Exemplo Real de Referência -->
          <div class="shrink-0 self-start md:self-auto flex flex-col items-start md:items-end gap-2">
            <button
              type="button"
              (click)="carregarExemploReal()"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Preencher Exemplo de Referência</span>
            </button>
            <span class="text-[10px] text-slate-400">Edital 001/2018 • Medição 22</span>
          </div>
        </div>
      </div>

      <!-- 2. Formulário em 3 Blocos Estruturados -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Formulário Principal (8 Colunas) -->
        <div class="lg:col-span-8 space-y-6">

          <!-- ========================================================= -->
          <!-- BLOCO A: IDENTIFICAÇÃO DO CONTRATO -->
          <!-- ========================================================= -->
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

              <!-- CNPJ -->
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

          <!-- ========================================================= -->
          <!-- BLOCO B: PARÂMETROS DO CÁLCULO E ÍNDICES FGV -->
          <!-- ========================================================= -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-8 h-8 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-black text-xs">
                B
              </div>
              <div>
                <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Parâmetros do Cálculo e Índices FGV
                </h4>
                <p class="text-xs text-slate-500">Seleção da coluna setorial, datas-base e valor medido</p>
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
                <option value="coluna35">Edificação — Execução de Obra (Coluna 35 / INCC)</option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Período da Medição (Texto Livre ou Data Inicial e Final) -->
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

            <!-- Seleção Mês/Ano Inicial (Io) e Final (Ii) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              
              <!-- Bloco Io (Mês Base da Proposta) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Mês/Ano Inicial (Io — Base)
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    Proposta
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
                  <label class="text-[11px] font-bold text-slate-600">Valor do Índice Io (Editável)</label>
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

              <!-- Bloco Ii (Mês da Medição / Reajuste) -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Mês/Ano Final (Ii — Reajuste)
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#B5642A]/20 text-[#B5642A]">
                    Medição
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
                  <label class="text-[11px] font-bold text-slate-600">Valor do Índice Ii (Editável)</label>
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

            <!-- Valor Total da Medição (V) -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Valor Total da Medição — V (R$)</span>
                <span class="text-[11px] text-slate-400 font-normal">Valor a preços iniciais</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-xs sm:text-sm font-bold text-slate-400">R$</span>
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

            <!-- Aviso da Fonte dos Índices -->
            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Índices conforme SINAENCO — <a href="https://sinaenco.com.br/indices" target="_blank" rel="noopener noreferrer" class="underline text-indigo-600 hover:text-indigo-800">sinaenco.com.br/indices</a>. Atualização automática em desenvolvimento.</span>
            </p>

          </div>

          <!-- ========================================================= -->
          <!-- BLOCO C: RETENÇÕES NA FONTE (OPCIONAL) -->
          <!-- ========================================================= -->
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            
            <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs">
                  C
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Retenções Tributárias na Fonte
                  </h4>
                  <p class="text-xs text-slate-500">Cálculo de deduções fiscais incidentes sobre o reajuste</p>
                </div>
              </div>

              <!-- Checkbox Toggle -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="incluirRetencoes()"
                  (change)="incluirRetencoes.set(!incluirRetencoes())"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B5642A]"></div>
              </label>
            </div>

            @if (incluirRetencoes()) {
              <div class="space-y-4 pt-1 animate-fadeIn">
                <p class="text-xs text-slate-600">
                  Informe ou ajuste os percentuais de retenção aplicáveis sobre o montante bruto do reajuste:
                </p>

                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <!-- PIS -->
                  <div class="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label class="text-[11px] font-bold text-slate-700">PIS (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      [value]="aliquotaPis()"
                      (input)="aliquotaPis.set(+$any($event.target).value || 0)"
                      class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                    />
                  </div>

                  <!-- CSLL -->
                  <div class="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label class="text-[11px] font-bold text-slate-700">CSLL (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      [value]="aliquotaCsll()"
                      (input)="aliquotaCsll.set(+$any($event.target).value || 0)"
                      class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                    />
                  </div>

                  <!-- IRPJ -->
                  <div class="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label class="text-[11px] font-bold text-slate-700">IRPJ (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      [value]="aliquotaIrpj()"
                      (input)="aliquotaIrpj.set(+$any($event.target).value || 0)"
                      class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                    />
                  </div>

                  <!-- COFINS -->
                  <div class="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label class="text-[11px] font-bold text-slate-700">COFINS (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      [value]="aliquotaCofins()"
                      (input)="aliquotaCofins.set(+$any($event.target).value || 0)"
                      class="w-full bg-white text-xs font-bold text-slate-900 rounded-lg p-2 border border-slate-300 outline-hidden"
                    />
                  </div>

                  <!-- ISS -->
                  <div class="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
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

        <!-- Painel Lateral de Resultados & Geração do PDF (4 Colunas) -->
        <div class="lg:col-span-4 space-y-6 lg:sticky lg:top-20">

          <!-- Card de Resultados do Cálculo -->
          <div class="bg-[#132A41] text-white rounded-3xl p-6 border border-slate-700 shadow-md space-y-5">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-700">
              <span class="text-xs font-black text-[#E59866] uppercase tracking-wider">
                Resumo do Cálculo
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
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

            <!-- Botão de Ação Primária: Gerar Relatório em PDF -->
            <button
              type="button"
              (click)="gerarRelatorioPDF()"
              [disabled]="valorIo() <= 0 || valorIi() <= 0 || valorMedicao() <= 0"
              [class]="valorIo() > 0 && valorIi() > 0 && valorMedicao() > 0
                ? 'bg-[#B5642A] hover:bg-[#9c5220] text-white shadow-lg shadow-[#B5642A]/30 cursor-pointer'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'"
              class="w-full py-4 px-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Gerar Relatório em PDF</span>
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

    </div>
  `
})
export class ReajusteContratoComponent {
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

  private atualizarValorIoAutomatico(): void {
    const cat = this.categoriaIndice();
    const ano = this.anoIo();
    const mes = this.mesIo();
    const val = BANCO_DE_INDICES[cat]?.[ano]?.[mes];
    if (val !== null && val !== undefined) {
      this.valorIo.set(val);
    }
  }

  private atualizarValorIiAutomatico(): void {
    const cat = this.categoriaIndice();
    const ano = this.anoIi();
    const mes = this.mesIi();
    const val = BANCO_DE_INDICES[cat]?.[ano]?.[mes];
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
  // GERAÇÃO DO PARECER TÉCNICO FORMAL EM PDF (Paleta Navy/Copper da Amorim)
  // =========================================================================
  gerarRelatorioPDF(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 15;

    // Cores Institucionais com tuplas estritas para compatibilidade de tipos com jsPDF-autotable
    const navyPrimary: [number, number, number] = [19, 42, 65]; // #132A41
    const copperAccent: [number, number, number] = [181, 100, 42]; // #B5642A
    const slateDark: [number, number, number] = [51, 65, 85];
    const slateLight: [number, number, number] = [241, 245, 249];
    const borderGray: [number, number, number] = [203, 213, 225];
    const textWhite: [number, number, number] = [255, 255, 255];
    const bgCellLight: [number, number, number] = [248, 250, 252];
    const bgCellGray: [number, number, number] = [241, 245, 249];

    // 1. Faixa Superior Institucional
    doc.setFillColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.rect(margin, currentY, contentWidth, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('REAJUSTAMENTO DE SERVIÇOS', pageWidth / 2, currentY + 11, { align: 'center' });
    currentY += 24;

    // 2. Bloco de Identificação
    doc.setFontSize(9);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

    const infoData = [
      ['EDITAL:', this.edital() || '-', 'MODALIDADE:', this.modalidade() || '-'],
      ['CONTRATO Nº:', this.numeroContrato() || '-', 'MEDIÇÃO Nº:', this.numeroMedicao() || '-'],
      ['PERÍODO MEDIÇÃO:', this.periodoMedicao() || '-', 'CONTRATANTE:', this.contratante() || '-'],
      ['CONTRATADA:', this.empresaContratada() || '-', 'CNPJ:', this.cnpjContratada() || '-']
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: borderGray,
        textColor: slateDark
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 32 },
        1: { cellWidth: 58 },
        2: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 32 },
        3: { cellWidth: 58 }
      },
      body: infoData
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    // Linha de Objeto
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: borderGray,
        textColor: slateDark
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 32 },
        1: { cellWidth: 148 }
      },
      body: [
        ['OBJETO:', this.objeto() || '-']
      ]
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 3. Tabela "REAJUSTAMENTO DOS SERVIÇOS"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.text('1. REAJUSTAMENTO DOS SERVIÇOS', margin, currentY);
    currentY += 3;

    const nomeColuna = this.categoriaIndice() === 'coluna39'
      ? 'Coluna 39 - Consultoria (FGV)'
      : 'Coluna 35 - Edificação INCC (FGV)';

    const vMedicaoStr = this.formatarMoeda(this.valorMedicao());
    const fatorStr = this.fatorCalculado().toFixed(8).replace('.', ',');
    const reajusteStr = this.formatarMoeda(this.valorReajusteCalculado());
    const totalComReajusteStr = this.formatarMoeda(this.valorTotalCalculado());

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: navyPrimary,
        textColor: textWhite,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: borderGray,
        textColor: slateDark
      },
      head: [['CÁLCULO (ÍNDICE)', 'VALOR TOTAL DA MEDIÇÃO', 'FATOR DE REAJUSTE', 'TOTAL DO REAJUSTE']],
      body: [
        [nomeColuna, `R$ ${vMedicaoStr}`, fatorStr, `R$ ${reajusteStr}`],
        [
          { content: 'TOTAL GERAL DO REAJUSTE', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellLight } },
          { content: `R$ ${reajusteStr}`, styles: { fontStyle: 'bold', textColor: copperAccent } }
        ],
        [
          { content: 'VALOR TOTAL DA MEDIÇÃO COM REAJUSTE', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: bgCellGray } },
          { content: `R$ ${totalComReajusteStr}`, styles: { fontStyle: 'bold', textColor: navyPrimary } }
        ]
      ]
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 4. Bloco "ÍNDICES DE REAJUSTAMENTO"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.text('2. ÍNDICES DE REAJUSTAMENTO APLICADOS', margin, currentY);
    currentY += 3;

    const nomeMesIo = this.mesesDisponiveis.find(m => m.id === this.mesIo())?.nome || this.mesIo();
    const nomeMesIi = this.mesesDisponiveis.find(m => m.id === this.mesIi())?.nome || this.mesIi();

    const indicesData = [
      ['ÍNDICE SETORIAL:', nomeColuna],
      [`MÊS/ANO BASE (Io):`, `${nomeMesIo}/${this.anoIo()} = ${this.valorIo().toFixed(3).replace('.', ',')}`],
      [`MÊS/ANO REAJUSTE (Ii):`, `${nomeMesIi}/${this.anoIi()} = ${this.valorIi().toFixed(3).replace('.', ',')}`],
      ['FATOR ( (Ii - Io) / Io ):', `${this.fatorCalculado().toFixed(8).replace('.', ',')} (+${this.percentualCalculado().toFixed(2).replace('.', ',')}%)`]
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: borderGray,
        textColor: slateDark
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      body: indicesData
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 5. Descrição do Cálculo e Fórmula
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.text('3. DESCRIÇÃO E MEMÓRIA DE CÁLCULO', margin, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: borderGray,
        textColor: slateDark
      },
      body: [
        [{ content: 'Fórmula Aplicada: R = [ (Ii - Io) / Io ] x V', styles: { fontStyle: 'bold', fillColor: bgCellLight } }],
        ['Onde:\n• R = Valor do reajuste financeiro procurado;\n• Ii = Índice referente ao mês da medição / reajuste;\n• Io = Índice referente ao mês limite de apresentação da proposta de preços;\n• V = Valor a preços iniciais do serviço executado na medição.']
      ]
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 6. Bloco Opcional de Retenções
    if (this.incluirRetencoes()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('4. RETENÇÕES TRIBUTÁRIAS NA FONTE', margin, currentY);
      currentY += 3;

      const reajuste = this.valorReajusteCalculado();
      const pisVal = (reajuste * this.aliquotaPis()) / 100;
      const csllVal = (reajuste * this.aliquotaCsll()) / 100;
      const irpjVal = (reajuste * this.aliquotaIrpj()) / 100;
      const cofinsVal = (reajuste * this.aliquotaCofins()) / 100;
      const issVal = (reajuste * this.aliquotaIss()) / 100;

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
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        head: [['PIS', 'CSLL', 'IRPJ', 'COFINS', 'ISS', 'TOTAL RETENÇÕES', 'REAJUSTE LÍQUIDO']],
        body: [
          [
            `${this.aliquotaPis().toFixed(2)}%\nR$ ${this.formatarMoeda(pisVal)}`,
            `${this.aliquotaCsll().toFixed(2)}%\nR$ ${this.formatarMoeda(csllVal)}`,
            `${this.aliquotaIrpj().toFixed(2)}%\nR$ ${this.formatarMoeda(irpjVal)}`,
            `${this.aliquotaCofins().toFixed(2)}%\nR$ ${this.formatarMoeda(cofinsVal)}`,
            `${this.aliquotaIss().toFixed(2)}%\nR$ ${this.formatarMoeda(issVal)}`,
            `${this.totalAliquotaRetencoes().toFixed(2)}%\nR$ ${this.formatarMoeda(this.totalRetencoesCalculado())}`,
            `R$ ${this.formatarMoeda(this.reajusteLiquidoCalculado())}`
          ]
        ]
      });

      currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    // 7. Nota Legal Fixa Contextualizada
    const notaLegal = this.categoriaIndice() === 'coluna39'
      ? 'Nota Legal: Reajustamento de preços fundamentado nos termos do Decreto nº 2.271/1997, Instrução Normativa MP/SLTI nº 02/2008 e disposições da Lei Federal nº 8.666/1993 e Lei nº 14.133/2021, decorrido o interregno mínimo de 12 (doze) meses a contar da data limite para apresentação da proposta comercial, aplicando-se a variação do índice setorial FGV/SINAENCO Coluna 39 (Consultoria - Projetos e Supervisão).'
      : 'Nota Legal: Reajustamento de preços fundamentado nos termos da Lei Federal nº 8.666/1993, Lei nº 14.133/2021 e disposições contratuais, decorrido o interregno mínimo de 12 (doze) meses da data-base da proposta, aplicando-se a variação do Índice Setorial de Custo da Construção Civil – FGV Coluna 35 (Edificação - INCC).';

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitNota = doc.splitTextToSize(notaLegal, contentWidth);
    doc.text(splitNota, margin, currentY);
    currentY += splitNota.length * 3 + 12;

    // 8. Espaço de Assinatura Profissional
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.5);
    const lineXStart = pageWidth / 2 - 45;
    const lineXEnd = pageWidth / 2 + 45;
    doc.line(lineXStart, currentY, lineXEnd, currentY);

    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.text('Emanoel S. Amorim', pageWidth / 2, currentY, { align: 'center' });

    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('Arquiteto e Urbanista • CAU nº A133593-6', pageWidth / 2, currentY, { align: 'center' });

    // Salvar Documento
    const nomeArquivo = `Reajuste_Contrato_${(this.numeroContrato() || '000').replace(/[^a-zA-Z0-9]/g, '_')}_Medicao_${this.numeroMedicao() || '1'}.pdf`;
    doc.save(nomeArquivo);
  }

  private formatarMoeda(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
