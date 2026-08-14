import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div class="max-w-xl px-4">
        <div class="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4">
          Em Breve
        </div>
        <h1 class="text-3xl md:text-4xl font-light text-slate-800 tracking-tight mb-3">
          {{ title() }}
        </h1>
        <p class="text-slate-500 text-base mb-6 font-normal">
          Esta página está em construção.
        </p>
        <a
          routerLink="/"
          class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          ← Voltar para a Home
        </a>
      </div>
    </section>
  `
})
export class PlaceholderPageComponent {
  readonly title = input<string>('Página');
}
