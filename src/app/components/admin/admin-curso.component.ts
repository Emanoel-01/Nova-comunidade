import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModuloCurso {
  id: string;
  titulo: string;
  linkVimeo: string;
  duracaoEstimada: string;
  materiais: { id: string; nome: string }[];
}

export interface PerguntaAvaliacao {
  id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorretaIndex: number;
}

@Component({
  selector: 'app-admin-curso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      
      <!-- Sub-navegação interna das 4 seções -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        <button
          type="button"
          (click)="setSecaoAtiva('modulos')"
          [class]="secaoAtiva() === 'modulos'
            ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm'
            : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors'"
        >
          1. Módulos do Curso
        </button>

        <button
          type="button"
          (click)="setSecaoAtiva('avaliacao')"
          [class]="secaoAtiva() === 'avaliacao'
            ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm'
            : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors'"
        >
          2. Avaliação & Prova
        </button>

        <button
          type="button"
          (click)="setSecaoAtiva('certificado')"
          [class]="secaoAtiva() === 'certificado'
            ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm'
            : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors'"
        >
          3. Certificado
        </button>

        <button
          type="button"
          (click)="setSecaoAtiva('alunos')"
          [class]="secaoAtiva() === 'alunos'
            ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm'
            : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors'"
        >
          4. Alunos Matriculados
        </button>
      </div>

      <!-- SEÇÃO 1: MÓDULOS DO CURSO -->
      @if (secaoAtiva() === 'modulos') {
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                Grade de Módulos & Vídeos Vimeo
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Estruture as aulas, links de streaming restrito e materiais de apoio.
              </p>
            </div>

            <button
              type="button"
              (click)="adicionarModulo()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Adicionar Módulo</span>
            </button>
          </div>

          <!-- Lista de Cards de Módulo -->
          <div class="space-y-6">
            @for (modulo of modulos(); track modulo.id; let i = $index) {
              <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {{ i + 1 }}
                    </span>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Módulo {{ i + 1 }}
                    </span>
                  </div>

                  @if (modulos().length > 1) {
                    <button
                      type="button"
                      (click)="removerModulo(modulo.id)"
                      class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Remover módulo
                    </button>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <!-- Título do Módulo -->
                  <div class="md:col-span-8 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">
                      Título do Módulo
                    </label>
                    <input
                      type="text"
                      [value]="modulo.titulo"
                      (input)="atualizarTituloModulo(modulo.id, $event)"
                      placeholder="Ex: Módulo 1 — Fundamentos de Patologia"
                      class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <!-- Duração Estimada -->
                  <div class="md:col-span-4 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">
                      Duração Estimada
                    </label>
                    <input
                      type="text"
                      [value]="modulo.duracaoEstimada"
                      (input)="atualizarDuracaoModulo(modulo.id, $event)"
                      placeholder="Ex: 45 min"
                      class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <!-- Link do Vídeo (Vimeo) -->
                  <div class="md:col-span-12 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">
                      Link do Vídeo (Vimeo)
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        [value]="modulo.linkVimeo"
                        (input)="atualizarLinkVimeoModulo(modulo.id, $event)"
                        placeholder="https://player.vimeo.com/video/123456789"
                        class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <p class="text-[11px] text-slate-500 italic">
                      Cole aqui o link de embed do Vimeo (com restrição de domínio configurada no player).
                    </p>
                  </div>
                </div>

                <!-- Lista de Materiais Anexos do Módulo -->
                <div class="pt-3 border-t border-slate-100 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700">
                      Materiais de Apoio (PDF, Planilhas, Modelos)
                    </span>
                    <span class="text-[11px] text-slate-400 font-medium">
                      {{ modulo.materiais.length }} anexo(s)
                    </span>
                  </div>

                  @if (modulo.materiais.length > 0) {
                    <div class="space-y-2">
                      @for (mat of modulo.materiais; track mat.id) {
                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div class="flex items-center gap-2 text-slate-700 truncate">
                            <svg class="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span class="font-medium truncate">{{ mat.nome }}</span>
                          </div>
                          <button
                            type="button"
                            (click)="removerMaterial(modulo.id, mat.id)"
                            class="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remover anexo"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  }

                  <!-- Formulário Rápido para Adicionar Material -->
                  <div class="flex gap-2">
                    <input
                      type="text"
                      #novoMatInput
                      placeholder="Nome do arquivo (ex: Checklist_Inspecao_Predial.pdf)"
                      class="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      (click)="adicionarMaterial(modulo.id, novoMatInput.value); novoMatInput.value = ''"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      + Anexar
                    </button>
                  </div>
                </div>

              </div>
            }
          </div>
        </div>
      }

      <!-- SEÇÃO 2: AVALIAÇÃO & PROVA -->
      @if (secaoAtiva() === 'avaliacao') {
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                Banco de Questões da Avaliação
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Defina as perguntas, alternativas e o gabarito oficial para aprovação e certificação.
              </p>
            </div>

            <button
              type="button"
              (click)="adicionarPergunta()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div class="space-y-6">
            @for (pergunta of perguntas(); track pergunta.id; let i = $index) {
              <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Questão {{ i + 1 }}
                  </span>
                  @if (perguntas().length > 1) {
                    <button
                      type="button"
                      (click)="removerPergunta(pergunta.id)"
                      class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Remover questão
                    </button>
                  }
                </div>

                <!-- Enunciado -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Enunciado da Questão
                  </label>
                  <textarea
                    rows="2"
                    [value]="pergunta.enunciado"
                    (input)="atualizarEnunciado(pergunta.id, $event)"
                    placeholder="Escreva a pergunta técnica..."
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  ></textarea>
                </div>

                <!-- 4 Alternativas com seleção de gabarito -->
                <div class="space-y-2.5 pt-2">
                  <label class="block text-xs font-bold text-slate-700">
                    Alternativas (Marque a opção correta):
                  </label>
                  
                  @for (alt of pergunta.alternativas; track $index; let idxAlt = $index) {
                    <div class="flex items-center gap-3">
                      <input
                        type="radio"
                        [name]="'gabarito-' + pergunta.id"
                        [checked]="pergunta.respostaCorretaIndex === idxAlt"
                        (change)="definirGabarito(pergunta.id, idxAlt)"
                        class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                      />
                      <span class="text-xs font-bold text-slate-500 w-4">
                        {{ getLetraAlternativa(idxAlt) }})
                      </span>
                      <input
                        type="text"
                        [value]="alt"
                        (input)="atualizarAlternativa(pergunta.id, idxAlt, $event)"
                        placeholder="Texto da alternativa..."
                        class="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  }
                </div>

              </div>
            }
          </div>
        </div>
      }

      <!-- SEÇÃO 3: CERTIFICADO -->
      @if (secaoAtiva() === 'certificado') {
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              Configuração e Prévia do Certificado
            </h3>
            <p class="text-xs sm:text-sm text-slate-500">
              Visualize o modelo emitido automaticamente aos alunos aprovados na avaliação final.
            </p>
          </div>

          <!-- Card de Prévia Visual do Certificado -->
          <div class="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40 rounded-3xl border-2 border-amber-300/80 p-8 sm:p-12 shadow-md relative overflow-hidden text-center space-y-6 max-w-3xl mx-auto">
            <div class="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl"></div>
            <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl"></div>

            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-widest border border-amber-200">
                ★ Certificado de Conclusão ★
              </div>
              <h4 class="text-2xl sm:text-3xl font-serif font-black text-slate-900">
                Predial 4.0 — Gestão e Inspeção Técnica
              </h4>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Certificamos que <strong>[Nome do Aluno Matriculado]</strong> concluiu com êxito todas as etapas teórico-práticas e a avaliação técnica de proficiência do curso oficial.
            </p>

            <div class="pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 max-w-lg mx-auto">
              <div>
                <p class="font-bold text-slate-800">Emanoel Amorim</p>
                <p class="text-[11px]">Amorim Serviços de Engenharia</p>
              </div>
              <div class="text-center sm:text-right">
                <p class="font-mono text-[11px] text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                  Cód: P40-DEMO-2026
                </p>
              </div>
            </div>
          </div>

          <!-- Configurações do Certificado -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-3xl mx-auto">
            <h4 class="text-sm font-bold text-slate-900">
              Regras e Texto de Validade
            </h4>
            
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">
                Texto de Validade e Carga Horária
              </label>
              <textarea
                rows="2"
                [value]="textoValidadeCertificado()"
                (input)="atualizarTextoValidade($event)"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              ></textarea>
            </div>
          </div>
        </div>
      }

      <!-- SEÇÃO 4: ALUNOS MATRICULADOS -->
      @if (secaoAtiva() === 'alunos') {
        <div class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mx-auto flex items-center justify-center shadow-inner">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            <div class="space-y-1">
              <h3 class="text-xl font-bold text-slate-900">
                Alunos & Progresso
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                A lista de alunos matriculados e status de aprovação aparecerá aqui quando a tabela de matrículas (<code class="font-mono text-indigo-600">course_enrollments</code>) for criada no Supabase.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Aviso no Rodapé da Aba de Gestão de Curso -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>Todas as alterações desta seção estão em modo demonstração e serão persistidas no Supabase quando as tabelas do curso forem criadas.</span>
      </div>

    </div>
  `
})
export class AdminCursoComponent {
  readonly secaoAtiva = signal<'modulos' | 'avaliacao' | 'certificado' | 'alunos'>('modulos');

  readonly modulos = signal<ModuloCurso[]>([
    {
      id: 'mod-1',
      titulo: 'Módulo 1 — Fundamentos de Patologia e Inspeção Predial',
      linkVimeo: 'https://player.vimeo.com/video/892019283',
      duracaoEstimada: '45 min',
      materiais: [
        { id: 'mat-1', nome: 'Guia_NBR_5674_Manutencao.pdf' },
        { id: 'mat-2', nome: 'Checklist_Inspecao_Campo.pdf' }
      ]
    },
    {
      id: 'mod-2',
      titulo: 'Módulo 2 — Checklist Técnico e Elaboração de Laudos 4.0',
      linkVimeo: 'https://player.vimeo.com/video/892019284',
      duracaoEstimada: '60 min',
      materiais: [
        { id: 'mat-3', nome: 'Modelo_Laudo_Predial_40.docx' }
      ]
    }
  ]);

  readonly perguntas = signal<PerguntaAvaliacao[]>([
    {
      id: 'perg-1',
      enunciado: 'De acordo com a NBR 5674, qual é o objetivo principal do programa de manutenção predial?',
      alternativas: [
        'Apenas reduzir custos operacionais emergenciais.',
        'Preservar o desempenho, a segurança e a vida útil da edificação.',
        'Substituir a necessidade de inspeção visual periódica.',
        'Atender exclusivamente a fins estéticos do condomínio.'
      ],
      respostaCorretaIndex: 1
    },
    {
      id: 'perg-2',
      enunciado: 'Qual das alternativas descreve uma patologia recorrente ligada à umidade por ascensão capilar?',
      alternativas: [
        'Fissuras a 45 graus em vigas de concreto armado.',
        'Eflorescências e descolamento de pintura no rodapé de alvenarias.',
        'Corrosão pontual em coberturas metálicas.',
        'Flecha excessiva no meio de vãos de laje.'
      ],
      respostaCorretaIndex: 1
    }
  ]);

  readonly textoValidadeCertificado = signal(
    'Certificado de capacitação técnica profissional em conformidade com as diretrizes da ABNT NBR 5674 e NBR 16747. Carga horária total estimada: 20 horas.'
  );

  setSecaoAtiva(secao: 'modulos' | 'avaliacao' | 'certificado' | 'alunos'): void {
    this.secaoAtiva.set(secao);
  }

  adicionarModulo(): void {
    const novoNum = this.modulos().length + 1;
    const novo: ModuloCurso = {
      id: 'mod-' + Date.now(),
      titulo: `Módulo ${novoNum} — Novo Tópico Técnico`,
      linkVimeo: '',
      duracaoEstimada: '30 min',
      materiais: []
    };
    this.modulos.update(list => [...list, novo]);
  }

  removerModulo(id: string): void {
    this.modulos.update(list => list.filter(m => m.id !== id));
  }

  atualizarTituloModulo(id: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modulos.update(list => list.map(m => m.id === id ? { ...m, titulo: val } : m));
  }

  atualizarDuracaoModulo(id: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modulos.update(list => list.map(m => m.id === id ? { ...m, duracaoEstimada: val } : m));
  }

  atualizarLinkVimeoModulo(id: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modulos.update(list => list.map(m => m.id === id ? { ...m, linkVimeo: val } : m));
  }

  adicionarMaterial(moduloId: string, nomeArquivo: string): void {
    if (!nomeArquivo.trim()) return;
    this.modulos.update(list => list.map(m => {
      if (m.id === moduloId) {
        return {
          ...m,
          materiais: [...m.materiais, { id: 'mat-' + Date.now(), nome: nomeArquivo.trim() }]
        };
      }
      return m;
    }));
  }

  removerMaterial(moduloId: string, materialId: string): void {
    this.modulos.update(list => list.map(m => {
      if (m.id === moduloId) {
        return {
          ...m,
          materiais: m.materiais.filter(mat => mat.id !== materialId)
        };
      }
      return m;
    }));
  }

  adicionarPergunta(): void {
    const nova: PerguntaAvaliacao = {
      id: 'perg-' + Date.now(),
      enunciado: '',
      alternativas: ['', '', '', ''],
      respostaCorretaIndex: 0
    };
    this.perguntas.update(list => [...list, nova]);
  }

  removerPergunta(id: string): void {
    this.perguntas.update(list => list.filter(p => p.id !== id));
  }

  atualizarEnunciado(id: string, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.perguntas.update(list => list.map(p => p.id === id ? { ...p, enunciado: val } : p));
  }

  atualizarAlternativa(perguntaId: string, indexAlt: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.perguntas.update(list => list.map(p => {
      if (p.id === perguntaId) {
        const novasAlts = [...p.alternativas];
        novasAlts[indexAlt] = val;
        return { ...p, alternativas: novasAlts };
      }
      return p;
    }));
  }

  definirGabarito(perguntaId: string, indexAlt: number): void {
    this.perguntas.update(list => list.map(p => p.id === perguntaId ? { ...p, respostaCorretaIndex: indexAlt } : p));
  }

  getLetraAlternativa(idx: number): string {
    return ['A', 'B', 'C', 'D', 'E'][idx] || `${idx + 1}`;
  }

  atualizarTextoValidade(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.textoValidadeCertificado.set(val);
  }
}
