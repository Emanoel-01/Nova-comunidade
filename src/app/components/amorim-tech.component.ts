import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amorim-tech',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
      <div class="max-w-7xl mx-auto space-y-20 sm:space-y-24">
        <!-- Seção 1: Cabeçalho -->
        <section class="text-center max-w-3xl mx-auto space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <svg class="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>Ecossistema Digital & Inteligência Artificial</span>
          </div>

          <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Predial 4.0
          </h1>

          <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            O copiloto técnico para engenheiros e arquitetos que fazem vistorias e emitem laudos. Digitaliza o fluxo completo, da vistoria em campo à entrega do documento técnico, com apoio de inteligência artificial.
          </p>
        </section>

        <!-- Seção 2: App em Destaque -->
        <section class="max-w-4xl mx-auto">
          <div class="relative bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 text-center space-y-8 overflow-hidden">
            <!-- Glow background decorativo -->
            <div class="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col items-center space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20">
                  P
                </div>
                <div class="text-left">
                  <span class="block text-[11px] font-extrabold uppercase tracking-widest text-cyan-400">
                    PLATAFORMA PRINCIPAL
                  </span>
                  <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Predial 4.0
                  </h2>
                </div>
              </div>

              <p class="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Prancheta de campo offline-first, registro fotográfico vinculado à ficha técnica, diagnóstico assistido por IA e emissão automática do laudo em PDF — tudo em um só lugar.
              </p>
            </div>

            <div class="relative z-10 flex justify-center pt-2">
              <a
                href="https://predial40-app.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 cursor-pointer text-sm sm:text-base"
              >
                <span>Acessar o Predial 4.0</span>
                <svg class="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- Seção 3: Dois Módulos -->
        <section class="space-y-12">
          <div class="text-center max-w-2xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dois módulos, um só ecossistema
            </h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <!-- Card 1: Inspeção Predial -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div class="h-2 w-full bg-indigo-600"></div>
              <div class="p-8 sm:p-10 space-y-6 flex-1 flex flex-col justify-between">
                <div class="space-y-4">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                    Inspeção Predial
                  </h3>
                  <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Laudo técnico completo de inspeção predial, conforme a NBR 16747. Diagnóstico assistido por IA, classificação de criticidade (P1/P2/P3) e emissão do documento com numeração sequencial.
                  </p>
                </div>

                <ul class="space-y-3 pt-6 border-t border-slate-100">
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Checklist técnico por sistema construtivo</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Ficha de dano com foto e diagnóstico por IA</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Classificação de criticidade conforme NBR 5674 e NBR 16747</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
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
              <div class="p-8 sm:p-10 space-y-6 flex-1 flex flex-col justify-between">
                <div class="space-y-4">
                  <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                    Vistoria Cautelar de Vizinhança
                  </h3>
                  <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
                    Registro preventivo do estado de conservação de imóveis vizinhos antes do início de uma obra, conforme a Norma IBAPE/SP e a NBR 13752 — proteção técnica para construtoras e vizinhos.
                  </p>
                </div>

                <ul class="space-y-3 pt-6 border-t border-slate-100">
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Cadastro da obra e dos imóveis vizinhos</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Checklist fotográfico por ambiente</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
                    <div class="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200/60">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span>Registro de ocorrências com classificação técnica</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-slate-700">
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
          </div>
        </section>

        <!-- Seção 4: Como Funciona -->
        <section class="space-y-12">
          <div class="text-center max-w-2xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Como funciona
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- Passo 1 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Vistoria em campo
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Prancheta digital offline-first — funciona mesmo sem sinal, sincroniza quando a conexão voltar.
              </p>
            </div>

            <!-- Passo 2 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div class="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Registro fotográfico
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Cada ocorrência vira uma ficha técnica com foto, localização e diagnóstico assistido por IA.
              </p>
            </div>

            <!-- Passo 3 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Laudo em PDF
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Documento técnico gerado automaticamente, pronto para ART/RRT e entrega ao cliente.
              </p>
            </div>
          </div>
        </section>

        <!-- Seção 5: CTA Final -->
        <section class="max-w-4xl mx-auto pt-4">
          <div class="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-6">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quer conhecer a ferramenta de perto?
            </h3>
            <p class="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Fale com a gente pelo WhatsApp e veja o sistema funcionando na prática.
            </p>
            <div class="flex justify-center pt-2">
              <a
                href="https://wa.me/5581991298803"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-sm sm:text-base"
              >
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
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
export class AmorimTechComponent {}
