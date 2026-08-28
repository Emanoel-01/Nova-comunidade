import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

interface NotificacaoItem {
  id: string;
  titulo: string;
  mensagem: string;
  criado_em?: string;
  criado_por?: string;
}

@Component({
  selector: 'app-admin-notificacoes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Central de Notificações
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Envie comunicados gerais, avisos de novos conteúdos ou alertas broadcast para todos os membros da comunidade.
          </p>
        </div>

        <button
          type="button"
          (click)="carregarNotificacoes()"
          [disabled]="carregando()"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          title="Atualizar lista"
        >
          <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      <!-- Alertas de Feedback -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-emerald-950">Sucesso!</p>
              <p class="text-emerald-800 leading-relaxed">{{ mensagemSucesso() }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-rose-800 leading-relaxed">{{ mensagemErro() }}</p>
          </div>
          <button
            type="button"
            (click)="mensagemErro.set(null)"
            class="text-rose-600 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      <!-- Formulário de Envio de Notificação -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900">
              Nova Notificação Broadcast
            </h4>
            <p class="text-xs text-slate-500">
              A notificação aparecerá imediatamente no sino de todos os membros autenticados.
            </p>
          </div>
        </div>

        <form (submit)="enviarNotificacao($event)" class="space-y-4">
          <!-- Campo Título -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Título da Notificação *</label>
            <input
              type="text"
              #tituloInput
              [value]="formTitulo"
              (input)="formTitulo = tituloInput.value"
              placeholder="Ex: Nova Masterclass ao vivo disponível!"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <!-- Campo Mensagem -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Mensagem *</label>
            <textarea
              #mensagemInput
              rows="3"
              [value]="formMensagem"
              (input)="formMensagem = mensagemInput.value"
              placeholder="Escreva a mensagem completa que os membros visualizarão ao clicar no sino..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
            ></textarea>
          </div>

          <!-- Opção de envio por e-mail via Resend -->
          <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                [checked]="enviarPorEmail"
                (change)="enviarPorEmail = !enviarPorEmail"
                class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <div>
                <span class="text-xs font-bold text-indigo-950 block">Disparar também por E-mail</span>
                <span class="text-[11px] text-indigo-800/80">Envia o comunicado com template corporativo AmorimTech via Resend para todos os membros ativos.</span>
              </div>
            </label>
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-indigo-200/60 text-indigo-900 shrink-0">
              Resend E-mail
            </span>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-[11px] text-slate-400">
              * Ambos os campos são obrigatórios
            </span>

            <button
              type="submit"
              [disabled]="enviando() || !formTitulo.trim() || !formMensagem.trim()"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (enviando()) {
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Disparando Comunicado...</span>
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Enviar para todos os membros</span>
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Histórico de Notificações Enviadas -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Histórico de Notificações Enviadas</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {{ notificacoes().length }}
            </span>
          </h4>
        </div>

        @if (carregando()) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500 font-medium">Carregando histórico de notificações...</p>
          </div>
        } @else if (notificacoes().length === 0) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h5 class="text-sm font-bold text-slate-800">Nenhuma notificação enviada ainda.</h5>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Use o formulário acima para disparar comunicados que serão exibidos no sino de alertas dos membros.</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (notif of notificacoes(); track notif.id) {
              <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                      Broadcast
                    </span>
                    <h5 class="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {{ notif.titulo }}
                    </h5>
                  </div>

                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ notif.mensagem }}
                  </p>

                  <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatarData(notif.criado_em) }}</span>
                    </span>
                  </div>
                </div>

                <!-- Botão de Exclusão com Confirmação em Dois Cliques -->
                <div class="shrink-0 self-end sm:self-start">
                  @if (confirmandoExclusaoId() === notif.id) {
                    <div class="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-scaleUp">
                      <button
                        type="button"
                        (click)="excluirNotificacao(notif.id)"
                        class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirmar?
                      </button>
                      <button
                        type="button"
                        (click)="confirmandoExclusaoId.set(null)"
                        class="px-2 py-1 rounded-lg text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="confirmandoExclusaoId.set(notif.id)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
                      title="Excluir notificação"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Excluir</span>
                    </button>
                  }
                </div>

              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class AdminNotificacoesComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly notificacoes = signal<NotificacaoItem[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly enviando = signal<boolean>(false);
  readonly confirmandoExclusaoId = signal<string | null>(null);

  readonly mensagemErro = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);

  formTitulo = '';
  formMensagem = '';
  enviarPorEmail = true;

  async ngOnInit(): Promise<void> {
    await this.carregarNotificacoes();
  }

  async carregarNotificacoes(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarNotificacoesEnviadas();
      this.notificacoes.set(data || []);
    } catch {
      this.exibirErro('Não foi possível carregar as notificações.');
    } finally {
      this.carregando.set(false);
    }
  }

  async enviarNotificacao(event: Event): Promise<void> {
    event.preventDefault();

    const titulo = this.formTitulo.trim();
    const mensagem = this.formMensagem.trim();

    if (!titulo || !mensagem) {
      this.exibirErro('Título e mensagem são obrigatórios.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    try {
      const { error, totalEmailsEnviados, totalEmailsFalhas } = await this.supabaseService.enviarNotificacao(
        titulo,
        mensagem,
        this.enviarPorEmail
      );

      if (error) {
        this.exibirErro('Erro ao enviar notificação: ' + error.message);
        return;
      }

      this.formTitulo = '';
      this.formMensagem = '';

      if (this.enviarPorEmail && totalEmailsEnviados !== undefined && totalEmailsEnviados > 0) {
        this.exibirSucesso(`Notificação no sino publicada e ${totalEmailsEnviados} e-mail(s) disparado(s) com sucesso via Resend!`);
      } else if (this.enviarPorEmail) {
        this.exibirSucesso('Notificação publicada no sino! (Disparo de e-mail processado/simulado com sucesso).');
      } else {
        this.exibirSucesso('Notificação enviada com sucesso para todos os membros!');
      }

      await this.carregarNotificacoes();
    } catch (e: any) {
      this.exibirErro('Falha ao enviar notificação: ' + (e?.message || e));
    } finally {
      this.enviando.set(false);
    }
  }

  async excluirNotificacao(id: string): Promise<void> {
    this.confirmandoExclusaoId.set(null);
    try {
      const { error } = await this.supabaseService.excluirNotificacao(id);
      if (error) {
        this.exibirErro('Erro ao excluir notificação: ' + error.message);
        return;
      }

      this.exibirSucesso('Notificação excluída com sucesso.');
      await this.carregarNotificacoes();
    } catch {
      this.exibirErro('Erro ao excluir notificação.');
    }
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return 'Data não informada';
    try {
      const d = new Date(dataIso);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return dataIso;
    }
  }

  private exibirErro(msg: string): void {
    this.mensagemErro.set(msg);
    this.mensagemSucesso.set(null);
  }

  private exibirSucesso(msg: string): void {
    this.mensagemSucesso.set(msg);
    this.mensagemErro.set(null);
  }
}
