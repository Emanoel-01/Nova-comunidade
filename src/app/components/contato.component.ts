import { Component, inject, OnInit, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';
import { SupabaseService } from '../../services/supabase.service';

interface ChatMensagem {
  role: 'user' | 'model';
  texto: string;
  horario: string;
}

@Component({
  selector: 'app-contato',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto space-y-12 sm:space-y-16">

        <!-- Cabeçalho Centralizado -->
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm max-w-full">
            <svg class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Central de Atendimento</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Como podemos ajudar hoje?
          </h1>

          <p class="text-slate-600 text-base sm:text-lg leading-relaxed text-justify sm:text-center">
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

          <!-- Coluna Direita: Contatos Diretos + Portal Acadêmico (5 colunas) -->
          <div class="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <!-- Ícone decorativo no fundo -->
            <div class="absolute -right-8 -bottom-8 w-64 h-64 text-slate-800/40 pointer-events-none select-none">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>

            <div class="relative z-10 space-y-6">
              <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">
                  Contatos Diretos
                </h3>
                <p class="text-sm text-slate-400 mt-1">
                  Prefere falar de forma imediata? Utilize nossos canais diretos.
                </p>
              </div>

              <div class="space-y-4">
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
                  <div class="space-y-0.5 min-w-0">
                    <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                      Atendimento (WhatsApp)
                    </span>
                    <span class="text-base font-bold text-white group-hover:text-emerald-300 transition-colors block break-words">
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
                  <div class="space-y-0.5 min-w-0">
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

                <!-- Bloco Portal Acadêmico ESUDA (Parte 2.1) -->
                <a
                  id="link-portal-esuda"
                  href="https://esuda.emanoelamorim.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 transition-all group"
                >
                  <div class="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                        Portal Acadêmico ESUDA
                      </span>
                      <svg class="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <span class="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors block break-words">
                      Gestor de Cronogramas ESUDA
                    </span>
                    <span class="text-xs text-slate-400 block">
                      Acesso para coordenação de pós-graduação
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div class="relative z-10 pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400">
              Recife / PE · Brasil · Atendimento em todo território nacional
            </div>
          </div>

        </div>

        <!-- ========================================== -->
        <!-- SEÇÃO: ALÔ SÍNDICO (Parte 1)               -->
        <!-- ========================================== -->
        <section id="alo-sindico" class="scroll-mt-12 space-y-6">
          <div class="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            
            <!-- Barra Superior do Card Alô Síndico -->
            <div class="p-6 sm:p-8 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest flex-wrap">
                    <span>Atendimento Especializado</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span class="text-emerald-400">Online</span>
                  </div>
                  <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
                    Alô, Síndico!
                  </h2>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-400 max-w-sm sm:text-right">
                Tire dúvidas sobre inspeção predial, trincas, fachadas e normas técnicas diretamente com nossa IA especialista.
              </div>
            </div>

            <!-- Conteúdo: Estado 1 (Cadastro) ou Estado 2 (Chat) -->
            <div class="p-6 sm:p-10">
              
              <!-- ===================================== -->
              <!-- ESTADO 1: FORMULÁRIO DE CADASTRO     -->
              <!-- ===================================== -->
              @if (!leadCadastrado()) {
                <div class="max-w-xl mx-auto space-y-6">
                  <div class="text-center space-y-2">
                    <h3 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Inicie seu atendimento gratuito
                    </h3>
                    <p class="text-sm text-slate-400 leading-relaxed">
                      Informe seus dados para liberar o assistente inteligente da Amorim Tech e registrar seu atendimento.
                    </p>
                  </div>

                  <form (submit)="cadastrarLeadSindico($event)" class="space-y-4" id="form-alo-sindico-lead">
                    <!-- Nome -->
                    <div class="space-y-1.5">
                      <label for="sindico-nome" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Nome Completo <span class="text-amber-400">*</span>
                      </label>
                      <input
                        id="sindico-nome"
                        type="text"
                        [value]="sindicoNome()"
                        (input)="onSindicoNomeInput($event)"
                        placeholder="Ex: Carlos Eduardo"
                        required
                        class="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <!-- Lado a Lado: Telefone/WhatsApp & E-mail -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label for="sindico-telefone" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                          Telefone / WhatsApp <span class="text-amber-400">*</span>
                        </label>
                        <input
                          id="sindico-telefone"
                          type="tel"
                          [value]="sindicoTelefone()"
                          (input)="onSindicoTelefoneInput($event)"
                          placeholder="(81) 99999-9999"
                          required
                          class="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                      </div>

                      <div class="space-y-1.5">
                        <label for="sindico-email" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                          E-mail <span class="text-amber-400">*</span>
                        </label>
                        <input
                          id="sindico-email"
                          type="email"
                          [value]="sindicoEmail()"
                          (input)="onSindicoEmailInput($event)"
                          placeholder="sindico@condominio.com"
                          required
                          class="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>

                    <!-- Condomínio (Opcional) -->
                    <div class="space-y-1.5">
                      <label for="sindico-condominio" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        Nome do Condomínio / Edifício <span class="text-slate-500 text-[11px] font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        id="sindico-condominio"
                        type="text"
                        [value]="sindicoCondominio()"
                        (input)="onSindicoCondominioInput($event)"
                        placeholder="Ex: Edifício Solar das Palmeiras"
                        class="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <!-- Erro Inline -->
                    @if (erroLead()) {
                      <div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                        <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ erroLead() }}</span>
                      </div>
                    }

                    <!-- Botão de Iniciar Chat -->
                    <div class="pt-2">
                      <button
                        type="submit"
                        id="btn-iniciar-alo-sindico"
                        [disabled]="enviandoLead()"
                        class="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-base transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                      >
                        @if (enviandoLead()) {
                          <svg class="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Iniciando Assistente...</span>
                        } @else {
                          <svg class="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Conversar com o Assistente de IA</span>
                        }
                      </button>
                    </div>

                    <p class="text-xs text-center text-slate-400">
                      🔒 Seus dados são confidenciais e usados exclusivamente para suporte e cotação.
                    </p>
                  </form>
                </div>
              } @else {
                <!-- ===================================== -->
                <!-- ESTADO 2: CHAT COM IA                -->
                <!-- ===================================== -->
                <div class="max-w-3xl mx-auto space-y-4">
                  
                  <!-- Info Bar do Atendimento Ativo -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs gap-2">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                      <span class="text-slate-300">Atendimento ativo para: <strong class="text-white">{{ sindicoNome() }}</strong></span>
                      @if (sindicoCondominio()) {
                        <span class="text-slate-500 hidden sm:inline">· {{ sindicoCondominio() }}</span>
                      }
                    </div>

                    <a
                      [href]="linkWhatsappSindico"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors shrink-0"
                    >
                      <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                      </svg>
                      <span>Falar no WhatsApp</span>
                    </a>
                  </div>

                  <!-- Container de Mensagens (Scrollable) -->
                  <div
                    #chatContainer
                    class="h-[380px] sm:h-[440px] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 scroll-smooth"
                  >
                    @for (msg of chatMensagens(); track $index) {
                      @if (msg.role === 'model') {
                        <!-- Mensagem da IA (Esquerda) -->
                        <div class="flex items-start gap-3 max-w-[88%] sm:max-w-[80%]">
                          <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div class="space-y-1">
                            <div class="p-4 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-100 text-sm leading-relaxed border border-slate-700/70 whitespace-pre-line shadow-sm" [innerHTML]="mensagemFormatada(msg.texto)">
                            </div>
                            <span class="text-[11px] text-slate-500 block px-1">
                              Assistente Amorim Tech · {{ msg.horario }}
                            </span>
                          </div>
                        </div>
                      } @else {
                        <!-- Mensagem do Usuário (Direita) -->
                        <div class="flex items-start justify-end gap-3 max-w-[88%] sm:max-w-[80%] ml-auto">
                          <div class="space-y-1 text-right">
                            <div class="p-4 rounded-2xl rounded-tr-sm bg-amber-500 text-slate-950 font-medium text-sm leading-relaxed whitespace-pre-line shadow-md text-left">
                              {{ msg.texto }}
                            </div>
                            <span class="text-[11px] text-slate-500 block px-1">
                              Você · {{ msg.horario }}
                            </span>
                          </div>
                        </div>
                      }
                    }

                    <!-- Indicador de "Digitando..." -->
                    @if (enviandoMensagemChat()) {
                      <div class="flex items-start gap-3 max-w-[80%]">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div class="p-4 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700/70 text-slate-300 text-xs flex items-center gap-2">
                          <div class="flex items-center gap-1">
                            <div class="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                            <div class="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
                            <div class="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                          <span class="font-medium text-slate-400">Analisando sua pergunta...</span>
                        </div>
                      </div>
                    }

                    <!-- Mensagem de Erro de Comunicação com Fallback WhatsApp -->
                    @if (erroChat()) {
                      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-2">
                        <div class="flex items-center gap-2 font-semibold text-rose-300">
                          <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ erroChat() }}</span>
                        </div>
                        <div class="pt-1 flex items-center gap-2">
                          <a
                            [href]="linkWhatsappSindico"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                          >
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/>
                            </svg>
                            <span>Falar direto pelo WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Caixa de Entrada de Mensagem -->
                  <form (submit)="enviarMensagemChat($event)" class="flex gap-2">
                    <input
                      id="input-chat-alo-sindico"
                      type="text"
                      [value]="inputMensagemChat()"
                      (input)="onInputMensagemChat($event)"
                      placeholder="Descreva o problema no seu prédio ou faça uma pergunta..."
                      [disabled]="enviandoMensagemChat()"
                      class="flex-1 px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      id="btn-enviar-msg-chat"
                      [disabled]="!inputMensagemChat().trim() || enviandoMensagemChat()"
                      class="px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
                    >
                      <span class="hidden sm:inline">Enviar</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </form>

                  <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 px-1 gap-1 text-center sm:text-left">
                    <span>Pressione Enter para enviar</span>
                    <span>Respostas embasadas nas normas ABNT (NBR 16747)</span>
                  </div>

                </div>
              }

            </div>

          </div>
        </section>

      </div>
    </div>
  `
})
export class ContatoComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly linkWhatsappDireto = gerarLinkWhatsapp('contato');
  readonly linkWhatsappSindico = gerarLinkWhatsapp('tech-sindico');

  // Form Geral
  readonly assunto = signal('Amorim Arquitetura');
  readonly nome = signal('');
  readonly email = signal('');
  readonly whatsapp = signal('');
  readonly mensagem = signal('');
  readonly erroValidacao = signal<string | null>(null);
  readonly envioConfirmado = signal(false);
  readonly urlWhatsappGerada = signal<string | null>(null);

  // Alô Síndico: Estado 1 (Lead)
  readonly leadCadastrado = signal(false);
  readonly leadId = signal<string | null>(null);
  readonly sindicoNome = signal('');
  readonly sindicoTelefone = signal('');
  readonly sindicoEmail = signal('');
  readonly sindicoCondominio = signal('');
  readonly enviandoLead = signal(false);
  readonly erroLead = signal<string | null>(null);

  // Alô Síndico: Estado 2 (Chat IA)
  readonly chatContainer = viewChild<ElementRef<HTMLElement>>('chatContainer');
  readonly chatMensagens = signal<ChatMensagem[]>([]);
  readonly inputMensagemChat = signal('');
  readonly enviandoMensagemChat = signal(false);
  readonly erroChat = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Contato & Alô Síndico | AmorimTech',
      description: 'Fale com a AmorimTech — consultoria, laudos técnicos, Alô Síndico com IA especialista e formação em engenharia diagnóstica.',
      canonicalPath: '/contato',
    });
  }

  // Métodos Formulário Geral
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

  // Métodos Alô Síndico: Estado 1
  onSindicoNomeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sindicoNome.set(target.value);
    if (this.erroLead()) this.erroLead.set(null);
  }

  onSindicoTelefoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sindicoTelefone.set(target.value);
    if (this.erroLead()) this.erroLead.set(null);
  }

  onSindicoEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sindicoEmail.set(target.value);
    if (this.erroLead()) this.erroLead.set(null);
  }

  onSindicoCondominioInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.sindicoCondominio.set(target.value);
  }

  async cadastrarLeadSindico(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.sindicoNome().trim() || !this.sindicoTelefone().trim() || !this.sindicoEmail().trim()) {
      this.erroLead.set('Preencha os campos obrigatórios (Nome, WhatsApp e E-mail).');
      return;
    }

    this.enviandoLead.set(true);
    this.erroLead.set(null);

    try {
      const { data, error } = await this.supabaseService.criarLeadSindico({
        nome: this.sindicoNome(),
        telefone: this.sindicoTelefone(),
        email: this.sindicoEmail(),
        condominio: this.sindicoCondominio(),
      });

      if (error || !data?.id) {
        console.warn('Erro ao registrar lead no Supabase:', error?.message || error);
        this.erroLead.set('Não foi possível iniciar o atendimento no momento. Tente novamente em instantes ou fale direto pelo WhatsApp.');
        return;
      }

      this.leadId.set(data.id);

      // Mensagem inicial de boas-vindas da IA
      const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const primeiroNome = this.sindicoNome().trim().split(' ')[0] || 'Síndico(a)';
      const saudacao = `Olá, ${primeiroNome}! Sou o assistente de inteligência da Amorim Tech.

