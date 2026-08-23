import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';

export interface DepoimentoAdmin {
  id: string;
  nome: string;
  cargo_ou_papel?: string | null;
  tipo?: 'imagem' | 'video';
  imagem_url?: string | null;
  vimeo_id?: string | null;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
}

@Component({
  selector: 'app-admin-depoimentos',
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
            Galeria de Provas Sociais & Depoimentos
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Gerencie os depoimentos em imagem ou vídeo Vimeo exibidos na página inicial pública.
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
            <span>Novo Depoimento</span>
          </button>
        }
      </div>

      <!-- Formulário de Criação / Edição -->
      @if (formularioAberto()) {
        <div class="bg-indigo-50/60 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm animate-scaleUp">
          <div class="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h4 class="text-base font-bold text-slate-900">
              {{ editandoId() ? 'Editar Depoimento' : (formDados.tipo === 'video' ? 'Novo Depoimento em Vídeo' : 'Novo Depoimento em Imagem') }}
            </h4>
            <button
              type="button"
              (click)="fecharFormulario()"
              class="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <!-- Seletor de Tipo (Imagem vs Vídeo Vimeo) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Tipo de Depoimento *</label>
            <div class="inline-flex p-1 bg-white border border-slate-200 rounded-2xl gap-1">
              <button
                type="button"
                (click)="formDados.tipo = 'imagem'"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                [class]="formDados.tipo === 'imagem' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
              >
                <span>🖼️</span>
                <span>Imagem (Print)</span>
              </button>
              <button
                type="button"
                (click)="formDados.tipo = 'video'"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                [class]="formDados.tipo === 'video' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
              >
                <span>🎬</span>
                <span>Vídeo (Vimeo)</span>
              </button>
            </div>
          </div>

          <!-- Nota de ajuda contextual -->
          @if (formDados.tipo === 'imagem') {
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-amber-800">
                <span>💡</span>
                <span>Dica para imagens hospedadas no Google Drive</span>
              </div>
              <p class="leading-relaxed text-amber-800/90">
                Para imagens do Google Drive, use o formato de thumbnail:
                <code class="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800 select-all">
                  https://drive.google.com/thumbnail?id=ID_DO_ARQUIVO&sz=w1000
                </code>
                <br />
                (O formato antigo <code class="bg-rose-100 px-1 text-rose-800 line-through">.../uc?export=view...</code> foi descontinuado pelo Google e gera erro 403.)
              </p>
            </div>
          } @else {
            <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-sky-800">
                <span>🎬</span>
                <span>Hospedagem no Vimeo</span>
              </div>
              <p class="leading-relaxed text-sky-800/90">
                Encontre o ID nos detalhes do vídeo no Vimeo — é a sequência numérica no final da URL do vídeo (exemplo: <code class="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">76979871</code> para <span class="font-mono">vimeo.com/76979871</span>).
              </p>
            </div>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Nome da Pessoa / Instituição *</label>
              <input
                type="text"
                #nomeInput
                [value]="formDados.nome"
                (input)="formDados.nome = nomeInput.value"
                placeholder="Ex: Amanda Aires Vieira"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Cargo / Papel / Legenda</label>
              <input
                type="text"
                #cargoInput
                [value]="formDados.cargo_ou_papel"
                (input)="formDados.cargo_ou_papel = cargoInput.value"
                placeholder="Ex: Depoimento Institucional ou Arquiteta e Urbanista"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            @if (formDados.tipo === 'imagem') {
              <div class="space-y-1.5 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700">URL da Imagem / Print *</label>
                <input
                  type="text"
                  #imagemInput
                  [value]="formDados.imagem_url"
                  (input)="formDados.imagem_url = imagemInput.value"
                  placeholder="https://drive.google.com/thumbnail?id=...&sz=w1000 ou link público Supabase"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            } @else {
              <div class="space-y-1.5 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700">ID do vídeo no Vimeo *</label>
                <input
                  type="text"
                  #vimeoInput
                  [value]="formDados.vimeo_id"
                  (input)="formDados.vimeo_id = vimeoInput.value"
                  placeholder="Ex: 76979871"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            }

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

            <!-- Pré-visualização -->
            @if (formDados.tipo === 'imagem' && formDados.imagem_url) {
              <div class="space-y-1.5 sm:col-span-2 pt-2">
                <label class="block text-xs font-bold text-slate-700">Prévia da Imagem</label>
                <div class="p-3 bg-white rounded-2xl border border-slate-200 max-w-xs shadow-xs">
                  <img
                    [src]="formDados.imagem_url"
                    [alt]="formDados.nome || 'Prévia'"
                    class="w-full h-auto rounded-xl object-contain"
                    referrerpolicy="no-referrer"
                    (error)="previewErro = true"
                  />
                  @if (previewErro) {
                    <p class="text-[11px] text-rose-600 font-semibold mt-1">⚠️ Não foi possível carregar a imagem. Verifique se a URL está correta e com acesso público.</p>
                  }
                </div>
              </div>
            } @else if (formDados.tipo === 'video' && formDados.vimeo_id) {
              <div class="space-y-1.5 sm:col-span-2 pt-2">
                <label class="block text-xs font-bold text-slate-700">Prévia do Player do Vimeo</label>
                <div class="aspect-video max-w-md w-full bg-black rounded-2xl overflow-hidden shadow-xs border border-slate-200">
                  <iframe
                    [src]="getVimeoUrl(formDados.vimeo_id)"
                    class="w-full h-full"
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                  ></iframe>
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
              [disabled]="salvando()"
              (click)="salvarDepoimento()"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              @if (salvando()) {
                <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Salvando...</span>
              } @else {
                <span>{{ editandoId() ? 'Salvar Alterações' : 'Cadastrar Depoimento' }}</span>
              }
            </button>
          </div>
        </div>
      }

      <!-- Lista de Depoimentos -->
      @if (carregando()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 animate-pulse">
              <div class="h-44 bg-slate-200 rounded-2xl w-full"></div>
              <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
              <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
            </div>
          }
        </div>
      } @else if (depoimentos().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center text-2xl">
            🖼️
          </div>
          <div class="max-w-md mx-auto space-y-1">
            <h4 class="text-base font-black text-slate-900">Nenhum depoimento cadastrado</h4>
            <p class="text-xs text-slate-500">Clique em "Novo Depoimento" acima para cadastrar provas sociais, imagens ou vídeos na página inicial.</p>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          @for (dep of depoimentos(); track dep.id; let i = $index) {
            <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              
              <div class="p-4 space-y-3">
                <!-- Visualização da Mídia do Depoimento (Imagem ou Vídeo) -->
                @if (dep.tipo === 'video' || dep.vimeo_id) {
                  <div class="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 aspect-4/3 flex flex-col items-center justify-center text-white relative group">
                    <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <svg class="w-7 h-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span class="text-[11px] font-bold text-slate-300 mt-2">Vídeo Vimeo (ID: {{ dep.vimeo_id }})</span>
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-xs">
                      Vídeo
                    </span>
                  </div>
                } @else {
                  <div class="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 aspect-4/3 flex items-center justify-center relative">
                    <img
                      [src]="dep.imagem_url"
                      [alt]="dep.nome"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-800/80 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                      Imagem
                    </span>
                  </div>
                }

                <!-- Info -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-2">
                    <h5 class="text-sm font-bold text-slate-900 truncate">
                      {{ dep.nome }}
                    </h5>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                          [class]="dep.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'">
                      {{ dep.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </div>

                  <p class="text-xs text-slate-500 truncate">
                    {{ dep.cargo_ou_papel || 'Depoimento Institucional' }}
                  </p>
                  <p class="text-[11px] text-slate-400">
                    Ordem de exibição: <strong>{{ dep.ordem }}</strong>
                  </p>
                </div>
              </div>

              <!-- Ações no Rodapé do Card -->
              <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                @if (excluirId() === dep.id) {
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="confirmarExclusao(dep.id)"
                      class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Confirmar?
                    </button>
                    <button
                      type="button"
                      (click)="excluirId.set(null)"
                      class="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                } @else {
                  <button
                    type="button"
                    (click)="excluirId.set(dep.id)"
                    class="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Excluir
                  </button>
                }

                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    (click)="toggleStatus(dep)"
                    class="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {{ dep.ativo ? 'Desativar' : 'Ativar' }}
                  </button>

                  <button
                    type="button"
                    (click)="iniciarEdicao(dep)"
                    class="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `
})
export class AdminDepoimentosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly depoimentos = signal<DepoimentoAdmin[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);
  readonly formularioAberto = signal<boolean>(false);
  readonly editandoId = signal<string | null>(null);
  readonly excluirId = signal<string | null>(null);

  previewErro = false;

  formDados: {
    nome: string;
    cargo_ou_papel: string;
    tipo: 'imagem' | 'video';
    imagem_url: string;
    vimeo_id: string;
    ordem: number;
  } = {
    nome: '',
    cargo_ou_papel: '',
    tipo: 'imagem',
    imagem_url: '',
    vimeo_id: '',
    ordem: 0,
  };

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.carregarDepoimentos();
  }

  getVimeoUrl(vimeoId?: string | null): SafeResourceUrl {
    const id = vimeoId?.trim() || '';
    const url = id ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0` : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async carregarDepoimentos(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarTodosDepoimentosAdmin();
      this.depoimentos.set(data);
    } catch (e: any) {
      this.exibirErro('Erro ao carregar depoimentos do Supabase.');
    } finally {
      this.carregando.set(false);
    }
  }

  abrirFormularioCriacao(): void {
    const total = this.depoimentos().length;
    this.formDados = {
      nome: '',
      cargo_ou_papel: 'Depoimento Institucional',
      tipo: 'imagem',
      imagem_url: '',
      vimeo_id: '',
      ordem: total + 1,
    };
    this.previewErro = false;
    this.editandoId.set(null);
    this.formularioAberto.set(true);
  }

  iniciarEdicao(dep: DepoimentoAdmin): void {
    this.formDados = {
      nome: dep.nome,
      cargo_ou_papel: dep.cargo_ou_papel || '',
      tipo: dep.tipo === 'video' ? 'video' : 'imagem',
      imagem_url: dep.imagem_url || '',
      vimeo_id: dep.vimeo_id || '',
      ordem: dep.ordem,
    };
    this.previewErro = false;
    this.editandoId.set(dep.id);
    this.formularioAberto.set(true);
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.editandoId.set(null);
    this.excluirId.set(null);
  }

  async salvarDepoimento(): Promise<void> {
    if (!this.formDados.nome.trim()) {
      this.exibirErro('Por favor, informe o nome da pessoa ou instituição.');
      return;
    }

    if (this.formDados.tipo === 'imagem') {
      if (!this.formDados.imagem_url.trim()) {
        this.exibirErro('Por favor, informe a URL da imagem ou print.');
        return;
      }
    } else {
      if (!this.formDados.vimeo_id.trim()) {
        this.exibirErro('Por favor, informe o ID numérico do vídeo no Vimeo.');
        return;
      }
    }

    // Auto-correção caso o usuário cole link do Drive no formato antigo
    let urlCorrigida = this.formDados.imagem_url.trim();
    if (this.formDados.tipo === 'imagem' && urlCorrigida.includes('drive.google.com/uc?export=view&id=')) {
      const idMatch = urlCorrigida.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        urlCorrigida = `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
    }

    this.salvando.set(true);
    try {
      const id = this.editandoId();
      if (id) {
        const res = await this.supabaseService.atualizarDepoimento(id, {
          nome: this.formDados.nome.trim(),
          cargo_ou_papel: this.formDados.cargo_ou_papel.trim() || '',
          tipo: this.formDados.tipo,
          imagem_url: this.formDados.tipo === 'imagem' ? urlCorrigida : '',
          vimeo_id: this.formDados.tipo === 'video' ? this.formDados.vimeo_id.trim() : '',
          ordem: this.formDados.ordem || 0,
        });
        if (res.error) {
          this.exibirErro('Erro ao atualizar depoimento: ' + res.error.message);
          return;
        }
        this.exibirSucesso('Depoimento atualizado com sucesso!');
      } else {
        const res = await this.supabaseService.criarDepoimento({
          nome: this.formDados.nome.trim(),
          cargo_ou_papel: this.formDados.cargo_ou_papel.trim() || undefined,
          tipo: this.formDados.tipo,
          imagem_url: this.formDados.tipo === 'imagem' ? urlCorrigida : undefined,
          vimeo_id: this.formDados.tipo === 'video' ? this.formDados.vimeo_id.trim() : undefined,
          ordem: this.formDados.ordem || 0,
        });
        if (res.error) {
          this.exibirErro('Erro ao cadastrar depoimento: ' + res.error.message);
          return;
        }
        this.exibirSucesso('Depoimento cadastrado com sucesso!');
      }

      this.fecharFormulario();
      await this.carregarDepoimentos();
    } catch (e: any) {
      this.exibirErro('Erro inesperado: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async toggleStatus(dep: DepoimentoAdmin): Promise<void> {
    try {
      const novoStatus = !dep.ativo;
      const res = await this.supabaseService.atualizarDepoimento(dep.id, { ativo: novoStatus });
      if (res.error) {
        this.exibirErro('Erro ao alterar status: ' + res.error.message);
        return;
      }
      this.exibirSucesso(`Depoimento ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      await this.carregarDepoimentos();
    } catch (e: any) {
      this.exibirErro('Erro ao alterar status do depoimento.');
    }
  }

  async confirmarExclusao(id: string): Promise<void> {
    try {
      const res = await this.supabaseService.excluirDepoimento(id);
      if (res.error) {
        this.exibirErro('Erro ao excluir depoimento: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Depoimento excluído com sucesso!');
      this.excluirId.set(null);
      await this.carregarDepoimentos();
    } catch (e: any) {
      this.exibirErro('Erro ao excluir depoimento: ' + (e?.message || e));
    }
  }

  private exibirSucesso(msg: string): void {
    this.mensagemSucesso.set(msg);
    this.mensagemErro.set(null);
    setTimeout(() => {
      if (this.mensagemSucesso() === msg) {
        this.mensagemSucesso.set(null);
      }
    }, 4000);
  }

  private exibirErro(msg: string): void {
    this.mensagemErro.set(msg);
    this.mensagemSucesso.set(null);
  }
}

