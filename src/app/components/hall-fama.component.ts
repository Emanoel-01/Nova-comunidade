import { Component, OnInit, OnDestroy, computed, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { REGRAS_PONTUACAO } from '../utils/gamificacao.util';

export interface GamificacaoPerfil {
  id?: string;
  user_id?: string;
  nome_exibicao?: string;
  nome?: string;
  avatar_url?: string;
  nivel_atual?: string;
  professional_title?: string;
  pontos_total?: number;
  pontos_semana?: number;
  pontos_mes?: number;
  pontos_ano?: number;
  ficticio?: boolean;
}

export interface PremioGamificacao {
  id: string;
  mes: number;
  ano: number;
  posicao: number;
  titulo: string;
  descricao?: string | null;
  imagem_url?: string | null;
  ativo: boolean;
}

export interface HistoricoVencedor {
  id: string;
  ano: number;
  mes: number;
  posicao: number;
  user_id?: string;
  pontos_final?: number;
  premio_titulo?: string;
  nome_exibicao?: string;
  avatar_url?: string;
  professional_title?: string;
  nivel_atual?: string;
}

@Component({
  selector: 'app-hall-fama',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div [class]="modoCompacto() ? 'space-y-4' : 'space-y-6'">
      
      <!-- ======================================================= -->
      <!-- 1. HERO / CABEÇALHO DO HALL DA FAMA                    -->
      <!-- ======================================================= -->
      @if (modoCompacto()) {
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

          <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1 max-w-xl">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/25 max-w-full">
                <span class="shrink-0">🏆</span>
                <span class="break-words">Ranking & Conquistas</span>
              </div>

              <h3 class="text-lg sm:text-xl font-black tracking-tight text-white">
                Hall da Fama Business 4.0
              </h3>

              <p class="text-xs text-amber-50 font-medium leading-normal">
                Reconhecimento oficial dos membros mais engajados no ecossistema.
              </p>
            </div>

            <!-- Badge de Tempo Real -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/15 self-start sm:self-auto text-xs font-bold text-amber-100 shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Tempo Real</span>
            </div>
          </div>
        </div>
      } @else {
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1.5 max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/25 backdrop-blur-xs max-w-full">
                <span class="text-sm shrink-0">🏆</span>
                <span class="break-words">Reconhecimento & Conquistas</span>
              </div>

              <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Hall da Fama Business 4.0
              </h2>

              <p class="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
                O ecossistema reconhece e premia os membros mais engajados em diagnósticos, automações de IA, discussões técnicas e compartilhamento de conhecimento.
              </p>
            </div>

            <!-- Badge de Tempo Real -->
            <div class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/15 self-start md:self-auto text-xs font-bold text-amber-100 shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Atualização em Tempo Real</span>
            </div>
          </div>
        </div>
      }

      <!-- ======================================================= -->
      <!-- 2. VITRINE DE PRÊMIOS DO MÊS EM DISPUTA                 -->
      <!-- ======================================================= -->
      @if (!modoCompacto()) {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base border border-amber-200/60 shadow-2xs">
                🎁
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900">
                  Prêmios em Disputa ({{ getNomeMesAtual() }} / {{ anoAtual }})
                </h3>
                <p class="text-xs text-slate-500 font-medium">Premiações oficiais para os líderes do ranking deste mês</p>
              </div>
            </div>
          </div>

          @if (carregandoPremios()) {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
                  <div class="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              }
            </div>
          } @else if (premiosMesAtual().length === 0) {
            <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-2">
              <div class="text-2xl">🎖️</div>
              <p class="text-xs sm:text-sm font-bold text-slate-800">
                Prêmios deste mês em fase de definição
              </p>
              <p class="text-xs text-slate-500 max-w-md mx-auto">
                A equipe da Amorim Tech está finalizando o pacote de premiações exclusivas para o fechamento deste mês. Continue participando e acumulando pontos!
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (premio of premiosMesAtual(); track premio.id) {
                <div
                  class="bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-2xs relative overflow-hidden"
                  [class]="getCardPremioClass(premio.posicao)"
                >
                  <!-- Faixa de Destaque -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl border shadow-xs"
                        [class]="getMedalhaBadgeClass(premio.posicao)"
                      >
                        {{ getMedalhaIcone(premio.posicao) }}
                      </div>
                      <span class="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
                        [class]="getPosicaoTagClass(premio.posicao)"
                      >
                        {{ getPosicaoTexto(premio.posicao) }}
                      </span>
                    </div>

                    @if (premio.imagem_url) {
                      <div class="h-28 w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        <img
                          [src]="premio.imagem_url"
                          [alt]="premio.titulo"
                          class="w-full h-full object-contain p-1"
                          referrerpolicy="no-referrer"
                        />
                      </div>
                    }

                    <div class="space-y-1">
                      <h4 class="text-sm font-black text-slate-900 leading-snug">
                        {{ premio.titulo }}
                      </h4>
                      @if (premio.descricao) {
                        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {{ premio.descricao }}
                        </p>
                      }
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Entrega no encerramento</span>
                    <span class="font-bold text-amber-700">Vigência: {{ getNomeMes(premio.mes) }}/{{ premio.ano }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ======================================================= -->
      <!-- 3. RANKING PRINCIPAL (SEMANA / MÊS / ANO)              -->
      <!-- ======================================================= -->
      <div
        class="bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        [class]="modoCompacto() ? 'rounded-2xl' : 'rounded-3xl'"
      >
        
        <!-- Header do Card com Abas de Período -->
        <div
          class="bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800"
          [class]="modoCompacto() ? 'p-4 sm:p-4.5' : 'p-5 sm:p-6'"
        >
          <div class="flex items-center gap-3">
            <div
              class="rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner shrink-0"
              [class]="modoCompacto() ? 'w-8 h-8 text-base' : 'w-10 h-10 text-xl'"
            >
              👑
            </div>
            <div>
              <h3
                class="font-bold tracking-tight text-white"
                [class]="modoCompacto() ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'"
              >
                @if (modoCompacto()) {
                  Top 3 do Mês ({{ getNomeMesAtual() }}/{{ anoAtual }})
                } @else {
                  Ranking Oficial
                }
              </h3>
              <p class="text-xs text-slate-400 font-medium">
                @if (modoCompacto()) {
                  Líderes de pontuação e engajamento da rodada atual
                } @else {
                  Membros com maior pontuação e engajamento
                }
              </p>
            </div>
          </div>

          @if (!modoCompacto()) {
            <!-- Abas: Esta Semana, Este Mês, Este Ano -->
            <div class="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 self-stretch sm:self-auto">
              <button
                type="button"
                id="tab-ranking-semana"
                (click)="abaAtiva.set('semana')"
                [class]="abaAtiva() === 'semana'
                  ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer'"
              >
                Esta Semana
              </button>
              <button
                type="button"
                id="tab-ranking-mes"
                (click)="abaAtiva.set('mes')"
                [class]="abaAtiva() === 'mes'
                  ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer'"
              >
                Este Mês
              </button>
              <button
                type="button"
                id="tab-ranking-ano"
                (click)="abaAtiva.set('ano')"
                [class]="abaAtiva() === 'ano'
                  ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer'"
              >
                Este Ano
              </button>
            </div>
          } @else {
            <span class="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 shrink-0">
              Top 3 Mensal
            </span>
          }
        </div>

        <!-- Conteúdo do Ranking -->
        <div [class]="modoCompacto() ? 'p-3 sm:p-4' : 'p-4 sm:p-5'">
          @if (loading()) {
            <!-- Estado de Carregamento -->
            <div [class]="modoCompacto() ? 'space-y-2' : 'space-y-2.5'">
              @for (i of (modoCompacto() ? [1, 2, 3] : [1, 2, 3, 4, 5]); track i) {
                <div class="animate-pulse flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-slate-200 rounded-full"></div>
                    <div class="w-9 h-9 bg-slate-200 rounded-full"></div>
                    <div class="space-y-1.5">
                      <div class="h-3 bg-slate-200 rounded w-28"></div>
                      <div class="h-2 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div class="h-4 bg-slate-200 rounded w-14"></div>
                </div>
              }
            </div>
          } @else if (rankingAtual().length === 0) {
            <!-- Estado Vazio -->
            <div class="text-center py-8 sm:py-10 px-4 space-y-2">
              <div class="text-3xl mb-1">⭐</div>
              <p class="text-slate-800 font-bold text-sm sm:text-base">Ainda sem pontuações registradas para este período.</p>
              <p class="text-slate-500 text-xs">
                Acesse diariamente, utilize os agentes de IA e interaja na comunidade para ser o primeiro colocado!
              </p>
            </div>
          } @else {
            <!-- Lista dos Membros -->
            <div [class]="modoCompacto() ? 'space-y-2' : 'space-y-2.5'">
              @for (perfil of rankingAtual(); track perfil.id || $index; let idx = $index) {
                <div
                  class="flex items-center justify-between transition-all border"
                  [class]="modoCompacto()
                    ? 'p-2.5 sm:p-3 rounded-xl ' + getCardMembroRankingClass(idx)
                    : 'p-3 sm:p-3.5 rounded-2xl ' + getCardMembroRankingClass(idx)"
                >
                  <!-- Posição + Avatar + Nome + Nível -->
                  <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <!-- Posição com Ícone ou Número -->
                    <div class="w-6 text-center font-black text-sm shrink-0">
                      @if (idx === 0) { 🥇 }
                      @else if (idx === 1) { 🥈 }
                      @else if (idx === 2) { 🥉 }
                      @else { <span class="text-slate-500 font-mono text-xs">{{ idx + 1 }}º</span> }
                    </div>

                    <!-- Avatar -->
                    <div class="relative shrink-0">
                      @if (perfil.avatar_url) {
                        <img
                          [src]="perfil.avatar_url"
                          [alt]="perfil.nome_exibicao || perfil.nome || 'Membro'"
                          [class]="modoCompacto() ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-2xs' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shadow-2xs'"
                          referrerpolicy="no-referrer"
                        />
                      } @else {
                        <div
                          [class]="modoCompacto() ? 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700 shadow-2xs' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center border border-slate-700 shadow-2xs'"
                        >
                          {{ getIniciais(perfil.nome_exibicao || perfil.nome) }}
                        </div>
                      }
                      @if (idx < 3) {
                        <span class="absolute -bottom-1 -right-1 text-[10px]">
                          {{ idx === 0 ? '👑' : (idx === 1 ? '🥈' : '🥉') }}
                        </span>
                      }
                    </div>

                    <!-- Nome e Título -->
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {{ perfil.nome_exibicao || perfil.nome || 'Membro da Comunidade' }}
                        </p>
                      </div>
                      <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span
                          class="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold border"
                          [class]="getNivelBadgeClass(perfil.nivel_atual)"
                        >
                          {{ perfil.nivel_atual || 'Membro Ativo' }}
                        </span>
                        @if (perfil.professional_title && !modoCompacto()) {
                          <span class="text-[11px] text-slate-500 truncate hidden sm:inline">
                            • {{ perfil.professional_title }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Pontuação -->
                  <div class="text-right shrink-0 pl-2.5 sm:pl-3">
                    <span
                      class="block font-black text-slate-900 font-mono"
                      [class]="modoCompacto() ? 'text-sm sm:text-base' : 'text-base sm:text-lg'"
                    >
                      {{ getPontosDoPeriodo(perfil) }}
                    </span>
                    <span class="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                      {{ modoCompacto() ? 'pts mês' : getLabelPeriodo() }}
                    </span>
                  </div>
                </div>
              }
            </div>

            @if (modoCompacto()) {
              <!-- Rodapé do Modo Compacto: Link para Hall da Fama Completo -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <span class="text-[11px] text-slate-500 text-center sm:text-left">
                  Premiações exclusivas para o fechamento mensal da comunidade.
                </span>
                <a
                  [routerLink]="['/comunidade/preview']"
                  [queryParams]="{ aba: 'hall-fama' }"
                  class="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold text-xs transition-colors shadow-xs cursor-pointer min-h-[38px]"
                >
                  <span>Ver Hall da Fama completo</span>
                  <span>→</span>
                </a>
              </div>
            }
          }
        </div>
      </div>

      <!-- ======================================================= -->
      <!-- 4. HISTÓRICO DE VENCEDORES (EDIÇÕES ANTERIORES)         -->
      <!-- ======================================================= -->
      @if (!modoCompacto()) {
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-200">
                📜
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900">
                  Galeria de Campeões Passados
                </h3>
                <p class="text-xs text-slate-500 font-medium">Vencedores históricos das edições mensais anteriores</p>
              </div>
            </div>

            <!-- Filtro de Ano do Histórico -->
            @if (anosHistorico().length > 0) {
              <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span>Ano:</span>
                <select
                  [value]="filtroAnoHistorico()"
                  (change)="onFiltroAnoHistoricoChange($event)"
                  class="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs cursor-pointer"
                >
                  @for (ano of anosHistorico(); track ano) {
                    <option [value]="ano">{{ ano }}</option>
                  }
                </select>
              </div>
            }
          </div>

          @if (carregandoHistorico()) {
            <div class="p-8 text-center space-y-2">
              <div class="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-500">Carregando galeria histórica...</p>
            </div>
          } @else if (historicoVencedores().length === 0) {
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
              <p class="text-xs sm:text-sm font-bold text-slate-700">
                Nenhuma edição anterior arquivada ainda
              </p>
              <p class="text-xs text-slate-500">
                Os vencedores do mês atual serão registrados automaticamente no encerramento desta rodada.
              </p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (v of historicoFiltrado(); track v.id) {
                <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border"
                      [class]="getMedalhaBadgeClass(v.posicao)"
                    >
                      {{ getMedalhaIcone(v.posicao) }}
                    </div>

                    <div class="min-w-0 space-y-0.5">
                      <p class="text-xs font-black text-slate-900 truncate">
                        {{ v.nome_exibicao || 'Membro Campeão' }}
                      </p>
                      <div class="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span class="font-bold text-amber-700">{{ getNomeMes(v.mes) }}/{{ v.ano }}</span>
                        @if (v.premio_titulo) {
                          <span class="truncate" [title]="v.premio_titulo">• {{ v.premio_titulo }}</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <span class="text-xs font-mono font-black text-slate-800">
                      {{ v.pontos_final || 0 }}
                    </span>
                    <span class="block text-[10px] text-slate-400">pontos</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- ======================================================= -->
      <!-- 5. GUIA DE PONTUAÇÃO (COMO SUBIR NO RANKING)            -->
      <!-- ======================================================= -->
      @if (!modoCompacto()) {
        <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div class="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base border border-indigo-100">
              ⚡
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900">
                Como Ganhar Pontos no Hall da Fama?
              </h3>
              <p class="text-xs text-slate-500 font-medium">Suas interações no ecossistema geram pontuação automática via triggers</p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (regra of regrasPontuacao; track regra.id) {
              <div class="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 hover:bg-slate-100/70 transition-colors flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-lg">{{ regra.icone }}</span>
                    @if (regra.emBreve) {
                      <span class="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-300/60">
                        Em breve
                      </span>
                    } @else {
                      <span class="text-xs font-black text-amber-600 font-mono">
                        {{ regra.pontosTexto }}
                      </span>
                    }
                  </div>
                  <p class="text-xs font-bold text-slate-800 line-clamp-1" [title]="regra.acao">
                    {{ regra.acao }}
                  </p>
                  <p class="text-[11px] text-slate-500 leading-tight line-clamp-2">
                    {{ regra.descricao }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class HallFamaComponent implements OnInit, OnDestroy {
  private readonly supabaseService = inject(SupabaseService);

  readonly modoCompacto = input<boolean>(false);
  readonly regrasPontuacao = REGRAS_PONTUACAO;

  readonly loading = signal<boolean>(true);
  readonly carregandoPremios = signal<boolean>(true);
  readonly carregandoHistorico = signal<boolean>(true);

  readonly perfis = signal<GamificacaoPerfil[]>([]);
  readonly premios = signal<PremioGamificacao[]>([]);
  readonly historicoVencedores = signal<HistoricoVencedor[]>([]);

  readonly abaAtiva = signal<'semana' | 'mes' | 'ano'>('mes');
  readonly filtroAnoHistorico = signal<number>(new Date().getFullYear());

  readonly mesAtual = new Date().getMonth() + 1;
  readonly anoAtual = new Date().getFullYear();

  private realtimeChannel: any = null;

  readonly meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' },
  ];

  readonly topSemana = computed(() => {
    const limit = this.modoCompacto() ? 3 : 8;
    return [...this.perfis()]
      .sort((a, b) => (Number(b.pontos_semana) || 0) - (Number(a.pontos_semana) || 0))
      .slice(0, limit);
  });

  readonly topMes = computed(() => {
    const limit = this.modoCompacto() ? 3 : 8;
    return [...this.perfis()]
      .sort((a, b) => (Number(b.pontos_mes) || 0) - (Number(a.pontos_mes) || 0))
      .slice(0, limit);
  });

  readonly topAno = computed(() => {
    const limit = this.modoCompacto() ? 3 : 8;
    return [...this.perfis()]
      .sort((a, b) => (Number(b.pontos_ano || b.pontos_total) || 0) - (Number(a.pontos_ano || a.pontos_total) || 0))
      .slice(0, limit);
  });

  readonly rankingAtual = computed(() => {
    if (this.modoCompacto()) {
      return this.topMes();
    }
    switch (this.abaAtiva()) {
      case 'semana':
        return this.topSemana();
      case 'ano':
        return this.topAno();
      case 'mes':
      default:
        return this.topMes();
    }
  });

  readonly premiosMesAtual = computed(() => {
    // Filtra prêmios do mês/ano atual ou os mais recentes ativos
    const doMes = this.premios().filter(
      (p) => p.ativo && p.mes === this.mesAtual && p.ano === this.anoAtual
    );
    if (doMes.length > 0) {
      return doMes.sort((a, b) => a.posicao - b.posicao);
    }
    // Fallback: todos os prêmios ativos ordenados
    return this.premios()
      .filter((p) => p.ativo)
      .sort((a, b) => a.posicao - b.posicao)
      .slice(0, 3);
  });

  readonly anosHistorico = computed(() => {
    const anos = [...new Set(this.historicoVencedores().map((h) => h.ano))];
    return anos.sort((a, b) => b - a);
  });

  readonly historicoFiltrado = computed(() => {
    return this.historicoVencedores().filter(
      (h) => h.ano === this.filtroAnoHistorico()
    );
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarRanking(),
      this.carregarPremios(),
      this.carregarHistorico()
    ]);
    this.iniciarRealtime();
  }

  ngOnDestroy(): void {
    if (this.realtimeChannel) {
      try {
        this.supabaseService.client.removeChannel(this.realtimeChannel);
      } catch (e) {
        console.warn('Erro ao remover canal realtime do Hall da Fama:', e);
      }
    }
  }

  private iniciarRealtime(): void {
    try {
      this.realtimeChannel = this.supabaseService.client
        .channel('hall-fama-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gamificacao_perfis' },
          () => {
            this.carregarRanking();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime não disponível no momento:', e);
    }
  }

  async carregarRanking(): Promise<void> {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabaseService.client
        .from('gamificacao_perfis')
        .select('*')
        .order('pontos_total', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        // Enriquecer com avatar_url e cargo da tabela profissionais caso disponível
        const userIds = data.map((d: any) => d.user_id || d.id).filter(Boolean);
        const profsMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profs } = await this.supabaseService.client
            .from('profissionais')
            .select('id, full_name, avatar_url, professional_title, nivel_atual')
            .in('id', userIds);
          (profs || []).forEach((p: any) => {
            profsMap[p.id] = p;
          });
        }
        const enriched = data.map((d: any) => {
          const p = profsMap[d.user_id || d.id];
          return {
            ...d,
            nome_exibicao: d.nome_exibicao || d.nome || p?.full_name || 'Membro da Comunidade',
            avatar_url: d.avatar_url || p?.avatar_url,
            professional_title: d.professional_title || p?.professional_title,
            nivel_atual: d.nivel_atual || p?.nivel_atual || 'Membro Ativo',
            pontos_semana: Number(d.pontos_semana) || 0,
            pontos_mes: Number(d.pontos_mes) || 0,
            pontos_ano: Number(d.pontos_ano ?? d.pontos_total) || 0,
            pontos_total: Number(d.pontos_total) || 0,
          };
        });
        this.perfis.set(enriched);
      } else {
        this.perfis.set([]);
      }
    } catch (e: any) {
      console.warn('Exceção ao buscar ranking de gamificação:', e?.message || e);
      this.perfis.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async carregarPremios(): Promise<void> {
    this.carregandoPremios.set(true);
    try {
      const data = await this.supabaseService.listarPremiosGamificacao(undefined, undefined, true);
      this.premios.set(data || []);
    } catch (e) {
      console.warn('Erro ao buscar prêmios de gamificação:', e);
      this.premios.set([]);
    } finally {
      this.carregandoPremios.set(false);
    }
  }

  async carregarHistorico(): Promise<void> {
    this.carregandoHistorico.set(true);
    try {
      const data = await this.supabaseService.listarHistoricoVencedores();
      this.historicoVencedores.set(data || []);
      if (data && data.length > 0) {
        const anos = [...new Set(data.map((d: any) => d.ano))].sort((a: any, b: any) => b - a);
        if (anos.length > 0) {
          this.filtroAnoHistorico.set(anos[0]);
        }
      }
    } catch (e) {
      console.warn('Erro ao buscar histórico de vencedores:', e);
      this.historicoVencedores.set([]);
    } finally {
      this.carregandoHistorico.set(false);
    }
  }

  onFiltroAnoHistoricoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroAnoHistorico.set(Number(target.value));
  }

  getPontosDoPeriodo(perfil: GamificacaoPerfil): number {
    switch (this.abaAtiva()) {
      case 'semana':
        return perfil.pontos_semana || 0;
      case 'ano':
        return perfil.pontos_ano || perfil.pontos_total || 0;
      case 'mes':
      default:
        return perfil.pontos_mes || 0;
    }
  }

  getLabelPeriodo(): string {
    switch (this.abaAtiva()) {
      case 'semana':
        return 'pts semana';
      case 'ano':
        return 'pts ano';
      case 'mes':
      default:
        return 'pts mês';
    }
  }

  getCardMembroRankingClass(idx: number): string {
    switch (idx) {
      case 0:
        return 'bg-amber-50/50 border-amber-200/90 shadow-xs';
      case 1:
        return 'bg-slate-50/90 border-slate-300/80 shadow-2xs';
      case 2:
        return 'bg-orange-50/40 border-orange-200/80 shadow-2xs';
      default:
        return 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/60';
    }
  }

  getCardPremioClass(posicao: number): string {
    switch (posicao) {
      case 1:
        return 'border-amber-300/90 bg-amber-50/30';
      case 2:
        return 'border-slate-300/90 bg-slate-50/40';
      case 3:
        return 'border-orange-300/80 bg-orange-50/20';
      default:
        return 'border-slate-200 bg-white';
    }
  }

  getMedalhaBadgeClass(posicao: number): string {
    switch (posicao) {
      case 1:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 2:
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 3:
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getPosicaoTagClass(posicao: number): string {
    switch (posicao) {
      case 1:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 2:
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 3:
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  getMedalhaIcone(posicao: number): string {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎖️';
    }
  }

  getPosicaoTexto(posicao: number): string {
    switch (posicao) {
      case 1:
        return '1º Lugar (Ouro)';
      case 2:
        return '2º Lugar (Prata)';
      case 3:
        return '3º Lugar (Bronze)';
      default:
        return `${posicao}º Lugar`;
    }
  }

  getNomeMes(mes: number): string {
    const encontrado = this.meses.find((m) => m.valor === mes);
    return encontrado ? encontrado.nome : `Mês ${mes}`;
  }

  getNomeMesAtual(): string {
    return this.getNomeMes(this.mesAtual);
  }

  getIniciais(nome?: string): string {
    if (!nome) return '?';
    return nome.trim().charAt(0).toUpperCase();
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
      case 'Membro Trainee':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}

