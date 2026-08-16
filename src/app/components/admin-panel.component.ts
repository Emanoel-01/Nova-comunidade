import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminCursoComponent } from './admin/admin-curso.component';
import { AdminAcessosComponent } from './admin/admin-acessos.component';
import { SupabaseService } from '../../services/supabase.service';

interface NavSectionItem {
  id: string;
  label: string;
  iconName: string;
  tabelaFutura?: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminCursoComponent, AdminAcessosComponent],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      <!-- Sidebar Fixa / Navegação Lateral -->
      <aside class="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        
        <div class="p-6 space-y-6">
          <!-- Cabeçalho da Sidebar -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 class="text-base font-black text-white tracking-tight">
                Painel Admin
              </h1>
              <p class="text-xs text-slate-400 font-medium">
                Gestão do Ecossistema
              </p>
            </div>
          </div>

          <!-- Navegação das 13 Abas -->
          <nav class="space-y-6 text-xs">
            
            <!-- Aba Principal: Visão Geral -->
            <div>
              <button
                type="button"
                (click)="selecionarAba('visao-geral')"
                [class]="abaAtiva() === 'visao-geral'
                  ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Visão Geral</span>
              </button>
            </div>

            <!-- Separador: BLOG -->
            <div class="space-y-1.5">
              <span class="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                BLOG
              </span>
              
              <button
                type="button"
                (click)="selecionarAba('posts-publicados')"
                [class]="abaAtiva() === 'posts-publicados'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Posts Publicados</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('novo-artigo')"
                [class]="abaAtiva() === 'novo-artigo'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Novo Artigo</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('analytics-blog')"
                [class]="abaAtiva() === 'analytics-blog'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics do Blog</span>
              </button>
            </div>

            <!-- Separador: COMUNIDADE -->
            <div class="space-y-1.5">
              <span class="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                COMUNIDADE
              </span>

              <button
                type="button"
                (click)="selecionarAba('membros')"
                [class]="abaAtiva() === 'membros'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Membros</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('forum')"
                [class]="abaAtiva() === 'forum'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Fórum</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('vagas')"
                [class]="abaAtiva() === 'vagas'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Vagas</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('materiais')"
                [class]="abaAtiva() === 'materiais'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Materiais</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('eventos')"
                [class]="abaAtiva() === 'eventos'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Eventos</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('curso-predial')"
                [class]="abaAtiva() === 'curso-predial'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Cursos</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('enviar-notificacao')"
                [class]="abaAtiva() === 'enviar-notificacao'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Enviar Notificação</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('depoimentos')"
                [class]="abaAtiva() === 'depoimentos'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Depoimentos</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('newsletter')"
                [class]="abaAtiva() === 'newsletter'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Newsletter</span>
              </button>

              <button
                type="button"
                (click)="selecionarAba('convites-acessos')"
                [class]="abaAtiva() === 'convites-acessos'
                  ? 'w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm'
                  : 'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors'"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Convites e Acessos</span>
              </button>
            </div>

          </nav>
        </div>

        <!-- Rodapé da Sidebar: Voltar ao Site -->
        <div class="p-6 border-t border-slate-800">
          <a
            routerLink="/"
            class="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar ao Site</span>
          </a>
        </div>

      </aside>

      <!-- Área de Conteúdo à Direita -->
      <main class="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div class="max-w-6xl mx-auto space-y-8">
          
          <!-- Cabeçalho Dinâmico da Aba -->
          <div class="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {{ getAbaTitulo() }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-1">
                Painel Administrativo da Comunidade Business 4.0 & Plataforma
              </p>
            </div>

            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold">
              <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span>Modo Estrutural</span>
            </div>
          </div>

          <!-- Conteúdo da Aba Ativa -->
          @switch (abaAtiva()) {
            
            <!-- CASO 1: Visão Geral (Mini-Dashboard) -->
            @case ('visao-geral') {
              <div class="space-y-8">
                <!-- Grid de 4 Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  
                  <!-- Card 1: Membros Ativos -->
                  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                    <div class="flex items-center justify-between text-slate-400">
                      <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Membros Ativos</span>
                      <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-3xl font-black text-slate-900">
                      —
                    </div>
                  </div>

                  <!-- Card 2: Posts Publicados -->
                  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                    <div class="flex items-center justify-between text-slate-400">
                      <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Posts Publicados</span>
                      <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-3xl font-black text-slate-900">
                      —
                    </div>
                  </div>

                  <!-- Card 3: Solicitações Pendentes -->
                  <div 
                    (click)="selecionarAba('convites-acessos')"
                    class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-indigo-300 transition-colors group"
                  >
                    <div class="flex items-center justify-between text-slate-400">
                      <span class="text-xs uppercase tracking-wider font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Solicitações Pendentes</span>
                      <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-3xl font-black text-slate-900">
                      {{ totalSolicitacoesPendentes() }}
                    </div>
                  </div>

                  <!-- Card 4: Vagas Abertas -->
                  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
                    <div class="flex items-center justify-between text-slate-400">
                      <span class="text-xs uppercase tracking-wider font-bold text-slate-500">Vagas Abertas</span>
                      <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-3xl font-black text-slate-900">
                      —
                    </div>
                  </div>

                </div>

                <!-- Aviso Discreto -->
                <div class="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 text-center sm:text-left flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Os números aparecerão aqui assim que as tabelas do Supabase forem criadas e conectadas.</span>
                </div>
              </div>
            }

            <!-- CASO 2: Curso Predial 4.0 -->
            @case ('curso-predial') {
               <app-admin-curso></app-admin-curso>
             }

            <!-- CASO 3: Convites e Solicitações de Acesso -->
            @case ('convites-acessos') {
              <app-admin-acessos></app-admin-acessos>
            }

            <!-- DEMAIS ABAS: Card de "Conector Pendente / Em Construção" -->
            @default {
              <div class="bg-white rounded-3xl border border-slate-200 p-10 sm:p-16 text-center space-y-5 shadow-xs max-w-2xl mx-auto">
                <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-inner">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xl font-bold text-slate-900">
                    Conexão Pendente
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    Esta seção ainda não está conectada a dados reais — aguardando a criação das tabelas correspondentes no Supabase.
                  </p>
                </div>

                @if (getTabelaFutura()) {
                  <div class="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">
                    {{ getTabelaFutura() }}
                  </div>
                }
              </div>
            }

          }

        </div>
      </main>

    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly abaAtiva = signal<string>('visao-geral');
  readonly totalSolicitacoesPendentes = signal<number | string>('—');

  private readonly abasInfo: Record<string, { titulo: string; tabela?: string }> = {
    'visao-geral': { titulo: 'Visão Geral' },
    'posts-publicados': { titulo: 'Posts Publicados', tabela: 'tabela blog_posts' },
    'novo-artigo': { titulo: 'Novo Artigo', tabela: 'tabela blog_posts' },
    'analytics-blog': { titulo: 'Analytics do Blog', tabela: 'tabela blog_analytics' },
    'membros': { titulo: 'Membros', tabela: 'tabela community_members' },
    'forum': { titulo: 'Fórum', tabela: 'tabela community_topics' },
    'vagas': { titulo: 'Vagas', tabela: 'tabela community_jobs' },
    'materiais': { titulo: 'Materiais', tabela: 'tabela community_materials' },
    'eventos': { titulo: 'Eventos', tabela: 'tabela community_events' },
    'curso-predial': { titulo: 'Gestão de Cursos & Capacitações', tabela: 'tabelas courses / course_modules / course_enrollments' },
    'enviar-notificacao': { titulo: 'Enviar Notificação', tabela: 'tabela notifications' },
    'depoimentos': { titulo: 'Depoimentos', tabela: 'tabela testimonials' },
    'newsletter': { titulo: 'Newsletter', tabela: 'tabela newsletter_subscribers' },
    'convites-acessos': { titulo: 'Convites e Acessos' },
  };

  async ngOnInit(): Promise<void> {
    await this.carregarContadores();
  }

  async carregarContadores(): Promise<void> {
    try {
      const pendentes = await this.supabaseService.listarSolicitacoesAcesso('pendente');
      this.totalSolicitacoesPendentes.set(pendentes.length);
    } catch {
      this.totalSolicitacoesPendentes.set('0');
    }
  }

  selecionarAba(id: string): void {
    this.abaAtiva.set(id);
    if (id === 'visao-geral') {
      this.carregarContadores();
    }
  }

  getAbaTitulo(): string {
    return this.abasInfo[this.abaAtiva()]?.titulo || 'Painel Admin';
  }

  getTabelaFutura(): string | undefined {
    return this.abasInfo[this.abaAtiva()]?.tabela;
  }
}
