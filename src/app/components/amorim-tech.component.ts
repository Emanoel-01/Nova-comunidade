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
                  <span class="text-[10px] font-bold uppercase text-indigo-300 bg-indigo-400/15 px-2 py-1 rounded-full">Em desenvolvimento</span>
                </div>
                <h3 class="text-base sm:text-xl font-bold tracking-tight">
                  Engenharia Condominial
                </h3>
                <p class="text-indigo-100/80 text-xs sm:text-sm leading-relaxed text-justify">
                  Do laudo técnico à obra concluída. Transforma o diagnóstico num Termo de Referência completo — orçamento, caderno de encargos e fiscalização.
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
                  <span class="text-indigo-300 font-bold shrink-0">—</span><span>Caderno de Encargos e Fiscalização de Obra</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Seção: Alô Síndico (Para Síndicos e Gestores Prediais) -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10" id="alo-sindico">
          <!-- Cabeçalho -->
          <div class="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] sm:text-xs font-semibold tracking-wide shadow-sm max-w-full">
              <svg class="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="break-words">Para Síndicos e Gestores Prediais</span>
            </div>

            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alô, Síndico! Sua gestão predial não precisa ser um mistério.
            </h2>

            <p class="text-slate-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
              Sem jargão técnico. Aqui você entende o que precisa saber sobre o seu prédio e já sai com uma cotação na mão.
            </p>
          </div>

          <!-- 3 Cards Informativos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            <!-- Card 1 -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-amber-500"></div>
              <div class="p-5 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div class="space-y-2.5">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Quando pedir uma inspeção predial?
                  </h3>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                    Trincas, infiltrações, manchas na fachada ou simplesmente o prédio completando 5, 10 ou 15 anos são bons motivos para chamar um profissional. Quanto antes o diagnóstico, mais barato o reparo.
                  </p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Prevenção e economia real</span>
                </div>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-blue-600"></div>
              <div class="p-5 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div class="space-y-2.5">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    O que é essa tal de NBR 16747?
                  </h3>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                    É a norma técnica que define como um prédio deve ser inspecionado no Brasil. Um laudo dentro dela protege você juridicamente e evita multas — e é exatamente o que a gente entrega.
                  </p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Segurança jurídica garantida</span>
                </div>
              </div>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-emerald-600"></div>
              <div class="p-5 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div class="space-y-2.5">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Quanto custa? Depende do quê?
                  </h3>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                    O valor varia com o tamanho do prédio, a quantidade de sistemas a inspecionar e a complexidade encontrada. Sem letra miúda: você recebe uma cotação clara antes de fechar qualquer coisa.
                  </p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cotação transparente e ágil</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bloco de CTA duplo Alô Síndico -->
          <div class="max-w-4xl mx-auto pt-4">
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 sm:p-8 lg:p-10 text-white text-center shadow-lg space-y-4 sm:space-y-6">
              <div class="space-y-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 backdrop-blur-xs text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider max-w-full">
                  <span class="shrink-0">⚡</span>
                  <span class="break-words">Atendimento Especial para Síndicos</span>
                </div>
                <h3 class="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Fale agora com quem entende do assunto — sem compromisso.
                </h3>
                <p class="text-amber-100 text-xs sm:text-sm max-w-xl mx-auto text-justify sm:text-center">
                  Tire dúvidas sobre seu edifício com nossa inteligência artificial ou receba um orçamento personalizado no seu WhatsApp.
                </p>
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 sm:pt-2">
                <a
                  routerLink="/contato"
                  fragment="alo-sindico"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xl transition-all duration-200 text-xs sm:text-sm cursor-pointer min-h-[44px]"
                >
                  <span>Conversar no Alô Síndico</span>
                  <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <a
                  [href]="linkWhatsappSindico"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-whatsapp-alo-sindico"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xl transition-all duration-200 text-xs sm:text-sm cursor-pointer min-h-[44px]"
                >
                  <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                  </svg>
                  <span>Pedir Cotação no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div class="pt-6 sm:pt-8 flex justify-center">
            <a
              [href]="linkWhatsappSindico"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px]"
            >
              Falar com o Alô Síndico
            </a>
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

            <!-- Futuro 4: Alô Síndico AI Assistant -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group">
              <div class="space-y-3 sm:space-y-4">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span class="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1">
                    IA EM TEMPO REAL
                  </span>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900">
                    Alô Síndico AI
                  </h3>
                </div>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                  Assistente virtual 24/7 treinado com normas ABNT e práticas de engenharia para orientar gestores e conectar a engenheiros credenciados.
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
                <span>Versão Beta Ativa</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
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
  readonly linkWhatsappSindico = gerarLinkWhatsapp('tech-sindico');

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

