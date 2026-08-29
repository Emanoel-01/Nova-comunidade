import { Injectable, inject } from '@angular/core';
import { SupabaseService, DadosDocumentaisTecnicos } from '../../services/supabase.service';

export interface DadosCabecalhoPDF {
  tituloDocumento: string;       // ex: "Relatório Executivo de Viabilidade Imobiliária"
  subtituloDocumento?: string;   // ex: nome do agente/norma referenciada
  nomeAgente: string;            // usado no rodapé: "AmorimTech • [nomeAgente]"
  cabecalhoGenerico?: boolean;   // quando true (ex: Ofício de órgão público), não exibe logo, CNPJ nem contatos da empresa no timbrado/rodapé
  ocultarAssinaturaResponsavel?: boolean; // quando true (ex: Minuta de Ofício), não insere a assinatura do RT da contratada
}

@Injectable({
  providedIn: 'root'
})
export class MotorPdfService {
  private readonly supabaseService = inject(SupabaseService);

  /**
   * Obtém o perfil documental completo do usuário autenticado direto da tabela `profissionais`
   */
  async obterPerfilDocumental(): Promise<DadosDocumentaisTecnicos & { id?: string; email?: string } | null> {
    try {
      const perfil = await this.supabaseService.obterMeuPerfilCompleto();
      if (!perfil) return null;

      return {
        id: perfil.id,
        email: perfil.email,
        full_name: perfil.full_name || perfil.nome || '',
        professional_title: perfil.professional_title || perfil.cargo || '',
        categoria_profissional: perfil.categoria_profissional || 'Engenheiro(a) Civil (CREA)',
        crea_cau: perfil.crea_cau || perfil.creaCau || '',
        company_name: perfil.company_name || '',
        company_position: perfil.company_position || '',
        company_cnpj: perfil.company_cnpj || '',
        company_address: perfil.company_address || '',
        company_phone: perfil.company_phone || '',
        company_email: perfil.company_email || '',
        company_site: perfil.company_site || '',
        social_network_label: perfil.social_network_label || 'Instagram',
        social_network_url: perfil.social_network_url || '',
        company_logo_url: perfil.company_logo_url || null,
        dados_documentais_confirmados: Boolean(perfil.dados_documentais_confirmados),
      };
    } catch (err) {
      console.error('Erro ao obter perfil documental para PDF:', err);
      return null;
    }
  }

