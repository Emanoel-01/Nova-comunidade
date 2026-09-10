import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-amorim-tech',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full bg-slate-50 py-6 sm:py-10 lg:py-16 px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 lg:space-y-16">
      <div class="max-w-7xl mx-auto space-y-10 sm:space-y-14 lg:space-y-16">
        <!-- Seção 1: Hero Unificado -->
        <section class="relative rounded-3xl overflow-hidden" style="background: linear-gradient(160deg, #041B2D 0%, #0B2E47 55%, #0E3D52 100%);">
          <div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px); background-size: 22px 22px;"></div>
          <div class="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%);"></div>
          <div class="absolute -bottom-40 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%);"></div>

          <div class="relative z-10 px-5 sm:px-10 lg:px-14 py-8 sm:py-16 lg:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 sm:gap-10 items-center">
            <div class="space-y-4 sm:space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-cyan-300 text-[10px] min-[360px]:text-[11px] sm:text-xs font-semibold max-w-full">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                <span class="truncate sm:overflow-visible">Ecossistema digital · engenharia diagnóstica</span>
              </div>

              <h1 class="text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                Predial 4.0
              </h1>

              <p class="text-slate-300 text-[13px] min-[360px]:text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl text-left">
                O copiloto técnico para engenheiros e arquitetos que fazem vistorias e emitem laudos. Da vistoria em campo à obra concluída, com inteligência artificial em cada etapa — laudos mais rápidos e padronizados, sem perder rigor técnico.
              </p>

              <div class="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2">
                <a
                  href="https://app-predial.emanoelamorim.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px]"
                >
                  <span>Acessar o Predial 4.0</span>
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
                <a
                  [href]="linkWhatsappTech"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px]"
                >
                  Falar com a gente
                </a>
              </div>
            </div>

            <div class="relative hidden sm:block">
              <div class="bg-[#0A1E2E]/80 backdrop-blur border border-white/10 rounded-2xl p-5 space-y-3 shadow-2xl">
                <div class="flex items-center justify-between text-xs text-slate-400">
                  <span>ficha_tecnica.laudo</span>
                  <span class="flex items-center gap-1.5 text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>sincronizado</span>
                </div>
                <div class="h-px bg-white/10"></div>
                <div class="space-y-2.5">
                  <div class="flex items-center gap-2.5 text-sm text-slate-200"><span class="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>Checklist por sistema construtivo</div>
                  <div class="flex items-center gap-2.5 text-sm text-slate-200"><span class="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>Diagnóstico assistido por IA</div>
                  <div class="flex items-center gap-2.5 text-sm text-slate-200"><span class="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">✓</span>Classificação P1 / P2 / P3</div>
                  <div class="flex items-center gap-2.5 text-sm text-white font-semibold"><span class="w-5 h-5 rounded-md bg-emerald-500/25 text-emerald-300 flex items-center justify-center text-xs">↓</span>Laudo PDF gerado — ART/RRT pronto</div>
                </div>
              </div>
              <div class="absolute -bottom-4 -left-4 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-cyan-300 shadow-xl">
                offline-first
              </div>
            </div>
          </div>

          <div class="relative z-10 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10 bg-black/20">
            <div class="px-2 sm:px-4 py-4 sm:py-5 lg:py-6 text-center flex flex-col justify-center">
              <p class="text-sm min-[360px]:text-base min-[400px]:text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">3 módulos</p>
              <p class="text-[10px] min-[360px]:text-[11px] sm:text-xs text-slate-400 mt-1 leading-tight sm:leading-normal">um só ecossistema</p>
            </div>
            <div class="px-2 sm:px-4 py-4 sm:py-5 lg:py-6 text-center flex flex-col justify-center">
              <p class="text-sm min-[360px]:text-base min-[400px]:text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">100% IA</p>
              <p class="text-[10px] min-[360px]:text-[11px] sm:text-xs text-slate-400 mt-1 leading-tight sm:leading-normal">diagnóstico assistido</p>
            </div>
            <div class="px-2 sm:px-4 py-4 sm:py-5 lg:py-6 text-center flex flex-col justify-center">
              <p class="text-sm min-[360px]:text-base min-[400px]:text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">beta ativa</p>
              <p class="text-[10px] min-[360px]:text-[11px] sm:text-xs text-slate-400 mt-1 leading-tight sm:leading-normal">em evolução contínua</p>
            </div>
          </div>
        </section>

        <!-- Seção 1.5: Reengenharia de Processos — Posicionamento B2B/B2G -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-cyan-300 text-[11px] sm:text-xs font-bold tracking-wide shadow-sm max-w-full">
              <span>Software House & Engenharia de Inovação</span>
            </div>
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Não vendemos só um aplicativo. Reengenheiramos o seu processo.
            </h2>
            <p class="text-slate-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
              O Predial 4.0 que você vê abaixo é a prova tangível da nossa competência técnica — mas o que a AmorimTech entrega para construtoras, empresas de manutenção e órgãos públicos vai além do software: automação de processos, do campo à emissão de laudos, sob medida para a sua operação.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div class="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">Automação campo → laudo</h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                Reduza até 70% do tempo de emissão documental, com conformidade à NBR 16747 e à Lei de Licitações (14.133/21) desde a coleta em campo.
              </p>
            </div>

            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">Ambientes sob medida</h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                Plataformas compatíveis com LGPD, parametrizadas para a realidade da sua construtora, empresa de manutenção ou órgão público — não um software genérico de prateleira.
              </p>
            </div>

            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">Capacitação da equipe incluída</h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                Acesso incluso aos cursos de nivelamento do acervo para os técnicos licenciados da equipe, além do Fórum Técnico e da agenda de Eventos para todo o time. Habilitações operacionais mediante a respectiva Certificação Técnica individual.
              </p>
            </div>
          </div>

          <div class="max-w-4xl mx-auto pt-2">
            <div class="bg-slate-900 rounded-3xl p-6 sm:p-10 text-center shadow-lg space-y-4">
              <h3 class="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Sua construtora, empresa ou órgão público precisa de uma esteira sob medida?
              </h3>
              <p class="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
                Fale com nosso time comercial e entenda como reduzir passivos técnicos e agilizar sua operação.
              </p>
              <a
                [href]="linkWhatsappTech"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px]"
              >
                Falar com Consultor B2B/B2G
              </a>
            </div>
          </div>
        </section>

        <!-- Seção 2: Três Módulos -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10">
          <div class="text-center max-w-2xl mx-auto">
            <p class="text-cyan-700 text-xs font-bold uppercase tracking-wide mb-2">Feito para o profissional técnico</p>
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Três módulos, um só fluxo
            </h2>
            <p class="text-slate-600 text-xs sm:text-base mt-2">A ferramenta de trabalho do engenheiro e do arquiteto — do diagnóstico técnico à obra concluída.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            <!-- Card 1: Inspeção Predial -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-indigo-600"></div>
              <div class="p-5 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div class="space-y-3 sm:space-y-4">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 class="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Inspeção Predial
                  </h3>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                    Laudo técnico completo de inspeção predial, conforme a NBR 16747. Diagnóstico assistido por IA, classificação de criticidade (P1/P2/P3) e emissão do documento com numeração sequencial.
                  </p>
                </div>

                <ul class="space-y-2.5 pt-4 border-t border-slate-100">
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Checklist técnico por sistema construtivo</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Ficha de dano com foto e diagnóstico por IA</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Classificação de criticidade conforme NBR 5674 e NBR 16747</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Laudo em PDF pronto para ART/RRT</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Card 2: Vistoria Cautelar de Vizinhança -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-teal-600"></div>
              <div class="p-5 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div class="space-y-3 sm:space-y-4">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 class="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Vistoria Cautelar de Vizinhança
                  </h3>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                    Registro preventivo do estado de conservação de imóveis vizinhos antes do início de uma obra, conforme a Norma IBAPE/SP e a NBR 13752 — proteção técnica para construtoras e vizinhos.
                  </p>
                </div>

                <ul class="space-y-2.5 pt-4 border-t border-slate-100">
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Cadastro da obra e dos imóveis vizinhos</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Checklist fotográfico por ambiente</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Registro de ocorrências com classificação técnica</span>
                  </li>
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Laudo consolidado em PDF, com numeração oficial</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Card 3: Engenharia Condominial -->
            <div class="rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-5 text-white" style="background: linear-gradient(160deg, #1E1B4B 0%, #312E81 100%);">
              <div class="space-y-3 sm:space-y-4">
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/15 text-indigo-300 flex items-center justify-center font-bold text-sm">03</div>
                  <span class="text-[10px] font-bold uppercase text-amber-300 bg-amber-400/20 border border-amber-300/30 px-2.5 py-1 rounded-full">Previsto para fevereiro de 2027</span>
                </div>
                <h3 class="text-base sm:text-xl font-bold tracking-tight">
                  Engenharia Condominial
                </h3>
                <p class="text-indigo-100/80 text-xs sm:text-sm leading-relaxed text-justify">
                  Transforme o diagnóstico predial em um Termo de Referência executivo completo: Memorial Descritivo, Caderno de Encargos, Plano de Ação e Orçamento Paramétrico SINAPI/BDI.
                </p>
              </div>

              <ul class="space-y-2.5 pt-4 border-t border-white/15">
                <li class="flex items-start gap-2.5 text-xs sm:text-sm text-indigo-100/90">
                  <span class="text-indigo-300 font-bold shrink-0">—</span><span>Plano de Ação e Cronograma físico-financeiro</span>
                </li>
                <li class="flex items-start gap-2.5 text-xs sm:text-sm text-indigo-100/90">
                  <span class="text-indigo-300 font-bold shrink-0">—</span><span>Orçamento de Referência (SINAPI)</span>
                </li>
                <li class="flex items-start gap-2.5 text-xs sm:text-sm text-indigo-100/90">
                  <span class="text-indigo-300 font-bold shrink-0">—</span><span>Caderno de Encargos</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Seção 4: Como Funciona -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10">
          <div class="text-center max-w-2xl mx-auto">
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Como funciona
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <!-- Passo 1 -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Vistoria em campo
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify sm:text-center">
                Prancheta digital offline-first — funciona mesmo sem sinal, sincroniza quando a conexão voltar.
              </p>
            </div>

            <!-- Passo 2 -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Registro fotográfico
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify sm:text-center">
                Cada ocorrência vira uma ficha técnica com foto, localização e diagnóstico assistido por IA.
              </p>
            </div>

            <!-- Passo 3 -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Laudo em PDF
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify sm:text-center">
                Documento técnico gerado automaticamente, pronto para ART/RRT e entrega ao cliente.
              </p>
            </div>
          </div>
        </section>

        <!-- Seção: O Futuro da Amorim Tech (Roadmap Visionário de Inovação) -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10">
          <div class="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] sm:text-xs font-semibold tracking-wide shadow-sm max-w-full">
              <svg class="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="break-words">Roadmap de Inovação Contínua</span>
            </div>
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              O Futuro da Amorim Tech
            </h2>
            <p class="text-slate-600 text-xs sm:text-base leading-relaxed">
              Estamos expandindo as fronteiras da tecnologia predial. Conheça as próximas soluções que transformarão a gestão de edifícios, condomínios e empreendimentos.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
            <!-- Futuro 1: Plano de Manutenção Digital 4.0 -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group">
              <div class="space-y-3 sm:space-y-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span class="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 block mb-1">
                    GESTÃO PREDITIVA
                  </span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900">
                    Plano de Manutenção 4.0
                  </h3>
                </div>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                  Cronogramas preventivos automatizados, alertas de periodicidade e controle orçamentário para síndicos e gestores prediais.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                <span>Em Desenvolvimento</span>
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </div>
            </div>

            <!-- Futuro 2: Entrega e Recebimento de Áreas Comuns -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group">
              <div class="space-y-3 sm:space-y-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span class="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 block mb-1">
                    CONSTRUTORAS & CONDOMÍNIOS
                  </span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900">
                    Recebimento de Obras
                  </h3>
                </div>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                  Checklist digital para vistoria de entrega de chaves e recebimento de áreas comuns, garantindo conformidade entre projeto e obra.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                <span>Planejado</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            <!-- Futuro 3: Due Diligence e Auditoria Técnica -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group">
              <div class="space-y-3 sm:space-y-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span class="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 block mb-1">
                    INVESTIMENTOS & AUDITORIA
                  </span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900">
                    Due Diligence Imobiliária
                  </h3>
                </div>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                  Auditoria técnica e documental profunda de ativos imobiliários, mitigando riscos para fundos, investidores e proprietários.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
                <span>Planejado</span>
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
            </div>
          </div>
        </section>

        <!-- Seção 5: CTA Final -->
        <section class="max-w-4xl mx-auto pt-1 sm:pt-2">
          <div class="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 sm:p-8 lg:p-10 text-center shadow-sm space-y-4 sm:space-y-6">
            <h3 class="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quer conhecer a ferramenta de perto?
            </h3>
            <p class="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Fale com a gente pelo WhatsApp e veja o sistema funcionando na prática.
            </p>
            <div class="flex justify-center pt-1 sm:pt-2">
              <a
                [href]="linkWhatsappTech"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-xs sm:text-base min-h-[44px]"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AmorimTechComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly linkWhatsappTech = gerarLinkWhatsapp('tech');

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Amorim Tech | Predial 4.0 — SaaS de Inspeção Predial com IA',
      description: 'Plataforma de gestão e inteligência predial avançada. Laudos técnicos, vistoria cautelar e diagnóstico por inteligência artificial para engenheiros, arquitetos e síndicos.',
      canonicalPath: '/amorim-tech',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Predial 4.0 — SaaS de Inspeção Predial com IA',
        description: 'Plataforma de gestão e inteligência predial avançada. Laudos técnicos, vistoria cautelar e diagnóstico por inteligência artificial para engenheiros, arquitetos e síndicos.',
        url: 'https://emanoelamorim.com/amorim-tech',
        serviceType: 'Software de Gestão e Vistoria Predial com IA',
        provider: {
          '@type': 'Organization',
          '@id': 'https://emanoelamorim.com/#organization',
          name: 'AmorimTech',
        },
      },
    });
  }
}

