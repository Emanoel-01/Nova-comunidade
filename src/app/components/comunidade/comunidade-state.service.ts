import { Injectable, signal } from '@angular/core';

export interface FeedComentario {
  id: string;
  autor: string;
  cargo: string;
  avatar: string;
  tempo: string;
  texto: string;
}

export interface FeedPost {
  id: string;
  tipo: 'post' | 'evento' | 'vaga';
  autor: string;
  cargo: string;
  avatar: string;
  isCurrentUser?: boolean;
  tag?: string; // 'Dica técnica' | 'Conquista' | 'Foto' | 'Discussão'
  tempo: string;
  conteudo: string;
  curtidas: number;
  curtido: boolean;
  comentarios: FeedComentario[];
  evento?: {
    id: string;
    titulo: string;
    dataHora: string;
    palestrante: string;
    inscrito: boolean;
  };
  vaga?: {
    id: string;
    titulo: string;
    empresa: string;
    local: string;
    tipoContrato: 'CLT' | 'PJ' | 'Remoto' | 'Freelance' | 'Híbrido';
    candidatado: boolean;
  };
}

export interface VagaItem {
  id: string;
  titulo: string;
  empresa: string;
  localizacao: string;
  tipoContrato: 'CLT' | 'PJ' | 'Remoto' | 'Freelance' | 'Híbrido';
  remuneracao: string;
  publicadaEm: string;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
  candidatado: boolean;
}

export interface PerfilUsuario {
  nome: string;
  cargo: string;
  bio: string;
  formacao: string;
  instituicao: string;
  creaCau: string;
  especializacao: string;
  experiencia: string;
  skills: string[];
  linkedin: string;
  instagram: string;
  whatsapp: string;
  website: string;
}

// ---------------------------
// ÁREA 1: MATERIAIS
// ---------------------------
export type CategoriaMaterial = 'Todos' | 'Planilhas' | 'Modelos de Laudo' | 'Checklists' | 'E-books';

export interface MaterialItem {
  id: string;
  titulo: string;
  categoria: 'Planilhas' | 'Modelos de Laudo' | 'Checklists' | 'E-books';
  descricao: string;
  formato: string;
  tamanho: string;
  downloads: number;
  solicitado: boolean;
}

// ---------------------------
// ÁREA 2: EVENTOS
// ---------------------------
export interface EventoItem {
  id: string;
  titulo: string;
  tipo: 'futuro' | 'passado';
  tag: string;
  dataHora: string;
  dataBadge: { dia: string; mes: string };
  plataforma: string;
  palestrante: string;
  cargoPalestrante: string;
  descricao: string;
  inscritos: number;
  inscrito: boolean;
  gravacaoDisponivel?: boolean;
}

// ---------------------------
// ÁREA 3: FÓRUM
// ---------------------------
export type CategoriaForum =
  | 'Geral'
  | 'Engenharia Diagnóstica'
  | 'Gestão de Obras'
  | 'BIM'
  | 'Manutenção Predial'
  | 'Engenharia Legal'
  | 'Carreira'
  | 'Dúvidas';

export interface ForumResposta {
  id: string;
  autor: string;
  cargo: string;
  avatar: string;
  tempo: string;
  texto: string;
  curtidas: number;
  curtido: boolean;
}

export interface ForumTopico {
  id: string;
  titulo: string;
  categoria: CategoriaForum;
  autor: string;
  cargo: string;
  avatar: string;
  tempo: string;
  conteudo: string;
  curtidas: number;
  curtido: boolean;
  respostas: ForumResposta[];
}

// ---------------------------
// ÁREA 4: MENSAGENS / CHAT
// ---------------------------
export interface MensagemItem {
  id: string;
  remetente: 'eu' | 'contato';
  texto: string;
  horario: string;
}

