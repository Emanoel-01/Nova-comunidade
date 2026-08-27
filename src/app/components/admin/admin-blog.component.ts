import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Quill from 'quill';
import { SupabaseService } from '../../../services/supabase.service';

export interface AdminBlogPost {
  id: string;
  titulo: string;
  resumo?: string | null;
  conteudo: string;
  categoria: string;
  imagem_capa_url?: string | null;
  publicado: boolean;
  criado_em: string;
  atualizado_em?: string;
  autor?: { id: string; full_name?: string } | null;
}

export interface AdminNewsletterAssinante {
  id: string;
  nome?: string | null;
  email: string;
  ativo: boolean;
  criado_em: string;
}

@Component({
  selector: 'app-admin-blog',
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

      <!-- Navegação Interna: Posts vs Newsletter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="subAbaAtiva.set('posts')"
            [class]="subAbaAtiva() === 'posts'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 font-semibold border border-slate-200'"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>Artigos do Blog ({{ posts().length }})</span>
          </button>

          <button
            type="button"
            (click)="subAbaAtiva.set('newsletter')"
            [class]="subAbaAtiva() === 'newsletter'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 font-semibold border border-slate-200'"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Assinantes Newsletter ({{ assinantes().length }})</span>
          </button>
        </div>

        @if (subAbaAtiva() === 'posts' && !formularioAberto()) {
          <button
            type="button"
            (click)="abrirFormularioCriacao()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Artigo</span>
          </button>
        }

        @if (subAbaAtiva() === 'newsletter' && assinantes().length > 0) {
          <button
            type="button"
            (click)="exportarCsv()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar E-mails (CSV)</span>
          </button>
        }
      </div>

      <!-- ================================================================= -->
      <!-- ABA 1: ARTIGOS DO BLOG -->
      <!-- ================================================================= -->
      @if (subAbaAtiva() === 'posts') {
        
        <!-- Formulário de Criação / Edição -->
        @if (formularioAberto()) {
          <div class="bg-orange-50/50 border border-orange-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm animate-scaleUp">
            <div class="flex items-center justify-between border-b border-orange-100 pb-3">
              <h4 class="text-base font-bold text-slate-900">
                {{ editandoId() ? 'Editar Artigo' : 'Criar Novo Artigo' }}
              </h4>
              <button
                type="button"
                (click)="fecharFormulario()"
                class="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <!-- Dica Google Drive para imagens de capa -->
            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <span class="font-bold">💡 Imagens do Google Drive:</span> use o formato
              <code class="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800 select-all">
                https://drive.google.com/thumbnail?id=ID_DO_ARQUIVO&sz=w1000
              </code>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700">Título do Artigo *</label>
                <input
                  type="text"
                  #tituloInput
                  [value]="formPost.titulo"
                  (input)="formPost.titulo = tituloInput.value"
                  placeholder="Ex: Como a Manutenção Preditiva Reduz Custos em Edifícios Comerciais"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Categoria *</label>
                <select
                  #catSelect
                  [value]="formPost.categoria"
                  (change)="formPost.categoria = catSelect.value"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  @for (cat of categoriasDisponiveis; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>

              <div class="space-y-1.5 sm:col-span-3">
                <label class="block text-xs font-bold text-slate-700">Resumo / Subtítulo</label>
                <input
                  type="text"
                  #resumoInput
                  [value]="formPost.resumo"
                  (input)="formPost.resumo = resumoInput.value"
                  placeholder="Breve descrição do artigo para visualização nos cards..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div class="space-y-1.5 sm:col-span-3">
                <label class="block text-xs font-bold text-slate-700">URL da Imagem de Capa</label>
                <input
                  type="text"
                  #capaInput
                  [value]="formPost.imagem_capa_url"
                  (input)="formPost.imagem_capa_url = capaInput.value"
                  placeholder="https://drive.google.com/thumbnail?id=...&sz=w1000 ou link público de imagem"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div class="space-y-1.5 sm:col-span-3">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-slate-700">Conteúdo do Artigo (Editor Rico) *</label>
                  @if (enviandoImagemEditor()) {
                    <span class="text-xs font-bold text-orange-600 animate-pulse flex items-center gap-1">
                      <span class="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></span>
                      Enviando imagem...
                    </span>
                  }
                </div>
                
                <div class="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
                  <div #quillContainer id="editor-blog-quill" class="min-h-[260px] bg-white"></div>
                </div>

                <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 px-1 pt-1 gap-1">
                  <span>💡 Formate títulos (H2/H3), listas, citações, links e insira fotos diretamente no texto.</span>
                  <span class="font-medium text-slate-500">{{ contagemPalavras() }} palavras</span>
                </div>
              </div>
            </div>

            <!-- Pré-visualização da Capa se houver URL -->
            @if (formPost.imagem_capa_url) {
              <div class="space-y-1.5 pt-2">
                <label class="block text-xs font-bold text-slate-700">Prévia da Capa</label>
                <div class="p-2 bg-white rounded-2xl border border-slate-200 max-w-sm">
                  <img
                    [src]="formPost.imagem_capa_url"
                    alt="Prévia"
                    class="w-full h-40 object-cover rounded-xl"
                    referrerpolicy="no-referrer"
                  />
                </div>
              </div>
            }

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-orange-100">
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
                (click)="salvarPost()"
                class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                @if (salvando()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Salvando...</span>
                } @else {
                  <span>{{ editandoId() ? 'Salvar Alterações' : 'Criar Artigo' }}</span>
                }
              </button>
            </div>
          </div>
        }

        <!-- Lista de Artigos -->
        @if (carregandoPosts()) {
          <div class="space-y-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 animate-pulse">
                <div class="h-5 bg-slate-200 rounded w-1/4"></div>
                <div class="h-6 bg-slate-200 rounded w-1/2"></div>
                <div class="h-4 bg-slate-100 rounded w-full"></div>
              </div>
            }
          </div>
        } @else if (posts().length === 0) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div class="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center text-2xl">
              ✍️
            </div>
            <div class="max-w-md mx-auto space-y-1">
              <h4 class="text-base font-black text-slate-900">Nenhum artigo publicado ou rascunho</h4>
              <p class="text-xs text-slate-500">Clique em "Novo Artigo" acima para cadastrar seu primeiro conteúdo técnico no Blog Mundo 4.0.</p>
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (post of posts(); track post.id) {
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  @if (post.imagem_capa_url) {
                    <div class="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        [src]="post.imagem_capa_url"
                        [alt]="post.titulo"
                        class="w-full h-full object-cover"
                        referrerpolicy="no-referrer"
                      />
                    </div>
                  }

                  <div class="space-y-1 min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        {{ post.categoria }}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                            [class]="post.publicado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'">
                        {{ post.publicado ? 'Publicado' : 'Rascunho' }}
                      </span>
                      <span class="text-xs text-slate-400">
                        {{ post.criado_em | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>

                    <h5 class="text-base font-black text-slate-900 truncate">
                      {{ post.titulo }}
                    </h5>

                    @if (post.resumo) {
                      <p class="text-xs text-slate-500 line-clamp-1">
                        {{ post.resumo }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Ações do Artigo -->
                <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    (click)="togglePublicacao(post)"
                    class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer"
                    [class]="post.publicado ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'"
                  >
                    {{ post.publicado ? 'Despublicar' : 'Publicar' }}
                  </button>

                  <button
                    type="button"
                    (click)="iniciarEdicao(post)"
                    class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Editar
                  </button>

                  @if (excluirPostId() === post.id) {
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        (click)="confirmarExclusaoPost(post.id)"
                        class="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Confirmar?
                      </button>
                      <button
                        type="button"
                        (click)="excluirPostId.set(null)"
                        class="px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="excluirPostId.set(post.id)"
                      class="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                    >
                      Excluir
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }

      }

      <!-- ================================================================= -->
      <!-- ABA 2: ASSINANTES DA NEWSLETTER -->
      <!-- ================================================================= -->
      @if (subAbaAtiva() === 'newsletter') {
        
        @if (carregandoAssinantes()) {
          <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs animate-pulse space-y-4">
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
            <div class="h-10 bg-slate-100 rounded w-full"></div>
            <div class="h-10 bg-slate-100 rounded w-full"></div>
          </div>
        } @else if (assinantes().length === 0) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div class="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center text-2xl">
              📬
            </div>
            <div class="max-w-md mx-auto space-y-1">
              <h4 class="text-base font-black text-slate-900">Nenhum assinante na newsletter ainda</h4>
              <p class="text-xs text-slate-500">As inscrições realizadas na landing page e na página do blog aparecerão automaticamente aqui.</p>
            </div>
          </div>
        } @else {
          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 class="text-base font-black text-slate-900">
                  Lista de E-mails Cadastrados
                </h4>
                <p class="text-xs text-slate-500">
                  Total de {{ assinantes().length }} contatos para envio de comunicados e artigos.
                </p>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th class="py-3.5 px-6">Nome</th>
                    <th class="py-3.5 px-6">E-mail</th>
                    <th class="py-3.5 px-6">Data de Inscrição</th>
                    <th class="py-3.5 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  @for (ass of assinantes(); track ass.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3.5 px-6 font-semibold text-slate-900">
                        {{ ass.nome || '—' }}
                      </td>
                      <td class="py-3.5 px-6 font-mono text-indigo-600">
                        {{ ass.email }}
                      </td>
                      <td class="py-3.5 px-6 text-slate-400 text-xs">
                        {{ ass.criado_em | date:'dd/MM/yyyy HH:mm' }}
                      </td>
                      <td class="py-3.5 px-6 text-right">
                        @if (excluirAssinanteId() === ass.id) {
                          <div class="inline-flex items-center gap-1">
                            <button
                              type="button"
                              (click)="confirmarRemocaoAssinante(ass.id)"
                              class="px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Remover?
                            </button>
                            <button
                              type="button"
                              (click)="excluirAssinanteId.set(null)"
                              class="px-1.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        } @else {
                          <button
                            type="button"
                            (click)="excluirAssinanteId.set(ass.id)"
                            class="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Remover
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      }

    </div>
  `
})
export class AdminBlogComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly subAbaAtiva = signal<'posts' | 'newsletter'>('posts');

  readonly posts = signal<AdminBlogPost[]>([]);
  readonly assinantes = signal<AdminNewsletterAssinante[]>([]);

  readonly carregandoPosts = signal(true);
  readonly carregandoAssinantes = signal(true);
  readonly salvando = signal(false);

  readonly formularioAberto = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly excluirPostId = signal<string | null>(null);
  readonly excluirAssinanteId = signal<string | null>(null);

  readonly categoriasDisponiveis: string[] = [
    'Gestão 4.0',
    'Manutenção Predial',
    'Tecnologia BIM',
    'Engenharia Legal',
    'Carreira'
  ];

  @ViewChild('quillContainer') quillContainerRef?: ElementRef<HTMLDivElement>;

  quillInstance: Quill | null = null;
  readonly enviandoImagemEditor = signal(false);

  formPost = {
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'Gestão 4.0',
    imagem_capa_url: '',
  };

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarPosts(),
      this.carregarAssinantes(),
    ]);
  }

  async carregarPosts(): Promise<void> {
    this.carregandoPosts.set(true);
    try {
      const data = await this.supabaseService.listarTodosPostsAdmin();
      this.posts.set(data);
    } catch {
      this.exibirErro('Erro ao carregar lista de artigos.');
    } finally {
      this.carregandoPosts.set(false);
    }
  }

  async carregarAssinantes(): Promise<void> {
    this.carregandoAssinantes.set(true);
    try {
      const data = await this.supabaseService.listarAssinantesNewsletter();
      this.assinantes.set(data);
    } catch {
      this.exibirErro('Erro ao carregar assinantes da newsletter.');
    } finally {
      this.carregandoAssinantes.set(false);
    }
  }

  abrirFormularioCriacao(): void {
    this.formPost = {
      titulo: '',
      resumo: '',
      conteudo: '',
      categoria: 'Gestão 4.0',
      imagem_capa_url: '',
    };
    this.editandoId.set(null);
    this.formularioAberto.set(true);
    this.inicializarQuill('');
  }

  iniciarEdicao(post: AdminBlogPost): void {
    this.formPost = {
      titulo: post.titulo,
      resumo: post.resumo || '',
      conteudo: post.conteudo,
      categoria: post.categoria || 'Gestão 4.0',
      imagem_capa_url: post.imagem_capa_url || '',
    };
    this.editandoId.set(post.id);
    this.formularioAberto.set(true);
    this.inicializarQuill(post.conteudo);
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.editandoId.set(null);
    this.excluirPostId.set(null);
    this.quillInstance = null;
  }

  inicializarQuill(conteudoInicial: string = ''): void {
    setTimeout(() => {
      const el = this.quillContainerRef?.nativeElement;
      if (!el) return;

      el.innerHTML = '';

      try {
        this.quillInstance = new Quill(el, {
          theme: 'snow',
          placeholder: 'Escreva o conteúdo completo e formatado do artigo técnico aqui...',
          modules: {
            toolbar: {
              container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'link', 'image'],
                ['clean']
              ],
              handlers: {
                image: () => this.selecionarImagemEditor()
              }
            }
          }
        });

        // Carrega conteúdo inicial se houver
        if (conteudoInicial && conteudoInicial.trim()) {
          const conteudoTratado = this.prepararConteudoParaEditor(conteudoInicial);
          this.quillInstance.clipboard.dangerouslyPasteHTML(conteudoTratado);
        }

        // Sincroniza em tempo real com formPost.conteudo
        this.quillInstance.on('text-change', () => {
          if (!this.quillInstance) return;
          const html = this.quillInstance.root.innerHTML;
          const texto = this.quillInstance.getText().trim();
          if (html === '<p><br></p>' || (texto.length === 0 && !html.includes('<img'))) {
            this.formPost.conteudo = '';
          } else {
            this.formPost.conteudo = html;
          }
        });
      } catch (err) {
        console.error('Erro ao inicializar editor Quill:', err);
      }
    }, 60);
  }

  prepararConteudoParaEditor(conteudo: string): string {
    if (!conteudo) return '';
    // Suporte retrocompatível: se for texto puro antigo sem tags HTML, converte quebras em parágrafos para o Quill
    if (!/<[a-z][\s\S]*>/i.test(conteudo)) {
      return conteudo
        .split(/\n{2,}/)
        .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    }
    return conteudo;
  }

  contagemPalavras(): number {
    if (!this.formPost.conteudo) return 0;
    const textoPuro = this.formPost.conteudo.replace(/<[^>]*>/g, ' ').trim();
    if (!textoPuro) return 0;
    return textoPuro.split(/\s+/).filter(Boolean).length;
  }

  selecionarImagemEditor(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/gif';
    input.onchange = async (event: any) => {
      const file: File | undefined = event.target?.files?.[0];
      if (!file) return;

      this.enviandoImagemEditor.set(true);
      try {
        const res = await this.supabaseService.uploadImagemBlog(file);
        if (res.error || !res.url) {
          this.exibirErro('Erro ao fazer upload da imagem: ' + (res.error?.message || 'Falha no armazenamento.'));
          return;
        }

        if (this.quillInstance) {
          const range = this.quillInstance.getSelection(true);
          const index = range ? range.index : this.quillInstance.getLength();
          this.quillInstance.insertEmbed(index, 'image', res.url);
          this.quillInstance.setSelection(index + 1, 0);

          // Atualiza formPost.conteudo
          this.formPost.conteudo = this.quillInstance.root.innerHTML;
          this.exibirSucesso('Imagem inserida no artigo com sucesso!');
        }
      } catch (err: any) {
        this.exibirErro('Erro no upload da imagem: ' + (err?.message || err));
      } finally {
        this.enviandoImagemEditor.set(false);
      }
    };
    input.click();
  }

  async salvarPost(): Promise<void> {
    // Garante que o conteúdo mais recente do editor foi capturado
    if (this.quillInstance) {
      const html = this.quillInstance.root.innerHTML;
      const texto = this.quillInstance.getText().trim();
      if (html === '<p><br></p>' || (texto.length === 0 && !html.includes('<img'))) {
        this.formPost.conteudo = '';
      } else {
        this.formPost.conteudo = html;
      }
    }

    if (!this.formPost.titulo.trim()) {
      this.exibirErro('Informe o título do artigo.');
      return;
    }
    if (!this.formPost.conteudo.trim()) {
      this.exibirErro('Escreva o conteúdo do artigo.');
      return;
    }

    // Auto-correção caso cole URL antiga do Google Drive
    let capa = this.formPost.imagem_capa_url.trim();
    if (capa.includes('drive.google.com/uc?export=view&id=')) {
      const match = capa.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        capa = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }

    this.salvando.set(true);
    try {
      const id = this.editandoId();
      if (id) {
        const res = await this.supabaseService.atualizarPost(id, {
          titulo: this.formPost.titulo.trim(),
          resumo: this.formPost.resumo.trim() || '',
          conteudo: this.formPost.conteudo.trim(),
          categoria: this.formPost.categoria,
          imagem_capa_url: capa || '',
        });
        if (res.error) {
          this.exibirErro('Erro ao atualizar artigo: ' + res.error.message);
          return;
        }
        this.exibirSucesso('Artigo atualizado com sucesso!');
      } else {
        const res = await this.supabaseService.criarPost({
          titulo: this.formPost.titulo.trim(),
          resumo: this.formPost.resumo.trim() || undefined,
          conteudo: this.formPost.conteudo.trim(),
          categoria: this.formPost.categoria,
          imagem_capa_url: capa || undefined,
        });
        if (res.error) {
          this.exibirErro('Erro ao criar artigo: ' + res.error.message);
          return;
        }
        this.exibirSucesso('Artigo criado com sucesso!');
      }

      this.fecharFormulario();
      await this.carregarPosts();
    } catch (e: any) {
      this.exibirErro('Erro inesperado: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async togglePublicacao(post: AdminBlogPost): Promise<void> {
    try {
      const novoStatus = !post.publicado;
      const res = await this.supabaseService.atualizarPost(post.id, { publicado: novoStatus });
      if (res.error) {
        this.exibirErro('Erro ao alterar status de publicação: ' + res.error.message);
        return;
      }
      this.exibirSucesso(`Artigo ${novoStatus ? 'publicado' : 'movido para rascunho'} com sucesso!`);
      await this.carregarPosts();
    } catch {
      this.exibirErro('Erro ao atualizar artigo.');
    }
  }

  async confirmarExclusaoPost(id: string): Promise<void> {
    try {
      const res = await this.supabaseService.excluirPost(id);
      if (res.error) {
        this.exibirErro('Erro ao excluir artigo: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Artigo excluído com sucesso!');
      this.excluirPostId.set(null);
      await this.carregarPosts();
    } catch (e: any) {
      this.exibirErro('Erro ao excluir artigo: ' + (e?.message || e));
    }
  }

  async confirmarRemocaoAssinante(id: string): Promise<void> {
    try {
      const res = await this.supabaseService.removerAssinanteNewsletter(id);
      if (res.error) {
        this.exibirErro('Erro ao remover assinante: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Assinante removido com sucesso!');
      this.excluirAssinanteId.set(null);
      await this.carregarAssinantes();
    } catch {
      this.exibirErro('Erro ao remover assinante.');
    }
  }

  async exportarCsv(): Promise<void> {
    try {
      const emails = await this.supabaseService.exportarEmailsNewsletter();
      if (emails.length === 0) {
        this.exibirErro('Nenhum e-mail disponível para exportação.');
        return;
      }

      const cabecalho = 'email\n';
      const conteudoCsv = cabecalho + emails.join('\n');
      const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter_assinantes_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.exibirSucesso(`${emails.length} e-mails exportados com sucesso!`);
    } catch {
      this.exibirErro('Erro ao gerar arquivo de exportação.');
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
