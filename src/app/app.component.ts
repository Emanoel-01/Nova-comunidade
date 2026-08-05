import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      <!-- Header Fixo no Topo (Sleek Interface) -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-50">
        <!-- Logo -->
        <div class="text-[20px] font-bold text-slate-900 tracking-tight">
          Comunidade Nova
        </div>

        <!-- Menu de Navegação Horizontal (Desktop) -->
        <nav class="hidden md:flex items-center gap-6">
          @for (item of navItems(); track item; let first = $first) {
            <button
              type="button"
              [class]="item === 'Admin' 
                ? 'bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer' 
                : (first ? 'text-[13px] font-semibold text-slate-900 transition-colors cursor-pointer' : 'text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer')"
            >
              {{ item }}
            </button>
          }
        </nav>

        <!-- Menu Mobile Button -->
        <div class="md:hidden flex items-center">
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Abrir menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              @if (!isMobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              }
            </svg>
          </button>
        </div>
      </header>

      <!-- Menu Mobile Dropdown -->
      @if (isMobileMenuOpen()) {
        <div class="fixed top-16 left-0 right-0 bg-white border-b border-slate-200 z-40 md:hidden py-4 px-6 shadow-md">
          <nav class="flex flex-col space-y-2">
            @for (item of navItems(); track item) {
              <button
                type="button"
                class="text-left py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                @if (item === 'Admin') {
                  <span class="bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold inline-block">
                    Admin
                  </span>
                } @else {
                  {{ item }}
                }
              </button>
            }
          </nav>
        </div>
      }

      <!-- Corpo da Página Principal -->
      <main class="flex-1 flex flex-col items-center justify-center relative p-6">
        <!-- Caixa Central de Construção -->
        <div class="text-center max-w-xl px-4">
          <div class="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4">
            Foundation v1.0.0
          </div>
          <h1 class="text-3xl md:text-4xl font-light text-slate-800 tracking-tight">
            Comunidade Nova — em construção
          </h1>
          <p class="text-slate-400 text-base mt-3 font-normal">
            Arquitetura Angular 20 Signals + Supabase Standalone
          </p>
        </div>

        <!-- Tech Stack Badges (Rodapé Elegante) -->
        <div class="absolute bottom-8 left-6 md:left-10 right-6 md:right-10 flex flex-wrap items-center gap-6 justify-between md:justify-start">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Angular Signals Ready</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span class="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Supabase Auth Active</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span class="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Standalone Components</span>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  // Os 8 itens de menu solicitados
  readonly navItems = signal<string[]>([
    'Home',
    'Amorim Arquitetura',
    'Amorim Tech',
    'Amorim Academy',
    'Blog',
    'Comunidade',
    'Contato',
    'Admin'
  ]);

  readonly isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }
}
