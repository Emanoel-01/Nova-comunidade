import { Injectable } from '@angular/core';
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber
} from 'docx';

export interface DadosEmpresaLicitacao {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  responsavelCargo?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export interface DeclaracaoItemLicitacao {
  id: string;
  nome: string;
  baseLegal?: string;
  origem?: string;
  textoFinal: string;
  obrigatorio?: boolean;
}

export interface DadosEnvelopeLicitacao {
  tipoEnvelope: string; // ex: "ENVELOPE Nº 01 - PROPOSTA DE PREÇOS"
  numeroEdital: string;
  orgaoDestinatario: string;
  comissaoOuPregoeiro?: string;
  objetoResumo?: string;
  dataAbertura?: string;
  empresa: DadosEmpresaLicitacao;
}

@Injectable({ providedIn: 'root' })
export class GeradorDocxLicitacaoService {

  /**
   * Converte texto com quebras de linha em parágrafos formatados para DOCX
   */
  private formatarParagrafosTexto(texto: string, alinhamento: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.JUSTIFIED): Paragraph[] {
    const linhas = texto.split('\n');
    const paragrafos: Paragraph[] = [];

    for (const linha of linhas) {
      const linhaTrim = linha.trim();
      if (!linhaTrim) {
        paragrafos.push(
          new Paragraph({
            spacing: { after: 120 }
          })
        );
      } else if (linhaTrim.startsWith('___')) {
        // Linha de assinatura
        paragrafos.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 360, after: 60 },
            children: [
              new TextRun({
                text: '___________________________________________________',
                font: 'Arial',
                size: 22,
                color: '333333'
              })
            ]
          })
        );
      } else if (
        linhaTrim.startsWith('CNPJ:') ||
        linhaTrim.startsWith('Representante:') ||
        linhaTrim.startsWith('CPF:') ||
        linhaTrim.startsWith('Cargo:') ||
        linhaTrim.toUpperCase() === linhaTrim && linhaTrim.length > 5 && !linhaTrim.includes('DECLARA')
      ) {
        // Dados de assinatura centralizados
        paragrafos.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: linhaTrim,
                font: 'Arial',
                size: 20,
                bold: linhaTrim.toUpperCase() === linhaTrim && !linhaTrim.includes(':')
              })
            ]
          })
        );
      } else {
        paragrafos.push(
          new Paragraph({
            alignment: alinhamento,
            spacing: { line: 360, after: 160 }, // Espaçamento 1.5 linhas
            indent: { firstLine: 720 }, // Recuo de 1.25 cm
            children: [
              new TextRun({
                text: linhaTrim,
                font: 'Arial',
                size: 24 // 12pt
              })
            ]
          })
        );
      }
    }

    return paragrafos;
  }

  /**
   * Gera um arquivo .docx para uma única declaração
   */
  async gerarDeclaracaoIndividual(
    item: DeclaracaoItemLicitacao,
    empresa: DadosEmpresaLicitacao,
    numeroEdital?: string,
    orgao?: string
  ): Promise<Blob> {
    const paragrafosConteudo = this.formatarParagrafosTexto(item.textoFinal);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 2.54cm
                bottom: 1440,
                left: 1440,
                right: 1440
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 120 },
                  children: [
                    new TextRun({
                      text: `${empresa.razaoSocial || empresa.nomeFantasia || 'LICITANTE'} | CNPJ: ${empresa.cnpj || '—'}`,
                      font: 'Arial',
                      size: 16,
                      color: '666666'
                    })
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: numeroEdital ? `Edital: ${numeroEdital} | ` : '',
                      font: 'Arial',
                      size: 16,
                      color: '888888'
                    }),
                    new TextRun({
                      text: item.baseLegal ? `Fundamentação: ${item.baseLegal}` : 'Lei nº 14.133/2021',
                      font: 'Arial',
                      size: 16,
                      color: '888888'
                    })
                  ]
                })
              ]
            })
          },
          children: [
            // Título Centralizado
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 240, after: 200 },
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: item.nome.toUpperCase(),
                  bold: true,
                  font: 'Arial',
                  size: 28, // 14pt
                  color: '111111'
                })
              ]
            }),

            // Subtítulo com Referência Legal / Edital
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 480 },
              children: [
                new TextRun({
                  text: item.baseLegal ? `(Ref.: ${item.baseLegal})` : (numeroEdital ? `(Processo / Edital: ${numeroEdital})` : ''),
                  italics: true,
                  font: 'Arial',
                  size: 20,
                  color: '555555'
                })
              ]
            }),

            // Corpo da Declaração
            ...paragrafosConteudo
          ]
        }
      ]
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Gera um pacote completo em .docx contendo múltiplas declarações com quebra de página entre cada uma
   */
  async gerarDeclaracoesLote(
    itens: DeclaracaoItemLicitacao[],
    empresa: DadosEmpresaLicitacao,
    numeroEdital?: string,
    orgao?: string
  ): Promise<Blob> {
    const todosParagrafos: Paragraph[] = [];

    itens.forEach((item, index) => {
      // Se não for a primeira declaração, adiciona quebra de página
      if (index > 0) {
        todosParagrafos.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        );
      }

      // Título da Declaração
      todosParagrafos.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 180 },
          children: [
            new TextRun({
              text: item.nome.toUpperCase(),
              bold: true,
              font: 'Arial',
              size: 28,
              color: '111111'
            })
          ]
        })
      );

      // Subtítulo
      todosParagrafos.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: item.baseLegal ? `(Ref.: ${item.baseLegal})` : (numeroEdital ? `(Processo / Edital: ${numeroEdital})` : ''),
              italics: true,
              font: 'Arial',
              size: 20,
              color: '555555'
            })
          ]
        })
      );

      // Parágrafos formatados
      const paragrafosCorpo = this.formatarParagrafosTexto(item.textoFinal);
      todosParagrafos.push(...paragrafosCorpo);
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `${empresa.razaoSocial || 'LICITANTE'} | CNPJ: ${empresa.cnpj || '—'}`,
                      font: 'Arial',
                      size: 16,
                      color: '666666'
                    })
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${numeroEdital ? 'Edital ' + numeroEdital + ' | ' : ''}Declarações de Habilitação - Lei 14.133/2021 | Pág. `,
                      font: 'Arial',
                      size: 16,
                      color: '888888'
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT]
                    })
                  ]
                })
              ]
            })
          },
          children: todosParagrafos
        }
      ]
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Gera o layout de identificação para Envelope de Licitação para impressão (.docx)
   */
  async gerarEnvelopeDocx(dados: DadosEnvelopeLicitacao): Promise<Blob> {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 }
            }
          },
          children: [
            // Título Superior do Envelope
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100, after: 180 },
              children: [
                new TextRun({
                  text: dados.tipoEnvelope.toUpperCase(),
                  bold: true,
                  font: 'Arial',
                  size: 32, // 16pt
                  color: '000000'
                })
              ]
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 360 },
              children: [
                new TextRun({
                  text: `EDITAL / PROCESSO LICITATÓRIO: ${dados.numeroEdital || 'NÃO INFORMADO'}`,
                  bold: true,
                  font: 'Arial',
                  size: 24,
                  color: '132A41'
                })
              ]
            }),

            // Tabela com Moldura do Envelope: DESTINATÁRIO
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: '132A41' },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: '132A41' },
                left: { style: BorderStyle.SINGLE, size: 12, color: '132A41' },
                right: { style: BorderStyle.SINGLE, size: 12, color: '132A41' }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: 'F1F5F9' },
                      children: [
                        new Paragraph({
                          spacing: { before: 80, after: 80 },
                          children: [
                            new TextRun({
                              text: '  DESTINATÁRIO / ÓRGÃO LICITANTE',
                              bold: true,
                              font: 'Arial',
                              size: 20,
                              color: '132A41'
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          spacing: { before: 120, after: 60 },
                          children: [
                            new TextRun({ text: 'Órgão: ', bold: true, font: 'Arial', size: 22 }),
                            new TextRun({ text: dados.orgaoDestinatario || 'Comissão de Contratação / Órgão Público', font: 'Arial', size: 22 })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: 'A/C: ', bold: true, font: 'Arial', size: 22 }),
                            new TextRun({ text: dados.comissaoOuPregoeiro || 'Agente de Contratação / Pregoeiro(a) e Equipe de Apoio', font: 'Arial', size: 22 })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: 'Objeto: ', bold: true, font: 'Arial', size: 20 }),
                            new TextRun({ text: dados.objetoResumo || 'Execução dos serviços conforme especificações do edital.', font: 'Arial', size: 20 })
                          ]
                        }),
                        ...(dados.dataAbertura ? [
                          new Paragraph({
                            spacing: { after: 120 },
                            children: [
                              new TextRun({ text: 'Data / Horário da Sessão: ', bold: true, font: 'Arial', size: 20 }),
                              new TextRun({ text: dados.dataAbertura, font: 'Arial', size: 20 })
                            ]
                          })
                        ] : [
                          new Paragraph({ spacing: { after: 80 }, children: [] })
                        ])
                      ]
                    })
                  ]
                })
              ]
            }),

            // Espaçamento entre Destinatário e Remetente
            new Paragraph({
              spacing: { before: 240, after: 120 },
              children: []
            }),

            // Tabela com Moldura do Envelope: REMETENTE
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: 'B5642A' },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: 'B5642A' },
                left: { style: BorderStyle.SINGLE, size: 12, color: 'B5642A' },
                right: { style: BorderStyle.SINGLE, size: 12, color: 'B5642A' }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: 'FFFBEB' },
                      children: [
                        new Paragraph({
                          spacing: { before: 80, after: 80 },
                          children: [
                            new TextRun({
                              text: '  REMETENTE / PROPONENTE LICITANTE',
                              bold: true,
                              font: 'Arial',
                              size: 20,
                              color: 'B5642A'
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          spacing: { before: 120, after: 60 },
                          children: [
                            new TextRun({ text: 'Razão Social: ', bold: true, font: 'Arial', size: 22 }),
                            new TextRun({ text: dados.empresa.razaoSocial || dados.empresa.nomeFantasia || 'Razão Social do Proponente', font: 'Arial', size: 22, bold: true })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: 'CNPJ: ', bold: true, font: 'Arial', size: 22 }),
                            new TextRun({ text: dados.empresa.cnpj || '00.000.000/0000-00', font: 'Arial', size: 22 })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: 'Endereço: ', bold: true, font: 'Arial', size: 20 }),
                            new TextRun({ text: dados.empresa.endereco || 'Endereço da sede da empresa', font: 'Arial', size: 20 })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 60 },
                          children: [
                            new TextRun({ text: 'Representante Legal: ', bold: true, font: 'Arial', size: 20 }),
                            new TextRun({ text: `${dados.empresa.responsavelNome || '—'} (CPF: ${dados.empresa.responsavelCpf || '—'})`, font: 'Arial', size: 20 })
                          ]
                        }),
                        new Paragraph({
                          spacing: { after: 120 },
                          children: [
                            new TextRun({ text: 'Contato: ', bold: true, font: 'Arial', size: 20 }),
                            new TextRun({ text: `${dados.empresa.telefone || ''} | ${dados.empresa.email || ''}`, font: 'Arial', size: 20 })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Aviso Rodapé do Envelope
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 360 },
              children: [
                new TextRun({
                  text: 'DOCUMENTO LACRADO — ABRIR EXCLUSIVAMENTE EM SESSÃO PÚBLICA',
                  bold: true,
                  font: 'Arial',
                  size: 18,
                  color: '888888'
                })
              ]
            })
          ]
        }
      ]
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Helper para disparar o download no navegador
   */
  downloadBlob(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
