import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';
import { SupabaseService } from '../../services/supabase.service';

export interface AgenteIA {
  id: string;
  nome: string;
  subtitulo: string;
  icone: string;
  descricaoLiteral: string;
}

export interface EbookItem {
  volume: string;
  titulo: string;
  subtitulo: string;
  capaUrl: string;
}

export interface MesCalendario {
  mesAno: string;
  nomeCurso: string;
  dataOuStatus: string;
  confirmado: boolean;
  local?: string;
}

@Component({
  selector: 'app-amorim-academy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full bg-slate-50 min-h-screen">
      
      <!-- ========================================================================= -->
      <!-- SEÇÃO 1: HERO                                                             -->
      <!-- ========================================================================= -->
      <section class="relative overflow-hidden bg-slate-950 text-white pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-800">
        <!-- Glow duplo sutil de fundo: Cyan & Laranja -->
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <!-- Eyebrow -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Diagnóstico Técnico, Automação & Comunidade Profissional</span>
          </div>

          <!-- Título Principal -->
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            O ecossistema que transforma diagnóstico técnico em <span class="bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">contratos de alto valor</span>.
          </h1>

          <!-- Subtítulo -->
          <p class="text-slate-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Laudos automatizados com IA, copiloto pericial (NBR 16747), esteira de crédito bancário e networking direto. Um só login. Tudo modular. Pagamento via Pix parcelado sem travar seu limite.
          </p>

          <!-- 2 CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#ecossistema"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer min-h-[44px]"
            >
              <span>Explorar o Ecossistema</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>

            <a
              [href]="linkWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer min-h-[44px]"
            >
              <svg class="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Falar com um Consultor</span>
            </a>
          </div>

          <!-- Faixa de 3 Métricas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-4xl mx-auto">
            <div class="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-center">
              <span class="text-xs font-semibold text-cyan-400 block uppercase tracking-wider">1 Único Login</span>
              <span class="text-sm font-bold text-slate-200">SaaS + Comunidade + IA</span>
            </div>

            <div class="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-center">
              <span class="text-xs font-semibold text-emerald-400 block uppercase tracking-wider">235% ROI</span>
              <span class="text-sm font-bold text-slate-200">Retorno médio comprovado</span>
            </div>

            <div class="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-center">
              <span class="text-xs font-semibold text-amber-400 block uppercase tracking-wider">Pix Parcelado</span>
              <span class="text-sm font-bold text-slate-200">Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Container do Conteúdo Principal -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20 sm:space-y-24">

        <!-- ========================================================================= -->
        <!-- SEÇÃO 2: VITRINE DO ECOSSISTEMA                                           -->
        <!-- ========================================================================= -->
        <section id="ecossistema" class="space-y-12">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <span>Arquitetura Integrada</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Três pilares que trabalham juntos pela sua carreira
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Cada solução resolve um desafio operacional real — da vistoria em campo à captação bancária e networking técnico.
            </p>
          </div>

          <!-- 3 Cards em uma linha (desktop) / empilhados (mobile) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            
            <!-- Pilar 1: Predial 4.0 -->
            <div class="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full space-y-6">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-xl">
                  🏗️
                </div>
                <div>
                  <span class="text-xs uppercase tracking-wider font-bold text-amber-700 block">Copiloto Técnico SaaS</span>
                  <h3 class="text-xl font-bold text-slate-900 mt-1">Predial 4.0</h3>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Automatize vistorias e laudos periciais de ponta a ponta. Inspeção Predial (NBR 16747) com classificação de criticidade em três níveis (P1, P2, P3), além de Vistoria Cautelar de Vizinhança (NBR 13752:2024, item 7.3.3.2) para blindagem jurídica pré-obra.
                </p>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <a
                  href="https://app-predial.emanoelamorim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
                >
                  <span>Acessar o Predial 4.0</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Pilar 2: Comunidade Business 4.0 -->
            <div class="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full space-y-6">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-xl">
                  👥
                </div>
                <div>
                  <span class="text-xs uppercase tracking-wider font-bold text-indigo-700 block">Comunidade & Cursos</span>
                  <h3 class="text-xl font-bold text-slate-900 mt-1">Comunidade Business 4.0</h3>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Mural de vagas em todo o Brasil, fórum técnico moderado, acervo completo de planilhas e modelos de laudo editáveis, Netflix de Cursos com emissão de certificados oficiais para alavancar sua autoridade no mercado.
                </p>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <a
                  routerLink="/comunidade"
                  class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all min-h-[44px]"
                >
                  <span>Entrar na Comunidade</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Pilar 3: Viabiliza IA (Accordion expansível) -->
            <div class="bg-white rounded-3xl p-7 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full space-y-6 bg-gradient-to-b from-white to-amber-50/20">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-black text-xl">
                  🏦
                </div>
                <div>
                  <span class="text-xs uppercase tracking-wider font-bold text-amber-700 block">Assessoria de Crédito Imobiliário</span>
                  <h3 class="text-xl font-bold text-slate-900 mt-1">Viabiliza IA</h3>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">
                  A máquina de viabilizar crédito para o seu cliente: um fluxo estruturado em 7 etapas que leva o projeto do zero até uma pasta de crédito completa, pronta para o banco liberar a carta de crédito.
                </p>

                <!-- Botão para alternar Accordion das 7 etapas -->
                <button
                  type="button"
                  (click)="toggleViabilizaEtapas()"
                  class="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Ver as 7 etapas do fluxo</span>
                  <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="viabilizaAberto()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Conteúdo do Accordion: 7 Etapas Reais -->
                @if (viabilizaAberto()) {
                  <div class="space-y-2 pt-2 border-t border-amber-100 text-xs text-slate-700">
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>1. Montar Projeto:</strong> definição dos ambientes da edificação (dispensável se for só aquisição de terreno).
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>2. Quanto Custa:</strong> dimensionamento de custo com base em CUB real e taxas de juros vigentes.
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>3. Documentação:</strong> organização dos documentos exigidos para a análise bancária.
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>4. Comparação Bancária:</strong> análise de linhas de crédito elegíveis, lado a lado.
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>5. Simulação Avançada:</strong> refinamento do cenário financeiro.
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>6. Construir vs. Alugar:</strong> comparação de custo real entre as duas opções (em operações com construção).
                    </div>
                    <div class="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>7. Agendamento & Pasta:</strong> fechamento e organização final da pasta de crédito.
                    </div>
                  </div>
                }
              </div>

              <div class="pt-4 border-t border-slate-100">
                <a
                  [href]="linkWhatsappViabiliza"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all min-h-[44px]"
                >
                  <span>Consultar Viabiliza IA</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <!-- Bloco Separado: Coleção Amorim Tech Insights (5 eBooks) -->
          <div class="bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 text-white space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span class="text-xs uppercase tracking-wider font-bold text-amber-400 block">Acervo Editorial</span>
                <h3 class="text-2xl sm:text-3xl font-black text-white mt-1">Coleção Amorim Tech Insights</h3>
                <p class="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                  5 volumes completos liberados na Comunidade para consulta técnica e download em PDF.
                </p>
              </div>

              <a
                routerLink="/comunidade"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 min-h-[44px]"
              >
                <span>Acessar Acervo de eBooks</span>
                <span>→</span>
              </a>
            </div>

            <!-- Grade com os 5 eBooks -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
              @for (ebook of ebooks; track ebook.volume) {
                <div class="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 hover:border-amber-500/50 transition-colors flex flex-col justify-between space-y-3 group">
                  <div class="space-y-2">
                    <div class="relative h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex items-center justify-center">
                      <img
                        [src]="ebook.capaUrl"
                        [alt]="ebook.titulo"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        (error)="$any($event.target).src = 'https://i.ibb.co/bRFBr6cF/Biblia-ebook.png'"
                      />
                      <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-black text-amber-300 border border-white/10">
                        {{ ebook.volume }}
                      </span>
                    </div>

                    <h4 class="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {{ ebook.titulo }}
                    </h4>
                    <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {{ ebook.subtitulo }}
                    </p>
                  </div>

                  <a
                    routerLink="/comunidade"
                    class="text-[11px] font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-1"
                  >
                    <span>Ler na Comunidade</span>
                    <span>→</span>
                  </a>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 3: HUB DE 10 AGENTES (MODAL COM TEXTO LITERAL DO BLOG)             -->
        <!-- ========================================================================= -->
        <section class="space-y-12">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider">
              <span>Inteligência Artificial Aplicada</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hub de Agentes — 10 Ferramentas de IA Especializadas
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Ferramentas técnicas projetadas para automatizar tarefas que hoje ainda são feitas na mão ou em planilhas avulsas. Clique no card para ver o fluxo completo.
            </p>
          </div>

          <!-- Grid de 10 cards clicáveis -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            @for (agente of agentes; track agente.id) {
              <button
                type="button"
                (click)="abrirModalAgente(agente)"
                class="bg-white rounded-2xl p-5 border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4 group cursor-pointer min-h-[140px]"
              >
                <div class="space-y-2">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-cyan-50 text-slate-800 group-hover:text-cyan-700 flex items-center justify-center text-xl transition-colors">
                    {{ agente.icone }}
                  </div>
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug">
                    {{ agente.nome }}
                  </h3>
                </div>

                <div class="flex items-center justify-between text-[11px] font-semibold text-cyan-600 group-hover:text-cyan-700">
                  <span>Ver detalhes</span>
                  <span>↗</span>
                </div>
              </button>
            }
          </div>

          <!-- Modal com a Descrição Completa e Literal do Agente -->
          @if (agenteSelecionado()) {
            <div
              class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
              (click)="fecharModalAgente()"
            >
              <div
                class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative"
                (click)="$event.stopPropagation()"
              >
                <!-- Cabeçalho do Modal -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 flex items-center justify-center text-2xl">
                      {{ agenteSelecionado()?.icone }}
                    </div>
                    <div>
                      <span class="text-[10px] uppercase font-bold tracking-wider text-cyan-600 block">Agente de IA</span>
                      <h3 class="text-lg sm:text-xl font-black text-slate-900">{{ agenteSelecionado()?.nome }}</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="fecharModalAgente()"
                    class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Fechar modal"
                  >
                    ✕
                  </button>
                </div>

                <!-- Descrição Literal Extraída do Post do Blog -->
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto">
                  <p class="font-normal text-slate-800 text-justify">
                    {{ agenteSelecionado()?.descricaoLiteral }}
                  </p>
                </div>

                <!-- Ações do Modal -->
                <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    (click)="fecharModalAgente()"
                    class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                  >
                    Fechar
                  </button>

                  <a
                    routerLink="/comunidade"
                    class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer min-h-[44px]"
                  >
                    <span>Acessar na Comunidade</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          }
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 4: BLOCO DE CONFIANÇA                                               -->
        <!-- ========================================================================= -->
        <section class="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-md">
          <div class="max-w-3xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
            <span class="text-xs uppercase tracking-wider font-bold text-amber-400 block">Flexibilidade Real</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Um só login. Um ecossistema feito para caber no seu bolso.
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-xs text-center space-y-2">
              <div class="text-2xl mb-1">🧩</div>
              <h3 class="text-base font-bold text-white">Customizável</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Monte o seu acesso do jeito que fizer sentido para o seu momento profissional.
              </p>
            </div>

            <div class="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-xs text-center space-y-2">
              <div class="text-2xl mb-1">💳</div>
              <h3 class="text-base font-bold text-white">Pix parcelado sem cartão</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Parcelamento inteligente direto sem travar o limite do seu cartão de crédito.
              </p>
            </div>

            <div class="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-xs text-center space-y-2">
              <div class="text-2xl mb-1">🔓</div>
              <h3 class="text-base font-bold text-white">Cancele quando quiser</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Sem travas contratuais abusivas: pare de pagar as parcelas seguintes a qualquer momento.
              </p>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 5: AGENDA DE CURSOS & CALENDÁRIO COMPLETO                           -->
        <!-- ========================================================================= -->
        <section class="space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Programação Contínua</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Uma agenda de cursos que nunca para
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Formações presenciais imersivas e capacitações online ao vivo em Engenharia Diagnóstica e Tecnologias Construtivas.
            </p>
          </div>

          <!-- Subseção: Próximos Cursos em Destaque (Carrossel / Grid) -->
          <div class="space-y-4">
            <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Próximos Cursos em Destaque</span>
            </h3>

            @if (carregandoAgenda()) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-64"></div>
                <div class="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-64 hidden md:block"></div>
              </div>
            } @else {
              <!-- Grade de Destaques: Curso Predial 4.0 confirmado + cursos cadastrados no Supabase -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <!-- Card Oficial Confirmado: Curso Predial 4.0 Recife -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div class="relative h-48 bg-slate-900 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?q=80&w=800&auto=format&fit=crop"
                        alt="Curso Predial 4.0"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                      <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                          Turma Confirmada
                        </span>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white border border-white/20">
                          30h
                        </span>
                      </div>
                      <div class="absolute bottom-3 left-3.5 right-3.5 text-white space-y-0.5">
                        <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <span>📅</span>
                          <span>27 a 29 de novembro de 2026</span>
                        </div>
                        <div class="text-[11px] text-slate-200 flex items-center gap-1.5">
                          <span>📍</span>
                          <span>Recife / PE (Presencial + Online)</span>
                        </div>
                      </div>
                    </div>

                    <div class="p-6 space-y-3">
                      <h4 class="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        Curso Predial 4.0 — Engenharia Diagnóstica na Prática
                      </h4>
                      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        Inspeção Predial com IA baseada na NBR 16747 e Vistoria Cautelar com NBR 13752:2024 (item 7.3.3.2). 20h presenciais em Recife com estudo de caso de campo + 10h online.
                      </p>
                    </div>
                  </div>

                  <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                      <span class="text-xs font-bold text-emerald-700">Inscrições Abertas</span>
                    </div>
                    <a
                      [href]="gerarLinkWhatsappCurso('Curso Predial 4.0 - Recife')"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px]"
                    >
                      <span>Garantir Vaga</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>

                <!-- Cursos Dinâmicos do Supabase (se houver) -->
                @for (curso of cursosAgenda(); track curso.id) {
                  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div class="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          [src]="curso.imagem_capa_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?q=80&w=800&auto=format&fit=crop'"
                          [alt]="curso.titulo"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?q=80&w=800&auto=format&fit=crop'"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                        <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                          <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 text-slate-900">
                            {{ formatarFormato(curso.formato) }}
                          </span>
                          @if (curso.carga_horaria) {
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white border border-white/20">
                              {{ curso.carga_horaria }}h
                            </span>
                          }
                        </div>
                        <div class="absolute bottom-3 left-3.5 right-3.5 text-white space-y-0.5">
                          <div class="text-xs font-bold text-amber-300">
                            {{ formatarPeriodo(curso.data_inicio, curso.data_fim) }}
                          </div>
                          @if (curso.local) {
                            <div class="text-[11px] text-slate-200 truncate">
                              📍 {{ curso.local }}
                            </div>
                          }
                        </div>
                      </div>

                      <div class="p-6 space-y-3">
                        <h4 class="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                          {{ curso.titulo }}
                        </h4>
                        @if (curso.descricao) {
                          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                            {{ curso.descricao }}
                          </p>
                        }
                      </div>
                    </div>

                    <div class="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Investimento</span>
                        <span class="text-xs font-bold text-slate-900">{{ formatarMoeda(curso.preco) }}</span>
                      </div>
                      <a
                        [href]="gerarLinkWhatsappCurso(curso.titulo)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px]"
                      >
                        <span>Garantir Vaga</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                }

              </div>
            }
          </div>

          <!-- Subseção: Accordion de Calendário Completo (15 Meses: Out/2026 a Dez/2027) -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <button
              type="button"
              (click)="toggleCalendarioCompleto()"
              class="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div class="space-y-1">
                <h3 class="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                  <span>📅</span>
                  <span>Ver calendário completo (out/2026 a dez/2027)</span>
                </h3>
                <p class="text-xs sm:text-sm text-slate-500">
                  Grade mensal completa com previsões de turmas presenciais e virtuais para os próximos 15 meses.
                </p>
              </div>

              <div class="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                <svg class="w-5 h-5 transition-transform duration-200" [class.rotate-180]="calendarioAberto()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            @if (calendarioAberto()) {
              <div class="pt-6 border-t border-slate-100 mt-6">
                <!-- Grid responsivo: desktop 5 colunas, tablet 3 colunas, mobile 2 colunas -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  @for (mes of gradeMensal; track mes.mesAno) {
                    <div
                      class="rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-2 text-left"
                      [class.bg-emerald-50]="mes.confirmado"
                      [class.border-emerald-300]="mes.confirmado"
                      [class.bg-slate-50]="!mes.confirmado"
                      [class.border-slate-200]="!mes.confirmado"
                    >
                      <div>
                        <span
                          class="text-[10px] font-black uppercase tracking-wider block"
                          [class.text-emerald-700]="mes.confirmado"
                          [class.text-slate-400]="!mes.confirmado"
                        >
                          {{ mes.mesAno }}
                        </span>
                        <h4
                          class="text-xs font-bold leading-tight mt-1"
                          [class.text-emerald-950]="mes.confirmado"
                          [class.text-slate-700]="!mes.confirmado"
                        >
                          {{ mes.nomeCurso }}
                        </h4>
                      </div>

                      <div class="pt-2 border-t border-slate-200/60">
                        @if (mes.confirmado) {
                          <span class="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                            <span>●</span>
                            <span>{{ mes.dataOuStatus }}</span>
                          </span>
                        } @else {
                          <span class="text-[10px] font-semibold text-slate-400">
                            {{ mes.dataOuStatus }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 6: RESULTADOS DA INCUBADORA (100% REAIS, NUNCA PLACEHOLDER)        -->
        <!-- ========================================================================= -->
        <section class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Resultados Comprovados</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Resultados Reais da Incubadora Profissional
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Números auditados de turmas anteriores e projetos reais executados com apoio direto da equipe técnica.
            </p>
          </div>

          <!-- Métricas Centrais -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200 text-center space-y-1">
              <span class="text-3xl sm:text-4xl font-black text-emerald-700">235%</span>
              <span class="text-xs font-bold text-emerald-900 uppercase tracking-wider block">ROI Médio</span>
            </div>

            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
              <span class="text-lg sm:text-xl font-black text-slate-900">R$ 67.166,40</span>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Investido</span>
            </div>

            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
              <span class="text-lg sm:text-xl font-black text-emerald-700">R$ 224.999,99</span>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Valor Gerado</span>
            </div>

            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-1">
              <span class="text-lg sm:text-xl font-black text-slate-900">4 / 1 / 2 / 1</span>
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Contratações / Inovação / Artigos / Relatório</span>
            </div>
          </div>

          <!-- 4 Casos Nominais Reais -->
          <div class="pt-4 space-y-4">
            <h3 class="text-base font-bold text-slate-900">Profissionais Incubados com Resultados Comprovados:</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span class="text-xs font-bold text-slate-900 block">Paulo Ewerton Ribeiro da Silva</span>
                <span class="text-[11px] text-slate-500 block">Engenharia Diagnóstica & Vistorias</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span class="text-xs font-bold text-slate-900 block">Hugo Ewerton Pereira Silva</span>
                <span class="text-[11px] text-slate-500 block">Laudos Periciais & Copiloto</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span class="text-xs font-bold text-slate-900 block">Adriana Gonçalves Araujo</span>
                <span class="text-[11px] text-slate-500 block">Consultoria & Inovação Técnica</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span class="text-xs font-bold text-slate-900 block">Vinícius de Assis Souto Maior Arruda</span>
                <span class="text-[11px] text-slate-500 block">Planejamento & Gestão de Obras</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 7: REDE E MENTORIA (PARCEIROS & ECOSSISTEMA)                        -->
        <!-- ========================================================================= -->
        <section class="space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              <span>Rede & Parcerias</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Parceiros & Ecossistema
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Estrutura institucional de apoio técnico, mentoria personalizada e integração contínua com mercado e softwares.
            </p>
          </div>

          <!-- Cards em Accordion -->
          <div class="space-y-4 max-w-4xl mx-auto">
            
            <!-- Accordion A: Incubadora Profissional -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('incubadora')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🚀</span>
                  <h3 class="text-base font-bold text-slate-900">Incubadora Profissional</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'incubadora' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'incubadora') {
                <div class="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-100 pt-3">
                  <p>
                    Programa de transição de carreira e consolidação técnica com suporte direto na elaboração dos primeiros laudos e perícias com corresponsabilidade profissional. Consulte a Seção de Resultados acima para ver números auditados com 235% de ROI médio comprovado.
                  </p>
                </div>
              }
            </div>

            <!-- Accordion B: Mentor Anjo -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('mentor')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🤝</span>
                  <h3 class="text-base font-bold text-slate-900">Mentor Anjo</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'mentor' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'mentor') {
                <div class="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-100 pt-3">
                  <p>
                    Acompanhamento técnico individualizado para profissionais que precisam de validação de diagnósticos complexos, direcionamento em pareceres periciais e suporte na tomada de decisão em campo antes da entrega ao cliente final.
                  </p>
                </div>
              }
            </div>

            <!-- Accordion C: Programa Profissional Embaixador -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('embaixador')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🌟</span>
                  <h3 class="text-base font-bold text-slate-900">Programa Profissional Embaixador</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'embaixador' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'embaixador') {
                <div class="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-100 pt-3">
                  <p>
                    Iniciativa de representação e expansão técnica voltada a conectar profissionais capacitados na metodologia Predial 4.0 a demandas e oportunidades regionais em todo o território nacional.
                  </p>
                </div>
              }
            </div>

            <!-- Accordion D: Convênios Institucionais -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('convenios')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🏛️</span>
                  <h3 class="text-base font-bold text-slate-900">Convênios Institucionais</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'convenios' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'convenios') {
                <div class="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-100 pt-3">
                  <p>
                    Articulação e acordos de cooperação técnica com conselhos de classe profissional, instituições de ensino superior (IES), escolas técnicas e entidades públicas para difusão contínua da Engenharia Diagnóstica 4.0.
                  </p>
                </div>
              }
            </div>

            <!-- Accordion E: Professores Parceiros (Dados dinâmicos do Supabase) -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('professores')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">👨‍🏫</span>
                  <h3 class="text-base font-bold text-slate-900">Professores Parceiros & Especialistas</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'professores' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'professores') {
                <div class="px-5 pb-5 space-y-4 border-t border-slate-100 pt-3">
                  @if (carregandoParceiros()) {
                    <div class="p-4 text-center text-xs text-slate-400 animate-pulse">Carregando corpo docente...</div>
                  } @else if (professores().length > 0) {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (prof of professores(); track prof.id) {
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                          @if (prof.foto_url) {
                            <img [src]="prof.foto_url" [alt]="prof.nome" class="w-12 h-12 rounded-xl object-cover" />
                          } @else {
                            <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                              {{ prof.nome.charAt(0) }}
                            </div>
                          }
                          <div class="min-w-0">
                            <h4 class="text-xs font-bold text-slate-900 truncate">{{ prof.nome }}</h4>
                            <p class="text-[11px] text-indigo-600 line-clamp-1">{{ prof.disciplina_area }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p class="text-xs text-slate-500 font-medium">Novos mentores e docentes em processo de homologação. Em breve.</p>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Accordion F: Softwares Parceiros (Dados dinâmicos do Supabase) -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('softwares')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">💻</span>
                  <h3 class="text-base font-bold text-slate-900">Softwares Homologados</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'softwares' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'softwares') {
                <div class="px-5 pb-5 space-y-4 border-t border-slate-100 pt-3">
                  @if (carregandoParceiros()) {
                    <div class="p-4 text-center text-xs text-slate-400 animate-pulse">Carregando softwares...</div>
                  } @else if (softwares().length > 0) {
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      @for (soft of softwares(); track soft.id) {
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <h4 class="text-xs font-bold text-slate-900">{{ soft.nome }}</h4>
                          @if (soft.descricao_curta) {
                            <p class="text-[11px] text-slate-500 line-clamp-2">{{ soft.descricao_curta }}</p>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p class="text-xs text-slate-500 font-medium">Softwares e integrações em processo de homologação técnica. Em breve.</p>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Accordion G: Empresas Parceiras (Dados dinâmicos do Supabase) -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                (click)="toggleAccordion('empresas')"
                class="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">🏢</span>
                  <h3 class="text-base font-bold text-slate-900">Empresas Parceiras & Apoiadoras</h3>
                </div>
                <span class="text-slate-400 font-bold text-sm">{{ accordionAberto() === 'empresas' ? '−' : '+' }}</span>
              </button>
              @if (accordionAberto() === 'empresas') {
                <div class="px-5 pb-5 space-y-4 border-t border-slate-100 pt-3">
                  @if (carregandoParceiros()) {
                    <div class="p-4 text-center text-xs text-slate-400 animate-pulse">Carregando empresas...</div>
                  } @else if (empresas().length > 0) {
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      @for (emp of empresas(); track emp.id) {
                        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                          <span class="text-xs font-bold text-slate-900 block truncate">{{ emp.nome }}</span>
                          @if (emp.tipo) {
                            <span class="text-[10px] text-emerald-700 font-semibold">{{ emp.tipo }}</span>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p class="text-xs text-slate-500 font-medium">Novas empresas parceiras em fase de cadastramento. Em breve.</p>
                    </div>
                  }
                </div>
              }
            </div>

          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 8: MODELO DO CERTIFICADO COM AUTENTICIDADE VERIFICÁVEL              -->
        <!-- ========================================================================= -->
        <section class="space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <span>Proficiência Oficial</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Certificado com autenticidade verificável
            </h2>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Cada formação concluída na plataforma gera um certificado oficial rastreável com código único de autenticidade alfanumérico.
            </p>
          </div>

          <!-- Mockup Visual Fiel ao certificado-pdf.service.ts -->
          <div class="max-w-4xl mx-auto bg-[#FEFCF8] rounded-2xl shadow-xl p-4 sm:p-8 relative overflow-hidden border border-slate-300">
            
            <!-- Moldura Dupla: Externa Navy #132A41 + Interna Copper #B5642A -->
            <div class="border-2 border-[#132A41] p-2 rounded-xl">
              <div class="border border-[#B5642A] p-4 sm:p-8 rounded-lg space-y-6 text-center relative bg-[#FEFCF8]">
                
                <!-- Cantos decorativos em L (Copper) -->
                <div class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#B5642A]"></div>
                <div class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#B5642A]"></div>
                <div class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#B5642A]"></div>
                <div class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#B5642A]"></div>

                <!-- Cabeçalho com as 3 logos em SVG do repositório -->
                <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pb-2 border-b border-slate-200/70 max-w-2xl mx-auto">
                  <img src="/logo-header.svg" alt="Emanoel Amorim" class="h-6 sm:h-8 object-contain" />
                  <div class="h-5 w-px bg-slate-300 hidden sm:block"></div>
                  <img src="/logo-tech.svg" alt="Amorim Tech" class="h-6 sm:h-8 object-contain" />
                  <div class="h-5 w-px bg-slate-300 hidden sm:block"></div>
                  <img src="/logo-academy.svg" alt="Amorim Academy" class="h-6 sm:h-8 object-contain" />
                </div>

                <div class="text-[10px] font-bold text-[#B5642A] uppercase tracking-widest">
                  AMORIM ACADEMY · ECOSSISTEMA DE FORMAÇÃO 4.0
                </div>

                <div class="space-y-1">
                  <h3 class="text-2xl sm:text-4xl font-serif font-black text-[#132A41]">
                    Certificado de Conclusão
                  </h3>
                  <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    PROFICIÊNCIA TÉCNICA CONTINUADA
                  </div>
                </div>

                <div class="space-y-3 max-w-xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>Certificamos, para os devidos fins de comprovação técnica e curricular, que</p>
                  
                  <div class="py-1">
                    <span class="text-xl sm:text-2xl font-serif font-black text-[#B5642A]">
                      Eng. Aluno Exemplo de Oliveira
                    </span>
                    <div class="h-0.5 w-48 bg-[#132A41] mx-auto mt-1"></div>
                  </div>

                  <p>
                    concluiu com êxito todas as etapas, módulos didáticos e avaliações do curso
                  </p>

                  <div class="text-base sm:text-lg font-black text-[#132A41]">
                    “Curso de Laudo de Inspeção Predial”
                  </div>

                  <p class="text-[11px] text-slate-500 leading-normal">
                    Conforme diretrizes da NBR 16747 (Inspeção Predial) e NBR 13752:2024 (item 7.3.3.2 para Vistoria Cautelar). Carga horária: 40 horas.
                  </p>
                </div>

                <!-- Rodapé Fiel: Código AMTECH-XXXXXXXX (sem QR Code nem hash) -->
                <div class="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left items-end">
                  <div class="space-y-1">
                    <span class="text-[9px] uppercase font-bold text-[#132A41] block">Dados de Emissão & Autenticidade</span>
                    <div class="text-[10px] text-slate-500">Local e Data: Recife – PE</div>
                    <div class="text-[11px] font-mono font-bold text-[#132A41]">
                      Código: <span class="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-sm">AMTECH-8K4P9X2M</span>
                    </div>
                  </div>

                  <div class="text-center sm:text-right space-y-1">
                    <div class="font-serif italic text-base text-[#132A41]">Emanoel Amorim</div>
                    <div class="h-px w-36 bg-[#132A41] ml-auto"></div>
                    <div class="text-[9px] font-bold text-slate-600 uppercase">Responsável Técnico · AmorimTech</div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Botão de Verificação Oficial -->
            <div class="text-center pt-6">
              <a
                href="https://emanoelamorim.com/verificar-certificado"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#132A41] hover:bg-[#1a3857] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer min-h-[44px]"
              >
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verificar um certificado</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 9: CTA FINAL                                                        -->
        <!-- ========================================================================= -->
        <section class="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white border border-slate-800 text-center space-y-6 shadow-xl">
          <div class="max-w-2xl mx-auto space-y-3">
            <span class="text-xs uppercase tracking-wider font-bold text-amber-400 block">Dê o Próximo Passo</span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Pronto para colocar o ecossistema para trabalhar por você?
            </h2>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              Junte-se aos engenheiros e arquitetos que utilizam a Amorim Academy, a Comunidade Business 4.0 e o Predial 4.0 para transformar diagnóstico técnico em autoridade e contratos reais.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://app-predial.emanoelamorim.com"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer min-h-[44px] inline-flex items-center gap-2"
            >
              <span>Acessar Predial 4.0</span>
              <span>↗</span>
            </a>

            <a
              routerLink="/comunidade"
              class="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] inline-flex items-center gap-2"
            >
              <span>Entrar na Comunidade</span>
              <span>→</span>
            </a>

            <a
              [href]="linkWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] inline-flex items-center gap-2"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  `
})
export class AmorimAcademyComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly supabaseService = inject(SupabaseService);

  // Links do WhatsApp
  readonly linkWhatsapp = 'https://wa.me/5581991298803?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20consultor%20da%20Amorim%20Academy.';
  readonly linkWhatsappViabiliza = 'https://wa.me/5581991298803?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Viabiliza%20IA%20e%20a%20esteira%20de%20cr%C3%A9dito%20imobili%C3%A1rio.';

  // Estados de Accordion e Modais
  readonly viabilizaAberto = signal(false);
  readonly calendarioAberto = signal(false);
  readonly agenteSelecionado = signal<AgenteIA | null>(null);
  readonly accordionAberto = signal<string | null>('incubadora');

  // Dados do Supabase
  readonly cursosAgenda = signal<any[]>([]);
  readonly carregandoAgenda = signal<boolean>(true);

  readonly professores = signal<any[]>([]);
  readonly softwares = signal<any[]>([]);
  readonly empresas = signal<any[]>([]);
  readonly carregandoParceiros = signal<boolean>(true);

  // 10 Agentes com descrição literal do post do blog
  readonly agentes: AgenteIA[] = [
    {
      id: 'reajuste',
      nome: 'Reajuste de Contrato',
      subtitulo: 'Correção FGV Coluna 35/39',
      icone: '📊',
      descricaoLiteral: 'Cálculo de correção contratual com base real no índice FGV Coluna 35/39, série histórica 2017–2026.'
    },
    {
      id: 'prompts',
      nome: 'Biblioteca de Prompts',
      subtitulo: '369 prompts especializados',
      icone: '📚',
      descricaoLiteral: 'Catálogo com 369 prompts especializados, organizados por categoria, prontos para copiar e usar na sua ferramenta de IA preferida.'
    },
    {
      id: 'skills-claude',
      nome: 'Skills Claude',
      subtitulo: 'Ecossistema Claude pronto',
      icone: '🤖',
      descricaoLiteral: 'Mais que um curso: você aprende o ecossistema Claude e já sai com skills prontas para baixar e usar direto no seu fluxo de trabalho, sem precisar montar nada do zero. E isso é só o começo — o agente está em evolução para ganhar seu próprio chat dentro da Comunidade: o aluno só vai precisar copiar o objetivo, encaminhar a documentação do caso e receber o material pronto, sem precisar sair da Comunidade para nenhuma outra IA.'
    },
    {
      id: 'licitacao',
      nome: 'Checklist de Licitação',
      subtitulo: 'Setor de licitações automatizado',
      icone: '📑',
      descricaoLiteral: 'Muito mais que um checklist: é o seu setor de licitações automatizado. Você sobe o PDF do edital, e a IA analisa o documento e extrai automaticamente o checklist completo de exigências — não só de habilitação, mas também da proposta de preço e da proposta técnica, quando o edital exigir. A partir da documentação já cadastrada do seu perfil profissional, o agente avalia se você está em conformidade e habilitado nas três frentes. E se estiver tudo certo, o diferencial: o sistema gera a documentação pronta para a licitação usando os seus próprios dados — folha de rosto, capa e declarações, tudo em papel timbrado com sua logo e seu registro CREA/CAU real, prontos para assinatura. O resultado sai unificado em PDF: proposta de habilitação, de preço e técnica, cada uma pronta, no mesmo pacote.'
    },
    {
      id: 'quantitativos',
      nome: 'Levantamento de Quantitativos',
      subtitulo: 'Calculadora automática',
      icone: '📐',
      descricaoLiteral: 'Sua calculadora automática de quantitativos. Lance os dados de campo e a ferramenta calcula o resto: informe as medidas e o sistema devolve o volume de material necessário, pronto. Cobre fundação, estrutura, arquitetônico, elétrica, hidráulica e muito mais — de sapata a paisagismo, tudo automatizado num resumo geral.'
    },
    {
      id: 'viabilidade-imobiliaria',
      nome: 'Custos & Viabilidade Imobiliária',
      subtitulo: 'Estudo com base na NBR 12.721',
      icone: '🏢',
      descricaoLiteral: 'O agente para quando o objetivo é avaliar se vale a pena implantar um empreendimento. Ele conduz o estudo de viabilidade com base na NBR 12.721, calculando quanto o empreendimento vai custar e verificando se o dimensionamento está de acordo com o que a norma exige — a base técnica e financeira para decidir se o projeto sai do papel ou não.'
    },
    {
      id: 'canteiro',
      nome: 'Plano de Canteiro de Obras (IA)',
      subtitulo: 'Layout e memorial com IA',
      icone: '🚧',
      descricaoLiteral: 'Geração assistida de layout e memorial de canteiro, com apoio de inteligência artificial.'
    },
    {
      id: 'biblia-edificacao',
      nome: 'Guia de Consulta — Bíblia da Edificação',
      subtitulo: '41 entradas em 13 categorias',
      icone: '📖',
      descricaoLiteral: 'Consulta técnica a tipologias prediais, hoje com 41 entradas cadastradas em 13 categorias.'
    },
    {
      id: 'pre-dimensionamento',
      nome: 'Calculadora de Pré-dimensionamento',
      subtitulo: '18 sistemas em 3 níveis',
      icone: '🧮',
      descricaoLiteral: 'Cobre 18 sistemas construtivos diferentes, em três níveis de profundidade: Nível 1 é fórmula direta, para uma resposta rápida; Nível 2 organiza o cálculo por tabela de escolha, quando existe mais de uma variável em jogo; Nível 3 entra em cálculo multi-variável, para quando o caso exige mais precisão.'
    },
    {
      id: 'evte',
      nome: 'EVTE — Estudo de Viabilidade Técnica e Econômica',
      subtitulo: 'Comparador de tipologias',
      icone: '⚖️',
      descricaoLiteral: 'O agente comparador de tipologias. Você informa as características do seu projeto, do terreno, do canteiro e suas restrições — orçamentárias, logísticas, de mão de obra — e ele compara essas condições com as tipologias construtivas disponíveis na base técnica para indicar, sistema por sistema, qual a mais viável técnica e financeiramente para o seu caso: fundação, estrutura, vedações, climatização. O resultado sai como ranking comparativo com pontos positivos e pontos de atenção de cada tipologia. Um detalhe importante por trava normativa: a ferramenta nunca aprova nem reprova uma tipologia — ela organiza a comparação para apoiar sua análise. A decisão final é sempre do profissional.'
    }
  ];

  // 5 eBooks da Coleção Amorim Tech Insights
  readonly ebooks: EbookItem[] = [
    {
      volume: 'Vol. 1',
      titulo: 'Líder 4.0: Liderança Aumentada',
      subtitulo: 'Liderança de equipes técnicas na era da Construção 4.0.',
      capaUrl: 'https://i.ibb.co/sGfYYDP/Lider-Ebook.png'
    },
    {
      volume: 'Vol. 2',
      titulo: 'A Bíblia da Edificação: Sistemas Prediais',
      subtitulo: 'Guia técnico completo dos sistemas prediais em 41 capítulos.',
      capaUrl: 'https://i.ibb.co/bRFBr6cF/Biblia-ebook.png'
    },
    {
      volume: 'Vol. 3',
      titulo: 'Novas Fontes de Receita: Laudos e Perícias',
      subtitulo: 'Como estruturar novas linhas de receita na engenharia diagnóstica.',
      capaUrl: 'https://i.ibb.co/TMH9DWpt/Novas-fontes-ebook.png'
    },
    {
      volume: 'Vol. 4',
      titulo: 'Design Thinking na Construção 4.0',
      subtitulo: 'Solução criativa de problemas complexos de projeto e obra.',
      capaUrl: 'https://i.ibb.co/bgqYg3tk/Solucoes-Ebook.png'
    },
    {
      volume: 'Vol. 5',
      titulo: 'Arquitetura da Negociação',
      subtitulo: 'Gestão de conflitos e negociação em projetos de alta complexidade.',
      capaUrl: 'https://i.ibb.co/C5s6VH9p/Negocia-o-Ebook.png'
    }
  ];

  // Grade mensal de 15 meses (Out/2026 a Dez/2027)
  // ÚNICO DADO CONFIRMADO: Nov/2026 Curso Predial 4.0 Recife
  readonly gradeMensal: MesCalendario[] = [
    { mesAno: 'Out / 2026', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Nov / 2026', nomeCurso: 'Curso Predial 4.0', dataOuStatus: '27 a 29 de nov · Recife', confirmado: true, local: 'Recife/PE' },
    { mesAno: 'Dez / 2026', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Jan / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Fev / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Mar / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Abr / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Mai / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Jun / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Jul / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Ago / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Set / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Out / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Nov / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false },
    { mesAno: 'Dez / 2027', nomeCurso: 'A definir', dataOuStatus: 'A definir', confirmado: false }
  ];

  async ngOnInit(): Promise<void> {
    this.seoService.atualizar({
      title: 'Amorim Academy | Formação, Mercado e Mentoria em Engenharia Diagnóstica',
      description: 'O ecossistema que transforma diagnóstico técnico em contratos de alto valor: Curso Predial 4.0, Comunidade Business 4.0, Viabiliza IA e Hub de Agentes.',
      canonicalPath: '/amorim-academy',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Amorim Academy — Formação e Mentoria em Engenharia Diagnóstica',
        description: 'Laudos automatizados com IA, copiloto pericial (NBR 16747), esteira de crédito bancário e networking direto.',
        url: 'https://emanoelamorim.com/amorim-academy',
        serviceType: 'Formação e Mentoria Profissional em Engenharia Diagnóstica',
        provider: {
          '@type': 'Organization',
          '@id': 'https://emanoelamorim.com/#organization',
          name: 'AmorimTech',
        },
      },
    });

    await Promise.all([
      this.carregarAgenda(),
      this.carregarParceiros()
    ]);
  }

  async carregarAgenda(): Promise<void> {
    this.carregandoAgenda.set(true);
    try {
      const dados = await this.supabaseService.listarCursosAgenda();
      this.cursosAgenda.set(dados || []);
    } catch (err) {
      console.warn('Erro ao carregar agenda de cursos:', err);
    } finally {
      this.carregandoAgenda.set(false);
    }
  }

  async carregarParceiros(): Promise<void> {
    this.carregandoParceiros.set(true);
    try {
      const [profs, softs, emps] = await Promise.all([
        this.supabaseService.listarProfessoresParceirosAtivos(),
        this.supabaseService.listarSoftwaresParceirosAtivos(),
        this.supabaseService.listarEmpresasParceirasAtivas()
      ]);
      this.professores.set(profs || []);
      this.softwares.set(softs || []);
      this.empresas.set(emps || []);
    } catch (err) {
      console.warn('Erro ao carregar parceiros da Academy:', err);
    } finally {
      this.carregandoParceiros.set(false);
    }
  }

  toggleViabilizaEtapas(): void {
    this.viabilizaAberto.update(v => !v);
  }

  toggleCalendarioCompleto(): void {
    this.calendarioAberto.update(v => !v);
  }

  toggleAccordion(secao: string): void {
    this.accordionAberto.update(atual => atual === secao ? null : secao);
  }

  abrirModalAgente(agente: AgenteIA): void {
    this.agenteSelecionado.set(agente);
  }

  fecharModalAgente(): void {
    this.agenteSelecionado.set(null);
  }

  formatarPeriodo(dataInicio?: string | null, dataFim?: string | null): string {
    if (!dataInicio) return 'Data a definir';
    try {
      const pIni = dataInicio.split('-');
      if (pIni.length === 3) {
        const dIni = new Date(+pIni[0], +pIni[1] - 1, +pIni[2]);
        if (!dataFim) {
          return dIni.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        const pFim = dataFim.split('-');
        if (pFim.length === 3) {
          const dFim = new Date(+pFim[0], +pFim[1] - 1, +pFim[2]);
          if (pIni[0] === pFim[0] && pIni[1] === pFim[1]) {
            return `${pIni[2]} a ${pFim[2]} de ${dFim.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
          }
          return `${dIni.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a ${dFim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        }
      }
      return dataInicio;
    } catch {
      return dataInicio;
    }
  }

  formatarFormato(formato?: string): string {
    if (!formato) return 'Presencial';
    const mapa: Record<string, string> = {
      'gravado': 'Online (Gravado)',
      'ao_vivo': 'Online ao Vivo',
      'presencial_hibrido': 'Presencial / Híbrido',
      'presencial': 'Presencial',
      'hibrido': 'Híbrido'
    };
    return mapa[formato.toLowerCase()] || formato;
  }

  formatarMoeda(valor?: number | null): string {
    if (!valor || valor <= 0) return 'Sob consulta';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  gerarLinkWhatsappCurso(tituloCurso: string): string {
    const texto = encodeURIComponent(`Olá! Vim pela Amorim Academy e gostaria de garantir minha vaga no curso "${tituloCurso}".`);
    return `https://wa.me/5581991298803?text=${texto}`;
  }
}
