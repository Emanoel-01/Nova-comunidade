import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, DocumentoCredito } from '../../../services/supabase.service';
import { MotorPdfService } from '../../services/motor-pdf.service';
import { gerarLinkWhatsapp } from '../../utils/whatsapp.util';
import { carregarLogoComFallback } from '../../utils/pdf-logo.util';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface AmbienteItem {
  id: string;
  nome: string;
  tamanho: 'P' | 'M' | 'G' | 'Personalizado';
  area: number;
  dimensoes: string;
  coeficienteEquivalencia: number; // 0 a 1, editável pelo profissional conforme NBR 12721
  areaEquivalente: number; // computado: area * coeficienteEquivalencia
}

export interface MacroetapaOrcamento {
  id: string;
  nome: string;
  percentualPadrao: number; // sugestão inicial, editável
  percentualAjustado: number; // o que o profissional efetivamente usa
  valorEstimado: number; // computado: custoBase * (percentualAjustado / 100)
}

export interface ParcelaObraCurvaS {
  mes: number;
  macroetapaPredominante: string; // nome da macroetapa daquele mês
  percentualFisicoMes: number;
  percentualAcumulado: number;
  liberacaoMes: number; // valor liberado naquele mês
  saldoLiberadoAcumulado: number;
  encargoMes: number; // juros sobre saldo liberado + MIP + DFI + taxa adm
  retidoGarantia: boolean; // true apenas no último mês
}

export interface MemorialDescritivo {
  padraoAcabamento: 'baixo' | 'normal' | 'alto';
  sistemaConstrutivo: string; // ex: "Alvenaria convencional", "Light Steel Framing"
  fundacao: string;
  estrutura: string;
  vedacoes: string;
  cobertura: string;
  impermeabilizacao: string;
  instalacoesHidraulicas: string;
  instalacoesEletricas: string;
  revestimentosInternos: string;
  revestimentosExternos: string;
  esquadrias: string;
  pintura: string;
  conformidadeNbr15575: boolean; // desempenho acústico/térmico/lumínico
  conformidadeNbr9575: boolean; // impermeabilização
  observacoesAdicionais: string;
}

export const MACROETAPAS_CONSTRUCAO: Omit<MacroetapaOrcamento, 'valorEstimado' | 'percentualAjustado'>[] = [
  { id: '1', nome: 'Serviços preliminares e fundações', percentualPadrao: 10.3 },
  { id: '2', nome: 'Estrutura resistente', percentualPadrao: 22.2 },
  { id: '3', nome: 'Alvenarias e vedações', percentualPadrao: 13.6 },
  { id: '4', nome: 'Cobertura e impermeabilização', percentualPadrao: 12.9 },
  { id: '5', nome: 'Instalações prediais', percentualPadrao: 11.1 },
  { id: '6', nome: 'Revestimentos internos', percentualPadrao: 9.2 },
  { id: '7', nome: 'Revestimentos externos e esquadrias', percentualPadrao: 7.3 },
  { id: '8', nome: 'Pintura, louças e metais', percentualPadrao: 9.7 },
  { id: '9', nome: 'Limpeza e conclusão', percentualPadrao: 3.7 }
];

export const MACROETAPAS_CONDOMINIO: Omit<MacroetapaOrcamento, 'valorEstimado' | 'percentualAjustado'>[] = [
  { id: '1', nome: 'Reparo e recuperação de fachada', percentualPadrao: 25 },
  { id: '2', nome: 'Impermeabilização (coberturas, lajes, áreas molhadas)', percentualPadrao: 20 },
  { id: '3', nome: 'Substituição de prumadas hidráulicas', percentualPadrao: 20 },
  { id: '4', nome: 'Instalações elétricas e modernização de elevadores', percentualPadrao: 15 },
  { id: '5', nome: 'Pintura geral e acabamentos de áreas comuns', percentualPadrao: 12 },
  { id: '6', nome: 'Outros (portaria remota, energia solar, diversos)', percentualPadrao: 8 }
];

