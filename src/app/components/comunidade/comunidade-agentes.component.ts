import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReajusteContratoComponent } from './agentes/reajuste-contrato.component';
import { BibliotecaPromptsComponent } from './agentes/biblioteca-prompts.component';
import { SkillsCatalogoComponent } from './agentes/skills-catalogo.component';
import { ChecklistLicitacaoComponent } from './agentes/checklist-licitacao.component';

export type FerramentaAtiva = 'lista' | 'reajuste-contrato' | 'biblioteca-prompts' | 'skills-catalogo' | 'checklist-licitacao';

@Component({
  selector: 'app-comunidade-agentes',
  standalone: true,
  imports: [CommonModule, ReajusteContratoComponent, BibliotecaPromptsComponent, SkillsCatalogoComponent, ChecklistLicitacaoComponent],
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
                Ferramentas, bibliotecas de prompts, checklists e skills de automação para agilizar o trabalho técnico.
              </p>
            </div>

            <!-- Contador de Ferramentas -->
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                4
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Módulos Ativos</div>
                <div class="text-[11px] text-indigo-200">
                  Prontos para uso
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

          <!-- CARD 2: BIBLIOTECA DE PROMPTS (ATIVO) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  Disponível
                </span>
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Biblioteca de Prompts
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  369 prompts especializados prontos para copiar e usar na sua ferramenta de IA preferida.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">369 Prompts</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">7 Categorias</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Copiar c/ 1 Clique</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('biblioteca-prompts')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Catálogo</span>
                <svg class="w-4 h-4 text-[#E59866] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- CARD 3: SKILLS CLAUDE (ATIVO) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-[#B5642A]/40 shadow-sm hover:shadow-xl hover:border-[#B5642A] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#B5642A]/15 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  Disponível
                </span>
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-[#B5642A] transition-colors">
                  Skills Claude
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Pacotes de instruções reutilizáveis para automatizar orçamentos, projetos e fluxos complexos no seu Claude.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#B5642A] border border-amber-200/60">Claude Code / CLI</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Claude Cowork</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Guia Passo a Passo</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('skills-catalogo')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Acessar Skills & Guias</span>
                <svg class="w-4 h-4 text-[#E59866] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- CARD 4: CHECKLIST DE LICITAÇÃO (ATIVO) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  Disponível
                </span>
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Checklist de Licitação
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Confira a documentação de habilitação exigida pela Lei 14.133/2021 antes de submeter sua proposta em editais.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Lei 14.133/2021</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">4 Categorias</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Barra de Progresso</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('checklist-licitacao')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Checklist</span>
                <svg class="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>

      } @else if (ferramentaAtiva() === 'reajuste-contrato') {
        
        <!-- 3. Visualização da Ferramenta: Reajuste de Contrato -->
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

      } @else if (ferramentaAtiva() === 'biblioteca-prompts') {

        <!-- 4. Visualização da Ferramenta: Biblioteca de Prompts -->
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
              Módulo: Catálogo de 369 Prompts Especializados
            </span>
          </div>

          <!-- Componente da Biblioteca de Prompts -->
          <app-biblioteca-prompts></app-biblioteca-prompts>
        </div>

      } @else if (ferramentaAtiva() === 'skills-catalogo') {

        <!-- 5. Visualização do Módulo: Skills Claude -->
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
              Módulo: Skills Claude & Guias de Instalação
            </span>
          </div>

          <!-- Componente do Catálogo de Skills -->
          <app-skills-catalogo></app-skills-catalogo>
        </div>

      } @else if (ferramentaAtiva() === 'checklist-licitacao') {

        <!-- 6. Visualização do Módulo: Checklist de Licitação -->
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
              Módulo: Checklist de Habilitação (Lei 14.133/2021)
            </span>
          </div>

          <!-- Componente do Checklist de Licitação -->
          <app-checklist-licitacao></app-checklist-licitacao>
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

