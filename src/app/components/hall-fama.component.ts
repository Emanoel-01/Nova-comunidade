import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

export interface GamificacaoPerfil {
  id?: string;
  nome_exibicao?: string;
  nome?: string;
  avatar_url?: string;
  nivel_atual?: string;
  pontos_total?: number;
  pontos_semana?: number;
  pontos_mes?: number;
  ficticio?: boolean;
}

@Component({
  selector: 'app-hall-fama',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <!-- Header do Card em gradiente âmbar -> laranja -->
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner border border-white/20">
            🏆
          </div>
          <div>
            <h3 class="text-xl sm:text-2xl font-bold tracking-tight text-white">Hall da Fama</h3>
            <p class="text-xs sm:text-sm text-amber-100 font-medium">Os membros mais ativos do ecossistema</p>
          </div>
        </div>

        <!-- Abas de Período -->
        <div class="flex items-center bg-black/15 p-1 rounded-xl backdrop-blur-sm border border-white/10 self-stretch sm:self-auto">
          <button
            type="button"
            (click)="abaAtiva.set('semana')"
            [class]="abaAtiva() === 'semana'
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-orange-600 shadow-sm transition-all cursor-pointer'
              : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer'"
          >
            Esta Semana
          </button>
          <button
            type="button"
            (click)="abaAtiva.set('mes')"
            [class]="abaAtiva() === 'mes'
              ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-orange-600 shadow-sm transition-all cursor-pointer'
              : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer'"
          >
            Este Mês
          </button>
        </div>
      </div>

      <!-- Conteúdo do Ranking -->
      <div class="p-3.5 sm:p-6">
        @if (loading()) {
          <!-- Estado de Carregamento (3 blocos pulse) -->
          <div class="space-y-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="animate-pulse flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-3.5">
                  <div class="w-7 h-7 bg-slate-200 rounded-full"></div>
                  <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div class="space-y-1.5">
                    <div class="h-3.5 bg-slate-200 rounded w-32"></div>
                    <div class="h-2.5 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
                <div class="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            }
          </div>
        } @else if (atual().length === 0) {
          <!-- Estado Vazio -->
          <div class="text-center py-12 px-4 space-y-2">
            <div class="text-4xl mb-2">⭐</div>
            <p class="text-slate-800 font-bold text-base">Ainda sem membros no ranking.</p>
            <p class="text-slate-500 text-sm">Comece a interagir para aparecer aqui!</p>
          </div>
        } @else {
          <!-- Lista dos Top 5 -->
          <div class="space-y-3">
            @for (perfil of atual(); track perfil.id || $index; let idx = $index) {
              <div
                class="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all border"
                [class]="idx === 0 
                  ? 'bg-amber-50/40 border-amber-200/70 shadow-sm' 
                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'"
              >
                <!-- Posição + Avatar + Nome + Nível -->
                <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                  <!-- Posição -->
                  <div class="w-6 sm:w-7 text-center font-bold text-sm sm:text-base shrink-0">
                    @if (idx === 0) { 🥇 }
                    @else if (idx === 1) { 🥈 }
                    @else if (idx === 2) { 🥉 }
                    @else { <span class="text-slate-500 font-mono text-xs sm:text-sm">{{ idx + 1 }}°</span> }
                  </div>

                  <!-- Avatar -->
                  <div class="relative shrink-0">
                    @if (perfil.avatar_url) {
                      <img
                        [src]="perfil.avatar_url"
                        [alt]="perfil.nome_exibicao || perfil.nome || 'Membro'"
                        class="w-10 h-10 rounded-full object-cover border border-slate-200"
                        referrerpolicy="no-referrer"
                      />
                    } @else {
                      <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200">
                        {{ getIniciais(perfil.nome_exibicao || perfil.nome) }}
                      </div>
                    }
                  </div>

                  <!-- Nome e Nível -->
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">
                      {{ perfil.nome_exibicao || perfil.nome || 'Membro da Comunidade' }}
                    </p>
                    <span
                      class="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border mt-0.5"
                      [class]="getNivelBadgeClass(perfil.nivel_atual)"
                    >
                      {{ perfil.nivel_atual || 'Membro Trainee' }}
                    </span>
                  </div>
                </div>

                <!-- Pontuação -->
                <div class="text-right shrink-0 pl-3">
                  <span class="block text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                    {{ abaAtiva() === 'semana' ? (perfil.pontos_semana || 0) : (perfil.pontos_mes || 0) }}
                  </span>
                  <span class="text-[11px] text-slate-500 font-medium">
                    {{ abaAtiva() === 'semana' ? 'pts semana' : 'pts mês' }}
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HallFamaComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);

  readonly loading = signal<boolean>(true);
  readonly perfis = signal<GamificacaoPerfil[]>([]);
  readonly abaAtiva = signal<'semana' | 'mes'>('semana');

  readonly top5Semana = computed(() => {
    return [...this.perfis()]
      .sort((a, b) => (Number(b.pontos_semana) || 0) - (Number(a.pontos_semana) || 0))
      .slice(0, 5);
  });

  readonly top5Mes = computed(() => {
    return [...this.perfis()]
      .sort((a, b) => (Number(b.pontos_mes) || 0) - (Number(a.pontos_mes) || 0))
      .slice(0, 5);
  });

  readonly atual = computed(() => {
    return this.abaAtiva() === 'semana' ? this.top5Semana() : this.top5Mes();
  });

  async ngOnInit(): Promise<void> {
    await this.carregarRanking();
  }

  async carregarRanking(): Promise<void> {
    this.loading.set(true);
    try {
      const { data, error } = await this.supabaseService.client
        .from('gamificacao_perfis')
        .select('*')
        .order('pontos_total', { ascending: false })
        .limit(20);

      if (error) {
        console.warn('Aviso ao carregar ranking do Hall da Fama no Supabase:', error.message || error);
        this.perfis.set([]);
      } else {
        this.perfis.set(data || []);
      }
    } catch (e: any) {
      console.warn('Exceção ao buscar ranking de gamificação:', e?.message || e);
      this.perfis.set([]);
    } finally {
      this.loading.set(false);
    }
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
