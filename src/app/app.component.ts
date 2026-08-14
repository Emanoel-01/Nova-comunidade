import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans select-none">
      <!-- Header Fixo no Topo (Sleek Interface) -->
      <header class="sticky top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-50">
        <!-- Logo -->
        <a routerLink="/" class="text-[20px] font-bold text-slate-900 tracking-tight cursor-pointer">
          Comunidade Nova
        </a>

        <!-- Menu de Navegação Horizontal (Desktop) -->
        <nav class="hidden md:flex items-center gap-6">
          @for (item of navItems(); track item.path) {
            @if (item.label === 'Admin') {
              <a
                [routerLink]="item.path"
                routerLinkActive="ring-2 ring-slate-400"
                [routerLinkActiveOptions]="{exact: true}"
                class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer inline-block"
              >
                {{ item.label }}
              </a>
            } @else {
              <a
                [routerLink]="item.path"
                routerLinkActive="!font-semibold !text-slate-900"
                [routerLinkActiveOptions]="{exact: true}"
                class="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {{ item.label }}
              </a>
            }
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
            @for (item of navItems(); track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="!font-semibold !text-slate-900"
                [routerLinkActiveOptions]="{exact: true}"
                (click)="closeMobileMenu()"
                class="text-left py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer block"
              >
                @if (item.label === 'Admin') {
                  <span class="bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold inline-block">
                    Admin
                  </span>
                } @else {
                  {{ item.label }}
                }
              </a>
            }
          </nav>
        </div>
      }

      <!-- Corpo da Página Principal -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  // Os 8 itens de menu mapeados com rota
  readonly navItems = signal<NavItem[]>([
    { label: 'Home', path: '/' },
    { label: 'Amorim Arquitetura', path: '/amorim-arquitetura' },
    { label: 'Amorim Tech', path: '/amorim-tech' },
    { label: 'Amorim Academy', path: '/amorim-academy' },
    { label: 'Blog', path: '/blog' },
    { label: 'Comunidade', path: '/comunidade' },
    { label: 'Contato', path: '/contato' },
    { label: 'Admin', path: '/admin' }
  ]);

  readonly isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}

