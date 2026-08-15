import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-links-bio',
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen w-full relative bg-cover bg-center bg-fixed"
      style="background-image: url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2070&auto=format&fit=crop');"
    >
      <!-- Overlay translúcido com leve desfoque -->
      <div class="min-h-screen w-full bg-[#f7f5f2]/85 backdrop-blur-sm py-10 px-4 sm:px-6 flex flex-col items-center justify-between">
        
        <div class="w-full max-w-md space-y-6">

          <!-- Cabeçalho -->
          <div class="text-center space-y-3 pt-2">
            <!-- Foto de perfil circular com fallback -->
            <div class="relative w-28 h-28 mx-auto rounded-full p-1 bg-white shadow-lg ring-2 ring-[#8c6b5d]/30">
              <img
                [src]="avatarUrl()"
                (error)="onAvatarError()"
                alt="Emanoel Amorim"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover rounded-full"
              />
            </div>

            <div class="space-y-1">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">
                Emanoel Amorim
              </h1>
              <p class="text-xs sm:text-sm font-semibold text-[#8c6b5d]">
                Arquiteto, Founder da AmorimTech e Coordenador Acadêmico.
              </p>
            </div>

            <p class="text-xs text-slate-600 italic font-medium leading-relaxed px-2">
              "Transformando o setor da construção civil através de três pilares: desenvolvimento de ecossistemas tecnológicos, formação de novos especialistas e consultoria técnica especializada."
            </p>
          </div>

          <!-- Estatísticas (Card Branco Grid 2x2) -->
          <div class="bg-white/95 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 grid grid-cols-2 gap-3 text-center">
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#8c6b5d]">+15 anos</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">de experiência e atuação na construção civil</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#3b4b6b]">+100</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">projetos e laudos executados</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#e87722]">+200.000m²</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">de empreendimentos gerenciados</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#4a8251]">+70</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">produções científicas</span>
            </div>
          </div>

          <!-- Texto de transição -->
          <div class="text-center pt-2">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">
              Escolha abaixo como posso te ajudar hoje:
            </span>
          </div>

          <!-- Lista de Botões de Link -->
          <div class="space-y-3.5">
            
            <!-- 1. Amorim Arquitetura -->
            <a
              routerLink="/amorim-arquitetura"
              id="link-amorim-arquitetura"
              class="group flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-[#3b4b6b] transition-all duration-200 active:scale-[0.99]"
            >
              <div class="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 p-1 border border-slate-200">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/de9772ab4_AmorimArquitetura.JPG"
                  alt="Amorim Arquitetura"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-contain"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#3b4b6b] transition-colors leading-tight">
                  Amorim Arquitetura
                </h3>
                <p class="text-xs text-slate-500 leading-snug mt-0.5">
                  Consultoria e gestão estratégica para proteger o seu patrimônio
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#3b4b6b] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- 2. Amorim Tech -->
            <a
              routerLink="/amorim-tech"
              id="link-amorim-tech"
              class="group flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-[#e87722] transition-all duration-200 active:scale-[0.99]"
            >
              <div class="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 p-1 border border-slate-200">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/8e18562d8_AmorimTech.PNG"
                  alt="Amorim Tech"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-contain"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#e87722] transition-colors leading-tight">
                  Amorim Tech
                </h3>
                <p class="text-xs text-slate-500 leading-snug mt-0.5">
                  Predial 4.0 — copiloto técnico para vistorias e laudos
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#e87722] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- 3. Amorim Academy -->
            <a
              routerLink="/amorim-academy"
              id="link-amorim-academy"
              class="group flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-[#4a8251] transition-all duration-200 active:scale-[0.99]"
            >
              <div class="w-12 h-12 rounded-xl bg-[#4a8251]/10 text-[#4a8251] flex items-center justify-center shrink-0 border border-[#4a8251]/20 font-black text-xs text-center leading-none p-1">
                Amorim<br/>Academy
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#4a8251] transition-colors leading-tight">
                  Amorim Academy
                </h3>
                <p class="text-xs text-slate-500 leading-snug mt-0.5">
                  Curso, incubadora e mentoria técnica.
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#4a8251] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- Linha divisória fina -->
            <div class="my-4 border-t border-slate-300/80"></div>

            <!-- 5. Comunidade Business 4.0 -->
            <a
              routerLink="/comunidade"
              id="link-comunidade"
              class="group flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-200 active:scale-[0.99]"
            >
              <div class="w-12 h-12 rounded-xl bg-[#3b4b6b] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#3b4b6b] transition-colors leading-tight">
                  Comunidade Business 4.0
                </h3>
                <p class="text-xs text-slate-500 leading-snug mt-0.5">
                  O ponto de encontro entre quem resolve e quem contrata na Construção Civil.
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#3b4b6b] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- 6. Blog Mundo 4.0 -->
            <a
              routerLink="/blog"
              id="link-blog"
              class="group flex items-center gap-3.5 p-3.5 bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-200 active:scale-[0.99]"
            >
              <div class="w-12 h-12 rounded-xl bg-[#e87722] text-white flex items-center justify-center shrink-0 shadow-sm">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#e87722] transition-colors leading-tight">
                  Blog Mundo 4.0
                </h3>
                <p class="text-xs text-slate-500 leading-snug mt-0.5">
                  Conteúdo aprofundado e prático sobre Construção 4.0, Gestão e Tecnologia.
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#e87722] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- 7. Falar direto no WhatsApp (externo) -->
            <a
              href="https://wa.me/5581991298803"
              target="_blank"
              rel="noopener noreferrer"
              id="link-whatsapp"
              class="flex items-center justify-center gap-2.5 p-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
              </svg>
              <span>Falar direto no WhatsApp</span>
            </a>

            <!-- 8. Acessar meu Site Completo (Home) -->
            <a
              routerLink="/"
              id="link-site-completo"
              class="flex items-center justify-center gap-2.5 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Acessar meu Site Completo</span>
            </a>

          </div>

          <!-- Rodapé -->
          <div class="pt-4 pb-2 text-center">
            <div class="inline-block px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-xs">
              <p class="text-[11px] text-slate-500 font-medium">
                © 2026 Emanoel Amorim. Todos os direitos reservados.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LinksBioComponent {
  readonly avatarUrl = signal(
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b4f78756902b494e56bda9/82107f70e_EmanoelAmorim.jpg'
  );

  onAvatarError(): void {
    this.avatarUrl.set(
      'https://ui-avatars.com/api/?name=Emanoel+Amorim&background=8c6b5d&color=fff&size=128'
    );
  }
}
