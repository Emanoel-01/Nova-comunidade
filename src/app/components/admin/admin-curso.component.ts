import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { extrairVimeoId, montarUrlPlayerVimeo } from '../../utils/vimeo.util';
import { extrairYoutubeId, montarUrlPlayerYoutube } from '../../utils/youtube.util';
import { CertificadoPdfService } from '../../services/certificado-pdf.service';

export interface ModuloCursoAdmin {
  id: string;
  curso_id: string;
  titulo: string;
  descricao?: string | null;
  duracao?: string | null;
  vimeo_id?: string | null;
  youtube_id?: string | null;
  ordem: number;
  exige_avaliacao?: boolean;
  trava_proximo_modulo?: boolean;
  totalMateriais?: number;
  totalQuestoes?: number;
}

export interface CursoAdmin {
  id: string;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  ativo: boolean;
  modulo_predial_vinculado?: string | null;
  texto_certificado?: string | null;
  carga_horaria_certificado?: string | null;
  instrutor_nome?: string | null;
  instrutor_qualificacao?: string | null;
  tem_avaliacao_por_modulo?: boolean;
  nota_minima_avaliacao_modulo?: number | null;
  nota_minima_avaliacao_final?: number | null;
  tem_prazo?: boolean;
  prazo_dias?: number | null;
  criado_em?: string;
  modulos?: ModuloCursoAdmin[];
  totalMatriculados?: number;
  totalCertificados?: number;
  data_inicio?: string | null;
  data_fim?: string | null;
  formato?: 'gravado' | 'ao_vivo' | 'presencial_hibrido' | null;
  local?: string | null;
  imagem_capa_url?: string | null;
  exibir_na_agenda?: boolean;
  preco?: number | null;
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
                  <input
                    type="text"
                    #novoVinculoInput
                    placeholder="Ex: 01, 02 ou 1.1 (deixe em branco se avulso)"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Carga Horária do Certificado (Opcional)
                  </label>
                  <input
                    type="text"
                    #novaCargaHorariaInput
                    placeholder="Ex: 40 (quarenta) horas"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-bold text-slate-700">
                    Texto Normativo do Certificado (Opcional)
                  </label>
                  <textarea
                    #novoTextoNormativoInput
                    rows="2"
                    placeholder="Ex: em conformidade com as diretrizes da ABNT NBR 16747:2020 e IBAPE-SP"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <!-- Configurações de Avaliação e Prazo -->
                <div class="sm:col-span-2 p-4 rounded-2xl bg-white border border-indigo-100 space-y-3">
                  <div class="text-xs font-bold text-slate-800">Diretrizes de Avaliação e Prazos do Curso</div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" #novoTemAvaliacaoModuloInput class="w-4 h-4 text-indigo-600 rounded" />
                        <span class="text-xs font-bold text-slate-700">Habilitar Avaliação por Módulo</span>
                      </label>
                      <div class="flex items-center gap-2">
                        <label class="text-[11px] font-semibold text-slate-600">Nota mínima por módulo (%):</label>
                        <input type="number" #novoNotaMinModuloInput value="70" min="0" max="100" class="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" #novoTemPrazoInput class="w-4 h-4 text-indigo-600 rounded" />
                        <span class="text-xs font-bold text-slate-700">Definir Prazo para Conclusão</span>
                      </label>
                      <div class="flex items-center gap-2">
                        <label class="text-[11px] font-semibold text-slate-600">Prazo (dias após matrícula):</label>
                        <input type="number" #novoPrazoDiasInput value="30" min="1" class="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Seção: Agenda Pública -->
                <div class="sm:col-span-2 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-bold text-slate-800">Agenda Pública (Amorim Academy)</div>
                    <span class="text-[11px] text-slate-500">Exibição pública no site institucional</span>
                  </div>

                  <div class="space-y-3">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        #novoExibirAgendaInput
                        [checked]="novoExibirAgenda()"
                        (change)="novoExibirAgenda.set(novoExibirAgendaInput.checked)"
                        class="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span class="text-xs font-bold text-slate-700">Exibir na Agenda de Cursos do site</span>
                    </label>

                    <div [class.hidden]="!novoExibirAgenda()" class="space-y-3 pt-2 border-t border-indigo-100/70">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1.5 sm:col-span-2">
                          <label class="block text-xs font-bold text-slate-700">Formato</label>
                          <select
                            #novoFormatoInput
                            [value]="novoFormato()"
                            (change)="novoFormato.set($any(novoFormatoInput.value))"
                            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="gravado">Gravado (EAD)</option>
                            <option value="ao_vivo">Remoto ao vivo</option>
                            <option value="presencial_hibrido">Presencial híbrido</option>
                          </select>
                        </div>

