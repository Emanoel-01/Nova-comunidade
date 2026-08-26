import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

type FiltroStatus = 'pendente' | 'aprovado' | 'recusado' | 'todos';

interface SolicitacaoAcessoItem {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  tipo_perfil: string;
  motivo?: string | null;
  status: 'pendente' | 'aprovado' | 'recusado';
  criado_em?: string;
  analisado_em?: string | null;
  analisado_por?: string | null;
}

@Component({
  selector: 'app-admin-acessos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Solicitações de Acesso & Convites
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Gerencie os pedidos de entrada na Comunidade e nos módulos da plataforma.
          </p>
        </div>

        <!-- Botão Atualizar Lista -->
        <button
          type="button"
          (click)="carregarSolicitacoes()"
          [disabled]="carregando()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      <!-- Alerta de Sucesso / Próximo Passo -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="space-y-1">
              <p class="font-bold text-emerald-950">Sucesso!</p>
              <p class="text-emerald-800 leading-relaxed">{{ mensagemSucesso() }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Alerta de Erro -->
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
            class="text-rose-600 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100/50 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Filtros por Status (Pills) -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
        <button
          type="button"
          (click)="alterarFiltro('pendente')"
          [class]="filtroStatus() === 'pendente'
            ? 'px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs transition-all'
            : 'px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
        >
          Pendentes
        </button>

        <button
          type="button"
          (click)="alterarFiltro('aprovado')"
          [class]="filtroStatus() === 'aprovado'
            ? 'px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-xs transition-all'
            : 'px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
        >
          Aprovados
        </button>

        <button
          type="button"
          (click)="alterarFiltro('recusado')"
          [class]="filtroStatus() === 'recusado'
            ? 'px-4 py-2 rounded-xl bg-white text-rose-800 font-bold text-xs shadow-xs transition-all'
            : 'px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
        >
          Recusados
        </button>

        <button
          type="button"
          (click)="alterarFiltro('todos')"
          [class]="filtroStatus() === 'todos'
            ? 'px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs transition-all'
            : 'px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
        >
          Todos
        </button>
      </div>

      <!-- Conteúdo: Carregando -->
      @if (carregando()) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-500 font-medium">Buscando solicitações no banco de dados...</p>
        </div>
      } @else {

        <!-- Lista de Solicitações -->
        @if (solicitacoes().length > 0) {
          <div class="grid grid-cols-1 gap-4">
            @for (item of solicitacoes(); track item.id) {
              <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4">
                
                <!-- Cabeçalho do Card: Nome, Tipo de Perfil e Data -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold text-sm flex items-center justify-center shrink-0">
                      {{ getIniciais(item.nome) }}
                    </div>
                    <div>
                      <h4 class="text-base font-bold text-slate-900 leading-tight">
                        {{ item.nome }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {{ formatarPerfil(item.tipo_perfil) }}
                        </span>
                        
                        @if (item.status === 'pendente') {
                          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pendente
                          </span>
                        } @else if (item.status === 'aprovado') {
                          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Aprovado
                          </span>
                        } @else if (item.status === 'recusado') {
                          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Recusado
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="text-right sm:text-right text-xs text-slate-400">
                    <span>Solicitado em {{ formatarData(item.criado_em) }}</span>
                  </div>
                </div>

                <!-- Dados de Contato & Informações -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div class="flex items-center gap-2 text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium truncate">{{ item.email }}</span>
                  </div>

                  <div class="flex items-center gap-2 text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="font-medium truncate">{{ item.telefone || 'Telefone não informado' }}</span>
                  </div>
                </div>

                <!-- Motivo / Justificativa (se houver) -->
                @if (item.motivo) {
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-1">
                    <span class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">Motivo / Interesse:</span>
                    <p class="italic leading-relaxed whitespace-pre-line text-slate-800">{{ item.motivo }}</p>
                  </div>
                }

                <!-- Rodapé: Ações (Pendente) ou Histórico de Análise -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  
                  @if (item.status === 'pendente') {
                    <div class="text-xs text-slate-400 italic">
                      Aguardando avaliação do administrador
                    </div>

                    <div class="flex items-center gap-2 self-end sm:self-auto">
                      <!-- Botão Recusar -->
                      <button
                        type="button"
                        (click)="recusarSolicitacao(item)"
                        [disabled]="processandoId() === item.id"
                        class="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        @if (processandoId() === item.id) {
                          <svg class="animate-spin h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        } @else {
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        }
                        <span>Recusar</span>
                      </button>

                      <!-- Botão Aprovar -->
                      <button
                        type="button"
                        (click)="aprovarSolicitacao(item)"
                        [disabled]="processandoId() === item.id"
                        class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        @if (processandoId() === item.id) {
                          <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        } @else {
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                        <span>Aprovar</span>
                      </button>
                    </div>
                  } @else {
                    <div class="text-xs text-slate-500 flex items-center gap-2">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Analisado em {{ formatarData(item.analisado_em) }}
                      </span>
                    </div>
                  }

                </div>

              </div>
            }
          </div>
        } @else {
          <!-- Estado Vazio -->
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div class="space-y-1">
              <h4 class="text-base font-bold text-slate-800">
                {{ getMensagemVazia() }}
              </h4>
              <p class="text-xs text-slate-500">
                Novas solicitações submetidas pelo formulário da comunidade aparecerão aqui em tempo real.
              </p>
            </div>
          </div>
        }

      }

    </div>
  `
})
export class AdminAcessosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly filtroStatus = signal<FiltroStatus>('pendente');
  readonly solicitacoes = signal<SolicitacaoAcessoItem[]>([]);
  readonly carregando = signal(false);
  readonly processandoId = signal<string | null>(null);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  alterarFiltro(novoFiltro: FiltroStatus): void {
    this.filtroStatus.set(novoFiltro);
    this.carregarSolicitacoes();
  }

  async carregarSolicitacoes(): Promise<void> {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    const filtro = this.filtroStatus();
    const statusParam = filtro === 'todos' ? undefined : filtro;

    try {
      const data = await this.supabaseService.listarSolicitacoesAcesso(statusParam);
      this.solicitacoes.set(data);
    } catch (e: any) {
      this.mensagemErro.set('Erro ao carregar solicitações de acesso. Verifique a conexão com o Supabase.');
    } finally {
      this.carregando.set(false);
    }
  }

  async aprovarSolicitacao(item: SolicitacaoAcessoItem): Promise<void> {
    this.processandoId.set(item.id);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    try {
      const session = await this.supabaseService.getSession();
      const adminId = session?.user?.id ?? null;

      // 1. Atualiza o status da solicitação para aprovado
      const { error: erroStatus } = await this.supabaseService.atualizarStatusSolicitacao(item.id, 'aprovado', adminId);

      if (erroStatus) {
        this.mensagemErro.set(`Não foi possível aprovar a solicitação: ${erroStatus.message || 'erro no servidor'}`);
        return;
      }

      // 2. Normaliza o e-mail e verifica se já existe na tabela de profissionais
      const emailNormalizado = (item.email || '').trim().toLowerCase();
      let jaExistia = false;

      try {
        const profissionalExistente = await this.supabaseService.buscarProfissionalPorEmail(emailNormalizado);

        if (!profissionalExistente) {
          // Cria o registro na tabela profissionais para aparecer em Gestão de Usuários
          const { error: erroCadastro } = await this.supabaseService.cadastrarProfissional({
            full_name: item.nome,
            email: emailNormalizado,
          });

          if (erroCadastro) {
            console.warn('Aviso ao registrar profissional após aprovação:', erroCadastro.message);
            this.mensagemSucesso.set(
              `Solicitação aprovada, porém houve um aviso ao vincular em Gestão de Usuários (${erroCadastro.message}). Verifique a aba Gestão de Usuários.`
            );
            await this.carregarSolicitacoes();
            return;
          }
        } else {
          jaExistia = true;
        }
      } catch (errProf: any) {
        console.warn('Erro ao verificar/cadastrar profissional em Gestão de Usuários:', errProf);
        this.mensagemSucesso.set(
          `Solicitação aprovada. Ocorreu um erro ao verificar o cadastro em Gestão de Usuários (${errProf?.message || errProf}).`
        );
        await this.carregarSolicitacoes();
        return;
      }

      // 3. Define a mensagem de sucesso refletindo o estado real
      if (jaExistia) {
        this.mensagemSucesso.set(
          `Solicitação aprovada. ${item.nome} já possui registro em Gestão de Usuários (${item.email}). Para acessar a Comunidade, basta a pessoa acessar ou criar seu login com este mesmo e-mail.`
        );
      } else {
        this.mensagemSucesso.set(
          `Solicitação aprovada. ${item.nome} já aparece em Gestão de Usuários. Para acessar a Comunidade, a pessoa precisa criar login com o e-mail ${item.email} na tela de cadastro do site.`
        );
      }

      await this.carregarSolicitacoes();
    } catch (e: any) {
      this.mensagemErro.set('Ocorreu uma falha inesperada ao aprovar a solicitação.');
    } finally {
      this.processandoId.set(null);
    }
  }

  async recusarSolicitacao(item: SolicitacaoAcessoItem): Promise<void> {
    this.processandoId.set(item.id);
    this.mensagemErro.set(null);

    try {
      const session = await this.supabaseService.getSession();
      const adminId = session?.user?.id ?? null;

      const { error } = await this.supabaseService.atualizarStatusSolicitacao(item.id, 'recusado', adminId);

      if (error) {
        this.mensagemErro.set(`Não foi possível recusar a solicitação: ${error.message || 'erro no servidor'}`);
        return;
      }

      await this.carregarSolicitacoes();
    } catch (e: any) {
      this.mensagemErro.set('Ocorreu uma falha inesperada ao recusar a solicitação.');
    } finally {
      this.processandoId.set(null);
    }
  }

  getMensagemVazia(): string {
    const filtro = this.filtroStatus();
    if (filtro === 'pendente') return 'Nenhuma solicitação pendente no momento.';
    if (filtro === 'aprovado') return 'Nenhuma solicitação aprovada no momento.';
    if (filtro === 'recusado') return 'Nenhuma solicitação recusada no momento.';
    return 'Nenhuma solicitação encontrada no momento.';
  }

  formatarPerfil(tipo: string): string {
    const mapa: Record<string, string> = {
      'engenharia': 'Engenharia Civil',
      'arquitetura': 'Arquitetura & Urbanismo',
      'gestao_obras': 'Gestão & Execução de Obras',
      'pericia_patologia': 'Perícia & Patologia',
      'estudante': 'Estudante / Acadêmico',
      'outro': 'Outro Profissional',
    };
    return mapa[tipo] || tipo;
  }

  formatarData(dataStr?: string | null): string {
    if (!dataStr) return '—';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataStr;
    }
  }

  getIniciais(nome?: string): string {
    if (!nome) return 'SO';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
}
