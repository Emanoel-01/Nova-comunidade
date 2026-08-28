import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { gerarLinkWhatsapp } from '../../utils/whatsapp.util';

export interface AmbienteItem {
  id: string;
  nome: string;
  tamanho: 'P' | 'M' | 'G' | 'Personalizado';
  area: number;
  dimensoes: string;
}

export interface AreaExternaItem {
  id: string;
  tipo: string;
  area: number;
  custo_m2: number;
  custo_total: number;
}

export interface ItemAdicional {
  id: string;
  nome: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
}

export interface ParcelaDetalhada {
  mes: number;
  parcela: number;
  amortizacao: number;
  juros: number;
  saldo: number;
  fase: 'Obra' | 'Amortização';
}

const AMBIENTES_DISPONIVEIS = [
  { nome: 'Quarto', tamanhos: { P: { area: 9, dimensoes: '3x3m' }, M: { area: 12, dimensoes: '3x4m' }, G: { area: 16, dimensoes: '4x4m' } } },
  { nome: 'Banheiro', tamanhos: { P: { area: 4, dimensoes: '2x2m' }, M: { area: 6, dimensoes: '2x3m' }, G: { area: 8, dimensoes: '2.5x3.2m' } } },
  { nome: 'Cozinha', tamanhos: { P: { area: 8, dimensoes: '2.5x3.2m' }, M: { area: 12, dimensoes: '3x4m' }, G: { area: 16, dimensoes: '4x4m' } } },
  { nome: 'Sala de Estar', tamanhos: { P: { area: 12, dimensoes: '3x4m' }, M: { area: 20, dimensoes: '4x5m' }, G: { area: 30, dimensoes: '5x6m' } } },
  { nome: 'Sala de Jantar', tamanhos: { P: { area: 9, dimensoes: '3x3m' }, M: { area: 12, dimensoes: '3x4m' }, G: { area: 16, dimensoes: '4x4m' } } },
  { nome: 'Garagem', tamanhos: { P: { area: 12, dimensoes: '3x4m' }, M: { area: 20, dimensoes: '4x5m' }, G: { area: 30, dimensoes: '5x6m' } } },
  { nome: 'Área de Serviço', tamanhos: { P: { area: 4, dimensoes: '2x2m' }, M: { area: 6, dimensoes: '2x3m' }, G: { area: 9, dimensoes: '3x3m' } } },
  { nome: 'Varanda', tamanhos: { P: { area: 6, dimensoes: '2x3m' }, M: { area: 10, dimensoes: '2.5x4m' }, G: { area: 15, dimensoes: '3x5m' } } },
  { nome: 'Escritório', tamanhos: { P: { area: 8, dimensoes: '2.5x3.2m' }, M: { area: 12, dimensoes: '3x4m' }, G: { area: 16, dimensoes: '4x4m' } } },
];

const AREAS_EXTERNAS_TIPOS = [
  { tipo: 'Piscina', custo_m2: 800 },
  { tipo: 'Churrasqueira', custo_m2: 1200 },
  { tipo: 'Deck/Pergolado', custo_m2: 450 },
  { tipo: 'Jardim', custo_m2: 150 },
];

const DOCUMENTOS_BASE = [
  { id: 'rg_cpf', nome: 'RG e CPF', descricao: 'Documentos de identificação originais ou cópias autenticadas', obrigatorio: true },
  { id: 'comprovante_residencia', nome: 'Comprovante de Residência', descricao: 'Conta de luz, água ou telefone recente (últimos 3 meses)', obrigatorio: true },
  { id: 'certidao_casamento', nome: 'Certidão de Casamento/Nascimento', descricao: 'Para identificação de estado civil', obrigatorio: true },
  { id: 'escritura_terreno', nome: 'Escritura do Terreno', descricao: 'Documento que comprova a propriedade do terreno', obrigatorio: true },
  { id: 'matricula_imovel', nome: 'Matrícula do Imóvel', descricao: 'Certidão de matrícula atualizada do cartório de registro', obrigatorio: true },
  { id: 'iptu', nome: 'IPTU Quitado', descricao: 'Comprovante de pagamento do IPTU do ano corrente', obrigatorio: true },
];

const DOCUMENTOS_CLT = [
  { id: 'contracheque', nome: 'Contracheques', descricao: 'Últimos 3 meses de holerites', obrigatorio: true },
  { id: 'carteira_trabalho', nome: 'Carteira de Trabalho', descricao: 'Páginas de identificação e último contrato', obrigatorio: true },
  { id: 'declaracao_empregador', nome: 'Declaração do Empregador', descricao: 'Carta confirmando vínculo empregatício e salário', obrigatorio: false },
];

const DOCUMENTOS_AUTONOMO = [
  { id: 'declaracao_ir', nome: 'Declaração de Imposto de Renda', descricao: 'Últimos 2 anos completos', obrigatorio: true },
  { id: 'extrato_bancario', nome: 'Extratos Bancários', descricao: 'Últimos 6 meses de todas as contas', obrigatorio: true },
  { id: 'decore', nome: 'DECORE', descricao: 'Declaração de rendimentos elaborada por contador', obrigatorio: false },
];

const DOCUMENTOS_EMPRESARIO = [
  { id: 'contrato_social', nome: 'Contrato Social', descricao: 'E última alteração contratual da empresa', obrigatorio: true },
  { id: 'balanco_patrimonial', nome: 'Balanço Patrimonial', descricao: 'Dos últimos 2 anos', obrigatorio: true },
  { id: 'declaracao_ir_pj', nome: 'IR da Pessoa Jurídica', descricao: 'Declaração de imposto de renda da empresa', obrigatorio: true },
  { id: 'declaracao_ir_pf', nome: 'IR Pessoa Física', descricao: 'Sua declaração pessoal dos últimos 2 anos', obrigatorio: true },
];

export const ESTADOS_BRASIL = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

