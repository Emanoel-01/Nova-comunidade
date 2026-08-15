import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunidadeStateService } from './comunidade-state.service';

@Component({
  selector: 'app-comunidade-vagas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

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
              <span>Mural de Vagas</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300">
              Oportunidades exclusivas para membros da comunidade em engenharia diagnóstica, perícias judiciais e gestão predial.
            </p>
          </div>

          <!-- Contador de Vagas Ativas -->
          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ vagas().length }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Vagas Ativas</div>
              <div class="text-[11px] text-indigo-200">Atualizadas semanalmente</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Grade / Lista de Vagas -->
      <div class="space-y-6">
        @for (vaga of vagas(); track vaga.id) {
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all space-y-5">
            
            <!-- Topo do Card: Badges e Data -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Badge de Tipo de Contrato com Cor Específica -->
                @if (vaga.tipoContrato === 'CLT') {
                  <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    CLT
                  </span>
                } @else if (vaga.tipoContrato === 'PJ') {
                  <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                    PJ
                  </span>
                } @else if (vaga.tipoContrato === 'Remoto') {
                  <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    Remoto
                  </span>
                } @else {
                  <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {{ vaga.tipoContrato }}
                  </span>
                }

                <span class="text-xs text-slate-500 font-medium">
                  {{ vaga.publicadaEm }}
                </span>
              </div>

              <!-- Badge de Candidatura se já candidatado -->
              @if (vaga.candidatado) {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Candidatura Enviada</span>
                </span>
              }
            </div>

            <!-- Título e Informações Principais -->
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

                <span>•</span>

                <span class="font-semibold text-emerald-700">
                  💰 {{ vaga.remuneracao }}
                </span>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">
                {{ vaga.descricao }}
              </p>
            </div>

            <!-- Seção de Detalhes Expandida -->
            @if (vagasDetalhesAbertas().includes(vaga.id)) {
              <div class="border-t border-slate-100 pt-5 space-y-4 bg-slate-50/70 p-5 rounded-2xl animate-fadeIn">
                
                <!-- Requisitos -->
                <div class="space-y-2">
                  <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋 Requisitos e Qualificações:</span>
                  </h5>
                  <ul class="space-y-1.5 text-xs text-slate-700">
                    @for (req of vaga.requisitos; track req) {
                      <li class="flex items-start gap-2">
                        <span class="text-indigo-600 font-bold">•</span>
                        <span>{{ req }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <!-- Benefícios -->
                <div class="space-y-2 pt-2 border-t border-slate-200/60">
                  <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎁 Benefícios & Diferenciais:</span>
                  </h5>
                  <ul class="space-y-1.5 text-xs text-slate-700">
                    @for (ben of vaga.beneficios; track ben) {
                      <li class="flex items-start gap-2">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span>{{ ben }}</span>
                      </li>
                    }
                  </ul>
                </div>

              </div>
            }

            <!-- Área de Candidatura Aberta -->
            @if (vagaCandidaturaAberta() === vaga.id && !vaga.candidatado) {
              <div class="border-t border-indigo-100 pt-4 p-5 rounded-2xl bg-indigo-50/40 space-y-3">
                <div class="flex items-center justify-between">
                  <h5 class="text-xs font-bold text-slate-900">
                    Candidatura para: {{ vaga.titulo }}
                  </h5>
                  <span class="text-[11px] text-slate-500">Seus dados do perfil serão anexados</span>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-semibold text-slate-700">
                    Carta de Apresentação / Mensagem Rápida:
                  </label>
                  <textarea
                    [value]="mensagemCandidatura()"
                    (input)="onMensagemInput($event)"
                    rows="3"
                    placeholder="Apresente brevemente seus diferenciais técnicos e disponibilidade para início..."
                    class="w-full bg-white text-xs text-slate-800 rounded-xl p-3 border border-slate-200 focus:border-indigo-500 outline-hidden resize-none"
                  ></textarea>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    (click)="fecharFormularioCandidatura()"
                    class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    (click)="enviarCandidatura(vaga.id)"
                    class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Enviar Candidatura
                  </button>
                </div>
              </div>
            }

            <!-- Rodapé do Card com Ações (Detalhes / Candidatar-se) -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              
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

              @if (vaga.candidatado) {
                <button
                  type="button"
                  disabled
                  class="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-default"
                >
                  <span>✓ Inscrito</span>
                </button>
              } @else if (vagaCandidaturaAberta() !== vaga.id) {
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

            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class ComunidadeVagasComponent {
  readonly state = inject(ComunidadeStateService);
  readonly vagas = this.state.vagas;

  readonly vagasDetalhesAbertas = signal<string[]>([]);
  readonly vagaCandidaturaAberta = signal<string | null>(null);
  readonly mensagemCandidatura = signal<string>('');

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
    this.vagaCandidaturaAberta.set(vagaId);
    this.mensagemCandidatura.set('');
  }

  fecharFormularioCandidatura(): void {
    this.vagaCandidaturaAberta.set(null);
    this.mensagemCandidatura.set('');
  }

  onMensagemInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.mensagemCandidatura.set(target.value);
  }

  enviarCandidatura(vagaId: string): void {
    this.state.candidatarVaga(vagaId);
    this.vagaCandidaturaAberta.set(null);
    this.mensagemCandidatura.set('');
  }
}
