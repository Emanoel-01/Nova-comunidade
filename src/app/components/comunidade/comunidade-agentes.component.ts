import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReajusteContratoComponent } from './agentes/reajuste-contrato.component';

export type FerramentaAtiva = 'lista' | 'reajuste-contrato';

@Component({
  selector: 'app-comunidade-agentes',
  standalone: true,
  imports: [CommonModule, ReajusteContratoComponent],
  template: `
    <div class="space-y-6">

      @if (ferramentaAtiva() === 'lista') {
        
        <!-- 1. Cabeçalho da Área Agentes -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="space-y-2 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Automações & Inteligência Operacional</span>
              </div>

              <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Agentes</span>
              </h3>

              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ferramentas e automações internas para agilizar o trabalho técnico.
              </p>
            </div>

            <!-- Contador de Ferramentas -->
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                1
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Módulos Ativos</div>
                <div class="text-[11px] text-indigo-200">
                  4 ferramentas no roadmap
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Grid de Cards de Agentes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- CARD 1: REAJUSTE DE CONTRATO (ATIVO) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  Disponível
                </span>
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Reajuste de Contrato
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Calcule o reajuste de contratos públicos pelos índices FGV (Coluna 35 e Coluna 39) e gere o relatório em PDF.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">FGV Coluna 35 & 39</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Exportação PDF</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Retenções Fiscais</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('reajuste-contrato')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Ferramenta</span>
                <svg class="w-4 h-4 text-[#E59866] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- CARD 2: GERADOR DE OFÍCIOS (EM BREVE) -->
          <div class="bg-white/80 rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between opacity-80 cursor-not-allowed">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  Em breve
                </span>
              </div>

              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-700">
                  Gerador de Ofícios
                </h4>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Emissão padronizada e automática de ofícios técnicos, comunicações formais e notificações contratuais.
                </p>
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">Modelos Padrão</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">Exportação DOCX/PDF</span>
              </div>
            </div>

            <div class="pt-6">
              <button
                type="button"
                disabled
                class="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
              >
                Em Desenvolvimento
              </button>
            </div>
          </div>

          <!-- CARD 3: ANÁLISE DE EDITAIS (EM BREVE) -->
          <div class="bg-white/80 rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between opacity-80 cursor-not-allowed">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  Em breve
                </span>
              </div>

              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-700">
                  Análise de Editais
                </h4>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Checklist de conformidade e extração de requisitos críticos de editais públicos de arquitetura e engenharia.
                </p>
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">Triagem de Riscos</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">Qualificação Técnica</span>
              </div>
            </div>

            <div class="pt-6">
              <button
                type="button"
                disabled
                class="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
              >
                Em Desenvolvimento
              </button>
            </div>
          </div>

        </div>

      } @else if (ferramentaAtiva() === 'reajuste-contrato') {
        
        <!-- 3. Visualização da Ferramenta Ativa com Barra Superior de Navegação -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <button
              type="button"
              (click)="voltarParaLista()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar para todos os Agentes</span>
            </button>

            <span class="text-xs font-bold text-slate-400">
              Módulo: Reajuste FGV/SINAENCO
            </span>
          </div>

          <!-- Componente da Ferramenta -->
          <app-reajuste-contrato></app-reajuste-contrato>
        </div>

      }

    </div>
  `
})
export class ComunidadeAgentesComponent {
  readonly ferramentaAtiva = signal<FerramentaAtiva>('lista');

  abrirFerramenta(ferramenta: FerramentaAtiva): void {
    this.ferramentaAtiva.set(ferramenta);
  }

  voltarParaLista(): void {
    this.ferramentaAtiva.set('lista');
  }
}
