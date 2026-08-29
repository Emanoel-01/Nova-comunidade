import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CHECKLIST_LICITACAO_PADRAO, DECLARACOES_PADRAO_LEI_14133, ItemChecklistLicitacao, DeclaracaoLicitacaoPadrao } from './checklist-licitacao.data';
import { SupabaseService, DadosDocumentaisTecnicos } from '../../../../services/supabase.service';
import { MotorPdfService } from '../../../services/motor-pdf.service';
import { GeradorDocxLicitacaoService, DadosEmpresaLicitacao, DeclaracaoItemLicitacao, DadosEnvelopeLicitacao } from '../../../services/gerador-docx-licitacao.service';

type CategoriaLicitacao = ItemChecklistLicitacao['categoria'];

interface ArquivoHospedadoItem {
  nome: string;
  tamanho: number;
  caminhoStorage: string;
  urlAssinada?: string;
  enviadoEm: string;
}

interface MensagemChatLocal {
  id?: string;
  papel: 'usuario' | 'assistente';
  conteudo: string;
  criadoEm: string;
}

export interface ItemDeclaracaoUI {
  id: string;
  nome: string;
  obrigatorio: boolean;
  origem: string;
  baseLegal: string;
  textoModelo: string;
  textoCustomizado?: string;
  orientacaoPreenchimento?: string;
  selecionada: boolean;
}

