// REGRA DE NEGÓCIO (a implementar quando o Supabase estiver conectado):
// A conclusão deste curso (com certificado emitido) é pré-requisito para
// liberar o uso de um módulo específico no app Predial 4.0. A tabela de
// matrícula/progresso deste curso, quando criada, precisa ser consultável
// pelo Predial 4.0 (mesmo projeto Supabase compartilhado) para validar
// esse pré-requisito automaticamente.

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { HallFamaComponent } from './hall-fama.component';
import { ComunidadeCursoComponent } from './comunidade/comunidade-curso.component';
import { ComunidadeFeedComponent } from './comunidade/comunidade-feed.component';
import { ComunidadePerfilComponent } from './comunidade/comunidade-perfil.component';
import { ComunidadeVagasComponent } from './comunidade/comunidade-vagas.component';
import { ComunidadeMateriaisComponent } from './comunidade/comunidade-materiais.component';
import { ComunidadeEventosComponent } from './comunidade/comunidade-eventos.component';
import { ComunidadeForumComponent } from './comunidade/comunidade-forum.component';
import { ComunidadeMensagensComponent } from './comunidade/comunidade-mensagens.component';
import { ComunidadeAgentesComponent } from './comunidade/comunidade-agentes.component';

@Component({
  selector: 'app-comunidade-preview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HallFamaComponent,
    ComunidadeCursoComponent,
    ComunidadeFeedComponent,
    ComunidadePerfilComponent,
    ComunidadeVagasComponent,
    ComunidadeMateriaisComponent,
    ComunidadeEventosComponent,
    ComunidadeForumComponent,
    ComunidadeMensagensComponent,
    ComunidadeAgentesComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col relative pb-20 md:pb-0">
      
      <div class="flex-1 flex flex-col md:flex-row">
        
        <!-- Sidebar Desktop (md: e acima) -->
        <aside class="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-200 flex-col justify-between p-6 shrink-0 shadow-xs">
          <div class="space-y-6">
            
            <!-- Card do Usuário Autenticado -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-inner shrink-0 uppercase">
                {{ getInicialUsuario() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-black text-slate-900 truncate" [title]="getNomeUsuario()">
                  {{ getNomeUsuario() }}
                </div>
                <div class="text-[11px] font-semibold text-emerald-600 truncate flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{{ getNivelUsuario() }}</span>
                </div>
              </div>
            </div>

            <!-- Navegação Vertical (10 Áreas) -->
            <nav class="space-y-1 text-sm font-medium">
              
              <!-- 1. Feed -->
              <button
                type="button"
                id="sidebar-btn-feed"
                (click)="selecionarAba('feed')"
                [class]="abaAtiva() === 'feed'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>Feed</span>
              </button>

              <!-- 2. Fórum -->
              <button
                type="button"
                id="sidebar-btn-forum"
                (click)="selecionarAba('forum')"
                [class]="abaAtiva() === 'forum'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Fórum</span>
              </button>

              <!-- 3. Vagas -->
              <button
                type="button"
                id="sidebar-btn-vagas"
                (click)="selecionarAba('vagas')"
                [class]="abaAtiva() === 'vagas'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Vagas</span>
              </button>

              <!-- 4. Materiais -->
              <button
                type="button"
                id="sidebar-btn-materiais"
                (click)="selecionarAba('materiais')"
                [class]="abaAtiva() === 'materiais'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Materiais</span>
              </button>

              <!-- 5. Eventos -->
              <button
                type="button"
                id="sidebar-btn-eventos"
                (click)="selecionarAba('eventos')"
                [class]="abaAtiva() === 'eventos'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Eventos</span>
              </button>

              <!-- 6. Hall da Fama -->
              <button
                type="button"
                id="sidebar-btn-hall-fama"
                (click)="selecionarAba('hall-fama')"
                [class]="abaAtiva() === 'hall-fama'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Hall da Fama</span>
              </button>

              <!-- 7. Mensagens -->
              <button
                type="button"
                id="sidebar-btn-mensagens"
                (click)="selecionarAba('mensagens')"
                [class]="abaAtiva() === 'mensagens'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Mensagens</span>
              </button>

              <!-- 8. Meu Perfil -->
              <button
                type="button"
                id="sidebar-btn-perfil"
                (click)="selecionarAba('perfil')"
                [class]="abaAtiva() === 'perfil'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Meu Perfil</span>
              </button>

              <!-- 9. Cursos -->
              <button
                type="button"
                id="sidebar-btn-curso"
                (click)="selecionarAba('curso')"
                [class]="abaAtiva() === 'curso'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Cursos</span>
              </button>

              <!-- 10. Agentes -->
              <button
                type="button"
                id="sidebar-btn-agentes"
                (click)="selecionarAba('agentes')"
                [class]="abaAtiva() === 'agentes'
                  ? 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer'"
              >
                <svg class="w-4 h-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Agentes</span>
              </button>

            </nav>
          </div>

          <!-- Ações do Rodapé da Sidebar -->
          <div class="pt-6 border-t border-slate-200 space-y-2">
            @if (souAdmin()) {
              <a
                routerLink="/admin"
                id="btn-sidebar-admin"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Painel ADM</span>
              </a>
            }

            <button
              type="button"
              id="btn-sidebar-sair"
              (click)="encerrarSessao()"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair da conta</span>
            </button>

            <a
              routerLink="/comunidade"
              class="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Portal de Acesso</span>
            </a>
          </div>
        </aside>

        <!-- Área de Conteúdo Principal -->
        <main class="flex-1 p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full">
          
          <!-- Cabeçalho da Seção Ativa -->
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
            <div class="space-y-1">
              <div class="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Comunidade Business 4.0
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ getAbaTitulo() }}
              </h2>
            </div>

            <div class="flex items-center gap-3">
              <!-- Sino de Notificações -->
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleDropdownNotificacoes()"
                  class="relative p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Notificações"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  @if (totalNaoLidas() > 0) {
                    <span class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {{ totalNaoLidas() > 9 ? '9+' : totalNaoLidas() }}
                    </span>
                  }
                </button>

                @if (dropdownNotificacoesAberto()) {
                  <div class="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-scaleUp">
                    <div class="px-4 py-3 border-b border-slate-100 font-bold text-sm text-slate-800 flex items-center justify-between">
                      <span>Notificações</span>
                      @if (totalNaoLidas() > 0) {
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                          {{ totalNaoLidas() }} nova{{ totalNaoLidas() > 1 ? 's' : '' }}
                        </span>
                      }
                    </div>
                    @if (notificacoes().length === 0) {
                      <div class="px-4 py-6 text-center text-sm text-slate-400">Nenhuma notificação por aqui.</div>
                    } @else {
                      @for (n of notificacoes(); track n.id) {
                        <button
                          type="button"
                          (click)="marcarComoLida(n.id)"
                          class="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer"
                        >
                          @if (!n.lida) {
                            <span class="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          } @else {
                            <span class="w-2 h-2 shrink-0"></span>
                          }
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-slate-800 truncate" [class.font-bold]="!n.lida">{{ n.titulo }}</p>
                            <p class="text-xs text-slate-500 line-clamp-2">{{ n.mensagem }}</p>
                          </div>
                        </button>
                      }
                    }
                  </div>
                }
              </div>

              <!-- Badge Sessão Ativa -->
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sessão Ativa</span>
              </div>
            </div>
          </div>

          <!-- Renderização do Conteúdo da Aba -->
          @if (abaAtiva() === 'feed') {
            <!-- Área do Feed -->
            <app-comunidade-feed></app-comunidade-feed>
          } @else if (abaAtiva() === 'perfil') {
            <!-- Área do Perfil -->
            <app-comunidade-perfil></app-comunidade-perfil>
          } @else if (abaAtiva() === 'vagas') {
            <!-- Área do Mural de Vagas -->
            <app-comunidade-vagas></app-comunidade-vagas>
          } @else if (abaAtiva() === 'materiais') {
            <!-- Área da Biblioteca de Materiais -->
            <app-comunidade-materiais></app-comunidade-materiais>
          } @else if (abaAtiva() === 'eventos') {
            <!-- Área do Calendário de Eventos -->
            <app-comunidade-eventos></app-comunidade-eventos>
          } @else if (abaAtiva() === 'forum') {
            <!-- Área do Fórum Técnico -->
            <app-comunidade-forum></app-comunidade-forum>
          } @else if (abaAtiva() === 'mensagens') {
            <!-- Área de Mensagens Privadas (Chat) -->
            <app-comunidade-mensagens></app-comunidade-mensagens>
          } @else if (abaAtiva() === 'hall-fama') {
            <!-- Hall da Fama Conectado ao Componente Real -->
            <div class="space-y-6">
              <div class="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600">
                <p><strong>Hall da Fama da Comunidade:</strong> ranking de engajamento e pontuações dos membros.</p>
              </div>
              <app-hall-fama></app-hall-fama>
            </div>
          } @else if (abaAtiva() === 'curso') {
            <!-- Área do Curso Predial 4.0 -->
            <app-comunidade-curso></app-comunidade-curso>
          } @else if (abaAtiva() === 'agentes') {
            <!-- Área de Agentes e Automações Técnicas -->
            <app-comunidade-agentes></app-comunidade-agentes>
          } @else {
            <!-- Placeholder Padrão das Outras Áreas -->
            <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-16 text-center space-y-4 shadow-xs">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mx-auto flex items-center justify-center shadow-inner">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="text-xl font-bold text-slate-900">
                  {{ getAbaTitulo() }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Esta área está disponível para membros da Comunidade.
                </p>
              </div>
            </div>
          }

        </main>

      </div>

      <!-- Navegação Inferior Mobile (Fixa no rodapé) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 shadow-lg">
        
        <!-- Menu Suspenso "Mais" (quando aberto) -->
        @if (menuMaisAberto()) {
          <div class="absolute bottom-full left-0 right-0 bg-white border-t border-slate-200 shadow-xl rounded-t-2xl flex flex-col max-h-[70vh]">
            <div class="flex items-center justify-between px-4 pt-3 pb-1 border-b border-slate-100">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Outras Áreas
              </div>
              <div class="text-xs text-slate-600 font-semibold truncate max-w-[150px]">
                {{ getNomeUsuario() }}
              </div>
            </div>
            
            <!-- Lista rolável de áreas restantes -->
            <div class="p-3 space-y-1 overflow-y-auto flex-1">
              <!-- 1. Vagas -->
              <button
                type="button"
                (click)="selecionarAbaMobile('vagas')"
                [class]="abaAtiva() === 'vagas' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Vagas</span>
              </button>

              <!-- 2. Materiais -->
              <button
                type="button"
                (click)="selecionarAbaMobile('materiais')"
                [class]="abaAtiva() === 'materiais' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Materiais</span>
              </button>

              <!-- 3. Eventos -->
              <button
                type="button"
                (click)="selecionarAbaMobile('eventos')"
                [class]="abaAtiva() === 'eventos' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Eventos</span>
              </button>

              <!-- 4. Fórum -->
              <button
                type="button"
                (click)="selecionarAbaMobile('forum')"
                [class]="abaAtiva() === 'forum' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Fórum</span>
              </button>

              <!-- 5. Mensagens -->
              <button
                type="button"
                (click)="selecionarAbaMobile('mensagens')"
                [class]="abaAtiva() === 'mensagens' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Mensagens</span>
              </button>

              <!-- 6. Hall da Fama -->
              <button
                type="button"
                (click)="selecionarAbaMobile('hall-fama')"
                [class]="abaAtiva() === 'hall-fama' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Hall da Fama</span>
              </button>
            </div>

            <!-- Fixo no rodapé do menu Mais -->
            <div class="border-t border-slate-200 p-3 bg-slate-50 rounded-b-2xl shrink-0 space-y-2">
              <button
                type="button"
                (click)="encerrarSessao()"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair da conta</span>
              </button>

              <a
                routerLink="/comunidade"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <svg class="w-4 h-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Voltar ao Portal</span>
              </a>
            </div>
          </div>
        }

        <!-- 5 Posições Fixas na Tab Bar Mobile: Feed · Cursos · Agentes · Perfil · Mais -->
        <div class="grid grid-cols-5 items-center">
          
          <!-- 1. Feed -->
          <button
            type="button"
            (click)="selecionarAbaMobile('feed')"
            [class]="abaAtiva() === 'feed' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
            class="flex flex-col items-center justify-center py-1 gap-1 text-[10px] cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span class="truncate">Feed</span>
          </button>

          <!-- 2. Cursos -->
          <button
            type="button"
            (click)="selecionarAbaMobile('curso')"
            [class]="abaAtiva() === 'curso' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
            class="flex flex-col items-center justify-center py-1 gap-1 text-[10px] cursor-pointer"
          >
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="truncate">Cursos</span>
          </button>

          <!-- 3. Agentes -->
          <button
            type="button"
            (click)="selecionarAbaMobile('agentes')"
            [class]="abaAtiva() === 'agentes' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
            class="flex flex-col items-center justify-center py-1 gap-1 text-[10px] cursor-pointer"
          >
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="truncate">Agentes</span>
          </button>

          <!-- 4. Perfil -->
          <button
            type="button"
            (click)="selecionarAbaMobile('perfil')"
            [class]="abaAtiva() === 'perfil' ? 'text-indigo-600 font-bold' : 'text-slate-500'"
            class="flex flex-col items-center justify-center py-1 gap-1 text-[10px] cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="truncate">Perfil</span>
          </button>

          <!-- 5. Mais -->
          <button
            type="button"
            (click)="toggleMenuMais()"
            [class]="menuMaisAberto() || ['vagas', 'materiais', 'eventos', 'forum', 'hall-fama', 'mensagens'].includes(abaAtiva()) ? 'text-indigo-600 font-bold' : 'text-slate-500'"
            class="flex flex-col items-center justify-center py-1 gap-1 text-[10px] cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span class="truncate">Mais</span>
          </button>

        </div>
      </nav>

    </div>
  `
})
export class ComunidadePreviewComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  readonly usuario = signal<any | null>(null);
  readonly profissional = signal<any | null>(null);
  readonly souAdmin = signal<boolean>(false);
  readonly abaAtiva = signal('feed');
  readonly menuMaisAberto = signal(false);

  readonly notificacoes = signal<any[]>([]);
  readonly dropdownNotificacoesAberto = signal(false);
  readonly totalNaoLidas = computed(() => this.notificacoes().filter(n => !n.lida).length);

  private readonly abasTitulo: Record<string, string> = {
    'feed': 'Feed de Publicações',
    'forum': 'Fórum de Discussão',
    'vagas': 'Mural de Vagas & Oportunidades',
    'materiais': 'Materiais & Documentos Exclusivos',
    'eventos': 'Agenda de Eventos & Encontros',
    'hall-fama': 'Hall da Fama',
    'mensagens': 'Mensagens Diretas',
    'perfil': 'Meu Perfil de Membro',
    'curso': 'Cursos & Capacitações',
    'agentes': 'Agentes & Automações Técnicas'
  };

  async ngOnInit(): Promise<void> {
    const session = await this.supabaseService.getSession();
    if (!session?.user) {
      this.router.navigate(['/comunidade']);
      return;
    }

    this.usuario.set(session.user);

    const ehAdmin = await this.supabaseService.temPermissaoModulo('comunidade', 'admin');
    this.souAdmin.set(ehAdmin);

    const prof = await this.supabaseService.getProfissional(session.user.id);
    if (prof) {
      this.profissional.set(prof);
    } else {
      this.profissional.set({
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Membro da Comunidade',
        email: session.user.email || '',
        nivel_atual: ehAdmin ? 'Administrador' : 'Membro Especialista',
        professional_title: session.user.user_metadata?.professional_title || 'Especialista',
        crea_cau: '',
      });
    }

    this.supabaseService.onAuthStateChange((s) => {
      if (!s?.user) {
        this.router.navigate(['/comunidade']);
      }
    });

    await this.carregarNotificacoes();
  }

  async carregarNotificacoes(): Promise<void> {
    try {
      const lista = await this.supabaseService.listarNotificacoesParaMim();
      this.notificacoes.set(lista || []);
    } catch {
      this.notificacoes.set([]);
    }
  }

  toggleDropdownNotificacoes(): void {
    this.dropdownNotificacoesAberto.update(v => !v);
  }

  async marcarComoLida(notificacaoId: string): Promise<void> {
    const { error } = await this.supabaseService.marcarNotificacaoComoLida(notificacaoId);
    if (!error) {
      this.notificacoes.update(lista =>
        lista.map(n => (n.id === notificacaoId ? { ...n, lida: true } : n))
      );
    }
  }

  getNomeUsuario(): string {
    return (
      this.profissional()?.full_name ||
      this.usuario()?.user_metadata?.full_name ||
      this.usuario()?.email?.split('@')[0] ||
      'Membro da Comunidade'
    );
  }

  getNivelUsuario(): string {
    return this.profissional()?.nivel_atual || 'Membro Ativo';
  }

  getInicialUsuario(): string {
    const nome = this.getNomeUsuario();
    return nome.charAt(0).toUpperCase() || 'M';
  }

  async encerrarSessao(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/comunidade']);
  }

  selecionarAba(abaId: string): void {
    this.abaAtiva.set(abaId);
  }

  selecionarAbaMobile(abaId: string): void {
    this.abaAtiva.set(abaId);
    this.menuMaisAberto.set(false);
  }

  toggleMenuMais(): void {
    this.menuMaisAberto.update(v => !v);
  }

  getAbaTitulo(): string {
    return this.abasTitulo[this.abaAtiva()] || 'Comunidade';
  }
}
