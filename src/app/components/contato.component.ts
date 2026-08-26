import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-contato',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto space-y-10">

        <!-- Cabeçalho Centralizado -->
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Central de Atendimento</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Como podemos ajudar hoje?
          </h1>

          <p class="text-slate-600 text-base sm:text-lg leading-relaxed">
            Fale diretamente com os especialistas das verticais Amorim Arquitetura, Amorim Tech e Amorim Academy.
          </p>
        </div>

        <!-- Card Principal (2 Colunas) -->
        <div class="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          <!-- Coluna Esquerda: Formulário ou Confirmação (7 colunas) -->
          <div class="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-center">
            @if (!envioConfirmado()) {
              <div>
                <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
                  Envie sua mensagem
                </h2>
                <p class="text-sm text-slate-500 mt-1">
                  Preencha os campos abaixo para direcionarmos ao setor responsável.
                </p>
              </div>

              <form (submit)="enviarMensagem($event)" class="space-y-5" id="form-contato">
                <!-- Campo: Assunto Principal -->
                <div class="space-y-1.5">
                  <label for="assunto" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Qual o assunto principal? <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="assunto"
                    [value]="assunto()"
                    (change)="onAssuntoChange($event)"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="Amorim Arquitetura">Amorim Arquitetura</option>
                    <option value="Amorim Tech">Amorim Tech</option>
                    <option value="Amorim Academy">Amorim Academy</option>
                  </select>
                </div>

                <!-- Campo: Nome -->
                <div class="space-y-1.5">
                  <label for="nome" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nome <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="nome"
                    type="text"
                    [value]="nome()"
                    (input)="onNomeInput($event)"
                    placeholder="Seu nome completo"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                  />
                </div>

                <!-- Campos Lado a Lado: E-mail e WhatsApp -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      E-mail <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      [value]="email()"
                      (input)="onEmailInput($event)"
                      placeholder="exemplo@email.com"
                      required
                      class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label for="whatsapp" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      WhatsApp <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      [value]="whatsapp()"
                      (input)="onWhatsappInput($event)"
                      placeholder="(81) 99999-9999"
                      required
                      class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <!-- Campo: Mensagem -->
                <div class="space-y-1.5">
                  <label for="mensagem" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mensagem <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="mensagem"
                    rows="4"
                    [value]="mensagem()"
                    (input)="onMensagemInput($event)"
                    placeholder="Escreva sua dúvida, proposta ou solicitação..."
                    required
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-400 resize-y"
                  ></textarea>
                </div>

                <!-- Mensagem de Erro Inline -->
                @if (erroValidacao()) {
                  <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ erroValidacao() }}</span>
                  </div>
                }

                <!-- Botão Enviar -->
                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-enviar-contato"
                    class="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar Mensagem</span>
                  </button>
                </div>

                <p class="text-xs text-center text-slate-500">
                  Nossa equipe técnica responderá em até 24h úteis.
                </p>
              </form>
            } @else {
              <!-- Estado de Confirmação Pós-Envio -->
              <div class="space-y-6 text-center py-6">
                <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-inner">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div class="space-y-2">
                  <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                    Sua mensagem foi preparada!
                  </h3>
                  <p class="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Concluímos o envio pelo WhatsApp que abriu em uma nova aba. Se não abriu automaticamente, 
                    <a
                      [href]="urlWhatsappGerada()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-emerald-600 font-bold hover:underline"
                    >
                      clique aqui para continuar no WhatsApp
                    </a>.
                  </p>
                </div>

                <div class="pt-4">
                  <button
                    type="button"
                    (click)="resetarFormulario()"
                    class="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Coluna Direita: Contatos Diretos (5 colunas) -->
          <div class="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <!-- Ícone decorativo no fundo -->
            <div class="absolute -right-8 -bottom-8 w-64 h-64 text-slate-800/40 pointer-events-none select-none">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>

            <div class="relative z-10 space-y-8">
              <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">
                  Contatos Diretos
                </h3>
                <p class="text-sm text-slate-400 mt-1">
                  Prefere falar de forma imediata? Utilize nossos canais diretos.
                </p>
              </div>

              <div class="space-y-5">
                <!-- Bloco WhatsApp -->
                <a
                  id="link-whatsapp-direto"
                  [href]="linkWhatsappDireto"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
                >
                  <div class="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                    </svg>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                      Atendimento (WhatsApp)
                    </span>
                    <span class="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      (81) 99129-8803
                    </span>
                    <span class="text-xs text-slate-400 block">
                      Resposta rápida em horário comercial
                    </span>
                  </div>
                </a>

                <!-- Bloco E-mail -->
                <a
                  id="link-email-direto"
                  href="mailto:contato@emanoelamorim.com"
                  class="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
                >
                  <div class="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                      E-mail
                    </span>
                    <span class="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors break-all">
                      contato&#64;emanoelamorim.com
                    </span>
                    <span class="text-xs text-slate-400 block">
                      Para propostas formais e parcerias
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div class="relative z-10 pt-8 mt-8 border-t border-slate-800 text-xs text-slate-400">
              Recife / PE · Brasil · Atendimento em todo território nacional
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class ContatoComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly linkWhatsappDireto = gerarLinkWhatsapp('contato');

  readonly assunto = signal('Amorim Arquitetura');
  readonly nome = signal('');
  readonly email = signal('');
  readonly whatsapp = signal('');
  readonly mensagem = signal('');

  readonly erroValidacao = signal<string | null>(null);
  readonly envioConfirmado = signal(false);
  readonly urlWhatsappGerada = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Contato | AmorimTech',
      description: 'Fale com a AmorimTech — consultoria, laudos técnicos e formação em engenharia diagnóstica.',
      canonicalPath: '/contato',
    });
  }

  onAssuntoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.assunto.set(target.value);
  }

  onNomeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nome.set(target.value);
    if (this.erroValidacao()) this.erroValidacao.set(null);
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
    if (this.erroValidacao()) this.erroValidacao.set(null);
  }

  onWhatsappInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.whatsapp.set(target.value);
    if (this.erroValidacao()) this.erroValidacao.set(null);
  }

  onMensagemInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.mensagem.set(target.value);
    if (this.erroValidacao()) this.erroValidacao.set(null);
  }

  enviarMensagem(event: Event): void {
    event.preventDefault();

    if (!this.nome().trim() || !this.email().trim() || !this.whatsapp().trim() || !this.mensagem().trim()) {
      this.erroValidacao.set('Preencha todos os campos obrigatórios antes de enviar.');
      return;
    }
    this.erroValidacao.set(null);

    const linhas = [
      `Olá! Vim pelo site e quero falar sobre *${this.assunto()}*.`,
      ``,
      `Nome: ${this.nome().trim()}`,
      `E-mail: ${this.email().trim()}`,
      `WhatsApp: ${this.whatsapp().trim()}`,
      ``,
      `Mensagem: ${this.mensagem().trim()}`,
    ];
    const textoCodificado = encodeURIComponent(linhas.join('\n'));
    const urlWhatsapp = `https://wa.me/5581991298803?text=${textoCodificado}`;

    window.open(urlWhatsapp, '_blank', 'noopener,noreferrer');

    this.urlWhatsappGerada.set(urlWhatsapp);
    this.envioConfirmado.set(true);
  }

  resetarFormulario(): void {
    this.assunto.set('Amorim Arquitetura');
    this.nome.set('');
    this.email.set('');
    this.whatsapp.set('');
    this.mensagem.set('');
    this.erroValidacao.set(null);
    this.envioConfirmado.set(false);
    this.urlWhatsappGerada.set(null);
  }
}
