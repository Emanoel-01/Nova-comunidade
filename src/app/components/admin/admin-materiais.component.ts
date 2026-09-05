import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { extrairVimeoId, montarUrlPlayerVimeo } from '../../utils/vimeo.util';
import { extrairYoutubeId, montarUrlPlayerYoutube } from '../../utils/youtube.util';

export type CategoriaMaterialAdmin =
  | 'Planilhas'
  | 'Modelos de Laudo'
  | 'Checklists'
  | 'E-books'
  | 'Vídeos'
  | 'Skills Claude'
  | 'Outros';

export interface MaterialAnexo {
  id?: string;
  material_id?: string;
  nome_arquivo: string;
  url_arquivo: string;
  storage_path?: string | null;
  formato?: string;
  tamanho?: string;
  ordem: number;
  criado_em?: string;
}

interface MaterialAdminItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: string;
  formato?: string;
  tamanho?: string;
  url_arquivo?: string;
  storage_path?: string | null;
  plataforma_video?: 'vimeo' | 'youtube' | null;
  ativo: boolean;
  pago?: boolean;
  exibir_valor?: boolean;
  valor?: number | null;
  sku?: string | null;
  tipo_arquivo_real?: string | null;
  criado_em?: string;
  downloads_count?: number;
}

@Component({
  selector: 'app-admin-materiais',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Gestão do Acervo de Materiais & Downloads
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Cadastre novos arquivos técnicos, configure venda avulsa, edite recursos e controle disponibilidade.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            (click)="carregarMateriais()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar lista"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            (click)="abrirModalNovo()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Novo Material</span>
          </button>
        </div>
      </div>

      <!-- Alertas de Feedback -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-emerald-950">Sucesso!</p>
              <p class="text-emerald-800 leading-relaxed">{{ mensagemSucesso() }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-rose-800 leading-relaxed">{{ mensagemErro() }}</p>
          </div>
          <button
            type="button"
            (click)="mensagemErro.set(null)"
            class="text-rose-600 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100/50 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      }

      <!-- Barra de Filtros e Busca -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <!-- Filtro de Status -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            type="button"
            (click)="filtroStatus.set('todos')"
            [class]="filtroStatus() === 'todos'
              ? 'px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Todos ({{ materiais().length }})
          </button>
          <button
            type="button"
            (click)="filtroStatus.set('ativos')"
            [class]="filtroStatus() === 'ativos'
              ? 'px-3 py-1.5 rounded-lg bg-white text-emerald-700 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Ativos ({{ totalAtivos() }})
          </button>
          <button
            type="button"
            (click)="filtroStatus.set('inativos')"
            [class]="filtroStatus() === 'inativos'
              ? 'px-3 py-1.5 rounded-lg bg-white text-slate-700 font-bold text-xs shadow-xs transition-all'
              : 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold text-xs transition-all'"
          >
            Inativos ({{ totalInativos() }})
          </button>
        </div>

        <!-- Filtro por Categoria + Busca -->
        <div class="flex items-center gap-2 flex-wrap">
          <select
            [value]="filtroCategoria()"
            (change)="onCategoriaFilterChange($event)"
            class="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todas">Todas as categorias</option>
            @for (cat of categoriasDisponiveis; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>

          <div class="relative min-w-[200px]">
            <input
              type="text"
              [value]="termoBusca()"
              (input)="onBuscaInput($event)"
              placeholder="Buscar por título, SKU ou descrição..."
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Tabela / Lista de Materiais -->
      @if (carregando()) {
        <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div class="inline-flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <svg class="w-4 h-4 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Carregando materiais do Supabase...</span>
          </div>
        </div>
      } @else if (materiaisFiltrados().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-900">Nenhum material encontrado</p>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Não há materiais correspondentes aos filtros selecionados. Clique em "Novo Material" para cadastrar o primeiro recurso.
          </p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th class="py-3.5 px-4">Material / Recurso</th>
                  <th class="py-3.5 px-4">Categoria</th>
                  <th class="py-3.5 px-4">Formato / Tipo</th>
                  <th class="py-3.5 px-4">Acesso / Valor</th>
                  <th class="py-3.5 px-4 text-center">Downloads</th>
                  <th class="py-3.5 px-4 text-center">Status</th>
                  <th class="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (item of materiaisFiltrados(); track item.id) {
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    
                    <!-- Coluna 1: Título & Descrição -->
                    <td class="py-4 px-4 max-w-md">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-bold text-slate-900 text-sm">
                            {{ item.titulo }}
                          </span>
                          @if (item.sku) {
                            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              SKU: {{ item.sku }}
                            </span>
                          }
                        </div>
                        @if (item.descricao) {
                          <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                            {{ item.descricao }}
                          </p>
                        }
                        @if (item.categoria === 'Vídeos') {
                          @if (item.url_arquivo) {
                            <a
                              [href]="item.url_arquivo"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors pt-0.5"
                            >
                              @if (item.plataforma_video === 'youtube') {
                                <svg class="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <span>Vídeo YouTube</span>
                              } @else {
                                <svg class="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                                </svg>
                                <span>Vídeo Vimeo</span>
                              }
                            </a>
                          } @else {
                            <span class="text-[11px] text-amber-600 font-medium">⚠️ Sem link do vídeo</span>
                          }
                        } @else if (item.url_arquivo) {
                          <a
                            [href]="item.url_arquivo"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors pt-0.5"
                          >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Link do arquivo</span>
                          </a>
                        } @else {
                          <span class="text-[11px] text-amber-600 font-medium">⚠️ Sem URL direta</span>
                        }
                      </div>
                    </td>

                    <!-- Coluna 2: Categoria -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <span
                        [class]="getBadgeEstilo(item.categoria)"
                        class="px-2.5 py-1 rounded-full font-bold text-[11px] border inline-block"
                      >
                        {{ item.categoria }}
                      </span>
                    </td>

                    <!-- Coluna 3: Formato e Tamanho -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="space-y-0.5">
                        <div class="font-bold text-slate-800 uppercase text-xs flex items-center gap-1">
                          <span>{{ item.tipo_arquivo_real || item.formato || 'PDF' }}</span>
                        </div>
                        <div class="text-slate-400 text-[11px]">
                          {{ item.tamanho || '—' }}
                        </div>
                      </div>
                    </td>

                    <!-- Coluna 4: Acesso / Valor -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      @if (item.pago) {
                        <div class="space-y-1">
                          <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] inline-flex items-center gap-1">
                            <span>💳</span>
                            <span>{{ formatarPreco(item.valor) }}</span>
                          </span>
                          @if (item.exibir_valor === false) {
                            <div class="text-[10px] text-slate-400">Oculto sem acesso</div>
                          }
                        </div>
                      } @else {
                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[11px]">
                          Incluso no Módulo
                        </span>
                      }
                    </td>

                    <!-- Coluna 5: Downloads -->
                    <td class="py-4 px-4 text-center whitespace-nowrap">
                      <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{{ item.downloads_count ?? 0 }}</span>
                      </div>
                    </td>

                    <!-- Coluna 6: Status (Toggle Ativo/Inativo) -->
                    <td class="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        (click)="alternarStatusMaterial(item)"
                        [disabled]="processandoStatus() === item.id"
                        [class]="item.ativo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'"
                        class="px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        title="Clique para alternar status"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="item.ativo" [class.bg-slate-400]="!item.ativo"></span>
                        <span>{{ item.ativo ? 'Ativo' : 'Inativo' }}</span>
                      </button>
                    </td>

                    <!-- Coluna 7: Ações (Editar / Excluir com 2 cliques) -->
                    <td class="py-4 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        
                        <!-- Botão Editar -->
                        <button
                          type="button"
                          (click)="abrirModalEdicao(item)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Editar Material"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <!-- Botão Excluir (Padrão 2 cliques) -->
                        @if (confirmarExclusaoId() === item.id) {
                          <div class="inline-flex items-center gap-1 animate-fadeIn">
                            <button
                              type="button"
                              (click)="executarExclusao(item.id)"
                              [disabled]="processandoExclusao() === item.id"
                              class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              @if (processandoExclusao() === item.id) {
                                <span>...</span>
                              } @else {
                                <span>Confirmar?</span>
                              }
                            </button>
                            <button
                              type="button"
                              (click)="confirmarExclusaoId.set(null)"
                              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          </div>
                        } @else {
                          <button
                            type="button"
                            (click)="confirmarExclusaoId.set(item.id)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir Material"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }

                      </div>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL DE CADASTRO / EDIÇÃO DE MATERIAL -->
      @if (modalAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <!-- Topo do Modal -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="space-y-1">
                <h4 class="text-lg sm:text-xl font-black text-slate-900">
                  {{ materialEmEdicao() ? 'Editar Material' : 'Cadastrar Novo Material' }}
                </h4>
                <p class="text-xs text-slate-500">
                  Preencha os dados técnicos do arquivo para disponibilizar aos membros.
                </p>
              </div>
              <button
                type="button"
                (click)="fecharModal()"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Formulário -->
            <form (submit)="salvarMaterial($event)" class="space-y-4">
              
              <!-- Título -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  Título do Material <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="formTitulo()"
                  (input)="formTitulo.set($any($event.target).value)"
                  placeholder="Ex: Planilha Automatizada de Laudo Cautelar de Vizinhança"
                  required
                  class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <!-- Categoria & Formato -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Categoria <span class="text-rose-500">*</span>
                  </label>
                  <select
                    [value]="formCategoria()"
                    (change)="onFormCategoriaChange($any($event.target).value)"
                    required
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    @for (cat of categoriasDisponiveis; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Formato / Extensão Real
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [value]="formFormato()"
                      (input)="formFormato.set($any($event.target).value)"
                      [placeholder]="formCategoria() === 'Vídeos' ? 'Ex: VÍDEO' : 'Ex: XLSX, PDF'"
                      class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium uppercase"
                    />
                    <input
                      type="text"
                      [value]="formTipoArquivoReal()"
                      (input)="formTipoArquivoReal.set($any($event.target).value)"
                      placeholder="ext (ex: pdf)"
                      class="w-24 px-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700 lowercase"
                      title="Extensão real do arquivo (ex: pdf, xlsx, docx, png)"
                    />
                  </div>
                </div>
              </div>

              <!-- Configuração de Material Pago / Venda Avulsa -->
              <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3.5">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="formPago()"
                      (change)="formPago.set($any($event.target).checked)"
                      class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <span class="text-xs font-bold text-slate-800 block">Material Vendável / Avulso</span>
                      <span class="text-[11px] text-slate-500 block">Permite liberar acesso individual via acessos_item ou compra</span>
                    </div>
                  </label>
                </div>

                @if (formPago()) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-indigo-100/80 animate-fadeIn">
                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [value]="formValor()"
                        (input)="onValorInput($event)"
                        placeholder="Ex: 49.90"
                        class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      />
                    </div>

                    <div class="space-y-1">
                      <label class="block text-xs font-bold text-slate-700">
                        Código SKU (Identificador)
                      </label>
                      <input
                        type="text"
                        [value]="formSku()"
                        (input)="formSku.set($any($event.target).value)"
                        placeholder="Ex: MAT-LAUDO-01"
                        class="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div class="sm:col-span-2 pt-1">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          [checked]="formExibirValor()"
                          (change)="formExibirValor.set($any($event.target).checked)"
                          class="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="text-xs font-medium text-slate-700">
                          Exibir valor e botão de aquisição para membros sem acesso (se desmarcado, fica oculto para quem não comprou)
                        </span>
                      </label>
                    </div>
                  </div>
                }
              </div>

              <!-- Tamanho & Status -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    {{ formCategoria() === 'Vídeos' ? 'Duração / Resolução' : 'Tamanho Estimado' }}
                  </label>
                  <input
                    type="text"
                    [value]="formTamanho()"
                    (input)="formTamanho.set($any($event.target).value)"
                    [placeholder]="formCategoria() === 'Vídeos' ? 'Ex: 15 min, 1080p' : 'Ex: 3.2 MB, 850 KB'"
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Status de Publicação
                  </label>
                  <label class="flex items-center gap-2.5 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="formAtivo()"
                      (change)="formAtivo.set($any($event.target).checked)"
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-xs font-bold text-slate-700">Material Ativo (Visível aos membros)</span>
                  </label>
                </div>
              </div>

              <!-- URL do Arquivo ou ID do Vídeo (Vimeo / YouTube) -->
              <div class="space-y-2">
                @if (formCategoria() === 'Vídeos') {
                  <!-- Seletor de Plataforma de Vídeo por Botões -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">
                      Plataforma de Transmissão <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="onTrocarPlataformaVideo('vimeo')"
                        [class]="formPlataformaVideo() === 'vimeo'
                          ? 'px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5'
                          : 'px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5'"
                      >
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.84 6.8c-.14 3.08-2.28 7.3-6.42 12.67-4.28 5.58-7.9 8.37-10.86 8.37-1.84 0-3.4-.68-4.68-2.04C-.4 24.44-.9 22.36.88 19.56c1.18-1.84 2.83-3.66 4.95-5.46.22 1.62.62 3.12 1.2 4.5.76 1.76 1.7 2.64 2.82 2.64 1.26 0 2.84-1.28 4.74-3.84 1.9-2.56 2.85-4.5 2.85-5.82 0-1.54-.72-2.31-2.16-2.31-.7 0-1.48.17-2.34.51.52-1.72 1.48-3.08 2.88-4.08 1.4-1 2.94-1.5 4.62-1.5 1.76 0 3.09.58 3.99 1.74.9 1.16 1.35 2.63 1.35 4.41z"/>
                        </svg>
                        <span>Vimeo</span>
                      </button>
                      <button
                        type="button"
                        (click)="onTrocarPlataformaVideo('youtube')"
                        [class]="formPlataformaVideo() === 'youtube'
                          ? 'px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5'
                          : 'px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5'"
                      >
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>YouTube</span>
                      </button>
                    </div>
                  </div>

                  <label class="block text-xs font-bold text-slate-700">
                    ID ou Link do Vídeo no {{ formPlataformaVideo() === 'youtube' ? 'YouTube' : 'Vimeo' }} <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    [value]="formUrlArquivo()"
                    (input)="formUrlArquivo.set($any($event.target).value)"
                    [placeholder]="formPlataformaVideo() === 'youtube' ? 'Ex: dQw4w9WgXcQ ou https://youtube.com/watch?v=...' : 'Ex: 892019283 ou https://vimeo.com/892019283'"
                    required
                    class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-mono text-slate-800"
                  />
                  <p class="text-[11px] text-slate-400">
                    {{ formPlataformaVideo() === 'youtube' ? 'Cole o link do YouTube (watch, youtu.be, shorts ou embed) ou o ID de 11 caracteres.' : 'Cole o ID numérico ou o link direto do Vimeo. O player será incorporado no card do material.' }}
                  </p>

                  <!-- Prévia ao vivo do player de vídeo -->
                  @if (formUrlArquivo().trim()) {
                    @let videoPreviewUrl = getVideoPreviewUrl(formUrlArquivo());
                    <div class="space-y-1.5 pt-1">
                      <label class="block text-xs font-bold text-slate-700">Prévia do Player ({{ formPlataformaVideo() === 'youtube' ? 'YouTube' : 'Vimeo' }})</label>
                      @if (videoPreviewUrl) {
                        <div class="aspect-video max-w-md w-full bg-black rounded-2xl overflow-hidden shadow-xs border border-slate-300">
                          <iframe
                            [src]="videoPreviewUrl"
                            class="w-full h-full"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                            allowfullscreen
                            title="Prévia do vídeo"
                          ></iframe>
                        </div>
                      } @else {
                        <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ formPlataformaVideo() === 'youtube' ? 'Link ou ID do YouTube não reconhecido. Use a URL do vídeo ou o ID de 11 caracteres.' : 'Link ou ID do Vimeo não reconhecido. Use o número (ex: 892019283) ou link vimeo.com/ID.' }}</span>
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <!-- Opção 1: Upload Direto para o Bucket materiais-comunidade -->
                  <div class="space-y-2">
                    <label class="block text-xs font-bold text-slate-700">
                      Upload Direto de Arquivo (Sem Restrição de Extensão)
                    </label>

                    <div class="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <div class="flex flex-col items-center justify-center text-center gap-2">
                        @if (uploadandoArquivo()) {
                          <div class="flex items-center gap-2 text-indigo-600 text-xs font-bold py-2">
                            <span class="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                            <span>Enviando arquivo para o bucket (materiais-comunidade)...</span>
                          </div>
                        } @else if (nomeArquivoEnviado()) {
                          <div class="flex items-center justify-between w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <div class="flex items-center gap-2 truncate">
                              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span class="truncate">{{ nomeArquivoEnviado() }}</span>
                              @if (formTamanho()) {
                                <span class="text-emerald-600 text-[11px]">({{ formTamanho() }})</span>
                              }
                            </div>
                            <label class="ml-2 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer shrink-0">
                              <span>Trocar</span>
                              <input
                                type="file"
                                (change)="onFileSelected($event)"
                                class="hidden"
                              />
                            </label>
                          </div>
                        } @else {
                          <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <label class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
                              <span>Escolher Arquivo do Computador</span>
                              <input
                                type="file"
                                (change)="onFileSelected($event)"
                                class="hidden"
                              />
                            </label>
                            <p class="text-[11px] text-slate-400 mt-1.5">
                              Todos os formatos suportados: PDF, Planilhas, Imagens, Documentos, Compactados (máx. 50 MB)
                            </p>
                          </div>
                        }
                      </div>

                      @if (erroUpload()) {
                        <div class="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ erroUpload() }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Opção 2: URL Direta / Externa -->
                  <div class="space-y-1.5 pt-1">
                    <div class="flex items-center justify-between">
                      <label class="block text-xs font-bold text-slate-700">
                        URL do Arquivo (Preenchida via upload ou link externo)
                      </label>
                      @if (formUrlArquivo()) {
                        <span class="text-[11px] text-emerald-600 font-bold">✓ URL vinculada</span>
                      }
                    </div>
                    <input
                      type="url"
                      [value]="formUrlArquivo()"
                      (input)="formUrlArquivo.set($any($event.target).value)"
                      placeholder="https://... ou URL gerada no upload"
                      class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium font-mono text-slate-800"
                    />
                    <p class="text-[11px] text-slate-400">
                      Preenchido automaticamente ao enviar arquivo, ou cole um link externo (ex: Google Drive, OneDrive).
                    </p>
                  </div>
                }
              </div>

              <!-- Descrição -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  Descrição / Instruções de Uso
                </label>
                <textarea
                  rows="3"
                  [value]="formDescricao()"
                  (input)="formDescricao.set($any($event.target).value)"
                  placeholder="Descreva o conteúdo técnico do material, normas associadas e recomendações de aplicação..."
                  class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none leading-relaxed"
                ></textarea>
              </div>

              <!-- Gestão de Anexos Múltiplos (material_anexos) -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span class="text-xs font-bold text-slate-800">Anexos Adicionais ({{ anexosAtuais().length }})</span>
                  </div>

                  <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar Anexo</span>
                    <input type="file" (change)="onAnexoSelected($event)" class="hidden" [disabled]="uploadandoAnexo()" />
                  </label>
                </div>

                @if (uploadandoAnexo()) {
                  <div class="flex items-center gap-2 text-xs text-indigo-600 font-semibold py-1">
                    <span class="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                    <span>Enviando anexo para o bucket...</span>
                  </div>
                }

                @if (erroUploadAnexo()) {
                  <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                    <span>{{ erroUploadAnexo() }}</span>
                    <button type="button" (click)="erroUploadAnexo.set(null)" class="text-rose-600 font-bold ml-2">✕</button>
                  </div>
                }

                @if (anexosAtuais().length === 0) {
                  <p class="text-[11px] text-slate-400 italic">
                    Nenhum anexo adicional vinculado. Você pode anexar arquivos complementares (ex: arquivos DWG, tabelas extras, modelos).
                  </p>
                } @else {
                  <div class="space-y-1.5">
                    @for (anexo of anexosAtuais(); track anexo.id || anexo.nome_arquivo) {
                      <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                        <div class="flex items-center gap-2 min-w-0 pr-2">
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase shrink-0">
                            {{ anexo.formato || 'ARQ' }}
                          </span>
                          <span class="truncate font-medium text-slate-800" [title]="anexo.nome_arquivo">
                            {{ anexo.nome_arquivo }}
                          </span>
                          @if (anexo.tamanho) {
                            <span class="text-[11px] text-slate-400 shrink-0">({{ anexo.tamanho }})</span>
                          }
                        </div>
                        <button
                          type="button"
                          (click)="removerAnexo(anexo)"
                          class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Remover anexo"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Rodapé do Modal com Botões -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="fecharModal()"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  [disabled]="salvando()"
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  @if (salvando()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Salvando...</span>
                  } @else {
                    <span>{{ materialEmEdicao() ? 'Salvar Alterações' : 'Cadastrar Material' }}</span>
                  }
                </button>
              </div>

            </form>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminMateriaisComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly materiais = signal<MaterialAdminItem[]>([]);
  readonly carregando = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);
  readonly processandoStatus = signal<string | null>(null);
  readonly processandoExclusao = signal<string | null>(null);
  readonly confirmarExclusaoId = signal<string | null>(null);

  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Filtros
  readonly filtroStatus = signal<'todos' | 'ativos' | 'inativos'>('todos');
  readonly filtroCategoria = signal<string>('todas');
  readonly termoBusca = signal<string>('');

  // Categorias Reais
  readonly categoriasDisponiveis: CategoriaMaterialAdmin[] = [
    'Planilhas',
    'Modelos de Laudo',
    'Checklists',
    'E-books',
    'Vídeos',
    'Skills Claude',
    'Outros'
  ];

  // Modal e Formulário
  readonly modalAberto = signal<boolean>(false);
  readonly materialEmEdicao = signal<MaterialAdminItem | null>(null);

  readonly formTitulo = signal<string>('');
  readonly formDescricao = signal<string>('');
  readonly formCategoria = signal<string>('Planilhas');
  readonly formFormato = signal<string>('XLSX');
  readonly formTipoArquivoReal = signal<string>('');
  readonly formTamanho = signal<string>('');
  readonly formUrlArquivo = signal<string>('');
  readonly formStoragePath = signal<string>('');
  readonly formPlataformaVideo = signal<'vimeo' | 'youtube'>('vimeo');
  readonly formAtivo = signal<boolean>(true);
  readonly formPago = signal<boolean>(false);
  readonly formExibirValor = signal<boolean>(true);
  readonly formValor = signal<number | null>(null);
  readonly formSku = signal<string>('');

  // Upload Direto para Bucket Storage
  readonly uploadandoArquivo = signal<boolean>(false);
  readonly nomeArquivoEnviado = signal<string | null>(null);
  readonly erroUpload = signal<string | null>(null);

  // Gestão de Múltiplos Anexos (material_anexos)
  readonly anexosAtuais = signal<MaterialAnexo[]>([]);
  readonly uploadandoAnexo = signal<boolean>(false);
  readonly erroUploadAnexo = signal<string | null>(null);

  // Computed
  readonly totalAtivos = computed(() => this.materiais().filter(m => m.ativo).length);
  readonly totalInativos = computed(() => this.materiais().filter(m => !m.ativo).length);

  readonly materiaisFiltrados = computed(() => {
    let lista = this.materiais();

    // Filtro por status
    if (this.filtroStatus() === 'ativos') {
      lista = lista.filter(m => m.ativo);
    } else if (this.filtroStatus() === 'inativos') {
      lista = lista.filter(m => !m.ativo);
    }

    // Filtro por categoria
    if (this.filtroCategoria() !== 'todas') {
      lista = lista.filter(m => m.categoria === this.filtroCategoria());
    }

    // Busca textual
    const termo = this.termoBusca().toLowerCase().trim();
    if (termo) {
      lista = lista.filter(m =>
        m.titulo.toLowerCase().includes(termo) ||
        (m.descricao && m.descricao.toLowerCase().includes(termo)) ||
        (m.sku && m.sku.toLowerCase().includes(termo))
      );
    }

    return lista;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarMateriais();
  }

  formatarPreco(valor: any): string {
    if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(',', '.'));
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onValorInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val === '' || val === null || val === undefined) {
      this.formValor.set(null);
    } else {
      const parsed = parseFloat(val);
      this.formValor.set(isNaN(parsed) ? null : parsed);
    }
  }

  async carregarMateriais(): Promise<void> {
    this.carregando.set(true);
    this.mensagemErro.set(null);
    try {
      const lista = await this.supabaseService.listarTodosMateriais();
      
      // Carrega contagem de downloads para cada material
      const comContagem = await Promise.all(
        lista.map(async (m: any) => {
          const downloads = await this.supabaseService.contarDownloadsDoMaterial(m.id);
          return {
            ...m,
            downloads_count: downloads,
          };
        })
      );

      this.materiais.set(comContagem);
    } catch (e: any) {
      this.mensagemErro.set('Erro ao carregar materiais: ' + (e?.message || e));
    } finally {
      this.carregando.set(false);
    }
  }

  onCategoriaFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroCategoria.set(val);
  }

  onBuscaInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.termoBusca.set(val);
  }

  getVideoPreviewUrl(urlOuId?: string | null): SafeResourceUrl | null {
    if (!urlOuId) return null;
    const url = this.formPlataformaVideo() === 'youtube'
      ? montarUrlPlayerYoutube(urlOuId)
      : montarUrlPlayerVimeo(urlOuId);
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getVimeoUrl(urlOuId?: string | null): SafeResourceUrl | null {
    const url = montarUrlPlayerVimeo(urlOuId);
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onTrocarPlataformaVideo(plataforma: 'vimeo' | 'youtube'): void {
    this.formPlataformaVideo.set(plataforma);
    if (this.formCategoria() === 'Vídeos') {
      this.formTamanho.set(plataforma === 'youtube' ? 'YouTube Streaming' : 'Vimeo Streaming');
    }
  }

  getBadgeEstilo(cat: string): string {
    switch (cat) {
      case 'Planilhas':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Modelos de Laudo':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Checklists':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'E-books':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Vídeos':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Skills Claude':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Outros':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  onFormCategoriaChange(novaCategoria: string): void {
    this.formCategoria.set(novaCategoria);
    if (novaCategoria === 'Vídeos') {
      if (!this.formFormato() || this.formFormato() === 'XLSX' || this.formFormato() === 'PDF') {
        this.formFormato.set('VÍDEO');
      }
      if (!this.formTamanho() || this.formTamanho() === 'Vimeo Streaming' || this.formTamanho() === 'YouTube Streaming') {
        this.formTamanho.set(this.formPlataformaVideo() === 'youtube' ? 'YouTube Streaming' : 'Vimeo Streaming');
      }
    }
  }

  async carregarAnexos(materialId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('material_anexos')
        .select('*')
        .eq('material_id', materialId)
        .order('ordem', { ascending: true });
      if (!error && data) {
        this.anexosAtuais.set(data);
      } else {
        this.anexosAtuais.set([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar anexos:', e);
      this.anexosAtuais.set([]);
    }
  }

  async onAnexoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.erroUploadAnexo.set(null);
    this.uploadandoAnexo.set(true);

    try {
      const res = await this.supabaseService.uploadArquivoMaterial(file, this.formCategoria());
      if (res.error) {
        this.erroUploadAnexo.set(res.error.message || 'Falha no upload do anexo.');
        return;
      }

      if (res.signedUrl) {
        const material = this.materialEmEdicao();
        const formato = res.formato || file.name.split('.').pop()?.toUpperCase() || 'ARQUIVO';
        const tamanho = res.tamanho || `${(file.size / 1024).toFixed(0)} KB`;
        const ordem = this.anexosAtuais().length;

        if (material?.id) {
          // Salva diretamente na tabela material_anexos.
          // storage_path (path puro, sem token) é o que permite gerar um signed
          // URL novo e curto a cada download; url_arquivo aqui vale só como
          // fallback/preview imediato (1h) — não é o link usado no download real.
          const { data, error } = await this.supabaseService.client
            .from('material_anexos')
            .insert({
              material_id: material.id,
              nome_arquivo: file.name,
              url_arquivo: res.signedUrl,
              storage_path: res.path,
              formato,
              tamanho,
              ordem
            })
            .select()
            .single();

          if (error) {
            this.erroUploadAnexo.set('Erro ao salvar anexo: ' + error.message);
          } else if (data) {
            this.anexosAtuais.update(lista => [...lista, data]);
          }
        } else {
          // Material novo ainda não salvo no banco: armazena temporariamente na lista
          this.anexosAtuais.update(lista => [
            ...lista,
            {
              id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              nome_arquivo: file.name,
              url_arquivo: res.signedUrl!,
              storage_path: res.path,
              formato,
              tamanho,
              ordem
            }
          ]);
        }
      }
    } catch (err: any) {
      this.erroUploadAnexo.set(err?.message || 'Erro inesperado durante upload do anexo.');
    } finally {
      this.uploadandoAnexo.set(false);
      input.value = '';
    }
  }

  async removerAnexo(anexo: MaterialAnexo): Promise<void> {
    if (anexo.id && !anexo.id.startsWith('temp_')) {
      const { error } = await this.supabaseService.client
        .from('material_anexos')
        .delete()
        .eq('id', anexo.id);

      if (error) {
        this.erroUploadAnexo.set('Erro ao remover anexo: ' + error.message);
        return;
      }
    }
    this.anexosAtuais.update(lista => lista.filter(a => a.id !== anexo.id));
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.erroUpload.set(null);
    this.uploadandoArquivo.set(true);

    try {
      const res = await this.supabaseService.uploadArquivoMaterial(file, this.formCategoria());
      if (res.error) {
        this.erroUpload.set(res.error.message || 'Falha no upload do arquivo.');
        return;
      }

      if (res.signedUrl) {
        this.formUrlArquivo.set(res.signedUrl);
        // storage_path (path puro) é o que permite gerar signed URL curto sob
        // demanda a cada download real — ver registrarDownloadMaterial().
        this.formStoragePath.set(res.path || '');
        this.nomeArquivoEnviado.set(file.name);

        if (res.formato) {
          this.formFormato.set(res.formato);
        }
        if (res.tipoArquivoReal) {
          this.formTipoArquivoReal.set(res.tipoArquivoReal);
        }
        if (res.tamanho) {
          this.formTamanho.set(res.tamanho);
        }

        // Sugerir título amigável caso esteja em branco
        if (!this.formTitulo().trim()) {
          const nomeSemExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          this.formTitulo.set(nomeSemExt.charAt(0).toUpperCase() + nomeSemExt.slice(1));
        }
      }
    } catch (err: any) {
      this.erroUpload.set(err?.message || 'Erro inesperado durante o upload.');
    } finally {
      this.uploadandoArquivo.set(false);
      input.value = '';
    }
  }

  abrirModalNovo(): void {
    this.materialEmEdicao.set(null);
    this.formTitulo.set('');
    this.formDescricao.set('');
    this.formCategoria.set('Planilhas');
    this.formFormato.set('XLSX');
    this.formTipoArquivoReal.set('');
    this.formTamanho.set('');
    this.formUrlArquivo.set('');
    this.formStoragePath.set('');
    this.formPlataformaVideo.set('vimeo');
    this.formAtivo.set(true);
    this.formPago.set(false);
    this.formExibirValor.set(true);
    this.formValor.set(null);
    this.formSku.set('');
    this.nomeArquivoEnviado.set(null);
    this.uploadandoArquivo.set(false);
    this.erroUpload.set(null);
    this.anexosAtuais.set([]);
    this.uploadandoAnexo.set(false);
    this.erroUploadAnexo.set(null);
    this.modalAberto.set(true);
  }

  abrirModalEdicao(material: MaterialAdminItem): void {
    this.materialEmEdicao.set(material);
    this.formTitulo.set(material.titulo);
    this.formDescricao.set(material.descricao || '');
    this.formCategoria.set(material.categoria || 'Planilhas');
    this.formFormato.set(material.formato || 'PDF');
    this.formTipoArquivoReal.set(material.tipo_arquivo_real || '');
    this.formTamanho.set(material.tamanho || '');
    this.formUrlArquivo.set(material.url_arquivo || '');
    this.formStoragePath.set(material.storage_path || '');
    this.formPlataformaVideo.set(material.plataforma_video || 'vimeo');
    this.formAtivo.set(material.ativo);
    this.formPago.set(!!material.pago);
    this.formExibirValor.set(material.exibir_valor !== false);
    this.formValor.set(material.valor ?? null);
    this.formSku.set(material.sku || '');
    this.nomeArquivoEnviado.set(null);
    this.uploadandoArquivo.set(false);
    this.erroUpload.set(null);
    this.anexosAtuais.set([]);
    this.uploadandoAnexo.set(false);
    this.erroUploadAnexo.set(null);
    this.modalAberto.set(true);
    this.carregarAnexos(material.id);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.materialEmEdicao.set(null);
    this.nomeArquivoEnviado.set(null);
    this.uploadandoArquivo.set(false);
    this.erroUpload.set(null);
    this.anexosAtuais.set([]);
    this.uploadandoAnexo.set(false);
    this.erroUploadAnexo.set(null);
  }

  async salvarMaterial(event: Event): Promise<void> {
    event.preventDefault();
    const titulo = this.formTitulo().trim();
    if (!titulo) return;

    this.salvando.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    let urlArquivoFinal = this.formUrlArquivo().trim();

    // Validação específica para a categoria Vídeos (Vimeo vs YouTube)
    if (this.formCategoria() === 'Vídeos') {
      if (!urlArquivoFinal) {
        this.mensagemErro.set(
          this.formPlataformaVideo() === 'youtube'
            ? 'Por favor, informe o link ou ID do vídeo no YouTube.'
            : 'Por favor, informe o link ou o ID numérico do vídeo no Vimeo.'
        );
        this.salvando.set(false);
        return;
      }

      if (this.formPlataformaVideo() === 'youtube') {
        const ytId = extrairYoutubeId(urlArquivoFinal);
        if (!ytId) {
          this.mensagemErro.set('Link ou ID do YouTube não reconhecido. Use a URL do vídeo ou o ID de 11 caracteres.');
          this.salvando.set(false);
          return;
        }
        urlArquivoFinal = `https://www.youtube.com/watch?v=${ytId}`;
      } else {
        const vimeoId = extrairVimeoId(urlArquivoFinal);
        if (!vimeoId) {
          this.mensagemErro.set('Link ou ID do Vimeo não reconhecido. Use o número (ex: 892019283) ou o link direto vimeo.com/ID.');
          this.salvando.set(false);
          return;
        }
        urlArquivoFinal = `https://vimeo.com/${vimeoId}`;
      }
    }

    const defaultTamanhoVideo = this.formPlataformaVideo() === 'youtube' ? 'YouTube Streaming' : 'Vimeo Streaming';
    const dados: any = {
      titulo,
      descricao: this.formDescricao().trim(),
      categoria: this.formCategoria(),
      formato: this.formFormato().trim().toUpperCase() || (this.formCategoria() === 'Vídeos' ? 'VÍDEO' : 'PDF'),
      tipo_arquivo_real: this.formTipoArquivoReal().trim().toLowerCase() || null,
      tamanho: this.formTamanho().trim() || (this.formCategoria() === 'Vídeos' ? defaultTamanhoVideo : 'Arquivo'),
      url_arquivo: urlArquivoFinal,
      // storage_path só se aplica a arquivos reais do bucket (PDFs, zips etc.);
      // vídeos usam link externo (YouTube/Vimeo) e não têm path de storage.
      storage_path: this.formCategoria() === 'Vídeos' ? null : (this.formStoragePath().trim() || null),
      plataforma_video: this.formCategoria() === 'Vídeos' ? this.formPlataformaVideo() : null,
      ativo: this.formAtivo(),
      pago: this.formPago(),
      exibir_valor: this.formExibirValor(),
      valor: this.formPago() ? this.formValor() : null,
      sku: this.formPago() ? (this.formSku().trim() || null) : null,
    };

    const edicao = this.materialEmEdicao();

    if (edicao) {
      // Atualizar
      const { error } = await this.supabaseService.atualizarMaterial(edicao.id, dados);
      this.salvando.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao atualizar material: ' + error.message);
        return;
      }

      this.materiais.update(lista =>
        lista.map(m => (m.id === edicao.id ? { ...m, ...dados } : m))
      );
      this.mensagemSucesso.set(`Material "${titulo}" atualizado com sucesso!`);
      this.fecharModal();
    } else {
      // Criar
      const { error, data } = await this.supabaseService.criarMaterial(dados);
      this.salvando.set(false);

      if (error) {
        this.mensagemErro.set('Erro ao criar material: ' + error.message);
        return;
      }

      // Se havia anexos na fila temporária, salva agora vinculando ao material criado
      if (data?.id && this.anexosAtuais().length > 0) {
        for (const anexo of this.anexosAtuais()) {
          await this.supabaseService.client
            .from('material_anexos')
            .insert({
              material_id: data.id,
              nome_arquivo: anexo.nome_arquivo,
              url_arquivo: anexo.url_arquivo,
              formato: anexo.formato,
              tamanho: anexo.tamanho,
              ordem: anexo.ordem
            });
        }
      }

      const novoMaterial: MaterialAdminItem = data || {
        id: 'tmp_' + Date.now(),
        ...dados,
        downloads_count: 0,
      };

      this.materiais.update(lista => [novoMaterial, ...lista]);
      this.mensagemSucesso.set(`Material "${titulo}" cadastrado com sucesso!`);
      this.fecharModal();
    }
  }

  async alternarStatusMaterial(material: MaterialAdminItem): Promise<void> {
    if (this.processandoStatus()) return;

    this.processandoStatus.set(material.id);
    const novoStatus = !material.ativo;

    const { error } = await this.supabaseService.atualizarMaterial(material.id, { ativo: novoStatus });
    this.processandoStatus.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao alterar status: ' + error.message);
      return;
    }

    this.materiais.update(lista =>
      lista.map(m => (m.id === material.id ? { ...m, ativo: novoStatus } : m))
    );
    this.mensagemSucesso.set(`Material "${material.titulo}" agora está ${novoStatus ? 'ativo' : 'inativo'}.`);
  }

  async executarExclusao(id: string): Promise<void> {
    this.processandoExclusao.set(id);
    this.mensagemErro.set(null);

    const { error } = await this.supabaseService.excluirMaterial(id);
    this.processandoExclusao.set(null);
    this.confirmarExclusaoId.set(null);

    if (error) {
      this.mensagemErro.set('Erro ao excluir material: ' + error.message);
      return;
    }

    this.materiais.update(lista => lista.filter(m => m.id !== id));
    this.mensagemSucesso.set('Material e registros de download vinculados excluídos com sucesso.');
  }
}