export interface ConversaItem {
  id: string;
  nome: string;
  cargo: string;
  avatar: string;
  status: 'online' | 'ausente' | 'offline';
  naoLidas: number;
  ultimaMensagem: string;
  horario: string;
  mensagens: MensagemItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadeStateService {
  // Feed de posts
  readonly posts = signal<FeedPost[]>([
    {
      id: 'post-1',
      tipo: 'post',
      autor: 'Rafael Mendes',
      cargo: 'Engenheiro Diagnóstico • Perito Judicial',
      avatar: 'RM',
      tag: 'Dica técnica',
      tempo: 'Há 2 horas',
      conteudo: 'Ao realizar ensaios de esclerometria segundo a NBR 7584, sempre correlacione com ensaio de ultrassom (método Sonreb) para diminuir a dispersão dos resultados e obter a resistência à compressão real do concreto armado.',
      curtidas: 14,
      curtido: false,
      comentarios: [
        {
          id: 'c1',
          autor: 'Carlos Eduardo',
          cargo: 'Eng. Estrutural',
          avatar: 'CE',
          tempo: 'Há 1 hora',
          texto: 'Excelente lembrete, Rafael! A carbonatação superficial costuma superestimar o índice esclerométrico.'
        }
      ]
    },
    {
      id: 'post-2',
      tipo: 'evento',
      autor: 'Comunidade Nova Business',
      cargo: 'Canal Oficial de Eventos',
      avatar: 'NB',
      tag: 'Evento Ao Vivo',
      tempo: 'Publicado hoje',
      conteudo: 'Participe do nosso próximo webinar técnico ao vivo com emissão de certificado de participação para membros da comunidade!',
      curtidas: 28,
      curtido: false,
      comentarios: [],
      evento: {
        id: 'evt-1',
        titulo: 'Live: Diagnóstico de Fissuras e Manifestações Patológicas na Prática (NBR 16747)',
        dataHora: '28 de Outubro às 19:30 • Ao Vivo via Zoom',
        palestrante: 'Eng. Marcos Vinícius (Especialista em Recuperação Estrutural)',
        inscrito: false
      }
    },
    {
      id: 'post-3',
      tipo: 'post',
      autor: 'Beatriz Alencar',
      cargo: 'Arquiteta e Perita Avaliadora • IBAPE',
      avatar: 'BA',
      tag: 'Conquista',
      tempo: 'Há 5 horas',
      conteudo: 'Concluí hoje a vistoria cautelar de vizinhança de um empreendimento de 22 pavimentos usando o checklist padronizado da plataforma. Economia de mais de 4 horas na tabulação do laudo preliminar!',
      curtidas: 32,
      curtido: false,
      comentarios: [
        {
          id: 'c2',
          autor: 'Fernanda Lima',
          cargo: 'Engenheira Civil',
          avatar: 'FL',
          tempo: 'Há 3 horas',
          texto: 'Parabéns, Beatriz! A organização do relatório fotográfico faz toda a diferença.'
        }
      ]
    },
    {
      id: 'post-4',
      tipo: 'vaga',
      autor: 'Mural de Oportunidades',
      cargo: 'Conexão Profissional',
      avatar: 'MO',
      tag: 'Oportunidade',
      tempo: 'Ontem',
      conteudo: 'Nova oportunidade divulgada com prioridade para membros da comunidade:',
      curtidas: 19,
      curtido: false,
      comentarios: [],
      vaga: {
        id: 'vaga-feed-1',
        titulo: 'Engenheiro Fiscal de Obras e Laudos Técnicos',
        empresa: 'Construtora & Engenharia Vertente',
        local: 'Recife / PE (Modelo Híbrido)',
        tipoContrato: 'CLT',
        candidatado: false
      }
    }
  ]);

  // Vagas completas
  readonly vagas = signal<VagaItem[]>([
    {
      id: 'vaga-1',
      titulo: 'Engenheiro Fiscal de Obras e Laudos Técnicos',
      empresa: 'Construtora & Engenharia Vertente',
      localizacao: 'Recife / PE (Modelo Híbrido)',
      tipoContrato: 'CLT',
      remuneracao: 'R$ 8.500 — R$ 10.500 + Benefícios',
      publicadaEm: 'Publicada há 2 dias',
      descricao: 'Buscamos profissional com sólida experiência em fiscalização de obras verticais, elaboração de relatórios periódicos de conformidade, vistoria de entrega de chaves e interface técnica com projetistas.',
      requisitos: [
        'Graduação completa em Engenharia Civil com registro ativo no CREA',
        'Experiência mínima de 3 anos em fiscalização de obras prediais',
        'Domínio da NBR 5674 (Manutenção) e NBR 15575 (Desempenho)',
        'Habilidade na redação de relatórios técnicos e registros fotográficos'
      ],
      beneficios: [
        'Plano de Saúde e Odontológico Nacional',
        'Vale Refeição / Alimentação (R$ 42/dia)',
        'Auxílio Combustível / Transporte',
        'Seguro de Vida em Grupo'
      ],
      candidatado: false
    },
    {
      id: 'vaga-2',
      titulo: 'Perito Assistente Técnico para Ações Judiciais',
      empresa: 'Consórcio Pericial & Diagnóstico Brasil',
      localizacao: 'São Paulo / SP ou Remoto',
      tipoContrato: 'PJ',
      remuneracao: 'R$ 6.000 — R$ 12.000 por demanda pericial',
      publicadaEm: 'Publicada há 4 dias',
      descricao: 'Atuação em perícias judiciais imobiliárias, formulação de quesitos, acompanhamento de diligências periciais e elaboração de pareceres técnicos divergentes ou convergentes.',
      requisitos: [
        'Especialização ou pós-graduação em Engenharia Diagnóstica ou Perícias e Avaliações',
        'Cadastro ativo em tribunais ou experiência comprovada como perito judicial/assistente',
        'Conhecimento aprofundado das normas NBR 13752 e NBR 14653',
        'Disponibilidade para eventuais vistorias em campo'
      ],
      beneficios: [
        'Contratação PJ com flexibilidade total de horários',
        'Bônus por conclusão de laudos complexos',
        'Acesso irrestrito ao acervo jurisprudencial técnico da empresa'
      ],
      candidatado: false
    },
    {
      id: 'vaga-3',
      titulo: 'Coordenador de Manutenção Predial & Gestão de Ativos',
      empresa: 'Nexus Gestão Predial & Facilities',
      localizacao: 'Belo Horizonte / MG (Presencial)',
      tipoContrato: 'CLT',
      remuneracao: 'R$ 9.000 — R$ 11.500',
      publicadaEm: 'Publicada há 1 semana',
      descricao: 'Responsável pelo planejamento e execução dos Planos de Manutenção Preventiva e Corretiva (NBR 5674) em carteira de condomínios comerciais e residenciais de alto padrão.',
      requisitos: [
        'Formação em Engenharia Civil, Elétrica ou Mecânica',
        'Experiência em gestão de facilities ou manutenção predial preventiva',
        'Conhecimento em softwares de ordens de serviço e checklists digitais',
        'Capacidade de negociação e gestão de fornecedores terceirizados'
      ],
      beneficios: [
        'Plano de Saúde Unimed',
        'Vale Refeição e Transporte',
        'Programa de Participação nos Lucros e Resultados (PLR anual)',
        'Incentivo educacional para certificações técnicas'
      ],
      candidatado: false
    }
  ]);

  // Perfil do usuário logado em demonstração
  readonly perfil = signal<PerfilUsuario>({
    nome: 'Membro Demonstração',
    cargo: 'Visitante — Modo Prévia',
    bio: 'Profissional de engenharia diagnóstica e inspeção predial focado no aprimoramento de técnicas de laudos conforme as normas ABNT NBR 5674 e NBR 16747.',
    formacao: 'Engenharia Civil',
    instituicao: 'Universidade Federal de Pernambuco (UFPE)',
    creaCau: 'CREA-PE 123456/D',
    especializacao: 'Patologia das Construções e Perícias de Engenharia',
    experiencia: '7 anos na área da construção civil e vistorias',
    skills: [
      'Inspeção Predial NBR 16747',
      'Patologia do Concreto',
      'Vistoria Cautelar',
      'Esclerometria',
      'Termografia Infravermelha',
      'NBR 5674',
      'Elaboração de Laudos Periciais'
    ],
    linkedin: 'https://linkedin.com/in/membro-demonstracao',
    instagram: '@membro.engenharia',
    whatsapp: '+55 81 99999-0000',
    website: 'https://periciaseengenharia.com.br'
  });

  // -------------------------------------------------------------
  // ÁREA 1: MATERIAIS (Modelos, Planilhas, Checklists, E-books)
  // -------------------------------------------------------------
  readonly materiais = signal<MaterialItem[]>([
    {
      id: 'mat-1',
      titulo: 'Planilha de Composição de Custos — SINAPI & BDI Automatizado',
      categoria: 'Planilhas',
      descricao: 'Template pronto para cálculo de orçamentos analíticos com tabela de encargos sociais, fórmulas automatizadas de BDI e curva ABC de insumos.',
      formato: 'XLSX',
      tamanho: '2.4 MB',
      downloads: 412,
      solicitado: false
    },
    {
      id: 'mat-2',
      titulo: 'Modelo Completo de Laudo de Vistoria Cautelar de Vizinhança (NBR 12722)',
      categoria: 'Modelos de Laudo',
      descricao: 'Estrutura técnica padronizada com mapeamento prévio de anomalias, tabela de caracterização de danos e diretrizes para relatório fotográfico pericial.',
      formato: 'DOCX',
      tamanho: '1.8 MB',
      downloads: 538,
      solicitado: false
    },
    {
      id: 'mat-3',
      titulo: 'Checklist de Inspeção Predial Completa NBR 16747 com Matriz GUT',
      categoria: 'Checklists',
      descricao: 'Instrumento de campo para auditoria dos subsistemas prediais (estrutura, instalações, impermeabilização, fachadas) com priorização de criticidade.',
      formato: 'PDF & XLSX',
      tamanho: '980 KB',
      downloads: 624,
      solicitado: false
    },
    {
      id: 'mat-4',
      titulo: 'E-book: Guia Prático de Identificação de Patologias no Concreto Armado',
      categoria: 'E-books',
      descricao: 'Manual ilustrado contendo diagnóstico visual de corrosão de armaduras, lixiviação, fissuras por retração plástica e ataques por sulfatos.',
      formato: 'PDF',
      tamanho: '8.5 MB',
      downloads: 819,
      solicitado: false
    }
  ]);

  // -------------------------------------------------------------
  // ÁREA 2: EVENTOS (Futuros e Passados)
  // -------------------------------------------------------------
  readonly eventos = signal<EventoItem[]>([
    {
      id: 'evt-1',
      titulo: 'Webinar Técnico: Diagnóstico de Fissuras e Manifestações Patológicas na Prática (NBR 16747)',
      tipo: 'futuro',
      tag: 'Webinar Ao Vivo',
      dataHora: '28 de Outubro às 19:30',
      dataBadge: { dia: '28', mes: 'OUT' },
      plataforma: 'Transmissão Ao Vivo via Zoom • Com Certificado',
      palestrante: 'Eng. Marcos Vinícius',
      cargoPalestrante: 'Especialista em Recuperação Estrutural e Perícias',
      descricao: 'Abordagem prática com estudos de caso reais sobre inspeção predial, análise de fissuras térmicas versus estruturais e critérios para elaboração de parecer conclusivo.',
      inscritos: 142,
      inscrito: false
    },
    {
      id: 'evt-2',
      titulo: 'Masterclass: Formulação de Quesitos e Estratégia em Perícias Judiciais Imobiliárias',
      tipo: 'futuro',
      tag: 'Masterclass Exclusiva',
      dataHora: '12 de Novembro às 20:00',
      dataBadge: { dia: '12', mes: 'NOV' },
      plataforma: 'Transmissão Privada • Sala Interativa',
      palestrante: 'Dra. Juliana Vasconcelos',
      cargoPalestrante: 'Perita Judicial e Assistente Técnica',
      descricao: 'Como estruturar quesitos estratégicos que blindam a manifestação técnica do assistente e agregam valor real ao trabalho do advogado da causa.',
      inscritos: 89,
      inscrito: false
    },
    {
      id: 'evt-3',
      titulo: 'Workshop Gravado: Termografia Infravermelha Aplicada a Infiltrações Ocultas',
      tipo: 'passado',
      tag: 'Evento Realizado',
      dataHora: '15 de Setembro • Realizado com Sucesso',
      dataBadge: { dia: '15', mes: 'SET' },
      plataforma: 'Gravação Oficial da Sessão Técnica',
      palestrante: 'Eng. Roberto Albuquerque',
      cargoPalestrante: 'Certificado ITC Nível II em Termografia',
      descricao: 'Sessão prática demonstrando calibração de emissividade, interpretação de termogramas em fachadas e localização não-destrutiva de pontos de vazamento.',
      inscritos: 310,
      inscrito: false,
      gravacaoDisponivel: true
    }
  ]);

  // -------------------------------------------------------------
  // ÁREA 3: FÓRUM TÉCNICO (Tópicos e Respostas)
  // -------------------------------------------------------------
  readonly topicosForum = signal<ForumTopico[]>([
    {
      id: 'top-1',
      titulo: 'Critérios para classificação do nível de risco (Crítico x Regular) na NBR 16747',
      categoria: 'Engenharia Diagnóstica',
      autor: 'Rodrigo Neves',
      cargo: 'Eng. Civil Perito',
      avatar: 'RN',
      tempo: 'Há 3 horas',
      conteudo: 'Colegas, em um laudo de inspeção recente encontrei desplacamento pontual de revestimento de fachada em área de circulação de pedestres. Pela NBR 16747, vocês costumam enquadrar imediatamente como risco Crítico devido ao potencial de dano pessoal ou consideram a extensão do dano?',
      curtidas: 12,
      curtido: false,
      respostas: [
        {
          id: 'resp-1',
          autor: 'Camila Duarte',
          cargo: 'Engenheira de Manutenção',
          avatar: 'CD',
          tempo: 'Há 2 horas',
          texto: 'Com certeza risco Crítico, Rodrigo. Havendo risco à integridade física das pessoas (transeuntes), a norma orienta a prioridade máxima imediata, independentemente da área afetada.',
          curtidas: 5,
          curtido: false
        }
      ]
    },
    {
      id: 'top-2',
      titulo: 'Qual template ou rotina vocês recomendam para compatibilização de projetos em BIM?',
      categoria: 'BIM',
      autor: 'Camila Duarte',
      cargo: 'Coordenadora BIM / Projetos',
      avatar: 'CD',
      tempo: 'Há 1 dia',
      conteudo: 'Estamos estruturando a matriz de interferências (Clash Detection) para um edifício residencial com instalações hidrossanitárias complexas. Como vocês costumam documentar os relatórios para entrega ágil aos projetistas complementares?',
      curtidas: 8,
      curtido: false,
      respostas: [
        {
          id: 'resp-2',
          autor: 'Gabriel Silveira',
          cargo: 'Projetista BIM',
          avatar: 'GS',
          tempo: 'Há 18 horas',
          texto: 'Utilizamos o padrão BCF (BIM Collaboration Format). Dessa forma cada projetista abre os apontamentos diretamente dentro do seu software nativo com ponto de vista e coordenadas salvas.',
          curtidas: 4,
          curtido: false
        }
      ]
    },
    {
      id: 'top-3',
      titulo: 'Honorários periciais em ações renovatórias: Tabela IBAPE ou Arbitramento por horas técnicas?',
      categoria: 'Engenharia Legal',
      autor: 'André Siqueira',
      cargo: 'Perito Avaliador',
      avatar: 'AS',
      tempo: 'Há 2 dias',
      conteudo: 'Em processos na esfera estadual, qual metodologia tem tido melhor aceitação pelos juízes ao apresentar a proposta de honorários: fundamentação estrita pela tabela do IBAPE estadual ou demonstrativo detalhado de horas técnicas estimadas?',
      curtidas: 15,
      curtido: false,
      respostas: []
    }
  ]);

  // =============================================================
  // AÇÕES DO FEED
  // =============================================================
  adicionarPost(texto: string, tag: string = 'Dica técnica'): void {
    if (!texto.trim()) return;

    const novoPost: FeedPost = {
      id: 'post-' + Date.now(),
      tipo: 'post',
      autor: this.perfil().nome,
      cargo: this.perfil().cargo,
      avatar: 'M',
      isCurrentUser: true,
      tag: tag,
      tempo: 'Agora mesmo',
      conteudo: texto.trim(),
      curtidas: 0,
      curtido: false,
      comentarios: []
    };

    this.posts.update(lista => [novoPost, ...lista]);
  }

  toggleCurtir(postId: string): void {
    this.posts.update(lista =>
      lista.map(post => {
        if (post.id !== postId) return post;
        const novoCurtido = !post.curtido;
        return {
          ...post,
          curtido: novoCurtido,
          curtidas: novoCurtido ? post.curtidas + 1 : Math.max(0, post.curtidas - 1)
        };
      })
    );
  }

  adicionarComentario(postId: string, texto: string): void {
    if (!texto.trim()) return;

    const novoComentario: FeedComentario = {
      id: 'com-' + Date.now(),
      autor: this.perfil().nome,
      cargo: this.perfil().cargo,
      avatar: 'M',
      tempo: 'Agora mesmo',
      texto: texto.trim()
    };

    this.posts.update(lista =>
      lista.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comentarios: [...post.comentarios, novoComentario]
        };
      })
    );
  }

  toggleInscricaoEvento(postId: string): void {
    this.posts.update(lista =>
      lista.map(post => {
        if (post.id !== postId || !post.evento) return post;
        const novoStatus = !post.evento.inscrito;
        return {
          ...post,
          evento: {
            ...post.evento,
            inscrito: novoStatus
          }
        };
      })
    );
  }

  candidatarVagaFeed(postId: string): void {
    this.posts.update(lista =>
      lista.map(post => {
        if (post.id !== postId || !post.vaga) return post;
        return {
          ...post,
          vaga: {
            ...post.vaga,
            candidatado: true
          }
        };
      })
    );
  }

  // =============================================================
  // AÇÕES DE VAGAS
  // =============================================================
  candidatarVaga(vagaId: string): void {
    this.vagas.update(lista =>
      lista.map(v => (v.id === vagaId ? { ...v, candidatado: true } : v))
    );
  }

  // =============================================================
  // AÇÕES DE PERFIL
  // =============================================================
  salvarPerfil(dadosAtualizados: Partial<PerfilUsuario>): void {
    this.perfil.update(p => ({
      ...p,
      ...dadosAtualizados
    }));
  }

  adicionarSkill(skill: string): void {
    const limpa = skill.trim();
    if (!limpa) return;
    this.perfil.update(p => {
      if (p.skills.includes(limpa)) return p;
      return {
        ...p,
        skills: [...p.skills, limpa]
      };
    });
  }

  removerSkill(skill: string): void {
    this.perfil.update(p => ({
      ...p,
      skills: p.skills.filter(s => s !== skill)
    }));
  }

  // =============================================================
  // AÇÕES DE MATERIAIS
  // =============================================================
  solicitarMaterial(materialId: string): void {
    this.materiais.update(lista =>
      lista.map(m => {
        if (m.id !== materialId) return m;
        const novoStatus = !m.solicitado;
        return {
          ...m,
          solicitado: novoStatus,
          downloads: novoStatus ? m.downloads + 1 : Math.max(0, m.downloads - 1)
        };
      })
    );
  }

  // =============================================================
  // AÇÕES DE EVENTOS (Calendário)
  // =============================================================
  toggleInscricaoEventoCalendario(eventoId: string): void {
    this.eventos.update(lista =>
      lista.map(e => {
        if (e.id !== eventoId || e.tipo === 'passado') return e;
        const novoStatus = !e.inscrito;
        return {
          ...e,
          inscrito: novoStatus,
          inscritos: novoStatus ? e.inscritos + 1 : Math.max(0, e.inscritos - 1)
        };
      })
    );
  }

  // =============================================================
  // AÇÕES DO FÓRUM
  // =============================================================
  adicionarTopico(titulo: string, categoria: CategoriaForum, conteudo: string): void {
    if (!titulo.trim() || !conteudo.trim()) return;

    const novoTopico: ForumTopico = {
      id: 'top-' + Date.now(),
      titulo: titulo.trim(),
      categoria,
      autor: this.perfil().nome,
      cargo: this.perfil().cargo,
      avatar: 'M',
      tempo: 'Agora mesmo',
      conteudo: conteudo.trim(),
      curtidas: 0,
      curtido: false,
      respostas: []
    };

    this.topicosForum.update(lista => [novoTopico, ...lista]);
  }

  toggleCurtirTopico(topicoId: string): void {
    this.topicosForum.update(lista =>
      lista.map(top => {
        if (top.id !== topicoId) return top;
        const novoCurtido = !top.curtido;
        return {
          ...top,
          curtido: novoCurtido,
          curtidas: novoCurtido ? top.curtidas + 1 : Math.max(0, top.curtidas - 1)
        };
      })
    );
  }

  adicionarRespostaTopico(topicoId: string, texto: string): void {
    if (!texto.trim()) return;

    const novaResp: ForumResposta = {
      id: 'resp-' + Date.now(),
      autor: this.perfil().nome,
      cargo: this.perfil().cargo,
      avatar: 'M',
      tempo: 'Agora mesmo',
      texto: texto.trim(),
      curtidas: 0,
      curtido: false
    };

    this.topicosForum.update(lista =>
      lista.map(top => {
        if (top.id !== topicoId) return top;
        return {
          ...top,
          respostas: [...top.respostas, novaResp]
        };
      })
    );
  }

  toggleCurtirResposta(topicoId: string, respostaId: string): void {
    this.topicosForum.update(lista =>
      lista.map(top => {
        if (top.id !== topicoId) return top;
        return {
          ...top,
          respostas: top.respostas.map(r => {
            if (r.id !== respostaId) return r;
            const novoCurtido = !r.curtido;
            return {
              ...r,
              curtido: novoCurtido,
              curtidas: novoCurtido ? r.curtidas + 1 : Math.max(0, r.curtidas - 1)
            };
          })
        };
      })
    );
  }

  // -------------------------------------------------------------
  // ÁREA 4: MENSAGENS E CONVERSAS (Chat Privado em Demonstração)
  // -------------------------------------------------------------
  readonly conversas = signal<ConversaItem[]>([
    {
      id: 'conv-1',
      nome: 'Rafael Mendes',
      cargo: 'Eng. Diagnóstico • Perito Judicial',
      avatar: 'RM',
      status: 'online',
      naoLidas: 0,
      ultimaMensagem: 'Com certeza. Estou preparando um parecer técnico com esse novo formato.',
      horario: '14:32',
      mensagens: [
        {
          id: 'msg-1',
          remetente: 'contato',
          texto: 'Olá! Você viu a nova revisão da NBR 16747 sobre inspeção predial e a matriz GUT?',
          horario: '14:20'
        },
        {
          id: 'msg-2',
          remetente: 'eu',
          texto: 'Vi sim, Rafael! Achei que as matrizes de criticidade e gravidade ficaram bem mais diretas para apresentar ao síndico.',
          horario: '14:25'
        },
        {
          id: 'msg-3',
          remetente: 'contato',
          texto: 'Com certeza. Estou preparando um parecer técnico com esse novo formato.',
          horario: '14:32'
        }
      ]
    },
    {
      id: 'conv-2',
      nome: 'Camila Duarte',
      cargo: 'Coordenadora BIM / Projetos',
      avatar: 'CD',
      status: 'online',
      naoLidas: 2,
      ultimaMensagem: 'Você consegue me mandar o arquivo em BCF também quando puder?',
      horario: '11:05',
      mensagens: [
        {
          id: 'msg-4',
          remetente: 'contato',
          texto: 'Oi! Tudo bem? Você tem aquele modelo de checklist de compatibilização hidrossanitária?',
          horario: '10:15'
        },
        {
          id: 'msg-5',
          remetente: 'eu',
          texto: 'Tenho sim, Camila! Vou compartilhar com você o link aqui da biblioteca de materiais da plataforma.',
          horario: '10:40'
        },
        {
          id: 'msg-6',
          remetente: 'contato',
          texto: 'Perfeito! Muito obrigada pela ajuda.',
          horario: '11:02'
        },
        {
          id: 'msg-7',
          remetente: 'contato',
          texto: 'Você consegue me mandar o arquivo em BCF também quando puder?',
          horario: '11:05'
        }
      ]
    },
    {
      id: 'conv-3',
      nome: 'Rodrigo Neves',
      cargo: 'Eng. Civil Perito',
      avatar: 'RN',
      status: 'offline',
      naoLidas: 0,
      ultimaMensagem: 'O teste de percussão em 100% da área foi decisivo para o laudo.',
      horario: 'Ontem',
      mensagens: [
        {
          id: 'msg-8',
          remetente: 'contato',
          texto: 'Boa tarde! Sobre aquela dúvida no fórum a respeito de fachadas ventiladas, você chegou a verificar a NBR 13755?',
          horario: 'Ontem 16:45'
        },
        {
          id: 'msg-9',
          remetente: 'eu',
          texto: 'O teste de percussão em 100% da área foi decisivo para o laudo.',
          horario: 'Ontem 17:10'
        }
      ]
    }
  ]);

  // =============================================================
  // AÇÕES DE MENSAGENS
  // =============================================================
  enviarMensagem(conversaId: string, texto: string): void {
    const limpo = texto.trim();
    if (!limpo) return;

    const agora = new Date();
    const horaFormatada = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

    const novaMensagem: MensagemItem = {
      id: 'msg-' + Date.now(),
      remetente: 'eu',
      texto: limpo,
      horario: horaFormatada
    };

    this.conversas.update(lista =>
      lista.map(c => {
        if (c.id !== conversaId) return c;
        return {
          ...c,
          ultimaMensagem: limpo,
          horario: horaFormatada,
          mensagens: [...c.mensagens, novaMensagem]
        };
      })
    );
  }

  marcarConversaComoLida(conversaId: string): void {
    this.conversas.update(lista =>
      lista.map(c => (c.id === conversaId ? { ...c, naoLidas: 0 } : c))
    );
  }
}