@Component({
  selector: 'app-checklist-licitacao',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checklist-licitacao.component.html',
  styleUrls: ['./checklist-licitacao.component.css']
})
export class ChecklistLicitacaoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly motorPdfService = inject(MotorPdfService);
  private readonly geradorDocxService = inject(GeradorDocxLicitacaoService);

  // -------------------------------------------------------------------------
  // 0. Navegação por Abas Principais
  // -------------------------------------------------------------------------
  readonly abaAtiva = signal<'checklist' | 'analise_edital' | 'auditoria_docs' | 'documentos_proposta'>('checklist');

  // -------------------------------------------------------------------------
  // 1. Estado Básico do Edital e Itens
  // -------------------------------------------------------------------------
  readonly nomeEdital = signal<string>('');
  readonly linkEdital = signal<string>('');
  readonly orgaoLicitanteManual = signal<string>('');
  readonly objetoLicitacaoManual = signal<string>('');
  readonly itensMarcados = signal<Set<string>>(new Set<string>());
  readonly checklist = CHECKLIST_LICITACAO_PADRAO;

  // -------------------------------------------------------------------------
  // 2. Arquivos Hospedados (Edital + Itens)
  // -------------------------------------------------------------------------
  readonly arquivosEdital = signal<ArquivoHospedadoItem[]>([]);
  readonly uploadingEdital = signal<boolean>(false);

  // Mapeamento: itemId -> lista de arquivos
  readonly arquivosPorItem = signal<Record<string, ArquivoHospedadoItem[]>>({});
  readonly uploadingItemId = signal<string | null>(null);

  // -------------------------------------------------------------------------
  // 3. Pacotes & Quotas de Uso
  // -------------------------------------------------------------------------
  readonly statusPacotes = signal<{
    temPacoteA: boolean;
    temPacoteB: boolean;
    pacotesAtivos: any[];
    limiteAnalisesMes: number;
    analisesUsadasMes: number;
    analisesRestantesMes: number;
    limiteMensagensChatMes: number;
    mensagensChatUsadasMes: number;
    mensagensChatRestantesMes: number;
  }>({
    temPacoteA: false,
    temPacoteB: false,
    pacotesAtivos: [],
    limiteAnalisesMes: 0,
    analisesUsadasMes: 0,
    analisesRestantesMes: 0,
    limiteMensagensChatMes: 35,
    mensagensChatUsadasMes: 0,
    mensagensChatRestantesMes: 35,
  });
  readonly carregandoStatus = signal<boolean>(false);

  // -------------------------------------------------------------------------
  // 4. Análise de Edital (IA - Claude Sonnet 5)
  // -------------------------------------------------------------------------
  readonly analisandoEdital = signal<boolean>(false);
  readonly resultadoAnaliseEdital = signal<any | null>(null);
  readonly analiseEditalId = signal<string | null>(null);

  // -------------------------------------------------------------------------
  // 5. Análise de Documentação Hospedada (IA - Claude Sonnet 5)
  // -------------------------------------------------------------------------
  readonly analisandoDocumentacao = signal<boolean>(false);
  readonly resultadoAnaliseDocumentacao = signal<any | null>(null);
  readonly analiseDocumentacaoId = signal<string | null>(null);

  // -------------------------------------------------------------------------
  // 6. Chat Especialista em Licitações (Lei 14.133/2021)
  // -------------------------------------------------------------------------
  readonly chatAberto = signal<boolean>(false);
  readonly sessaoChatId = signal<string>(crypto.randomUUID());
  readonly mensagensChat = signal<MensagemChatLocal[]>([]);
  readonly inputMensagem = signal<string>('');
  readonly enviandoMensagem = signal<boolean>(false);

  // -------------------------------------------------------------------------
  // 7. Perfil Documental do Usuário & Validações Bloqueantes
  // -------------------------------------------------------------------------
  readonly perfilDocumental = signal<DadosDocumentaisTecnicos | null>(null);
  readonly carregandoPerfil = signal<boolean>(false);
  readonly modalCompletarPerfilAberto = signal<boolean>(false);
  readonly formPerfilRapido = signal<Partial<DadosDocumentaisTecnicos>>({});
  readonly salvandoPerfilRapido = signal<boolean>(false);

  // -------------------------------------------------------------------------
  // 8. Seção: Documentos da Proposta (Declarações, Capa e Envelope)
  // -------------------------------------------------------------------------
  readonly subAbaDocumentos = signal<'declaracoes' | 'capa' | 'envelope' | 'gerados'>('declaracoes');

  // Declarações
  readonly listaDeclaracoes = signal<ItemDeclaracaoUI[]>([]);
  readonly declaracaoEmEdicao = signal<ItemDeclaracaoUI | null>(null);
  readonly modalEdicaoDeclaracaoAberto = signal<boolean>(false);
  readonly textoEdicaoTemporario = signal<string>('');
  readonly exportandoDocx = signal<boolean>(false);

  // Capa / Folha de Rosto
  readonly formCapaProposta = signal<{
    validadeProposta: string;
    prazoExecucao: string;
    condicoesPagamento: string;
    informacoesComplementares: string;
  }>({
    validadeProposta: '60 (sessenta) dias corridos',
    prazoExecucao: 'Conforme cronograma físico-financeiro do edital',
    condicoesPagamento: 'Medição mensal após conferência e ateste dos serviços pela fiscalização',
    informacoesComplementares: 'Declaramos aceitar integralmente todas as cláusulas e condições estipuladas no Edital e seus anexos.'
  });
  readonly gerandoCapaPdf = signal<boolean>(false);

  // Envelope
  readonly formEnvelope = signal<{
    tipoEnvelope: string;
    comissaoOuPregoeiro: string;
    dataHoraSessao: string;
  }>({
    tipoEnvelope: 'ENVELOPE Nº 01 — PROPOSTA DE PREÇOS',
    comissaoOuPregoeiro: 'Comissão de Contratação / Pregoeiro(a) e Equipe de Apoio',
    dataHoraSessao: ''
  });
  readonly gerandoEnvelopeDocx = signal<boolean>(false);

  // Documentos Salvos
  readonly documentosGeradosSalvos = signal<any[]>([]);
  readonly carregandoDocumentosSalvos = signal<boolean>(false);

  // -------------------------------------------------------------------------
  // 9. Histórico de Análises & Notificações
  // -------------------------------------------------------------------------
  readonly modalHistoricoAberto = signal<boolean>(false);
  readonly historicoAnalises = signal<any[]>([]);
  readonly carregandoHistorico = signal<boolean>(false);

  readonly toastMensagem = signal<{ texto: string; tipo: 'sucesso' | 'erro' | 'info' } | null>(null);
  readonly gerandoPdf = signal<boolean>(false);

  // -------------------------------------------------------------------------
  // Cálculos Computados
  // -------------------------------------------------------------------------
  readonly categoriasComItens = computed(() => {
    const categorias: CategoriaLicitacao[] = [
      'Habilitação Jurídica',
      'Regularidade Fiscal e Trabalhista',
      'Qualificação Econômico-Financeira',
      'Qualificação Técnica'
    ];

    return categorias.map(nome => ({
      nome,
      itens: this.checklist.filter(item => item.categoria === nome)
    }));
  });

  readonly totalObrigatorios = computed(() => {
    return this.checklist.filter(item => item.obrigatorio).length;
  });

  readonly obrigatoriosMarcados = computed(() => {
    const marcados = this.itensMarcados();
    return this.checklist.filter(item => item.obrigatorio && marcados.has(item.id)).length;
  });

  readonly porcentagemProgresso = computed(() => {
    const total = this.totalObrigatorios();
    if (total === 0) return 0;
    return Math.round((this.obrigatoriosMarcados() / total) * 100);
  });

  readonly todosObrigatoriosConcluidos = computed(() => {
    return this.totalObrigatorios() > 0 && this.obrigatoriosMarcados() === this.totalObrigatorios();
  });

  readonly totalDocumentosAnexados = computed(() => {
    const docs = this.arquivosPorItem();
    return Object.values(docs).reduce((acc, list) => acc + list.length, 0);
  });

  readonly temCreditosAnalise = computed(() => {
    const status = this.statusPacotes();
    return (status.temPacoteA || status.temPacoteB) && status.analisesRestantesMes > 0;
  });

  readonly temCreditosChat = computed(() => {
    const status = this.statusPacotes();
    return (status.temPacoteA || status.temPacoteB) && status.mensagensChatRestantesMes > 0;
  });

  // Validação dos 4 campos mandatórios do perfil documental
  readonly statusValidacaoPerfil = computed(() => {
    const p = this.perfilDocumental();
    const temRazaoSocial = Boolean((p?.razao_social || p?.company_name)?.trim());
    const temCnpj = Boolean(p?.company_cnpj?.trim());
    const temNomeResponsavel = Boolean(p?.full_name?.trim());
    const temCpfResponsavel = Boolean((p?.cpf_responsavel || (p as any)?.cpf)?.trim());

    const camposFaltando: string[] = [];
    if (!temRazaoSocial) camposFaltando.push('Razão Social da Empresa');
    if (!temCnpj) camposFaltando.push('CNPJ da Empresa');
    if (!temNomeResponsavel) camposFaltando.push('Nome Completo do Responsável Legal');
    if (!temCpfResponsavel) camposFaltando.push('CPF do Responsável / Representante Legal');

    return {
      valido: temRazaoSocial && temCnpj && temNomeResponsavel && temCpfResponsavel,
      temRazaoSocial,
      temCnpj,
      temNomeResponsavel,
      temCpfResponsavel,
      camposFaltando
    };
  });

  readonly totalDeclaracoesSelecionadas = computed(() => {
    return this.listaDeclaracoes().filter(d => d.selecionada).length;
  });

  readonly todasDeclaracoesEstaoSelecionadas = computed(() => {
    const list = this.listaDeclaracoes();
    return list.length > 0 && list.every(d => d.selecionada);
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarStatusPacotes(),
      this.carregarPerfilDocumental(),
      this.carregarDocumentosGeradosSalvos()
    ]);
    this.inicializarDeclaracoesPadrao();
  }

  // -------------------------------------------------------------------------
  // Carregamento de Pacotes, Quotas e Perfil
  // -------------------------------------------------------------------------
  async carregarStatusPacotes(): Promise<void> {
    this.carregandoStatus.set(true);
    try {
      const status = await this.supabaseService.obterStatusPacotesLicitacao();
      this.statusPacotes.set(status);
    } catch (e) {
      console.warn('Erro ao carregar status dos pacotes:', e);
    } finally {
      this.carregandoStatus.set(false);
    }
  }

  async carregarPerfilDocumental(): Promise<void> {
    this.carregandoPerfil.set(true);
    try {
      const perfil = await this.supabaseService.obterMeuPerfilCompleto();
      if (perfil) {
        this.perfilDocumental.set({
          full_name: perfil.full_name || perfil.nome || '',
          professional_title: perfil.professional_title || perfil.cargo || '',
          categoria_profissional: perfil.categoria_profissional || '',
          crea_cau: perfil.crea_cau || perfil.creaCau || '',
          company_name: perfil.company_name || '',
          razao_social: perfil.razao_social || perfil.company_name || '',
          company_position: perfil.company_position || '',
          company_cnpj: perfil.company_cnpj || '',
          cpf_responsavel: perfil.cpf_responsavel || (perfil as any).cpf || '',
          company_address: perfil.company_address || '',
          company_phone: perfil.company_phone || '',
          company_email: perfil.company_email || '',
          company_site: perfil.company_site || '',
          company_logo_url: perfil.company_logo_url || null,
          dados_documentais_confirmados: Boolean(perfil.dados_documentais_confirmados)
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil documental:', e);
    } finally {
      this.carregandoPerfil.set(false);
    }
  }

  async carregarDocumentosGeradosSalvos(): Promise<void> {
    this.carregandoDocumentosSalvos.set(true);
    try {
      const docs = await this.supabaseService.listarDocumentosGeradosLicitacao();
      this.documentosGeradosSalvos.set(docs);
    } catch (e) {
      console.warn('Erro ao carregar histórico de documentos:', e);
    } finally {
      this.carregandoDocumentosSalvos.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Inicialização e Sincronização de Declarações
  // -------------------------------------------------------------------------
  inicializarDeclaracoesPadrao(): void {
    const defaultList: ItemDeclaracaoUI[] = DECLARACOES_PADRAO_LEI_14133.map(item => ({
      id: item.id,
      nome: item.nome,
      obrigatorio: item.obrigatorio,
      origem: item.origem,
      baseLegal: item.baseLegal,
      textoModelo: item.textoModelo,
      orientacaoPreenchimento: item.orientacaoPreenchimento,
      selecionada: item.obrigatorio // Seleciona obrigatórias por padrão
    }));
    this.listaDeclaracoes.set(defaultList);
  }

  sincronizarDeclaracoesComAnalise(analise: any): void {
    if (!analise) return;

    if (Array.isArray(analise.declaracoes_exigidas_edital) && analise.declaracoes_exigidas_edital.length > 0) {
      const listFromAi: ItemDeclaracaoUI[] = analise.declaracoes_exigidas_edital.map((dec: any, idx: number) => ({
        id: dec.id || `dec_ia_${idx}`,
        nome: dec.nome || `Declaração ${idx + 1}`,
        obrigatorio: dec.obrigatorio !== false,
        origem: dec.origem || 'Modelo do Edital (Anexo)',
        baseLegal: dec.base_legal || 'Lei nº 14.133/2021',
        textoModelo: dec.texto_modelo || '',
        orientacaoPreenchimento: dec.orientacao_preenchimento || 'Exigência extraída da análise de edital.',
        selecionada: true
      }));
      this.listaDeclaracoes.set(listFromAi);
      this.mostrarToast(`Foram carregadas ${listFromAi.length} declarações a partir do edital!`, 'sucesso');
    }
  }

  // -------------------------------------------------------------------------
  // Manipulação de Placeholders nas Declarações
  // -------------------------------------------------------------------------
  substituirPlaceholders(textoModelo: string): string {
    const perfil = this.perfilDocumental();
    const analise = this.resultadoAnaliseEdital();

    const razaoSocial = perfil?.razao_social || perfil?.company_name || 'EMPRESA LICITANTE LTDA';
    const cnpj = perfil?.company_cnpj || '00.000.000/0001-00';
    const repLegal = perfil?.full_name || 'REPRESENTANTE LEGAL DA EMPRESA';
    const cpfRep = perfil?.cpf_responsavel || (perfil as any)?.cpf || '000.000.000-00';
    const endereco = perfil?.company_address || 'Endereço Comercial da Empresa';
    const cargoRep = perfil?.company_position || 'Representante Legal / Titular';

    const numEdital = this.nomeEdital() || analise?.nome_edital || 'EDITAL DE LICITAÇÃO';
    const orgao = this.orgaoLicitanteManual() || analise?.orgao_licitante || 'ADMINISTRAÇÃO PÚBLICA / ÓRGÃO LICITANTE';
    const objeto = this.objetoLicitacaoManual() || analise?.objeto_resumo || 'Execução dos serviços e obras civis descritos no edital.';

    const dataExtenso = this.obterDataPorExtenso();
    const cidade = this.extrairCidade(perfil?.company_address) || 'São Paulo/SP';

    return textoModelo
      .replace(/\{\{RAZAO_SOCIAL\}\}/g, razaoSocial)
      .replace(/\{\{CNPJ\}\}/g, cnpj)
      .replace(/\{\{REPRESENTANTE_LEGAL\}\}/g, repLegal)
      .replace(/\{\{CPF_REPRESENTANTE\}\}/g, cpfRep)
      .replace(/\{\{CARGO_REPRESENTANTE\}\}/g, cargoRep)
      .replace(/\{\{ENDERECO_EMPRESA\}\}/g, endereco)
      .replace(/\{\{NUMERO_EDITAL\}\}/g, numEdital)
      .replace(/\{\{ORGAO_LICITANTE\}\}/g, orgao)
      .replace(/\{\{OBJETO\}\}/g, objeto)
      .replace(/\{\{CIDADE\}\}/g, cidade)
      .replace(/\{\{DATA\}\}/g, dataExtenso);
  }

  obterTextoFinalDeclaracao(dec: ItemDeclaracaoUI): string {
    if (dec.textoCustomizado && dec.textoCustomizado.trim()) {
      return dec.textoCustomizado;
    }
    return this.substituirPlaceholders(dec.textoModelo);
  }

  // -------------------------------------------------------------------------
  // Edição Prévia de Declarações (Modal com Textarea)
  // -------------------------------------------------------------------------
  abrirModalEdicaoDeclaracao(dec: ItemDeclaracaoUI): void {
    this.declaracaoEmEdicao.set(dec);
    this.textoEdicaoTemporario.set(this.obterTextoFinalDeclaracao(dec));
    this.modalEdicaoDeclaracaoAberto.set(true);
  }

  fecharModalEdicaoDeclaracao(): void {
    this.declaracaoEmEdicao.set(null);
    this.modalEdicaoDeclaracaoAberto.set(false);
  }

  salvarEdicaoDeclaracao(): void {
    const dec = this.declaracaoEmEdicao();
    if (!dec) return;

    const texto = this.textoEdicaoTemporario();
    this.listaDeclaracoes.update(lista =>
      lista.map(item => (item.id === dec.id ? { ...item, textoCustomizado: texto } : item))
    );

    this.mostrarToast('Declaração atualizada com sucesso!', 'sucesso');
    this.fecharModalEdicaoDeclaracao();
  }

  restaurarModeloOriginalDeclaracao(dec: ItemDeclaracaoUI): void {
    this.listaDeclaracoes.update(lista =>
      lista.map(item => (item.id === dec.id ? { ...item, textoCustomizado: undefined } : item))
    );
    this.textoEdicaoTemporario.set(this.substituirPlaceholders(dec.textoModelo));
    this.mostrarToast('Texto restaurado para o modelo padrão.', 'info');
  }

  alternarSelecaoDeclaracao(id: string): void {
    this.listaDeclaracoes.update(lista =>
      lista.map(item => (item.id === id ? { ...item, selecionada: !item.selecionada } : item))
    );
  }

  selecionarTodasDeclaracoes(selecionar: boolean): void {
    this.listaDeclaracoes.update(lista =>
      lista.map(item => ({ ...item, selecionada: selecionar }))
    );
  }

  // -------------------------------------------------------------------------
  // Exportação DOCX das Declarações (Individual e em Lote)
  // -------------------------------------------------------------------------
  async exportarDeclaracaoIndividual(dec: ItemDeclaracaoUI): Promise<void> {
    if (!this.validarPerfilOuExibirModal()) return;

    this.exportandoDocx.set(true);
    try {
      const empresa = this.montarDadosEmpresaLicitacao();
      const itemParaGeracao: DeclaracaoItemLicitacao = {
        id: dec.id,
        nome: dec.nome,
        baseLegal: dec.baseLegal,
        origem: dec.origem,
        textoFinal: this.obterTextoFinalDeclaracao(dec),
        obrigatorio: dec.obrigatorio
      };

      const numeroEdital = this.nomeEdital() || this.resultadoAnaliseEdital()?.nome_edital || 'Edital de Licitação';
      const orgao = this.orgaoLicitanteManual() || this.resultadoAnaliseEdital()?.orgao_licitante || 'Órgão Licitante';

      const blob = await this.geradorDocxService.gerarDeclaracaoIndividual(
        itemParaGeracao,
        empresa,
        numeroEdital,
        orgao
      );

      const nomeArquivo = `${this.sanitizarNomeArquivo(dec.nome)}_${this.sanitizarNomeArquivo(numeroEdital)}.docx`;
      this.geradorDocxService.downloadBlob(blob, nomeArquivo);

      // Salvar histórico no Supabase
      await this.supabaseService.salvarDocumentoGeradoLicitacao({
        analiseId: this.analiseEditalId() || undefined,
        tipoDoc: 'declaracao',
        titulo: dec.nome,
        nomeArquivo,
        formato: 'docx',
        conteudoTexto: itemParaGeracao.textoFinal,
        meta: { baseLegal: dec.baseLegal, edital: numeroEdital }
      });

      await this.carregarDocumentosGeradosSalvos();
      this.mostrarToast(`Declaração "${dec.nome}" exportada com sucesso em .docx!`, 'sucesso');
    } catch (e: any) {
      console.error('Erro ao gerar declaração em docx:', e);
      this.mostrarToast('Erro ao exportar arquivo .docx: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.exportandoDocx.set(false);
    }
  }

  async exportarDeclaracoesLote(): Promise<void> {
    if (!this.validarPerfilOuExibirModal()) return;

    const selecionadas = this.listaDeclaracoes().filter(d => d.selecionada);
    if (selecionadas.length === 0) {
      this.mostrarToast('Selecione pelo menos uma declaração para exportar em lote.', 'erro');
      return;
    }

    this.exportandoDocx.set(true);
    try {
      const empresa = this.montarDadosEmpresaLicitacao();
      const itensParaGeracao: DeclaracaoItemLicitacao[] = selecionadas.map(dec => ({
        id: dec.id,
        nome: dec.nome,
        baseLegal: dec.baseLegal,
        origem: dec.origem,
        textoFinal: this.obterTextoFinalDeclaracao(dec),
        obrigatorio: dec.obrigatorio
      }));

      const numeroEdital = this.nomeEdital() || this.resultadoAnaliseEdital()?.nome_edital || 'Edital de Licitação';
      const orgao = this.orgaoLicitanteManual() || this.resultadoAnaliseEdital()?.orgao_licitante || 'Órgão Licitante';

      const blob = await this.geradorDocxService.gerarDeclaracoesLote(
        itensParaGeracao,
        empresa,
        numeroEdital,
        orgao
      );

      const nomeArquivo = `Declaracoes_Licitacao_${this.sanitizarNomeArquivo(numeroEdital)}_${selecionadas.length}_itens.docx`;
      this.geradorDocxService.downloadBlob(blob, nomeArquivo);

      // Salvar histórico no Supabase
      await this.supabaseService.salvarDocumentoGeradoLicitacao({
        analiseId: this.analiseEditalId() || undefined,
        tipoDoc: 'declaracoes_lote',
        titulo: `Pacote de ${selecionadas.length} Declarações de Habilitação`,
        nomeArquivo,
        formato: 'docx',
        meta: { totalItens: selecionadas.length, edital: numeroEdital }
      });

      await this.carregarDocumentosGeradosSalvos();
      this.mostrarToast(`Pacote com ${selecionadas.length} declarações exportado com sucesso em .docx!`, 'sucesso');
    } catch (e: any) {
      console.error('Erro ao gerar lote de declarações em docx:', e);
      this.mostrarToast('Erro ao exportar pacote .docx: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.exportandoDocx.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Geração da Capa / Folha de Rosto da Proposta (PDF via Motor White-Label)
  // -------------------------------------------------------------------------
  async gerarCapaPropostaPdf(): Promise<void> {
    if (!this.validarPerfilOuExibirModal()) return;

    this.gerandoCapaPdf.set(true);
    try {
      const perfil = this.perfilDocumental();
      const analise = this.resultadoAnaliseEdital();
      const form = this.formCapaProposta();

      const numeroEdital = this.nomeEdital() || analise?.nome_edital || 'Edital de Licitação Pública';
      const orgao = this.orgaoLicitanteManual() || analise?.orgao_licitante || 'Órgão Licitante';
      const objeto = this.objetoLicitacaoManual() || analise?.objeto_resumo || 'Execução dos serviços de engenharia e obras civis conforme termo de referência do edital.';
      const valorEstimado = analise?.valor_estimado || 'Conforme Proposta de Preços em anexo';
      const dataExtenso = this.obterDataPorExtenso();

      const corpoHtml = `
        <div class="capa-proposta-licitacao" style="font-family: inherit; color: #1e293b;">
          
          <div style="text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #132A41;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #B5642A; display: block; margin-bottom: 6px;">
              LEI FEDERAL Nº 14.133/2021 • PROPOSTA COMERCIAL
            </span>
            <h1 style="font-size: 20px; font-weight: 900; color: #132A41; margin: 0 0 8px 0; text-transform: uppercase;">
              Folha de Rosto & Carta de Apresentação da Proposta
            </h1>
            <p style="font-size: 13px; color: #64748b; margin: 0; font-weight: 600;">
              Processo / Certame: ${this.sanitizar(numeroEdital)}
            </p>
          </div>

          <!-- Tabela de Identificação do Certame -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 700; color: #475569; width: 30%;">Órgão Licitante:</td>
                <td style="padding: 10px 14px; font-weight: 800; color: #132A41;">${this.sanitizar(orgao)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 700; color: #475569;">Número do Edital:</td>
                <td style="padding: 10px 14px; font-weight: 800; color: #1e293b;">${this.sanitizar(numeroEdital)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 700; color: #475569;">Modalidade:</td>
                <td style="padding: 10px 14px; color: #1e293b;">${this.sanitizar(analise?.modalidade || 'Concorrência / Pregão Eletrônico (Lei 14.133/2021)')}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-weight: 700; color: #475569; vertical-align: top;">Objeto Licitado:</td>
                <td style="padding: 10px 14px; color: #334155; line-height: 1.5;">${this.sanitizar(objeto)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Dados da Empresa Proponente -->
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff;">
            <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #132A41; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
              1. Identificação do Proponente
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
              <div><strong>Razão Social:</strong> ${this.sanitizar(perfil?.razao_social || perfil?.company_name || '—')}</div>
              <div><strong>CNPJ:</strong> ${this.sanitizar(perfil?.company_cnpj || '—')}</div>
              <div><strong>Responsável Legal:</strong> ${this.sanitizar(perfil?.full_name || '—')}</div>
              <div><strong>CPF:</strong> ${this.sanitizar(perfil?.cpf_responsavel || (perfil as any)?.cpf || '—')}</div>
              <div><strong>Registro CREA/CAU:</strong> ${this.sanitizar(perfil?.crea_cau || '—')}</div>
              <div><strong>E-mail de Contato:</strong> ${this.sanitizar(perfil?.company_email || '—')}</div>
              <div style="grid-column: span 2;"><strong>Endereço Sede:</strong> ${this.sanitizar(perfil?.company_address || '—')}</div>
            </div>
          </div>

          <!-- Condições Comerciais e Operacionais da Proposta -->
          <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff;">
            <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #132A41; margin: 0 0 12px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
              2. Condições Comerciais da Proposta
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; font-weight: 700; width: 35%; color: #475569;">Prazo de Validade da Proposta:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${this.sanitizar(form.validadeProposta)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; font-weight: 700; color: #475569;">Prazo de Execução dos Serviços:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${this.sanitizar(form.prazoExecucao)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px 0; font-weight: 700; color: #475569;">Condições de Pagamento:</td>
                  <td style="padding: 6px 0; color: #1e293b;">${this.sanitizar(form.condicoesPagamento)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Termo de Aceite e Compromisso -->
          <div style="margin-bottom: 32px; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #B5642A; font-size: 12px; line-height: 1.6; color: #334155;">
            <p style="margin: 0 0 6px 0;">
              ${this.sanitizar(form.informacoesComplementares)}
            </p>
            <p style="margin: 0; font-size: 11px; color: #64748b;">
              Declaramos sob as penas da lei que nos preços cotados na Planilha de Custos / Proposta em anexo estão inclusos todos os tributos, encargos sociais, trabalhistas, previdenciários, fiscais, comerciais, taxas de administração, seguro, BDI e quaisquer outras despesas diretas e indiretas necessárias à execução integral do objeto.
            </p>
          </div>

          <!-- Fecho de Assinatura -->
          <div style="margin-top: 40px; text-align: center;">
            <p style="font-size: 12px; color: #64748b; margin-bottom: 30px;">
              ${this.sanitizar(this.extrairCidade(perfil?.company_address) || 'Localidade')}, ${dataExtenso}.
            </p>
            
            <div style="display: inline-block; width: 340px; border-top: 1px solid #334155; padding-top: 8px;">
              <strong style="font-size: 13px; color: #132A41; display: block;">${this.sanitizar(perfil?.razao_social || perfil?.company_name || 'EMPRESA PROPONENTE')}</strong>
              <span style="font-size: 11px; color: #64748b; display: block;">CNPJ: ${this.sanitizar(perfil?.company_cnpj || '—')}</span>
              <span style="font-size: 12px; font-weight: 700; color: #1e293b; display: block; margin-top: 4px;">${this.sanitizar(perfil?.full_name || '—')}</span>
              <span style="font-size: 11px; color: #64748b; display: block;">${this.sanitizar(perfil?.company_position || 'Representante Legal')} • CPF: ${this.sanitizar(perfil?.cpf_responsavel || (perfil as any)?.cpf || '—')}</span>
            </div>
          </div>

        </div>
      `;

      const sucesso = await this.motorPdfService.gerarDocumento(
        {
          tituloDocumento: `Proposta Comercial • ${numeroEdital}`,
          subtituloDocumento: 'Capa e Carta de Apresentação da Proposta — Lei 14.133/2021',
          nomeAgente: 'Checklist de Licitação'
        },
        corpoHtml
      );

      if (sucesso) {
        // Salvar histórico no Supabase
        await this.supabaseService.salvarDocumentoGeradoLicitacao({
          analiseId: this.analiseEditalId() || undefined,
          tipoDoc: 'capa_proposta',
          titulo: `Capa de Proposta Comercial - ${numeroEdital}`,
          nomeArquivo: `Capa_Proposta_${this.sanitizarNomeArquivo(numeroEdital)}.pdf`,
          formato: 'pdf',
          meta: { edital: numeroEdital, orgao }
        });
        await this.carregarDocumentosGeradosSalvos();
        this.mostrarToast('Capa da Proposta gerada com sucesso em PDF!', 'sucesso');
      }
    } catch (e: any) {
      console.error('Erro ao gerar capa da proposta:', e);
      this.mostrarToast('Erro ao gerar PDF da capa: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.gerandoCapaPdf.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Geração do Rótulo de Envelope para Impressão (.docx)
  // -------------------------------------------------------------------------
  async gerarEnvelopeDocx(): Promise<void> {
    if (!this.validarPerfilOuExibirModal()) return;

    this.gerandoEnvelopeDocx.set(true);
    try {
      const empresa = this.montarDadosEmpresaLicitacao();
      const analise = this.resultadoAnaliseEdital();
      const form = this.formEnvelope();

      const numeroEdital = this.nomeEdital() || analise?.nome_edital || 'Edital de Licitação Pública';
      const orgao = this.orgaoLicitanteManual() || analise?.orgao_licitante || 'Órgão Licitante / Comissão de Contratação';
      const objeto = this.objetoLicitacaoManual() || analise?.objeto_resumo || 'Execução dos serviços conforme especificações do edital.';

      const dadosEnvelope: DadosEnvelopeLicitacao = {
        tipoEnvelope: form.tipoEnvelope,
        numeroEdital,
        orgaoDestinatario: orgao,
        comissaoOuPregoeiro: form.comissaoOuPregoeiro,
        objetoResumo: objeto,
        dataAbertura: form.dataHoraSessao || analise?.data_abertura || undefined,
        empresa
      };

      const blob = await this.geradorDocxService.gerarEnvelopeDocx(dadosEnvelope);
      const nomeArquivo = `Envelope_${this.sanitizarNomeArquivo(form.tipoEnvelope)}_${this.sanitizarNomeArquivo(numeroEdital)}.docx`;
      this.geradorDocxService.downloadBlob(blob, nomeArquivo);

      // Salvar histórico no Supabase
      await this.supabaseService.salvarDocumentoGeradoLicitacao({
        analiseId: this.analiseEditalId() || undefined,
        tipoDoc: 'envelope',
        titulo: `Rótulo de Envelope (${form.tipoEnvelope})`,
        nomeArquivo,
        formato: 'docx',
        meta: { tipoEnvelope: form.tipoEnvelope, edital: numeroEdital }
      });

      await this.carregarDocumentosGeradosSalvos();
      this.mostrarToast('Rótulo de envelope gerado com sucesso em .docx!', 'sucesso');
    } catch (e: any) {
      console.error('Erro ao gerar envelope em docx:', e);
      this.mostrarToast('Erro ao gerar arquivo do envelope: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.gerandoEnvelopeDocx.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Preenchimento Rápido do Perfil Documental (quando faltam campos)
  // -------------------------------------------------------------------------
  validarPerfilOuExibirModal(): boolean {
    const status = this.statusValidacaoPerfil();
    if (!status.valido) {
      const p = this.perfilDocumental();
      this.formPerfilRapido.set({
        razao_social: p?.razao_social || p?.company_name || '',
        company_name: p?.company_name || '',
        company_cnpj: p?.company_cnpj || '',
        full_name: p?.full_name || '',
        cpf_responsavel: p?.cpf_responsavel || (p as any)?.cpf || '',
        crea_cau: p?.crea_cau || '',
        company_position: p?.company_position || 'Sócio-Administrador',
        company_address: p?.company_address || '',
        company_email: p?.company_email || '',
        company_phone: p?.company_phone || ''
      });
      this.modalCompletarPerfilAberto.set(true);
      return false;
    }
    return true;
  }

  abrirModalCompletarPerfil(): void {
    const p = this.perfilDocumental();
    this.formPerfilRapido.set({
      razao_social: p?.razao_social || p?.company_name || '',
      company_name: p?.company_name || '',
      company_cnpj: p?.company_cnpj || '',
      full_name: p?.full_name || '',
      cpf_responsavel: p?.cpf_responsavel || (p as any)?.cpf || '',
      crea_cau: p?.crea_cau || '',
      company_position: p?.company_position || 'Sócio-Administrador',
      company_address: p?.company_address || '',
      company_email: p?.company_email || '',
      company_phone: p?.company_phone || ''
    });
    this.modalCompletarPerfilAberto.set(true);
  }

  fecharModalCompletarPerfil(): void {
    this.modalCompletarPerfilAberto.set(false);
  }

  atualizarCampoPerfilRapido(campo: keyof DadosDocumentaisTecnicos, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formPerfilRapido.update(f => ({
      ...f,
      [campo]: target.value
    }));
  }

  async salvarPerfilRapido(): Promise<void> {
    const form = this.formPerfilRapido();
    if (!form.razao_social?.trim() && !form.company_name?.trim()) {
      this.mostrarToast('Preencha a Razão Social da empresa.', 'erro');
      return;
    }
    if (!form.company_cnpj?.trim()) {
      this.mostrarToast('Preencha o CNPJ da empresa.', 'erro');
      return;
    }
    if (!form.full_name?.trim()) {
      this.mostrarToast('Preencha o nome completo do responsável legal.', 'erro');
      return;
    }
    if (!form.cpf_responsavel?.trim()) {
      this.mostrarToast('Preencha o CPF do responsável legal.', 'erro');
      return;
    }

    this.salvandoPerfilRapido.set(true);
    try {
      const { error } = await this.supabaseService.salvarDadosDocumentaisUsuario({
        razao_social: form.razao_social?.trim() || form.company_name?.trim(),
        company_name: form.company_name?.trim() || form.razao_social?.trim(),
        company_cnpj: form.company_cnpj?.trim(),
        full_name: form.full_name?.trim(),
        cpf_responsavel: form.cpf_responsavel?.trim(),
        crea_cau: form.crea_cau?.trim(),
        company_position: form.company_position?.trim(),
        company_address: form.company_address?.trim(),
        company_email: form.company_email?.trim(),
        company_phone: form.company_phone?.trim()
      });

      if (error) {
        throw error;
      }

      await this.carregarPerfilDocumental();
      this.modalCompletarPerfilAberto.set(false);
      this.mostrarToast('Dados documentais salvos com sucesso! Agora você pode gerar seus documentos.', 'sucesso');
    } catch (e: any) {
      console.error('Erro ao salvar dados documentais rápidos:', e);
      this.mostrarToast('Erro ao salvar dados: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.salvandoPerfilRapido.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Helpers de Dados para Exportação
  // -------------------------------------------------------------------------
  private montarDadosEmpresaLicitacao(): DadosEmpresaLicitacao {
    const p = this.perfilDocumental();
    return {
      razaoSocial: p?.razao_social || p?.company_name || 'EMPRESA LICITANTE LTDA',
      nomeFantasia: p?.company_name || undefined,
      cnpj: p?.company_cnpj || '00.000.000/0001-00',
      responsavelNome: p?.full_name || 'Responsável Legal',
      responsavelCpf: p?.cpf_responsavel || (p as any)?.cpf || '000.000.000-00',
      responsavelCargo: p?.company_position || 'Representante Legal',
      endereco: p?.company_address || undefined,
      telefone: p?.company_phone || undefined,
      email: p?.company_email || undefined
    };
  }

  private sanitizarNomeArquivo(nome: string): string {
    return (nome || 'documento')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
  }

  private extrairCidade(endereco?: string): string {
    if (!endereco) return '';
    // Tenta encontrar padrão "Cidade/UF" ou "Cidade - UF"
    const match = endereco.match(/([A-Za-zÀ-ÖØ-öø-ÿ\s]+)[\/-]([A-Za-z]{2})/);
    if (match) {
      return `${match[1].trim()}/${match[2].toUpperCase()}`;
    }
    return '';
  }

  private obterDataPorExtenso(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const hoje = new Date();
    return `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  }

  // -------------------------------------------------------------------------
  // Upload e Gestão de Arquivos do Edital (Múltiplos PDFs até 200 MB)
  // -------------------------------------------------------------------------
  async onArquivoEditalSelecionado(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const limiteBytes = 200 * 1024 * 1024; // 200 MB por arquivo

    this.uploadingEdital.set(true);
    let sucessos = 0;

    try {
      for (const arquivo of files) {
        if (arquivo.size > limiteBytes) {
          this.mostrarToast(`O arquivo "${arquivo.name}" excede o limite de 200 MB.`, 'erro');
          continue;
        }

        try {
          const { caminhoStorage, urlAssinada, error } = await this.supabaseService.uploadArquivoLicitacao(arquivo, 'edital');
          if (error || !caminhoStorage) {
            throw error || new Error('Falha no upload do edital.');
          }

          const novoDoc: ArquivoHospedadoItem = {
            nome: arquivo.name,
            tamanho: arquivo.size,
            caminhoStorage,
            urlAssinada: urlAssinada || undefined,
            enviadoEm: new Date().toISOString()
          };

          this.arquivosEdital.update(lista => [...lista, novoDoc]);
          sucessos++;

          if (!this.nomeEdital().trim()) {
            this.nomeEdital.set(arquivo.name.replace(/\.[^/.]+$/, ''));
          }
        } catch (err: any) {
          console.error(`Erro ao processar arquivo "${arquivo.name}":`, err);
          this.mostrarToast(`Erro ao enviar "${arquivo.name}": ${err?.message || 'Falha no upload.'}`, 'erro');
        }
      }

      if (sucessos > 0) {
        this.mostrarToast(
          sucessos === 1
            ? 'Arquivo do edital anexado com sucesso!'
            : `${sucessos} arquivos do edital anexados com sucesso!`,
          'sucesso'
        );
      }
    } finally {
      this.uploadingEdital.set(false);
      input.value = '';
    }
  }

  async removerArquivoEdital(caminhoStorage: string): Promise<void> {
    try {
      await this.supabaseService.excluirArquivoLicitacao(caminhoStorage);
      this.arquivosEdital.update(lista => lista.filter(a => a.caminhoStorage !== caminhoStorage));
      this.mostrarToast('Arquivo do edital removido.', 'info');
    } catch (e: any) {
      this.mostrarToast('Erro ao remover arquivo: ' + e?.message, 'erro');
    }
  }

  // -------------------------------------------------------------------------
  // Upload de Documentos para Itens de Habilitação
  // -------------------------------------------------------------------------
  async onArquivoItemSelecionado(itemId: string, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    if (arquivo.size > 15 * 1024 * 1024) {
      this.mostrarToast('O documento anexado não pode exceder 15 MB.', 'erro');
      input.value = '';
      return;
    }

    this.uploadingItemId.set(itemId);
    try {
      const { caminhoStorage, urlAssinada, error } = await this.supabaseService.uploadArquivoLicitacao(arquivo, `item_${itemId}`);
      if (error || !caminhoStorage) {
        throw error || new Error('Falha no upload do documento.');
      }

      const novoDoc: ArquivoHospedadoItem = {
        nome: arquivo.name,
        tamanho: arquivo.size,
        caminhoStorage,
        urlAssinada: urlAssinada || undefined,
        enviadoEm: new Date().toISOString()
      };

      this.arquivosPorItem.update(mapa => {
        const listaAtual = mapa[itemId] || [];
        return {
          ...mapa,
          [itemId]: [...listaAtual, novoDoc]
        };
      });

      this.itensMarcados.update(set => {
        const novo = new Set(set);
        novo.add(itemId);
        return novo;
      });

      this.mostrarToast(`Documento anexado ao item com sucesso.`, 'sucesso');
    } catch (e: any) {
      this.mostrarToast('Erro ao enviar documento: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.uploadingItemId.set(null);
      input.value = '';
    }
  }

  async removerArquivoItem(itemId: string, caminhoStorage: string): Promise<void> {
    try {
      await this.supabaseService.excluirArquivoLicitacao(caminhoStorage);
      this.arquivosPorItem.update(mapa => {
        const listaAtual = mapa[itemId] || [];
        const filtrada = listaAtual.filter(a => a.caminhoStorage !== caminhoStorage);
        const novoMapa = { ...mapa };
        if (filtrada.length > 0) {
          novoMapa[itemId] = filtrada;
        } else {
          delete novoMapa[itemId];
        }
        return novoMapa;
      });
      this.mostrarToast('Documento removido.', 'info');
    } catch (e: any) {
      this.mostrarToast('Erro ao remover documento: ' + e?.message, 'erro');
    }
  }

  // -------------------------------------------------------------------------
  // Execução de Análise de Edital (IA - Claude Sonnet 5)
  // -------------------------------------------------------------------------
  async executarAnaliseEdital(): Promise<void> {
    if (!this.temCreditosAnalise()) {
      this.mostrarToast('Você não possui créditos de análise disponíveis neste mês. Ative o Pacote A ou B para continuar.', 'erro');
      return;
    }

    const editais = this.arquivosEdital();
    if (editais.length === 0 && !this.nomeEdital().trim()) {
      this.mostrarToast('Informe o nome do edital ou anexe arquivos do edital para analisar.', 'erro');
      return;
    }

    this.analisandoEdital.set(true);
    try {
      const response = await this.supabaseService.analisarLicitacaoComIA({
        tipo: 'edital',
        nomeEdital: this.nomeEdital().trim() || (editais.length > 0 ? editais[0].nome : 'Edital de Licitação'),
        caminhoStorageEdital: editais.length > 0 ? editais[0].caminhoStorage : undefined,
        arquivosEdital: editais.map(a => ({ nomeArquivo: a.nome, caminhoStorage: a.caminhoStorage })),
        linkEdital: this.linkEdital().trim() || undefined
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'Falha ao processar análise do edital.');
      }

      this.resultadoAnaliseEdital.set(response.data);
      this.analiseEditalId.set(response.analiseId || null);

      if (response.data.orgao_licitante && !this.orgaoLicitanteManual()) {
        this.orgaoLicitanteManual.set(response.data.orgao_licitante);
      }
      if (response.data.objeto_resumo && !this.objetoLicitacaoManual()) {
        this.objetoLicitacaoManual.set(response.data.objeto_resumo);
      }

      // Sincroniza declarações extraídas do edital
      this.sincronizarDeclaracoesComAnalise(response.data);

      await this.carregarStatusPacotes();
      this.abaAtiva.set('analise_edital');
      this.mostrarToast('Análise de edital concluída com sucesso pela IA!', 'sucesso');
    } catch (e: any) {
      console.error('Erro na análise do edital:', e);
      this.mostrarToast('Erro na análise do edital: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.analisandoEdital.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Execução de Auditoria de Documentação (IA - Claude Sonnet 5)
  // -------------------------------------------------------------------------
  async executarAnaliseDocumentacao(): Promise<void> {
    if (!this.temCreditosAnalise()) {
      this.mostrarToast('Você não possui créditos de análise disponíveis neste mês. Ative o Pacote A ou B para continuar.', 'erro');
      return;
    }

    const totalDocs = this.totalDocumentosAnexados();
    if (totalDocs === 0) {
      this.mostrarToast('Anexe pelo menos um documento aos itens do checklist antes de auditar.', 'erro');
      return;
    }

    this.analisandoDocumentacao.set(true);
    try {
      const documentosMapeados: Array<{ itemId: string; nomeArquivo: string; caminhoStorage: string }> = [];
      const mapaDocs = this.arquivosPorItem();
      for (const itemId in mapaDocs) {
        for (const arq of mapaDocs[itemId]) {
          documentosMapeados.push({
            itemId,
            nomeArquivo: arq.nome,
            caminhoStorage: arq.caminhoStorage
          });
        }
      }

      const response = await this.supabaseService.analisarLicitacaoComIA({
        tipo: 'documentacao',
        nomeEdital: this.nomeEdital().trim() || 'Auditoria Geral de Documentação',
        itensMarcados: Array.from(this.itensMarcados()),
        documentosHospedados: documentosMapeados
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'Falha ao processar auditoria de documentos.');
      }

      this.resultadoAnaliseDocumentacao.set(response.data);
      this.analiseDocumentacaoId.set(response.analiseId || null);

      await this.carregarStatusPacotes();
      this.abaAtiva.set('auditoria_docs');
      this.mostrarToast('Auditoria preventiva de documentos concluída com sucesso!', 'sucesso');
    } catch (e: any) {
      console.error('Erro na auditoria de documentos:', e);
      this.mostrarToast('Erro na auditoria: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.analisandoDocumentacao.set(false);
    }
  }

  // -------------------------------------------------------------------------
  // Chat Especialista em Licitações (Lei 14.133/2021)
  // -------------------------------------------------------------------------
  abrirChat(contexto?: string): void {
    this.chatAberto.set(true);
    if (this.mensagensChat().length === 0) {
      this.mensagensChat.set([
        {
          papel: 'assistente',
          conteudo: `Olá! Sou seu Especialista em Licitações e Contratos Administrativos (Lei 14.133/2021).\n\nPosso esclarecer exigências de editais, orientar impugnações, recursos, atestados de qualificação técnica ou regras de habilitação. Como posso ajudar ${contexto ? 'no edital ' + contexto : 'você hoje'}?`,
          criadoEm: new Date().toISOString()
        }
      ]);
    }
  }

  fecharChat(): void {
    this.chatAberto.set(false);
  }

  atualizarInputMensagem(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputMensagem.set(input.value);
  }

  async enviarMensagemChat(): Promise<void> {
    const texto = this.inputMensagem().trim();
    if (!texto || this.enviandoMensagem()) return;

    if (!this.temCreditosChat()) {
      this.mostrarToast('Você atingiu o limite mensal de 35 perguntas ao Especialista. O contador será renovado no próximo ciclo.', 'erro');
      return;
    }

    const novaMsgUsuario: MensagemChatLocal = {
      papel: 'usuario',
      conteudo: texto,
      criadoEm: new Date().toISOString()
    };

    this.mensagensChat.update(msgs => [...msgs, novaMsgUsuario]);
    this.inputMensagem.set('');
    this.enviandoMensagem.set(true);

    try {
      const historicoFormatado = this.mensagensChat()
        .filter(m => m.papel === 'usuario' || m.papel === 'assistente')
        .map(m => ({
          role: m.papel === 'usuario' ? ('user' as const) : ('assistant' as const),
          content: m.conteudo
        }));

      const analise = this.resultadoAnaliseEdital();
      const contextoExtra = analise
        ? `Edital: ${analise.nome_edital} | Órgão: ${analise.orgao_licitante} | Risco: ${analise.nivel_risco_geral}`
        : this.nomeEdital() ? `Edital: ${this.nomeEdital()}` : undefined;

      const response = await this.supabaseService.consultarChatLicitacaoComIA({
        mensagem: texto,
        sessaoId: this.sessaoChatId(),
        editalNome: this.nomeEdital().trim() || undefined,
        historicoMensagens: historicoFormatado,
        contextoAdicional: contextoExtra
      });

      if (response.error || !response.resposta) {
        throw new Error(response.error || 'Não foi possível obter resposta da IA.');
      }

      const novaMsgAssistente: MensagemChatLocal = {
        papel: 'assistente',
        conteudo: response.resposta,
        criadoEm: new Date().toISOString()
      };

      this.mensagensChat.update(msgs => [...msgs, novaMsgAssistente]);
      await this.carregarStatusPacotes();
    } catch (e: any) {
      this.mostrarToast('Erro no chat: ' + (e?.message || 'Tente novamente.'), 'erro');
    } finally {
      this.enviandoMensagem.set(false);
    }
  }

  usarPerguntaSugerida(pergunta: string): void {
    this.inputMensagem.set(pergunta);
    this.enviarMensagemChat();
  }

  // -------------------------------------------------------------------------
  // Histórico de Análises Salvas
  // -------------------------------------------------------------------------
  async abrirModalHistorico(): Promise<void> {
    this.modalHistoricoAberto.set(true);
    this.carregandoHistorico.set(true);
    try {
      const historico = await this.supabaseService.listarAnalisesLicitacao();
      this.historicoAnalises.set(historico);
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e);
    } finally {
      this.carregandoHistorico.set(false);
    }
  }

  fecharModalHistorico(): void {
    this.modalHistoricoAberto.set(false);
  }

  carregarAnaliseHistorico(item: any): void {
    if (item.tipo === 'edital') {
      this.resultadoAnaliseEdital.set(item.resultado_analise);
      this.analiseEditalId.set(item.id);
      this.nomeEdital.set(item.nome_edital || '');
      this.sincronizarDeclaracoesComAnalise(item.resultado_analise);
      this.abaAtiva.set('analise_edital');
    } else {
      this.resultadoAnaliseDocumentacao.set(item.resultado_analise);
      this.analiseDocumentacaoId.set(item.id);
      this.abaAtiva.set('auditoria_docs');
    }
    this.fecharModalHistorico();
    this.mostrarToast(`Análise de "${item.nome_edital || 'Licitação'}" carregada do histórico.`, 'sucesso');
  }

  // -------------------------------------------------------------------------
  // Gestão de Itens do Checklist e Interface
  // -------------------------------------------------------------------------
  alternarItem(id: string): void {
    this.itensMarcados.update(set => {
      const novoSet = new Set(set);
      if (novoSet.has(id)) {
        novoSet.delete(id);
      } else {
        novoSet.add(id);
      }
      return novoSet;
    });
  }

  atualizarNomeEdital(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nomeEdital.set(input.value);
  }

  atualizarLinkEdital(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.linkEdital.set(input.value);
  }

  atualizarOrgaoManual(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.orgaoLicitanteManual.set(input.value);
  }

  atualizarObjetoManual(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.objetoLicitacaoManual.set(input.value);
  }

  contarMarcadosCategoria(itens: ItemChecklistLicitacao[]): number {
    const marcados = this.itensMarcados();
    return itens.filter(i => marcados.has(i.id)).length;
  }

  contarObrigatoriosCategoria(itens: ItemChecklistLicitacao[]): number {
    return itens.filter(i => i.obrigatorio).length;
  }

  todosCategoriaMarcados(itens: ItemChecklistLicitacao[]): boolean {
    const marcados = this.itensMarcados();
    return itens.length > 0 && itens.every(i => marcados.has(i.id));
  }

  toggleTodosCategoria(itens: ItemChecklistLicitacao[]): void {
    const marcados = this.itensMarcados();
    const todosMarcados = itens.every(i => marcados.has(i.id));

    this.itensMarcados.update(set => {
      const novoSet = new Set(set);
      if (todosMarcados) {
        itens.forEach(i => novoSet.delete(i.id));
      } else {
        itens.forEach(i => novoSet.add(i.id));
      }
      return novoSet;
    });
  }

  reiniciarChecklist(): void {
    this.nomeEdital.set('');
    this.linkEdital.set('');
    this.orgaoLicitanteManual.set('');
    this.objetoLicitacaoManual.set('');
    this.arquivosEdital.set([]);
    this.itensMarcados.set(new Set<string>());
    this.resultadoAnaliseEdital.set(null);
    this.resultadoAnaliseDocumentacao.set(null);
    this.analiseEditalId.set(null);
    this.analiseDocumentacaoId.set(null);
    this.inicializarDeclaracoesPadrao();
    this.mostrarToast('Checklist reiniciado.', 'info');
  }

  formatarBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private sanitizar(str: string): string {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  mostrarToast(texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'info'): void {
    this.toastMensagem.set({ texto, tipo });
    setTimeout(() => {
      if (this.toastMensagem()?.texto === texto) {
        this.toastMensagem.set(null);
      }
    }, 4500);
  }
}
