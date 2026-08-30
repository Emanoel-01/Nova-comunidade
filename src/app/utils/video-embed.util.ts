/**
 * Utilitário de detecção e formatação de URLs de embed para vídeos (YouTube e Vimeo) no Blog
 */

export interface VideoEmbedInfo {
  plataforma: 'youtube' | 'vimeo';
  embedUrl: string;
}

/**
 * Detecta se a URL fornecida é um link do YouTube ou do Vimeo e retorna a URL pronta para iframe embed.
 * Retorna null se a URL for vazia ou se não corresponder a nenhuma das plataformas suportadas.
 */
export function detectarVideoEmbed(url: string | null | undefined): VideoEmbedInfo | null {
  if (!url) return null;
  const texto = url.trim();
  if (!texto) return null;

  // 1. YouTube
  // Formatos: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtube.com/v/ID
  const youtubeWatchMatch = texto.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,15})/i);
  if (youtubeWatchMatch && youtubeWatchMatch[1]) {
    const id = youtubeWatchMatch[1];
    return {
      plataforma: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}`
    };
  }

  // 2. Vimeo
  // Formatos: vimeo.com/123456789, player.vimeo.com/video/123456789
  const vimeoMatch = texto.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      plataforma: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}`
    };
  }

  return null;
}
