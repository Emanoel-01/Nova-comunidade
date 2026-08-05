import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Depoimento {
  name: string;
  role: string;
  img: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white py-12 px-4 sm:px-6 lg:px-8">
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
  depoimentos: Depoimento[] = [
    { name: 'Amanda Aires Vieira', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1VN4tH_kxzjI7mSu9tnMfs6ivzPyMwyNL' },
    { name: 'Jose Goncalves Campos Filho', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1ZmWee2WCuNpwTx9J9mLjzBo-1QsF7bW-' },
    { name: 'Clodomir Barros', role: 'Depoimento Institucional', img: 'https://drive.google.com/uc?export=view&id=1KmCvUpdQL8DzCEnhi9I8mDokerAS8yrT' },
  ];
}
