import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, DadosDocumentaisTecnicos } from '../../../services/supabase.service';

export interface PerfilVisual {
  nome: string;
  cargo: string;
  bio: string;
  formacao: string;
  instituicao: string;
  creaCau: string;
  especializacao: string;
  experiencia: string;
  skills: string[];
  linkedin: string;
  instagram: string;
  whatsapp: string;
  website: string;
  nivelAtual?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

@Component({
  selector: 'app-comunidade-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">

      <!-- Feedback de Sucesso/Erro -->
      @if (mensagemFeedback()) {
        <div
          [class]="tipoFeedback() === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all shadow-xs"
        >
          <span>{{ mensagemFeedback() }}</span>
          <button type="button" (click)="mensagemFeedback.set(null)" class="text-slate-400 hover:text-slate-600 font-bold ml-3 cursor-pointer">✕</button>
        </div>
      }

      <!-- 1. Cabeçalho do Perfil & Banner -->
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        <!-- Banner do Perfil (Foto ou Gradiente Decorativo) -->
        <div class="h-36 sm:h-52 relative overflow-hidden bg-slate-900 group">
          @if (editando() ? formPerfil().bannerUrl : perfil().bannerUrl) {
            <img
              [src]="editando() ? formPerfil().bannerUrl! : perfil().bannerUrl!"
              alt="Banner do Perfil"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            />
          } @else {
            <div class="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
              <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            </div>
          }

          <!-- Controles de Edição sobre o Banner (Modo Edição) -->
          @if (editando()) {
            <div class="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col justify-between p-4 sm:p-6 transition-all">
              <div class="flex items-center justify-between gap-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white/90 text-[11px] font-semibold backdrop-blur-md border border-white/10">
                  <span>📐</span>
                  <span>Banner: 1200×400px (3:1 ou 16:9) • Máx. 5MB</span>
                </span>

                <div class="flex items-center gap-2">
                  <input
                    #bannerInput
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    (change)="onSelecionarBanner($event)"
                    class="hidden"
                  />

                  <button
                    type="button"
                    (click)="bannerInput.click()"
                    [disabled]="uploadingBanner()"
                    class="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    @if (uploadingBanner()) {
                      <span class="w-3 h-3 border-2 border-slate-700/30 border-t-slate-700 rounded-full animate-spin"></span>
                      <span>Enviando...</span>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ formPerfil().bannerUrl ? 'Trocar Banner' : 'Adicionar Banner' }}</span>
                    }
                  </button>

                  @if (formPerfil().bannerUrl) {
                    <button
                      type="button"
                      (click)="removerBanner()"
                      [disabled]="uploadingBanner()"
                      class="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Remover banner e voltar ao gradiente padrão"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span class="hidden sm:inline">Remover</span>
                    </button>
                  }
                </div>
              </div>

