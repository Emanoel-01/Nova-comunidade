import { Component, signal, computed } from '@angular/core';
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

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  moduloPredialVinculado: string | null; // null = curso avulso, sem vínculo com o app
  modulos: ModuloCurso[];
  perguntas: PerguntaAvaliacao[];
  textoValidadeCertificado: string;
}

@Component({
  selector: 'app-admin-curso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- CASO 1: NENHUM CURSO SELECIONADO -> LISTA "MEUS CURSOS" -->
      @if (cursoSelecionadoId() === null) {
        <div class="space-y-6">
          
          <!-- Cabeçalho da Lista de Cursos -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-slate-900">
                Meus Cursos & Capacitações
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Gerencie múltiplos cursos, grades de videoaulas, avaliações de proficiência e certificados.
              </p>
            </div>

            <button
              type="button"
              (click)="abrirModalCriarCurso()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Novo Curso</span>
            </button>
          </div>

          <!-- Formulário / Modal de Criação de Curso -->
          @if (criandoNovoCurso()) {
            <div class="bg-indigo-50/50 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div class="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    +
                  </div>
                  <h4 class="text-base font-bold text-slate-900">Novo Curso</h4>
                </div>
                <button
                  type="button"
                  (click)="cancelarCriacaoCurso()"
                  class="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">Título do Curso *</label>
                  <input
                    type="text"
                    #novoTituloInput
                    placeholder="Ex: Fundamentos de BIM para Engenharia Diagnóstica"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">Descrição Curta *</label>
                  <textarea
                    #novaDescricaoInput
                    rows="2"
                    placeholder="Breve resumo sobre os objetivos e diretrizes do curso..."
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">
                    Vínculo com Módulo do Predial 4.0 (Opcional)
                  </label>
                  <select
                    #novoVinculoSelect
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="nenhum">Nenhum (curso avulso / sem vínculo com o app)</option>
                    <option value="Inspeção Predial">Inspeção Predial (Libera módulo de inspeção)</option>
                    <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar de Vizinhança</option>
                    <option value="Outros futuros">Outros módulos futuros</option>
                  </select>
                  <p class="text-[11px] text-slate-500">
                    Cursos avulsos não exigem módulo vinculado. Se vinculado, a conclusão habilitará a funcionalidade respectiva no Predial 4.0.
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  (click)="cancelarCriacaoCurso()"
                  class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="salvarNovoCurso(novoTituloInput.value, novaDescricaoInput.value, novoVinculoSelect.value)"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Criar e Configurar Curso
                </button>
              </div>
            </div>
          }

          <!-- Grade de Cursos Cadastrados -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (curso of cursos(); track curso.id) {
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-3">
                    @if (curso.moduloPredialVinculado) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        Vinculado: {{ curso.moduloPredialVinculado }}
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        Curso Avulso
                      </span>
                    }

                    <span class="text-xs font-semibold text-slate-500">
                      {{ curso.modulos.length }} {{ curso.modulos.length === 1 ? 'módulo' : 'módulos' }}
                    </span>
                  </div>

                  <div>
                    <h4 class="text-base font-bold text-slate-900">
                      {{ curso.titulo }}
                    </h4>
                    <p class="text-xs text-slate-500 line-clamp-2 mt-1">
                      {{ curso.descricao }}
                    </p>
                  </div>

                  <div class="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>📝 {{ curso.perguntas.length }} questões</span>
                    <span>•</span>
                    <span>📜 Certificado ativo</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    (click)="removerCurso(curso.id)"
                    class="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Excluir
                  </button>

                  <button
                    type="button"
                    (click)="selecionarCursoParaEdicao(curso.id)"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar Conteúdo</span>
                  </button>
                </div>
              </div>
            }
          </div>

        </div>
      } @else {
        <!-- CASO 2: UM CURSO SELECIONADO -> VISÃO DE EDIÇÃO DETALHADA -->
        
        <!-- Barra de Navegação Superior / Voltar -->
        <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="voltarParaListaCursos()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar aos Cursos</span>
            </button>

            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {{ cursoAtivo()?.titulo }}
                </h3>
                @if (cursoAtivo()?.moduloPredialVinculado) {
                  <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 hidden sm:inline">
                    Vinculado: {{ cursoAtivo()?.moduloPredialVinculado }}
                  </span>
                }
              </div>
              <p class="text-[11px] text-slate-500">Editando estrutura e configurações do curso</p>
            </div>
          </div>

          <div class="text-xs text-slate-500">
            {{ cursoAtivo()?.modulos?.length || 0 }} Módulos cadastrados
          </div>
        </div>

        <!-- Sub-navegação interna das 4 seções do curso ativo -->
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

        <!-- SEÇÃO 1: MÓDULOS DO CURSO ATIVO -->
        @if (secaoAtiva() === 'modulos') {
          <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  Grade de Módulos & Vídeos Vimeo
                </h3>
                <p class="text-xs sm:text-sm text-slate-500">
                  Estruture as aulas, links de streaming restrito e materiais de apoio deste curso.
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
              @for (modulo of cursoAtivo()?.modulos || []; track modulo.id; let i = $index) {
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  
                  <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                        {{ i + 1 }}
                      </span>
                      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Configuração de Aula
                      </span>
                    </div>

                    <button
                      type="button"
                      (click)="removerModulo(modulo.id)"
                      class="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remover</span>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1.5 sm:col-span-2">
                      <label class="block text-xs font-bold text-slate-700">Título do Módulo</label>
                      <input
                        type="text"
                        [value]="modulo.titulo"
                        (input)="atualizarTituloModulo(modulo.id, $event)"
                        placeholder="Ex: Módulo 1 — Fundamentos e Normas"
                        class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">Duração Estimada</label>
                      <input
                        type="text"
                        [value]="modulo.duracaoEstimada"
                        (input)="atualizarDuracaoModulo(modulo.id, $event)"
                        placeholder="Ex: 45 min"
                        class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5 sm:col-span-3">
                      <label class="block text-xs font-bold text-slate-700">Link do Vídeo Vimeo (Restrição de Domínio)</label>
                      <div class="relative">
                        <input
                          type="text"
                          [value]="modulo.linkVimeo"
                          (input)="atualizarLinkVimeoModulo(modulo.id, $event)"
                          placeholder="https://player.vimeo.com/video/..."
                          class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p class="text-[11px] text-slate-400">
                        Recomendado: Configure o vídeo no Vimeo com privacidade "Ocultar do Vimeo" e restrinja a incorporação ao seu domínio.
                      </p>
                    </div>
                  </div>

                  <!-- Materiais de Apoio (Download) -->
                  <div class="pt-3 border-t border-slate-100 space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold text-slate-700">Materiais Complementares (PDFs / Modelos)</label>
                      <span class="text-[11px] text-slate-400">{{ modulo.materiais.length }} arquivos anexados</span>
                    </div>

                    <!-- Lista de Materiais -->
                    <div class="flex flex-wrap gap-2">
                      @for (mat of modulo.materiais; track mat.id) {
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
                          <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span class="font-medium">{{ mat.nome }}</span>
                          <button
                            type="button"
                            (click)="removerMaterial(modulo.id, mat.id)"
                            class="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      }

                      @if (modulo.materiais.length === 0) {
                        <span class="text-xs text-slate-400 italic">Nenhum material de apoio anexado a este módulo.</span>
                      }
                    </div>

                    <!-- Input para adicionar novo material -->
                    <div class="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        #novoMaterialInput
                        placeholder="Nome do arquivo (ex: Modelo_Laudo_Tecnico.pdf)"
                        class="flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        (click)="adicionarMaterial(modulo.id, novoMaterialInput.value); novoMaterialInput.value = ''"
                        class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
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
                  Banco de Questões & Avaliação Final
                </h3>
                <p class="text-xs sm:text-sm text-slate-500">
                  Configure as perguntas que o aluno deverá responder para comprovar proficiência e emitir o certificado.
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
                <span>Adicionar Questão</span>
              </button>
            </div>

            <!-- Lista de Questões -->
            <div class="space-y-6">
              @for (perg of cursoAtivo()?.perguntas || []; track perg.id; let i = $index) {
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span class="font-bold text-sm text-slate-900">Questão {{ i + 1 }}</span>
                    <button
                      type="button"
                      (click)="removerPergunta(perg.id)"
                      class="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Remover Questão
                    </button>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">Enunciado da Questão</label>
                    <textarea
                      rows="2"
                      [value]="perg.enunciado"
                      (input)="atualizarEnunciado(perg.id, $event)"
                      placeholder="Ex: De acordo com a norma regulamentadora..."
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <!-- Alternativas -->
                  <div class="space-y-3 pt-2">
                    <label class="block text-xs font-bold text-slate-700">
                      Alternativas (Selecione a correta como Gabarito)
                    </label>

                    <div class="space-y-2">
                      @for (alt of perg.alternativas; track $index; let idxAlt = $index) {
                        <div class="flex items-center gap-3">
                          <input
                            type="radio"
                            [name]="'gabarito-' + perg.id"
                            [checked]="perg.respostaCorretaIndex === idxAlt"
                            (change)="definirGabarito(perg.id, idxAlt)"
                            class="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                            title="Marcar como gabarito correto"
                          />
                          <span class="text-xs font-bold text-slate-500 w-4">{{ getLetraAlternativa(idxAlt) }})</span>
                          <input
                            type="text"
                            [value]="alt"
                            (input)="atualizarAlternativa(perg.id, idxAlt, $event)"
                            placeholder="Texto da alternativa..."
                            class="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      }
                    </div>
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
                Modelo e Validade do Certificado
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Defina os termos legais, diretrizes normativas e carga horária que constarão no verso do certificado emitido.
              </p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700">
                  Texto de Validade Normativa e Carga Horária
                </label>
                <textarea
                  rows="4"
                  [value]="cursoAtivo()?.textoValidadeCertificado || ''"
                  (input)="atualizarTextoValidade($event)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <p class="text-[11px] text-slate-400">
                  Este texto será incorporado automaticamente no rodapé do PDF do certificado emitido ao aluno após aprovação.
                </p>
              </div>

              <!-- Prévia do Certificado -->
              <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Prévia Visual do Certificado</span>
                <div class="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-3 max-w-lg mx-auto shadow-xs">
                  <div class="text-indigo-600 font-bold text-sm tracking-widest uppercase">Certificado de Capacitação Técnica</div>
                  <div class="text-slate-800 font-extrabold text-lg">{{ cursoAtivo()?.titulo }}</div>
                  <div class="text-xs text-slate-500">Certificamos que [Nome do Aluno] concluiu com êxito todas as etapas avaliativas.</div>
                  <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-2 italic">
                    {{ cursoAtivo()?.textoValidadeCertificado }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- SEÇÃO 4: ALUNOS MATRICULADOS -->
        @if (secaoAtiva() === 'alunos') {
          <div class="space-y-6">
            <div class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mx-auto flex items-center justify-center shadow-inner">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div class="space-y-1">
                <h3 class="text-xl font-bold text-slate-900">
                  Alunos & Progresso — {{ cursoAtivo()?.titulo }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  A lista de alunos matriculados e status de aprovação neste curso aparecerá aqui quando a tabela de matrículas (<code class="font-mono text-indigo-600">course_enrollments</code>) for criada no Supabase.
                </p>
              </div>
            </div>
          </div>
        }

      }

      <!-- Aviso no Rodapé da Aba de Gestão de Curso -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>Todas as alterações desta seção estão em modo demonstração e serão persistidas no Supabase quando as tabelas de cursos forem criadas.</span>
      </div>

    </div>
  `
})
export class AdminCursoComponent {
  readonly cursoSelecionadoId = signal<string | null>(null);
  readonly criandoNovoCurso = signal<boolean>(false);
  readonly secaoAtiva = signal<'modulos' | 'avaliacao' | 'certificado' | 'alunos'>('modulos');

  readonly cursos = signal<Curso[]>([
    {
      id: 'curso-predial-40',
      titulo: 'Curso Predial 4.0 — Métodos de Inspeção e Laudos',
      descricao: 'Capacitação técnica completa em conformidade com as diretrizes da NBR 5674 e NBR 16747.',
      moduloPredialVinculado: 'Inspeção Predial',
      modulos: [
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
      ],
      perguntas: [
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
      ],
      textoValidadeCertificado: 'Certificado de capacitação técnica profissional em conformidade com as diretrizes da ABNT NBR 5674 e NBR 16747. Carga horária total estimada: 20 horas.'
    },
    {
      id: 'curso-bim-diagnostica',
      titulo: 'Fundamentos de BIM para Engenharia Diagnóstica',
      descricao: 'Integração de modelagem 3D paramétrica na detecção e mapeamento de anomalias construtivas.',
      moduloPredialVinculado: null,
      modulos: [
        {
          id: 'mod-bim-1',
          titulo: 'Módulo 1 — Introdução ao BIM Aplicado a Edificações Existentes',
          linkVimeo: 'https://player.vimeo.com/video/892019285',
          duracaoEstimada: '40 min',
          materiais: [
            { id: 'mat-bim-1', nome: 'Introducao_BIM_Diagnostica.pdf' }
          ]
        },
        {
          id: 'mod-bim-2',
          titulo: 'Módulo 2 — Integração de Laudos Técnicos em Modelos IFC',
          linkVimeo: 'https://player.vimeo.com/video/892019286',
          duracaoEstimada: '50 min',
          materiais: []
        }
      ],
      perguntas: [
        {
          id: 'perg-bim-1',
          enunciado: 'Qual padrão aberto é comumente utilizado para interoperabilidade de modelos BIM entre diferentes softwares?',
          alternativas: [
            'DWG 2D',
            'IFC (Industry Foundation Classes)',
            'PDF rasterizado',
            'XLSX'
          ],
          respostaCorretaIndex: 1
        }
      ],
      textoValidadeCertificado: 'Certificado de capacitação em modelagem BIM aplicada à engenharia diagnóstica. Carga horária total estimada: 15 horas.'
    }
  ]);

  readonly cursoAtivo = computed(() => {
    const id = this.cursoSelecionadoId();
    if (!id) return null;
    return this.cursos().find(c => c.id === id) || null;
  });

  abrirModalCriarCurso(): void {
    this.criandoNovoCurso.set(true);
  }

  cancelarCriacaoCurso(): void {
    this.criandoNovoCurso.set(false);
  }

  salvarNovoCurso(titulo: string, descricao: string, vinculo: string): void {
    if (!titulo.trim()) return;

    const vinculoVal = vinculo === 'nenhum' ? null : vinculo;
    const novoId = 'curso-' + Date.now();
    const novoCurso: Curso = {
      id: novoId,
      titulo: titulo.trim(),
      descricao: descricao.trim() || 'Curso de capacitação técnica profissional.',
      moduloPredialVinculado: vinculoVal,
      modulos: [
        {
          id: 'mod-' + Date.now(),
          titulo: 'Módulo 1 — Introdução e Objetivos',
          linkVimeo: '',
          duracaoEstimada: '30 min',
          materiais: []
        }
      ],
      perguntas: [],
      textoValidadeCertificado: `Certificado de capacitação técnica em ${titulo.trim()}. Carga horária total estimada: 10 horas.`
    };

    this.cursos.update(list => [...list, novoCurso]);
    this.criandoNovoCurso.set(false);
    this.cursoSelecionadoId.set(novoId);
    this.secaoAtiva.set('modulos');
  }

  removerCurso(id: string): void {
    this.cursos.update(list => list.filter(c => c.id !== id));
    if (this.cursoSelecionadoId() === id) {
      this.cursoSelecionadoId.set(null);
    }
  }

  selecionarCursoParaEdicao(id: string): void {
    this.cursoSelecionadoId.set(id);
    this.secaoAtiva.set('modulos');
  }

  voltarParaListaCursos(): void {
    this.cursoSelecionadoId.set(null);
  }

  setSecaoAtiva(secao: 'modulos' | 'avaliacao' | 'certificado' | 'alunos'): void {
    this.secaoAtiva.set(secao);
  }

  adicionarModulo(): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        const novoNum = c.modulos.length + 1;
        const novo: ModuloCurso = {
          id: 'mod-' + Date.now(),
          titulo: `Módulo ${novoNum} — Novo Tópico Técnico`,
          linkVimeo: '',
          duracaoEstimada: '30 min',
          materiais: []
        };
        return { ...c, modulos: [...c.modulos, novo] };
      }
      return c;
    }));
  }

  removerModulo(moduloId: string): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, modulos: c.modulos.filter(m => m.id !== moduloId) };
      }
      return c;
    }));
  }

  atualizarTituloModulo(moduloId: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, modulos: c.modulos.map(m => m.id === moduloId ? { ...m, titulo: val } : m) };
      }
      return c;
    }));
  }

  atualizarDuracaoModulo(moduloId: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, modulos: c.modulos.map(m => m.id === moduloId ? { ...m, duracaoEstimada: val } : m) };
      }
      return c;
    }));
  }

  atualizarLinkVimeoModulo(moduloId: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, modulos: c.modulos.map(m => m.id === moduloId ? { ...m, linkVimeo: val } : m) };
      }
      return c;
    }));
  }

  adicionarMaterial(moduloId: string, nomeArquivo: string): void {
    if (!nomeArquivo.trim()) return;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return {
          ...c,
          modulos: c.modulos.map(m => {
            if (m.id === moduloId) {
              return {
                ...m,
                materiais: [...m.materiais, { id: 'mat-' + Date.now(), nome: nomeArquivo.trim() }]
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  }

  removerMaterial(moduloId: string, materialId: string): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return {
          ...c,
          modulos: c.modulos.map(m => {
            if (m.id === moduloId) {
              return {
                ...m,
                materiais: m.materiais.filter(mat => mat.id !== materialId)
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  }

  adicionarPergunta(): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    const nova: PerguntaAvaliacao = {
      id: 'perg-' + Date.now(),
      enunciado: '',
      alternativas: ['', '', '', ''],
      respostaCorretaIndex: 0
    };

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, perguntas: [...c.perguntas, nova] };
      }
      return c;
    }));
  }

  removerPergunta(perguntaId: string): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, perguntas: c.perguntas.filter(p => p.id !== perguntaId) };
      }
      return c;
    }));
  }

  atualizarEnunciado(perguntaId: string, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return {
          ...c,
          perguntas: c.perguntas.map(p => p.id === perguntaId ? { ...p, enunciado: val } : p)
        };
      }
      return c;
    }));
  }

  atualizarAlternativa(perguntaId: string, indexAlt: number, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return {
          ...c,
          perguntas: c.perguntas.map(p => {
            if (p.id === perguntaId) {
              const novasAlts = [...p.alternativas];
              novasAlts[indexAlt] = val;
              return { ...p, alternativas: novasAlts };
            }
            return p;
          })
        };
      }
      return c;
    }));
  }

  definirGabarito(perguntaId: string, indexAlt: number): void {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return {
          ...c,
          perguntas: c.perguntas.map(p => p.id === perguntaId ? { ...p, respostaCorretaIndex: indexAlt } : p)
        };
      }
      return c;
    }));
  }

  getLetraAlternativa(idx: number): string {
    return ['A', 'B', 'C', 'D', 'E'][idx] || `${idx + 1}`;
  }

  atualizarTextoValidade(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.cursos.update(list => list.map(c => {
      if (c.id === cId) {
        return { ...c, textoValidadeCertificado: val };
      }
      return c;
    }));
  }
}
