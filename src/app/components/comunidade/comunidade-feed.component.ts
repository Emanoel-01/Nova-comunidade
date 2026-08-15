import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunidadeStateService } from './comunidade-state.service';

@Component({
  selector: 'app-comunidade-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- 1. Caixa de Criação de Post (Topo) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs transition-all space-y-4">
        
        <div class="flex items-start gap-3.5 sm:gap-4">
          <!-- Avatar Usuário Demonstração -->
          <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-inner shrink-0">
            M
          </div>

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

        <!-- Área expandida com tags e botão Publicar -->
        @if (caixaExpandida()) {
          <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fadeIn">
            
            <!-- Seleção de Tipo de Post / Tags -->
            <div class="flex items-center gap-1.5 flex-wrap">
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
                [disabled]="!novoPostTexto().trim()"
                [class]="novoPostTexto().trim()
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Publicar</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

      </div>

      <!-- 2. Lista de Publicações do Feed -->
      <div class="space-y-5">
        @for (post of posts(); track post.id) {
          
          <!-- ITEM DO FEED: POST PADRÃO -->
          @if (post.tipo === 'post') {
            <div class="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              
              <!-- Header do Post -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    [class]="post.isCurrentUser ? 'bg-indigo-600' : 'bg-slate-800'"
                    class="w-10 h-10 rounded-2xl text-white font-black text-sm flex items-center justify-center shadow-inner shrink-0"
                  >
                    {{ post.avatar }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {{ post.autor }}
                      </h4>
                      @if (post.isCurrentUser) {
                        <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          Você
                        </span>
                      }
                    </div>
                    <p class="text-[11px] text-slate-500 truncate">
                      {{ post.cargo }}
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
                    {{ post.tempo }}
                  </span>
                </div>
              </div>

              <!-- Conteúdo do Post -->
              <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {{ post.conteudo }}
              </div>

              <!-- Rodapé do Post (Curtir, Comentar) -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                <div class="flex items-center gap-2 sm:gap-4">
                  <!-- Botão Curtir -->
                  <button
                    type="button"
                    (click)="state.toggleCurtir(post.id)"
                    [class]="post.curtido ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                  >
                    <svg
                      [class]="post.curtido ? 'fill-rose-500 text-rose-500' : 'fill-none text-slate-500'"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ post.curtidas }}</span>
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
                    <span>{{ post.comentarios.length }}</span>
                  </button>
                </div>

                <span class="text-[11px] text-slate-400 italic">Interação em memória</span>
              </div>

              <!-- Seção Expandida de Comentários -->
              @if (comentariosAbertos().includes(post.id)) {
                <div class="border-t border-slate-100 pt-4 mt-2 space-y-4 bg-slate-50/60 p-4 rounded-2xl">
                  
                  <!-- Lista de Comentários -->
                  @if (post.comentarios.length === 0) {
                    <div class="text-center py-3 text-xs text-slate-400">
                      <span>Nenhum comentário ainda. Seja o primeiro a comentar!</span>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (com of post.comentarios; track com.id) {
                        <div class="flex items-start gap-2.5 text-xs">
                          <div class="w-7 h-7 rounded-xl bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            {{ com.avatar }}
                          </div>
                          <div class="flex-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                            <div class="flex items-center justify-between gap-2">
                              <span class="font-bold text-slate-900">{{ com.autor }}</span>
                              <span class="text-[10px] text-slate-400">{{ com.tempo }}</span>
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
                      placeholder="Escreva um comentário..."
                      class="flex-1 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden"
                    />
                    <button
                      type="button"
                      (click)="enviarComentario(post.id)"
                      class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>

                </div>
              }

            </div>
          }

          <!-- ITEM DO FEED: CARD DE EVENTO AO VIVO -->
          @if (post.tipo === 'evento' && post.evento) {
            <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-800/40 p-6 sm:p-7 text-white shadow-md space-y-5">
              
              <div class="flex items-center justify-between gap-3">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Evento da Comunidade</span>
                </div>

                <span class="text-xs text-slate-400">{{ post.tempo }}</span>
              </div>

              <div class="space-y-2">
                <h4 class="text-lg sm:text-xl font-black text-white leading-snug">
                  {{ post.evento.titulo }}
                </h4>
                <p class="text-xs sm:text-sm text-indigo-200">
                  {{ post.conteudo }}
                </p>
              </div>

              <!-- Bloco de Informações do Evento -->
              <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs sm:text-sm">
                <div class="flex items-center gap-2 text-slate-200">
                  <svg class="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ post.evento.dataHora }}</span>
                </div>
                <div class="flex items-center gap-2 text-slate-300">
                  <svg class="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ post.evento.palestrante }}</span>
                </div>
              </div>

              <!-- Rodapé com Botão de Inscrição -->
              <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  <span>{{ post.curtidas }} interessados</span>
                </div>

                <button
                  type="button"
                  (click)="state.toggleInscricaoEvento(post.id)"
                  [class]="post.evento.inscrito
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'"
                  class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  @if (post.evento.inscrito) {
                    <span>✓ Inscrito no Evento</span>
                  } @else {
                    <span>Inscrever-me Gratuitamente</span>
                  }
                </button>
              </div>

            </div>
          }

          <!-- ITEM DO FEED: CARD DE VAGA EM DESTAQUE -->
          @if (post.tipo === 'vaga' && post.vaga) {
            <div class="bg-white rounded-3xl border border-indigo-100 p-5 sm:p-7 shadow-xs space-y-4">
              
              <div class="flex items-center justify-between gap-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Mural de Oportunidades</span>
                </span>

                <span class="text-xs text-slate-400">{{ post.tempo }}</span>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <h4 class="text-sm sm:text-base font-black text-slate-900">
                    {{ post.vaga.titulo }}
                  </h4>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                    {{ post.vaga.tipoContrato }}
                  </span>
                </div>

                <p class="text-xs text-slate-600 flex items-center gap-1.5">
                  <span class="font-semibold text-slate-800">{{ post.vaga.empresa }}</span>
                  <span>•</span>
                  <span>{{ post.vaga.local }}</span>
                </p>
              </div>

              <!-- Formulário / Botão de Candidatura Rápida no Feed -->
              <div class="pt-2">
                @if (post.vaga.candidatado) {
                  <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>✓ Candidatura enviada com sucesso!</span>
                  </div>
                } @else if (vagaModalAberta() === post.id) {
                  <!-- Formulário Aberto no Card -->
                  <div class="space-y-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <label class="block text-xs font-bold text-slate-700">
                      Mensagem de apresentação rápida (opcional):
                    </label>
                    <textarea
                      [value]="mensagemCandidatura()"
                      (input)="onMensagemCandidaturaInput($event)"
                      rows="2"
                      placeholder="Olá! Gostaria de me candidatar com base na minha experiência em laudos e vistorias..."
                      class="w-full bg-white text-xs text-slate-800 rounded-xl p-3 border border-slate-200 focus:border-indigo-500 outline-hidden resize-none"
                    ></textarea>

                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        (click)="vagaModalAberta.set(null)"
                        class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        (click)="confirmarCandidaturaFeed(post.id)"
                        class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Confirmar Candidatura
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500">Vaga exclusiva para membros</span>
                    <button
                      type="button"
                      (click)="vagaModalAberta.set(post.id)"
                      class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Candidatar-se
                    </button>
                  </div>
                }
              </div>

            </div>
          }

        }
      </div>

    </div>
  `
})
export class ComunidadeFeedComponent {
  readonly state = inject(ComunidadeStateService);
  readonly posts = this.state.posts;

  readonly caixaExpandida = signal<boolean>(false);
  readonly tagSelecionada = signal<string>('Dica técnica');
  readonly novoPostTexto = signal<string>('');

  readonly comentariosAbertos = signal<string[]>([]);
  readonly comentarioInputs = signal<{ [postId: string]: string }>({});

  readonly vagaModalAberta = signal<string | null>(null);
  readonly mensagemCandidatura = signal<string>('');

  onTextoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.novoPostTexto.set(target.value);
  }

  publicarPost(): void {
    const texto = this.novoPostTexto().trim();
    if (!texto) return;

    this.state.adicionarPost(texto, this.tagSelecionada());
    this.novoPostTexto.set('');
    this.caixaExpandida.set(false);
  }

  cancelarCriacao(): void {
    this.novoPostTexto.set('');
    this.caixaExpandida.set(false);
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

  enviarComentario(postId: string): void {
    const texto = this.getComentarioInput(postId).trim();
    if (!texto) return;

    this.state.adicionarComentario(postId, texto);
    this.comentarioInputs.update(dict => ({
      ...dict,
      [postId]: ''
    }));
  }

  onMensagemCandidaturaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.mensagemCandidatura.set(target.value);
  }

  confirmarCandidaturaFeed(postId: string): void {
    this.state.candidatarVagaFeed(postId);
    this.vagaModalAberta.set(null);
    this.mensagemCandidatura.set('');
  }
}
