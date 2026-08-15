import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallFamaComponent } from './hall-fama.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, HallFamaComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      
      <!-- Cabeçalho do Blog -->
      <section class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 py-10 lg:py-14 space-y-8">
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Artigos e Insights
              </div>
              <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Blog Mundo 4.0
              </h1>
              <p class="text-sm sm:text-base text-slate-600 max-w-2xl">
                Conteúdo aprofundado sobre Construção 4.0, Gestão e Tecnologia.
              </p>
            </div>

            <!-- Campo de Busca -->
            <div class="w-full md:w-80">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="busca-blog"
                  [value]="termoBusca()"
                  (input)="onBuscaInput($event)"
                  placeholder="Buscar artigos..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Banner de Newsletter -->
          <div class="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-indigo-900/50">
            @if (!inscricaoConfirmada()) {
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div class="lg:col-span-6 space-y-2">
                  <div class="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>NEWSLETTER</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Receba os melhores conteúdos
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Resumos semanais sobre Construção 4.0, Gestão e Tecnologia direto no seu e-mail.
                  </p>
                </div>

                <div class="lg:col-span-6">
                  <form (submit)="inscreverNewsletter($event)" class="flex flex-col sm:flex-row gap-2.5" id="form-newsletter-blog">
                    <input
                      type="text"
                      [value]="nomeNewsletter()"
                      (input)="onNomeNewsletterInput($event)"
                      placeholder="Seu nome"
                      class="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:flex-1"
                    />
                    <input
                      type="email"
                      [value]="emailNewsletter()"
                      (input)="onEmailNewsletterInput($event)"
                      placeholder="seu@email.com"
                      required
                      class="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:flex-1"
                    />
                    <button
                      type="submit"
                      id="btn-inscrever-newsletter"
                      class="py-2.5 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.99]"
                    >
                      Inscrever-se
                    </button>
                  </form>
                </div>
              </div>
            } @else {
              <!-- Estado de Sucesso da Newsletter -->
              <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left py-2">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="space-y-0.5">
                  <h3 class="text-lg font-bold text-white">
                    Inscrição confirmada! 🎉
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-300">
                    Você receberá os próximos resumos do Blog Mundo 4.0 no seu e-mail.
                  </p>
                </div>
              </div>
            }
          </div>

        </div>
      </section>

      <!-- Corpo Principal (Categorias + Lista de Artigos + Sidebar Hall da Fama) -->
      <section class="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Coluna Principal (Posts & Categorias) -->
          <div class="lg:col-span-8 space-y-6">
            
            <!-- Filtro de Categorias Horizontal com rolagem -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              @for (categoria of categorias; track categoria) {
                <button
                  type="button"
                  (click)="selecionarCategoria(categoria)"
                  [class]="categoriaAtiva() === categoria
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 font-medium'"
                  class="px-4 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer"
                >
                  {{ categoria }}
                </button>
              }
            </div>

            <!-- Lista de Artigos: Estado Vazio -->
            <div class="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center space-y-4 shadow-xs">
              <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg class="w-8 h-8 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="text-lg sm:text-xl font-bold text-slate-500">
                  Nenhum artigo encontrado.
                </h3>
                <p class="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  Novos artigos técnicos e publicações serão disponibilizados em breve.
                </p>
              </div>
            </div>

          </div>

          <!-- Coluna Lateral (Hall da Fama) -->
          <div class="lg:col-span-4 space-y-6">
            <app-hall-fama></app-hall-fama>
          </div>

        </div>
      </section>

    </div>
  `
})
export class BlogComponent {
  readonly termoBusca = signal('');
  readonly nomeNewsletter = signal('');
  readonly emailNewsletter = signal('');
  readonly inscricaoConfirmada = signal(false);

  readonly categorias: string[] = [
    'Todos',
    'Gestão 4.0',
    'Manutenção Predial',
    'Tecnologia BIM',
    'Engenharia Legal',
    'Carreira'
  ];

  readonly categoriaAtiva = signal('Todos');

  // Placeholder para os posts reais do Supabase (será conectado no bloco futuro com a tabela blog_posts)
  readonly posts = signal<any[]>([]);

  onBuscaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.termoBusca.set(target.value);
  }

  onNomeNewsletterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nomeNewsletter.set(target.value);
  }

  onEmailNewsletterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailNewsletter.set(target.value);
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaAtiva.set(categoria);
  }

  inscreverNewsletter(event: Event): void {
    event.preventDefault();
    if (!this.emailNewsletter().trim()) {
      return;
    }
    this.inscricaoConfirmada.set(true);
  }
}
