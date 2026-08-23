export type OrigemWhatsapp = 'home' | 'arquitetura' | 'tech' | 'tech-sindico' | 'academy' | 'contato' | 'footer' | 'links-bio';

const MENSAGENS: Record<OrigemWhatsapp, string> = {
  'home': 'Olá! Vim pelo site da AmorimTech e quero saber mais sobre os serviços de engenharia diagnóstica.',
  'arquitetura': 'Olá! Vim pela página da Amorim Arquitetura e gostaria de solicitar uma proposta.',
  'tech': 'Olá! Vim pela página da Amorim Tech e quero saber mais sobre o Predial 4.0.',
  'tech-sindico': 'Olá! Sou síndico(a) e gostaria de uma cotação para inspeção predial do meu edifício.',
  'academy': 'Olá! Vim pela página da Amorim Academy e quero saber mais sobre o Curso Predial 4.0.',
  'contato': 'Olá! Vim pelo site e quero falar com a equipe.',
  'footer': 'Olá! Vim pelo site da AmorimTech.',
  'links-bio': 'Olá! Vim pelo seu link na bio e quero saber mais.',
};

export function gerarLinkWhatsapp(origem: OrigemWhatsapp, numero: string = '5581991298803'): string {
  const texto = encodeURIComponent(MENSAGENS[origem]);
  return `https://wa.me/${numero}?text=${texto}`;
}
