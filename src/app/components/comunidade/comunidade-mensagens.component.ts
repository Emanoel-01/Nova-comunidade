import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-comunidade-mensagens',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Feedback Inline (Erros/Avisos) -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <div class="flex items-center gap-2">
            @if (tipoFeedback() === 'sucesso') {
              <span>✓</span>
            } @else {
              <span>⚠</span>
            }
            <span>{{ mensagemFeedback() }}</span>
          </div>
          <button type="button" (click)="mensagemFeedback.set(null)" class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer">✕</button>
        </div>
      }

      <!-- 1. Cabeçalho de Mensagens (Banner Escuro Gradiente) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Comunicação Direta & Networking</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Mensagens Privadas</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Troque mensagens diretas com colegas de profissão, tire dúvidas sobre laudos técnicos ou combine parcerias periciais.
            </p>
          </div>

          <!-- Total de Mensagens Não Lidas -->
          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ totalNaoLidas() }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Mensagens Pendentes</div>
              <div class="text-[11px] text-indigo-200">
                {{ conversas().length }} conversas ativas
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Estrutura Principal do Chat (2 Colunas no Desktop / 1 Coluna no Mobile) -->
      <div class="flex flex-col md:flex-row gap-5 items-stretch min-h-[620px]">

        <!-- ================================================================= -->
        <!-- COLUNA ESQUERDA: LISTA DE CONVERSAS -->
        <!-- Visível sempre no Desktop; no Mobile só quando nenhuma conversa aberta -->
        <!-- ================================================================= -->
        <div
          [class.hidden]="conversaSelecionadaId() !== null"
          class="w-full md:w-80 lg:w-96 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden md:flex!"
        >
          
          <!-- Topo da Lista: Busca de Conversas -->
          <div class="p-4 border-b border-slate-100 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-slate-800 uppercase tracking-wider">Conversas Recentes</span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {{ conversasFiltradas().length }}
              </span>
            </div>

            <!-- Campo de Busca -->
            <div class="relative">
              <input
                type="text"
                [value]="buscaTexto()"
                (input)="onBuscaInput($event)"
                placeholder="Buscar conversa..."
                class="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Lista de Conversas com Rolagem -->
          <div class="flex-1 overflow-y-auto divide-y divide-slate-100">
            @if (carregandoConversas()) {
              <!-- Skeleton Loading -->
              <div class="p-4 space-y-4">
                <div class="flex items-center gap-3 animate-pulse">
                  <div class="w-11 h-11 bg-slate-200 rounded-2xl shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-3 bg-slate-200 rounded-md w-28"></div>
                    <div class="h-2.5 bg-slate-100 rounded-md w-40"></div>
                  </div>
                </div>
                <div class="flex items-center gap-3 animate-pulse">
                  <div class="w-11 h-11 bg-slate-200 rounded-2xl shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-3 bg-slate-200 rounded-md w-32"></div>
                    <div class="h-2.5 bg-slate-100 rounded-md w-36"></div>
                  </div>
                </div>
              </div>
            } @else if (conversasFiltradas().length === 0) {
              <div class="p-8 text-center space-y-2">
                <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p class="text-xs font-bold text-slate-700">Nenhuma conversa encontrada</p>
                <p class="text-[11px] text-slate-400">
                  @if (buscaTexto()) {
                    Verifique o termo buscado ou limpe o filtro.
                  } @else {
                    Suas conversas diretas com colegas aparecerão aqui.
                  }
                </p>
              </div>
            } @else {
              @for (conv of conversasFiltradas(); track conv.id) {
                <button
                  type="button"
                  (click)="selecionarConversa(conv.id)"
                  [class]="conversaSelecionadaId() === conv.id
                    ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600'
                    : 'hover:bg-slate-50/90 border-l-4 border-l-transparent'"
                  class="w-full text-left p-4 transition-colors flex items-start gap-3.5 cursor-pointer"
                >
                  <!-- Avatar com Iniciais -->
                  <div class="relative shrink-0">
                    <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {{ getIniciais(conv.nome) }}
                    </div>
                  </div>

                  <!-- Conteúdo Central: Nome + Última Mensagem -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                      <h5 class="text-xs font-black text-slate-900 truncate">
                        {{ conv.nome }}
                      </h5>
                      <span class="text-[10px] text-slate-400 shrink-0 font-medium">
                        {{ formatarTempo(conv.ultimaMensagemEm || conv.criado_em) }}
                      </span>
                    </div>

                    <p class="text-[11px] text-slate-500 truncate mb-1">
                      {{ conv.cargo || 'Membro da Comunidade' }}
                    </p>

                    <p
                      [class]="conv.naoLidas > 0 ? 'font-bold text-slate-900' : 'text-slate-500 font-normal'"
                      class="text-xs truncate"
                    >
                      {{ conv.ultimaMensagem || 'Conversa iniciada' }}
                    </p>
                  </div>

                  <!-- Badge de Não Lidas -->
                  @if (conv.naoLidas > 0) {
                    <div class="shrink-0 self-center">
                      <span class="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                        {{ conv.naoLidas }}
                      </span>
                    </div>
                  }
                </button>
              }
            }
          </div>

        </div>

        <!-- ================================================================= -->
        <!-- COLUNA DIREITA: CONVERSA ABERTA OU ESTADO VAZIO -->
        <!-- No Mobile, só aparece quando conversaSelecionadaId tiver valor -->
        <!-- ================================================================= -->
        <div
          [class.hidden]="conversaAberta() === null"
          class="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden md:flex!"
        >
          
          @if (conversaAberta(); as conv) {
            
            <!-- Cabeçalho da Conversa Ativa -->
            <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              
              <div class="flex items-center gap-3 min-w-0">
                <!-- Botão Voltar (Apenas no Mobile) -->
                <button
                  type="button"
                  (click)="fecharConversaMobile()"
                  class="md:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  title="Voltar para a lista de conversas"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>

                <!-- Avatar e Identificação -->
                <div class="relative shrink-0">
                  <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {{ getIniciais(conv.nome) }}
                  </div>
                </div>

                <div class="min-w-0">
                  <h4 class="text-sm font-black text-slate-900 truncate">
                    {{ conv.nome }}
                  </h4>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                    <span>{{ conv.cargo || 'Membro da Comunidade' }}</span>
                  </div>
                </div>
              </div>

              <!-- Badge Segura -->
              <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Conexão Direta</span>
              </span>

            </div>

            <!-- Área de Mensagens com Rolagem -->
            <div #chatMessagesContainer class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              
              <!-- Divisor de Início da Conversa -->
              <div class="flex items-center justify-center my-2">
                <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  Início da Conversa
                </span>
              </div>

              @if (carregandoMensagens()) {
                <div class="p-6 text-center">
                  <span class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block"></span>
                  <p class="text-xs text-slate-400 mt-2">Carregando mensagens...</p>
                </div>
              } @else if (mensagens().length === 0) {
                <div class="p-8 text-center space-y-1">
                  <p class="text-xs font-bold text-slate-700">Nenhuma mensagem ainda.</p>
                  <p class="text-[11px] text-slate-400">Envie a primeira mensagem para iniciar a conversa.</p>
                </div>
              } @else {
                @for (msg of mensagens(); track msg.id) {
                  
                  <!-- MENSAGEM DO USUÁRIO LOGADO (DIREITA) -->
                  @if (msg.remetente_id === meuId()) {
                    <div class="flex justify-end animate-fadeIn">
                      <div class="max-w-[85%] sm:max-w-[70%] bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs space-y-1">
                        <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {{ msg.texto }}
                        </p>
                        
                        <div class="flex items-center justify-end gap-1 text-[10px] text-indigo-200">
                          <span>{{ formatarHora(msg.criado_em) }}</span>
                          <span [title]="msg.lida ? 'Lida' : 'Enviada'">{{ msg.lida ? '✓✓' : '✓' }}</span>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <!-- MENSAGEM DO OUTRO PARTICIPANTE (ESQUERDA) -->
                    <div class="flex justify-start items-end gap-2.5 animate-fadeIn">
                      <div class="w-7 h-7 rounded-xl bg-slate-700 text-white text-[10px] font-black flex items-center justify-center shrink-0 mb-1">
                        {{ getIniciais(conv.nome) }}
                      </div>

                      <div class="max-w-[85%] sm:max-w-[70%] bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs space-y-1">
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                          {{ msg.texto }}
                        </p>
                        
                        <div class="text-[10px] text-slate-400">
                          {{ formatarHora(msg.criado_em) }}
                        </div>
                      </div>
                    </div>
                  }

                }
              }
            </div>

            <!-- Campo de Texto Fixo Inferior para Envio de Mensagem -->
            <div class="p-3 sm:p-4 border-t border-slate-200 bg-white">
              <form (submit)="enviarMensagemSubmit($event)" class="flex items-end gap-2 sm:gap-3">
                <div class="flex-1 relative">
                  <textarea
                    #mensagemInput
                    [value]="textoMensagem()"
                    (input)="onTextoInput($event)"
                    (keydown.enter)="onEnterPressionado($event)"
                    rows="1"
                    placeholder="Digite sua mensagem técnica (Pressione Enter para enviar)..."
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-2xl p-3 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden resize-none max-h-28 transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  [disabled]="!textoMensagem().trim() || enviandoMensagem()"
                  [class]="textoMensagem().trim() && !enviandoMensagem()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                  class="h-11 px-4 sm:px-5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  @if (enviandoMensagem()) {
                    <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  } @else {
                    <span class="hidden sm:inline">Enviar</span>
                    <svg class="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  }
                </button>
              </form>
            </div>

          } @else {

            <!-- Estado Vazio (Nenhuma conversa selecionada no Desktop) -->
            <div class="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 bg-slate-50/50">
              <div class="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>

              <div class="max-w-md space-y-1.5">
                <h4 class="text-base sm:text-lg font-black text-slate-900">
                  Selecione uma conversa para começar
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Converse diretamente com colegas de profissão, tire dúvidas sobre laudos periciais ou combine parcerias técnicas.
                </p>
              </div>

              <div class="pt-2 flex flex-wrap justify-center gap-2">
                @for (conv of conversas(); track conv.id) {
                  <button
                    type="button"
                    (click)="selecionarConversa(conv.id)"
                    class="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
                  >
                    Conversar com {{ conv.nome }}
                  </button>
                }
              </div>
            </div>

          }

        </div>

      </div>

    </div>
  `
})
export class ComunidadeMensagensComponent implements OnInit, AfterViewChecked {
  private readonly supabaseService = inject(SupabaseService);

  readonly conversas = signal<any[]>([]);
  readonly mensagens = signal<any[]>([]);
  readonly carregandoConversas = signal<boolean>(true);
  readonly carregandoMensagens = signal<boolean>(false);
  readonly enviandoMensagem = signal<boolean>(false);
  readonly meuId = signal<string | null>(null);

  readonly conversaSelecionadaId = signal<string | null>(null);
  readonly buscaTexto = signal<string>('');
  readonly textoMensagem = signal<string>('');

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');

  @ViewChild('chatMessagesContainer') private chatContainer?: ElementRef<HTMLDivElement>;
  private scrollPendente = false;

  readonly totalNaoLidas = computed(() => {
    return this.conversas().reduce((acc, c) => acc + (c.naoLidas || 0), 0);
  });

  readonly conversasFiltradas = computed(() => {
    const busca = this.buscaTexto().toLowerCase().trim();
    const lista = this.conversas();
    if (!busca) return lista;
    return lista.filter(c =>
      (c.nome || '').toLowerCase().includes(busca) ||
      (c.cargo || '').toLowerCase().includes(busca) ||
      (c.ultimaMensagem || '').toLowerCase().includes(busca)
    );
  });

  readonly conversaAberta = computed(() => {
    const id = this.conversaSelecionadaId();
    if (!id) return null;
    return this.conversas().find(c => c.id === id) || null;
  });

  async ngOnInit(): Promise<void> {
    const session = await this.supabaseService.getSession();
    this.meuId.set(session?.user?.id || null);
    await this.carregarConversas();
  }

  ngAfterViewChecked(): void {
    if (this.scrollPendente && this.chatContainer) {
      this.scrollParaFim();
      this.scrollPendente = false;
    }
  }

  async carregarConversas(): Promise<void> {
    this.carregandoConversas.set(true);
    try {
      const lista = await this.supabaseService.listarMinhasConversas();
      this.conversas.set(lista);
    } catch (e) {
      console.warn('Erro ao carregar conversas:', e);
    } finally {
      this.carregandoConversas.set(false);
    }
  }

  async selecionarConversa(conversaId: string): Promise<void> {
    this.conversaSelecionadaId.set(conversaId);
    this.carregandoMensagens.set(true);
    this.scrollPendente = true;

    try {
      const msgs = await this.supabaseService.listarMensagensDaConversa(conversaId);
      this.mensagens.set(msgs);

      // Marca mensagens não lidas como lidas
      await this.supabaseService.marcarMensagensComoLidas(conversaId);

      // Atualiza contador de não lidas localmente
      this.conversas.update(lista =>
        lista.map(c => (c.id === conversaId ? { ...c, naoLidas: 0 } : c))
      );
    } catch (e) {
      console.warn('Erro ao carregar mensagens da conversa:', e);
    } finally {
      this.carregandoMensagens.set(false);
      this.scrollPendente = true;
    }
  }

  fecharConversaMobile(): void {
    this.conversaSelecionadaId.set(null);
  }

  onBuscaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.buscaTexto.set(target.value);
  }

  onTextoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.textoMensagem.set(target.value);
  }

  onEnterPressionado(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.enviarMensagemSubmit();
    }
  }

  async enviarMensagemSubmit(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
    }

    const id = this.conversaSelecionadaId();
    const texto = this.textoMensagem().trim();
    if (!id || !texto || this.enviandoMensagem()) return;

    this.enviandoMensagem.set(true);
    this.mensagemFeedback.set(null);

    const { error, data } = await this.supabaseService.enviarMensagem(id, texto);

    this.enviandoMensagem.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao enviar mensagem: ' + (error.message || 'Tente novamente.'));
      return;
    }

    // Inserção otimista / do resultado no feed de mensagens
    const novaMsg = data || {
      id: 'temp-' + Date.now(),
      conversa_id: id,
      remetente_id: this.meuId(),
      texto,
      criado_em: new Date().toISOString(),
      lida: false
    };

    this.mensagens.update(lista => [...lista, novaMsg]);
    this.textoMensagem.set('');
    this.scrollPendente = true;

    // Atualiza a prévia na lista de conversas
    this.conversas.update(lista =>
      lista.map(c =>
        c.id === id
          ? { ...c, ultimaMensagem: texto, ultimaMensagemEm: new Date().toISOString() }
          : c
      )
    );
  }

  private scrollParaFim(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch {
      // noop
    }
  }

  getIniciais(nome: string | undefined): string {
    if (!nome) return '👤';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarTempo(tempoOuData: string | undefined): string {
    if (!tempoOuData) return '';
    try {
      const data = new Date(tempoOuData);
      if (isNaN(data.getTime())) return tempoOuData;

      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'Agora';
      if (diffMin < 60) return `${diffMin} min`;
      if (diffHoras < 24) return `${diffHoras} h`;
      if (diffDias === 1) return 'Ontem';
      if (diffDias < 7) return `${diffDias} d`;

      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return tempoOuData;
    }
  }

  formatarHora(dataStr: string | undefined): string {
    if (!dataStr) return '';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }
}