  /**
   * Valida se o profissional possui CREA/CAU/CFT cadastrado e gera o documento PDF padronizado
   */
  async gerarDocumento(dadosCabecalho: DadosCabecalhoPDF, corpoHtml: string): Promise<boolean> {
    const perfil = await this.obterPerfilDocumental();

    // 1. Validação estrita de Registro Profissional (CREA / CAU / CFT)
    const registroValido = perfil?.crea_cau && perfil.crea_cau.trim().length > 2;
    if (!registroValido) {
      this.exibirToast(
        'Registro Profissional Obrigatório: Para emitir relatórios técnicos em conformidade e com validade legal, cadastre seu CREA/CAU/CFT na aba "Meu Perfil > Dados para Documentos Técnicos".',
        'erro'
      );
      return false;
    }

    // 2. Extração dos dados e montagem dos blocos visuais
    const nomeProfissional = (perfil.full_name || 'Profissional Responsável').trim();
    const tituloProfissional = (perfil.professional_title || perfil.categoria_profissional || 'Responsável Técnico').trim();
    const creaCau = perfil.crea_cau?.trim() || 'CREA/CAU não informado';
    const nomeEmpresa = (perfil.company_name || 'AmorimTech Engenharia & Consultoria').trim();
    const cnpjEmpresa = perfil.company_cnpj ? `CNPJ ${this.formatarCnpj(perfil.company_cnpj)}` : '';
    const enderecoEmpresa = perfil.company_address?.trim() || '';
    const telefoneEmpresa = perfil.company_phone?.trim() || '';
    const emailEmpresa = perfil.company_email?.trim() || '';
    const siteEmpresa = perfil.company_site?.trim() || '';
    const logoUrl = perfil.company_logo_url?.trim() || null;

    // Gerar Iniciais para Monograma quando não houver logo
    const iniciais = this.obterIniciais(nomeEmpresa || nomeProfissional || 'AT');

    // 3. Montagem do Logo ou Monograma
    const logoHtml = logoUrl
      ? `<img src="${this.sanitizarHtml(logoUrl)}" alt="Logo da Empresa" class="cabecalho-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div class="capa-logo-mark fallback-logo" style="display:none;">${iniciais}</div>`
      : `<div class="capa-logo-mark">${iniciais}</div>`;

    // 4. Montagem das informações de contato para rodapé
    const contatosArray: string[] = [];
    if (telefoneEmpresa) contatosArray.push(telefoneEmpresa);
    if (emailEmpresa) contatosArray.push(emailEmpresa);
    if (siteEmpresa) contatosArray.push(siteEmpresa);
    if (enderecoEmpresa && contatosArray.length < 2) contatosArray.push(enderecoEmpresa);
    const contatosRodapeHtml = contatosArray.length > 0 ? contatosArray.join(' • ') : 'engenharia@amorimtech.com • www.amorimtech.com';

    // 5. Montagem do Documento HTML Completo com Design System Predial 4.0
    const isGenerico = Boolean(dadosCabecalho.cabecalhoGenerico);

    const docTitle = isGenerico
      ? this.sanitizarHtml(dadosCabecalho.tituloDocumento)
      : `${this.sanitizarHtml(dadosCabecalho.tituloDocumento)} - ${this.sanitizarHtml(nomeEmpresa)}`;

    const cabecalhoFaixaHtml = isGenerico
      ? `<div class="cabecalho-faixa-navy" style="justify-content: center; text-align: center; padding: 12px 16px;">
           <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; text-align: center;">
             <div class="cabecalho-doc-titulo" style="font-size: 10pt; text-align: center; letter-spacing: 0.4px;">${this.sanitizarHtml(dadosCabecalho.tituloDocumento)}</div>
             ${dadosCabecalho.subtituloDocumento ? `<div class="cabecalho-doc-subtitulo" style="text-align: center; margin-top: 3px;">${this.sanitizarHtml(dadosCabecalho.subtituloDocumento)}</div>` : ''}
           </div>
         </div>`
      : `<div class="cabecalho-faixa-navy">
           <div class="cabecalho-left">
             ${logoHtml}
             <div class="cabecalho-empresa-info">
               <div class="cabecalho-empresa-nome">${this.sanitizarHtml(nomeEmpresa)}</div>
               <div class="cabecalho-empresa-sub">${this.sanitizarHtml(cnpjEmpresa || tituloProfissional)}</div>
             </div>
           </div>
           <div class="cabecalho-right">
             <div class="cabecalho-doc-titulo">${this.sanitizarHtml(dadosCabecalho.tituloDocumento)}</div>
             ${dadosCabecalho.subtituloDocumento ? `<div class="cabecalho-doc-subtitulo">${this.sanitizarHtml(dadosCabecalho.subtituloDocumento)}</div>` : ''}
           </div>
         </div>`;

    const rodapeCentroHtml = isGenerico
      ? ''
      : this.sanitizarHtml(contatosRodapeHtml);

    const documentoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');

    :root {
      --p4-navy:    #132A41;
      --p4-copper:  #B5642A;
      --p4-copper-l:#E8B27E;
      --p4-bg:      #FFFFFF;
      --p4-ink:     #1A2A38;
      --p4-soft:    #4A5A66;
      --p4-faint:   #8A949C;
      --p4-rule:    #D8D0C6;
      --p4-green:   #2E7D5B;
      --p4-green-l: #E8F5EE;
      --p4-red:     #C75D45;
      --p4-red-l:   #FDECEA;
      --p4-blue:    #2C5AA0;
      --p4-blue-l:  #EBF0FA;
      --p4-amber:   #E07B39;
      --p4-amber-l: #FDF0E6;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 8mm 16mm 14mm 16mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      background-color: var(--p4-bg);
      color: var(--p4-ink);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 8.5pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    /* Estrutura de repetição de Cabeçalho e Rodapé */
    table.print-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }

    thead.print-thead {
      display: table-header-group;
    }

    tfoot.print-tfoot {
      display: table-footer-group;
    }

    tbody.print-tbody {
      display: table-row-group;
    }

    td.print-thead-td {
      padding: 0 0 12px 0;
      border: none;
    }

    td.print-tfoot-td {
      padding: 12px 0 0 0;
      border: none;
    }

    td.print-tbody-td {
      padding: 0;
      border: none;
      vertical-align: top;
    }

    /* CABEÇALHO INSTITUCIONAL */
    .cabecalho-container {
      width: 100%;
      margin-bottom: 2px;
    }

    .cabecalho-faixa-navy {
      background-color: var(--p4-navy);
      color: #FFFFFF;
      padding: 10px 14px;
      border-radius: 6px 6px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cabecalho-left {
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 50%;
    }

    .cabecalho-logo-img {
      max-height: 38px;
      max-width: 110px;
      object-fit: contain;
      background: #FFFFFF;
      padding: 3px 6px;
      border-radius: 4px;
    }

    .capa-logo-mark {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      background: linear-gradient(135deg, var(--p4-copper), #8A4315);
      color: #FFFFFF;
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 13pt;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.5px;
      shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cabecalho-empresa-info {
      display: flex;
      flex-direction: column;
    }

    .cabecalho-empresa-nome {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 9pt;
      color: #FFFFFF;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .cabecalho-empresa-sub {
      font-size: 7pt;
      color: #CBD5E1;
      margin-top: 1px;
    }

    .cabecalho-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      max-width: 50%;
    }

    .cabecalho-doc-titulo {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 9.5pt;
      color: #FFFFFF;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .cabecalho-doc-subtitulo {
      font-size: 7.5pt;
      color: var(--p4-copper-l);
      font-weight: 600;
      margin-top: 2px;
    }

    .cabecalho-linha-copper {
      height: 3px;
      background-color: var(--p4-copper);
      border-radius: 0 0 6px 6px;
      width: 100%;
    }

    /* RODAPÉ INSTITUCIONAL */
    .rodape-container {
      width: 100%;
    }

    .rodape-linha {
      height: 1px;
      background-color: var(--p4-rule);
      margin-bottom: 6px;
      width: 100%;
    }

    .rodape-conteudo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 6.8pt;
      color: var(--p4-soft);
      gap: 8px;
    }

    .rodape-left {
      font-weight: 500;
      white-space: nowrap;
    }

    .rodape-left strong {
      color: var(--p4-navy);
      font-weight: 700;
    }

    .rodape-center {
      text-align: center;
      color: var(--p4-faint);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rodape-right {
      text-align: right;
      white-space: nowrap;
      font-weight: 600;
      color: var(--p4-navy);
    }

    /* CLASSES UTILITÁRIAS PARA O CORPO HTML */
    .doc-section {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .doc-section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 9pt;
      font-weight: 700;
      color: var(--p4-navy);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 12px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .doc-section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 12px;
      background-color: var(--p4-copper);
      border-radius: 2px;
    }

    .doc-card-info {
      background-color: #F8FAFC;
      border: 1px solid var(--p4-rule);
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 10px;
    }

    .doc-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
    }

    .doc-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px 10px;
    }

    .doc-info-item {
      display: flex;
      flex-direction: column;
    }

    .doc-info-label {
      font-size: 6.8pt;
      font-weight: 700;
      color: var(--p4-soft);
      text-transform: uppercase;
    }

    .doc-info-value {
      font-size: 8pt;
      font-weight: 600;
      color: var(--p4-ink);
    }

    /* Tabelas padronizadas */
    table.doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 7.5pt;
    }

