import { Component, ChangeDetectionStrategy, signal, computed, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { MotorPdfService } from '../../../services/motor-pdf.service';
import {
  ItemBaldrame,
  ItemBloco,
  ItemSapata,
  ItemRadier,
  ItemTubulao,
  ItemPilar,
  ItemViga,
  ItemLaje,
  ItemArquitetonico,
  ItemEsquadria,
  ItemCobertura,
  ItemPergolado,
  ItemInstalacao,
  ItemInstalacaoPredial,
  SistemaInstalacao,
  CategoriaConfig,
  CATEGORIAS_POR_SISTEMA,
  ItemPaisagismo,
  ItemResumoConsolidado,
  RegraAuditoria,
  ParametrosCalculo,
  MargensPerda,
  TABELA_BITOLAS_PADRAO,
  CHECKLIST_INSTALACOES_GUIA
} from './levantamento-quantitativos.data';

export type AbaDisciplina =
  | 'baldrame'
  | 'blocos'
  | 'sapatas'
  | 'radier'
  | 'tubuloes'
  | 'pilares'
  | 'vigas'
  | 'lajes'
  | 'arquitetonico'
  | 'esquadrias'
  | 'cobertura'
  | 'pergolados'
  | 'distribuicao-eletrica'
  | 'prumadas-eletricas'
  | 'esgoto-pluvial'
  | 'hidraulica'
  | 'paisagismo'
  | 'resumo';

@Component({
  selector: 'app-levantamento-quantitativos',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './levantamento-quantitativos.component.html',
  styles: [`
    .aba-scroll {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f8fafc;
      -webkit-overflow-scrolling: touch;
    }
    .aba-scroll::-webkit-scrollbar {
      height: 6px;
    }
    .aba-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 999px;
    }
    .aba-scroll::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .aba-scroll::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 999px;
    }
  `]
})
export class LevantamentoQuantitativosComponent implements AfterViewInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly motorPdfService = inject(MotorPdfService);

  @ViewChild('tabsContainer') tabsContainer?: ElementRef<HTMLDivElement>;

  readonly abaAtiva = signal<AbaDisciplina>('baldrame');
  readonly podeRolarEsquerda = signal<boolean>(false);
  readonly podeRolarDireita = signal<boolean>(true);
  readonly mensagemNotificacao = signal<string | null>(null);
  readonly calculadoraBitolaAberta = signal<boolean>(false);
  readonly bitolasState = signal<Record<string, number>>({});
  readonly alvoCalculadoraBitola = signal<string | null>(null);
  readonly gerandoPdf = signal<boolean>(false);

  // ==================== GESTÃO DE PROJETOS SALVOS (SUPABASE) ====================
  readonly projetoAtualId = signal<string | null>(null);
  readonly projetoAtualNome = signal<string>('');
  readonly salvandoProjeto = signal<boolean>(false);
  readonly modalSalvarAberto = signal<boolean>(false);
  readonly modalSalvarNomeInput = signal<string>('');
  readonly modalProjetosAberto = signal<boolean>(false);
  readonly carregandoProjetos = signal<boolean>(false);
  readonly listaProjetosSalvos = signal<any[]>([]);
  readonly toastMensagem = signal<{ texto: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);

  readonly checklistGuia = CHECKLIST_INSTALACOES_GUIA;
  readonly tabelaBitolas = TABELA_BITOLAS_PADRAO;
  readonly categoriasPorSistema = CATEGORIAS_POR_SISTEMA;

  // ==================== 8 SISTEMAS DE FUNDAÇÃO E ESTRUTURA ====================
  readonly baldrame = signal<ItemBaldrame[]>([]);
  readonly blocos = signal<ItemBloco[]>([]);
  readonly sapatas = signal<ItemSapata[]>([]);
  readonly radier = signal<ItemRadier[]>([]);
  readonly tubuloes = signal<ItemTubulao[]>([]);
  readonly pilares = signal<ItemPilar[]>([]);
  readonly vigas = signal<ItemViga[]>([]);
  readonly lajes = signal<ItemLaje[]>([]);

  // ==================== OUTRAS DISCIPLINAS ====================
  readonly arquitetonico = signal<ItemArquitetonico[]>([]);
  readonly esquadrias = signal<ItemEsquadria[]>([]);
  readonly cobertura = signal<ItemCobertura[]>([]);
  readonly pergolados = signal<ItemPergolado[]>([]);
  readonly paisagismo = signal<ItemPaisagismo[]>([]);

  // ==================== 4 SISTEMAS REAIS DE INSTALAÇÕES PREDIAIS ====================
  readonly distribuicaoEletrica = signal<ItemInstalacaoPredial[]>([]);
  readonly prumadasEletricas = signal<ItemInstalacaoPredial[]>([]);
  readonly esgotoPluvial = signal<ItemInstalacaoPredial[]>([]);
  readonly hidraulica = signal<ItemInstalacaoPredial[]>([]);

  // Margens de perda configuráveis por sistema e categoria (%)
  readonly perdasCategorias = signal<Record<SistemaInstalacao, Record<string, number>>>({
    'distribuicao-eletrica': {
      'Eletrodutos': 5,
      'Eletrocalhas e Perfilados': 1,
      'Fios e cabos elétricos': 9,
      'Conduletes': 20,
      'Tomadas': 30,
      'Interruptores': 10,
      'Luminárias': 7
    },
    'prumadas-eletricas': {
      'Eletrodutos': 25,
      'Eletrocalhas e Perfilados': 2,
      'Fios e cabos elétricos': 9,
      'Caixas': 20
    },
    'esgoto-pluvial': {
      'Tubulação PVC': 5,
      'Conexões PVC': 1,
      'Tubulação Ferro Fundido': 9,
      'Conexões Ferro Fundido': 20,
      'Acessórios para Esgoto': 20
    },
    'hidraulica': {
      'Tubulação PVC': 5,
      'Conexões PVC': 1,
      'Tubulação Cobre': 9,
      'Conexões Cobre': 20,
      'Registros e Válvulas': 20,
      'Diversos': 2
    }
  });

  // Array legado para compatibilidade segura caso sessões antigas sejam carregadas
  readonly instalacoes = signal<ItemInstalacao[]>([]);

  // ==================== PARÂMETROS E PERDAS Sienge ====================
  readonly parametros = signal<ParametrosCalculo>({
    espessuraLastroDefault: 0.05,
    tempoSolda: 0.05,
    perdaConcretoFundacao: 5,
    perdaFormaFundacao: 1,
    perdaEscavacaoFundacao: 9,
    perdaReaterroFundacao: 20,
    perdaBotaForaFundacao: 30,
    perdaLastroFundacao: 10,
    perdaAcoFundacao: 10,
    perdaSoldaFundacao: 10,
    perdaConcretoTubulao: 5,
    perdaEscavacaoTubulao: 9,
    perdaBotaForaTubulao: 30,
    perdaConcretoEstrutura: 5,
    perdaFormaEstrutura: 1,
    perdaEscoramentoEstrutura: 9,
    perdaAcoEstrutura: 9,
    perdaSoldaEstrutura: 9,
    perdaArquitetonico: 8,
    perdaCobertura: 5,
    perdaEsquadrias: 0,
    perdaInstalacoes: 7,
    perdaPaisagismo: 5
  });

  readonly margensPerda = signal<MargensPerda>({
    baldrame: 5,
    blocos: 5,
    sapatas: 5,
    radier: 5,
    tubuloes: 5,
    pilares: 5,
    vigas: 5,
    lajes: 5,
    fundacoes: 5,
    estrutura: 5,
    arquitetonico: 8,
    cobertura: 5,
    esquadrias: 0,
    instalacoes: 7,
    paisagismo: 5
  });

  // ==================== TOTAIS GERAIS COMPUTADOS ====================
  readonly totalItensLancados = computed(() => {
    return (
      this.baldrame().length +
      this.blocos().length +
      this.sapatas().length +
      this.radier().length +
      this.tubuloes().length +
      this.pilares().length +
      this.vigas().length +
      this.lajes().length +
      this.arquitetonico().length +
      this.esquadrias().length +
      this.cobertura().length +
      this.pergolados().length +
      this.instalacoes().length +
      this.paisagismo().length
    );
  });

  readonly totalConcretoGeral = computed(() => {
    const cBaldrame = this.baldrame().reduce((acc, i) => acc + i.concreto, 0);
    const cBlocos = this.blocos().reduce((acc, i) => acc + i.concreto, 0);
    const cSapatas = this.sapatas().reduce((acc, i) => acc + i.concreto, 0);
    const cRadier = this.radier().reduce((acc, i) => acc + i.concreto, 0);
    const cTubuloes = this.tubuloes().reduce((acc, i) => acc + i.concreto, 0);
    const cPilares = this.pilares().reduce((acc, i) => acc + i.concreto, 0);
    const cVigas = this.vigas().reduce((acc, i) => acc + i.concreto, 0);
    const cLajes = this.lajes().reduce((acc, i) => acc + i.concreto, 0);
    return cBaldrame + cBlocos + cSapatas + cRadier + cTubuloes + cPilares + cVigas + cLajes;
  });

  readonly totalFormaGeral = computed(() => {
    const fBaldrame = this.baldrame().reduce((acc, i) => acc + i.forma, 0);
    const fBlocos = this.blocos().reduce((acc, i) => acc + i.forma, 0);
    const fSapatas = this.sapatas().reduce((acc, i) => acc + i.forma, 0);
    const fRadier = this.radier().reduce((acc, i) => acc + i.forma, 0);
    const fPilares = this.pilares().reduce((acc, i) => acc + i.forma, 0);
    const fVigas = this.vigas().reduce((acc, i) => acc + i.forma, 0);
    const fLajes = this.lajes().reduce((acc, i) => acc + i.forma, 0);
    return fBaldrame + fBlocos + fSapatas + fRadier + fPilares + fVigas + fLajes;
  });

  readonly totalAcoGeral = computed(() => {
    const aBaldrame = this.baldrame().reduce((acc, i) => acc + i.aco, 0);
    const aBlocos = this.blocos().reduce((acc, i) => acc + i.aco, 0);
    const aSapatas = this.sapatas().reduce((acc, i) => acc + i.aco, 0);
    const aRadier = this.radier().reduce((acc, i) => acc + i.aco, 0);
    const aTubuloes = this.tubuloes().reduce((acc, i) => acc + i.aco, 0);
    const aPilares = this.pilares().reduce((acc, i) => acc + i.aco, 0);
    const aVigas = this.vigas().reduce((acc, i) => acc + i.aco, 0);
    const aLajes = this.lajes().reduce((acc, i) => acc + i.aco, 0);
    return aBaldrame + aBlocos + aSapatas + aRadier + aTubuloes + aPilares + aVigas + aLajes;
  });

  readonly totalEscavacaoGeral = computed(() => {
    const eBaldrame = this.baldrame().reduce((acc, i) => acc + i.escavacao, 0);
    const eBlocos = this.blocos().reduce((acc, i) => acc + i.escavacao, 0);
    const eSapatas = this.sapatas().reduce((acc, i) => acc + i.escavacao, 0);
    const eRadier = this.radier().reduce((acc, i) => acc + i.escavacao, 0);
    const eTubuloes = this.tubuloes().reduce((acc, i) => acc + i.escavacao, 0);
    return eBaldrame + eBlocos + eSapatas + eRadier + eTubuloes;
  });

  readonly totalEscoramentoGeral = computed(() => {
    const eVigas = this.vigas().reduce((acc, i) => acc + i.escoramento, 0);
    const eLajes = this.lajes().reduce((acc, i) => acc + i.escoramento, 0);
    return eVigas + eLajes;
  });

  readonly totalAreaEsquadrias = computed(() => {
    return this.esquadrias().reduce((acc, item) => acc + item.area, 0);
  });

  // Calculadora de Bitolas total
  readonly totalKgCalculadoraBitola = computed(() => {
    const map = this.bitolasState();
    let total = 0;
    for (const b of this.tabelaBitolas) {
      const metros = map[b.bitola] || 0;
      total += metros * b.pesoLinear;
    }
    return total;
  });

  ngAfterViewInit(): void {
    setTimeout(() => this.verificarScrollAbas(), 100);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.verificarScrollAbas();
  }

  verificarScrollAbas(): void {
    if (this.tabsContainer?.nativeElement) {
      const el = this.tabsContainer.nativeElement;
      const temScrollEsquerda = el.scrollLeft > 6;
      const temScrollDireita = el.scrollLeft + el.clientWidth < el.scrollWidth - 6;
      this.podeRolarEsquerda.set(temScrollEsquerda);
      this.podeRolarDireita.set(temScrollDireita);
    }
  }

  atualizarScrollAbas(el?: HTMLElement): void {
    const target = el || this.tabsContainer?.nativeElement;
    if (target) {
      this.podeRolarEsquerda.set(target.scrollLeft > 6);
      this.podeRolarDireita.set(target.scrollLeft + target.clientWidth < target.scrollWidth - 6);
    }
  }

  rolarAbas(direcao: 'esquerda' | 'direita'): void {
    if (this.tabsContainer?.nativeElement) {
      const el = this.tabsContainer.nativeElement;
      const deslocamento = direcao === 'esquerda' ? -260 : 260;
      el.scrollBy({ left: deslocamento, behavior: 'smooth' });
      setTimeout(() => this.verificarScrollAbas(), 320);
    }
  }

  selecionarAba(aba: AbaDisciplina, event?: MouseEvent): void {
    this.abaAtiva.set(aba);
    if (event?.currentTarget) {
      (event.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setTimeout(() => this.verificarScrollAbas(), 320);
    }
  }

  abrirCalculadoraBitola(campoAlvoId: string): void {
    this.alvoCalculadoraBitola.set(campoAlvoId);
    this.calculadoraBitolaAberta.set(true);
  }

  fecharCalculadoraBitola(): void {
    this.calculadoraBitolaAberta.set(false);
    this.alvoCalculadoraBitola.set(null);
  }

  atualizarMetrosBitola(bitola: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const metros = parseFloat(input.value) || 0;
    this.bitolasState.update(st => ({ ...st, [bitola]: metros }));
  }

  aplicarAcoCalculadora(): void {
    const total = this.totalKgCalculadoraBitola();
    const id = this.alvoCalculadoraBitola();
    if (id && typeof document !== 'undefined') {
      const inputElem = document.getElementById(id) as HTMLInputElement | null;
      if (inputElem) {
        inputElem.value = total > 0 ? total.toFixed(2) : '0';
      }
    }
    this.fecharCalculadoraBitola();
    this.exibirNotificacao(`Aço de ${total.toFixed(2)} kg aplicado a partir das bitolas!`);
  }

  limparCalculadoraBitola(): void {
    this.bitolasState.set({});
  }

  // ==================== 1. BALDRAME ====================
  adicionarBaldrame(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    profundidadeStr: string,
    qtdStr: string,
    espessuraLastroStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const profundidade = parseFloat(profundidadeStr) || 0;
    const qtd = parseInt(qtdStr, 10) || 1;
    const espessuraLastro = parseFloat(espessuraLastroStr) || this.parametros().espessuraLastroDefault;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Por favor, informe largura, altura e comprimento válidos do baldrame.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = qtd * (comprimento * altura * 2);
    const escavacao = (largura + 0.6) * profundidade * comprimento * qtd;
    const lastro = (largura + 0.1) * comprimento * espessuraLastro * qtd;
    const reaterro = Math.max(0, escavacao - concreto - lastro);
    const botaFora = Math.max(0, (escavacao * 1.3) - concreto - lastro);

    if (!aco) {
      aco = concreto * 80; // fallback paramétrico usual
    }

    const novoItem: ItemBaldrame = {
      id: 'bal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Baldrame ${largura * 100}x${altura * 100}cm`,
      largura,
      altura,
      comprimento,
      profundidade,
      qtd,
      espessuraLastro,
      concreto,
      forma,
      escavacao,
      lastro,
      reaterro,
      botaFora,
      aco
    };

    this.baldrame.update(l => [...l, novoItem]);
    this.exibirNotificacao('Viga baldrame adicionada com sucesso!');
  }

  removerBaldrame(id: string): void {
    this.baldrame.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 2. BLOCOS DE FUNDAÇÃO ====================
  adicionarBloco(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    profundidadeStr: string,
    qtdStr: string,
    espessuraLastroStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const profundidade = parseFloat(profundidadeStr) || 0;
    const qtd = parseInt(qtdStr, 10) || 1;
    const espessuraLastro = parseFloat(espessuraLastroStr) || this.parametros().espessuraLastroDefault;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Por favor, informe largura, altura e comprimento válidos do bloco.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = qtd * (comprimento * altura * 2 + largura * altura * 2);
    const escavacao = (largura + 0.6) * profundidade * comprimento * qtd;
    const lastro = (largura + 0.1) * comprimento * espessuraLastro * qtd;
    const reaterro = Math.max(0, escavacao - concreto - lastro);
    const botaFora = Math.max(0, (escavacao * 1.3) - concreto - lastro);

    if (!aco) {
      aco = concreto * 80;
    }

    const novoItem: ItemBloco = {
      id: 'blo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Bloco ${largura}x${comprimento}m`,
      largura,
      altura,
      comprimento,
      profundidade,
      qtd,
      espessuraLastro,
      concreto,
      forma,
      escavacao,
      lastro,
      reaterro,
      botaFora,
      aco
    };

    this.blocos.update(l => [...l, novoItem]);
    this.exibirNotificacao('Bloco de fundação adicionado com sucesso!');
  }

  removerBloco(id: string): void {
    this.blocos.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 3. SAPATAS ====================
  adicionarSapata(
    nomeStr: string,
    larguraBaseStr: string,
    comprimentoBaseStr: string,
    larguraFusteStr: string,
    comprimentoFusteStr: string,
    alturaTroncoStr: string,
    alturaBaseStr: string,
    profundidadeStr: string,
    qtdStr: string,
    espessuraLastroStr: string,
    acoStr: string
  ): void {
    const Lb = parseFloat(larguraBaseStr);
    const Cb = parseFloat(comprimentoBaseStr);
    const Lf = parseFloat(larguraFusteStr) || 0;
    const Cf = parseFloat(comprimentoFusteStr) || 0;
    const H = parseFloat(alturaTroncoStr) || 0;
    const B = parseFloat(alturaBaseStr) || 0;
    const P = parseFloat(profundidadeStr) || 0;
    const qtd = parseInt(qtdStr, 10) || 1;
    const espessuraLastro = parseFloat(espessuraLastroStr) || this.parametros().espessuraLastroDefault;
    let aco = parseFloat(acoStr) || 0;

    if (!Lb || !Cb || (!H && !B)) {
      this.exibirNotificacao('Informe largura e comprimento da base, e as alturas da sapata.');
      return;
    }

    // Fórmulas reais do Sienge para Sapata Piramidal com Rodapé
    const concretoUnit = (H / 6) * ((2 * Lb + Lf) * Cb + (2 * Lf + Lb) * Cf) + (Lb * Cb * B);
    const concreto = concretoUnit * qtd;

    const formaUnit =
      (Cb + Cf) * Math.sqrt(Math.pow((Cb - Cf) / 2, 2) + Math.pow(H, 2)) +
      (Lb + Lf) * Math.sqrt(Math.pow((Lb - Lf) / 2, 2) + Math.pow(H, 2)) +
      (Lb + Cb) * 2 * B;
    const forma = formaUnit * qtd;

    const escavacao = (Lb + 0.6) * (Cb + 0.6) * P * qtd;
    const lastro = (Lb + 0.2) * (Cb + 0.2) * qtd * espessuraLastro;
    const reaterro = Math.max(0, escavacao - concreto - lastro);
    const botaFora = Math.max(0, (escavacao * 1.3) - concreto - lastro);

    if (!aco) {
      aco = concreto * 80;
    }

    const novoItem: ItemSapata = {
      id: 'sap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Sapata ${Lb}x${Cb}m`,
      larguraBase: Lb,
      comprimentoBase: Cb,
      larguraFuste: Lf,
      comprimentoFuste: Cf,
      alturaTronco: H,
      alturaBase: B,
      profundidade: P,
      qtd,
      espessuraLastro,
      concreto,
      forma,
      escavacao,
      lastro,
      reaterro,
      botaFora,
      aco
    };

    this.sapatas.update(l => [...l, novoItem]);
    this.exibirNotificacao('Sapata adicionada com sucesso!');
  }

  removerSapata(id: string): void {
    this.sapatas.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 4. RADIER ====================
  adicionarRadier(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    profundidadeStr: string,
    qtdStr: string,
    espessuraLastroStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const profundidade = parseFloat(profundidadeStr) || 0;
    const qtd = parseInt(qtdStr, 10) || 1;
    const espessuraLastro = parseFloat(espessuraLastroStr) || this.parametros().espessuraLastroDefault;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Informe largura, espessura e comprimento do radier.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = qtd * (comprimento * altura * 2 + largura * altura * 2);
    const escavacao = (largura + 0.6) * profundidade * comprimento * qtd;
    const lastro = largura * comprimento * espessuraLastro * qtd;
    const reaterro = Math.max(0, escavacao - concreto); // nota técnica: sem descontar lastro
    const botaFora = Math.max(0, (escavacao * 1.3) - concreto);

    if (!aco) {
      aco = concreto * 85;
    }

    const novoItem: ItemRadier = {
      id: 'rad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Radier ${largura}x${comprimento}m (e=${altura * 100}cm)`,
      largura,
      altura,
      comprimento,
      profundidade,
      qtd,
      espessuraLastro,
      concreto,
      forma,
      escavacao,
      lastro,
      reaterro,
      botaFora,
      aco
    };

    this.radier.update(l => [...l, novoItem]);
    this.exibirNotificacao('Radier adicionado com sucesso!');
  }

  removerRadier(id: string): void {
    this.radier.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 5. TUBULÕES ====================
  adicionarTubulao(
    nomeStr: string,
    diametroFusteStr: string,
    alturaFusteStr: string,
    diametroBaseStr: string,
    alturaBaseStr: string,
    alturaBStr: string,
    qtdStr: string,
    acoStr: string
  ): void {
    const Df = parseFloat(diametroFusteStr);
    const Hf = parseFloat(alturaFusteStr);
    const Db = parseFloat(diametroBaseStr) || Df;
    const Hb = parseFloat(alturaBaseStr) || 0;
    const b = parseFloat(alturaBStr) || 0;
    const qtd = parseInt(qtdStr, 10) || 1;
    let aco = parseFloat(acoStr) || 0;

    if (!Df || !Hf) {
      this.exibirNotificacao('Informe o diâmetro e a altura do fuste do tubulão.');
      return;
    }

    // Fórmulas reais do Sienge
    const volBaseCilindrica = (Math.PI * Math.pow(Db, 2) / 4) * b;
    const volTroncoCone = (1 / 3) * Math.PI * (Hb - b) * (Math.pow(Db, 2) / 4 + (Db * Df) / 4 + Math.pow(Df, 2) / 4);
    const volFuste = (Math.PI * Math.pow(Df, 2) / 4) * Hf;
    const concretoUnit = volBaseCilindrica + (Hb > b ? volTroncoCone : 0) + volFuste;
    const concreto = concretoUnit * qtd;
    const escavacao = concreto;
    const botaFora = escavacao * 1.3;

    if (!aco) {
      aco = concreto * 60;
    }

    const novoItem: ItemTubulao = {
      id: 'tub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Tubulão ⌀${Df * 100}cm (Prof ${Hf + Hb}m)`,
      diametroFuste: Df,
      alturaFuste: Hf,
      diametroBase: Db,
      alturaBase: Hb,
      alturaB: b,
      qtd,
      concreto,
      escavacao,
      botaFora,
      aco
    };

    this.tubuloes.update(l => [...l, novoItem]);
    this.exibirNotificacao('Tubulão adicionado com sucesso!');
  }

  removerTubulao(id: string): void {
    this.tubuloes.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 6. PILARES ====================
  adicionarPilar(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    qtdStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const qtd = parseInt(qtdStr, 10) || 1;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Informe seção (largura × altura) e comprimento/altura do pilar.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = (comprimento + largura) * 2 * altura * qtd;
    if (!aco) {
      aco = concreto * 110;
    }
    const solda = aco * this.parametros().tempoSolda;

    const novoItem: ItemPilar = {
      id: 'pil_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Pilar ${largura * 100}x${altura * 100}cm (H=${comprimento}m)`,
      largura,
      altura,
      comprimento,
      qtd,
      concreto,
      forma,
      aco,
      solda
    };

    this.pilares.update(l => [...l, novoItem]);
    this.exibirNotificacao('Pilar adicionado com sucesso!');
  }

  removerPilar(id: string): void {
    this.pilares.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 7. VIGAS ====================
  adicionarViga(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    alturaFundoVigaStr: string,
    qtdStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const comprimento = parseFloat(comprimentoStr);
    const alturaFundoViga = parseFloat(alturaFundoVigaStr) || (2.80 - altura);
    const qtd = parseInt(qtdStr, 10) || 1;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Informe largura, altura e comprimento da viga.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = (largura + 2 * altura) * comprimento * qtd;
    const escoramento = largura * alturaFundoViga * comprimento * qtd;
    if (!aco) {
      aco = concreto * 100;
    }
    const solda = aco * this.parametros().tempoSolda;

    const novoItem: ItemViga = {
      id: 'vig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Viga ${largura * 100}x${altura * 100}cm (L=${comprimento}m)`,
      largura,
      altura,
      comprimento,
      alturaFundoViga,
      qtd,
      concreto,
      forma,
      escoramento,
      aco,
      solda
    };

    this.vigas.update(l => [...l, novoItem]);
    this.exibirNotificacao('Viga adicionada com sucesso!');
  }

  removerViga(id: string): void {
    this.vigas.update(l => l.filter(i => i.id !== id));
  }

  // ==================== 8. LAJES ====================
  adicionarLaje(
    nomeStr: string,
    larguraStr: string,
    alturaStr: string,
    comprimentoStr: string,
    peDireitoStr: string,
    qtdStr: string,
    acoStr: string
  ): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr); // espessura
    const comprimento = parseFloat(comprimentoStr);
    const peDireito = parseFloat(peDireitoStr) || 2.80;
    const qtd = parseInt(qtdStr, 10) || 1;
    let aco = parseFloat(acoStr) || 0;

    if (!largura || !altura || !comprimento) {
      this.exibirNotificacao('Informe largura, espessura e comprimento da laje.');
      return;
    }

    // Fórmulas reais do Sienge
    const concreto = qtd * largura * altura * comprimento;
    const forma = qtd * largura * comprimento;
    const escoramento = forma * peDireito;
    if (!aco) {
      aco = concreto * 80;
    }
    const solda = aco * this.parametros().tempoSolda;

    const novoItem: ItemLaje = {
      id: 'laj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nome: nomeStr.trim() || `Laje ${largura}x${comprimento}m (e=${altura * 100}cm)`,
      largura,
      altura,
      comprimento,
      peDireito,
      qtd,
      concreto,
      forma,
      escoramento,
      aco,
      solda
    };

    this.lajes.update(l => [...l, novoItem]);
    this.exibirNotificacao('Laje adicionada com sucesso!');
  }

  removerLaje(id: string): void {
    this.lajes.update(l => l.filter(i => i.id !== id));
  }

  // ==================== MÉTODOS DE ARQUITETÔNICO ====================
  adicionarArquitetonico(
    tipoStr: string,
    comprimentoStr: string,
    alturaStr: string,
    qtdStr: string,
    descontoStr: string
  ): void {
    const comprimento = parseFloat(comprimentoStr);
    const altura = parseFloat(alturaStr);
    const qtd = parseInt(qtdStr, 10) || 1;
    const desconto = parseFloat(descontoStr) || 0;

    if (!comprimento || !altura) {
      this.exibirNotificacao('Por favor, informe o comprimento e altura do pano ou ambiente.');
      return;
    }

    const tipo = tipoStr as ItemArquitetonico['tipo'];
    const areaBruta = comprimento * altura * qtd;
    const areaLiquida = Math.max(0, areaBruta - desconto);
    const encunhamento = tipo.startsWith('alvenaria') ? comprimento * qtd : 0;

    const novoItem: ItemArquitetonico = {
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      comprimento,
      altura,
      qtd,
      desconto,
      areaBruta,
      areaLiquida,
      encunhamento
    };

    this.arquitetonico.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item arquitetônico adicionado com sucesso!');
  }

  removerArquitetonico(id: string): void {
    this.arquitetonico.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE ESQUADRIAS ====================
  adicionarEsquadria(tipoStr: string, larguraStr: string, alturaStr: string, qtdStr: string): void {
    const largura = parseFloat(larguraStr);
    const altura = parseFloat(alturaStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!largura || !altura) {
      this.exibirNotificacao('Informe largura e altura da esquadria.');
      return;
    }

    const tipo = tipoStr as ItemEsquadria['tipo'];
    const area = largura * altura * qtd;

    const novoItem: ItemEsquadria = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      largura,
      altura,
      qtd,
      area
    };

    this.esquadrias.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Esquadria cadastrada com sucesso!');
  }

  removerEsquadria(id: string): void {
    this.esquadrias.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE COBERTURA ====================
  adicionarCobertura(tipoStr: string, dimensaoStr: string, unidadeStr: string, qtdStr: string): void {
    const dimensao = parseFloat(dimensaoStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!dimensao) {
      this.exibirNotificacao('Informe a dimensão unitária do elemento de cobertura.');
      return;
    }

    const tipo = tipoStr as ItemCobertura['tipo'];
    const unidade = unidadeStr as ItemCobertura['unidade'];
    const total = dimensao * qtd;

    const novoItem: ItemCobertura = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      dimensao,
      unidade,
      qtd,
      total
    };

    this.cobertura.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de cobertura adicionado com sucesso!');
  }

  removerCobertura(id: string): void {
    this.cobertura.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE PERGOLADOS ====================
  adicionarPergolado(tipoStr: string, dimensaoStr: string, unidadeStr: string, qtdStr: string): void {
    const dimensao = parseFloat(dimensaoStr);
    const qtd = parseInt(qtdStr, 10) || 1;

    if (!dimensao) {
      this.exibirNotificacao('Informe a dimensão unitária do pergolado.');
      return;
    }

    const tipo = tipoStr as ItemPergolado['tipo'];
    const unidade = unidadeStr as ItemPergolado['unidade'];
    const total = dimensao * qtd;

    const novoItem: ItemPergolado = {
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      tipo,
      dimensao,
      unidade,
      qtd,
      total
    };

    this.pergolados.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Pergolado adicionado com sucesso!');
  }

  removerPergolado(id: string): void {
    this.pergolados.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DOS 4 SISTEMAS DE INSTALAÇÕES PREDIAIS ====================
  getCategoriasSistema(sistema: SistemaInstalacao): CategoriaConfig[] {
    return this.categoriasPorSistema[sistema] || [];
  }

  getPerdaCategoria(sistema: SistemaInstalacao, categoria: string): number {
    const custom = this.perdasCategorias()[sistema]?.[categoria];
    if (custom !== undefined) return custom;
    const config = this.categoriasPorSistema[sistema]?.find(c => c.nome === categoria);
    return config ? config.percentualPerda * 100 : 5;
  }

  getUnidadePadrao(sistema: SistemaInstalacao, categoria: string): string {
    const config = this.categoriasPorSistema[sistema]?.find(c => c.nome === categoria);
    return config ? config.unidadePadrao : 'un';
  }

  atualizarPerdaCategoria(sistema: SistemaInstalacao, categoria: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0) return;
    this.perdasCategorias.update(map => ({
      ...map,
      [sistema]: {
        ...(map[sistema] || {}),
        [categoria]: val
      }
    }));
  }

  adicionarItemInstalacao(
    sistema: SistemaInstalacao,
    categoria: string,
    especificacaoStr: string,
    localStr: string,
    qtdStr: string,
    unidadeCustom?: string
  ): void {
    const especificacao = especificacaoStr.trim();
    const local = localStr.trim();
    const quantidade = parseFloat(qtdStr);

    if (!especificacao || isNaN(quantidade) || quantidade <= 0) {
      this.exibirNotificacao('Informe a especificação/material e uma quantidade válida maior que zero.');
      return;
    }

    const unidade = (unidadeCustom && unidadeCustom.trim()) || this.getUnidadePadrao(sistema, categoria);
    const margemPerda = this.getPerdaCategoria(sistema, categoria);
    const quantidadeComPerda = quantidade * (1 + margemPerda / 100);

    const novoItem: ItemInstalacaoPredial = {
      id: `inst_${sistema.slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sistema,
      categoria,
      especificacao,
      local: local || undefined,
      quantidade,
      unidade,
      margemPerda,
      quantidadeComPerda
    };

    switch (sistema) {
      case 'distribuicao-eletrica':
        this.distribuicaoEletrica.update(l => [...l, novoItem]);
        break;
      case 'prumadas-eletricas':
        this.prumadasEletricas.update(l => [...l, novoItem]);
        break;
      case 'esgoto-pluvial':
        this.esgotoPluvial.update(l => [...l, novoItem]);
        break;
      case 'hidraulica':
        this.hidraulica.update(l => [...l, novoItem]);
        break;
    }

    this.exibirNotificacao(`Item adicionado com sucesso! (+${margemPerda}% de perda calculada)`);
  }

  removerItemInstalacao(sistema: SistemaInstalacao, id: string): void {
    switch (sistema) {
      case 'distribuicao-eletrica':
        this.distribuicaoEletrica.update(l => l.filter(i => i.id !== id));
        break;
      case 'prumadas-eletricas':
        this.prumadasEletricas.update(l => l.filter(i => i.id !== id));
        break;
      case 'esgoto-pluvial':
        this.esgotoPluvial.update(l => l.filter(i => i.id !== id));
        break;
      case 'hidraulica':
        this.hidraulica.update(l => l.filter(i => i.id !== id));
        break;
    }
  }

  getTotaisPorCategoria(sistema: SistemaInstalacao) {
    let itens: ItemInstalacaoPredial[] = [];
    switch (sistema) {
      case 'distribuicao-eletrica':
        itens = this.distribuicaoEletrica();
        break;
      case 'prumadas-eletricas':
        itens = this.prumadasEletricas();
        break;
      case 'esgoto-pluvial':
        itens = this.esgotoPluvial();
        break;
      case 'hidraulica':
        itens = this.hidraulica();
        break;
    }

    const mapa = new Map<string, { categoria: string; qtd: number; qtdComPerda: number; unidade: string; perda: number; itens: ItemInstalacaoPredial[] }>();

    const configs = this.getCategoriasSistema(sistema);
    configs.forEach(c => {
      mapa.set(c.nome, {
        categoria: c.nome,
        qtd: 0,
        qtdComPerda: 0,
        unidade: c.unidadePadrao,
        perda: this.getPerdaCategoria(sistema, c.nome),
        itens: []
      });
    });

    itens.forEach(item => {
      const cur = mapa.get(item.categoria) || {
        categoria: item.categoria,
        qtd: 0,
        qtdComPerda: 0,
        unidade: item.unidade,
        perda: item.margemPerda,
        itens: []
      };
      cur.qtd += item.quantidade;
      cur.qtdComPerda += item.quantidadeComPerda;
      cur.itens.push(item);
      mapa.set(item.categoria, cur);
    });

    return Array.from(mapa.values()).filter(g => g.itens.length > 0);
  }

  // Método legado mantido para segurança
  adicionarInstalacao(disciplinaStr: string, itemStr: string, qtdStr: string, unidadeStr: string): void {
    const item = itemStr.trim();
    const qtd = parseFloat(qtdStr);
    const unidade = unidadeStr.trim() || 'un';

    if (!item || isNaN(qtd) || qtd <= 0) {
      this.exibirNotificacao('Informe a descrição e uma quantidade válida do item de instalação.');
      return;
    }

    const disciplina = disciplinaStr as ItemInstalacao['disciplina'];

    const novoItem: ItemInstalacao = {
      id: 'i_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      disciplina,
      item,
      qtd,
      unidade
    };

    this.instalacoes.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de instalação adicionado com sucesso!');
  }

  removerInstalacao(id: string): void {
    this.instalacoes.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== MÉTODOS DE PAISAGISMO ====================
  adicionarPaisagismo(itemStr: string, qtdStr: string, unidadeStr: string): void {
    const item = itemStr.trim();
    const qtd = parseFloat(qtdStr);
    const unidade = unidadeStr.trim() || 'm²';

    if (!item || isNaN(qtd) || qtd <= 0) {
      this.exibirNotificacao('Informe a descrição e a quantidade do item de paisagismo.');
      return;
    }

    const novoItem: ItemPaisagismo = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      item,
      qtd,
      unidade
    };

    this.paisagismo.update(lista => [...lista, novoItem]);
    this.exibirNotificacao('Item de paisagismo adicionado com sucesso!');
  }

  removerPaisagismo(id: string): void {
    this.paisagismo.update(lista => lista.filter(item => item.id !== id));
  }

  // ==================== RESUMO CONSOLIDADO ====================
  readonly resumoConsolidado = computed<ItemResumoConsolidado[]>(() => {
    const lista: ItemResumoConsolidado[] = [];
    const p = this.parametros();
    const m = this.margensPerda();

    // 1. Escavação em Fundações
    const escavFund =
      this.baldrame().reduce((acc, i) => acc + i.escavacao, 0) +
      this.blocos().reduce((acc, i) => acc + i.escavacao, 0) +
      this.sapatas().reduce((acc, i) => acc + i.escavacao, 0) +
      this.radier().reduce((acc, i) => acc + i.escavacao, 0);

    if (escavFund > 0) {
      const perda = p.perdaEscavacaoFundacao;
      const comPerda = escavFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Escavação manual/mecânica (Baldrames, Blocos, Sapatas, Radier)',
        unidade: 'm³',
        qtdCalculada: escavFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.5,
        duracaoHoras: comPerda * 1.5
      });
    }

    // Escavação em Tubulões
    const escavTub = this.tubuloes().reduce((acc, i) => acc + i.escavacao, 0);
    if (escavTub > 0) {
      const perda = p.perdaEscavacaoTubulao;
      const comPerda = escavTub * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações Profundas',
        servico: 'Escavação e abertura de fuste/base de tubulões a céu aberto',
        unidade: 'm³',
        qtdCalculada: escavTub,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.8,
        duracaoHoras: comPerda * 2.8
      });
    }

    // 2. Lastro de Concreto Magro / Brita
    const lastroFund =
      this.baldrame().reduce((acc, i) => acc + i.lastro, 0) +
      this.blocos().reduce((acc, i) => acc + i.lastro, 0) +
      this.sapatas().reduce((acc, i) => acc + i.lastro, 0) +
      this.radier().reduce((acc, i) => acc + i.lastro, 0);

    if (lastroFund > 0) {
      const perda = p.perdaLastroFundacao;
      const comPerda = lastroFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Lastro de concreto magro / brita sob fundações',
        unidade: 'm³',
        qtdCalculada: lastroFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.2,
        duracaoHoras: comPerda * 1.2
      });
    }

    // 3. Reaterro e Compactação
    const reaterroFund =
      this.baldrame().reduce((acc, i) => acc + i.reaterro, 0) +
      this.blocos().reduce((acc, i) => acc + i.reaterro, 0) +
      this.sapatas().reduce((acc, i) => acc + i.reaterro, 0) +
      this.radier().reduce((acc, i) => acc + i.reaterro, 0);

    if (reaterroFund > 0) {
      const perda = p.perdaReaterroFundacao;
      const comPerda = reaterroFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Reaterro e compactação mecanizada de valas e cavas',
        unidade: 'm³',
        qtdCalculada: reaterroFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.8,
        duracaoHoras: comPerda * 0.8
      });
    }

    // 4. Bota-fora
    const botaForaFund =
      this.baldrame().reduce((acc, i) => acc + i.botaFora, 0) +
      this.blocos().reduce((acc, i) => acc + i.botaFora, 0) +
      this.sapatas().reduce((acc, i) => acc + i.botaFora, 0) +
      this.radier().reduce((acc, i) => acc + i.botaFora, 0);

    if (botaForaFund > 0) {
      const perda = p.perdaBotaForaFundacao;
      const comPerda = botaForaFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Bota-fora / remoção e transporte de terra excedente (Fundações diretas)',
        unidade: 'm³',
        qtdCalculada: botaForaFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.3,
        duracaoHoras: comPerda * 0.3
      });
    }

    const botaForaTub = this.tubuloes().reduce((acc, i) => acc + i.botaFora, 0);
    if (botaForaTub > 0) {
      const perda = p.perdaBotaForaTubulao;
      const comPerda = botaForaTub * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações Profundas',
        servico: 'Bota-fora e descarte de solo escavado de tubulões',
        unidade: 'm³',
        qtdCalculada: botaForaTub,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.35,
        duracaoHoras: comPerda * 0.35
      });
    }

    // 5. Concreto em Fundações
    const concBaldrame = this.baldrame().reduce((acc, i) => acc + i.concreto, 0);
    if (concBaldrame > 0) {
      const perda = p.perdaConcretoFundacao;
      const comPerda = concBaldrame * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Concreto usinado fck ≥ 25 MPa em Vigas Baldrame',
        unidade: 'm³',
        qtdCalculada: concBaldrame,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.2,
        duracaoHoras: comPerda * 2.2
      });
    }

    const concBlocos = this.blocos().reduce((acc, i) => acc + i.concreto, 0);
    if (concBlocos > 0) {
      const perda = p.perdaConcretoFundacao;
      const comPerda = concBlocos * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Concreto usinado fck ≥ 25 MPa em Blocos de Coroamento',
        unidade: 'm³',
        qtdCalculada: concBlocos,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.2,
        duracaoHoras: comPerda * 2.2
      });
    }

    const concSapatas = this.sapatas().reduce((acc, i) => acc + i.concreto, 0);
    if (concSapatas > 0) {
      const perda = p.perdaConcretoFundacao;
      const comPerda = concSapatas * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Concreto usinado fck ≥ 25 MPa em Sapatas',
        unidade: 'm³',
        qtdCalculada: concSapatas,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.2,
        duracaoHoras: comPerda * 2.2
      });
    }

    const concRadier = this.radier().reduce((acc, i) => acc + i.concreto, 0);
    if (concRadier > 0) {
      const perda = p.perdaConcretoFundacao;
      const comPerda = concRadier * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Concreto usinado fck ≥ 25 MPa em Radier',
        unidade: 'm³',
        qtdCalculada: concRadier,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.0,
        duracaoHoras: comPerda * 2.0
      });
    }

    const concTub = this.tubuloes().reduce((acc, i) => acc + i.concreto, 0);
    if (concTub > 0) {
      const perda = p.perdaConcretoTubulao;
      const comPerda = concTub * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações Profundas',
        servico: 'Concreto usinado fck ≥ 25 MPa em Tubulões',
        unidade: 'm³',
        qtdCalculada: concTub,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.5,
        duracaoHoras: comPerda * 2.5
      });
    }

    // 6. Formas em Fundações
    const formaFund =
      this.baldrame().reduce((acc, i) => acc + i.forma, 0) +
      this.blocos().reduce((acc, i) => acc + i.forma, 0) +
      this.sapatas().reduce((acc, i) => acc + i.forma, 0) +
      this.radier().reduce((acc, i) => acc + i.forma, 0);

    if (formaFund > 0) {
      const perda = p.perdaFormaFundacao;
      const comPerda = formaFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Forma de madeira / tábuas e sarrafos para fundações diretas',
        unidade: 'm²',
        qtdCalculada: formaFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.1,
        duracaoHoras: comPerda * 1.1
      });
    }

    // 7. Aço em Fundações
    const acoFund =
      this.baldrame().reduce((acc, i) => acc + i.aco, 0) +
      this.blocos().reduce((acc, i) => acc + i.aco, 0) +
      this.sapatas().reduce((acc, i) => acc + i.aco, 0) +
      this.radier().reduce((acc, i) => acc + i.aco, 0) +
      this.tubuloes().reduce((acc, i) => acc + i.aco, 0);

    if (acoFund > 0) {
      const perda = p.perdaAcoFundacao;
      const comPerda = acoFund * (1 + perda / 100);
      lista.push({
        disciplina: 'Fundações',
        servico: 'Armadura de aço CA-50/60 em elementos de fundação',
        unidade: 'kg',
        qtdCalculada: acoFund,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.08,
        duracaoHoras: comPerda * 0.08
      });
    }

    // 8. Superestrutura - Concreto
    const concPilares = this.pilares().reduce((acc, i) => acc + i.concreto, 0);
    if (concPilares > 0) {
      const perda = p.perdaConcretoEstrutura;
      const comPerda = concPilares * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Concreto usinado fck ≥ 30 MPa em Pilares',
        unidade: 'm³',
        qtdCalculada: concPilares,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.5,
        duracaoHoras: comPerda * 2.5
      });
    }

    const concVigas = this.vigas().reduce((acc, i) => acc + i.concreto, 0);
    if (concVigas > 0) {
      const perda = p.perdaConcretoEstrutura;
      const comPerda = concVigas * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Concreto usinado fck ≥ 30 MPa em Vigas Superiores',
        unidade: 'm³',
        qtdCalculada: concVigas,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.5,
        duracaoHoras: comPerda * 2.5
      });
    }

    const concLajes = this.lajes().reduce((acc, i) => acc + i.concreto, 0);
    if (concLajes > 0) {
      const perda = p.perdaConcretoEstrutura;
      const comPerda = concLajes * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Concreto usinado fck ≥ 30 MPa em Lajes',
        unidade: 'm³',
        qtdCalculada: concLajes,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 2.2,
        duracaoHoras: comPerda * 2.2
      });
    }

    // 9. Superestrutura - Formas
    const formaEst =
      this.pilares().reduce((acc, i) => acc + i.forma, 0) +
      this.vigas().reduce((acc, i) => acc + i.forma, 0) +
      this.lajes().reduce((acc, i) => acc + i.forma, 0);

    if (formaEst > 0) {
      const perda = p.perdaFormaEstrutura;
      const comPerda = formaEst * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Forma em compensado resinado / plastificado para superestrutura',
        unidade: 'm²',
        qtdCalculada: formaEst,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.3,
        duracaoHoras: comPerda * 1.3
      });
    }

    // 10. Superestrutura - Escoramento / Cimbramento
    const escoramentoTotal =
      this.vigas().reduce((acc, i) => acc + i.escoramento, 0) +
      this.lajes().reduce((acc, i) => acc + i.escoramento, 0);

    if (escoramentoTotal > 0) {
      const perda = p.perdaEscoramentoEstrutura;
      const comPerda = escoramentoTotal * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Escoramento / cimbramento metálico e torres para vigas e lajes',
        unidade: 'm³',
        qtdCalculada: escoramentoTotal,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.35,
        duracaoHoras: comPerda * 0.35
      });
    }

    // 11. Superestrutura - Aço & Solda
    const acoEst =
      this.pilares().reduce((acc, i) => acc + i.aco, 0) +
      this.vigas().reduce((acc, i) => acc + i.aco, 0) +
      this.lajes().reduce((acc, i) => acc + i.aco, 0);

    if (acoEst > 0) {
      const perda = p.perdaAcoEstrutura;
      const comPerda = acoEst * (1 + perda / 100);
      lista.push({
        disciplina: 'Estrutura',
        servico: 'Armadura de aço CA-50 corte/dobra/montagem em pilares/vigas/lajes',
        unidade: 'kg',
        qtdCalculada: acoEst,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.09,
        duracaoHoras: comPerda * 0.09
      });

      const soldaTotal =
        this.pilares().reduce((acc, i) => acc + i.solda, 0) +
        this.vigas().reduce((acc, i) => acc + i.solda, 0) +
        this.lajes().reduce((acc, i) => acc + i.solda, 0);

      if (soldaTotal > 0) {
        const perdaSolda = p.perdaSoldaEstrutura;
        const comPerdaSolda = soldaTotal * (1 + perdaSolda / 100);
        lista.push({
          disciplina: 'Estrutura',
          servico: 'Solda, amarração e emendas de armaduras estruturais',
          unidade: 'h',
          qtdCalculada: soldaTotal,
          margemPerda: perdaSolda,
          qtdComPerda: comPerdaSolda,
          produtividade: 1.0,
          duracaoHoras: comPerdaSolda
        });
      }
    }

    // 12. Arquitetônico
    const arqItens = this.arquitetonico();
    const gruposArq = new Map<string, number>();
    let totalEncunhamento = 0;

    arqItens.forEach(item => {
      const atual = gruposArq.get(item.tipo) || 0;
      gruposArq.set(item.tipo, atual + item.areaLiquida);
      totalEncunhamento += item.encunhamento;
    });

    gruposArq.forEach((areaLiquida, tipo) => {
      const perda = p.perdaArquitetonico;
      const comPerda = areaLiquida * (1 + perda / 100);
      let prod = 0.8;
      if (tipo.startsWith('alvenaria')) prod = 0.9;
      else if (tipo === 'revestimento-parede') prod = 0.7;
      else if (tipo === 'pintura') prod = 0.4;

      lista.push({
        disciplina: 'Arquitetônico',
        servico: this.formatarNomeServico(tipo),
        unidade: 'm²',
        qtdCalculada: areaLiquida,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: prod,
        duracaoHoras: comPerda * prod
      });
    });

    if (totalEncunhamento > 0) {
      lista.push({
        disciplina: 'Arquitetônico',
        servico: 'Encunhamento e aperto de alvenaria em topo de viga',
        unidade: 'm',
        qtdCalculada: totalEncunhamento,
        margemPerda: 0,
        qtdComPerda: totalEncunhamento,
        produtividade: 0.25,
        duracaoHoras: totalEncunhamento * 0.25
      });
    }

    // 13. Esquadrias
    const esqItens = this.esquadrias();
    const gruposEsq = new Map<string, { un: number; area: number }>();
    esqItens.forEach(item => {
      const cur = gruposEsq.get(item.tipo) || { un: 0, area: 0 };
      gruposEsq.set(item.tipo, { un: cur.un + item.qtd, area: cur.area + item.area });
    });

    gruposEsq.forEach((val, tipo) => {
      lista.push({
        disciplina: 'Esquadrias',
        servico: this.formatarNomeEsquadria(tipo) + ` (${val.area.toFixed(1)} m²)`,
        unidade: 'un',
        qtdCalculada: val.un,
        margemPerda: p.perdaEsquadrias,
        qtdComPerda: val.un,
        produtividade: 1.6,
        duracaoHoras: val.un * 1.6
      });
    });

    // 14. Cobertura
    this.cobertura().forEach(item => {
      const perda = p.perdaCobertura;
      const comPerda = item.total * (1 + perda / 100);
      lista.push({
        disciplina: 'Cobertura',
        servico: this.formatarNomeCobertura(item.tipo),
        unidade: item.unidade,
        qtdCalculada: item.total,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.6,
        duracaoHoras: comPerda * 0.6
      });
    });

    // 15. Pergolados
    this.pergolados().forEach(item => {
      const perda = p.perdaPaisagismo;
      const comPerda = item.total * (1 + perda / 100);
      lista.push({
        disciplina: 'Paisagismo',
        servico: this.formatarNomePergolado(item.tipo),
        unidade: item.unidade,
        qtdCalculada: item.total,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 1.0,
        duracaoHoras: comPerda * 1.0
      });
    });

    // 16. Instalações Prediais - 4 Sistemas
    // 16.1 Distribuição Elétrica
    this.distribuicaoEletrica().forEach(item => {
      const prod = item.unidade === 'm' ? 0.35 : 0.45;
      lista.push({
        disciplina: 'Instalações - Elétrica (Distribuição)',
        servico: `[${item.categoria}] ${item.especificacao}${item.local ? ' (' + item.local + ')' : ''}`,
        unidade: item.unidade,
        qtdCalculada: item.quantidade,
        margemPerda: item.margemPerda,
        qtdComPerda: item.quantidadeComPerda,
        produtividade: prod,
        duracaoHoras: item.quantidadeComPerda * prod
      });
    });

    // 16.2 Prumadas Elétricas
    this.prumadasEletricas().forEach(item => {
      const prod = item.unidade === 'm' ? 0.40 : 0.50;
      lista.push({
        disciplina: 'Instalações - Elétrica (Prumadas)',
        servico: `[${item.categoria}] ${item.especificacao}${item.local ? ' (' + item.local + ')' : ''}`,
        unidade: item.unidade,
        qtdCalculada: item.quantidade,
        margemPerda: item.margemPerda,
        qtdComPerda: item.quantidadeComPerda,
        produtividade: prod,
        duracaoHoras: item.quantidadeComPerda * prod
      });
    });

    // 16.3 Esgoto e Pluvial
    this.esgotoPluvial().forEach(item => {
      const prod = item.unidade === 'm' ? 0.50 : 0.40;
      lista.push({
        disciplina: 'Instalações - Esgoto & Pluvial',
        servico: `[${item.categoria}] ${item.especificacao}${item.local ? ' (' + item.local + ')' : ''}`,
        unidade: item.unidade,
        qtdCalculada: item.quantidade,
        margemPerda: item.margemPerda,
        qtdComPerda: item.quantidadeComPerda,
        produtividade: prod,
        duracaoHoras: item.quantidadeComPerda * prod
      });
    });

    // 16.4 Hidráulica
    this.hidraulica().forEach(item => {
      const prod = item.unidade === 'm' ? 0.45 : 0.35;
      lista.push({
        disciplina: 'Instalações - Hidráulica',
        servico: `[${item.categoria}] ${item.especificacao}${item.local ? ' (' + item.local + ')' : ''}`,
        unidade: item.unidade,
        qtdCalculada: item.quantidade,
        margemPerda: item.margemPerda,
        qtdComPerda: item.quantidadeComPerda,
        produtividade: prod,
        duracaoHoras: item.quantidadeComPerda * prod
      });
    });

    // Compatibilidade com itens legados de instalação se existirem
    this.instalacoes().forEach(item => {
      const perda = p.perdaInstalacoes;
      const comPerda = item.qtd * (1 + perda / 100);
      lista.push({
        disciplina: 'Instalações (Geral)',
        servico: `[${item.disciplina.toUpperCase()}] ${item.item}`,
        unidade: item.unidade,
        qtdCalculada: item.qtd,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.5,
        duracaoHoras: comPerda * 0.5
      });
    });

    // 17. Paisagismo
    this.paisagismo().forEach(item => {
      const perda = p.perdaPaisagismo;
      const comPerda = item.qtd * (1 + perda / 100);
      lista.push({
        disciplina: 'Paisagismo',
        servico: item.item,
        unidade: item.unidade,
        qtdCalculada: item.qtd,
        margemPerda: perda,
        qtdComPerda: comPerda,
        produtividade: 0.3,
        duracaoHoras: comPerda * 0.3
      });
    });

    return lista;
  });

  // ==================== REGRAS DE AUTOAUDITORIA ====================
  readonly regrasAuditoria = computed<RegraAuditoria[]>(() => {
    const regras: RegraAuditoria[] = [];

    const bal = this.baldrame();
    const blo = this.blocos();
    const sap = this.sapatas();
    const rad = this.radier();
    const tub = this.tubuloes();
    const pil = this.pilares();
    const vig = this.vigas();
    const laj = this.lajes();
    const a = this.arquitetonico();
    const q = this.esquadrias();
    const c = this.cobertura();
    const distEl = this.distribuicaoEletrica();
    const prumEl = this.prumadasEletricas();
    const esgPlu = this.esgotoPluvial();
    const hidr = this.hidraulica();
    const i = this.instalacoes();

    const totalFundacoes = bal.length + blo.length + sap.length + rad.length + tub.length;
    const totalEstruturas = pil.length + vig.length + laj.length;

    // Regra 1: Alvenaria vs. Desconto de Vãos
    const temAlvenaria = a.some(item => item.tipo.startsWith('alvenaria'));
    const totalDesconto = a.reduce((acc, item) => acc + item.desconto, 0);
    const totalEsqArea = q.reduce((acc, item) => acc + item.area, 0);

    if (temAlvenaria && totalEsqArea > 0 && totalDesconto === 0) {
      regras.push({
        id: 'r1',
        titulo: 'Desconto de Vãos em Alvenaria',
        status: 'alerta',
        mensagem: `Existem ${totalEsqArea.toFixed(1)} m² de esquadrias lançadas, mas o desconto de vãos na alvenaria está zerado. Verifique se os vãos de portas e janelas devem ser descontados da área bruta.`
      });
    } else if (temAlvenaria) {
      regras.push({
        id: 'r1',
        titulo: 'Desconto de Vãos em Alvenaria',
        status: 'ok',
        mensagem: 'Descontos de vãos devidamente considerados nas alvenarias lançadas.'
      });
    }

    // Regra 2: Alvenaria vs. Revestimento / Pintura
    const temRevestimento = a.some(item => item.tipo === 'revestimento-parede' || item.tipo === 'pintura');
    if (temAlvenaria && !temRevestimento) {
      regras.push({
        id: 'r2',
        titulo: 'Revestimento e Pintura de Paredes',
        status: 'alerta',
        mensagem: 'Alvenarias foram cadastradas, mas ainda não foram identificados serviços de revestimento de parede (emboço/reboco) ou pintura.'
      });
    } else if (temAlvenaria && temRevestimento) {
      regras.push({
        id: 'r2',
        titulo: 'Revestimento e Pintura de Paredes',
        status: 'ok',
        mensagem: 'Alvenaria acompanhada de serviços de revestimento e acabamento.'
      });
    }

    // Regra 3: Fundações vs. Profundidade de Escavação
    if (totalFundacoes > 0) {
      const escavTotal = this.totalEscavacaoGeral();
      regras.push({
        id: 'r3',
        titulo: 'Escavação e Movimentação de Terra',
        status: 'ok',
        mensagem: `Volume escavado de ${escavTotal.toFixed(2)} m³ calculado com precisão de Sienge para os ${totalFundacoes} elementos de fundação.`
      });
    }

    // Regra 4: Estrutura vs. Forma e Escoramento
    const totalEscoramento = this.totalEscoramentoGeral();
    if ((vig.length > 0 || laj.length > 0) && totalEscoramento === 0) {
      regras.push({
        id: 'r4',
        titulo: 'Cimbramento e Escoramento de Vigas/Lajes',
        status: 'alerta',
        mensagem: 'Vigas ou lajes lançadas sem escoramento computado. Verifique as alturas e escoramentos de laje/viga.'
      });
    } else if (vig.length > 0 || laj.length > 0) {
      regras.push({
        id: 'r4',
        titulo: 'Escoramento de Estruturas',
        status: 'ok',
        mensagem: `Escoramento de ${totalEscoramento.toFixed(2)} m³ devidamente dimensionado para as vigas e lajes.`
      });
    }

    // Regra 5: Cobertura vs. Calhas e Drenagem Pluvial
    const temTelhado = c.some(item => item.tipo.startsWith('telha') || item.tipo.startsWith('estrutura'));
    const temCalha = c.some(item => item.tipo === 'calha');
    if (temTelhado && !temCalha) {
      regras.push({
        id: 'r5',
        titulo: 'Drenagem Pluvial de Cobertura (Calhas e Rufos)',
        status: 'alerta',
        mensagem: 'Cobertura cadastrada sem calhas ou condutores pluviais. Verifique se o projeto prevê calhas, rufos ou beirais livres.'
      });
    } else if (temTelhado && temCalha) {
      regras.push({
        id: 'r5',
        titulo: 'Drenagem de Cobertura',
        status: 'ok',
        mensagem: 'Estrutura de cobertura e sistema de calhas/rufos lançados.'
      });
    }

    // Regra 6: Instalações Prediais - Eletrodutos vs. Cabos
    const totalElItens = distEl.length + prumEl.length;
    const temEletroduto = distEl.some(item => item.categoria.includes('Eletroduto')) || prumEl.some(item => item.categoria.includes('Eletroduto'));
    const temFiosCabos = distEl.some(item => item.categoria.includes('Fios')) || prumEl.some(item => item.categoria.includes('Fios'));

    if (totalElItens > 0 && temEletroduto && !temFiosCabos) {
      regras.push({
        id: 'r6',
        titulo: 'Instalações Elétricas: Eletrodutos e Condutores',
        status: 'alerta',
        mensagem: 'Eletrodutos ou canaletas foram lançados, mas nenhum circuito de fios/cabos elétricos foi cadastrado ainda.'
      });
    } else if (totalElItens > 0 && temEletroduto && temFiosCabos) {
      regras.push({
        id: 'r6',
        titulo: 'Instalações Elétricas Completas',
        status: 'ok',
        mensagem: 'Infraestrutura de tubulação elétrica e condutores devidamente lançados com perdas setoriais.'
      });
    }

    // Regra 7: Instalações Prediais - Esgoto vs. Hidráulica
    const totalHidroItens = esgPlu.length + hidr.length + i.length;
    if (hidr.length > 0 && esgPlu.length === 0) {
      regras.push({
        id: 'r7',
        titulo: 'Instalações Hidrossanitárias: Esgoto & Pluvial',
        status: 'alerta',
        mensagem: 'Tubulação hidráulica de água fria/quente lançada, mas o sistema de esgoto e pluvial ainda não possui itens.'
      });
    } else if (hidr.length > 0 && esgPlu.length > 0) {
      regras.push({
        id: 'r7',
        titulo: 'Instalações Hidrossanitárias Integradas',
        status: 'ok',
        mensagem: 'Sistemas de água, esgoto e pluvial devidamente cadastrados com cálculo de conexões e perdas.'
      });
    }

    return regras;
  });

  // ==================== MÉTODOS DE ATUALIZAÇÃO DE PARÂMETROS ====================
  atualizarParametro(chave: keyof ParametrosCalculo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value) || 0;
    this.parametros.update(p => ({ ...p, [chave]: val }));
  }

  // ==================== SESSÃO JSON E EXPORTAÇÃO CSV ====================
  salvarSessaoJson(): void {
    const estado = {
      versao: '2.1-sienge-12sistemas',
      dataExportacao: new Date().toISOString(),
      parametros: this.parametros(),
      margensPerda: this.margensPerda(),
      perdasCategorias: this.perdasCategorias(),
      baldrame: this.baldrame(),
      blocos: this.blocos(),
      sapatas: this.sapatas(),
      radier: this.radier(),
      tubuloes: this.tubuloes(),
      pilares: this.pilares(),
      vigas: this.vigas(),
      lajes: this.lajes(),
      arquitetonico: this.arquitetonico(),
      esquadrias: this.esquadrias(),
      cobertura: this.cobertura(),
      pergolados: this.pergolados(),
      distribuicaoEletrica: this.distribuicaoEletrica(),
      prumadasEletricas: this.prumadasEletricas(),
      esgotoPluvial: this.esgotoPluvial(),
      hidraulica: this.hidraulica(),
      instalacoes: this.instalacoes(),
      paisagismo: this.paisagismo()
    };

    const jsonStr = JSON.stringify(estado, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `levantamento_quantitativos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.exibirNotificacao('Sessão salva com sucesso! Arquivo .json baixado.');
  }

  carregarSessaoJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dados = JSON.parse(conteudo);

        if (dados.parametros) this.parametros.set(dados.parametros);
        if (dados.margensPerda) this.margensPerda.set(dados.margensPerda);
        if (dados.perdasCategorias) this.perdasCategorias.set(dados.perdasCategorias);
        if (dados.baldrame) this.baldrame.set(dados.baldrame);
        if (dados.blocos) this.blocos.set(dados.blocos);
        if (dados.sapatas) this.sapatas.set(dados.sapatas);
        if (dados.radier) this.radier.set(dados.radier);
        if (dados.tubuloes) this.tubuloes.set(dados.tubuloes);
        if (dados.pilares) this.pilares.set(dados.pilares);
        if (dados.vigas) this.vigas.set(dados.vigas);
        if (dados.lajes) this.lajes.set(dados.lajes);
        if (dados.arquitetonico) this.arquitetonico.set(dados.arquitetonico);
        if (dados.esquadrias) this.esquadrias.set(dados.esquadrias);
        if (dados.cobertura) this.cobertura.set(dados.cobertura);
        if (dados.pergolados) this.pergolados.set(dados.pergolados);
        if (dados.distribuicaoEletrica) this.distribuicaoEletrica.set(dados.distribuicaoEletrica);
        if (dados.prumadasEletricas) this.prumadasEletricas.set(dados.prumadasEletricas);
        if (dados.esgotoPluvial) this.esgotoPluvial.set(dados.esgotoPluvial);
        if (dados.hidraulica) this.hidraulica.set(dados.hidraulica);
        if (dados.instalacoes) this.instalacoes.set(dados.instalacoes);
        if (dados.paisagismo) this.paisagismo.set(dados.paisagismo);

        this.exibirNotificacao('Sessão carregada com sucesso a partir do arquivo JSON!');
      } catch (err) {
        this.exibirNotificacao('Erro ao ler o arquivo JSON. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(arquivo);
    input.value = '';
  }

  exportarCsv(): void {
    const consolidado = this.resumoConsolidado();
    if (consolidado.length === 0) {
      this.exibirNotificacao('Não há itens cadastrados para exportar no resumo.');
      return;
    }

    let csvContent = '\uFEFFDisciplina;Serviço / Insumo;Unidade;Qtd. Calculada;Margem Perda (%);Qtd. com Perda;Produtividade (h/un);Duração Estimada (h)\n';

    consolidado.forEach(item => {
      const linha = [
        `"${item.disciplina}"`,
        `"${item.servico.replace(/"/g, '""')}"`,
        `"${item.unidade}"`,
        item.qtdCalculada.toFixed(2).replace('.', ','),
        item.margemPerda.toString(),
        item.qtdComPerda.toFixed(2).replace('.', ','),
        item.produtividade.toFixed(2).replace('.', ','),
        item.duracaoHoras.toFixed(1).replace('.', ',')
      ].join(';');
      csvContent += linha + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo_quantitativos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.exibirNotificacao('Planilha CSV exportada com sucesso!');
  }

  // =========================================================================
  // EXPORTAÇÃO EM PDF WHITE-LABEL (MotorPdfService)
  // =========================================================================
  async exportarPDF(): Promise<void> {
    const consolidado = this.resumoConsolidado();
    if (this.totalItensLancados() === 0 && consolidado.length === 0) {
      this.exibirNotificacao('Não há itens cadastrados para exportar no relatório PDF.');
      return;
    }

    this.gerandoPdf.set(true);

    try {
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      const nomeEmpreendimento = this.projetoAtualNome() || 'Levantamento de Quantitativos de Obras';

      const fmt = (v: number, dec: number = 2) =>
        (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

      const secoesSistemasHtml: string[] = [];

      // 1. Baldrame
      const itensBaldrame = this.baldrame();
      if (itensBaldrame.length > 0) {
        const totConc = itensBaldrame.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensBaldrame.reduce((a, b) => a + b.forma, 0);
        const totEscav = itensBaldrame.reduce((a, b) => a + b.escavacao, 0);
        const totLastro = itensBaldrame.reduce((a, b) => a + b.lastro, 0);
        const totReaterro = itensBaldrame.reduce((a, b) => a + b.reaterro, 0);
        const totAco = itensBaldrame.reduce((a, b) => a + b.aco, 0);
        const totQtd = itensBaldrame.reduce((a, b) => a + b.qtd, 0);

        const rows = itensBaldrame.map(i => `
          <tr>
            <td><strong>${i.nome || 'Baldrame'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} × ${fmt(i.comprimento)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escavacao)}</td>
            <td class="td-right">${fmt(i.lastro)}</td>
            <td class="td-right">${fmt(i.reaterro)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">1. Vigas Baldrame (Fundação Superficial)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Viga / Identificação</th>
                  <th class="th-center" style="width: 17%;">Seção (L×H×C)</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 9%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 9%;">Formas (m²)</th>
                  <th class="th-right" style="width: 9%;">Escavação (m³)</th>
                  <th class="th-right" style="width: 9%;">Lastro (m³)</th>
                  <th class="th-right" style="width: 10%;">Reaterro (m³)</th>
                  <th class="th-right" style="width: 10%;">Aço CA-50 (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL BALDRAME</strong></td>
                  <td class="td-center">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscav)} m³</td>
                  <td class="td-right">${fmt(totLastro)} m³</td>
                  <td class="td-right">${fmt(totReaterro)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 2. Blocos de Fundação
      const itensBlocos = this.blocos();
      if (itensBlocos.length > 0) {
        const totConc = itensBlocos.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensBlocos.reduce((a, b) => a + b.forma, 0);
        const totEscav = itensBlocos.reduce((a, b) => a + b.escavacao, 0);
        const totLastro = itensBlocos.reduce((a, b) => a + b.lastro, 0);
        const totReaterro = itensBlocos.reduce((a, b) => a + b.reaterro, 0);
        const totAco = itensBlocos.reduce((a, b) => a + b.aco, 0);
        const totQtd = itensBlocos.reduce((a, b) => a + b.qtd, 0);

        const rows = itensBlocos.map(i => `
          <tr>
            <td><strong>${i.nome || 'Bloco'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} × ${fmt(i.comprimento)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escavacao)}</td>
            <td class="td-right">${fmt(i.lastro)}</td>
            <td class="td-right">${fmt(i.reaterro)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">2. Blocos de Fundação (Coroamento de Estacas)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Bloco / Identificação</th>
                  <th class="th-center" style="width: 17%;">Dimensões (L×H×C)</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 9%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 9%;">Formas (m²)</th>
                  <th class="th-right" style="width: 9%;">Escavação (m³)</th>
                  <th class="th-right" style="width: 9%;">Lastro (m³)</th>
                  <th class="th-right" style="width: 10%;">Reaterro (m³)</th>
                  <th class="th-right" style="width: 10%;">Aço CA-50 (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL BLOCOS</strong></td>
                  <td class="td-center">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscav)} m³</td>
                  <td class="td-right">${fmt(totLastro)} m³</td>
                  <td class="td-right">${fmt(totReaterro)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 3. Sapatas Isoladas
      const itensSapatas = this.sapatas();
      if (itensSapatas.length > 0) {
        const totConc = itensSapatas.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensSapatas.reduce((a, b) => a + b.forma, 0);
        const totEscav = itensSapatas.reduce((a, b) => a + b.escavacao, 0);
        const totLastro = itensSapatas.reduce((a, b) => a + b.lastro, 0);
        const totAco = itensSapatas.reduce((a, b) => a + b.aco, 0);
        const totQtd = itensSapatas.reduce((a, b) => a + b.qtd, 0);

        const rows = itensSapatas.map(i => `
          <tr>
            <td><strong>${i.nome || 'Sapata'}</strong></td>
            <td class="td-center">${fmt(i.larguraBase)} × ${fmt(i.comprimentoBase)} m</td>
            <td class="td-center">${fmt(i.larguraFuste)} × ${fmt(i.comprimentoFuste)} m</td>
            <td class="td-center">${fmt(i.alturaTronco)} / ${fmt(i.alturaBase)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escavacao)}</td>
            <td class="td-right">${fmt(i.lastro)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">3. Sapatas Isoladas (Fundação Direta)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 18%;">Identificação</th>
                  <th class="th-center" style="width: 12%;">Base (Lb×Cb)</th>
                  <th class="th-center" style="width: 12%;">Fuste (Lf×Cf)</th>
                  <th class="th-center" style="width: 10%;">Alturas (H/B)</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 9%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 9%;">Formas (m²)</th>
                  <th class="th-right" style="width: 8%;">Escavação (m³)</th>
                  <th class="th-right" style="width: 8%;">Lastro (m³)</th>
                  <th class="th-right" style="width: 9%;">Aço CA-50 (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL SAPATAS</strong></td>
                  <td class="td-center" colspan="3">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscav)} m³</td>
                  <td class="td-right">${fmt(totLastro)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 4. Radier
      const itensRadier = this.radier();
      if (itensRadier.length > 0) {
        const totConc = itensRadier.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensRadier.reduce((a, b) => a + b.forma, 0);
        const totEscav = itensRadier.reduce((a, b) => a + b.escavacao, 0);
        const totLastro = itensRadier.reduce((a, b) => a + b.lastro, 0);
        const totAco = itensRadier.reduce((a, b) => a + b.aco, 0);
        const totQtd = itensRadier.reduce((a, b) => a + b.qtd, 0);

        const rows = itensRadier.map(i => `
          <tr>
            <td><strong>${i.nome || 'Radier'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} × ${fmt(i.comprimento)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escavacao)}</td>
            <td class="td-right">${fmt(i.lastro)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">4. Radier (Laje Geral de Fundação)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 24%;">Identificação</th>
                  <th class="th-center" style="width: 18%;">Dimensões (L×H×C)</th>
                  <th class="th-center" style="width: 6%;">Qtd</th>
                  <th class="th-right" style="width: 11%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 10%;">Formas (m²)</th>
                  <th class="th-right" style="width: 10%;">Escavação (m³)</th>
                  <th class="th-right" style="width: 10%;">Lastro (m³)</th>
                  <th class="th-right" style="width: 11%;">Aço CA-50 (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL RADIER</strong></td>
                  <td class="td-center">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscav)} m³</td>
                  <td class="td-right">${fmt(totLastro)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 5. Tubulões
      const itensTubuloes = this.tubuloes();
      if (itensTubuloes.length > 0) {
        const totConc = itensTubuloes.reduce((a, b) => a + b.concreto, 0);
        const totEscav = itensTubuloes.reduce((a, b) => a + b.escavacao, 0);
        const totBotaFora = itensTubuloes.reduce((a, b) => a + b.botaFora, 0);
        const totAco = itensTubuloes.reduce((a, b) => a + b.aco, 0);
        const totQtd = itensTubuloes.reduce((a, b) => a + b.qtd, 0);

        const rows = itensTubuloes.map(i => `
          <tr>
            <td><strong>${i.nome || 'Tubulão'}</strong></td>
            <td class="td-center">Ø ${fmt(i.diametroFuste)} × ${fmt(i.alturaFuste)} m</td>
            <td class="td-center">Ø ${fmt(i.diametroBase)} × ${fmt(i.alturaBase)} m</td>
            <td class="td-center">${fmt(i.alturaB)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.escavacao)}</td>
            <td class="td-right">${fmt(i.botaFora)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">5. Tubulões a Céu Aberto (Fundação Profunda)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 20%;">Identificação</th>
                  <th class="th-center" style="width: 15%;">Fuste (Df × Hf)</th>
                  <th class="th-center" style="width: 15%;">Base (Db × Hb)</th>
                  <th class="th-center" style="width: 9%;">Rodapé (b)</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 12%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 12%;">Escavação (m³)</th>
                  <th class="th-right" style="width: 12%;">Bota-Fora (m³)</th>
                  <th class="th-right" style="width: 12%;">Aço CA-50 (kg)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL TUBULÕES</strong></td>
                  <td class="td-center" colspan="3">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totEscav)} m³</td>
                  <td class="td-right">${fmt(totBotaFora)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 6. Pilares
      const itensPilares = this.pilares();
      if (itensPilares.length > 0) {
        const totConc = itensPilares.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensPilares.reduce((a, b) => a + b.forma, 0);
        const totAco = itensPilares.reduce((a, b) => a + b.aco, 0);
        const totSolda = itensPilares.reduce((a, b) => a + b.solda, 0);
        const totQtd = itensPilares.reduce((a, b) => a + b.qtd, 0);

        const rows = itensPilares.map(i => `
          <tr>
            <td><strong>${i.nome || 'Pilar'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.comprimento)} m</td>
            <td class="td-center">${fmt(i.altura)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
            <td class="td-right">${fmt(i.solda, 1)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">6. Pilares (Superestrutura de Concreto Armado)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Identificação do Pilar</th>
                  <th class="th-center" style="width: 17%;">Seção (L × C)</th>
                  <th class="th-center" style="width: 11%;">Altura (H)</th>
                  <th class="th-center" style="width: 6%;">Qtd</th>
                  <th class="th-right" style="width: 11%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 11%;">Formas (m²)</th>
                  <th class="th-right" style="width: 11%;">Aço CA-50 (kg)</th>
                  <th class="th-right" style="width: 8%;">Solda (h)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL PILARES</strong></td>
                  <td class="td-center" colspan="2">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                  <td class="td-right">${fmt(totSolda, 1)} h</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 7. Vigas Superiores
      const itensVigas = this.vigas();
      if (itensVigas.length > 0) {
        const totConc = itensVigas.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensVigas.reduce((a, b) => a + b.forma, 0);
        const totEscor = itensVigas.reduce((a, b) => a + b.escoramento, 0);
        const totAco = itensVigas.reduce((a, b) => a + b.aco, 0);
        const totSolda = itensVigas.reduce((a, b) => a + b.solda, 0);
        const totQtd = itensVigas.reduce((a, b) => a + b.qtd, 0);

        const rows = itensVigas.map(i => `
          <tr>
            <td><strong>${i.nome || 'Viga'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} m</td>
            <td class="td-center">${fmt(i.comprimento)} m</td>
            <td class="td-center">${fmt(i.alturaFundoViga)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escoramento)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
            <td class="td-right">${fmt(i.solda, 1)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">7. Vigas Superiores (Superestrutura)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Identificação da Viga</th>
                  <th class="th-center" style="width: 14%;">Seção (L × H)</th>
                  <th class="th-center" style="width: 11%;">Compr. (C)</th>
                  <th class="th-center" style="width: 10%;">Fundo (Hfv)</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 9%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 9%;">Formas (m²)</th>
                  <th class="th-right" style="width: 10%;">Escoramento (m³)</th>
                  <th class="th-right" style="width: 10%;">Aço CA-50 (kg)</th>
                  <th class="th-right" style="width: 7%;">Solda (h)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL VIGAS</strong></td>
                  <td class="td-center" colspan="3">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscor)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                  <td class="td-right">${fmt(totSolda, 1)} h</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 8. Lajes Maciças
      const itensLajes = this.lajes();
      if (itensLajes.length > 0) {
        const totConc = itensLajes.reduce((a, b) => a + b.concreto, 0);
        const totForma = itensLajes.reduce((a, b) => a + b.forma, 0);
        const totEscor = itensLajes.reduce((a, b) => a + b.escoramento, 0);
        const totAco = itensLajes.reduce((a, b) => a + b.aco, 0);
        const totSolda = itensLajes.reduce((a, b) => a + b.solda, 0);
        const totQtd = itensLajes.reduce((a, b) => a + b.qtd, 0);

        const rows = itensLajes.map(i => `
          <tr>
            <td><strong>${i.nome || 'Laje'}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} × ${fmt(i.comprimento)} m</td>
            <td class="td-center">${fmt(i.peDireito)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.concreto)}</td>
            <td class="td-right">${fmt(i.forma)}</td>
            <td class="td-right">${fmt(i.escoramento)}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.aco)}</td>
            <td class="td-right">${fmt(i.solda, 1)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">8. Lajes Maciças (Superestrutura)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Identificação da Laje</th>
                  <th class="th-center" style="width: 17%;">Dimensões (L×H×C)</th>
                  <th class="th-center" style="width: 11%;">Pé-Direito</th>
                  <th class="th-center" style="width: 5%;">Qtd</th>
                  <th class="th-right" style="width: 10%;">Concreto (m³)</th>
                  <th class="th-right" style="width: 10%;">Formas (m²)</th>
                  <th class="th-right" style="width: 10%;">Escoramento (m³)</th>
                  <th class="th-right" style="width: 10%;">Aço CA-50 (kg)</th>
                  <th class="th-right" style="width: 7%;">Solda (h)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr class="highlight-gray" style="font-weight: 700;">
                  <td><strong>TOTAL LAJES</strong></td>
                  <td class="td-center" colspan="2">-</td>
                  <td class="td-center">${totQtd} un</td>
                  <td class="td-right">${fmt(totConc)} m³</td>
                  <td class="td-right">${fmt(totForma)} m²</td>
                  <td class="td-right">${fmt(totEscor)} m³</td>
                  <td class="td-right" style="color: var(--p4-navy); font-weight: 800;">${fmt(totAco)} kg</td>
                  <td class="td-right">${fmt(totSolda, 1)} h</td>
                </tr>
              </tbody>
            </table>
          </div>
        `);
      }

      // 9. Distribuição Elétrica
      const itensDistEl = this.distribuicaoEletrica();
      if (itensDistEl.length > 0) {
        const rows = itensDistEl.map(i => `
          <tr>
            <td style="font-weight: 600; color: var(--p4-navy);">${i.categoria}</td>
            <td><strong>${i.especificacao}</strong></td>
            <td>${i.local || '-'}</td>
            <td class="td-right">${fmt(i.quantidade)}</td>
            <td class="td-center">${i.unidade}</td>
            <td class="td-center">${i.margemPerda}%</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.quantidadeComPerda)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">9. Instalações Prediais — Distribuição Elétrica</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Categoria</th>
                  <th style="width: 32%;">Especificação / Insumo</th>
                  <th style="width: 18%;">Local / Circuito</th>
                  <th class="th-right" style="width: 10%;">Qtd. Calc.</th>
                  <th class="th-center" style="width: 5%;">Un.</th>
                  <th class="th-center" style="width: 5%;">Perda</th>
                  <th class="th-right" style="width: 10%;">Qtd. c/ Perda</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // 10. Prumadas Elétricas
      const itensPrumEl = this.prumadasEletricas();
      if (itensPrumEl.length > 0) {
        const rows = itensPrumEl.map(i => `
          <tr>
            <td style="font-weight: 600; color: var(--p4-navy);">${i.categoria}</td>
            <td><strong>${i.especificacao}</strong></td>
            <td>${i.local || '-'}</td>
            <td class="td-right">${fmt(i.quantidade)}</td>
            <td class="td-center">${i.unidade}</td>
            <td class="td-center">${i.margemPerda}%</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.quantidadeComPerda)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">10. Instalações Prediais — Prumadas Elétricas</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Categoria</th>
                  <th style="width: 32%;">Especificação / Insumo</th>
                  <th style="width: 18%;">Local / Pavimento</th>
                  <th class="th-right" style="width: 10%;">Qtd. Calc.</th>
                  <th class="th-center" style="width: 5%;">Un.</th>
                  <th class="th-center" style="width: 5%;">Perda</th>
                  <th class="th-right" style="width: 10%;">Qtd. c/ Perda</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // 11. Esgoto e Pluvial
      const itensEsgPlu = this.esgotoPluvial();
      if (itensEsgPlu.length > 0) {
        const rows = itensEsgPlu.map(i => `
          <tr>
            <td style="font-weight: 600; color: var(--p4-navy);">${i.categoria}</td>
            <td><strong>${i.especificacao}</strong></td>
            <td>${i.local || '-'}</td>
            <td class="td-right">${fmt(i.quantidade)}</td>
            <td class="td-center">${i.unidade}</td>
            <td class="td-center">${i.margemPerda}%</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.quantidadeComPerda)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">11. Instalações Prediais — Esgoto Sanitário & Águas Pluviais</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Categoria</th>
                  <th style="width: 32%;">Especificação / Insumo</th>
                  <th style="width: 18%;">Local / Ramal</th>
                  <th class="th-right" style="width: 10%;">Qtd. Calc.</th>
                  <th class="th-center" style="width: 5%;">Un.</th>
                  <th class="th-center" style="width: 5%;">Perda</th>
                  <th class="th-right" style="width: 10%;">Qtd. c/ Perda</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // 12. Hidráulica
      const itensHidr = this.hidraulica();
      if (itensHidr.length > 0) {
        const rows = itensHidr.map(i => `
          <tr>
            <td style="font-weight: 600; color: var(--p4-navy);">${i.categoria}</td>
            <td><strong>${i.especificacao}</strong></td>
            <td>${i.local || '-'}</td>
            <td class="td-right">${fmt(i.quantidade)}</td>
            <td class="td-center">${i.unidade}</td>
            <td class="td-center">${i.margemPerda}%</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.quantidadeComPerda)}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">12. Instalações Prediais — Água Fria & Água Quente (Hidráulica)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 22%;">Categoria</th>
                  <th style="width: 32%;">Especificação / Insumo</th>
                  <th style="width: 18%;">Local / Ponto</th>
                  <th class="th-right" style="width: 10%;">Qtd. Calc.</th>
                  <th class="th-center" style="width: 5%;">Un.</th>
                  <th class="th-center" style="width: 5%;">Perda</th>
                  <th class="th-right" style="width: 10%;">Qtd. c/ Perda</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // Outras Disciplinas se existirem itens:
      // Arquitetônico
      const itensArq = this.arquitetonico();
      if (itensArq.length > 0) {
        const rows = itensArq.map(i => `
          <tr>
            <td><strong>${this.formatarNomeServico(i.tipo)}</strong></td>
            <td class="td-center">${fmt(i.comprimento)} × ${fmt(i.altura)} m</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right">${fmt(i.desconto)} m²</td>
            <td class="td-right">${fmt(i.areaBruta)} m²</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.areaLiquida)} m²</td>
            <td class="td-right">${fmt(i.encunhamento)} m</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">Arquitetônico (Alvenarias & Revestimentos)</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 32%;">Serviço / Elemento</th>
                  <th class="th-center" style="width: 16%;">Dimensões (C × H)</th>
                  <th class="th-center" style="width: 6%;">Qtd</th>
                  <th class="th-right" style="width: 12%;">Descontos (m²)</th>
                  <th class="th-right" style="width: 12%;">Área Bruta (m²)</th>
                  <th class="th-right" style="width: 12%;">Área Líquida (m²)</th>
                  <th class="th-right" style="width: 10%;">Encunhamento (m)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // Esquadrias
      const itensEsq = this.esquadrias();
      if (itensEsq.length > 0) {
        const rows = itensEsq.map(i => `
          <tr>
            <td><strong>${this.formatarNomeEsquadria(i.tipo)}</strong></td>
            <td class="td-center">${fmt(i.largura)} × ${fmt(i.altura)} m</td>
            <td class="td-center">${i.qtd} un</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.area)} m²</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">Esquadrias & Serralheria</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 45%;">Tipologia da Esquadria</th>
                  <th class="th-center" style="width: 25%;">Vão de Abertura (L × H)</th>
                  <th class="th-center" style="width: 15%;">Quantidade</th>
                  <th class="th-right" style="width: 15%;">Área Total (m²)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // Cobertura, Pergolados, Paisagismo
      const itensCob = this.cobertura();
      if (itensCob.length > 0) {
        const rows = itensCob.map(i => `
          <tr>
            <td><strong>${this.formatarNomeCobertura(i.tipo)}</strong></td>
            <td class="td-center">${fmt(i.dimensao)} ${i.unidade}</td>
            <td class="td-center">${i.qtd}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(i.total)} ${i.unidade}</td>
          </tr>
        `).join('');

        secoesSistemasHtml.push(`
          <div class="doc-section">
            <div class="doc-section-title">Cobertura & Estruturas de Telhado</div>
            <table class="doc-table">
              <thead>
                <tr>
                  <th style="width: 45%;">Tipo de Cobertura</th>
                  <th class="th-center" style="width: 25%;">Dimensão Unitária</th>
                  <th class="th-center" style="width: 15%;">Quantidade</th>
                  <th class="th-right" style="width: 15%;">Total Calculado</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `);
      }

      // 3. Resumo Consolidado e Produtividade (Linhas do computed)
      let totalHorasEquipe = 0;
      const rowsConsolidado = consolidado.map(c => {
        totalHorasEquipe += c.duracaoHoras;
        return `
          <tr>
            <td style="font-weight: 700; color: var(--p4-navy);">${c.disciplina}</td>
            <td><strong>${c.servico}</strong></td>
            <td class="td-center font-mono">${c.unidade}</td>
            <td class="td-right">${fmt(c.qtdCalculada)}</td>
            <td class="td-center" style="color: var(--p4-amber); font-weight: 600;">${c.margemPerda}%</td>
            <td class="td-right font-bold" style="color: var(--p4-ink);">${fmt(c.qtdComPerda)}</td>
            <td class="td-right">${fmt(c.produtividade)} h/${c.unidade}</td>
            <td class="td-right font-bold" style="color: var(--p4-navy);">${fmt(c.duracaoHoras, 1)} h</td>
          </tr>
        `;
      }).join('');

      // 4. Bloco de Autoauditoria
      const regras = this.regrasAuditoria();
      const rowsAuditoria = regras.map(r => `
        <tr class="${r.status === 'ok' ? 'highlight-emerald' : 'highlight-amber'}">
          <td class="td-center" style="font-weight: 800; font-size: 7pt;">${r.status === 'ok' ? 'CONFORME' : 'ALERTA'}</td>
          <td><strong>${r.titulo}</strong></td>
          <td style="font-size: 7.2pt;">${r.mensagem}</td>
        </tr>
      `).join('');

      // MONTAGEM DO CORPO DO DOCUMENTO
      const corpoHtml = `
        <!-- IDENTIFICAÇÃO DO PROJETO & RESUMO EXECUTIVO -->
        <div class="doc-card-info">
          <div class="doc-grid-4">
            <div class="doc-info-item">
              <span class="doc-info-label">Empreendimento</span>
              <span class="doc-info-value">${nomeEmpreendimento}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Data de Emissão</span>
              <span class="doc-info-value">${dataHoje}</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Base de Perdas / Rendimentos</span>
              <span class="doc-info-value">SINAPI / TCPO / Sienge</span>
            </div>
            <div class="doc-info-item">
              <span class="doc-info-label">Normas Regulamentares</span>
              <span class="doc-info-value">NBR 12.721 • NBR 6118 • NBR 6122</span>
            </div>
          </div>
        </div>

        <!-- INDICADORES GERAIS DE VOLUME E MATERIAIS -->
        <div class="doc-kpi-grid">
          <div class="doc-kpi-card navy">
            <div class="doc-kpi-label">Volume de Concreto</div>
            <div class="doc-kpi-val">${fmt(this.totalConcretoGeral())} m³</div>
          </div>
          <div class="doc-kpi-card navy">
            <div class="doc-kpi-label">Área de Formas</div>
            <div class="doc-kpi-val">${fmt(this.totalFormaGeral())} m²</div>
          </div>
          <div class="doc-kpi-card navy">
            <div class="doc-kpi-label">Armaduras de Aço CA-50</div>
            <div class="doc-kpi-val">${fmt(this.totalAcoGeral())} kg</div>
          </div>
          <div class="doc-kpi-card emerald">
            <div class="doc-kpi-label">Horas Estimadas de Equipe</div>
            <div class="doc-kpi-val">${fmt(totalHorasEquipe, 1)} h</div>
          </div>
        </div>

        <!-- 2. SEÇÕES DETALHADAS POR SISTEMA CONSTRUTIVO / INSTALAÇÃO COM ITENS LANÇADOS -->
        ${secoesSistemasHtml.join('')}

        <!-- 3. SEÇÃO FINAL: RESUMO CONSOLIDADO E PRODUTIVIDADE -->
        <div class="doc-section">
          <div class="doc-section-title">Resumo Consolidado de Quantitativos, Perdas & Produtividade</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 15%;">Disciplina</th>
                <th style="width: 31%;">Serviço / Insumo</th>
                <th class="th-center" style="width: 5%;">Un.</th>
                <th class="th-right" style="width: 9%;">Qtd. Calc.</th>
                <th class="th-center" style="width: 6%;">Perda</th>
                <th class="th-right" style="width: 10%;">Qtd. c/ Perda</th>
                <th class="th-right" style="width: 11%;">Produtividade</th>
                <th class="th-right" style="width: 13%;">Duração Equipe</th>
              </tr>
            </thead>
            <tbody>
              ${rowsConsolidado}
              <tr class="highlight-gray" style="font-weight: 700;">
                <td colspan="7"><strong>TOTAL GERAL DE HORAS ESTIMADAS DE MÃO DE OBRA (EQUIPE)</strong></td>
                <td class="td-right" style="color: var(--p4-navy); font-weight: 800; font-size: 8.5pt;">${fmt(totalHorasEquipe, 1)} h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. BLOCO DE AUTOAUDITORIA EXECUTIVA -->
        <div class="doc-section">
          <div class="doc-section-title">Checklist & Relatório de Autoauditoria Executiva</div>
          <table class="doc-table">
            <thead>
              <tr>
                <th class="th-center" style="width: 10%;">Status</th>
                <th style="width: 32%;">Item / Regra de Auditoria</th>
                <th style="width: 58%;">Parecer Técnico & Diretriz de Verificação</th>
              </tr>
            </thead>
            <tbody>
              ${rowsAuditoria}
            </tbody>
          </table>
        </div>

        <!-- NOTA LEGAL METODOLÓGICA -->
        <div class="doc-legal-note">
          <strong>Nota de Responsabilidade Técnica:</strong> O presente Memorial de Levantamento de Quantitativos e Dimensionamento de Insumos foi elaborado com base nas normas ABNT NBR 12.721 (Avaliação de custos unitários e preparo de orçamento), NBR 6118 (Projeto de estruturas de concreto), NBR 6122 (Projeto e execução de fundações), NBR 5410 / NBR 5626 (Instalações elétricas e prediais de água) e índices de consumo da base SINAPI / TCPO / Sienge. Todos os quantitativos e taxas de perda devem ser verificados e validados pelo Responsável Técnico da obra antes da emissão das ordens de compra e cronograma executivo.
        </div>
      `;

      await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: 'Memorial de Levantamento de Quantitativos',
          subtituloDocumento: 'Engenharia de Custos • Orçamento & Produtividade de Obras',
          nomeAgente: 'Agente de Levantamento de Quantitativos'
        },
        corpoHtml
      );
    } catch (err) {
      console.error('Erro ao gerar memorial de quantitativos em PDF:', err);
      this.motorPdfService.exibirToast('Ocorreu um erro ao emitir o relatório em PDF. Verifique seus dados e tente novamente.', 'erro');
    } finally {
      this.gerandoPdf.set(false);
    }
  }

  exibirNotificacao(texto: string): void {
    this.mensagemNotificacao.set(texto);
    setTimeout(() => {
      if (this.mensagemNotificacao() === texto) {
        this.mensagemNotificacao.set(null);
      }
    }, 5000);
  }

  formatarNomeServico(tipo: string): string {
    const mapa: Record<string, string> = {
      'alvenaria-ceramica': 'Alvenaria de vedação em bloco cerâmico',
      'alvenaria-bloco': 'Alvenaria estrutural em bloco de concreto',
      'revestimento-parede': 'Revestimento de parede (emboço/reboco)',
      'piso-ceramico': 'Piso cerâmico / porcelanato retificado',
      'pintura': 'Pintura látex acrílica em paredes'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomeEsquadria(tipo: string): string {
    const mapa: Record<string, string> = {
      'porta-lisa': 'Porta lisa de madeira semi-oca',
      'porta-veneziana': 'Porta veneziana de alumínio',
      'janela-correr': 'Janela de correr em alumínio e vidro',
      'janela-basculante': 'Janela basculante / maxim-ar',
      'portao': 'Portão metálico de acesso',
      'guarda-corpo': 'Guarda-corpo / gradil de proteção'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomeCobertura(tipo: string): string {
    const mapa: Record<string, string> = {
      'telha-ceramica': 'Telhamento cerâmico / termoacústico',
      'estrutura-metalica': 'Estrutura metálica de cobertura (perfis)',
      'estrutura-madeira': 'Estrutura de madeira aparelhada (tesouras)',
      'calha': 'Calha e rufo em chapa galvanizada'
    };
    return mapa[tipo] || tipo;
  }

  formatarNomePergolado(tipo: string): string {
    const mapa: Record<string, string> = {
      'pergolado-madeira': 'Pergolado em madeira tratada/aparelhada',
      'pergolado-metalico': 'Pergolado metálico em perfis tubulares',
      'trelica': 'Treliça / brise de sombreamento'
    };
    return mapa[tipo] || tipo;
  }

  // =========================================================================
  // GESTÃO DE PROJETOS SALVOS NA NUVEM (SUPABASE)
  // =========================================================================

  exibirToast(texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso'): void {
    this.toastMensagem.set({ texto, tipo });
    setTimeout(() => {
      this.toastMensagem.set(null);
    }, 3500);
  }

  obterNomeProjetoSugerido(): string {
    if (this.projetoAtualNome()?.trim()) {
      return this.projetoAtualNome().trim();
    }
    const total = this.totalItensLancados();
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    return `Levantamento de Quantitativos (${total} itens) — ${dataHoje}`;
  }

  serializarDadosFormulario(): any {
    return {
      versao: '2.1-sienge-12sistemas',
      dataSalvamento: new Date().toISOString(),
      parametros: this.parametros(),
      margensPerda: this.margensPerda(),
      perdasCategorias: this.perdasCategorias(),
      baldrame: this.baldrame(),
      blocos: this.blocos(),
      sapatas: this.sapatas(),
      radier: this.radier(),
      tubuloes: this.tubuloes(),
      pilares: this.pilares(),
      vigas: this.vigas(),
      lajes: this.lajes(),
      arquitetonico: this.arquitetonico(),
      esquadrias: this.esquadrias(),
      cobertura: this.cobertura(),
      pergolados: this.pergolados(),
      distribuicaoEletrica: this.distribuicaoEletrica(),
      prumadasEletricas: this.prumadasEletricas(),
      esgotoPluvial: this.esgotoPluvial(),
      hidraulica: this.hidraulica(),
      instalacoes: this.instalacoes(),
      paisagismo: this.paisagismo(),
      abaAtiva: this.abaAtiva()
    };
  }

  deserializarDadosFormulario(dados: any): void {
    if (!dados) return;
    if (dados.parametros) this.parametros.set(dados.parametros);
    if (dados.margensPerda) this.margensPerda.set(dados.margensPerda);
    if (dados.perdasCategorias) this.perdasCategorias.set(dados.perdasCategorias);
    if (dados.baldrame) this.baldrame.set(dados.baldrame);
    if (dados.blocos) this.blocos.set(dados.blocos);
    if (dados.sapatas) this.sapatas.set(dados.sapatas);
    if (dados.radier) this.radier.set(dados.radier);
    if (dados.tubuloes) this.tubuloes.set(dados.tubuloes);
    if (dados.pilares) this.pilares.set(dados.pilares);
    if (dados.vigas) this.vigas.set(dados.vigas);
    if (dados.lajes) this.lajes.set(dados.lajes);
    if (dados.arquitetonico) this.arquitetonico.set(dados.arquitetonico);
    if (dados.esquadrias) this.esquadrias.set(dados.esquadrias);
    if (dados.cobertura) this.cobertura.set(dados.cobertura);
    if (dados.pergolados) this.pergolados.set(dados.pergolados);
    if (dados.distribuicaoEletrica) this.distribuicaoEletrica.set(dados.distribuicaoEletrica);
    if (dados.prumadasEletricas) this.prumadasEletricas.set(dados.prumadasEletricas);
    if (dados.esgotoPluvial) this.esgotoPluvial.set(dados.esgotoPluvial);
    if (dados.hidraulica) this.hidraulica.set(dados.hidraulica);
    if (dados.instalacoes) this.instalacoes.set(dados.instalacoes);
    if (dados.paisagismo) this.paisagismo.set(dados.paisagismo);
    if (dados.abaAtiva) this.abaAtiva.set(dados.abaAtiva);
  }

  clicarSalvarProjeto(): void {
    if (this.projetoAtualId()) {
      this.executarAtualizarProjeto();
    } else {
      const sugerido = this.obterNomeProjetoSugerido();
      this.modalSalvarNomeInput.set(sugerido);
      this.modalSalvarAberto.set(true);
    }
  }

  clicarSalvarComoNovo(): void {
    const sugerido = `${this.obterNomeProjetoSugerido()} (Cópia)`;
    this.modalSalvarNomeInput.set(sugerido);
    this.modalSalvarAberto.set(true);
  }

  async confirmarSalvarNovoProjeto(): Promise<void> {
    const nome = this.modalSalvarNomeInput().trim();
    if (!nome) {
      this.exibirToast('Digite um nome para identificar o projeto.', 'erro');
      return;
    }

    this.salvandoProjeto.set(true);
    try {
      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.salvarProjeto('quantitativos', nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao salvar: ${res.error.message}`, 'erro');
      } else {
        this.projetoAtualId.set(res.id || null);
        this.projetoAtualNome.set(nome);
        this.modalSalvarAberto.set(false);
        this.exibirToast(`Projeto "${nome}" salvo com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao salvar projeto: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async executarAtualizarProjeto(): Promise<void> {
    const id = this.projetoAtualId();
    if (!id) return;

    this.salvandoProjeto.set(true);
    try {
      const nome = this.projetoAtualNome() || this.obterNomeProjetoSugerido();
      const dados = this.serializarDadosFormulario();
      const res = await this.supabaseService.atualizarProjeto(id, nome, dados);

      if (res.error) {
        this.exibirToast(`Erro ao atualizar: ${res.error.message}`, 'erro');
      } else {
        this.exibirToast(`Projeto "${nome}" atualizado com sucesso!`, 'sucesso');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao atualizar: ${err?.message || err}`, 'erro');
    } finally {
      this.salvandoProjeto.set(false);
    }
  }

  async abrirModalMeusProjetos(): Promise<void> {
    this.modalProjetosAberto.set(true);
    this.carregandoProjetos.set(true);
    try {
      const lista = await this.supabaseService.listarMeusProjetos('quantitativos');
      this.listaProjetosSalvos.set(lista);
    } catch (err) {
      console.error('Erro ao listar projetos de quantitativos:', err);
    } finally {
      this.carregandoProjetos.set(false);
    }
  }

  abrirProjetoSalvo(proj: any): void {
    try {
      this.deserializarDadosFormulario(proj.dados_formulario);
      this.projetoAtualId.set(proj.id);
      this.projetoAtualNome.set(proj.nome_projeto);
      this.modalProjetosAberto.set(false);
      this.exibirToast(`Projeto "${proj.nome_projeto}" carregado com sucesso!`, 'sucesso');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      this.exibirToast(`Erro ao carregar projeto: ${err?.message || err}`, 'erro');
    }
  }

  async confirmarExcluirProjeto(proj: any, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Deseja realmente excluir o projeto "${proj.nome_projeto}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await this.supabaseService.excluirProjeto(proj.id);
      if (res.error) {
        this.exibirToast(`Erro ao excluir: ${res.error.message}`, 'erro');
      } else {
        if (this.projetoAtualId() === proj.id) {
          this.projetoAtualId.set(null);
          this.projetoAtualNome.set('');
        }
        this.listaProjetosSalvos.update(l => l.filter(p => p.id !== proj.id));
        this.exibirToast(`Projeto "${proj.nome_projeto}" excluído.`, 'info');
      }
    } catch (err: any) {
      this.exibirToast(`Erro ao excluir projeto: ${err?.message || err}`, 'erro');
    }
  }

  formatarDataProjeto(dataIso: string): string {
    if (!dataIso) return '-';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataIso;
    }
  }
}