export function criarMemorialDescritivoPadrao(): MemorialDescritivo {
  return {
    padraoAcabamento: 'normal',
    sistemaConstrutivo: 'Alvenaria convencional',
    fundacao: 'Sapatas isoladas / Radier em concreto armado conforme sondagem geotécnica',
    estrutura: 'Pilares, vigas e lajes maciças/treliçadas em concreto armado',
    vedacoes: 'Alvenaria em blocos cerâmicos furados com argamassa mista de assentamento',
    cobertura: 'Estrutura metálica/madeira de lei com telhas termoacústicas ou cerâmicas e rufos galvanizados',
    impermeabilizacao: 'Manta asfáltica e emulsão acrílica elastomérica em baldrames, lajes e áreas molháveis',
    instalacoesHidraulicas: 'Tubulações e conexões em PVC e PPR com reservatório superior dimensionado',
    instalacoesEletricas: 'Eletrodutos antichama, condutores de cobre dimensionados com dispositivos DR e DPS',
    revestimentosInternos: 'Porcelanato / Cerâmica retificada em áreas molhadas, reboco e gesso liso',
    revestimentosExternos: 'Textura acrílica hidrorrepelente com detalhes em pedra natural ou porcelanato',
    esquadrias: 'Alumínio com pintura eletrostática preta/branca e vidros temperados',
    pintura: 'Tinta acrílica fosca/lavável de primeira linha sobre massa corrida/acrílica',
    conformidadeNbr15575: true,
    conformidadeNbr9575: true,
    observacoesAdicionais: ''
  };
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

export interface ResultadoElegibilidade {
  linhaId: string;
  banco: string;
  produto: string;
  nome_produto?: string;
  compativel: boolean;
  dadosIncompletos: boolean;
  camposFaltantes: string[];
  motivosIncompatibilidade: string[];
  taxaJurosMin: number | null;
  taxaJurosMax: number | null;
  prazoMaxAnos: number | null;
  percentualFinanciamentoMax: number | null;
  faixaFinanciamentoEstimada: { min: number; max: number } | null;
  parcelaEstimada: number | null;
  sistemaAmortizacao: string;
  permiteFgts: boolean;
  vantagemPrincipal: string;
  gargalosOperacionais: string;
  notaFonte: string;
  dataReferencia: string;
  fonteUrl: string;
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

const DOCUMENTOS_REFORMA_PF = [
  { id: 'matricula_reforma', nome: 'Matrícula Atualizada do Imóvel a Reformar', descricao: 'Certidão de matrícula demonstrando regularidade do imóvel existente', obrigatorio: true },
  { id: 'prm_banco', nome: 'Proposta de Reforma e Melhoria (PRM)', descricao: 'Formulário técnico PRM (Caixa) ou equivalente da instituição financeira', obrigatorio: true },
  { id: 'art_rrt_reforma', nome: 'ART / RRT de Execução da Reforma', descricao: 'Anotação/Registro de Responsabilidade Técnica da obra de reforma', obrigatorio: true },
  { id: 'projeto_reforma_ampliacao', nome: 'Projeto Arquitetônico Aprovado (Ampliação)', descricao: 'Exigido pelos bancos e prefeituras caso haja acréscimo de área construída', obrigatorio: false },
  { id: 'alvara_ampliacao', nome: 'Alvará de Reforma / Ampliação', descricao: 'Licença municipal (obrigatória somente se houver ampliação de área construída)', obrigatorio: false },
];

const DOCUMENTOS_CONDOMINIO = [
  { id: 'laudo_inspecao_nbr16747', nome: 'Laudo de Inspeção Predial (ABNT NBR 16747)', descricao: 'Laudo técnico com mapeamento de anomalias, graus de risco e diretrizes de intervenção', obrigatorio: true },
  { id: 'art_rrt_condominio', nome: 'ART / RRT do Laudo e Execução da Obra', descricao: 'Anotação técnica devidamente quitada pelo engenheiro/arquiteto responsável', obrigatorio: true },
  { id: 'planilha_orcamentaria_condominio', nome: 'Planilha Orçamentária Detalhada (SINAPI/CUB)', descricao: 'Cronograma físico-financeiro e composição de insumos da obra', obrigatorio: true },
  { id: 'ata_age_aprovacao', nome: 'Ata da Assembleia Geral Extraordinária (AGE)', descricao: 'Ata registrada em cartório aprovando a contratação do crédito e a realização da obra', obrigatorio: true },
  { id: 'convencao_regimento', nome: 'Convenção Condominial e Regimento Interno', descricao: 'Comprovação jurídica da constituição e representatividade do condomínio', obrigatorio: true },
  { id: 'balancetes_arrecadacao', nome: 'Balancetes e Extratos de Arrecadação (12 meses)', descricao: 'Histórico financeiro, inadimplência e capacidade de arrecadação do condomínio', obrigatorio: true },
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

                      <div class="flex flex-col items-end gap-1">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                          {{ proj.status || 'Rascunho' }}
                        </span>
                      </div>
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

          <!-- Barra de Navegação das Etapas 1-7 -->
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
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">
                        {{ tipoOperacao() === 'condominio' ? 'Nome do Condomínio / Síndico / Gestor' : 'Nome do Cliente' }}
                      </label>
                      <input
                        type="text"
                        [value]="nomeCliente()"
                        (input)="nomeCliente.set($any($event.target).value)"
                        class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                        [placeholder]="tipoOperacao() === 'condominio' ? 'Ex: Condomínio Edifício Solar das Palmeiras' : 'Ex: Dr. Roberto Silva'"
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
                } @else if (tipoOperacao() === 'condominio') {
                  <div class="space-y-6">
                    <div class="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">🏢</span>
                        <div>
                          <h3 class="text-base font-bold text-blue-950">Diagnóstico Operacional e Financeiro do Condomínio</h3>
                          <p class="text-xs text-blue-900/80">Dados cadastrais de fluxo de caixa e escopo técnico da intervenção predial</p>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Arrecadação Mensal das Cotas (R$)</label>
                          <input
                            type="number"
                            [value]="arrecadacaoMensalCondominio() || ''"
                            (input)="arrecadacaoMensalCondominio.set(+$any($event.target).value || 0); recalcular()"
                            placeholder="Ex: 45000"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-800"
                          />
                          <span class="text-[10px] text-slate-400">Total arrecadado com taxa condominial ordinária</span>
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Taxa Histórica de Inadimplência (%)</label>
                          <input
                            type="number"
                            [value]="percentualInadimplenciaCondominio() || ''"
                            (input)="percentualInadimplenciaCondominio.set(+$any($event.target).value || 0)"
                            placeholder="Ex: 8.5"
                            step="0.1"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-800"
                          />
                          <span class="text-[10px] text-slate-400">Bancos costumam exigir inadimplência inferior a 12-15%</span>
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Valor da Obra no Laudo NBR 16747 (R$)</label>
                          <input
                            type="number"
                            [value]="valorObraIndicadoLaudo() || ''"
                            (input)="valorObraIndicadoLaudo.set(+$any($event.target).value || 0)"
                            placeholder="Ex: 280000"
                            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-800"
                          />
                          <span class="text-[10px] text-slate-400">Custo estimado apurado no Laudo de Inspeção Predial</span>
                        </div>
                      </div>

                      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-blue-200/80">
                        <div class="text-xs text-blue-900 leading-relaxed">
                          <strong>Intervenção Selecionada:</strong> {{ tipoIntervencao() === 'manutencao_predial' ? 'Manutenção Predial / Retrofit / Fachada' : (tipoIntervencao() === 'ampliacao_com_area_nova' ? 'Ampliação de Área de Lazer / Estruturas Novas' : 'Obras em Áreas Comuns (sem ampliação)') }}
                        </div>

                        <button
                          type="button"
                          (click)="adotarValorLaudoComoObra()"
                          [disabled]="!valorObraIndicadoLaudo() || valorObraIndicadoLaudo() <= 0"
                          class="px-4 py-2 rounded-xl bg-[#132A41] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span>⚙️</span>
                          <span>Adotar Valor do Laudo no Orçamento</span>
                        </button>
                      </div>
                    </div>

                    <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                      <span class="text-base shrink-0 mt-0.5">ℹ️</span>
                      <div class="space-y-1">
                        <strong class="font-bold block">Requisitos Regulamentares de Crédito Condominial:</strong>
                        <p class="text-[11px] text-amber-900/90 leading-relaxed">
                          Diferente de obras unifamiliares, o crédito condominial exige que o escopo físico da obra seja embasado em <strong>Laudo de Inspeção Predial (NBR 16747)</strong> com ART/RRT de engenharia, e a contratação do financiamento aprovada em <strong>Assembleia Geral Extraordinária (AGE)</strong> com quórum qualificado conforme convenção.
                        </p>
                      </div>
                    </div>

                    <div class="flex justify-end pt-4">
                      <button
                        type="button"
                        (click)="selecionarEtapa(2)"
                        class="px-6 py-2.5 rounded-xl bg-[#B5642A] hover:bg-[#9E5522] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                      >
                        <span>Avançar para Quanto Custa</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 class="text-lg font-black text-slate-800">
                          {{ tipoOperacao() === 'reforma_pf' ? '1. Ambientes a Reformar / Ampliar & Pavimentos' : '1. Ambientes Internos & Pavimentos' }}
                        </h3>
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

                    @if (aplicaAreaEquivalente()) {
                      <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div class="space-y-0.5">
                          <div class="flex items-center gap-2 font-bold text-indigo-900">
                            <span>📐</span>
                            <span>Cálculo de Área Equivalente Conforme ABNT NBR 12721</span>
                          </div>
                          <p class="text-[11px] text-indigo-900/80 leading-relaxed">
                            Área equivalente é a base de cálculo do orçamento indexado ao CUB — pondera espaços cobertos, descobertos e de padrão diferenciado em relação à área real.
                          </p>
                        </div>
                        <div class="flex items-center gap-2.5 shrink-0">
                          <span class="text-[11px] text-slate-600 font-medium">Real: <strong>{{ areaTotal() }} m²</strong></span>
                          <span class="text-slate-300">|</span>
                          <span class="text-xs font-black text-indigo-800 bg-white px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">
                            Equivalente: {{ areaEquivalenteTotal().toFixed(2) }} m²
                          </span>
                        </div>
                      </div>
                    }

                    <!-- Formulário de Adicionar Ambiente -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        + Adicionar Ambiente
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div class="sm:col-span-2">
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
                          <label class="block text-[11px] font-bold text-slate-600 mb-1">Área Real (m²)</label>
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
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
                        <span>Ambientes Cadastrados ({{ ambientes().length }})</span>
                        <div class="flex items-center gap-3">
                          <span class="text-slate-600">Área Real: <strong>{{ areaTotal() }} m²</strong></span>
                          @if (aplicaAreaEquivalente()) {
                            <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                              Área Equivalente NBR 12721: <strong>{{ areaEquivalenteTotal().toFixed(2) }} m²</strong>
                            </span>
                          }
                        </div>
                      </div>

                      @if (ambientes().length === 0) {
                        <div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          Nenhum ambiente adicionado ainda. Escolha acima e clique em Adicionar.
                        </div>
                      } @else {
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          @for (amb of ambientes(); track amb.id; let idx = $index) {
                            <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-2">
                              <div class="flex items-start justify-between gap-2">
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

                              @if (aplicaAreaEquivalente()) {
                                <div class="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                  <div class="flex items-center gap-1.5">
                                    <span class="text-slate-500 font-medium">Coef. NBR:</span>
                                    <input
                                      type="number"
                                      step="0.025"
                                      min="0"
                                      max="1"
                                      [value]="amb.coeficienteEquivalencia !== undefined ? amb.coeficienteEquivalencia : 1.0"
                                      (input)="atualizarCoeficienteAmbiente(amb.id, +$any($event.target).value)"
                                      class="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-slate-800 font-bold text-center bg-slate-50"
                                      title="Coeficiente de equivalência conforme NBR 12721 (Padrão 1.0, Garagem 0.5, Varanda 0.75)"
                                    />
                                  </div>
                                  <div class="text-indigo-700 font-black">
                                    {{ (amb.areaEquivalente !== undefined ? amb.areaEquivalente : (amb.area * (amb.coeficienteEquivalencia || 1))).toFixed(2) }} m² eq.
                                  </div>
                                </div>
                              }
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

                    <!-- PEÇA TÉCNICA 4: MEMORIAL DESCRITIVO (NBR 15575 / CEF) -->
                    @if (aplicaMemorialDescritivo()) {
                      <div class="pt-6 border-t border-slate-100 space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white">
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="text-sm">📋</span>
                              <h4 class="text-sm font-black tracking-wide">Memorial Descritivo de Materiais e Acabamentos</h4>
                              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                ABNT NBR 15575 / CEF
                              </span>
                            </div>
                            <p class="text-[11px] text-slate-300 mt-0.5">
                              Especificações técnicas exigidas pelas instituições financeiras para validação da garantia e avaliação do imóvel
                            </p>
                          </div>
                          <button
                            type="button"
                            (click)="toggleMemorialDescritivo()"
                            class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
                          >
                            {{ memorialDescritivoAberto() ? 'Ocultar Detalhes ▲' : 'Expandir Especificações ▼' }}
                          </button>
                        </div>

                        @if (memorialDescritivoAberto()) {
                          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
                            <!-- Padrão de Acabamento & Sistema Construtivo -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                              <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Padrão Geral de Acabamento</label>
                                <select
                                  [value]="memorialDescritivo().padraoAcabamento"
                                  (change)="atualizarCampoMemorial('padraoAcabamento', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                                >
                                  <option value="Baixo">Baixo (Popular / R-1B)</option>
                                  <option value="Normal">Normal (Médio Padrão / R-1N)</option>
                                  <option value="Alto">Alto (Alto Padrão / R-1A)</option>
                                </select>
                                <span class="text-[10px] text-slate-400">Classificação conforme ABNT NBR 12721</span>
                              </div>

                              <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Sistema Construtivo Principal</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().sistemaConstrutivo"
                                  (input)="atualizarCampoMemorial('sistemaConstrutivo', $any($event.target).value)"
                                  placeholder="Ex: Alvenaria convencional em blocos cerâmicos"
                                  list="sistemasConstrutivosList"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-semibold"
                                />
                                <datalist id="sistemasConstrutivosList">
                                  <option value="Alvenaria convencional (concreto armado e blocos cerâmicos)">
                                  <option value="Alvenaria Estrutural (blocos de concreto)">
                                  <option value="Light Steel Framing (LSF com DATec)">
                                  <option value="Wood Frame (estruturas de madeira tratada com DATec)">
                                  <option value="Estrutura Metálica com vedações leves">
                                  <option value="Paredes de Concreto Moldadas in loco">
                                </datalist>
                                <span class="text-[10px] text-slate-400">Estrutura e fechamento vertical</span>
                              </div>
                            </div>

                            <!-- Aviso Regulatório SiNAT / DATec se sistema não convencional -->
                            @if (sistemaIndustrializadoAviso()) {
                              <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                                <span class="text-base shrink-0">⚠️</span>
                                <div class="space-y-1">
                                  <strong class="font-bold">Aviso Regulatório SiNAT / PBQP-H:</strong>
                                  <p class="text-[11px] text-amber-900/90 leading-relaxed">
                                    Sistemas construtivos inovadores (como Light Steel Framing ou Wood Frame) exigem <strong>Documento de Avaliação Técnica (DATec)</strong> ativo emitido por Instituição Técnica Avaliadora (ITA) para homologação de garantia e aprovação do financiamento perante a CEF e demais bancos.
                                  </p>
                                </div>
                              </div>
                            }

                            <!-- Especificações Técnicas de Materiais -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Fundação</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().fundacao"
                                  (input)="atualizarCampoMemorial('fundacao', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Estrutura</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().estrutura"
                                  (input)="atualizarCampoMemorial('estrutura', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Alvenaria e Vedações</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().vedacoes"
                                  (input)="atualizarCampoMemorial('vedacoes', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Cobertura e Telhado</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().cobertura"
                                  (input)="atualizarCampoMemorial('cobertura', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Impermeabilização (NBR 9575)</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().impermeabilizacao"
                                  (input)="atualizarCampoMemorial('impermeabilizacao', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Esquadrias (Portas / Janelas)</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().esquadrias"
                                  (input)="atualizarCampoMemorial('esquadrias', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Revestimentos Internos / Pisos</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().revestimentosInternos"
                                  (input)="atualizarCampoMemorial('revestimentosInternos', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Revestimentos Externos / Fachada</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().revestimentosExternos"
                                  (input)="atualizarCampoMemorial('revestimentosExternos', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Pintura e Tratamentos</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().pintura"
                                  (input)="atualizarCampoMemorial('pintura', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Instalações Hidrossanitárias</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().instalacoesHidraulicas"
                                  (input)="atualizarCampoMemorial('instalacoesHidraulicas', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Instalações Elétricas / Cabeamento</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().instalacoesEletricas"
                                  (input)="atualizarCampoMemorial('instalacoesEletricas', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>

                              <div>
                                <label class="block text-[11px] font-bold text-slate-700 mb-1">Louças e Metais Sanitários</label>
                                <input
                                  type="text"
                                  [value]="memorialDescritivo().loucasEMetais"
                                  (input)="atualizarCampoMemorial('loucasEMetais', $any($event.target).value)"
                                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                                />
                              </div>
                            </div>

                            <!-- Declarações de Conformidade Técnica Normativa -->
                            <div class="pt-4 border-t border-slate-100 space-y-2">
                              <div class="text-xs font-bold text-slate-800">Conformidade e Diretrizes Normativas</div>
                              
                              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
                                  <input
                                    type="checkbox"
                                    [checked]="memorialDescritivo().conformidadeNbr15575"
                                    (change)="atualizarCampoMemorial('conformidadeNbr15575', $any($event.target).checked)"
                                    class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span class="text-xs text-slate-700 leading-snug">
                                    <strong>ABNT NBR 15575:</strong> Edificações habitacionais — Desempenho (térmico, acústico, lumínico e durabilidade).
                                  </span>
                                </label>

                                <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors">
                                  <input
                                    type="checkbox"
                                    [checked]="memorialDescritivo().conformidadeNbr9575"
                                    (change)="atualizarCampoMemorial('conformidadeNbr9575', $any($event.target).checked)"
                                    class="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span class="text-xs text-slate-700 leading-snug">
                                    <strong>ABNT NBR 9575:</strong> Impermeabilização — Seleção e projeto de sistemas estanques para fundações e áreas molhadas.
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Navegação da Etapa -->
                    <div class="pt-6 border-t border-slate-100 flex items-center justify-end">
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

                    <!-- PEÇA TÉCNICA 2: ORÇAMENTO POR MACROETAPA (SINAPI / NBR 16747) -->
                    @if (tipoOperacao() !== 'compra_terreno' && custoBase() > 0) {
                      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="text-sm">📊</span>
                              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Orçamento por Macroetapa da Obra
                              </h4>
                            </div>
                            <p class="text-[11px] text-slate-500">
                              {{ tipoOperacao() === 'condominio' ? 'Pesos por frente de recuperação e manutenção predial conforme laudo técnico' : 'Distribuição de pesos percentuais de referência SINAPI / Caixa Econômica Federal' }}
                            </p>
                          </div>

                          <div class="flex items-center gap-2">
                            <button
                              type="button"
                              (click)="restaurarMacroetapasPadrao()"
                              class="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                              title="Restaurar percentuais para as referências padronizadas"
                            >
                              Restaurar Padrão
                            </button>
                          </div>
                        </div>

                        <!-- Barra de Status da Soma dos Percentuais -->
                        <div
                          class="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          [class]="macroetapasSomaCem() ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'"
                        >
                          <div class="flex items-center gap-2">
                            <span class="text-base">{{ macroetapasSomaCem() ? '✓' : '⚠️' }}</span>
                            <span class="font-bold">
                              Soma dos Pesos: {{ totalPercentualMacroetapas().toFixed(1) }}%
                            </span>
                            @if (!macroetapasSomaCem()) {
                              <span class="text-[11px] font-medium text-amber-900">
                                (Diferença de {{ (100 - totalPercentualMacroetapas()).toFixed(1) }}% para fechar em 100%)
                              </span>
                            }
                          </div>
                          <div class="font-bold text-slate-800">
                            Total Alocado: {{ totalValorMacroetapas() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                          </div>
                        </div>

                        <!-- Tabela / Lista de Macroetapas -->
                        <div class="overflow-x-auto rounded-xl border border-slate-200">
                          <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <tr>
                                <th class="p-2.5">Macroetapa</th>
                                <th class="p-2.5 text-center w-24">Ref. Padrão</th>
                                <th class="p-2.5 text-center w-28">Peso Ajustado</th>
                                <th class="p-2.5 text-right w-36">Valor Estimado</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                              @for (etapa of macroetapas(); track etapa.id) {
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                  <td class="p-2.5 font-semibold text-slate-800">
                                    {{ etapa.nome }}
                                  </td>
                                  <td class="p-2.5 text-center text-slate-400 font-medium">
                                    {{ etapa.percentualPadrao }}%
                                  </td>
                                  <td class="p-2.5 text-center">
                                    <div class="inline-flex items-center gap-1">
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="100"
                                        [value]="etapa.percentualAjustado"
                                        (input)="atualizarPercentualMacroetapa(etapa.id, +$any($event.target).value)"
                                        class="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-xs font-bold text-slate-800 text-center bg-white"
                                      />
                                      <span class="text-slate-500 font-bold">%</span>
                                    </div>
                                  </td>
                                  <td class="p-2.5 text-right font-black text-slate-900">
                                    {{ etapa.valorEstimado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <div class="text-[11px] text-slate-500 italic">
                          A decomposição orçamentária por macroetapa baliza as medições físicas mensais do perito credenciado pelo banco para liberação das parcelas da fase de obra.
                        </div>
                      </div>
                    }

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
                    <h3 class="text-lg font-black text-slate-800">
                      {{ tipoOperacao() === 'condominio' ? '3. Checklist de Documentação Condominial' : (tipoOperacao() === 'reforma_pf' ? '3. Checklist de Documentação: Reforma / Ampliação' : '3. Checklist de Documentação Bancária') }}
                    </h3>
                    <p class="text-xs text-slate-500">
                      {{ tipoOperacao() === 'condominio' ? 'Organize os documentos institucionais, jurídicos, financeiros e técnicos exigidos pelos agentes financeiros' : 'Organize os documentos exigidos pelos bancos de acordo com o regime de renda' }}
                    </p>
                  </div>

                  <!-- Seletor de Tipo de Renda / Perfil -->
                  @if (tipoOperacao() !== 'condominio') {
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
                  } @else {
                    <div class="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-900 flex items-center gap-2">
                      <span>🏢</span>
                      <span>Tomador: Condomínio Edilício (PJ)</span>
                    </div>
                  }
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
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-black text-slate-800">Documentos Gerais & Específicos</h4>
                    <span class="text-xs text-slate-500">
                      {{ documentosEnviados().length }} arquivo(s) anexado(s)
                    </span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (doc of getDocumentosAtuais(); track doc.id) {
                      <div class="p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs"
                        [class.bg-emerald-50/70]="isDocumentoMarcado(doc.id) || !!obterDocumentoEnviado(doc.id)"
                        [class.border-emerald-300]="isDocumentoMarcado(doc.id) || !!obterDocumentoEnviado(doc.id)"
                        [class.bg-white]="!isDocumentoMarcado(doc.id) && !obterDocumentoEnviado(doc.id)"
                        [class.border-slate-200]="!isDocumentoMarcado(doc.id) && !obterDocumentoEnviado(doc.id)"
                      >
                        <div class="flex items-start gap-3">
                          <input
                            type="checkbox"
                            [checked]="isDocumentoMarcado(doc.id) || !!obterDocumentoEnviado(doc.id)"
                            (change)="toggleDocumento(doc.id)"
                            class="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            id="chk-doc-{{ doc.id }}"
                          />
                          <div class="space-y-0.5 flex-1">
                            <div class="flex items-center justify-between gap-2">
                              <label for="chk-doc-{{ doc.id }}" class="text-xs font-bold text-slate-800 cursor-pointer" [class.line-through]="isDocumentoMarcado(doc.id) || !!obterDocumentoEnviado(doc.id)">
                                {{ doc.nome }}
                              </label>
                              <div class="flex items-center gap-1.5 shrink-0">
                                @if (obterDocumentoEnviado(doc.id)) {
                                  <span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 flex items-center gap-1">
                                    ✓ Anexado
                                  </span>
                                }
                                @if (doc.obrigatorio) {
                                  <span class="text-[10px] font-bold text-rose-600 uppercase">Obrigatório</span>
                                } @else {
                                  <span class="text-[10px] text-slate-400">Opcional</span>
                                }
                              </div>
                            </div>
                            <p class="text-[11px] text-slate-500 leading-relaxed">{{ doc.descricao }}</p>
                          </div>
                        </div>

                        <!-- Bloco de Arquivo Anexado OU Botão de Upload -->
                        @let docAnexado = obterDocumentoEnviado(doc.id);
                        @if (docAnexado) {
                          <div class="p-2.5 rounded-xl bg-white/90 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                            <div class="flex items-center gap-2 min-w-0">
                              <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                📄
                              </div>
                              <div class="min-w-0">
                                <div class="text-[11px] font-bold text-slate-800 truncate" [title]="docAnexado.nome_arquivo">
                                  {{ docAnexado.nome_arquivo }}
                                </div>
                                <div class="text-[10px] text-slate-400">
                                  {{ formatarTamanhoBytes(docAnexado.tamanho_bytes) }} • {{ formatarData(docAnexado.enviado_em) }}
                                </div>
                              </div>
                            </div>

                            <div class="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                (click)="baixarDocumentoIndividual(docAnexado, $event)"
                                class="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Baixar arquivo"
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                (click)="excluirDocumento(docAnexado, $event)"
                                [disabled]="excluindoDocId() === docAnexado.id"
                                class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                                title="Remover arquivo"
                              >
                                @if (excluindoDocId() === docAnexado.id) {
                                  <svg class="animate-spin w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                } @else {
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                }
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span class="text-[10px] text-slate-400">PDF, JPG ou PNG até 10MB</span>
                            <div>
                              <input
                                #fileInput
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                (change)="onUploadArquivo(doc.id, $event); fileInput.value = ''"
                                class="hidden"
                              />
                              <button
                                type="button"
                                (click)="fileInput.click()"
                                [disabled]="uploadingDocId() === doc.id"
                                class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#132A41] hover:text-white text-slate-700 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                              >
                                @if (uploadingDocId() === doc.id) {
                                  <svg class="animate-spin w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Enviando...</span>
                                } @else {
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span>Anexar Arquivo</span>
                                }
                              </button>
                            </div>
                          </div>
                        }
                      </div>
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
                            @if (linha._dadosIncompletos) {
                              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                                ⚙️ Cadastro Incompleto
                              </span>
                            } @else {
                              <span class="text-xs font-bold text-[#B5642A]">{{ linha.taxa_juros_min }}% a.a.</span>
                            }
                          </div>

                          <div class="text-xs text-slate-600 font-semibold">
                            {{ linha.nome_produto }}
                          </div>

                          <!-- Parcela Estimada -->
                          <div
                            class="p-3 rounded-xl border space-y-0.5"
                            [class]="linha._dadosIncompletos ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-50 border-slate-200/80'"
                          >
                            <div class="text-[10px] uppercase font-bold text-slate-500">Parcela Estimada</div>
                            @if (linha._dadosIncompletos) {
                              <div class="text-xs font-bold text-slate-600">Cadastro incompleto no admin</div>
                              <div class="text-[10px] text-slate-500">Campos pendentes: {{ linha._camposFaltantes.join(', ') }}</div>
                            } @else {
                              <div class="text-lg font-black text-emerald-700">
                                {{ calcularParcelaLinha(linha) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}/mês
                              </div>
                              <div class="text-[10px] text-slate-400">
                                Prazo máx: {{ linha.prazo_max_anos }} anos • Até {{ linha.percentual_financiamento_max }}%
                              </div>
                            }
                          </div>

                          <!-- Badges / Tags -->
                          <div class="flex flex-wrap gap-1 text-[10px]">
                            @if (linha.tem_juros_obra) {
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

                <!-- PEÇA TÉCNICA 3: CRONOGRAMA FÍSICO-FINANCEIRO COM CURVA S (FASE DE OBRA) -->
                @if (tipoOperacao() !== 'compra_terreno' && cronogramaObra().length > 0) {
                  <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-base">📈</span>
                          <h4 class="text-sm font-black text-slate-800 uppercase tracking-wide">
                            Cronograma Físico-Financeiro & Curva S (Fase de Obra)
                          </h4>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            {{ prazoObraMeses() }} Medições Mensais
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">
                          Evolução física acumulada e desembolso gradual condicionado às medições periciais do banco
                        </p>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="gerarCronogramaCurvaS()"
                          class="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Recalcular distribuição teórica em Curva S"
                        >
                          <span>↻</span>
                          <span>Regerar Curva S Teórica</span>
                        </button>
                      </div>
                    </div>

                    <!-- Resumo Financeiro da Fase de Obra -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Total Desembolso da Obra</div>
                        <div class="text-lg font-black text-slate-900">
                          {{ totalLiberadoCurvaS() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                        <div class="text-[10px] text-slate-500">
                          {{ somaPercentualFisicoCurvaS() }}% do orçamento executado
                        </div>
                      </div>

                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Total de Encargos na Fase de Obra</div>
                        <div class="text-lg font-black text-rose-600">
                          {{ totalEncargosObra() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </div>
                        <div class="text-[10px] text-slate-500">
                          Juros sobre saldo liberado + MIP + DFI + taxa adm
                        </div>
                      </div>

                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div class="text-[10px] font-bold text-slate-400 uppercase">Retenção de Garantia (Última Medição)</div>
                        <div class="text-lg font-black text-amber-700">
                          {{ retencaoGarantiaObra() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                        <div class="text-[10px] text-slate-500">
                          5% retidos {{ textoConclusaoObra().retencao }}
                        </div>
                      </div>
                    </div>

                    <!-- Gráfico Visual da Curva S de Obra -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-slate-700">Curva S de Evolução Físico-Financeira Acumulada</span>
                        <span class="text-[11px] text-indigo-700 font-semibold">Altura da barra = % acumulado da obra</span>
                      </div>

                      <div class="w-full h-36 bg-slate-50 rounded-2xl p-3 flex items-end gap-1.5 overflow-hidden border border-slate-100 relative">
                        @for (item of cronogramaObra(); track item.mes) {
                          <div
                            class="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 rounded-t transition-all group relative cursor-pointer min-w-4"
                            [style.height.%]="Math.max(4, item.percentualAcumulado)"
                          >
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block p-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-20 shadow-xl border border-slate-800">
                              <div class="text-amber-300">Mês {{ item.mes }} • {{ item.macroetapaPredominante }}</div>
                              <div class="mt-0.5">Mês: {{ item.percentualFisicoMes }}% ({{ item.liberacaoMes | currency:'BRL':'symbol':'1.0-0':'pt-BR' }})</div>
                              <div>Acumulado: {{ item.percentualAcumulado }}%</div>
                              <div class="text-rose-300">Encargo: {{ item.encargoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
                            </div>
                          </div>
                        }
                      </div>

                      <div class="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                        <span>Mês 1 (Início dos Serviços)</span>
                        <span>Mês {{ Math.round(prazoObraMeses() / 2) }} (Pico da Obra)</span>
                        <span>Mês {{ prazoObraMeses() }} ({{ textoConclusaoObra().cronograma }})</span>
                      </div>
                    </div>

                    <!-- Tabela Completa do Cronograma Físico-Financeiro -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-700">Tabela de Medições e Encargos da Fase de Construção</span>
                        <span class="text-[11px] text-slate-400">Você pode ajustar os percentuais mensais livremente</span>
                      </div>

                      <div class="overflow-x-auto rounded-2xl border border-slate-200">
                        <table class="w-full text-left text-xs">
                          <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th class="p-2.5 w-16 text-center">Mês</th>
                              <th class="p-2.5">Macroetapa Predominante</th>
                              <th class="p-2.5 text-center w-28">Avanço Mês (%)</th>
                              <th class="p-2.5 text-center w-28">Acumulado (%)</th>
                              <th class="p-2.5 text-right w-32">Liberação (R$)</th>
                              <th class="p-2.5 text-right w-36">Saldo Liberado (R$)</th>
                              <th class="p-2.5 text-right w-32">Encargo Fase Obra</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (item of cronogramaObra(); track item.mes) {
                              <tr class="hover:bg-slate-50/70 transition-colors">
                                <td class="p-2.5 text-center font-bold text-slate-700">
                                  {{ item.mes }}
                                </td>
                                <td class="p-2.5 text-slate-800 font-medium">
                                  {{ item.macroetapaPredominante }}
                                  @if (item.retidoGarantia) {
                                    <span class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">
                                      Retenção 5%
                                    </span>
                                  }
                                </td>
                                <td class="p-2.5 text-center">
                                  <div class="inline-flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="100"
                                      [value]="item.percentualFisicoMes"
                                      (input)="atualizarPercentualCronogramaMes(item.mes, +$any($event.target).value)"
                                      class="w-16 px-1.5 py-0.5 rounded border border-slate-300 text-center font-bold text-slate-800 bg-white"
                                    />
                                    <span class="text-slate-400 font-bold">%</span>
                                  </div>
                                </td>
                                <td class="p-2.5 text-center font-semibold text-slate-600">
                                  {{ item.percentualAcumulado }}%
                                </td>
                                <td class="p-2.5 text-right font-semibold text-slate-800">
                                  {{ item.liberacaoMes | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                </td>
                                <td class="p-2.5 text-right font-medium text-slate-600">
                                  {{ item.saldoLiberadoAcumulado | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                                </td>
                                <td class="p-2.5 text-right font-bold text-rose-600">
                                  {{ item.encargoMes | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                }

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

            <!-- ETAPA 6: CONSTRUIR VS ALUGAR / VIABILIDADE CONDOMINIAL -->
            @if (etapaAtiva() === 6 && tipoOperacao() !== 'compra_terreno') {
              <div class="space-y-8">
                @if (tipoOperacao() === 'condominio') {
                  <div>
                    <h3 class="text-lg font-black text-slate-800">6. Estudo de Viabilidade Financeira do Condomínio</h3>
                    <p class="text-xs text-slate-500">Comprometimento da receita das cotas condominiais e impacto da parcela da intervenção</p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div class="text-[11px] text-slate-500 font-bold uppercase">Arrecadação Mensal</div>
                      <div class="text-xl font-black text-[#132A41]">
                        {{ (arrecadacaoMensalCondominio() || 0) | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                      </div>
                      <div class="text-[10px] text-slate-400">Cotas ordinárias/mês</div>
                    </div>

                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div class="text-[11px] text-slate-500 font-bold uppercase">Taxa de Inadimplência</div>
                      <div class="text-xl font-black" [class.text-emerald-700]="percentualInadimplenciaCondominio() <= 10" [class.text-amber-700]="percentualInadimplenciaCondominio() > 10">
                        {{ percentualInadimplenciaCondominio() || 0 }}%
                      </div>
                      <div class="text-[10px] text-slate-400">{{ percentualInadimplenciaCondominio() <= 12 ? 'Dentro da faixa bancária' : 'Atenção com exigências' }}</div>
                    </div>

                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div class="text-[11px] text-slate-500 font-bold uppercase">Parcela Mensal da Obra</div>
                      <div class="text-xl font-black text-[#B5642A]">
                        {{ resultado()?.parcela | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                      </div>
                      <div class="text-[10px] text-slate-400">Em {{ prazoAnos() * 12 }} meses</div>
                    </div>

                    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div class="text-[11px] text-slate-500 font-bold uppercase">Comprometimento da Receita</div>
                      <div class="text-xl font-black text-blue-900">
                        {{ arrecadacaoMensalCondominio() > 0 ? (((resultado()?.parcela || 0) / arrecadacaoMensalCondominio()) * 100).toFixed(1) : '0.0' }}%
                      </div>
                      <div class="text-[10px] text-slate-400">Referência de mercado — confirme faixa aceitável com a instituição financeira</div>
                    </div>
                  </div>

                  <div class="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs space-y-2">
                    <strong class="font-bold flex items-center gap-1.5 text-blue-950">
                      <span>💡</span> Indicador de Capacidade de Pagamento do Condomínio
                    </strong>
                    <p class="text-[11px] text-blue-900/90 leading-relaxed">
                      Ao financiar <strong>{{ resultado()?.valorFinanciavel | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</strong> para a execução da intervenção predial, a parcela estimada representa <strong>{{ arrecadacaoMensalCondominio() > 0 ? (((resultado()?.parcela || 0) / arrecadacaoMensalCondominio()) * 100).toFixed(1) : '0.0' }}%</strong> da receita mensal ordinária informada. Este é um indicador de referência para orientar a discussão em Assembleia — a análise de capacidade de pagamento e a aprovação da operação são feitas pela instituição financeira, com base em critérios próprios que podem não coincidir com esta estimativa.
                    </p>
                  </div>
                } @else {
                  <div>
                    <h3 class="text-lg font-black text-slate-800">
                      {{ tipoOperacao() === 'reforma_pf' ? '6. Estudo de Viabilidade: Reformar vs. Alugar / Aquisição' : '6. Estudo de Viabilidade: Construir vs. Alugar' }}
                    </h3>
                    <p class="text-xs text-slate-500">Confronte o valor gasto em aluguel no período com o custo real (com juros) de construir ou valorizar seu patrimônio</p>
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
                        <span class="text-xs font-black uppercase tracking-wider text-emerald-800">
                          {{ tipoOperacao() === 'reforma_pf' ? 'Patrimônio Reformado / Ampliado' : 'Construção Própria' }}
                        </span>
                        <span class="text-xs px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">Patrimônio</span>
                      </div>

                      <div class="space-y-1">
                        <div class="text-xs text-slate-500">Custo Total Real (Financiamento Quitado):</div>
                        <div class="text-2xl font-black text-emerald-900">
                          {{ resultado()?.totalPago | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                        </div>
                      </div>

                      <p class="text-xs text-slate-600 leading-relaxed">
                        Ao final de {{ prazoAnos() }} anos, a intervenção consolida a valorização total da edificação com plena quitação bancária.
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
                }

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
                <!-- Banner de Emissão de Relatório Consolidado e Pacote ZIP -->
                <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#132A41] to-[#1E3A5F] text-white space-y-6 shadow-lg border border-slate-700/50">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 text-xs font-black uppercase text-[#E8B27E] tracking-wider">
                        <span>📄 Motor White-Label Oficial</span>
                        <span>•</span>
                        <span>Pasta de Crédito</span>
                      </div>
                      <h3 class="text-xl sm:text-2xl font-black text-white">
                        Relatório Consolidado & Pacote de Submissão Bancária
                      </h3>
                      <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        Gere o dossiê executivo reunindo todas as 7 etapas do projeto (Projetos, Custo CUB, Documentação, Comparação Bancária, Financiamento e Construir vs Alugar) com identificação técnica do seu perfil profissional, ou baixe o pacote ZIP completo com o relatório e todos os documentos anexados.
                      </p>
                    </div>

                    <!-- Indicador de Prontidão -->
                    <div class="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-4 text-center shrink-0 min-w-[150px]">
                      <div class="text-[10px] uppercase font-bold text-slate-400">Prontidão da Pasta</div>
                      <div class="text-2xl font-black text-[#E8B27E]">
                        {{ percentualDocumentacao() }}%
                      </div>
                      <div class="text-[10px] text-slate-300">
                        {{ documentosEnviados().length }} arquivo(s) anexado(s)
                      </div>
                    </div>
                  </div>

                  <!-- GATE DE CONFORMIDADE TÉCNICA (Obrigatório para emissão da Pasta Completa) -->
                  <div class="p-5 rounded-2xl bg-white/10 border border-white/20 space-y-3">
                    <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Documentação (Etapa 3)</span>
                        <span class="text-[11px] font-black" [class]="percentualDocumentacao() === 100 ? 'text-emerald-400' : 'text-amber-300'">
                          {{ totalDocsObrigatoriosMarcados() }} de {{ totalDocsObrigatorios() }} obrigatórios
                        </span>
                      </div>
                      <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div class="h-full rounded-full transition-all"
                             [class]="percentualDocumentacao() === 100 ? 'bg-emerald-500' : 'bg-amber-400'"
                             [style.width.%]="percentualDocumentacao()">
                        </div>
                      </div>
                      @if (percentualDocumentacao() < 100) {
                        <div class="flex flex-wrap gap-1.5 pt-1">
                          @for (doc of getDocumentosPendentesObrigatorios(); track doc.id) {
                            <span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-200 border border-rose-400/30">
                              {{ doc.nome }}
                            </span>
                          }
                        </div>
                      }
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-base">🛡️</span>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider">
                          Gate de Conformidade Técnica da Pasta Completa
                        </h4>
                      </div>
                      <span
                        class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                        [class]="pastaCompletaLiberada() ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'"
                      >
                        {{ pastaCompletaLiberada() ? '✓ Pasta Liberada para Emissão' : '⚠️ Confirmação Pendente' }}
                      </span>
                    </div>

                    <p class="text-[11px] text-slate-300 leading-relaxed">
                      @if (tipoOperacao() === 'condominio') {
                        A submissão bancária condominial exige Laudo de Inspeção Predial (NBR 16747), ART/RRT quitada e Aprovação formal em Assembleia Geral Extraordinária (AGE). Confirme os 3 itens abaixo:
                      } @else if (tipoOperacao() === 'reforma_pf' && tipoIntervencao() !== 'ampliacao_com_area_nova') {
                        A submissão de reforma sem ampliação dispensa alvará municipal, exigindo a Proposta de Reforma e Melhoria (PRM / Memorial) e a respectiva ART/RRT de execução/projeto:
                      } @else {
                        A submissão bancária definitiva exige projeto aprovado, alvará de construção e anotação técnica quitada. Confirme os itens abaixo para liberar a geração do Dossiê Consolidado e do Pacote ZIP:
                      }
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      @if (tipoOperacao() === 'condominio') {
                        <!-- 1. Laudo NBR 16747 -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="laudoInspecaoConfirmado()"
                            (change)="alternarConfirmacaoGate('laudo', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">1. Laudo NBR 16747</strong>
                            <span class="text-slate-300 text-[10px]">Laudo de Inspeção Predial com memorial descritivo</span>
                          </div>
                        </label>

                        <!-- 2. ART / RRT Registrada -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="artRrtConfirmado()"
                            (change)="alternarConfirmacaoGate('art_rrt', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">2. ART / RRT Registrada</strong>
                            <span class="text-slate-300 text-[10px]">Anotação técnica emitida e quitada (CREA/CAU)</span>
                          </div>
                        </label>

                        <!-- 3. Ata de AGE Aprovada -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="ataAgeConfirmada()"
                            (change)="alternarConfirmacaoGate('ata_age', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">3. Ata de AGE Aprovada</strong>
                            <span class="text-slate-300 text-[10px]">Ata da assembleia aprovando obra e crédito</span>
                          </div>
                        </label>
                      } @else if (tipoOperacao() === 'reforma_pf' && tipoIntervencao() !== 'ampliacao_com_area_nova') {
                        <!-- 1. Formulário PRM / Laudo Técnico -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="laudoInspecaoConfirmado()"
                            (change)="alternarConfirmacaoGate('laudo', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">1. PRM / Memorial Técnico</strong>
                            <span class="text-slate-300 text-[10px]">Proposta de Reforma e Melhoria com orçamento</span>
                          </div>
                        </label>

                        <!-- 2. ART / RRT Registrada -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="artRrtConfirmado()"
                            (change)="alternarConfirmacaoGate('art_rrt', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">2. ART / RRT Registrada</strong>
                            <span class="text-slate-300 text-[10px]">Anotação técnica emitida e quitada (CREA/CAU)</span>
                          </div>
                        </label>
                      } @else {
                        <!-- Padrão: Construção Nova ou Reforma com Ampliação -->
                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="projetoAprovadoConfirmado()"
                            (change)="alternarConfirmacaoGate('projeto', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">1. Projeto Aprovado</strong>
                            <span class="text-slate-300 text-[10px]">Projeto aprovado na prefeitura com carimbo/visto</span>
                          </div>
                        </label>

                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="alvaraConfirmado()"
                            (change)="alternarConfirmacaoGate('alvara', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">2. Alvará de Construção</strong>
                            <span class="text-slate-300 text-[10px]">Alvará ou licença municipal expedido e válido</span>
                          </div>
                        </label>

                        <label class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="artRrtConfirmado()"
                            (change)="alternarConfirmacaoGate('art_rrt', $any($event.target).checked)"
                            class="w-4 h-4 rounded text-[#B5642A] mt-0.5"
                          />
                          <div class="text-[11px] leading-tight">
                            <strong class="text-white font-bold block">3. ART / RRT Registrada</strong>
                            <span class="text-slate-300 text-[10px]">Anotação técnica emitida e quitada (CREA/CAU)</span>
                          </div>
                        </label>
                      }
                    </div>

                    @if (percentualDocumentacao() < 100) {
                      <div class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-400/30 text-[11px] text-rose-200 flex items-center gap-2">
                        <span>📋</span>
                        <span>Ainda faltam {{ totalDocsObrigatorios() - totalDocsObrigatoriosMarcados() }} documento(s) obrigatório(s) na Etapa 3 (Documentação) — mesmo marcando os itens técnicos abaixo, a pasta ficará incompleta sem eles.</span>
                      </div>
                    }
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-700/60">
                    <!-- Botão 1: PDF Consolidado -->
                    <button
                      type="button"
                      (click)="gerarRelatorioConsolidadoPDF()"
                      [disabled]="gerandoPdf() || !pastaCompletaLiberada()"
                      class="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-md group"
                    >
                      @if (gerandoPdf()) {
                        <svg class="animate-spin w-5 h-5 text-[#E8B27E]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gerando Relatório PDF...</span>
                      } @else {
                        <span class="w-8 h-8 rounded-xl bg-[#B5642A] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                          📑
                        </span>
                        <div class="text-left">
                          <div class="text-xs font-black text-white">Gerar Relatório Consolidado (PDF)</div>
                          <div class="text-[10px] text-slate-300 font-normal">Dossiê White-Label das 7 etapas</div>
                        </div>
                      }
                    </button>

                    <!-- Botão 2: Gerar Pasta Completa (PDF Único) -->
                    <button
                      type="button"
                      (click)="gerarPastaCreditoPdfUnico()"
                      [disabled]="gerandoPdfUnico() || !pastaCompletaLiberada()"
                      class="p-4 rounded-2xl bg-gradient-to-r from-[#B5642A] to-[#8A4315] hover:from-[#C77234] hover:to-[#9E4D19] text-white font-black text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-md group"
                    >
                      @if (gerandoPdfUnico()) {
                        <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Costurando Pasta em PDF Único...</span>
                      } @else {
                        <span class="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                          📁
                        </span>
                        <div class="text-left">
                          <div class="text-xs font-black text-white">Gerar Pasta Completa (PDF Único)</div>
                          <div class="text-[10px] text-amber-200/90 font-normal">Dossiê + Peças + Anexos mesclados</div>
                        </div>
                      }
                    </button>

                    <!-- Botão 3: Pacote ZIP (Arquivos Separados) -->
                    <button
                      type="button"
                      (click)="baixarPacoteCompletoZip()"
                      [disabled]="gerandoZip() || !pastaCompletaLiberada()"
                      class="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-md group"
                    >
                      @if (gerandoZip()) {
                        <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Empacotando Arquivos em ZIP...</span>
                      } @else {
                        <span class="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                          📦
                        </span>
                        <div class="text-left">
                          <div class="text-xs font-black text-white">Baixar Pacote ZIP (Separado)</div>
                          <div class="text-[10px] text-slate-300 font-normal">Relatório PDF + pasta de anexos</div>
                        </div>
                      }
                    </button>
                  </div>
                </div>

                <div class="text-center max-w-2xl mx-auto space-y-2">
                  <div class="w-12 h-12 rounded-2xl bg-amber-100 text-[#B5642A] flex items-center justify-center mx-auto text-xl shadow-inner">
                    📁
                  </div>
                  <h3 class="text-xl font-black text-slate-900">Agendar Consultoria Técnica de Crédito</h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Você completou o planejamento de <strong>{{ nomeProjeto() }}</strong>. Agende agora uma consultoria técnica de viabilidade bancária para submissão aos bancos parceiros.
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
                <label class="block text-xs font-bold text-slate-700 mb-1">{{ novoProjetoTipoOperacao === 'condominio' ? 'Nome do Condomínio / Empreendimento' : 'Nome do Cliente' }}</label>
                <input
                  type="text"
                  [value]="novoProjetoNomeCliente"
                  (input)="novoProjetoNomeCliente = $any($event.target).value"
                  [placeholder]="novoProjetoTipoOperacao === 'condominio' ? 'Ex: Condomínio Edifício Solar das Palmeiras' : 'Ex: Dr. Roberto Silva'"
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

                  <label class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
                    [class.border-[#B5642A]]="novoProjetoTipoOperacao === 'reforma_pf'"
                    [class.bg-amber-50/40]="novoProjetoTipoOperacao === 'reforma_pf'"
                  >
                    <input type="radio" name="tipoOp" value="reforma_pf" [checked]="novoProjetoTipoOperacao === 'reforma_pf'" (change)="novoProjetoTipoOperacao = 'reforma_pf'" />
                    <div>
                      <div class="text-xs font-bold text-slate-800">Reforma / Ampliação PF</div>
                      <div class="text-[11px] text-slate-500">Imóvel próprio existente regularizado (com ou sem acréscimo de área)</div>
                    </div>
                  </label>

                  <label class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer"
                    [class.border-[#B5642A]]="novoProjetoTipoOperacao === 'condominio'"
                    [class.bg-amber-50/40]="novoProjetoTipoOperacao === 'condominio'"
                  >
                    <input type="radio" name="tipoOp" value="condominio" [checked]="novoProjetoTipoOperacao === 'condominio'" (change)="novoProjetoTipoOperacao = 'condominio'" />
                    <div>
                      <div class="text-xs font-bold text-slate-800">Crédito Condominial</div>
                      <div class="text-[11px] text-slate-500">Obras em áreas comuns, fachada e retrofit (amparado por Laudo NBR 16747 e AGE)</div>
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
  private readonly motorPdfService = inject(MotorPdfService);
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

  // Etapa 0: Estudo de Viabilidade Prévia de Crédito
  readonly dataNascimentoProponente = signal<string>('');
  readonly situacaoLote = signal<'a_adquirir' | 'proprio_quitado' | 'a_reformar'>('a_adquirir');
  readonly areaEstimadaEstudoPrevio = signal<number>(140);
  readonly padraoConstrutivoEstudoPrevio = signal<'Baixo' | 'Normal' | 'Alto'>('Normal');
  readonly estudoPrevioConcluido = signal<boolean>(false);
  readonly estudoPrevioGeradoEm = signal<string | null>(null);
  readonly elegibilidadeResultado = signal<ResultadoElegibilidade[]>([]);
  readonly gerandoPdfEstudoPrevio = signal<boolean>(false);

  // Gate da Pasta Completa (Etapa 7)
  readonly projetoAprovadoConfirmado = signal<boolean>(false);
  readonly alvaraConfirmado = signal<boolean>(false);
  readonly artRrtConfirmado = signal<boolean>(false);
  readonly laudoInspecaoConfirmado = signal<boolean>(false);
  readonly ataAgeConfirmada = signal<boolean>(false);

  // Campos específicos de Trilha (Frente 6: Reforma PF e Crédito Condominial)
  readonly tipoIntervencao = signal<'reforma_sem_ampliacao' | 'ampliacao_com_area_nova' | 'manutencao_predial'>('reforma_sem_ampliacao');
  readonly arrecadacaoMensalCondominio = signal<number | null>(null);
  readonly percentualInadimplenciaCondominio = signal<number | null>(null);
  readonly valorObraIndicadoLaudo = signal<number | null>(null);

  readonly pastaCompletaLiberada = computed(() => {
    if (this.tipoOperacao() === 'condominio') {
      return this.laudoInspecaoConfirmado() && this.artRrtConfirmado() && this.ataAgeConfirmada();
    }
    if (this.tipoOperacao() === 'reforma_pf' && this.tipoIntervencao() !== 'ampliacao_com_area_nova') {
      return this.artRrtConfirmado();
    }
    return this.projetoAprovadoConfirmado() && this.alvaraConfirmado() && this.artRrtConfirmado();
  });

  readonly fatorPadraoConstrutivo = computed(() => {
    switch (this.padraoConstrutivoEstudoPrevio()) {
      case 'Baixo': return 0.85;
      case 'Alto': return 1.25;
      case 'Normal':
      default: return 1.0;
    }
  });

  readonly custoObraEstudoPrevio = computed(() => {
    const area = this.areaEstimadaEstudoPrevio() || 0;
    const cub = this.valorCubEstadoAtual() || 2650;
    const fator = this.fatorPadraoConstrutivo();
    return Math.round(area * cub * fator);
  });

  readonly investimentoGlobalEstudoPrevio = computed(() => {
    const obra = this.custoObraEstudoPrevio();
    const isTerreno = this.tipoOperacao() === 'compra_terreno' || this.tipoOperacao() === 'compra_construcao';
    const terreno = isTerreno ? (this.valorTerreno() || 0) : 0;
    return obra + terreno;
  });

  readonly participacaoLoteEstudoPrevio = computed(() => {
    const global = this.investimentoGlobalEstudoPrevio();
    if (global <= 0) return 0;
    const isTerreno = this.tipoOperacao() === 'compra_terreno' || this.tipoOperacao() === 'compra_construcao';
    const terreno = isTerreno ? (this.valorTerreno() || 0) : 0;
    return terreno / global;
  });

  // Documentos e Exportação
  readonly documentosEnviados = signal<DocumentoCredito[]>([]);
  readonly carregandoDocumentos = signal(false);
  readonly uploadingDocId = signal<string | null>(null);
  readonly excluindoDocId = signal<string | null>(null);
  readonly gerandoPdf = signal(false);
  readonly gerandoZip = signal(false);
  readonly gerandoPdfUnico = signal(false);

  // Form Novo Projeto
  novoProjetoNome = '';
  novoProjetoNomeCliente = '';
  novoProjetoUf = 'SP';
  novoProjetoCidade = '';
  novoProjetoEndereco = '';
  novoProjetoTipoOperacao: 'compra_terreno' | 'compra_construcao' | 'construcao' | 'reforma_pf' | 'condominio' = 'compra_construcao';

  // Parâmetros do Projeto Ativo
  readonly nomeProjeto = signal('');
  readonly nomeCliente = signal('');
  readonly uf = signal('SP');
  readonly cidade = signal('');
  readonly endereco = signal('');
  readonly tipoOperacao = signal<'compra_terreno' | 'compra_construcao' | 'construcao' | 'reforma_pf' | 'condominio'>('compra_construcao');
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
  novoAmbienteCoeficiente = 1.0;

  novaAreaTipo = 'Piscina';
  novaAreaMetragem = 15;

  // Peça 1: Área Equivalente NBR 12721
  readonly aplicaAreaEquivalente = computed(() => {
    const op = this.tipoOperacao();
    if (op === 'compra_terreno' || op === 'compra_construcao' || op === 'construcao') {
      return true;
    }
    if (op === 'reforma_pf' && this.tipoIntervencao() === 'ampliacao_com_area_nova') {
      return true;
    }
    return false;
  });

  readonly areaEquivalenteTotal = computed(() => {
    return this.ambientes().reduce((acc, a) => {
      const coef = (typeof a.coeficienteEquivalencia === 'number') ? a.coeficienteEquivalencia : 1.0;
      const eq = (typeof a.areaEquivalente === 'number') ? a.areaEquivalente : (a.area * coef);
      return acc + eq;
    }, 0);
  });

  // Peça 4: Memorial Descritivo
  readonly memorialDescritivo = signal<MemorialDescritivo>(criarMemorialDescritivoPadrao());
  readonly memorialDescritivoAberto = signal<boolean>(false);
  readonly aplicaMemorialDescritivo = computed(() => {
    const op = this.tipoOperacao();
    return op === 'construcao' || op === 'compra_construcao' || op === 'reforma_pf';
  });
  readonly sistemaIndustrializadoAviso = computed(() => {
    const sis = (this.memorialDescritivo().sistemaConstrutivo || '').trim().toLowerCase();
    return sis !== 'alvenaria convencional' && sis !== '';
  });

  readonly textoConclusaoObra = computed(() => {
    const op = this.tipoOperacao();
    const exigeHabiteSe =
      op === 'construcao' ||
      op === 'compra_construcao' ||
      op === 'compra_terreno' ||
      (op === 'reforma_pf' && this.tipoIntervencao() === 'ampliacao_com_area_nova');

    if (exigeHabiteSe) {
      return {
        retencao: 'até averbação do Habite-se / CND',
        cronograma: 'Conclusão & Habite-se',
        pdfObra: 'após a entrega do Habite-se'
      };
    }
    return {
      retencao: 'até vistoria final de conformidade',
      cronograma: 'Conclusão & Vistoria Final',
      pdfObra: 'após a vistoria final de conclusão da obra'
    };
  });

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

  // Peça 2: Orçamento por Macroetapa
  readonly macroetapas = signal<MacroetapaOrcamento[]>([]);
  readonly totalPercentualMacroetapas = computed(() => {
    const soma = this.macroetapas().reduce((acc, m) => acc + (m.percentualAjustado || 0), 0);
    return Number(soma.toFixed(2));
  });
  readonly totalValorMacroetapas = computed(() => {
    return this.macroetapas().reduce((acc, m) => acc + (m.valorEstimado || 0), 0);
  });

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

  // Peça 3: Cronograma Físico-Financeiro em Curva S
  readonly cronogramaObra = signal<ParcelaObraCurvaS[]>([]);
  readonly retencaoGarantiaObra = computed(() => (this.custoBase() || 0) * 0.05);
  readonly totalLiberadoCurvaS = computed(() =>
    this.cronogramaObra().reduce((acc, p) => acc + (p.liberacaoMes || 0), 0)
  );
  readonly somaPercentualFisicoCurvaS = computed(() => {
    const soma = this.cronogramaObra().reduce((acc, p) => acc + (p.percentualFisicoMes || 0), 0);
    return Number(soma.toFixed(2));
  });
  readonly totalEncargosObra = computed(() =>
    this.cronogramaObra().reduce((acc, p) => acc + (p.encargoMes || 0), 0)
  );

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
        situacao_lote: (this.novoProjetoTipoOperacao === 'construcao')
          ? 'proprio_quitado'
          : (this.novoProjetoTipoOperacao === 'reforma_pf' || this.novoProjetoTipoOperacao === 'condominio')
            ? 'a_reformar'
            : 'a_adquirir',
        area_estimada_estudo_previo: 140,
        padrao_construtivo_estudo_previo: 'Normal',
        estudo_previo_concluido: false,
        projeto_aprovado_confirmado: false,
        alvara_confirmado: false,
        art_rrt_confirmado: false,
        laudo_inspecao_confirmado: false,
        ata_age_confirmada: false,
        tipo_intervencao: this.novoProjetoTipoOperacao === 'condominio' ? 'manutencao_predial' : 'reforma_sem_ampliacao',
        valor_terreno: (this.novoProjetoTipoOperacao === 'compra_terreno' || this.novoProjetoTipoOperacao === 'compra_construcao') ? 150000 : 0,
        custo_base: this.novoProjetoTipoOperacao !== 'compra_terreno' ? 350000 : 0,
        taxa_juros_anual: 9.5,
        prazo_anos: 25,
        percentual_entrada: 20,
        sistema_amortizacao: 'sac',
        ambientes: [],
        areas_externas: [],
        itens_adicionais: [],
        checklist_documentacao: [],
        macroetapas_orcamento: (this.novoProjetoTipoOperacao === 'condominio' ? MACROETAPAS_CONDOMINIO : MACROETAPAS_CONSTRUCAO).map(item => ({
          id: item.id,
          nome: item.nome,
          percentualPadrao: item.percentualPadrao,
          percentualAjustado: item.percentualPadrao,
          valorEstimado: Number(((350000 * item.percentualPadrao) / 100).toFixed(2))
        })),
        memorial_descritivo: criarMemorialDescritivoPadrao()
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
    this.etapaAtiva.set(proj.etapa_atual && proj.etapa_atual > 0 ? proj.etapa_atual : 1);

    // Campos da Etapa 0
    this.dataNascimentoProponente.set(proj.data_nascimento_proponente || '');
    if (proj.data_nascimento_proponente) {
      this.onDataNascimentoChange(proj.data_nascimento_proponente);
    }
    this.situacaoLote.set(proj.situacao_lote || (proj.tipo_operacao === 'construcao' ? 'proprio_quitado' : (proj.tipo_operacao === 'reforma_pf' || proj.tipo_operacao === 'condominio' ? 'a_reformar' : 'a_adquirir')));
    this.areaEstimadaEstudoPrevio.set(proj.area_estimada_estudo_previo || 140);
    this.padraoConstrutivoEstudoPrevio.set(proj.padrao_construtivo_estudo_previo || 'Normal');
    this.estudoPrevioConcluido.set(!!proj.estudo_previo_concluido);
    this.estudoPrevioGeradoEm.set(proj.estudo_previo_gerado_em || null);

    // Gate da Pasta Completa (Etapa 7)
    this.projetoAprovadoConfirmado.set(!!proj.projeto_aprovado_confirmado);
    this.alvaraConfirmado.set(!!proj.alvara_confirmado);
    this.artRrtConfirmado.set(!!proj.art_rrt_confirmado);
    this.laudoInspecaoConfirmado.set(!!proj.laudo_inspecao_confirmado);
    this.ataAgeConfirmada.set(!!proj.ata_age_confirmada);

    // Campos Frente 6
    this.tipoIntervencao.set(proj.tipo_intervencao || (proj.tipo_operacao === 'condominio' ? 'manutencao_predial' : 'reforma_sem_ampliacao'));
    this.arrecadacaoMensalCondominio.set(proj.arrecadacao_mensal_condominio ?? null);
    this.percentualInadimplenciaCondominio.set(proj.percentual_inadimplencia_condominio ?? null);
    this.valorObraIndicadoLaudo.set(proj.valor_obra_indicado_laudo ?? null);

    // Carregar ambientes e áreas com normalização NBR 12721
    const rawAmbientes = Array.isArray(proj.ambientes) ? proj.ambientes : [];
    const ambientesNormalizados: AmbienteItem[] = rawAmbientes.map((a: any) => {
      const coef = (typeof a.coeficienteEquivalencia === 'number') ? a.coeficienteEquivalencia : 1.0;
      const areaVal = a.area || 0;
      const areaEq = (typeof a.areaEquivalente === 'number') ? a.areaEquivalente : Number((areaVal * coef).toFixed(2));
      return {
        id: a.id || Math.random().toString(36).substring(2, 9),
        nome: a.nome || 'Ambiente',
        tamanho: a.tamanho || 'M',
        area: areaVal,
        dimensoes: a.dimensoes || `${areaVal} m²`,
        coeficienteEquivalencia: coef,
        areaEquivalente: areaEq
      };
    });
    this.ambientes.set(ambientesNormalizados);
    this.areasExternas.set(Array.isArray(proj.areas_externas) ? proj.areas_externas : []);
    this.pavimentos.set(proj.pavimentos || 1);

    // Carregar Peças Técnicas Frente 3
    if (Array.isArray(proj.macroetapas_orcamento) && proj.macroetapas_orcamento.length > 0) {
      this.macroetapas.set(proj.macroetapas_orcamento);
    } else {
      this.inicializarMacroetapas(true);
    }

    if (Array.isArray(proj.cronograma_obra_curva_s) && proj.cronograma_obra_curva_s.length > 0) {
      this.cronogramaObra.set(proj.cronograma_obra_curva_s);
    } else {
      this.gerarCronogramaCurvaS();
    }

    if (proj.memorial_descritivo && typeof proj.memorial_descritivo === 'object') {
      this.memorialDescritivo.set({
        ...criarMemorialDescritivoPadrao(),
        ...proj.memorial_descritivo
      });
    } else {
      this.memorialDescritivo.set(criarMemorialDescritivoPadrao());
    }

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
    await this.carregarDocumentosCredito(proj.id);
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
        data_nascimento_proponente: this.dataNascimentoProponente() || undefined,
        situacao_lote: this.situacaoLote(),
        area_estimada_estudo_previo: this.areaEstimadaEstudoPrevio(),
        padrao_construtivo_estudo_previo: this.padraoConstrutivoEstudoPrevio(),
        estudo_previo_concluido: this.estudoPrevioConcluido(),
        estudo_previo_gerado_em: this.estudoPrevioGeradoEm(),
        projeto_aprovado_confirmado: this.projetoAprovadoConfirmado(),
        alvara_confirmado: this.alvaraConfirmado(),
        art_rrt_confirmado: this.artRrtConfirmado(),
        laudo_inspecao_confirmado: this.laudoInspecaoConfirmado(),
        ata_age_confirmada: this.ataAgeConfirmada(),
        tipo_intervencao: this.tipoIntervencao(),
        arrecadacao_mensal_condominio: this.arrecadacaoMensalCondominio(),
        percentual_inadimplencia_condominio: this.percentualInadimplenciaCondominio(),
        valor_obra_indicado_laudo: this.valorObraIndicadoLaudo(),
        checklist_documentacao: this.checklistDocumentacao(),
        linha_credito_selecionada_id: this.linhaCreditoSelecionadaId(),
        tem_juros_obra: this.temJurosObra(),
        prazo_obra_meses: this.prazoObraMeses(),
        taxa_juros_obra: this.taxaJurosObra(),
        total_juros: this.getTotalJuros(),
        valor_aluguel_m2: this.valorAluguelM2(),
        itens_adicionais: this.itensAdicionais(),
        macroetapas_orcamento: this.macroetapas(),
        cronograma_obra_curva_s: this.cronogramaObra(),
        memorial_descritivo: this.memorialDescritivo()
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

  onDataNascimentoChange(data: string): void {
    this.dataNascimentoProponente.set(data);
    if (!data) return;
    const parts = data.split('-');
    if (parts.length === 3) {
      const ano = parseInt(parts[0], 10);
      const mes = parseInt(parts[1], 10) - 1;
      const dia = parseInt(parts[2], 10);
      const nasc = new Date(ano, mes, dia);
      const hoje = new Date();
      let anos = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        anos--;
      }
      if (anos >= 18 && anos <= 100) {
        this.idadeSolicitante = anos;
        this.recalcular();
      }
    }
  }

  onSituacaoLoteChange(novaSituacao: 'a_adquirir' | 'proprio_quitado' | 'a_reformar'): void {
    this.situacaoLote.set(novaSituacao);
    if (novaSituacao === 'a_adquirir') {
      this.tipoOperacao.set('compra_construcao');
    } else if (novaSituacao === 'a_reformar') {
      if (this.tipoOperacao() !== 'condominio') {
        this.tipoOperacao.set('reforma_pf');
      }
    } else {
      this.tipoOperacao.set('construcao');
    }
    this.recalcular();
  }

  avancarParaMontarProjeto(): void {
    if (this.custoObraEstudoPrevio() > 0) {
      this.custoBase.set(this.custoObraEstudoPrevio());
    }
    this.selecionarEtapa(1);
  }

  async alternarConfirmacaoGate(campo: 'projeto' | 'alvara' | 'art_rrt' | 'laudo' | 'ata_age', valor: boolean): Promise<void> {
    if (campo === 'projeto') this.projetoAprovadoConfirmado.set(valor);
    if (campo === 'alvara') this.alvaraConfirmado.set(valor);
    if (campo === 'art_rrt') this.artRrtConfirmado.set(valor);
    if (campo === 'laudo') this.laudoInspecaoConfirmado.set(valor);
    if (campo === 'ata_age') this.ataAgeConfirmada.set(valor);

    const proj = this.projetoAtual();
    if (proj?.id) {
      await this.salvarProjetoAtual();
    }
  }

  calcularElegibilidade(): ResultadoElegibilidade[] {
    const segmentoAtual = (this.tipoOperacao() === 'reforma_pf')
      ? 'pessoa_fisica_reforma'
      : (this.tipoOperacao() === 'condominio')
        ? 'condominio'
        : 'pessoa_fisica_construcao';

    const linhas = this.linhasCredito().filter(l => {
      if (l.ativo === false) return false;
      const segLinha = l.segmento || 'pessoa_fisica_construcao';
      return segLinha === segmentoAtual;
    });
    const investimentoGlobal = this.investimentoGlobalEstudoPrevio();
    const custoObra = this.custoObraEstudoPrevio();
    const idade = this.idadeSolicitante;
    const renda = this.rendaFamiliar;
    const situacao = this.situacaoLote();

    return linhas.map(linha => {
      const motivos: string[] = [];
      const camposFaltantes: string[] = [];

      // Prazo — obrigatório para todo o restante do cálculo
      if (!linha.prazo_max_anos) camposFaltantes.push('prazo_max_anos');
      const prazoAnos = linha.prazo_max_anos ?? null;
      const prazoMeses = prazoAnos ? prazoAnos * 12 : null;

      // Idade — só avalia se prazo E algum limite de idade existirem
      if (idade && prazoAnos) {
        if (linha.idade_meses_referencia) {
          const idadeMesesAtual = idade * 12;
          if (idadeMesesAtual + prazoMeses! > linha.idade_meses_referencia) {
            const limiteAnos = Math.floor(linha.idade_meses_referencia / 12);
            motivos.push(`Idade atual (${idade} anos) somada ao prazo (${prazoAnos} anos) ultrapassa o limite da linha (${limiteAnos} anos / ${linha.idade_meses_referencia} meses).`);
          }
        } else if (linha.idade_maxima) {
          if (idade + prazoAnos > linha.idade_maxima) {
            motivos.push(`Idade atual (${idade} anos) somada ao prazo (${prazoAnos} anos) excede a idade máxima permitida (${linha.idade_maxima} anos).`);
          }
        } else {
          camposFaltantes.push('idade_maxima ou idade_meses_referencia');
        }
      }

      // Renda mínima
      if (!linha.renda_minima) {
        camposFaltantes.push('renda_minima');
      } else if (renda && renda < linha.renda_minima) {
        motivos.push(`Renda mensal (R$ ${this.formatarMoeda(renda)}) é inferior à renda mínima de entrada deste produto (R$ ${this.formatarMoeda(linha.renda_minima)}).`);
      }

      // Percentual de financiamento — sem fallback de 80%
      if (!linha.percentual_financiamento_max) camposFaltantes.push('percentual_financiamento_max');
      const percentualMax = linha.percentual_financiamento_max
        ? linha.percentual_financiamento_max / 100
        : null;

      // Regra confirmada: terreno próprio quitado funciona como entrada técnica,
      // então o financiamento é calculado sobre o custo da obra, não sobre o
      // investimento global (terreno + obra). Isso é mais conservador e reflete
      // a mecânica real de mercado documentada na pesquisa de financiamento.
      const baseFinanciavel = situacao === 'proprio_quitado' ? custoObra : investimentoGlobal;
      const maxFinanciamento = percentualMax ? baseFinanciavel * percentualMax : null;
      const minFinanciamento = maxFinanciamento ? maxFinanciamento * 0.7 : null;

      // Taxa — sem fallback de 9.5%
      if (!linha.taxa_juros_min) camposFaltantes.push('taxa_juros_min');
      let parcelaEstimada: number | null = null;
      if (linha.taxa_juros_min && maxFinanciamento && prazoAnos) {
        const taxaAnual = linha.taxa_juros_min / 100;
        const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
        const numParcelas = prazoAnos * 12;
        if (linha.sistema_amortizacao && linha.sistema_amortizacao.includes('SAC')) {
          const amortizacao = maxFinanciamento / numParcelas;
          const jurosInicial = maxFinanciamento * taxaMensal;
          parcelaEstimada = amortizacao + jurosInicial;
        } else {
          parcelaEstimada = maxFinanciamento *
            (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) /
            (Math.pow(1 + taxaMensal, numParcelas) - 1);
        }
      }

      const dadosIncompletos = camposFaltantes.length > 0;
      const compativel = motivos.length === 0 && !dadosIncompletos;

      return {
        linhaId: linha.id,
        banco: linha.banco,
        produto: linha.nome_produto,
        nome_produto: linha.nome_produto,
        taxaJurosMin: linha.taxa_juros_min ?? null,
        taxaJurosMax: linha.taxa_juros_max ?? null,
        prazoMaxAnos: prazoAnos,
        percentualFinanciamentoMax: linha.percentual_financiamento_max ?? null,
        compativel,
        dadosIncompletos,
        camposFaltantes,
        motivosIncompatibilidade: motivos,
        faixaFinanciamentoEstimada: maxFinanciamento
          ? { min: minFinanciamento!, max: maxFinanciamento }
          : null,
        parcelaEstimada,
        sistemaAmortizacao: linha.sistema_amortizacao || 'SAC',
        permiteFgts: linha.permite_fgts !== false,
        vantagemPrincipal: linha.vantagem_principal || '',
        gargalosOperacionais: linha.gargalos_operacionais || '',
        notaFonte: linha.nota_fonte || '',
        dataReferencia: linha.data_referencia || '',
        fonteUrl: linha.fonte_url || ''
      };
    }).sort((a, b) => {
      // Compatíveis primeiro, depois incompletas, depois incompatíveis
      if (a.compativel && !b.compativel) return -1;
      if (!a.compativel && b.compativel) return 1;
      if (a.dadosIncompletos && !b.dadosIncompletos) return 1;
      if (!a.dadosIncompletos && b.dadosIncompletos) return -1;
      return 0;
    });
  }

  async gerarPdfEstudoPrevio(): Promise<void> {
    this.gerandoPdfEstudoPrevio.set(true);
    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const dataEmissao = new Date().toLocaleDateString('pt-BR');
      const nomeEmpresa = perfil?.company_name || perfil?.full_name || 'EMPRESA DE ENGENHARIA';
      const respTecnico = perfil?.full_name || 'Responsável Técnico';
      const crea = perfil?.crea_cau || 'CREA/CAU 000000/D';
      const cliente = this.nomeCliente() || 'Cliente Interessado';
      const linhasResultado = this.calcularElegibilidade();

      const logoUrl = await carregarLogoComFallback(
        [perfil?.company_logo_url, '/logo-header.svg'].filter((u): u is string => !!u),
        120, 40
      );

      // Cabeçalho Navy com filete Copper
      doc.setFillColor(19, 42, 65); // #132A41
      doc.rect(14, 10, 182, 18, 'F');
      doc.setFillColor(181, 100, 42); // #B5642A
      doc.rect(14, 28, 182, 1.5, 'F');

      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', 16, 12, 14, 5);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(nomeEmpresa.toUpperCase(), logoUrl ? 32 : 20, 17);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      const cnpj = perfil?.company_cnpj ? ` • CNPJ ${perfil.company_cnpj}` : '';
      doc.text(`RESP. TÉCNICO: ${respTecnico.toUpperCase()} • ${crea}${cnpj}`, logoUrl ? 32 : 20, 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(232, 178, 126);
      doc.text('ESTUDO DE VIABILIDADE PRÉVIA DE CRÉDITO', 190, 17, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`EMISSÃO: ${dataEmissao}`, 190, 23, { align: 'right' });

      let currentY = 34;

      // AVISO LEGAL OBRIGATÓRIO (Em destaque)
      autoTable(doc, {
        startY: currentY,
        theme: 'plain',
        body: [
          [
            'AVISO LEGAL OBRIGATÓRIO:\nEste estudo é uma análise técnica preliminar elaborada pelo responsável técnico identificado nesta peça. Não constitui carta de crédito, proposta de financiamento nem qualquer garantia de aprovação por instituição financeira. A análise definitiva depende de avaliação cadastral e técnica própria do agente financeiro escolhido.'
          ]
        ],
        styles: {
          fontSize: 7,
          textColor: [120, 53, 15],
          fillColor: [254, 243, 199],
          fontStyle: 'bold',
          cellPadding: 3,
          lineColor: [251, 191, 36],
          lineWidth: 0.2
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;

      // TABELA 1: DADOS DO PROPONENTE & LOCALIZAÇÃO
      autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        head: [['1. IDENTIFICAÇÃO DO PROPONENTE & LOCALIZAÇÃO', '']],
        body: [
          ['Cliente / Proponente:', cliente],
          ['Trilha de Renda:', this.tipoRenda().toUpperCase()],
          ['Renda Familiar Bruta:', this.rendaFamiliar ? `R$ ${this.formatarMoeda(this.rendaFamiliar)}/mês` : 'Não informada'],
          ['Idade do Proponente:', this.idadeSolicitante ? `${this.idadeSolicitante} anos` : 'Não informada'],
          ['Localização Prevista:', `${this.cidade() ? this.cidade() + ' - ' : ''}${this.uf()}`]
        ],
        headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7.5, cellPadding: 1.5, textColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] } }
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;

      // TABELA 2: IMÓVEL BASE & INVESTIMENTO GLOBAL ESTIMADO
      const sitLabel = this.situacaoLote() === 'proprio_quitado'
        ? 'Terreno próprio já quitado'
        : this.situacaoLote() === 'a_adquirir'
        ? 'Aquisição de terreno + construção'
        : 'Imóvel existente a reformar';

      const corpoImovel: any[] = [
        ['Situação do Lote / Terreno:', sitLabel],
        ['Valor Estimado do Terreno:', `R$ ${this.formatarMoeda(this.valorTerreno())}`],
        ['Área Estimada da Edificação:', `${this.areaEstimadaEstudoPrevio()} m² (${this.padraoConstrutivoEstudoPrevio()} padrão)`],
        ['CUB de Referência do Estado:', `R$ ${this.formatarMoeda(this.valorCubEstadoAtual())}/m² (${this.infoCubEstadoAtual()})`],
        ['Custo Estimado da Edificação:', `R$ ${this.formatarMoeda(this.custoObraEstudoPrevio())}`],
        ['Investimento Global de Referência:', `R$ ${this.formatarMoeda(this.investimentoGlobalEstudoPrevio())}`]
      ];

      autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        head: [['2. PARÂMETROS DO IMÓVEL & INVESTIMENTO GLOBAL ESTIMADO', '']],
        body: corpoImovel,
        headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7.5, cellPadding: 1.5, textColor: [30, 41, 59] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] } }
      });
      currentY = (doc as any).lastAutoTable.finalY + 3;

      // RESSALVA ESPECIAL DO TERRENO QUITADO
      if (this.situacaoLote() === 'proprio_quitado' && this.participacaoLoteEstudoPrevio() >= 0.20) {
        autoTable(doc, {
          startY: currentY,
          theme: 'plain',
          body: [
            [
              'POTENCIAL COBERTURA DE ENTRADA POR TERRENO QUITADO:\nO valor do terreno já quitado pode cobrir a cota mínima de entrada exigida por algumas linhas, o que tende a reduzir ou eliminar a necessidade de aporte em dinheiro para a obra. Este valor está sujeito à avaliação técnica da instituição financeira e pode divergir da estimativa aqui apresentada.'
            ]
          ],
          styles: {
            fontSize: 6.8,
            textColor: [30, 58, 138],
            fillColor: [239, 246, 255],
            fontStyle: 'normal',
            cellPadding: 2.5,
            lineColor: [191, 219, 254],
            lineWidth: 0.2
          }
        });
        currentY = (doc as any).lastAutoTable.finalY + 4;
      }

      // TABELA 3: LINHAS DE FINANCIAMENTO AVALIADAS
      const corpoLinhas = linhasResultado.map(l => {
        let statusTexto = 'Elegível Preliminarmente';
        let detalhes = l.vantagemPrincipal || 'Parâmetros de prazo e renda em conformidade com o produto.';

        if (l.dadosIncompletos) {
          statusTexto = 'Cadastro Incompleto';
          detalhes = `Cadastro incompleto no admin — campos pendentes: ${l.camposFaltantes.join(', ')}`;
        } else if (!l.compativel) {
          statusTexto = 'Incompatível com Perfil';
          detalhes = l.motivosIncompatibilidade.join('; ');
        }

        const taxaTexto = (l.taxaJurosMin != null && l.taxaJurosMax != null)
          ? `${l.taxaJurosMin}% a ${l.taxaJurosMax}%\n${l.sistemaAmortizacao}`
          : (l.taxaJurosMin != null ? `${l.taxaJurosMin}%\n${l.sistemaAmortizacao}` : `Não informada\n${l.sistemaAmortizacao}`);

        const prazoTexto = l.prazoMaxAnos ? `${l.prazoMaxAnos} anos` : 'Não informado';

        const financiamTexto = l.faixaFinanciamentoEstimada
          ? `Até R$ ${this.formatarMoeda(l.faixaFinanciamentoEstimada.max)}\n(Parc. ~R$ ${this.formatarMoeda(l.parcelaEstimada || 0)})`
          : 'Cálculo pendente\n(dados incompletos)';

        return [
          `${l.banco}\n${l.produto || l.nome_produto || ''}`,
          taxaTexto,
          prazoTexto,
          financiamTexto,
          statusTexto,
          detalhes
        ];
      });

      autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        head: [['Instituição / Linha', 'Taxa & Amort.', 'Prazo', 'Financiamento Est.', 'Elegibilidade', 'Parecer / Observações']],
        body: corpoLinhas,
        headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 6.5, cellPadding: 1.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 32 },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 16, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
          5: { cellWidth: 54 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            if (data.cell.raw === 'Elegível Preliminarmente') {
              data.cell.styles.textColor = [22, 101, 52];
            } else if (data.cell.raw === 'Cadastro Incompleto') {
              data.cell.styles.textColor = [71, 85, 105];
            } else {
              data.cell.styles.textColor = [180, 83, 9];
            }
          }
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 3;

      // NOTA FIXA DE CONFERÊNCIA DE TAXAS
      autoTable(doc, {
        startY: currentY,
        theme: 'plain',
        body: [
          [
            'NOTA DE CONFERÊNCIA DOS PARÂMETROS BANCÁRIOS:\nOs parâmetros bancários apresentados são referência de mercado cadastrada pelo administrador do sistema e podem não refletir as condições vigentes na data de emissão. Antes de repassar este estudo ao cliente, confirme as taxas e condições diretamente com a instituição financeira.'
          ]
        ],
        styles: {
          fontSize: 6.5,
          textColor: [71, 85, 105],
          fillColor: [248, 250, 252],
          cellPadding: 2,
          lineColor: [226, 232, 240],
          lineWidth: 0.2
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 3;

      // PRÓXIMOS PASSOS RECOMENDADOS
      autoTable(doc, {
        startY: currentY,
        theme: 'plain',
        body: [
          [
            'PRÓXIMOS PASSOS RECOMENDADOS:\nConfirmada a viabilidade preliminar pelo responsável técnico e pelo cliente, o próximo passo consiste no desenvolvimento dos projetos arquitetônico e complementares de engenharia e na obtenção das aprovações municipais (Alvará). Uma vez aprovados os projetos e emitidas as respectivas ARTs/RRTs, a Pasta Técnica Completa de Crédito poderá ser gerada e submetida à instituição financeira eleita.'
          ]
        ],
        styles: {
          fontSize: 6.8,
          textColor: [19, 42, 65],
          fillColor: [241, 245, 249],
          fontStyle: 'bold',
          cellPadding: 2.5,
          lineColor: [203, 213, 225],
          lineWidth: 0.2
        }
      });

      // Rodapé da página
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Documento emitido para fins de estudo técnico prévio • Responsável Técnico: ${respTecnico} (${crea}) • Viabiliza IA`,
        14,
        287
      );
      if (perfil?.company_address) {
        doc.setFontSize(5.8);
        doc.setFont('helvetica', 'normal');
        doc.text(perfil.company_address, 14, 290.5, { maxWidth: 182 });
      }

      const nomeLimpo = cliente.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const nomeArquivo = `estudo-viabilidade-previa-${nomeLimpo}-${new Date().getTime()}.pdf`;
      doc.save(nomeArquivo);

      // Marca estudo como concluído
      this.estudoPrevioConcluido.set(true);
      this.estudoPrevioGeradoEm.set(new Date().toISOString());
      this.elegibilidadeResultado.set(linhasResultado);

      if (this.projetoAtual()?.id) {
        await this.salvarProjetoAtual();
      }

      this.motorPdfService.exibirToast('Estudo de Viabilidade Prévia gerado com sucesso!', 'sucesso');
    } catch (e: any) {
      this.mensagemErro.set(e?.message || 'Erro ao emitir PDF do Estudo Prévio');
      this.motorPdfService.exibirToast('Erro ao gerar Estudo Prévio em PDF', 'erro');
    } finally {
      this.gerandoPdfEstudoPrevio.set(false);
    }
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

    this.recalcularValoresMacroetapas();
    this.gerarCronogramaCurvaS();
  }

  calcularCustoAreasExternas(): number {
    return this.areasExternas().reduce((acc, a) => acc + (a.custo_total || 0), 0);
  }

  aplicarEstimativaCUB(): void {
    const area = (this.aplicaAreaEquivalente() && this.areaEquivalenteTotal() > 0)
      ? this.areaEquivalenteTotal()
      : (this.areaTotal() || 130);
    const cubValor = this.valorCubEstadoAtual() || 2650;
    const valorSugerido = Math.round(area * cubValor);
    this.custoBase.set(valorSugerido);
    this.recalcular();
    const descTipo = (this.aplicaAreaEquivalente() && this.areaEquivalenteTotal() > 0)
      ? `Área Equivalente NBR 12721 (${area.toFixed(2)} m²)`
      : `Área Real (${area} m²)`;
    this.mensagemSucesso.set(`Custo base atualizado para R$ ${valorSugerido.toLocaleString('pt-BR')} com base na ${descTipo} e CUB/${this.uf() || 'SP'} (R$ ${cubValor.toLocaleString('pt-BR')}/m²).`);
  }

  adotarValorLaudoComoObra(): void {
    const valor = this.valorObraIndicadoLaudo();
    if (typeof valor === 'number' && valor > 0) {
      this.custoBase.set(valor);
      this.recalcular();
      this.mensagemSucesso.set(`Custo da intervenção atualizado para R$ ${valor.toLocaleString('pt-BR')} conforme Laudo Técnico NBR 16747.`);
    }
  }

  // --- AMBIENTES & NBR 12721 ---
  onAmbienteSelecionadoChange(): void {
    const amb = this.ambientesDisponiveis.find(a => a.nome === this.novoAmbienteNome);
    if (amb) {
      if (this.novoAmbienteTamanho !== 'Personalizado') {
        const tam = amb.tamanhos[this.novoAmbienteTamanho as 'P' | 'M' | 'G'];
        this.novoAmbienteArea = tam.area;
        this.novoAmbienteDimensoes = tam.dimensoes;
      }
    }
    this.novoAmbienteCoeficiente = this.obterCoeficienteSugerido(this.novoAmbienteNome);
  }

  onAmbienteTamanhoChange(): void {
    this.onAmbienteSelecionadoChange();
  }

  obterCoeficienteSugerido(nome: string): number {
    const n = (nome || '').toLowerCase();
    if (n.includes('garagem')) return 0.50;
    if (n.includes('varanda') || n.includes('gourmet') || n.includes('sacada')) return 0.75;
    if (n.includes('serviço') || n.includes('lavanderia') || n.includes('descoberta')) return 0.175;
    if (n.includes('piscina') || n.includes('lazer') || n.includes('deck')) return 0.50;
    return 1.00;
  }

  atualizarCoeficienteAmbiente(id: string, novoCoef: number): void {
    const coefValido = isNaN(novoCoef) ? 1.0 : Math.max(0, Math.min(1.0, novoCoef));
    this.ambientes.update(arr =>
      arr.map(a => a.id === id ? {
        ...a,
        coeficienteEquivalencia: coefValido,
        areaEquivalente: Number((a.area * coefValido).toFixed(2))
      } : a)
    );
    this.recalcular();
  }

  adicionarAmbiente(): void {
    if (this.novoAmbienteArea <= 0) return;
    const coef = (typeof this.novoAmbienteCoeficiente === 'number' && this.novoAmbienteCoeficiente >= 0)
      ? this.novoAmbienteCoeficiente
      : 1.0;
    const novo: AmbienteItem = {
      id: Math.random().toString(36).substring(2, 9),
      nome: this.novoAmbienteNome,
      tamanho: this.novoAmbienteTamanho,
      area: this.novoAmbienteArea,
      dimensoes: this.novoAmbienteDimensoes || `${this.novoAmbienteArea} m²`,
      coeficienteEquivalencia: coef,
      areaEquivalente: Number((this.novoAmbienteArea * coef).toFixed(2))
    };
    this.ambientes.update(arr => [...arr, novo]);
    this.recalcular();
  }

  removerAmbiente(id: string): void {
    this.ambientes.update(arr => arr.filter(a => a.id !== id));
    this.recalcular();
  }

  // --- PEÇA 2: MACROETAPAS DE ORÇAMENTO ---
  inicializarMacroetapas(forcar: boolean = false): void {
    if (!forcar && this.macroetapas().length > 0) return;
    const conjunto = (this.tipoOperacao() === 'condominio')
      ? MACROETAPAS_CONDOMINIO
      : MACROETAPAS_CONSTRUCAO;

    const custo = this.custoBase() || 0;
    const novas: MacroetapaOrcamento[] = conjunto.map(item => ({
      id: item.id,
      nome: item.nome,
      percentualPadrao: item.percentualPadrao,
      percentualAjustado: item.percentualPadrao,
      valorEstimado: Number(((custo * item.percentualPadrao) / 100).toFixed(2))
    }));
    this.macroetapas.set(novas);
  }

  atualizarPercentualMacroetapa(id: string, novoPerc: number): void {
    const percValido = isNaN(novoPerc) ? 0 : Math.max(0, Math.min(100, novoPerc));
    const custo = this.custoBase() || 0;
    this.macroetapas.update(lista =>
      lista.map(m => m.id === id ? {
        ...m,
        percentualAjustado: percValido,
        valorEstimado: Number(((custo * percValido) / 100).toFixed(2))
      } : m)
    );
    this.gerarCronogramaCurvaS();
  }

  recalcularValoresMacroetapas(): void {
    const custo = this.custoBase() || 0;
    if (this.macroetapas().length === 0) {
      this.inicializarMacroetapas(true);
      return;
    }
    this.macroetapas.update(lista =>
      lista.map(m => ({
        ...m,
        valorEstimado: Number(((custo * (m.percentualAjustado || 0)) / 100).toFixed(2))
      }))
    );
  }

  restaurarMacroetapasPadrao(): void {
    this.inicializarMacroetapas(true);
    this.gerarCronogramaCurvaS();
    this.mensagemSucesso.set('Percentuais das macroetapas restaurados para os valores padrão de referência.');
  }

  // --- PEÇA 3: CRONOGRAMA EM CURVA S ---
  obterMacroetapaPredominante(percAcumulado: number): string {
    const etapas = this.macroetapas();
    if (!etapas || etapas.length === 0) return 'Execução de Serviços';
    let acumuladoEtapas = 0;
    for (const etapa of etapas) {
      acumuladoEtapas += (etapa.percentualAjustado || 0);
      if (percAcumulado <= acumuladoEtapas || etapa === etapas[etapas.length - 1]) {
        return etapa.nome;
      }
    }
    return etapas[etapas.length - 1].nome;
  }

  gerarCronogramaCurvaS(): void {
    const meses = Math.max(1, this.prazoObraMeses() || 12);
    const totalObra = this.custoBase() || 0;
    if (totalObra <= 0) {
      this.cronogramaObra.set([]);
      return;
    }

    const pesos: number[] = [];
    for (let m = 1; m <= meses; m++) {
      const z = (m - meses / 2) / (meses / 6);
      pesos.push(1 / (1 + Math.exp(-z)));
    }
    const diffs = pesos.map((p, i) => p - (i === 0 ? 0 : pesos[i - 1]));
    const soma = diffs.reduce((a, b) => a + b, 0);
    const fatores = diffs.map(d => d / (soma || 1));

    let saldoAcumulado = 0;
    let percAcumulado = 0;
    const parcelas: ParcelaObraCurvaS[] = [];

    for (let mes = 1; mes <= meses; mes++) {
      let percMes = fatores[mes - 1] * 100;
      const ultimoMes = mes === meses;
      percAcumulado += percMes;
      if (ultimoMes) {
        percMes += (100 - percAcumulado);
        percAcumulado = 100;
      }

      const liberacao = (percMes / 100) * totalObra;
      saldoAcumulado += liberacao;

      // Taxa mensal por juros compostos
      const taxaMensal = Math.pow(1 + this.taxaJurosObra() / 100, 1 / 12) - 1;
      const juros = saldoAcumulado * taxaMensal;
      const mip = saldoAcumulado * 0.00028; // Morte e Invalidez Permanente
      const dfi = totalObra * 0.00006;      // Danos Físicos ao Imóvel
      const ta = 25.0;                      // Taxa de Administração mensal média

      parcelas.push({
        mes,
        macroetapaPredominante: this.obterMacroetapaPredominante(percAcumulado),
        percentualFisicoMes: Number(percMes.toFixed(2)),
        percentualAcumulado: Number(percAcumulado.toFixed(2)),
        liberacaoMes: Number(liberacao.toFixed(2)),
        saldoLiberadoAcumulado: Number(saldoAcumulado.toFixed(2)),
        encargoMes: Number((juros + mip + dfi + ta).toFixed(2)),
        retidoGarantia: ultimoMes
      });
    }
    this.cronogramaObra.set(parcelas);
  }

  atualizarPercentualCronogramaMes(mes: number, novoPerc: number): void {
    const percValido = isNaN(novoPerc) ? 0 : Math.max(0, Math.min(100, novoPerc));
    const totalObra = this.custoBase() || 0;
    const taxaMensal = Math.pow(1 + this.taxaJurosObra() / 100, 1 / 12) - 1;

    this.cronogramaObra.update(lista => {
      let saldoAcumulado = 0;
      let percAcumulado = 0;
      const totalMeses = lista.length;

      return lista.map((p, idx) => {
        const percMes = p.mes === mes ? percValido : p.percentualFisicoMes;
        percAcumulado += percMes;
        const liberacao = (percMes / 100) * totalObra;
        saldoAcumulado += liberacao;
        const juros = saldoAcumulado * taxaMensal;
        const mip = saldoAcumulado * 0.00028;
        const dfi = totalObra * 0.00006;
        const ta = 25.0;

        return {
          ...p,
          percentualFisicoMes: Number(percMes.toFixed(2)),
          percentualAcumulado: Number(percAcumulado.toFixed(2)),
          liberacaoMes: Number(liberacao.toFixed(2)),
          saldoLiberadoAcumulado: Number(saldoAcumulado.toFixed(2)),
          encargoMes: Number((juros + mip + dfi + ta).toFixed(2)),
          macroetapaPredominante: this.obterMacroetapaPredominante(percAcumulado),
          retidoGarantia: idx === totalMeses - 1
        };
      });
    });
  }

  // --- PEÇA 4: MEMORIAL DESCRITIVO ---
  atualizarCampoMemorial(campo: keyof MemorialDescritivo, valor: any): void {
    this.memorialDescritivo.update(m => ({ ...m, [campo]: valor }));
  }

  toggleMemorialDescritivo(): void {
    this.memorialDescritivoAberto.update(v => !v);
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
    if (this.tipoOperacao() === 'condominio') {
      return [...DOCUMENTOS_CONDOMINIO];
    }
    const base = [...DOCUMENTOS_BASE];
    let porRenda: any[] = [];
    if (this.tipoRenda() === 'clt') {
      porRenda = DOCUMENTOS_CLT;
    } else if (this.tipoRenda() === 'autonomo') {
      porRenda = DOCUMENTOS_AUTONOMO;
    } else {
      porRenda = DOCUMENTOS_EMPRESARIO;
    }
    if (this.tipoOperacao() === 'reforma_pf') {
      return [...base, ...porRenda, ...DOCUMENTOS_REFORMA_PF];
    }
    return [...base, ...porRenda];
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

  getDocumentosPendentesObrigatorios(): any[] {
    const marcados = this.checklistDocumentacao();
    return this.getDocumentosAtuais().filter(d => d.obrigatorio && !marcados.includes(d.id));
  }

  // --- LINHAS DE CRÉDITO ---
  filtrarLinhasElegiveis(): any[] {
    const segmentoAtual = (this.tipoOperacao() === 'reforma_pf')
      ? 'pessoa_fisica_reforma'
      : (this.tipoOperacao() === 'condominio')
        ? 'condominio'
        : 'pessoa_fisica_construcao';

    return this.linhasCredito()
      .filter(linha => {
        if (linha.ativo === false) return false;
        const seg = linha.segmento || 'pessoa_fisica_construcao';
        return seg === segmentoAtual;
      })
      .map(linha => {
        const rendaOk = (this.tipoOperacao() === 'condominio') || !linha.renda_minima || !this.rendaFamiliar || (this.rendaFamiliar >= linha.renda_minima);
        const idadeOk = (this.tipoOperacao() === 'condominio') || !linha.idade_maxima || !this.idadeSolicitante || (this.idadeSolicitante <= linha.idade_maxima);
        const camposFaltantes: string[] = [];
        if (!linha.taxa_juros_min) camposFaltantes.push('taxa_juros_min');
        if (!linha.prazo_max_anos) camposFaltantes.push('prazo_max_anos');
        if (!linha.percentual_financiamento_max) camposFaltantes.push('percentual_financiamento_max');
        return {
          ...linha,
          _elegivel: rendaOk && idadeOk,
          _dadosIncompletos: camposFaltantes.length > 0,
          _camposFaltantes: camposFaltantes
        };
      })
      .filter(linha => linha._elegivel);
  }

  calcularParcelaLinha(linha: any): number | null {
    const res = this.resultado();
    if (!res || !res.valorFinanciavel) return null;
    if (!linha.taxa_juros_min || !linha.prazo_max_anos) return null; // sem dado, sem cálculo

    const taxaAnual = linha.taxa_juros_min / 100;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const numParcelas = linha.prazo_max_anos * 12;
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
      case 'reforma_pf': return 'Reforma / Ampliação PF';
      case 'condominio': return 'Crédito Condominial';
      default: return 'Crédito Imobiliário';
    }
  }

  // --- GESTÃO DE DOCUMENTOS DE CRÉDITO (ETAPA 3) ---

  async carregarDocumentosCredito(projetoId: string): Promise<void> {
    this.carregandoDocumentos.set(true);
    try {
      const docs = await this.supabaseService.listarDocumentosCredito(projetoId);
      this.documentosEnviados.set(docs || []);

      // Auto-marca no checklist os documentos com arquivos enviados
      if (docs && docs.length > 0) {
        const idsEnviados = docs.map(d => d.documento_id).filter(Boolean);
        this.checklistDocumentacao.update(arr => {
          const set = new Set([...arr, ...idsEnviados]);
          return Array.from(set);
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar documentos de crédito:', e);
      this.documentosEnviados.set([]);
    } finally {
      this.carregandoDocumentos.set(false);
    }
  }

  obterDocumentoEnviado(documentoId: string): DocumentoCredito | undefined {
    return this.documentosEnviados().find(d => d.documento_id === documentoId);
  }

  async onUploadArquivo(documentoId: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;

    const file = input.files[0];
    const proj = this.projetoAtual();
    if (!proj?.id) {
      this.mensagemErro.set('Abra ou salve o projeto antes de anexar documentos.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.mensagemErro.set(`O arquivo "${file.name}" excede o tamanho máximo permitido de 10 MB.`);
      return;
    }

    this.uploadingDocId.set(documentoId);
    this.mensagemErro.set(null);

    try {
      const { data, error } = await this.supabaseService.uploadDocumentoCredito(proj.id, documentoId, file);
      if (error) throw error;

      // Auto-marca como concluído no checklist
      this.checklistDocumentacao.update(arr => {
        if (!arr.includes(documentoId)) {
          return [...arr, documentoId];
        }
        return arr;
      });

      // Recarrega documentos do projeto
      await this.carregarDocumentosCredito(proj.id);
      await this.salvarProjetoAtual();

      this.mensagemSucesso.set(`Documento "${file.name}" anexado com sucesso à pasta de crédito!`);
    } catch (err: any) {
      console.error('Erro ao enviar documento:', err);
      this.mensagemErro.set(err?.message || 'Falha ao fazer upload do documento.');
    } finally {
      this.uploadingDocId.set(null);
    }
  }

  async excluirDocumento(docEnviado: DocumentoCredito, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    if (!confirm(`Deseja remover o arquivo "${docEnviado.nome_arquivo}"?`)) return;

    const proj = this.projetoAtual();
    if (!proj?.id) return;

    this.excluindoDocId.set(docEnviado.id);
    try {
      const { error } = await this.supabaseService.excluirDocumentoCredito(docEnviado.id, docEnviado.caminho_storage);
      if (error) throw error;

      this.mensagemSucesso.set(`Documento "${docEnviado.nome_arquivo}" removido.`);
      await this.carregarDocumentosCredito(proj.id);
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao excluir documento.');
    } finally {
      this.excluindoDocId.set(null);
    }
  }

  async baixarDocumentoIndividual(docEnviado: DocumentoCredito, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    try {
      const { url, error } = await this.supabaseService.obterUrlAssinadaDocumentoCredito(docEnviado.caminho_storage, 300);
      if (error || !url) {
        const { data: blob, error: blobErr } = await this.supabaseService.baixarArquivoDocumentoCredito(docEnviado.caminho_storage);
        if (blobErr || !blob) throw (blobErr || new Error('Não foi possível baixar o arquivo.'));
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = docEnviado.nome_arquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        window.open(url, '_blank');
      }
    } catch (err: any) {
      this.mensagemErro.set(err?.message || 'Erro ao obter link do documento.');
    }
  }

  formatarTamanhoBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return Math.round(bytes / 1024) + ' KB';
  }

  formatarData(dataIso?: string): string {
    if (!dataIso) return '';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dataIso;
    }
  }

  formatarMoeda(val?: number): string {
    if (val === undefined || val === null || isNaN(val)) return '0,00';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // --- MOTOR WHITE-LABEL: RELATÓRIO CONSOLIDADO EM PDF (ETAPA 7) ---

  async gerarRelatorioConsolidadoPDF(): Promise<void> {
    const proj = this.projetoAtual();
    if (!proj?.id) {
      this.mensagemErro.set('Abra um projeto para emitir o relatório consolidado.');
      return;
    }

    this.gerandoPdf.set(true);
    this.mensagemErro.set(null);

    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      if (!perfil?.crea_cau || perfil.crea_cau.trim().length <= 2) {
        this.motorPdfService.exibirToast(
          'Registro Profissional Obrigatório: Para gerar o relatório consolidado com validade técnica, cadastre seu CREA/CAU/CFT na aba "Meu Perfil > Dados para Documentos Técnicos".',
          'erro'
        );
        return;
      }

      const res = this.resultado();
      const totalJuros = res ? Math.max(0, res.totalPago - res.valorFinanciavel) : 0;
      const totalAluguel = (this.areaTotal() || 0) * (this.valorAluguelM2() || 35) * (this.prazoAnos() || 25) * 12;

      // 1. Tabela de Ambientes
      const ambientesHtml = this.ambientes().length > 0
        ? this.ambientes().map(a => `
            <tr>
              <td><strong>${a.nome}</strong></td>
              <td class="td-center">${a.tamanho}</td>
              <td class="td-center">${a.dimensoes}</td>
              <td class="td-right"><strong>${a.area.toFixed(1)} m²</strong></td>
            </tr>
          `).join('')
        : '<tr><td colspan="4" class="td-center" style="color: #94A3B8;">Nenhum ambiente discriminado</td></tr>';

      // 2. Tabela de Áreas Externas (se houver)
      let areasExternasSecao = '';
      if (this.areasExternas().length > 0) {
        const rows = this.areasExternas().map(ext => `
          <tr>
            <td><strong>${ext.tipo}</strong></td>
            <td class="td-center">${ext.area.toFixed(1)} m²</td>
            <td class="td-right">R$ ${this.formatarMoeda(ext.custo_m2)}</td>
            <td class="td-right"><strong>R$ ${this.formatarMoeda(ext.custo_total)}</strong></td>
          </tr>
        `).join('');

        areasExternasSecao = `
          <div style="margin-top: 8px;">
            <div style="font-size: 7.5pt; font-weight: 700; color: var(--p4-navy); margin-bottom: 4px; text-transform: uppercase;">
              Áreas Externas e Lazer (${this.areaExternaTotal()} m²)
            </div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 35%;">Item / Espaço</th>
                  <th class="th-center" style="width: 20%;">Área (m²)</th>
                  <th class="th-right" style="width: 20%;">Custo Estimado/m²</th>
                  <th class="th-right" style="width: 25%;">Total Estimado</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      }

      // 3. Tabela de Itens Adicionais
      let itensAdicionaisRows = '';
      if (this.itensAdicionais().length > 0) {
        itensAdicionaisRows = this.itensAdicionais().map(i => {
          const valorCalc = i.tipo === 'percentual'
            ? (this.custoBase() * (i.valor / 100))
            : i.valor;
          return `
            <tr>
              <td>${i.nome}</td>
              <td class="td-center">${i.tipo === 'percentual' ? `${i.valor}% sobre base` : 'Valor Fixo'}</td>
              <td class="td-right">R$ ${this.formatarMoeda(valorCalc)}</td>
            </tr>
          `;
        }).join('');
      }

      // 4. Checklist de Documentos
      const docsRows = this.getDocumentosAtuais().map(doc => {
        const docAnexado = this.obterDocumentoEnviado(doc.id);
        const marcado = this.isDocumentoMarcado(doc.id);
        let statusBadge = '<span style="color: #94A3B8; font-weight: 600;">✗ Pendente</span>';
        let detalheArquivo = '—';

        if (docAnexado) {
          statusBadge = '<span style="color: var(--p4-green); font-weight: 700;">✓ Anexado</span>';
          detalheArquivo = `${docAnexado.nome_arquivo} (${this.formatarTamanhoBytes(docAnexado.tamanho_bytes)})`;
        } else if (marcado) {
          statusBadge = '<span style="color: var(--p4-blue); font-weight: 700;">✓ Entregue</span>';
          detalheArquivo = 'Conferido presencialmente';
        }

        return `
          <tr>
            <td><strong>${doc.nome}</strong></td>
            <td class="td-center">${doc.obrigatorio ? '<strong style="color: #B91C1C;">Obrigatório</strong>' : '<span style="color: #64748B;">Opcional</span>'}</td>
            <td class="td-center">${statusBadge}</td>
            <td style="font-size: 6.8pt; color: #475569;">${detalheArquivo}</td>
          </tr>
        `;
      }).join('');

      // 5. Linha de Crédito
      const linhaSel = this.linhasCredito().find(l => l.id === this.linhaCreditoSelecionadaId());
      const linhaInfo = linhaSel
        ? `${linhaSel.banco} - ${linhaSel.nome_produto || linhaSel.nome || ''} (${linhaSel.taxa_juros_min}% a.a. • até ${linhaSel.prazo_max_anos} anos • ${linhaSel.sistema_amortizacao})`
        : 'Linha Padrão de Mercado (Estimativa SFH/SFI)';

      // 6. Construir vs Alugar (se aplicável)
      let construirVsAlugarSecao = '';
      if (this.tipoOperacao() !== 'compra_terreno') {
        const ecoDiferenca = totalAluguel - (res?.totalPago || 0);
        construirVsAlugarSecao = `
          <div class="doc-section">
            <div class="doc-section-title">6. Estudo Comparativo: Construir vs. Alugar</div>
            <p style="font-size: 7.2pt; color: #64748B; margin: 0 0 6px 0;">
              Análise financeira comparando o investimento na construção própria versus o desembolso em locação pelo mesmo prazo contratual (${this.prazoAnos()} anos).
            </p>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 35%;">Modalidade</th>
                  <th class="th-right" style="width: 25%;">Desembolso Total (${this.prazoAnos()} anos)</th>
                  <th style="width: 40%;">Resultado Patrimonial ao Final</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Construção Própria (Financiada)</strong></td>
                  <td class="td-right"><strong>R$ ${this.formatarMoeda(res?.totalPago)}</strong></td>
                  <td style="color: var(--p4-green);"><strong>Imóvel 100% quitado e valorizado no patrimônio</strong></td>
                </tr>
                <tr>
                  <td><strong>Aluguel Acumulado (R$ ${this.valorAluguelM2()}/m²)</strong></td>
                  <td class="td-right">R$ ${this.formatarMoeda(totalAluguel)}</td>
                  <td style="color: #B91C1C;">Despesa a fundo perdido (zero patrimônio acumulado)</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      }

      // Corpo HTML consolidado com o padrão White-Label do MotorPdfService
      const corpoHtml = `
        <!-- 1. DADOS DO EMPREENDIMENTO -->
        <div class="doc-section">
          <div class="doc-section-title">1. Identificação do Projeto & Localização</div>
          <div class="doc-card-info">
            <div class="doc-grid-3">
              <div>
                <span class="info-label">Nome do Projeto:</span>
                <span class="info-value">${this.nomeProjeto()}</span>
              </div>
              <div>
                <span class="info-label">Cliente / Proponente:</span>
                <span class="info-value">${this.nomeCliente() || 'Não informado'}</span>
              </div>
              <div>
                <span class="info-label">Tipo de Operação:</span>
                <span class="info-value">${this.getTipoOperacaoLabel(this.tipoOperacao())}</span>
              </div>
            </div>
            <div class="doc-grid-3" style="margin-top: 6px;">
              <div>
                <span class="info-label">Localização (UF / Cidade):</span>
                <span class="info-value">${this.cidade() ? this.cidade() + ' - ' : ''}${this.uf()}</span>
              </div>
              <div>
                <span class="info-label">Endereço / Lote:</span>
                <span class="info-value">${this.endereco() || 'A definir'}</span>
              </div>
              <div>
                <span class="info-label">CUB Referência:</span>
                <span class="info-value">R$ ${this.formatarMoeda(this.valorCubEstadoAtual())}/m² (${this.infoCubEstadoAtual()})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. DIMENSIONAMENTO ARQUITETÔNICO -->
        <div class="doc-section">
          <div class="doc-section-title">2. Programa de Necessidades & Áreas (Total: ${this.areaTotal()} m² • ${this.pavimentos()} Pavimento(s))</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 40%;">Ambiente</th>
                <th class="th-center" style="width: 20%;">Porte</th>
                <th class="th-center" style="width: 20%;">Dimensões</th>
                <th class="th-right" style="width: 20%;">Área Útil</th>
              </tr>
            </thead>
            <tbody>
              ${ambientesHtml}
            </tbody>
            <tfoot>
              <tr class="highlight-gray">
                <td colspan="3"><strong>ÁREA TOTAL CONSTRUÍDA</strong></td>
                <td class="td-right"><strong>${this.areaTotal()} m²</strong></td>
              </tr>
            </tfoot>
          </table>
          ${areasExternasSecao}
        </div>

        <!-- 3. DEMONSTRATIVO DE CUSTOS & COMPOSIÇÃO -->
        <div class="doc-section">
          <div class="doc-section-title">3. Demonstrativo de Custos & Composição do Orçamento</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 50%;">Item de Custo / Investimento</th>
                <th class="th-center" style="width: 25%;">Critério</th>
                <th class="th-right" style="width: 25%;">Valor Estimado (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${this.tipoOperacao() !== 'construcao' ? `
                <tr>
                  <td><strong>Aquisição do Terreno / Lote</strong></td>
                  <td class="td-center">Valor Lançado</td>
                  <td class="td-right">R$ ${this.formatarMoeda(this.valorTerreno())}</td>
                </tr>
              ` : ''}
              ${this.tipoOperacao() !== 'compra_terreno' ? `
                <tr>
                  <td><strong>Custo da Edificação (Base CUB/m²)</strong></td>
                  <td class="td-center">${this.areaTotal()} m² @ R$ ${this.formatarMoeda(this.valorCubEstadoAtual())}</td>
                  <td class="td-right">R$ ${this.formatarMoeda(this.custoBase())}</td>
                </tr>
              ` : ''}
              ${this.areasExternas().length > 0 ? `
                <tr>
                  <td><strong>Áreas Externas e Lazer</strong></td>
                  <td class="td-center">${this.areaExternaTotal()} m²</td>
                  <td class="td-right">R$ ${this.formatarMoeda(this.calcularCustoAreasExternas())}</td>
                </tr>
              ` : ''}
              ${itensAdicionaisRows}
            </tbody>
            <tfoot>
              <tr class="highlight-navy">
                <td colspan="2"><strong>INVESTIMENTO TOTAL ESTIMADO</strong></td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(res?.custoTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 4. CHECKLIST DE DOCUMENTAÇÃO BANCÁRIA -->
        <div class="doc-section">
          <div class="doc-section-title">
            4. Auditoria da Pasta de Crédito (${this.tipoRenda().toUpperCase()} • Prontidão: ${this.percentualDocumentacao()}%)
          </div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 35%;">Documento Requerido</th>
                <th class="th-center" style="width: 15%;">Exigência</th>
                <th class="th-center" style="width: 18%;">Status</th>
                <th style="width: 32%;">Arquivo / Observação</th>
              </tr>
            </thead>
            <tbody>
              ${docsRows}
            </tbody>
          </table>
        </div>

        <!-- 5. SIMULAÇÃO DE FINANCIAMENTO & LINHA DE CRÉDITO -->
        <div class="doc-section">
          <div class="doc-section-title">5. Simulação de Financiamento & Condições Contratuais</div>
          <div class="doc-card-info" style="margin-bottom: 8px;">
            <div class="doc-grid-2">
              <div>
                <span class="info-label">Linha de Crédito Selecionada:</span>
                <span class="info-value">${linhaInfo}</span>
              </div>
              <div>
                <span class="info-label">Sistema de Amortização:</span>
                <span class="info-value"><strong>${this.sistemaAmortizacao().toUpperCase()}</strong> (${this.sistemaAmortizacao() === 'sac' ? 'Parcelas Decrescentes' : 'Parcelas Fixas - Tabela Price'})</span>
              </div>
            </div>
          </div>

          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 25%;">Valor Total</th>
                <th class="th-center" style="width: 25%;">Entrada (${this.percentualEntrada()}%)</th>
                <th class="th-center" style="width: 25%;">Valor Financiável</th>
                <th class="th-right" style="width: 25%;">Prazo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>R$ ${this.formatarMoeda(res?.custoTotal)}</strong></td>
                <td class="td-center">R$ ${this.formatarMoeda(res?.valorEntrada)}</td>
                <td class="td-center"><strong>R$ ${this.formatarMoeda(res?.valorFinanciavel)}</strong></td>
                <td class="td-right"><strong>${this.prazoAnos()} anos</strong> (${this.prazoAnos() * 12} meses)</td>
              </tr>
            </tbody>
          </table>

          <table class="doc-table" style="margin-top: 6px;">
            <thead>
              <tr>
                <th style="width: 25%;">Taxa de Juros Nominal</th>
                <th class="th-center" style="width: 25%;">1ª Parcela Estimada</th>
                <th class="th-center" style="width: 25%;">${this.sistemaAmortizacao() === 'sac' ? 'Última Parcela (SAC)' : 'Parcela Média'}</th>
                <th class="th-right" style="width: 25%;">Total Estimado de Juros</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${this.taxaJurosAnual()}% a.a.</strong></td>
                <td class="td-center font-bold" style="color: var(--p4-navy);">R$ ${this.formatarMoeda(this.getPrimeiraParcela())}</td>
                <td class="td-center font-bold">${this.sistemaAmortizacao() === 'sac' ? `R$ ${this.formatarMoeda(this.getUltimaParcela())}` : `R$ ${this.formatarMoeda(res?.parcela)}`}</td>
                <td class="td-right" style="color: var(--p4-copper);"><strong>R$ ${this.formatarMoeda(totalJuros)}</strong></td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="highlight-gray">
                <td colspan="3"><strong>DESEMBOLSO TOTAL NO PRAZO (Entrada + Parcelas)</strong></td>
                <td class="td-right font-bold">R$ ${this.formatarMoeda(res?.totalPago)}</td>
              </tr>
            </tfoot>
          </table>

          ${this.temJurosObra() ? `
            <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 6px 10px; margin-top: 6px; font-size: 7pt; color: #92400E;">
              <strong>Juros de Obra Ativados:</strong> Durante a fase construtiva de ${this.prazoObraMeses()} meses, incidem juros proporcionais à evolução física com taxa de ${this.taxaJurosObra()}% a.a., amortizando o saldo devedor integralmente ${this.textoConclusaoObra().pdfObra}.
            </div>
          ` : ''}
        </div>

        ${construirVsAlugarSecao}

        <!-- 7. NOTA METODOLÓGICA LEGAL -->
        <div class="doc-legal-note" style="margin-top: 14px; font-size: 7pt; color: #64748B; border-top: 1px solid var(--p4-rule, #CBD5E1); padding-top: 6px;">
          <strong>Nota Metodológica & Normas Técnicas:</strong> Estudo paramétrico fundamentado na NBR 12.721 (Avaliação de custos unitários e preparo de orçamento para incorporação de edifício) e índices do Custo Unitário Básico (CUB/m²) divulgados pelos respectivos Sinduscons estaduais. As simulações de crédito imobiliário seguem as diretrizes operacionais do SFH (Sistema Financeiro da Habitação) e SFI (Sistema de Financiamento Imobiliário), sujeitas à aprovação cadastral e análise jurídica de garantias pela instituição financeira concedente.
        </div>
      `;

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: 'Relatório Consolidado de Viabilidade e Crédito Imobiliário',
          subtituloDocumento: `Dossiê Executivo de Crédito • ${this.nomeProjeto()}`,
          nomeAgente: 'Viabiliza IA - Crédito & Viabilidade Imobiliária'
        },
        corpoHtml
      );
    } catch (err: any) {
      console.error('Erro ao gerar relatório consolidado em PDF:', err);
      this.motorPdfService.exibirToast('Erro ao gerar o relatório consolidado em PDF.', 'erro');
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  // --- EMPACOTAMENTO EM PACOTE COMPLETO ZIP (ETAPA 7) ---

  async baixarPacoteCompletoZip(): Promise<void> {
    const proj = this.projetoAtual();
    if (!proj?.id) {
      this.mensagemErro.set('Abra um projeto para gerar o pacote ZIP.');
      return;
    }

    this.gerandoZip.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);

    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      if (!perfil?.crea_cau || perfil.crea_cau.trim().length <= 2) {
        this.motorPdfService.exibirToast(
          'Registro Profissional Obrigatório: Para gerar o pacote oficial com validade técnica, cadastre seu CREA/CAU/CFT na aba "Meu Perfil > Dados para Documentos Técnicos".',
          'erro'
        );
        return;
      }

      const zip = new JSZip();

      // 1. Gera o PDF consolidado em formato binário via jsPDF
      const doc = await this.gerarDocJsPdf(perfil);
      const pdfBlob = doc.output('blob');
      const safeProjectName = (this.nomeProjeto() || 'Projeto').replace(/[^a-zA-Z0-9_-]/g, '_');
      zip.file(`00-Relatorio-Consolidado-ViabilizaIA-${safeProjectName}.pdf`, pdfBlob);

      // 2. Baixa e empacota todos os documentos anexados do Storage
      const docs = this.documentosEnviados();
      if (docs && docs.length > 0) {
        const pastaDocs = zip.folder('Documentos-Anexados') || zip;
        for (let i = 0; i < docs.length; i++) {
          const d = docs[i];
          if (!d.caminho_storage) continue;

          const { data: blob, error } = await this.supabaseService.baixarArquivoDocumentoCredito(d.caminho_storage);
          if (blob) {
            const ext = (d.nome_arquivo || '').split('.').pop() || 'pdf';
            const numPrefix = String(i + 1).padStart(2, '0');
            const docIdFormatado = (d.documento_id || 'documento').toUpperCase().replace(/_/g, '-');
            const nomeFormatado = `${numPrefix}-${docIdFormatado}.${ext}`;
            pastaDocs.file(nomeFormatado, blob);
          } else {
            console.warn(`Aviso ao baixar anexo ${d.caminho_storage}:`, error);
          }
        }
      }

      // 3. Gera o arquivo ZIP e dispara o download no navegador
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const clienteOuProjeto = (this.nomeCliente() || this.nomeProjeto() || 'Cliente')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');
      const dataStr = new Date().toISOString().split('T')[0];
      const nomeZip = `Pasta-Credito-${clienteOuProjeto}-${dataStr}.zip`;

      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nomeZip;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      this.mensagemSucesso.set(`Pacote "${nomeZip}" gerado e baixado com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao gerar pacote ZIP:', err);
      this.mensagemErro.set(err?.message || 'Falha ao empacotar arquivos em ZIP.');
    } finally {
      this.gerandoZip.set(false);
    }
  }

  // --- GERAÇÃO DA PASTA DE CRÉDITO EM PDF ÚNICO (FRENTE 4 - pdf-lib) ---

  async gerarPastaCreditoPdfUnico(): Promise<void> {
    const proj = this.projetoAtual();
    if (!proj?.id) {
      this.mensagemErro.set('Abra um projeto para gerar a pasta completa.');
      return;
    }

    this.gerandoPdfUnico.set(true);
    this.mensagemErro.set(null);
    this.mensagemSucesso.set(null);
    const avisos: string[] = [];

    try {
      const perfil = await this.motorPdfService.obterPerfilDocumental();
      if (!perfil?.crea_cau || perfil.crea_cau.trim().length <= 2) {
        this.motorPdfService.exibirToast(
          'Registro Profissional Obrigatório: cadastre seu CREA/CAU/CFT antes de gerar a pasta completa.',
          'erro'
        );
        return;
      }

      // 1. Gera o dossiê (seções 00-05) com jsPDF, como já é feito hoje
      const docJsPdf = await this.gerarDocJsPdf(perfil);
      const dossieBytes = docJsPdf.output('arraybuffer');

      // 2. Carrega o dossiê no pdf-lib como documento base
      const pdfFinal = await PDFDocument.load(dossieBytes);

      // 3. Adiciona a folha separadora da Seção 06
      await this.adicionarFolhaSeparadora(
        pdfFinal,
        '06',
        'ANEXOS DOCUMENTAIS',
        'A partir desta página, os documentos originais enviados pelo cliente são reproduzidos integralmente, sem edição de conteúdo.'
      );

      // 4. Mescla cada documento do cliente, na ordem em que aparecem no checklist
      const docs = this.documentosEnviados();
      for (const d of docs) {
        if (!d.caminho_storage) continue;

        const { data: blob, error } = await this.supabaseService.baixarArquivoDocumentoCredito(d.caminho_storage);
        if (!blob) {
          avisos.push(`Não foi possível incluir "${d.nome_arquivo}" na pasta (${error?.message || 'erro ao baixar'}).`);
          continue;
        }

        const tipoMime = (d.tipo_mime || '').toLowerCase();
        const bytes = await blob.arrayBuffer();

        try {
          if (tipoMime === 'application/pdf' || d.nome_arquivo.toLowerCase().endsWith('.pdf')) {
            await this.mesclarPaginasPdf(pdfFinal, bytes, d.nome_arquivo);
          } else if (tipoMime.startsWith('image/') || /\.(jpe?g|png)$/i.test(d.nome_arquivo)) {
            await this.mesclarImagemComoPagina(pdfFinal, bytes, tipoMime, d.nome_arquivo);
          } else {
            avisos.push(`"${d.nome_arquivo}" está em um formato que não pode ser mesclado automaticamente (${d.tipo_mime || 'desconhecido'}). Anexe manualmente ao protocolar, ou converta para PDF antes de reenviar.`);
          }
        } catch (e: any) {
          // PDF protegido por senha é o caso mais comum de falha aqui
          avisos.push(`"${d.nome_arquivo}" não pôde ser processado (${e?.message?.includes('encrypt') ? 'arquivo protegido por senha' : 'arquivo corrompido ou inválido'}). Remova a proteção ou reenvie o arquivo.`);
        }
      }

      // 5. Gera o PDF final e dispara o download
      const pdfBytesFinal = await pdfFinal.save();
      const blob = new Blob([pdfBytesFinal.buffer as ArrayBuffer], { type: 'application/pdf' });
      const clienteOuProjeto = (this.nomeCliente() || this.nomeProjeto() || 'Cliente')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');
      const dataStr = new Date().toISOString().split('T')[0];
      const nomeArquivo = `Pasta-Credito-${clienteOuProjeto}-${dataStr}.pdf`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      if (avisos.length > 0) {
        this.mensagemErro.set(`Pasta gerada com ${avisos.length} pendência(s): ${avisos.join(' | ')}`);
      } else {
        this.mensagemSucesso.set(`Pasta "${nomeArquivo}" gerada com sucesso — arquivo único pronto para protocolo.`);
      }
    } catch (err: any) {
      console.error('Erro ao gerar pasta completa em PDF único:', err);
      this.mensagemErro.set(err?.message || 'Falha ao gerar a pasta em PDF único.');
    } finally {
      this.gerandoPdfUnico.set(false);
    }
  }

  async mesclarPaginasPdf(pdfFinal: PDFDocument, bytesOrigem: ArrayBuffer, nomeArquivo: string): Promise<void> {
    const docOrigem = await PDFDocument.load(bytesOrigem, { ignoreEncryption: false });
    const paginas = await pdfFinal.copyPages(docOrigem, docOrigem.getPageIndices());
    paginas.forEach(p => pdfFinal.addPage(p));
  }

  async mesclarImagemComoPagina(pdfFinal: PDFDocument, bytesOrigem: ArrayBuffer, tipoMime: string, nomeArquivo: string): Promise<void> {
    const imagem = (tipoMime.includes('png') || nomeArquivo.toLowerCase().endsWith('.png'))
      ? await pdfFinal.embedPng(bytesOrigem)
      : await pdfFinal.embedJpg(bytesOrigem);

    // Página A4 (595.28 x 841.89 pt), imagem centralizada e redimensionada
    // proporcionalmente para caber com margem de 40pt
    const pagina = pdfFinal.addPage([595.28, 841.89]);
    const larguraMax = 515.28;
    const alturaMax = 761.89;
    const escala = Math.min(larguraMax / imagem.width, alturaMax / imagem.height, 1);
    const largura = imagem.width * escala;
    const altura = imagem.height * escala;

    pagina.drawImage(imagem, {
      x: (595.28 - largura) / 2,
      y: (841.89 - altura) / 2,
      width: largura,
      height: altura
    });
  }

  async adicionarFolhaSeparadora(pdfFinal: PDFDocument, numero: string, titulo: string, descricao: string): Promise<void> {
    const pagina = pdfFinal.addPage([595.28, 841.89]);
    const fonteBold = await pdfFinal.embedFont(StandardFonts.HelveticaBold);
    const fonteRegular = await pdfFinal.embedFont(StandardFonts.Helvetica);

    pagina.drawText(numero, { x: 60, y: 650, size: 64, font: fonteBold, color: rgb(0.71, 0.39, 0.16) }); // copper #B5642A
    pagina.drawText(titulo, { x: 60, y: 600, size: 20, font: fonteBold, color: rgb(0.075, 0.165, 0.255) }); // navy #132A41
    pagina.drawText(descricao, { x: 60, y: 570, size: 10, font: fonteRegular, color: rgb(0.27, 0.27, 0.27), maxWidth: 475, lineHeight: 14 });
  }

  // --- GERADOR DO DOSSIÊ TÉCNICO BINÁRIO (SEÇÕES 00 A 05) VIA jsPDF ---

  async gerarDocJsPdf(perfil: any): Promise<jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const res = this.resultado();
    const totalJuros = res ? Math.max(0, res.totalPago - res.valorFinanciavel) : 0;
    const totalAluguel = (this.areaTotal() || 0) * (this.valorAluguelM2() || 35) * (this.prazoAnos() || 25) * 12;

    const nomeEmpresa = perfil?.company_name || perfil?.full_name || 'EMPRESA DE ENGENHARIA';
    const respTecnico = perfil?.full_name || 'Responsável Técnico';
    const crea = perfil?.crea_cau || 'CREA/CAU 000000/D';
    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    const logoUrl = await carregarLogoComFallback(
      [perfil?.company_logo_url, '/logo-header.svg'].filter((u): u is string => !!u),
      120, 40
    );

    const desenharCabecalho = (tituloSecao: string, subtituloSecao: string) => {
      doc.setFillColor(19, 42, 65); // #132A41 Navy
      doc.rect(14, 10, 182, 16, 'F');
      doc.setFillColor(181, 100, 42); // #B5642A Copper
      doc.rect(14, 26, 182, 1.2, 'F');

      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', 16, 11.5, 14, 5);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(nomeEmpresa.toUpperCase(), logoUrl ? 32 : 20, 17);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      const cnpj = perfil?.company_cnpj ? ` • CNPJ ${perfil.company_cnpj}` : '';
      doc.text(`RESP. TÉCNICO: ${respTecnico.toUpperCase()} • ${crea}${cnpj}`, logoUrl ? 32 : 20, 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(232, 178, 126); // #E8B27E
      doc.text(tituloSecao.toUpperCase(), 190, 17, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text(subtituloSecao, 190, 22, { align: 'right' });
    };

    // ==========================================
    // SEÇÃO 00 — CAPA + ÍNDICE + RESUMO EXECUTIVO
    // ==========================================
    desenharCabecalho('PASTA TÉCNICA DE CRÉDITO IMOBILIÁRIO', `EMISSÃO: ${dataEmissao}`);

    let currentY = 32;

    // 00.1 Identificação do Projeto
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['00.1 IDENTIFICAÇÃO DO PROJETO & LOCALIZAÇÃO', '']],
      body: [
        ['Nome do Projeto:', this.nomeProjeto()],
        ['Cliente / Proponente:', this.nomeCliente() || 'Não informado'],
        ['Trilha Operacional:', this.getTipoOperacaoLabel(this.tipoOperacao())],
        ['Localização:', `${this.cidade() ? this.cidade() + ' - ' : ''}${this.uf()}`],
        ['Endereço / Lote:', this.endereco() || 'A definir'],
        ['CUB de Referência Estadual:', `R$ ${this.formatarMoeda(this.valorCubEstadoAtual())}/m² (${this.infoCubEstadoAtual()})`]
      ],
      headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 7.2, cellPadding: 1.3, textColor: [30, 41, 59] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 00.2 Índice Estrutural da Pasta Protocolável
    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [['00.2 ÍNDICE ESTRUTURAL DA PASTA PROTOCOLÁVEL', 'Conteúdo Sequencial']],
      body: [
        ['Seção 00', 'Capa, Identificação do Projeto, Índice Geral e Resumo Executivo'],
        ['Seção 01', 'Documentação do Proponente (Identificação Civil, Regime de Renda e Vínculo)'],
        ['Seção 02', 'Documentação do Imóvel (Titularidade, Matrícula, IPTU e Regularidade Cartorária)'],
        ['Seção 03', 'Peças Técnicas de Engenharia (Quadro NBR 12721, Orçamento, Curva S e Memorial)'],
        ['Seção 04', 'Simulação Financeira Bancária & Estudo Comparativo Patrimonial'],
        ['Seção 05', 'Provisão de Custos Transacionais & Termo de Responsabilidade Técnica'],
        ['Seção 06', 'Anexos Documentais do Cliente (Reprodução Integral e Sequencial dos Originais)']
      ],
      headStyles: { fillColor: [181, 100, 42], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      styles: { fontSize: 6.8, cellPadding: 1.1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 26, fillColor: [248, 250, 252] } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 00.3 Resumo Executivo Financeiro
    const resumoCustos: string[][] = [];
    if (this.tipoOperacao() !== 'construcao') {
      resumoCustos.push(['Aquisição de Terreno / Lote', 'Lançamento', `R$ ${this.formatarMoeda(this.valorTerreno())}`]);
    }
    if (this.tipoOperacao() !== 'compra_terreno') {
      resumoCustos.push(['Custo da Edificação Base (CUB)', `${this.areaTotal()} m²`, `R$ ${this.formatarMoeda(this.custoBase())}`]);
    }
    if (this.areasExternas().length > 0) {
      resumoCustos.push(['Áreas Externas e Lazer', `${this.areaExternaTotal()} m²`, `R$ ${this.formatarMoeda(this.calcularCustoAreasExternas())}`]);
    }

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['00.3 RESUMO EXECUTIVO DO EMPREENDIMENTO', 'Critério', 'Valor Estimado (R$)']],
      body: resumoCustos,
      foot: [
        ['INVESTIMENTO TOTAL ESTIMADO', '100%', `R$ ${this.formatarMoeda(res?.custoTotal)}`],
        ['Recursos Próprios (Entrada)', `${this.percentualEntrada()}%`, `R$ ${this.formatarMoeda(res?.valorEntrada)}`],
        ['Financiamento Bancário Solicitado', `${100 - this.percentualEntrada()}%`, `R$ ${this.formatarMoeda(res?.valorFinanciavel)}`],
        ['1ª Parcela Estimada (Inicial)', this.sistemaAmortizacao().toUpperCase(), `R$ ${this.formatarMoeda(this.getPrimeiraParcela())}`]
      ],
      headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      footStyles: { fillColor: [248, 250, 252], textColor: [181, 100, 42], fontStyle: 'bold', fontSize: 7.2 },
      styles: { fontSize: 6.8, cellPadding: 1.1 },
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
    });

    // =========================================================================
    // PÁGINA 2: SEÇÃO 01 & 02 — DOCUMENTAÇÃO PROPONENTE E DOCUMENTAÇÃO DO IMÓVEL
    // =========================================================================
    doc.addPage();
    desenharCabecalho('SEÇÕES 01 & 02 — AUDITORIA DOCUMENTAL', `PRONTIDÃO: ${this.percentualDocumentacao()}%`);

    currentY = 32;

    // Seção 01: Documentos do Proponente
    const idsProponente = [
      'rg_cpf', 'comprovante_residencia', 'certidao_casamento',
      'contracheque', 'carteira_trabalho', 'declaracao_empregador',
      'declaracao_ir', 'extrato_bancario', 'decore',
      'contrato_social', 'balanco_patrimonial', 'declaracao_ir_pj', 'declaracao_ir_pf'
    ];
    const docsProponente = this.getDocumentosAtuais().filter(d => idsProponente.includes(d.id));
    const bodyDocs01 = docsProponente.map(d => {
      const anexado = this.obterDocumentoEnviado(d.id);
      const marcado = this.isDocumentoMarcado(d.id);
      const statusStr = anexado ? '✓ Anexado' : (marcado ? '✓ Entregue' : '✗ Pendente');
      const arqStr = anexado ? `${anexado.nome_arquivo} (${this.formatarTamanhoBytes(anexado.tamanho_bytes)})` : '—';
      return [d.nome, d.obrigatorio ? 'Obrigatório' : 'Opcional', statusStr, arqStr];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [[`01. DOCUMENTAÇÃO DO PROPONENTE (REGIME: ${this.tipoRenda().toUpperCase()})`, 'Exigência', 'Status', 'Arquivo Anexado']],
      body: bodyDocs01.length > 0 ? bodyDocs01 : [['Nenhum documento listado', '—', '—', '—']],
      headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      styles: { fontSize: 6.7, cellPadding: 1.1 },
      columnStyles: {
        1: { halign: 'center', cellWidth: 24 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 24 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Seção 02: Documentos do Imóvel e Regularidade
    const docsImovel = this.getDocumentosAtuais().filter(d => !idsProponente.includes(d.id));
    const bodyDocs02 = docsImovel.map(d => {
      const anexado = this.obterDocumentoEnviado(d.id);
      const marcado = this.isDocumentoMarcado(d.id);
      const statusStr = anexado ? '✓ Anexado' : (marcado ? '✓ Entregue' : '✗ Pendente');
      const arqStr = anexado ? `${anexado.nome_arquivo} (${this.formatarTamanhoBytes(anexado.tamanho_bytes)})` : '—';
      return [d.nome, d.obrigatorio ? 'Obrigatório' : 'Opcional', statusStr, arqStr];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['02. DOCUMENTAÇÃO DO IMÓVEL, TITULARIDADE & LICENÇAS', 'Exigência', 'Status', 'Arquivo Anexado']],
      body: bodyDocs02.length > 0 ? bodyDocs02 : [['Não aplicável a esta modalidade', '—', '—', '—']],
      headStyles: { fillColor: [181, 100, 42], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      styles: { fontSize: 6.7, cellPadding: 1.1 },
      columnStyles: {
        1: { halign: 'center', cellWidth: 24 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 24 }
      }
    });

    // ===============================================
    // PÁGINA 3: SEÇÃO 03 — PEÇAS TÉCNICAS DE ENGENHARIA
    // ===============================================
    doc.addPage();
    desenharCabecalho('SEÇÃO 03 — PEÇAS TÉCNICAS DE ENGENHARIA', 'NORMAS ABNT NBR 12721 / 15575 / 16747');

    currentY = 32;

    // 03.1 Quadro de Áreas NBR 12721
    const ambientesBody = this.ambientes().map(a => [
      a.nome,
      a.tamanho,
      a.dimensoes,
      `${a.area.toFixed(1)} m²`,
      (a.coeficienteEquivalencia ?? 1.0).toFixed(2),
      `${(a.areaEquivalente ?? a.area).toFixed(2)} m²`
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      head: [[`03.1 QUADRO DE ÁREAS (NBR 12721) • ${this.pavimentos()} PAV.`, 'Porte', 'Dimensões', 'Área Real', 'Coef. NBR', 'Área Equiv.']],
      body: ambientesBody.length > 0 ? ambientesBody : [['Padrão do Empreendimento', '—', '—', `${this.areaTotal()} m²`, '1.00', `${this.areaTotal()} m²`]],
      foot: [[`TOTAIS DO EMPREENDIMENTO`, '', '', `${this.areaTotal()} m²`, '—', `${this.areaEquivalenteTotal().toFixed(2)} m²`]],
      headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [19, 42, 65], fontStyle: 'bold', fontSize: 7 },
      styles: { fontSize: 6.5, cellPadding: 1 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 03.2 Orçamento por Macroetapa
    const macroBody = this.macroetapas().map(m => [
      m.nome,
      `${(m.percentualAjustado || 0).toFixed(1)}%`,
      `R$ ${this.formatarMoeda(m.valorEstimado || 0)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['03.2 ORÇAMENTO POR MACROETAPA DA EDIFICAÇÃO', 'Peso (%)', 'Valor Estimado (R$)']],
      body: macroBody.length > 0 ? macroBody : [['Custo Total Paramétrico da Obra', '100%', `R$ ${this.formatarMoeda(this.custoBase())}`]],
      foot: [['TOTAL CUSTO DA CONSTRUÇÃO', '100.0%', `R$ ${this.formatarMoeda(this.custoBase())}`]],
      headStyles: { fillColor: [181, 100, 42], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      footStyles: { fillColor: [248, 250, 252], textColor: [181, 100, 42], fontStyle: 'bold', fontSize: 7 },
      styles: { fontSize: 6.5, cellPadding: 1 },
      columnStyles: {
        1: { halign: 'center', cellWidth: 26 },
        2: { halign: 'right', fontStyle: 'bold', cellWidth: 42 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 03.3 Cronograma Físico-Financeiro em Curva S
    const cronograma = this.cronogramaObra();
    if (cronograma.length > 0) {
      const cronoBody = cronograma.map(c => [
        `Mês ${c.mes}${c.retidoGarantia ? ' (Garantia)' : ''}`,
        c.macroetapaPredominante,
        `${c.percentualFisicoMes.toFixed(1)}%`,
        `${c.percentualAcumulado.toFixed(1)}%`,
        `R$ ${this.formatarMoeda(c.liberacaoMes)}`,
        `R$ ${this.formatarMoeda(c.saldoLiberadoAcumulado)}`
      ]);

      autoTable(doc, {
        startY: currentY,
        theme: 'striped',
        head: [['03.3 CRONOGRAMA FÍSICO-FINANCEIRO EM CURVA S', 'Etapa Predominante', '% Mês', '% Acum.', 'Liberação Mês', 'Saldo Acumulado']],
        body: cronoBody,
        headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.2, fontStyle: 'bold' },
        styles: { fontSize: 6.3, cellPadding: 0.9 },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' }
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 4;
    }

    // 03.4 Memorial Descritivo
    const mem = this.memorialDescritivo();
    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['03.4 MEMORIAL DESCRITIVO DE ESPECIFICAÇÕES E SISTEMAS', '']],
      body: [
        ['Padrão de Acabamento & Sistema Construtivo:', `Padrão ${mem.padraoAcabamento.toUpperCase()} • ${mem.sistemaConstrutivo}`],
        ['Fundações & Estrutura:', `${mem.fundacao} | ${mem.estrutura}`],
        ['Vedações & Cobertura:', `${mem.vedacoes} | ${mem.cobertura}`],
        ['Impermeabilização & Instalações:', `${mem.impermeabilizacao} | ${mem.instalacoesHidraulicas} / ${mem.instalacoesEletricas}`],
        ['Esquadrias, Revestimentos & Pintura:', `${mem.esquadrias} | ${mem.revestimentosInternos} | ${mem.pintura}`],
        ['Conformidades Técnicas Normativas:', `ABNT NBR 15575 (Desempenho Edificações): ${mem.conformidadeNbr15575 ? 'Atendida' : 'Parcial'} • ABNT NBR 9575 (Impermeabilização): ${mem.conformidadeNbr9575 ? 'Atendida' : 'Parcial'}`]
      ],
      headStyles: { fillColor: [181, 100, 42], textColor: 255, fontSize: 7.2, fontStyle: 'bold' },
      styles: { fontSize: 6.2, cellPadding: 0.9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [248, 250, 252] } }
    });

    // ===================================================================================
    // PÁGINA 4: SEÇÕES 04 & 05 — SIMULAÇÃO FINANCEIRA, CUSTOS TRANSACIONAIS & RESP. TÉCNICA
    // ===================================================================================
    doc.addPage();
    desenharCabecalho('SEÇÕES 04 & 05 — SIMULAÇÃO & RESP. TÉCNICA', 'CONDICIONAMENTO BANCÁRIO & CUSTOS');

    currentY = 32;

    // Seção 04: Simulação Financeira
    const bodySimulacao: string[][] = [
      ['Sistema de Amortização:', this.sistemaAmortizacao().toUpperCase()],
      ['Taxa de Juros Anual:', `${this.taxaJurosAnual()}% a.a.`],
      ['Prazo Contratual:', `${this.prazoAnos()} anos (${this.prazoAnos() * 12} parcelas)`],
      ['Primeira Parcela Estimada:', `R$ ${this.formatarMoeda(this.getPrimeiraParcela())}`],
      [this.sistemaAmortizacao() === 'sac' ? 'Última Parcela (SAC):' : 'Parcela Média:', `R$ ${this.formatarMoeda(this.sistemaAmortizacao() === 'sac' ? this.getUltimaParcela() : res?.parcela)}`],
      ['Total Estimado de Juros:', `R$ ${this.formatarMoeda(totalJuros)}`],
      ['Desembolso Total no Prazo:', `R$ ${this.formatarMoeda(res?.totalPago)}`]
    ];

    if (this.temJurosObra()) {
      bodySimulacao.push([
        'Juros de Fase de Obra:',
        `Prazo: ${this.prazoObraMeses()} meses • Taxa: ${this.taxaJurosObra()}% a.a. (${this.textoConclusaoObra().pdfObra})`
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['04. CONDICIONAMENTO FINANCEIRO BANCÁRIO (SIMULAÇÃO)', '']],
      body: bodySimulacao,
      headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      styles: { fontSize: 7, cellPadding: 1.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] },
        1: { fontStyle: 'bold' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // Seção 05: Custos Transacionais e Indiretos
    const transacionaisBody: string[][] = [];
    this.itensAdicionais().forEach(i => {
      const valor = i.tipo === 'percentual' ? (this.custoBase() * (i.valor / 100)) : i.valor;
      transacionaisBody.push([i.nome, i.tipo === 'percentual' ? `${i.valor}% s/ custo obra` : 'Custo Fixo Estimado', `R$ ${this.formatarMoeda(valor)}`]);
    });
    // Itens de referência padrão se tabela estiver vazia
    if (transacionaisBody.length === 0) {
      transacionaisBody.push(['Projetos & Licenciamento Municipal', 'Estimado', `R$ ${this.formatarMoeda(this.custoBase() * 0.04)}`]);
      transacionaisBody.push(['ITBI & Emolumentos Cartorários de Registro', 'Estimado (~3% do valor)', `R$ ${this.formatarMoeda((res?.custoTotal || 0) * 0.03)}`]);
      transacionaisBody.push(['Taxa Bancária de Avaliação / Análise de Engenharia', 'Estimado', 'R$ 3.500,00']);
    }

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [['05. PROVISÃO DE CUSTOS TRANSACIONAIS & INDIRETOS', 'Parâmetro', 'Valor Estimado (R$)']],
      body: transacionaisBody,
      headStyles: { fillColor: [181, 100, 42], textColor: 255, fontSize: 7.8, fontStyle: 'bold' },
      styles: { fontSize: 6.8, cellPadding: 1.1 },
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Estudo Comparativo Construir vs Alugar
    if (this.tipoOperacao() !== 'compra_terreno') {
      autoTable(doc, {
        startY: currentY,
        theme: 'striped',
        head: [['ESTUDO PATRIMONIAL: CONSTRUIR VS. ALUGAR', `Prazo: ${this.prazoAnos()} anos`, 'Resultado Patrimonial']],
        body: [
          ['Construção Financiada', `R$ ${this.formatarMoeda(res?.totalPago)}`, 'Imóvel integralmente quitado no patrimônio da família'],
          ['Aluguel Acumulado', `R$ ${this.formatarMoeda(totalAluguel)}`, 'Despesa acumulada a fundo perdido (zero patrimônio)']
        ],
        headStyles: { fillColor: [19, 42, 65], textColor: 255, fontSize: 7.4, fontStyle: 'bold' },
        styles: { fontSize: 6.7, cellPadding: 1 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Termo de Responsabilidade Técnica & Assinatura
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Nota de Responsabilidade Técnica: Estudo paramétrico fundamentado nas normas ABNT NBR 12.721, NBR 15.575 e NBR 16.747, com orçamentação alinhada aos índices do Sinduscon/CUB e diretrizes de engenharia dos agentes financeiros do SFH/SFI. Condições de concessão, margem consignável e taxas finais sujeitas à análise cadastral do banco operador.',
      14,
      currentY + 2,
      { maxWidth: 182, lineHeightFactor: 1.25 }
    );

    doc.setDrawColor(203, 213, 225);
    doc.line(70, currentY + 20, 140, currentY + 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(19, 42, 65);
    doc.text(respTecnico, 105, currentY + 24, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    const cnpjAssinatura = perfil?.company_cnpj ? ` • CNPJ ${perfil.company_cnpj}` : '';
    doc.text(`${crea} • ${nomeEmpresa}${cnpjAssinatura}`, 105, currentY + 27.5, { align: 'center' });

    // Numeração de Página em Todas as Páginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(216, 208, 198);
      doc.line(14, 287, 196, 287);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${nomeEmpresa} • Viabiliza IA • Pasta Técnica de Crédito Imobiliário`, 14, 291);
      doc.text(`Página ${i} de ${totalPages}`, 196, 291, { align: 'right' });
      if (perfil?.company_address) {
        doc.setFontSize(5.8);
        doc.text(perfil.company_address, 14, 294.5, { maxWidth: 182 });
      }
    }

    return doc;
  }
}

