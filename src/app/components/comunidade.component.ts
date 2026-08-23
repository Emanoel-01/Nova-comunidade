import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

type ModoAcesso = 'login' | 'recuperar' | 'redefinir' | 'solicitacao' | 'solicitacao-sucesso';

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

            <!-- Lista de Ferramentas Reais da Comunidade -->
            <div class="space-y-3.5 pt-2">
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block">Fórum Técnico & Moderação:</span>
                  <span class="text-slate-300">Discussões técnicas de patologias, normas e engenharia diagnóstica com especialistas.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block">Mural de Vagas & Oportunidades:</span>
                  <span class="text-slate-300">Vagas exclusivas e parcerias em consultoria e gestão de obras em todo o Brasil.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block">Acervo de Materiais & Downloads:</span>
                  <span class="text-slate-300">Planilhas parametrizadas, checklists de campo, modelos de laudos e apresentações.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block">Cursos com Certificação & Eventos:</span>
                  <span class="text-slate-300">Capacitações práticas em manutenção predial e agenda de masterclasses ao vivo.</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="text-xs leading-relaxed">
                  <span class="font-bold text-white block">Agentes de IA de Engenharia:</span>
                  <span class="text-slate-300">Automação para Reajuste de Contratos e Análise de Custos & Viabilidade de Obras.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10 pt-8 mt-6 border-t border-slate-800 text-[11px] text-slate-400">
            Ambiente exclusivo para membros homologados e convidados.
          </div>
        </div>

        <!-- Coluna Direita — Ações e Formulários (fundo branco) -->
        <div class="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white">
          
          <!-- ESTADO: Formulário Principal de Login -->
          @if (modoAcesso() === 'login') {
            <div class="max-w-md mx-auto w-full space-y-6 py-2">
              <div>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Entrar na Comunidade
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">
                  Digite seu e-mail e senha cadastrados para acessar.
                </p>
              </div>

              <!-- Notificação de Sessão Ativa -->
              @if (usuarioLogado()) {
                <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-bold">Sessão Ativa Detectada</span>
                  </div>
                  <p class="text-xs text-emerald-800">
                    Você está conectado como <strong>{{ usuarioLogado()?.email || 'Emanoel Amorim' }}</strong>.
                  </p>
                  <button
                    type="button"
                    (click)="router.navigate(['/comunidade/preview'])"
                    class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Continuar para o Feed</span>
                    <span>→</span>
                  </button>
                </div>
              }

              <form (submit)="executarLogin($event)" class="space-y-4" id="form-login-comunidade">
                <!-- E-mail -->
                <div class="space-y-1">
                  <label for="login-email" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    E-mail
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    [value]="loginEmail()"
                    (input)="onLoginEmailInput($event)"
                    placeholder="seu.email@exemplo.com"
                    required
                    autocomplete="username"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>

                <!-- Senha -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label for="login-senha" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Senha
                    </label>
                    <button
                      type="button"
                      id="btn-esqueceu-senha"
                      (click)="abrirRecuperarSenha()"
                      class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      id="login-senha"
                      [type]="mostrarSenhaLogin() ? 'text' : 'password'"
                      [value]="loginSenha()"
                      (input)="onLoginSenhaInput($event)"
                      placeholder="••••••••"
                      required
                      autocomplete="current-password"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      (click)="toggleMostrarSenhaLogin()"
                      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title="Alternar visualização da senha"
                    >
                      @if (mostrarSenhaLogin()) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>

                <!-- Mensagem de Erro Inline -->
                @if (erroLogin()) {
                  <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ erroLogin() }}</span>
                  </div>
                }

                <!-- Botão Entrar -->
                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-submeter-login"
                    [disabled]="processandoLogin()"
                    class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    @if (processandoLogin()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Entrando...</span>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Entrar</span>
                    }
                  </button>
                </div>

                <div class="text-center pt-2">
                  <button
                    type="button"
                    (click)="abrirSolicitacao()"
                    class="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Ainda não tem acesso? <strong class="text-indigo-600 underline">Solicite sua entrada</strong>
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- ESTADO 3: Formulário de Recuperação de Senha -->
          @if (modoAcesso() === 'recuperar') {
            <div class="max-w-md mx-auto w-full space-y-6 py-2">
              <div class="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Recuperar Senha
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Enviaremos um link para você definir uma nova senha.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-voltar-login-recuperar"
                  (click)="abrirLogin()"
                  class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Voltar ao login"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              @if (recuperacaoEnviada()) {
                <div class="space-y-4 py-2">
                  <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div class="flex items-center gap-2 font-bold text-emerald-800">
                      <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Link de redefinição solicitado</span>
                    </div>
                    <p class="leading-relaxed">
                      Se esse e-mail estiver cadastrado na plataforma, você receberá em instantes um link com instruções para redefinir sua senha.
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="abrirLogin()"
                    class="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Voltar para o Login
                  </button>
                </div>
              } @else {
                <form (submit)="executarRecuperacaoSenha($event)" class="space-y-4" id="form-recuperar-senha">
                  <div class="space-y-1">
                    <label for="recuperar-email" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      E-mail cadastrado
                    </label>
                    <input
                      id="recuperar-email"
                      type="email"
                      [value]="recuperarEmail()"
                      (input)="onRecuperarEmailInput($event)"
                      placeholder="seu.email@exemplo.com"
                      required
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  @if (erroRecuperacao()) {
                    <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ erroRecuperacao() }}</span>
                    </div>
                  }

                  <div class="pt-2 space-y-2">
                    <button
                      type="submit"
                      id="btn-submeter-recuperacao"
                      [disabled]="processandoRecuperacao()"
                      class="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      @if (processandoRecuperacao()) {
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Enviando...</span>
                      } @else {
                        <span>Enviar link de redefinição</span>
                      }
                    </button>

                    <button
                      type="button"
                      (click)="abrirLogin()"
                      class="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Cancelar e voltar
                    </button>
                  </div>
                </form>
              }
            </div>
          }

          <!-- ESTADO 4: Redefinição Real de Senha (Nova Senha) -->
          @if (modoAcesso() === 'redefinir') {
            <div class="max-w-md mx-auto w-full space-y-6 py-2">
              <div class="space-y-1 pb-2 border-b border-slate-100">
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Criar Nova Senha
                </h3>
                <p class="text-xs text-slate-500">
                  Informe sua nova senha para acessar a Comunidade Business 4.0.
                </p>
              </div>

              @if (senhaRedefinidaComSucesso()) {
                <div class="space-y-4 py-2">
                  <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <div class="flex items-center gap-2 font-bold text-emerald-800">
                      <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Senha atualizada com sucesso!</span>
                    </div>
                    <p class="leading-relaxed">
                      Sua nova senha foi salva. Você já pode acessar o ambiente exclusivo da Comunidade.
                    </p>
                  </div>

                  <a
                    routerLink="/comunidade/preview"
                    id="btn-ir-comunidade-pos-senha"
                    class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Acessar Comunidade Agora</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              } @else {
                <form (submit)="executarSalvarNovaSenha($event)" class="space-y-4" id="form-nova-senha">
                  <div class="space-y-1">
                    <label for="nova-senha" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Nova Senha (mínimo 6 caracteres)
                    </label>
                    <input
                      id="nova-senha"
                      type="password"
                      [value]="novaSenha()"
                      (input)="onNovaSenhaInput($event)"
                      placeholder="••••••••"
                      required
                      minlength="6"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div class="space-y-1">
                    <label for="confirma-nova-senha" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="confirma-nova-senha"
                      type="password"
                      [value]="confirmaNovaSenha()"
                      (input)="onConfirmaNovaSenhaInput($event)"
                      placeholder="••••••••"
                      required
                      minlength="6"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  @if (erroRedefinicao()) {
                    <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ erroRedefinicao() }}</span>
                    </div>
                  }

                  <div class="pt-2">
                    <button
                      type="submit"
                      id="btn-salvar-nova-senha"
                      [disabled]="processandoRedefinicao()"
                      class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      @if (processandoRedefinicao()) {
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Salvando nova senha...</span>
                      } @else {
                        <span>Atualizar Senha e Entrar</span>
                      }
                    </button>
                  </div>
                </form>
              }
            </div>
          }

          <!-- ESTADO 5: Formulário de Solicitação de Acesso -->
          @if (modoAcesso() === 'solicitacao') {
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
                  (click)="voltarInicio()"
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

                <!-- Mensagem de Erro Inline -->
                @if (exibirErroValidacao()) {
                  <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ exibirErroValidacao() }}</span>
                  </div>
                }

                <!-- Botão Enviar Solicitação -->
                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-submeter-solicitacao"
                    [disabled]="enviandoSolicitacao()"
                    class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    @if (enviandoSolicitacao()) {
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enviando...</span>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Enviar Solicitação</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- ESTADO 6: Tela de Confirmação (Solicitação Recebida com Sucesso) -->
          @if (modoAcesso() === 'solicitacao-sucesso') {
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
                    <strong class="text-slate-800">2. Aprovação:</strong> Você receberá uma notificação com suas credenciais assim que seu e-mail for liberado.
                  </p>
                </div>
              </div>

              <!-- Bloco de Dica -->
              <div class="text-left bg-amber-50/80 rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <span class="font-bold block mb-1">💡 Dica de Ouro:</span>
                Membros engajados têm prioridade em mentorias exclusivas e ganham destaque no nosso Hall da Fama. Prepare seu perfil e comece a interagir!
              </div>

              <!-- Botão Concluir/Fechar -->
              <div class="pt-2">
                <button
                  type="button"
                  id="btn-concluir-solicitacao"
                  (click)="voltarInicio()"
                  class="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class ComunidadeComponent implements OnInit {
  readonly supabaseService = inject(SupabaseService);
  readonly router = inject(Router);

  // Modo ativo de navegação interna
  readonly modoAcesso = signal<ModoAcesso>('login');

  // Estados do Formulário de Login
  readonly loginEmail = signal('');
  readonly loginSenha = signal('');
  readonly mostrarSenhaLogin = signal(false);
  readonly processandoLogin = signal(false);
  readonly erroLogin = signal<string | null>(null);

  // Estados de Recuperação de Senha
  readonly recuperarEmail = signal('');
  readonly processandoRecuperacao = signal(false);
  readonly recuperacaoEnviada = signal(false);
  readonly erroRecuperacao = signal<string | null>(null);

  // Estados de Nova Senha (Redefinição)
  readonly novaSenha = signal('');
  readonly confirmaNovaSenha = signal('');
  readonly processandoRedefinicao = signal(false);
  readonly senhaRedefinidaComSucesso = signal(false);
  readonly erroRedefinicao = signal<string | null>(null);

  // Estados do Formulário de Solicitação de Acesso
  readonly exibirErroValidacao = signal<string | null>(null);
  readonly enviandoSolicitacao = signal(false);
  readonly nome = signal('');
  readonly email = signal('');
  readonly telefone = signal('');
  readonly profissao = signal('');
  readonly perfil = signal('Especialista em Engenharia Diagnóstica');
  readonly motivo = signal('');
  readonly usuarioLogado = signal<any | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const session = await this.supabaseService.getSession();
      if (session?.user) {
        this.usuarioLogado.set(session.user);
      }
    } catch (e) {
      console.warn('Verificação de sessão inicial:', e);
    }

    // Detectar retorno de e-mail de recuperação de senha
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const pathname = window.location.pathname || '';
      
      const isRecovery = 
        hash.includes('type=recovery') || 
        search.includes('type=recovery') || 
        pathname.includes('redefinir-senha');

      if (isRecovery) {
        this.modoAcesso.set('redefinir');
      }
    }

    // Monitorar eventos de autenticação
    this.supabaseService.onAuthStateChange((session) => {
      if (session?.user) {
        this.usuarioLogado.set(session.user);
        if (this.modoAcesso() === 'login') {
          this.router.navigate(['/comunidade/preview']);
        }
      }
    });
  }

  // Abertura e troca de telas
  abrirLogin(): void {
    this.modoAcesso.set('login');
    this.erroLogin.set(null);
  }

  abrirRecuperarSenha(): void {
    this.modoAcesso.set('recuperar');
    this.erroRecuperacao.set(null);
    this.recuperacaoEnviada.set(false);
    if (this.loginEmail()) {
      this.recuperarEmail.set(this.loginEmail());
    }
  }

  abrirSolicitacao(): void {
    this.modoAcesso.set('solicitacao');
    this.exibirErroValidacao.set(null);
  }

  voltarInicio(): void {
    this.modoAcesso.set('login');
    this.erroLogin.set(null);
    this.erroRecuperacao.set(null);
    this.exibirErroValidacao.set(null);
  }

  // Handlers do Login
  onLoginEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.loginEmail.set(target.value);
    if (this.erroLogin()) this.erroLogin.set(null);
  }

  onLoginSenhaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.loginSenha.set(target.value);
    if (this.erroLogin()) this.erroLogin.set(null);
  }

  toggleMostrarSenhaLogin(): void {
    this.mostrarSenhaLogin.update(v => !v);
  }

  async executarLogin(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.loginEmail().trim();
    const password = this.loginSenha();

    if (!email || !password) {
      this.erroLogin.set('Por favor, informe seu e-mail e senha.');
      return;
    }

    this.processandoLogin.set(true);
    this.erroLogin.set(null);

    const { error } = await this.supabaseService.signInWithPassword(email, password);
    this.processandoLogin.set(false);

    if (error) {
      if (error.message?.toLowerCase().includes('invalid login credentials') || error.message?.toLowerCase().includes('invalid_credentials')) {
        this.erroLogin.set('E-mail ou senha incorretos no Supabase.');
      } else if (!this.supabaseService.isConfigurado()) {
        this.erroLogin.set('Aviso: Chave SUPABASE_ANON_KEY não informada no ambiente. Configure no painel de segredos/variáveis do projeto.');
      } else {
        this.erroLogin.set(error.message || 'Erro ao conectar ao Supabase.');
      }
      return;
    }

    // Sucesso: navega para a área logada da comunidade
    this.router.navigate(['/comunidade/preview']);
  }

  // Handlers de Recuperação de Senha
  onRecuperarEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.recuperarEmail.set(target.value);
    if (this.erroRecuperacao()) this.erroRecuperacao.set(null);
  }

  async executarRecuperacaoSenha(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.recuperarEmail().trim();

    if (!email) {
      this.erroRecuperacao.set('Por favor, informe o e-mail cadastrado.');
      return;
    }

    this.processandoRecuperacao.set(true);
    this.erroRecuperacao.set(null);

    const { error } = await this.supabaseService.resetPasswordForEmail(email);
    this.processandoRecuperacao.set(false);

    if (error) {
      // Exibir erro genérico por segurança
      console.warn('Erro ao solicitar reset de senha:', error.message);
    }

    // Mensagem de sucesso genérica para proteger enumeração de e-mails
    this.recuperacaoEnviada.set(true);
  }

  // Handlers de Nova Senha (Redefinição)
  onNovaSenhaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.novaSenha.set(target.value);
    if (this.erroRedefinicao()) this.erroRedefinicao.set(null);
  }

  onConfirmaNovaSenhaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.confirmaNovaSenha.set(target.value);
    if (this.erroRedefinicao()) this.erroRedefinicao.set(null);
  }

  async executarSalvarNovaSenha(event: Event): Promise<void> {
    event.preventDefault();
    const s1 = this.novaSenha();
    const s2 = this.confirmaNovaSenha();

    if (!s1 || s1.length < 6) {
      this.erroRedefinicao.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (s1 !== s2) {
      this.erroRedefinicao.set('As senhas digitadas não coincidem.');
      return;
    }

    this.processandoRedefinicao.set(true);
    this.erroRedefinicao.set(null);

    const { error } = await this.supabaseService.updatePassword(s1);
    this.processandoRedefinicao.set(false);

    if (error) {
      this.erroRedefinicao.set('Não foi possível atualizar sua senha. O link pode ter expirado.');
      return;
    }

    this.senhaRedefinidaComSucesso.set(true);
  }

  // Handlers da Solicitação de Acesso
  onNomeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nome.set(target.value);
    if (this.exibirErroValidacao()) this.exibirErroValidacao.set(null);
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
    if (this.exibirErroValidacao()) this.exibirErroValidacao.set(null);
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
    if (this.exibirErroValidacao()) this.exibirErroValidacao.set(null);
  }

  onMotivoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.motivo.set(target.value);
  }

  async enviarSolicitacao(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.nome().trim() || !this.email().trim() || !this.perfil().trim()) {
      this.exibirErroValidacao.set('Por favor, preencha o Nome, E-mail e selecione o Tipo de Perfil.');
      return;
    }
    this.exibirErroValidacao.set(null);

    this.enviandoSolicitacao.set(true);
    const { error } = await this.supabaseService.criarSolicitacaoAcesso({
      nome: this.nome().trim(),
      email: this.email().trim(),
      telefone: this.telefone().trim(),
      tipoPerfil: this.perfil(),
      motivo: this.motivo().trim(),
    });
    this.enviandoSolicitacao.set(false);

    if (error) {
      this.exibirErroValidacao.set('Não foi possível enviar sua solicitação agora. Tente novamente em instantes.');
      return;
    }

    this.modoAcesso.set('solicitacao-sucesso');
  }
}
