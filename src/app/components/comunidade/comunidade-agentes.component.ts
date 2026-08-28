import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { ReajusteContratoComponent } from './agentes/reajuste-contrato.component';
import { BibliotecaPromptsComponent } from './agentes/biblioteca-prompts.component';
import { SkillsCatalogoComponent } from './agentes/skills-catalogo.component';
import { ChecklistLicitacaoComponent } from './agentes/checklist-licitacao.component';
import { LevantamentoQuantitativosComponent } from './agentes/levantamento-quantitativos.component';
import { CustosViabilidadeComponent } from './agentes/custos-viabilidade.component';
import { GeradorCanteiroComponent } from './agentes/gerador-canteiro.component';

export type FerramentaAtiva =
  | 'lista'
  | 'reajuste-contrato'
  | 'biblioteca-prompts'
  | 'skills-catalogo'
  | 'checklist-licitacao'
  | 'levantamento-quantitativos'
  | 'custos-viabilidade'
  | 'gerador-canteiro';

@Component({
  selector: 'app-comunidade-agentes',
  standalone: true,
  imports: [
    CommonModule,
    ReajusteContratoComponent,
    BibliotecaPromptsComponent,
    SkillsCatalogoComponent,
    ChecklistLicitacaoComponent,
    LevantamentoQuantitativosComponent,
    CustosViabilidadeComponent,
    GeradorCanteiroComponent
  ],
  template: `
    <div class="space-y-6">

      <!-- ======================================================= -->
      <!-- CASO: TELA DE ACESSO RESTRITO (TRAVA POR CARD)         -->
      <!-- ======================================================= -->
      @if (mostrarAcessoRestrito(); as restrito) {
        <div class="space-y-6 animate-fadeIn">
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

            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              🔒 Módulo Restrito
            </span>
          </div>

          <!-- Card Central de Acesso Restrito -->
          <div class="bg-white rounded-3xl border border-amber-200/80 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6">
            <div class="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
              🔒
            </div>

            <div class="space-y-2.5">
              <h4 class="text-xl sm:text-2xl font-black text-slate-900">
                Esta ferramenta é exclusiva para membros com acesso liberado
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A ferramenta <strong class="text-amber-900 font-bold">"{{ getNomeFerramenta(restrito) }}"</strong> requer permissão de acesso liberada em seu perfil. Fale com o Admin da Comunidade para solicitar liberação deste módulo.
              </p>
            </div>

            <div class="pt-2 flex justify-center gap-3">
              <button
                type="button"
                (click)="voltarParaLista()"
                class="px-6 py-3 rounded-2xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm"
              >
                Voltar para todos os Agentes
              </button>
            </div>
          </div>
        </div>

      } @else if (ferramentaAtiva() === 'lista') {
        
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
                7
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Módulos no Catálogo</div>
                <div class="text-[11px] text-indigo-200">
                  {{ contarLiberados() }} liberados para você
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Grid de Cards de Agentes -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- CARD 1: REAJUSTE DE CONTRATO -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                @if (temPermissao('reajuste-contrato')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
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
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">FGV Coluna 35 & 39</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Exportação PDF</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Retenções Fiscais</span>
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

          <!-- CARD 2: BIBLIOTECA DE PROMPTS -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>

                @if (temPermissao('biblioteca-prompts')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
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
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">369 Prompts</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">7 Categorias</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Copiar c/ 1 Clique</span>
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

          <!-- CARD 3: SKILLS CLAUDE -->
          <div class="bg-white rounded-3xl p-6 border-2 border-[#B5642A]/40 shadow-sm hover:shadow-xl hover:border-[#B5642A] transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#B5642A]/15 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                @if (temPermissao('skills-catalogo')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
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
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#B5642A] border border-amber-200/60">Claude Code / CLI</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Claude Cowork</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Guia Passo a Passo</span>
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

          <!-- CARD 4: CHECKLIST DE LICITAÇÃO -->
          <div class="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                @if (temPermissao('checklist-licitacao')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
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
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Lei 14.133/2021</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">4 Categorias</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Barra de Progresso</span>
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

          <!-- CARD 5: LEVANTAMENTO DE QUANTITATIVOS -->
          <div class="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-[#E59866] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                @if (temPermissao('levantamento-quantitativos')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Levantamento de Quantitativos
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Calcule concreto, forma, aço, alvenaria e demais insumos com regras de engenharia, autoauditoria e exportação CSV.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">8 Disciplinas</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Autoauditoria</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Exportação CSV</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('levantamento-quantitativos')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Calculadora</span>
                <svg class="w-4 h-4 text-[#E59866] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- CARD 6: CUSTOS & VIABILIDADE IMOBILIÁRIA (NBR 12.721) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                @if (temPermissao('custos-viabilidade')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  Custos & Viabilidade Imobiliária
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Estudo de viabilidade NBR 12.721, orçamentação pelo CUB Sinduscon, VGV, extracontratuais, matriz de sensibilidade e TIR/VPL.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">NBR 12.721</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">CUB Sinduscon</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">TIR / VPL</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Sensibilidade</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('custos-viabilidade')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Estudo de Viabilidade</span>
                <svg class="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- CARD 7: PLANO DE CANTEIRO DE OBRAS (IA) -->
          <div class="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div class="space-y-4">
              <!-- Topo do Card com Ícone e Badge Condicional -->
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-2xl bg-[#132A41] text-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                @if (temPermissao('gerador-canteiro')) {
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                    Disponível
                  </span>
                } @else {
                  <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Acesso Restrito</span>
                  </span>
                }
              </div>

              <!-- Conteúdo -->
              <div class="space-y-2">
                <h4 class="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Plano de Canteiro de Obras (IA)
                </h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Dimensionamento NR-18, layout Lean, fluxo de logística, PGRCC (CONAMA 307), memorial descritivo e relatório executivo em PDF.
                </p>
              </div>

              <!-- Tags de Recursos -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">NR-18 Atualizada</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Lean Layout</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">PGRCC / CONAMA</span>
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Relatório PDF</span>
              </div>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-6">
              <button
                type="button"
                (click)="abrirFerramenta('gerador-canteiro')"
                class="w-full py-3 px-4 rounded-xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-md"
              >
                <span>Abrir Gerador de Canteiro</span>
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

      } @else if (ferramentaAtiva() === 'levantamento-quantitativos') {

        <!-- 7. Visualização do Módulo: Levantamento de Quantitativos -->
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
              Módulo: Levantamento de Quantitativos
            </span>
          </div>

          <!-- Componente do Levantamento de Quantitativos -->
          <app-levantamento-quantitativos></app-levantamento-quantitativos>
        </div>

      } @else if (ferramentaAtiva() === 'custos-viabilidade') {

        <!-- 8. Visualização do Módulo: Custos & Viabilidade Imobiliária -->
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
              Módulo: Custos & Viabilidade Imobiliária (NBR 12.721)
            </span>
          </div>

          <!-- Componente de Custos & Viabilidade -->
          <app-custos-viabilidade></app-custos-viabilidade>
        </div>

      } @else if (ferramentaAtiva() === 'gerador-canteiro') {

        <!-- 9. Visualização do Módulo: Gerador de Plano de Canteiro de Obras (IA) -->
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
              Módulo: Plano de Canteiro de Obras (NR-18 & IA)
            </span>
          </div>

          <!-- Componente do Gerador de Canteiro -->
          <app-gerador-canteiro></app-gerador-canteiro>
        </div>

      }

    </div>
  `
})
export class ComunidadeAgentesComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly ferramentaAtiva = signal<FerramentaAtiva>('lista');
  readonly permissoesFerramentas = signal<Record<string, boolean>>({});
  readonly carregandoPermissoes = signal<boolean>(true);
  readonly mostrarAcessoRestrito = signal<FerramentaAtiva | null>(null);

  async ngOnInit(): Promise<void> {
    await this.carregarPermissoes();
  }

  async carregarPermissoes(): Promise<void> {
    this.carregandoPermissoes.set(true);
    const modulos: FerramentaAtiva[] = [
      'reajuste-contrato',
      'biblioteca-prompts',
      'skills-catalogo',
      'checklist-licitacao',
      'levantamento-quantitativos',
      'custos-viabilidade',
      'gerador-canteiro'
    ];
    try {
      const resultados = await Promise.all(
        modulos.map(async (m) => [m, await this.supabaseService.temPermissaoModulo('comunidade', m)] as const)
      );
      this.permissoesFerramentas.set(Object.fromEntries(resultados));
    } catch (e) {
      console.warn('Erro ao verificar permissões de agentes:', e);
    } finally {
      this.carregandoPermissoes.set(false);
    }
  }

  temPermissao(modulo: string): boolean {
    return !!this.permissoesFerramentas()[modulo];
  }

  contarLiberados(): number {
    return Object.values(this.permissoesFerramentas()).filter(Boolean).length;
  }

  abrirFerramenta(ferramenta: FerramentaAtiva): void {
    if (ferramenta !== 'lista' && !this.temPermissao(ferramenta)) {
      this.mostrarAcessoRestrito.set(ferramenta);
      return;
    }
    this.mostrarAcessoRestrito.set(null);
    this.ferramentaAtiva.set(ferramenta);
    if (ferramenta !== 'lista') {
      this.supabaseService.registrarAtividadeDiaria('agente_ia');
    }
  }

  voltarParaLista(): void {
    this.mostrarAcessoRestrito.set(null);
    this.ferramentaAtiva.set('lista');
  }

  getNomeFerramenta(ferramenta: FerramentaAtiva): string {
    switch (ferramenta) {
      case 'reajuste-contrato':
        return 'Reajuste de Contrato';
      case 'biblioteca-prompts':
        return 'Biblioteca de Prompts';
      case 'skills-catalogo':
        return 'Skills Claude';
      case 'checklist-licitacao':
        return 'Checklist de Licitação';
      case 'levantamento-quantitativos':
        return 'Levantamento de Quantitativos';
      case 'custos-viabilidade':
        return 'Custos & Viabilidade Imobiliária';
      case 'gerador-canteiro':
        return 'Plano de Canteiro de Obras (IA)';
      default:
        return 'Ferramenta de Agente';
    }
  }
}
