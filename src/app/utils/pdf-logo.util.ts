/**
 * Utilitário compartilhado para carregar logos em PDFs gerados via jsPDF.
 * Extraído de certificado-pdf.service.ts para reuso em outros geradores
 * de PDF do sistema (ex: Viabiliza IA).
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

export async function carregarLogoComFallback(urls: string[], largura: number, altura: number): Promise<string | null> {
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
