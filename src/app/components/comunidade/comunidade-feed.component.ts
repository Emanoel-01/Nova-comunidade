import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-comunidade-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- 1. Caixa de Criação de Post (Topo) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all space-y-4">
        
        <div class="flex items-start gap-3.5 sm:gap-4">
          <!-- Avatar Usuário Autenticado -->
          @if (getMinhaFoto()) {
            <img
              [src]="getMinhaFoto()!"
              [alt]="getMeuNome()"
              class="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-inner shrink-0"
              referrerpolicy="no-referrer"
            />
          } @else {
            <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-inner shrink-0 uppercase">
              {{ getMinhaInicial() }}
            </div>
          }

          <div class="flex-1 min-w-0">
            <textarea
              [value]="novoPostTexto()"
              (input)="onTextoInput($event)"
              (focus)="caixaExpandida.set(true)"
              rows="2"
              [placeholder]="caixaExpandida() ? 'Compartilhe uma dúvida, dica técnica ou conquista profissional...' : 'O que você está aprendendo?'"
              class="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-2xl p-3.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Feedback de Erro Inline na Criação -->
        @if (erroFeedback()) {
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{{ erroFeedback() }}</span>
            <button type="button" (click)="erroFeedback.set(null)" class="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
          </div>
        }

        <!-- Prévia das Fotos Selecionadas (antes de publicar) -->
        @if (fotosPendentes().length > 0) {
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            @for (foto of fotosPendentes(); track foto.previewUrl; let idx = $index) {
              <div class="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group">
                <img
                  [src]="foto.previewUrl"
                  class="w-full h-full object-cover"
                  alt="Prévia da foto selecionada"
                />
                <button
                  type="button"
                  (click)="removerFotoPendente(idx)"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  title="Remover foto"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        }

        <!-- Área expandida com tags, upload de fotos e botão Publicar -->
        @if (caixaExpandida()) {
          <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fadeIn">
            
            <!-- Input de Arquivo Oculto -->
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              #inputFotoFeed
              (change)="onSelecionarFotos($event)"
            />

            <!-- Botão Anexar Fotos e Seleção de Tags -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Botão de Anexar Fotos -->
              <button
                type="button"
                (click)="inputFotoFeed.click()"
                [disabled]="fotosPendentes().length >= 4"
                [class]="fotosPendentes().length >= 4
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'"
                class="px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 font-medium"
                [title]="fotosPendentes().length >= 4 ? 'Máximo de 4 fotos por post atingido' : 'Adicionar fotos ao post (máx. 4)'"
              >
                <span>📷</span>
                <span>{{ fotosPendentes().length >= 4 ? 'Limite de fotos (4/4)' : 'Adicionar fotos' + (fotosPendentes().length > 0 ? ' (' + fotosPendentes().length + '/4)' : '') }}</span>
              </button>

              <span class="text-slate-300 mx-0.5 hidden sm:inline">|</span>

              <span class="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Tipo:</span>
              
              <button
                type="button"
                (click)="tagSelecionada.set('Dica técnica')"
                [class]="tagSelecionada() === 'Dica técnica'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'"
                class="px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>💡</span>
                <span>Dica técnica</span>
              </button>

              <button
                type="button"
                (click)="tagSelecionada.set('Conquista')"
                [class]="tagSelecionada() === 'Conquista'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'"
                class="px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>🏆</span>
                <span>Conquista</span>
              </button>

              <button
                type="button"
                (click)="tagSelecionada.set('Foto')"
                [class]="tagSelecionada() === 'Foto'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'"
                class="px-3 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>📷</span>
                <span>Foto de Obra</span>
              </button>
            </div>

            <!-- Botões de Ação -->
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="cancelarCriacao()"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="publicarPost()"
                [disabled]="!novoPostTexto().trim() || publicando() || enviandoFotos()"
                [class]="novoPostTexto().trim() && !publicando() && !enviandoFotos()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                @if (publicando() || enviandoFotos()) {
                  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{{ enviandoFotos() ? 'Enviando fotos...' : 'Publicando...' }}</span>
                } @else {
                  <span>Publicar</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
            </div>

          </div>
        }

      </div>

      <!-- 2. Lista de Publicações do Feed Real -->
      @if (carregando()) {
        <!-- Estado de Carregamento -->
        <div class="space-y-4">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-slate-200"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 bg-slate-200 rounded-md w-32"></div>
                <div class="h-2.5 bg-slate-200 rounded-md w-24"></div>
              </div>
            </div>
            <div class="h-12 bg-slate-100 rounded-xl"></div>
          </div>
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-slate-200"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 bg-slate-200 rounded-md w-36"></div>
                <div class="h-2.5 bg-slate-200 rounded-md w-28"></div>
              </div>
            </div>
            <div class="h-16 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      } @else if (posts().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3 shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">Nenhuma publicação ainda</h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Seja o primeiro a compartilhar uma dica técnica, dúvida ou conquista com a comunidade!
          </p>
        </div>
      } @else {
        <!-- Lista de Posts Reais -->
        <div class="space-y-5">
          @for (post of posts(); track post.id) {
            
            <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              
              <!-- Header do Post -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  @if (getAutorAvatar(post)) {
                    <img
                      [src]="getAutorAvatar(post)!"
                      [alt]="getAutorNome(post)"
                      class="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-inner shrink-0"
                      referrerpolicy="no-referrer"
                    />
                  } @else {
                    <div
                      [class]="isMeuPost(post) ? 'bg-indigo-600' : 'bg-slate-800'"
                      class="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-inner shrink-0 uppercase"
                    >
                      {{ getAutorInicial(post) }}
                    </div>
                  }
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {{ getAutorNome(post) }}
                      </h4>
                      @if (isMeuPost(post)) {
                        <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                          Você
                        </span>
                      }
                    </div>
                    <p class="text-[11px] text-slate-500 truncate">
                      {{ getAutorCargo(post) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  @if (post.tag) {
                    <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold hidden sm:inline-block">
                      {{ post.tag }}
                    </span>
                  }
                  <span class="text-[11px] text-slate-400 font-medium">
                    {{ formatarTempo(post.criado_em) }}
                  </span>
                </div>
              </div>

              <!-- Conteúdo do Post -->
              <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {{ post.conteudo }}
              </div>

              <!-- Fotos do Post Publicado (Galeria) -->
              @if (post.fotos_urls && post.fotos_urls.length > 0) {
                <div
                  class="grid gap-1.5 rounded-2xl overflow-hidden"
                  [class]="post.fotos_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
                >
                  @for (foto of post.fotos_urls; track foto) {
                    <img
                      [src]="foto"
                      class="w-full h-full object-cover max-h-80"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                      alt="Foto anexada à publicação"
                    />
                  }
                </div>
              }

              <!-- Rodapé do Post (Curtir, Comentar) -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                <div class="flex items-center gap-2 sm:gap-4">
                  <!-- Botão Curtir -->
                  <button
                    type="button"
                    (click)="toggleCurtir(post)"
                    [class]="post.curtidoPorMim ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg
                      [class]="post.curtidoPorMim ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-500'"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ post.totalCurtidas || 0 }}</span>
                  </button>

                  <!-- Botão Comentários (abre/fecha seção) -->
                  <button
                    type="button"
                    (click)="toggleComentarios(post.id)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ post.comentarios ? post.comentarios.length : 0 }}</span>
                  </button>
                </div>

                <span class="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Sincronizado Supabase</span>
                </span>
              </div>

              <!-- Seção Expandida de Comentários -->
              @if (comentariosAbertos().includes(post.id)) {
                <div class="border-t border-slate-100 pt-4 mt-2 space-y-4 bg-slate-50/60 p-4 rounded-2xl">
                  
                  <!-- Lista de Comentários -->
                  @if (!post.comentarios || post.comentarios.length === 0) {
                    <div class="text-center py-3 text-xs text-slate-400">
                      <span>Nenhum comentário ainda. Seja o primeiro a comentar!</span>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (com of post.comentarios; track com.id) {
                        <div class="flex items-start gap-2.5 text-xs">
                          @if (getComentarioAutorAvatar(com)) {
                            <img
                              [src]="getComentarioAutorAvatar(com)!"
                              [alt]="getComentarioAutorNome(com)"
                              class="w-7 h-7 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                              referrerpolicy="no-referrer"
                            />
                          } @else {
                            <div class="w-7 h-7 rounded-xl bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0 uppercase">
                              {{ getComentarioAutorInicial(com) }}
                            </div>
                          }
                          <div class="flex-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                            <div class="flex items-center justify-between gap-2">
                              <div class="flex items-center gap-1.5">
                                <span class="font-bold text-slate-900">{{ getComentarioAutorNome(com) }}</span>
                                @if (com.autor_id === usuarioAtual()?.id) {
                                  <span class="text-[11px] text-indigo-600 font-semibold">(você)</span>
                                }
                              </div>
                              <span class="text-[11px] text-slate-400">{{ formatarTempo(com.criado_em) }}</span>
                            </div>
                            <p class="text-slate-600 leading-normal">{{ com.texto }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <!-- Input para Adicionar Comentário -->
                  <div class="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      [value]="getComentarioInput(post.id)"
                      (input)="setComentarioInput(post.id, $event)"
                      (keyup.enter)="enviarComentario(post.id)"
                      [disabled]="comentandoEm() === post.id"
                      placeholder="Escreva um comentário..."
                      class="flex-1 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden disabled:opacity-50"
                    />
                    <button
                      type="button"
                      (click)="enviarComentario(post.id)"
                      [disabled]="!getComentarioInput(post.id).trim() || comentandoEm() === post.id"
                      class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      @if (comentandoEm() === post.id) {
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      } @else {
                        <span>Enviar</span>
                      }
                    </button>
                  </div>

                </div>
              }

            </div>
          }
        </div>
      }

    </div>
  `
})
export class ComunidadeFeedComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly posts = signal<any[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly publicando = signal<boolean>(false);
  readonly comentandoEm = signal<string | null>(null);
  readonly erroFeedback = signal<string | null>(null);

  readonly usuarioAtual = signal<any | null>(null);
  readonly profissionalAtual = signal<any | null>(null);

  readonly caixaExpandida = signal<boolean>(false);
  readonly tagSelecionada = signal<string>('Dica técnica');
  readonly novoPostTexto = signal<string>('');
  readonly fotosPendentes = signal<{ file: File; previewUrl: string }[]>([]);
  readonly enviandoFotos = signal<boolean>(false);

  readonly comentariosAbertos = signal<string[]>([]);
  readonly comentarioInputs = signal<{ [postId: string]: string }>({});

  async ngOnInit(): Promise<void> {
    await this.carregarUsuario();
    await this.carregarPosts();
  }

  async carregarUsuario(): Promise<void> {
    const session = await this.supabaseService.getSession();
    if (session?.user) {
      this.usuarioAtual.set(session.user);
      const prof = await this.supabaseService.getProfissional(session.user.id);
      if (prof) {
        this.profissionalAtual.set(prof);
      }
    }
  }

  async carregarPosts(): Promise<void> {
    this.carregando.set(true);
    try {
      const posts = await this.supabaseService.listarFeedPosts();
      this.posts.set(posts);
    } catch (e) {
      console.warn('Falha ao carregar posts do feed:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  getMeuNome(): string {
    return (
      this.profissionalAtual()?.full_name ||
      this.usuarioAtual()?.user_metadata?.full_name ||
      this.usuarioAtual()?.email?.split('@')[0] ||
      'Membro'
    );
  }

  getMinhaFoto(): string | null {
    return this.profissionalAtual()?.avatar_url || null;
  }

  getMinhaInicial(): string {
    const nome = this.getMeuNome();
    return nome.charAt(0).toUpperCase() || 'M';
  }

  getAutorNome(post: any): string {
    return post.autor?.full_name || 'Membro da Comunidade';
  }

  getAutorAvatar(post: any): string | null {
    return post.autor?.avatar_url || null;
  }

  getAutorCargo(post: any): string {
    return post.autor?.professional_title || 'Membro';
  }

  getAutorInicial(post: any): string {
    const nome = this.getAutorNome(post);
    return nome.charAt(0).toUpperCase() || 'M';
  }

  getComentarioAutorNome(com: any): string {
    return com.autor?.full_name || 'Membro da Comunidade';
  }

  getComentarioAutorAvatar(com: any): string | null {
    return com.autor?.avatar_url || null;
  }

  getComentarioAutorInicial(com: any): string {
    const nome = this.getComentarioAutorNome(com);
    return nome.charAt(0).toUpperCase() || 'M';
  }

  isMeuPost(post: any): boolean {
    return post.autor_id === this.usuarioAtual()?.id;
  }

  formatarTempo(dataIso: string | undefined): string {
    if (!dataIso) return 'Agora';
    try {
      const data = new Date(dataIso);
      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMin / 60);
      const diffDias = Math.floor(diffHoras / 24);

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `há ${diffMin} min`;
      if (diffHoras < 24) return `há ${diffHoras}h`;
      if (diffDias < 7) return `há ${diffDias}d`;

      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Recentemente';
    }
  }

  onTextoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.novoPostTexto.set(target.value);
  }

  onSelecionarFotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const espacoDisponivel = 4 - this.fotosPendentes().length;

    if (espacoDisponivel <= 0) {
      this.erroFeedback.set('Máximo de 4 fotos por post.');
      input.value = '';
      return;
    }

    if (files.length > espacoDisponivel) {
      this.erroFeedback.set('Máximo de 4 fotos por post.');
    }

    const arquivosParaAdicionar = files.slice(0, espacoDisponivel);
    const novasFotos = arquivosParaAdicionar.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    this.fotosPendentes.update(atuais => [...atuais, ...novasFotos]);
    input.value = '';
  }

  removerFotoPendente(index: number): void {
    const lista = this.fotosPendentes();
    if (index >= 0 && index < lista.length) {
      const item = lista[index];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {}
      }
      this.fotosPendentes.update(fotos => fotos.filter((_, i) => i !== index));
    }
  }

  private limparFotosPendentes(): void {
    for (const item of this.fotosPendentes()) {
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {}
      }
    }
    this.fotosPendentes.set([]);
  }

  async publicarPost(): Promise<void> {
    const texto = this.novoPostTexto().trim();
    if (!texto || this.publicando() || this.enviandoFotos()) return;

    this.publicando.set(true);
    this.erroFeedback.set(null);

    let fotosUrls: string[] = [];

    // Se houver fotos selecionadas, faz upload antes
    if (this.fotosPendentes().length > 0) {
      this.enviandoFotos.set(true);
      try {
        for (const item of this.fotosPendentes()) {
          const { url, error: uploadErr } = await this.supabaseService.uploadFotoFeed(item.file);
          if (uploadErr || !url) {
            this.erroFeedback.set('Erro ao enviar uma das fotos: ' + (uploadErr?.message || 'Falha no envio da imagem.'));
            this.publicando.set(false);
            this.enviandoFotos.set(false);
            return;
          }
          fotosUrls.push(url);
        }
      } catch (err: any) {
        this.erroFeedback.set('Erro ao enviar fotos: ' + (err?.message || 'Falha inesperada.'));
        this.publicando.set(false);
        this.enviandoFotos.set(false);
        return;
      }
      this.enviandoFotos.set(false);
    }

    const { error } = await this.supabaseService.criarFeedPost(texto, this.tagSelecionada(), fotosUrls);

    if (error) {
      this.erroFeedback.set('Erro ao publicar: ' + (error.message || 'Verifique sua conexão.'));
      this.publicando.set(false);
      return;
    }

    this.novoPostTexto.set('');
    this.limparFotosPendentes();
    this.caixaExpandida.set(false);
    await this.carregarPosts();
    this.publicando.set(false);
  }

  cancelarCriacao(): void {
    this.novoPostTexto.set('');
    this.limparFotosPendentes();
    this.caixaExpandida.set(false);
    this.erroFeedback.set(null);
  }

  async toggleCurtir(post: any): Promise<void> {
    const curtidoAtual = !!post.curtidoPorMim;
    const totalAtual = post.totalCurtidas || 0;

    // Atualização otimista local
    this.posts.update(lista =>
      lista.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            curtidoPorMim: !curtidoAtual,
            totalCurtidas: curtidoAtual ? Math.max(0, totalAtual - 1) : totalAtual + 1
          };
        }
        return p;
      })
    );

    const { error } = await this.supabaseService.toggleCurtidaFeedPost(post.id, curtidoAtual);

    if (error) {
      console.warn('Erro ao alternar curtida:', error.message);
      // Reverte em caso de falha
      this.posts.update(lista =>
        lista.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              curtidoPorMim: curtidoAtual,
              totalCurtidas: totalAtual
            };
          }
          return p;
        })
      );
    }
  }

  toggleComentarios(postId: string): void {
    this.comentariosAbertos.update(lista => {
      if (lista.includes(postId)) {
        return lista.filter(id => id !== postId);
      } else {
        return [...lista, postId];
      }
    });
  }

  getComentarioInput(postId: string): string {
    return this.comentarioInputs()[postId] || '';
  }

  setComentarioInput(postId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.comentarioInputs.update(dict => ({
      ...dict,
      [postId]: target.value
    }));
  }

  async enviarComentario(postId: string): Promise<void> {
    const texto = this.getComentarioInput(postId).trim();
    if (!texto || this.comentandoEm() === postId) return;

    this.comentandoEm.set(postId);

    const { error } = await this.supabaseService.adicionarFeedComentario(postId, texto);

    if (error) {
      console.warn('Erro ao enviar comentário:', error.message);
      this.comentandoEm.set(null);
      return;
    }

    // Limpa o input do comentário
    this.comentarioInputs.update(dict => ({
      ...dict,
      [postId]: ''
    }));

    // Recarrega posts para exibir o novo comentário formatado
    await this.carregarPosts();
    this.comentandoEm.set(null);
  }
}