Pode me contar o que está acontecendo no seu condomínio/edifício (como trincas, infiltrações, descolamento de fachada ou reformas) ou tirar dúvidas sobre laudos e inspeção predial conforme a NBR 16747. Como posso te orientar hoje?`;

      this.chatMensagens.set([
        {
          role: 'model',
          texto: saudacao,
          horario: horarioAtual,
        }
      ]);

      this.leadCadastrado.set(true);
    } catch (e: any) {
      this.erroLead.set(`Não foi possível iniciar o atendimento: ${e?.message || 'verifique sua conexão'}.`);
    } finally {
      this.enviandoLead.set(false);
    }
  }

  // Métodos Alô Síndico: Estado 2 (Chat IA)
  onInputMensagemChat(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.inputMensagemChat.set(target.value);
    if (this.erroChat()) this.erroChat.set(null);
  }

  async enviarMensagemChat(event: Event): Promise<void> {
    event.preventDefault();
    const textoUsuario = this.inputMensagemChat().trim();
    if (!textoUsuario || this.enviandoMensagemChat()) return;

    const idLead = this.leadId();
    if (!idLead) {
      this.erroChat.set('Sessão de atendimento não identificada. Recarregue a página e preencha o formulário novamente.');
      return;
    }

    const horarioAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Adiciona a mensagem do usuário no histórico local
    const novaLista: ChatMensagem[] = [
      ...this.chatMensagens(),
      { role: 'user', texto: textoUsuario, horario: horarioAtual }
    ];
    this.chatMensagens.set(novaLista);
    this.inputMensagemChat.set('');
    this.enviandoMensagemChat.set(true);
    this.erroChat.set(null);
    this.scrollChatParaBaixo();

    // 2. Monta o histórico no formato esperado pela Edge Function
    const historicoFormatado = novaLista.map(m => ({
      role: m.role,
      parts: [{ text: m.texto }]
    }));

    try {
      const { data, error } = await this.supabaseService.enviarMensagemAloSindico(idLead, historicoFormatado);

      if (error) {
        console.warn('Erro ao chamar Edge Function diagnostico-ia chat-sindico:', error);
        this.erroChat.set('Não foi possível obter resposta no momento. Você pode tentar novamente ou falar direto pelo WhatsApp.');
        return;
      }

      // Trata os formatos possíveis de retorno da function ({ text }, { resposta }, { message }, etc.)
      const textoResposta = data?.text || data?.resposta || data?.message || (typeof data === 'string' ? data : null);

      if (textoResposta) {
        const horarioResp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMensagens.set([
          ...this.chatMensagens(),
          { role: 'model', texto: textoResposta, horario: horarioResp }
        ]);
        this.scrollChatParaBaixo();
      } else {
        this.erroChat.set('Não foi possível obter resposta no momento. Você pode tentar novamente ou falar direto pelo WhatsApp.');
      }
    } catch (e: any) {
      console.warn('Exceção no chat:', e);
      this.erroChat.set('Falha na conexão com o assistente. Tente novamente ou fale direto pelo WhatsApp:');
    } finally {
      this.enviandoMensagemChat.set(false);
      this.scrollChatParaBaixo();
    }
  }

  formatarMensagemChat(texto: string): string {
    if (!texto) return '';
    return texto
      // Remove marcadores de título Markdown que a IA possa gerar (### Título -> Título)
      .replace(/^#{1,6}\s+/gm, '')
      // Converte **negrito** em <strong>negrito</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Remove marcadores de lista Markdown soltos (* item -> — item), mantendo legibilidade
      .replace(/^\*\s+/gm, '— ');
  }

  mensagemFormatada(texto: string): SafeHtml {
    const formatado = this.formatarMensagemChat(texto);
    return this.sanitizer.bypassSecurityTrustHtml(formatado);
  }

  private scrollChatParaBaixo(): void {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }
}