    table.doc-table th {
      background-color: var(--p4-navy);
      color: #FFFFFF;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 7.2pt;
      text-align: left;
      padding: 5px 8px;
      border: 1px solid var(--p4-navy);
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }

    table.doc-table th.th-copper {
      background-color: var(--p4-copper);
      border-color: var(--p4-copper);
    }

    table.doc-table th.th-center,
    table.doc-table td.td-center {
      text-align: center;
    }

    table.doc-table th.th-right,
    table.doc-table td.td-right {
      text-align: right;
    }

    table.doc-table td {
      padding: 4.5px 8px;
      border: 1px solid #E2E8F0;
      color: var(--p4-ink);
      vertical-align: middle;
    }

    table.doc-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }

    table.doc-table tr.highlight-emerald td {
      background-color: var(--p4-green-l) !important;
      color: var(--p4-green) !important;
      font-weight: 700;
      border-color: #B7E4C7;
    }

    table.doc-table tr.highlight-amber td {
      background-color: var(--p4-amber-l) !important;
      color: var(--p4-amber) !important;
      font-weight: 700;
    }

    table.doc-table tr.highlight-gray td {
      background-color: #F1F5F9 !important;
      font-weight: 700;
    }

    /* Caixas de Destaque */
    .doc-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 8px 0;
    }

    .doc-kpi-card {
      background: #F8FAFC;
      border: 1px solid var(--p4-rule);
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }

    .doc-kpi-card.emerald {
      background: var(--p4-green-l);
      border-color: #B7E4C7;
    }

    .doc-kpi-card.navy {
      background: var(--p4-blue-l);
      border-color: #C3DAFE;
    }

    .doc-kpi-label {
      font-size: 6.5pt;
      font-weight: 700;
      color: var(--p4-soft);
      text-transform: uppercase;
    }

    .doc-kpi-val {
      font-family: 'Poppins', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: var(--p4-navy);
      margin-top: 2px;
    }

    .doc-kpi-card.emerald .doc-kpi-val {
      color: var(--p4-green);
    }

    /* Nota Metodológica & Legal */
    .doc-legal-note {
      font-size: 6.8pt;
      color: var(--p4-soft);
      font-style: italic;
      line-height: 1.35;
      background: #F8FAFC;
      border-left: 2px solid var(--p4-copper);
      padding: 5px 8px;
      border-radius: 0 4px 4px 0;
      margin: 10px 0;
    }

    /* Bloco de Assinatura */
    .doc-signature-wrapper {
      margin-top: 24px;
      text-align: center;
      page-break-inside: avoid;
    }

    .doc-signature-line {
      width: 240px;
      height: 1px;
      background-color: var(--p4-navy);
      margin: 0 auto 6px auto;
    }

    .doc-signature-name {
      font-family: 'Poppins', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: var(--p4-navy);
    }

    .doc-signature-reg {
      font-size: 7.5pt;
      color: var(--p4-soft);
      font-weight: 500;
    }

    .doc-signature-cat {
      font-size: 7pt;
      color: var(--p4-faint);
    }

    /* Quebras de Página */
    .page-break {
      page-break-before: always;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <table class="print-table">
    <thead class="print-thead">
      <tr>
        <td class="print-thead-td">
          <div class="cabecalho-container">
            ${cabecalhoFaixaHtml}
            <div class="cabecalho-linha-copper"></div>
          </div>
        </td>
      </tr>
    </thead>

    <tbody class="print-tbody">
      <tr>
        <td class="print-tbody-td">
          ${corpoHtml}

          <!-- BLOCO DE ASSINATURA TÉCNICA INSTITUCIONAL -->
          ${(!isGenerico && !dadosCabecalho.ocultarAssinaturaResponsavel) ? `
          <div class="doc-signature-wrapper">
            <div class="doc-signature-line"></div>
            <div class="doc-signature-name">${this.sanitizarHtml(nomeProfissional)}</div>
            <div class="doc-signature-reg">${this.sanitizarHtml(tituloProfissional)} • ${this.sanitizarHtml(creaCau)}</div>
            ${nomeEmpresa ? `<div class="doc-signature-cat">${this.sanitizarHtml(nomeEmpresa)}</div>` : ''}
          </div>
          ` : ''}
        </td>
      </tr>
    </tbody>

    <tfoot class="print-tfoot">
      <tr>
        <td class="print-tfoot-td">
          <div class="rodape-container">
            <div class="rodape-linha"></div>
            <div class="rodape-conteudo">
              <div class="rodape-left">
                <strong>AmorimTech</strong> • ${this.sanitizarHtml(dadosCabecalho.nomeAgente)}
              </div>
              <div class="rodape-center">
                ${rodapeCentroHtml}
              </div>
              <div class="rodape-right">
                <span>${this.sanitizarHtml(nomeProfissional)} (${this.sanitizarHtml(creaCau)})</span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

    // 6. Abrir janela e imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.exibirToast(
        'Abertura do relatório bloqueada pelo navegador. Permita pop-ups para visualizar e emitir o documento técnico.',
        'alerta'
      );
      return false;
    }

    try {
      printWindow.document.open();
      printWindow.document.write(documentoHtml);
      printWindow.document.close();
      return true;
    } catch (e) {
      console.error('Erro ao escrever documento na janela de impressão:', e);
      this.exibirToast('Ocorreu um erro ao preparar o documento para impressão.', 'erro');
      return false;
    }
  }

  // --- HELPERS VISUAIS E UTILITÁRIOS ---

  private obterIniciais(nome: string): string {
    if (!nome) return 'AT';
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  private formatarCnpj(cnpj: string): string {
    const limpo = cnpj.replace(/\D/g, '');
    if (limpo.length === 14) {
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  private sanitizarHtml(texto: string): string {
    if (!texto) return '';
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Exibe um Toast moderno e flutuante na tela caso ocorra erro ou aviso
   */
  exibirToast(mensagem: string, tipo: 'erro' | 'alerta' | 'sucesso' = 'erro'): void {
    if (typeof document === 'undefined') return;

    // Remover toast anterior se existir
    const anterior = document.getElementById('motor-pdf-toast');
    if (anterior) anterior.remove();

    const toast = document.createElement('div');
    toast.id = 'motor-pdf-toast';

    const bgClass = tipo === 'erro'
      ? 'bg-rose-900/95 border-rose-700 text-white shadow-rose-950/40'
      : tipo === 'alerta'
      ? 'bg-amber-900/95 border-amber-700 text-white shadow-amber-950/40'
      : 'bg-emerald-900/95 border-emerald-700 text-white shadow-emerald-950/40';

    const icon = tipo === 'erro' ? '🚫' : tipo === 'alerta' ? '⚠️' : '✅';

    toast.className = `fixed bottom-6 right-6 max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-md z-[999999] flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${bgClass}`;
    toast.innerHTML = `
      <span class="text-xl leading-none select-none">${icon}</span>
      <div class="flex-1 text-xs font-semibold leading-relaxed">${mensagem}</div>
      <button type="button" class="text-white/70 hover:text-white font-bold text-base leading-none cursor-pointer select-none" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 6000);
  }
}