@Component({
  selector: 'app-viabiliza-ia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto pb-12">
      
      <!-- Cabeçalho Principal do Viabiliza IA -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div class="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-[#132A41]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#132A41] text-white">
                Assessoria de Crédito
              </span>
              <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Taxa Composta Real
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black text-[#132A41] tracking-tight flex items-center gap-2">
              Viabiliza IA
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">4.0</span>
            </h1>

            <p class="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Estruture sua pasta de crédito imobiliário de ponta a ponta: monte ambientes, dimensione custos com CUB/juros reais, analise linhas bancárias elegíveis e compare construir vs. alugar.
            </p>
          </div>

          <!-- Ação do Cabeçalho -->
          <div class="flex items-center gap-3 shrink-0">
            @if (projetoAtual()) {
              <button
                type="button"
                (click)="voltarParaListaProjetos()"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Meus Projetos</span>
              </button>

              <button
                type="button"
                (click)="salvarProjetoAtual()"
                [disabled]="salvando()"
                class="px-5 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#9E5522] text-white font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ salvando() ? 'Salvando...' : 'Salvar Alterações' }}</span>
              </button>
            } @else {
              <button
                type="button"
                (click)="abrirModalNovoProjeto()"
                class="px-5 py-3 rounded-2xl bg-[#132A41] hover:bg-slate-800 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Projeto de Crédito</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Alertas e Feedbacks -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div class="flex items-center gap-2">
            <span>✓</span>
            <span>{{ mensagemSucesso() }}</span>
          </div>
          <button type="button" (click)="mensagemSucesso.set(null)" class="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      }

      @if (mensagemErro()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div class="flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ mensagemErro() }}</span>
          </div>
          <button type="button" (click)="mensagemErro.set(null)" class="text-rose-600 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      }

      <!-- TELA 1: LISTAGEM DE MEUS PROJETOS (quando nenhum projeto selecionado) -->
      @if (!projetoAtual()) {
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>Projetos & Pastas de Crédito</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                {{ projetos().length }}
              </span>
            </h2>

            <div class="text-xs text-slate-500">
              Clique em um projeto para continuar seu planejamento
            </div>
          </div>

          @if (carregandoProjetos()) {
            <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-500 font-medium">Carregando seus projetos de crédito...</p>
            </div>
          } @else if (projetos().length === 0) {
            <div class="p-12 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg class="w-8 h-8 text-[#132A41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <div class="space-y-1">
                <h3 class="text-base font-bold text-slate-800">Nenhum projeto cadastrado ainda</h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto">
                  Inicie sua primeira pasta de crédito imobiliário para simular viabilidade bancária de terreno e construção.
                </p>
              </div>

              <button
                type="button"
                (click)="abrirModalNovoProjeto()"
                class="px-5 py-2.5 rounded-xl bg-[#132A41] text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>+ Criar Primeiro Projeto</span>
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (proj of projetos(); track proj.id) {
                <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#B5642A] hover:shadow-md transition-all flex flex-col justify-between group">
                  <div class="space-y-4">
                    <div class="flex items-start justify-between gap-2">
                      <div class="space-y-1">
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': proj.tipo_operacao === 'compra_construcao',
                            'bg-emerald-100 text-emerald-800': proj.tipo_operacao === 'construcao',
                            'bg-amber-100 text-amber-800': proj.tipo_operacao === 'compra_terreno'
                          }"
                        >
                          {{ getTipoOperacaoLabel(proj.tipo_operacao) }}
                        </span>
                        <h3 class="text-base font-bold text-[#132A41] group-hover:text-[#B5642A] transition-colors line-clamp-1">
                          {{ proj.nome_projeto }}
                        </h3>
                        @if (proj.nome_cliente) {
                          <div class="text-xs text-slate-600 font-semibold flex items-center gap-1">
                            <span class="text-slate-400">Cliente:</span>
                            <span class="line-clamp-1">{{ proj.nome_cliente }}</span>
                          </div>
                        }
                        @if (proj.uf || proj.cidade) {
                          <div class="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>📍</span>
                            <span>{{ proj.cidade ? proj.cidade + ' - ' : '' }}{{ proj.uf || 'UF' }}</span>
                          </div>
                        }
                      </div>

                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {{ proj.status || 'Rascunho' }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Custo Total</div>
                        <div class="font-black text-slate-800">
                          {{ (proj.custo_total_estimado || 0) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase">Financiável</div>
                        <div class="font-black text-indigo-700">
                          {{ (proj.valor_financiavel || 0) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                      </div>
                    </div>

                    @if (proj.parcela_estimada) {
                      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <span class="text-slate-500 font-medium">Parcela Estimada:</span>
                        <span class="font-black text-[#B5642A]">
                          {{ proj.parcela_estimada | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}/mês
                        </span>
                      </div>
                    }
                  </div>

                  <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      (click)="excluirProjeto(proj.id, $event)"
                      class="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1 cursor-pointer transition-colors"
                      title="Excluir Projeto"
                    >
                      Excluir
                    </button>

                    <button
                      type="button"
                      (click)="abrirProjeto(proj)"
                      class="px-3.5 py-1.5 rounded-xl bg-[#132A41] hover:bg-[#B5642A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Abrir Projeto</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TELA 2: FLUXO GUIADO EM ABAS DO PROJETO SELECIONADO -->
      @if (projetoAtual()) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Sub-header do Projeto Ativo -->
          <div class="bg-[#132A41] text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span class="text-amber-400 font-bold uppercase">{{ getTipoOperacaoLabel(tipoOperacao()) }}</span>
                @if (nomeCliente()) {
                  <span>•</span>
                  <span>Cliente: <strong class="text-white">{{ nomeCliente() }}</strong></span>
                }
                @if (uf() || cidade()) {
                  <span>•</span>
                  <span>📍 <strong class="text-white">{{ cidade() ? cidade() + ' - ' : '' }}{{ uf() }}</strong></span>
                }
                <span>•</span>
                <span>Área Total: <strong class="text-white">{{ areaTotal() }} m²</strong></span>
                @if (areaExternaTotal() > 0) {
                  <span>+ Ext: <strong class="text-white">{{ areaExternaTotal() }} m²</strong></span>
                }
              </div>
              <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white">
                {{ nomeProjeto() }}
              </h2>
            </div>

            <div class="flex items-center gap-4 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <div class="text-[10px] uppercase text-slate-400 font-bold">Custo Estimado</div>
                <div class="font-black text-amber-400 text-sm">
                  {{ resultado()?.custoTotal | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                </div>
              </div>
              <div class="h-6 w-px bg-slate-700"></div>
              <div>
                <div class="text-[10px] uppercase text-slate-400 font-bold">Parcela ({{ sistemaAmortizacao().toUpperCase() }})</div>
                <div class="font-black text-emerald-400 text-sm">
                  {{ resultado()?.parcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Barra de Navegação das 7 Etapas / Abas -->
          <div class="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              (click)="selecionarEtapa(1)"
              [class]="etapaAtiva() === 1 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">1</span>
              <span>Montar Projeto</span>
            </button>

            <button
              type="button"
              (click)="selecionarEtapa(2)"
              [class]="etapaAtiva() === 2 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Quanto Custa</span>
            </button>

            <button
              type="button"
              (click)="selecionarEtapa(3)"
              [class]="etapaAtiva() === 3 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Documentação</span>
            </button>

            <button
              type="button"
              (click)="selecionarEtapa(4)"
              [class]="etapaAtiva() === 4 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">4</span>
              <span>Comparação Bancária</span>
            </button>

            <button
              type="button"
              (click)="selecionarEtapa(5)"
              [class]="etapaAtiva() === 5 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">5</span>
              <span>Simulação Avançada</span>
            </button>

            @if (tipoOperacao() !== 'compra_terreno') {
              <button
                type="button"
                (click)="selecionarEtapa(6)"
                [class]="etapaAtiva() === 6 ? 'bg-[#132A41] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
                class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">6</span>
                <span>Construir vs Alugar</span>
              </button>
            }

            <button
              type="button"
              (click)="selecionarEtapa(7)"
              [class]="etapaAtiva() === 7 ? 'bg-[#B5642A] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 font-medium'"
              class="px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ml-auto"
            >
              <span class="w-5 h-5 rounded-full bg-white/20 text-[11px] flex items-center justify-center font-bold">7</span>
              <span>Agendamento & Pasta</span>
            </button>
          </div>

          <!-- CONTEÚDO DAS ETAPAS -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            
            <!-- ETAPA 1: MONTAR PROJETO -->
            @if (etapaAtiva() === 1) {
              <div class="space-y-8">
                <!-- Informações e Localização do Projeto -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Dados Gerais & Localização
                    </div>
                    <span class="text-xs text-slate-400 font-medium">Informações cadastrais da pasta</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">Nome do Projeto</label>
                      <input
                        type="text"
                        [value]="nomeProjeto()"
                        (input)="nomeProjeto.set($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-800"
                        placeholder="Ex: Casa Alphaville"
                      />
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">Nome do Cliente</label>
                      <input
                        type="text"
                        [value]="nomeCliente()"
                        (input)="nomeCliente.set($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                        placeholder="Ex: Dr. Roberto Silva"
                      />
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">Estado (UF / CUB)</label>
                      <select
                        [value]="uf()"
                        (change)="onUfChange($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-[#132A41]"
                      >
                        @for (est of estadosBrasil; track est.uf) {
                          <option [value]="est.uf">{{ est.uf }} - {{ est.nome }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">Cidade</label>
                      <input
                        type="text"
                        [value]="cidade()"
                        (input)="cidade.set($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                        placeholder="Ex: Ribeirão Preto"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">Endereço / Condomínio / Lote</label>
                    <input
                      type="text"
                      [value]="endereco()"
                      (input)="endereco.set($any($event.target).value)"
                      class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                      placeholder="Ex: Condomínio Quinta da Primavera, Quadra B, Lote 14"
                    />
                  </div>
                </div>

                @if (tipoOperacao() === 'compra_terreno') {
                  <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-center max-w-xl mx-auto">
                    <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                      🏞️
                    </div>
                    <h3 class="text-base font-bold text-amber-900">Operação de Compra de Terreno</h3>
                    <p class="text-xs text-amber-800 leading-relaxed">
                      Para aquisição exclusiva de lote/terreno, a etapa de montagem de ambientes da edificação não é necessária. Você pode avançar diretamente para o dimensionamento financeiro.
                    </p>
                    <button
                      type="button"
                      (click)="selecionarEtapa(2)"
                      class="px-5 py-2.5 rounded-xl bg-[#132A41] text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Avançar para Quanto Custa →
                    </button>
                  </div>
                } @else {
                  <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 class="text-lg font-black text-slate-800">1. Ambientes Internos & Pavimentos</h3>
                        <p class="text-xs text-slate-500">Defina os cômodos e seus padrões de tamanho ou dimensões personalizadas</p>
                      </div>

                      <div class="flex items-center gap-3">
                        <label class="text-xs font-bold text-slate-700">Pavimentos:</label>
                        <select
                          [value]="pavimentos()"
                          (change)="pavimentos.set(+$any($event.target).value); recalcular()"
                          class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                        >
                          <option [value]="1">1 Pavimento (Térreo)</option>
                          <option [value]="2">2 Pavimentos (Sobrado)</option>
                          <option [value]="3">3 Pavimentos</option>
                        </select>
                      </div>
                    </div>

                    <!-- Formulário de Adicionar Ambiente -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        + Adicionar Ambiente
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Ambiente</label>
                          <select
                            [value]="novoAmbienteNome"
                            (change)="novoAmbienteNome = $any($event.target).value; onAmbienteSelecionadoChange()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          >
                            @for (amb of ambientesDisponiveis; track amb.nome) {
                              <option [value]="amb.nome">{{ amb.nome }}</option>
                            }
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Tamanho</label>
                          <select
                            [value]="novoAmbienteTamanho"
                            (change)="novoAmbienteTamanho = $any($event.target).value; onAmbienteTamanhoChange()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          >
                            <option value="P">P (Pequeno)</option>
                            <option value="M">M (Médio)</option>
                            <option value="G">G (Grande)</option>
                            <option value="Personalizado">Personalizado</option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Área (m²)</label>
                          <input
                            type="number"
                            [value]="novoAmbienteArea"
                            (input)="novoAmbienteArea = +$any($event.target).value"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                            min="1"
                          />
                        </div>

                        <div class="flex items-end">
                          <button
                            type="button"
                            (click)="adicionarAmbiente()"
                            class="w-full py-2 px-4 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Lista de Ambientes Adicionados -->
                    <div class="space-y-3">
                      <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Ambientes Cadastrados ({{ ambientes().length }})</span>
                        <span class="text-indigo-600">Área Construída: {{ areaTotal() }} m²</span>
                      </div>

                      @if (ambientes().length === 0) {
                        <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          Nenhum ambiente adicionado ainda. Escolha acima e clique em Adicionar.
                        </div>
                      } @else {
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          @for (amb of ambientes(); track amb.id; let idx = $index) {
                            <div class="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                              <div>
                                <div class="text-xs font-bold text-slate-800">{{ amb.nome }}</div>
                                <div class="text-[11px] text-slate-500">
                                  Tamanho {{ amb.tamanho }} • <strong>{{ amb.area }} m²</strong> ({{ amb.dimensoes }})
                                </div>
                              </div>
                              <button
                                type="button"
                                (click)="removerAmbiente(amb.id)"
                                class="text-rose-500 hover:text-rose-700 text-xs p-1 cursor-pointer"
                                title="Remover"
                              >
                                ✕
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Áreas Externas -->
                    <div class="pt-6 border-t border-slate-100 space-y-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <h4 class="text-sm font-black text-slate-800">Áreas Externas & Lazer</h4>
                          <p class="text-xs text-slate-500">Piscina, churrasqueira, deck e paisagismo com custos de referência por m²</p>
                        </div>
                        <span class="text-xs font-bold text-amber-800">
                          Total Ext: {{ calcularCustoAreasExternas() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Tipo</label>
                          <select
                            [value]="novaAreaTipo"
                            (change)="novaAreaTipo = $any($event.target).value"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          >
                            @for (item of areasExternasTipos; track item.tipo) {
                              <option [value]="item.tipo">{{ item.tipo }} (R$ {{ item.custo_m2 }}/m²)</option>
                            }
                          </select>
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Área (m²)</label>
                          <input
                            type="number"
                            [value]="novaAreaMetragem"
                            (input)="novaAreaMetragem = +$any($event.target).value"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                            min="1"
                          />
                        </div>

                        <div class="flex items-end sm:col-span-2">
                          <button
                            type="button"
                            (click)="adicionarAreaExterna()"
                            class="w-full py-2 px-4 rounded-xl bg-[#B5642A] hover:bg-[#9E5522] text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            + Adicionar Área Externa
                          </button>
                        </div>
                      </div>

                      @if (areasExternas().length > 0) {
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          @for (ext of areasExternas(); track ext.id) {
                            <div class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                              <div>
                                <span class="font-bold text-slate-800">{{ ext.tipo }}</span>
                                <span class="text-slate-500"> — {{ ext.area }} m² × R$ {{ ext.custo_m2 }}/m²</span>
                                <div class="font-black text-[#B5642A]">
                                  {{ ext.custo_total | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                </div>
                              </div>
                              <button type="button" (click)="removerAreaExterna(ext.id)" class="text-rose-500 hover:text-rose-700 cursor-pointer p-1">
                                ✕
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Navegação da Etapa -->
                    <div class="pt-6 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        (click)="selecionarEtapa(2)"
                        class="px-6 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                      >
                        <span>Avançar: Quanto Custa</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- ETAPA 2: QUANTO CUSTA -->
            @if (etapaAtiva() === 2) {
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-black text-slate-800">2. Estruturação Financeira da Operação</h3>
                  <p class="text-xs text-slate-500">Valores de terreno, custo de obra, adicionais e parâmetros de financiamento bancário</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <!-- Coluna Esquerda: Formulário de Entradas -->
                  <div class="lg:col-span-7 space-y-6">
                    
                    <!-- Bloco de Custos Base -->
                    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Composição de Custos Diretos
                      </div>

                      @if (tipoOperacao() === 'compra_terreno' || tipoOperacao() === 'compra_construcao') {
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Valor do Terreno / Lote (R$)</label>
                          <input
                            type="number"
                            [value]="valorTerreno()"
                            (input)="valorTerreno.set(+$any($event.target).value); recalcular()"
                            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-800"
                            placeholder="0.00"
                          />
                        </div>
                      }

                      @if (tipoOperacao() === 'construcao' || tipoOperacao() === 'compra_construcao') {
                        <div class="space-y-2">
                          <div class="flex items-center justify-between">
                            <label class="text-xs font-bold text-slate-700">Custo Base da Obra (R$)</label>
                            <button
                              type="button"
                              (click)="aplicarEstimativaCUB()"
                              class="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              title="Recalcular com base na área total e CUB oficial do estado"
                            >
                              <span>Sugerir pelo CUB/{{ uf() || 'SP' }} ({{ valorCubEstadoAtual() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}/m²)</span>
                              <span class="text-[10px] text-slate-400 font-normal">({{ infoCubEstadoAtual() }})</span>
                            </button>
                          </div>
                          <input
                            type="number"
                            [value]="custoBase()"
                            (input)="custoBase.set(+$any($event.target).value); recalcular()"
                            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-800"
                            placeholder="0.00"
                          />
                          <div class="text-[11px] text-slate-500">
                            Área total: {{ areaTotal() }} m² (R$ {{ areaTotal() > 0 ? (custoBase() / areaTotal()).toFixed(0) : 0 }}/m²)
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Itens Adicionais e Taxas Indiretas -->
                    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="flex items-center justify-between">
                        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Custos Indiretos & Taxas
                        </div>
                        <span class="text-xs font-bold text-slate-500">Projetos, ITBI, Licenças</span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          [value]="novoItemNome"
                          (input)="novoItemNome = $any($event.target).value"
                          placeholder="Ex: Projetos & Alvará"
                          class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white sm:col-span-2"
                        />
                        <select
                          [value]="novoItemTipo"
                          (change)="novoItemTipo = $any($event.target).value"
                          class="px-2 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          <option value="percentual">% da Obra</option>
                          <option value="fixo">R$ Fixo</option>
                        </select>
                        <input
                          type="number"
                          [value]="novoItemValor || ''"
                          (input)="novoItemValor = +$any($event.target).value"
                          placeholder="Valor"
                          class="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        (click)="adicionarItemAdicional()"
                        class="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
                      >
                        + Incluir Item Adicional
                      </button>

                      @if (itensAdicionais().length > 0) {
                        <div class="space-y-1.5 pt-2">
                          @for (item of itensAdicionais(); track item.id) {
                            <div class="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                              <span>{{ item.nome }} ({{ item.tipo === 'percentual' ? item.valor + '%' : (item.valor | currency:'BRL':'symbol':'1.0-0':'pt-BR') }})</span>
                              <button type="button" (click)="removerItemAdicional(item.id)" class="text-rose-500 hover:text-rose-700 cursor-pointer">✕</button>
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Parâmetros de Financiamento -->
                    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Condições de Financiamento Bancário
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Entrada Mínima (%)</label>
                          <input
                            type="number"
                            [value]="percentualEntrada()"
                            (input)="percentualEntrada.set(+$any($event.target).value); recalcular()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                            min="10"
                            max="90"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Taxa de Juros Anual (% a.a.)</label>
                          <input
                            type="number"
                            step="0.1"
                            [value]="taxaJurosAnual()"
                            (input)="taxaJurosAnual.set(+$any($event.target).value); recalcular()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Prazo (Anos)</label>
                          <input
                            type="number"
                            [value]="prazoAnos()"
                            (input)="prazoAnos.set(+$any($event.target).value); recalcular()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                            min="1"
                            max="35"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Sistema de Amortização</label>
                          <select
                            [value]="sistemaAmortizacao()"
                            (change)="sistemaAmortizacao.set($any($event.target).value); recalcular()"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          >
                            <option value="price">PRICE (Parcela Fixa)</option>
                            <option value="sac">SAC (Parcela Decrescente)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Coluna Direita: Resumo do Cálculo Real -->
                  <div class="lg:col-span-5 space-y-4">
                    <div class="p-6 rounded-3xl bg-[#132A41] text-white space-y-6 shadow-xl sticky top-6">
                      <div class="flex items-center justify-between border-b border-slate-700 pb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Resumo da Operação</span>
                        <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
                          Fórmula Composta OK
                        </span>
                      </div>

                      <div class="space-y-3 text-xs">
                        <div class="flex justify-between py-1 border-b border-slate-800">
                          <span class="text-slate-300">Custo Total Estimado:</span>
                          <span class="font-black text-white text-sm">
                            {{ resultado()?.custoTotal | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </span>
                        </div>

                        <div class="flex justify-between py-1 border-b border-slate-800">
                          <span class="text-slate-300">Valor de Entrada ({{ percentualEntrada() }}%):</span>
                          <span class="font-bold text-amber-300">
                            {{ resultado()?.valorEntrada | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </span>
                        </div>

                        <div class="flex justify-between py-1 border-b border-slate-800">
                          <span class="text-slate-300">Valor a Financiar:</span>
                          <span class="font-bold text-cyan-300">
                            {{ resultado()?.valorFinanciavel | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </span>
                        </div>

                        <div class="flex justify-between py-1 border-b border-slate-800">
                          <span class="text-slate-300">Prazo:</span>
                          <span class="font-bold text-white">{{ prazoAnos() * 12 }} meses ({{ prazoAnos() }} anos)</span>
                        </div>

                        <div class="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1 mt-4">
                          <div class="text-[11px] text-slate-300 font-bold uppercase">
                            {{ sistemaAmortizacao() === 'price' ? 'Parcela Mensal Fixa' : 'Primeira Parcela (SAC)' }}
                          </div>
                          <div class="text-2xl font-black text-emerald-400">
                            {{ resultado()?.parcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                          </div>
                        </div>

                        <div class="flex justify-between pt-2 text-[11px] text-slate-400">
                          <span>Total Pago ao Final:</span>
                          <span class="font-bold text-slate-200">
                            {{ resultado()?.totalPago | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        (click)="selecionarEtapa(3)"
                        class="w-full py-3 rounded-2xl bg-[#B5642A] hover:bg-[#9E5522] text-white font-black text-xs transition-colors cursor-pointer shadow-lg text-center block"
                      >
                        Avançar: Checklist de Documentos →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ETAPA 3: DOCUMENTAÇÃO -->
            @if (etapaAtiva() === 3) {
              <div class="space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-black text-slate-800">3. Checklist de Documentação Bancária</h3>
                    <p class="text-xs text-slate-500">Organize os documentos exigidos pelos bancos de acordo com o regime de renda</p>
                  </div>

                  <!-- Seletor de Tipo de Renda -->
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-bold text-slate-700">Regime de Renda:</label>
                    <select
                      [value]="tipoRenda()"
                      (change)="tipoRenda.set($any($event.target).value)"
                      class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                    >
                      <option value="clt">CLT (Carteira Assinada)</option>
                      <option value="autonomo">Profissional Autônomo / Liberal</option>
                      <option value="empresario">Empresário / PJ</option>
                    </select>
                  </div>
                </div>

                <!-- Semáforo de Prontidão e Barra de Progresso -->
                <div class="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-4 h-4 rounded-full shadow-xs"
                        [ngClass]="{
                          'bg-emerald-500': percentualDocumentacao() === 100,
                          'bg-amber-500': percentualDocumentacao() >= 70 && percentualDocumentacao() < 100,
                          'bg-rose-500': percentualDocumentacao() < 70
                        }"
                      ></div>
                      <div>
                        <div class="text-sm font-black text-slate-800">
                          Prontidão da Pasta: {{ percentualDocumentacao().toFixed(0) }}%
                        </div>
                        <div class="text-xs text-slate-500">
                          {{ totalDocsObrigatoriosMarcados() }} de {{ totalDocsObrigatorios() }} documentos obrigatórios preenchidos
                        </div>
                      </div>
                    </div>

                    <span class="text-xs font-bold px-3 py-1 rounded-full"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800': percentualDocumentacao() === 100,
                        'bg-amber-100 text-amber-800': percentualDocumentacao() >= 70 && percentualDocumentacao() < 100,
                        'bg-rose-100 text-rose-800': percentualDocumentacao() < 70
                      }"
                    >
                      {{ percentualDocumentacao() === 100 ? 'Pasta Pronta para Análise' : (percentualDocumentacao() >= 70 ? 'Prontidão Moderada' : 'Documentação Pendente') }}
                    </span>
                  </div>

                  <!-- Barra -->
                  <div class="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full transition-all duration-300 rounded-full"
                      [style.width.%]="percentualDocumentacao()"
                      [ngClass]="{
                        'bg-emerald-500': percentualDocumentacao() === 100,
                        'bg-amber-500': percentualDocumentacao() >= 70 && percentualDocumentacao() < 100,
                        'bg-rose-500': percentualDocumentacao() < 70
                      }"
                    ></div>
                  </div>
                </div>

                <!-- Lista de Documentos -->
                <div class="space-y-4">
                  <h4 class="text-sm font-black text-slate-800">Documentos Gerais & Específicos</h4>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (doc of getDocumentosAtuais(); track doc.id) {
                      <label class="p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer select-none"
                        [class.bg-emerald-50]="isDocumentoMarcado(doc.id)"
                        [class.border-emerald-300]="isDocumentoMarcado(doc.id)"
                        [class.bg-white]="!isDocumentoMarcado(doc.id)"
                        [class.border-slate-200]="!isDocumentoMarcado(doc.id)"
                      >
                        <input
                          type="checkbox"
                          [checked]="isDocumentoMarcado(doc.id)"
                          (change)="toggleDocumento(doc.id)"
                          class="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div class="space-y-0.5 flex-1">
                          <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-800" [class.line-through]="isDocumentoMarcado(doc.id)">
                              {{ doc.nome }}
                            </span>
                            @if (doc.obrigatorio) {
                              <span class="text-[10px] font-bold text-rose-600 uppercase">Obrigatório</span>
                            } @else {
                              <span class="text-[10px] text-slate-400">Opcional</span>
                            }
                          </div>
                          <p class="text-[11px] text-slate-500 leading-relaxed">{{ doc.descricao }}</p>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Dicas Práticas de Crédito -->
                <div class="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs text-indigo-950">
                  <div class="font-black flex items-center gap-2">
                    <span>💡</span>
                    <span>Recomendações Cruciais para Aprovação Bancária</span>
                  </div>
                  <ul class="list-disc list-inside space-y-1 text-slate-700 leading-relaxed pl-1 text-[11px]">
                    <li>Mantenha as certidões com emissão inferior a 90 dias.</li>
                    <li>Evite movimentações financeiras atípicas ou contratação de novos empréstimos 60 dias antes da submissão.</li>
                    <li>Para autônomos e empresários, a compatibilidade entre movimentação bancária e declaração de IR é o fator de maior peso.</li>
                  </ul>
                </div>

                <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    (click)="selecionarEtapa(2)"
                    class="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Voltar: Quanto Custa
                  </button>

                  <button
                    type="button"
                    (click)="selecionarEtapa(4)"
                    class="px-6 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <span>Avançar: Comparação Bancária</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            }

            <!-- ETAPA 4: COMPARAÇÃO BANCÁRIA -->
            @if (etapaAtiva() === 4) {
              <div class="space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-black text-slate-800">4. Comparativo de Linhas de Crédito</h3>
                    <p class="text-xs text-slate-500">Confronte as taxas reais e parcelas estimadas dos principais agentes financeiros</p>
                  </div>

                  <!-- Filtro de Elegibilidade -->
                  <div class="flex items-center gap-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 uppercase">Renda Familiar (R$)</label>
                      <input
                        type="number"
                        [value]="rendaFamiliar || ''"
                        (input)="rendaFamiliar = +$any($event.target).value || null"
                        placeholder="Ex: 15000"
                        class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white w-32"
                      />
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 uppercase">Idade Solicitante</label>
                      <input
                        type="number"
                        [value]="idadeSolicitante || ''"
                        (input)="idadeSolicitante = +$any($event.target).value || null"
                        placeholder="Ex: 35"
                        class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white w-24"
                      />
                    </div>
                  </div>
                </div>

                @if (carregandoLinhas()) {
                  <div class="p-12 text-center text-xs text-slate-400">Carregando linhas bancárias cadastradas...</div>
                } @else if (filtrarLinhasElegiveis().length === 0) {
                  <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                    <p>Nenhuma linha de crédito atende aos filtros de renda/idade ou nenhuma está ativa no sistema.</p>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    @for (linha of filtrarLinhasElegiveis(); track linha.id; let idx = $index) {
                      <div
                        (click)="selecionarLinhaCredito(linha.id)"
                        class="p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
                        [class.border-[#B5642A]]="linhaCreditoSelecionadaId() === linha.id"
                        [class.bg-amber-50/40]="linhaCreditoSelecionadaId() === linha.id"
                        [class.border-slate-200]="linhaCreditoSelecionadaId() !== linha.id"
                        [class.bg-white]="linhaCreditoSelecionadaId() !== linha.id"
                      >
                        <!-- Badge Recomendado -->
                        @if (idx === 0) {
                          <div class="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                            Recomendado
                          </div>
                        }

                        <div class="space-y-3">
                          <div class="flex items-center justify-between">
                            <h4 class="text-base font-black text-[#132A41]">{{ linha.banco }}</h4>
                            <span class="text-xs font-bold text-[#B5642A]">{{ linha.taxa_juros_min }}% a.a.</span>
                          </div>

                          <div class="text-xs text-slate-600 font-semibold">
                            {{ linha.produto }}
                          </div>

                          <!-- Parcela Estimada -->
                          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                            <div class="text-[10px] uppercase font-bold text-slate-500">Parcela Estimada</div>
                            <div class="text-lg font-black text-emerald-700">
                              {{ calcularParcelaLinha(linha) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}/mês
                            </div>
                            <div class="text-[10px] text-slate-400">
                              Prazo máx: {{ linha.prazo_max_anos || 30 }} anos • Até {{ linha.percentual_financiamento_max || 80 }}%
                            </div>
                          </div>

                          <!-- Badges / Tags -->
                          <div class="flex flex-wrap gap-1 text-[10px]">
                            @if (linha.juros_na_obra) {
                              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Juros na Obra</span>
                            }
                            @if (linha.carencia_meses) {
                              <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Carência {{ linha.carencia_meses }}m</span>
                            }
                            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {{ linha.sistema_amortizacao || 'SAC / Price' }}
                            </span>
                          </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span class="font-bold text-indigo-600">
                            {{ linhaCreditoSelecionadaId() === linha.id ? '✓ Selecionada' : 'Clique para selecionar' }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Bloco Educativo: Como Escolher -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <h4 class="font-bold text-slate-900">Como Escolher a Linha Ideal?</h4>
                  <p class="leading-relaxed">
                    Compare não apenas a taxa nominal, mas o Custo Efetivo Total (CET) que inclui tarifas bancárias e seguros obrigatórios (MIP e DFI). Se o seu foco é amortizar rapidamente, o sistema SAC reduz os juros totais pagos com maior intensidade.
                  </p>
                </div>

                <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    (click)="selecionarEtapa(3)"
                    class="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Voltar: Documentação
                  </button>

                  <button
                    type="button"
                    (click)="selecionarEtapa(5)"
                    class="px-6 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <span>Avançar: Simulação Avançada</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            }

            <!-- ETAPA 5: SIMULAÇÃO AVANÇADA (TABELA & GRÁFICOS) -->
            @if (etapaAtiva() === 5) {
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-black text-slate-800">5. Simulação Detalhada & Evolução da Dívida</h3>
                  <p class="text-xs text-slate-500">Curva de amortização mês a mês, gráficos de saldo devedor e composição de parcelas</p>
                </div>

                <!-- Sliders Interativos em Tempo Real -->
                <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span>Taxa de Juros Anual:</span>
                        <span class="text-[#B5642A] text-sm">{{ taxaJurosAnual() }}% a.a.</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="15"
                        step="0.1"
                        [value]="taxaJurosAnual()"
                        (input)="taxaJurosAnual.set(+$any($event.target).value); recalcular()"
                        class="w-full accent-[#B5642A] cursor-pointer"
                      />
                    </div>

                    <div class="space-y-2">
                      <div class="flex justify-between text-xs font-bold text-slate-700">
                        <span>Prazo de Financiamento:</span>
                        <span class="text-[#132A41] text-sm">{{ prazoAnos() }} anos ({{ prazoAnos() * 12 }} meses)</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="35"
                        step="1"
                        [value]="prazoAnos()"
                        (input)="prazoAnos.set(+$any($event.target).value); recalcular()"
                        class="w-full accent-[#132A41] cursor-pointer"
                      />
                    </div>
                  </div>

                  <!-- Juros na Obra Toggle -->
                  <div class="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        [checked]="temJurosObra()"
                        (change)="temJurosObra.set($any($event.target).checked); recalcular()"
                        class="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Considerar Fase de Juros na Obra (antes da amortização)</span>
                    </label>

                    @if (temJurosObra()) {
                      <div class="flex items-center gap-3 text-xs">
                        <label class="font-bold text-slate-600">Duração Obra:</label>
                        <select
                          [value]="prazoObraMeses()"
                          (change)="prazoObraMeses.set(+$any($event.target).value); recalcular()"
                          class="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                        >
                          <option [value]="6">6 meses</option>
                          <option [value]="12">12 meses</option>
                          <option [value]="18">18 meses</option>
                          <option [value]="24">24 meses</option>
                        </select>
                      </div>
                    }
                  </div>
                </div>

                <!-- 4 Cards de Métricas -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">1ª Parcela</div>
                    <div class="text-xl font-black text-slate-900">
                      {{ getPrimeiraParcela() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </div>
                  </div>

                  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Última Parcela</div>
                    <div class="text-xl font-black text-slate-900">
                      {{ getUltimaParcela() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </div>
                  </div>

                  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Total em Juros</div>
                    <div class="text-xl font-black text-rose-600">
                      {{ getTotalJuros() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                    </div>
                  </div>

                  <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                    <div class="text-[11px] font-bold text-slate-400 uppercase">Total Pago</div>
                    <div class="text-xl font-black text-[#B5642A]">
                      {{ resultado()?.totalPago | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                    </div>
                  </div>
                </div>

                <!-- Gráfico Visual da Evolução do Saldo Devedor -->
                <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-black text-slate-800">Evolução do Saldo Devedor ao Longo dos Anos</h4>
                      <p class="text-xs text-slate-500">Curva de decaimento do principal conforme amortização</p>
                    </div>
                  </div>

                  <!-- Gráfico SVG Responsivo -->
                  <div class="w-full h-48 bg-slate-50 rounded-2xl p-4 flex items-end gap-1 overflow-hidden border border-slate-100 relative">
                    @for (ponto of getPontosGraficoSaldo(); track ponto.mes) {
                      <div
                        class="flex-1 bg-indigo-500/80 hover:bg-indigo-600 rounded-t transition-all group relative cursor-pointer"
                        [style.height.%]="ponto.percentual"
                      >
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block p-2 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-20 shadow-lg">
                          Mês {{ ponto.mes }}: {{ ponto.saldo | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                      </div>
                    }
                  </div>
                  <div class="flex justify-between text-[11px] text-slate-400 font-bold">
                    <span>Mês 1 (Início)</span>
                    <span>Mês {{ (prazoAnos() * 12) / 2 }} (Metade)</span>
                    <span>Mês {{ prazoAnos() * 12 }} (Quitação)</span>
                  </div>
                </div>

                <!-- Amostra da Tabela de Amortização -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-black text-slate-800">Tabela de Amortização (Primeiros Meses & Amostra)</h4>
                    <span class="text-xs text-slate-500">Sistema {{ sistemaAmortizacao().toUpperCase() }}</span>
                  </div>

                  <div class="overflow-x-auto rounded-2xl border border-slate-200">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th class="p-3">Mês / Fase</th>
                          <th class="p-3">Parcela</th>
                          <th class="p-3">Amortização</th>
                          <th class="p-3">Juros</th>
                          <th class="p-3">Saldo Devedor</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (parc of getAmostraParcelas(); track parc.mes) {
                          <tr class="hover:bg-slate-50/80">
                            <td class="p-3 font-bold text-slate-800">
                              {{ parc.fase === 'Obra' ? 'Obra Mês ' + Math.abs(parc.mes) : 'Mês ' + parc.mes }}
                            </td>
                            <td class="p-3 font-bold text-emerald-700">{{ parc.parcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td>
                            <td class="p-3 text-slate-600">{{ parc.amortizacao | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td>
                            <td class="p-3 text-rose-600">{{ parc.juros | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td>
                            <td class="p-3 font-medium text-slate-800">{{ parc.saldo | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    (click)="selecionarEtapa(4)"
                    class="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Voltar: Comparação Bancária
                  </button>

                  <button
                    type="button"
                    (click)="selecionarEtapa(tipoOperacao() !== 'compra_terreno' ? 6 : 7)"
                    class="px-6 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <span>{{ tipoOperacao() !== 'compra_terreno' ? 'Avançar: Construir vs Alugar' : 'Avançar: Agendamento de Consulta' }}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            }

            <!-- ETAPA 6: CONSTRUIR VS ALUGAR -->
            @if (etapaAtiva() === 6 && tipoOperacao() !== 'compra_terreno') {
              <div class="space-y-8">
                <div>
                  <h3 class="text-lg font-black text-slate-800">6. Estudo de Viabilidade: Construir vs. Alugar</h3>
                  <p class="text-xs text-slate-500">Confronte o valor gasto em aluguel no período com o custo real (com juros) de construir seu patrimônio</p>
                </div>

                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Valor Médio de Aluguel da Região (R$/m²):</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="number"
                        [value]="valorAluguelM2()"
                        (input)="valorAluguelM2.set(+$any($event.target).value); recalcularComparacaoAluguel()"
                        class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white w-32"
                      />
                      <span class="text-xs text-slate-500">
                        = {{ (areaTotal() * valorAluguelM2()) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}/mês de aluguel estimado
                      </span>
                    </div>
                  </div>

                  <div class="text-right text-xs">
                    <span class="text-slate-400">Horizonte:</span>
                    <strong class="text-slate-800 ml-1">{{ prazoAnos() * 12 }} meses ({{ prazoAnos() }} anos)</strong>
                  </div>
                </div>

                <!-- Comparativo em 2 Colunas -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Coluna Construção -->
                  <div class="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-black uppercase tracking-wider text-emerald-800">Construção Própria</span>
                      <span class="text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">Patrimônio</span>
                    </div>

                    <div class="space-y-1">
                      <div class="text-xs text-slate-500">Custo Total Real (Financiamento Quitado):</div>
                      <div class="text-2xl font-black text-emerald-900">
                        {{ resultado()?.totalPago | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                      </div>
                    </div>

                    <p class="text-xs text-slate-600 leading-relaxed">
                      Ao final de {{ prazoAnos() }} anos, o imóvel é 100% de sua propriedade com valorização de mercado sobre a área de {{ areaTotal() }} m².
                    </p>
                  </div>

                  <!-- Coluna Aluguel -->
                  <div class="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-4">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-black uppercase tracking-wider text-amber-800">Aluguel Acumulado</span>
                      <span class="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">Despesa Pura</span>
                    </div>

                    <div class="space-y-1">
                      <div class="text-xs text-slate-500">Total Desembolsado em Aluguel:</div>
                      <div class="text-2xl font-black text-amber-900">
                        {{ (areaTotal() * valorAluguelM2() * prazoAnos() * 12) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                      </div>
                    </div>

                    <p class="text-xs text-slate-600 leading-relaxed">
                      Capital não recuperável investido em imóvel de terceiros sem formação de patrimônio imobiliário.
                    </p>
                  </div>
                </div>

                <div class="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    (click)="selecionarEtapa(5)"
                    class="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Voltar: Simulação Avançada
                  </button>

                  <button
                    type="button"
                    (click)="selecionarEtapa(7)"
                    class="px-6 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#9E5522] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <span>Avançar: Agendamento & Pasta</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            }

            <!-- ETAPA 7: AGENDAMENTO DE CONSULTA & PASTA DE CRÉDITO -->
            @if (etapaAtiva() === 7) {
              <div class="space-y-8">
                <div class="text-center max-w-2xl mx-auto space-y-2">
                  <div class="w-12 h-12 rounded-2xl bg-amber-100 text-[#B5642A] flex items-center justify-center mx-auto text-xl shadow-inner">
                    📁
                  </div>
                  <h3 class="text-xl font-black text-slate-900">Sua Pasta de Crédito Está Estruturada!</h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Você completou o planejamento de <strong>{{ nomeProjeto() }}</strong>. Agende agora uma consultoria técnica de viabilidade bancária para submissão aos bancos.
                  </p>
                </div>

                @if (solicitacaoEnviada()) {
                  <div class="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 max-w-xl mx-auto">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                      ✓
                    </div>
                    <div class="space-y-1">
                      <h4 class="text-base font-black text-emerald-900">Solicitação Registrada com Sucesso!</h4>
                      <p class="text-xs text-emerald-800 leading-relaxed">
                        Nossa assessoria de crédito entrará em contato para os próximos passos de aprovação da sua pasta.
                      </p>
                    </div>

                    <a
                      [href]="gerarWhatsappLink()"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors inline-flex items-center gap-2 shadow-md"
                    >
                      <span>Falar Agora no WhatsApp Oficial</span>
                      <span>💬</span>
                    </a>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <!-- Opção 1: Formulário -->
                    <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
                      <div class="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Opção 1: Solicitar Contato da Assessoria
                      </div>

                      <div class="space-y-3">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            [value]="contatoNome"
                            (input)="contatoNome = $any($event.target).value"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">E-mail</label>
                          <input
                            type="email"
                            [value]="contatoEmail"
                            (input)="contatoEmail = $any($event.target).value"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Telefone / WhatsApp</label>
                          <input
                            type="tel"
                            [value]="contatoTelefone"
                            (input)="contatoTelefone = $any($event.target).value"
                            placeholder="(00) 00000-0000"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Mensagem / Observações</label>
                          <textarea
                            [value]="contatoMensagem"
                            (input)="contatoMensagem = $any($event.target).value"
                            rows="3"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          ></textarea>
                        </div>

                        <button
                          type="button"
                          (click)="enviarSolicitacaoAssessoria()"
                          [disabled]="enviandoSolicitacao()"
                          class="w-full py-3 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {{ enviandoSolicitacao() ? 'Enviando...' : 'Enviar Solicitação de Assessoria' }}
                        </button>
                      </div>
                    </div>

                    <!-- Opção 2: Contato Imediato WhatsApp -->
                    <div class="p-6 rounded-3xl bg-[#132A41] text-white flex flex-col justify-between space-y-6 shadow-md">
                      <div class="space-y-3">
                        <span class="text-xs font-black uppercase tracking-wider text-amber-400">
                          Opção 2: Contato Imediato
                        </span>

                        <h4 class="text-lg font-black text-white">
                          Prefere falar direto com um especialista agora?
                        </h4>

                        <p class="text-xs text-slate-300 leading-relaxed">
                          Conecte-se com nossa equipe de engenharia e crédito imobiliário diretamente pelo canal oficial de WhatsApp.
                        </p>
                      </div>

                      <div class="space-y-3">
                        <a
                          [href]="gerarWhatsappLink()"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg text-center"
                        >
                          <span>Falar Agora no WhatsApp</span>
                          <span>💬</span>
                        </a>

                        <div class="text-[11px] text-slate-400 text-center">
                          Atendimento especializado para membros da Comunidade Nova
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

          </div>
        </div>
      }

      <!-- MODAL: NOVO PROJETO DE CRÉDITO -->
      @if (modalNovoProjetoAberto()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-[#132A41] text-white flex items-center justify-center font-bold text-xs">
                  IA
                </div>
                <h3 class="text-lg font-black text-slate-900">Novo Projeto de Crédito</h3>
              </div>
              <button type="button" (click)="modalNovoProjetoAberto.set(false)" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome do Projeto / Imóvel *</label>
                <input
                  type="text"
                  [value]="novoProjetoNome"
                  (input)="novoProjetoNome = $any($event.target).value"
                  placeholder="Ex: Casa Residencial Alphaville"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  [value]="novoProjetoNomeCliente"
                  (input)="novoProjetoNomeCliente = $any($event.target).value"
                  placeholder="Ex: Dr. Roberto Silva"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Estado (UF / CUB)</label>
                  <select
                    [value]="novoProjetoUf"
                    (change)="novoProjetoUf = $any($event.target).value"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-bold text-[#132A41]"
                  >
                    @for (est of estadosBrasil; track est.uf) {
                      <option [value]="est.uf">{{ est.uf }} - {{ est.nome }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    [value]="novoProjetoCidade"
                    (input)="novoProjetoCidade = $any($event.target).value"
                    placeholder="Ex: Ribeirão Preto"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Endereço / Condomínio / Lote</label>
                <input
                  type="text"
                  [value]="novoProjetoEndereco"
                  (input)="novoProjetoEndereco = $any($event.target).value"
                  placeholder="Ex: Condomínio Quinta da Primavera, Qd B, Lote 14"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Tipo de Operação</label>
                <div class="space-y-2">
                  <label class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
                    [class.border-[#B5642A]]="novoProjetoTipoOperacao === 'compra_construcao'"
                    [class.bg-amber-50/40]="novoProjetoTipoOperacao === 'compra_construcao'"
                  >
                    <input type="radio" name="tipoOp" value="compra_construcao" [checked]="novoProjetoTipoOperacao === 'compra_construcao'" (change)="novoProjetoTipoOperacao = 'compra_construcao'" />
                    <div>
                      <div class="text-xs font-bold text-slate-800">Compra de Terreno + Construção</div>
                      <div class="text-[11px] text-slate-500">Financia a aquisição do lote e a execução da obra juntas</div>
                    </div>
                  </label>

                  <label class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
                    [class.border-[#B5642A]]="novoProjetoTipoOperacao === 'construcao'"
                    [class.bg-amber-50/40]="novoProjetoTipoOperacao === 'construcao'"
                  >
                    <input type="radio" name="tipoOp" value="construcao" [checked]="novoProjetoTipoOperacao === 'construcao'" (change)="novoProjetoTipoOperacao = 'construcao'" />
                    <div>
                      <div class="text-xs font-bold text-slate-800">Apenas Construção (Terreno Próprio)</div>
                      <div class="text-[11px] text-slate-500">O cliente já possui o lote quitado ou escriturado</div>
                    </div>
                  </label>

                  <label class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
                    [class.border-[#B5642A]]="novoProjetoTipoOperacao === 'compra_terreno'"
                    [class.bg-amber-50/40]="novoProjetoTipoOperacao === 'compra_terreno'"
                  >
                    <input type="radio" name="tipoOp" value="compra_terreno" [checked]="novoProjetoTipoOperacao === 'compra_terreno'" (change)="novoProjetoTipoOperacao = 'compra_terreno'" />
                    <div>
                      <div class="text-xs font-bold text-slate-800">Apenas Compra de Terreno</div>
                      <div class="text-[11px] text-slate-500">Aquisição de lote urbano ou em condomínio fechado</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="modalNovoProjetoAberto.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="criarProjeto()"
                [disabled]="!novoProjetoNome.trim() || criandoProjeto()"
                class="px-5 py-2.5 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {{ criandoProjeto() ? 'Criando...' : 'Iniciar Projeto' }}
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ViabilizaIaComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  protected readonly Math = Math;

  readonly estadosBrasil = ESTADOS_BRASIL;
  readonly ambientesDisponiveis = AMBIENTES_DISPONIVEIS;
  readonly areasExternasTipos = AREAS_EXTERNAS_TIPOS;
  readonly documentosBase = DOCUMENTOS_BASE;

  // Estados gerais
  readonly projetos = signal<any[]>([]);
  readonly carregandoProjetos = signal(false);
  readonly projetoAtual = signal<any | null>(null);
  readonly etapaAtiva = signal<number>(1);
  readonly salvando = signal(false);
  readonly criandoProjeto = signal(false);
  readonly modalNovoProjetoAberto = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  // Form Novo Projeto
  novoProjetoNome = '';
  novoProjetoNomeCliente = '';
  novoProjetoUf = 'SP';
  novoProjetoCidade = '';
  novoProjetoEndereco = '';
  novoProjetoTipoOperacao: 'compra_terreno' | 'compra_construcao' | 'construcao' = 'compra_construcao';

  // Parâmetros do Projeto Ativo
  readonly nomeProjeto = signal('');
  readonly nomeCliente = signal('');
  readonly uf = signal('SP');
  readonly cidade = signal('');
  readonly endereco = signal('');
  readonly tipoOperacao = signal<'compra_terreno' | 'compra_construcao' | 'construcao'>('compra_construcao');
  readonly status = signal('rascunho');

  // CUB do Estado
  readonly valorCubEstadoAtual = signal<number>(2650);
  readonly infoCubEstadoAtual = signal<string>('Ref: Sinduscon');
  readonly carregandoCub = signal(false);

  // Etapa 1: Ambientes e Áreas
  readonly ambientes = signal<AmbienteItem[]>([]);
  readonly areasExternas = signal<AreaExternaItem[]>([]);
  readonly pavimentos = signal<number>(1);

  novoAmbienteNome = 'Quarto';
  novoAmbienteTamanho: 'P' | 'M' | 'G' | 'Personalizado' = 'M';
  novoAmbienteArea = 12;
  novoAmbienteDimensoes = '3x4m';

  novaAreaTipo = 'Piscina';
  novaAreaMetragem = 15;

  // Etapa 2: Custos
  readonly valorTerreno = signal<number>(150000);
  readonly custoBase = signal<number>(350000);
  readonly itensAdicionais = signal<ItemAdicional[]>([
    { id: '1', nome: 'Projetos Arquitetônico & Estrutural', tipo: 'percentual', valor: 5 },
    { id: '2', nome: 'Taxas de Licença & Alvará', tipo: 'fixo', valor: 8000 }
  ]);
  readonly percentualEntrada = signal<number>(20);
  readonly taxaJurosAnual = signal<number>(9.5);
  readonly prazoAnos = signal<number>(25);
  readonly sistemaAmortizacao = signal<'price' | 'sac'>('sac');

  novoItemNome = '';
  novoItemTipo: 'percentual' | 'fixo' = 'percentual';
  novoItemValor = 0;

  // Etapa 3: Documentação
  readonly tipoRenda = signal<'clt' | 'autonomo' | 'empresario'>('clt');
  readonly checklistDocumentacao = signal<string[]>(['rg_cpf', 'comprovante_residencia']);

  // Etapa 4: Linhas de Crédito
  readonly linhasCredito = signal<any[]>([]);
  readonly carregandoLinhas = signal(false);
  readonly linhaCreditoSelecionadaId = signal<string | null>(null);
  rendaFamiliar: number | null = null;
  idadeSolicitante: number | null = null;

  // Etapa 5: Simulação Avançada
  readonly temJurosObra = signal<boolean>(true);
  readonly prazoObraMeses = signal<number>(12);
  readonly taxaJurosObra = signal<number>(9.5);

  // Etapa 6: Aluguel
  readonly valorAluguelM2 = signal<number>(25);

  // Etapa 7: Contato
  contatoNome = '';
  contatoEmail = '';
  contatoTelefone = '';
  contatoMensagem = '';
  readonly enviandoSolicitacao = signal(false);
  readonly solicitacaoEnviada = signal(false);

  // Resultados Calculados
  readonly resultado = signal<{
    custoTotal: number;
    valorEntrada: number;
    valorFinanciavel: number;
    parcela: number;
    totalPago: number;
  } | null>(null);

  readonly areaTotal = computed(() => {
    return this.ambientes().reduce((acc, a) => acc + (a.area || 0), 0);
  });

  readonly areaExternaTotal = computed(() => {
    return this.areasExternas().reduce((acc, a) => acc + (a.area || 0), 0);
  });

  async ngOnInit(): Promise<void> {
    await this.carregarProjetos();
    await this.carregarLinhasCredito();
    await this.atualizarDadosCubPorEstado(this.uf());
    this.recalcular();
  }

  async carregarProjetos(): Promise<void> {
    this.carregandoProjetos.set(true);
    try {
      const lista = await this.supabaseService.listarMeusProjetosCredito();
      this.projetos.set(lista || []);
    } catch {
      this.projetos.set([]);
    } finally {
      this.carregandoProjetos.set(false);
    }
  }

  async carregarLinhasCredito(): Promise<void> {
    this.carregandoLinhas.set(true);
    try {
      const lista = await this.supabaseService.listarLinhasCreditoAtivas();
      this.linhasCredito.set(lista || []);
      if (lista.length > 0 && !this.linhaCreditoSelecionadaId()) {
        this.linhaCreditoSelecionadaId.set(lista[0].id);
      }
    } catch {
      this.linhasCredito.set([]);
    } finally {
      this.carregandoLinhas.set(false);
    }
  }

  abrirModalNovoProjeto(): void {
    this.novoProjetoNome = '';
    this.novoProjetoNomeCliente = '';
    this.novoProjetoUf = 'SP';
    this.novoProjetoCidade = '';
    this.novoProjetoEndereco = '';
    this.novoProjetoTipoOperacao = 'compra_construcao';
    this.modalNovoProjetoAberto.set(true);
  }

  async criarProjeto(): Promise<void> {
    if (!this.novoProjetoNome.trim()) return;
    this.criandoProjeto.set(true);
    try {
      const { data, error } = await this.supabaseService.criarProjetoCredito({
        nome_projeto: this.novoProjetoNome.trim(),
        nome_cliente: this.novoProjetoNomeCliente.trim() || undefined,
        uf: this.novoProjetoUf || 'SP',
        cidade: this.novoProjetoCidade.trim() || undefined,
        endereco: this.novoProjetoEndereco.trim() || undefined,
        tipo_operacao: this.novoProjetoTipoOperacao,
        status: 'rascunho',
        etapa_atual: 1,
        valor_terreno: this.novoProjetoTipoOperacao !== 'construcao' ? 150000 : 0,
        custo_base: this.novoProjetoTipoOperacao !== 'compra_terreno' ? 350000 : 0,
        taxa_juros_anual: 9.5,
        prazo_anos: 25,
        percentual_entrada: 20,
        sistema_amortizacao: 'sac',
        ambientes: [],
        areas_externas: [],
        itens_adicionais: [],
        checklist_documentacao: []
      });

      if (error) throw error;

      this.supabaseService.registrarAtividadeDiaria('agente_ia');
      this.mensagemSucesso.set('Novo projeto de crédito criado com sucesso!');
      this.modalNovoProjetoAberto.set(false);
      await this.carregarProjetos();
      if (data) {
        this.abrirProjeto(data);
      }
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao criar projeto');
    } finally {
      this.criandoProjeto.set(false);
    }
  }

  async abrirProjeto(proj: any): Promise<void> {
    this.projetoAtual.set(proj);
    this.nomeProjeto.set(proj.nome_projeto || 'Projeto de Crédito');
    this.nomeCliente.set(proj.nome_cliente || '');
    this.uf.set(proj.uf || 'SP');
    this.cidade.set(proj.cidade || '');
    this.endereco.set(proj.endereco || '');
    this.tipoOperacao.set(proj.tipo_operacao || 'compra_construcao');
    this.status.set(proj.status || 'rascunho');
    this.etapaAtiva.set(proj.etapa_atual || 1);

    // Carregar ambientes e áreas
    this.ambientes.set(Array.isArray(proj.ambientes) ? proj.ambientes : []);
    this.areasExternas.set(Array.isArray(proj.areas_externas) ? proj.areas_externas : []);
    this.pavimentos.set(proj.pavimentos || 1);

    // Custos
    this.valorTerreno.set(proj.valor_terreno ?? 150000);
    this.custoBase.set(proj.custo_base ?? 350000);
    this.itensAdicionais.set(Array.isArray(proj.itens_adicionais) && proj.itens_adicionais.length > 0
      ? proj.itens_adicionais
      : [
          { id: '1', nome: 'Projetos Arquitetônico & Estrutural', tipo: 'percentual', valor: 5 },
          { id: '2', nome: 'Taxas de Licença & Alvará', tipo: 'fixo', valor: 8000 }
        ]
    );

    this.percentualEntrada.set(proj.percentual_entrada ?? 20);
    this.taxaJurosAnual.set(proj.taxa_juros_anual ?? 9.5);
    this.prazoAnos.set(proj.prazo_anos ?? 25);
    this.sistemaAmortizacao.set(proj.sistema_amortizacao === 'price' ? 'price' : 'sac');

    // Documentação
    this.tipoRenda.set(proj.tipo_renda || 'clt');
    this.checklistDocumentacao.set(Array.isArray(proj.checklist_documentacao) ? proj.checklist_documentacao : []);

    // Linha selecionada
    this.linhaCreditoSelecionadaId.set(proj.linha_credito_selecionada_id || null);

    // Preenche contato
    this.contatoMensagem = `Olá! Gostaria de uma assessoria para o projeto "${this.nomeProjeto()}" (${this.getTipoOperacaoLabel(this.tipoOperacao())}).`;

    await this.atualizarDadosCubPorEstado(proj.uf || 'SP');
    this.recalcular();
  }

  async onUfChange(novaUf: string): Promise<void> {
    this.uf.set(novaUf);
    await this.atualizarDadosCubPorEstado(novaUf);
  }

  async atualizarDadosCubPorEstado(uf: string): Promise<void> {
    this.carregandoCub.set(true);
    try {
      const cub = await this.supabaseService.obterCubEstado(uf);
      if (cub && cub.valor_m2 > 0) {
        this.valorCubEstadoAtual.set(cub.valor_m2);
        const refStr = cub.mes_referencia && cub.ano_referencia
          ? `${String(cub.mes_referencia).padStart(2, '0')}/${cub.ano_referencia}`
          : (cub.mes_ano_referencia || 'Atual');
        this.infoCubEstadoAtual.set(`Ref: ${refStr}`);
      } else {
        this.valorCubEstadoAtual.set(2650);
        this.infoCubEstadoAtual.set('Ref: Estimativa Padrão');
      }
    } catch {
      this.valorCubEstadoAtual.set(2650);
      this.infoCubEstadoAtual.set('Ref: Estimativa Padrão');
    } finally {
      this.carregandoCub.set(false);
    }
  }

  voltarParaListaProjetos(): void {
    this.projetoAtual.set(null);
    this.carregarProjetos();
  }

  async salvarProjetoAtual(): Promise<void> {
    const proj = this.projetoAtual();
    if (!proj?.id) return;

    this.salvando.set(true);
    try {
      const res = this.resultado();
      const payload = {
        nome_projeto: this.nomeProjeto(),
        nome_cliente: this.nomeCliente() || undefined,
        uf: this.uf() || 'SP',
        cidade: this.cidade() || undefined,
        endereco: this.endereco() || undefined,
        tipo_operacao: this.tipoOperacao(),
        status: this.status(),
        etapa_atual: this.etapaAtiva(),
        ambientes: this.ambientes(),
        areas_externas: this.areasExternas(),
        pavimentos: this.pavimentos(),
        area_total: this.areaTotal(),
        area_externa_total: this.areaExternaTotal(),
        valor_terreno: this.valorTerreno(),
        custo_base: this.custoBase(),
        custo_areas_externas: this.calcularCustoAreasExternas(),
        custo_total_estimado: res?.custoTotal || 0,
        percentual_entrada: this.percentualEntrada(),
        valor_entrada: res?.valorEntrada || 0,
        valor_financiavel: res?.valorFinanciavel || 0,
        taxa_juros_anual: this.taxaJurosAnual(),
        prazo_anos: this.prazoAnos(),
        sistema_amortizacao: this.sistemaAmortizacao(),
        parcela_estimada: res?.parcela || 0,
        total_pago: res?.totalPago || 0,
        tipo_renda: this.tipoRenda(),
        checklist_documentacao: this.checklistDocumentacao(),
        linha_credito_selecionada_id: this.linhaCreditoSelecionadaId(),
        tem_juros_obra: this.temJurosObra(),
        prazo_obra_meses: this.prazoObraMeses(),
        taxa_juros_obra: this.taxaJurosObra(),
        total_juros: this.getTotalJuros(),
        valor_aluguel_m2: this.valorAluguelM2(),
        itens_adicionais: this.itensAdicionais()
      };

      const { error } = await this.supabaseService.atualizarProjetoCredito(proj.id, payload);
      if (error) throw error;

      this.mensagemSucesso.set('Projeto salvo com sucesso!');
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao salvar projeto');
    } finally {
      this.salvando.set(false);
    }
  }

  async excluirProjeto(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir este projeto de crédito?')) return;

    try {
      const { error } = await this.supabaseService.excluirProjetoCredito(id);
      if (error) throw error;
      this.mensagemSucesso.set('Projeto excluído.');
      await this.carregarProjetos();
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao excluir projeto');
    }
  }

  selecionarEtapa(etapa: number): void {
    this.etapaAtiva.set(etapa);
    this.recalcular();
  }

  // --- CÁLCULOS MATEMÁTICOS DE FINANCIAMENTO ---
  recalcular(): void {
    const valorTerreno = this.tipoOperacao() !== 'construcao' ? (this.valorTerreno() || 0) : 0;
    const custoBase = this.tipoOperacao() !== 'compra_terreno' ? (this.custoBase() || 0) : 0;

    let custoAdicionais = 0;
    this.itensAdicionais().forEach(item => {
      if (item.tipo === 'percentual') {
        custoAdicionais += custoBase * (item.valor / 100);
      } else {
        custoAdicionais += item.valor;
      }
    });

    const custoAreasExternas = this.calcularCustoAreasExternas();
    const custoTotal = valorTerreno + custoBase + custoAdicionais + custoAreasExternas;

    const valorEntrada = custoTotal * (this.percentualEntrada() / 100);
    const valorFinanciavel = custoTotal - valorEntrada;

    // CONVERSÃO CORRETA DE TAXA ANUAL -> MENSAL (juros compostos)
    const taxaAnual = this.taxaJurosAnual() / 100;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const numParcelas = this.prazoAnos() * 12;

    let parcela = 0;
    if (this.sistemaAmortizacao() === 'price') {
      parcela = valorFinanciavel *
        (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) /
        (Math.pow(1 + taxaMensal, numParcelas) - 1);
    } else {
      const amortizacao = valorFinanciavel / numParcelas;
      const jurosInicial = valorFinanciavel * taxaMensal;
      parcela = amortizacao + jurosInicial;
    }

    const totalPago = valorEntrada + (parcela * numParcelas);

    this.resultado.set({
      custoTotal,
      valorEntrada,
      valorFinanciavel,
      parcela: isNaN(parcela) ? 0 : parcela,
      totalPago: isNaN(totalPago) ? 0 : totalPago
    });
  }

  calcularCustoAreasExternas(): number {
    return this.areasExternas().reduce((acc, a) => acc + (a.custo_total || 0), 0);
  }

  aplicarEstimativaCUB(): void {
    const area = this.areaTotal() || 130;
    const cubValor = this.valorCubEstadoAtual() || 2650;
    const valorSugerido = area * cubValor;
    this.custoBase.set(valorSugerido);
    this.recalcular();
    this.mensagemSucesso.set(`Custo base atualizado para R$ ${valorSugerido.toLocaleString('pt-BR')} com base no CUB/${this.uf() || 'SP'} (R$ ${cubValor.toLocaleString('pt-BR')}/m²).`);
  }

  // --- AMBIENTES ---
  onAmbienteSelecionadoChange(): void {
    const amb = this.ambientesDisponiveis.find(a => a.nome === this.novoAmbienteNome);
    if (amb) {
      if (this.novoAmbienteTamanho !== 'Personalizado') {
        const tam = amb.tamanhos[this.novoAmbienteTamanho as 'P' | 'M' | 'G'];
        this.novoAmbienteArea = tam.area;
        this.novoAmbienteDimensoes = tam.dimensoes;
      }
    }
  }

  onAmbienteTamanhoChange(): void {
    this.onAmbienteSelecionadoChange();
  }

  adicionarAmbiente(): void {
    if (this.novoAmbienteArea <= 0) return;
    const novo: AmbienteItem = {
      id: Math.random().toString(36).substring(2, 9),
      nome: this.novoAmbienteNome,
      tamanho: this.novoAmbienteTamanho,
      area: this.novoAmbienteArea,
      dimensoes: this.novoAmbienteDimensoes || `${this.novoAmbienteArea} m²`
    };
    this.ambientes.update(arr => [...arr, novo]);
    this.recalcular();
  }

  removerAmbiente(id: string): void {
    this.ambientes.update(arr => arr.filter(a => a.id !== id));
    this.recalcular();
  }

  // --- ÁREAS EXTERNAS ---
  adicionarAreaExterna(): void {
    if (this.novaAreaMetragem <= 0) return;
    const tipoObj = this.areasExternasTipos.find(t => t.tipo === this.novaAreaTipo);
    const custo_m2 = tipoObj ? tipoObj.custo_m2 : 500;
    const nova: AreaExternaItem = {
      id: Math.random().toString(36).substring(2, 9),
      tipo: this.novaAreaTipo,
      area: this.novaAreaMetragem,
      custo_m2,
      custo_total: this.novaAreaMetragem * custo_m2
    };
    this.areasExternas.update(arr => [...arr, nova]);
    this.recalcular();
  }

  removerAreaExterna(id: string): void {
    this.areasExternas.update(arr => arr.filter(a => a.id !== id));
    this.recalcular();
  }

  // --- ITENS ADICIONAIS ---
  adicionarItemAdicional(): void {
    if (!this.novoItemNome.trim() || this.novoItemValor <= 0) return;
    const novo: ItemAdicional = {
      id: Math.random().toString(36).substring(2, 9),
      nome: this.novoItemNome.trim(),
      tipo: this.novoItemTipo,
      valor: this.novoItemValor
    };
    this.itensAdicionais.update(arr => [...arr, novo]);
    this.novoItemNome = '';
    this.novoItemValor = 0;
    this.recalcular();
  }

  removerItemAdicional(id: string): void {
    this.itensAdicionais.update(arr => arr.filter(i => i.id !== id));
    this.recalcular();
  }

  // --- DOCUMENTOS ---
  getDocumentosAtuais(): any[] {
    const base = [...DOCUMENTOS_BASE];
    if (this.tipoRenda() === 'clt') {
      return [...base, ...DOCUMENTOS_CLT];
    } else if (this.tipoRenda() === 'autonomo') {
      return [...base, ...DOCUMENTOS_AUTONOMO];
    } else {
      return [...base, ...DOCUMENTOS_EMPRESARIO];
    }
  }

  isDocumentoMarcado(id: string): boolean {
    return this.checklistDocumentacao().includes(id);
  }

  toggleDocumento(id: string): void {
    this.checklistDocumentacao.update(arr => {
      if (arr.includes(id)) {
        return arr.filter(i => i !== id);
      } else {
        return [...arr, id];
      }
    });
  }

  totalDocsObrigatorios(): number {
    return this.getDocumentosAtuais().filter(d => d.obrigatorio).length;
  }

  totalDocsObrigatoriosMarcados(): number {
    const obrigatorios = this.getDocumentosAtuais().filter(d => d.obrigatorio).map(d => d.id);
    return this.checklistDocumentacao().filter(id => obrigatorios.includes(id)).length;
  }

  percentualDocumentacao(): number {
    const total = this.totalDocsObrigatorios();
    if (total === 0) return 100;
    return Math.min(100, (this.totalDocsObrigatoriosMarcados() / total) * 100);
  }

  // --- LINHAS DE CRÉDITO ---
  filtrarLinhasElegiveis(): any[] {
    return this.linhasCredito().filter(linha => {
      const rendaOk = !linha.renda_minima || !this.rendaFamiliar || (this.rendaFamiliar >= linha.renda_minima);
      const idadeOk = !linha.idade_maxima || !this.idadeSolicitante || (this.idadeSolicitante <= linha.idade_maxima);
      return rendaOk && idadeOk;
    });
  }

  calcularParcelaLinha(linha: any): number {
    const res = this.resultado();
    if (!res || !res.valorFinanciavel) return 0;

    const taxaAnual = (linha.taxa_juros_min || 9.5) / 100;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const numParcelas = (linha.prazo_max_anos || this.prazoAnos() || 25) * 12;
    const valorFinanciavel = res.valorFinanciavel;

    if (linha.sistema_amortizacao && linha.sistema_amortizacao.includes('SAC')) {
      const amortizacao = valorFinanciavel / numParcelas;
      const jurosInicial = valorFinanciavel * taxaMensal;
      return amortizacao + jurosInicial;
    } else {
      return valorFinanciavel *
        (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) /
        (Math.pow(1 + taxaMensal, numParcelas) - 1);
    }
  }

  selecionarLinhaCredito(id: string): void {
    this.linhaCreditoSelecionadaId.set(id);
    const linha = this.linhasCredito().find(l => l.id === id);
    if (linha) {
      if (linha.taxa_juros_min) {
        this.taxaJurosAnual.set(linha.taxa_juros_min);
      }
      if (linha.prazo_max_anos) {
        this.prazoAnos.set(linha.prazo_max_anos);
      }
      this.recalcular();
    }
  }

  // --- SIMULAÇÃO AVANÇADA DETALHADA ---
  calcularParcelasDetalhadas(): ParcelaDetalhada[] {
    const res = this.resultado();
    if (!res) return [];

    const taxaAnual = this.taxaJurosAnual() / 100;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const numParcelas = this.prazoAnos() * 12;

    let saldoDevedor = res.valorFinanciavel;
    const parcelas: ParcelaDetalhada[] = [];

    if (this.temJurosObra()) {
      const taxaAnualObra = this.taxaJurosObra() / 100;
      const jurosMensalObra = Math.pow(1 + taxaAnualObra, 1 / 12) - 1;
      for (let mes = 1; mes <= this.prazoObraMeses(); mes++) {
        const juros = saldoDevedor * jurosMensalObra;
        parcelas.push({ mes: -mes, parcela: juros, amortizacao: 0, juros, saldo: saldoDevedor, fase: 'Obra' });
      }
    }

    if (this.sistemaAmortizacao() === 'sac') {
      const amortizacao = saldoDevedor / numParcelas;
      for (let mes = 1; mes <= numParcelas; mes++) {
        const juros = saldoDevedor * taxaMensal;
        const parcela = amortizacao + juros;
        saldoDevedor -= amortizacao;
        parcelas.push({ mes, parcela, amortizacao, juros, saldo: Math.max(0, saldoDevedor), fase: 'Amortização' });
      }
    } else {
      const parcela = saldoDevedor * (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) / (Math.pow(1 + taxaMensal, numParcelas) - 1);
      for (let mes = 1; mes <= numParcelas; mes++) {
        const juros = saldoDevedor * taxaMensal;
        const amortizacao = parcela - juros;
        saldoDevedor -= amortizacao;
        parcelas.push({ mes, parcela, amortizacao, juros, saldo: Math.max(0, saldoDevedor), fase: 'Amortização' });
      }
    }

    return parcelas;
  }

  getPrimeiraParcela(): number {
    const list = this.calcularParcelasDetalhadas().filter(p => p.fase === 'Amortização');
    return list.length > 0 ? list[0].parcela : (this.resultado()?.parcela || 0);
  }

  getUltimaParcela(): number {
    const list = this.calcularParcelasDetalhadas().filter(p => p.fase === 'Amortização');
    return list.length > 0 ? list[list.length - 1].parcela : (this.resultado()?.parcela || 0);
  }

  getTotalJuros(): number {
    const list = this.calcularParcelasDetalhadas();
    return list.reduce((acc, p) => acc + p.juros, 0);
  }

  getPontosGraficoSaldo(): Array<{ mes: number; saldo: number; percentual: number }> {
    const list = this.calcularParcelasDetalhadas().filter(p => p.fase === 'Amortização');
    if (list.length === 0) return [];
    const maxSaldo = list[0].saldo || 1;
    const step = Math.max(1, Math.floor(list.length / 30));
    const amostra: Array<{ mes: number; saldo: number; percentual: number }> = [];

    for (let i = 0; i < list.length; i += step) {
      const p = list[i];
      amostra.push({
        mes: p.mes,
        saldo: p.saldo,
        percentual: Math.max(5, (p.saldo / maxSaldo) * 100)
      });
    }
    return amostra;
  }

  getAmostraParcelas(): ParcelaDetalhada[] {
    const list = this.calcularParcelasDetalhadas();
    if (list.length <= 12) return list;
    // Pega as 6 primeiras e as 3 últimas
    const primeiras = list.slice(0, 6);
    const ultimas = list.slice(-3);
    return [...primeiras, ...ultimas];
  }

  recalcularComparacaoAluguel(): void {
    // Recomputa dinamicamente via template
  }

  // --- AGENDAMENTO ---
  gerarWhatsappLink(): string {
    return gerarLinkWhatsapp('viabiliza-ia');
  }

  async enviarSolicitacaoAssessoria(): Promise<void> {
    const proj = this.projetoAtual();
    if (!proj?.id) return;
    if (!this.contatoNome || !this.contatoEmail || !this.contatoTelefone) {
      this.mensagemErro.set('Preencha nome, e-mail e telefone para agendamento.');
      return;
    }

    this.enviandoSolicitacao.set(true);
    try {
      const { error } = await this.supabaseService.solicitarAssessoriaCredito({
        projetoId: proj.id,
        nome: this.contatoNome,
        email: this.contatoEmail,
        telefone: this.contatoTelefone,
        mensagem: this.contatoMensagem || `Interesse no projeto ${this.nomeProjeto()}`
      });

      if (error) throw error;

      this.supabaseService.registrarAtividadeDiaria('agente_ia');
      this.solicitacaoEnviada.set(true);
      this.mensagemSucesso.set('Solicitação enviada com sucesso!');
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao enviar solicitação');
    } finally {
      this.enviandoSolicitacao.set(false);
    }
  }

  getTipoOperacaoLabel(tipo: string): string {
    switch (tipo) {
      case 'compra_terreno': return 'Compra de Terreno';
      case 'compra_construcao': return 'Terreno + Construção';
      case 'construcao': return 'Construção (Terreno Próprio)';
      default: return 'Crédito Imobiliário';
    }
  }
}
