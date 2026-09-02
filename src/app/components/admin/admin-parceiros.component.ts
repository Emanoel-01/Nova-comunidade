import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export interface ProfessorParceiro {
  id: string;
  nome: string;
  cargo_titulo: string;
  foto_url?: string | null;
  mini_bio?: string | null;
  link_linkedin?: string | null;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
}

export interface SoftwareParceiro {
  id: string;
  nome: string;
  categoria?: string | null;
  logo_url?: string | null;
  descricao_curta?: string | null;
  link_oficial?: string | null;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
}

export interface EmpresaParceira {
  id: string;
  nome: string;
  tipo?: string | null;
  logo_url?: string | null;
  link_oficial?: string | null;
  ordem: number;
  ativo: boolean;
  criado_em?: string;
}

@Component({
  selector: 'app-admin-parceiros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- 1. Cabeçalho Principal -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center font-bold text-lg shadow-xs">
                🤝
              </div>
              <span class="text-xs font-black uppercase tracking-wider text-indigo-700">Amorim Academy & Ecossistema</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestão de Parceiros
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Cadastre e gerencie os Professores Parceiros, Softwares e Ferramentas homologadas, e Empresas Parceiras exibidos na Amorim Academy.
            </p>
          </div>

          <!-- Botão de Criação de acordo com a aba ativa -->
          <div class="flex items-center gap-3 shrink-0">
            @if (abaAtiva() === 'professores') {
              <button
                type="button"
                id="btn-novo-professor"
                (click)="abrirModalProfessor()"
                class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Professor</span>
              </button>
            } @else if (abaAtiva() === 'softwares') {
              <button
                type="button"
                id="btn-novo-software"
                (click)="abrirModalSoftware()"
                class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Software</span>
              </button>
            } @else {
              <button
                type="button"
                id="btn-nova-empresa"
                (click)="abrirModalEmpresa()"
                class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Empresa</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Feedback de Mensagens -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ mensagemSucesso() }}</span>
          </div>
          <button (click)="mensagemSucesso.set(null)" class="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      }
      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ mensagemErro() }}</span>
          </div>
          <button (click)="mensagemErro.set(null)" class="text-rose-700 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      }

      <!-- Navegação das 3 Sub-Abas -->
      <div class="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex flex-wrap gap-2">
        <button
          type="button"
          (click)="trocarAba('professores')"
          [class]="abaAtiva() === 'professores'
            ? 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer'
            : 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer'"
        >
          <span>👨‍🏫 Professores Parceiros</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-black" [class]="abaAtiva() === 'professores' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
            {{ professores().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="trocarAba('softwares')"
          [class]="abaAtiva() === 'softwares'
            ? 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer'
            : 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer'"
        >
          <span>💻 Softwares Parceiros</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-black" [class]="abaAtiva() === 'softwares' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
            {{ softwares().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="trocarAba('empresas')"
          [class]="abaAtiva() === 'empresas'
            ? 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer'
            : 'flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer'"
        >
          <span>🏢 Empresas Parceiras</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-black" [class]="abaAtiva() === 'empresas' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
            {{ empresas().length }}
          </span>
        </button>
      </div>

      <!-- Estado de Carregamento -->
      @if (carregando()) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs sm:text-sm font-semibold text-slate-500">Carregando parceiros cadastrados...</p>
        </div>
      } @else {

        <!-- ============================================== -->
        <!-- ABA 1: PROFESSORES PARCEIROS                   -->
        <!-- ============================================== -->
        @if (abaAtiva() === 'professores') {
          @if (professores().length === 0) {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div class="text-4xl">👨‍🏫</div>
              <h3 class="text-base font-bold text-slate-800">Nenhum professor cadastrado ainda</h3>
              <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Clique no botão "Novo Professor" acima para cadastrar os instrutores e especialistas da Amorim Academy.
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (prof of professores(); track prof.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative">
                  <!-- Ordem & Status Badge -->
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-[11px] font-bold text-slate-400">Ordem: #{{ prof.ordem }}</span>
                    <button
                      type="button"
                      (click)="toggleStatusProfessor(prof)"
                      [class]="prof.ativo
                        ? 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                        : 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'"
                    >
                      {{ prof.ativo ? '● Ativo' : '○ Inativo' }}
                    </button>
                  </div>

                  <!-- Perfil -->
                  <div class="flex items-start gap-4 mb-4">
                    @if (prof.foto_url) {
                      <img
                        [src]="prof.foto_url"
                        [alt]="prof.nome"
                        class="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                        (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'"
                      />
                    } @else {
                      <div class="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shrink-0">
                        {{ prof.nome.charAt(0) }}
                      </div>
                    }

                    <div class="space-y-1 min-w-0 flex-1">
                      <h4 class="text-sm font-bold text-slate-900 truncate" [title]="prof.nome">{{ prof.nome }}</h4>
                      <p class="text-xs text-indigo-600 font-semibold leading-tight line-clamp-2">{{ prof.cargo_titulo }}</p>
                      @if (prof.link_linkedin) {
                        <a [href]="prof.link_linkedin" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-400 hover:text-indigo-600 font-medium inline-flex items-center gap-1 mt-1">
                          <span>LinkedIn</span> ↗
                        </a>
                      }
                    </div>
                  </div>

                  @if (prof.mini_bio) {
                    <p class="text-xs text-slate-600 line-clamp-3 mb-4 italic leading-relaxed">
                      "{{ prof.mini_bio }}"
                    </p>
                  }

                  <!-- Ações -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="editarProfessor(prof)"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="confirmarExcluirProfessor(prof.id)"
                      class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- ============================================== -->
        <!-- ABA 2: SOFTWARES PARCEIROS                     -->
        <!-- ============================================== -->
        @if (abaAtiva() === 'softwares') {
          @if (softwares().length === 0) {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div class="text-4xl">💻</div>
              <h3 class="text-base font-bold text-slate-800">Nenhum software parceiro cadastrado</h3>
              <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Clique no botão "Novo Software" acima para cadastrar os softwares e ferramentas parceiras.
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (soft of softwares(); track soft.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <!-- Ordem & Status Badge -->
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-[11px] font-bold text-slate-400">Ordem: #{{ soft.ordem }}</span>
                    <button
                      type="button"
                      (click)="toggleStatusSoftware(soft)"
                      [class]="soft.ativo
                        ? 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                        : 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'"
                    >
                      {{ soft.ativo ? '● Ativo' : '○ Inativo' }}
                    </button>
                  </div>

                  <!-- Detalhes do Software -->
                  <div class="flex items-start gap-4 mb-4">
                    @if (soft.logo_url) {
                      <img
                        [src]="soft.logo_url"
                        [alt]="soft.nome"
                        class="w-14 h-14 rounded-xl object-contain p-1 border border-slate-200 shrink-0 bg-slate-50"
                        (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'"
                      />
                    } @else {
                      <div class="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-lg shrink-0">
                        {{ soft.nome.charAt(0) }}
                      </div>
                    }

                    <div class="space-y-1 min-w-0 flex-1">
                      <h4 class="text-sm font-bold text-slate-900 truncate">{{ soft.nome }}</h4>
                      @if (soft.categoria) {
                        <span class="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] tracking-wide">
                          {{ soft.categoria }}
                        </span>
                      }
                      @if (soft.link_oficial) {
                        <div>
                          <a [href]="soft.link_oficial" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-400 hover:text-indigo-600 font-medium inline-flex items-center gap-1">
                            <span>Site Oficial</span> ↗
                          </a>
                        </div>
                      }
                    </div>
                  </div>

                  @if (soft.descricao_curta) {
                    <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {{ soft.descricao_curta }}
                    </p>
                  }

                  <!-- Ações -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="editarSoftware(soft)"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="confirmarExcluirSoftware(soft.id)"
                      class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- ============================================== -->
        <!-- ABA 3: EMPRESAS PARCEIRAS                      -->
        <!-- ============================================== -->
        @if (abaAtiva() === 'empresas') {
          @if (empresas().length === 0) {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div class="text-4xl">🏢</div>
              <h3 class="text-base font-bold text-slate-800">Nenhuma empresa parceira cadastrada</h3>
              <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Clique no botão "Nova Empresa" acima para cadastrar construtoras, incorporadoras e empresas parceiras.
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (emp of empresas(); track emp.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <!-- Ordem & Status Badge -->
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-[11px] font-bold text-slate-400">Ordem: #{{ emp.ordem }}</span>
                    <button
                      type="button"
                      (click)="toggleStatusEmpresa(emp)"
                      [class]="emp.ativo
                        ? 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                        : 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'"
                    >
                      {{ emp.ativo ? '● Ativa' : '○ Inativa' }}
                    </button>
                  </div>

                  <!-- Detalhes da Empresa -->
                  <div class="flex items-start gap-4 mb-4">
                    @if (emp.logo_url) {
                      <img
                        [src]="emp.logo_url"
                        [alt]="emp.nome"
                        class="w-14 h-14 rounded-xl object-contain p-1 border border-slate-200 shrink-0 bg-slate-50"
                        (error)="$any($event.target).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop'"
                      />
                    } @else {
                      <div class="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-lg shrink-0">
                        {{ emp.nome.charAt(0) }}
                      </div>
                    }

                    <div class="space-y-1 min-w-0 flex-1">
                      <h4 class="text-sm font-bold text-slate-900 truncate">{{ emp.nome }}</h4>
                      @if (emp.tipo) {
                        <span class="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] tracking-wide">
                          {{ emp.tipo }}
                        </span>
                      }
                      @if (emp.link_oficial) {
                        <div>
                          <a [href]="emp.link_oficial" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-400 hover:text-indigo-600 font-medium inline-flex items-center gap-1">
                            <span>Site Oficial</span> ↗
                          </a>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Ações -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="editarEmpresa(emp)"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="confirmarExcluirEmpresa(emp.id)"
                      class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }

      }

      <!-- ============================================== -->
      <!-- MODAL: PROFESSOR PARCEIRO                      -->
      <!-- ============================================== -->
      @if (modalProfessorAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-base sm:text-lg font-black text-slate-900">
                {{ professorEmEdicao() ? 'Editar Professor' : 'Novo Professor Parceiro' }}
              </h3>
              <button (click)="fecharModalProfessor()" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  #profNomeInput
                  [value]="formProfessor.nome"
                  placeholder="Ex: Prof. Dr. André Silva"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Cargo / Título Profissional *</label>
                <input
                  type="text"
                  #profCargoInput
                  [value]="formProfessor.cargo_titulo"
                  placeholder="Ex: Engenheiro Civil, Doutor em Patologia das Estruturas"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">URL da Foto</label>
                <input
                  type="url"
                  #profFotoInput
                  [value]="formProfessor.foto_url"
                  placeholder="https://exemplo.com/foto.jpg"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Mini-Biografia</label>
                <textarea
                  #profBioInput
                  [value]="formProfessor.mini_bio"
                  rows="3"
                  placeholder="Breve resumo da trajetória acadêmica e profissional..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Link LinkedIn</label>
                  <input
                    type="url"
                    #profLinkedinInput
                    [value]="formProfessor.link_linkedin"
                    placeholder="https://linkedin.com/in/perfil"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    #profOrdemInput
                    [value]="formProfessor.ordem"
                    min="0"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    #profAtivoInput
                    [checked]="formProfessor.ativo"
                    class="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span class="text-xs font-bold text-slate-700">Professor Ativo (exibir publicamente)</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                [disabled]="salvando()"
                (click)="fecharModalProfessor()"
                class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                [disabled]="salvando()"
                (click)="salvarProfessor(
                  profNomeInput.value,
                  profCargoInput.value,
                  profFotoInput.value,
                  profBioInput.value,
                  profLinkedinInput.value,
                  +profOrdemInput.value,
                  profAtivoInput.checked
                )"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                @if (salvando()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Salvando...</span>
                } @else {
                  <span>{{ professorEmEdicao() ? 'Salvar Alterações' : 'Cadastrar Professor' }}</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============================================== -->
      <!-- MODAL: SOFTWARE PARCEIRO                       -->
      <!-- ============================================== -->
      @if (modalSoftwareAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-base sm:text-lg font-black text-slate-900">
                {{ softwareEmEdicao() ? 'Editar Software' : 'Novo Software Parceiro' }}
              </h3>
              <button (click)="fecharModalSoftware()" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome do Software *</label>
                <input
                  type="text"
                  #softNomeInput
                  [value]="formSoftware.nome"
                  placeholder="Ex: Predial 4.0"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  #softCategoriaInput
                  [value]="formSoftware.categoria"
                  placeholder="Ex: Inspeção Predial / BIM / Orçamento"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">URL da Logo</label>
                <input
                  type="url"
                  #softLogoInput
                  [value]="formSoftware.logo_url"
                  placeholder="https://exemplo.com/logo.png"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Descrição Curta</label>
                <textarea
                  #softDescricaoInput
                  [value]="formSoftware.descricao_curta"
                  rows="3"
                  placeholder="Como o software é utilizado nos cursos ou rotinas técnicas..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Link Oficial</label>
                  <input
                    type="url"
                    #softLinkInput
                    [value]="formSoftware.link_oficial"
                    placeholder="https://software.com.br"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    #softOrdemInput
                    [value]="formSoftware.ordem"
                    min="0"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    #softAtivoInput
                    [checked]="formSoftware.ativo"
                    class="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span class="text-xs font-bold text-slate-700">Software Ativo (exibir publicamente)</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                [disabled]="salvando()"
                (click)="fecharModalSoftware()"
                class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                [disabled]="salvando()"
                (click)="salvarSoftware(
                  softNomeInput.value,
                  softCategoriaInput.value,
                  softLogoInput.value,
                  softDescricaoInput.value,
                  softLinkInput.value,
                  +softOrdemInput.value,
                  softAtivoInput.checked
                )"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                @if (salvando()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Salvando...</span>
                } @else {
                  <span>{{ softwareEmEdicao() ? 'Salvar Alterações' : 'Cadastrar Software' }}</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ============================================== -->
      <!-- MODAL: EMPRESA PARCEIRA                        -->
      <!-- ============================================== -->
      @if (modalEmpresaAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-base sm:text-lg font-black text-slate-900">
                {{ empresaEmEdicao() ? 'Editar Empresa' : 'Nova Empresa Parceira' }}
              </h3>
              <button (click)="fecharModalEmpresa()" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  #empNomeInput
                  [value]="formEmpresa.nome"
                  placeholder="Ex: Construtora Exemplo Ltda"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Tipo de Empresa</label>
                <input
                  type="text"
                  #empTipoInput
                  [value]="formEmpresa.tipo"
                  placeholder="Ex: Construtora / Incorporadora / Instalações"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">URL da Logo</label>
                <input
                  type="url"
                  #empLogoInput
                  [value]="formEmpresa.logo_url"
                  placeholder="https://exemplo.com/logo.png"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Link Oficial</label>
                  <input
                    type="url"
                    #empLinkInput
                    [value]="formEmpresa.link_oficial"
                    placeholder="https://empresa.com.br"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    #empOrdemInput
                    [value]="formEmpresa.ordem"
                    min="0"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div class="pt-2">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    #empAtivoInput
                    [checked]="formEmpresa.ativo"
                    class="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span class="text-xs font-bold text-slate-700">Empresa Ativa (exibir publicamente)</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                [disabled]="salvando()"
                (click)="fecharModalEmpresa()"
                class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                [disabled]="salvando()"
                (click)="salvarEmpresa(
                  empNomeInput.value,
                  empTipoInput.value,
                  empLogoInput.value,
                  empLinkInput.value,
                  +empOrdemInput.value,
                  empAtivoInput.checked
                )"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                @if (salvando()) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Salvando...</span>
                } @else {
                  <span>{{ empresaEmEdicao() ? 'Salvar Alterações' : 'Cadastrar Empresa' }}</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AdminParceirosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly abaAtiva = signal<'professores' | 'softwares' | 'empresas'>('professores');
  readonly carregando = signal<boolean>(true);
  readonly salvando = signal<boolean>(false);

  // Listas
  readonly professores = signal<ProfessorParceiro[]>([]);
  readonly softwares = signal<SoftwareParceiro[]>([]);
  readonly empresas = signal<EmpresaParceira[]>([]);

  // Feedbacks
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Modais
  readonly modalProfessorAberto = signal<boolean>(false);
  readonly professorEmEdicao = signal<ProfessorParceiro | null>(null);
  formProfessor = {
    nome: '',
    cargo_titulo: '',
    foto_url: '',
    mini_bio: '',
    link_linkedin: '',
    ordem: 0,
    ativo: true
  };

  readonly modalSoftwareAberto = signal<boolean>(false);
  readonly softwareEmEdicao = signal<SoftwareParceiro | null>(null);
  formSoftware = {
    nome: '',
    categoria: '',
    logo_url: '',
    descricao_curta: '',
    link_oficial: '',
    ordem: 0,
    ativo: true
  };

  readonly modalEmpresaAberto = signal<boolean>(false);
  readonly empresaEmEdicao = signal<EmpresaParceira | null>(null);
  formEmpresa = {
    nome: '',
    tipo: '',
    logo_url: '',
    link_oficial: '',
    ordem: 0,
    ativo: true
  };

  async ngOnInit(): Promise<void> {
    await this.carregarTodosParceiros();
  }

  trocarAba(aba: 'professores' | 'softwares' | 'empresas'): void {
    this.abaAtiva.set(aba);
  }

  async carregarTodosParceiros(): Promise<void> {
    this.carregando.set(true);
    try {
      const [profs, softs, emps] = await Promise.all([
        this.supabaseService.listarTodosProfessoresParceirosAdmin(),
        this.supabaseService.listarTodosSoftwaresParceirosAdmin(),
        this.supabaseService.listarTodasEmpresasParceirasAdmin()
      ]);
      this.professores.set(profs);
      this.softwares.set(softs);
      this.empresas.set(emps);
    } catch (e: any) {
      this.exibirErro('Erro ao carregar parceiros: ' + (e?.message || e));
    } finally {
      this.carregando.set(false);
    }
  }

  // ==========================================
  // PROFESSORES
  // ==========================================
  abrirModalProfessor(): void {
    this.professorEmEdicao.set(null);
    this.formProfessor = {
      nome: '',
      cargo_titulo: '',
      foto_url: '',
      mini_bio: '',
      link_linkedin: '',
      ordem: this.professores().length + 1,
      ativo: true
    };
    this.modalProfessorAberto.set(true);
  }

  editarProfessor(prof: ProfessorParceiro): void {
    this.professorEmEdicao.set(prof);
    this.formProfessor = {
      nome: prof.nome,
      cargo_titulo: prof.cargo_titulo,
      foto_url: prof.foto_url || '',
      mini_bio: prof.mini_bio || '',
      link_linkedin: prof.link_linkedin || '',
      ordem: prof.ordem,
      ativo: prof.ativo
    };
    this.modalProfessorAberto.set(true);
  }

  fecharModalProfessor(): void {
    this.modalProfessorAberto.set(false);
    this.professorEmEdicao.set(null);
  }

  async salvarProfessor(
    nome: string,
    cargo: string,
    fotoUrl: string,
    miniBio: string,
    linkedin: string,
    ordem: number,
    ativo: boolean
  ): Promise<void> {
    if (!nome.trim() || !cargo.trim()) {
      this.exibirErro('Por favor, preencha o Nome e o Cargo/Título do professor.');
      return;
    }

    this.salvando.set(true);
    try {
      const payload = {
        nome: nome.trim(),
        cargo_titulo: cargo.trim(),
        foto_url: fotoUrl.trim() || null,
        mini_bio: miniBio.trim() || null,
        link_linkedin: linkedin.trim() || null,
        ordem: isNaN(ordem) ? 0 : ordem,
        ativo
      };

      const prof = this.professorEmEdicao();
      if (prof) {
        const res = await this.supabaseService.atualizarProfessorParceiro(prof.id, payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Professor atualizado com sucesso!');
      } else {
        const res = await this.supabaseService.criarProfessorParceiro(payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Professor cadastrado com sucesso!');
      }

      this.fecharModalProfessor();
      const profs = await this.supabaseService.listarTodosProfessoresParceirosAdmin();
      this.professores.set(profs);
    } catch (e: any) {
      this.exibirErro('Erro ao salvar professor: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async toggleStatusProfessor(prof: ProfessorParceiro): Promise<void> {
    try {
      const novoStatus = !prof.ativo;
      const res = await this.supabaseService.atualizarProfessorParceiro(prof.id, { ativo: novoStatus });
      if (res.error) throw res.error;
      this.exibirSucesso(`Professor ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      const profs = await this.supabaseService.listarTodosProfessoresParceirosAdmin();
      this.professores.set(profs);
    } catch (e: any) {
      this.exibirErro('Erro ao alterar status do professor.');
    }
  }

  async confirmarExcluirProfessor(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este professor parceiro?')) return;
    try {
      const res = await this.supabaseService.excluirProfessorParceiro(id);
      if (res.error) throw res.error;
      this.exibirSucesso('Professor excluído com sucesso.');
      const profs = await this.supabaseService.listarTodosProfessoresParceirosAdmin();
      this.professores.set(profs);
    } catch (e: any) {
      this.exibirErro('Erro ao excluir professor: ' + (e?.message || e));
    }
  }

  // ==========================================
  // SOFTWARES
  // ==========================================
  abrirModalSoftware(): void {
    this.softwareEmEdicao.set(null);
    this.formSoftware = {
      nome: '',
      categoria: '',
      logo_url: '',
      descricao_curta: '',
      link_oficial: '',
      ordem: this.softwares().length + 1,
      ativo: true
    };
    this.modalSoftwareAberto.set(true);
  }

  editarSoftware(soft: SoftwareParceiro): void {
    this.softwareEmEdicao.set(soft);
    this.formSoftware = {
      nome: soft.nome,
      categoria: soft.categoria || '',
      logo_url: soft.logo_url || '',
      descricao_curta: soft.descricao_curta || '',
      link_oficial: soft.link_oficial || '',
      ordem: soft.ordem,
      ativo: soft.ativo
    };
    this.modalSoftwareAberto.set(true);
  }

  fecharModalSoftware(): void {
    this.modalSoftwareAberto.set(false);
    this.softwareEmEdicao.set(null);
  }

  async salvarSoftware(
    nome: string,
    categoria: string,
    logoUrl: string,
    descricao: string,
    linkOficial: string,
    ordem: number,
    ativo: boolean
  ): Promise<void> {
    if (!nome.trim()) {
      this.exibirErro('Por favor, informe o Nome do software.');
      return;
    }

    this.salvando.set(true);
    try {
      const payload = {
        nome: nome.trim(),
        categoria: categoria.trim() || null,
        logo_url: logoUrl.trim() || null,
        descricao_curta: descricao.trim() || null,
        link_oficial: linkOficial.trim() || null,
        ordem: isNaN(ordem) ? 0 : ordem,
        ativo
      };

      const soft = this.softwareEmEdicao();
      if (soft) {
        const res = await this.supabaseService.atualizarSoftwareParceiro(soft.id, payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Software atualizado com sucesso!');
      } else {
        const res = await this.supabaseService.criarSoftwareParceiro(payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Software cadastrado com sucesso!');
      }

      this.fecharModalSoftware();
      const softs = await this.supabaseService.listarTodosSoftwaresParceirosAdmin();
      this.softwares.set(softs);
    } catch (e: any) {
      this.exibirErro('Erro ao salvar software: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async toggleStatusSoftware(soft: SoftwareParceiro): Promise<void> {
    try {
      const novoStatus = !soft.ativo;
      const res = await this.supabaseService.atualizarSoftwareParceiro(soft.id, { ativo: novoStatus });
      if (res.error) throw res.error;
      this.exibirSucesso(`Software ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      const softs = await this.supabaseService.listarTodosSoftwaresParceirosAdmin();
      this.softwares.set(softs);
    } catch (e: any) {
      this.exibirErro('Erro ao alterar status do software.');
    }
  }

  async confirmarExcluirSoftware(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este software parceiro?')) return;
    try {
      const res = await this.supabaseService.excluirSoftwareParceiro(id);
      if (res.error) throw res.error;
      this.exibirSucesso('Software excluído com sucesso.');
      const softs = await this.supabaseService.listarTodosSoftwaresParceirosAdmin();
      this.softwares.set(softs);
    } catch (e: any) {
      this.exibirErro('Erro ao excluir software: ' + (e?.message || e));
    }
  }

  // ==========================================
  // EMPRESAS
  // ==========================================
  abrirModalEmpresa(): void {
    this.empresaEmEdicao.set(null);
    this.formEmpresa = {
      nome: '',
      tipo: '',
      logo_url: '',
      link_oficial: '',
      ordem: this.empresas().length + 1,
      ativo: true
    };
    this.modalEmpresaAberto.set(true);
  }

  editarEmpresa(emp: EmpresaParceira): void {
    this.empresaEmEdicao.set(emp);
    this.formEmpresa = {
      nome: emp.nome,
      tipo: emp.tipo || '',
      logo_url: emp.logo_url || '',
      link_oficial: emp.link_oficial || '',
      ordem: emp.ordem,
      ativo: emp.ativo
    };
    this.modalEmpresaAberto.set(true);
  }

  fecharModalEmpresa(): void {
    this.modalEmpresaAberto.set(false);
    this.empresaEmEdicao.set(null);
  }

  async salvarEmpresa(
    nome: string,
    tipo: string,
    logoUrl: string,
    linkOficial: string,
    ordem: number,
    ativo: boolean
  ): Promise<void> {
    if (!nome.trim()) {
      this.exibirErro('Por favor, informe o Nome da empresa.');
      return;
    }

    this.salvando.set(true);
    try {
      const payload = {
        nome: nome.trim(),
        tipo: tipo.trim() || null,
        logo_url: logoUrl.trim() || null,
        link_oficial: linkOficial.trim() || null,
        ordem: isNaN(ordem) ? 0 : ordem,
        ativo
      };

      const emp = this.empresaEmEdicao();
      if (emp) {
        const res = await this.supabaseService.atualizarEmpresaParceira(emp.id, payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Empresa parceira atualizada com sucesso!');
      } else {
        const res = await this.supabaseService.criarEmpresaParceira(payload);
        if (res.error) throw res.error;
        this.exibirSucesso('Empresa parceira cadastrada com sucesso!');
      }

      this.fecharModalEmpresa();
      const emps = await this.supabaseService.listarTodasEmpresasParceirasAdmin();
      this.empresas.set(emps);
    } catch (e: any) {
      this.exibirErro('Erro ao salvar empresa: ' + (e?.message || e));
    } finally {
      this.salvando.set(false);
    }
  }

  async toggleStatusEmpresa(emp: EmpresaParceira): Promise<void> {
    try {
      const novoStatus = !emp.ativo;
      const res = await this.supabaseService.atualizarEmpresaParceira(emp.id, { ativo: novoStatus });
      if (res.error) throw res.error;
      this.exibirSucesso(`Empresa ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`);
      const emps = await this.supabaseService.listarTodasEmpresasParceirasAdmin();
      this.empresas.set(emps);
    } catch (e: any) {
      this.exibirErro('Erro ao alterar status da empresa.');
    }
  }

  async confirmarExcluirEmpresa(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir esta empresa parceira?')) return;
    try {
      const res = await this.supabaseService.excluirEmpresaParceira(id);
      if (res.error) throw res.error;
      this.exibirSucesso('Empresa parceira excluída com sucesso.');
      const emps = await this.supabaseService.listarTodasEmpresasParceirasAdmin();
      this.empresas.set(emps);
    } catch (e: any) {
      this.exibirErro('Erro ao excluir empresa: ' + (e?.message || e));
    }
  }

  // Utilitários de feedback
  private exibirSucesso(msg: string): void {
    this.mensagemSucesso.set(msg);
    this.mensagemErro.set(null);
    setTimeout(() => this.mensagemSucesso.set(null), 5000);
  }

  private exibirErro(msg: string): void {
    this.mensagemErro.set(msg);
    this.mensagemSucesso.set(null);
  }
}
