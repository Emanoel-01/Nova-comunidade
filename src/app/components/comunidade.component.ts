import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-comunidade',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-100 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <!-- Coluna Esquerda — Painel Institucional (fundo escuro) -->
        <div class="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
          <!-- Imagem de fundo com opacidade sutil -->
          <div
            class="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
            style="background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000');"
          ></div>
          <!-- Gradiente de acabamento escuro -->
          <div class="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 pointer-events-none"></div>

          <div class="relative z-10 space-y-8">
            <!-- Cabeçalho institucional -->
            <div class="space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <div>
                <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Comunidade Business 4.0
                </h1>
                <p class="text-emerald-400 font-bold text-sm sm:text-base tracking-wide mt-0.5">
                  Além do Diploma
                </p>
              </div>

              <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">
                O ponto de encontro entre quem resolve e quem contrata na Construção Civil.
              </p>
            </div>

            <!-- Lista de 4 itens institucionais -->
            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block sm:inline">Gestão Estratégica & Diagnóstica:</span>
                  <span class="text-slate-300"> Soluções em laudos, eficiência e segurança predial para profissionais que buscam autoridade técnica.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block sm:inline">Ecossistema Digital SaaS:</span>
                  <span class="text-slate-300"> Tecnologia inteligente para a gestão de ativos e edifícios, integrando inovação ao dia a dia da construção.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block sm:inline">Liderança e Prática:</span>
                  <span class="text-slate-300"> Networking real com os protagonistas que dominam a convergência tecnológica no setor.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block sm:inline">Hub de Oportunidades:</span>
                  <span class="text-slate-300"> Onde a engenharia consultiva encontra parcerias de alto nível e negócios reais.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10 pt-8 mt-6 border-t border-slate-800 text-[11px] text-slate-400">
            Ambiente exclusivo para membros homologados e convidados.
          </div>
        </div>

        <!-- Coluna Direita — Ações (fundo branco) -->
        <div class="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white">
          
          <!-- ESTADO 1: Tela Inicial Padrão -->
          @if (!mostrarFormularioSolicitacao() && !solicitacaoEnviada()) {
            <div class="max-w-md mx-auto w-full space-y-8 py-4">
              <div class="space-y-2 text-center lg:text-left">
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Acessar Plataforma
                </h2>
                <p class="text-sm text-slate-500">
                  Faça login para ingressar no ambiente de discussões, materiais e vagas.
                </p>
              </div>

              <div class="space-y-4">
                <!-- Botão Entrar com minha conta -->
                <button
                  type="button"
                  id="btn-entrar-conta"
                  (click)="onEntrarComConta()"
                  class="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Entrar com minha conta</span>
                </button>

                <!-- Botão Solicitar Acesso ao Administrador -->
                <button
                  type="button"
                  id="btn-solicitar-acesso"
                  (click)="abrirFormulario()"
                  class="w-full py-4 px-6 rounded-2xl bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-base border-2 border-indigo-600 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Solicitar Acesso ao Administrador</span>
                </button>

                <!-- Botão Ver Prévia da Comunidade (Modo Demonstração) -->
                <div class="pt-2">
                  <a
                    routerLink="/comunidade/preview"
                    id="btn-ver-previa-comunidade"
                    class="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 font-semibold text-xs sm:text-sm border border-slate-300 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>👁 Ver como vai funcionar (prévia)</span>
                  </a>
                </div>
              </div>

              <!-- Texto Informativo -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-1">
                <span class="font-bold text-slate-800">Já é membro?</span>
                <p>
                  Se você já teve sua solicitação aprovada, basta clicar em "Entrar com minha conta" para acessar o feed, fóruns e materiais exclusivos.
                </p>
              </div>
            </div>
          }

          <!-- ESTADO 2: Formulário de Solicitação de Acesso -->
          @if (mostrarFormularioSolicitacao() && !solicitacaoEnviada()) {
            <div class="max-w-lg mx-auto w-full space-y-6">
              
              <!-- Cabeçalho do formulário com botão fechar -->
              <div class="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Solicitar Acesso
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Preencha suas informações para análise do comitê de admissão.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-fechar-formulario"
                  (click)="fecharFormulario()"
                  class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form (submit)="enviarSolicitacao($event)" class="space-y-4" id="form-solicitar-acesso">
                <!-- Nome Completo + E-mail -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div class="space-y-1">
                    <label for="solic-nome" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Nome Completo <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="solic-nome"
                      type="text"
                      [value]="nome()"
                      (input)="onNomeInput($event)"
                      placeholder="Seu nome"
                      required
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="solic-email" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      E-mail <span class="text-rose-500">*</span>
                    </label>
                    <input
                      id="solic-email"
                      type="email"
                      [value]="email()"
                      (input)="onEmailInput($event)"
                      placeholder="exemplo@email.com"
                      required
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <!-- Telefone/WhatsApp + Profissão/Cargo -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div class="space-y-1">
                    <label for="solic-telefone" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="solic-telefone"
                      type="tel"
                      [value]="telefone()"
                      (input)="onTelefoneInput($event)"
                      placeholder="(81) 99999-9999"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="solic-profissao" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Profissão / Cargo
                    </label>
                    <input
                      id="solic-profissao"
                      type="text"
                      [value]="profissao()"
                      (input)="onProfissaoInput($event)"
                      placeholder="Ex: Engenheiro Diagnóstico"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <!-- Select: Tipo de Perfil -->
                <div class="space-y-1">
                  <label for="solic-perfil" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Tipo de Perfil <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="solic-perfil"
                    [value]="perfil()"
                    (change)="onPerfilChange($event)"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="Especialista em Engenharia Diagnóstica">Especialista em Engenharia Diagnóstica</option>
                    <option value="Gestor de Ativos / Facilities Manager">Gestor de Ativos / Facilities Manager</option>
                    <option value="Síndico Profissional / Gestor Predial">Síndico Profissional / Gestor Predial</option>
                    <option value="Clientes Amorim Arquitetura">Clientes Amorim Arquitetura</option>
                    <option value="Aluno / Pós-Graduando ESUDA">Aluno / Pós-Graduando ESUDA</option>
                    <option value="Profissional Autônomo">Profissional Autônomo</option>
                    <option value="Investidor / Incorporador">Investidor / Incorporador</option>
                    <option value="Consultor BIM / Inovação Tecnológica">Consultor BIM / Inovação Tecnológica</option>
                    <option value="Parceiro Estratégico / Fornecedor Homologado">Parceiro Estratégico / Fornecedor Homologado</option>
                    <option value="Gestor / Servidor Público">Gestor / Servidor Público</option>
                  </select>
                </div>

                <!-- Textarea: Por que deseja entrar -->
                <div class="space-y-1">
                  <label for="solic-motivo" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Por que deseja entrar na comunidade?
                  </label>
                  <textarea
                    id="solic-motivo"
                    rows="3"
                    [value]="motivo()"
                    (input)="onMotivoInput($event)"
                    placeholder="Conte brevemente sobre seus objetivos..."
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-y"
                  ></textarea>
                </div>

                <!-- Botão Enviar Solicitação -->
                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-submeter-solicitacao"
                    class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar Solicitação</span>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- ESTADO 3: Tela de Confirmação (Solicitação Recebida com Sucesso) -->
          @if (solicitacaoEnviada()) {
            <div class="max-w-md mx-auto w-full space-y-6 py-2 text-center">
              
              <!-- Ícone grande de check -->
              <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div class="space-y-2">
                <h3 class="text-2xl font-black text-slate-900 tracking-tight">
                  Solicitação Recebida com Sucesso! 🎉
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Obrigado por buscar o próximo nível. Sua solicitação de acesso à Comunidade Business 4.0 foi enviada para nossa equipe técnica.
                </p>
              </div>

              <!-- Bloco Próximos Passos -->
              <div class="text-left bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2.5">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Próximos Passos
                </h4>
                <div class="space-y-2 text-xs text-slate-600">
                  <p class="leading-relaxed">
                    <strong class="text-slate-800">1. Validação:</strong> Verificaremos seu vínculo com os programas da Amorim Tech ou Amorim Arquitetura.
                  </p>
                  <p class="leading-relaxed">
                    <strong class="text-slate-800">2. Aprovação:</strong> Você receberá uma notificação assim que seu e-mail for liberado.
                  </p>
                </div>
              </div>

              <!-- Bloco de Dica -->
              <div class="text-left bg-amber-50/80 rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <span class="font-bold block mb-1">💡 Dica de Ouro:</span>
                Membros engajados têm prioridade em mentorias exclusivas e ganham destaque no nosso Hall da Fama. Prepare seu perfil e comece a interagir!
              </div>

              <!-- Botão Fechar -->
              <div class="pt-2">
                <button
                  type="button"
                  id="btn-concluir-solicitacao"
                  (click)="resetarFluxo()"
                  class="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class ComunidadeComponent {
  readonly mostrarFormularioSolicitacao = signal(false);
  readonly solicitacaoEnviada = signal(false);

  // Campos do formulário em signals
  readonly nome = signal('');
  readonly email = signal('');
  readonly telefone = signal('');
  readonly profissao = signal('');
  readonly perfil = signal('Especialista em Engenharia Diagnóstica');
  readonly motivo = signal('');

  onEntrarComConta(): void {
    alert('Login em breve — esta função ainda está em implantação.');
  }

  abrirFormulario(): void {
    this.mostrarFormularioSolicitacao.set(true);
    this.solicitacaoEnviada.set(false);
  }

  fecharFormulario(): void {
    this.mostrarFormularioSolicitacao.set(false);
    this.solicitacaoEnviada.set(false);
  }

  onNomeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nome.set(target.value);
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  onTelefoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.telefone.set(target.value);
  }

  onProfissaoInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.profissao.set(target.value);
  }

  onPerfilChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.perfil.set(target.value);
  }

  onMotivoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.motivo.set(target.value);
  }

  enviarSolicitacao(event: Event): void {
    event.preventDefault();

    if (!this.nome().trim() || !this.email().trim() || !this.perfil().trim()) {
      alert('Por favor, preencha o Nome, E-mail e selecione o Tipo de Perfil.');
      return;
    }

    // Marca como enviada para renderizar o estado de sucesso
    this.solicitacaoEnviada.set(true);
  }

  resetarFluxo(): void {
    this.mostrarFormularioSolicitacao.set(false);
    this.solicitacaoEnviada.set(false);
    this.nome.set('');
    this.email.set('');
    this.telefone.set('');
    this.profissao.set('');
    this.perfil.set('Especialista em Engenharia Diagnóstica');
    this.motivo.set('');
  }
}
