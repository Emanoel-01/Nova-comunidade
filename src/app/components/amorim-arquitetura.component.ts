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
    <div class="space-y-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        @for (card of services(); track card.title) {
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div class="space-y-3">
              <h4 class="text-xl font-bold text-slate-900 tracking-tight">
                {{ card.title }}
              </h4>
              <p class="text-slate-600 text-sm leading-relaxed">
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
          class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-sm sm:text-base"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
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
    <div class="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-20">
      <div class="max-w-7xl mx-auto space-y-20">
        <!-- Seção 1: Hero -->
        <section class="relative bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl py-16 sm:py-24 px-6 sm:px-12 lg:px-16 border border-slate-800">
          <div
            class="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop');"
          ></div>

          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-400/30 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <span>🏢</span>
              <span>Especialistas em Engenharia Consultiva</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Excelência técnica para proteger o seu patrimônio.
            </h1>

            <p class="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              A Amorim Arquitetura é pioneira em Engenharia Condominial e Diagnóstica em Pernambuco. Unimos o rigor técnico das normas da ABNT com a inovação da Construção 4.0 para garantir a conformidade legal e otimizar os custos do seu empreendimento.
            </p>
          </div>
        </section>

        <!-- Seção 2: Portfólio -->
        <section class="space-y-10">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Portfólio
            </h2>
            <p class="text-slate-600 text-base sm:text-lg">
              Mais de 15 anos de serviços executados para órgãos públicos, instituições e empreendimentos privados em Pernambuco e no Brasil.
            </p>
          </div>

          <!-- Grid de 3 Colunas com Carrosséis -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Coluna 1: Gestão de Projetos -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div class="space-y-2">
                <h3 class="text-xl font-bold text-slate-900">
                  Gestão de Projetos
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[40px]">
                  Coordenação técnica completa de projetos arquitetônicos e de engenharia, do conceito à entrega.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoProjetos"></app-portfolio-carousel>
            </div>

            <!-- Coluna 2: Gestão e Fiscalização de Obras -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div class="space-y-2">
                <h3 class="text-xl font-bold text-slate-900">
                  Gestão e Fiscalização de Obras
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[40px]">
                  Acompanhamento técnico rigoroso garantindo qualidade, prazo e custo nas obras.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoObras"></app-portfolio-carousel>
            </div>

            <!-- Coluna 3: Gestão da Manutenção -->
            <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div class="space-y-2">
                <h3 class="text-xl font-bold text-slate-900">
                  Gestão da Manutenção
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed min-h-[40px]">
                  Planejamento e controle da manutenção predial para preservar e valorizar patrimônios.
                </p>
              </div>

              <app-portfolio-carousel [projects]="gestaoManutencao()"></app-portfolio-carousel>
            </div>
          </div>
        </section>

        <!-- Seção 3: Engenharia Diagnóstica e Legal -->
        <section class="space-y-10 pt-4">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Engenharia Diagnóstica e Legal
            </h2>
            <p class="text-slate-600 text-base sm:text-lg">
              Diagnósticos precisos e laudos técnicos para garantir segurança jurídica e estrutural.
            </p>
          </div>

          <app-service-grid
            [services]="servicosDiagnostica"
            buttonText="Solicitar Proposta"
          ></app-service-grid>
        </section>

        <!-- Seção 4: Gestão Condominial e Operação -->
        <section class="space-y-10 pt-4">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Gestão Condominial e Operação
            </h2>
            <p class="text-slate-600 text-base sm:text-lg">
              Ferramentas e processos para aumentar a vida útil e reduzir custos emergenciais do seu prédio.
            </p>
          </div>

          <app-service-grid
            [services]="servicosCondominial"
            buttonText="Agendar Consultoria"
          ></app-service-grid>
        </section>

        <!-- Seção 5: Projetos e Inovação 4.0 -->
        <section class="space-y-10 pt-4">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Projetos e Inovação 4.0
            </h2>
            <p class="text-slate-600 text-base sm:text-lg">
              A união da arquitetura moderna com as soluções tecnológicas do amanhã.
            </p>
          </div>

          <app-service-grid
            [services]="servicosInovacao"
            buttonText="Falar com um Especialista"
          ></app-service-grid>
        </section>

        <!-- Seção 6: CTA Final -->
        <section class="pt-6">
          <div class="bg-blue-50 border border-blue-100 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm">
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Mais de 100 projetos e laudos executados com sucesso
            </h3>
            <p class="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              A Amorim Arquitetura é a escolha de grandes instituições públicas, privadas e condomínios que não abrem mão de segurança, rigor normativo e tecnologia de ponta.
            </p>
            <div class="flex justify-center">
              <a
                routerLink="/"
                fragment="clientes"
                class="inline-flex items-center justify-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-sm sm:text-base"
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
      client: 'Privado',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_84fd38ffd69849378852a469c196cf20~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/RFRN.jpg',
      title: 'Nova Sede da Delegacia da Receita Federal',
      year: '2019',
      client: 'Receita Federal',
      location: 'Natal/RN'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_04c2c92f8ef843218671d733881c4b64~mv2.png/v1/crop/x_530,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Largo%20do%20Monte.png',
      title: 'Requalificação Largo do Monte',
      year: '2017',
      client: 'Prefeitura do Recife',
      location: 'Recife/PE'
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
      client: 'Governo PE',
      location: 'Recife/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_f4a82f2ec8e84ae19863af18f9c440e8~mv2.jpg/v1/crop/x_290,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/teleferico%20recife06.jpg',
      title: 'Teleférico Parque Dois Irmãos',
      year: '2015',
      client: 'SETUR/PE',
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
      img: 'https://static.wixstatic.com/media/152459_e7a542e59257490a8661700ab41915fa~mv2.jpg/v1/crop/x_77,y_0,w_265,h_332/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/blog-engenho_edited.jpg',
      title: 'Restauração Engenho São João',
      year: '2012',
      client: 'IPHAN',
      location: 'Pernambuco'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_1920e747843046e8b52ca5306d85e91d~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/P1010034_JPG.jpg',
      title: 'Restauração Engenho Monjope',
      year: '2011',
      client: 'IPHAN',
      location: 'Pernambuco'
    }
  ];

  readonly gestaoObras: PortfolioProject[] = [
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
      client: 'FUNDARPE',
      location: 'Olinda/PE'
    },
    {
      img: 'https://static.wixstatic.com/media/152459_15e60566f08a4fcf828b0c37630ce2ed~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/sol.jpg',
      title: 'Usina Solar CRC/PE',
      year: '2023',
      client: 'CRC/PE',
      location: 'Recife/PE'
    },
    {
      img: '',
      title: 'Fiscalização das Obras de Restauro no Palácio Joaquim Nabuco (ALEPE)',
      year: '2026',
      client: 'ALEPE',
      location: 'Recife/PE'
    }
  ];

  readonly servicosDiagnostica: ServiceCard[] = [
    {
      title: 'Laudos Técnicos e Vistorias',
      description: 'Evite riscos e assegure seus direitos com laudos certificados.',
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
      title: 'Inovação e Digitalização (Construção 4.0)',
      description: 'Automatize, otimize e digitalize seus processos construtivos.',
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
    },
    {
      title: 'Arquitetura Sensorial e Energética',
      description: 'Melhore o fluxo de ambientes com arquitetura terapêutica.',
      items: [
        'Diagnóstico energético completo dos espaços e fluxos',
        'Recomendações estratégicas de layout, luz e decoração',
        'Foco na valorização do bem-estar, produtividade e harmonia'
      ]
    }
  ];
}
