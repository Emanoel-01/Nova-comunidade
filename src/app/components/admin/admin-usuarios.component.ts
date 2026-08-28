import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

export type NivelAcesso =
  | 'Membro Trainee'
  | 'Membro Engajado'
  | 'Colaborador Ativo'
  | 'Especialista 4.0'
  | 'Embaixador da Comunidade'
  | 'Admin';

export interface PermissaoAcesso {
  id?: string;
  profissional_id: string;
  produto: 'predial4' | 'comunidade';
  modulo: string;
  liberado: boolean;
  validade?: string | null;
  nivel_acesso?: string | null;
}

export interface ProfissionalComPermissoes {
  id: string;
  full_name?: string;
  nome?: string;
  email: string;
  avatar_url?: string | null;
  nivel_atual?: string;
  licenca_tipo?: '6_meses' | '1_ano' | 'vitalicia' | 'personalizada' | string | null;
  licenca_validade?: string | null;
  created_at?: string;
  permissoes?: PermissaoAcesso[];
}

export interface PerfilAcessoItem {
  id: string;
  nome: string;
  descricao?: string | null;
  modulos: Array<{ produto: 'predial4' | 'comunidade'; modulo: string }>;
  criado_em?: string;
  atualizado_em?: string;
}

export interface TemplateEmailItem {
  id: string;
  chave: string;
  nome: string;
  assunto: string;
  html: string;
  padrao_sistema: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

interface ModuloConfig {
  key: string;
  nome: string;
  descricao: string;
  produto: 'predial4' | 'comunidade';
}

interface ConfirmacaoSenhaProvisoria {
  nome: string;
  email: string;
  senha: string;
  perfilNome?: string;
  userData?: any;
}

interface ItemImportacaoMassa {
  linha: number;
  nome: string;
  email: string;
  perfilInformado?: string;
  perfilFinal: string;
  valido: boolean;
  motivoInvalido?: string;
  processado?: boolean;
  sucesso?: boolean;
  senhaProvisoria?: string;
  erroMsg?: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">

      <!-- Cabeçalho da Seção -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-slate-900">
            Gestão de Usuários, Perfis & Licenças
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Cadastre membros em lote, configure perfis de acesso reutilizáveis e gerencie permissões modulares.
          </p>
        </div>

        <!-- Botões de Ação Rápida no Topo -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            (click)="carregarTudo()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar dados"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>

          @if (abaAtiva() === 'usuarios') {
            <button
              type="button"
              (click)="abrirModalNovoUsuario()"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Novo Usuário</span>
            </button>
          } @else if (abaAtiva() === 'perfis') {
            <button
              type="button"
              (click)="abrirEditorPerfil(null)"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Perfil de Acesso</span>
            </button>
          } @else if (abaAtiva() === 'templates') {
            <button
              type="button"
              (click)="abrirEditorTemplate(null)"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Novo Template</span>
            </button>
          }
        </div>
      </div>

