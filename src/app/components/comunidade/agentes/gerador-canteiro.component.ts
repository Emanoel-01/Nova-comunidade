import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { MotorPdfService } from '../../../services/motor-pdf.service';
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

        <!-- AÇÕES DO CABEÇALHO -->
        <div class="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            (click)="abrirModalMeusProjetos()"
            class="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/15 shadow-2xs"
            title="Ver meus projetos salvos"
          >
            <svg class="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>Meus Projetos Salvos</span>
          </button>

          <button
            type="button"
            (click)="clicarSalvarProjeto()"
            [disabled]="salvandoProjeto()"
            class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30 disabled:opacity-50"
            [title]="projetoAtualId() ? 'Atualizar projeto salvo' : 'Salvar projeto atual'"
          >
            @if (salvandoProjeto()) {
              <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Salvando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{{ projetoAtualId() ? 'Salvar Alterações' : 'Salvar Projeto' }}</span>
            }
          </button>

          @if (projetoAtualId()) {
            <button
              type="button"
              (click)="clicarSalvarComoNovo()"
              class="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
              title="Salvar como um novo projeto"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Como Novo</span>
            </button>
          }

          @if (resultadoPlano()) {
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
          }
        </div>
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
                  {{ iniciaisResponsavel() }}
                </div>
                <div class="space-y-0.5 text-xs">
                  <p class="font-bold text-slate-900">
                    Responsável Técnico & {{ perfilProfissional()?.company_position || 'Direção Técnica' }}
                  </p>
                  <p class="text-slate-600 text-[11px]">
                    <strong>{{ perfilProfissional()?.full_name || 'Profissional Responsável' }}</strong>
                    • {{ perfilProfissional()?.professional_title || perfilProfissional()?.categoria_profissional || 'Responsável Técnico' }}
                    @if (perfilProfissional()?.crea_cau) {
                      • {{ perfilProfissional()?.crea_cau }}
                    }
                    @if (perfilProfissional()?.company_name) {
                      • {{ perfilProfissional()?.company_name }}
                    }
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

      <!-- MODAL: SALVAR PROJETO -->
      @if (modalSalvarAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Salvar Projeto</h4>
                  <p class="text-xs text-slate-500">Dê um nome para identificar este estudo de canteiro</p>
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
              <label class="text-xs font-bold text-slate-700">Nome do Projeto</label>
              <input
                type="text"
                [value]="modalSalvarNomeInput()"
                (input)="modalSalvarNomeInput.set($any($event.target).value)"
                (keydown.enter)="confirmarSalvarNovoProjeto()"
                placeholder="Ex: Canteiro Residencial Acácias — Fase Estrutura"
                class="w-full bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 rounded-xl p-3 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-hidden transition-all"
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
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
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
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-slate-900">Meus Projetos Salvos (Canteiro)</h4>
                  <p class="text-xs text-slate-500">Selecione um projeto para carregar e continuar editando</p>
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
                  <svg class="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-xs font-semibold">Carregando seus projetos...</span>
                </div>
              } @else if (listaProjetosSalvos().length === 0) {
                <div class="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-center">
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-xs font-bold text-slate-600">Nenhum projeto salvo ainda</p>
                  <p class="text-[11px] text-slate-400 max-w-xs">Preencha os dados e clique em "Salvar Projeto" para criar seu acervo de estudos técnicos.</p>
                </div>
              } @else {
                @for (proj of listaProjetosSalvos(); track proj.id) {
                  <div
                    class="p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group"
                    [class]="projetoAtualId() === proj.id
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'"
                  >
                    <div class="space-y-1 min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <h5 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {{ proj.nome_projeto }}
                        </h5>
                        @if (projetoAtualId() === proj.id) {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0">
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
                        class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                        title="Excluir projeto salvo"
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
export class GeradorCanteiroComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly motorPdfService = inject(MotorPdfService);

  readonly etapaAtual = signal<number>(1);
  readonly isDragging = signal<boolean>(false);
  readonly gerandoPlano = signal<boolean>(false);
  readonly statusProgressoGeracao = signal<string>('Processando...');
  readonly gerandoPdf = signal<boolean>(false);
  readonly copiadoMemorial = signal<boolean>(false);
  readonly tabAtiva = signal<TabResultado>('memorial');
  readonly perfilProfissional = signal<any>(null);

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

  readonly iniciaisResponsavel = computed(() => {
    const nome = this.perfilProfissional()?.full_name?.trim();
    if (!nome) return 'RT';
    const partes = nome.split(/\s+/).filter(Boolean);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  });

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

  async ngOnInit(): Promise<void> {
    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      if (perfil) {
        this.perfilProfissional.set(perfil);
      }
    } catch (e) {
      console.warn('Carregamento antecipado de perfil:', e);
    }
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
      if (!this.perfilProfissional()) {
        const p = await this.motorPdfService.obterPerfilDocumental();
        if (p) this.perfilProfissional.set(p);
      }

      await new Promise(r => setTimeout(r, 600));
      this.statusProgressoGeracao.set('Dimensionando áreas de vivência conforme NR-18 e NBR 12.284...');

      await new Promise(r => setTimeout(r, 600));
      this.statusProgressoGeracao.set('Otimizando fluxos Lean, transporte vertical e matriz PGRCC...');

      await new Promise(r => setTimeout(r, 500));
      this.statusProgressoGeracao.set('Formatando Memorial Descritivo com responsabilidade técnica...');

      const perfil = this.perfilProfissional();
      const resultado = gerarPlanoCanteiroCompleto(this.form(), {
        nome: perfil?.full_name,
        titulo: perfil?.professional_title || perfil?.categoria_profissional,
        registro: perfil?.crea_cau,
        empresa: perfil?.company_name
      });

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

  // Exportação em PDF com identidade visual e White-Label via MotorPdfService
  async exportarPDF(): Promise<void> {
    const res = this.resultadoPlano();
    if (!res) return;

    this.gerandoPdf.set(true);

    try {
      const dim = res.dimensionamentoNormativo;
      const dataHoje = new Date().toLocaleDateString('pt-BR');

      // 1. Tabela de Dimensionamento de Vivência (NR-18)
      const tabelaVivenciaHtml = [
        ['Bacias Sanitárias com Trinco', '1 a cada 20 trabalhadores', `${dim.sanitariosBacias} unid.`, 'Cabines individuais (0,80x1,20m) c/ porta e lixeira'],
        ['Lavatórios com Água e Sabão', '1 a cada 20 trabalhadores', `${dim.lavatorios} unid.`, 'Sabonete líquido e toalhas de papel descartáveis'],
        ['Mictórios com Descarga', '1 a cada 20 trabalhadores', `${dim.mictorios} unid.`, 'Tipo cuba individual ou calha coletiva lavável'],
        ['Chuveiros com Água Quente', '1 a cada 10 trabalhadores', `${dim.chuveiros} unid.`, 'Cabines de 0,80x0,80m com estrado antiderrapante'],
        ['Refeitório Coberto c/ Assentos', '1,20 m² por trabalhador', `${dim.areaRefeitorioM2} m²`, 'Mesas com tampo lavável e aquecedor de refeições'],
        ['Vestiário com Armários Duplos', '1,50 m² por trabalhador', `${dim.areaVestiarioM2} m²`, 'Armários com compartimento duplo e tranca'],
        ['Bebedouros de Jato Inclinado', '1 a cada 25 trabalhadores', `${dim.bebedourosJatoInclinado} unid.`, 'Água potável e fresca (proibido copo coletivo)'],
        ['Ambulatório de 1º Socorros', 'Obrigatório p/ > 50 operários', dim.necessitaAmbulatorio ? 'Projetado (8,0 m²)' : 'Dispensado', 'Maca, pia e armário para socorro imediato']
      ].map(([inst, param, qtd, exig]) => `
        <tr>
          <td><strong>${inst}</strong></td>
          <td>${param}</td>
          <td class="td-center font-bold" style="color: var(--p4-navy, #132A41); font-weight:700;">${qtd}</td>
          <td>${exig}</td>
        </tr>
      `).join('');

      // 2. Matriz de Otimizações Logísticas e Segurança
      const otimizacoesRows = [
        ...res.otimizacoesLayout.eficienciaEspacial.map(o => `
          <tr>
            <td><strong style="color: var(--p4-copper, #B5642A);">Espacial</strong></td>
            <td>${o.problema}</td>
            <td>${o.solucao}</td>
            <td>${o.beneficio}</td>
          </tr>
        `),
        ...res.otimizacoesLayout.fluxoMateriais.map(o => `
          <tr>
            <td><strong style="color: var(--p4-navy, #132A41);">Logística</strong></td>
            <td>${o.problema}</td>
            <td>${o.solucao}</td>
            <td>${o.beneficio}</td>
          </tr>
        `),
        ...res.otimizacoesLayout.seguranca.map(o => `
          <tr>
            <td><strong style="color: var(--p4-green, #16A34A);">Segurança</strong></td>
            <td>${o.problema}</td>
            <td>${o.solucao}</td>
            <td>${o.beneficio}</td>
          </tr>
        `)
      ].join('');

      // 3. Resíduos Sólidos PGRCC
      const residuosRows = [
        ['Classe A (Inertes / Alvenaria / Concreto)', dim.residuosPGRCC.classeA],
        ['Classe B (Recicláveis / Plásticos / Papel / Metais)', dim.residuosPGRCC.classeB],
        ['Classe C (Sem tecnologia de reciclagem)', dim.residuosPGRCC.classeC],
        ['Classe D (Perigosos / Tintas / Solventes / Óleos)', dim.residuosPGRCC.classeD]
      ].map(([classe, desc]) => `
        <tr>
          <td style="width: 32%; background-color: #F8FAFC; font-weight: 700; color: var(--p4-navy, #132A41);">${classe}</td>
          <td>${desc}</td>
        </tr>
      `).join('');

      // 4. Layout e Zoneamento do Canteiro
      const zonasRows = (res.zonasCanteiro || []).map(z => `
        <tr>
          <td class="td-center" style="font-weight: 700; color: ${z.cor || '#132A41'}; background-color: ${z.corBg || '#F8FAFC'}; font-size: 8pt; vertical-align: middle;">
            ${z.sigla}
          </td>
          <td>
            <strong style="color: var(--p4-navy, #132A41); font-size: 7.8pt;">${z.nome}</strong>
            <div style="font-size: 7pt; color: #64748B; margin-top: 1px; line-height: 1.35;">${z.descricao}</div>
          </td>
          <td class="td-center font-bold" style="font-size: 7.8pt; color: var(--p4-navy, #132A41); vertical-align: middle;">
            ~${z.dimensaoEstimadaM2} m²
          </td>
          <td style="font-size: 7.5pt; color: #334155; line-height: 1.35;">
            ${z.posicionamentoRecomendado}
          </td>
          <td style="font-size: 7.5pt; color: #334155; line-height: 1.35;">
            ${z.requisitosNR}
          </td>
        </tr>
      `).join('');

      // 5. Memorial Técnico convertido de Markdown para HTML estruturado
      const memorialHtml = this.converterMarkdownParaHtml(res.memorialDescritivo || '');

      const corpoHtml = `
        <!-- IDENTIFICAÇÃO DO PROJETO -->
        <div class="doc-card-info">
          <div class="doc-grid-4">
            <div class="doc-info-item">
              <span class="doc-info-label">Empreendimento</span>
              <span class="doc-info-value">${this.form().nomeProjeto || 'Obra de Edificação'}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Tipo de Obra</span>
              <span class="doc-info-value">${this.getNomeTipo(this.form().tipoObra)}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Porte Estimado</span>
              <span class="doc-info-value">${this.getNomePorte(this.form().porteObra)}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Efetivo de Pico</span>
              <span class="doc-info-value">${this.getTextoTrabalhadores(this.form().trabalhadoresPico)}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Perfil de Análise</span>
              <span class="doc-info-value">${this.getNomePerfil(this.form().perfilAnalise)}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Data de Emissão</span>
              <span class="doc-info-value">${dataHoje}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Norma Regulamentadora</span>
              <span class="doc-info-value">NR-18 / NBR 12.284</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Enquadramento PGRCC</span>
              <span class="doc-info-value">Resolução CONAMA 307</span>
            </div>
          </div>
        </div>

        <!-- 1. DIMENSIONAMENTO REGULAMENTAR DE ÁREAS DE VIVÊNCIA (NR-18) -->
        <div class="doc-section">
          <div class="doc-section-title">1. Dimensionamento Regulamentar de Instalações e Vivência (NR-18)</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 28%;">Instalação Provisória</th>
                <th style="width: 22%;">Parâmetro NR-18</th>
                <th class="th-center" style="width: 14%;">Quantitativo</th>
                <th style="width: 36%;">Exigência Construtiva & Conforto</th>
              </tr>
            </thead>
            <tbody>
              ${tabelaVivenciaHtml}
            </tbody>
          </table>
        </div>

        <!-- 2. MATRIZ DE OTIMIZAÇÕES LOGÍSTICAS E SEGURANÇA DO TRABALHO -->
        <div class="doc-section">
          <div class="doc-section-title">2. Matriz de Otimizações Logísticas e Segurança do Trabalho</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th class="th-copper" style="width: 13%;">Dimensão</th>
                <th class="th-copper" style="width: 28%;">Desafio Identificado</th>
                <th class="th-copper" style="width: 31%;">Solução Técnica Proposta</th>
                <th class="th-copper" style="width: 28%;">Benefício Construtivo</th>
              </tr>
            </thead>
            <tbody>
              ${otimizacoesRows}
            </tbody>
          </table>
        </div>

        <!-- 3. GESTÃO E SEGREGAÇÃO DE RESÍDUOS SÓLIDOS (PGRCC / CONAMA 307) -->
        <div class="doc-section">
          <div class="doc-section-title">3. Gestão e Segregação de Resíduos da Construção Civil (PGRCC)</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 32%;">Classificação do Resíduo (CONAMA 307)</th>
                <th>Diretriz de Acondicionamento, Transporte e Destinação Final</th>
              </tr>
            </thead>
            <tbody>
              ${residuosRows}
            </tbody>
          </table>
        </div>

        <!-- 4. LAYOUT & ZONEAMENTO DO CANTEIRO DE OBRAS -->
        <div class="doc-section">
          <div class="doc-section-title">4. Layout & Zoneamento do Canteiro de Obras (Zonas Funcionais)</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 8%;" class="th-center">Zona</th>
                <th style="width: 24%;">Zona Funcional & Descrição</th>
                <th class="th-center" style="width: 12%;">Área Est.</th>
                <th style="width: 28%;">Posicionamento Recomendado</th>
                <th style="width: 28%;">Requisito Normativo (NR)</th>
              </tr>
            </thead>
            <tbody>
              ${zonasRows}
            </tbody>
          </table>
        </div>

        <!-- 5. MEMORIAL DESCRITIVO TÉCNICO DE IMPLANTAÇÃO -->
        <div class="doc-section">
          <div class="doc-section-title">5. Memorial Descritivo Técnico de Implantação</div>
          <div style="background-color: #F8FAFC; border: 1px solid var(--p4-rule, #CBD5E1); border-radius: 6px; padding: 12px 14px; margin-bottom: 8px;">
            ${memorialHtml}
          </div>
        </div>

        <!-- NOTA LEGAL METODOLÓGICA -->
        <div class="doc-legal-note">
          <strong>Nota de Responsabilidade Técnica:</strong> O presente Plano de Implantação de Canteiro de Obras fundamenta-se nas exigências técnicas da Norma Regulamentadora nº 18 (Condições de Segurança e Saúde no Trabalho na Indústria da Construção), Portaria MTP nº 4.219/2022, NBR 12.284 e Resolução CONAMA 307. O dimensionamento final deve ser validado pelo Responsável Técnico em campo e constar no Programa de Gerenciamento de Riscos (PGR) da obra.
        </div>
      `;

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: 'Plano de Implantação de Canteiro de Obras (NR-18)',
          subtituloDocumento: 'Dimensionamento de Vivência • Logística Lean • PGRCC',
          nomeAgente: 'Gerador de Plano de Canteiro de Obras'
        },
        corpoHtml
      );
    } catch (err) {
      console.error('Erro ao gerar PDF de Canteiro de Obras:', err);
      this.motorPdfService.exibirToast('Ocorreu um erro ao emitir o relatório em PDF. Verifique seus dados e tente novamente.', 'erro');
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  // Parser robusto de Markdown para HTML estruturado para o design system do PDF
  converterMarkdownParaHtml(markdown: string): string {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    const result: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Linha vazia
      if (!trimmed) {
        i++;
        continue;
      }

      // 2. Linha horizontal '---' ou '***'
      if (/^---+\s*$/.test(trimmed) || /^\*\*\*+\s*$/.test(trimmed)) {
        result.push('<hr style="border: none; border-top: 1px solid var(--p4-rule, #CBD5E1); margin: 12px 0;" />');
        i++;
        continue;
      }

      // 3. Tabela Markdown (| col 1 | col 2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .slice(1, -1)
            .split('|')
            .map(c => this.formatarTextoInline(c.trim()));

          // Se a segunda linha for o separador (| :--- | :--- |)
          const startIndex = /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(tableLines[1]) ? 2 : 1;

          const thead = `<thead><tr>${headerCells.map(h => `<th style="padding: 5px 8px; font-size: 7.5pt; font-weight: 700; text-align: left;">${h}</th>`).join('')}</tr></thead>`;

          const bodyRows: string[] = [];
          for (let r = startIndex; r < tableLines.length; r++) {
            const cells = tableLines[r]
              .slice(1, -1)
              .split('|')
              .map(c => this.formatarTextoInline(c.trim()));
            bodyRows.push(`<tr>${cells.map(c => `<td style="padding: 5px 8px; font-size: 7.5pt; vertical-align: top;">${c}</td>`).join('')}</tr>`);
          }

          const tbody = `<tbody>${bodyRows.join('')}</tbody>`;
          result.push(`<table class="doc-table" style="margin: 8px 0; width: 100%; border-collapse: collapse;">${thead}${tbody}</table>`);
          continue;
        }
      }

      // 4. Cabeçalho H2 (## Titulo)
      if (trimmed.startsWith('## ')) {
        const title = this.formatarTextoInline(trimmed.substring(3).trim());
        result.push(`<div class="doc-section-title" style="margin-top: 14px; margin-bottom: 6px; font-size: 8.5pt; letter-spacing: 0.2px;">${title}</div>`);
        i++;
        continue;
      }

      // 5. Cabeçalho H3 (### Titulo)
      if (trimmed.startsWith('### ')) {
        const title = this.formatarTextoInline(trimmed.substring(4).trim());
        result.push(`<h4 style="font-family: 'Poppins', sans-serif; font-size: 8pt; font-weight: 700; color: var(--p4-navy, #132A41); margin: 10px 0 4px 0;">${title}</h4>`);
        i++;
        continue;
      }

      // 6. Cabeçalho H4 (#### Titulo)
      if (trimmed.startsWith('#### ')) {
        const title = this.formatarTextoInline(trimmed.substring(5).trim());
        result.push(`<h5 style="font-size: 7.8pt; font-weight: 700; color: var(--p4-copper, #B5642A); margin: 6px 0 2px 0;">${title}</h5>`);
        i++;
        continue;
      }

      // 7. Lista numerada (1. item, 2. item)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
          items.push(this.formatarTextoInline(itemText));
          i++;
        }
        result.push(`<ol style="margin: 4px 0 8px 18px; padding-left: 0; font-size: 7.8pt; line-height: 1.5; color: #1E293B;">${items.map(it => `<li style="margin-bottom: 3px;">${it}</li>`).join('')}</ol>`);
        continue;
      }

      // 8. Lista com marcadores (- item ou * item)
      if (/^[-*]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
          items.push(this.formatarTextoInline(itemText));
          i++;
        }
        result.push(`<ul style="margin: 4px 0 8px 18px; padding-left: 0; font-size: 7.8pt; line-height: 1.5; color: #1E293B;">${items.map(it => `<li style="margin-bottom: 3px;">${it}</li>`).join('')}</ul>`);
        continue;
      }

      // 9. Parágrafo simples
      const formatted = this.formatarTextoInline(trimmed);
      result.push(`<p style="margin: 0 0 6px 0; line-height: 1.5; font-size: 7.8pt; color: #1E293B; text-align: justify;">${formatted}</p>`);
      i++;
    }

    return result.join('\n');
  }

  formatarTextoInline(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background-color: #F1F5F9; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 7.5pt;">$1</code>');
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

  // =========================================================================
  // GESTÃO DE PROJETOS SALVOS (Canteiro)
  // =========================================================================

  exibirToast(texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    this.toastMensagem.set({ texto, tipo });
    setTimeout(() => {
      this.toastMensagem.set(null);
    }, 3500);
  }

  obterNomeProjetoSugerido(): string {
    return this.form().nomeProjeto?.trim() || 'Plano de Canteiro de Obras';
  }

  serializarDadosFormulario(): any {
    return {
      form: this.form(),
      resultadoPlano: this.resultadoPlano(),
      etapaAtual: this.etapaAtual(),
      tabAtiva: this.tabAtiva()
    };
  }

  deserializarDadosFormulario(dados: any): void {
    if (!dados) return;
    if (dados.form) {
      this.form.set(dados.form);
    } else {
      this.form.set(dados);
    }
    if (dados.resultadoPlano !== undefined) {
      this.resultadoPlano.set(dados.resultadoPlano);
    }
    if (dados.etapaAtual !== undefined) {
      this.etapaAtual.set(dados.etapaAtual);
    }
    if (dados.tabAtiva !== undefined) {
      this.tabAtiva.set(dados.tabAtiva);
    }
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
      this.exibirToast('Digite um nome para identificar o projeto.', 'erro');
      return;
    }

    this.salvandoProjeto.set(true);
    try {
      // Sincroniza o nome do form caso esteja genérico
      this.atualizarCampo('nomeProjeto', nome);

      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.salvarProjeto('canteiro', nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao salvar: ${res.error.message}`, 'erro');
      } else {
        this.projetoAtualId.set(res.id || null);
        this.projetoAtualNome.set(nome);
        this.modalSalvarAberto.set(false);
        this.exibirToast(`Projeto "${nome}" salvo com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao salvar projeto: ${err?.message || err}`, 'erro');
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
        this.exibirToast(`Projeto "${nome}" atualizado com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao atualizar: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async abrirModalMeusProjetos(): Promise<void> {
    this.modalProjetosAberto.set(true);
    this.carregandoProjetos.set(true);
    try {
      const lista = await this.supabaseService.listarMeusProjetos('canteiro');
      this.listaProjetosSalvos.set(lista);
    } catch (err) {
      console.error('Erro ao listar projetos de canteiro:', err);
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
      this.exibirToast(`Projeto "${proj.nome_projeto}" carregado com sucesso!`, 'sucesso');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      this.exibirToast(`Erro ao carregar projeto: ${err?.message || err}`, 'erro');
    }
  }

  async confirmarExcluirProjeto(proj: any, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Deseja realmente excluir o projeto "${proj.nome_projeto}"? Esta ação não pode ser desfeita.`)) {
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
        this.exibirToast(`Projeto "${proj.nome_projeto}" excluído.`, 'info');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao excluir projeto: ${err?.message || err}`, 'erro');
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
