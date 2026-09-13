import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-links-bio',
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen w-full relative bg-gradient-to-b from-[#132A41] via-[#1B3550] to-[#132A41]"
    >
      <!-- Overlay translúcido com leve desfoque -->
      <div class="min-h-screen w-full bg-[#FBF8F2]/94 backdrop-blur-sm py-10 px-4 sm:px-6 flex flex-col items-center justify-between">
        
        <div class="w-full max-w-md space-y-6">

          <!-- Cabeçalho -->
          <div class="text-center space-y-3 pt-2">
            <!-- Foto de perfil circular com fallback -->
            <div class="relative w-28 h-28 mx-auto rounded-full p-1 bg-white shadow-lg ring-2 ring-[#B5642A]/30">
              <img
                [src]="avatarUrl()"
                (error)="onAvatarError()"
                alt="Emanoel Amorim"
                class="w-full h-full object-cover rounded-full"
              />
            </div>

            <div class="space-y-1">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">
                Emanoel Amorim
              </h1>
              <p class="text-xs sm:text-sm font-semibold text-[#B5642A]">
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
              <span class="text-lg font-black text-[#B5642A]">+15 anos</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">de experiência e atuação na construção civil</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#132A41]">+100</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">projetos e laudos executados</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#B5642A]">+200.000m²</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">de empreendimentos gerenciados</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
              <span class="text-lg font-black text-[#132A41]">+70</span>
              <span class="text-[11px] text-slate-500 leading-tight mt-0.5">produções científicas</span>
            </div>
          </div>

          <!-- Texto de transição -->
          <div class="text-center pt-2">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">
              Escolha abaixo como posso te ajudar hoje:
            </span>
          </div>

          <!-- 2.4 Cards de Produto -->
          <div class="space-y-4">
            
            <!-- CARD 1 — Predial 4.0 -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <span class="inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#132A41]/10 text-[#132A41]">
                    PLATAFORMA
                  </span>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Predial 4.0
                  </h2>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#132A41]/10 text-[#132A41] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 leading-snug">
                Software de inspeção predial conforme a ABNT NBR 16747:2020.
              </p>

              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Vistoria em campo sem depender de conexão</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Laudo estruturado pronto para assinatura</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Diagnóstico assistido com revisão do profissional</span>
                </li>
              </ul>

              <div class="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://app-predial.emanoelamorim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all"
                >
                  Conhecer a plataforma
                </a>
                <a
                  routerLink="/amorim-tech"
                  class="text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
                >
                  Ver detalhes
                </a>
              </div>
            </div>

            <!-- CARD 2 — Amorim Academy -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <span class="inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#B5642A]/10 text-[#B5642A]">
                    FORMAÇÃO
                  </span>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Amorim Academy
                  </h2>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#B5642A]/10 text-[#B5642A] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 leading-snug">
                Certificações e cursos em engenharia diagnóstica e construção 4.0.
              </p>

              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Certificação por módulo técnico</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Cursos livres e imersões</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Material e modelos aplicáveis no dia seguinte</span>
                </li>
              </ul>

              <div class="pt-1">
                <a
                  routerLink="/amorim-academy"
                  class="block w-full text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all"
                >
                  Ver cursos
                </a>
              </div>
            </div>

            <!-- CARD 3 — Amorim Arquitetura -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <span class="inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#132A41]/10 text-[#132A41]">
                    CONSULTORIA
                  </span>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Amorim Arquitetura
                  </h2>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#132A41]/10 text-[#132A41] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 leading-snug">
                Laudos, vistorias, fiscalização de obra e gestão da manutenção.
              </p>

              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Inspeção predial e vistoria cautelar</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Fiscalização e supervisão técnica</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Gestão da manutenção de empreendimentos</span>
                </li>
              </ul>

              <div class="pt-1">
                <a
                  routerLink="/amorim-arquitetura"
                  class="block w-full text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all"
                >
                  Falar sobre um projeto
                </a>
              </div>
            </div>

            <!-- CARD 4 — Comunidade Business 4.0 -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <span class="inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#B5642A]/10 text-[#B5642A]">
                    REDE
                  </span>
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Comunidade Business 4.0
                  </h2>
                </div>
                <div class="w-10 h-10 rounded-xl bg-[#B5642A]/10 text-[#B5642A] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 leading-snug">
                Rede de profissionais de engenharia diagnóstica.
              </p>

              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Fórum técnico e eventos</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Materiais e oportunidades</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Contato direto entre profissionais</span>
                </li>
              </ul>

              <div class="pt-1">
                <a
                  routerLink="/comunidade"
                  class="block w-full text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all"
                >
                  Entrar na comunidade
                </a>
              </div>
            </div>

          </div>

          <!-- 2.5 Formulário de Captura de Lead -->
          <div class="bg-[#132A41] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#1B3550] space-y-4">
            <div class="space-y-1">
              <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">
                Quer saber mais? Deixe seu contato.
              </h2>
              <p class="text-xs text-slate-300">
                Retorno direto, sem robô e sem lista de disparo.
              </p>
            </div>

            <!-- Feedback de Sucesso -->
            @if (sucesso()) {
              <div class="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Recebido. Retorno em até um dia útil.</span>
              </div>
            }

            <!-- Feedback de Erro -->
            @if (erro()) {
              <div class="p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 text-rose-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Não foi possível enviar agora. Tente pelo WhatsApp abaixo.</span>
              </div>
            }

            <!-- Feedback de Validação -->
            @if (erroValidacao()) {
              <div class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                {{ erroValidacao() }}
              </div>
            }

            <form (submit)="enviarLead($event)" class="space-y-3">
              <!-- Nome -->
              <div>
                <label for="lead-nome" class="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  Nome <span class="text-[#B5642A]">*</span>
                </label>
                <input
                  id="lead-nome"
                  type="text"
                  [value]="nome()"
                  (input)="onNomeInput($event)"
                  placeholder="Seu nome completo"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-600/70 bg-[#1B3550] text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A] focus:border-transparent transition-colors"
                />
              </div>

              <!-- E-mail -->
              <div>
                <label for="lead-email" class="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  E-mail <span class="text-[#B5642A]">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  [value]="email()"
                  (input)="onEmailInput($event)"
                  placeholder="exemplo@email.com"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-600/70 bg-[#1B3550] text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A] focus:border-transparent transition-colors"
                />
              </div>

              <!-- WhatsApp -->
              <div>
                <label for="lead-whatsapp" class="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  WhatsApp <span class="text-slate-400 text-[10px] font-normal lowercase">(opcional)</span>
                </label>
                <input
                  id="lead-whatsapp"
                  type="tel"
                  [value]="whatsapp()"
                  (input)="onWhatsappInput($event)"
                  placeholder="(00) 00000-0000"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-600/70 bg-[#1B3550] text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A] focus:border-transparent transition-colors"
                />
              </div>

              <!-- Interesse -->
              <div>
                <label for="lead-interesse" class="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  Interesse <span class="text-[#B5642A]">*</span>
                </label>
                <select
                  id="lead-interesse"
                  [value]="interesse()"
                  (change)="onInteresseChange($event)"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-600/70 bg-[#1B3550] text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A] focus:border-transparent transition-colors"
                >
                  <option value="predial-4-0">A plataforma Predial 4.0</option>
                  <option value="academy-cursos">Cursos e certificações</option>
                  <option value="consultoria-arquitetura">Consultoria e laudos técnicos</option>
                  <option value="comunidade">A comunidade profissional</option>
                  <option value="outro">Outro assunto</option>
                </select>
              </div>

              <!-- Mensagem -->
              <div>
                <label for="lead-mensagem" class="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                  Mensagem <span class="text-slate-400 text-[10px] font-normal lowercase">(opcional)</span>
                </label>
                <textarea
                  id="lead-mensagem"
                  rows="3"
                  maxlength="1000"
                  [value]="mensagem()"
                  (input)="onMensagemInput($event)"
                  placeholder="Como posso te ajudar?"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-600/70 bg-[#1B3550] text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B5642A] focus:border-transparent transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Botão de envio -->
              <button
                type="submit"
                id="btn-enviar-lead"
                [disabled]="enviando()"
                class="w-full py-3 px-4 rounded-xl bg-[#B5642A] hover:bg-[#a05522] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                @if (enviando()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Enviando...</span>
                } @else {
                  <span>Enviar contato</span>
                }
              </button>
            </form>

            <p class="text-[11px] text-slate-300 text-center leading-relaxed pt-1">
              Seus dados são usados apenas para este contato. Não compartilhamos com terceiros.
              <a routerLink="/termos" class="underline hover:text-white transition-colors ml-0.5">Termos</a>.
            </p>
          </div>

          <!-- 2.6 Links Finais -->
          <div class="space-y-2.5 pt-1">
            
            <!-- Currículo profissional (estático /cv) -->
            <a
              href="/cv"
              id="link-curriculo"
              class="flex items-center justify-between p-3.5 bg-white/95 rounded-2xl shadow-xs hover:shadow-md border border-slate-200/80 hover:border-[#B5642A]/40 transition-all duration-200 text-slate-800 text-xs sm:text-sm font-semibold group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#132A41]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Currículo profissional</span>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#B5642A] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- Blog -->
            <a
              routerLink="/blog"
              id="link-blog"
              class="flex items-center justify-between p-3.5 bg-white/95 rounded-2xl shadow-xs hover:shadow-md border border-slate-200/80 hover:border-[#B5642A]/40 transition-all duration-200 text-slate-800 text-xs sm:text-sm font-semibold group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#132A41]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span>Blog</span>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#B5642A] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- WhatsApp direto -->
            <a
              [href]="linkWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              id="link-whatsapp"
              class="flex items-center justify-between p-3.5 bg-white/95 rounded-2xl shadow-xs hover:shadow-md border border-slate-200/80 hover:border-emerald-500/40 transition-all duration-200 text-slate-800 text-xs sm:text-sm font-semibold group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                  </svg>
                </div>
                <span>WhatsApp direto</span>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <!-- Site completo -->
            <a
              routerLink="/"
              id="link-site-completo"
              class="flex items-center justify-between p-3.5 bg-white/95 rounded-2xl shadow-xs hover:shadow-md border border-slate-200/80 hover:border-[#132A41]/40 transition-all duration-200 text-slate-800 text-xs sm:text-sm font-semibold group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#132A41]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <span>Site completo</span>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-[#132A41] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>

          </div>

          <!-- 2.7 Rodapé -->
          <div class="pt-4 pb-2 text-center">
            <div class="inline-block px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-xs text-center space-y-0.5">
              <p class="text-[11px] text-slate-500 font-medium">
                Amorim Serviços de Engenharia Ltda · CNPJ 35.673.731/0001-82
              </p>
              <p class="text-[11px] text-slate-500 font-medium">
                Recife/PE · © 2026
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LinksBioComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly supabaseService = inject(SupabaseService);

  readonly linkWhatsapp = gerarLinkWhatsapp('links-bio');

  readonly avatarUrl = signal('/assets/img/emanoel-amorim-arquiteto-engenharia.jpg');

  readonly nome = signal('');
  readonly email = signal('');
  readonly whatsapp = signal('');
  readonly interesse = signal<'predial-4-0' | 'academy-cursos' | 'consultoria-arquitetura' | 'comunidade' | 'outro'>('predial-4-0');
  readonly mensagem = signal('');

  readonly enviando = signal(false);
  readonly sucesso = signal(false);
  readonly erro = signal(false);
  readonly erroValidacao = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Emanoel Amorim | Engenharia diagnóstica, tecnologia e formação',
      description:
        'Plataforma Predial 4.0, cursos de especialização, consultoria em engenharia diagnóstica e comunidade profissional. Conheça o ecossistema AmorimTech.',
      canonicalPath: '/links',
      ogImage: 'https://emanoelamorim.com/assets/img/og-emanoel-amorim-cv.jpg',
    });
  }

  onAvatarError(): void {
    this.avatarUrl.set('/og-fallback-institucional.jpg');
  }

  onNomeInput(event: Event): void {
    this.nome.set((event.target as HTMLInputElement).value);
    this.erroValidacao.set(null);
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.erroValidacao.set(null);
  }

  onWhatsappInput(event: Event): void {
    this.whatsapp.set((event.target as HTMLInputElement).value);
  }

  onInteresseChange(event: Event): void {
    this.interesse.set((event.target as HTMLSelectElement).value as any);
    this.erroValidacao.set(null);
  }

  onMensagemInput(event: Event): void {
    this.mensagem.set((event.target as HTMLTextAreaElement).value);
  }

  async enviarLead(event: Event): Promise<void> {
    event.preventDefault();
    this.erro.set(false);
    this.sucesso.set(false);
    this.erroValidacao.set(null);

    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();

    if (!nomeVal) {
      this.erroValidacao.set('Por favor, informe seu nome.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      this.erroValidacao.set('Por favor, informe um e-mail válido.');
      return;
    }

    if (!this.interesse()) {
      this.erroValidacao.set('Por favor, selecione seu interesse.');
      return;
    }

    this.enviando.set(true);

    try {
      const res = await this.supabaseService.criarLeadCaptura({
        nome: nomeVal,
        email: emailVal,
        whatsapp: this.whatsapp().trim() || undefined,
        interesse: this.interesse(),
        mensagem: this.mensagem().trim() || undefined,
      });

      if (res.ok) {
        this.sucesso.set(true);
        this.nome.set('');
        this.email.set('');
        this.whatsapp.set('');
        this.mensagem.set('');
        this.interesse.set('predial-4-0');
      } else {
        this.erro.set(true);
      }
    } catch {
      this.erro.set(true);
    } finally {
      this.enviando.set(false);
    }
  }
}
