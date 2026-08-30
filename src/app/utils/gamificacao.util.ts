export interface RegraPontuacao {
  id: string;
  acao: string;
  descricao: string;
  pontos: number;
  pontosTexto: string;
  icone: string;
  trigger: string;
  emBreve?: boolean;
  categoria?: 'interacao' | 'conteudo' | 'aprendizado' | 'acesso';
}

/**
 * Tabela oficial e unificada de pontuação da Gamificação Business 4.0.
 * Reflete exatamente os triggers e funções ativas no banco de dados.
 */
export const REGRAS_PONTUACAO: readonly RegraPontuacao[] = [
  {
    id: 'seguir_membro',
    acao: 'Seguir membro',
    descricao: 'Conectar-se com outros profissionais na Rede de Membros',
    pontos: 2,
    pontosTexto: '+2 pts',
    icone: '🤝',
    trigger: 'trg_pontuar_seguir_membro',
    categoria: 'interacao'
  },
  {
    id: 'feed_post',
    acao: 'Post no Feed',
    descricao: 'Publicar análises, fotos de obra e estudos no feed',
    pontos: 10,
    pontosTexto: '+10 pts',
    icone: '📝',
    trigger: 'trg_pontuar_feed_post',
    categoria: 'conteudo'
  },
  {
    id: 'feed_comentario',
    acao: 'Comentário no Feed',
    descricao: 'Comentar e debater em publicações do feed',
    pontos: 5,
    pontosTexto: '+5 pts',
    icone: '💬',
    trigger: 'trg_pontuar_feed_comentario',
    categoria: 'interacao'
  },
  {
    id: 'feed_curtida_dada',
    acao: 'Curtida dada',
    descricao: 'Curtir postagens relevantes de outros membros',
    pontos: 1,
    pontosTexto: '+1 pt',
    icone: '👍',
    trigger: 'trg_pontuar_feed_curtida',
    categoria: 'interacao'
  },
  {
    id: 'feed_curtida_recebida',
    acao: 'Curtida recebida',
    descricao: 'Receber curtidas de outros membros em suas postagens',
    pontos: 2,
    pontosTexto: '+2 pts',
    icone: '❤️',
    trigger: 'trg_pontuar_feed_curtida',
    categoria: 'conteudo'
  },
  {
    id: 'forum_topico',
    acao: 'Tópico no Fórum',
    descricao: 'Criar novos tópicos de discussão e dúvidas periciais',
    pontos: 10,
    pontosTexto: '+10 pts',
    icone: '🗣️',
    trigger: 'trg_pontuar_forum_topico',
    categoria: 'conteudo'
  },
  {
    id: 'forum_resposta',
    acao: 'Resposta no Fórum',
    descricao: 'Responder a dúvidas técnicas da comunidade no fórum',
    pontos: 5,
    pontosTexto: '+5 pts',
    icone: '✍️',
    trigger: 'trg_pontuar_forum_resposta',
    categoria: 'interacao'
  },
  {
    id: 'material_download',
    acao: 'Download de material (1ª vez)',
    descricao: 'Baixar laudos, planilhas e check-lists técnicos',
    pontos: 3,
    pontosTexto: '+3 pts',
    icone: '📥',
    trigger: 'trg_pontuar_material_download',
    categoria: 'conteudo'
  },
  {
    id: 'curso_concluido',
    acao: 'Curso concluído (certificado emitido)',
    descricao: 'Concluir cursos técnicos com emissão de certificado oficial',
    pontos: 50,
    pontosTexto: '+50 pts',
    icone: '🎓',
    trigger: 'trg_pontuar_curso_concluido',
    categoria: 'aprendizado'
  },
  {
    id: 'evento_inscricao',
    acao: 'Inscrição em evento',
    descricao: 'Garantir vaga em webinars, imersões e workshops',
    pontos: 8,
    pontosTexto: '+8 pts',
    icone: '🎟️',
    trigger: 'trg_pontuar_evento_inscricao',
    categoria: 'aprendizado'
  },
  {
    id: 'acesso_diario',
    acao: 'Acesso diário (1x/dia)',
    descricao: 'Login diário e engajamento na plataforma',
    pontos: 10,
    pontosTexto: '+10 pts',
    icone: '📅',
    trigger: 'registrar_atividade_diaria',
    categoria: 'acesso'
  },
  {
    id: 'agente_ia',
    acao: 'Uso de Agente de IA',
    descricao: 'Utilizar os assistentes e ferramentas técnicas com IA',
    pontos: 5,
    pontosTexto: '+5 pts',
    icone: '🤖',
    trigger: 'registrar_atividade_diaria',
    categoria: 'acesso'
  },
  {
    id: 'leitura_artigo',
    acao: 'Ler artigo do blog',
    descricao: 'Leitura de artigos informativos no blog oficial',
    pontos: 0,
    pontosTexto: 'Em breve',
    icone: '📖',
    trigger: 'nenhum',
    emBreve: true,
    categoria: 'conteudo'
  }
];
