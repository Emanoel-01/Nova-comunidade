import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { montarUrlPlayerVimeo } from '../../utils/vimeo.util';
import { CertificadoPdfService } from '../../services/certificado-pdf.service';

export interface CursoModuloAluno {
  id: string;
  curso_id: string;
  ordem: number;
  titulo: string;
  duracao: string;
  descricao: string;
  vimeo_id?: string | null;
  status?: 'concluido' | 'em_andamento' | 'bloqueado';
}

export interface CursoAluno {
  id: string;
  titulo: string;
  descricao: string;
  categoria?: string;
  modulo_predial_vinculado?: string | null;
  moduloPredialVinculado?: string | null;
  texto_certificado?: string | null;
  textoCertificado?: string | null;
  carga_horaria_certificado?: string | null;
  cargaHorariaCertificado?: string | null;
  codigo_verificacao?: string | null;
  codigoVerificacao?: string | null;
  modulos: CursoModuloAluno[];
  temAcesso: boolean;
  matriculado: boolean;
  matriculaId?: string | null;
  modulosConcluidos: string[];
  progresso: number;
  avaliacaoAprovado: boolean;
  certificadoEmitidoEm: string | null;
  criado_em?: string;
}

@Component({
  selector: 'app-comunidade-curso',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- Feedback Inline (Sucesso / Erro / Aviso) -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : tipoFeedback() === 'alerta'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <div class="flex items-center gap-2">
            @if (tipoFeedback() === 'sucesso') {
              <span>✓</span>
            } @else if (tipoFeedback() === 'alerta') {
              <span>🔒</span>
            } @else {
              <span>⚠</span>
            }
            <span>{{ mensagemFeedback() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemFeedback.set(null)"
            class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      <!-- ================================================================= -->
      <!-- CASO 1: VITRINE DE CURSOS (VISÍVEL A TODOS OS MEMBROS LOGADOS)   -->
      <!-- ================================================================= -->
      @if (cursoSelecionadoId() === null) {
        <div class="space-y-6">
          
          <!-- Cabeçalho da Lista de Cursos (Banner Gradiente Escuro) -->
          <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="space-y-2 max-w-2xl">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Área de Aprendizado & Capacitação</span>
                </div>

                <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>Cursos & Treinamentos Técnicos</span>
                </h3>

                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Acesse treinamentos práticos de engenharia diagnóstica, domine as normas ABNT e obtenha certificados de proficiência técnica.
                </p>
              </div>

              <!-- Indicador de Cursos e Certificados -->
              <div class="flex items-center gap-3 flex-wrap shrink-0 self-start md:self-auto">
                <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-inner">
                    {{ cursos().length }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-wider">Cursos Disponíveis</div>
                    <div class="text-[11px] text-indigo-200">{{ totalCertificadosConquistados() }} certificado(s) emitido(s)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grade de Cards de Cursos -->
          @if (carregando()) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4 animate-pulse">
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
                <h4 class="text-base font-black text-slate-900">Nenhum curso disponível no momento</h4>
                <p class="text-xs text-slate-500">Novos treinamentos e capacitações serão adicionados em breve.</p>
              </div>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (curso of cursos(); track curso.id) {
                <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between space-y-6">
                  
                  <div class="space-y-4">
                    <!-- Header do Card / Badges -->
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      
                      <!-- Vinculação ao App ou Categoria -->
                      @if (curso.modulo_predial_vinculado || curso.moduloPredialVinculado) {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                          <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          Vinculado: {{ curso.modulo_predial_vinculado || curso.moduloPredialVinculado }}
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                          {{ curso.categoria || 'Capacitação Técnica' }}
                        </span>
                      }

                      <!-- Badge de Permissão de Acesso / Certificado -->
                      <div class="flex items-center gap-1.5">
                        @if (curso.certificadoEmitidoEm) {
                          <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-black text-[11px] border border-amber-200/80 flex items-center gap-1">
                            <span>🎓</span>
                            <span>Certificado Emitido</span>
                          </span>
                        } @else if (!curso.temAcesso) {
                          <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200/70 flex items-center gap-1">
                            <span>🔒</span>
                            <span>Acesso Restrito</span>
                          </span>
                        } @else if (curso.progresso > 0) {
                          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60 flex items-center gap-1">
                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            <span>{{ curso.progresso }}% Concluído</span>
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px]">
                            Disponível
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Título & Descrição -->
                    <div class="space-y-2">
                      <h4 class="text-lg font-black text-slate-900 leading-snug">
                        {{ curso.titulo }}
                      </h4>
                      <p class="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                        {{ curso.descricao }}
                      </p>
                    </div>

                    <!-- Mini Barra de Progresso no Card -->
                    @if (curso.temAcesso) {
                      <div class="space-y-1.5 pt-1">
                        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>{{ curso.modulosConcluidos.length }} de {{ curso.modulos.length }} aulas</span>
                          <span class="text-indigo-600 font-bold">{{ curso.progresso }}%</span>
                        </div>
                        <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                          <div
                            class="h-full rounded-full bg-indigo-600 transition-all duration-300"
                            [style.width.%]="curso.progresso"
                          ></div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Rodapé do Card com Carga Horária e Ação -->
                  <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div class="text-xs text-slate-500 flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ getCargaHorariaTotal(curso) }}</span>
                    </div>

                    <button
                      type="button"
                      (click)="abrirDetalheCurso(curso.id)"
                      [class]="curso.temAcesso
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'"
                      class="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      @if (!curso.temAcesso) {
                        <span>🔒 Ver Acesso</span>
                      } @else if (curso.certificadoEmitidoEm) {
                        <span>🎓 Ver Certificado</span>
                      } @else if (curso.progresso > 0) {
                        <span>Continuar Curso</span>
                      } @else {
                        <span>Acessar Curso</span>
                      }
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                </div>
              }
            </div>
          }

        </div>
      } @else if (cursoAtivo(); as curso) {
        
        <!-- ================================================================= -->
        <!-- CASO 2: TELA DE ACESSO RESTRITO (SE O CURSO NÃO ESTÁ LIBERADO)    -->
        <!-- ================================================================= -->
        @if (!curso.temAcesso) {
          <div class="space-y-6 animate-fadeIn">
            
            <!-- Barra Superior: Voltar -->
            <div class="flex items-center justify-between">
              <button
                type="button"
                (click)="voltarParaListaCursos()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Voltar para Todos os Cursos</span>
              </button>

              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                🔒 Curso com Acesso Restrito
              </span>
            </div>

            <!-- Card Central de Acesso Restrito -->
            <div class="bg-white rounded-3xl border border-amber-200/80 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6">
              <div class="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
                🔒
              </div>

              <div class="space-y-2.5">
                <h4 class="text-xl sm:text-2xl font-black text-slate-900">
                  Este curso é exclusivo para membros com matrícula liberada
                </h4>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  O curso <strong class="text-amber-900 font-bold">"{{ curso.titulo }}"</strong> requer autorização de matrícula em seu perfil. Fale com o Administrador da Comunidade para solicitar sua liberação neste treinamento.
                </p>
              </div>

              <!-- Detalhes do Curso Trancado -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 max-w-md mx-auto">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Estrutura do Curso:</span>
                  <span class="text-indigo-600">{{ curso.modulos.length }} aulas</span>
                </div>
                <p class="text-xs text-slate-500">
                  {{ curso.descricao }}
                </p>
              </div>

              <div class="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  (click)="voltarParaListaCursos()"
                  class="px-6 py-3 rounded-2xl bg-[#132A41] hover:bg-[#1f3f60] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm"
                >
                  Voltar para Todos os Cursos
                </button>
              </div>
            </div>
          </div>
        } @else {

          <!-- ================================================================= -->
          <!-- CASO 3: SALA DE AULA / CONSUMO DO ALUNO (COM ACESSO LIBERADO)     -->
          <!-- ================================================================= -->
          
          <!-- Barra Superior: Voltar para Lista de Cursos -->
          <div class="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <button
              type="button"
              (click)="voltarParaListaCursos()"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar para Todos os Cursos</span>
            </button>

            @if (curso.modulo_predial_vinculado || curso.moduloPredialVinculado) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 hidden sm:inline-flex">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                Vinculado ao App Predial 4.0
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hidden sm:inline-flex">
                {{ curso.categoria || 'Capacitação Técnica' }}
              </span>
            }
          </div>

          <!-- 1. Cabeçalho do Curso & Barra de Progresso Real -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <span>Capacitação Técnica</span>
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {{ curso.titulo }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  {{ curso.descricao }}
                </p>
              </div>

              <!-- Badge de Matrícula Ativa -->
              <div class="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 self-start md:self-auto shrink-0 shadow-xs">
                <div class="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div class="text-xs font-bold">Matrícula Ativa</div>
                  <div class="text-[11px] text-emerald-700">Aluno Habilitado</div>
                </div>
              </div>
            </div>

            <!-- Barra de Progresso Dinâmica -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between text-xs sm:text-sm font-semibold">
                <span class="text-slate-700">Progresso no Curso</span>
                <span class="text-indigo-600 font-bold">
                  {{ curso.modulosConcluidos.length }} de {{ modulosEnriquecidos().length }} aulas concluídas — {{ curso.progresso }}%
                </span>
              </div>

              <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                  [style.width.%]="curso.progresso"
                ></div>
              </div>
            </div>
          </div>

          <!-- 2. Grade de Aulas e Módulos do Aluno -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-base sm:text-lg font-black text-slate-900">
                Grade de Aulas e Módulos
              </h4>
              <span class="text-xs text-slate-500 font-medium">
                Clique na aula liberada para assistir
              </span>
            </div>

            <div class="space-y-3">
              @for (mod of modulosEnriquecidos(); track mod.id) {
                <div
                  class="bg-white rounded-2xl border transition-all overflow-hidden"
                  [class.border-indigo-200]="moduloAbertoId() === mod.id"
                  [class.border-slate-200]="moduloAbertoId() !== mod.id"
                  [class.shadow-md]="moduloAbertoId() === mod.id"
                  [class.shadow-xs]="moduloAbertoId() !== mod.id"
                >
                  <!-- Linha de Cabeçalho do Card de Módulo -->
                  <div
                    (click)="toggleModulo(mod.id)"
                    class="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                  >
                    <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      
                      <!-- Ícone de Status da Aula -->
                      @if (mod.status === 'concluido') {
                        <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs" title="Aula Concluída">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      } @else if (mod.status === 'em_andamento') {
                        <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs" title="Aula Disponível">
                          <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      } @else {
                        <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0" title="Aula Bloqueada">
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
                            <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                              Concluído
                            </span>
                          } @else if (mod.status === 'em_andamento') {
                            <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200/60">
                              Disponível
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">
                              Bloqueado
                            </span>
                          }
                        </div>

                        <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>⏱ {{ mod.duracao || '30 min' }}</span>
                          @if (mod.descricao) {
                            <span>•</span>
                            <span>{{ mod.descricao }}</span>
                          }
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
                          [class.rotate-180]="moduloAbertoId() === mod.id"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      }
                    </div>
                  </div>

                  <!-- Conteúdo Expandido do Módulo (Player de Vídeo Vimeo) -->
                  @if (moduloAbertoId() === mod.id) {
                    <div class="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/50 space-y-4 animate-fadeIn">
                      
                      @if (mod.status === 'bloqueado') {
                        <!-- Aviso de Módulo Bloqueado -->
                        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-3">
                          <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Complete a aula anterior para desbloquear este módulo.</span>
                        </div>
                      } @else {
                        <!-- Player de Vídeo Vimeo -->
                        <div class="space-y-2">
                          <div class="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                              </svg>
                              <span>Videoaula — Transmissão Integrada</span>
                            </div>
                            <span class="text-[11px] text-slate-500 font-normal">Ambiente Seguro de Capacitação</span>
                          </div>

                          @let videoUrl = getVimeoUrl(mod.vimeo_id);
                          @if (videoUrl) {
                            <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                              <iframe
                                [src]="videoUrl"
                                class="w-full h-full"
                                frameborder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowfullscreen
                                title="Vídeo da aula"
                              ></iframe>
                            </div>
                          } @else {
                            <div class="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-3">
                              <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Vídeo não configurado corretamente para este módulo — contate o suporte.</span>
                            </div>
                          }
                        </div>

                        <!-- Botão de Marcar como Concluído -->
                        <div class="flex items-center justify-between pt-2 flex-wrap gap-2">
                          <span class="text-xs text-slate-500 italic">
                            @if (mod.status === 'concluido') {
                              ✓ Você já concluiu esta aula.
                            } @else {
                              Ao concluir a aula, clique no botão para salvar seu progresso.
                            }
                          </span>
                          
                          @if (mod.status !== 'concluido') {
                            <button
                              type="button"
                              [disabled]="salvandoModuloId() === mod.id"
                              (click)="concluirModulo(mod.id)"
                              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                            >
                              @if (salvandoModuloId() === mod.id) {
                                <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Salvando...</span>
                              } @else {
                                <span>Marcar como Concluído</span>
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                              }
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

          <!-- 3. Bloco de Avaliação e Proficiência Final -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-base sm:text-lg font-black text-slate-900">
                    Avaliação & Conclusão Técnica
                  </h4>
                  @if (curso.progresso === 100) {
                    <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                      Liberada
                    </span>
                  }
                </div>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Avaliação de proficiência dos módulos técnicos. Conclua 100% das aulas para habilitar a certificação.
                </p>
              </div>

              <!-- Ação de Avaliação / Emissão -->
              <div class="relative group self-start sm:self-auto">
                @if (curso.certificadoEmitidoEm) {
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                      <span>✓</span>
                      <span>Aprovado & Certificado</span>
                    </span>

                    <button
                      type="button"
                      [disabled]="gerandoPDF()"
                      (click)="baixarCertificadoPDF(curso)"
                      class="px-4 py-2 rounded-xl bg-[#132A41] hover:bg-[#1E3A5F] text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 border border-[#B5642A]/40 transition-all"
                    >
                      @if (gerandoPDF()) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Gerando...</span>
                      } @else {
                        <svg class="w-3.5 h-3.5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Baixar Certificado (PDF)</span>
                      }
                    </button>
                  </div>
                } @else {
                  <button
                    type="button"
                    [disabled]="curso.progresso < 100 || emitindoCertificado()"
                    (click)="fazerAvaliacaoEGerarCertificado()"
                    [class]="curso.progresso === 100 && !emitindoCertificado()
                      ? 'px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer transition-all'
                      : 'px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs sm:text-sm cursor-not-allowed flex items-center gap-2'"
                  >
                    @if (emitindoCertificado()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Emitindo Certificado...</span>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>{{ curso.progresso === 100 ? 'Finalizar & Emitir Certificado' : 'Fazer Avaliação' }}</span>
                    }
                  </button>

                  @if (curso.progresso < 100) {
                    <div class="absolute right-0 bottom-full mb-2 hidden group-hover:block w-[min(16rem,calc(100vw-2rem))] p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl shadow-xl z-10 text-center">
                      Conclua todas as aulas (100%) para liberar a avaliação e o certificado
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <!-- 4. Bloco de Certificado (Emitido vs. Bloqueado) -->
          @if (curso.certificadoEmitidoEm) {
            
            <!-- SELO / BADGE DE CERTIFICADO EMITIDO COM SUCESSO -->
            <div class="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 rounded-3xl border-2 border-amber-300/80 p-8 sm:p-10 text-center space-y-6 shadow-md relative overflow-hidden animate-scaleUp">
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-[#B5642A] text-white mx-auto flex items-center justify-center font-black text-3xl shadow-lg shadow-amber-300/50">
                🎓
              </div>

              <div class="space-y-3 max-w-xl mx-auto">
                <div class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-[#B5642A] text-xs font-black uppercase tracking-wider border border-[#B5642A]/30">
                  <span>{{ getTextoCertificadoExibicao(curso) }}</span>
                </div>

                <h4 class="text-xl sm:text-2xl font-black text-[#132A41] tracking-tight">
                  Certificado Emitido com Sucesso!
                </h4>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Parabéns! Você completou com sucesso todos os módulos e avaliações de proficiência do curso <strong>"{{ curso.titulo }}"</strong>. O documento oficial em PDF com assinatura técnica e código de autenticidade está liberado para download e inclusão curricular.
                </p>

                <div class="pt-1 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#132A41]">
                  <span>📅 Emitido em: {{ formatarData(curso.certificadoEmitidoEm) }}</span>
                  <span class="text-slate-300">•</span>
                  <span>⏱ {{ getCargaHorariaTotal(curso) }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-emerald-700">Autenticidade Verificada ✓</span>
                </div>
              </div>

              <!-- Botão de Download do PDF Oficial -->
              <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  [disabled]="gerandoPDF()"
                  (click)="baixarCertificadoPDF(curso)"
                  class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#132A41] hover:bg-[#1E3A5F] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 border border-[#B5642A]/40"
                >
                  @if (gerandoPDF()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Gerando Documento PDF...</span>
                  } @else {
                    <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Baixar Certificado Oficial (PDF)</span>
                  }
                </button>
              </div>
            </div>

          } @else if (curso.progresso === 100) {

            <!-- PRONTO PARA EMISSÃO -->
            <div class="bg-indigo-50/80 rounded-3xl border-2 border-dashed border-indigo-300 p-8 sm:p-10 text-center space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center text-2xl shadow-md">
                🎉
              </div>

              <div class="space-y-1 max-w-md mx-auto">
                <h4 class="text-base sm:text-lg font-black text-slate-900">
                  Todas as aulas foram concluídas!
                </h4>
                <p class="text-xs sm:text-sm text-slate-600">
                  Clique no botão abaixo para registrar a emissão do seu certificado técnico.
                </p>
              </div>

              <button
                type="button"
                [disabled]="emitindoCertificado()"
                (click)="fazerAvaliacaoEGerarCertificado()"
                class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md shadow-indigo-600/30 inline-flex items-center gap-2"
              >
                @if (emitindoCertificado()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Emitindo...</span>
                } @else {
                  <span>Emitir Certificado Agora</span>
                  <span>🎓</span>
                }
              </button>
            </div>

          } @else {

            <!-- CERTIFICADO BLOQUEADO (PRÉVIA) -->
            <div class="bg-slate-50/80 rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-10 text-center space-y-4 opacity-80">
              <div class="w-16 h-16 rounded-2xl bg-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-inner">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div class="space-y-1 max-w-md mx-auto">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <span>{{ curso.texto_certificado || curso.textoCertificado || 'Certificado de Conclusão Técnica' }}</span>
                </div>
                <h4 class="text-base sm:text-lg font-bold text-slate-700">
                  Emissão Bloqueada
                </h4>
                <p class="text-xs sm:text-sm text-slate-500">
                  Seu certificado oficial será liberado assim que você concluir 100% das aulas deste curso.
                </p>
              </div>
            </div>

          }

        }

      }

    </div>
  `
})
export class ComunidadeCursoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly certificadoPdfService = inject(CertificadoPdfService);

  readonly cursos = signal<CursoAluno[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly cursoSelecionadoId = signal<string | null>(null);
  readonly moduloAbertoId = signal<string | null>(null);
  readonly salvandoModuloId = signal<string | null>(null);
  readonly emitindoCertificado = signal<boolean>(false);

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro' | 'alerta'>('sucesso');
  readonly gerandoPDF = signal<boolean>(false);
  readonly perfilAluno = signal<any | null>(null);

  readonly cursoAtivo = computed(() => {
    const id = this.cursoSelecionadoId();
    if (!id) return null;
    return this.cursos().find(c => c.id === id) || null;
  });

  readonly totalCertificadosConquistados = computed(() => {
    return this.cursos().filter(c => !!c.certificadoEmitidoEm).length;
  });

  readonly modulosEnriquecidos = computed<CursoModuloAluno[]>(() => {
    const c = this.cursoAtivo();
    if (!c || !c.modulos) return [];

    const concluidos = c.modulosConcluidos || [];
    let primeiroNaoConcluidoEncontrado = false;

    return c.modulos.map((mod: CursoModuloAluno) => {
      const isConcluido = concluidos.includes(mod.id);
      if (isConcluido) {
        return { ...mod, status: 'concluido' as const };
      }

      if (!primeiroNaoConcluidoEncontrado) {
        primeiroNaoConcluidoEncontrado = true;
        return { ...mod, status: 'em_andamento' as const };
      }

      return { ...mod, status: 'bloqueado' as const };
    });
  });

  async ngOnInit(): Promise<void> {
    await this.carregarCursos();
  }

  async carregarCursos(): Promise<void> {
    this.carregando.set(true);
    try {
      const dados = await this.supabaseService.listarCursosParaAluno();
      this.cursos.set(dados);
    } catch (e: any) {
      console.warn('Erro ao carregar cursos:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  abrirDetalheCurso(cursoId: string): void {
    this.cursoSelecionadoId.set(cursoId);
    this.mensagemFeedback.set(null);

    const c = this.cursos().find(x => x.id === cursoId);
    if (!c || !c.temAcesso) {
      this.moduloAbertoId.set(null);
      return;
    }

    const modulos = this.modulosEnriquecidos();
    const emAndamento = modulos.find(m => m.status === 'em_andamento') || modulos[0];
    this.moduloAbertoId.set(emAndamento?.id || null);
  }

  voltarParaListaCursos(): void {
    this.cursoSelecionadoId.set(null);
    this.moduloAbertoId.set(null);
    this.mensagemFeedback.set(null);
  }

  toggleModulo(moduloId: string): void {
    if (this.moduloAbertoId() === moduloId) {
      this.moduloAbertoId.set(null);
    } else {
      this.moduloAbertoId.set(moduloId);
    }
  }

  async concluirModulo(moduloId: string): Promise<void> {
    const cursoId = this.cursoSelecionadoId();
    if (!cursoId || this.salvandoModuloId()) return;

    this.salvandoModuloId.set(moduloId);
    this.mensagemFeedback.set(null);

    try {
      const { error } = await this.supabaseService.marcarModuloConcluido(cursoId, moduloId);

      if (error) {
        this.tipoFeedback.set('erro');
        this.mensagemFeedback.set('Não foi possível salvar o progresso: ' + (error.message || 'Tente novamente.'));
        return;
      }

      // Atualiza o estado local reativo
      this.cursos.update(lista =>
        lista.map(c => {
          if (c.id !== cursoId) return c;
          const atuais = c.modulosConcluidos || [];
          const novosConcluidos = atuais.includes(moduloId) ? atuais : [...atuais, moduloId];
          const total = c.modulos.length;
          const progresso = total > 0 ? Math.round((novosConcluidos.length / total) * 100) : 0;
          return {
            ...c,
            matriculado: true,
            modulosConcluidos: novosConcluidos,
            progresso
          };
        })
      );

      this.tipoFeedback.set('sucesso');
      this.mensagemFeedback.set('Aula marcada como concluída!');

      // Abre automaticamente o próximo módulo liberado
      setTimeout(() => {
        const modulos = this.modulosEnriquecidos();
        const proximo = modulos.find(m => m.status === 'em_andamento');
        if (proximo) {
          this.moduloAbertoId.set(proximo.id);
        }
      }, 100);

    } catch (e: any) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Exceção ao concluir aula: ' + (e?.message || e));
    } finally {
      this.salvandoModuloId.set(null);
    }
  }

  async fazerAvaliacaoEGerarCertificado(): Promise<void> {
    const cursoId = this.cursoSelecionadoId();
    const c = this.cursoAtivo();
    if (!cursoId || !c || this.emitindoCertificado()) return;

    this.emitindoCertificado.set(true);
    this.mensagemFeedback.set(null);

    try {
      const { error } = await this.supabaseService.emitirCertificado(cursoId);

      if (error) {
        this.tipoFeedback.set('erro');
        this.mensagemFeedback.set('Erro ao emitir certificado: ' + (error.message || 'Tente novamente.'));
        return;
      }

      const dataHoje = new Date().toISOString();

      // Atualiza o estado local
      this.cursos.update(lista =>
        lista.map(item =>
          item.id === cursoId
            ? { ...item, certificadoEmitidoEm: dataHoje, avaliacaoAprovado: true }
            : item
        )
      );

      this.tipoFeedback.set('sucesso');
      this.mensagemFeedback.set('🎉 Parabéns! Seu certificado técnico foi emitido com sucesso.');
    } catch (e: any) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Exceção ao emitir certificado: ' + (e?.message || e));
    } finally {
      this.emitindoCertificado.set(false);
    }
  }

  getCargaHorariaTotal(curso: CursoAluno): string {
    if (!curso.modulos || curso.modulos.length === 0) return 'Carga horária em definição';

    const totalMinutos = curso.modulos.reduce((acc, m) => {
      const match = (m.duracao || '').match(/(\d+)/);
      return acc + (match ? parseInt(match[1], 10) : 30);
    }, 0);

    const horas = Math.floor(totalMinutos / 60);
    const min = totalMinutos % 60;
    if (horas > 0 && min > 0) return `${horas}h ${min}min de conteúdo`;
    if (horas > 0) return `${horas}h de conteúdo`;
    return `${min}min de conteúdo`;
  }

  getVimeoUrl(vimeoId?: string | null): SafeResourceUrl | null {
    const url = montarUrlPlayerVimeo(vimeoId);
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatarData(dataStr: string | null | undefined): string {
    if (!dataStr) return '';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dataStr;
    }
  }

  formatarDataExtenso(dataStr: string | null | undefined): string {
    if (!dataStr) return 'data não informada';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dataStr;
    }
  }

  getTextoCertificadoExibicao(curso: CursoAluno): string {
    const texto = (curso.texto_certificado || curso.textoCertificado || '').trim();
    if (!texto) {
      return 'Certificado de Conclusão Técnica';
    }
    return texto;
  }

  async baixarCertificadoPDF(curso: CursoAluno): Promise<void> {
    if (this.gerandoPDF()) return;
    this.gerandoPDF.set(true);
    this.mensagemFeedback.set(null);

    try {
      // 1. Obtém dados do perfil do aluno
      let perfil = this.perfilAluno();
      if (!perfil) {
        perfil = await this.supabaseService.obterMeuPerfilCompleto();
        if (perfil) {
          this.perfilAluno.set(perfil);
        }
      }

      const session = await this.supabaseService.getSession();
      const nomeAluno = (
        perfil?.full_name ||
        session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split('@')[0] ||
        'Membro da Comunidade'
      ).trim();

      // Garante código de verificação
      let codigoVerificacao = curso.codigo_verificacao || curso.codigoVerificacao;
      if (!codigoVerificacao && curso.matriculaId) {
        codigoVerificacao = await this.supabaseService.garantirCodigoVerificacaoMatricula(curso.matriculaId);
      }

      const res = await this.certificadoPdfService.gerarEBaixarCertificadoPDF({
        nomeAluno,
        tituloCurso: curso.titulo,
        textoNormativo: curso.texto_certificado || curso.textoCertificado || undefined,
        cargaHoraria: curso.carga_horaria_certificado || curso.cargaHorariaCertificado || undefined,
        dataEmissaoIso: curso.certificadoEmitidoEm || undefined,
        codigoVerificacao: codigoVerificacao || undefined,
      });

      if (res.sucesso) {
        this.tipoFeedback.set('sucesso');
        this.mensagemFeedback.set('Certificado em PDF gerado e baixado com sucesso!');
      } else {
        this.tipoFeedback.set('erro');
        this.mensagemFeedback.set(res.mensagemErro || 'Erro ao gerar certificado em PDF.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar certificado em PDF:', err);
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Não foi possível gerar o certificado em PDF: ' + (err?.message || err));
    } finally {
      this.gerandoPDF.set(false);
    }
  }
}
