/**
 * Utilitário compartilhado para validação e extração de IDs de vídeo do Vimeo
 */

/**
 * Extrai o ID numérico de um vídeo do Vimeo a partir de qualquer formato comum
 * que o usuário possa colar: apenas o número, o link direto (vimeo.com/123456789),
 * ou um link de compartilhamento com parâmetros extras (vimeo.com/123456789?fl=pl&fe=sh).
 * Retorna null se não conseguir identificar um ID numérico válido.
 */
export function extrairVimeoId(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const texto = valor.trim();

  // Caso 1: já é só o número
  if (/^\d+$/.test(texto)) return texto;

  // Caso 2: link do Vimeo, com ou sem parâmetros extras
  const match = texto.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (match) return match[1];

  return null;
}

/**
 * Monta a URL do player embutido do Vimeo a partir de um ID ou link já
 * validado por extrairVimeoId. Retorna null se o ID for inválido, para que
 * o componente que chama possa decidir como tratar (placeholder, erro, etc.)
 * em vez de renderizar um iframe quebrado.
 */
export function montarUrlPlayerVimeo(valor: string | null | undefined): string | null {
  const id = extrairVimeoId(valor);
  if (!id) return null;
  return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&dnt=1`;
}
