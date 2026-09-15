import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
            <div class="relative w-32 h-32 mx-auto rounded-full p-1 bg-white shadow-lg ring-2 ring-[#B5642A]/30">
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
              <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Ecossistema digital
              </p>
              <p class="text-xs sm:text-sm font-semibold text-[#B5642A] pt-0.5">
                Arquiteto, Founder da AmorimTech e Coordenador Acadêmico.
              </p>
            </div>

            <p class="text-xs text-slate-600 italic font-medium leading-relaxed px-2">
              "Transformando o setor da construção civil através de três pilares: desenvolvimento de ecossistemas tecnológicos, formação de novos especialistas e consultoria técnica especializada."
            </p>
          </div>

          <!-- Texto de transição -->
          <div class="text-center pt-2">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500">
              Escolha abaixo como posso te ajudar hoje:
            </span>
          </div>

          <!-- 2.4 Cards de Produto -->
          <div class="space-y-4">

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

            <!-- CARD 2 — Amorim Academy -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <img src="/logo-academy.svg" alt="Amorim Academy" class="h-9 w-auto" style="max-width:150px" />
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

              <div class="pt-1 flex gap-2">
                <button
                  type="button"
                  (click)="abrirCursos()"
                  class="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Ver cursos
                </button>
                <a
                  routerLink="/como-funciona"
                  class="text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
                >
                  Como funciona
                </a>
              </div>
            </div>

            <!-- CARD 1 — Predial 4.0 -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <img src="/logo-tech.svg" alt="Amorim Tech" class="h-9 w-auto" style="max-width:150px" />
              </div>

              <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Predial 4.0
              </h2>

              <p class="text-xs sm:text-sm text-slate-600 leading-snug">
                Plataforma de engenharia diagnóstica. Automatiza o caminho da vistoria
                em campo até o laudo assinado, com apoio de inteligência artificial.
              </p>

              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Dois módulos no ar e outros em desenvolvimento</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Vistoria em campo sem depender de conexão</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Diagnóstico assistido por IA, com revisão do profissional</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#B5642A] mt-1.5 shrink-0"></span>
                  <span>Laudo estruturado pronto para assinatura</span>
                </li>
              </ul>

              <div class="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  routerLink="/amorim-tech"
                  class="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs shadow-sm transition-all"
                >
                  Conhecer a plataforma
                </a>
                <a
                  routerLink="/como-funciona"
                  class="text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
                >
                  Como funciona
                </a>
                <a
                  href="https://app-predial.emanoelamorim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-center py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
                >
                  Entrar
                </a>
              </div>
            </div>

            <!-- CARD 3 — Amorim Arquitetura -->
            <div class="bg-white/95 rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <img src="/logo-arquitetura.svg" alt="Amorim Arquitetura" class="h-9 w-auto" style="max-width:160px" />
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

          </div>

          <!-- 2.5 Contato (acordeão) -->
          <div class="bg-[#132A41] text-white rounded-2xl shadow-lg border border-[#1B3550] overflow-hidden">
            <button
              type="button"
              id="btn-abrir-contato"
              (click)="alternarContato()"
              [attr.aria-expanded]="contatoAberto()"
              aria-controls="painel-contato"
              class="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left cursor-pointer hover:bg-[#1B3550] transition-colors"
            >
              <span class="text-sm font-bold text-white">Quer saber mais? Entre em contato.</span>
              <svg
                class="w-4 h-4 text-[#B5642A] shrink-0 transition-transform"
                [class.rotate-180]="contatoAberto()"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            @if (contatoAberto()) {
              <div id="painel-contato" class="px-5 pb-5 space-y-4 border-t border-[#1B3550]">
                <p class="text-xs text-slate-300 pt-4">
                  Retorno direto, sem robô e sem lista de disparo.
                </p>
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
            }
          </div>

          <!-- 2.6 Painel de cursos (sobreposto, sem sair do minisite) -->
          @if (cursosAberto()) {
            <div
              class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4"
              (click)="fecharCursos()"
            >
              <div
                class="w-full sm:max-w-md bg-[#FBF8F2] rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-painel-cursos"
                (click)="$event.stopPropagation()"
              >
                <div class="sticky top-0 bg-[#132A41] px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 id="titulo-painel-cursos" class="text-sm font-bold text-white">Próximos cursos</h2>
                    <p class="text-[11px] text-slate-300">Amorim Academy</p>
                  </div>
                  <button
                    type="button"
                    (click)="fecharCursos()"
                    aria-label="Fechar"
                    class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="p-5 space-y-3">
                  @if (carregandoCursos()) {
                    <p class="text-xs text-slate-500 text-center py-6">Carregando cursos...</p>
                  } @else if (cursos().length === 0) {
                    <p class="text-xs text-slate-500 text-center py-6">
                      Nenhum curso na agenda no momento. Veja a página da Academy para a lista completa.
                    </p>
                  } @else {
                    @for (curso of cursos(); track curso.id) {
                      <div class="bg-white/95 rounded-2xl border border-slate-200/80 p-4 space-y-1.5">
                        <p class="text-sm font-bold text-slate-900 leading-tight">{{ curso.titulo }}</p>
                        @if (curso.descricao) {
                          <p class="text-[11px] text-slate-600 leading-snug">{{ curso.descricao }}</p>
                        }
                        <div class="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px] text-slate-500">
                          @if (curso.formato) { <span>{{ curso.formato }}</span> }
                          @if (curso.carga_horaria_certificado) { <span>{{ curso.carga_horaria_certificado }}</span> }
                          @if (curso.mes_previsto) { <span>{{ curso.mes_previsto }}</span> }
                          @if (curso.status_lancamento) { <span class="text-[#B5642A] font-semibold">{{ curso.status_lancamento }}</span> }
                        </div>
                      </div>
                    }
                  }

                  <a
                    routerLink="/amorim-academy"
                    class="block w-full text-center py-2.5 px-3 rounded-xl bg-[#132A41] hover:bg-[#1B3550] text-white font-bold text-xs transition-all mt-1"
                  >
                    Ver a página completa da Academy
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- 2.7 Rodapé -->
          <div class="pt-5 pb-1 text-center space-y-0.5">
            <p class="text-[10px] text-slate-400 leading-relaxed">
              Amorim Serviços de Engenharia Ltda · CNPJ 35.673.731/0001-82 · Recife/PE
            </p>
            <p class="text-[10px] text-slate-400 leading-relaxed">
              © 2026 Emanoel Amorim ·
              <a routerLink="/termos" class="underline hover:text-slate-600 transition-colors">Privacidade e termos de uso</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LinksBioComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly supabaseService = inject(SupabaseService);

  readonly avatarUrl = signal('/assets/img/emanoel-amorim-arquiteto-engenharia.jpg');

  /** O formulário nasce fechado para encurtar a página; abre a pedido. */
  readonly contatoAberto = signal(false);

  /** Painel de cursos: mostra a agenda sem tirar a pessoa do minisite. */
  readonly cursosAberto = signal(false);
  readonly carregandoCursos = signal(false);
  readonly cursos = signal<any[]>([]);

  readonly nome = signal('');
  readonly email = signal('');
  readonly whatsapp = signal('');
  readonly interesse = signal<'predial-4-0' | 'academy-cursos' | 'consultoria-arquitetura' | 'comunidade' | 'outro'>('comunidade');
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

  alternarContato(): void {
    this.contatoAberto.update((aberto) => !aberto);
  }

  async abrirCursos(): Promise<void> {
    this.cursosAberto.set(true);
    if (this.cursos().length > 0) {
      return;
    }
    this.carregandoCursos.set(true);
    try {
      this.cursos.set(await this.supabaseService.listarCursosAgenda());
    } catch {
      this.cursos.set([]);
    } finally {
      this.carregandoCursos.set(false);
    }
  }

  fecharCursos(): void {
    this.cursosAberto.set(false);
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
        this.interesse.set('comunidade');
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
