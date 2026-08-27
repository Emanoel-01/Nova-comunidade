import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: 'tech' | 'academic' | 'work' | 'project';
  imageUrl?: string;
}

@Component({
  selector: 'app-trajetoria-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-50 py-12 sm:py-16 px-3 sm:px-4">
      <div class="w-full max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4 sm:gap-6 px-1 sm:px-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              Trajetória & Portfólio
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 font-medium">Deslize para ver o histórico profissional e acadêmico completo.</p>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
            <button (click)="scrollTimeline('left')" class="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" aria-label="Rolar para a esquerda">←</button>
            <button (click)="toggleAutoScroll()" [class]="isAutoScroll() ? 'flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 bg-indigo-600 text-white shadow-md hover:bg-indigo-700' : 'flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 bg-slate-50 text-slate-700 hover:bg-slate-100'">
              {{ isAutoScroll() ? 'Pausar Reprodução' : 'Reprodução Automática' }}
            </button>
            <button (click)="scrollTimeline('right')" class="p-2 sm:p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" aria-label="Rolar para a direita">→</button>
          </div>
        </div>

        <div class="relative px-1 sm:px-4" (mouseenter)="isHovering.set(true)" (mouseleave)="isHovering.set(false)" (touchstart)="isHovering.set(true)" (touchend)="isHovering.set(false)">
          <div class="hidden sm:block absolute top-0 left-0 w-8 sm:w-16 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div class="hidden sm:block absolute top-0 right-0 w-8 sm:w-16 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

          <div #timelineEl class="overflow-x-auto flex gap-4 sm:gap-6 pb-8 sm:pb-12 pt-2 sm:pt-4 scroll-smooth snap-x snap-mandatory" style="scrollbar-width: none; -webkit-overflow-scrolling: touch;">
            @for (item of timeline; track item.title) {
              <div class="flex-shrink-0 w-[270px] sm:w-[320px] max-w-[85vw] h-[400px] sm:h-[440px] rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative group overflow-hidden bg-white snap-center border border-slate-200">
                @if (item.imageUrl) {
                  <div class="absolute top-4 sm:top-5 left-4 sm:left-5 z-20">
                    <div class="bg-white/20 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-white/30 shadow-sm">
                      <span class="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase">{{ item.year }}</span>
                    </div>
                  </div>
                  <div class="absolute inset-0 w-full h-full bg-slate-900 z-0">
                    <img [src]="item.imageUrl" [alt]="item.title" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out">
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-20">
                    <h4 class="font-bold text-base sm:text-lg text-white mb-2 sm:mb-3 leading-snug">{{ item.title }}</h4>
                    <div class="w-8 sm:w-10 h-1 bg-indigo-500 mb-3 sm:mb-4 rounded-full opacity-90"></div>
                    <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-light line-clamp-4 text-justify">{{ item.description }}</p>
                  </div>
                } @else {
                  <div class="w-full h-full flex flex-col p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 relative z-10">
                    <div class="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                      <div [class]="iconBg(item.icon) + ' w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm border'">
                        <span [class]="iconColor(item.icon) + ' text-lg sm:text-xl font-bold'">{{ iconLabel(item.icon) }}</span>
                      </div>
                      <div class="bg-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <span class="text-[11px] sm:text-xs font-black text-slate-700 tracking-widest uppercase">{{ item.year }}</span>
                      </div>
                    </div>
                    <div class="relative z-10 flex-grow">
                      <h4 class="font-bold text-base sm:text-lg text-slate-900 mb-2 sm:mb-3 leading-snug">{{ item.title }}</h4>
                      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">{{ item.description }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class TrajetoriaPortfolioComponent {
  timelineEl = viewChild<ElementRef<HTMLDivElement>>('timelineEl');
  isAutoScroll = signal(false);
  isHovering = signal(false);
  private intervalId?: ReturnType<typeof setInterval>;

  timeline: TimelineItem[] = [
    { year: '2026', title: 'CEO & Arquiteto de Soluções da Amorim TECH', description: 'Liderança técnica e gestão de produto na evolução de soluções SaaS para a construção civil, com foco em arquitetura escalável e integração com Inteligência Artificial.', icon: 'tech', imageUrl: 'https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg' },
    { year: '2025', title: 'Analista de Processos e Arquiteto de Soluções Digitais', description: 'Desenvolvimento (por Vibe Coding) de 09 Protótipos de apps de gestão inteligente das edificações.', icon: 'tech', imageUrl: 'https://i.ibb.co/TDC35Hqf/Emanoel-Silva-de-Amorim.jpg' },
    { year: '2022-2024', title: 'Mestrado em Engenharia Civil', description: 'Gestão da Manutenção de Edificações em Instituições Públicas. UPE - Universidade de Pernambuco. Orientador: Prof. Dr. Alberto Casado Lordsleem Júnior.', icon: 'academic' },
    { year: '2024', title: 'Coordenador Acadêmico e Docente', description: 'Gestão pedagógica e docência em cursos de Pós-Graduação focados em Engenharia, Negócios e Arquitetura na Faculdade Esuda.', icon: 'work', imageUrl: 'https://sintrajufpe.org.br/wp-content/uploads/2025/09/faculdade-de-ciencias-humanas.jpg' },
    { year: '2024', title: 'Residencial Parque de Exposições', description: 'Projeto Arquitetônico. Módulos I a IV. Sertenge Engenharia S/A | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_b214383a73d14514ad8901a5cb287041~mv2.png/v1/crop/x_359,y_0,w_583,h_731/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/cor.png' },
    { year: '2023', title: 'Usina Solar CRC/PE', description: 'Fiscalização da Execução da Usina Solar na Nova Sede. CRC/PE | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_15e60566f08a4fcf828b0c37630ce2ed~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/sol.jpg' },
    { year: '2022', title: 'Gestão Informatizada CRC/PE', description: 'Gestão Informatizada da Manutenção e Operação. CRC/PE | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_701fca8e024b4f95be0f5381041f0c77~mv2.png/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/gi.png' },
    { year: '2021', title: 'Nova Sede do CRC/PE', description: 'Gerenciamento da Construção da Nova Sede. CRC/PE | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_6339ba323283427daa071eb7d16349ab~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2014.jpg' },
    { year: '2019', title: 'Sócio Diretor - Responsável Técnico', description: 'Amorim Arquitetura | Local: Recife/PE', icon: 'work' },
    { year: '2019', title: 'Especialização em Arquitetura e Patrimônio', description: 'Análise das características arquitetônicas da Basílica e Convento de Nossa Senhora do Carmo em Recife/PE. FAVENI.', icon: 'academic' },
    { year: '2019', title: 'Sede da Receita Federal em Natal/RN', description: 'Projeto da Nova Sede da Delegacia da Receita Federal. RFRN | Local: Natal/RN', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_84fd38ffd69849378852a469c196cf20~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/RFRN.jpg' },
    { year: '2019', title: 'Restauração Basílica do Carmo', description: 'Restauração da Basílica do Carmo e Igreja de Santa Tereza. URB Recife | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_0dedafe2eeda4698981281984bcf0c99~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Basilica%20do%20Carmo%20_JPG.jpg' },
    { year: '2017-2019', title: 'MBA em Gerenciamento de Projetos', description: 'Metodologia gerenciamento de projeto de conservação e restauro em bens tombados. Faculdade Esuda.', icon: 'academic' },
    { year: '2016-2018', title: 'MBA em Plataforma BIM', description: 'Modelagem, Planejamento e Orçamento. O Uso do BIM em Projetos de Restauro. UNIP.', icon: 'academic' },
    { year: '2017', title: 'Especialização em Mobilidade Urbana e Trânsito', description: 'Implantação da Sinalização de Orientação Turística em Sítios Históricos. Faveni.', icon: 'academic' },
    { year: '2017', title: 'Capela São João Batista do Brum', description: 'Projeto de Restauração da Capela. CRO 7ª (Exército Brasileiro) | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_bcf3588cf83b4d30afb4dd255a9c3e07~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/DSC00299_JPG.jpg' },
    { year: '2017', title: 'Projeto da Nova Sede do CRC/PE', description: 'Projeto da Nova Sede do Conselho Regional de Contabilidade/PE. CRC/PE | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_306189bdcd0d41e583a79b549afcba9c~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/CRC-PE%20-%20VISTA%2001.jpg' },
    { year: '2017', title: 'Requalificação do Largo do Monte', description: 'Projeto de Requalificação do Largo. SEPAC Olinda | Local: Olinda/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_04c2c92f8ef843218671d733881c4b64~mv2.png/v1/crop/x_530,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Largo%20do%20Monte.png' },
    { year: '2015-2017', title: 'Especialização em Gestão de Projetos e Obras', description: 'Diagnóstico dos Sistemas de Guarda Temporária de Lixo em Edificações Residenciais na Cidade do Recife/PE. Orientação: Profa. Msc. Renata Leça. Faculdade Esuda.', icon: 'academic' },
    { year: '2015', title: 'Atrativos Turísticos do Recife', description: 'Projeto Luminotécnico em Atrativos Turísticos. SETUR | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_0a72b01d9aa9414cae7ab49644a3dcd2~mv2.jpg/v1/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/parquedasesculturas-1.jpg' },
    { year: '2015', title: 'Teleférico e Funicular', description: 'Projeto do Telefêrico e Funicular no Parque Dois Irmãos. SEMAS | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_f4a82f2ec8e84ae19863af18f9c440e8~mv2.jpg/v1/crop/x_290,y_0,w_861,h_1080/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/teleferico%20recife06.jpg' },
    { year: '2015', title: 'Fórum Des. Neves Filho', description: 'Projeto da Nova Sede do Fórum Des. Neves Filho. JFPE | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_19c8ac599d664aeab9bfc55afa4a5639~mv2.jpg/v1/crop/x_665,y_0,w_1977,h_2480/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/FORUM%20justi%C3%A7a%20federal.jpg' },
    { year: '2014', title: 'Gerente de Projetos e Obras (Sócio Cotista)', description: 'Premier Engenharia Ltda | Local: Recife/PE', icon: 'work' },
    { year: '2014', title: 'Sinalização Turística do RN', description: 'Sinalização Turística do Rio Grande do Norte. SETUR | Local: Natal/RN', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_11f480498bd2431b857788391365298c~mv2.jpg/v1/crop/x_157,y_0,w_356,h_446/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/00.jpg' },
    { year: '2014', title: 'Cine Teatro do Quartel do Derby', description: 'Projeto de Restauração do Cine Teatro. SETUR | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_eba2191949b14057a6b1fc5693f2ab8c~mv2.jpg/v1/crop/x_322,y_0,w_957,h_1200/fill/w_480,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/taatro11.jpg' },
    { year: '2013', title: 'Reforma do Mercado de Itapissuma', description: 'Fiscalização da Reforma do Mercado. SETUR | Local: Itapissuma/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_c74871c783f44018b3dd0af7f80dd576~mv2.jpg/v1/crop/x_161,y_0,w_373,h_464/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Artesanato%20Itapissuma.jpg' },
    { year: '2013', title: 'Construção do Parque de Gravatá', description: 'Fiscalização da Construção do Parque. SETUR | Local: Gravatá/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_d1c77d4720b5490db125171c554314ee~mv2.jpg/v1/crop/x_225,y_0,w_511,h_635/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/2014.jpg' },
    { year: '2013', title: 'Sinalização Turística de PE', description: 'Sinalização Turística de Pernambuco: Cidade da Copa. SETUR | Local: Recife/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_11f480498bd2431b857788391365298c~mv2.jpg/v1/crop/x_157,y_0,w_356,h_446/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/00.jpg' },
    { year: '2012', title: 'Restauração do Engenho São João', description: 'Projeto de Restauração. SETUR | Local: Itamaracá/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_e7a542e59257490a8661700ab41915fa~mv2.jpg/v1/crop/x_77,y_0,w_265,h_332/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/blog-engenho_edited.jpg' },
    { year: '2012', title: 'Mercado Eufrásio Barbosa', description: 'Restauração do Mercado. SETUR | Local: Olinda/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_0aae4ff86b7742ed8de6ff6d201cedfc~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/eufrasio.jpg' },
    { year: '2011', title: 'Restauração Engenho Monjope', description: 'Projeto de Restauração do Engenho Monjope. SETUR | Local: Igarassu/PE', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_1920e747843046e8b52ca5306d85e91d~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/P1010034_JPG.jpg' },
    { year: '2011', title: 'Coordenador de Projetos', description: 'Premier Engenharia Ltda | Local: Recife/PE', icon: 'work' },
    { year: '2010-2014', title: 'Graduação em Arquitetura e Urbanismo', description: 'Faculdade Ciências Humanas Esuda. Título: Projeto de Tratamento Acústico da Igreja Batista Jardim Beberibe, em Olinda/PE. Orientação: Profa. Msc. Renata Leça.', icon: 'academic' },
    { year: '2010', title: 'Urbanização de Macapá', description: 'Urbanização da cidade de Macapá. Maia Melo Engenharia | Local: Macapá/AP', icon: 'project', imageUrl: 'https://static.wixstatic.com/media/152459_7dc1c7ab232b4d12a6c130e8970d9646~mv2.jpg/v1/fill/w_300,h_375,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Macap%C3%A1.jpg' },
    { year: '2008-2009', title: 'Projetista Cadista', description: 'Maia Melo Engenharia | Local: Recife/PE', icon: 'work' },
    { year: '2007-2009', title: 'Técnico em Construção Civil', description: 'Formação técnica em Edificações. ETEPAM.', icon: 'academic' }
  ];

  iconBg(icon: string): string {
    switch (icon) {
      case 'tech': return 'bg-indigo-100 border-indigo-200';
      case 'academic': return 'bg-blue-100 border-blue-200';
      case 'work': return 'bg-emerald-100 border-emerald-200';
      case 'project': return 'bg-orange-100 border-orange-200';
      default: return 'bg-slate-100 border-slate-200';
    }
  }
  iconColor(icon: string): string {
    switch (icon) {
      case 'tech': return 'text-indigo-600';
      case 'academic': return 'text-blue-600';
      case 'work': return 'text-emerald-600';
      case 'project': return 'text-orange-600';
      default: return 'text-slate-600';
    }
  }
  iconLabel(icon: string): string {
    switch (icon) {
      case 'tech': return '⚡';
      case 'academic': return '🎓';
      case 'work': return '💼';
      case 'project': return '🏆';
      default: return '•';
    }
  }

  scrollTimeline(direction: 'left' | 'right'): void {
    const el = this.timelineEl()?.nativeElement;
    if (el) el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  }

  toggleAutoScroll(): void {
    this.isAutoScroll.update(v => !v);
    if (this.isAutoScroll()) {
      this.intervalId = setInterval(() => {
        if (this.isHovering()) return;
        const el = this.timelineEl()?.nativeElement;
        if (!el) return;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollLeft += 2;
        }
      }, 20);
    } else if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
