import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

export interface DadosCertificado {
  nomeAluno: string;
  tituloCurso: string;
  textoNormativo?: string | null;
  cargaHoraria?: string | null;
  dataEmissao?: string | null;
  dataEmissaoIso?: string | null;
  codigoVerificacao?: string | null;
  moduloPredialVinculado?: string | null;
  instrutorNome?: string | null;
  instrutorQualificacao?: string | null;
}

/**
 * Gera código de autenticidade alfanumérico curto e legível no formato AMTECH-XXXXXXXX
 * (utiliza caracteres sem ambiguidade visual)
 */
export function gerarCodigoVerificacaoCertificado(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 8; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    random += chars.charAt(idx);
  }
  return `AMTECH-${random}`;
}

/**
 * Carrega imagem (SVG, PNG ou JPG) e converte para DataURL em alta resolução via Canvas
 * para compatibilidade nativa com jsPDF.addImage (preservando transparência)
 */
async function carregarImagemDataUrl(url: string, largura = 800, altura = 300): Promise<string> {
  if (!url || typeof url !== 'string') {
    throw new Error('URL da imagem não fornecida.');
  }

  // Se já for uma DataURL PNG/JPEG/WEBP válida, pode ser usada diretamente
  if (url.startsWith('data:image/')) {
    return url;
  }

  const isSvg = url.toLowerCase().includes('.svg');
  if (isSvg) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao obter SVG (${url}): ${response.statusText}`);
    }
    const svgText = await response.text();
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = largura;
          canvas.height = altura;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, largura, altura);
            ctx.drawImage(img, 0, 0, largura, altura);
          }
          URL.revokeObjectURL(blobUrl);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      };
      img.src = blobUrl;
    });
  } else {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || largura;
          const h = img.naturalHeight || altura;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
          }
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}

async function carregarLogoComFallback(urls: string[], largura: number, altura: number): Promise<string | null> {
  for (const url of urls) {
    try {
      const dataUrl = await carregarImagemDataUrl(url, largura, altura);
      if (dataUrl) return dataUrl;
    } catch {
      // tenta próxima url da lista
    }
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class CertificadoPdfService {
  /**
   * Formata a data por extenso em português (ex: "27 de agosto de 2026")
   */
  formatarDataExtenso(dataStr: string | null | undefined): string {
    if (!dataStr) {
      const hoje = new Date();
      return hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dataStr;
    }
  }

  /**
   * Concatena os campos de texto normativo e carga horária de forma natural e sem redundâncias
   */
  formatarTextoCertificadoCompleto(
    textoNormativo?: string | null,
    cargaHoraria?: string | null
  ): string {
    const normativo = (textoNormativo || '').trim();
    const carga = (cargaHoraria || '').trim();

    if (normativo && carga) {
      const normativoTratado = normativo.endsWith('.') ? normativo.slice(0, -1) : normativo;
      const cargaTratada = carga.toLowerCase().includes('carga horária') || carga.toLowerCase().includes('carga horaria')
        ? carga
        : `Carga horária: ${carga}`;
      return `${normativoTratado}. ${cargaTratada}.`;
    }

    if (normativo) {
      return normativo.endsWith('.') ? normativo : `${normativo}.`;
    }

    if (carga) {
      const cargaTratada = carga.toLowerCase().includes('carga horária') || carga.toLowerCase().includes('carga horaria')
        ? carga
        : `com carga horária de ${carga}`;
      return `${cargaTratada}, cumprindo integralmente o conteúdo programático e obtendo aprovação nas avaliações de proficiência técnica dos módulos.`;
    }

    return 'com carga horária total de 40 (quarenta) horas, cumprindo integralmente o conteúdo programático e obtendo aprovação nas avaliações de proficiência técnica dos módulos.';
  }

  /**
   * Constrói o documento jsPDF com o design oficial e layout de referência
   */
  async gerarDocJsPDF(dados: DadosCertificado): Promise<jsPDF> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Paleta Oficial AmorimTech (Navy #132A41, Copper #B5642A, Slate #475569, Slate Muted #64748B, Off-white #FEFCF8)
    const navyPrimary: [number, number, number] = [19, 42, 65]; // #132A41
    const copperAccent: [number, number, number] = [181, 100, 42]; // #B5642A
    const slateMedium: [number, number, number] = [71, 85, 105]; // #475569
    const slateMuted: [number, number, number] = [100, 116, 139]; // #64748B
    const bgOffWhite: [number, number, number] = [254, 252, 248]; // #FEFCF8

    // Fundo nobre sutil (#FEFCF8)
    doc.setFillColor(bgOffWhite[0], bgOffWhite[1], bgOffWhite[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // 1. Padrão Guilhoché (Textura de segurança com círculos concêntricos)
    // Centro (Navy muito sutil)
    doc.setDrawColor(236, 241, 247);
    doc.setLineWidth(0.12);
    for (let r = 12; r <= 135; r += 9) {
      doc.circle(pageWidth / 2, pageHeight / 2, r, 'S');
    }

    // Canto inferior esquerdo (12% X, 88% Y em Copper muito sutil)
    doc.setDrawColor(249, 241, 233);
    for (let r = 8; r <= 85; r += 8) {
      doc.circle(pageWidth * 0.12, pageHeight * 0.88, r, 'S');
    }

    // Canto superior direito (88% X, 12% Y em Copper muito sutil)
    for (let r = 8; r <= 85; r += 8) {
      doc.circle(pageWidth * 0.88, pageHeight * 0.12, r, 'S');
    }

    // 2. Moldura Dupla (Externa Navy 2px + Interna Copper 1px)
    const marginOut = 6.88;
    doc.setDrawColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.setLineWidth(0.55);
    doc.rect(marginOut, marginOut, pageWidth - (marginOut * 2), pageHeight - (marginOut * 2), 'S');

    const marginIn = 8.47;
    doc.setDrawColor(copperAccent[0], copperAccent[1], copperAccent[2]);
    doc.setLineWidth(0.28);
    doc.rect(marginIn, marginIn, pageWidth - (marginIn * 2), pageHeight - (marginIn * 2), 'S');

    // 4 Cantos decorativos em L (copper, 3px / 0.8mm espessura, 26px / 6.88mm comprimento) a 20px (5.29mm)
    const lOffset = 5.29;
    const lLen = 6.88;
    doc.setDrawColor(copperAccent[0], copperAccent[1], copperAccent[2]);
    doc.setLineWidth(0.8);

    // Top-Left
    doc.line(lOffset, lOffset, lOffset + lLen, lOffset);
    doc.line(lOffset, lOffset, lOffset, lOffset + lLen);

    // Top-Right
    doc.line(pageWidth - lOffset - lLen, lOffset, pageWidth - lOffset, lOffset);
    doc.line(pageWidth - lOffset, lOffset, pageWidth - lOffset, lOffset + lLen);

    // Bottom-Left
    doc.line(lOffset, pageHeight - lOffset, lOffset + lLen, pageHeight - lOffset);
    doc.line(lOffset, pageHeight - lOffset - lLen, lOffset, pageHeight - lOffset);

    // Bottom-Right
    doc.line(pageWidth - lOffset - lLen, pageHeight - lOffset, pageWidth - lOffset, pageHeight - lOffset);
    doc.line(pageWidth - lOffset, pageHeight - lOffset - lLen, pageWidth - lOffset, pageHeight - lOffset);

    // 3. Cabeçalho com 3 Logos Lado a Lado e Separadores Verticais Finos
    const headerY = 13.5;
    const startX = 89.45;

    let logoEmanoelUrl: string | null = null;
    let logoTechUrl: string | null = null;
    let logoAcademyUrl: string | null = null;

    try {
      logoEmanoelUrl = await carregarLogoComFallback(['/logo-emanoel.svg', '/logo-header.svg'], 880, 230);
    } catch (e) {
      console.warn('Fallback logo Emanoel:', e);
    }

    try {
      logoTechUrl = await carregarLogoComFallback(['/logo-tech.png', '/logo-tech.svg'], 700, 264);
    } catch (e) {
      console.warn('Fallback logo Tech:', e);
    }

    try {
      logoAcademyUrl = await carregarLogoComFallback(['/logo-academy.png', '/logo-academy.svg'], 720, 252);
    } catch (e) {
      console.warn('Fallback logo Academy:', e);
    }

    // Logo 1: Emanoel Amorim
    if (logoEmanoelUrl) {
      doc.addImage(logoEmanoelUrl, 'PNG', startX, headerY, 46.56, 11.5);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel Amorim', startX + 23.28, headerY + 7, { align: 'center' });
    }

    // Separador 1 (Linha fina vertical navy 20% entre Emanoel e Tech)
    doc.setDrawColor(200, 208, 218);
    doc.setLineWidth(0.25);
    doc.line(startX + 48.56, headerY + 1.2, startX + 48.56, headerY + 10.3);

    // Logo 2: AmorimTech
    if (logoTechUrl) {
      doc.addImage(logoTechUrl, 'PNG', startX + 50.56, headerY - 0.2, 30.67, 11.5);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('AmorimTech', startX + 65.89, headerY + 7, { align: 'center' });
    }

    // Separador 2 (Linha fina vertical navy 20% entre Tech e Academy)
    doc.setDrawColor(200, 208, 218);
    doc.setLineWidth(0.25);
    doc.line(startX + 83.23, headerY + 1.2, startX + 83.23, headerY + 10.3);

    // Logo 3: Amorim Academy
    if (logoAcademyUrl) {
      doc.addImage(logoAcademyUrl, 'PNG', startX + 85.23, headerY + 0.1, 32.86, 11.5);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Amorim Academy', startX + 101.66, headerY + 7, { align: 'center' });
    }

    // Kicker em Caixa Alta (Copper, bold, letter-spacing) - REQUISITO 1.1: ECOSSISTEMA DE FORMAÇÃO 4.0
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(copperAccent[0], copperAccent[1], copperAccent[2]);
    doc.text('AMORIM ACADEMY   ·   ECOSSISTEMA DE FORMAÇÃO 4.0', pageWidth / 2, 31.5, { align: 'center' });

    // 4. Título Principal do Certificado (Times bold, Navy)
    doc.setFont('times', 'bold');
    doc.setFontSize(29);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.text('Certificado de Conclusão', pageWidth / 2, 44.5, { align: 'center' });

    // Separador Decorativo (Linha + Losango + PROFICIÊNCIA TÉCNICA CONTINUADA + Losango + Linha)
    const subY = 49.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    const subText = 'PROFICIÊNCIA TÉCNICA CONTINUADA';
    doc.text(subText, pageWidth / 2, subY + 0.6, { align: 'center' });

    const textSubWidth = doc.getTextWidth(subText);
    const dLeftX = (pageWidth / 2) - (textSubWidth / 2) - 4;
    const dRightX = (pageWidth / 2) + (textSubWidth / 2) + 4;

    // Linha esquerda
    doc.setDrawColor(copperAccent[0], copperAccent[1], copperAccent[2]);
    doc.setLineWidth(0.28);
    doc.line(dLeftX - 22, subY, dLeftX - 2.5, subY);

    // Losangos decorativos
    const drawDiamond = (cx: number, cy: number, size: number) => {
      doc.setFillColor(copperAccent[0], copperAccent[1], copperAccent[2]);
      const half = size / 2;
      doc.triangle(cx - half, cy, cx, cy - half, cx, cy + half, 'F');
      doc.triangle(cx + half, cy, cx, cy - half, cx, cy + half, 'F');
    };
    drawDiamond(dLeftX - 1.2, subY, 1.6);
    drawDiamond(dRightX + 1.2, subY, 1.6);

    // Linha direita
    doc.line(dRightX + 2.5, subY, dRightX + 22, subY);

    // 5. Preâmbulo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
    doc.text('Certificamos, para os devidos fins de comprovação técnica e curricular, que', pageWidth / 2, 59.5, { align: 'center' });

    // 6. Nome do Aluno em Destaque Máximo (Times bold, Copper)
    const nomeExibicao = (dados.nomeAluno || 'Membro da Comunidade').trim();
    doc.setFont('times', 'bold');
    let nomeFontSize = 24;
    if (nomeExibicao.length > 36) nomeFontSize = 20;
    if (nomeExibicao.length > 48) nomeFontSize = 17;
    doc.setFontSize(nomeFontSize);
    doc.setTextColor(copperAccent[0], copperAccent[1], copperAccent[2]);
    doc.text(nomeExibicao, pageWidth / 2, 71.5, { align: 'center' });

    // Linha fina navy abaixo do nome
    const nomeWidth = doc.getTextWidth(nomeExibicao);
    const lineW = Math.min(Math.max(nomeWidth + 14, 75), 175);
    doc.setDrawColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    doc.setLineWidth(0.22);
    doc.line((pageWidth / 2) - (lineW / 2), 74.5, (pageWidth / 2) + (lineW / 2), 74.5);

    // 7. Texto de Conclusão e Nome do Curso
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
    doc.text('concluiu com êxito todas as etapas, módulos didáticos e avaliações do curso', pageWidth / 2, 82.5, { align: 'center' });

    // Nome do Curso entre aspas em Negrito Navy
    doc.setFont('helvetica', 'bold');
    let cursoFontSize = 13.5;
    if ((dados.tituloCurso || '').length > 55) cursoFontSize = 11.5;
    if ((dados.tituloCurso || '').length > 80) cursoFontSize = 10;
    doc.setFontSize(cursoFontSize);
    doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
    const splitTitulo = doc.splitTextToSize(`“${dados.tituloCurso || 'Curso de Engenharia Diagnóstica'}”`, 190);
    doc.text(splitTitulo, pageWidth / 2, 91.5, { align: 'center' });

    // 8. Texto Normativo / Carga Horária (Concatenados harmoniosamente)
    const textoCompleto = this.formatarTextoCertificadoCompleto(dados.textoNormativo, dados.cargaHoraria);
    const tituloOffset = (splitTitulo.length - 1) * 5;
    const normativoY = 98.5 + tituloOffset;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    const splitNormativo = doc.splitTextToSize(textoCompleto, 175);
    doc.text(splitNormativo, pageWidth / 2, normativoY, { align: 'center' });

    // 9. Rodapé Dinâmico (3 Colunas se houver Instrutor, ou 2 Colunas se for apenas Institucional)
    const bottomSectionY = 140;
    const temInstrutor = !!(dados.instrutorNome && dados.instrutorNome.trim().length > 0);
    const dataEmissaoFormatada = this.formatarDataExtenso(dados.dataEmissaoIso || dados.dataEmissao);
    const codigoVerificacao = (dados.codigoVerificacao || 'AMTECH-PENDENTE').toUpperCase();

    if (temInstrutor) {
      // =========================================================================
      // LAYOUT DE 3 COLUNAS (Autenticidade | Instrutor(a) | Responsável Técnico)
      // =========================================================================

      // Coluna 1: Dados de Emissão & Autenticidade (Esquerda, X = 22)
      const leftColX = 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('DADOS DE EMISSÃO & AUTENTICIDADE', leftColX, bottomSectionY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.4);
      doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
      doc.text(`Local e Data: Recife – PE, ${dataEmissaoFormatada}`, leftColX, bottomSectionY + 4.6);

      doc.text('Código de Autenticidade: ', leftColX, bottomSectionY + 8.8);
      const prefixCodeWidth = doc.getTextWidth('Código de Autenticidade: ');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text(codigoVerificacao, leftColX + prefixCodeWidth, bottomSectionY + 8.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.0);
      doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
      doc.text('Amorim Arquitetura, Tech & Academy', leftColX, bottomSectionY + 13.2);
      doc.text('CNPJ 35.673.731/0001-82', leftColX, bottomSectionY + 16.8);
      doc.text('Rua Leonardo Bezerra Cavalcante, nº 672, Sala 06', leftColX, bottomSectionY + 20.4);
      doc.text('Parnamirim, CEP 52.060-035, Recife/PE', leftColX, bottomSectionY + 24.0);

      // Coluna 2: Assinatura do Instrutor do Curso (Centro, X = 158)
      const instrutorX = 158;
      const nomeInstrutor = dados.instrutorNome!.trim();
      const qualifInstrutor = (dados.instrutorQualificacao || 'Docente / Instrutor(a)').trim();

      // Assinatura estilizada em Times Italic (mesmo padrão visual da assinatura do Responsável Técnico)
      doc.setFont('times', 'italic');
      doc.setFontSize(13.5);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text(nomeInstrutor, instrutorX, bottomSectionY + 6.0, { align: 'center' });

      // Linha de assinatura do instrutor
      doc.setDrawColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.setLineWidth(0.25);
      doc.line(instrutorX - 25, bottomSectionY + 9.8, instrutorX + 25, bottomSectionY + 9.8);

      // Nome impresso do instrutor
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text(nomeInstrutor, instrutorX, bottomSectionY + 14.0, { align: 'center' });

      // Qualificação / Registro do instrutor (Copper)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.4);
      doc.setTextColor(copperAccent[0], copperAccent[1], copperAccent[2]);
      const splitQualif = doc.splitTextToSize(qualifInstrutor, 52);
      doc.text(splitQualif, instrutorX, bottomSectionY + 17.8, { align: 'center' });

      // Papel institucional
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      const offsetQualif = (splitQualif.length - 1) * 3.2;
      doc.text('Instrutor(a) do Curso', instrutorX, bottomSectionY + 21.6 + offsetQualif, { align: 'center' });

      // Coluna 3: Assinatura do Responsável Técnico Institucional (Direita, X = 248)
      const respTecX = 248;

      doc.setFont('times', 'italic');
      doc.setFontSize(13.5);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel S. de Amorim', respTecX, bottomSectionY + 6.0, { align: 'center' });

      doc.setDrawColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.setLineWidth(0.25);
      doc.line(respTecX - 25, bottomSectionY + 9.8, respTecX + 25, bottomSectionY + 9.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel Silva de Amorim', respTecX, bottomSectionY + 14.0, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.4);
      doc.setTextColor(copperAccent[0], copperAccent[1], copperAccent[2]);
      doc.text('CAU A133593-6 · Arquiteto e Urbanista', respTecX, bottomSectionY + 17.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      doc.text('Responsável Técnico · AmorimTech', respTecX, bottomSectionY + 21.6, { align: 'center' });
    } else {
      // =========================================================================
      // LAYOUT DE 2 COLUNAS (Autenticidade | Responsável Técnico)
      // =========================================================================

      // Coluna Esquerda: Dados de Emissão & Autenticidade (Início em X = 25)
      const leftColX = 25;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('DADOS DE EMISSÃO & AUTENTICIDADE', leftColX, bottomSectionY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
      doc.text(`Local e Data: Recife – PE, ${dataEmissaoFormatada}`, leftColX, bottomSectionY + 4.8);

      doc.text('Código de Autenticidade: ', leftColX, bottomSectionY + 9.2);
      const prefixCodeWidth = doc.getTextWidth('Código de Autenticidade: ');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text(codigoVerificacao, leftColX + prefixCodeWidth, bottomSectionY + 9.2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.4);
      doc.setTextColor(slateMedium[0], slateMedium[1], slateMedium[2]);
      doc.text('Amorim Arquitetura, Tech & Academy', leftColX, bottomSectionY + 13.8);
      doc.text('CNPJ 35.673.731/0001-82', leftColX, bottomSectionY + 17.6);
      doc.text('Rua Leonardo Bezerra Cavalcante, nº 672, Sala 06', leftColX, bottomSectionY + 21.4);
      doc.text('Parnamirim, CEP 52.060-035, Recife/PE', leftColX, bottomSectionY + 25.2);

      // Coluna Direita: Assinatura do Responsável Técnico (Centralizada em X = 232)
      const sigX = 232;

      doc.setFont('times', 'italic');
      doc.setFontSize(15);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel S. de Amorim', sigX, bottomSectionY + 6.0, { align: 'center' });

      doc.setDrawColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.setLineWidth(0.25);
      doc.line(sigX - 30, bottomSectionY + 9.8, sigX + 30, bottomSectionY + 9.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.0);
      doc.setTextColor(navyPrimary[0], navyPrimary[1], navyPrimary[2]);
      doc.text('Emanoel Silva de Amorim', sigX, bottomSectionY + 14.2, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.0);
      doc.setTextColor(copperAccent[0], copperAccent[1], copperAccent[2]);
      doc.text('CAU A133593-6 · Arquiteto e Urbanista', sigX, bottomSectionY + 18.2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.4);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      doc.text('Responsável Técnico · AmorimTech', sigX, bottomSectionY + 22.0, { align: 'center' });
    }

    // 10. Rodapé Inferior de Autenticidade com Link Público (REQUISITO 4.4)
    const footerY = 197.5;
    doc.setDrawColor(220, 226, 235);
    doc.setLineWidth(0.2);
    doc.line(22, footerY - 3.2, pageWidth - 22, footerY - 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    const footerText = 'Este certificado digital possui validade técnica profissional conforme a legislação vigente e pode ter sua integridade confirmada junto aos registros da AmorimTech. Verifique a autenticidade em emanoelamorim.com/verificar-certificado com o código acima.';
    const splitFooter = doc.splitTextToSize(footerText, 250);
    doc.text(splitFooter, pageWidth / 2, footerY, { align: 'center' });

    return doc;
  }

  /**
   * Gera o PDF e dispara o download no navegador do usuário
   */
  async gerarEBaixarCertificadoPDF(dados: DadosCertificado): Promise<{ sucesso: boolean; mensagemErro?: string }> {
    try {
      const doc = await this.gerarDocJsPDF(dados);
      const nomeLimpo = (dados.nomeAluno || 'Aluno').replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim();
      const cursoLimpo = (dados.tituloCurso || 'Curso').replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim();
      const nomeArquivo = `Certificado_${cursoLimpo}_${nomeLimpo}.pdf`.replace(/\s+/g, '_');
      doc.save(nomeArquivo);
      return { sucesso: true };
    } catch (err: any) {
      console.error('Erro ao gerar certificado PDF:', err);
      return { sucesso: false, mensagemErro: err?.message || 'Erro ao gerar arquivo PDF.' };
    }
  }
}
