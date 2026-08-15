import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <!-- Grid Principal de 4 Colunas -->
      <div class="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          <!-- Coluna 1: Institucional -->
          <div class="space-y-4">
            <h3 class="text-xl font-black text-white tracking-tight">
              Emanoel Amorim
            </h3>
            <p class="text-xs text-slate-400 font-medium leading-relaxed">
              Amorim - Serviços de Engenharia LTDA
            </p>
          </div>

          <!-- Coluna 2: Pilares -->
          <div class="space-y-3">
            <h4 class="text-xs uppercase tracking-wider font-bold text-slate-200">
              Pilares
            </h4>
            <ul class="space-y-2.5 text-xs">
              <li>
                <a
                  routerLink="/amorim-arquitetura"
                  class="hover:text-white transition-colors"
                >
                  Amorim Arquitetura
                </a>
              </li>
              <li>
                <a
                  routerLink="/amorim-tech"
                  class="hover:text-white transition-colors"
                >
                  Amorim Tech
                </a>
              </li>
              <li>
                <a
                  routerLink="/amorim-academy"
                  class="hover:text-white transition-colors"
                >
                  Amorim Academy
                </a>
              </li>
              <li>
                <a
                  href="https://predial40-app.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Acessar o App Predial 4.0</span>
                  <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  routerLink="/comunidade"
                  class="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Acesso Restrito (Comunidade)</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Coluna 3: Contato Oficial -->
          <div class="space-y-3">
            <h4 class="text-xs uppercase tracking-wider font-bold text-slate-200">
              Contato Oficial
            </h4>
            <div class="space-y-3 text-xs">
              <div>
                <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Apenas WhatsApp</span>
                <a
                  href="https://wa.me/5581991298803"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-slate-300 hover:text-emerald-400 font-semibold transition-colors inline-block mt-0.5"
                >
                  (81) 99129-8803
                </a>
              </div>

              <div>
                <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Apenas Ligações</span>
                <a
                  href="tel:5581999284160"
                  class="text-slate-300 hover:text-white font-semibold transition-colors inline-block mt-0.5"
                >
                  (81) 99928-4160
                </a>
              </div>

              <div>
                <span class="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">E-mail</span>
                <a
                  href="mailto:emanoel.s.amorim@gmail.com"
                  class="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 mt-0.5"
                >
                  <span>Enviar e-mail</span>
                  <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Coluna 4: Redes e IDs Científicos -->
          <div class="space-y-4">
            <h4 class="text-xs uppercase tracking-wider font-bold text-slate-200">
              Redes e IDs Científicos
            </h4>
            
            <!-- Ícones circulares pequenos lado a lado -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Instagram -->
              <a
                href="https://www.instagram.com/oemanoelamorim/"
                target="_blank"
                rel="noreferrer"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                title="Instagram"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <!-- LinkedIn -->
              <a
                href="http://linkedin.com/in/emanoel-amorim-43025b65"
                target="_blank"
                rel="noreferrer"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                title="LinkedIn"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              <!-- YouTube -->
              <a
                href="https://www.youtube.com/@emaamo"
                target="_blank"
                rel="noreferrer"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                title="YouTube"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <!-- ResearchGate (RG) -->
              <a
                href="https://www.researchgate.net/profile/Emanoel-Amorim"
                target="_blank"
                rel="noreferrer"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs text-xs font-black"
                title="ResearchGate"
              >
                RG
              </a>

              <!-- Lattes -->
              <a
                href="http://lattes.cnpq.br/8865037855941412"
                target="_blank"
                rel="noreferrer"
                class="px-2 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs text-[11px] font-bold"
                title="Currículo Lattes"
              >
                Lattes
              </a>
            </div>

            <!-- Botão WhatsApp -->
            <div>
              <a
                href="https://wa.me/5581991298803"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- Linha Final (Rodapé Inferior) -->
      <div class="border-t border-slate-800/80 bg-slate-950/60">
        <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center md:text-left">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Rua Leonardo Bezerra Cavalcante, 672 - Recife/PE</span>
          </div>
          <div>
            © 2026 Emanoel Amorim. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {}
