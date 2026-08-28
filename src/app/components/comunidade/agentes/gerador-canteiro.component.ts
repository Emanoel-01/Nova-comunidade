import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SupabaseService } from '../../../../services/supabase.service';
import {
  FormPlanoCanteiro,
  PlanoCanteiroResultado,
  TipoObra,
  PorteObra,
  FaixaTrabalhadores,
  PerfilAnaliseIA,
  TIPOS_OBRA_OPCOES,
  PORTES_OBRA_OPCOES,
  TRABALHADORES_OPCOES,
  PERFIS_ANALISE_OPCOES,
  RESTRICOES_ACESSO_ITEMS,
  RESTRICOES_ADICIONAIS_ITEMS,
  gerarPlanoCanteiroCompleto,
  ZonaCanteiroVisual
} from './gerador-canteiro.data';

type TabResultado = 'memorial' | 'otimizacoes' | 'dimensionamento' | 'layout_zonas';

@Component({
  selector: 'app-gerador-canteiro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">

      <!-- CABEÇALHO DA FERRAMENTA -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <!-- Detalhe decorativo sutil de fundo -->
        <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>

        <div class="space-y-2 relative z-10">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="voltarParaLista()"
              class="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Voltar aos Agentes</span>
            </button>
            <span class="text-slate-600">·</span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Agente de Inteligência Artificial
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NR-18 • NR-12 • NR-10 • PGRCC
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Gerador de Plano de Canteiro de Obras (IA)
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Planejamento logístico inteligente, dimensionamento normativo rigoroso de instalações e áreas de vivência (NR-18/NBR 12.284), fluxos de materiais Lean, controle de resíduos PGRCC e memorial técnico descritivo.
          </p>
        </div>

        @if (resultadoPlano()) {
          <div class="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
            <button
              type="button"
              (click)="novoPlano()"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Ajustar Parâmetros</span>
            </button>

            <button
              type="button"
              (click)="exportarPDF()"
              [disabled]="gerandoPdf()"
              class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (gerandoPdf()) {
                <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Gerando Relatório...</span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exportar Relatório PDF</span>
              }
            </button>
          </div>
        }
      </div>

      <!-- CORPO PRINCIPAL: WIZARD OU RESULTADO -->
      @if (!resultadoPlano()) {

        <!-- STEPPER DE NAVEGAÇÃO -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between max-w-2xl mx-auto">

            <!-- Passo 1 -->
            <button
              type="button"
              (click)="etapaAtual.set(1)"
              class="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all"
                [class]="etapaAtual() === 1
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20'
                  : etapaAtual() > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
              >
                @if (etapaAtual() > 1) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  1
                }
              </div>
              <div class="hidden sm:block">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Etapa 1</p>
                <p class="text-xs font-bold" [class]="etapaAtual() === 1 ? 'text-indigo-600' : 'text-slate-700'">Identificação</p>
              </div>
            </button>

            <div class="flex-1 h-0.5 mx-3 sm:mx-6" [class]="etapaAtual() >= 2 ? 'bg-indigo-600' : 'bg-slate-200'"></div>

            <!-- Passo 2 -->
            <button
              type="button"
              (click)="etapaAtual.set(2)"
              class="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all"
                [class]="etapaAtual() === 2
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20'
                  : etapaAtual() > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
              >
                @if (etapaAtual() > 2) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  2
                }
              </div>
              <div class="hidden sm:block">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Etapa 2</p>
                <p class="text-xs font-bold" [class]="etapaAtual() === 2 ? 'text-indigo-600' : 'text-slate-700'">Terreno & Acessos</p>
              </div>
            </button>

            <div class="flex-1 h-0.5 mx-3 sm:mx-6" [class]="etapaAtual() >= 3 ? 'bg-indigo-600' : 'bg-slate-200'"></div>

            <!-- Passo 3 -->
            <button
              type="button"
              (click)="etapaAtual.set(3)"
              class="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all"
                [class]="etapaAtual() === 3
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'"
              >
                3
              </div>
              <div class="hidden sm:block">
                <p class="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Etapa 3</p>
                <p class="text-xs font-bold" [class]="etapaAtual() === 3 ? 'text-indigo-600' : 'text-slate-700'">Parâmetros & IA</p>
              </div>
            </button>

          </div>
        </div>

        <!-- FORMULÁRIO DO WIZARD -->
        <div class="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">

          <!-- ETAPA 1: IDENTIFICAÇÃO DO PROJETO -->
          @if (etapaAtual() === 1) {
            <div class="space-y-6 animate-in fade-in duration-150">

              <div>
                <h3 class="text-lg font-bold text-slate-900">Identificação & Tipologia do Empreendimento</h3>
                <p class="text-xs text-slate-500 mt-1">Defina as características essenciais para calibrar a escala e as exigências normativas do canteiro.</p>
              </div>

              <!-- Nome do Projeto -->
              <div class="space-y-1.5">
                <label for="input-nome-projeto" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nome do Projeto / Obra <span class="text-rose-500">*</span>
                </label>
                <input
                  id="input-nome-projeto"
                  type="text"
                  [value]="form().nomeProjeto"
                  (input)="atualizarCampo('nomeProjeto', $any($event.target).value)"
                  placeholder="Ex: Edifício Residencial Horizon Park • Residência Alphaville Lote 14 • Galpão Logístico"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs font-medium"
                />
              </div>

              <!-- Tipo de Obra -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tipo de Obra
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  @for (tipo of tiposObra; track tipo.id) {
                    <div
                      (click)="atualizarCampo('tipoObra', tipo.id)"
                      class="p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-3"
                      [class]="form().tipoObra === tipo.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5">
                          <div
                            class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                            [class]="form().tipoObra === tipo.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span class="text-xs font-bold text-slate-900">{{ tipo.nome }}</span>
                        </div>

                        <div
                          class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1"
                          [class]="form().tipoObra === tipo.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'"
                        >
                          @if (form().tipoObra === tipo.id) {
                            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                          }
                        </div>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">{{ tipo.descricao }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Porte da Obra -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Porte & Área Construída Estimada
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  @for (porte of portesObra; track porte.id) {
                    <div
                      (click)="atualizarCampo('porteObra', porte.id)"
                      class="p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-2"
                      [class]="form().porteObra === porte.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">{{ porte.nome }}</span>
                        <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {{ porte.faixaArea }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 leading-relaxed">{{ porte.detalhe }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Ações Etapa 1 -->
              <div class="pt-4 flex items-center justify-end border-t border-slate-100">
                <button
                  type="button"
                  (click)="irParaEtapa(2)"
                  class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Avançar para Terreno & Restrições</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

            </div>
          }

          <!-- ETAPA 2: CONTEXTO DO LOCAL & TERRENO -->
          @if (etapaAtual() === 2) {
            <div class="space-y-6 animate-in fade-in duration-150">

              <div>
                <h3 class="text-lg font-bold text-slate-900">Contexto do Terreno, Topografia & Acessos</h3>
                <p class="text-xs text-slate-500 mt-1">Descreva o lote, faça upload opcional do croqui e informe restrições viárias e ambientais.</p>
              </div>

              <!-- Descrição do Terreno -->
              <div class="space-y-1.5">
                <label for="textarea-terreno" class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Descrição do Terreno & Vizinhança
                </label>
                <textarea
                  id="textarea-terreno"
                  rows="3"
                  [value]="form().descricaoTerreno"
                  (input)="atualizarCampo('descricaoTerreno', $any($event.target).value)"
                  placeholder="Ex: Lote de 15x30m (450m²), plano, vizinhança residencial nos fundos e lateral esquerda, lateral direita com lote vago. Testada para avenida de pista dupla com ponto de ônibus próximo."
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs leading-relaxed"
                ></textarea>
              </div>

              <!-- Upload de Croqui / Imagem do Terreno -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload de Croqui / Planta de Situação (Opcional)
                </label>

                @if (!form().imagemUrl) {
                  <div
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()"
                    class="p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2.5"
                    [class]="isDragging()
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'"
                  >
                    <input
                      #fileInput
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      (change)="onFileSelected($event)"
                      class="hidden"
                    />

                    <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div class="space-y-1">
                      <p class="text-xs font-bold text-slate-800">
                        Clique para selecionar ou arraste o croqui do terreno aqui
                      </p>
                      <p class="text-[11px] text-slate-500">
                        Formatos aceitos: PNG, JPG ou WEBP (máx. 10MB)
                      </p>
                    </div>
                  </div>
                } @else {
                  <div class="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                      <img
                        [src]="form().imagemUrl"
                        alt="Croqui do Terreno"
                        class="w-16 h-16 rounded-xl object-cover border border-indigo-200 shadow-2xs shrink-0"
                      />
                      <div>
                        <p class="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                          {{ form().imagemNome || 'Croqui do Terreno Anexado' }}
                        </p>
                        <p class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Imagem carregada para análise espacial da IA
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="removerImagem()"
                      class="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer self-end sm:self-auto shrink-0 shadow-2xs"
                    >
                      Remover Imagem
                    </button>
                  </div>
                }
              </div>

              <!-- Restrições de Acesso Viário -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Restrições de Acesso Viário & Logística
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (item of restricoesAcessoItems; track item.key) {
                    <div
                      (click)="toggleRestricaoAcesso(item.key)"
                      class="p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3"
                      [class]="form().restricoesAcesso[item.key]
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <input
                        type="checkbox"
                        [checked]="form().restricoesAcesso[item.key]"
                        (change)="toggleRestricaoAcesso(item.key)"
                        class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5 cursor-pointer"
                      />
                      <div class="space-y-0.5">
                        <p class="text-xs font-bold text-slate-900">{{ item.label }}</p>
                        <p class="text-[11px] text-slate-500 leading-relaxed">{{ item.impacto }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Restrições Adicionais & Topografia -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Restrições Ambientais, Topográficas & Concessionárias
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  @for (item of restricoesAdicionaisItems; track item.key) {
                    <div
                      (click)="toggleRestricaoAdicional(item.key)"
                      class="p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3"
                      [class]="form().restricoesAdicionais[item.key]
                        ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <input
                        type="checkbox"
                        [checked]="form().restricoesAdicionais[item.key]"
                        (change)="toggleRestricaoAdicional(item.key)"
                        class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5 cursor-pointer"
                      />
                      <div class="space-y-0.5">
                        <p class="text-xs font-bold text-slate-900">{{ item.label }}</p>
                        <p class="text-[11px] text-slate-500 leading-relaxed">{{ item.impacto }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Ações Etapa 2 -->
              <div class="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  (click)="irParaEtapa(1)"
                  class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  (click)="irParaEtapa(3)"
                  class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Avançar para Parâmetros & IA</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

            </div>
          }

          <!-- ETAPA 3: PERSONALIZAÇÃO & PARÂMETROS OPERACIONAIS -->
          @if (etapaAtual() === 3) {
            <div class="space-y-6 animate-in fade-in duration-150">

              <div>
                <h3 class="text-lg font-bold text-slate-900">Efetivo de Operários & Perfil da Análise</h3>
                <p class="text-xs text-slate-500 mt-1">Defina o contingente no pico para cálculo das áreas de vivência (NR-18) e escolha a lente técnica da IA.</p>
              </div>

              <!-- Faixa de Trabalhadores no Pico -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trabalhadores no Pico da Obra (Dimensionamento NR-18)
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  @for (opc of trabalhadoresOpcoes; track opc.id) {
                    <div
                      (click)="atualizarCampo('trabalhadoresPico', opc.id)"
                      class="p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-2"
                      [class]="form().trabalhadoresPico === opc.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">{{ opc.nome }}</span>
                        <div
                          class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                          [class]="form().trabalhadoresPico === opc.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'"
                        >
                          @if (form().trabalhadoresPico === opc.id) {
                            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                          }
                        </div>
                      </div>
                      <p class="text-[11px] text-slate-500">Estimativa média: ~{{ opc.qtdMedia }} colaboradores</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Perfil de Análise da IA -->
              <div class="space-y-2.5">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Perfil de Análise & Prioridade da IA
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (perfil of perfisAnalise; track perfil.id) {
                    <div
                      (click)="atualizarCampo('perfilAnalise', perfil.id)"
                      class="p-4 rounded-2xl border transition-all cursor-pointer select-none relative flex flex-col justify-between gap-3"
                      [class]="form().perfilAnalise === perfil.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-900">{{ perfil.nome }}</span>
                            @if (perfil.id === 'padrao') {
                              <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">Recomendado</span>
                            }
                          </div>
                          <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">{{ perfil.descricao }}</p>
                        </div>

                        <div
                          class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                          [class]="form().perfilAnalise === perfil.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'"
                        >
                          @if (form().perfilAnalise === perfil.id) {
                            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                          }
                        </div>
                      </div>

                      <div class="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Foco: {{ perfil.foco }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Card Informativo de Responsabilidade Técnica -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                  EA
                </div>
                <div class="space-y-0.5 text-xs">
                  <p class="font-bold text-slate-900">Responsável Técnico & Diretor de Engenharia</p>
                  <p class="text-slate-600 text-[11px]">
                    <strong>Emanoel S. Amorim</strong> • Arquiteto e Urbanista • CAU nº A133593-6 • Especialista em Engenharia Diagnóstica e Construção 4.0.
                  </p>
                </div>
              </div>

              <!-- Ações Etapa 3 -->
              <div class="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  (click)="irParaEtapa(2)"
                  class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  (click)="gerarPlano()"
                  [disabled]="gerandoPlano()"
                  class="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  @if (gerandoPlano()) {
                    <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ statusProgressoGeracao() }}</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Gerar Plano de Canteiro com IA</span>
                  }
                </button>
              </div>

            </div>
          }

        </div>

      } @else {

        <!-- TELA DE RESULTADOS (PLANO GERADO) -->
        <div class="space-y-6 animate-in fade-in duration-200">

          <!-- BARRA DE RESUMO DO PROJETO -->
          <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                  {{ getNomeTipo(form().tipoObra) }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {{ getNomePorte(form().porteObra) }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {{ getTextoTrabalhadores(form().trabalhadoresPico) }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                  Lente: {{ getNomePerfil(form().perfilAnalise) }}
                </span>
              </div>

              <h3 class="text-lg sm:text-xl font-bold text-slate-900">
                {{ form().nomeProjeto || 'Plano de Canteiro de Obras' }}
              </h3>
              <p class="text-xs text-slate-500">
                Plano elaborado conforme NR-18 (Portaria SEPRT 3.733/2020), NR-12, NR-10 e Resolução CONAMA 307.
              </p>
            </div>

            <!-- Botões de Ação Rápida -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="copiarMemorial()"
                class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                @if (copiadoMemorial()) {
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-emerald-700 font-bold">Copiado!</span>
                } @else {
                  <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copiar Markdown</span>
                }
              </button>

              <button
                type="button"
                (click)="exportarPDF()"
                [disabled]="gerandoPdf()"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Baixar PDF</span>
              </button>
            </div>
          </div>

          <!-- TABS DO RESULTADO -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <!-- Barra de Abas -->
            <div class="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
              <button
                type="button"
                (click)="tabAtiva.set('memorial')"
                class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                [class]="tabAtiva() === 'memorial'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Memorial Descritivo Completo</span>
              </button>

              <button
                type="button"
                (click)="tabAtiva.set('otimizacoes')"
                class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                [class]="tabAtiva() === 'otimizacoes'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Matriz de Otimizações de Layout</span>
              </button>

              <button
                type="button"
                (click)="tabAtiva.set('dimensionamento')"
                class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                [class]="tabAtiva() === 'dimensionamento'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Dimensionamento NR-18</span>
              </button>

              <button
                type="button"
                (click)="tabAtiva.set('layout_zonas')"
                class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                [class]="tabAtiva() === 'layout_zonas'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>Layout & Zoneamento do Canteiro</span>
              </button>
            </div>

            <!-- CONTEÚDO DAS ABAS -->
            <div class="p-5 sm:p-8">

              <!-- TAB 1: MEMORIAL DESCRITIVO MARKDOWN -->
              @if (tabAtiva() === 'memorial') {
                <div class="space-y-6 animate-in fade-in duration-150">

                  <!-- Análise Diagnóstica Espacial -->
                  @if (resultadoPlano()?.analiseImagem) {
                    <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 space-y-1 leading-relaxed">
                      <div class="flex items-center gap-2 font-bold text-indigo-900">
                        <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Diagnóstico Espacial do Terreno & Diretrizes de Implantação</span>
                      </div>
                      <p>{{ resultadoPlano()?.analiseImagem }}</p>
                    </div>
                  }

                  <!-- Visualizador de Texto Formatado -->
                  <div class="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-200 font-sans space-y-4">
                    <pre class="whitespace-pre-wrap font-sans text-slate-800 text-xs sm:text-sm leading-relaxed">{{ resultadoPlano()?.memorialDescritivo }}</pre>
                  </div>

                </div>
              }

              <!-- TAB 2: MATRIZ DE OTIMIZAÇÕES DE LAYOUT -->
              @if (tabAtiva() === 'otimizacoes') {
                <div class="space-y-6 animate-in fade-in duration-150">

                  <div>
                    <h4 class="text-base font-bold text-slate-900">Matriz de Soluções e Melhorias Logísticas</h4>
                    <p class="text-xs text-slate-500 mt-0.5">Problemas identificados pelo agente de IA e as recomendações técnicas operacionais.</p>
                  </div>

                  <!-- Resumo do Arranjo Espacial -->
                  <div class="p-4 rounded-2xl bg-slate-900 text-white space-y-1.5">
                    <div class="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Macro Zoneamento Recomendado</span>
                    </div>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {{ resultadoPlano()?.otimizacoesLayout?.layoutOtimizado }}
                    </p>
                  </div>

                  <!-- Grupo 1: Eficiência Espacial -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Eficiência Espacial & Aproveitamento do Lote
                      </h5>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (item of resultadoPlano()?.otimizacoesLayout?.eficienciaEspacial; track item.problema) {
                        <div class="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                          <div class="space-y-1">
                            <span class="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Desafio / Problema</span>
                            <p class="text-xs font-semibold text-slate-900">{{ item.problema }}</p>
                          </div>

                          <div class="space-y-1 pt-2 border-t border-slate-100">
                            <span class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Solução Técnica Proposta</span>
                            <p class="text-xs text-slate-700 leading-relaxed">{{ item.solucao }}</p>
                          </div>

                          <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Benefício:</strong> {{ item.beneficio }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Grupo 2: Fluxo de Materiais & Logística -->
                  <div class="space-y-3 pt-4">
                    <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Fluxo de Materiais & Logística Interna (Lean Construction)
                      </h5>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (item of resultadoPlano()?.otimizacoesLayout?.fluxoMateriais; track item.problema) {
                        <div class="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                          <div class="space-y-1">
                            <span class="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Desafio / Problema</span>
                            <p class="text-xs font-semibold text-slate-900">{{ item.problema }}</p>
                          </div>

                          <div class="space-y-1 pt-2 border-t border-slate-100">
                            <span class="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Solução Técnica Proposta</span>
                            <p class="text-xs text-slate-700 leading-relaxed">{{ item.solucao }}</p>
                          </div>

                          <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Benefício:</strong> {{ item.beneficio }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Grupo 3: Segurança no Trabalho (NR-18 / NR-12 / NR-10) -->
                  <div class="space-y-3 pt-4">
                    <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div class="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Segurança do Trabalho & Controles Coletivos (NR-18)
                      </h5>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (item of resultadoPlano()?.otimizacoesLayout?.seguranca; track item.problema) {
                        <div class="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                          <div class="space-y-1">
                            <span class="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Desafio / Problema</span>
                            <p class="text-xs font-semibold text-slate-900">{{ item.problema }}</p>
                          </div>

                          <div class="space-y-1 pt-2 border-t border-slate-100">
                            <span class="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Solução Técnica Proposta</span>
                            <p class="text-xs text-slate-700 leading-relaxed">{{ item.solucao }}</p>
                          </div>

                          <div class="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Benefício:</strong> {{ item.beneficio }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                </div>
              }

              <!-- TAB 3: DIMENSIONAMENTO NORMATIVO NR-18 -->
              @if (tabAtiva() === 'dimensionamento') {
                @let dim = resultadoPlano()?.dimensionamentoNormativo!;
                <div class="space-y-6 animate-in fade-in duration-150">

                  <div>
                    <h4 class="text-base font-bold text-slate-900">Quadro de Dimensionamento Regulamentar (NR-18)</h4>
                    <p class="text-xs text-slate-500 mt-0.5">Parâmetros mínimos calculados para o efetivo de {{ getTextoTrabalhadores(form().trabalhadoresPico) }}.</p>
                  </div>

                  <!-- Cards de Indicadores Rápidos -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                      <p class="text-2xl font-black text-blue-900">{{ dim.sanitariosBacias }}</p>
                      <p class="text-xs font-bold text-blue-800">Bacias Sanitárias</p>
                      <p class="text-[10px] text-blue-600">1 / 20 operários</p>
                    </div>

                    <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                      <p class="text-2xl font-black text-emerald-900">{{ dim.chuveiros }}</p>
                      <p class="text-xs font-bold text-emerald-800">Chuveiros Elétricos</p>
                      <p class="text-[10px] text-emerald-600">1 / 10 operários</p>
                    </div>

                    <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
                      <p class="text-2xl font-black text-amber-900">{{ dim.areaRefeitorioM2 }} m²</p>
                      <p class="text-xs font-bold text-amber-800">Área Refeitório</p>
                      <p class="text-[10px] text-amber-600">1,20 m² / pessoa</p>
                    </div>

                    <div class="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
                      <p class="text-2xl font-black text-purple-900">{{ dim.areaVestiarioM2 }} m²</p>
                      <p class="text-xs font-bold text-purple-800">Área Vestiário</p>
                      <p class="text-[10px] text-purple-600">1,50 m² / pessoa</p>
                    </div>
                  </div>

                  <!-- Tabela Detalhada de Dimensionamento -->
                  <div class="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th class="p-3.5">Instalação Obrigatória</th>
                          <th class="p-3.5">Critério Normativo</th>
                          <th class="p-3.5 text-center">Quantitativo</th>
                          <th class="p-3.5">Exigências Construtivas NR-18</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 text-slate-800">
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Bacias Sanitárias</td>
                          <td class="p-3.5 text-slate-500">1 a cada 20 trabalhadores</td>
                          <td class="p-3.5 text-center font-bold text-indigo-600">{{ dim.sanitariosBacias }} unid.</td>
                          <td class="p-3.5 text-slate-600">Cabines individuais (0,80x1,20m), portas com trinco e lixeira com tampa.</td>
                        </tr>
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Lavatórios</td>
                          <td class="p-3.5 text-slate-500">1 a cada 20 trabalhadores</td>
                          <td class="p-3.5 text-center font-bold text-indigo-600">{{ dim.lavatorios }} unid.</td>
                          <td class="p-3.5 text-slate-600">Sabonete líquido, toalha de papel descartável e torneira com água potável.</td>
                        </tr>
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Mictórios</td>
                          <td class="p-3.5 text-slate-500">1 a cada 20 trabalhadores</td>
                          <td class="p-3.5 text-center font-bold text-indigo-600">{{ dim.mictorios }} unid.</td>
                          <td class="p-3.5 text-slate-600">Tipo cuba individual ou calha coletiva com descarga contínua/automática.</td>
                        </tr>
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Chuveiros com Água Quente</td>
                          <td class="p-3.5 text-slate-500">1 a cada 10 trabalhadores</td>
                          <td class="p-3.5 text-center font-bold text-indigo-600">{{ dim.chuveiros }} unid.</td>
                          <td class="p-3.5 text-slate-600">Cabine de 0,80x0,80m com estrado de plástico/madeira, suporte para sabonete e cabide.</td>
                        </tr>
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Bebedouros de Jato Inclinado</td>
                          <td class="p-3.5 text-slate-500">1 a cada 25 trabalhadores</td>
                          <td class="p-3.5 text-center font-bold text-indigo-600">{{ dim.bebedourosJatoInclinado }} unid.</td>
                          <td class="p-3.5 text-slate-600">Água potável, filtrada e fresca (proibido copo coletivo).</td>
                        </tr>
                        <tr class="hover:bg-slate-50">
                          <td class="p-3.5 font-bold">Ambulatório Médico</td>
                          <td class="p-3.5 text-slate-500">Obrigatório p/ > 50 operários</td>
                          <td class="p-3.5 text-center font-bold" [class]="dim.necessitaAmbulatorio ? 'text-emerald-600' : 'text-slate-400'">
                            {{ dim.necessitaAmbulatorio ? 'Obrigatório (8m²)' : 'Dispensado' }}
                          </td>
                          <td class="p-3.5 text-slate-600">
                            {{ dim.necessitaAmbulatorio ? 'Maca, armário de medicamentos, pia e maca envelope.' : 'Caixa de primeiros socorros sob guarda de funcionário treinado na portaria.' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Gestão de Resíduos PGRCC (CONAMA 307) -->
                  <div class="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        ♻️
                      </div>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-900">
                        Classificação & Segregação de Resíduos (Resolução CONAMA 307)
                      </h5>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div class="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
                        <span class="font-bold text-emerald-900">Classe A (Inertes & Reutilizáveis)</span>
                        <p class="text-slate-600 text-[11px] leading-relaxed">{{ dim.residuosPGRCC.classeA }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-white border border-blue-200 space-y-1">
                        <span class="font-bold text-blue-900">Classe B (Recicláveis)</span>
                        <p class="text-slate-600 text-[11px] leading-relaxed">{{ dim.residuosPGRCC.classeB }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
                        <span class="font-bold text-amber-900">Classe C (Sem Reciclabilidade Viável)</span>
                        <p class="text-slate-600 text-[11px] leading-relaxed">{{ dim.residuosPGRCC.classeC }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-white border border-rose-200 space-y-1">
                        <span class="font-bold text-rose-900">Classe D (Perigosos & Químicos)</span>
                        <p class="text-slate-600 text-[11px] leading-relaxed">{{ dim.residuosPGRCC.classeD }}</p>
                      </div>
                    </div>
                  </div>

                </div>
              }

              <!-- TAB 4: LAYOUT & ZONEAMENTO DO CANTEIRO -->
              @if (tabAtiva() === 'layout_zonas') {
                <div class="space-y-6 animate-in fade-in duration-150">

                  <div>
                    <h4 class="text-base font-bold text-slate-900">Zoneamento Esquemático do Canteiro de Obras</h4>
                    <p class="text-xs text-slate-500 mt-0.5">Mapa esquemático das zonas funcionais e recomendações de localização física no lote.</p>
                  </div>

                  <!-- Visualizador Interativo de Zonas -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (zona of resultadoPlano()?.zonasCanteiro; track zona.id) {
                      <div
                        class="p-4 rounded-2xl border transition-all space-y-3 shadow-2xs hover:shadow-sm"
                        [style.borderColor]="zona.cor + '40'"
                        [style.backgroundColor]="zona.corBg"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex items-center gap-2.5">
                            <div
                              class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                              [style.backgroundColor]="zona.cor"
                            >
                              {{ zona.sigla }}
                            </div>
                            <div>
                              <h5 class="text-xs font-bold text-slate-900 leading-tight">{{ zona.nome }}</h5>
                              <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Área Est.: ~{{ zona.dimensaoEstimadaM2 }} m²
                              </span>
                            </div>
                          </div>
                        </div>

                        <p class="text-xs text-slate-600 leading-relaxed">{{ zona.descricao }}</p>

                        <div class="space-y-1.5 pt-2 border-t border-black/5 text-[11px]">
                          <div>
                            <span class="font-bold text-slate-800">Posicionamento Recomendado:</span>
                            <p class="text-slate-600">{{ zona.posicionamentoRecomendado }}</p>
                          </div>
                          <div>
                            <span class="font-bold text-slate-800">Requisito Normativo:</span>
                            <p class="text-slate-600">{{ zona.requisitosNR }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Diagrama Esquemático Visual em SVG -->
                  <div class="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="space-y-0.5">
                        <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          Diagrama Esquemático do Arranjo Físico (Fluxo Unidirecional)
                        </h5>
                        <p class="text-[11px] text-slate-400">Representação lógica de adjacências e barreiras de proteção</p>
                      </div>
                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-slate-300">
                        NR-18 • Layout Seguro
                      </span>
                    </div>

                    <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      <div class="min-w-[600px] grid grid-cols-4 gap-3 text-center">
                        <div class="p-3 rounded-xl bg-slate-700/80 border border-slate-600">
                          <p class="font-bold text-white">TESTADA / RUA</p>
                          <p class="text-[10px] text-slate-400 mt-1">Portão A (Pedestre) + Portão B (Cargas)</p>
                        </div>
                        <div class="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
                          <p class="font-bold text-emerald-300">ÁREA DE VIVÊNCIA</p>
                          <p class="text-[10px] text-emerald-400 mt-1">Refeitório, Vestiário & Sanitários</p>
                        </div>
                        <div class="p-3 rounded-xl bg-amber-950/60 border border-amber-700/60">
                          <p class="font-bold text-amber-300">ALMOXARIFADO</p>
                          <p class="text-[10px] text-amber-400 mt-1">Ferramentas & Fiação NR-10</p>
                        </div>
                        <div class="p-3 rounded-xl bg-blue-950/60 border border-blue-700/60">
                          <p class="font-bold text-blue-300">ECOPONTO PGRCC</p>
                          <p class="text-[10px] text-blue-400 mt-1">Caçambas Classe A/B/C/D</p>
                        </div>
                      </div>

                      <div class="my-2 flex items-center justify-center text-slate-500 text-xs">
                        ↓ Passarela Peatonal Segregada ↓
                      </div>

                      <div class="min-w-[600px] grid grid-cols-3 gap-3 text-center">
                        <div class="p-3 rounded-xl bg-purple-950/60 border border-purple-700/60">
                          <p class="font-bold text-purple-300">CENTRAIS DE PRODUÇÃO</p>
                          <p class="text-[10px] text-purple-400 mt-1">Aço CA-50 & Carpintaria NR-12</p>
                        </div>
                        <div class="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/60">
                          <p class="font-bold text-indigo-300">TRANSPORTE VERTICAL</p>
                          <p class="text-[10px] text-indigo-400 mt-1">Elevador Cremalheira / Grua</p>
                        </div>
                        <div class="p-3 rounded-xl bg-orange-950/60 border border-orange-700/60">
                          <p class="font-bold text-orange-300">CENTRAL DE ARGAMASSA</p>
                          <p class="text-[10px] text-orange-400 mt-1">Betoneira 400L & Baias Areia/Brita</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              }

            </div>
          </div>

        </div>

      }

    </div>
  `
})
export class GeradorCanteiroComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly etapaAtual = signal<number>(1);
  readonly isDragging = signal<boolean>(false);
  readonly gerandoPlano = signal<boolean>(false);
  readonly statusProgressoGeracao = signal<string>('Processando...');
  readonly gerandoPdf = signal<boolean>(false);
  readonly copiadoMemorial = signal<boolean>(false);
  readonly tabAtiva = signal<TabResultado>('memorial');

  // Opções de formulário
  readonly tiposObra = TIPOS_OBRA_OPCOES;
  readonly portesObra = PORTES_OBRA_OPCOES;
  readonly trabalhadoresOpcoes = TRABALHADORES_OPCOES;
  readonly perfisAnalise = PERFIS_ANALISE_OPCOES;
  readonly restricoesAcessoItems = RESTRICOES_ACESSO_ITEMS;
  readonly restricoesAdicionaisItems = RESTRICOES_ADICIONAIS_ITEMS;

  // Estado do formulário
  readonly form = signal<FormPlanoCanteiro>({
    nomeProjeto: '',
    tipoObra: 'residencial_multifamiliar',
    porteObra: 'medio',
    descricaoTerreno: '',
    imagemUrl: null,
    imagemNome: null,
    restricoesAcesso: {
      caminhoesGrandes: false,
      restricaoHorario: false,
      maoUnica: false,
      semPavimentacao: false
    },
    restricoesAdicionais: {
      restricaoRuido: false,
      decliveAcentuado: false,
      trabalhoNoturno: false,
      redesDisponiveis: true,
      vegetacaoPreservar: false
    },
    trabalhadoresPico: '11_30',
    perfilAnalise: 'padrao'
  });

  // Resultado
  readonly resultadoPlano = signal<PlanoCanteiroResultado | null>(null);

  ngOnInit(): void {
    // Carregamento inicial limpo
  }

  voltarParaLista(): void {
    // Dispara evento via histórico ou custom event se necessário
    window.history.back();
  }

  irParaEtapa(etapa: number): void {
    if (etapa === 2 && !this.form().nomeProjeto.trim()) {
      this.atualizarCampo('nomeProjeto', 'Obra de Engenharia Civil');
    }
    this.etapaAtual.set(etapa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  atualizarCampo<K extends keyof FormPlanoCanteiro>(campo: K, valor: FormPlanoCanteiro[K]): void {
    this.form.update(f => ({ ...f, [campo]: valor }));
  }

  toggleRestricaoAcesso(key: keyof FormPlanoCanteiro['restricoesAcesso']): void {
    this.form.update(f => ({
      ...f,
      restricoesAcesso: {
        ...f.restricoesAcesso,
        [key]: !f.restricoesAcesso[key]
      }
    }));
  }

  toggleRestricaoAdicional(key: keyof FormPlanoCanteiro['restricoesAdicionais']): void {
    this.form.update(f => ({
      ...f,
      restricoesAdicionais: {
        ...f.restricoesAdicionais,
        [key]: !f.restricoesAdicionais[key]
      }
    }));
  }

  // Upload de Imagem / Croqui
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processarArquivoImagem(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processarArquivoImagem(target.files[0]);
    }
  }

  processarArquivoImagem(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.form.update(f => ({
        ...f,
        imagemUrl: base64,
        imagemNome: file.name
      }));
    };
    reader.readAsDataURL(file);
  }

  removerImagem(): void {
    this.form.update(f => ({
      ...f,
      imagemUrl: null,
      imagemNome: null
    }));
  }

  // Geração do Plano de Canteiro com IA
  async gerarPlano(): Promise<void> {
    this.gerandoPlano.set(true);
    this.statusProgressoGeracao.set('Analisando geometria do terreno e acessos viários...');

    try {
      await new Promise(r => setTimeout(r, 600));
      this.statusProgressoGeracao.set('Dimensionando áreas de vivência conforme NR-18 e NBR 12.284...');

      await new Promise(r => setTimeout(r, 600));
      this.statusProgressoGeracao.set('Otimizando fluxos Lean, transporte vertical e matriz PGRCC...');

      await new Promise(r => setTimeout(r, 500));
      this.statusProgressoGeracao.set('Formatando Memorial Descritivo com responsabilidade técnica...');

      const resultado = gerarPlanoCanteiroCompleto(this.form());
      this.resultadoPlano.set(resultado);
      this.tabAtiva.set('memorial');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro ao gerar plano de canteiro:', err);
    } finally {
      this.gerandoPlano.set(false);
    }
  }

  novoPlano(): void {
    this.resultadoPlano.set(null);
    this.etapaAtual.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async copiarMemorial(): Promise<void> {
    const memorial = this.resultadoPlano()?.memorialDescritivo;
    if (!memorial) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(memorial);
        this.copiadoMemorial.set(true);
        setTimeout(() => this.copiadoMemorial.set(false), 3000);
      }
    } catch (err) {
      console.warn('Falha ao copiar para clipboard:', err);
    }
  }

  // Exportação em PDF com identidade visual AmorimTech / Amorim Academy
  async exportarPDF(): Promise<void> {
    const res = this.resultadoPlano();
    if (!res) return;

    this.gerandoPdf.set(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const navyPrimary: [number, number, number] = [19, 42, 65]; // #132A41
      const copperAccent: [number, number, number] = [181, 100, 42]; // #B5642A
      const slateDark: [number, number, number] = [30, 41, 59]; // #1E293B
      const textWhite: [number, number, number] = [255, 255, 255];
      const bgCellLight: [number, number, number] = [248, 250, 252];
      const borderGray: [number, number, number] = [226, 232, 240];

      const margin = 14;
      let currentY = 16;

      // 1. Cabeçalho Institucional
      doc.setFillColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.rect(margin, currentY, 182, 22, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text('PLANO DE IMPLANTAÇÃO DE CANTEIRO DE OBRAS (NR-18)', margin + 6, currentY + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text('AMORIMTECH • ENGENHARIA DIAGNÓSTICA & GESTÃO DA CONSTRUÇÃO 4.0', margin + 6, currentY + 16);

      currentY += 27;

      // 2. Dados do Projeto e Identificação
      const infoProjeto = [
        ['EMPREENDIMENTO:', this.form().nomeProjeto || 'Obra de Edificação', 'TIPO DE OBRA:', this.getNomeTipo(this.form().tipoObra)],
        ['PORTE ESTIMADO:', this.getNomePorte(this.form().porteObra), 'EFETIVO DE PICO:', this.getTextoTrabalhadores(this.form().trabalhadoresPico)],
        ['PERFIL DE ANÁLISE:', this.getNomePerfil(this.form().perfilAnalise), 'DATA DE EMISSÃO:', new Date().toLocaleDateString('pt-BR')],
        ['RESPONSÁVEL TÉCNICO:', 'Emanoel S. Amorim', 'REGISTRO:', 'CAU nº A133593-6']
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2.2,
          lineColor: borderGray,
          textColor: slateDark
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 38 },
          1: { cellWidth: 53 },
          2: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 38 },
          3: { cellWidth: 53 }
        },
        body: infoProjeto
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // 3. Tabela de Dimensionamento das Áreas de Vivência (NR-18)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('1. DIMENSIONAMENTO REGULAMENTAR DE INSTALAÇÕES E ÁREAS DE VIVÊNCIA (NR-18)', margin, currentY);
      currentY += 3;

      const dim = res.dimensionamentoNormativo;
      const tabelaVivencia = [
        ['Bacias Sanitárias com Trinco', '1 a cada 20 trabalhadores', `${dim.sanitariosBacias} unid.`, 'Cabines individuais (0,80x1,20m) c/ porta e lixeira'],
        ['Lavatórios com Água e Sabão', '1 a cada 20 trabalhadores', `${dim.lavatorios} unid.`, 'Sabonete líquido e toalhas de papel descartáveis'],
        ['Mictórios com Descarga', '1 a cada 20 trabalhadores', `${dim.mictorios} unid.`, 'Tipo cuba individual ou calha coletiva lavável'],
        ['Chuveiros com Água Quente', '1 a cada 10 trabalhadores', `${dim.chuveiros} unid.`, 'Cabines de 0,80x0,80m com estrado antiderrapante'],
        ['Refeitório Coberto c/ Assentos', '1,20 m² por trabalhador', `${dim.areaRefeitorioM2} m²`, 'Mesas com tampo lavável e aquecedor de refeições'],
        ['Vestiário com Armários Duplos', '1,50 m² por trabalhador', `${dim.areaVestiarioM2} m²`, 'Armários com compartimento duplo e tranca'],
        ['Bebedouros de Jato Inclinado', '1 a cada 25 trabalhadores', `${dim.bebedourosJatoInclinado} unid.`, 'Água potável e fresca (proibido copo coletivo)'],
        ['Ambulatório de 1º Socorros', 'Obrigatório p/ > 50 operários', dim.necessitaAmbulatorio ? 'Projetado (8,0 m²)' : 'Dispensado', 'Maca, pia e armário para socorro imediato']
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: {
          fillColor: navyPrimary,
          textColor: textWhite,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left'
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        head: [['Instalação Provisória', 'Parâmetro NR-18', 'Quantitativo', 'Exigência Construtiva']],
        body: tabelaVivencia
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // 4. Matriz de Otimizações de Layout
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('2. MATRIZ DE OTIMIZAÇÕES LOGÍSTICAS E SEGURANÇA DO TRABALHO', margin, currentY);
      currentY += 3;

      const matrizData = [
        ...res.otimizacoesLayout.eficienciaEspacial.map(o => ['Espacial', o.problema, o.solucao, o.beneficio]),
        ...res.otimizacoesLayout.fluxoMateriais.map(o => ['Logística', o.problema, o.solucao, o.beneficio]),
        ...res.otimizacoesLayout.seguranca.map(o => ['Segurança', o.problema, o.solucao, o.beneficio])
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: {
          fillColor: copperAccent,
          textColor: textWhite,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left'
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: borderGray,
          textColor: slateDark
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 60 },
          3: { cellWidth: 52 }
        },
        head: [['Dimensão', 'Desafio Identificado', 'Solução Técnica Proposta', 'Benefício']],
        body: matrizData
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;

      // Nova Página se necessário
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // 5. Segregação de Resíduos PGRCC (CONAMA 307)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('3. GESTÃO E SEGREGAÇÃO DE RESÍDUOS SÓLIDOS (PGRCC / CONAMA 307)', margin, currentY);
      currentY += 3;

      const residuosData = [
        ['Classe A (Inertes)', dim.residuosPGRCC.classeA],
        ['Classe B (Recicláveis)', dim.residuosPGRCC.classeB],
        ['Classe C (Sem Reciclagem)', dim.residuosPGRCC.classeC],
        ['Classe D (Perigosos)', dim.residuosPGRCC.classeD]
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
          0: { fontStyle: 'bold', fillColor: bgCellLight, cellWidth: 45 },
          1: { cellWidth: 137 }
        },
        body: residuosData
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      // Assinatura Técnica
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel S. Amorim', 105, currentY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Arquiteto e Urbanista • CAU nº A133593-6', 105, currentY + 4, { align: 'center' });
      doc.text('Especialista em Engenharia Diagnóstica e Gestão da Construção 4.0', 105, currentY + 8, { align: 'center' });

      // Numeração de Páginas
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Plano de Canteiro de Obras • AmorimTech • Página ${i} de ${totalPages}`,
          105,
          290,
          { align: 'center' }
        );
      }

      const nomeLimpo = (this.form().nomeProjeto || 'Plano_Canteiro_Obras')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase();
      doc.save(`${nomeLimpo}_plano_canteiro_nr18.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar relatório em PDF. Tente novamente.');
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  // Helpers de Formatação
  getNomeTipo(tipo: TipoObra): string {
    const t = this.tiposObra.find(x => x.id === tipo);
    return t ? t.nome : tipo;
  }

  getNomePorte(porte: PorteObra): string {
    const p = this.portesObra.find(x => x.id === porte);
    return p ? p.nome : porte;
  }

  getTextoTrabalhadores(faixa: FaixaTrabalhadores): string {
    const tr = this.trabalhadoresOpcoes.find(x => x.id === faixa);
    return tr ? tr.nome : faixa;
  }

  getNomePerfil(perfil: PerfilAnaliseIA): string {
    const p = this.perfisAnalise.find(x => x.id === perfil);
    return p ? p.nome : perfil;
  }
}
