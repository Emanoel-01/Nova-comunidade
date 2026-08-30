/**
 * Utilitário de detecção e formatação de URLs de embed para vídeos e posts (YouTube, Vimeo e Instagram) no Blog
 */

export interface VideoEmbedInfo {
  plataforma: 'youtube' | 'vimeo' | 'instagram';
  embedUrl: string; // vazio ou irrelevante para 'instagram'
  permalink?: string; // usado só para 'instagram' — a URL original do post, limpa
}

/**
 * Detecta se a URL fornecida é um link do YouTube, Vimeo ou Instagram e retorna os dados de embed.
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

  // 3. Instagram (posts, reels, tv)
  const instagramMatch = texto.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instagramMatch) {
    // normaliza para a URL canônica do post, sem parâmetros extras
    const path = texto.match(/instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+/i)?.[0];
    return {
      plataforma: 'instagram',
      embedUrl: '',
      permalink: `https://www.${path}/`
    };
  }

  return null;
}
