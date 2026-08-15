// REGRA DE NEGÓCIO (a implementar quando o Supabase estiver conectado):
// A conclusão deste curso (com certificado emitido) é pré-requisito para
// liberar o uso de um módulo específico no app Predial 4.0. A tabela de
// matrícula/progresso deste curso, quando criada, precisa ser consultável
// pelo Predial 4.0 (mesmo projeto Supabase compartilhado) para validar
// esse pré-requisito automaticamente.

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModuloItemDemo {
  id: string;
  numero: number;
  titulo: string;
  duracao: string;
  status: 'concluido' | 'em_andamento' | 'bloqueado';
  descricao: string;
}

@Component({
  selector: 'app-comunidade-curso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      
      <!-- 1. Cabeçalho do Curso & Barra de Progresso -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <span>Capacitação Oficial</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Curso Predial 4.0 — Métodos de Inspeção e Laudos
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Domine as diretrizes da NBR 5674 e NBR 16747 com diagnóstico técnico automatizado e emissão de laudos de alta precisão.
            </p>
          </div>

          <!-- Badge de Matrícula Demonstração -->
          <div class="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 self-start md:self-auto">
            <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <div class="text-xs font-bold">Matrícula Ativa</div>
              <div class="text-[11px] text-emerald-700">Aluno Habilitado (Modo Demo)</div>
            </div>
          </div>
        </div>

        <!-- Barra de Progresso -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span class="text-slate-700">Progresso do Aluno</span>
            <span class="text-indigo-600 font-bold">
              {{ modulosConcluidos() }} de {{ modulos().length }} módulos concluídos — {{ porcentagemConcluida() }}%
            </span>
          </div>

          <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/80">
            <div
              class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              [style.width.%]="porcentagemConcluida()"
            ></div>
          </div>
        </div>
      </div>

      <!-- 2. Lista de Módulos do Curso -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-base sm:text-lg font-black text-slate-900">
            Grade de Aulas e Módulos
          </h4>
          <span class="text-xs text-slate-500 font-medium">
            Clique no módulo liberado para assistir
          </span>
        </div>

        <div class="space-y-3">
          @for (mod of modulos(); track mod.id) {
            <div
              class="bg-white rounded-2xl border transition-all overflow-hidden"
              [class.border-indigo-200]="moduloAberto() === mod.id"
              [class.border-slate-200]="moduloAberto() !== mod.id"
              [class.shadow-md]="moduloAberto() === mod.id"
              [class.shadow-xs]="moduloAberto() !== mod.id"
            >
              <!-- Linha de Cabeçalho do Card de Módulo -->
              <div
                (click)="toggleModulo(mod)"
                class="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
              >
                <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  
                  <!-- Ícone de Status -->
                  @if (mod.status === 'concluido') {
                    <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs" title="Módulo Concluído">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  } @else if (mod.status === 'em_andamento') {
                    <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs" title="Módulo em Andamento">
                      <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  } @else {
                    <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0" title="Módulo Bloqueado">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  }

                  <!-- Título e Duração -->
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h5 class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {{ mod.titulo }}
                      </h5>
                      
                      @if (mod.status === 'concluido') {
                        <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          Concluído
                        </span>
                      } @else if (mod.status === 'em_andamento') {
                        <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200/60">
                          Em Andamento
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                          Bloqueado
                        </span>
                      }
                    </div>

                    <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>⏱ Duração: {{ mod.duracao }}</span>
                      <span>•</span>
                      <span>{{ mod.descricao }}</span>
                    </p>
                  </div>
                </div>

                <!-- Chevron / Ação -->
                <div class="shrink-0 text-slate-400">
                  @if (mod.status === 'bloqueado') {
                    <span class="text-xs text-slate-400 font-semibold hidden sm:inline">Bloqueado</span>
                  } @else {
                    <svg
                      class="w-5 h-5 transition-transform duration-200"
                      [class.rotate-180]="moduloAberto() === mod.id"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  }
                </div>
              </div>

              <!-- Conteúdo Expandido do Módulo (Player de Vídeo ou Aviso de Bloqueio) -->
              @if (moduloAberto() === mod.id) {
                <div class="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/50 space-y-4">
                  
                  @if (mod.status === 'bloqueado') {
                    <!-- Aviso de Módulo Bloqueado -->
                    <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-3">
                      <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Complete o módulo anterior para desbloquear esta aula.</span>
                    </div>
                  } @else {
                    <!-- Player de Vídeo do Vimeo (Modo Demonstração) -->
                    <div class="space-y-2">
                      <div class="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                        </svg>
                        <span>Player da Videoaula — Vimeo Integrado</span>
                      </div>

                      <!-- 
                        Nota: Esta URL pública de teste do Vimeo será substituída pelo link real
                        de streaming do Vimeo cadastrado no Admin (com restrição de domínio configurada).
                      -->
                      <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                        <iframe
                          src="https://player.vimeo.com/video/76979871?title=0&byline=0&portrait=0"
                          class="w-full h-full"
                          frameborder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowfullscreen
                          title="Vídeo demonstrativo do curso"
                        ></iframe>
                      </div>
                    </div>

                    <!-- Botão de Ação do Módulo -->
                    <div class="flex items-center justify-between pt-2">
                      <span class="text-xs text-slate-500 italic">
                        Ao terminar de assistir, o progresso é salvo automaticamente.
                      </span>
                      
                      @if (mod.status === 'em_andamento') {
                        <button
                          type="button"
                          (click)="concluirModulo(mod.id)"
                          class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Marcar como Concluído
                        </button>
                      }
                    </div>
                  }

                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- 3. Bloco de Avaliação e Prova Final -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h4 class="text-base sm:text-lg font-black text-slate-900">
              Avaliação de Proficiência Técnica
            </h4>
            <p class="text-xs sm:text-sm text-slate-500">
              Composta por 10 questões de múltipla escolha. Nota mínima para aprovação e certificação: 70%.
            </p>
          </div>

          <!-- Botão Fazer Avaliação (Desabilitado no modo demonstração com tooltip) -->
          <div class="relative group self-start sm:self-auto">
            <button
              type="button"
              [disabled]="!todosModulosConcluidos()"
              [class]="todosModulosConcluidos()
                ? 'px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-colors'
                : 'px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs sm:text-sm cursor-not-allowed flex items-center gap-2'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Fazer Avaliação</span>
            </button>

            @if (!todosModulosConcluidos()) {
              <div class="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl shadow-xl z-10 text-center">
                Conclua todos os módulos para liberar a avaliação
              </div>
            }
          </div>
        </div>
      </div>

      <!-- 4. Bloco de Certificado (Acinzentado / Prévia) -->
      <div class="bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-10 text-center space-y-4 opacity-80">
        <div class="w-16 h-16 rounded-2xl bg-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div class="space-y-1 max-w-md mx-auto">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            <span>Certificado Predial 4.0</span>
          </div>
          <h4 class="text-base sm:text-lg font-bold text-slate-700">
            Emissão Bloqueada
          </h4>
          <p class="text-xs sm:text-sm text-slate-500">
            Seu certificado aparecerá aqui após a conclusão do curso e da avaliação.
          </p>
        </div>
      </div>

      <!-- Nota de Rodapé da Área -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
        <span>Progresso, módulos e certificado mostrados aqui são apenas ilustrativos.</span>
      </div>

    </div>
  `
})
export class ComunidadeCursoComponent {
  readonly moduloAberto = signal<string | null>('mod-3');

  readonly modulos = signal<ModuloItemDemo[]>([
    {
      id: 'mod-1',
      numero: 1,
      titulo: 'Módulo 1 — Fundamentos de Patologia das Construções',
      duracao: '45 min',
      status: 'concluido',
      descricao: 'Conceitos da NBR 5674 e diagnóstico de manifestações'
    },
    {
      id: 'mod-2',
      numero: 2,
      titulo: 'Módulo 2 — Leitura e Diagnóstico de Manifestações Patológicas',
      duracao: '50 min',
      status: 'concluido',
      descricao: 'Análise de fissuras, umidade, corrosão e infiltrações'
    },
    {
      id: 'mod-3',
      numero: 3,
      titulo: 'Módulo 3 — Checklist Técnico e Inspeção Predial na Prática',
      duracao: '60 min',
      status: 'em_andamento',
      descricao: 'Preenchimento em campo, registro fotográfico e checklist guiado'
    },
    {
      id: 'mod-4',
      numero: 4,
      titulo: 'Módulo 4 — Elaboração de Laudos Periciais e Recomendações 4.0',
      duracao: '40 min',
      status: 'bloqueado',
      descricao: 'Geração automática de laudos e planos de ação técnicos'
    },
    {
      id: 'mod-5',
      numero: 5,
      titulo: 'Módulo 5 — Gestão Preventiva e Plano de Manutenção NBR 5674',
      duracao: '35 min',
      status: 'bloqueado',
      descricao: 'Cronogramas periódicos e conformidade legal predial'
    }
  ]);

  readonly modulosConcluidos = computed(() => {
    return this.modulos().filter(m => m.status === 'concluido').length;
  });

  readonly porcentagemConcluida = computed(() => {
    const total = this.modulos().length;
    if (total === 0) return 0;
    return Math.round((this.modulosConcluidos() / total) * 100);
  });

  readonly todosModulosConcluidos = computed(() => {
    return this.modulosConcluidos() === this.modulos().length;
  });

  toggleModulo(mod: ModuloItemDemo): void {
    if (this.moduloAberto() === mod.id) {
      this.moduloAberto.set(null);
    } else {
      this.moduloAberto.set(mod.id);
    }
  }

  concluirModulo(id: string): void {
    this.modulos.update(list => {
      const idx = list.findIndex(m => m.id === id);
      if (idx === -1) return list;

      const updated = [...list];
      updated[idx] = { ...updated[idx], status: 'concluido' };

      // Desbloqueia o próximo se existir
      if (idx + 1 < updated.length && updated[idx + 1].status === 'bloqueado') {
        updated[idx + 1] = { ...updated[idx + 1], status: 'em_andamento' };
      }

      return updated;
    });
  }
}