              @if (erroUploadBanner()) {
                <div class="p-2.5 rounded-xl bg-rose-500/90 text-white text-xs font-semibold backdrop-blur-md flex items-center justify-between">
                  <span>{{ erroUploadBanner() }}</span>
                  <button type="button" (click)="erroUploadBanner.set(null)" class="text-white/80 hover:text-white font-bold ml-2">✕</button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Conteúdo do Cabeçalho -->
        <div class="px-6 sm:px-8 pb-8 pt-0 relative">
          
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            
            <!-- Bloco do Avatar (Foto real ou Inicial) -->
            <div class="flex flex-col sm:flex-row sm:items-end gap-4">
              
              <div class="relative group/avatar">
                <!-- Avatar Visual -->
                <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white shadow-lg shrink-0 overflow-hidden bg-indigo-600 flex items-center justify-center">
                  @if (editando() ? formPerfil().avatarUrl : perfil().avatarUrl) {
                    <img
                      [src]="editando() ? formPerfil().avatarUrl! : perfil().avatarUrl!"
                      [alt]="perfil().nome || 'Avatar de perfil'"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                  } @else {
                    <div class="w-full h-full text-white font-black text-3xl sm:text-4xl flex items-center justify-center uppercase">
                      {{ getInicial() }}
                    </div>
                  }
                </div>

                <!-- Ações de Avatar no Modo Edição -->
                @if (editando()) {
                  <div class="mt-2 flex items-center gap-1.5 sm:hidden">
                    <input
                      #avatarInputMobile
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      (change)="onSelecionarAvatar($event)"
                      class="hidden"
                    />
                    <button
                      type="button"
                      (click)="avatarInputMobile.click()"
                      [disabled]="uploadingAvatar()"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {{ formPerfil().avatarUrl ? 'Trocar Foto' : 'Adicionar Foto' }}
                    </button>
                    @if (formPerfil().avatarUrl) {
                      <button
                        type="button"
                        (click)="removerAvatar()"
                        class="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Remover
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Informações Textuais do Membro -->
              <div class="space-y-1 pb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {{ (editando() ? formPerfil().nome : perfil().nome) || 'Membro da Comunidade' }}
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{{ perfil().nivelAtual || 'Membro Ativo' }}</span>
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 font-medium">
                  {{ (editando() ? formPerfil().cargo : perfil().cargo) || 'Engenheiro(a) / Arquiteto(a)' }}
                </p>

                <!-- Informações e Ações de Foto no Desktop durante Edição -->
                @if (editando()) {
                  <div class="pt-2 hidden sm:flex items-center gap-2 flex-wrap animate-fadeIn">
                    <input
                      #avatarInputDesktop
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      (change)="onSelecionarAvatar($event)"
                      class="hidden"
                    />

                    <button
                      type="button"
                      (click)="avatarInputDesktop.click()"
                      [disabled]="uploadingAvatar()"
                      class="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      @if (uploadingAvatar()) {
                        <span class="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                        <span>Enviando foto...</span>
                      } @else {
                        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{{ formPerfil().avatarUrl ? 'Trocar Foto de Perfil' : 'Carregar Foto de Perfil' }}</span>
                      }
                    </button>

                    @if (formPerfil().avatarUrl) {
                      <button
                        type="button"
                        (click)="removerAvatar()"
                        [disabled]="uploadingAvatar()"
                        class="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Remover Foto
                      </button>
                    }

                    <span class="text-[11px] text-slate-400">
                      (400×400px • Máx. 2MB • JPG, PNG, WebP)
                    </span>
                  </div>

                  @if (erroUploadAvatar()) {
                    <p class="text-xs font-semibold text-rose-600 mt-1">{{ erroUploadAvatar() }}</p>
                  }
                }
              </div>
            </div>

            <!-- Botão Editar Perfil / Salvar -->
            <div class="self-start sm:self-auto">
              @if (!editando()) {
                <button
                  type="button"
                  id="btn-iniciar-edicao-perfil"
                  (click)="iniciarEdicao()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Editar Perfil</span>
                </button>
              } @else {
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-cancelar-edicao-perfil"
                    (click)="cancelarEdicao()"
                    [disabled]="salvando() || uploadingAvatar() || uploadingBanner()"
                    class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="btn-salvar-edicao-perfil"
                    (click)="salvarEdicao()"
                    [disabled]="salvando() || uploadingAvatar() || uploadingBanner()"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    @if (salvando()) {
                      <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    } @else {
                      <span>Salvar Alterações</span>
                    }
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Contadores de Conexões -->
          <div class="flex items-center gap-6 py-4 border-y border-slate-100 text-xs sm:text-sm">
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-base sm:text-lg">{{ totalSeguidores() }}</span>
              <span class="text-slate-500 font-medium">Seguidores</span>
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-base sm:text-lg">{{ totalSeguindo() }}</span>
              <span class="text-slate-500 font-medium">Seguindo</span>
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <span class="font-black text-indigo-600 text-base sm:text-lg">{{ meusPosts().length }}</span>
              <span class="text-slate-500 font-medium">Publicações</span>
            </div>
          </div>

        </div>

      </div>

      <!-- 2. Personalização Visual & Imagens (Dedicada no Modo Edição) -->
      @if (editando()) {
        <div class="bg-white rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 class="text-lg font-black text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fotos e Identidade Visual</span>
            </h4>
            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Personalização
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Bloco 1: Foto de Perfil / Avatar -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👤</span>
                  <span>Foto de Perfil (Avatar)</span>
                </span>
                <span class="text-[11px] font-semibold text-slate-500">Máx. 2MB (1:1)</span>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl border-2 border-white shadow-md shrink-0 overflow-hidden bg-indigo-600 flex items-center justify-center">
                  @if (formPerfil().avatarUrl) {
                    <img
                      [src]="formPerfil().avatarUrl!"
                      alt="Preview Avatar"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                  } @else {
                    <div class="text-white font-black text-2xl uppercase">
                      {{ getInicial() }}
                    </div>
                  }
                </div>

                <div class="space-y-1.5 flex-1 min-w-0">
                  <p class="text-xs text-slate-600 leading-snug">
                    Recomendado: <strong>400×400px</strong> em formato <strong>JPG, PNG ou WebP</strong>.
                  </p>
                  
                  <div class="flex items-center gap-2 flex-wrap pt-1">
                    <input
                      #avatarInputBox
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      (change)="onSelecionarAvatar($event)"
                      class="hidden"
                    />
                    <button
                      type="button"
                      (click)="avatarInputBox.click()"
                      [disabled]="uploadingAvatar()"
                      class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {{ formPerfil().avatarUrl ? 'Trocar Foto' : 'Carregar Foto' }}
                    </button>

                    @if (formPerfil().avatarUrl) {
                      <button
                        type="button"
                        (click)="removerAvatar()"
                        [disabled]="uploadingAvatar()"
                        class="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Remover Foto
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Bloco 2: Capa / Banner de Perfil -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>Banner de Capa</span>
                </span>
                <span class="text-[11px] font-semibold text-slate-500">Máx. 5MB (3:1 ou 16:9)</span>
              </div>

              <div class="space-y-2.5">
                <div class="h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                  @if (formPerfil().bannerUrl) {
                    <img
                      [src]="formPerfil().bannerUrl!"
                      alt="Preview Banner"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                  } @else {
                    <div class="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center text-slate-400 text-xs font-medium">
                      Gradiente padrão da Comunidade
                    </div>
                  }
                </div>

                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <p class="text-xs text-slate-600">
                    Recomendado: <strong>1200×400px</strong> (JPG, PNG, WebP).
                  </p>

                  <div class="flex items-center gap-2">
                    <input
                      #bannerInputBox
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      (change)="onSelecionarBanner($event)"
                      class="hidden"
                    />
                    <button
                      type="button"
                      (click)="bannerInputBox.click()"
                      [disabled]="uploadingBanner()"
                      class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {{ formPerfil().bannerUrl ? 'Trocar Banner' : 'Carregar Banner' }}
                    </button>

                    @if (formPerfil().bannerUrl) {
                      <button
                        type="button"
                        (click)="removerBanner()"
                        [disabled]="uploadingBanner()"
                        class="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Remover Banner
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- 3. Dados Profissionais e Biografia -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Dados Profissionais & Formação</span>
          </h4>

          @if (editando()) {
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Modo Edição Ativo
            </span>
          }
        </div>

        @if (!editando()) {
          <!-- MODO VISUALIZAÇÃO -->
          <div class="space-y-6">
            
            <!-- Bio -->
            <div class="space-y-1.5">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Biografia</span>
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {{ perfil().bio || 'Nenhuma biografia informada ainda. Clique em "Editar Perfil" para adicionar.' }}
              </p>
            </div>

            <!-- Grade de Atributos Profissionais -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Formação</span>
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ perfil().formacao || '—' }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instituição</span>
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ perfil().instituicao || '—' }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registro CREA / CAU</span>
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ perfil().creaCau || '—' }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Especialização</span>
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ perfil().especializacao || '—' }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experiência</span>
                <p class="text-xs sm:text-sm font-bold text-slate-900">{{ perfil().experiencia || '—' }}</p>
              </div>

            </div>

            <!-- Skills / Competências -->
            <div class="space-y-2 pt-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Competências Técnicas & Skills</span>
              <div class="flex items-center gap-2 flex-wrap pt-1">
                @if (perfil().skills && perfil().skills.length > 0) {
                  @for (skill of perfil().skills; track skill) {
                    <span class="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>{{ skill }}</span>
                    </span>
                  }
                } @else {
                  <span class="text-xs text-slate-400 italic">Nenhuma competência cadastrada.</span>
                }
              </div>
            </div>

          </div>
        } @else {
          <!-- MODO EDIÇÃO -->
          <div class="space-y-5">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Nome Completo (Compartilhado com Predial 4.0)</label>
                <input
                  type="text"
                  [value]="formPerfil().nome"
                  (input)="atualizarCampo('nome', $event)"
                  placeholder="Ex: Carlos Mendes"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Cargo / Título Profissional</label>
                <input
                  type="text"
                  [value]="formPerfil().cargo"
                  (input)="atualizarCampo('cargo', $event)"
                  placeholder="Ex: Engenheiro Civil & Perito"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Biografia / Apresentação</label>
              <textarea
                [value]="formPerfil().bio"
                (input)="atualizarCampo('bio', $event)"
                rows="3"
                placeholder="Conte sobre sua trajetória, atuação em campo e interesses..."
                class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl p-3.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Formação</label>
                <input
                  type="text"
                  [value]="formPerfil().formacao"
                  (input)="atualizarCampo('formacao', $event)"
                  placeholder="Ex: Engenharia Civil"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Instituição de Ensino</label>
                <input
                  type="text"
                  [value]="formPerfil().instituicao"
                  (input)="atualizarCampo('instituicao', $event)"
                  placeholder="Ex: USP / POLI"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">CREA / CAU</label>
                <input
                  type="text"
                  [value]="formPerfil().creaCau"
                  (input)="atualizarCampo('creaCau', $event)"
                  placeholder="Ex: 5069812345/SP"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Especialização Principal</label>
                <input
                  type="text"
                  [value]="formPerfil().especializacao"
                  (input)="atualizarCampo('especializacao', $event)"
                  placeholder="Ex: Perícias de Engenharia & Patologia"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Tempo de Experiência</label>
                <input
                  type="text"
                  [value]="formPerfil().experiencia"
                  (input)="atualizarCampo('experiencia', $event)"
                  placeholder="Ex: 12 anos em inspeção predial"
                  class="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            <!-- Gerenciamento de Skills -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-700">Skills & Competências Técnicas</label>
              
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  [value]="novaSkillInput()"
                  (input)="onNovaSkillInput($event)"
                  (keyup.enter)="adicionarNovaSkill()"
                  placeholder="Adicionar nova skill (ex: Termografia, NBR 15575)..."
                  class="flex-1 bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2 border border-slate-200 focus:border-indigo-500 outline-hidden"
                />
                <button
                  type="button"
                  (click)="adicionarNovaSkill()"
                  class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  + Adicionar
                </button>
              </div>

              <div class="flex items-center gap-2 flex-wrap pt-2">
                @for (skill of formPerfil().skills; track skill) {
                  <span class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    <span>{{ skill }}</span>
                    <button
                      type="button"
                      (click)="removerSkillForm(skill)"
                      class="text-slate-400 hover:text-rose-600 font-bold ml-1 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                }
              </div>
            </div>

          </div>
        }

      </div>

      <!-- 4. Dados para Documentos Técnicos & Laudos (com trava pós-confirmação) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-lg font-black text-[#132A41] flex items-center gap-2">
                <svg class="w-5 h-5 text-[#B5642A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Dados para Documentos Técnicos & Laudos</span>
              </h4>
              @if (dadosDocumentais().dados_documentais_confirmados) {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Dados Confirmados & Travados</span>
                </span>
              } @else {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Edição Liberada (Primeiro Preenchimento)</span>
                </span>
              }
            </div>
            <p class="text-xs text-slate-500">
              Informações oficiais que alimentam cabeçalhos, rodapés e ART/RRT nos laudos emitidos pelo Predial 4.0.
            </p>
          </div>
        </div>

        <!-- Banner de Orientação de Bloqueio -->
        @if (dadosDocumentais().dados_documentais_confirmados) {
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 border-l-4 border-l-[#132A41] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-slate-200/80 text-[#132A41] flex items-center justify-center shrink-0 font-bold">
                🔒
              </div>
              <div class="space-y-1">
                <p class="text-xs sm:text-sm font-bold text-slate-800">
                  Seus dados documentais estão confirmados e protegidos contra alterações acidentais.
                </p>
                <p class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  Para garantir a validade jurídica dos laudos já emitidos, as alterações nestes campos requerem solicitação à administração.
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="abrirModalSolicitarAlteracao()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4 text-[#B5642A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Solicitar Alteração</span>
            </button>
          </div>
        } @else {
          <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 border-l-4 border-l-[#B5642A] space-y-2">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-[#B5642A] flex items-center justify-center shrink-0 font-bold text-sm">
                ⚠️
              </div>
              <div class="space-y-1">
                <p class="text-xs sm:text-sm font-bold text-amber-950">
                  Preencha estes dados com calma e atenção — incluindo a logo da empresa.
                </p>
                <p class="text-[11px] sm:text-xs text-amber-900/90 leading-relaxed">
                  Após clicar em <strong>"Confirmar e Bloquear Dados"</strong>, TODOS os campos desta seção (nome para documentos, empresa, CNPJ, CREA/CAU, endereço, contatos e logomarca) ficam permanentemente bloqueados e só poderão ser alterados por um administrador.
                </p>
              </div>
            </div>
            <div class="pt-1 text-[11px] text-amber-800/80 flex items-center gap-1.5 font-medium">
              <span>💡</span>
              <span>Os dados ficam salvos na sua conta e preenchem automaticamente os laudos técnicos e orçamentos, em qualquer dispositivo que você usar.</span>
            </div>
          </div>
        }

        <!-- Formulário dos Campos Técnicos -->
        <div class="space-y-5">
          
          <!-- Linha 1: Nome Completo & Título Profissional -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Nome Completo (para Documentos e Laudos) *</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().full_name"
                (input)="atualizarCampoDocumental('full_name', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Dr. Carlos Eduardo Mendes de Amorim"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
              <p class="text-[11px] text-slate-400">
                Nome civil oficial que constará em laudos periciais e emissão de ART/RRT.
              </p>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Título Profissional *</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().professional_title || ''"
                (input)="atualizarCampoDocumental('professional_title', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Engenheiro Civil e Perito Judicial"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
              <p class="text-[11px] text-slate-400">
                Ex: Engenheiro Civil / Arquiteto e Urbanista / Perito em Patologia Predial.
              </p>
            </div>
          </div>

          <!-- Linha 2: Categoria Profissional & CREA/CAU -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Categoria Profissional *</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <select
                [value]="formDadosDocumentais().categoria_profissional || 'Engenheiro(a) Civil (CREA)'"
                (change)="atualizarCampoDocumental('categoria_profissional', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900 cursor-pointer"
              >
                <option value="Engenheiro(a) Civil (CREA)">Engenheiro(a) Civil (CREA)</option>
                <option value="Arquiteto(a) e Urbanista (CAU)">Arquiteto(a) e Urbanista (CAU)</option>
                <option value="Engenheiro(a) Eletricista (CREA)">Engenheiro(a) Eletricista (CREA)</option>
                <option value="Engenheiro(a) Mecânico (CREA)">Engenheiro(a) Mecânico (CREA)</option>
                <option value="Engenheiro(a) de Segurança do Trabalho (CREA)">Engenheiro(a) de Segurança do Trabalho (CREA)</option>
                <option value="Técnico(a) em Edificações (CFT)">Técnico(a) em Edificações (CFT)</option>
                <option value="Perito(a) Judicial / Avaliador(a)">Perito(a) Judicial / Avaliador(a)</option>
                <option value="Outro">Outro</option>
              </select>
              <p class="text-[11px] text-slate-400">
                Define a base legal citada na Seção 2.0 do laudo técnico emitido.
              </p>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Registro Profissional (CREA / CAU / CFT) *</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().crea_cau || ''"
                (input)="atualizarCampoDocumental('crea_cau', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: 5069812345/SP ou 12345-D/MG"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
              <p class="text-[11px] text-slate-400">
                Número do seu registro profissional no conselho de classe.
              </p>
            </div>
          </div>

          <!-- Linha 3: Razão Social, Nome Fantasia & CNPJ -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Razão Social (Oficial)</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().razao_social || formDadosDocumentais().company_name || ''"
                (input)="atualizarCampoDocumental('razao_social', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Amorim Engenharia e Construções Ltda."
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
              <p class="text-[10px] text-slate-400">Nome jurídico oficial utilizado nas declarações e propostas.</p>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Nome Fantasia / Marca</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().company_name || ''"
                (input)="atualizarCampoDocumental('company_name', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Amorim Engenharia"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">CNPJ da Empresa</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().company_cnpj || ''"
                (input)="atualizarCampoDocumental('company_cnpj', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: 00.000.000/0001-00"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <!-- Linha 3.5: Responsável Legal, CPF & Cargo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">CPF do Responsável / Representante Legal</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().cpf_responsavel || ''"
                (input)="atualizarCampoDocumental('cpf_responsavel', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: 000.000.000-00"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
              <p class="text-[10px] text-slate-400">Usado para assinaturas nas declarações de licitações e laudos.</p>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Cargo / Função na Empresa</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().company_position || ''"
                (input)="atualizarCampoDocumental('company_position', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Sócio-Administrador / Responsável Técnico"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <!-- Linha 4: Endereço Comercial Completo -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700">Endereço Comercial da Empresa</label>
              @if (dadosDocumentais().dados_documentais_confirmados) {
                <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
              }
            </div>
            <input
              type="text"
              [value]="formDadosDocumentais().company_address || ''"
              (input)="atualizarCampoDocumental('company_address', $event)"
              [disabled]="dadosDocumentais().dados_documentais_confirmados"
              placeholder="Ex: Av. Paulista, 1000 - Conjunto 42 - Bela Vista, São Paulo/SP - CEP 01310-100"
              class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
            />
          </div>

          <!-- Linha 5: Telefones, E-mail Comercial & Site -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Telefone / WhatsApp Comercial</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().company_phone || ''"
                (input)="atualizarCampoDocumental('company_phone', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: (11) 3456-7890"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">E-mail Institucional / Comercial</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="email"
                [value]="formDadosDocumentais().company_email || ''"
                (input)="atualizarCampoDocumental('company_email', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: laudos@amorimengenharia.com"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Site da Empresa</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().company_site || ''"
                (input)="atualizarCampoDocumental('company_site', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: https://amorimengenharia.com"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <!-- Linha 6: Rede Social nos Documentos (Rótulo + URL) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Rede Social Institucional (Rótulo)</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().social_network_label || ''"
                (input)="atualizarCampoDocumental('social_network_label', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: Instagram / LinkedIn / YouTube"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700">Link da Rede Social no Documento</label>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <input
                type="text"
                [value]="formDadosDocumentais().social_network_url || ''"
                (input)="atualizarCampoDocumental('social_network_url', $event)"
                [disabled]="dadosDocumentais().dados_documentais_confirmados"
                placeholder="Ex: https://instagram.com/amorimengenharia"
                class="w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border transition-all outline-hidden font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:border-slate-200 disabled:cursor-not-allowed bg-slate-50 border-slate-200 focus:border-[#132A41] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <!-- Linha 7: Logomarca da Empresa para Documentos Técnicos -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[#132A41] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏢</span>
                  <span>Logomarca da Empresa para Laudos e PDFs</span>
                </span>
                @if (dadosDocumentais().dados_documentais_confirmados) {
                  <span class="text-[10px] text-slate-400 font-semibold">🔒 Bloqueado</span>
                }
              </div>
              <span class="text-[11px] font-semibold text-slate-500">Máx. 5MB • Formatos JPG, PNG ou WebP</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <!-- Preview da Logo -->
              <div class="w-32 h-20 rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0 flex items-center justify-center p-2 overflow-hidden">
                @if (formDadosDocumentais().company_logo_url) {
                  <img
                    [src]="formDadosDocumentais().company_logo_url!"
                    alt="Logo da Empresa"
                    class="max-w-full max-h-full object-contain"
                    referrerpolicy="no-referrer"
                  />
                } @else {
                  <div class="text-center text-[10px] font-bold text-slate-400 leading-tight">
                    <span>Sem Logo</span>
                  </div>
                }
              </div>

              <!-- Controles de Upload de Logo -->
              <div class="space-y-2 flex-1 min-w-0">
                <p class="text-xs text-slate-600 leading-relaxed">
                  Aparece automaticamente no cabeçalho e rodapé dos laudos técnicos (LTIP), orçamentos e relatórios periciais gerados.
                </p>

                @if (!dadosDocumentais().dados_documentais_confirmados) {
                  <div class="flex items-center gap-2 flex-wrap pt-1">
                    <input
                      #logoInput
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      (change)="onSelecionarLogoEmpresa($event)"
                      class="hidden"
                    />

                    <button
                      type="button"
                      (click)="logoInput.click()"
                      [disabled]="uploadingLogo()"
                      class="px-3.5 py-1.5 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      @if (uploadingLogo()) {
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Enviando logo...</span>
                      } @else {
                        <svg class="w-3.5 h-3.5 text-[#B5642A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{{ formDadosDocumentais().company_logo_url ? 'Trocar Logomarca' : 'Carregar Logomarca' }}</span>
                      }
                    </button>

                    @if (formDadosDocumentais().company_logo_url) {
                      <button
                        type="button"
                        (click)="removerLogoEmpresa()"
                        [disabled]="uploadingLogo()"
                        class="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Remover Logo
                      </button>
                    }
                  </div>

                  @if (erroUploadLogo()) {
                    <p class="text-xs font-semibold text-rose-600 mt-1">{{ erroUploadLogo() }}</p>
                  }
                } @else {
                  <p class="text-xs font-medium text-slate-500 italic">
                    {{ formDadosDocumentais().company_logo_url ? 'Logomarca confirmada e protegida contra alterações.' : 'Nenhuma logomarca cadastrada no momento da confirmação.' }}
                  </p>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- Ações do Rodapé da Seção Documental -->
        @if (!dadosDocumentais().dados_documentais_confirmados) {
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <p class="text-xs text-slate-500 leading-relaxed">
              Você pode salvar um rascunho temporário ou confirmar definitivamente para travar os dados.
            </p>

            <div class="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                id="btn-salvar-rascunho-documental"
                (click)="salvarRascunhoDocumentais()"
                [disabled]="salvandoDocumentais() || confirmandoDocumentais() || uploadingLogo()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                @if (salvandoDocumentais()) {
                  <span>Salvando rascunho...</span>
                } @else {
                  <span>Salvar Rascunho</span>
                }
              </button>

              <button
                type="button"
                id="btn-abrir-confirmar-bloquear-documental"
                (click)="abrirModalConfirmarTrava()"
                [disabled]="salvandoDocumentais() || confirmandoDocumentais() || uploadingLogo()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#9d5320] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Confirmar e Bloquear Dados Técnicos</span>
              </button>
            </div>
          </div>
        }

      </div>

      <!-- 5. Redes e Links Sociais -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Conexões & Redes Sociais</span>
          </h4>
        </div>

        @if (!editando()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                in
              </div>
              <div class="min-w-0">
                <span class="text-[11px] font-bold text-slate-400 uppercase">LinkedIn</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().linkedin || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                ig
              </div>
              <div class="min-w-0">
                <span class="text-[11px] font-bold text-slate-400 uppercase">Instagram</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().instagram || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                wa
              </div>
              <div class="min-w-0">
                <span class="text-[11px] font-bold text-slate-400 uppercase">WhatsApp</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().whatsapp || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                web
              </div>
              <div class="min-w-0">
                <span class="text-[11px] font-bold text-slate-400 uppercase">Website Profissional</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().website || '—' }}</p>
              </div>
            </div>

          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">LinkedIn (URL ou @)</label>
              <input
                type="text"
                [value]="formPerfil().linkedin"
                (input)="atualizarCampo('linkedin', $event)"
                placeholder="Ex: linkedin.com/in/perfil"
                class="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Instagram (@usuario)</label>
              <input
                type="text"
                [value]="formPerfil().instagram"
                (input)="atualizarCampo('instagram', $event)"
                placeholder="Ex: @engenharia.pratica"
                class="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">WhatsApp Comercial</label>
              <input
                type="text"
                [value]="formPerfil().whatsapp"
                (input)="atualizarCampo('whatsapp', $event)"
                placeholder="Ex: +55 (11) 99999-9999"
                class="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700">Website Profissional</label>
              <input
                type="text"
                [value]="formPerfil().website"
                (input)="atualizarCampo('website', $event)"
                placeholder="Ex: https://meuescritorio.com.br"
                class="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>
        }

      </div>

      <!-- 5. Minhas Atividades & Publicações -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>Minhas Publicações no Feed</span>
          </h4>
          <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {{ meusPosts().length }} {{ meusPosts().length === 1 ? 'post' : 'posts' }}
          </span>
        </div>

        @if (meusPosts().length === 0) {
          <div class="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <div class="text-3xl">📝</div>
            <p class="text-xs sm:text-sm font-bold text-slate-700">Você ainda não compartilhou publicações no Feed.</p>
            <p class="text-xs text-slate-400">Vá até a aba "Feed" e publique sua primeira dica técnica ou dúvida!</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (post of meusPosts(); track post.id) {
              <div class="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                    {{ post.tag || 'Geral' }}
                  </span>
                  <span class="text-slate-400">{{ formatarTempo(post.criado_em) }}</span>
                </div>

                <p class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {{ post.conteudo }}
                </p>

                <div class="pt-2 border-t border-slate-200/60 flex items-center gap-4 text-xs text-slate-500 font-semibold">
                  <span>❤️ {{ post.totalCurtidas || (post.curtidas ? post.curtidas.length : 0) }} curtidas</span>
                  <span>💬 {{ post.comentarios ? post.comentarios.length : 0 }} comentários</span>
                </div>
              </div>
            }
          </div>
        }

      </div>

      <!-- MODAL DE CONFIRMAÇÃO DE TRAVA DOS DADOS TÉCNICOS -->
      @if (modalConfirmarTravaAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5">
            
            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div class="w-10 h-10 rounded-2xl bg-amber-100 text-[#B5642A] flex items-center justify-center font-bold text-lg shrink-0">
                🔒
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900">Confirmar e Bloquear Dados</h3>
                <p class="text-xs text-slate-500 font-medium">Ação permanente de proteção de dados documentais</p>
              </div>
            </div>

            <div class="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
              <p class="font-bold text-amber-950">
                Você tem certeza de que deseja confirmar estes dados técnicos?
              </p>
              <p>
                Após a confirmação:
              </p>
              <ul class="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                <li>Todos os campos da seção técnica serão <strong>bloqueados para edição direta</strong>.</li>
                <li>Os laudos técnicos, ART/RRT e orçamentos passarão a usar estas informações oficiais.</li>
                <li>Qualquer alteração futura precisará ser solicitada ao administrador do sistema.</li>
              </ul>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                (click)="fecharModalConfirmarTrava()"
                [disabled]="confirmandoDocumentais()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                id="btn-confirmar-trava-definitiva"
                (click)="executarConfirmarEBloquear()"
                [disabled]="confirmandoDocumentais()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                @if (confirmandoDocumentais()) {
                  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Confirmando...</span>
                } @else {
                  <span>Sim, Confirmar e Bloquear</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL DE SOLICITAÇÃO DE ALTERAÇÃO DE DADOS TÉCNICOS -->
      @if (modalSolicitarAlteracaoAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#132A41] flex items-center justify-center font-bold text-lg shrink-0">
                  📩
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-black text-slate-900">Solicitar Alteração de Dados</h3>
                  <p class="text-xs text-slate-500 font-medium">Envio direto para a administração</p>
                </div>
              </div>
              <button
                type="button"
                (click)="fecharModalSolicitarAlteracao()"
                class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            @if (sucessoSolicitacao()) {
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-2">
                <div class="flex items-center gap-2 font-bold text-emerald-800">
                  <span class="text-lg">✅</span>
                  <span>Solicitação enviada com sucesso!</span>
                </div>
                <p class="text-xs text-emerald-700">
                  O administrador foi notificado por e-mail e analisará os dados solicitados. Você receberá um retorno em breve.
                </p>
              </div>
              <div class="flex justify-end pt-2">
                <button
                  type="button"
                  (click)="fecharModalSolicitarAlteracao()"
                  class="px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            } @else {
              <div class="space-y-4">
                <p class="text-xs text-slate-600 leading-relaxed">
                  Informe abaixo quais dados você precisa atualizar (ex: alteração de razão social, novo número de registro CREA/CAU, troca de endereço ou nova logomarca) e o motivo da mudança:
                </p>

                @if (erroSolicitacao()) {
                  <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {{ erroSolicitacao() }}
                  </div>
                }

                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-slate-700">Detalhes da Solicitação *</label>
                  <textarea
                    [value]="motivoSolicitacao()"
                    (input)="onMotivoSolicitacaoInput($event)"
                    rows="4"
                    placeholder="Descreva aqui com clareza os campos que deseja alterar e os novos valores..."
                    class="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 rounded-xl p-3.5 border border-slate-200 focus:border-[#132A41] focus:bg-white outline-hidden resize-none font-medium"
                  ></textarea>
                </div>

                <div class="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    (click)="fecharModalSolicitarAlteracao()"
                    [disabled]="enviandoSolicitacao()"
                    class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="btn-enviar-solicitacao-documental"
                    (click)="enviarSolicitacaoAlteracao()"
                    [disabled]="enviandoSolicitacao() || !motivoSolicitacao().trim()"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    @if (enviandoSolicitacao()) {
                      <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Enviando...</span>
                    } @else {
                      <span>Enviar Solicitação ao Suporte</span>
                    }
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `
})
export class ComunidadePerfilComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly perfil = signal<PerfilVisual>({
    nome: '',
    cargo: '',
    bio: '',
    formacao: '',
    instituicao: '',
    creaCau: '',
    especializacao: '',
    experiencia: '',
    skills: [],
    linkedin: '',
    instagram: '',
    whatsapp: '',
    website: '',
    nivelAtual: 'Membro Ativo',
    avatarUrl: null,
    bannerUrl: null
  });

  // Estado dos Dados Técnicos Documentais (com trava pós-confirmação)
  readonly dadosDocumentais = signal<DadosDocumentaisTecnicos>({
    full_name: '',
    professional_title: '',
    categoria_profissional: 'Engenheiro(a) Civil (CREA)',
    crea_cau: '',
    company_name: '',
    company_position: '',
    company_cnpj: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_site: '',
    social_network_label: 'Instagram',
    social_network_url: '',
    company_logo_url: null,
    dados_documentais_confirmados: false
  });

  readonly formDadosDocumentais = signal<DadosDocumentaisTecnicos>({ ...this.dadosDocumentais() });
  readonly salvandoDocumentais = signal<boolean>(false);
  readonly confirmandoDocumentais = signal<boolean>(false);
  readonly uploadingLogo = signal<boolean>(false);
  readonly erroUploadLogo = signal<string | null>(null);

  readonly modalConfirmarTravaAberto = signal<boolean>(false);
  readonly modalSolicitarAlteracaoAberto = signal<boolean>(false);
  readonly motivoSolicitacao = signal<string>('');
  readonly enviandoSolicitacao = signal<boolean>(false);
  readonly sucessoSolicitacao = signal<boolean>(false);
  readonly erroSolicitacao = signal<string | null>(null);

  readonly editando = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly formPerfil = signal<PerfilVisual>({ ...this.perfil() });
  readonly novaSkillInput = signal<string>('');
  readonly meusPosts = signal<any[]>([]);

  readonly uploadingAvatar = signal<boolean>(false);
  readonly uploadingBanner = signal<boolean>(false);
  readonly erroUploadAvatar = signal<string | null>(null);
  readonly erroUploadBanner = signal<string | null>(null);

  readonly totalSeguidores = signal<number>(0);
  readonly totalSeguindo = signal<number>(0);

  readonly mensagemFeedback = signal<string | null>(null);
  readonly tipoFeedback = signal<'sucesso' | 'erro'>('sucesso');

  async ngOnInit(): Promise<void> {
    await this.carregarPerfil();
    await this.carregarMeusPosts();
  }

  async carregarPerfil(): Promise<void> {
    const dados = await this.supabaseService.obterMeuPerfilCompleto();
    if (dados) {
      const p: PerfilVisual = {
        nome: dados.full_name || '',
        cargo: dados.professional_title || '',
        bio: dados.bio || '',
        formacao: dados.formacao || '',
        instituicao: dados.instituicao || '',
        creaCau: dados.crea_cau || '',
        especializacao: dados.especializacao || '',
        experiencia: dados.anos_experiencia || '',
        skills: Array.isArray(dados.skills) ? dados.skills : [],
        linkedin: dados.linkedin_url || '',
        instagram: dados.instagram_url || '',
        whatsapp: dados.whatsapp_url || '',
        website: dados.website_url || '',
        nivelAtual: dados.nivel_atual || 'Membro Ativo',
        avatarUrl: dados.avatar_url || null,
        bannerUrl: dados.banner_url || null
      };
      this.perfil.set(p);
      this.formPerfil.set({ ...p, skills: [...p.skills] });

      const doc: DadosDocumentaisTecnicos = {
        full_name: dados.full_name || '',
        professional_title: dados.professional_title || '',
        categoria_profissional: dados.categoria_profissional || 'Engenheiro(a) Civil (CREA)',
        crea_cau: dados.crea_cau || '',
        company_name: dados.company_name || '',
        company_position: dados.company_position || '',
        company_cnpj: dados.company_cnpj || '',
        company_address: dados.company_address || '',
        company_phone: dados.company_phone || '',
        company_email: dados.company_email || '',
        company_site: dados.company_site || '',
        social_network_label: dados.social_network_label || 'Instagram',
        social_network_url: dados.social_network_url || '',
        company_logo_url: dados.company_logo_url || null,
        dados_documentais_confirmados: Boolean(dados.dados_documentais_confirmados)
      };
      this.dadosDocumentais.set(doc);
      this.formDadosDocumentais.set({ ...doc });
    }

    try {
      const session = await this.supabaseService.getSession();
      if (session?.user?.id) {
        const contadores = await this.supabaseService.obterContadoresConexoes(session.user.id);
        this.totalSeguidores.set(contadores.totalSeguidores);
        this.totalSeguindo.set(contadores.totalSeguindo);
      }
    } catch (e) {
      console.warn('Erro ao carregar contadores de conexões:', e);
    }
  }

  // --- MÉTODOS DE DADOS DOCUMENTAIS TÉCNICOS ---

  atualizarCampoDocumental(campo: keyof DadosDocumentaisTecnicos, event: Event): void {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.formDadosDocumentais.update(d => ({
      ...d,
      [campo]: target.value
    }));
  }

  async onSelecionarLogoEmpresa(event: Event): Promise<void> {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.erroUploadLogo.set(null);

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type.toLowerCase())) {
      this.erroUploadLogo.set('Formato inválido. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.erroUploadLogo.set('A logomarca deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    this.uploadingLogo.set(true);
    const { error, url } = await this.supabaseService.uploadImagemPerfil('logo', file);
    this.uploadingLogo.set(false);
    input.value = '';

    if (error || !url) {
      this.erroUploadLogo.set('Erro ao enviar logomarca: ' + (error?.message || 'Tente novamente.'));
      return;
    }

    this.formDadosDocumentais.update(d => ({
      ...d,
      company_logo_url: url
    }));
  }

  removerLogoEmpresa(): void {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    this.formDadosDocumentais.update(d => ({
      ...d,
      company_logo_url: null
    }));
    this.erroUploadLogo.set(null);
  }

  async salvarRascunhoDocumentais(): Promise<void> {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    this.salvandoDocumentais.set(true);
    this.mensagemFeedback.set(null);

    const f = this.formDadosDocumentais();
    const { error } = await this.supabaseService.salvarDadosDocumentaisUsuario({
      full_name: f.full_name.trim() || undefined,
      professional_title: f.professional_title?.trim() || undefined,
      categoria_profissional: f.categoria_profissional?.trim() || undefined,
      crea_cau: f.crea_cau?.trim() || undefined,
      company_name: f.company_name?.trim() || undefined,
      company_position: f.company_position?.trim() || undefined,
      company_cnpj: f.company_cnpj?.trim() || undefined,
      company_address: f.company_address?.trim() || undefined,
      company_phone: f.company_phone?.trim() || undefined,
      company_email: f.company_email?.trim() || undefined,
      company_site: f.company_site?.trim() || undefined,
      social_network_label: f.social_network_label?.trim() || undefined,
      social_network_url: f.social_network_url?.trim() || undefined,
      company_logo_url: f.company_logo_url !== undefined ? f.company_logo_url : null,
      dados_documentais_confirmados: false
    });

    this.salvandoDocumentais.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao salvar rascunho: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.dadosDocumentais.set({ ...f, dados_documentais_confirmados: false });
    // Se o nome foi atualizado, sincroniza no perfil social
    if (f.full_name.trim()) {
      this.perfil.update(p => ({ ...p, nome: f.full_name.trim() }));
      this.formPerfil.update(p => ({ ...p, nome: f.full_name.trim() }));
    }
    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Rascunho dos dados técnicos salvo com sucesso!');
  }

  abrirModalConfirmarTrava(): void {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    this.modalConfirmarTravaAberto.set(true);
  }

  fecharModalConfirmarTrava(): void {
    this.modalConfirmarTravaAberto.set(false);
  }

  async executarConfirmarEBloquear(): Promise<void> {
    if (this.dadosDocumentais().dados_documentais_confirmados) return;
    this.confirmandoDocumentais.set(true);

    const f = this.formDadosDocumentais();
    const { error } = await this.supabaseService.salvarDadosDocumentaisUsuario({
      full_name: f.full_name.trim() || undefined,
      professional_title: f.professional_title?.trim() || undefined,
      categoria_profissional: f.categoria_profissional?.trim() || undefined,
      crea_cau: f.crea_cau?.trim() || undefined,
      company_name: f.company_name?.trim() || undefined,
      company_position: f.company_position?.trim() || undefined,
      company_cnpj: f.company_cnpj?.trim() || undefined,
      company_address: f.company_address?.trim() || undefined,
      company_phone: f.company_phone?.trim() || undefined,
      company_email: f.company_email?.trim() || undefined,
      company_site: f.company_site?.trim() || undefined,
      social_network_label: f.social_network_label?.trim() || undefined,
      social_network_url: f.social_network_url?.trim() || undefined,
      company_logo_url: f.company_logo_url !== undefined ? f.company_logo_url : null,
      dados_documentais_confirmados: true
    });

    this.confirmandoDocumentais.set(false);
    this.modalConfirmarTravaAberto.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao confirmar dados: ' + (error.message || 'Tente novamente.'));
      return;
    }

    const docAtualizado: DadosDocumentaisTecnicos = { ...f, dados_documentais_confirmados: true };
    this.dadosDocumentais.set(docAtualizado);
    this.formDadosDocumentais.set(docAtualizado);

    if (f.full_name.trim()) {
      this.perfil.update(p => ({ ...p, nome: f.full_name.trim() }));
      this.formPerfil.update(p => ({ ...p, nome: f.full_name.trim() }));
    }

    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Dados para documentos técnicos confirmados e bloqueados com sucesso!');
  }

  abrirModalSolicitarAlteracao(): void {
    this.motivoSolicitacao.set('');
    this.sucessoSolicitacao.set(false);
    this.erroSolicitacao.set(null);
    this.modalSolicitarAlteracaoAberto.set(true);
  }

  fecharModalSolicitarAlteracao(): void {
    this.modalSolicitarAlteracaoAberto.set(false);
    this.motivoSolicitacao.set('');
    this.sucessoSolicitacao.set(false);
    this.erroSolicitacao.set(null);
  }

  onMotivoSolicitacaoInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.motivoSolicitacao.set(target.value);
  }

  async enviarSolicitacaoAlteracao(): Promise<void> {
    const motivo = this.motivoSolicitacao().trim();
    if (!motivo) {
      this.erroSolicitacao.set('Por favor, descreva quais dados você deseja alterar e o motivo.');
      return;
    }

    this.enviandoSolicitacao.set(true);
    this.erroSolicitacao.set(null);

    const { error } = await this.supabaseService.solicitarAlteracaoDadosDocumentais(motivo);
    this.enviandoSolicitacao.set(false);

    if (error) {
      this.erroSolicitacao.set('Erro ao enviar solicitação: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.sucessoSolicitacao.set(true);
  }

  async carregarMeusPosts(): Promise<void> {
    try {
      const session = await this.supabaseService.getSession();
      if (!session?.user) return;
      const todosPosts = await this.supabaseService.listarFeedPosts();
      const meus = (todosPosts || []).filter((p: any) => p.autor_id === session.user.id);
      this.meusPosts.set(meus);
    } catch (e) {
      console.warn('Erro ao carregar posts do usuário:', e);
    }
  }

  getInicial(): string {
    const n = (this.editando() ? this.formPerfil().nome : this.perfil().nome) || 'Membro';
    return n.charAt(0).toUpperCase() || 'M';
  }

  formatarTempo(dataIso: string | undefined): string {
    if (!dataIso) return 'Agora';
    try {
      const data = new Date(dataIso);
      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHoras = Math.floor(diffMin / 60);
      const diffDias = Math.floor(diffHoras / 24);

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `há ${diffMin} min`;
      if (diffHoras < 24) return `há ${diffHoras}h`;
      if (diffDias < 7) return `há ${diffDias}d`;

      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Recentemente';
    }
  }

  iniciarEdicao(): void {
    this.formPerfil.set({
      ...this.perfil(),
      skills: [...this.perfil().skills]
    });
    this.erroUploadAvatar.set(null);
    this.erroUploadBanner.set(null);
    this.editando.set(true);
    this.mensagemFeedback.set(null);
  }

  cancelarEdicao(): void {
    this.editando.set(false);
    this.erroUploadAvatar.set(null);
    this.erroUploadBanner.set(null);
    this.mensagemFeedback.set(null);
  }

  async onSelecionarAvatar(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.erroUploadAvatar.set(null);

    // Validações client-side
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type.toLowerCase())) {
      this.erroUploadAvatar.set('Formato inválido. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.erroUploadAvatar.set('A foto de perfil deve ter no máximo 2 MB.');
      input.value = '';
      return;
    }

    this.uploadingAvatar.set(true);
    const { error, url } = await this.supabaseService.uploadImagemPerfil('avatar', file);
    this.uploadingAvatar.set(false);
    input.value = '';

    if (error || !url) {
      this.erroUploadAvatar.set('Erro ao enviar imagem: ' + (error?.message || 'Tente novamente.'));
      return;
    }

    this.formPerfil.update(p => ({
      ...p,
      avatarUrl: url
    }));
  }

  removerAvatar(): void {
    this.formPerfil.update(p => ({
      ...p,
      avatarUrl: null
    }));
    this.erroUploadAvatar.set(null);
  }

  async onSelecionarBanner(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.erroUploadBanner.set(null);

    // Validações client-side
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type.toLowerCase())) {
      this.erroUploadBanner.set('Formato inválido. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.erroUploadBanner.set('O banner deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }

    this.uploadingBanner.set(true);
    const { error, url } = await this.supabaseService.uploadImagemPerfil('banner', file);
    this.uploadingBanner.set(false);
    input.value = '';

    if (error || !url) {
      this.erroUploadBanner.set('Erro ao enviar imagem: ' + (error?.message || 'Tente novamente.'));
      return;
    }

    this.formPerfil.update(p => ({
      ...p,
      bannerUrl: url
    }));
  }

  removerBanner(): void {
    this.formPerfil.update(p => ({
      ...p,
      bannerUrl: null
    }));
    this.erroUploadBanner.set(null);
  }

  async salvarEdicao(): Promise<void> {
    if (this.salvando() || this.uploadingAvatar() || this.uploadingBanner()) return;
    this.salvando.set(true);
    this.mensagemFeedback.set(null);

    const f = this.formPerfil();
    const { error } = await this.supabaseService.atualizarMeuPerfilCompleto({
      fullName: f.nome.trim() || undefined,
      professionalTitle: f.cargo.trim() || undefined,
      bio: f.bio.trim() || undefined,
      formacao: f.formacao.trim() || undefined,
      instituicao: f.instituicao.trim() || undefined,
      creaCau: f.creaCau.trim() || undefined,
      especializacao: f.especializacao.trim() || undefined,
      anosExperiencia: f.experiencia.trim() || undefined,
      skills: f.skills,
      linkedinUrl: f.linkedin.trim() || undefined,
      instagramUrl: f.instagram.trim() || undefined,
      whatsappUrl: f.whatsapp.trim() || undefined,
      websiteUrl: f.website.trim() || undefined,
      avatarUrl: f.avatarUrl !== undefined ? f.avatarUrl : null,
      bannerUrl: f.bannerUrl !== undefined ? f.bannerUrl : null,
    });

    this.salvando.set(false);

    if (error) {
      this.tipoFeedback.set('erro');
      this.mensagemFeedback.set('Erro ao salvar perfil: ' + (error.message || 'Tente novamente.'));
      return;
    }

    this.perfil.set({ ...f });
    this.editando.set(false);
    this.tipoFeedback.set('sucesso');
    this.mensagemFeedback.set('Perfil profissional atualizado com sucesso!');
  }

  atualizarCampo(campo: keyof PerfilVisual, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.formPerfil.update(p => ({
      ...p,
      [campo]: target.value
    }));
  }

  onNovaSkillInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.novaSkillInput.set(target.value);
  }

  adicionarNovaSkill(): void {
    const s = this.novaSkillInput().trim();
    if (!s) return;
    this.formPerfil.update(p => {
      if (p.skills.includes(s)) return p;
      return {
        ...p,
        skills: [...p.skills, s]
      };
    });
    this.novaSkillInput.set('');
  }

  removerSkillForm(skill: string): void {
    this.formPerfil.update(p => ({
      ...p,
      skills: p.skills.filter(s => s !== skill)
    }));
  }
}
