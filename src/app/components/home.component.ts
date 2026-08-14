import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrajetoriaPortfolioComponent } from './trajetoria-portfolio.component';
import { HallFamaComponent } from './hall-fama.component';

export interface Depoimento {
  name: string;
  role: string;
  img: string;
}

interface Institution {
  name: string;
  logo: string;
  url: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TrajetoriaPortfolioComponent, HallFamaComponent],
  template: `
    <!-- Seção 1: Hero -->
    <section class="relative bg-indigo-900 text-white overflow-hidden py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div
        class="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none"
        style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop');"
      ></div>

      <div class="relative max-w-5xl mx-auto text-center z-10">
        <span class="inline-block text-xs md:text-sm font-semibold tracking-widest text-indigo-200 uppercase mb-4">
          EMANOEL AMORIM
        </span>
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Transformando a Construção Civil com Tecnologia.
        </h1>
        <p class="text-base sm:text-xl text-indigo-100 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Arquiteto, Mestre em Engenharia, Founder da AmorimTech e Coordenador Acadêmico.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            routerLink="/comunidade"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer text-base"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span>Entrar na Comunidade</span>
          </a>

          <button
            type="button"
            (click)="scrollToEcosystem()"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer text-base"
          >
            <span>Conhecer o Ecossistema</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Seção 2: Instituições -->
    <section class="bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-center text-xs md:text-sm font-bold tracking-widest text-slate-400 uppercase mb-12">
          Instituições que Confiam no Nosso Trabalho
        </h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 sm:gap-8 items-center justify-items-center">
          @for (inst of institutions; track inst.name) {
            <a
              [href]="inst.url"
              target="_blank"
              rel="noreferrer"
              class="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              [title]="inst.name"
            >
              <img
                [src]="inst.logo"
                [alt]="inst.name"
                class="max-h-12 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                referrerpolicy="no-referrer"
              />
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Seção 3: Sobre -->
    <section class="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Foto à esquerda -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative max-w-sm w-full">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/82107f70e_EmanoelAmorim.jpg"
                alt="Emanoel Amorim"
                class="w-full aspect-square object-cover rounded-3xl shadow-xl border-4 border-white"
                referrerpolicy="no-referrer"
              />
            </div>
          </div>

          <!-- Texto e Estatísticas à direita -->
          <div class="lg:col-span-7 space-y-6">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Minha Missão e Propósito
            </h2>

            <div class="space-y-4 text-slate-600 leading-relaxed text-base sm:text-lg">
              <p>
                Tive o privilégio de atuar na gestão de empreendimentos em todo o ciclo de vida dos edifícios: desde a viabilidade, projeto e legalização, passando por obras, pós-obra, instalação, operação, até a manutenção e demolição seletiva. Essa trajetória me mostrou com clareza que a <strong class="font-bold text-slate-900">tecnologia e a educação</strong> são os caminhos definitivos para transformar a construção civil no Brasil.
              </p>
              <p>
                Hoje, atuo na linha de frente liderando a <strong class="font-bold text-slate-900">Amorim Arquitetura</strong> (consultoria técnica) e a <strong class="font-bold text-slate-900">Amorim Tech</strong> (ferramentas 4.0). No pilar educacional, dedico-me à <strong class="font-bold text-slate-900">Amorim Academy</strong>, formando líderes e especialistas preparados para enfrentar e superar os desafios do mercado real.
              </p>
            </div>

            <div class="pt-2">
              <button
                type="button"
                (click)="showTrajetoriaModal.set(true)"
                class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>Ver Linha do Tempo Profissional</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>

            <!-- Grid de 4 Estatísticas -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span class="block text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1">+15 anos</span>
                <span class="text-xs text-slate-500 font-medium">de experiência e atuação na construção civil</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span class="block text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1">+100</span>
                <span class="text-xs text-slate-500 font-medium">projetos e laudos executados</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span class="block text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1">+200.000m²</span>
                <span class="text-xs text-slate-500 font-medium">de empreendimentos gerenciados</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                <span class="block text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1">+70</span>
                <span class="text-xs text-slate-500 font-medium">produções científicas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal da Trajetória -->
    @if (showTrajetoriaModal()) {
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-6xl my-auto max-h-[92vh] flex flex-col border border-slate-200">
          <!-- Header escuro do modal -->
          <div class="bg-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-xl sm:text-2xl font-bold tracking-tight">Trajetória & Portfólio</span>
            </div>
            <button
              type="button"
              (click)="showTrajetoriaModal.set(false)"
              class="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-xl"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <!-- Conteúdo com scroll -->
          <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
            <!-- Meu Perfil -->
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/82107f70e_EmanoelAmorim.jpg"
                alt="Emanoel Amorim"
                class="w-20 h-20 rounded-full object-cover shadow-md border-2 border-indigo-200 shrink-0"
                referrerpolicy="no-referrer"
              />
              <div class="text-center sm:text-left">
                <h3 class="text-lg font-bold text-slate-900">Meu Perfil: Gestão Estratégica e Tecnologia</h3>
                <p class="text-sm font-medium text-indigo-700 mt-0.5">Emanoel Amorim - Arquiteto e Urbanista</p>
                <p class="text-xs text-slate-500 mt-2">
                  Especialista em diagnósticos prediais, modelagem BIM e soluções integradas com tecnologia.
                </p>
              </div>
            </div>

            <!-- Player embutido do Spotify -->
            <div class="rounded-2xl overflow-hidden shadow-sm">
              <iframe
                style="border-radius: 12px;"
                src="https://open.spotify.com/embed/episode/1NXYnNIrKCwm3sVtjQRGlD?utm_source=generator&theme=0&autoplay=1"
                width="100%"
                height="152"
                frameBorder="0"
                allowfullscreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </div>

            <!-- Componente de Trajetória & Portfólio -->
            <app-trajetoria-portfolio></app-trajetoria-portfolio>
          </div>
        </div>
      </div>
    }

    <!-- Seção 4: Ecossistema -->
    <section #ecossistemaSection id="ecossistema" class="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Conheça nosso Ecossistema
          </h2>
          <p class="text-base sm:text-lg text-slate-600">
            Soluções integradas que vão da formação acadêmica à aplicação de inteligência artificial no canteiro de obras.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1: Amorim Arquitetura -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div class="h-20 flex items-center mb-6">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/de9772ab4_AmorimArquitetura.JPG"
                  alt="Amorim Arquitetura"
                  class="max-h-16 w-auto object-contain"
                  referrerpolicy="no-referrer"
                />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Amorim Arquitetura</h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-6">
                Consultoria e Gestão estratégica, laudos e engenharia diagnóstica com foco em eficiência, segurança e preservação.
              </p>
            </div>
            <a
              routerLink="/amorim-arquitetura"
              class="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors"
            >
              <span>Saiba Mais</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <!-- Card 2: Amorim Tech -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div class="h-20 flex items-center mb-6">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/8e18562d8_AmorimTech.PNG"
                  alt="Amorim Tech"
                  class="max-h-16 w-auto object-contain"
                  referrerpolicy="no-referrer"
                />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Amorim Tech</h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-6">
                Desenvolvendo o ecossistema digital para gestão inteligente de edifícios (SaaS e EdTech).
              </p>
            </div>
            <a
              routerLink="/amorim-tech"
              class="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:text-indigo-700 transition-colors"
            >
              <span>Saiba Mais</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <!-- Card 3: Amorim Academy -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div class="h-20 flex items-center mb-6">
                <span class="text-2xl font-black text-emerald-600 tracking-tight">
                  Amorim Academy
                </span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">Amorim Academy</h3>
              <p class="text-slate-600 text-sm leading-relaxed mb-6">
                Formação, mercado e mentoria em um só lugar: curso técnico, incubadora profissional e mentoria com corresponsabilidade técnica.
              </p>
            </div>
            <a
              routerLink="/amorim-academy"
              class="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:text-emerald-700 transition-colors"
            >
              <span>Saiba Mais</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção 5: Banner Comunidade -->
    <section class="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div
        class="absolute inset-0 opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none"
        style="background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop');"
      ></div>

      <div class="relative max-w-7xl mx-auto z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Coluna Esquerda: Informações e Benefícios -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Acesso Restrito
            </div>

            <div>
              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Comunidade Business 4.0
              </h2>
              <p class="text-emerald-400 font-semibold text-lg sm:text-xl mt-1">
                Além do Diploma
              </p>
            </div>

            <p class="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              Onde a expertise técnica encontra a oportunidade de mercado. A Comunidade Business 4.0 é o ponto de encontro definitivo entre quem resolve desafios complexos e quem contrata na Construção Civil. Mais do que uma plataforma de ensino, somos um organismo vivo focado em transformar conhecimento em resultados práticos e negócios reais.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <strong class="text-white font-bold">Ecossistema 360°:</strong>
                  <span class="text-slate-300 text-sm sm:text-base ml-1">Uma rede integrada que conecta alunos de todas as 7 verticais de especialização a clientes e parceiros estratégicos de forma orgânica.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <strong class="text-white font-bold">Inteligência de Mercado:</strong>
                  <span class="text-slate-300 text-sm sm:text-base ml-1">Acesso prioritário a materiais exclusivos, estudos de caso e ferramentas com foco total em aplicação imediata no canteiro, no escritório ou na gestão predial.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <strong class="text-white font-bold">Networking de Elite:</strong>
                  <span class="text-slate-300 text-sm sm:text-base ml-1">Interação direta e sem intermediários com grandes síndicos, gestores de facilities, indústrias, incorporadoras e fornecedores líderes do setor.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <strong class="text-white font-bold">Hub de Oportunidades:</strong>
                  <span class="text-slate-300 text-sm sm:text-base ml-1">Um canal exclusivo onde a engenharia consultiva encontra parcerias de alto nível, vagas e prospecção de contratos que chegam primeiro para os nossos membros.</span>
                </div>
              </div>
            </div>

            <div class="pt-4">
              <a
                routerLink="/comunidade"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 cursor-pointer text-base"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Entrar na Comunidade</span>
              </a>
            </div>
          </div>

          <!-- Coluna Direita: Painel Simulando Conteúdo Bloqueado -->
          <div class="lg:col-span-5 relative flex justify-center">
            <div class="w-full max-w-md relative rounded-3xl p-6 bg-slate-800/80 border border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
              <!-- Elementos de fundo simulando feed borrado -->
              <div class="space-y-4 filter blur-sm opacity-30 select-none pointer-events-none">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-600"></div>
                  <div class="space-y-1 flex-1">
                    <div class="h-3.5 bg-slate-600 rounded w-24"></div>
                    <div class="h-2.5 bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
                <div class="h-3 bg-slate-600 rounded w-full"></div>
                <div class="h-3 bg-slate-600 rounded w-4/5"></div>
                <div class="h-24 bg-slate-700/60 rounded-xl w-full"></div>
                <div class="flex items-center gap-3 pt-2">
                  <div class="w-10 h-10 rounded-full bg-slate-600"></div>
                  <div class="space-y-1 flex-1">
                    <div class="h-3.5 bg-slate-600 rounded w-28"></div>
                    <div class="h-2.5 bg-slate-700 rounded w-20"></div>
                  </div>
                </div>
              </div>

              <!-- Card Central Sobreposto com Cadeado -->
              <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/60 backdrop-blur-md z-20">
                <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Conteúdo Exclusivo</h3>
                <p class="text-slate-300 text-sm max-w-xs mb-6">
                  Faça login para visualizar este conteúdo.
                </p>
                <a
                  routerLink="/comunidade"
                  class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-600 transition-colors"
                >
                  Acessar Plataforma
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção: Hall da Fama -->
    <section class="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-14">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Hall da Fama
          </h2>
          <p class="text-base sm:text-lg text-slate-600">
            Os membros mais ativos e influentes do ecossistema Business 4.0.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Coluna Esquerda: Componente Hall da Fama -->
          <div class="lg:col-span-8">
            <app-hall-fama></app-hall-fama>
          </div>

          <!-- Coluna Direita: Como Ganhar Pontos? -->
          <div class="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span>Como Ganhar Pontos?</span>
              </h3>
              <p class="text-xs text-slate-500 mb-6">
                Participe ativamente e suba de nível no ecossistema.
              </p>

              <ul class="space-y-3.5 text-sm text-slate-700">
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>📖</span> Ler um artigo do blog</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+5 pts</span>
                </li>
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>👍</span> Curtir um artigo</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+3 pts</span>
                </li>
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>💬</span> Comentar em artigo</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+10 pts</span>
                </li>
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>📥</span> Baixar um material</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+5 pts</span>
                </li>
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>🗣️</span> Criar post no fórum</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+20 pts</span>
                </li>
                <li class="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span class="flex items-center gap-2 font-medium"><span>✍️</span> Responder no fórum</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+10 pts</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="flex items-center gap-2 font-medium"><span>📝</span> Criar post na comunidade</span>
                  <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-xs">+15 pts</span>
                </li>
              </ul>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-200">
              <a
                routerLink="/comunidade"
                class="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                <span>Entrar e Competir</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção: Artigos Recentes (Placeholder invisível enquanto posts estiver vazio) -->
    @if (posts.length > 0) {
      <section class="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Artigos Recentes
              </h2>
              <p class="text-slate-500 mt-2">Fique por dentro das novidades, análises e tendências do setor.</p>
            </div>
            <a
              routerLink="/blog"
              class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm"
            >
              <span>Ver todos os artigos</span>
              <span>→</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (post of posts; track post.id || post.title) {
              <article class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                @if (post.imageUrl) {
                  <img [src]="post.imageUrl" [alt]="post.title" class="w-full h-48 object-cover" referrerpolicy="no-referrer" />
                }
                <div class="p-6 flex flex-col flex-1">
                  <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">{{ post.category || 'Artigo' }}</span>
                  <h3 class="text-xl font-bold text-slate-900 mb-2">{{ post.title }}</h3>
                  <p class="text-slate-600 text-sm mb-4 line-clamp-3">{{ post.excerpt || post.description }}</p>
                  <div class="mt-auto">
                    <a [routerLink]="['/blog', post.slug || post.id]" class="text-indigo-600 font-semibold text-sm hover:underline">Ler artigo →</a>
                  </div>
                </div>
              </article>
            }
          </div>
        </div>
      </section>
    }

    <!-- Seção 6: Depoimentos (Reordenada para o final) -->
    <div class="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-extrabold text-slate-900 mb-8 text-center">Depoimentos</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (depoimento of depoimentos; track depoimento.name) {
            <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
              <img [src]="depoimento.img" [alt]="depoimento.name" class="w-full h-auto object-cover" referrerpolicy="no-referrer" />
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  readonly ecossistemaSection = viewChild<ElementRef<HTMLElement>>('ecossistemaSection');
  readonly showTrajetoriaModal = signal<boolean>(false);

  // Array vazio intencional - seção Artigos Recentes fica oculta até integração do Blog (NOVA-7/8)
  posts: any[] = [];

  readonly institutions: Institution[] = [
    { name: 'Olinda', logo: 'https://static.wixstatic.com/media/152459_4061729626104e168084e4d0754e8127~mv2.png', url: 'https://www.olinda.pe.gov.br/' },
    { name: 'Fundarpe', logo: 'https://static.wixstatic.com/media/152459_a405b7697049405c918dd6e770cd5f49~mv2.png', url: 'https://www.cultura.pe.gov.br/fundarpe/' },
    { name: 'Exército Brasileiro', logo: 'https://static.wixstatic.com/media/152459_92c0f8c115684e90af78f9d83aefed33~mv2.png', url: 'https://www.eb.mil.br/' },
    { name: 'Receita Federal', logo: 'https://static.wixstatic.com/media/152459_d4dcbb772d374989bbeb724904f6201e~mv2.png', url: 'https://www.gov.br/receitafederal/pt-br' },
    { name: 'CAERN', logo: 'https://static.wixstatic.com/media/152459_d3a662e89e814d529a66057477fd210c~mv2.png', url: 'https://www.caern.com.br/' },
    { name: 'CRC PE', logo: 'https://static.wixstatic.com/media/152459_dbf4eb8100a94256a307b8a02927e73a~mv2.png', url: 'https://crcpe.org.br/' },
    { name: 'IPHAN', logo: 'https://static.wixstatic.com/media/152459_4873a14f769f47f8b08211fd0f81960c~mv2.png', url: 'http://portal.iphan.gov.br/' },
    { name: 'SETUR PE', logo: 'https://static.wixstatic.com/media/152459_35f88d1bc05b4399804cd635c2f82b31~mv2.png', url: 'http://www.setur.pe.gov.br/' },
    { name: 'ESUDA', logo: 'https://static.wixstatic.com/media/152459_65dbdb6da2344dfabafd66cdc9b0218b~mv2.jpg', url: 'https://esuda.edu.br/' },
    { name: 'Sertenge', logo: 'https://static.wixstatic.com/media/152459_6f8de0148c96485796e37b8513ad3aa0~mv2.png', url: 'https://www.sertenge.com.br/' },
    { name: 'JFPE', logo: 'https://static.wixstatic.com/media/152459_3a9f8d3bb4ee46439988cf98c425e31a~mv2.png', url: 'https://www.jfpe.jus.br/' },
    { name: 'TRT 6', logo: 'https://static.wixstatic.com/media/152459_dbb16ca85da747fa859b21f286a841a2~mv2.jpg', url: 'https://www.trt6.jus.br/' },
    { name: 'URB Recife', logo: 'https://static.wixstatic.com/media/152459_b99ea89715c744c19f29d704cbebe484~mv2.jpg', url: 'https://www2.recife.pe.gov.br/' }
  ];

  depoimentos: Depoimento[] = [
    { name: 'Amanda Aires Vieira', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1VN4tH_kxzjI7mSu9tnMfs6ivzPyMwyNL' },
    { name: 'Jose Goncalves Campos Filho', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1ZmWee2WCuNpwTx9J9mLjzBo-1QsF7bW-' },
    { name: 'Clodomir Barros', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1KmCvUpdQL8DzCEnhi9I8mDokerAS8yrT' },
  ];

  scrollToEcosystem(): void {
    const el = this.ecossistemaSection()?.nativeElement || document.getElementById('ecossistema');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

