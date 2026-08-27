import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SKILLS_CATALOGO, SkillCatalogo } from './skills-catalogo.data';

type AmbienteInstalacao = 'claude-code' | 'claude-cowork' | 'claude-chat';

@Component({
  selector: 'app-skills-catalogo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- 1. Cabeçalho do Catálogo de Skills Claude -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/30 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <svg class="w-3.5 h-3.5 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Pacotes de Instruções & Automação</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Skills Claude</span>
            </h2>

            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pacotes de instruções prontos para automatizar fluxos de trabalho no seu Claude Code, Claude Cowork ou chat.
            </p>
          </div>

          <!-- Totalizador de Skills -->
          <div class="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs shrink-0 self-start md:self-auto flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-black text-lg shadow-inner">
              {{ skills().length }}
            </div>
            <div>
              <div class="text-xs font-bold text-white uppercase tracking-wider">Skills no Catálogo</div>
              <div class="text-[11px] text-indigo-200">
                Instalação direta no seu Claude
              </div>
            </div>
          </div>
        </div>

        <!-- Badge Informativo Permanente -->
        <div class="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center gap-2.5 text-xs text-amber-200/90 font-medium">
          <div class="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
            ℹ️
          </div>
          <p>
            <strong class="text-amber-200 font-bold">Aviso:</strong> Skills não rodam neste site — você baixa e instala no seu próprio ambiente Claude.
          </p>
        </div>
      </div>

      <!-- 2. Filtro por Categoria (Pills dinâmicas) -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          (click)="selecionarCategoria('todas')"
          class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 border"
          [class.bg-[#132A41]]="categoriaSelecionada() === 'todas'"
          [class.text-white]="categoriaSelecionada() === 'todas'"
          [class.border-[#132A41]]="categoriaSelecionada() === 'todas'"
          [class.font-black]="categoriaSelecionada() === 'todas'"
          [class.shadow-xs]="categoriaSelecionada() === 'todas'"
          [class.bg-white]="categoriaSelecionada() !== 'todas'"
          [class.text-slate-700]="categoriaSelecionada() !== 'todas'"
          [class.border-slate-200]="categoriaSelecionada() !== 'todas'"
          [class.hover:bg-slate-50]="categoriaSelecionada() !== 'todas'"
        >
          <span>Todas as Categorias</span>
          <span
            class="px-1.5 py-0.5 rounded-full text-[11px]"
            [class.bg-white/20]="categoriaSelecionada() === 'todas'"
            [class.text-white]="categoriaSelecionada() === 'todas'"
            [class.bg-slate-100]="categoriaSelecionada() !== 'todas'"
            [class.text-slate-600]="categoriaSelecionada() !== 'todas'"
          >
            {{ skills().length }}
          </span>
        </button>

        @for (cat of categorias(); track cat) {
          <button
            type="button"
            (click)="selecionarCategoria(cat)"
            class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 border"
            [class.bg-[#132A41]]="categoriaSelecionada() === cat"
            [class.text-white]="categoriaSelecionada() === cat"
            [class.border-[#132A41]]="categoriaSelecionada() === cat"
            [class.font-black]="categoriaSelecionada() === cat"
            [class.shadow-xs]="categoriaSelecionada() === cat"
            [class.bg-white]="categoriaSelecionada() !== cat"
            [class.text-slate-700]="categoriaSelecionada() !== cat"
            [class.border-slate-200]="categoriaSelecionada() !== cat"
            [class.hover:bg-slate-50]="categoriaSelecionada() !== cat"
          >
            <span>{{ cat }}</span>
            <span
              class="px-1.5 py-0.5 rounded-full text-[11px]"
              [class.bg-white/20]="categoriaSelecionada() === cat"
              [class.text-white]="categoriaSelecionada() === cat"
              [class.bg-slate-100]="categoriaSelecionada() !== cat"
              [class.text-slate-600]="categoriaSelecionada() !== cat"
            >
              {{ contarPorCategoria(cat) }}
            </span>
          </button>
        }
      </div>

      <!-- 3. Lista de Cards de Skills -->
      <div class="space-y-4">
        @for (skill of skillsFiltradas(); track skill.id) {
          <div
            class="bg-white rounded-3xl border transition-all duration-200 shadow-2xs overflow-hidden"
            [class.border-indigo-300]="skillExpandida() === skill.id"
            [class.border-slate-200]="skillExpandida() !== skill.id"
            [class.shadow-md]="skillExpandida() === skill.id"
          >
            <!-- Topo / Cabeçalho do Card (Clicável para expandir) -->
            <div
              (click)="toggleExpandir(skill.id)"
              class="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors"
            >
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div class="space-y-2 flex-1">
                  <!-- Categoria e ID -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{ skill.categoria }}
                    </span>
                    <span class="text-xs font-mono font-bold text-slate-400">#{{ skill.id }}</span>
                  </div>

                  <!-- Título da Skill -->
                  <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {{ skill.nome }}
                  </h3>

                  <!-- Resumo -->
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {{ skill.descricaoResumo }}
                  </p>
                </div>

                <!-- Lado Direito: Badges de Compatibilidade & Botão de Expansão -->
                <div class="flex flex-wrap md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                  <!-- Badges de Compatibilidade -->
                  <div class="flex flex-wrap gap-1.5">
                    @for (comp of skill.compativelCom; track comp) {
                      <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {{ formatarNomeAmbiente(comp) }}
                      </span>
                    }
                  </div>

                  <!-- Indicador de Detalhes -->
                  <div class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                    <span>{{ skillExpandida() === skill.id ? 'Recolher Detalhes' : 'Ver Guia & Download' }}</span>
                    <svg
                      class="w-4 h-4 transition-transform duration-200"
                      [class.rotate-180]="skillExpandida() === skill.id"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            <!-- Conteúdo Expandido -->
            @if (skillExpandida() === skill.id) {
              <div class="px-5 pb-6 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-6">
                
                <!-- 1. Descrição Completa -->
                <div class="space-y-2">
                  <div class="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>O que este pacote de instruções cobre</span>
                  </div>
                  <div class="p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs">
                    {{ skill.descricaoCompleta }}
                  </div>
                </div>

                <!-- 2. Botão de Download / Link -->
                <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-800/30">
                  <div class="space-y-1">
                    <div class="text-xs font-bold text-white flex items-center gap-2">
                      <svg class="w-4 h-4 text-[#E59866]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Arquivo do Pacote da Skill (.zip / pasta)</span>
                    </div>
                    <p class="text-[11px] text-slate-300">
                      Baixe o pacote de instruções e instale no ambiente Claude desejado conforme o passo a passo abaixo.
                    </p>
                  </div>

                  <div>
                    @if (isLinkPendente(skill.linkDownload)) {
                      <div class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 cursor-not-allowed">
                        <svg class="w-4 h-4 text-amber-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Link em preparação</span>
                      </div>
                    } @else {
                      <a
                        [href]="skill.linkDownload"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#a05522] text-white text-xs font-black transition-all shadow-md cursor-pointer"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Baixar Skill</span>
                      </a>
                    }
                  </div>
                </div>

                <!-- 3. Guia de Instalação Passo a Passo (3 Ambientes) -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-[#B5642A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Guia de Instalação por Ambiente</span>
                    </div>
                  </div>

                  <!-- Seletor de Abas de Ambiente -->
                  <div class="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl w-full sm:w-auto overflow-x-auto">
                    <button
                      type="button"
                      (click)="selecionarAmbiente(skill.id, 'claude-code')"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      [class.bg-white]="obterAmbienteAtivo(skill.id) === 'claude-code'"
                      [class.text-slate-900]="obterAmbienteAtivo(skill.id) === 'claude-code'"
                      [class.shadow-xs]="obterAmbienteAtivo(skill.id) === 'claude-code'"
                      [class.text-slate-600]="obterAmbienteAtivo(skill.id) !== 'claude-code'"
                      [class.hover:text-slate-900]="obterAmbienteAtivo(skill.id) !== 'claude-code'"
                    >
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Claude Code</span>
                    </button>

                    <button
                      type="button"
                      (click)="selecionarAmbiente(skill.id, 'claude-cowork')"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      [class.bg-white]="obterAmbienteAtivo(skill.id) === 'claude-cowork'"
                      [class.text-slate-900]="obterAmbienteAtivo(skill.id) === 'claude-cowork'"
                      [class.shadow-xs]="obterAmbienteAtivo(skill.id) === 'claude-cowork'"
                      [class.text-slate-600]="obterAmbienteAtivo(skill.id) !== 'claude-cowork'"
                      [class.hover:text-slate-900]="obterAmbienteAtivo(skill.id) !== 'claude-cowork'"
                    >
                      <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>Claude Cowork</span>
                    </button>

                    <button
                      type="button"
                      (click)="selecionarAmbiente(skill.id, 'claude-chat')"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
                      [class.bg-white]="obterAmbienteAtivo(skill.id) === 'claude-chat'"
                      [class.text-slate-900]="obterAmbienteAtivo(skill.id) === 'claude-chat'"
                      [class.shadow-xs]="obterAmbienteAtivo(skill.id) === 'claude-chat'"
                      [class.text-slate-600]="obterAmbienteAtivo(skill.id) !== 'claude-chat'"
                      [class.hover:text-slate-900]="obterAmbienteAtivo(skill.id) !== 'claude-chat'"
                    >
                      <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>Claude (chat / claude.ai)</span>
                    </button>
                  </div>

                  <!-- Conteúdo do Passo a Passo Conforme o Ambiente Selecionado -->
                  <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    @switch (obterAmbienteAtivo(skill.id)) {
                      
                      @case ('claude-code') {
                        <div class="space-y-3">
                          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span>Instalação no Claude Code (Terminal / CLI)</span>
                            </h4>
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              CLI & Repositórios
                            </span>
                          </div>

                          <ol class="space-y-2.5 text-xs text-slate-700 leading-relaxed list-decimal list-inside marker:font-bold marker:text-indigo-600">
                            <li>Baixe o arquivo da skill pelo botão acima (chega como pasta ou <code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">.zip</code>).</li>
                            <li>Se vier em <code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">.zip</code>, descompacte o arquivo.</li>
                            <li>
                              Coloque a pasta dentro de: <code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">~/.claude/skills/</code> (crie a pasta se não existir)
                              <div class="mt-1.5 ml-4 p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
                                <div><span class="text-slate-400"># Windows:</span> C:\\Users\\SeuUsuario\\.claude\\skills\\</div>
                                <div><span class="text-slate-400"># Mac / Linux:</span> /Users/SeuUsuario/.claude/skills/</div>
                              </div>
                            </li>
                            <li>Abra ou reinicie o <strong>Claude Code</strong> no seu projeto.</li>
                            <li>
                              A skill fica disponível automaticamente — para ativar, basta solicitar no prompt algo relacionado ao fluxo (ex: <em class="text-indigo-600 font-medium">"monta um orçamento de obra"</em> já aciona a skill).
                            </li>
                          </ol>
                        </div>
                      }

                      @case ('claude-cowork') {
                        <div class="space-y-3">
                          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span>Instalação no Claude Cowork (Espaço de Trabalho)</span>
                            </h4>
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              Equipes & Coworking
                            </span>
                          </div>

                          <ol class="space-y-2.5 text-xs text-slate-700 leading-relaxed list-decimal list-inside marker:font-bold marker:text-indigo-600">
                            <li>Baixe o arquivo da skill pelo botão de download acima.</li>
                            <li>Abra o <strong>Claude Cowork</strong> no seu navegador ou aplicativo.</li>
                            <li>Nas configurações do espaço de trabalho, procure a opção de <strong>adicionar Skills</strong>.</li>
                            <li>Faça o envio (upload) da pasta ou arquivo baixado.</li>
                            <li>A skill fica disponível para qualquer tarefa e membro dentro daquele espaço de trabalho.</li>
                          </ol>
                        </div>
                      }

                      @case ('claude-chat') {
                        <div class="space-y-3">
                          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 class="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span>Instalação no Claude (Projetos do claude.ai)</span>
                            </h4>
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                              Projetos claude.ai
                            </span>
                          </div>

                          <ol class="space-y-2.5 text-xs text-slate-700 leading-relaxed list-decimal list-inside marker:font-bold marker:text-indigo-600">
                            <li>Baixe o arquivo da skill pelo botão de download acima.</li>
                            <li>No <strong>claude.ai</strong>, crie um novo Projeto ou abra um Projeto existente.</li>
                            <li>Vá em <strong>"Configurações do Projeto"</strong> (ícone de engrenagem) → seção de <strong>Skills</strong>.</li>
                            <li>Faça o upload da pasta/arquivo da skill.</li>
                            <li>Em conversas dentro desse Projeto, a skill é acionada automaticamente sempre que relevante ao que você pedir.</li>
                          </ol>
                        </div>
                      }

                    }
                  </div>
                </div>

              </div>
            }

          </div>
        }
      </div>

    </div>
  `
})
export class SkillsCatalogoComponent {
  readonly skills = signal<SkillCatalogo[]>(SKILLS_CATALOGO);
  readonly categoriaSelecionada = signal<string>('todas');
  readonly skillExpandida = signal<string | null>(null);
  
  // Mapa de ambiente ativo por skill id
  readonly ambientesAtivos = signal<Record<string, AmbienteInstalacao>>({});

  // Categorias únicas geradas dinamicamente do array de dados
  readonly categorias = computed(() => {
    const set = new Set<string>();
    for (const s of this.skills()) {
      if (s.categoria) set.add(s.categoria);
    }
    return Array.from(set);
  });

  // Lista filtrada
  readonly skillsFiltradas = computed(() => {
    const cat = this.categoriaSelecionada();
    const lista = this.skills();
    if (cat === 'todas') return lista;
    return lista.filter(s => s.categoria.toLowerCase() === cat.toLowerCase());
  });

  selecionarCategoria(cat: string): void {
    this.categoriaSelecionada.set(cat);
  }

  contarPorCategoria(cat: string): number {
    return this.skills().filter(s => s.categoria.toLowerCase() === cat.toLowerCase()).length;
  }

  toggleExpandir(id: string): void {
    if (this.skillExpandida() === id) {
      this.skillExpandida.set(null);
    } else {
      this.skillExpandida.set(id);
      // Se não tem ambiente selecionado para essa skill, define 'claude-code' como padrão
      if (!this.ambientesAtivos()[id]) {
        this.ambientesAtivos.update(prev => ({ ...prev, [id]: 'claude-code' }));
      }
    }
  }

  selecionarAmbiente(skillId: string, ambiente: AmbienteInstalacao): void {
    this.ambientesAtivos.update(prev => ({ ...prev, [skillId]: ambiente }));
  }

  obterAmbienteAtivo(skillId: string): AmbienteInstalacao {
    return this.ambientesAtivos()[skillId] || 'claude-code';
  }

  isLinkPendente(link: string): boolean {
    return !link || link.startsWith('LINK_DRIVE_PENDENTE');
  }

  formatarNomeAmbiente(tipo: 'claude-code' | 'claude-cowork' | 'claude-chat'): string {
    switch (tipo) {
      case 'claude-code':
        return 'Claude Code';
      case 'claude-cowork':
        return 'Claude Cowork';
      case 'claude-chat':
        return 'Claude (chat)';
    }
  }
}