      <!-- Navegação em Sub-Abas -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          (click)="abaAtiva.set('usuarios')"
          [class]="abaAtiva() === 'usuarios'
            ? 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'
            : 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Usuários & Licenças</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
            {{ usuarios().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('perfis')"
          [class]="abaAtiva() === 'perfis'
            ? 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'
            : 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Perfis de Acesso (Moldes)</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
            {{ perfisAcesso().length }}
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('massa')"
          [class]="abaAtiva() === 'massa'
            ? 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'
            : 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Importação em Massa (TXT)</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
            Automático
          </span>
        </button>

        <button
          type="button"
          (click)="abaAtiva.set('templates')"
          [class]="abaAtiva() === 'templates'
            ? 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'
            : 'flex items-center gap-2 px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Templates de E-mail</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800">
            {{ templatesEmail().length }}
          </span>
        </button>
      </div>

      <!-- Alertas Gerais de Sucesso / Erro -->
      @if (alertaSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="font-medium">{{ alertaSucesso() }}</span>
          </div>
          <button type="button" (click)="alertaSucesso.set(null)" class="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      }

      @if (alertaErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">{{ alertaErro() }}</span>
          </div>
          <button type="button" (click)="alertaErro.set(null)" class="text-rose-600 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      }

      <!-- ========================================== -->
      <!-- ABA 1: USUÁRIOS & LICENÇAS -->
      <!-- ========================================== -->
      @if (abaAtiva() === 'usuarios') {
        
        <!-- Barra de Busca -->
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <div class="relative w-full sm:max-w-md">
            <input
              type="text"
              [value]="termoBusca()"
              (input)="onBuscaInput($event)"
              placeholder="Buscar por nome ou e-mail..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="text-xs text-slate-500 font-medium sm:ml-auto">
            Exibindo: <span class="font-bold text-slate-800">{{ usuariosFiltrados().length }}</span> de <span class="font-bold text-slate-800">{{ usuarios().length }}</span> usuários
          </div>
        </div>

        @if (carregando()) {
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div class="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500 font-medium">Carregando usuários e permissões...</p>
          </div>
        } @else {
          @if (usuariosFiltrados().length > 0) {
            <div class="grid grid-cols-1 gap-4">
              @for (user of usuariosFiltrados(); track user.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      @if (user.avatar_url) {
                        <img
                          [src]="user.avatar_url"
                          [alt]="getNome(user)"
                          class="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          referrerpolicy="no-referrer"
                        />
                      } @else {
                        <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {{ getIniciais(getNome(user)) }}
                        </div>
                      }
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <h4 class="text-base font-bold text-slate-900 leading-tight">
                            {{ getNome(user) }}
                          </h4>
                          
                          <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ' + getNivelBadgeClass(user.nivel_atual)">
                            <span class="w-1.5 h-1.5 rounded-full" [class]="getNivelDotClass(user.nivel_atual)"></span>
                            {{ user.nivel_atual || 'Membro Trainee' }}
                          </span>

                          @let licenca = getLicencaStatus(user);
                          <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ' + licenca.badgeClass">
                            <span>{{ licenca.rotulo }}</span>
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">
                          {{ user.email }}
                        </p>
                      </div>
                    </div>

                    <!-- Ações: Editar e Excluir -->
                    <div class="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        (click)="abrirEditorUsuario(user)"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar Permissões</span>
                      </button>

                      <button
                        type="button"
                        (click)="solicitarExclusaoUsuario(user)"
                        class="inline-flex items-center justify-center p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer"
                        title="Excluir Usuário"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Resumo Visual dos Módulos -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    
                    <!-- Predial 4.0 -->
                    <div class="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2">
                      <div class="flex items-center justify-between text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                        <div class="flex items-center gap-1.5 text-slate-700">
                          <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Predial 4.0</span>
                        </div>
                        <span class="text-[11px] font-semibold text-slate-400">
                          {{ getLiberadosCount(user, 'predial4') }}/3 módulos
                        </span>
                      </div>

                      <div class="flex flex-wrap gap-1.5">
                        @for (mod of modulosPredial; track mod.key) {
                          @let status = getModuloStatus(user, 'predial4', mod.key);
                          <span 
                            [class]="status.liberado 
                              ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                              : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60'"
                          >
                            {{ mod.nome }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Comunidade -->
                    <div class="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2">
                      <div class="flex items-center justify-between text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                        <div class="flex items-center gap-1.5 text-slate-700">
                          <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Comunidade & Agentes</span>
                        </div>
                        <span class="text-[11px] font-semibold text-slate-400">
                          {{ getLiberadosCount(user, 'comunidade') }} módulos liberados
                        </span>
                      </div>

                      <div class="flex flex-wrap gap-1.5">
                        @for (mod of modulosComunidadeBase; track mod.key) {
                          @let status = getModuloStatus(user, 'comunidade', mod.key);
                          <span 
                            [class]="status.liberado 
                              ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100/70 text-indigo-800 border border-indigo-200'
                              : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60'"
                          >
                            {{ mod.nome }}
                          </span>
                        }
                      </div>
                    </div>

                  </div>

                </div>
              }
            </div>
          } @else {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <svg class="w-10 h-10 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h4 class="text-sm font-bold text-slate-700">Nenhum usuário encontrado</h4>
              <p class="text-xs text-slate-400">Tente ajustar o termo de busca ou cadastre um novo membro.</p>
            </div>
          }
        }
      }

      <!-- ========================================== -->
      <!-- ABA 2: PERFIS DE ACESSO (MOLDES) -->
      <!-- ========================================== -->
      @if (abaAtiva() === 'perfis') {
        <div class="space-y-6">
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <span>🛡️ Moldes de Permissões Reutilizáveis</span>
              </h4>
              <p class="text-xs text-indigo-800/80">
                Crie conjuntos de permissões pré-definidos (ex: Membro Trainee, Especialista 4.0, Auditor). Ao cadastrar usuários ou importar listas em massa, basta selecionar o perfil para aplicar todos os acessos automaticamente.
              </p>
            </div>

            <button
              type="button"
              (click)="abrirEditorPerfil(null)"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Perfil</span>
            </button>
          </div>

          @if (perfisAcesso().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (perfil of perfisAcesso(); track perfil.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between">
                  
                  <div class="space-y-2">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{{ perfil.nome }}</span>
                        </h4>
                        @if (perfil.descricao) {
                          <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                            {{ perfil.descricao }}
                          </p>
                        }
                      </div>

                      <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                        {{ perfil.modulos.length }} módulos
                      </span>
                    </div>

                    <!-- Módulos inclusos no perfil -->
                    <div class="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      @for (m of perfil.modulos; track m.produto + ':' + m.modulo) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <span class="w-1.5 h-1.5 rounded-full" [class]="m.produto === 'predial4' ? 'bg-amber-500' : 'bg-indigo-500'"></span>
                          {{ getNomeModuloAmigavel(m.produto, m.modulo) }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Ações do Perfil -->
                  <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="abrirEditorPerfil(perfil)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      (click)="solicitarExclusaoPerfil(perfil)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Excluir</span>
                    </button>
                  </div>

                </div>
              }
            </div>
          } @else {
            <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
                🛡️
              </div>
              <h4 class="text-base font-bold text-slate-800">Nenhum Perfil de Acesso Criado</h4>
              <p class="text-xs text-slate-500 max-w-md mx-auto">
                Crie perfis personalizados para agilizar a concessão de licenças para alunos e equipes.
              </p>
              <button
                type="button"
                (click)="abrirEditorPerfil(null)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <span>+ Criar Primeiro Perfil</span>
              </button>
            </div>
          }
        </div>
      }

      <!-- ========================================== -->
      <!-- ABA 3: IMPORTAÇÃO EM MASSA (TXT) -->
      <!-- ========================================== -->
      @if (abaAtiva() === 'massa') {
        <div class="space-y-6">
          
          <!-- Card de Instruções e Formato -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>⚡ Importação de Usuários em Lote via Arquivo .TXT</span>
                </h4>
                <p class="text-xs text-slate-500">
                  Faça upload de um arquivo de texto com a lista de membros para cadastrar dezenas de usuários em segundos.
                </p>
              </div>

              <button
                type="button"
                (click)="baixarArquivoExemploTxt()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Baixar Modelo (.txt)</span>
              </button>
            </div>

            <!-- Box explicativo do formato -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
              <div class="text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wider">Formato por linha:</div>
              <div class="text-indigo-900 font-semibold">Nome Completo;email&#64;dominio.com;Nome do Perfil</div>
              <div class="text-slate-500 text-[11px] font-sans pt-1">
                Exemplo:<br>
                <span class="text-slate-800">Carlos Alberto;carlos.eng&#64;gmail.com;Especialista 4.0</span><br>
                <span class="text-slate-800">Mariana Souza;mariana&#64;arq.com.br;Membro Trainee</span>
              </div>
            </div>

            <!-- Upload Drag & Drop -->
            <div 
              class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer"
              [class]="arrastandoArquivo() ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDropArquivo($event)"
              (click)="fileInputMassa.click()"
            >
              <input
                #fileInputMassa
                type="file"
                accept=".txt,.csv"
                (change)="onArquivoSelecionado($event)"
                class="hidden"
              />
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p class="text-xs font-bold text-slate-800">
                Clique para selecionar o arquivo .txt ou arraste e solte aqui
              </p>
              <p class="text-[11px] text-slate-400 mt-1">
                Arquivos aceitos: .txt ou .csv delimitados por ponto e vírgula (;)
              </p>
            </div>

          </div>

          <!-- Configurações do Lote e Preview -->
          @if (itensMassa().length > 0) {
            <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 animate-fadeIn">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 class="text-base font-bold text-slate-900">
                    Preview do Lote ({{ itensMassa().length }} registros identificados)
                  </h4>
                  <div class="flex items-center gap-3 text-xs mt-1">
                    <span class="text-emerald-700 font-bold">✓ {{ totalValidosMassa() }} válidos</span>
                    @if (totalInvalidosMassa() > 0) {
                      <span class="text-rose-700 font-bold">⚠ {{ totalInvalidosMassa() }} com erro</span>
                    }
                  </div>
                </div>

                <!-- Configuração de Perfil Padrão e E-mail -->
                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-bold text-slate-700">Perfil Padrão:</label>
                    <select
                      [value]="perfilPadraoMassa()"
                      (change)="onPerfilPadraoMassaChange($event)"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                    >
                      <option value="">-- Usar Trainee (Base) --</option>
                      @for (p of perfisAcesso(); track p.id) {
                        <option [value]="p.nome">{{ p.nome }}</option>
                      }
                    </select>
                  </div>

                  <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      [checked]="enviarEmailBoasVindasMassa()"
                      (change)="enviarEmailBoasVindasMassa.set(!enviarEmailBoasVindasMassa())"
                      class="w-4 h-4 rounded text-indigo-600 border-slate-300"
                    />
                    <span>Disparar e-mail no cadastro</span>
                  </label>

                  @if (enviarEmailBoasVindasMassa()) {
                    <div class="flex items-center gap-2 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100 animate-fadeIn">
                      <label class="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Template de e-mail a enviar:</span>
                      </label>
                      <select
                        [value]="templateEmailMassaSelecionado()"
                        (change)="onTemplateMassaChange($event)"
                        class="px-2.5 py-1 rounded-md border border-indigo-200 text-xs font-semibold text-indigo-900 bg-white shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        @for (tpl of templatesEmail(); track tpl.id) {
                          <option [value]="tpl.chave">
                            {{ tpl.nome }} {{ tpl.padrao_sistema ? '(Padrão do Sistema)' : '' }}
                          </option>
                        }
                      </select>

                      <button
                        type="button"
                        (click)="abrirEditorTemplate(null)"
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                        title="Criar novo template de e-mail"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Criar novo template</span>
                      </button>

                      @let tplMassa = templateSelecionadoMassaObj();
                      @if (tplMassa) {
                        <button
                          type="button"
                          (click)="abrirPreviewTemplate(tplMassa)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-indigo-200 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Ver prévia deste template de e-mail"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Prévia</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Tabela de Preview -->
              <div class="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th class="p-3">#</th>
                      <th class="p-3">Nome</th>
                      <th class="p-3">E-mail</th>
                      <th class="p-3">Perfil Aplicado</th>
                      <th class="p-3">Status / Senha</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (item of itensMassa(); track item.linha) {
                      <tr [class]="item.valido ? 'hover:bg-slate-50' : 'bg-rose-50/40'">
                        <td class="p-3 font-mono text-[11px] text-slate-400">{{ item.linha }}</td>
                        <td class="p-3 font-bold text-slate-800">{{ item.nome }}</td>
                        <td class="p-3 text-slate-600 font-mono text-[11px]">{{ item.email }}</td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {{ item.perfilFinal }}
                          </span>
                        </td>
                        <td class="p-3">
                          @if (item.processado) {
                            @if (item.sucesso) {
                              <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  ✓ Criado
                                </span>
                                @if (item.senhaProvisoria) {
                                  <span class="font-mono text-[11px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                    {{ item.senhaProvisoria }}
                                  </span>
                                }
                              </div>
                            } @else {
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" [title]="item.erroMsg || 'Erro'">
                                ✕ {{ item.erroMsg || 'Falha' }}
                              </span>
                            }
                          } @else {
                            @if (item.valido) {
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                Pronto
                              </span>
                            } @else {
                              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                ⚠ {{ item.motivoInvalido }}
                              </span>
                            }
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Ações de Processamento -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  (click)="limparImportacaoMassa()"
                  class="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  ✕ Limpar Lista
                </button>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                  @if (loteProcessadoComSucesso()) {
                    <button
                      type="button"
                      (click)="baixarRelatorioLoteCsv()"
                      class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Baixar Relatório (.csv)</span>
                    </button>
                  }

                  <button
                    type="button"
                    (click)="processarImportacaoEmMassa()"
                    [disabled]="processandoMassa() || totalValidosMassa() === 0 || loteProcessadoComSucesso()"
                    class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    @if (processandoMassa()) {
                      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Cadastrando Usuários em Lote...</span>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Processar {{ totalValidosMassa() }} Usuários</span>
                    }
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      }

      <!-- ========================================== -->
      <!-- ABA 4: TEMPLATES DE E-MAIL (CRUD & PREVIEW) -->
      <!-- ========================================== -->
      @if (abaAtiva() === 'templates') {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Banner Informativo com Navy e Copper -->
          <div class="p-5 rounded-2xl bg-[#132A41] text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1 max-w-2xl">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#B5642A] text-white">
                  Templates & Automações
                </span>
                <span class="text-xs text-slate-300 font-mono">templates_email</span>
              </div>
              <h4 class="text-base font-bold text-white">
                Modelos de E-mail para Comunicação e Convites em Massa
              </h4>
              <p class="text-xs text-slate-300">
                Personalize o layout HTML dos comunicados e convites. Durante o disparo em massa via TXT, as tags <code class="bg-black/30 px-1.5 py-0.5 rounded text-[#F59E0B] font-mono">&#123;&#123;NOME&#125;&#125;</code>, <code class="bg-black/30 px-1.5 py-0.5 rounded text-[#F59E0B] font-mono">&#123;&#123;EMAIL&#125;&#125;</code> e <code class="bg-black/30 px-1.5 py-0.5 rounded text-[#F59E0B] font-mono">&#123;&#123;SENHA&#125;&#125;</code> são substituídas automaticamente por destinatário.
              </p>
            </div>

            <button
              type="button"
              (click)="abrirEditorTemplate(null)"
              class="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#a05623] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Criar Novo Template</span>
            </button>
          </div>

          <!-- Grade de Templates -->
          @if (templatesEmail().length === 0) {
            <div class="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-slate-800">Nenhum template cadastrado</h4>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">
                Crie um modelo HTML para enviar e-mails personalizados na importação de membros em lote.
              </p>
              <button
                type="button"
                (click)="abrirEditorTemplate(null)"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Criar Primeiro Template
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              @for (tpl of templatesEmail(); track tpl.id) {
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
                  
                  <div class="space-y-3">
                    <!-- Topo do Card -->
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <h4 class="text-sm font-bold text-slate-900">{{ tpl.nome }}</h4>
                          @if (tpl.padrao_sistema) {
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              Padrão do Sistema
                            </span>
                          } @else {
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              Customizado
                            </span>
                          }
                        </div>
                        <span class="text-[11px] font-mono text-slate-400 block mt-0.5">chave: {{ tpl.chave }}</span>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="abrirPreviewTemplate(tpl)"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Visualizar renderização HTML"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Prévia</span>
                        </button>

                        <button
                          type="button"
                          (click)="baixarHtmlTemplate(tpl)"
                          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#132A41]/10 hover:bg-[#132A41]/15 text-[#132A41] text-[11px] font-bold transition-colors cursor-pointer"
                          title="Baixar arquivo .html com dados de exemplo"
                        >
                          <svg class="w-3.5 h-3.5 text-[#132A41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Baixar HTML</span>
                        </button>
                      </div>
                    </div>

                    <!-- Assunto -->
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assunto do E-mail:</span>
                      <p class="font-medium text-slate-800 mt-0.5 line-clamp-1">{{ tpl.assunto || '(Sem assunto definido)' }}</p>
                    </div>

                    @if (tpl.padrao_sistema) {
                      <p class="text-[11px] text-slate-500 italic bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                        🔒 Este template é gerado dinamicamente pela Edge Function <code class="font-mono text-blue-700 font-bold">criar-usuario-admin</code> e permanece protegido.
                      </p>
                    }
                  </div>

                  <!-- Ações Inferiores -->
                  <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span class="text-[11px] text-slate-400">
                      {{ tpl.html ? (tpl.html.length + ' caracteres de HTML') : 'HTML dinâmico' }}
                    </span>

                    <div class="flex items-center gap-2">
                      @if (!tpl.padrao_sistema) {
                        <button
                          type="button"
                          (click)="abrirEditorTemplate(tpl)"
                          class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          (click)="solicitarExclusaoTemplate(tpl)"
                          class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Excluir
                        </button>
                      } @else {
                        <span class="text-[11px] text-slate-400 font-medium">Sistema Padrão</span>
                      }
                    </div>
                  </div>

                </div>
              }
            </div>
          }

        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: EDITAR PERFIL DE ACESSO -->
      <!-- ========================================== -->
      @if (modalPerfilAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 space-y-5 p-6">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  {{ perfilEmEdicaoId() ? 'Editar Perfil de Acesso' : 'Criar Novo Perfil de Acesso' }}
                </h3>
                <p class="text-xs text-slate-500">
                  Defina quais módulos e agentes este molde concederá aos usuários vinculados.
                </p>
              </div>
              <button type="button" (click)="fecharEditorPerfil()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            @if (erroPerfil()) {
              <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {{ erroPerfil() }}
              </div>
            }

            <div class="space-y-4">
              <!-- Nome do Perfil -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Nome do Perfil *</label>
                <input
                  type="text"
                  #nomePerfilInput
                  [value]="nomePerfil()"
                  (input)="nomePerfil.set(nomePerfilInput.value)"
                  placeholder="Ex: Auditor Predial 4.0, Especialista, Aluno Básico..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Descrição -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Descrição Explicativa</label>
                <textarea
                  #descPerfilInput
                  rows="2"
                  [value]="descricaoPerfil()"
                  (input)="descricaoPerfil.set(descPerfilInput.value)"
                  placeholder="Explique o objetivo deste perfil de acesso..."
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>

              <!-- Seleção Rápida de Módulos -->
              <div class="flex items-center justify-between pt-2">
                <span class="text-xs font-bold text-slate-700">Módulos Liberados</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="marcarTodosModulosPerfil('comunidade', true)"
                    class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    + Todos Comunidade
                  </button>
                  <span class="text-slate-300">·</span>
                  <button
                    type="button"
                    (click)="marcarTodosModulosPerfil('predial4', true)"
                    class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    + Todos Predial
                  </button>
                  <span class="text-slate-300">·</span>
                  <button
                    type="button"
                    (click)="limparModulosPerfil()"
                    class="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <!-- Grade de Toggles -->
              <div class="space-y-4 max-h-72 overflow-y-auto p-1">
                
                <!-- Predial 4.0 -->
                <div class="space-y-2">
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Predial 4.0</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (mod of modulosPredial; track mod.key) {
                      <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          [checked]="isModuloNoPerfil('predial4', mod.key)"
                          (change)="toggleModuloNoPerfil('predial4', mod.key)"
                          class="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <span class="text-xs font-bold text-slate-800 block">{{ mod.nome }}</span>
                          <span class="text-[10px] text-slate-500 line-clamp-1">{{ mod.descricao }}</span>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Comunidade Base -->
                <div class="space-y-2">
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Comunidade Base</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (mod of modulosComunidadeBase; track mod.key) {
                      <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          [checked]="isModuloNoPerfil('comunidade', mod.key)"
                          (change)="toggleModuloNoPerfil('comunidade', mod.key)"
                          class="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <span class="text-xs font-bold text-slate-800 block">{{ mod.nome }}</span>
                          <span class="text-[10px] text-slate-500 line-clamp-1">{{ mod.descricao }}</span>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Agentes de IA -->
                <div class="space-y-2">
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Agentes de Engenharia 4.0</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (mod of modulosComunidadeAdicionais; track mod.key) {
                      <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          [checked]="isModuloNoPerfil('comunidade', mod.key)"
                          (change)="toggleModuloNoPerfil('comunidade', mod.key)"
                          class="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <div>
                          <span class="text-xs font-bold text-slate-800 block">{{ mod.nome }}</span>
                          <span class="text-[10px] text-slate-500 line-clamp-1">{{ mod.descricao }}</span>
                        </div>
                      </label>
                    }
                  </div>
                </div>

              </div>
            </div>

            <!-- Rodapé Modal -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="fecharEditorPerfil()"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="salvarPerfil()"
                [disabled]="salvandoPerfil() || !nomePerfil().trim()"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                @if (salvandoPerfil()) {
                  <span>Salvando...</span>
                } @else {
                  <span>Salvar Perfil</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE USUÁRIO -->
      <!-- ========================================== -->
      @if (usuarioParaExcluir()) {
        @let uDel = usuarioParaExcluir()!;
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
            
            <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div class="text-center space-y-2">
              <h3 class="text-base font-bold text-slate-900">
                Confirmar Exclusão de Usuário
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Tem certeza que deseja excluir permanentemente o acesso de <strong>{{ getNome(uDel) }}</strong> ({{ uDel.email }})? Esta ação revoga a conta e remove os dados no Supabase.
              </p>
            </div>

            <div class="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                (click)="usuarioParaExcluir.set(null)"
                [disabled]="excluindoUsuario()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="confirmarExclusaoUsuario()"
                [disabled]="excluindoUsuario()"
                class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                @if (excluindoUsuario()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Excluindo...</span>
                } @else {
                  <span>Sim, Excluir Usuário</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: EDITAR PERMISSÕES DE USUÁRIO -->
      <!-- ========================================== -->
      @if (usuarioEmEdicao()) {
        @let u = usuarioEmEdicao()!;
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8 space-y-6 p-6">
            
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  Gerenciar Acessos de {{ getNome(u) }}
                </h3>
                <p class="text-xs text-slate-500">
                  {{ u.email }} · Defina nível, validade e permissões modulares.
                </p>
              </div>
              <button type="button" (click)="fecharEditor()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <!-- SELETOR RÁPIDO: CARREGAR DO PERFIL DE ACESSO -->
            @if (perfisAcesso().length > 0) {
              <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-indigo-950">⚡ Aplicar Perfil Pronto:</span>
                  <span class="text-[11px] text-indigo-700">Preencha os módulos instantaneamente a partir de um molde</span>
                </div>

                <select
                  (change)="aplicarPerfilRapidoNoEditor($event)"
                  class="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-indigo-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Selecionar Perfil --</option>
                  @for (p of perfisAcesso(); track p.id) {
                    <option [value]="p.id">{{ p.nome }} ({{ p.modulos.length }} módulos)</option>
                  }
                </select>
              </div>
            }

            <!-- Nível de Membro e Licença Global -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Nível na Comunidade</label>
                <select
                  [value]="nivelEdicao()"
                  (change)="onNivelChange($event)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="Membro Trainee">Membro Trainee</option>
                  <option value="Membro Engajado">Membro Engajado</option>
                  <option value="Colaborador Ativo">Colaborador Ativo</option>
                  <option value="Especialista 4.0">Especialista 4.0</option>
                  <option value="Embaixador da Comunidade">Embaixador da Comunidade</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-slate-700">Atalho de Validade da Licença</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('6_meses')"
                    [class]="licencaTipoEdicao() === '6_meses' ? 'bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl' : 'bg-slate-100 text-slate-700 text-xs py-2 rounded-xl hover:bg-slate-200'"
                  >
                    6 Meses
                  </button>
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('1_ano')"
                    [class]="licencaTipoEdicao() === '1_ano' ? 'bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl' : 'bg-slate-100 text-slate-700 text-xs py-2 rounded-xl hover:bg-slate-200'"
                  >
                    1 Ano
                  </button>
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('vitalicia')"
                    [class]="licencaTipoEdicao() === 'vitalicia' ? 'bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl' : 'bg-slate-100 text-slate-700 text-xs py-2 rounded-xl hover:bg-slate-200'"
                  >
                    Vitalícia
                  </button>
                </div>
              </div>
            </div>

            <!-- Toggles de Módulos -->
            <div class="space-y-4 max-h-80 overflow-y-auto p-1 border-t border-slate-100 pt-4">
              
              <!-- Predial 4.0 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-700">Predial 4.0</span>
                  <div class="flex items-center gap-2">
                    <button type="button" (click)="marcarTodosModulos('predial4', true)" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">+ Todos</button>
                    <span class="text-slate-300">·</span>
                    <button type="button" (click)="marcarTodosModulos('predial4', false)" class="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Nenhum</button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (mod of modulosPredial; track mod.key) {
                    <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          [checked]="isModuloLiberadoEdicao('predial4', mod.key)"
                          (change)="toggleModuloEdicao('predial4', mod.key)"
                          class="w-4 h-4 rounded text-indigo-600 border-slate-300"
                        />
                        <span class="text-xs font-bold text-slate-800">{{ mod.nome }}</span>
                      </div>
                    </label>
                  }
                </div>
              </div>

              <!-- Comunidade Base -->
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-700">Comunidade & Agentes de IA</span>
                  <div class="flex items-center gap-2">
                    <button type="button" (click)="marcarTodosModulos('comunidade', true)" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">+ Todos</button>
                    <span class="text-slate-300">·</span>
                    <button type="button" (click)="marcarTodosModulos('comunidade', false)" class="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Nenhum</button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (mod of modulosComunidade; track mod.key) {
                    <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer">
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          [checked]="isModuloLiberadoEdicao('comunidade', mod.key)"
                          (change)="toggleModuloEdicao('comunidade', mod.key)"
                          class="w-4 h-4 rounded text-indigo-600 border-slate-300"
                        />
                        <span class="text-xs font-bold text-slate-800">{{ mod.nome }}</span>
                      </div>
                    </label>
                  }
                </div>
              </div>

            </div>

            <!-- Rodapé Salvar -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="fecharEditor()"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="salvarPermissoes()"
                [disabled]="salvando()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                @if (salvando()) {
                  <span>Salvando Permissões...</span>
                } @else {
                  <span>Salvar Acessos</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: CADASTRAR NOVO USUÁRIO INDIVIDUAL -->
      <!-- ========================================== -->
      @if (modalNovoUsuarioAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900">Cadastrar Novo Usuário</h3>
              <button type="button" (click)="fecharModalNovoUsuario()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            @if (erroNovoUsuario()) {
              <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {{ erroNovoUsuario() }}
              </div>
            }

            <form (submit)="submeterNovoUsuario($event)" class="space-y-3.5">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Nome Completo *</label>
                <input
                  type="text"
                  #nomeNovoInput
                  [value]="novoNome()"
                  (input)="novoNome.set(nomeNovoInput.value)"
                  placeholder="Ex: Engenheiro Carlos Silva"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">E-mail *</label>
                <input
                  type="email"
                  #emailNovoInput
                  [value]="novoEmail()"
                  (input)="novoEmail.set(emailNovoInput.value)"
                  placeholder="carlos@exemplo.com"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Perfil de Acesso Inicial -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Perfil de Acesso Inicial</label>
                <select
                  [value]="novoPerfilId()"
                  (change)="onNovoPerfilChange($event)"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="">-- Usar Permissão Base (Trainee) --</option>
                  @for (p of perfisAcesso(); track p.id) {
                    <option [value]="p.nome">{{ p.nome }} ({{ p.modulos.length }} módulos)</option>
                  }
                </select>
              </div>

              <!-- Enviar e-mail de boas-vindas -->
              <div class="pt-1">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    [checked]="novoEnviarEmail()"
                    (change)="novoEnviarEmail.set(!novoEnviarEmail())"
                    class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span class="text-xs font-semibold text-slate-700">Disparar e-mail de boas-vindas com senha provisória</span>
                </label>
              </div>

              <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  (click)="fecharModalNovoUsuario()"
                  class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="salvandoNovoUsuario() || !novoNome().trim() || !novoEmail().trim()"
                  class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  @if (salvandoNovoUsuario()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Criando...</span>
                  } @else {
                    <span>Criar Usuário</span>
                  }
                </button>
              </div>
            </form>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: CONFIRMAÇÃO DE SENHA PROVISÓRIA -->
      <!-- ========================================== -->
      @if (confirmacaoSenha()) {
        @let conf = confirmacaoSenha()!;
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>

            <div class="text-center space-y-1">
              <h3 class="text-base font-bold text-slate-900">Usuário Criado com Sucesso!</h3>
              <p class="text-xs text-slate-500">
                Credenciais geradas para <strong>{{ conf.nome }}</strong>
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Senha Provisória</span>
              <div class="font-mono text-xl font-black text-slate-900 tracking-widest selection:bg-indigo-100">
                {{ conf.senha }}
              </div>
              <button
                type="button"
                (click)="copiarSenhaProvisoria(conf.senha)"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 cursor-pointer"
              >
                @if (senhaCopiada()) {
                  <span class="text-emerald-600 font-bold">✓ Copiado!</span>
                } @else {
                  <span>Copiar Senha</span>
                }
              </button>
            </div>

            <div class="pt-2 flex items-center justify-end">
              <button
                type="button"
                (click)="concluirCriacaoUsuario(conf)"
                class="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <span>Concluir</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: CRIAR / EDITAR TEMPLATE DE E-MAIL -->
      <!-- ========================================== -->
      @if (modalTemplateAberto()) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8 space-y-5 p-6">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  {{ templateEmEdicaoId() ? 'Editar Template de E-mail' : 'Criar Novo Template de E-mail' }}
                </h3>
                <p class="text-xs text-slate-500">
                  Defina o modelo de mensagem com suporte a variáveis dinâmicas por destinatário.
                </p>
              </div>
              <button type="button" (click)="fecharEditorTemplate()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            @if (erroTemplate()) {
              <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {{ erroTemplate() }}
              </div>
            }

            <div class="space-y-4">
              <!-- Nome do Template -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Nome do Template *</label>
                <input
                  type="text"
                  #nomeTplInput
                  [value]="nomeTemplate()"
                  (input)="nomeTemplate.set(nomeTplInput.value)"
                  placeholder="Ex: Convite ESUDA Cursos 2026, Boas-Vindas Masterclass..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Assunto do E-mail -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700">Assunto do E-mail *</label>
                <input
                  type="text"
                  #assuntoTplInput
                  [value]="assuntoTemplate()"
                  (input)="assuntoTemplate.set(assuntoTplInput.value)"
                  placeholder="Ex: Seu Acesso Exclusivo à Amorim Academy / ESUDA 2026"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- Nota de Ajuda Visível com Variáveis -->
              <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <span class="text-base leading-none">💡</span>
                <div>
                  <span class="font-bold">Substituição Automática de Variáveis:</span>
                  <p class="mt-0.5 text-[11px] text-amber-800 leading-relaxed">
                    Use <strong class="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950">&#123;&#123;NOME&#125;&#125;</strong>, <strong class="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950">&#123;&#123;EMAIL&#125;&#125;</strong> e <strong class="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-950">&#123;&#123;SENHA&#125;&#125;</strong> no HTML — serão substituídos automaticamente para cada destinatário durante a criação em massa.
                  </p>
                </div>
              </div>

              <!-- HTML Completo do E-mail -->
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-slate-700">Código HTML Completo *</label>
                  <span class="text-[11px] text-slate-400 font-mono">{{ htmlTemplate().length }} caracteres</span>
                </div>
                <textarea
                  #htmlTplInput
                  rows="12"
                  [value]="htmlTemplate()"
                  (input)="htmlTemplate.set(htmlTplInput.value)"
                  placeholder="Cole aqui a estrutura HTML completa do e-mail (ex: &lt;div style=&quot;...&quot;&gt;Olá, &#123;&#123;NOME&#125;&#125;! Seu login é &#123;&#123;EMAIL&#125;&#125; e senha provisória &#123;&#123;SENHA&#125;&#125;&lt;/div&gt;)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- Rodapé do Modal -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="fecharEditorTemplate()"
                class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="salvarTemplate()"
                [disabled]="salvandoTemplate() || !nomeTemplate().trim() || !assuntoTemplate().trim() || !htmlTemplate().trim()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                @if (salvandoTemplate()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Salvando Template...</span>
                } @else {
                  <span>Salvar Template</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: PRÉVIA DE TEMPLATE DE E-MAIL -->
      <!-- ========================================== -->
      @if (modalPreviewTemplateAberto() && templateParaPreview()) {
        @let tplPreview = templateParaPreview()!;
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-8 space-y-4 p-6">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold text-slate-900">Prévia do E-mail: {{ tplPreview.nome }}</h3>
                  @if (tplPreview.padrao_sistema) {
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">Sistema</span>
                  }
                </div>
                <p class="text-xs text-slate-500">
                  Visualização simulada com as variáveis preenchidas para um usuário de exemplo.
                </p>
              </div>
              <button type="button" (click)="fecharPreviewTemplate()" class="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <!-- Cabeçalho Simulado de E-mail -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans">
              <div class="flex items-center gap-2">
                <span class="text-slate-400 font-bold w-16">Assunto:</span>
                <span class="font-bold text-slate-900">{{ tplPreview.assunto }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-400 font-bold w-16">Para:</span>
                <span class="text-slate-700 font-mono">Dr. Exemplo da Silva &lt;exemplo@dominio.com.br&gt;</span>
              </div>
            </div>

            <!-- Visualizador do HTML isolado em iframe -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <iframe
                [srcdoc]="getHtmlExemplo(tplPreview.html, tplPreview)"
                class="w-full h-96 bg-white border-0 block"
                title="Prévia do E-mail"
              ></iframe>
            </div>

            <!-- Rodapé da Prévia com Botões de Ação -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="baixarHtmlTemplate(tplPreview)"
                  class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#132A41] hover:bg-[#1b3a5b] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  title="Baixar arquivo HTML com dados de exemplo"
                >
                  <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Baixar HTML (.html)</span>
                </button>

                <button
                  type="button"
                  (click)="abrirHtmlEmNovaAba(tplPreview)"
                  class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#a05623] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  title="Abrir prévia renderizada em uma nova aba do navegador"
                >
                  <svg class="w-4 h-4 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir no Navegador</span>
                </button>
              </div>

              <button
                type="button"
                (click)="fecharPreviewTemplate()"
                class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Fechar Prévia
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class AdminUsuariosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly abaAtiva = signal<'usuarios' | 'perfis' | 'massa' | 'templates'>('usuarios');

  readonly modulosPredial: ModuloConfig[] = [
    { key: 'inspecao_predial', nome: 'Inspeção Predial', descricao: 'Laudos técnicos de inspeção e vistoria periódica.', produto: 'predial4' },
    { key: 'vistoria_cautelar', nome: 'Vistoria Cautelar de Vizinhança', descricao: 'Registro de estado prévio de imóveis lindeiros.', produto: 'predial4' },
    { key: 'admin_predial', nome: 'Admin Predial', descricao: 'Configurações avançadas do sistema predial.', produto: 'predial4' },
  ];

  readonly modulosComunidadeBase: ModuloConfig[] = [
    { key: 'forum', nome: 'Fórum', descricao: 'Acesso a tópicos técnicos, dúvidas e discussões.', produto: 'comunidade' },
    { key: 'vagas', nome: 'Vagas', descricao: 'Mural de oportunidades de trabalho e parcerias.', produto: 'comunidade' },
    { key: 'materiais', nome: 'Materiais', descricao: 'Downloads de planilhas, modelos e e-books.', produto: 'comunidade' },
    { key: 'eventos', nome: 'Eventos', descricao: 'Workshops, masterclasses e encontros online.', produto: 'comunidade' },
  ];

  readonly modulosComunidadeAdicionais: ModuloConfig[] = [
    { key: 'viabiliza-ia', nome: 'Viabiliza IA', descricao: 'Assessoria de crédito imobiliário, comparação bancária e pasta de crédito.', produto: 'comunidade' },
    { key: 'reajuste-contrato', nome: 'Agente: Reajuste de Contrato', descricao: 'Cálculo de reajuste FGV/SINAENCO.', produto: 'comunidade' },
    { key: 'biblioteca-prompts', nome: 'Agente: Biblioteca de Prompts', descricao: 'Prompts e templates para engenharia e arquitetura.', produto: 'comunidade' },
    { key: 'skills-catalogo', nome: 'Agente: Skills Claude', descricao: 'Catálogo de skills e automações operacionais.', produto: 'comunidade' },
    { key: 'checklist-licitacao', nome: 'Agente: Checklist de Licitação', descricao: 'Checklist Lei 14.133/2021 de contratações públicas.', produto: 'comunidade' },
    { key: 'levantamento-quantitativos', nome: 'Agente: Levantamento de Quantitativos', descricao: 'Cálculo paramétrico de materiais e insumos.', produto: 'comunidade' },
    { key: 'custos-viabilidade', nome: 'Agente: Custos & Viabilidade', descricao: 'Estudo de viabilidade NBR 12.721, CUB e VGV.', produto: 'comunidade' },
    { key: 'gerador-canteiro', nome: 'Agente: Plano de Canteiro (IA)', descricao: 'Dimensionamento NR-18, Lean e PGRCC (CONAMA 307).', produto: 'comunidade' },
    { key: 'admin_comunidade', nome: 'Admin Comunidade', descricao: 'Permissões administrativas na comunidade.', produto: 'comunidade' },
  ];

  get modulosComunidade(): ModuloConfig[] {
    return [...this.modulosComunidadeBase, ...this.modulosComunidadeAdicionais];
  }

  readonly usuarios = signal<ProfissionalComPermissoes[]>([]);
  readonly perfisAcesso = signal<PerfilAcessoItem[]>([]);
  readonly termoBusca = signal('');
  readonly carregando = signal(false);
  readonly alertaSucesso = signal<string | null>(null);
  readonly alertaErro = signal<string | null>(null);

  // Estados de Edição de Usuário
  readonly usuarioEmEdicao = signal<ProfissionalComPermissoes | null>(null);
  readonly nivelEdicao = signal<string>('Membro Trainee');
  readonly licencaTipoEdicao = signal<'6_meses' | '1_ano' | 'vitalicia' | 'personalizada' | ''>('');
  readonly licencaValidadeEdicao = signal<string>('');
  readonly permissoesEdicao = signal<Map<string, { liberado: boolean; validade: string | null }>>(new Map());
  readonly salvando = signal(false);

  // Estados de Exclusão de Usuário
  readonly usuarioParaExcluir = signal<ProfissionalComPermissoes | null>(null);
  readonly excluindoUsuario = signal(false);

  // Estados de Criação Individual
  readonly modalNovoUsuarioAberto = signal(false);
  readonly novoNome = signal('');
  readonly novoEmail = signal('');
  readonly novoPerfilId = signal('');
  readonly novoEnviarEmail = signal(true);
  readonly salvandoNovoUsuario = signal(false);
  readonly erroNovoUsuario = signal<string | null>(null);
  readonly confirmacaoSenha = signal<ConfirmacaoSenhaProvisoria | null>(null);
  readonly senhaCopiada = signal(false);

  // Estados de Edição de Perfil de Acesso
  readonly modalPerfilAberto = signal(false);
  readonly perfilEmEdicaoId = signal<string | null>(null);
  readonly nomePerfil = signal('');
  readonly descricaoPerfil = signal('');
  readonly modulosPerfilSelecionados = signal<Set<string>>(new Set());
  readonly salvandoPerfil = signal(false);
  readonly erroPerfil = signal<string | null>(null);

  // Estados de Importação em Massa
  readonly arrastandoArquivo = signal(false);
  readonly itensMassa = signal<ItemImportacaoMassa[]>([]);
  readonly perfilPadraoMassa = signal<string>('');
  readonly enviarEmailBoasVindasMassa = signal<boolean>(true);
  readonly templateEmailMassaSelecionado = signal<string>('boas-vindas-padrao');
  readonly processandoMassa = signal<boolean>(false);
  readonly loteProcessadoComSucesso = signal<boolean>(false);

  // Estados de Templates de E-mail
  readonly templatesEmail = signal<TemplateEmailItem[]>([]);
  readonly modalTemplateAberto = signal(false);
  readonly templateEmEdicaoId = signal<string | null>(null);
  readonly nomeTemplate = signal('');
  readonly assuntoTemplate = signal('');
  readonly htmlTemplate = signal('');
  readonly salvandoTemplate = signal(false);
  readonly erroTemplate = signal<string | null>(null);

  // Estados de Visualização/Prévia de Template
  readonly modalPreviewTemplateAberto = signal(false);
  readonly templateParaPreview = signal<TemplateEmailItem | null>(null);

  readonly totalValidosMassa = computed(() => this.itensMassa().filter(i => i.valido).length);
  readonly totalInvalidosMassa = computed(() => this.itensMassa().filter(i => !i.valido).length);

  readonly templateSelecionadoMassaObj = computed(() => {
    const chave = this.templateEmailMassaSelecionado();
    return this.templatesEmail().find(t => t.chave === chave) || null;
  });

  readonly usuariosFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) return this.usuarios();
    return this.usuarios().filter(u => {
      const n = (u.full_name || u.nome || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      return n.includes(termo) || e.includes(termo);
    });
  });

  async ngOnInit(): Promise<void> {
    await this.carregarTudo();
  }

  async carregarTudo(): Promise<void> {
    this.carregando.set(true);
    await Promise.all([
      this.carregarUsuarios(),
      this.carregarPerfisAcesso(),
      this.carregarTemplatesEmail(),
    ]);
    this.carregando.set(false);
  }

  async carregarUsuarios(): Promise<void> {
    try {
      const data = await this.supabaseService.listarProfissionaisAdmin();
      this.usuarios.set(data || []);
    } catch {
      this.alertaErro.set('Não foi possível carregar a lista de usuários.');
    }
  }

  async carregarPerfisAcesso(): Promise<void> {
    try {
      const perfis = await this.supabaseService.listarPerfisAcesso();
      this.perfisAcesso.set(perfis || []);
    } catch {
      console.warn('Falha ao carregar perfis de acesso.');
    }
  }

  async carregarTemplatesEmail(): Promise<void> {
    try {
      const templates = await this.supabaseService.listarTemplatesEmail();
      this.templatesEmail.set(templates || []);
      const chaves = (templates || []).map(t => t.chave);
      if (!chaves.includes(this.templateEmailMassaSelecionado())) {
        this.templateEmailMassaSelecionado.set('boas-vindas-padrao');
      }
    } catch {
      console.warn('Falha ao carregar templates de e-mail.');
    }
  }

  onTemplateMassaChange(event: Event): void {
    this.templateEmailMassaSelecionado.set((event.target as HTMLSelectElement).value);
  }

  onBuscaInput(event: Event): void {
    this.termoBusca.set((event.target as HTMLInputElement).value);
  }

  getNome(user: ProfissionalComPermissoes): string {
    return user.full_name || user.nome || user.email || 'Profissional';
  }

  getIniciais(nome?: string): string {
    if (!nome) return 'PR';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  getNivelBadgeClass(nivel?: string): string {
    switch (nivel) {
      case 'Membro Engajado': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Colaborador Ativo': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Especialista 4.0': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Embaixador da Comunidade': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getNivelDotClass(nivel?: string): string {
    switch (nivel) {
      case 'Membro Engajado': return 'bg-blue-500';
      case 'Colaborador Ativo': return 'bg-emerald-500';
      case 'Especialista 4.0': return 'bg-purple-500';
      case 'Embaixador da Comunidade': return 'bg-amber-500';
      case 'Admin': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  }

  getLicencaStatus(user: ProfissionalComPermissoes): { rotulo: string; badgeClass: string } {
    if (user.licenca_tipo === 'vitalicia') {
      return { rotulo: 'Vitalícia', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (user.licenca_validade) {
      const dataVal = new Date(user.licenca_validade);
      const hoje = new Date();
      if (!isNaN(dataVal.getTime()) && dataVal < hoje) {
        return { rotulo: 'Expirada', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' };
      }
      return { rotulo: `Expira em ${dataVal.toLocaleDateString('pt-BR')}`, badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    return { rotulo: 'Padrão', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  getModuloStatus(user: ProfissionalComPermissoes, produto: 'predial4' | 'comunidade', moduloKey: string): { liberado: boolean; validade: string | null } {
    if (!user.permissoes) return { liberado: false, validade: null };
    const perm = user.permissoes.find(p => p.produto === produto && p.modulo === moduloKey);
    return { liberado: perm?.liberado ?? false, validade: perm?.validade ?? null };
  }

  getLiberadosCount(user: ProfissionalComPermissoes, produto: 'predial4' | 'comunidade'): number {
    if (!user.permissoes) return 0;
    return user.permissoes.filter(p => p.produto === produto && p.liberado).length;
  }

  getNomeModuloAmigavel(produto: string, moduloKey: string): string {
    if (produto === 'predial4') {
      const m = this.modulosPredial.find(x => x.key === moduloKey);
      return m ? m.nome : moduloKey;
    }
    const mc = this.modulosComunidade.find(x => x.key === moduloKey);
    return mc ? mc.nome : moduloKey;
  }

  // --- EDITOR DE USUÁRIO ---
  abrirEditorUsuario(user: ProfissionalComPermissoes): void {
    this.usuarioEmEdicao.set(user);
    this.nivelEdicao.set(user.nivel_atual || 'Membro Trainee');
    this.licencaTipoEdicao.set((user.licenca_tipo as any) || (user.licenca_validade ? 'personalizada' : ''));
    this.licencaValidadeEdicao.set(user.licenca_validade ? user.licenca_validade.split('T')[0] : '');

    const mapa = new Map<string, { liberado: boolean; validade: string | null }>();
    for (const m of this.modulosPredial) {
      const status = this.getModuloStatus(user, 'predial4', m.key);
      mapa.set(`predial4:${m.key}`, { liberado: status.liberado, validade: status.validade });
    }
    for (const m of this.modulosComunidade) {
      const status = this.getModuloStatus(user, 'comunidade', m.key);
      mapa.set(`comunidade:${m.key}`, { liberado: status.liberado, validade: status.validade });
    }
    this.permissoesEdicao.set(mapa);
  }

  fecharEditor(): void {
    this.usuarioEmEdicao.set(null);
  }

  aplicarPerfilRapidoNoEditor(event: Event): void {
    const perfilId = (event.target as HTMLSelectElement).value;
    if (!perfilId) return;

    const perfil = this.perfisAcesso().find(p => p.id === perfilId);
    if (!perfil) return;

    const mapa = new Map(this.permissoesEdicao());
    // Resetar todos para falso
    for (const [key, val] of mapa.entries()) {
      mapa.set(key, { ...val, liberado: false });
    }

    // Ativar os do perfil
    for (const m of perfil.modulos) {
      const chave = `${m.produto}:${m.modulo}`;
      mapa.set(chave, { liberado: true, validade: null });
    }

    this.permissoesEdicao.set(mapa);
    this.alertaSucesso.set(`Módulos do perfil "${perfil.nome}" aplicados ao formulário. Clique em Salvar.`);
  }

  onNivelChange(event: Event): void {
    this.nivelEdicao.set((event.target as HTMLSelectElement).value);
  }

  selecionarLicencaRapida(tipo: '6_meses' | '1_ano' | 'vitalicia'): void {
    this.licencaTipoEdicao.set(tipo);
    const d = new Date();
    if (tipo === '6_meses') {
      d.setMonth(d.getMonth() + 6);
      this.licencaValidadeEdicao.set(d.toISOString().split('T')[0]);
    } else if (tipo === '1_ano') {
      d.setFullYear(d.getFullYear() + 1);
      this.licencaValidadeEdicao.set(d.toISOString().split('T')[0]);
    } else if (tipo === 'vitalicia') {
      this.licencaValidadeEdicao.set('');
    }
  }

  isModuloLiberadoEdicao(produto: 'predial4' | 'comunidade', modulo: string): boolean {
    return this.permissoesEdicao().get(`${produto}:${modulo}`)?.liberado ?? false;
  }

  toggleModuloEdicao(produto: 'predial4' | 'comunidade', modulo: string): void {
    const chave = `${produto}:${modulo}`;
    const mapa = new Map(this.permissoesEdicao());
    const atual = mapa.get(chave) || { liberado: false, validade: null };
    mapa.set(chave, { ...atual, liberado: !atual.liberado });
    this.permissoesEdicao.set(mapa);
  }

  marcarTodosModulos(produto: 'predial4' | 'comunidade', liberado: boolean): void {
    const mapa = new Map(this.permissoesEdicao());
    const lista = produto === 'predial4' ? this.modulosPredial : this.modulosComunidade;
    for (const mod of lista) {
      const chave = `${produto}:${mod.key}`;
      const atual = mapa.get(chave) || { liberado: false, validade: null };
      mapa.set(chave, { ...atual, liberado });
    }
    this.permissoesEdicao.set(mapa);
  }

  async salvarPermissoes(): Promise<void> {
    const u = this.usuarioEmEdicao();
    if (!u) return;

    this.salvando.set(true);
    try {
      const nivel = this.nivelEdicao();
      const tipoLicenca = this.licencaTipoEdicao() || null;
      const validadeLicenca = this.licencaValidadeEdicao() || null;

      await this.supabaseService.atualizarProfissionalAdmin(u.id, {
        nivel_atual: nivel,
        licenca_tipo: tipoLicenca,
        licenca_validade: tipoLicenca === 'vitalicia' ? null : validadeLicenca,
      });

      const promessas: Promise<any>[] = [];
      this.permissoesEdicao().forEach((val, chave) => {
        const [produtoStr, modulo] = chave.split(':') as ['predial4' | 'comunidade', string];
        promessas.push(
          this.supabaseService.upsertPermissao({
            profissionalId: u.id,
            produto: produtoStr,
            modulo,
            liberado: val.liberado,
            validade: val.validade,
            nivelAcesso: nivel,
          })
        );
      });

      await Promise.all(promessas);
      this.alertaSucesso.set(`Permissões de ${this.getNome(u)} salvas com sucesso!`);
      this.fecharEditor();
      await this.carregarUsuarios();
    } catch {
      this.alertaErro.set('Erro ao salvar permissões do usuário.');
    } finally {
      this.salvando.set(false);
    }
  }

  // --- EXCLUSÃO DE USUÁRIO ---
  solicitarExclusaoUsuario(user: ProfissionalComPermissoes): void {
    this.usuarioParaExcluir.set(user);
  }

  async confirmarExclusaoUsuario(): Promise<void> {
    const u = this.usuarioParaExcluir();
    if (!u) return;

    this.excluindoUsuario.set(true);
    try {
      const { error } = await this.supabaseService.excluirUsuarioAdminViaFunction(u.id);
      if (error) {
        this.alertaErro.set('Erro ao excluir usuário: ' + error.message);
        return;
      }

      this.alertaSucesso.set(`Usuário ${this.getNome(u)} excluído com sucesso.`);
      this.usuarioParaExcluir.set(null);
      await this.carregarUsuarios();
    } catch (e: any) {
      this.alertaErro.set('Falha na exclusão do usuário.');
    } finally {
      this.excluindoUsuario.set(false);
    }
  }

  // --- NOVO USUÁRIO INDIVIDUAL ---
  abrirModalNovoUsuario(): void {
    this.novoNome.set('');
    this.novoEmail.set('');
    this.novoPerfilId.set('');
    this.novoEnviarEmail.set(true);
    this.erroNovoUsuario.set(null);
    this.modalNovoUsuarioAberto.set(true);
  }

  fecharModalNovoUsuario(): void {
    this.modalNovoUsuarioAberto.set(false);
  }

  onNovoPerfilChange(event: Event): void {
    this.novoPerfilId.set((event.target as HTMLSelectElement).value);
  }

  async submeterNovoUsuario(event: Event): Promise<void> {
    event.preventDefault();
    const nome = this.novoNome().trim();
    const email = this.novoEmail().trim();
    const perfilNome = this.novoPerfilId().trim();

    if (!nome || !email) {
      this.erroNovoUsuario.set('Nome e e-mail são obrigatórios.');
      return;
    }

    this.salvandoNovoUsuario.set(true);
    this.erroNovoUsuario.set(null);

    try {
      const { data, error, senhaProvisoria } = await this.supabaseService.criarUsuarioAdminViaFunction({
        full_name: nome,
        email,
        perfil_nome: perfilNome || undefined,
        enviar_email: this.novoEnviarEmail(),
      });

      if (error) {
        this.erroNovoUsuario.set(error.message);
        return;
      }

      this.fecharModalNovoUsuario();
      await this.carregarUsuarios();

      if (senhaProvisoria) {
        this.confirmacaoSenha.set({
          nome,
          email,
          senha: senhaProvisoria,
          perfilNome,
          userData: data,
        });
      } else {
        this.alertaSucesso.set(`Usuário ${nome} criado com sucesso!`);
      }
    } catch (e: any) {
      this.erroNovoUsuario.set('Falha ao processar cadastro de usuário.');
    } finally {
      this.salvandoNovoUsuario.set(false);
    }
  }

  async copiarSenhaProvisoria(senha: string): Promise<void> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(senha);
        this.senhaCopiada.set(true);
        setTimeout(() => this.senhaCopiada.set(false), 2500);
      }
    } catch (e) {
      console.warn('Falha ao copiar:', e);
    }
  }

  concluirCriacaoUsuario(conf: ConfirmacaoSenhaProvisoria): void {
    this.confirmacaoSenha.set(null);
  }

  // --- PERFIS DE ACESSO (MOLDES) ---
  abrirEditorPerfil(perfil: PerfilAcessoItem | null): void {
    this.erroPerfil.set(null);
    if (perfil) {
      this.perfilEmEdicaoId.set(perfil.id);
      this.nomePerfil.set(perfil.nome);
      this.descricaoPerfil.set(perfil.descricao || '');
      const setMod = new Set<string>();
      for (const m of perfil.modulos) {
        setMod.add(`${m.produto}:${m.modulo}`);
      }
      this.modulosPerfilSelecionados.set(setMod);
    } else {
      this.perfilEmEdicaoId.set(null);
      this.nomePerfil.set('');
      this.descricaoPerfil.set('');
      // Inicializa com base da comunidade
      const setMod = new Set<string>(['comunidade:forum', 'comunidade:vagas', 'comunidade:materiais', 'comunidade:eventos']);
      this.modulosPerfilSelecionados.set(setMod);
    }
    this.modalPerfilAberto.set(true);
  }

  fecharEditorPerfil(): void {
    this.modalPerfilAberto.set(false);
    this.erroPerfil.set(null);
  }

  isModuloNoPerfil(produto: string, modulo: string): boolean {
    return this.modulosPerfilSelecionados().has(`${produto}:${modulo}`);
  }

  toggleModuloNoPerfil(produto: string, modulo: string): void {
    const chave = `${produto}:${modulo}`;
    const setMod = new Set(this.modulosPerfilSelecionados());
    if (setMod.has(chave)) {
      setMod.delete(chave);
    } else {
      setMod.add(chave);
    }
    this.modulosPerfilSelecionados.set(setMod);
  }

  marcarTodosModulosPerfil(produto: 'predial4' | 'comunidade', marcar: boolean): void {
    const setMod = new Set(this.modulosPerfilSelecionados());
    const lista = produto === 'predial4' ? this.modulosPredial : this.modulosComunidade;
    for (const m of lista) {
      const chave = `${produto}:${m.key}`;
      if (marcar) setMod.add(chave);
      else setMod.delete(chave);
    }
    this.modulosPerfilSelecionados.set(setMod);
  }

  limparModulosPerfil(): void {
    this.modulosPerfilSelecionados.set(new Set());
  }

  async salvarPerfil(): Promise<void> {
    const nome = this.nomePerfil().trim();
    if (!nome) {
      this.erroPerfil.set('O nome do perfil é obrigatório.');
      return;
    }

    this.salvandoPerfil.set(true);
    this.erroPerfil.set(null);

    const modulosArray: Array<{ produto: 'predial4' | 'comunidade'; modulo: string }> = [];
    this.modulosPerfilSelecionados().forEach(chave => {
      const [produto, modulo] = chave.split(':') as ['predial4' | 'comunidade', string];
      modulosArray.push({ produto, modulo });
    });

    try {
      const editId = this.perfilEmEdicaoId();
      if (editId) {
        const { error } = await this.supabaseService.atualizarPerfilAcesso(editId, {
          nome,
          descricao: this.descricaoPerfil().trim() || null,
          modulos: modulosArray,
        });
        if (error) throw error;
        this.alertaSucesso.set(`Perfil "${nome}" atualizado com sucesso!`);
      } else {
        const { error } = await this.supabaseService.criarPerfilAcesso({
          nome,
          descricao: this.descricaoPerfil().trim() || null,
          modulos: modulosArray,
        });
        if (error) throw error;
        this.alertaSucesso.set(`Perfil "${nome}" criado com sucesso!`);
      }

      this.fecharEditorPerfil();
      await this.carregarPerfisAcesso();
    } catch (err: any) {
      this.erroPerfil.set(err.message || 'Erro ao salvar perfil.');
    } finally {
      this.salvandoPerfil.set(false);
    }
  }

  async solicitarExclusaoPerfil(perfil: PerfilAcessoItem): Promise<void> {
    if (!confirm(`Deseja realmente excluir o molde de perfil "${perfil.nome}"?`)) return;
    try {
      const { error } = await this.supabaseService.excluirPerfilAcesso(perfil.id);
      if (error) throw error;
      this.alertaSucesso.set(`Perfil "${perfil.nome}" excluído com sucesso.`);
      await this.carregarPerfisAcesso();
    } catch (e: any) {
      this.alertaErro.set('Não foi possível excluir o perfil.');
    }
  }

  // --- IMPORTAÇÃO EM MASSA (TXT) ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(false);
  }

  onDropArquivo(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processarArquivoTxt(event.dataTransfer.files[0]);
    }
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processarArquivoTxt(input.files[0]);
    }
  }

  processarArquivoTxt(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.fazerParserTxt(text);
    };
    reader.readAsText(file);
  }

  fazerParserTxt(conteudo: string): void {
    const linhas = conteudo.split(/\r?\n/);
    const parsed: ItemImportacaoMassa[] = [];
    const emailsVistos = new Set<string>();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let numLinha = 0;
    for (const rawLinha of linhas) {
      numLinha++;
      const l = rawLinha.trim();
      if (!l || l.startsWith('#') || l.startsWith('//')) continue;

      // Delimitadores possíveis: ponto e vírgula, vírgula ou tab
      let partes: string[] = [];
      if (l.includes(';')) partes = l.split(';');
      else if (l.includes('\t')) partes = l.split('\t');
      else if (l.includes(',')) partes = l.split(',');
      else partes = [l];

      const nome = (partes[0] || '').trim();
      const email = (partes[1] || '').trim().toLowerCase();
      const perfilInformado = (partes[2] || '').trim();
      const perfilFinal = perfilInformado || this.perfilPadraoMassa() || 'Membro Trainee';

      let valido = true;
      let motivoInvalido: string | undefined = undefined;

      if (!nome) {
        valido = false;
        motivoInvalido = 'Nome ausente';
      } else if (!email || !emailRegex.test(email)) {
        valido = false;
        motivoInvalido = 'E-mail inválido';
      } else if (emailsVistos.has(email)) {
        valido = false;
        motivoInvalido = 'E-mail duplicado no arquivo';
      }

      if (email) emailsVistos.add(email);

      parsed.push({
        linha: numLinha,
        nome,
        email,
        perfilInformado: perfilInformado || undefined,
        perfilFinal,
        valido,
        motivoInvalido,
      });
    }

    this.itensMassa.set(parsed);
    this.loteProcessadoComSucesso.set(false);
  }

  onPerfilPadraoMassaChange(event: Event): void {
    const perfil = (event.target as HTMLSelectElement).value;
    this.perfilPadraoMassa.set(perfil);
    // Atualiza itens que não tinham perfil informado
    const atualizados = this.itensMassa().map(item => ({
      ...item,
      perfilFinal: item.perfilInformado || perfil || 'Membro Trainee',
    }));
    this.itensMassa.set(atualizados);
  }

  limparImportacaoMassa(): void {
    this.itensMassa.set([]);
    this.loteProcessadoComSucesso.set(false);
  }

  async processarImportacaoEmMassa(): Promise<void> {
    const validos = this.itensMassa().filter(i => i.valido);
    if (validos.length === 0) return;

    this.processandoMassa.set(true);
    this.alertaErro.set(null);

    const deveEnviarEmail = this.enviarEmailBoasVindasMassa();
    const chaveTemplateEscolhida = this.templateEmailMassaSelecionado();
    const isTemplatePadrao = chaveTemplateEscolhida === 'boas-vindas-padrao';
    const templateCustomizado = this.templatesEmail().find(t => t.chave === chaveTemplateEscolhida);

    const payload = validos.map(item => ({
      full_name: item.nome,
      email: item.email,
      perfil_nome: item.perfilFinal,
    }));

    try {
      // Se for template customizado, chamamos criarUsuariosEmMassaViaFunction com enviar_email = false
      // para que a function criar-usuario-admin não envie o template padrão dela
      const enviarPelaFunctionPrincipal = deveEnviarEmail && isTemplatePadrao;

      const res = await this.supabaseService.criarUsuariosEmMassaViaFunction(
        payload,
        enviarPelaFunctionPrincipal
      );

      if (!res.sucesso && res.error) {
        this.alertaErro.set('Erro ao processar lote: ' + res.error.message);
        return;
      }

      // Mapear resultados de volta para a lista de itens
      const mapaRes = new Map<string, any>();
      (res.resultados || []).forEach(r => mapaRes.set(r.email.toLowerCase(), r));

      // Se deve enviar e-mail e é um template customizado, dispara os e-mails com as variáveis substituídas
      if (deveEnviarEmail && !isTemplatePadrao && templateCustomizado && templateCustomizado.html) {
        const htmlBaseDecodificado = this.decodificarEntidadesHtml(templateCustomizado.html);
        for (const item of validos) {
          const resItem = mapaRes.get(item.email.toLowerCase());
          if (resItem && resItem.sucesso) {
            const senhaUsada = resItem.senhaProvisoria || '';
            const htmlPersonalizado = htmlBaseDecodificado
              .replace(/\{\{\s*NOME\s*\}\}/gi, item.nome)
              .replace(/\{\{\s*EMAIL\s*\}\}/gi, item.email)
              .replace(/\{\{\s*SENHA\s*\}\}/gi, senhaUsada);

            const assuntoPersonalizado = (templateCustomizado.assunto || 'Seu acesso')
              .replace(/\{\{\s*NOME\s*\}\}/gi, item.nome)
              .replace(/\{\{\s*EMAIL\s*\}\}/gi, item.email);

            try {
              await this.supabaseService.enviarEmailViaFunction({
                destinatarios: [item.email],
                assunto: assuntoPersonalizado,
                html: htmlPersonalizado,
              });
            } catch (errEmail) {
              console.warn(`Aviso: Falha ao enviar e-mail customizado para ${item.email}`, errEmail);
            }
          }
        }
      }

      const listaAtualizada = this.itensMassa().map(item => {
        if (!item.valido) return item;
        const resItem = mapaRes.get(item.email.toLowerCase());
        if (resItem) {
          return {
            ...item,
            processado: true,
            sucesso: resItem.sucesso,
            senhaProvisoria: resItem.senhaProvisoria,
            erroMsg: resItem.error,
          };
        }
        return item;
      });

      this.itensMassa.set(listaAtualizada);
      this.loteProcessadoComSucesso.set(true);
      this.alertaSucesso.set(`Lote finalizado! ${res.totalSucesso} usuários cadastrados com sucesso.`);
      await this.carregarUsuarios();
    } catch (e: any) {
      this.alertaErro.set('Falha na importação em massa.');
    } finally {
      this.processandoMassa.set(false);
    }
  }

  // ==========================================
  // MÉTODOS CRUD & PREVIEW: TEMPLATES DE E-MAIL
  // ==========================================

  abrirEditorTemplate(template: TemplateEmailItem | null): void {
    this.erroTemplate.set(null);
    if (template) {
      this.templateEmEdicaoId.set(template.id);
      this.nomeTemplate.set(template.nome);
      this.assuntoTemplate.set(template.assunto || '');
      this.htmlTemplate.set(template.html || '');
    } else {
      this.templateEmEdicaoId.set(null);
      this.nomeTemplate.set('');
      this.assuntoTemplate.set('');
      this.htmlTemplate.set('');
    }
    this.modalTemplateAberto.set(true);
  }

  fecharEditorTemplate(): void {
    this.modalTemplateAberto.set(false);
    this.templateEmEdicaoId.set(null);
    this.nomeTemplate.set('');
    this.assuntoTemplate.set('');
    this.htmlTemplate.set('');
    this.erroTemplate.set(null);
  }

  async salvarTemplate(): Promise<void> {
    const nome = this.nomeTemplate().trim();
    const assunto = this.assuntoTemplate().trim();
    const html = this.htmlTemplate().trim();

    if (!nome || !assunto || !html) {
      this.erroTemplate.set('Preencha todos os campos obrigatórios (Nome, Assunto e Código HTML).');
      return;
    }

    this.salvandoTemplate.set(true);
    this.erroTemplate.set(null);

    const chave = this.gerarChaveTemplate(nome);

    try {
      if (this.templateEmEdicaoId()) {
        const { error } = await this.supabaseService.atualizarTemplateEmail(this.templateEmEdicaoId()!, {
          nome,
          assunto,
          html,
        });
        if (error) {
          this.erroTemplate.set('Erro ao atualizar template: ' + error.message);
          return;
        }
        this.alertaSucesso.set(`Template "${nome}" atualizado com sucesso!`);
      } else {
        const { data, error } = await this.supabaseService.criarTemplateEmail({
          chave,
          nome,
          assunto,
          html,
          padrao_sistema: false,
        });
        if (error) {
          this.erroTemplate.set('Erro ao criar template: ' + error.message);
          return;
        }
        if (data?.chave) {
          this.templateEmailMassaSelecionado.set(data.chave);
        }
        this.alertaSucesso.set(`Novo template "${nome}" criado com sucesso!`);
      }

      await this.carregarTemplatesEmail();
      this.fecharEditorTemplate();
    } catch (e: any) {
      this.erroTemplate.set('Ocorreu uma falha ao salvar o template.');
    } finally {
      this.salvandoTemplate.set(false);
    }
  }

  gerarChaveTemplate(nome: string): string {
    const limpo = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return limpo || `tpl-${Date.now()}`;
  }

  async solicitarExclusaoTemplate(tpl: TemplateEmailItem): Promise<void> {
    if (tpl.padrao_sistema) {
      this.alertaErro.set('O template padrão do sistema não pode ser excluído.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o template "${tpl.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await this.supabaseService.excluirTemplateEmail(tpl.id);
      if (error) {
        this.alertaErro.set('Erro ao excluir template: ' + error.message);
        return;
      }
      this.alertaSucesso.set(`Template "${tpl.nome}" excluído com sucesso.`);
      if (this.templateEmailMassaSelecionado() === tpl.chave) {
        this.templateEmailMassaSelecionado.set('boas-vindas-padrao');
      }
      await this.carregarTemplatesEmail();
    } catch {
      this.alertaErro.set('Falha ao excluir o template.');
    }
  }

  abrirPreviewTemplate(tpl: TemplateEmailItem): void {
    this.templateParaPreview.set(tpl);
    this.modalPreviewTemplateAberto.set(true);
  }

  fecharPreviewTemplate(): void {
    this.modalPreviewTemplateAberto.set(false);
    this.templateParaPreview.set(null);
  }

  decodificarEntidadesHtml(str: string): string {
    if (!str) return '';
    let resultado = str;
    // Se contiver tags codificadas como &lt;html, &lt;body, &lt;div, &lt;table, &lt;!DOCTYPE, etc.
    if (/&lt;\s*(!DOCTYPE|[a-z])/i.test(resultado) || /&amp;lt;/i.test(resultado)) {
      try {
        if (typeof document !== 'undefined') {
          const txt = document.createElement('textarea');
          txt.innerHTML = resultado;
          resultado = txt.value;
          // Tratamento para dupla codificação (ex: &amp;lt;)
          if (/&lt;\s*(!DOCTYPE|[a-z])/i.test(resultado)) {
            txt.innerHTML = resultado;
            resultado = txt.value;
          }
        }
      } catch {
        resultado = resultado
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
      }
    }
    return resultado;
  }

  getHtmlExemplo(rawHtml?: string | null, tpl?: TemplateEmailItem | null): string {
    let html = (rawHtml || '').trim();
    if (!html) {
      if (tpl?.padrao_sistema || tpl?.chave === 'boas-vindas-padrao') {
        html = this.templatePadraoHtmlFallback();
      } else {
        return '<!DOCTYPE html><html><body style="font-family:sans-serif;color:#64748b;padding:24px;background:#f8fafc;"><p>Sem conteúdo HTML cadastrado.</p></body></html>';
      }
    }

    // Decodifica entidades HTML se necessário para correta interpretação pelo iframe/browser
    html = this.decodificarEntidadesHtml(html);

    // Substituição das variáveis dinâmicas de exemplo
    return html
      .replace(/\{\{\s*NOME\s*\}\}/gi, 'Dr. Exemplo da Silva')
      .replace(/\{\{\s*EMAIL\s*\}\}/gi, 'exemplo@dominio.com.br')
      .replace(/\{\{\s*SENHA\s*\}\}/gi, 'Abc123XyZ');
  }

  templatePadraoHtmlFallback(): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #132A41; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #ffffff; }
    .header p { margin: 0; font-size: 13px; color: #94a3b8; }
    .badge { display: inline-block; background: #B5642A; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .credentials { background: #f1f5f9; border-radius: 12px; padding: 18px; border: 1px solid #cbd5e1; margin-bottom: 24px; font-family: monospace; font-size: 13px; }
    .credential-row { margin-bottom: 8px; }
    .credential-row:last-child { margin-bottom: 0; }
    .credential-label { color: #64748b; font-weight: 600; }
    .credential-value { color: #0f172a; font-weight: 700; }
    .btn { display: block; width: 100%; box-sizing: border-box; text-align: center; background: #B5642A; color: #ffffff !important; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Amorim Academy</span>
      <h1>Seu Acesso Foi Liberado!</h1>
      <p>Bem-vindo(a) à plataforma de engenharia e tecnologia</p>
    </div>
    <div class="content">
      <div class="greeting">Olá, {{NOME}}!</div>
      <div class="message">
        Sua conta na Amorim Academy foi criada com sucesso. Utilize as credenciais abaixo para realizar o seu primeiro acesso à plataforma:
      </div>
      <div class="credentials">
        <div class="credential-row">
          <span class="credential-label">E-mail:</span>
          <span class="credential-value">{{EMAIL}}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Senha Provisória:</span>
          <span class="credential-value">{{SENHA}}</span>
        </div>
      </div>
      <a href="https://comunidade.engenhariadiagnostica.com.br" target="_blank" class="btn">Acessar Plataforma</a>
    </div>
    <div class="footer">
      Amorim Engenharia & Academy &bull; Este é um e-mail automático do sistema.
    </div>
  </div>
</body>
</html>`;
  }

  baixarHtmlTemplate(tpl: TemplateEmailItem): void {
    const htmlFinal = this.getHtmlExemplo(tpl.html, tpl);
    const blob = new Blob([htmlFinal], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const chaveNome = (tpl.chave || tpl.nome || 'template')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '-');
    link.setAttribute('download', `preview-${chaveNome}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  abrirHtmlEmNovaAba(tpl: TemplateEmailItem): void {
    const htmlFinal = this.getHtmlExemplo(tpl.html, tpl);
    const blob = new Blob([htmlFinal], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  baixarArquivoExemploTxt(): void {
    const conteudo = `# Modelo de Importação em Massa - Amorim Academy
# Formato: Nome Completo;email;Perfil de Acesso
Eng. João Roberto Silva;joao.silva@exemplo.com;Especialista 4.0
Arq. Mariana Souza;mariana.souza@exemplo.com;Perito Júnior
Carlos Eduardo Lima;carlos.lima@exemplo.com;Membro Trainee
`;
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_usuarios.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  baixarRelatorioLoteCsv(): void {
    const cabecalho = 'Nome;E-mail;Perfil;Status\n';
    const linhas = this.itensMassa()
      .map(i => `${i.nome};${i.email};${i.perfilFinal};${i.sucesso ? 'Criado' : 'Falha'}`)
      .join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_criacao_usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
