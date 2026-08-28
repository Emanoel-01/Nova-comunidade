import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface PremioGamificacao {
  id: string;
  mes: number;
  ano: number;
  posicao: number;
  titulo: string;
  descricao?: string | null;
  imagem_url?: string | null;
  ativo: boolean;
  criado_em?: string;
}

@Component({
  selector: 'app-admin-premios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- 1. Cabeçalho da Seção -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center font-bold text-lg shadow-xs">
                🏆
              </div>
              <span class="text-xs font-black uppercase tracking-wider text-amber-800">Hall da Fama & Gamificação</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Prêmios Mensais
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Cadastre e gerencie as premiações oficiais em disputa para os membros mais bem colocados do Hall da Fama no ecossistema Business 4.0.
            </p>
          </div>

          <!-- Ação Principal -->
          <div class="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-novo-premio"
              (click)="abrirModalCriacao()"
              class="px-5 py-3 rounded-2xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Prêmio</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Filtros e Contadores -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro Ano -->
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Ano:</span>
            <select
              id="filtro-ano"
              [value]="filtroAno()"
              (change)="onFiltroAnoChange($event)"
              class="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs cursor-pointer"
            >
              <option [value]="0">Todos os Anos</option>
              @for (a of anosDisponiveis; track a) {
                <option [value]="a">{{ a }}</option>
              }
            </select>
          </div>

          <!-- Filtro Mês -->
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>Mês:</span>
            <select
              id="filtro-mes"
              [value]="filtroMes()"
              (change)="onFiltroMesChange($event)"
              class="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs cursor-pointer"
            >
              <option [value]="0">Todos os Meses</option>
              @for (m of meses; track m.valor) {
                <option [value]="m.valor">{{ m.nome }}</option>
              }
            </select>
          </div>
        </div>

        <div class="text-xs text-slate-500 font-medium">
          Total de Prêmios: <strong class="text-slate-800 font-bold">{{ premiosFiltrados().length }}</strong>
        </div>
      </div>

      <!-- 3. Mensagens de Alerta / Sucesso -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div class="flex items-center gap-2">
            <span>✅</span>
            <span>{{ mensagemSucesso() }}</span>
          </div>
          <button type="button" (click)="mensagemSucesso.set(null)" class="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div class="flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ mensagemErro() }}</span>
          </div>
          <button type="button" (click)="mensagemErro.set(null)" class="text-rose-600 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      }

      <!-- 4. Listagem dos Prêmios -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        @if (carregando()) {
          <div class="p-12 text-center space-y-3">
            <div class="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500 font-medium">Carregando prêmios do Hall da Fama...</p>
          </div>
        } @else if (premiosFiltrados().length === 0) {
          <div class="p-12 text-center space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 mx-auto flex items-center justify-center text-2xl shadow-inner">
              🏆
            </div>
            <h4 class="text-base font-bold text-slate-800">Nenhum prêmio cadastrado</h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Não encontramos prêmios para o filtro selecionado. Clique no botão "Novo Prêmio" acima para adicionar uma premiação.
            </p>
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (p of premiosFiltrados(); track p.id) {
              <div class="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start gap-4 min-w-0">
                  <!-- Medalha / Posição -->
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs"
                    [class]="getPosicaoBadgeClass(p.posicao)"
                  >
                    <span class="text-xl">{{ getMedalhaIcone(p.posicao) }}</span>
                  </div>

                  <!-- Miniatura Imagem se houver -->
                  @if (p.imagem_url) {
                    <div class="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        [src]="p.imagem_url"
                        [alt]="p.titulo"
                        class="w-full h-full object-cover"
                        referrerpolicy="no-referrer"
                      />
                    </div>
                  }

                  <!-- Detalhes do Prêmio -->
                  <div class="space-y-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-black text-slate-900">
                        {{ getPosicaoTexto(p.posicao) }}
                      </span>
                      <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {{ getNomeMes(p.mes) }} / {{ p.ano }}
                      </span>
                      @if (p.ativo) {
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● Ativo
                        </span>
                      } @else {
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Inativo
                        </span>
                      }
                    </div>

                    <h4 class="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {{ p.titulo }}
                    </h4>

                    @if (p.descricao) {
                      <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {{ p.descricao }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Ações -->
                <div class="flex items-center gap-2 self-end md:self-center shrink-0">
                  <!-- Toggle Ativo -->
                  <button
                    type="button"
                    (click)="toggleStatus(p)"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                    [class]="p.ativo 
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  >
                    {{ p.ativo ? 'Desativar' : 'Ativar' }}
                  </button>

                  <!-- Editar -->
                  <button
                    type="button"
                    (click)="abrirModalEdicao(p)"
                    class="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                    title="Editar Prêmio"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Excluir -->
                  <button
                    type="button"
                    (click)="confirmarExclusao(p)"
                    class="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shadow-2xs"
                    title="Excluir Prêmio"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- ======================================================= -->
      <!-- MODAL: CRIAR OU EDITAR PRÊMIO                           -->
      <!-- ======================================================= -->
      @if (modalAberto()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-scaleUp overflow-y-auto max-h-[90vh]">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base border border-amber-200/60">
                  🏆
                </div>
                <h3 class="text-lg font-black text-slate-900">
                  {{ premioEditando() ? 'Editar Prêmio' : 'Novo Prêmio do Hall da Fama' }}
                </h3>
              </div>
              <button
                type="button"
                (click)="fecharModal()"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form (submit)="salvarPremio($event)" class="space-y-4">
              <!-- Mês e Ano -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1">
                  <label for="form-mes" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Mês de Vigência <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="form-mes"
                    [value]="formMes()"
                    (change)="onFormMesChange($event)"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    @for (m of meses; track m.valor) {
                      <option [value]="m.valor">{{ m.nome }}</option>
                    }
                  </select>
                </div>

                <div class="space-y-1">
                  <label for="form-ano" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Ano <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-ano"
                    type="number"
                    [value]="formAno()"
                    (input)="onFormAnoInput($event)"
                    min="2020"
                    max="2030"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <!-- Posição no Ranking -->
              <div class="space-y-1">
                <label for="form-posicao" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Posição no Ranking <span class="text-rose-500">*</span>
                </label>
                <select
                  id="form-posicao"
                  [value]="formPosicao()"
                  (change)="onFormPosicaoChange($event)"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option [value]="1">🥇 1º Lugar (Campeão - Medalha de Ouro)</option>
                  <option [value]="2">🥈 2º Lugar (Vice-Campeão - Medalha de Prata)</option>
                  <option [value]="3">🥉 3º Lugar (3º Colocado - Medalha de Bronze)</option>
                  <option [value]="4">4º Lugar</option>
                  <option [value]="5">5º Lugar</option>
                </select>
              </div>

              <!-- Título do Prêmio -->
              <div class="space-y-1">
                <label for="form-titulo" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Título do Prêmio <span class="text-rose-500">*</span>
                </label>
                <input
                  id="form-titulo"
                  type="text"
                  [value]="formTitulo()"
                  (input)="onFormTituloInput($event)"
                  placeholder="Ex: Troféu Físico Exclusivo + Mentoria Individual + Licença Anual"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <!-- Descrição / Benefícios -->
              <div class="space-y-1">
                <label for="form-descricao" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Descrição e Benefícios
                </label>
                <textarea
                  id="form-descricao"
                  rows="3"
                  [value]="formDescricao()"
                  (input)="onFormDescricaoInput($event)"
                  placeholder="Detalhes sobre a entrega, premiação, benefícios adicionais..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                ></textarea>
              </div>

              <!-- URL da Imagem -->
              <div class="space-y-1">
                <label for="form-imagem" class="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  URL da Imagem / Banner do Prêmio (Opcional)
                </label>
                <input
                  id="form-imagem"
                  type="url"
                  [value]="formImagemUrl()"
                  (input)="onFormImagemUrlInput($event)"
                  placeholder="https://exemplo.com/imagem-premio.jpg"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                @if (formImagemUrl()) {
                  <div class="mt-2 h-24 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      [src]="formImagemUrl()"
                      alt="Preview"
                      class="w-full h-full object-contain"
                      referrerpolicy="no-referrer"
                    />
                  </div>
                }
              </div>

              <!-- Status Ativo -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  id="form-ativo"
                  type="checkbox"
                  [checked]="formAtivo()"
                  (change)="onFormAtivoChange($event)"
                  class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
                <label for="form-ativo" class="text-xs font-bold text-slate-800 cursor-pointer">
                  Exibir prêmio em destaque na vitrine do Hall da Fama
                </label>
              </div>

              <!-- Botões de Ação -->
              <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  (click)="fecharModal()"
                  class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="salvando()"
                  class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs cursor-pointer transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  @if (salvando()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  }
                  <span>{{ premioEditando() ? 'Salvar Alterações' : 'Cadastrar Prêmio' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminPremiosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly carregando = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);
  readonly premios = signal<PremioGamificacao[]>([]);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Filtros
  readonly filtroAno = signal<number>(new Date().getFullYear());
  readonly filtroMes = signal<number>(0); // 0 = todos

  readonly anosDisponiveis = [2025, 2026, 2027, 2028];
  readonly meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' },
  ];

  // Modal
  readonly modalAberto = signal<boolean>(false);
  readonly premioEditando = signal<PremioGamificacao | null>(null);

  // Form Signals
  readonly formMes = signal<number>(new Date().getMonth() + 1);
  readonly formAno = signal<number>(new Date().getFullYear());
  readonly formPosicao = signal<number>(1);
  readonly formTitulo = signal<string>('');
  readonly formDescricao = signal<string>('');
  readonly formImagemUrl = signal<string>('');
  readonly formAtivo = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await this.carregarPremios();
  }

  async carregarPremios(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarPremiosGamificacao();
      this.premios.set(data || []);
    } catch (e: any) {
      console.warn('Erro ao carregar prêmios:', e);
      this.premios.set([]);
    } finally {
      this.carregando.set(false);
    }
  }

  premiosFiltrados(): PremioGamificacao[] {
    return this.premios().filter((p) => {
      const anoMatch = this.filtroAno() === 0 || p.ano === this.filtroAno();
      const mesMatch = this.filtroMes() === 0 || p.mes === this.filtroMes();
      return anoMatch && mesMatch;
    });
  }

  onFiltroAnoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroAno.set(Number(target.value));
  }

  onFiltroMesChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroMes.set(Number(target.value));
  }

  abrirModalCriacao(): void {
    this.premioEditando.set(null);
    this.formMes.set(new Date().getMonth() + 1);
    this.formAno.set(new Date().getFullYear());
    this.formPosicao.set(1);
    this.formTitulo.set('');
    this.formDescricao.set('');
    this.formImagemUrl.set('');
    this.formAtivo.set(true);
    this.modalAberto.set(true);
  }

  abrirModalEdicao(premio: PremioGamificacao): void {
    this.premioEditando.set(premio);
    this.formMes.set(premio.mes);
    this.formAno.set(premio.ano);
    this.formPosicao.set(premio.posicao);
    this.formTitulo.set(premio.titulo);
    this.formDescricao.set(premio.descricao || '');
    this.formImagemUrl.set(premio.imagem_url || '');
    this.formAtivo.set(premio.ativo);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.premioEditando.set(null);
  }

  onFormMesChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.formMes.set(Number(target.value));
  }

  onFormAnoInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formAno.set(Number(target.value));
  }

  onFormPosicaoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.formPosicao.set(Number(target.value));
  }

  onFormTituloInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formTitulo.set(target.value);
  }

  onFormDescricaoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.formDescricao.set(target.value);
  }

  onFormImagemUrlInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formImagemUrl.set(target.value);
  }

  onFormAtivoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formAtivo.set(target.checked);
  }

  async salvarPremio(event: Event): Promise<void> {
    event.preventDefault();
    const titulo = this.formTitulo().trim();
    if (!titulo) {
      this.mensagemErro.set('Por favor, informe o título do prêmio.');
      return;
    }

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    const editando = this.premioEditando();
    if (editando) {
      const { error } = await this.supabaseService.atualizarPremioGamificacao(editando.id, {
        mes: this.formMes(),
        ano: this.formAno(),
        posicao: this.formPosicao(),
        titulo: titulo,
        descricao: this.formDescricao().trim() || '',
        imagem_url: this.formImagemUrl().trim() || '',
        ativo: this.formAtivo(),
      });
      this.salvando.set(false);
      if (error) {
        this.mensagemErro.set('Erro ao atualizar prêmio: ' + error.message);
      } else {
        this.mensagemSucesso.set('Prêmio atualizado com sucesso!');
        this.fecharModal();
        await this.carregarPremios();
      }
    } else {
      const { error } = await this.supabaseService.criarPremioGamificacao({
        mes: this.formMes(),
        ano: this.formAno(),
        posicao: this.formPosicao(),
        titulo: titulo,
        descricao: this.formDescricao().trim() || '',
        imagem_url: this.formImagemUrl().trim() || '',
        ativo: this.formAtivo(),
      });
      this.salvando.set(false);
      if (error) {
        this.mensagemErro.set('Erro ao criar prêmio: ' + error.message);
      } else {
        this.mensagemSucesso.set('Prêmio cadastrado com sucesso!');
        this.fecharModal();
        await this.carregarPremios();
      }
    }
  }

  async toggleStatus(premio: PremioGamificacao): Promise<void> {
    const novoStatus = !premio.ativo;
    const { error } = await this.supabaseService.atualizarPremioGamificacao(premio.id, {
      ativo: novoStatus,
    });
    if (!error) {
      this.premios.update((lista) =>
        lista.map((p) => (p.id === premio.id ? { ...p, ativo: novoStatus } : p))
      );
      this.mensagemSucesso.set(`Status do prêmio alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
    } else {
      this.mensagemErro.set('Erro ao alterar status: ' + error.message);
    }
  }

  async confirmarExclusao(premio: PremioGamificacao): Promise<void> {
    if (!confirm(`Deseja realmente excluir o prêmio "${premio.titulo}" (${this.getNomeMes(premio.mes)}/${premio.ano})?`)) {
      return;
    }
    const { error } = await this.supabaseService.excluirPremioGamificacao(premio.id);
    if (!error) {
      this.premios.update((lista) => lista.filter((p) => p.id !== premio.id));
      this.mensagemSucesso.set('Prêmio excluído com sucesso.');
    } else {
      this.mensagemErro.set('Erro ao excluir prêmio: ' + error.message);
    }
  }

  getMedalhaIcone(posicao: number): string {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎖️';
    }
  }

  getPosicaoTexto(posicao: number): string {
    switch (posicao) {
      case 1:
        return '1º Lugar (Ouro)';
      case 2:
        return '2º Lugar (Prata)';
      case 3:
        return '3º Lugar (Bronze)';
      default:
        return `${posicao}º Lugar`;
    }
  }

  getPosicaoBadgeClass(posicao: number): string {
    switch (posicao) {
      case 1:
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 2:
        return 'bg-slate-100 border-slate-300 text-slate-700';
      case 3:
        return 'bg-amber-100/60 border-amber-400 text-amber-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  }

  getNomeMes(mes: number): string {
    const encontrado = this.meses.find((m) => m.valor === mes);
    return encontrado ? encontrado.nome : `Mês ${mes}`;
  }
}
