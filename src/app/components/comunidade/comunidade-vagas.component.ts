import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-comunidade-vagas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- Feedback de Sucesso/Erro -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <span>{{ mensagemFeedback() }}</span>
          <button type="button" (click)="mensagemFeedback.set(null)" class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer">✕</button>
        </div>
      }

      <!-- 1. Cabeçalho do Mural de Vagas (Banner Escuro Gradiente) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Carreiras & Conexões Técnicas</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Mural de Oportunidades & Vagas</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300">
              Oportunidades exclusivas para membros da comunidade em engenharia diagnóstica, perícias judiciais, vistorias e gestão predial.
            </p>
          </div>

          <!-- Status de Acesso & Contador de Vagas Ativas -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                {{ vagas().length }}
              </div>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">Vagas Ativas</div>
                <div class="text-[11px] text-indigo-200">Atualizadas no Supabase</div>
              </div>
            </div>

            @if (!carregando() && !temAcesso()) {
              <div class="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5">
                <span class="text-base">🔒</span>
                <span class="font-medium">Módulo Vagas com Acesso Restrito</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- 2. Grade / Lista de Vagas -->
      @if (carregando()) {
        <!-- Estado de Carregamento -->
        <div class="space-y-4">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded-md w-40"></div>
            <div class="h-6 bg-slate-200 rounded-md w-3/4"></div>
            <div class="h-4 bg-slate-100 rounded-md w-1/2"></div>
          </div>
          <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
            <div class="h-4 bg-slate-200 rounded-md w-32"></div>
            <div class="h-6 bg-slate-200 rounded-md w-2/3"></div>
            <div class="h-4 bg-slate-100 rounded-md w-1/2"></div>
          </div>
        </div>
      } @else if (vagas().length === 0) {
        <!-- Estado Vazio -->
        <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-3 shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">Nenhuma vaga aberta no momento</h3>
          <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Novas oportunidades de engenharia diagnóstica e consultoria são publicadas regularmente. Fique atento!
          </p>
        </div>
      } @else {
        <!-- Lista de Vagas Reais -->
        <div class="space-y-6">
          @for (vaga of vagas(); track vaga.id) {
            <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all space-y-5">
              
              <!-- Topo do Card: Badges e Data -->
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Badge de Tipo de Contrato -->
                  @if (getTipoContrato(vaga) === 'CLT') {
                    <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      CLT
                    </span>
                  } @else if (getTipoContrato(vaga) === 'PJ') {
                    <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                      PJ
                    </span>
                  } @else if (getTipoContrato(vaga) === 'Remoto') {
                    <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      Remoto
                    </span>
                  } @else {
                    <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {{ getTipoContrato(vaga) || 'Oportunidade' }}
                    </span>
                  }

                  <span class="text-xs text-slate-400 font-medium">
                    {{ formatarTempo(vaga.criado_em || vaga.publicadaEm) }}
                  </span>
                </div>

                <!-- Badge de Candidatura se já candidatado -->
                @if (vagasCandidatadas().includes(vaga.id)) {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Candidatura Enviada</span>
                  </span>
                }
              </div>

              <!-- Título e Informações Principais (Vitrine Pública) -->
              <div class="space-y-2">
                <h4 class="text-lg sm:text-xl font-black text-slate-900">
                  {{ vaga.titulo }}
                </h4>

                <div class="flex items-center gap-4 text-xs sm:text-sm text-slate-600 flex-wrap">
                  <span class="font-bold text-slate-800 flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ vaga.empresa }}
                  </span>

                  <span>•</span>

                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ vaga.localizacao }}
                  </span>

                  @if (vaga.remuneracao) {
                    <span>•</span>
                    <span class="font-semibold text-emerald-700">
                      💰 {{ vaga.remuneracao }}
                    </span>
                  }
                </div>
              </div>

              <!-- Seção Expandida: Com Permissão vs. Sem Permissão (Trava) -->
              @if (vagasDetalhesAbertas().includes(vaga.id)) {
                
                @if (temAcesso()) {
                  <!-- DETALHE COMPLETO (LIBERADO) -->
                  <div class="border-t border-slate-100 pt-5 space-y-4 bg-slate-50/70 p-5 rounded-2xl animate-fadeIn">
                    
                    <!-- Descrição Detalhada -->
                    @if (vaga.descricao) {
                      <div class="space-y-1.5">
                        <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Sobre a Oportunidade:
                        </h5>
                        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {{ vaga.descricao }}
                        </p>
                      </div>
                    }

                    <!-- Requisitos -->
                    @if (getRequisitosArray(vaga).length > 0) {
                      <div class="space-y-2 pt-2 border-t border-slate-200/60">
                        <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📋 Requisitos e Qualificações:</span>
                        </h5>
                        <ul class="space-y-1.5 text-xs text-slate-700">
                          @for (req of getRequisitosArray(vaga); track req) {
                            <li class="flex items-start gap-2">
                              <span class="text-indigo-600 font-bold">•</span>
                              <span>{{ req }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    }

                    <!-- Benefícios -->
                    @if (getBeneficiosArray(vaga).length > 0) {
                      <div class="space-y-2 pt-2 border-t border-slate-200/60">
                        <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🎁 Benefícios & Diferenciais:</span>
                        </h5>
                        <ul class="space-y-1.5 text-xs text-slate-700">
                          @for (ben of getBeneficiosArray(vaga); track ben) {
                            <li class="flex items-start gap-2">
                              <span class="text-emerald-600 font-bold">✓</span>
                              <span>{{ ben }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    }

                  </div>
                } @else {
                  <!-- TELA / CARD DE ACESSO RESTRITO (TRAVA) -->
                  <div class="border-t border-amber-200/60 pt-5 p-6 rounded-2xl bg-amber-50/70 space-y-3 animate-fadeIn text-center sm:text-left">
                    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
                        🔒
                      </div>
                      <div class="space-y-1.5">
                        <h5 class="text-sm font-black text-amber-900">
                          Esta vaga é exclusiva para membros com acesso liberado
                        </h5>
                        <p class="text-xs text-amber-800/90 leading-relaxed max-w-xl">
                          Os detalhes completos, requisitos técnicos e canal direto de candidatura são restritos. Fale com o Admin da Comunidade para solicitar liberação deste módulo em seu plano.
                        </p>
                      </div>
                    </div>
                  </div>
                }

              }

              <!-- Área de Candidatura Aberta (Apenas se tem acesso) -->
              @if (temAcesso() && vagaCandidaturaAberta() === vaga.id && !vagasCandidatadas().includes(vaga.id)) {
                <div class="border-t border-indigo-100 pt-4 p-5 rounded-2xl bg-indigo-50/50 space-y-3 animate-fadeIn">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold text-slate-900">
                      Candidatura para: {{ vaga.titulo }}
                    </h5>
                    <span class="text-[11px] text-slate-500">Seus dados do perfil serão vinculados</span>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700">
                      Carta de Apresentação / Mensagem Opcional:
                    </label>
                    <textarea
                      [value]="mensagemCandidatura()"
                      (input)="onMensagemInput($event)"
                      rows="3"
                      placeholder="Apresente brevemente seus diferenciais técnicos, experiência com laudos e disponibilidade..."
                      class="w-full bg-white text-xs text-slate-800 rounded-xl p-3 border border-slate-200 focus:border-indigo-500 outline-hidden resize-none"
                    ></textarea>
                  </div>

                  <div class="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      (click)="fecharFormularioCandidatura()"
                      [disabled]="enviandoCandidatura()"
                      class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      (click)="enviarCandidatura(vaga.id)"
                      [disabled]="enviandoCandidatura()"
                      class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      @if (enviandoCandidatura()) {
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Enviando...</span>
                      } @else {
                        <span>Enviar Candidatura</span>
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- Rodapé do Card com Ações (Ver Detalhes / Candidatar-se) -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                
                <!-- Botão de Expandir Detalhes -->
                <button
                  type="button"
                  (click)="toggleDetalhes(vaga.id)"
                  class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{{ vagasDetalhesAbertas().includes(vaga.id) ? 'Ocultar Detalhes' : 'Ver Detalhes & Requisitos' }}</span>
                  <svg
                    class="w-4 h-4 transition-transform"
                    [class.rotate-180]="vagasDetalhesAbertas().includes(vaga.id)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Botão de Candidatura / Status -->
                @if (vagasCandidatadas().includes(vaga.id)) {
                  <button
                    type="button"
                    disabled
                    class="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-default"
                  >
                    <span>✓ Inscrito</span>
                  </button>
                } @else if (temAcesso()) {
                  @if (vagaCandidaturaAberta() !== vaga.id) {
                    <button
                      type="button"
                      (click)="abrirFormularioCandidatura(vaga.id)"
                      class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Candidatar-se</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  }
                } @else {
                  <button
                    type="button"
                    (click)="toggleDetalhes(vaga.id)"
                    class="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <span>🔒 Acesso Restrito</span>
                  </button>
                }

              </div>

            </div>
          }
        </div>
      }

    </div>
  `
})
export class ComunidadeVagasComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly vagas = signal<any[]>([]);
  readonly temAcesso = signal<boolean>(false);
  readonly carregando = signal<boolean>(true);
  readonly enviandoCandidatura = signal<boolean>(false);

  readonly vagasDetalhesAbertas = signal<string[]>([]);
  readonly vagaCandidaturaAberta = signal<string | null>(null);
  readonly vagasCandidatadas = signal<string[]>([]);
  readonly mensagemCandidatura = signal<string>('');

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  async carregarDados(): Promise<void> {
    this.carregando.set(true);
    try {
      // 1. Verifica permissão de acesso ao módulo Vagas
      const acesso = await this.supabaseService.temPermissaoModulo('comunidade', 'vagas');
      this.temAcesso.set(acesso);

      // 2. Carrega lista de vagas ativas (vitrine)
      const lista = await this.supabaseService.listarVagas();
      this.vagas.set(lista);

      // 3. Verifica para cada vaga se o usuário logado já se candidatou
      const candidaturas: string[] = [];
      for (const vaga of lista) {
        const ja = await this.supabaseService.jaMeCandidatei(vaga.id);
        if (ja) {
          candidaturas.push(vaga.id);
        }
      }
      this.vagasCandidatadas.set(candidaturas);
    } catch (e) {
      console.warn('Erro ao carregar mural de vagas:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  getTipoContrato(vaga: any): string {
    return vaga.tipo_contrato || vaga.tipoContrato || 'Oportunidade';
  }

  getRequisitosArray(vaga: any): string[] {
    if (Array.isArray(vaga.requisitos)) return vaga.requisitos;
    if (typeof vaga.requisitos === 'string') {
      return vaga.requisitos.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }

  getBeneficiosArray(vaga: any): string[] {
    if (Array.isArray(vaga.beneficios)) return vaga.beneficios;
    if (typeof vaga.beneficios === 'string') {
      return vaga.beneficios.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }

  formatarTempo(dataIso: string | undefined): string {
    if (!dataIso) return 'Recente';
    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Recente';
    }
  }

  toggleDetalhes(vagaId: string): void {
    this.vagasDetalhesAbertas.update(lista => {
      if (lista.includes(vagaId)) {
        return lista.filter(id => id !== vagaId);
      } else {
        return [...lista, vagaId];
      }
    });
  }

  abrirFormularioCandidatura(vagaId: string): void {
    if (!this.temAcesso()) return;
    this.vagaCandidaturaAberta.set(vagaId);
    this.mensagemCandidatura.set('');
    // Garante que os detalhes estejam visíveis
    if (!this.vagasDetalhesAbertas().includes(vagaId)) {
      this.vagasDetalhesAbertas.update(lista => [...lista, vagaId]);
    }
  }

  fecharFormularioCandidatura(): void {
    this.vagaCandidaturaAberta.set(null);
    this.mensagemCandidatura.set('');
  }

  onMensagemInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.mensagemCandidatura.set(target.value);
  }

  async enviarCandidatura(vagaId: string): Promise<void> {
    if (!this.temAcesso() || this.enviandoCandidatura()) return;

    this.enviandoCandidatura.set(true);
    this.mensagemFeedback.set(null);

    const msg = this.mensagemCandidatura().trim();
    const { error } = await this.supabaseService.candidatarVaga(vagaId, msg);

    this.enviandoCandidatura.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao enviar candidatura: ' + (error.message || 'Tente novamente.'));
      return;
    }

    // Sucesso
    this.vagasCandidatadas.update(lista => [...lista, vagaId]);
    this.vagaCandidaturaAberta.set(null);
    this.mensagemCandidatura.set('');
    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Candidatura enviada com sucesso! A empresa contratante analisará seu perfil.');
  }
}
