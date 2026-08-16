import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

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
        
        <!-- Banner Decorativo (Gradiente Slate/Indigo) -->
        <div class="h-36 sm:h-48 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
          <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        </div>

        <!-- Conteúdo do Cabeçalho -->
        <div class="px-6 sm:px-8 pb-8 pt-0 relative">
          
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            <!-- Avatar com Inicial Real -->
            <div class="flex items-end gap-4">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-600 border-4 border-white text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shrink-0 uppercase">
                {{ getInicial() }}
              </div>

              <div class="space-y-1 pb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {{ perfil().nome || 'Membro da Comunidade' }}
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{{ perfil().nivelAtual || 'Membro Ativo' }}</span>
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 font-medium">
                  {{ perfil().cargo || 'Engenheiro(a) / Arquiteto(a)' }}
                </p>
              </div>
            </div>

            <!-- Botão Editar Perfil / Salvar -->
            <div class="self-start sm:self-auto">
              @if (!editando()) {
                <button
                  type="button"
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
                    (click)="cancelarEdicao()"
                    [disabled]="salvando()"
                    class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    (click)="salvarEdicao()"
                    [disabled]="salvando()"
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
              <span class="font-black text-slate-900 text-base sm:text-lg">—</span>
              <span class="text-slate-500 font-medium">Seguidores</span>
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-base sm:text-lg">—</span>
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

      <!-- 2. Dados Profissionais e Biografia -->
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

      <!-- 3. Redes e Links Sociais -->
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
                <span class="text-[10px] font-bold text-slate-400 uppercase">LinkedIn</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().linkedin || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                ig
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Instagram</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().instagram || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                wa
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase">WhatsApp</span>
                <p class="text-xs font-semibold text-slate-800 truncate">{{ perfil().whatsapp || '—' }}</p>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                web
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Website Profissional</span>
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
                placeholder="Ex: https://meusite.com.br"
                class="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>
          </div>
        }

      </div>

      <!-- 4. Meus Posts (Publicações Reais do Membro no Feed) -->
      <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>Minhas Publicações no Feed</span>
          </h4>
          <span class="text-xs font-bold text-slate-500">
            {{ meusPosts().length }} {{ meusPosts().length === 1 ? 'post' : 'posts' }}
          </span>
        </div>

        @if (meusPosts().length === 0) {
          <!-- Estado Informativo de Nenhum Post -->
          <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
              ✍️
            </div>
            <h5 class="text-sm font-bold text-slate-800">
              Suas publicações aparecerão aqui
            </h5>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Compartilhe seu conhecimento técnico ou novidades de campo no Feed da comunidade para vê-las listadas no seu perfil.
            </p>
          </div>
        } @else {
          <!-- Lista das publicações criadas -->
          <div class="space-y-4">
            @for (post of meusPosts(); track post.id) {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                    {{ post.tag || 'Publicação' }}
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
    nivelAtual: 'Membro Ativo'
  });

  readonly editando = signal<boolean>(false);
  readonly salvando = signal<boolean>(false);
  readonly formPerfil = signal<PerfilVisual>({ ...this.perfil() });
  readonly novaSkillInput = signal<string>('');
  readonly meusPosts = signal<any[]>([]);

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
        nivelAtual: dados.nivel_atual || 'Membro Ativo'
      };
      this.perfil.set(p);
      this.formPerfil.set({ ...p, skills: [...p.skills] });
    }
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
    const n = this.perfil().nome || 'Membro';
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
    this.editando.set(true);
    this.mensagemFeedback.set(null);
  }

  cancelarEdicao(): void {
    this.editando.set(false);
    this.mensagemFeedback.set(null);
  }

  async salvarEdicao(): Promise<void> {
    if (this.salvando()) return;
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