                        <div class="space-y-1.5">
                          <label class="block text-xs font-bold text-slate-700">Data de Início</label>
                          <input
                            type="date"
                            #novoDataInicioInput
                            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div class="space-y-1.5">
                          <label class="block text-xs font-bold text-slate-700">Data de Fim</label>
                          <input
                            type="date"
                            #novoDataFimInput
                            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div [class.hidden]="novoFormato() === 'gravado'" class="space-y-1.5 sm:col-span-2">
                          <label class="block text-xs font-bold text-slate-700">Local</label>
                          <input
                            type="text"
                            #novoLocalInput
                            placeholder="Ex: Recife/PE ou Online"
                            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div class="space-y-1.5 sm:col-span-2">
                          <label class="block text-xs font-bold text-slate-700">URL da imagem de capa do curso</label>
                          <input
                            type="url"
                            #novoImagemCapaInput
                            placeholder="https://exemplo.com/imagem-capa.jpg"
                            class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
                  (click)="salvarNovoCurso(
                    novoTituloInput.value,
                    novaDescricaoInput.value,
                    novaCategoriaInput.value,
                    novoVinculoInput.value,
                    novoTextoNormativoInput.value,
                    novaCargaHorariaInput.value,
                    novoTemAvaliacaoModuloInput.checked,
                    +novoNotaMinModuloInput.value,
                    novoTemPrazoInput.checked,
                    +novoPrazoDiasInput.value,
                    novoExibirAgendaInput.checked,
                    $any(novoFormatoInput.value),
                    novoDataInicioInput.value,
                    novoDataFimInput.value,
                    novoLocalInput.value,
                    novoImagemCapaInput.value
                  )"
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

                    <div class="space-y-1.5 sm:col-span-3">
                      <label class="block text-xs font-bold text-slate-700">Ou link do vídeo no YouTube (não listado ou público)</label>
                      <input
                        type="text"
                        #formModYoutubeInput
                        [value]="moduloFormDados.youtube_id"
                        (input)="moduloFormDados.youtube_id = formModYoutubeInput.value"
                        placeholder="Ex: https://youtu.be/BPwaRKHKLeA"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                      <p class="text-[11px] text-slate-500">
                        Cole o <strong>link completo</strong> (ex: <code class="bg-slate-100 px-1 py-0.5 rounded">https://youtu.be/BPwaRKHKLeA</code>) ou apenas o <strong>ID</strong> do vídeo. Funciona normalmente com vídeos marcados como "não listados" — a restrição de listagem não impede o embed aqui. Preencha <strong>Vimeo ou YouTube</strong>, não é necessário os dois; se ambos forem preenchidos, o YouTube tem prioridade na exibição.
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

                    <!-- Configurações Pedagógicas e Trava do Módulo -->
                    <div class="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/80 rounded-2xl border border-indigo-100">
                      <label class="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          #formModExigeAvaliacaoInput
                          [checked]="moduloFormDados.exige_avaliacao"
                          (change)="moduloFormDados.exige_avaliacao = formModExigeAvaliacaoInput.checked"
                          class="mt-0.5 w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span class="text-xs font-bold text-slate-800">Exigir Avaliação de Proficiência</span>
                          <p class="text-[11px] text-slate-500">O aluno só conclui o módulo se acertar as questões do quiz deste módulo.</p>
                        </div>
                      </label>

                      <label class="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          #formModTravaProximoInput
                          [checked]="moduloFormDados.trava_proximo_modulo"
                          (change)="moduloFormDados.trava_proximo_modulo = formModTravaProximoInput.checked"
                          class="mt-0.5 w-4 h-4 text-indigo-600 rounded"
                        />
                        <div>
                          <span class="text-xs font-bold text-slate-800">Travar Próximo Módulo (Sequencial)</span>
                          <p class="text-[11px] text-slate-500">O módulo seguinte permanecerá bloqueado até que este seja concluído.</p>
                        </div>
                      </label>
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

                    @if (moduloFormDados.youtube_id?.trim()) {
                      @let youtubePreviewUrl = getYoutubeUrl(moduloFormDados.youtube_id);
                      <div class="space-y-1.5 sm:col-span-3 pt-1">
                        <label class="block text-xs font-bold text-slate-700">Prévia do Player do YouTube</label>
                        @if (youtubePreviewUrl) {
                          <div class="aspect-video max-w-md w-full bg-black rounded-2xl overflow-hidden shadow-xs border border-slate-300">
                            <iframe
                              [src]="youtubePreviewUrl"
                              class="w-full h-full"
                              frameborder="0"
                              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                              allowfullscreen
                              title="Prévia do vídeo"
                            ></iframe>
                          </div>
                        } @else {
                          <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                            <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Formato de link ou ID do YouTube não reconhecido. Cole o link completo (youtu.be/ID ou youtube.com/watch?v=ID) ou apenas o ID de 11 caracteres.</span>
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
                            @if (mod.youtube_id) {
                              <span class="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-mono font-bold border border-red-100 flex items-center gap-1">
                                <svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/>
                                </svg>
                                YouTube: {{ mod.youtube_id }}
                              </span>
                            }
                            @if (mod.exige_avaliacao) {
                              <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                                <span>📝</span> Exige Quiz
                              </span>
                            }
                            @if (!mod.trava_proximo_modulo) {
                              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                                🔓 Sem trava
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

                      <div class="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                        <button
                          type="button"
                          (click)="abrirModalMateriaisModulo(mod)"
                          class="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-indigo-100"
                          title="Gerenciar materiais anexos a este módulo"
                        >
                          <span>📎</span>
                          <span>Materiais</span>
                        </button>

                        <button
                          type="button"
                          (click)="abrirModalAvaliacaoModulo(mod)"
                          class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-amber-200"
                          title="Configurar questões do quiz avaliativo deste módulo"
                        >
                          <span>📝</span>
                          <span>Avaliação</span>
                        </button>

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
                  Configuração & Validade do Certificado
                </h4>
                <p class="text-xs sm:text-sm text-slate-500">
                  Configure as diretrizes normativas, carga horária e a dupla assinatura (Responsável Técnico + Instrutor do Curso) para os certificados oficiais emitidos.
                </p>
              </div>

              <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                
                <!-- Informações Normativas e Carga Horária -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2 sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700">
                      Texto Normativo / Diretrizes Técnicas
                    </label>
                    <textarea
                      #textoNormativoInput
                      rows="3"
                      [value]="cursoAtivo()?.texto_certificado || ''"
                      placeholder="Ex: em conformidade com as diretrizes da ABNT NBR 16747:2020 e IBAPE-SP"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                    <p class="text-[11px] text-slate-400">
                      Descreva as normas, ABNTs ou conselhos técnicos associados à validação deste curso.
                    </p>
                  </div>

                  <div class="space-y-2 sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-700">
                      Carga Horária do Certificado
                    </label>
                    <input
                      type="text"
                      #cargaHorariaInput
                      [value]="cursoAtivo()?.carga_horaria_certificado || ''"
                      placeholder="Ex: 40 (quarenta) horas"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p class="text-[11px] text-slate-400">
                      Carga horária expressa por extenso ou em horas (ex: 40 horas, 40h).
                    </p>
                  </div>
                </div>

                <!-- Bloco de Instrutor(a) do Curso (Dupla Assinatura) -->
                <div class="p-5 sm:p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      <h5 class="text-xs sm:text-sm font-bold text-slate-800">
                        Instrutor(a) do Curso (Dupla Assinatura)
                      </h5>
                    </div>
                    <span class="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                      Opcional
                    </span>
                  </div>
                  <p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    Se preenchido, o certificado incluirá a assinatura do instrutor do curso ao centro, ao lado da assinatura do Responsável Técnico. Caso não seja configurado, o certificado será emitido com a assinatura institucional centralizada.
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">
                        Nome Completo do Instrutor(a)
                      </label>
                      <input
                        type="text"
                        #instrutorNomeInput
                        [value]="cursoAtivo()?.instrutor_nome || ''"
                        placeholder="Ex: Nathalya Aguiar"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-slate-700">
                        Qualificação Profissional / Conselho
                      </label>
                      <input
                        type="text"
                        #instrutorQualificacaoInput
                        [value]="cursoAtivo()?.instrutor_qualificacao || ''"
                        placeholder="Ex: Arquiteta e Urbanista · CAU A000000-0"
                        class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <!-- Botões de Ação -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    [disabled]="gerandoPdfTeste()"
                    (click)="baixarCertificadoTeste(textoNormativoInput.value, cargaHorariaInput.value, instrutorNomeInput.value, instrutorQualificacaoInput.value)"
                    class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    @if (gerandoPdfTeste()) {
                      <span class="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>Gerando PDF de Teste...</span>
                    } @else {
                      <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Baixar PDF de Teste</span>
                    }
                  </button>

                  <button
                    type="button"
                    [disabled]="salvando()"
                    (click)="salvarConfiguracaoCertificado(textoNormativoInput.value, cargaHorariaInput.value, instrutorNomeInput.value, instrutorQualificacaoInput.value)"
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

                <!-- Prévia Visual do Certificado Oficial -->
                <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#132A41]">Prévia Visual do Certificado Oficial (Amorim Academy)</span>
                    <span class="text-[11px] font-bold text-[#B5642A]">Design Oficial 4.0</span>
                  </div>
                  
                  <div class="p-8 sm:p-10 rounded-2xl bg-[#FEFCF8] border-2 border-[#132A41] relative overflow-hidden text-center space-y-4 max-w-2xl mx-auto shadow-md">
                    <!-- Borda interna em cobre -->
                    <div class="absolute inset-1.5 border border-[#B5642A] pointer-events-none"></div>
                    
                    <!-- Kicker Atualizado: ECOSSISTEMA DE FORMAÇÃO 4.0 -->
                    <div class="text-[#B5642A] font-bold text-[9px] tracking-widest uppercase">
                      AMORIM ACADEMY · ECOSSISTEMA DE FORMAÇÃO 4.0
                    </div>

                    <div class="text-[#132A41] font-serif font-bold text-2xl tracking-tight">
                      Certificado de Conclusão
                    </div>

                    <div class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                      PROFICIÊNCIA TÉCNICA CONTINUADA
                    </div>

                    <div class="pt-2 text-xs text-slate-600">
                      Certificamos, para os devidos fins de comprovação técnica e curricular, que
                    </div>

                    <div class="text-xl sm:text-2xl font-serif font-bold text-[#B5642A]">
                      [NOME DO ALUNO]
                    </div>
                    <div class="w-48 h-px bg-[#132A41]/30 mx-auto"></div>

                    <div class="text-xs text-slate-600">
                      concluiu com êxito todas as etapas, módulos didáticos e avaliações do curso
                    </div>

                    <div class="text-base font-extrabold text-[#132A41]">
                      “{{ cursoAtivo()?.titulo || 'Título do Curso' }}”
                    </div>

                    <div class="text-xs text-slate-500 leading-relaxed max-w-md mx-auto italic">
                      {{ formatarPreviaTexto(textoNormativoInput.value, cargaHorariaInput.value) }}
                    </div>

                    <!-- Rodapé com Dupla Assinatura Condicional -->
                    <div class="pt-4 border-t border-slate-200/80 text-left text-[9px] text-slate-500">
                      @if (instrutorNomeInput.value.trim()) {
                        <!-- Grade de 3 Colunas: Emissão / Instrutor / Responsável Técnico -->
                        <div class="grid grid-cols-3 gap-3 items-end">
                          <div>
                            <div class="font-bold text-[#132A41]">DADOS DE EMISSÃO & AUTENTICIDADE</div>
                            <div>Local e Data: Recife – PE, [Data de Emissão]</div>
                            <div>Código: <span class="font-mono font-bold text-[#132A41]">AMTECH-XXXXXXXX</span></div>
                            <div class="pt-1 text-[8px] text-slate-400">Amorim Arquitetura, Tech & Academy · CNPJ 35.673.731/0001-82</div>
                          </div>

                          <div class="text-center">
                            <div class="font-serif italic font-semibold text-xs text-[#132A41]">{{ instrutorNomeInput.value.trim() }}</div>
                            <div class="w-28 h-px bg-slate-300 mx-auto mb-1"></div>
                            <div class="font-bold text-[#132A41] text-[9.5px] leading-tight">{{ instrutorNomeInput.value.trim() }}</div>
                            <div class="font-bold text-[#B5642A] text-[8.5px] leading-tight">
                              {{ instrutorQualificacaoInput.value.trim() || 'Instrutor(a) do Curso' }}
                            </div>
                            <div class="text-[8px] text-slate-400">Instrutor(a) do Curso</div>
                          </div>

                          <div class="text-right">
                            <div class="font-serif italic font-semibold text-xs text-[#132A41]">Emanoel S. de Amorim</div>
                            <div class="w-28 h-px bg-slate-300 ml-auto mb-1"></div>
                            <div class="font-bold text-[#132A41] text-[9.5px] leading-tight">Emanoel Silva de Amorim</div>
                            <div class="font-bold text-[#B5642A] text-[8.5px] leading-tight">CAU A133593-6 · Arquiteto e Urbanista</div>
                            <div class="text-[8px] text-slate-400">Responsável Técnico · AmorimTech</div>
                          </div>
                        </div>
                      } @else {
                        <!-- Grade de 2 Colunas: Emissão / Responsável Técnico -->
                        <div class="grid grid-cols-2 gap-4 items-end">
                          <div>
                            <div class="font-bold text-[#132A41]">DADOS DE EMISSÃO & AUTENTICIDADE</div>
                            <div>Local e Data: Recife – PE, [Data de Emissão]</div>
                            <div>Código: <span class="font-mono font-bold text-[#132A41]">AMTECH-XXXXXXXX</span></div>
                            <div class="pt-1 text-[8px] text-slate-400">Amorim Arquitetura, Tech & Academy · CNPJ 35.673.731/0001-82</div>
                          </div>
                          <div class="text-right">
                            <div class="font-serif italic font-semibold text-xs text-[#132A41]">Emanoel S. de Amorim</div>
                            <div class="w-36 h-px bg-slate-300 ml-auto mb-1"></div>
                            <div class="font-bold text-[#132A41]">Emanoel Silva de Amorim</div>
                            <div class="font-bold text-[#B5642A]">CAU A133593-6 · Arquiteto e Urbanista</div>
                            <div class="text-[8px] text-slate-400">Responsável Técnico · AmorimTech</div>
                          </div>
                        </div>
                      }
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
                                    <button
                                      type="button"
                                      (click)="baixarCertificadoAluno(mat)"
                                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                                      title="Baixar Certificado Oficial em PDF deste aluno"
                                    >
                                      <span>🎓</span>
                                      <span>Emitido</span>
                                      <svg class="w-3.5 h-3.5 text-amber-700 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                    </button>
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
                    <input
                      type="text"
                      #editVinculoInput
                      [value]="cursoAtivo()?.modulo_predial_vinculado || ''"
                      placeholder="Ex: 01, 02 ou 1.1 (deixe em branco se avulso)"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-700">
                      Preço do Curso (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      #precoInput
                      [value]="cursoAtivo()?.preco ?? ''"
                      placeholder="Ex: 19.90"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p class="text-[11px] text-slate-400">
                      Valor exibido na vitrine pública da Amorim Academy. Deixe em branco
                      para exibir "Sob consulta". Este campo não ativa cobrança automática
                      — é só informativo até o checkout de pagamento existir.
                    </p>
                  </div>

                  <!-- Configurações de Avaliação e Prazos do Curso -->
                  <div class="sm:col-span-2 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                    <div class="text-xs font-bold text-slate-800">Diretrizes de Avaliação e Prazos do Curso</div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            #editTemAvaliacaoModuloInput
                            [checked]="cursoAtivo()?.tem_avaliacao_por_modulo"
                            class="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span class="text-xs font-bold text-slate-700">Habilitar Avaliação por Módulo</span>
                        </label>
                        <div class="flex items-center gap-2">
                          <label class="text-[11px] font-semibold text-slate-600">Nota mínima por módulo (%):</label>
                          <input
                            type="number"
                            #editNotaMinModuloInput
                            [value]="cursoAtivo()?.nota_minima_avaliacao_modulo ?? 70"
                            min="0"
                            max="100"
                            class="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            #editTemPrazoInput
                            [checked]="cursoAtivo()?.tem_prazo"
                            class="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span class="text-xs font-bold text-slate-700">Definir Prazo para Conclusão</span>
                        </label>
                        <div class="flex items-center gap-2">
                          <label class="text-[11px] font-semibold text-slate-600">Prazo (dias após matrícula):</label>
                          <input
                            type="number"
                            #editPrazoDiasInput
                            [value]="cursoAtivo()?.prazo_dias ?? 30"
                            min="1"
                            class="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Seção: Agenda Pública na Edição -->
                  <div class="sm:col-span-2 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-bold text-slate-800">Agenda Pública (Amorim Academy)</div>
                      <span class="text-[11px] text-slate-500">Exibição pública no site institucional</span>
                    </div>

                    <div class="space-y-3">
                      <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          #editExibirAgendaInput
                          [checked]="editExibirAgenda()"
                          (change)="editExibirAgenda.set(editExibirAgendaInput.checked)"
                          class="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span class="text-xs font-bold text-slate-700">Exibir na Agenda de Cursos do site</span>
                      </label>

                      <div [class.hidden]="!editExibirAgenda()" class="space-y-3 pt-2 border-t border-indigo-100/70">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div class="space-y-1.5 sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-700">Formato</label>
                            <select
                              #editFormatoInput
                              [value]="editFormato()"
                              (change)="editFormato.set($any(editFormatoInput.value))"
                              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="gravado">Gravado (EAD)</option>
                              <option value="ao_vivo">Remoto ao vivo</option>
                              <option value="presencial_hibrido">Presencial híbrido</option>
                            </select>
                          </div>

                          <div class="space-y-1.5">
                            <label class="block text-xs font-bold text-slate-700">Data de Início</label>
                            <input
                              type="date"
                              #editDataInicioInput
                              [value]="cursoAtivo()?.data_inicio || ''"
                              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div class="space-y-1.5">
                            <label class="block text-xs font-bold text-slate-700">Data de Fim</label>
                            <input
                              type="date"
                              #editDataFimInput
                              [value]="cursoAtivo()?.data_fim || ''"
                              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div [class.hidden]="editFormato() === 'gravado'" class="space-y-1.5 sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-700">Local</label>
                            <input
                              type="text"
                              #editLocalInput
                              [value]="cursoAtivo()?.local || ''"
                              placeholder="Ex: Recife/PE ou Online"
                              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div class="space-y-1.5 sm:col-span-2">
                            <label class="block text-xs font-bold text-slate-700">URL da imagem de capa do curso</label>
                            <input
                              type="url"
                              #editImagemCapaInput
                              [value]="cursoAtivo()?.imagem_capa_url || ''"
                              placeholder="https://exemplo.com/capa.jpg"
                              class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    [disabled]="salvando()"
                    (click)="salvarDadosGeraisCurso(
                      editTituloInput.value,
                      editDescricaoInput.value,
                      editCategoriaInput.value,
                      editVinculoInput.value,
                      editTemAvaliacaoModuloInput.checked,
                      +editNotaMinModuloInput.value,
                      editTemPrazoInput.checked,
                      +editPrazoDiasInput.value,
                      editExibirAgendaInput.checked,
                      $any(editFormatoInput.value),
                      editDataInicioInput.value,
                      editDataFimInput.value,
                      editLocalInput.value,
                      editImagemCapaInput.value,
                      +precoInput.value
                    )"
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

      <!-- ========================================================= -->
      <!-- MODAL 1: GESTÃO DE MATERIAIS DO MÓDULO                    -->
      <!-- ========================================================= -->
      @if (moduloMateriaisAtivo(); as modMat) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            <!-- Header -->
            <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    Aula {{ modMat.ordem }}
                  </span>
                  <h4 class="text-base font-bold text-slate-900">Materiais da Aula</h4>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ modMat.titulo }}</p>
              </div>
              <button
                type="button"
                (click)="fecharModalMateriaisModulo()"
                class="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Content -->
            <div class="p-5 sm:p-6 overflow-y-auto space-y-6">
              <!-- Abas de seleção: Biblioteca vs Upload Exclusivo -->
              <div class="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  (click)="abaMaterialModal.set('biblioteca')"
                  [class]="abaMaterialModal() === 'biblioteca'
                    ? 'flex-1 py-2 px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-xs cursor-pointer text-center transition-all'
                    : 'flex-1 py-2 px-3 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer text-center transition-all'"
                >
                  <span>📚 Vincular da Biblioteca</span>
                </button>
                <button
                  type="button"
                  (click)="abaMaterialModal.set('upload')"
                  [class]="abaMaterialModal() === 'upload'
                    ? 'flex-1 py-2 px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-xs cursor-pointer text-center transition-all'
                    : 'flex-1 py-2 px-3 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer text-center transition-all'"
                >
                  <span>☁️ Upload Exclusivo deste Módulo</span>
                </button>
              </div>

              <!-- OPÇÃO 1: Vincular novo material da biblioteca -->
              @if (abaMaterialModal() === 'biblioteca') {
                <div class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold text-slate-800">Vincular Material da Biblioteca Geral</h5>
                    <span class="text-[11px] text-slate-500">Materiais já cadastrados na plataforma</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div class="sm:col-span-2 space-y-1">
                      <label class="block text-[11px] font-bold text-slate-600">Selecione o Material</label>
                      <select
                        #novoMatSelect
                        class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Escolha um material da biblioteca --</option>
                        @for (m of todosMateriaisDisponiveis(); track m.id) {
                          <option [value]="m.id">
                            {{ m.titulo }} ({{ m.categoria || 'Geral' }}) - {{ m.formato || 'PDF' }}
                          </option>
                        }
                      </select>
                    </div>

                    <div class="flex items-center gap-3">
                      <label class="flex items-center gap-1.5 cursor-pointer select-none text-xs text-slate-700 font-semibold">
                        <input type="checkbox" #novoMatObrigatorioCheck class="w-4 h-4 text-indigo-600 rounded" />
                        <span>Obrigatório</span>
                      </label>

                      <button
                        type="button"
                        [disabled]="salvandoMaterialModulo() || !novoMatSelect.value"
                        (click)="vincularMaterialAoModulo(modMat.id, novoMatSelect.value, novoMatObrigatorioCheck.checked)"
                        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      >
                        @if (salvandoMaterialModulo()) {
                          <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        } @else {
                          <span>+ Vincular</span>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- OPÇÃO 2: Fazer Upload de Material Exclusivo deste Módulo -->
              @if (abaMaterialModal() === 'upload') {
                <div class="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h5 class="text-xs font-bold text-slate-900">Upload de Material Exclusivo deste Módulo</h5>
                      <p class="text-[11px] text-slate-500">Este arquivo ficará acessível apenas dentro desta aula e não aparecerá na biblioteca geral de materiais.</p>
                    </div>
                  </div>

                  @if (erroUploadMaterialExclusivo()) {
                    <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                      <span>{{ erroUploadMaterialExclusivo() }}</span>
                      <button type="button" (click)="erroUploadMaterialExclusivo.set(null)" class="text-rose-500 hover:text-rose-700 cursor-pointer">✕</button>
                    </div>
                  }

                  <!-- Seletor de Arquivo -->
                  <div class="space-y-1.5">
                    <label class="block text-[11px] font-bold text-slate-700">Arquivo do Material * (Qualquer formato até 20MB)</label>
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="file"
                        #fileInputExclusivo
                        (change)="onArquivoExclusivoSelecionado($event)"
                        class="hidden"
                      />
                      <button
                        type="button"
                        (click)="fileInputExclusivo.click()"
                        class="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{{ arquivoExclusivoSelecionado() ? 'Trocar Arquivo' : 'Selecionar Arquivo...' }}</span>
                      </button>

                      @if (arquivoExclusivoSelecionado(); as file) {
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-semibold border border-emerald-200 truncate">
                          <span class="truncate">{{ file.name }}</span>
                          <span class="text-[10px] text-emerald-700 shrink-0">({{ formatarTamanhoArquivoBytes(file.size) }})</span>
                        </div>
                      } @else {
                        <span class="text-xs text-slate-400 self-center">Nenhum arquivo selecionado</span>
                      }
                    </div>
                  </div>

                  <!-- Campos de Metadados -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1 sm:col-span-2">
                      <label class="block text-[11px] font-bold text-slate-700">Título do Material *</label>
                      <input
                        type="text"
                        [value]="tituloMaterialExclusivo()"
                        (input)="tituloMaterialExclusivo.set($any($event.target).value)"
                        placeholder="Ex: Checklist de Inspeção de Fachadas — Aula 01"
                        class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="block text-[11px] font-bold text-slate-700">Categoria</label>
                      <select
                        [value]="categoriaMaterialExclusivo()"
                        (change)="categoriaMaterialExclusivo.set($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Planilhas">Planilhas</option>
                        <option value="Modelos de Laudo">Modelos de Laudo</option>
                        <option value="Checklists">Checklists</option>
                        <option value="E-books">E-books</option>
                        <option value="Vídeos">Vídeos</option>
                        <option value="Skills Claude">Skills Claude</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div class="space-y-1">
                      <label class="block text-[11px] font-bold text-slate-700">Descrição Curta (Opcional)</label>
                      <input
                        type="text"
                        [value]="descricaoMaterialExclusivo()"
                        (input)="descricaoMaterialExclusivo.set($any($event.target).value)"
                        placeholder="Ex: Planilha de apoio para cálculo de manifestações patológicas..."
                        class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-emerald-100">
                    <label class="flex items-center gap-1.5 cursor-pointer select-none text-xs text-slate-700 font-semibold">
                      <input
                        type="checkbox"
                        [checked]="obrigatorioMaterialExclusivo()"
                        (change)="obrigatorioMaterialExclusivo.set($any($event.target).checked)"
                        class="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Material Obrigatório para Conclusão</span>
                    </label>

                    <button
                      type="button"
                      [disabled]="uploadandoMaterialExclusivo() || !arquivoExclusivoSelecionado()"
                      (click)="enviarMaterialExclusivoModulo(modMat.id)"
                      class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 shrink-0"
                    >
                      @if (uploadandoMaterialExclusivo()) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Enviando...</span>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Fazer Upload e Anexar</span>
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- Lista de Materiais Vinculados -->
              <div class="space-y-3">
                <h5 class="text-xs font-bold text-slate-800">
                  Materiais Anexados a esta Aula ({{ materiaisModulo().length }})
                </h5>

                @if (carregandoMateriaisModulo()) {
                  <div class="p-8 text-center space-y-2">
                    <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p class="text-xs text-slate-500">Carregando materiais vinculados...</p>
                  </div>
                } @else if (materiaisModulo().length === 0) {
                  <div class="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-xs">
                    Nenhum material complementar vinculado a esta aula. Selecione um material acima para vincular.
                  </div>
                } @else {
                  <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    @for (item of materiaisModulo(); track item.id || item.material_id) {
                      <div class="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div class="space-y-0.5 min-w-0">
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-900 text-xs truncate">
                              {{ item.material?.titulo || 'Material' }}
                            </span>
                            @if (item.obrigatorio) {
                              <span class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                                Obrigatório
                              </span>
                            } @else {
                              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                                Opcional
                              </span>
                            }
                          </div>
                          <div class="text-[11px] text-slate-400">
                            {{ item.material?.categoria || 'Sem categoria' }} • {{ item.material?.formato || 'PDF' }}
                          </div>
                        </div>

                        <button
                          type="button"
                          (click)="desvincularMaterialDoModulo(modMat.id, item.material_id || item.material?.id)"
                          class="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Desvincular
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                (click)="fecharModalMateriaisModulo()"
                class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ========================================================= -->
      <!-- MODAL 2: GESTÃO DE AVALIAÇÃO DO MÓDULO                    -->
      <!-- ========================================================= -->
      @if (moduloAvaliacaoAtivo(); as modAv) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            <!-- Header -->
            <div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    Quiz • Aula {{ modAv.ordem }}
                  </span>
                  <h4 class="text-base font-bold text-slate-900">Avaliação do Módulo</h4>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ modAv.titulo }}</p>
              </div>
              <button
                type="button"
                (click)="fecharModalAvaliacaoModulo()"
                class="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Content -->
            <div class="p-5 sm:p-6 overflow-y-auto space-y-6">
              <div class="flex items-center justify-between">
                <p class="text-xs text-slate-500">
                  Cadastre perguntas de múltipla escolha para validar o aprendizado do aluno antes de liberar o próximo módulo ou emitir o certificado.
                </p>
                <button
                  type="button"
                  (click)="adicionarNovaQuestao()"
                  class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                >
                  <span>+ Adicionar Questão</span>
                </button>
              </div>

              @if (carregandoQuestoesModulo()) {
                <div class="p-8 text-center space-y-2">
                  <div class="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p class="text-xs text-slate-500">Carregando questões cadastradas...</p>
                </div>
              } @else if (questoesModulo().length === 0) {
                <div class="p-8 text-center rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                  <div class="text-2xl">📝</div>
                  <div class="text-xs font-bold text-slate-800">Nenhuma questão cadastrada para esta aula</div>
                  <p class="text-xs text-slate-500 max-w-sm mx-auto">
                    Clique no botão "+ Adicionar Questão" acima para criar a primeira pergunta do quiz avaliativo.
                  </p>
                </div>
              } @else {
                <div class="space-y-5">
                  @for (q of questoesModulo(); track q.id || $index; let qIdx = $index) {
                    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 relative group">
                      <div class="flex items-center justify-between">
                        <span class="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black">
                          Questão {{ qIdx + 1 }}
                        </span>
                        <button
                          type="button"
                          (click)="removerQuestao(qIdx)"
                          class="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          Excluir Questão
                        </button>
                      </div>

                      <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-slate-700">Enunciado da Questão *</label>
                        <textarea
                          rows="2"
                          [value]="q.pergunta"
                          (input)="atualizarPerguntaQuestao(q, $event)"
                          placeholder="Ex: Conforme a NBR 16747, qual é o objetivo prioritário da inspeção predial?"
                          class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        ></textarea>
                      </div>

                      <!-- Alternativas A, B, C, D -->
                      <div class="space-y-2.5 pt-1">
                        <label class="block text-xs font-bold text-slate-700">Alternativas & Gabarito Correto</label>
                        
                        @for (letra of ['a', 'b', 'c', 'd']; track letra) {
                          <div class="flex items-center gap-2">
                            <label class="flex items-center gap-1.5 cursor-pointer shrink-0">
                              <input
                                type="radio"
                                [name]="'gabarito_' + qIdx"
                                [value]="letra.toUpperCase()"
                                [checked]="q.resposta_correta?.toUpperCase() === letra.toUpperCase()"
                                (change)="q.resposta_correta = letra.toUpperCase()"
                                class="w-4 h-4 text-emerald-600"
                              />
                              <span class="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center uppercase">
                                {{ letra }}
                              </span>
                            </label>
                            <input
                              type="text"
                              [value]="q.alternativas ? q.alternativas[letra] || '' : ''"
                              (input)="atualizarTextoAlternativa(q, letra, $event)"
                              [placeholder]="'Texto da alternativa ' + letra.toUpperCase()"
                              class="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                (click)="fecharModalAvaliacaoModulo()"
                class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                [disabled]="salvandoQuestoesModulo() || questoesModulo().length === 0"
                (click)="salvarQuestoesModulo(modAv.id)"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                @if (salvandoQuestoesModulo()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Salvando Questões...</span>
                } @else {
                  <span>💾 Salvar Questões da Avaliação</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminCursoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly certificadoPdfService = inject(CertificadoPdfService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly Math = Math;

  readonly cursos = signal<CursoAdmin[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly cursoSelecionadoId = signal<string | null>(null);
  readonly secaoAtiva = signal<'modulos' | 'certificado' | 'alunos' | 'dados'>('modulos');
  readonly criandoNovoCurso = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly gerandoPdfAlunoId = signal<string | null>(null);
  readonly gerandoPdfTeste = signal<boolean>(false);

  readonly cursoExcluirId = signal<string | null>(null);
  readonly moduloExcluirId = signal<string | null>(null);

  // Agenda Pública do Curso
  readonly novoExibirAgenda = signal<boolean>(false);
  readonly novoFormato = signal<'gravado' | 'ao_vivo' | 'presencial_hibrido'>('gravado');
  readonly editExibirAgenda = signal<boolean>(false);
  readonly editFormato = signal<'gravado' | 'ao_vivo' | 'presencial_hibrido'>('gravado');

  // Módulo form state
  readonly criandoModulo = signal<boolean>(false);
  readonly editandoModuloId = signal<string | null>(null);
  moduloFormDados = {
    titulo: '',
    descricao: '',
    duracao: '',
    vimeo_id: '',
    youtube_id: '',
    ordem: 1,
    exige_avaliacao: false,
    trava_proximo_modulo: true,
  };

  // Materiais do Módulo
  readonly moduloMateriaisAtivo = signal<ModuloCursoAdmin | null>(null);
  readonly materiaisModulo = signal<any[]>([]);
  readonly todosMateriaisDisponiveis = signal<any[]>([]);
  readonly carregandoMateriaisModulo = signal<boolean>(false);
  readonly salvandoMaterialModulo = signal<boolean>(false);
  readonly abaMaterialModal = signal<'biblioteca' | 'upload'>('biblioteca');
  readonly uploadandoMaterialExclusivo = signal<boolean>(false);
  readonly arquivoExclusivoSelecionado = signal<File | null>(null);
  readonly tituloMaterialExclusivo = signal<string>('');
  readonly categoriaMaterialExclusivo = signal<string>('Outros');
  readonly descricaoMaterialExclusivo = signal<string>('');
  readonly obrigatorioMaterialExclusivo = signal<boolean>(false);
  readonly erroUploadMaterialExclusivo = signal<string | null>(null);

  // Avaliação do Módulo (Quiz)
  readonly moduloAvaliacaoAtivo = signal<ModuloCursoAdmin | null>(null);
  readonly questoesModulo = signal<any[]>([]);
  readonly carregandoQuestoesModulo = signal<boolean>(false);
  readonly salvandoQuestoesModulo = signal<boolean>(false);

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
    this.novoExibirAgenda.set(false);
    this.novoFormato.set('gravado');
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
    textoNormativo: string,
    cargaHoraria: string,
    temAvaliacaoModulo: boolean = false,
    notaMinModulo: number = 70,
    temPrazo: boolean = false,
    prazoDias: number = 30,
    exibirNaAgenda: boolean = false,
    formato: 'gravado' | 'ao_vivo' | 'presencial_hibrido' = 'gravado',
    dataInicio?: string | null,
    dataFim?: string | null,
    local?: string | null,
    imagemCapaUrl?: string | null
  ): Promise<void> {
    if (!titulo.trim()) {
      this.exibirErro('Por favor, informe o título do curso.');
      return;
    }

    this.salvando.set(true);
    try {
      const vinculoVal = vinculo?.trim() ? vinculo.trim() : null;
      const res = await this.supabaseService.criarCurso({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        categoria: categoria.trim() || undefined,
        modulo_predial_vinculado: vinculoVal,
        texto_certificado: textoNormativo.trim() || undefined,
        carga_horaria_certificado: cargaHoraria.trim() || undefined,
        tem_avaliacao_por_modulo: temAvaliacaoModulo,
        nota_minima_avaliacao_modulo: notaMinModulo,
        tem_prazo: temPrazo,
        prazo_dias: temPrazo ? prazoDias : undefined,
        exibir_na_agenda: exibirNaAgenda,
        formato: exibirNaAgenda ? formato : null,
        data_inicio: (exibirNaAgenda && dataInicio?.trim()) ? dataInicio.trim() : null,
        data_fim: (exibirNaAgenda && dataFim?.trim()) ? dataFim.trim() : null,
        local: (exibirNaAgenda && formato !== 'gravado' && local?.trim()) ? local.trim() : null,
        imagem_capa_url: (exibirNaAgenda && imagemCapaUrl?.trim()) ? imagemCapaUrl.trim() : null,
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
    const curso = this.cursos().find(c => c.id === id);
    if (curso) {
      this.editExibirAgenda.set(curso.exibir_na_agenda ?? false);
      this.editFormato.set(curso.formato || 'gravado');
    }
  }

  voltarParaListaCursos(): void {
    this.cursoSelecionadoId.set(null);
    this.cancelarFormularioModulo();
  }

  setSecaoAtiva(secao: 'modulos' | 'certificado' | 'alunos' | 'dados'): void {
    this.secaoAtiva.set(secao);
    if (secao === 'dados') {
      const c = this.cursoAtivo();
      if (c) {
        this.editExibirAgenda.set(c.exibir_na_agenda ?? false);
        this.editFormato.set(c.formato || 'gravado');
      }
    }
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
      youtube_id: '',
      ordem: totalExistentes + 1,
      exige_avaliacao: false,
      trava_proximo_modulo: true,
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
      youtube_id: modulo.youtube_id || '',
      ordem: modulo.ordem,
      exige_avaliacao: modulo.exige_avaliacao ?? false,
      trava_proximo_modulo: modulo.trava_proximo_modulo ?? true,
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

  getYoutubeUrl(youtubeId?: string | null): SafeResourceUrl | null {
    const url = montarUrlPlayerYoutube(youtubeId);
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

    let youtubeIdFinal: string | null = null;
    if (this.moduloFormDados.youtube_id && this.moduloFormDados.youtube_id.trim()) {
      youtubeIdFinal = extrairYoutubeId(this.moduloFormDados.youtube_id);
      if (!youtubeIdFinal) {
        this.exibirErro('Não foi possível identificar o ID do vídeo do YouTube. Cole o link completo (ex: https://youtu.be/BPwaRKHKLeA) ou apenas o ID.');
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
          youtube_id: youtubeIdFinal || '',
          ordem: this.moduloFormDados.ordem || 1,
          exige_avaliacao: this.moduloFormDados.exige_avaliacao,
          trava_proximo_modulo: this.moduloFormDados.trava_proximo_modulo,
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
          youtube_id: youtubeIdFinal || undefined,
          ordem: this.moduloFormDados.ordem || 1,
          exige_avaliacao: this.moduloFormDados.exige_avaliacao,
          trava_proximo_modulo: this.moduloFormDados.trava_proximo_modulo,
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
  // GESTÃO DE MATERIAIS DO MÓDULO
  // ==========================================

  async abrirModalMateriaisModulo(modulo: ModuloCursoAdmin): Promise<void> {
    this.moduloMateriaisAtivo.set(modulo);
    this.carregandoMateriaisModulo.set(true);
    try {
      const [vinculados, biblioteca] = await Promise.all([
        this.supabaseService.listarMateriaisDoModulo(modulo.id),
        this.supabaseService.listarMateriais()
      ]);
      this.materiaisModulo.set(vinculados);
      this.todosMateriaisDisponiveis.set(biblioteca);
    } catch (e: any) {
      this.exibirErro('Erro ao carregar materiais da aula: ' + (e?.message || e));
    } finally {
      this.carregandoMateriaisModulo.set(false);
    }
  }

  fecharModalMateriaisModulo(): void {
    this.moduloMateriaisAtivo.set(null);
    this.materiaisModulo.set([]);
    this.limparFormMaterialExclusivo();
    this.abaMaterialModal.set('biblioteca');
  }

  limparFormMaterialExclusivo(): void {
    this.arquivoExclusivoSelecionado.set(null);
    this.tituloMaterialExclusivo.set('');
    this.categoriaMaterialExclusivo.set('Outros');
    this.descricaoMaterialExclusivo.set('');
    this.obrigatorioMaterialExclusivo.set(false);
    this.erroUploadMaterialExclusivo.set(null);
  }

  onArquivoExclusivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.arquivoExclusivoSelecionado.set(file);
    this.erroUploadMaterialExclusivo.set(null);

    // Sugere título limpo caso o campo esteja vazio
    if (!this.tituloMaterialExclusivo().trim()) {
      const nomeSemExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      this.tituloMaterialExclusivo.set(nomeSemExt.charAt(0).toUpperCase() + nomeSemExt.slice(1));
    }
  }

  formatarTamanhoArquivoBytes(bytes?: number): string {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return Math.round(bytes / 1024) + ' KB';
  }

  async enviarMaterialExclusivoModulo(moduloId: string): Promise<void> {
    const file = this.arquivoExclusivoSelecionado();
    if (!file) {
      this.erroUploadMaterialExclusivo.set('Selecione um arquivo para upload.');
      return;
    }

    const titulo = this.tituloMaterialExclusivo().trim() || file.name;
    this.uploadandoMaterialExclusivo.set(true);
    this.erroUploadMaterialExclusivo.set(null);

    try {
      const categoria = this.categoriaMaterialExclusivo().trim() || 'Outros';
      const uploadRes = await this.supabaseService.uploadArquivoMaterial(file, categoria);
      if (uploadRes.error) {
        this.erroUploadMaterialExclusivo.set(uploadRes.error.message || 'Falha no upload do arquivo.');
        return;
      }

      const { error: errCriar, data: novoMaterial } = await this.supabaseService.criarMaterial({
        titulo,
        descricao: this.descricaoMaterialExclusivo().trim() || undefined,
        categoria,
        formato: uploadRes.formato || 'ARQUIVO',
        tamanho: uploadRes.tamanho || 'Arquivo',
        tipo_arquivo_real: uploadRes.tipoArquivoReal || null,
        url_arquivo: uploadRes.signedUrl || '',
        ativo: true,
        exclusivo_curso: true,
      });

      if (errCriar || !novoMaterial?.id) {
        this.erroUploadMaterialExclusivo.set(errCriar?.message || 'Falha ao cadastrar registro do material.');
        return;
      }

      const resVinc = await this.supabaseService.vincularMaterialAoModulo(
        moduloId,
        novoMaterial.id,
        this.obrigatorioMaterialExclusivo()
      );

      if (resVinc.error) {
        this.erroUploadMaterialExclusivo.set(resVinc.error.message || 'Falha ao vincular material à aula.');
        return;
      }

      this.exibirSucesso(`Material exclusivo "${titulo}" anexado com sucesso!`);
      this.limparFormMaterialExclusivo();
      const vinculados = await this.supabaseService.listarMateriaisDoModulo(moduloId);
      this.materiaisModulo.set(vinculados);
      await this.carregarCursos();
    } catch (e: any) {
      this.erroUploadMaterialExclusivo.set(e?.message || 'Erro inesperado ao processar upload.');
    } finally {
      this.uploadandoMaterialExclusivo.set(false);
    }
  }

  async vincularMaterialAoModulo(moduloId: string, materialId: string, obrigatorio: boolean): Promise<void> {
    if (!materialId) return;
    this.salvandoMaterialModulo.set(true);
    try {
      const res = await this.supabaseService.vincularMaterialAoModulo(moduloId, materialId, obrigatorio);
      if (res.error) {
        this.exibirErro('Erro ao vincular material: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Material vinculado à aula com sucesso!');
      const vinculados = await this.supabaseService.listarMateriaisDoModulo(moduloId);
      this.materiaisModulo.set(vinculados);
    } catch (e: any) {
      this.exibirErro('Erro ao vincular material: ' + (e?.message || e));
    } finally {
      this.salvandoMaterialModulo.set(false);
    }
  }

  async desvincularMaterialDoModulo(moduloId: string, materialId: string): Promise<void> {
    if (!materialId) return;
    try {
      const res = await this.supabaseService.desvincularMaterialDoModulo(moduloId, materialId);
      if (res.error) {
        this.exibirErro('Erro ao desvincular material: ' + res.error.message);
        return;
      }
      this.exibirSucesso('Material desvinculado com sucesso.');
      const vinculados = await this.supabaseService.listarMateriaisDoModulo(moduloId);
      this.materiaisModulo.set(vinculados);
    } catch (e: any) {
      this.exibirErro('Erro ao desvincular material: ' + (e?.message || e));
    }
  }

  // ==========================================
  // GESTÃO DE AVALIAÇÕES / QUIZ DO MÓDULO
  // ==========================================

  async abrirModalAvaliacaoModulo(modulo: ModuloCursoAdmin): Promise<void> {
    this.moduloAvaliacaoAtivo.set(modulo);
    this.carregandoQuestoesModulo.set(true);
    try {
      const questoes = await this.supabaseService.listarAvaliacoesDoModulo(modulo.id);
      this.questoesModulo.set(questoes && questoes.length > 0 ? JSON.parse(JSON.stringify(questoes)) : []);
    } catch (e: any) {
      this.exibirErro('Erro ao carregar questões da aula: ' + (e?.message || e));
      this.questoesModulo.set([]);
    } finally {
      this.carregandoQuestoesModulo.set(false);
    }
  }

  fecharModalAvaliacaoModulo(): void {
    this.moduloAvaliacaoAtivo.set(null);
    this.questoesModulo.set([]);
  }

  adicionarNovaQuestao(): void {
    const total = this.questoesModulo().length;
    const nova = {
      modulo_id: this.moduloAvaliacaoAtivo()?.id,
      pergunta: '',
      alternativas: { a: '', b: '', c: '', d: '' },
      resposta_correta: 'A',
      ordem: total + 1
    };
    this.questoesModulo.update(list => [...list, nova]);
  }

  removerQuestao(index: number): void {
    this.questoesModulo.update(list => list.filter((_, i) => i !== index));
  }

  atualizarPerguntaQuestao(q: any, event: Event): void {
    q.pergunta = (event.target as HTMLTextAreaElement).value;
  }

  atualizarTextoAlternativa(q: any, letra: string, event: Event): void {
    if (!q.alternativas) {
      q.alternativas = {};
    }
    q.alternativas[letra] = (event.target as HTMLInputElement).value;
  }

  async salvarQuestoesModulo(moduloId: string): Promise<void> {
    const questoes = this.questoesModulo();
    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      if (!q.pergunta || !q.pergunta.trim()) {
        this.exibirErro(`Por favor, preencha o enunciado da Questão ${i + 1}.`);
        return;
      }
      if (!q.resposta_correta) {
        this.exibirErro(`Por favor, defina o gabarito correto da Questão ${i + 1}.`);
        return;
      }
    }

    this.salvandoQuestoesModulo.set(true);
    try {
      const res = await this.supabaseService.salvarQuestoesAvaliacaoModulo(
        moduloId,
        questoes.map((q, idx) => ({
          modulo_id: moduloId,
          pergunta: q.pergunta.trim(),
          alternativas: q.alternativas || {},
          resposta_correta: q.resposta_correta.toUpperCase(),
          ordem: idx + 1
        }))
      );

      if (res.error) {
        this.exibirErro('Erro ao salvar questões: ' + res.error.message);
        return;
      }

      this.exibirSucesso('Questões da avaliação salvas com sucesso!');
      this.fecharModalAvaliacaoModulo();
      await this.carregarCursos();
    } catch (e: any) {
      this.exibirErro('Erro ao salvar avaliação: ' + (e?.message || e));
    } finally {
      this.salvandoQuestoesModulo.set(false);
    }
  }

  // ==========================================
  // CONFIGURAÇÃO DO CERTIFICADO & DADOS GERAIS
  // ==========================================

  formatarPreviaTexto(textoNormativo?: string | null, cargaHoraria?: string | null): string {
    const ch = cargaHoraria?.trim() || '40 (quarenta) horas';
    const norm = textoNormativo?.trim() || 'em conformidade com as diretrizes da ABNT NBR 16747:2020 e IBAPE-SP';
    return `com carga horária total de ${ch}, ${norm}, cumprindo integralmente o conteúdo programático e obtendo aprovação nas avaliações de proficiência técnica dos módulos.`;
  }

  async salvarConfiguracaoCertificado(
    textoNormativo: string,
    cargaHoraria: string,
    instrutorNome: string = '',
    instrutorQualificacao: string = ''
  ): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    this.salvando.set(true);
    try {
      const res = await this.supabaseService.atualizarCurso(cId, {
        texto_certificado: textoNormativo.trim() || null,
        carga_horaria_certificado: cargaHoraria.trim() || null,
        instrutor_nome: instrutorNome.trim() || null,
        instrutor_qualificacao: instrutorQualificacao.trim() || null,
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

  async baixarCertificadoTeste(
    textoNormativo: string,
    cargaHoraria: string,
    instrutorNome: string = '',
    instrutorQualificacao: string = ''
  ): Promise<void> {
    const curso = this.cursoAtivo();
    if (!curso) return;

    this.gerandoPdfTeste.set(true);
    try {
      const res = await this.certificadoPdfService.gerarEBaixarCertificadoPDF({
        nomeAluno: 'NOME DO ALUNO (MODELO DE TESTE)',
        tituloCurso: curso.titulo,
        textoNormativo: textoNormativo.trim() || undefined,
        cargaHoraria: cargaHoraria.trim() || undefined,
        dataEmissaoIso: new Date().toISOString(),
        codigoVerificacao: 'AMTECH-TESTE01',
        instrutorNome: instrutorNome.trim() || undefined,
        instrutorQualificacao: instrutorQualificacao.trim() || undefined,
      });

      if (res.sucesso) {
        this.exibirSucesso('PDF de teste do certificado gerado com sucesso!');
      } else {
        this.exibirErro(res.mensagemErro || 'Erro ao gerar PDF de teste.');
      }
    } catch (e: any) {
      this.exibirErro('Erro ao gerar PDF de teste: ' + (e?.message || e));
    } finally {
      this.gerandoPdfTeste.set(false);
    }
  }

  async salvarTextoCertificado(texto: string): Promise<void> {
    await this.salvarConfiguracaoCertificado(
      texto,
      this.cursoAtivo()?.carga_horaria_certificado || '',
      this.cursoAtivo()?.instrutor_nome || '',
      this.cursoAtivo()?.instrutor_qualificacao || ''
    );
  }

  async baixarCertificadoAluno(matricula: any): Promise<void> {
    const curso = this.cursoAtivo();
    if (!curso) {
      this.exibirErro('Nenhum curso ativo selecionado.');
      return;
    }

    const alunoNome = matricula.aluno?.full_name?.trim() || 'Membro da Comunidade';
    const matriculaId = matricula.id;

    this.gerandoPdfAlunoId.set(matriculaId || 'temp');
    try {
      // Garante que a matrícula possui um código de verificação persistido
      let codigoVerificacao = matricula.codigo_verificacao;
      if (!codigoVerificacao && matriculaId) {
        codigoVerificacao = await this.supabaseService.garantirCodigoVerificacaoMatricula(matriculaId);
      }

      const res = await this.certificadoPdfService.gerarEBaixarCertificadoPDF({
        nomeAluno: alunoNome,
        tituloCurso: curso.titulo,
        textoNormativo: curso.texto_certificado || undefined,
        cargaHoraria: curso.carga_horaria_certificado || undefined,
        dataEmissaoIso: matricula.certificado_emitido_em || matricula.atualizado_em || matricula.criado_em,
        codigoVerificacao: codigoVerificacao || undefined,
        instrutorNome: curso.instrutor_nome || undefined,
        instrutorQualificacao: curso.instrutor_qualificacao || undefined,
      });

      if (res.sucesso) {
        this.exibirSucesso(`Certificado de ${alunoNome} gerado com sucesso!`);
      } else {
        this.exibirErro(res.mensagemErro || 'Erro ao gerar arquivo PDF.');
      }
    } catch (e: any) {
      this.exibirErro('Erro inesperado ao gerar PDF: ' + (e?.message || e));
    } finally {
      this.gerandoPdfAlunoId.set(null);
    }
  }

  async salvarDadosGeraisCurso(
    titulo: string,
    descricao: string,
    categoria: string,
    vinculo: string,
    temAvaliacaoModulo: boolean = false,
    notaMinModulo: number = 70,
    temPrazo: boolean = false,
    prazoDias: number = 30,
    exibirNaAgenda: boolean = false,
    formato: 'gravado' | 'ao_vivo' | 'presencial_hibrido' = 'gravado',
    dataInicio?: string | null,
    dataFim?: string | null,
    local?: string | null,
    imagemCapaUrl?: string | null,
    preco?: number | null
  ): Promise<void> {
    const cId = this.cursoSelecionadoId();
    if (!cId) return;

    if (!titulo.trim()) {
      this.exibirErro('Por favor, informe o título do curso.');
      return;
    }

    this.salvando.set(true);
    try {
      const vinculoVal = vinculo?.trim() ? vinculo.trim() : null;
      const res = await this.supabaseService.atualizarCurso(cId, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria: categoria.trim() || null,
        modulo_predial_vinculado: vinculoVal,
        tem_avaliacao_por_modulo: temAvaliacaoModulo,
        nota_minima_avaliacao_modulo: notaMinModulo,
        tem_prazo: temPrazo,
        prazo_dias: temPrazo ? prazoDias : null,
        exibir_na_agenda: exibirNaAgenda,
        formato: exibirNaAgenda ? formato : null,
        data_inicio: (exibirNaAgenda && dataInicio?.trim()) ? dataInicio.trim() : null,
        data_fim: (exibirNaAgenda && dataFim?.trim()) ? dataFim.trim() : null,
        local: (exibirNaAgenda && formato !== 'gravado' && local?.trim()) ? local.trim() : null,
        imagem_capa_url: (exibirNaAgenda && imagemCapaUrl?.trim()) ? imagemCapaUrl.trim() : null,
        preco: (preco !== undefined && preco !== null && !isNaN(preco) && preco > 0) ? preco : null,
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
