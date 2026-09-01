import { Component, OnDestroy, OnInit, computed, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrigemWhatsapp, gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../services/seo.service';

export interface PortfolioProject {
  img: string;
  title: string;
  year: string;
  client: string;
  location: string;
}

export interface ServiceCard {
  title: string;
  description: string;
  items: string[];
}

@Component({
  selector: 'app-service-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 sm:space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
        @for (card of services(); track card.title) {
          <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5">
            <div class="space-y-2.5">
              <h4 class="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                {{ card.title }}
              </h4>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
                {{ card.description }}
              </p>
            </div>

            <ul class="space-y-2.5 pt-2 border-t border-slate-100">
              @for (item of card.items; track item) {
                <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <div class="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span>{{ item }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <!-- Botão Centralizado WhatsApp -->
      <div class="flex justify-center pt-2">
        <a
          [href]="linkWhatsapp()"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-xs sm:text-base min-h-[44px]"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>{{ buttonText() }}</span>
        </a>
      </div>
    </div>
  `
})
export class ServiceGridComponent {
  readonly services = input<ServiceCard[]>([]);
  readonly buttonText = input<string>('Solicitar Proposta');
  readonly origem = input<OrigemWhatsapp>('arquitetura');
  readonly linkWhatsapp = computed(() => gerarLinkWhatsapp(this.origem()));
}

@Component({
  selector: 'app-portfolio-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden shadow-md group"
      [class]="projects().length > 0 ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100 border border-slate-200/80 flex items-center justify-center p-6 text-center'"
    >
      @if (projects().length > 0) {
        @let current = projects()[currentIndex()];
        @if (current.img) {
          <!-- Imagem de Fundo com Transição -->
          <img
            [src]="current.img"
            [alt]="current.title"
            class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            referrerpolicy="no-referrer"
          />

          <!-- Gradiente Escuro Sobreposto -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          <!-- Informações do Projeto na parte inferior -->
          <div class="absolute inset-x-0 bottom-0 p-5 z-10 flex flex-col justify-end">
            <span class="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
              {{ current.year }} · {{ current.client }}
            </span>
            <h4 class="text-base sm:text-lg font-bold text-white leading-snug mb-1">
              {{ current.title }}
            </h4>
            <p class="text-xs text-slate-300 font-medium">
              📍 {{ current.location }}
            </p>
          </div>
        } @else {
          <!-- Fallback para item sem imagem (fundo sólido escuro com texto legível) -->
          <div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-6 text-center z-10">
            <span class="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">
              {{ current.year }} · {{ current.client }}
            </span>
            <h4 class="text-base sm:text-lg font-bold text-white leading-snug mb-2 max-w-[240px]">
              {{ current.title }}
            </h4>
            <p class="text-xs text-slate-300 font-medium">
              📍 {{ current.location }}
            </p>
          </div>
        }

        <!-- Botões de Navegação Manual (Setas) -->
        <div class="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
          <button
            type="button"
            (click)="prev(); $event.stopPropagation()"
            class="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer text-xs"
            aria-label="Projeto anterior"
          >
            ❮
          </button>
          <button
            type="button"
            (click)="next(); $event.stopPropagation()"
            class="pointer-events-auto w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 opacity-70 group-hover:opacity-100 transition-all cursor-pointer text-xs"
            aria-label="Próximo projeto"
          >
            ❯
          </button>
        </div>

        <!-- Bolinhas de Navegação na parte inferior direita -->
        <div class="absolute bottom-3 right-4 flex items-center gap-1.5 z-20">
          @for (proj of projects(); track proj.title; let idx = $index) {
            <button
              type="button"
              (click)="goTo(idx); $event.stopPropagation()"
              [class]="idx === currentIndex()
                ? 'w-4 h-1.5 bg-blue-400 rounded-full transition-all'
                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70 rounded-full transition-all'"
              [attr.aria-label]="'Ir para o slide ' + (idx + 1)"
            ></button>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center space-y-3 text-slate-500 max-w-[220px]">
          <div class="w-10 h-10 rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
            Em breve: cases de manutenção predial contínua.
          </p>
        </div>
      }
    </div>
  `
})
export class PortfolioCarouselComponent implements OnInit, OnDestroy {
  readonly projects = input<PortfolioProject[]>([]);
  readonly currentIndex = signal<number>(0);

  private intervalId: any = null;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.projects().length <= 1) return;
    this.intervalId = setInterval(() => {
      this.next();
    }, 4000);
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  next(): void {
    const list = this.projects();
    if (list.length === 0) return;
    this.currentIndex.update(curr => (curr + 1) % list.length);
  }

  prev(): void {
    const list = this.projects();
    if (list.length === 0) return;
    this.currentIndex.update(curr => (curr - 1 + list.length) % list.length);
  }

  goTo(idx: number): void {
    this.currentIndex.set(idx);
    this.startAutoPlay(); // reinicia contagem de 4s
  }
}

@Component({
  selector: 'app-amorim-arquitetura',
  standalone: true,
  imports: [CommonModule, RouterLink, PortfolioCarouselComponent, ServiceGridComponent],
  template: `
    <div class="w-full bg-slate-50 py-6 sm:py-10 lg:py-16 px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 lg:space-y-16">
      <div class="max-w-7xl mx-auto space-y-10 sm:space-y-14 lg:space-y-16">
        <!-- Seção 1: Hero -->
        <section class="relative rounded-3xl overflow-hidden shadow-2xl" style="background: linear-gradient(135deg, #042C53 0%, #0C447C 55%, #4A1B0C 130%);">
          <div class="relative z-10 px-6 sm:px-12 py-10 sm:py-14 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold mb-5">
              Especialistas em engenharia consultiva
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
              Excelência técnica para proteger o seu patrimônio.
            </h1>
            <p class="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mb-7">
              Referência em Engenharia Condominial e Diagnóstica em Pernambuco, com mais de 15 anos de atuação em projetos públicos e privados de grande porte. Rigor técnico das normas ABNT e IBAPE, unido à inovação da Construção 4.0.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/5581991298803?text=Ol%C3%A1!%20Vim%20pela%20p%C3%A1gina%20da%20Amorim%20Arquitetura%20e%20gostaria%20de%20solicitar%20uma%20proposta."
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B5642A] hover:bg-[#9c521e] text-white font-bold rounded-xl transition-colors text-sm min-h-[44px]"
              >
                Solicitar proposta técnica
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
              <a href="#diagnostica" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-colors text-sm min-h-[44px]">
                Explorar serviços
              </a>
            </div>
          </div>

          <div class="relative z-10 border-t border-white/15 grid grid-cols-3 divide-x divide-white/15">
            <div class="px-4 py-6 sm:py-7 text-center">
              <p class="text-2xl sm:text-3xl font-extrabold text-white">+15 anos</p>
              <p class="text-[11px] sm:text-xs text-white/60 mt-1">de atuação na construção civil</p>
            </div>
            <div class="px-4 py-6 sm:py-7 text-center">
              <p class="text-2xl sm:text-3xl font-extrabold text-white">+500</p>
              <p class="text-[11px] sm:text-xs text-white/60 mt-1">projetos e laudos executados</p>
            </div>
            <div class="px-4 py-6 sm:py-7 text-center">
              <p class="text-2xl sm:text-3xl font-extrabold text-white">+200.000m²</p>
              <p class="text-[11px] sm:text-xs text-white/60 mt-1">de empreendimentos gerenciados</p>
            </div>
          </div>
        </section>

        <!-- Nova Seção: Filtro Rápido de Público -->
        <section class="grid md:grid-cols-2 gap-5 sm:gap-6">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#B5642A]">Para síndicos e administradoras</span>
              <h3 class="text-lg sm:text-xl font-bold text-slate-900">Gestão e inspeção condominial</h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">Evite custos emergenciais, cumpra as exigências legais e valorize o edifício com planos de manutenção e laudos de inspeção completos.</p>
            </div>
            <a href="#condominial" class="inline-flex items-center gap-2 text-sm font-bold text-[#0C447C]">Ver soluções para condomínios →</a>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-[#0C447C]">Para construtoras e instituições</span>
              <h3 class="text-lg sm:text-xl font-bold text-slate-900">Engenharia diagnóstica e legal</h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">Vistorias cautelares de vizinhança, fiscalização técnica de obras, laudos periciais e avaliações patrimoniais com respaldo normativo.</p>
            </div>
            <a href="#diagnostica" class="inline-flex items-center gap-2 text-sm font-bold text-[#0C447C]">Ver serviços para empresas e órgãos →</a>
          </div>
        </section>

        <!-- Seção 2: Portfólio -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10">
          <div class="text-center max-w-3xl mx-auto">
            <p class="text-[#B5642A] text-xs font-bold uppercase tracking-wide mb-2">Trajetória</p>
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
              Portfólio
            </h2>
            <p class="text-slate-600 text-xs sm:text-base">
              Mais de 15 anos de serviços executados para órgãos públicos, instituições e empreendimentos privados.
            </p>
          </div>

          <!-- Grid de 3 Colunas com Carrosséis -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            <!-- Coluna 1: Gestão de Projetos -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div class="space-y-1.5">
                <h3 class="text-base sm:text-xl font-bold text-slate-900">
                  Gestão de Projetos
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify min-h-[36px]">
                  Coordenação técnica completa de projetos arquitetônicos e de engenharia, do conceito à entrega.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoProjetos"></app-portfolio-carousel>
            </div>

            <!-- Coluna 2: Gestão e Fiscalização de Obras -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div class="space-y-1.5">
                <h3 class="text-base sm:text-xl font-bold text-slate-900">
                  Gestão e Fiscalização de Obras
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify min-h-[36px]">
                  Acompanhamento técnico rigoroso garantindo qualidade, prazo e custo nas obras.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoObras"></app-portfolio-carousel>
            </div>

            <!-- Coluna 3: Gestão da Manutenção -->
            <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
              <div class="space-y-1.5">
                <h3 class="text-base sm:text-xl font-bold text-slate-900">
                  Gestão da Manutenção
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify min-h-[36px]">
                  Planejamento e controle da manutenção predial para preservar e valorizar patrimônios.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoManutencao()"></app-portfolio-carousel>
            </div>
          </div>
        </section>

        <!-- Seção 3: Engenharia Diagnóstica e Legal -->
        <section id="diagnostica" class="space-y-6 sm:space-y-8 lg:space-y-10 pt-1 sm:pt-2">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
              Engenharia Diagnóstica e Legal
            </h2>
            <p class="text-slate-600 text-xs sm:text-base">
              Diagnósticos precisos e laudos técnicos para garantir segurança jurídica e estrutural.
            </p>
          </div>

          <app-service-grid
            [services]="servicosDiagnostica"
            buttonText="Solicitar Proposta"
          ></app-service-grid>
        </section>

        <!-- Seção 4: Gestão Condominial e Operação -->
        <section id="condominial" class="space-y-6 sm:space-y-8 lg:space-y-10 pt-1 sm:pt-2">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
              Gestão Condominial e Operação
            </h2>
            <p class="text-slate-600 text-xs sm:text-base">
              Ferramentas e processos para aumentar a vida útil e reduzir custos emergenciais do seu prédio.
            </p>
          </div>

          <app-service-grid
            [services]="servicosCondominial"
            buttonText="Agendar Consultoria"
          ></app-service-grid>
        </section>

        <!-- Seção 5: Projetos e Inovação 4.0 -->
        <section class="space-y-6 sm:space-y-8 lg:space-y-10 pt-1 sm:pt-2">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
              Projetos e Inovação 4.0
            </h2>
            <p class="text-slate-600 text-xs sm:text-base">
              A união da arquitetura moderna com as soluções tecnológicas do amanhã.
            </p>
          </div>

          <div class="grid sm:grid-cols-3 gap-5">
            <div class="rounded-2xl p-6 flex flex-col justify-between space-y-5 text-white" style="background: #042C53;">
              <div class="space-y-2.5">
                <h3 class="font-bold text-sm sm:text-base">{{ servicosInovacao[0].title }}</h3>
                <p class="text-white/70 text-xs leading-relaxed">{{ servicosInovacao[0].description }}</p>
              </div>
              <ul class="space-y-1.5 pt-3 border-t border-white/15 text-xs text-white/80">
                @for (it of servicosInovacao[0].items; track it) {
                  <li class="flex gap-2"><span class="text-white/40">—</span><span>{{ it }}</span></li>
                }
              </ul>
            </div>

            <div class="rounded-2xl p-6 flex flex-col justify-between space-y-5 text-white" style="background: #0C447C;">
              <div class="space-y-2.5">
                <h3 class="font-bold text-sm sm:text-base">{{ servicosInovacao[1].title }}</h3>
                <p class="text-white/70 text-xs leading-relaxed">{{ servicosInovacao[1].description }}</p>
              </div>
              <ul class="space-y-1.5 pt-3 border-t border-white/15 text-xs text-white/80">
                @for (it of servicosInovacao[1].items; track it) {
                  <li class="flex gap-2"><span class="text-white/40">—</span><span>{{ it }}</span></li>
                }
              </ul>
            </div>

            <div class="rounded-2xl p-6 flex flex-col justify-between space-y-5 text-white" style="background: #4A1B0C;">
              <div class="space-y-2.5">
                <h3 class="font-bold text-sm sm:text-base">{{ servicosInovacao[2].title }}</h3>
                <p class="text-white/70 text-xs leading-relaxed">{{ servicosInovacao[2].description }}</p>
              </div>
              <ul class="space-y-1.5 pt-3 border-t border-white/15 text-xs text-white/80">
                @for (it of servicosInovacao[2].items; track it) {
                  <li class="flex gap-2"><span class="text-white/40">—</span><span>{{ it }}</span></li>
                }
              </ul>
            </div>
          </div>
        </section>

        <!-- Seção 6: Atendimento para Síndicos (Alô Síndico) -->
        <section class="pt-1 sm:pt-2">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 max-w-5xl mx-auto">
            <div class="space-y-2 text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider max-w-full">
                <span class="shrink-0">⚡</span>
                <span class="break-words">Canal Direto do Síndico</span>
              </div>
              <h3 class="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Precisa de vistoria ou laudo para seu condomínio?
              </h3>
              <p class="text-amber-100 text-xs sm:text-sm max-w-xl text-justify md:text-left">
                Síndicos, administradoras e gestores de condomínio: consulte nosso assistente técnico inteligente Alô Síndico com IA, ou feche uma parceria para laudos em massa usando a tecnologia do nosso software Predial 4.0 — agilidade, padronização e preço justo para sua carteira de imóveis.
              </p>
            </div>

            <div class="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href="https://emanoelamorim.com/contato#alo-sindico"
                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all duration-200 text-xs sm:text-sm cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <span>Acessar Alô Síndico</span>
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- Seção 7: CTA Final -->
        <section class="pt-1 sm:pt-2">
          <div class="bg-blue-50 border border-blue-100 rounded-3xl p-6 sm:p-10 lg:p-12 text-center max-w-4xl mx-auto shadow-sm">
            <h3 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mb-3 sm:mb-4 tracking-tight">
              Mais de 500 projetos e laudos executados com sucesso
            </h3>
            <p class="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed text-justify sm:text-center">
              A Amorim Arquitetura é a escolha de grandes instituições públicas, privadas e condomínios que não abrem mão de segurança, rigor normativo e tecnologia de ponta.
            </p>
            <div class="flex justify-center">
              <a
                routerLink="/"
                fragment="clientes"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-xs sm:text-base min-h-[44px]"
              >
                <span>Ver Órgãos que Confiam no Nosso Trabalho</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AmorimArquiteturaComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly seoService = inject(SeoService);

  readonly gestaoManutencao = signal<PortfolioProject[]>([]);

  async ngOnInit(): Promise<void> {
    this.seoService.atualizar({
      title: 'Amorim Arquitetura | Engenharia Diagnóstica e Consultiva em Pernambuco',
      description: 'Excelência técnica para proteger o seu patrimônio. Engenharia condominial e diagnóstica em Pernambuco, unindo o rigor técnico das normas ABNT com a Construção 4.0.',
      canonicalPath: '/amorim-arquitetura',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Amorim Arquitetura — Engenharia Diagnóstica e Consultiva',
        description: 'Excelência técnica para proteger o seu patrimônio. Engenharia condominial e diagnóstica em Pernambuco, unindo o rigor técnico das normas ABNT com a Construção 4.0.',
        url: 'https://emanoelamorim.com/amorim-arquitetura',
        serviceType: 'Engenharia Diagnóstica, Inspeção Predial e Vistoria Cautelar',
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Pernambuco',
        },
        provider: {
          '@type': 'Organization',
          '@id': 'https://emanoelamorim.com/#organization',
          name: 'AmorimTech',
        },
      },
    });

    try {
      const data = await this.supabaseService.listarPortfolioAtivo();
      if (data && data.length > 0) {
        this.gestaoManutencao.set(
          data.map((item: any) => ({
            img: item.imagem_url,
            title: item.titulo,
            year: item.ano || '',
            client: item.cliente || '',
            location: item.local || ''
          }))
        );
      } else {
        this.gestaoManutencao.set([]);
      }
    } catch {
      this.gestaoManutencao.set([]);
    }
  }

  readonly gestaoProjetos: PortfolioProject[] = [
    {
      img: 'https://static.wixstatic.com/media/152459_306189bdcd0d41e583a79b549afcba9c~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/CRC-PE%20-%20VISTA%2001.jpg',
      title: 'Projeto Nova Sede CRC/PE',
      year: '2017',
      client: 'CRC/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_b214383a73d14514ad8901a5cb287041~mv2.png/v1/crop/x_359,y_0,w_583,h_731/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/cor.png',
      title: 'Residencial Parque de Exposições',
      year: '2024',
      client: 'Sertenge Engenharia S/A',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_84fd38ffd69849378852a469c196cf20~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/RFRN.jpg',
      title: 'Nova Sede da Delegacia da Receita Federal',
      year: '2019',
      client: 'Receita Federal (RFRN)',
      location: 'Natal/RN'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_04c2c92f8ef843218671d733881c4b64~mv2.png/v1/crop/x_530,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Largo%20do%20Monte.png',
      title: 'Requalificação Largo do Monte',
      year: '2017',
      client: 'SEPAC Olinda',
      location: 'Olinda/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_0a72b01d9aa9414cae7ab49644a3dcd2~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/parquedasesculturas-1.jpg',
      title: 'Atrativos Turísticos do Recife',
      year: '2015',
      client: 'SETUR/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_bcf3588cf83b4d30afb4dd255a9c3e07~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/DSC00299_JPG.jpg',
      title: 'Capela São João Batista do Brum',
      year: '2017',
      client: 'Exército Brasileiro',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_eba2191949b14057a6b1fc5693f2ab8c~mv2.jpg/v1/crop/x_322,y_0,w_957,h_1200/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/taatro11.jpg',
      title: 'Cine Teatro Quartel do Derby',
      year: '2014',
      client: 'SETUR/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_f4a82f2ec8e84ae19863af18f9c440e8~mv2.jpg/v1/crop/x_290,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/teleferico%20recife06.jpg',
      title: 'Teleférico Parque Dois Irmãos',
      year: '2015',
      client: 'SEMAS/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_19c8ac599d664aeab9bfc55afa4a5639~mv2.jpg/v1/crop/x_665,y_0,w_1977,h_2480/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/FORUM%20justi%C3%A7a%20federal.jpg',
      title: 'Fórum Des. Neves Filho',
      year: '2015',
      client: 'JFPE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_11f480498bd2431b857788391365298c~mv2.jpg/v1/crop/x_157,y_0,w_356,h_446/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/00.jpg',
      title: 'Sinalização Turística do Rio Grande do Norte',
      year: '2014',
      client: 'SETUR',
      location: 'Natal/RN'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_11f480498bd2431b857788391365298c~mv2.jpg/v1/crop/x_157,y_0,w_356,h_446/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/00.jpg',
      title: 'Sinalização Turística de Pernambuco (Cidade da Copa)',
      year: '2013',
      client: 'SETUR/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_e7a542e59257490a8661700ab41915fa~mv2.jpg/v1/crop/x_77,y_0,w_265,h_332/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/blog-engenho_edited.jpg',
      title: 'Restauração Engenho São João',
      year: '2012',
      client: 'SETUR',
      location: 'Itamaracá/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_0aae4ff86b7742ed8de6ff6d201cedfc~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/eufrasio.jpg',
      title: 'Mercado Eufrásio Barbosa',
      year: '2012',
      client: 'SETUR',
      location: 'Olinda/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_1920e747843046e8b52ca5306d85e91d~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/P1010034_JPG.jpg',
      title: 'Restauração Engenho Monjope',
      year: '2011',
      client: 'SETUR',
      location: 'Igarassu/PE'
    }
  ];

  readonly gestaoObras: PortfolioProject[] = [
    {
      img: 'https://i.ibb.co/d0XN61CV/alepe-fachada-frontal-480x600.jpg',
      title: 'Fiscalização das Obras de Restauro no Palácio Joaquim Nabuco (ALEPE)',
      year: '2026',
      client: 'ALEPE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_15e60566f08a4fcf828b0c37630ce2ed~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/sol.jpg',
      title: 'Usina Solar CRC/PE',
      year: '2023',
      client: 'CRC/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_6339ba323283427daa071eb7d16349ab~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2014.jpg',
      title: 'Gerenciamento da Nova Sede do CRC/PE',
      year: '2021',
      client: 'CRC/PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_0dedafe2eeda4698981281984bcf0c99~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Basilica%20do%20Carmo%20_JPG.jpg',
      title: 'Restauração Basílica do Carmo',
      year: '2019',
      client: 'URB Recife',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_c74871c783f44018b3dd0af7f80dd576~mv2.jpg/v1/crop/x_161,y_0,w_373,h_464/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Artesanato%20Itapissuma.jpg',
      title: 'Fiscalização da Reforma do Mercado de Itapissuma',
      year: '2013',
      client: 'SETUR',
      location: 'Itapissuma/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_d1c77d4720b5490db125171c554314ee~mv2.jpg/v1/crop/x_225,y_0,w_511,h_635/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2014.jpg',
      title: 'Fiscalização da Construção do Parque de Gravatá',
      year: '2013',
      client: 'SETUR',
      location: 'Gravatá/PE'
    }
  ];

  readonly servicosDiagnostica: ServiceCard[] = [
    {
      title: 'Laudos Técnicos e Vistorias',
      description: 'Evite riscos e assegure seus direitos com laudos certificados. Elaboramos Laudos de Vistoria Cautelar de Vizinhança, Inspeção Predial e Assistência Técnica Pericial: mais exatos, padronizados e entregues muito mais rápido — com um preço bem mais acessível — graças à tecnologia do nosso software Predial 4.0. Solicite uma cotação sem compromisso.',
      items: [
        'Laudos de Vistoria Predial e Garantia',
        'Reforma (NBR 16280) e Acessibilidade (NBR 9050)',
        'Laudo SPDA e Vizinhança'
      ]
    },
    {
      title: 'Consultoria em Engenharia Diagnóstica',
      description: 'Diagnóstico preciso de falhas construtivas com metodologia técnica.',
      items: [
        'Identificação de patologias prediais',
        'Relatórios completos com fotos e recomendações',
        'Normas IBAPE e ABNT rigorosamente aplicadas'
      ]
    },
    {
      title: 'Avaliação de Imóveis',
      description: 'Estipule o valor real do seu imóvel com precisão e respaldo técnico.',
      items: [
        'Laudos elaborados conforme NBR 14653',
        'Ideal para venda, compra ou disputas judiciais',
        'Avaliadores técnicos certificados'
      ]
    },
    {
      title: 'Regularização e Legalização',
      description: 'Seu imóvel 100% legal com apoio técnico e documental constante.',
      items: [
        'Alvarás, Habite-se e reformas legalizadas',
        'Conformidade com a legislação municipal e federal',
        'Evite multas e paralisações pela prefeitura'
      ]
    }
  ];

  readonly servicosCondominial: ServiceCard[] = [
    {
      title: 'Consultoria em Engenharia Condominial',
      description: 'Planejamento, manutenção e operação inteligente para condomínios.',
      items: [
        'Conformidade legal em todas as esferas',
        'Aumento significativo da vida útil do prédio',
        'Apoio técnico completo à gestão do síndico'
      ]
    },
    {
      title: 'Gestão da Manutenção de Empreendimentos',
      description: 'Elaboração de Plano de Manutenção para atuação preventiva.',
      items: [
        'Previsão de serviços corretivos, preventivos e preditivos',
        'Preservação e valorização patrimonial da edificação',
        'Redução drástica de falhas e custos emergenciais'
      ]
    },
    {
      title: 'Gestão do Funcionamento e Operação',
      description: 'Treinamento e operação técnica especializada para edifícios.',
      items: [
        'Instruções de uso adequado de sistemas e equipamentos',
        'Treinamento e capacitação contínua da equipe local',
        'Plano de operação personalizado conforme NBR 14037'
      ]
    },
    {
      title: 'Gerenciamento e Fiscalização de Obras',
      description: 'Controle total sobre sua obra, do início à entrega das chaves.',
      items: [
        'Redução inteligente de custos e cumprimento de prazos',
        'Padrão de qualidade garantido na execução',
        'Acompanhamento técnico rigoroso e diário'
      ]
    }
  ];

  readonly servicosInovacao: ServiceCard[] = [
    {
      title: 'Digitalização e Reengenharia de Processos',
      description: 'Criamos soluções digitais próprias para a construção civil, automatizando o que hoje ainda é manual.',
      items: [
        'Construção 4.0 aplicada de forma prática no canteiro',
        'Formulários, aprovações e fluxos totalmente automatizados',
        'Aumento de produtividade e redução da burocracia'
      ]
    },
    {
      title: 'Gestão Informatizada da Manutenção',
      description: 'Digitalize sua gestão predial com eficiência e controle total.',
      items: [
        'Implementação de ferramentas digitais e apps customizados',
        'Controle de rotinas e manutenção com base na NBR 5674',
        'Geração de indicadores, relatórios e planejamento automático'
      ]
    },
    {
      title: 'Coordenação de Projetos',
      description: 'Transforme sua ideia em um projeto viável, seguro e executável.',
      items: [
        'Estudos rigorosos de viabilidade técnica e financeira',
        'Planejamento em BIM e gestão técnica de excelência',
        'Coordenação sincronizada de equipes e cronograma físico'
      ]
    }
  ];
}
