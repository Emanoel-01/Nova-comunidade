import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunidadeStateService } from './comunidade-state.service';

@Component({
  selector: 'app-comunidade-eventos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- 1. Cabeçalho do Calendário de Eventos (Banner Escuro Gradiente) -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Encontros Técnicos & Transmissões</span>
            </div>

            <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Calendário de Eventos</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Participe de webinars ao vivo, masterclasses exclusivas e acesse o acervo de sessões técnicas realizadas.
            </p>
          </div>

          <!-- Estatística Rápida -->
          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ eventos().length }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Sessões Programadas</div>
              <div class="text-[11px] text-indigo-200">Com emissão de certificado</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Lista de Eventos (Futuros com Borda Destacada + Passados Acinzentados) -->
      <div class="space-y-6">
        @for (evento of eventos(); track evento.id) {
          
          <!-- EVENTO FUTURO (Ativo & Destacado) -->
          @if (evento.tipo === 'futuro') {
            <div class="bg-white rounded-3xl border-2 border-indigo-200/90 hover:border-indigo-400 p-6 sm:p-8 shadow-xs transition-all space-y-6 relative overflow-hidden">
              
              <!-- Faixa decorativa sutil no topo -->
              <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700"></div>

              <!-- Topo do Card: Badge de Data + Tag + Status de Inscrição -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div class="flex items-center gap-3.5">
                  <!-- Caixa de Data com Destaque -->
                  <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                    <span class="text-lg font-black leading-none">{{ evento.dataBadge.dia }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-200">{{ evento.dataBadge.mes }}</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {{ evento.tag }}
                      </span>
                      <span class="text-xs text-slate-500 font-bold">
                        {{ evento.dataHora }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium pt-0.5">
                      {{ evento.plataforma }}
                    </p>
                  </div>
                </div>

                <!-- Badge de Inscrição Confirmada -->
                @if (evento.inscrito) {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shrink-0 self-start sm:self-auto">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Vaga Garantida</span>
                  </span>
                }
              </div>

              <!-- Título e Descrição do Evento -->
              <div class="space-y-3">
                <h4 class="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {{ evento.titulo }}
                </h4>
                
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ evento.descricao }}
                </p>

                <!-- Palestrante -->
                <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    👨‍🏫
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900">{{ evento.palestrante }}</div>
                    <div class="text-[11px] text-slate-500">{{ evento.cargoPalestrante }}</div>
                  </div>
                </div>
              </div>

              <!-- Rodapé: Contador de Inscritos + Botão Inscrever-me / Inscrito -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="font-bold text-slate-900">{{ evento.inscritos }}</span>
                  <span>colegas inscritos</span>
                </div>

                <button
                  type="button"
                  (click)="state.toggleInscricaoEventoCalendario(evento.id)"
                  [class]="evento.inscrito
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'"
                  class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  @if (evento.inscrito) {
                    <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>✓ Inscrito no Evento</span>
                  } @else {
                    <span>Inscrever-me Gratuitamente</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                </button>
              </div>

            </div>
          }

          <!-- EVENTO PASSADO (Acinzentado / Opaco / Histórico) -->
          @if (evento.tipo === 'passado') {
            <div class="bg-slate-100/80 rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-5 opacity-80 hover:opacity-100 transition-opacity">
              
              <!-- Topo do Card: Badge de Data Passada + Tag Realizado -->
              <div class="flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-3">
                  <!-- Caixa de Data Neutra -->
                  <div class="w-12 h-12 rounded-2xl bg-slate-300 text-slate-700 flex flex-col items-center justify-center shrink-0">
                    <span class="text-base font-black leading-none">{{ evento.dataBadge.dia }}</span>
                    <span class="text-[9px] font-bold uppercase tracking-wider text-slate-500">{{ evento.dataBadge.mes }}</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                        {{ evento.tag }}
                      </span>
                      <span class="text-xs text-slate-500 font-medium">
                        {{ evento.dataHora }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 font-medium pt-0.5">
                      {{ evento.plataforma }}
                    </p>
                  </div>
                </div>

                <span class="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                  Sessão Encerrada
                </span>
              </div>

              <!-- Título e Descrição -->
              <div class="space-y-2">
                <h4 class="text-base sm:text-lg font-bold text-slate-700 leading-snug">
                  {{ evento.titulo }}
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {{ evento.descricao }}
                </p>
              </div>

              <!-- Rodapé Histórico -->
              <div class="pt-3 border-t border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-500 flex-wrap">
                <div class="flex items-center gap-2">
                  <span>Palestrante: <strong>{{ evento.palestrante }}</strong></span>
                  <span>•</span>
                  <span>{{ evento.inscritos }} participantes estiveram presentes</span>
                </div>

                <div class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-200/80 px-3 py-1.5 rounded-xl">
                  <span>📹 Gravação Arquivada</span>
                </div>
              </div>

            </div>
          }

        }
      </div>

    </div>
  `
})
export class ComunidadeEventosComponent {
  readonly state = inject(ComunidadeStateService);
  readonly eventos = this.state.eventos;
}
