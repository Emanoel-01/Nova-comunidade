import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { extrairVimeoId, montarUrlPlayerVimeo } from '../../utils/vimeo.util';

export interface ModuloCursoAdmin {
  id: string;
  curso_id: string;
  titulo: string;
  descricao?: string | null;
  duracao?: string | null;
  vimeo_id?: string | null;
  ordem: number;
}

export interface CursoAdmin {
  id: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  ativo: boolean;
  modulo_predial_vinculado?: string | null;
  texto_certificado?: string | null;
  criado_em?: string;
  modulos?: ModuloCursoAdmin[];
  totalMatriculados?: number;
  totalCertificados?: number;
}

@Component({
  selector: 'app-admin-curso',
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

      <!-- ============================================================= -->
      <!-- CASO 1: NENHUM CURSO SELECIONADO -> LISTA "MEUS CURSOS"       -->
      <!-- ============================================================= -->
      @if (cursoSelecionadoId() === null) {
        <div class="space-y-6">
          
          <!-- Cabeçalho da Lista de Cursos -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-slate-900">
                Gestão de Cursos & Capacitações
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                Gerencie os treinamentos técnicos, videoaulas integradas ao Vimeo, certificados e progresso dos membros.
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
            <div class="bg-indigo-50/60 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm animate-scaleUp">
              <div class="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    +
                  </div>
                  <h4 class="text-base font-bold text-slate-900">Novo Curso de Capacitação</h4>
                </div>
                <button
                  type="button"
                  (click)="cancelarCriacaoCurso()"
                  class="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
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
                    placeholder="Ex: Curso Predial 4.0 — Métodos de Inspeção e Laudos"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">Descrição Curta</label>
                  <textarea
                    #novaDescricaoInput
                    rows="2"
                    placeholder="Breve resumo sobre os objetivos técnicos e diretrizes do treinamento..."
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">Categoria</label>
                  <input
                    type="text"
                    #novaCategoriaInput
                    placeholder="Ex: Engenharia Diagnóstica, Patologias, Perícias"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Vínculo com Módulo do Predial 4.0 (Opcional)
                  </label>
                  <select
                    #novoVinculoSelect
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="nenhum">Nenhum (curso avulso / sem vínculo)</option>
                    <option value="Inspeção Predial">Inspeção Predial</option>
                    <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar de Vizinhança</option>
                    <option value="Perícia Judicial">Perícia Judicial</option>
                    <option value="Recebimento de Obras">Recebimento de Obras</option>
                  </select>
                </div>

                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">
                    Texto do Certificado (Opcional)
                  </label>
                  <input
                    type="text"
                    #novoTextoCertificadoInput
                    placeholder="Ex: Certificado de Capacitação Profissional conforme ABNT NBR 5674 e NBR 16747"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  [disabled]="salvando()"
                  (click)="cancelarCriacaoCurso()"
                  class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  [disabled]="salvando()"
                  (click)="salvarNovoCurso(novoTituloInput.value, novaDescricaoInput.value, novaCategoriaInput.value, novoVinculoSelect.value, novoTextoCertificadoInput.value)"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  @if (salvando()) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Criando...</span>
                  } @else {
                    <span>Criar e Configurar Módulos</span>
                  }
                </button>
              </div>
            </div>
          }

          <!-- Carregamento -->
          @if (carregando()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 animate-pulse">
                  <div class="h-4 bg-slate-200 rounded-md w-1/3"></div>
                  <div class="h-6 bg-slate-200 rounded-md w-3/4"></div>
                  <div class="h-16 bg-slate-100 rounded-xl w-full"></div>
                  <div class="h-8 bg-slate-200 rounded-xl w-full"></div>
                </div>
              }
            </div>
          } @else if (cursos().length === 0) {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div class="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="max-w-md mx-auto space-y-1">
                <h4 class="text-base font-black text-slate-900">Nenhum curso cadastrado no Supabase</h4>
                <p class="text-xs text-slate-500">Clique em "Criar Novo Curso" acima para começar a montar suas capacitações técnicas.</p>
              </div>
            </div>
          } @else {
            <!-- Grade de Cursos Cadastrados -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (curso of cursos(); track curso.id) {
                <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all space-y-5">
                  <div class="space-y-3.5">
                    
                    <!-- Badges Topo -->
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <div class="flex items-center gap-2">
                        @if (curso.modulo_predial_vinculado) {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            Vinculado: {{ curso.modulo_predial_vinculado }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                            {{ curso.categoria || 'Capacitação Técnica' }}
                          </span>
                        }

                        <span
                          [class]="curso.ativo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                          class="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                        >
                          {{ curso.ativo ? 'Ativo' : 'Inativo' }}
                        </span>
                      </div>

                      <span class="text-xs font-semibold text-slate-500">
                        {{ curso.modulos?.length || 0 }} {{ (curso.modulos?.length || 0) === 1 ? 'aula' : 'aulas' }}
                      </span>
                    </div>

                    <!-- Título & Descrição -->
                    <div class="space-y-1">
                      <h4 class="text-base font-black text-slate-900 leading-snug">
                        {{ curso.titulo }}
                      </h4>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {{ curso.descricao || 'Sem descrição informada.' }}
                      </p>
                    </div>

                    <!-- Estatísticas rápidas de matrículas -->
                    <div class="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span class="flex items-center gap-1 font-medium">
                        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{{ curso.totalMatriculados || 0 }} matriculados</span>
                      </span>
                      <span>•</span>
                      <span class="flex items-center gap-1 font-medium">
                        <span>🎓</span>
                        <span>{{ curso.totalCertificados || 0 }} certificados</span>
                      </span>
                    </div>
                  </div>

                  <!-- Ações no Rodapé do Card -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <!-- Botão de Excluir com 2 cliques -->
                    @if (cursoExcluirId() === curso.id) {
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="confirmarExclusaoCurso(curso.id)"
                          class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirmar?
                        </button>
                        <button
                          type="button"
                          (click)="cursoExcluirId.set(null)"
                          class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="cursoExcluirId.set(curso.id)"
                        class="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Excluir
                      </button>
                    }

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="toggleStatusCurso(curso)"
                        [class]="curso.ativo ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'"
                        class="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {{ curso.ativo ? 'Desativar' : 'Ativar' }}
                      </button>

                      <button
                        type="button"
                        (click)="selecionarCursoParaEdicao(curso.id)"
                        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Gerenciar</span>
                      </button>
                    </div>
                  </div>

                </div>
              }
            </div>
          }

        </div>
      } @else {
        <!-- ============================================================= -->
        <!-- CASO 2: UM CURSO SELECIONADO -> VISÃO DE EDIÇÃO DETALHADA     -->
        <!-- ============================================================= -->
        
        <div class="space-y-6">

          <!-- Barra de Navegação Superior / Voltar -->
          <div class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="voltarParaListaCursos()"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Voltar aos Cursos</span>
              </button>

              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-black text-slate-900 truncate">
                    {{ cursoAtivo()?.titulo }}
                  </h3>
                  @if (cursoAtivo()?.modulo_predial_vinculado) {
                    <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                      Vinculado: {{ cursoAtivo()?.modulo_predial_vinculado }}
                    </span>
                  }
                </div>
                <p class="text-xs text-slate-500">Editando estrutura técnica do curso</p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-500 font-medium">
                {{ cursoAtivo()?.modulos?.length || 0 }} aulas cadastradas
              </span>
            </div>
          </div>

          <!-- Sub-navegação interna das seções do curso ativo -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
            <button
              type="button"
              (click)="setSecaoAtiva('modulos')"
              [class]="secaoAtiva() === 'modulos'
                ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer'
                : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer'"
            >
              1. Aulas & Vídeos Vimeo ({{ cursoAtivo()?.modulos?.length || 0 }})
            </button>

            <button
              type="button"
              (click)="setSecaoAtiva('certificado')"
              [class]="secaoAtiva() === 'certificado'
                ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer'
                : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer'"
            >
              2. Certificado & Validade
            </button>

            <button
              type="button"
              (click)="setSecaoAtiva('alunos')"
              [class]="secaoAtiva() === 'alunos'
                ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer'
                : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer'"
            >
              3. Alunos & Acessos ({{ totalAcessosLiberados() }})
            </button>

            <button
              type="button"
              (click)="setSecaoAtiva('dados')"
              [class]="secaoAtiva() === 'dados'
                ? 'px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer'
                : 'px-4 py-2 rounded-xl bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer'"
            >
              4. Dados Gerais do Curso
            </button>
          </div>

          <!-- ========================================================= -->
          <!-- SEÇÃO 1: MÓDULOS & VÍDEOS VIMEO                           -->
          <!-- ========================================================= -->
          @if (secaoAtiva() === 'modulos') {
            <div class="space-y-6">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 class="text-lg font-bold text-slate-900">
                    Grade de Aulas & Vídeos Vimeo
                  </h4>
                  <p class="text-xs sm:text-sm text-slate-500">
                    Estruture a sequência pedagógica e vincule os IDs numéricos dos vídeos hospedados no Vimeo.
                  </p>
                </div>

                <button
                  type="button"
                  (click)="abrirModalCriarModulo()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Adicionar Aula / Módulo</span>
                </button>
              </div>

              <!-- Formulário / Modal de Criação ou Edição de Módulo -->
              @if (criandoModulo() || editandoModuloId()) {
                <div class="bg-indigo-50/50 border border-indigo-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm animate-scaleUp">
                  <div class="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <h5 class="text-sm font-bold text-slate-900">
                      {{ editandoModuloId() ? 'Editar Aula / Módulo' : 'Nova Aula / Módulo' }}
                    </h5>
                    <button
                      type="button"
                      (click)="cancelarFormularioModulo()"
                      class="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="space-y-1.5 sm:col-span-2">
                      <label class="block text-xs font-bold text-slate-700">Título da Aula / Módulo *</label>
                      <input
                        type="text"
                        #formModTituloInput
                        [value]="moduloFormDados.titulo"
                        (input)="moduloFormDados.titulo = formModTituloInput.value"
                        placeholder="Ex: Aula 1 — Introdução aos Métodos de Diagnóstico"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">Duração</label>
                      <input
                        type="text"
                        #formModDuracaoInput
                        [value]="moduloFormDados.duracao"
                        (input)="moduloFormDados.duracao = formModDuracaoInput.value"
                        placeholder="Ex: 45 min"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5 sm:col-span-2">
                      <label class="block text-xs font-bold text-slate-700">ID ou Link do Vídeo no Vimeo *</label>
                      <input
                        type="text"
                        #formModVimeoInput
                        [value]="moduloFormDados.vimeo_id"
                        (input)="moduloFormDados.vimeo_id = formModVimeoInput.value"
                        placeholder="Ex: 892019283 ou https://vimeo.com/892019283"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                      <p class="text-[11px] text-slate-500">
                        Cole o <strong>ID numérico</strong> (ex: <code class="bg-slate-100 px-1 py-0.5 rounded">892019283</code>) ou o <strong>link completo</strong> do Vimeo (ex: <code class="bg-slate-100 px-1 py-0.5 rounded">https://vimeo.com/892019283</code>). O sistema identifica e normaliza o ID automaticamente.
                      </p>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">Ordem de Exibição</label>
                      <input
                        type="number"
                        #formModOrdemInput
                        [value]="moduloFormDados.ordem"
                        (input)="moduloFormDados.ordem = +formModOrdemInput.value"
                        min="1"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5 sm:col-span-3">
                      <label class="block text-xs font-bold text-slate-700">Descrição dos Conteúdos Abordados</label>
                      <textarea
                        #formModDescricaoInput
                        [value]="moduloFormDados.descricao"
                        (input)="moduloFormDados.descricao = formModDescricaoInput.value"
                        rows="2"
                        placeholder="Resumo das normas, procedimentos práticos ou temas abordados nesta aula..."
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>

                    <!-- Prévia do Player do Vimeo em Tempo Real -->
                    @if (moduloFormDados.vimeo_id?.trim()) {
                      @let vimeoPreviewUrl = getVimeoUrl(moduloFormDados.vimeo_id);
                      <div class="space-y-1.5 sm:col-span-3 pt-1">
                        <label class="block text-xs font-bold text-slate-700">Prévia do Player do Vimeo</label>
                        @if (vimeoPreviewUrl) {
                          <div class="aspect-video max-w-md w-full bg-black rounded-2xl overflow-hidden shadow-xs border border-slate-300">
                            <iframe
                              [src]="vimeoPreviewUrl"
                              class="w-full h-full"
                              frameborder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowfullscreen
                              title="Prévia do vídeo"
                            ></iframe>
                          </div>
                        } @else {
                          <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                            <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Formato de link ou ID do Vimeo não reconhecido. Cole apenas o número ou o link <code>vimeo.com/ID</code>.</span>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <div class="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      [disabled]="salvando()"
                      (click)="cancelarFormularioModulo()"
                      class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      [disabled]="salvando()"
                      (click)="salvarModulo()"
                      class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
                    >
                      @if (salvando()) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Salvando...</span>
                      } @else {
                        <span>{{ editandoModuloId() ? 'Salvar Alterações' : 'Adicionar Aula' }}</span>
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- Lista de Aulas / Módulos -->
              @if ((cursoAtivo()?.modulos?.length || 0) === 0) {
                <div class="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h5 class="text-sm font-bold text-slate-900">Nenhuma aula cadastrada</h5>
                  <p class="text-xs text-slate-500">Clique em "Adicionar Aula / Módulo" acima para cadastrar a primeira videoaula.</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (mod of cursoAtivo()?.modulos || []; track mod.id; let i = $index) {
                    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 transition-all">
                      
                      <div class="flex items-start gap-3.5 min-w-0">
                        <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                          {{ mod.ordem || (i + 1) }}
                        </div>

                        <div class="space-y-1 min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <h5 class="text-sm font-bold text-slate-900">
                              {{ mod.titulo }}
                            </h5>
                            @if (mod.duracao) {
                              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                ⏱ {{ mod.duracao }}
                              </span>
                            }
                            @if (mod.vimeo_id) {
                              <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold border border-indigo-100 flex items-center gap-1">
                                <svg class="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                                </svg>
                                Vimeo: {{ mod.vimeo_id }}
                              </span>
                            }
                          </div>

                          @if (mod.descricao) {
                            <p class="text-xs text-slate-500 line-clamp-1">
                              {{ mod.descricao }}
                            </p>
                          }
                        </div>
                      </div>

                      <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          (click)="iniciarEdicaoModulo(mod)"
                          class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Editar
                        </button>

                        @if (moduloExcluirId() === mod.id) {
                          <div class="flex items-center gap-1">
                            <button
                              type="button"
                              (click)="confirmarExclusaoModulo(mod.id)"
                              class="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Excluir?
                            </button>
                            <button
                              type="button"
                              (click)="moduloExcluirId.set(null)"
                              class="px-2 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        } @else {
                          <button
                            type="button"
                            (click)="moduloExcluirId.set(mod.id)"
                            class="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                          >
                            Excluir
                          </button>
                        }
                      </div>

                    </div>
                  }
                </div>
              }

            </div>
          }

          <!-- ========================================================= -->
          <!-- SEÇÃO 2: CERTIFICADO & VALIDADE                           -->
          <!-- ========================================================= -->
          @if (secaoAtiva() === 'certificado') {
            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-bold text-slate-900">
                  Modelo & Validade do Certificado
                </h4>
                <p class="text-xs sm:text-sm text-slate-500">
                  Configure os termos legais, diretrizes normativas e carga horária que constarão no certificado emitido automaticamente aos alunos ao concluírem todas as aulas.
                </p>
              </div>

              <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700">
                    Texto de Validade Normativa e Carga Horária do Certificado
                  </label>
                  <textarea
                    #textoCertificadoInput
                    rows="4"
                    [value]="cursoAtivo()?.texto_certificado || ''"
                    placeholder="Ex: Certificado de capacitação técnica profissional em conformidade com as diretrizes da ABNT NBR 5674 e NBR 16747. Carga horária estimada: 20 horas."
                    class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                  <p class="text-[11px] text-slate-400">
                    Este texto será exibido na área do aluno e no selo oficial de conclusão técnica.
                  </p>
                </div>

                <div class="flex items-center justify-end">
                  <button
                    type="button"
                    [disabled]="salvando()"
                    (click)="salvarTextoCertificado(textoCertificadoInput.value)"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    @if (salvando()) {
                      <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    } @else {
                      <span>Salvar Configuração do Certificado</span>
                    }
                  </button>
                </div>

                <!-- Prévia Visual do Certificado -->
                <div class="p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-amber-50/30 border border-amber-200/80 space-y-4">
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-800">Prévia Visual do Certificado</span>
                  <div class="p-6 rounded-2xl bg-white border border-amber-200 text-center space-y-3 max-w-lg mx-auto shadow-xs">
                    <div class="w-12 h-12 rounded-2xl bg-amber-400 text-white mx-auto flex items-center justify-center text-xl shadow-md">🎓</div>
                    <div class="text-indigo-600 font-black text-xs tracking-widest uppercase">Certificado de Capacitação Técnica</div>
                    <div class="text-slate-900 font-extrabold text-base sm:text-lg">{{ cursoAtivo()?.titulo }}</div>
                    <div class="text-xs text-slate-500">Certificamos que o membro concluiu com êxito todas as etapas de capacitação técnica.</div>
                    <div class="text-[11px] text-slate-600 border-t border-slate-100 pt-2 italic">
                      {{ textoCertificadoInput.value || cursoAtivo()?.texto_certificado || 'Texto de validade normativa padrão...' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ========================================================= -->
          <!-- SEÇÃO 3: LIBERAR ACESSO & ALUNOS MATRICULADOS            -->
          <!-- ========================================================= -->
          @if (secaoAtiva() === 'alunos') {
            <div class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 class="text-lg font-bold text-slate-900">
                    Acessos & Alunos Matriculados
                  </h4>
                  <p class="text-xs sm:text-sm text-slate-500">
                    Libere o acesso individual para membros da comunidade e acompanhe o progresso e certificados emitidos.
                  </p>
                </div>

                <button
                  type="button"
                  (click)="carregarAlunosMatriculados()"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Recarregar</span>
                </button>
              </div>

              <!-- Sub-abas dentro de Alunos/Acessos -->
              <div class="flex items-center gap-4 border-b border-slate-200">
                <button
                  type="button"
                  (click)="subAbaAlunos.set('acessos')"
                  [class]="subAbaAlunos() === 'acessos'
                    ? 'pb-3 font-bold text-xs sm:text-sm text-indigo-600 border-b-2 border-indigo-600 cursor-pointer flex items-center gap-1.5'
                    : 'pb-3 font-medium text-xs sm:text-sm text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1.5'"
                >
                  <span>Liberar Acesso aos Membros</span>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold" [class]="subAbaAlunos() === 'acessos' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'">
                    {{ totalAcessosLiberados() }}/{{ acessosMembros().length }}
                  </span>
                </button>

                <button
                  type="button"
                  (click)="subAbaAlunos.set('progresso')"
                  [class]="subAbaAlunos() === 'progresso'
                    ? 'pb-3 font-bold text-xs sm:text-sm text-indigo-600 border-b-2 border-indigo-600 cursor-pointer flex items-center gap-1.5'
                    : 'pb-3 font-medium text-xs sm:text-sm text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1.5'"
                >
                  <span>Matrículas & Progresso</span>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold" [class]="subAbaAlunos() === 'progresso' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'">
                    {{ alunosMatriculados().length }}
                  </span>
                </button>
              </div>

              <!-- Sub-aba 1: Liberar Acesso -->
              @if (subAbaAlunos() === 'acessos') {
                <div class="space-y-4">
                  <!-- Barra de busca e ações em massa -->
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="relative flex-1 max-w-md">
                      <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        [value]="termoBuscaMembro()"
                        (input)="termoBuscaMembro.set($any($event.target).value)"
                        placeholder="Buscar membro por nome ou e-mail..."
                        class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="liberarAcessoParaTodos(true)"
                        class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        Liberar Todos
                      </button>
                      <button
                        type="button"
                        (click)="liberarAcessoParaTodos(false)"
                        class="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        Bloquear Todos
                      </button>
                    </div>
                  </div>

                  @if (carregandoAlunos()) {
                    <div class="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                      <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p class="text-xs text-slate-500 font-medium">Carregando permissões dos membros...</p>
                    </div>
                  } @else if (membrosFiltrados().length === 0) {
                    <div class="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2 shadow-xs">
                      <p class="text-sm font-bold text-slate-800">Nenhum membro encontrado</p>
                      <p class="text-xs text-slate-500">Tente ajustar o termo de busca ou aprove novos cadastros.</p>
                    </div>
                  } @else {
                    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                            <tr>
                              <th class="py-3.5 px-4 sm:px-6">Membro</th>
                              <th class="py-3.5 px-4">Status de Acesso</th>
                              <th class="py-3.5 px-4">Validade do Acesso</th>
                              <th class="py-3.5 px-4 text-right">Matrícula</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (item of membrosFiltrados(); track item.profissional.id) {
                              <tr class="hover:bg-slate-50/60 transition-colors">
                                <td class="py-3.5 px-4 sm:px-6">
                                  <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                      {{ getIniciais(item.profissional.full_name) }}
                                    </div>
                                    <div class="min-w-0">
                                      <div class="font-bold text-slate-900 truncate">{{ item.profissional.full_name || 'Profissional' }}</div>
                                      <div class="text-[11px] text-slate-500 truncate">{{ item.profissional.email || item.profissional.professional_title || 'Sem e-mail' }}</div>
                                    </div>
                                  </div>
                                </td>

                                <td class="py-3.5 px-4">
                                  <label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      [checked]="item.liberado"
                                      [disabled]="salvandoAcessoId() === item.profissional.id"
                                      (change)="toggleAcessoMembro(item)"
                                      class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                    />
                                    @if (item.liberado) {
                                      <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Liberado
                                      </span>
                                    } @else {
                                      <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500">
                                        Bloqueado
                                      </span>
                                    }
                                  </label>
                                </td>

                                <td class="py-3.5 px-4">
                                  <div class="flex items-center gap-1.5">
                                    <input
                                      type="date"
                                      [value]="item.validade ? item.validade.split('T')[0] : ''"
                                      (input)="alterarValidadeAcesso(item, $event)"
                                      placeholder="Sem vencimento"
                                      class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                </td>

                                <td class="py-3.5 px-4 text-right">
                                  @if (item.matriculado) {
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                                      <span>✓ Matriculado</span>
                                    </span>
                                  } @else {
                                    <span class="text-[11px] text-slate-400">
                                      Ainda não iniciou
                                    </span>
                                  }
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Sub-aba 2: Matrículas & Progresso -->
              @if (subAbaAlunos() === 'progresso') {
                <div class="space-y-4">
                  @if (carregandoAlunos()) {
                    <div class="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                      <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p class="text-xs text-slate-500 font-medium">Carregando matrículas dos membros...</p>
                    </div>
                  } @else if (alunosMatriculados().length === 0) {
                    <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                      <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div class="space-y-1 max-w-md mx-auto">
                        <h5 class="text-base font-bold text-slate-900">Nenhum aluno matriculado ainda</h5>
                        <p class="text-xs text-slate-500">Assim que os membros com acesso liberado assistirem à primeira aula, o registro de matrícula e o progresso aparecerão aqui automaticamente.</p>
                      </div>
                    </div>
                  } @else {
                    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                            <tr>
                              <th class="py-3.5 px-4 sm:px-6">Aluno</th>
                              <th class="py-3.5 px-4">Progresso nas Aulas</th>
                              <th class="py-3.5 px-4">Status Certificado</th>
                              <th class="py-3.5 px-4 text-right">Última Atividade</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (mat of alunosMatriculados(); track mat.id || mat.profissional_id) {
                              <tr class="hover:bg-slate-50/60 transition-colors">
                                <td class="py-4 px-4 sm:px-6">
                                  <div class="font-bold text-slate-900">{{ mat.aluno?.full_name || 'Membro da Comunidade' }}</div>
                                  <div class="text-[11px] text-slate-500">{{ mat.aluno?.email || mat.aluno?.professional_title || 'Sem email cadastrado' }}</div>
                                </td>
                                <td class="py-4 px-4 min-w-[180px]">
                                  @let totalAulas = cursoAtivo()?.modulos?.length || 0;
                                  @let aulasConcluidas = mat.modulos_concluidos?.length || 0;
                                  @let pct = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;
                                  <div class="space-y-1">
                                    <div class="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                                      <span>{{ aulasConcluidas }} de {{ totalAulas }} aulas</span>
                                      <span class="text-indigo-600 font-bold">{{ pct }}%</span>
                                    </div>
                                    <div class="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                      <div class="h-full rounded-full bg-indigo-600" [style.width.%]="pct"></div>
                                    </div>
                                  </div>
                                </td>
                                <td class="py-4 px-4">
                                  @if (mat.certificado_emitido_em) {
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                                      <span>🎓</span>
                                      <span>Emitido ({{ formatarData(mat.certificado_emitido_em) }})</span>
                                    </span>
                                  } @else {
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                                      <span>Em andamento</span>
                                    </span>
                                  }
                                </td>
                                <td class="py-4 px-4 text-right text-[11px] text-slate-500">
                                  {{ formatarData(mat.atualizado_em || mat.criado_em) }}
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- ========================================================= -->
          <!-- SEÇÃO 4: DADOS GERAIS DO CURSO                            -->
          <!-- ========================================================= -->
          @if (secaoAtiva() === 'dados') {
            <div class="space-y-6">
              <div>
                <h4 class="text-lg font-bold text-slate-900">
                  Dados Gerais & Vínculo com o App
                </h4>
                <p class="text-xs sm:text-sm text-slate-500">
                  Atualize título, categoria, descrição e vinculação com os módulos operacionais do Predial 4.0.
                </p>
              </div>

              <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700">Título do Curso *</label>
                    <input
                      type="text"
                      #editTituloInput
                      [value]="cursoAtivo()?.titulo"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700">Descrição</label>
                    <textarea
                      #editDescricaoInput
                      rows="3"
                      [value]="cursoAtivo()?.descricao || ''"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">Categoria</label>
                    <input
                      type="text"
                      #editCategoriaInput
                      [value]="cursoAtivo()?.categoria || ''"
                      placeholder="Ex: Engenharia Diagnóstica"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">Vínculo com Módulo Predial 4.0</label>
                    <select
                      #editVinculoSelect
                      [value]="cursoAtivo()?.modulo_predial_vinculado || 'nenhum'"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="nenhum">Nenhum (curso avulso)</option>
                      <option value="Inspeção Predial">Inspeção Predial</option>
                      <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar de Vizinhança</option>
                      <option value="Perícia Judicial">Perícia Judicial</option>
                      <option value="Recebimento de Obras">Recebimento de Obras</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    [disabled]="salvando()"
                    (click)="salvarDadosGeraisCurso(editTituloInput.value, editDescricaoInput.value, editCategoriaInput.value, editVinculoSelect.value)"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    @if (salvando()) {
                      <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    } @else {
                      <span>Salvar Dados Gerais</span>
                    }
                  </button>
                </div>
              </div>
            </div>
          }

        </div>

      }

    </div>
  `
})
export class AdminCursoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly Math = Math;

  readonly cursos = signal<CursoAdmin[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly cursoSelecionadoId = signal<string | null>(null);
  readonly secaoAtiva = signal<'modulos' | 'certificado' | 'alunos' | 'dados'>('modulos');
  readonly criandoNovoCurso = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);

  readonly cursoExcluirId = signal<string | null>(null);
  readonly moduloExcluirId = signal<string | null>(null);

  // Módulo form state
  readonly criandoModulo = signal<boolean>(false);
  readonly editandoModuloId = signal<string | null>(null);
  moduloFormDados = {
    titulo: '',
    descricao: '',
    duracao: '',
    vimeo_id: '',
    ordem: 1,
  };

  // Alunos matriculados e liberação de acessos
  readonly subAbaAlunos = signal<'acessos' | 'progresso'>('acessos');
  readonly acessosMembros = signal<any[]>([]);
  readonly termoBuscaMembro = signal<string>('');
  readonly salvandoAcessoId = signal<string | null>(null);
  readonly alunosMatriculados = signal<any[]>([]);
  readonly carregandoAlunos = signal<boolean>(false);

  readonly membrosFiltrados = computed(() => {
    const termo = this.termoBuscaMembro().toLowerCase().trim();
    if (!termo) return this.acessosMembros();
    return this.acessosMembros().filter(m => {
      const nome = (m.profissional?.full_name || '').toLowerCase();
      const email = (m.profissional?.email || '').toLowerCase();
      return nome.includes(termo) || email.includes(termo);
    });
  });

  readonly totalAcessosLiberados = computed(() =>
    this.acessosMembros().filter(m => m.liberado).length
  );

  // Feedbacks
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly cursoAtivo = computed<CursoAdmin | null>(() => {
    const id = this.cursoSelecionadoId();
    if (!id) return null;
    return this.cursos().find(c => c.id === id) || null;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarCursos();
  }

  async carregarCursos(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarTodosCursosAdmin();
      this.cursos.set(data);
    } catch (e: any) {
      this.exibirErro('Erro ao carregar cursos do Supabase.');
    } finally {
      this.carregando.set(false);
    }
  }

  abrirModalCriarCurso(): void {
    this.criandoNovoCurso.set(true);
  }

  cancelarCriacaoCurso(): void {
    this.criandoNovoCurso.set(false);
  }

  async salvarNovoCurso(
    titulo: string,
    descricao: string,
    categoria: string,
    vinculo: string,
    textoCertificado: string
  ): Promise<void> {
    if (!titulo.trim()) {
      this.exibirErro('Por favor, informe o título do curso.');
      return;
    }

    this.salvando.set(true);
    try {
      const vinculoVal = vinculo === 'nenhum' ? null : vinculo.trim();
      const res = await this.supabaseService.criarCurso({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        categoria: categoria.trim() || undefined,
        modulo_predial_vinculado: vinculoVal,
        texto_certificado: textoCertificado.trim() || undefined,
      });

      if (res.error) {
        this.exibirErro('Erro ao criar curso: ' + res.error.message);
        return;
      }

      this.exibirSucesso('Curso criado com sucesso!');
      this.criandoNovoCurso.set(false);
      await this.carregarCursos();

      if (res.data?.id) {
        this.cursoSelecionadoId.set(res.data.id);
        this.secaoAtiva.set('modulos');
      }
    } catch (e: any) {
      this.exibirErro('Erro inesperado ao criar curso: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async confirmarExclusaoCurso(id: string): Promise<void> {
    try {
      const res = await this.supabaseService.excluirCurso(id);
      if (res.error) {
        this.exibirErro('Erro ao excluir curso: ' + res.error.message);
        return;
      }

      this.exibirSucesso('Curso e seus módulos excluídos com sucesso.');
      this.cursoExcluirId.set(null);
      if (this.cursoSelecionadoId() === id) {
        this.cursoSelecionadoId.set(null);
      }
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao excluir curso: ' + (e?.message || e));
    }
  }

  async toggleStatusCurso(curso: CursoAdmin): Promise<void> {
    try {
      const novoStatus = !curso.ativo;
      const res = await this.supabaseService.atualizarCurso(curso.id, { ativo: novoStatus });
      if (res.error) {
        this.exibirErro('Erro ao alterar status: ' + res.error.message);
        return;
      }
      this.exibirSucesso(`Curso ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao alterar status do curso.');
    }
  }

  selecionarCursoParaEdicao(id: string): void {
    this.cursoSelecionadoId.set(id);
    this.secaoAtiva.set('modulos');
    this.cancelarFormularioModulo();
  }

  voltarParaListaCursos(): void {
    this.cursoSelecionadoId.set(null);
    this.cancelarFormularioModulo();
  }

  setSecaoAtiva(secao: 'modulos' | 'certificado' | 'alunos' | 'dados'): void {
    this.secaoAtiva.set(secao);
    if (secao === 'alunos') {
      this.carregarAlunosMatriculados();
    }
  }

  // ==========================================
  // GESTÃO DE MÓDULOS / AULAS
  // ==========================================

  abrirModalCriarModulo(): void {
    const totalExistentes = this.cursoAtivo()?.modulos?.length || 0;
    this.moduloFormDados = {
      titulo: '',
      descricao: '',
      duracao: '',
      vimeo_id: '',
      ordem: totalExistentes + 1,
    };
    this.editandoModuloId.set(null);
    this.criandoModulo.set(true);
  }

  iniciarEdicaoModulo(modulo: ModuloCursoAdmin): void {
    this.moduloFormDados = {
      titulo: modulo.titulo,
      descricao: modulo.descricao || '',
      duracao: modulo.duracao || '',
      vimeo_id: modulo.vimeo_id || '',
      ordem: modulo.ordem,
    };
    this.criandoModulo.set(false);
    this.editandoModuloId.set(modulo.id);
  }

  cancelarFormularioModulo(): void {
    this.criandoModulo.set(false);
    this.editandoModuloId.set(null);
    this.moduloExcluirId.set(null);
  }

  getVimeoUrl(vimeoId?: string | null): SafeResourceUrl | null {
    const url = montarUrlPlayerVimeo(vimeoId);
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async salvarModulo(): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    if (!this.moduloFormDados.titulo.trim()) {
      this.exibirErro('Por favor, informe o título da aula.');
      return;
    }

    let vimeoIdFinal: string | null = null;
    if (this.moduloFormDados.vimeo_id && this.moduloFormDados.vimeo_id.trim()) {
      vimeoIdFinal = extrairVimeoId(this.moduloFormDados.vimeo_id);
      if (!vimeoIdFinal) {
        this.exibirErro('Não foi possível identificar o ID do vídeo. Cole apenas o número (ex: 892019283) ou o link completo do Vimeo.');
        return;
      }
    }

    this.salvando.set(true);
    try {
      const editId = this.editandoModuloId();
      if (editId) {
        // Atualizar módulo existente
        const res = await this.supabaseService.atualizarModuloCurso(editId, {
          titulo: this.moduloFormDados.titulo.trim(),
          descricao: this.moduloFormDados.descricao.trim() || '',
          duracao: this.moduloFormDados.duracao.trim() || '',
          vimeo_id: vimeoIdFinal || '',
          ordem: this.moduloFormDados.ordem || 1,
        });

        if (res.error) {
          this.exibirErro('Erro ao atualizar aula: ' + res.error.message);
          return;
        }

        this.exibirSucesso('Aula atualizada com sucesso!');
      } else {
        // Criar novo módulo
        const res = await this.supabaseService.criarModuloCurso({
          curso_id: cId,
          titulo: this.moduloFormDados.titulo.trim(),
          descricao: this.moduloFormDados.descricao.trim() || undefined,
          duracao: this.moduloFormDados.duracao.trim() || undefined,
          vimeo_id: vimeoIdFinal || undefined,
          ordem: this.moduloFormDados.ordem || 1,
        });

        if (res.error) {
          this.exibirErro('Erro ao criar aula: ' + res.error.message);
          return;
        }

        this.exibirSucesso('Aula cadastrada com sucesso!');
      }

      this.cancelarFormularioModulo();
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao salvar aula: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async confirmarExclusaoModulo(moduloId: string): Promise<void> {
    try {
      const res = await this.supabaseService.excluirModuloCurso(moduloId);
      if (res.error) {
        this.exibirErro('Erro ao excluir aula: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Aula excluída com sucesso!');
      this.moduloExcluirId.set(null);
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao excluir aula: ' + (e?.message || e));
    }
  }

  // ==========================================
  // CONFIGURAÇÃO DO CERTIFICADO & DADOS GERAIS
  // ==========================================

  async salvarTextoCertificado(texto: string): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.salvando.set(true);
    try {
      const res = await this.supabaseService.atualizarCurso(cId, {
        texto_certificado: texto.trim() || null,
      });

      if (res.error) {
        this.exibirErro('Erro ao salvar configuração do certificado: ' + res.error.message);
        return;
      }

      this.exibirSucesso('Configurações do certificado salvas com sucesso!');
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao salvar certificado: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async salvarDadosGeraisCurso(
    titulo: string,
    descricao: string,
    categoria: string,
    vinculo: string
  ): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    if (!titulo.trim()) {
      this.exibirErro('Por favor, informe o título do curso.');
      return;
    }

    this.salvando.set(true);
    try {
      const vinculoVal = vinculo === 'nenhum' ? null : vinculo.trim();
      const res = await this.supabaseService.atualizarCurso(cId, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria: categoria.trim() || null,
        modulo_predial_vinculado: vinculoVal,
      });

      if (res.error) {
        this.exibirErro('Erro ao atualizar dados do curso: ' + res.error.message);
        return;
      }

      this.exibirSucesso('Dados gerais do curso atualizados com sucesso!');
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao atualizar dados: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  // ==========================================
  // ALUNOS & ACESSOS AO CURSO
  // ==========================================

  async carregarAlunosMatriculados(): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.carregandoAlunos.set(true);
    try {
      const [matriculados, acessos] = await Promise.all([
        this.supabaseService.listarMatriculadosDoCurso(cId),
        this.supabaseService.listarAcessosEMatriculasDoCurso(cId),
      ]);
      this.alunosMatriculados.set(matriculados);
      this.acessosMembros.set(acessos);
    } catch (e: any) {
      console.warn('Erro ao carregar dados de alunos e acessos:', e);
      this.alunosMatriculados.set([]);
      this.acessosMembros.set([]);
    } finally {
      this.carregandoAlunos.set(false);
    }
  }

  async toggleAcessoMembro(membro: any): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    const novoStatus = !membro.liberado;
    this.salvandoAcessoId.set(membro.profissional.id);

    // Optimistic update
    this.acessosMembros.update(list =>
      list.map(item =>
        item.profissional.id === membro.profissional.id
          ? { ...item, liberado: novoStatus }
          : item
      )
    );

    try {
      const res = await this.supabaseService.liberarAcessoCurso(
        membro.profissional.id,
        cId,
        novoStatus,
        membro.validade
      );

      if (res.error) {
        // Revert on error
        this.acessosMembros.update(list =>
          list.map(item =>
            item.profissional.id === membro.profissional.id
              ? { ...item, liberado: !novoStatus }
              : item
          )
        );
        this.exibirErro('Erro ao atualizar permissão: ' + res.error.message);
      } else {
        this.exibirSucesso(
          `Acesso ao curso ${novoStatus ? 'liberado' : 'bloqueado'} para ${membro.profissional.full_name || 'o membro'}.`
        );
      }
    } catch (e: any) {
      this.exibirErro('Erro ao salvar permissão de acesso.');
    } finally {
      this.salvandoAcessoId.set(null);
    }
  }

  async alterarValidadeAcesso(membro: any, event: Event): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    const novaValidade = (event.target as HTMLInputElement).value || null;
    this.acessosMembros.update(list =>
      list.map(item =>
        item.profissional.id === membro.profissional.id
          ? { ...item, validade: novaValidade }
          : item
      )
    );

    try {
      await this.supabaseService.liberarAcessoCurso(
        membro.profissional.id,
        cId,
        membro.liberado,
        novaValidade
      );
    } catch (e) {
      console.warn('Erro ao atualizar validade:', e);
    }
  }

  async liberarAcessoParaTodos(liberar: boolean): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.carregandoAlunos.set(true);
    try {
      const membros = this.acessosMembros();
      await Promise.all(
        membros.map(m =>
          this.supabaseService.liberarAcessoCurso(
            m.profissional.id,
            cId,
            liberar,
            m.validade
          )
        )
      );
      this.acessosMembros.update(list =>
        list.map(item => ({ ...item, liberado: liberar }))
      );
      this.exibirSucesso(
        `Acesso ao curso ${liberar ? 'liberado para todos' : 'bloqueado para todos'} os membros com sucesso!`
      );
    } catch (e: any) {
      this.exibirErro('Erro ao atualizar acessos em massa.');
    } finally {
      this.carregandoAlunos.set(false);
    }
  }

  getIniciais(nome?: string): string {
    if (!nome) return 'MB';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarData(dataStr?: string | null): string {
    if (!dataStr) return '—';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dataStr;
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
