const CHAVE_VISITANTE_ID = 'amorimtech_visitante_id';

/**
 * Obtém ou gera um UUID anônimo único para o visitante atual,
 * persistindo-o no localStorage do navegador.
 */
export function obterVisitanteId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '00000000-0000-0000-0000-000000000000';
  }
  try {
    let visitanteId = window.localStorage.getItem(CHAVE_VISITANTE_ID);
    if (!visitanteId) {
      visitanteId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
      window.localStorage.setItem(CHAVE_VISITANTE_ID, visitanteId);
    }
    return visitanteId;
  } catch {
    return '00000000-0000-0000-0000-000000000000';
  }
}
