import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amorim-academy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
      <div class="max-w-7xl mx-auto space-y-20 sm:space-y-28">
        
        <!-- Seção 1: Cabeçalho da página -->
        <section class="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-sm text-center max-w-4xl mx-auto space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span>Amorim Academy</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Formação, mercado e mentoria em um só lugar
          </h1>
        </section>

        <!-- Seção 2: Curso Predial 4.0 -->
        <section class="space-y-12">
          <div class="text-center max-w-3xl mx-auto space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Turma única · Recife · 27 a 29 de novembro de 2026</span>
            </div>

            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curso Predial 4.0
            </h2>

            <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Formação em Inspeção Predial com IA. Domine a Engenharia Diagnóstica e emita laudos técnicos com muito mais velocidade, aplicando a NBR 16747 na prática, com apoio do ecossistema Predial 4.0.
            </p>
          </div>

          <!-- Grid de 4 números -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div class="text-3xl sm:text-4xl font-black text-slate-900 mb-1">30h</div>
              <div class="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Total</div>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div class="text-3xl sm:text-4xl font-black text-slate-900 mb-1">20h</div>
              <div class="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Presencial · Recife</div>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div class="text-3xl sm:text-4xl font-black text-slate-900 mb-1">10h</div>
              <div class="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Mentoria em Grupo</div>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div class="text-3xl sm:text-4xl font-black text-blue-600 mb-1">40</div>
              <div class="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Vagas na Turma</div>
            </div>
          </div>

          <!-- Grid de 3 cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <!-- Card 1 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                  Presencial em Recife
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Três dias intensivos: fundamentos de patologia das construções, leitura de manifestações, checklist técnico, prática de campo guiada e Skills Claude aplicadas a orçamento de obras.
                </p>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                  Acesso à plataforma
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Acesso à plataforma Predial 4.0 para emitir laudos profissionais na prática — registro de fotos, diagnóstico sugerido por IA e montagem automática do documento técnico.
                </p>
              </div>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                  Mentoria em grupo
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed">
                  Rodadas de acompanhamento ao vivo com o grupo da turma, para tirar dúvidas sobre os laudos reais em produção.
                </p>
              </div>
            </div>
          </div>

          <!-- Card final escuro -->
          <div class="max-w-4xl mx-auto">
            <div class="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 text-center space-y-6">
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Vagas limitadas — acesso antecipado
              </h3>
              <p class="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                As condições de lançamento serão reveladas exclusivamente para os profissionais na Lista de Interessados.
              </p>
              <div class="flex justify-center pt-2">
                <a
                  href="https://chat.whatsapp.com/FHW24nsYmDv6gktpTeRyOp"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-sm sm:text-base"
                >
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Entrar na Lista de Interessados</span>
                </a>
              </div>
              <p class="text-xs sm:text-sm text-slate-400">
                <strong class="font-bold text-slate-200">O acesso à Comunidade Business 4.0 está incluído</strong> para todos os matriculados no curso.
              </p>
            </div>
          </div>
        </section>

        <!-- Seção 3: Incubadora Profissional -->
        <section class="relative bg-slate-900 text-white rounded-3xl border-t-8 border-emerald-500 border-x border-b border-slate-800 p-8 sm:p-14 shadow-2xl space-y-12 overflow-hidden">
          <!-- Brilho decorativo esmeralda desfocado -->
          <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Cabeçalho da seção -->
          <div class="relative z-10 text-center max-w-3xl mx-auto space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Mais do que um curso. Uma Aceleradora de Carreiras.</span>
            </div>

            <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Incubadora Profissional
            </h2>

            <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Não basta ter o diploma se não tem a oportunidade. Nossos profissionais são inseridos ativamente no mercado, fecham contratos reais e publicam artigos durante a formação.
            </p>

            <!-- Botão/toggle bastidores -->
            <div class="pt-2">
              <button
                type="button"
                (click)="toggleObjetivos()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm"
              >
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Entenda os bastidores do programa</span>
                <svg
                  class="w-4 h-4 text-slate-400 transition-transform duration-300"
                  [class.rotate-180]="mostrarObjetivos()"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <!-- Painel expansível de objetivos -->
            @if (mostrarObjetivos()) {
              <div class="mt-6 text-left bg-slate-950/80 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 animate-fade-in shadow-inner">
                <div class="space-y-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Objetivo Geral
                  </h4>
                  <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Capacitar profissionais a integrarem os conhecimentos teóricos com a prática do mercado de trabalho, complementando a formação técnica com vivência profissional real.
                  </p>
                </div>

                <div class="space-y-3 pt-4 border-t border-slate-800">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Objetivos Específicos
                  </h4>
                  <ul class="space-y-2 text-sm text-slate-300">
                    <li class="flex items-start gap-2.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                      <span>Aplicar os conhecimentos adquiridos na prática</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                      <span>Desenvolver estudos de caso reais</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                      <span>Estabelecer conexões com o mercado e instituições parceiras</span>
                    </li>
                    <li class="flex items-start gap-2.5">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                      <span>Estimular pesquisa, extensão e inovação tecnológica</span>
                    </li>
                  </ul>
                </div>
              </div>
            }
          </div>

          <!-- Grid principal de duas colunas: ROI + Prova Social -->
          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
            
            <!-- Coluna Esquerda: Retorno Financeiro (ROI) -->
            <div class="bg-slate-800/60 rounded-3xl border border-slate-700/60 p-6 sm:p-8 space-y-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white tracking-tight">
                  O Retorno Financeiro (ROI)
                </h3>
              </div>

              <!-- Bloco em destaque com gradiente -->
              <div class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-2">
                <span class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-100">
                  Retorno Médio Comprovado
                </span>
                <div class="text-5xl sm:text-6xl font-black tracking-tight text-white py-1">
                  235,0%
                </div>
                <p class="text-xs sm:text-sm text-emerald-50 font-medium max-w-xs mx-auto">
                  Cada R$ investido volta multiplicado para o bolso dos profissionais.
                </p>
              </div>

              <!-- 2 Blocos lado a lado -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-700/60 text-center">
                  <span class="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Investimento da Turma
                  </span>
                  <span class="text-base sm:text-lg font-black text-slate-200">
                    R$ 67.166,40
                  </span>
                </div>
                <div class="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-700/60 text-center">
                  <span class="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Ganhos Gerados
                  </span>
                  <span class="text-base sm:text-lg font-black text-emerald-400">
                    R$ 224.999,99
                  </span>
                </div>
              </div>

              <!-- Grid de 4 métricas -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div class="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-center space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div class="text-lg font-black text-white">4</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Contratações</div>
                </div>

                <div class="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-center space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div class="text-lg font-black text-white">1</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Inovações</div>
                </div>

                <div class="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-center space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="text-lg font-black text-white">2</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Artigos</div>
                </div>

                <div class="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-center space-y-1">
                  <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div class="text-lg font-black text-white">1</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Relatórios</div>
                </div>
              </div>
            </div>

            <!-- Coluna Direita: Prova Social -->
            <div class="space-y-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white tracking-tight">
                  Prova Social: resultados reais
                </h3>
              </div>

              <!-- Lista dos 4 cartões com borda esquerda âmbar -->
              <div class="space-y-3.5">
                <!-- Cartão 1 -->
                <div class="bg-slate-800/80 rounded-r-2xl border border-slate-700/60 border-l-4 border-l-amber-500 p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                  <div class="space-y-1">
                    <h4 class="text-base font-bold text-white leading-snug">
                      Paulo Ewerton Ribeiro da Silva
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-300 font-medium">
                      Projetista · <span class="text-slate-400">Colocado em: 30/09/2025</span>
                    </p>
                  </div>
                  <span class="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Freelancer
                  </span>
                </div>

                <!-- Cartão 2 -->
                <div class="bg-slate-800/80 rounded-r-2xl border border-slate-700/60 border-l-4 border-l-amber-500 p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                  <div class="space-y-1">
                    <h4 class="text-base font-bold text-white leading-snug">
                      Hugo Ewerton Pereira Silva
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-300 font-medium">
                      Engenheiro Fiscal de Campo · <span class="text-slate-400">Colocado em: 01/09/2025</span>
                    </p>
                  </div>
                  <span class="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Contratado
                  </span>
                </div>

                <!-- Cartão 3 -->
                <div class="bg-slate-800/80 rounded-r-2xl border border-slate-700/60 border-l-4 border-l-amber-500 p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                  <div class="space-y-1">
                    <h4 class="text-base font-bold text-white leading-snug">
                      Adriana Gonçalves Araujo
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-300 font-medium">
                      Fiscal de Obras · <span class="text-slate-400">Colocado em: 31/08/2025</span>
                    </p>
                  </div>
                  <span class="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Contratada
                  </span>
                </div>

                <!-- Cartão 4 -->
                <div class="bg-slate-800/80 rounded-r-2xl border border-slate-700/60 border-l-4 border-l-amber-500 p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800 transition-colors">
                  <div class="space-y-1">
                    <h4 class="text-base font-bold text-white leading-snug">
                      Vinícius de Assis Souto Maior Arruda
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-300 font-medium">
                      Gerente de Obras · <span class="text-slate-400">Colocado em: 31/08/2025</span>
                    </p>
                  </div>
                  <span class="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Contratado
                  </span>
                </div>
              </div>

              <!-- Nota de rodapé da prova social -->
              <p class="text-xs text-slate-400 italic">
                * Os profissionais autorizam expressamente a vinculação da sua imagem e conquistas como prova social da Incubadora.
              </p>
            </div>

          </div>
        </section>

        <!-- Seção 4: Mentor Anjo -->
        <section class="bg-gradient-to-b from-indigo-50/80 to-white rounded-3xl p-8 sm:p-14 border border-indigo-100 shadow-sm space-y-12">
          <div class="text-center max-w-3xl mx-auto space-y-4">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Mentoria Técnica</span>
            </div>

            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mentor Anjo
            </h2>

            <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Um programa de mentoria e corresponsabilidade técnica para profissionais que estão dando os primeiros passos na emissão de laudos — com acompanhamento próximo e revisão técnica individual de cada trabalho produzido.
            </p>
          </div>

          <!-- Grid de 3 cards centralizados -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <!-- Card 1 -->
            <div class="bg-white rounded-3xl p-8 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-4 text-center items-center hover:shadow-md transition-shadow">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Corresponsabilidade Técnica
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Cada laudo produzido é revisado individualmente por um corresponsável técnico experiente.
              </p>
            </div>

            <!-- Card 2 -->
            <div class="bg-white rounded-3xl p-8 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-4 text-center items-center hover:shadow-md transition-shadow">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Acompanhamento Próximo
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Mentoria direta para profissionais em início de trajetória na área.
              </p>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-3xl p-8 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-4 text-center items-center hover:shadow-md transition-shadow">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 tracking-tight">
                Prática Guiada
              </h3>
              <p class="text-slate-600 text-sm leading-relaxed">
                Aprenda emitindo laudos reais, com suporte técnico em cada etapa.
              </p>
            </div>
          </div>

          <!-- Botão CTA Mentor Anjo -->
          <div class="flex justify-center pt-2">
            <a
              href="https://wa.me/5581991298803"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Saber mais sobre o Mentor Anjo</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  `
})
export class AmorimAcademyComponent {
  readonly mostrarObjetivos = signal(false);

  toggleObjetivos(): void {
    this.mostrarObjetivos.update(v => !v);
  }
}
