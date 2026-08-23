import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface PortfolioProjetoAdmin {
  id: string;
  titulo: string;
  ano?: string | null;
  cliente?: string | null;
  local?: string | null;
  imagem_url: string;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
}

@Component({
  selector: 'app-admin-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Notificações / Feedbacks -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ mensagemSucesso() }}</span>
          </div>
          <button type="button" (click)="mensagemSucesso.set(null)" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ mensagemErro() }}</span>
          </div>
          <button type="button" (click)="mensagemErro.set(null)" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
      }

      <!-- Cabeçalho -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Portfólio de Projetos — Amorim Arquitetura
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Gerencie os projetos exibidos no carrossel de portfólio da página institucional e no contador de projetos executados.
          </p>
        </div>

        @if (!formularioAberto()) {
          <button
            type="button"
            (click)="abrirFormularioCriacao()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Projeto</span>
          </button>
        }
      </div>

      <!-- Formulário de Criação / Edição -->
      @if (formularioAberto()) {
        <div class="bg-indigo-50/60 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm animate-scaleUp">
          <div class="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h4 class="text-base font-bold text-slate-900">
              {{ editandoId() ? 'Editar Projeto do Portfólio' : 'Cadastrar Novo Projeto' }}
            </h4>
            <button
              type="button"
              (click)="fecharFormulario()"
              class="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5 sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700">Título do Projeto *</label>
              <input
                type="text"
                #tituloInput
                [value]="formDados.titulo"
                (input)="formDados.titulo = tituloInput.value"
                placeholder="Ex: Reforma do Mercado de Itapissuma"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Cliente / Órgão</label>
              <input
                type="text"
                #clienteInput
                [value]="formDados.cliente"
                (input)="formDados.cliente = clienteInput.value"
                placeholder="Ex: SETUR ou Privado"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Localidade / Cidade</label>
              <input
                type="text"
                #localInput
                [value]="formDados.local"
                (input)="formDados.local = localInput.value"
                placeholder="Ex: Recife/PE ou Itapissuma/PE"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Ano</label>
              <input
                type="text"
                #anoInput
                [value]="formDados.ano"
                (input)="formDados.ano = anoInput.value"
                placeholder="Ex: 2024"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Ordem de Exibição</label>
              <input
                type="number"
                #ordemInput
                [value]="formDados.ordem"
                (input)="formDados.ordem = +ordemInput.value"
                min="0"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5 sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700">URL da Imagem *</label>
              <input
                type="text"
                #imagemInput
                [value]="formDados.imagem_url"
                (input)="formDados.imagem_url = imagemInput.value; previewErro = false"
                placeholder="https://images.unsplash.com/... ou link público de imagem"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <!-- Pré-visualização da imagem -->
            @if (formDados.imagem_url) {
              <div class="space-y-1.5 sm:col-span-2 pt-2">
                <label class="block text-xs font-bold text-slate-700">Prévia da Imagem</label>
                <div class="p-3 bg-white rounded-2xl border border-slate-200 max-w-xs shadow-xs">
                  <img
                    [src]="formDados.imagem_url"
                    [alt]="formDados.titulo || 'Prévia'"
                    class="w-full h-44 rounded-xl object-cover"
                    referrerpolicy="no-referrer"
                    (error)="previewErro = true"
                  />
                  @if (previewErro) {
                    <p class="text-[11px] text-rose-600 font-semibold mt-1">⚠️ Não foi possível carregar a imagem. Verifique se a URL está correta e com acesso público.</p>
                  }
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              [disabled]="salvando()"
              (click)="fecharFormulario()"
              class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              [disabled]="salvando() || !formDados.titulo.trim() || !formDados.imagem_url.trim()"
              (click)="salvar()"
              class="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              @if (salvando()) {
                <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Salvando...</span>
              } @else {
                <span>{{ editandoId() ? 'Atualizar Projeto' : 'Salvar Projeto' }}</span>
              }
            </button>
          </div>
        </div>
      }

      <!-- Tabela / Lista de Projetos -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-sm text-slate-800">Projetos Cadastrados</h4>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {{ projetos().length }}
            </span>
          </div>

          <button
            type="button"
            (click)="carregarProjetos()"
            [disabled]="carregando()"
            class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>
        </div>

        @if (carregando() && projetos().length === 0) {
          <div class="py-16 text-center text-slate-400 text-xs sm:text-sm">
            <div class="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
            Carregando projetos do portfólio...
          </div>
        } @else if (projetos().length === 0) {
          <div class="py-16 text-center space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🏢
            </div>
            <p class="text-sm font-semibold text-slate-700">Nenhum projeto cadastrado ainda</p>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              Cadastre os projetos e laudos técnicos executados para alimentar o carrossel e o contador de prova social.
            </p>
            <button
              type="button"
              (click)="abrirFormularioCriacao()"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>+ Cadastrar primeiro projeto</span>
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th class="py-3 px-4 w-12 text-center">Ordem</th>
                  <th class="py-3 px-4 w-20">Foto</th>
                  <th class="py-3 px-4">Projeto / Metadados</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of projetos(); track item.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <!-- Ordem -->
                    <td class="py-3 px-4 text-center font-mono font-bold text-slate-500">
                      {{ item.ordem }}
                    </td>

                    <!-- Miniatura -->
                    <td class="py-3 px-4">
                      <div class="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          [src]="item.imagem_url"
                          [alt]="item.titulo"
                          class="w-full h-full object-cover"
                          referrerpolicy="no-referrer"
                        />
                      </div>
                    </td>

                    <!-- Projeto / Metadados -->
                    <td class="py-3 px-4 space-y-1">
                      <div class="font-bold text-slate-900">{{ item.titulo }}</div>
                      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        @if (item.cliente) {
                          <span class="inline-flex items-center gap-1">
                            <span class="text-slate-400">Cliente:</span>
                            <span class="font-medium text-slate-700">{{ item.cliente }}</span>
                          </span>
                        }
                        @if (item.local) {
                          <span class="inline-flex items-center gap-1">
                            <span class="text-slate-400">• Local:</span>
                            <span class="font-medium text-slate-700">{{ item.local }}</span>
                          </span>
                        }
                        @if (item.ano) {
                          <span class="inline-flex items-center gap-1">
                            <span class="text-slate-400">• Ano:</span>
                            <span class="font-medium text-slate-700">{{ item.ano }}</span>
                          </span>
                        }
                      </div>
                    </td>

                    <!-- Toggle Ativo / Inativo -->
                    <td class="py-3 px-4 text-center">
                      <button
                        type="button"
                        (click)="alternarStatus(item)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer"
                        [class]="item.ativo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [class]="item.ativo ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        <span>{{ item.ativo ? 'Ativo' : 'Inativo' }}</span>
                      </button>
                    </td>

                    <!-- Ações -->
                    <td class="py-3 px-4 text-right">
                      <div class="inline-flex items-center gap-2">
                        <button
                          type="button"
                          (click)="iniciarEdicao(item)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Editar projeto"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        @if (confirmacaoExclusaoId() === item.id) {
                          <div class="inline-flex items-center gap-1 animate-fadeIn">
                            <button
                              type="button"
                              (click)="confirmarExclusao(item.id)"
                              class="px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              Confirmar?
                            </button>
                            <button
                              type="button"
                              (click)="confirmacaoExclusaoId.set(null)"
                              class="px-1.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        } @else {
                          <button
                            type="button"
                            (click)="confirmacaoExclusaoId.set(item.id)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir projeto"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminPortfolioComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly projetos = signal<PortfolioProjetoAdmin[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly formularioAberto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly confirmacaoExclusaoId = signal<string | null>(null);

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  previewErro = false;

  formDados = {
    titulo: '',
    ano: '',
    cliente: '',
    local: '',
    imagem_url: '',
    ordem: 0
  };

  async ngOnInit(): Promise<void> {
    await this.carregarProjetos();
  }

  async carregarProjetos(): Promise<void> {
    this.carregando.set(true);
    try {
      const lista = await this.supabaseService.listarTodoPortfolioAdmin();
      this.projetos.set(lista || []);
    } catch {
      this.projetos.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  abrirFormularioCriacao(): void {
    this.editandoId.set(null);
    this.formDados = {
      titulo: '',
      ano: new Date().getFullYear().toString(),
      cliente: '',
      local: 'Recife/PE',
      imagem_url: '',
      ordem: this.projetos().length + 1
    };
    this.previewErro = false;
    this.formularioAberto.set(true);
  }

  iniciarEdicao(projeto: PortfolioProjetoAdmin): void {
    this.editandoId.set(projeto.id);
    this.formDados = {
      titulo: projeto.titulo || '',
      ano: projeto.ano || '',
      cliente: projeto.cliente || '',
      local: projeto.local || '',
      imagem_url: projeto.imagem_url || '',
      ordem: projeto.ordem || 0
    };
    this.previewErro = false;
    this.formularioAberto.set(true);
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.editandoId.set(null);
  }

  async salvar(): Promise<void> {
    if (!this.formDados.titulo.trim() || !this.formDados.imagem_url.trim()) {
      this.mensagemErro.set('Preencha os campos obrigatórios (Título e URL da Imagem).');
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const payload = {
      titulo: this.formDados.titulo.trim(),
      ano: this.formDados.ano.trim() || undefined,
      cliente: this.formDados.cliente.trim() || undefined,
      local: this.formDados.local.trim() || undefined,
      imagem_url: this.formDados.imagem_url.trim(),
      ordem: this.formDados.ordem
    };

    if (this.editandoId()) {
      const { error } = await this.supabaseService.atualizarProjetoPortfolio(this.editandoId()!, payload);
      if (error) {
        this.mensagemErro.set('Erro ao atualizar projeto: ' + (error.message || 'Falha na requisição'));
      } else {
        this.mensagemSucesso.set('Projeto atualizado com sucesso!');
        this.fecharFormulario();
        await this.carregarProjetos();
      }
    } else {
      const { error } = await this.supabaseService.criarProjetoPortfolio(payload);
      if (error) {
        this.mensagemErro.set('Erro ao cadastrar projeto: ' + (error.message || 'Falha na requisição'));
      } else {
        this.mensagemSucesso.set('Projeto cadastrado com sucesso!');
        this.fecharFormulario();
        await this.carregarProjetos();
      }
    }

    this.salvando.set(false);
  }

  async alternarStatus(projeto: PortfolioProjetoAdmin): Promise<void> {
    const novoStatus = !projeto.ativo;
    const { error } = await this.supabaseService.atualizarProjetoPortfolio(projeto.id, { ativo: novoStatus });
    if (!error) {
      this.projetos.update(lista =>
        lista.map(p => (p.id === projeto.id ? { ...p, ativo: novoStatus } : p))
      );
      this.mensagemSucesso.set(`Projeto ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } else {
      this.mensagemErro.set('Erro ao alternar status do projeto.');
    }
  }

  async confirmarExclusao(id: string): Promise<void> {
    const { error } = await this.supabaseService.excluirProjetoPortfolio(id);
    if (!error) {
      this.projetos.update(lista => lista.filter(p => p.id !== id));
      this.confirmacaoExclusaoId.set(null);
      this.mensagemSucesso.set('Projeto excluído com sucesso!');
    } else {
      this.mensagemErro.set('Erro ao excluir projeto.');
    }
  }
}
