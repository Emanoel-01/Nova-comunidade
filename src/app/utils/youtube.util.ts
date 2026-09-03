/**
 * Utilitário compartilhado para validação e extração de IDs de vídeo do
 * YouTube, no mesmo padrão de vimeo.util.ts.
 */

export function extrairYoutubeId(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const texto = valor.trim();

  // Caso 1: já é só o ID (11 caracteres alfanuméricos + - e _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(texto)) return texto;

  // Caso 2: link padrão youtube.com/watch?v=ID
  let match = texto.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Caso 3: link curto youtu.be/ID
  match = texto.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Caso 4: link de embed youtube.com/embed/ID
  match = texto.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
}

export function montarUrlPlayerYoutube(valor: string | null | undefined): string | null {
  const id = extrairYoutubeId(valor);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
}
