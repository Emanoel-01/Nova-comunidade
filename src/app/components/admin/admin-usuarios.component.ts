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
  userData?: any;
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
            Gestão de Usuários & Licenças
          </h3>
          <p class="text-xs sm:text-sm text-slate-500">
            Defina níveis de acesso, medalhas e permissões modulares para Predial 4.0 e Comunidade.
          </p>
        </div>

        <div class="flex items-center gap-2.5 self-start sm:self-auto">
          <!-- Botão Recarregar -->
          <button
            type="button"
            (click)="carregarUsuarios()"
            [disabled]="carregando()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Atualizar lista"
          >
            <svg class="w-3.5 h-3.5" [class.animate-spin]="carregando()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Atualizar</span>
          </button>

          <!-- Botão Cadastrar Novo Usuário -->
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
        </div>
      </div>

      <!-- Alerta Geral de Sucesso -->
      @if (alertaSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="font-medium">{{ alertaSucesso() }}</span>
          </div>
          <button
            type="button"
            (click)="alertaSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Alerta Geral de Erro -->
      @if (alertaErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">{{ alertaErro() }}</span>
          </div>
          <button
            type="button"
            (click)="alertaErro.set(null)"
            class="text-rose-600 hover:text-rose-900 p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Barra de Pesquisa e Filtros -->
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
          Total de usuários: <span class="font-bold text-slate-800">{{ usuariosFiltrados().length }}</span>
        </div>
      </div>

      <!-- Estado: Carregando -->
      @if (carregando()) {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div class="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-500 font-medium">Carregando usuários e permissões do Supabase...</p>
        </div>
      } @else {

        <!-- Lista de Usuários -->
        @if (usuariosFiltrados().length > 0) {
          <div class="grid grid-cols-1 gap-4">
            @for (user of usuariosFiltrados(); track user.id) {
              <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4">
                
                <!-- Cabeçalho do Card: Avatar, Nome, E-mail e Nível -->
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
                        <!-- Badge de Nível / Medalha -->
                        <span 
                          [class]="'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ' + getNivelBadgeClass(user.nivel_atual)"
                        >
                          <span class="w-1.5 h-1.5 rounded-full" [class]="getNivelDotClass(user.nivel_atual)"></span>
                          {{ user.nivel_atual || 'Membro Trainee' }}
                        </span>

                        <!-- Badge de Licença Global -->
                        @let licenca = getLicencaStatus(user);
                        <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ' + licenca.badgeClass">
                          @if (licenca.tipo === 'vitalicia') {
                            <svg class="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          } @else if (licenca.tipo === 'expirada') {
                            <svg class="w-3 h-3 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          } @else if (licenca.tipo === 'valida') {
                            <svg class="w-3 h-3 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          }
                          <span>{{ licenca.rotulo }}</span>
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="abrirEditorUsuario(user)"
                    class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar Permissões</span>
                  </button>
                </div>

                <!-- Resumo Visual das Permissões por Produto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  
                  <!-- Bloco Predial 4.0 -->
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
                            : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/60 text-slate-500'"
                        >
                          <span>{{ mod.nome }}</span>
                          @if (status.liberado) {
                            <span class="text-emerald-700 font-black">✓</span>
                          } @else {
                            <span class="text-slate-400">✗</span>
                          }
                          @if (status.validade) {
                            <span class="text-[11px] text-emerald-700/80 font-normal">({{ formatarValidadeCurta(status.validade) }})</span>
                          }
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Bloco Comunidade -->
                  <div class="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div class="flex items-center justify-between text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                      <div class="flex items-center gap-1.5 text-slate-700">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Comunidade Nova</span>
                      </div>
                      <span class="text-[11px] font-semibold text-slate-400">
                        {{ getLiberadosCount(user, 'comunidade') }}/{{ modulosComunidade.length }} módulos
                      </span>
                    </div>

                    <div class="flex flex-wrap gap-1.5">
                      @for (mod of modulosComunidade; track mod.key) {
                        @let status = getModuloStatus(user, 'comunidade', mod.key);
                        <span 
                          [class]="status.liberado 
                            ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                            : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/60 text-slate-500'"
                        >
                          <span>{{ mod.nome }}</span>
                          @if (status.liberado) {
                            <span class="text-emerald-700 font-black">✓</span>
                          } @else {
                            <span class="text-slate-400">✗</span>
                          }
                          @if (status.validade) {
                            <span class="text-[11px] text-emerald-700/80 font-normal">({{ formatarValidadeCurta(status.validade) }})</span>
                          }
                        </span>
                      }
                      @let totalCursosLib = getCursosLiberadosCount(user);
                      @if (totalCursosLib > 0) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs">
                          <span>🎓</span>
                          <span>{{ totalCursosLib }} curso{{ totalCursosLib > 1 ? 's' : '' }} liberado{{ totalCursosLib > 1 ? 's' : '' }}</span>
                        </span>
                      }
                    </div>
                  </div>

                </div>

              </div>
            }
          </div>
        } @else {
          <!-- Estado Vazio -->
          <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="space-y-1">
              <h4 class="text-base font-bold text-slate-800">
                Nenhum usuário encontrado
              </h4>
              <p class="text-xs text-slate-500">
                @if (termoBusca()) {
                  Nenhum usuário corresponde ao filtro "{{ termoBusca() }}".
                } @else {
                  Ainda não há profissionais registrados na tabela profissionais. Cadastre o primeiro usuário acima.
                }
              </p>
            </div>
          </div>
        }

      }

    </div>

    <!-- MODAL / PAINEL DE EDIÇÃO DE USUÁRIO -->
    @if (usuarioEmEdicao()) {
      @let u = usuarioEmEdicao()!;
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Cabeçalho do Modal -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {{ getIniciais(getNome(u)) }}
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900 leading-tight">
                  {{ getNome(u) }}
                </h4>
                <p class="text-xs text-slate-500">
                  {{ u.email }}
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="fecharEditor()"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Corpo do Modal (Scrollable) -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

            <!-- Mensagem de Erro de Edição -->
            @if (erroEdicao()) {
              <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ erroEdicao() }}</span>
              </div>
            }

            <!-- SEÇÃO 1: Nível de Acesso & Selo Visual -->
            <div class="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h5 class="text-sm font-bold text-slate-900">
                    Nível de Acesso & Medalha
                  </h5>
                  <p class="text-slate-500 text-[11px]">
                    Define o reconhecimento do usuário no Hall da Fama e sua autoridade no ecossistema.
                  </p>
                </div>

                <!-- Preview Dinâmico do Selo -->
                <span [class]="'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs ' + getNivelBadgeClass(nivelEdicao())">
                  <span class="w-2 h-2 rounded-full" [class]="getNivelDotClass(nivelEdicao())"></span>
                  {{ nivelEdicao() }}
                </span>
              </div>

              <div>
                <label for="select-nivel-edicao" class="block font-semibold text-slate-700 mb-1.5">
                  Selecione o Nível Oficial:
                </label>
                <select
                  id="select-nivel-edicao"
                  [value]="nivelEdicao()"
                  (change)="onNivelChange($event)"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs cursor-pointer"
                >
                  <option value="Membro Trainee">Membro Trainee (Iniciante)</option>
                  <option value="Membro Engajado">Membro Engajado (Ativo nas discussões)</option>
                  <option value="Colaborador Ativo">Colaborador Ativo (Contribui com materiais e estudos)</option>
                  <option value="Especialista 4.0">Especialista 4.0 (Referência técnica)</option>
                  <option value="Embaixador da Comunidade">Embaixador da Comunidade (Liderança e mentoria)</option>
                  <option value="Admin">Admin (Gestão Geral do Sistema)</option>
                </select>
              </div>
            </div>

            <!-- SEÇÃO DE LICENÇA GLOBAL -->
            <div class="bg-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-100 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Licença Global do Usuário</span>
                  </h5>
                  <p class="text-slate-500 text-[11px]">
                    Define o período de vigência e duração da conta na plataforma.
                  </p>
                </div>

                <!-- Referência: Data de entrada do membro -->
                @if (u.created_at) {
                  <div class="text-[11px] text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto shadow-2xs">
                    <span class="text-slate-400">Membro desde:</span>
                    <strong class="text-slate-700 ml-1">{{ formatarDataSimples(u.created_at) }}</strong>
                  </div>
                }
              </div>

              <!-- Seleção Rápida de Licença -->
              <div class="space-y-2">
                <label class="block font-semibold text-slate-700 text-xs">
                  Duração da Licença:
                </label>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <!-- 6 Meses -->
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('6_meses')"
                    [class]="licencaTipoEdicao() === '6_meses'
                      ? 'px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs border border-indigo-600 shadow-xs cursor-pointer text-center'
                      : 'px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer text-center'"
                  >
                    6 Meses
                  </button>

                  <!-- 1 Ano -->
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('1_ano')"
                    [class]="licencaTipoEdicao() === '1_ano'
                      ? 'px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs border border-indigo-600 shadow-xs cursor-pointer text-center'
                      : 'px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer text-center'"
                  >
                    1 Ano
                  </button>

                  <!-- Vitalícia -->
                  <button
                    type="button"
                    (click)="selecionarLicencaRapida('vitalicia')"
                    [class]="licencaTipoEdicao() === 'vitalicia'
                      ? 'px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs border border-emerald-600 shadow-xs cursor-pointer text-center'
                      : 'px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer text-center'"
                  >
                    Vitalícia (Sem expiração)
                  </button>
                </div>
              </div>

              <!-- Expiração da Licença / Data Personalizada -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label for="licenca-validade-input" class="block font-semibold text-slate-700 mb-1">
                    Data de Expiração da Licença:
                  </label>
                  @if (licencaTipoEdicao() === 'vitalicia') {
                    <div class="px-3.5 py-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Acesso Vitalício — Sem data limite</span>
                    </div>
                  } @else {
                    <input
                      id="licenca-validade-input"
                      type="date"
                      [value]="licencaValidadeEdicao()"
                      (input)="onLicencaDataManualChange($event)"
                      class="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs cursor-pointer"
                    />
                  }
                </div>

                <div class="flex items-center text-[11px] text-slate-500 sm:pt-4">
                  @if (licencaTipoEdicao() === 'vitalicia') {
                    <span>O membro possui acesso contínuo aos módulos liberados sem prazo de expiração geral.</span>
                  } @else if (licencaValidadeEdicao()) {
                    <span>Vigência calculada até <strong>{{ formatarDataSimples(licencaValidadeEdicao()) }}</strong>.</span>
                  } @else {
                    <span>Selecione uma das opções de vigência ou preencha uma data de término.</span>
                  }
                </div>
              </div>
            </div>

            <!-- SEÇÃO 2: Módulos do Predial 4.0 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <h5 class="text-sm font-bold text-slate-900">
                    Módulos do Predial 4.0
                  </h5>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="marcarTodosModulos('predial4', true)"
                    class="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Liberar Todos
                  </button>
                  <span class="text-slate-300">·</span>
                  <button
                    type="button"
                    (click)="marcarTodosModulos('predial4', false)"
                    class="text-[11px] text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Bloquear Todos
                  </button>
                </div>
              </div>

              <div class="space-y-2.5">
                @for (mod of modulosPredial; track mod.key) {
                  <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        [checked]="isModuloLiberadoEdicao('predial4', mod.key)"
                        (change)="toggleModuloEdicao('predial4', mod.key)"
                        class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-900">{{ mod.nome }}</span>
                          @if (isModuloLiberadoEdicao('predial4', mod.key)) {
                            <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Liberado</span>
                          } @else {
                            <span class="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-slate-100 text-slate-500">Bloqueado</span>
                          }
                        </div>
                        <p class="text-slate-500 text-[11px] mt-0.5">{{ mod.descricao }}</p>
                      </div>
                    </label>

                    <!-- Campo Válido até -->
                    <div class="flex items-center gap-2 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
                      <label [for]="'validade-predial-' + mod.key" class="text-slate-500 text-[11px] whitespace-nowrap">
                        Válido até:
                      </label>
                      <input
                        [id]="'validade-predial-' + mod.key"
                        type="date"
                        [value]="getValidadeEdicao('predial4', mod.key)"
                        (input)="onValidadeChange('predial4', mod.key, $event)"
                        placeholder="Sem vencimento"
                        class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- SEÇÃO 3: Módulos da Comunidade -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <h5 class="text-sm font-bold text-slate-900">
                    Módulos da Comunidade Nova
                  </h5>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="marcarTodosModulos('comunidade', true)"
                    class="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    Liberar Todos
                  </button>
                  <span class="text-slate-300">·</span>
                  <button
                    type="button"
                    (click)="marcarTodosModulos('comunidade', false)"
                    class="text-[11px] text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    Bloquear Todos
                  </button>
                </div>
              </div>

              <!-- Grupo 1: Acesso Base (Automático ao aprovar solicitação) -->
              <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                      Acesso Base
                    </span>
                    <span class="font-bold text-slate-800 text-xs">Liberado Automaticamente ao Aprovar</span>
                  </div>
                  <span class="text-[11px] text-slate-500">Módulos padrão da Comunidade</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Estes 4 módulos são liberados imediatamente para todo membro aprovado. Você pode revogá-los individualmente abaixo se necessário.
                </p>

                <div class="space-y-2">
                  @for (mod of modulosComunidadeBase; track mod.key) {
                    <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
                        <input
                          type="checkbox"
                          [checked]="isModuloLiberadoEdicao('comunidade', mod.key)"
                          (change)="toggleModuloEdicao('comunidade', mod.key)"
                          class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5 cursor-pointer"
                        />
                        <div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold text-slate-900">{{ mod.nome }}</span>
                            <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Base</span>
                            @if (isModuloLiberadoEdicao('comunidade', mod.key)) {
                              <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-emerald-600 text-white">Ativo</span>
                            } @else {
                              <span class="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">Revogado</span>
                            }
                          </div>
                          <p class="text-slate-500 text-[11px] mt-0.5">{{ mod.descricao }}</p>
                        </div>
                      </label>

                      <!-- Campo Válido até -->
                      <div class="flex items-center gap-2 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
                        <label [for]="'validade-comunidade-' + mod.key" class="text-slate-500 text-[11px] whitespace-nowrap">
                          Válido até:
                        </label>
                        <input
                          [id]="'validade-comunidade-' + mod.key"
                          type="date"
                          [value]="getValidadeEdicao('comunidade', mod.key)"
                          (input)="onValidadeChange('comunidade', mod.key, $event)"
                          placeholder="Sem vencimento"
                          class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Grupo 2: Módulos Adicionais (Liberação Manual) -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                      Adicionais
                    </span>
                    <span class="font-bold text-slate-800 text-xs">Liberação Manual</span>
                  </div>
                  <span class="text-[11px] text-slate-500">Exige concessão individual pelo administrador</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Módulos de agentes de inteligência artificial e permissões administrativas.
                </p>

                <div class="space-y-2">
                  @for (mod of modulosComunidadeAdicionais; track mod.key) {
                    <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
                        <input
                          type="checkbox"
                          [checked]="isModuloLiberadoEdicao('comunidade', mod.key)"
                          (change)="toggleModuloEdicao('comunidade', mod.key)"
                          class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5 cursor-pointer"
                        />
                        <div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold text-slate-900">{{ mod.nome }}</span>
                            @if (isModuloLiberadoEdicao('comunidade', mod.key)) {
                              <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">Liberado</span>
                            } @else {
                              <span class="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-slate-100 text-slate-500">Bloqueado</span>
                            }
                          </div>
                          <p class="text-slate-500 text-[11px] mt-0.5">{{ mod.descricao }}</p>
                        </div>
                      </label>

                      <!-- Campo Válido até -->
                      <div class="flex items-center gap-2 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
                        <label [for]="'validade-comunidade-' + mod.key" class="text-slate-500 text-[11px] whitespace-nowrap">
                          Válido até:
                        </label>
                        <input
                          [id]="'validade-comunidade-' + mod.key"
                          type="date"
                          [value]="getValidadeEdicao('comunidade', mod.key)"
                          (input)="onValidadeChange('comunidade', mod.key, $event)"
                          placeholder="Sem vencimento"
                          class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Grupo 3: Cursos de Capacitação (Acesso Granular por Curso) -->
              <div class="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                      Cursos Liberados
                    </span>
                    <span class="font-bold text-slate-800 text-xs">Acesso Granular por Curso</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="marcarTodosCursos(true)"
                      class="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Liberar Todos
                    </button>
                    <span class="text-slate-300">·</span>
                    <button
                      type="button"
                      (click)="marcarTodosCursos(false)"
                      class="text-[11px] text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                    >
                      Bloquear Todos
                    </button>
                  </div>
                </div>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Conceda acesso a cursos e videoaulas técnicas individualmente. O membro terá acesso imediato e sua matrícula oficial é gerada automaticamente.
                </p>

                @if (cursosCadastrados().length === 0) {
                  <div class="p-3.5 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                    Nenhum curso ativo cadastrado no sistema. Crie novos cursos na aba Gestão de Cursos.
                  </div>
                } @else {
                  <div class="space-y-2">
                    @for (curso of cursosCadastrados(); track curso.id) {
                      <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <label class="flex items-start gap-3 cursor-pointer select-none flex-1">
                          <input
                            type="checkbox"
                            [checked]="isModuloLiberadoEdicao('comunidade', curso.id)"
                            (change)="toggleModuloEdicao('comunidade', curso.id)"
                            class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5 cursor-pointer"
                          />
                          <div>
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="font-bold text-slate-900">{{ curso.titulo }}</span>
                              @if (curso.categoria) {
                                <span class="px-1.5 py-0.2 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{{ curso.categoria }}</span>
                              }
                              @if (isModuloLiberadoEdicao('comunidade', curso.id)) {
                                <span class="px-1.5 py-0.2 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Liberado</span>
                              } @else {
                                <span class="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-slate-100 text-slate-500">Bloqueado</span>
                              }
                            </div>
                          </div>
                        </label>

                        <!-- Campo Válido até -->
                        <div class="flex items-center gap-2 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
                          <label [for]="'validade-curso-' + curso.id" class="text-slate-500 text-[11px] whitespace-nowrap">
                            Válido até:
                          </label>
                          <input
                            [id]="'validade-curso-' + curso.id"
                            type="date"
                            [value]="getValidadeEdicao('comunidade', curso.id)"
                            (input)="onValidadeChange('comunidade', curso.id, $event)"
                            placeholder="Sem vencimento"
                            class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- Rodapé do Modal com Ações -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="fecharEditor()"
              [disabled]="salvando()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              (click)="salvarPermissoes()"
              [disabled]="salvando()"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (salvando()) {
                <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Salvando...</span>
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Salvar Permissões</span>
              }
            </button>
          </div>

        </div>
      </div>
    }

    <!-- MODAL DE CADASTRO MANUAL DE NOVO USUÁRIO -->
    @if (modalNovoUsuarioAberto()) {
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900 leading-tight">
                  Cadastrar Novo Usuário
                </h4>
                <p class="text-xs text-slate-500">
                  Cria a conta com segurança no servidor e gera a senha provisória.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="fecharModalNovoUsuario()"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (submit)="submeterNovoUsuario($event)" class="p-6 space-y-4 text-xs">
            
            @if (erroNovoUsuario()) {
              <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ erroNovoUsuario() }}</span>
              </div>
            }

            <div>
              <label for="novo-nome" class="block font-bold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                id="novo-nome"
                type="text"
                [value]="novoNome()"
                (input)="novoNome.set($any($event.target).value)"
                placeholder="Ex: Engenheiro Carlos Eduardo"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
              />
            </div>

            <div>
              <label for="novo-email" class="block font-bold text-slate-700 mb-1">
                E-mail Corporativo / Profissional *
              </label>
              <input
                id="novo-email"
                type="email"
                [value]="novoEmail()"
                (input)="novoEmail.set($any($event.target).value)"
                placeholder="Ex: carlos@engenharia.com.br"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
              />
            </div>

            <div>
              <label for="novo-nivel" class="block font-bold text-slate-700 mb-1">
                Nível de Acesso Inicial
              </label>
              <select
                id="novo-nivel"
                [value]="novoNivel()"
                (change)="novoNivel.set($any($event.target).value)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs cursor-pointer"
              >
                <option value="Membro Trainee">Membro Trainee</option>
                <option value="Membro Engajado">Membro Engajado</option>
                <option value="Colaborador Ativo">Colaborador Ativo</option>
                <option value="Especialista 4.0">Especialista 4.0</option>
                <option value="Embaixador da Comunidade">Embaixador da Comunidade</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <!-- Aviso sobre Autenticação & Edge Function -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed space-y-1">
              <div class="flex items-center gap-1.5 font-bold text-slate-700">
                <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Provisionamento Seguro:</span>
              </div>
              <p>
                A conta será criada com e-mail confirmado e uma senha provisória aleatória e segura gerada pelo servidor. Você poderá copiá-la ao finalizar.
              </p>
            </div>

            <div class="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="fecharModalNovoUsuario()"
                [disabled]="salvandoNovoUsuario()"
                class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="salvandoNovoUsuario()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (salvandoNovoUsuario()) {
                  <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Provisionando Conta...</span>
                } @else {
                  <span>Criar Conta & Gerar Senha</span>
                }
              </button>
            </div>

          </form>

        </div>
      </div>
    }

    <!-- MODAL DE CONFIRMAÇÃO DE SENHA PROVISÓRIA GERADA -->
    @if (confirmacaoSenha()) {
      @let conf = confirmacaoSenha()!;
      <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <div class="px-6 py-5 border-b border-emerald-100 bg-emerald-50/70 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 class="text-base font-bold text-slate-900 leading-tight">
                  Conta Criada com Sucesso!
                </h4>
                <p class="text-xs text-emerald-800 font-medium">
                  {{ conf.nome }} ({{ conf.email }})
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-5 text-xs">
            
            <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div class="flex items-center gap-2 text-amber-900 font-bold">
                <svg class="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Atenção: Senha Provisória</span>
              </div>
              
              <p class="text-amber-800 leading-relaxed text-[11px]">
                Copie e envie para a pessoa por um canal seguro. <strong>Esta senha não será mostrada novamente.</strong>
              </p>

              <!-- Bloco da Senha com Botão Copiar -->
              <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-300/80 shadow-2xs">
                <div class="font-mono text-sm sm:text-base font-black tracking-wider text-slate-900 select-all">
                  {{ conf.senha }}
                </div>

                <button
                  type="button"
                  (click)="copiarSenhaProvisoria(conf.senha)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  [class]="senhaCopiada()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'"
                >
                  @if (senhaCopiada()) {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copiado!</span>
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copiar Senha</span>
                  }
                </button>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              O usuário já pode fazer login na plataforma utilizando o e-mail <strong>{{ conf.email }}</strong> e esta senha provisória.
            </div>

            <div class="pt-2 flex items-center justify-end">
              <button
                type="button"
                (click)="concluirCriacaoUsuario(conf)"
                class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Configurar Licenças & Permissões →</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    }

  `
})
export class AdminUsuariosComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

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

  readonly cursosCadastrados = signal<{ id: string; titulo: string; categoria?: string; ativo?: boolean }[]>([]);
  readonly usuarios = signal<ProfissionalComPermissoes[]>([]);
  readonly termoBusca = signal('');
  readonly carregando = signal(false);
  readonly alertaSucesso = signal<string | null>(null);
  readonly alertaErro = signal<string | null>(null);

  // Estados de Edição
  readonly usuarioEmEdicao = signal<ProfissionalComPermissoes | null>(null);
  readonly nivelEdicao = signal<string>('Membro Trainee');
  readonly licencaTipoEdicao = signal<'6_meses' | '1_ano' | 'vitalicia' | 'personalizada' | ''>('');
  readonly licencaValidadeEdicao = signal<string>('');
  readonly permissoesEdicao = signal<Map<string, { liberado: boolean; validade: string | null }>>(new Map());
  readonly salvando = signal(false);
  readonly erroEdicao = signal<string | null>(null);

  // Estados do Modal Novo Usuário
  readonly modalNovoUsuarioAberto = signal(false);
  readonly novoNome = signal('');
  readonly novoEmail = signal('');
  readonly novoNivel = signal('Membro Trainee');
  readonly salvandoNovoUsuario = signal(false);
  readonly erroNovoUsuario = signal<string | null>(null);

  // Confirmação de Senha Provisória
  readonly confirmacaoSenha = signal<ConfirmacaoSenhaProvisoria | null>(null);
  readonly senhaCopiada = signal(false);

  readonly usuariosFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) return this.usuarios();
    return this.usuarios().filter(u => {
      const nome = this.getNome(u).toLowerCase();
      const email = (u.email || '').toLowerCase();
      return nome.includes(termo) || email.includes(termo);
    });
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  async carregarUsuarios(): Promise<void> {
    this.carregando.set(true);
    this.alertaErro.set(null);

    try {
      const [dados, cursos] = await Promise.all([
        this.supabaseService.listarProfissionaisComPermissoes(),
        this.supabaseService.listarCursosAtivos(),
      ]);
      this.usuarios.set(dados);
      this.cursosCadastrados.set(cursos);
    } catch (e: any) {
      this.alertaErro.set('Erro ao buscar lista de profissionais e cursos.');
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.termoBusca.set(val);
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
      case 'Membro Engajado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Colaborador Ativo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Especialista 4.0':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Embaixador da Comunidade':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Admin':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Membro Trainee':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getNivelDotClass(nivel?: string): string {
    switch (nivel) {
      case 'Membro Engajado':
        return 'bg-blue-500';
      case 'Colaborador Ativo':
        return 'bg-emerald-500';
      case 'Especialista 4.0':
        return 'bg-purple-500';
      case 'Embaixador da Comunidade':
        return 'bg-amber-500';
      case 'Admin':
        return 'bg-rose-500';
      case 'Membro Trainee':
      default:
        return 'bg-slate-400';
    }
  }

  formatarDataSimples(valStr?: string | null): string {
    if (!valStr) return '';
    try {
      const d = new Date(valStr);
      if (isNaN(d.getTime())) return valStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return valStr;
    }
  }

  getLicencaStatus(user: ProfissionalComPermissoes): {
    tipo: 'vitalicia' | 'valida' | 'expirada' | 'indefinida';
    rotulo: string;
    badgeClass: string;
  } {
    if (user.licenca_tipo === 'vitalicia') {
      return {
        tipo: 'vitalicia',
        rotulo: 'Licença Vitalícia',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }

    if (user.licenca_validade) {
      const dataVal = new Date(user.licenca_validade);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataFormatada = this.formatarDataSimples(user.licenca_validade);
      if (!isNaN(dataVal.getTime()) && dataVal < hoje) {
        return {
          tipo: 'expirada',
          rotulo: `Expirada (${dataFormatada})`,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        };
      }

      return {
        tipo: 'valida',
        rotulo: `Expira em ${dataFormatada}`,
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }

    return {
      tipo: 'indefinida',
      rotulo: 'Licença Padrão',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  }

  getModuloStatus(user: ProfissionalComPermissoes, produto: 'predial4' | 'comunidade', moduloKey: string): { liberado: boolean; validade: string | null } {
    if (!user.permissoes) return { liberado: false, validade: null };
    const perm = user.permissoes.find(p => p.produto === produto && p.modulo === moduloKey);
    return {
      liberado: perm?.liberado ?? false,
      validade: perm?.validade ?? null,
    };
  }

  getLiberadosCount(user: ProfissionalComPermissoes, produto: 'predial4' | 'comunidade'): number {
    if (!user.permissoes) return 0;
    return user.permissoes.filter(p => p.produto === produto && p.liberado).length;
  }

  getCursosLiberadosCount(user: ProfissionalComPermissoes): number {
    if (!user.permissoes) return 0;
    const cursoIds = new Set(this.cursosCadastrados().map(c => c.id));
    return user.permissoes.filter(p => p.produto === 'comunidade' && cursoIds.has(p.modulo) && p.liberado).length;
  }

  formatarValidadeCurta(valStr?: string | null): string {
    if (!valStr) return '';
    try {
      const d = new Date(valStr);
      if (isNaN(d.getTime())) return valStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return valStr;
    }
  }

  // --- CONTROLE DE LICENÇA GLOBAL ---
  calcularDataMeses(meses: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + meses);
    return d.toISOString().split('T')[0];
  }

  calcularDataAnos(anos: number): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + anos);
    return d.toISOString().split('T')[0];
  }

  selecionarLicencaRapida(tipo: '6_meses' | '1_ano' | 'vitalicia'): void {
    this.licencaTipoEdicao.set(tipo);
    if (tipo === '6_meses') {
      this.licencaValidadeEdicao.set(this.calcularDataMeses(6));
    } else if (tipo === '1_ano') {
      this.licencaValidadeEdicao.set(this.calcularDataAnos(1));
    } else if (tipo === 'vitalicia') {
      this.licencaValidadeEdicao.set('');
    }
  }

  onLicencaDataManualChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.licencaValidadeEdicao.set(val);
    if (val) {
      this.licencaTipoEdicao.set('personalizada');
    } else {
      this.licencaTipoEdicao.set('');
    }
  }

  // --- EDITOR DE USUÁRIO ---
  abrirEditorUsuario(user: ProfissionalComPermissoes): void {
    this.usuarioEmEdicao.set(user);
    this.nivelEdicao.set(user.nivel_atual || 'Membro Trainee');
    this.licencaTipoEdicao.set((user.licenca_tipo as any) || (user.licenca_validade ? 'personalizada' : ''));
    this.licencaValidadeEdicao.set(user.licenca_validade ? user.licenca_validade.split('T')[0] : '');
    this.erroEdicao.set(null);

    const mapa = new Map<string, { liberado: boolean; validade: string | null }>();

    // Carregar módulos do Predial
    for (const m of this.modulosPredial) {
      const chave = `predial4:${m.key}`;
      const status = this.getModuloStatus(user, 'predial4', m.key);
      mapa.set(chave, { liberado: status.liberado, validade: status.validade ? status.validade.split('T')[0] : null });
    }

    // Carregar módulos da Comunidade
    for (const m of this.modulosComunidade) {
      const chave = `comunidade:${m.key}`;
      const status = this.getModuloStatus(user, 'comunidade', m.key);
      mapa.set(chave, { liberado: status.liberado, validade: status.validade ? status.validade.split('T')[0] : null });
    }

    // Carregar cursos individuais da Comunidade
    for (const c of this.cursosCadastrados()) {
      const chave = `comunidade:${c.id}`;
      const status = this.getModuloStatus(user, 'comunidade', c.id);
      mapa.set(chave, { liberado: status.liberado, validade: status.validade ? status.validade.split('T')[0] : null });
    }

    this.permissoesEdicao.set(mapa);
  }

  fecharEditor(): void {
    this.usuarioEmEdicao.set(null);
    this.erroEdicao.set(null);
  }

  onNivelChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.nivelEdicao.set(val);
  }

  isModuloLiberadoEdicao(produto: 'predial4' | 'comunidade', modulo: string): boolean {
    const chave = `${produto}:${modulo}`;
    return this.permissoesEdicao().get(chave)?.liberado ?? false;
  }

  getValidadeEdicao(produto: 'predial4' | 'comunidade', modulo: string): string {
    const chave = `${produto}:${modulo}`;
    return this.permissoesEdicao().get(chave)?.validade ?? '';
  }

  toggleModuloEdicao(produto: 'predial4' | 'comunidade', modulo: string): void {
    const chave = `${produto}:${modulo}`;
    const mapa = new Map(this.permissoesEdicao());
    const atual = mapa.get(chave) || { liberado: false, validade: null };
    mapa.set(chave, { ...atual, liberado: !atual.liberado });
    this.permissoesEdicao.set(mapa);
  }

  onValidadeChange(produto: 'predial4' | 'comunidade', modulo: string, event: Event): void {
    const val = (event.target as HTMLInputElement).value || null;
    const chave = `${produto}:${modulo}`;
    const mapa = new Map(this.permissoesEdicao());
    const atual = mapa.get(chave) || { liberado: false, validade: null };
    mapa.set(chave, { ...atual, validade: val });
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

  marcarTodosCursos(liberado: boolean): void {
    const mapa = new Map(this.permissoesEdicao());
    for (const curso of this.cursosCadastrados()) {
      const chave = `comunidade:${curso.id}`;
      const atual = mapa.get(chave) || { liberado: false, validade: null };
      mapa.set(chave, { ...atual, liberado });
    }
    this.permissoesEdicao.set(mapa);
  }

  async salvarPermissoes(): Promise<void> {
    const u = this.usuarioEmEdicao();
    if (!u) return;

    this.salvando.set(true);
    this.erroEdicao.set(null);

    try {
      const nivel = this.nivelEdicao();
      const tipoLicenca = this.licencaTipoEdicao() || null;
      const validadeLicenca = this.licencaValidadeEdicao() || null;

      // Atualizar nível e licença global na tabela profissionais
      const { error: erroProf } = await this.supabaseService.atualizarProfissionalAdmin(u.id, {
        nivel_atual: nivel,
        licenca_tipo: tipoLicenca,
        licenca_validade: tipoLicenca === 'vitalicia' ? null : validadeLicenca,
      });

      if (erroProf) {
        console.warn('Aviso ao atualizar dados do profissional:', erroProf.message);
      }

      // Upsert das permissões para cada módulo
      const mapa = this.permissoesEdicao();
      const promessas: Promise<{ error: Error | null }>[] = [];

      mapa.forEach((val, chave) => {
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

      const resultados = await Promise.all(promessas);
      const erroUpsert = resultados.find(r => r.error !== null);

      if (erroUpsert) {
        this.erroEdicao.set(`Não foi possível salvar algumas permissões: ${erroUpsert.error?.message || 'erro de rede'}`);
        return;
      }

      this.alertaSucesso.set(`Permissões e licença de ${this.getNome(u)} salvas com sucesso!`);
      this.fecharEditor();
      await this.carregarUsuarios();
    } catch (e: any) {
      this.erroEdicao.set('Ocorreu uma falha inesperada ao salvar permissões.');
    } finally {
      this.salvando.set(false);
    }
  }

  // --- CADASTRO SEGURO DE NOVO USUÁRIO ---
  abrirModalNovoUsuario(): void {
    this.novoNome.set('');
    this.novoEmail.set('');
    this.novoNivel.set('Membro Trainee');
    this.erroNovoUsuario.set(null);
    this.modalNovoUsuarioAberto.set(true);
  }

  fecharModalNovoUsuario(): void {
    this.modalNovoUsuarioAberto.set(false);
    this.erroNovoUsuario.set(null);
  }

  async submeterNovoUsuario(event: Event): Promise<void> {
    event.preventDefault();
    const nome = this.novoNome().trim();
    const email = this.novoEmail().trim();
    const nivel = this.novoNivel();

    if (!nome || !email) {
      this.erroNovoUsuario.set('Por favor, informe o Nome Completo e o E-mail.');
      return;
    }

    this.salvandoNovoUsuario.set(true);
    this.erroNovoUsuario.set(null);

    try {
      // 1. Tentar criar via Edge Function segura no servidor
      const { data, error, senhaProvisoria } = await this.supabaseService.criarUsuarioAdminViaFunction({
        full_name: nome,
        email,
        nivel_atual: nivel,
      });

      if (!error && senhaProvisoria) {
        this.fecharModalNovoUsuario();
        await this.carregarUsuarios();
        this.confirmacaoSenha.set({
          nome,
          email,
          senha: senhaProvisoria,
          userData: data,
        });
        return;
      }

      // Se a Edge Function retornar erro ou não estiver implantada, tenta via inserção direta na tabela profissionais com aviso
      const { data: directData, error: directError } = await this.supabaseService.cadastrarProfissional({
        full_name: nome,
        email,
        nivel_atual: nivel,
      });

      if (directError) {
        this.erroNovoUsuario.set(`Erro ao criar usuário: ${error?.message || directError.message}`);
        return;
      }

      this.fecharModalNovoUsuario();
      this.alertaSucesso.set(`Usuário ${nome} registrado com sucesso! Configure as permissões abaixo.`);
      await this.carregarUsuarios();

      if (directData) {
        this.abrirEditorUsuario(directData);
      }
    } catch (e: any) {
      this.erroNovoUsuario.set('Falha ao processar o cadastro de usuário.');
    } finally {
      this.salvandoNovoUsuario.set(false);
    }
  }

  async copiarSenhaProvisoria(senha: string): Promise<void> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(senha);
        this.senhaCopiada.set(true);
        setTimeout(() => this.senhaCopiada.set(false), 3000);
      }
    } catch (err) {
      console.warn('Falha ao copiar senha para a área de transferência:', err);
    }
  }

  concluirCriacaoUsuario(conf: ConfirmacaoSenhaProvisoria): void {
    this.confirmacaoSenha.set(null);
    if (conf.userData) {
      this.abrirEditorUsuario(conf.userData);
    }
  }
}
