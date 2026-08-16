import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl || 'https://placeholder.supabase.co', environment.supabaseAnonKey || 'placeholder-key');
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async signInWithPassword(email: string, password: string): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    return { error };
  }

  async resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/redefinir-senha` : undefined;
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    return { error };
  }

  async signInWithOtp(email: string): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.signInWithOtp({ email });
    return { error };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    return this.client.auth.onAuthStateChange((_event, session) => callback(session));
  }

  async getProfissional(userId: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('profissionais')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('Aviso ao buscar profissional no Supabase:', error.message || error);
        return null;
      }
      return data;
    } catch (e: any) {
      console.warn('Exceção ao buscar profissional no Supabase:', e?.message || e);
      return null;
    }
  }

  async criarSolicitacaoAcesso(dados: {
    nome: string;
    email: string;
    telefone?: string;
    tipoPerfil: string;
    motivo?: string;
  }): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('solicitacoes_acesso')
        .insert({
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone || null,
          tipo_perfil: dados.tipoPerfil,
          motivo: dados.motivo || null,
        });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarSolicitacoesAcesso(status?: 'pendente' | 'aprovado' | 'recusado'): Promise<any[]> {
    try {
      let query = this.client.from('solicitacoes_acesso').select('*').order('criado_em', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) {
        console.warn('Erro ao listar solicitações de acesso:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar solicitações de acesso:', e?.message || e);
      return [];
    }
  }

  async atualizarStatusSolicitacao(
    id: string,
    status: 'aprovado' | 'recusado',
    analisadoPor: string | null
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('solicitacoes_acesso')
        .update({ status, analisado_em: new Date().toISOString(), analisado_por: analisadoPor })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarProfissionaisComPermissoes(): Promise<any[]> {
    try {
      const { data: pessoas, error: erroPessoas } = await this.client
        .from('profissionais')
        .select('*')
        .order('full_name', { ascending: true });
      if (erroPessoas) {
        console.warn('Erro ao buscar profissionais:', erroPessoas.message);
        return [];
      }

      const { data: permissoes, error: erroPermissoes } = await this.client
        .from('permissoes_acesso')
        .select('*');
      if (erroPermissoes) {
        console.warn('Aviso ao buscar permissões_acesso:', erroPermissoes.message);
      }

      return (pessoas || []).map((p: any) => ({
        ...p,
        permissoes: (permissoes || []).filter((perm: any) => perm.profissional_id === p.id),
      }));
    } catch (e: any) {
      console.warn('Erro ao listar profissionais com permissões:', e?.message || e);
      return [];
    }
  }

  async upsertPermissao(permissao: {
    profissionalId: string;
    produto: 'predial4' | 'comunidade';
    modulo: string;
    liberado: boolean;
    validade?: string | null;
    nivelAcesso?: string | null;
  }): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('permissoes_acesso')
        .upsert({
          profissional_id: permissao.profissionalId,
          produto: permissao.produto,
          modulo: permissao.modulo,
          liberado: permissao.liberado,
          validade: permissao.validade || null,
          nivel_acesso: permissao.nivelAcesso || null,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'profissional_id,produto,modulo' });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async cadastrarProfissional(dados: {
    full_name: string;
    email: string;
    nivel_atual?: string;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client
        .from('profissionais')
        .insert({
          full_name: dados.full_name,
          email: dados.email,
          nivel_atual: dados.nivel_atual || 'Membro Trainee',
        })
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarNivelProfissional(
    id: string,
    nivelAtual: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('profissionais')
        .update({ nivel_atual: nivelAtual })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // MÉTODOS DO FEED REAL (feed_posts, feed_curtidas, feed_comentarios)
  // ----------------------------------------------------

  async listarFeedPosts(): Promise<any[]> {
    try {
      let { data: posts, error } = await this.client
        .from('feed_posts')
        .select('*, autor:profissionais!feed_posts_autor_id_fkey(id, full_name, professional_title)')
        .order('criado_em', { ascending: false })
        .limit(50);

      if (error) {
        // Fallback 1: sem FK constraint explícita
        const resFallback = await this.client
          .from('feed_posts')
          .select('*, autor:profissionais(id, full_name, professional_title)')
          .order('criado_em', { ascending: false })
          .limit(50);

        if (!resFallback.error && resFallback.data) {
          posts = resFallback.data;
          error = null;
        } else {
          // Fallback 2: busca direta e join manual com profissionais
          const resSimples = await this.client
            .from('feed_posts')
            .select('*')
            .order('criado_em', { ascending: false })
            .limit(50);

          if (!resSimples.error && resSimples.data) {
            const autorIds = [...new Set(resSimples.data.map((p: any) => p.autor_id).filter(Boolean))];
            const autoresMap: Record<string, any> = {};
            if (autorIds.length > 0) {
              const { data: autores } = await this.client
                .from('profissionais')
                .select('id, full_name, professional_title')
                .in('id', autorIds);
              (autores || []).forEach((a: any) => { autoresMap[a.id] = a; });
            }
            posts = resSimples.data.map((p: any) => ({
              ...p,
              autor: autoresMap[p.autor_id] || null
            }));
            error = null;
          } else {
            console.warn('Erro ao listar feed_posts:', error?.message || resFallback.error?.message);
            return [];
          }
        }
      }

      if (!posts || posts.length === 0) {
        return [];
      }

      const postIds = posts.map((p: any) => p.id);
      
      const { data: curtidas } = await this.client
        .from('feed_curtidas')
        .select('*')
        .in('post_id', postIds);

      let { data: comentarios } = await this.client
        .from('feed_comentarios')
        .select('*, autor:profissionais!feed_comentarios_autor_id_fkey(id, full_name, professional_title)')
        .in('post_id', postIds)
        .order('criado_em', { ascending: true });

      if (!comentarios) {
        const resComFallback = await this.client
          .from('feed_comentarios')
          .select('*, autor:profissionais(id, full_name, professional_title)')
          .in('post_id', postIds)
          .order('criado_em', { ascending: true });

        if (resComFallback.data) {
          comentarios = resComFallback.data;
        } else {
          const resComSimples = await this.client
            .from('feed_comentarios')
            .select('*')
            .in('post_id', postIds)
            .order('criado_em', { ascending: true });

          if (resComSimples.data) {
            const comAutorIds = [...new Set(resComSimples.data.map((c: any) => c.autor_id).filter(Boolean))];
            const comAutoresMap: Record<string, any> = {};
            if (comAutorIds.length > 0) {
              const { data: comAutores } = await this.client
                .from('profissionais')
                .select('id, full_name, professional_title')
                .in('id', comAutorIds);
              (comAutores || []).forEach((a: any) => { comAutoresMap[a.id] = a; });
            }
            comentarios = resComSimples.data.map((c: any) => ({
              ...c,
              autor: comAutoresMap[c.autor_id] || null
            }));
          }
        }
      }

      const session = await this.getSession();
      const meuId = session?.user?.id;

      return (posts || []).map((p: any) => {
        const curtidasDoPost = (curtidas || []).filter((c: any) => c.post_id === p.id);
        const comentariosDoPost = (comentarios || []).filter((c: any) => c.post_id === p.id);
        return {
          ...p,
          curtidas: curtidasDoPost,
          totalCurtidas: curtidasDoPost.length,
          curtidoPorMim: curtidasDoPost.some((c: any) => c.profissional_id === meuId),
          comentarios: comentariosDoPost,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar feed_posts:', e?.message || e);
      return [];
    }
  }

  async criarFeedPost(conteudo: string, tag?: string): Promise<{ data?: any; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { data, error } = await this.client
        .from('feed_posts')
        .insert({
          autor_id: session.user.id,
          conteudo,
          tag: tag || null,
          tipo: 'post'
        })
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async toggleCurtidaFeedPost(postId: string, curtidoAtualmente: boolean): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      if (curtidoAtualmente) {
        const { error } = await this.client
          .from('feed_curtidas')
          .delete()
          .eq('post_id', postId)
          .eq('profissional_id', session.user.id);
        return { error };
      } else {
        const { error } = await this.client
          .from('feed_curtidas')
          .insert({
            post_id: postId,
            profissional_id: session.user.id
          });
        return { error };
      }
    } catch (e: any) {
      return { error: e };
    }
  }

  async adicionarFeedComentario(postId: string, texto: string): Promise<{ data?: any; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { data, error } = await this.client
        .from('feed_comentarios')
        .insert({
          post_id: postId,
          autor_id: session.user.id,
          texto
        })
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // MÉTODOS DO PERFIL REAL (profissionais)
  // ----------------------------------------------------

  async obterMeuPerfilCompleto(): Promise<any | null> {
    try {
      const session = await this.getSession();
      if (!session?.user) return null;
      const { data, error } = await this.client
        .from('profissionais')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (error) {
        console.warn('Erro ao obter perfil:', error.message);
        return null;
      }
      return data;
    } catch (e: any) {
      console.warn('Exceção ao obter perfil:', e?.message || e);
      return null;
    }
  }

  async atualizarMeuPerfilCompleto(dados: {
    fullName?: string;
    professionalTitle?: string;
    bio?: string;
    formacao?: string;
    instituicao?: string;
    creaCau?: string;
    especializacao?: string;
    anosExperiencia?: string;
    skills?: string[];
    linkedinUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    websiteUrl?: string;
  }): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { error } = await this.client
        .from('profissionais')
        .update({
          full_name: dados.fullName,
          professional_title: dados.professionalTitle,
          bio: dados.bio,
          formacao: dados.formacao,
          instituicao: dados.instituicao,
          crea_cau: dados.creaCau,
          especializacao: dados.especializacao,
          anos_experiencia: dados.anosExperiencia,
          skills: dados.skills,
          linkedin_url: dados.linkedinUrl,
          instagram_url: dados.instagramUrl,
          whatsapp_url: dados.whatsappUrl,
          website_url: dados.websiteUrl,
        })
        .eq('id', session.user.id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async criarUsuarioAdminViaFunction(dados: {
    email: string;
    full_name: string;
    password?: string;
    nivel_atual?: string;
  }): Promise<{ data?: any; error: Error | null; senhaProvisoria?: string }> {
    try {
      const { data, error } = await this.client.functions.invoke('criar-usuario-admin', {
        body: dados,
      });
      if (error) {
        return { error };
      }
      if (data?.error) {
        return { error: new Error(data.error) };
      }
      return {
        data: data?.profissional || data?.user,
        senhaProvisoria: data?.senhaProvisoria,
        error: null,
      };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // PERMISSÕES DE ACESSO (MÓDULOS)
  // ----------------------------------------------------

  async temPermissaoModulo(produto: 'predial4' | 'comunidade', modulo: string): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session?.user) return false;
      const { data, error } = await this.client
        .from('permissoes_acesso')
        .select('id, validade')
        .eq('profissional_id', session.user.id)
        .eq('produto', produto)
        .eq('modulo', modulo)
        .eq('liberado', true)
        .limit(1);
      if (error || !data || data.length === 0) return false;
      const validade = data[0].validade;
      if (validade && new Date(validade) < new Date()) return false;
      return true;
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------
  // MURAL DE VAGAS REAL
  // ----------------------------------------------------

  async listarVagas(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('vagas')
        .select('*')
        .eq('ativa', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar vagas:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar vagas:', e?.message || e);
      return [];
    }
  }

  async candidatarVaga(vagaId: string, mensagem?: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { error } = await this.client
        .from('vagas_candidaturas')
        .insert({ vaga_id: vagaId, profissional_id: session.user.id, mensagem: mensagem || null });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async jaMeCandidatei(vagaId: string): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session?.user) return false;
      const { data } = await this.client
        .from('vagas_candidaturas')
        .select('id')
        .eq('vaga_id', vagaId)
        .eq('profissional_id', session.user.id)
        .limit(1);
      return !!(data && data.length > 0);
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------
  // ACERVO DE MATERIAIS REAL
  // ----------------------------------------------------

  async listarMateriais(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('materiais')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar materiais:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar materiais:', e?.message || e);
      return [];
    }
  }

  async solicitarDownloadMaterial(materialId: string): Promise<{ error: Error | null; urlArquivo?: string | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      const { error } = await this.client
        .from('materiais_downloads')
        .insert({ material_id: materialId, profissional_id: session.user.id });
      if (error) return { error };

      const { data } = await this.client
        .from('materiais')
        .select('url_arquivo')
        .eq('id', materialId)
        .maybeSingle();

      return { error: null, urlArquivo: data?.url_arquivo || null };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // CALENDÁRIO DE EVENTOS REAL
  // ----------------------------------------------------

  async listarEventos(): Promise<any[]> {
    try {
      const { data: eventos, error } = await this.client
        .from('eventos')
        .select('*')
        .order('data_hora', { ascending: true });
      if (error) {
        console.warn('Erro ao listar eventos:', error.message);
        return [];
      }

      const eventoIds = (eventos || []).map((e: any) => e.id);
      let inscricoes: any[] = [];
      if (eventoIds.length > 0) {
        const { data: inscricoesData } = await this.client
          .from('eventos_inscricoes')
          .select('*')
          .in('evento_id', eventoIds);
        inscricoes = inscricoesData || [];
      }

      const session = await this.getSession();
      const meuId = session?.user?.id;
      const agora = new Date();

      return (eventos || []).map((e: any) => {
        const inscricoesDoEvento = inscricoes.filter((i: any) => i.evento_id === e.id);
        return {
          ...e,
          tipo: new Date(e.data_hora) >= agora ? 'futuro' : 'passado',
          inscritos: inscricoesDoEvento.length,
          inscrito: inscricoesDoEvento.some((i: any) => i.profissional_id === meuId),
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar eventos:', e?.message || e);
      return [];
    }
  }

  async toggleInscricaoEvento(eventoId: string, inscritoAtualmente: boolean): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      if (inscritoAtualmente) {
        const { error } = await this.client
          .from('eventos_inscricoes')
          .delete()
          .eq('evento_id', eventoId)
          .eq('profissional_id', session.user.id);
        return { error };
      } else {
        const { error } = await this.client
          .from('eventos_inscricoes')
          .insert({ evento_id: eventoId, profissional_id: session.user.id });
        return { error };
      }
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // FÓRUM TÉCNICO REAL
  // ----------------------------------------------------

  async listarForumTopicos(): Promise<any[]> {
    try {
      let topicos: any[] | null = null;
      const res = await this.client
        .from('forum_topicos')
        .select('*, autor:profissionais!forum_topicos_autor_id_fkey(id, full_name, professional_title)')
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) {
        topicos = res.data;
      } else {
        const resFallback = await this.client
          .from('forum_topicos')
          .select('*, autor:profissionais(id, full_name, professional_title)')
          .order('criado_em', { ascending: false });

        if (!resFallback.error && resFallback.data) {
          topicos = resFallback.data;
        } else {
          const resSimples = await this.client
            .from('forum_topicos')
            .select('*')
            .order('criado_em', { ascending: false });

          if (!resSimples.error && resSimples.data) {
            const autorIds = [...new Set(resSimples.data.map((t: any) => t.autor_id).filter(Boolean))];
            const autoresMap: Record<string, any> = {};
            if (autorIds.length > 0) {
              const { data: autores } = await this.client
                .from('profissionais')
                .select('id, full_name, professional_title')
                .in('id', autorIds);
              (autores || []).forEach((a: any) => { autoresMap[a.id] = a; });
            }
            topicos = resSimples.data.map((t: any) => ({
              ...t,
              autor: autoresMap[t.autor_id] || null
            }));
          } else {
            console.warn('Erro ao listar tópicos do fórum:', res.error?.message || resFallback.error?.message);
            return [];
          }
        }
      }

      if (!topicos || topicos.length === 0) {
        return [];
      }

      const topicoIds = topicos.map((t: any) => t.id);

      let respostas: any[] = [];
      const resResp = await this.client
        .from('forum_respostas')
        .select('*, autor:profissionais!forum_respostas_autor_id_fkey(id, full_name, professional_title)')
        .in('topico_id', topicoIds)
        .order('criado_em', { ascending: true });

      if (!resResp.error && resResp.data) {
        respostas = resResp.data;
      } else {
        const resRespFallback = await this.client
          .from('forum_respostas')
          .select('*, autor:profissionais(id, full_name, professional_title)')
          .in('topico_id', topicoIds)
          .order('criado_em', { ascending: true });

        if (!resRespFallback.error && resRespFallback.data) {
          respostas = resRespFallback.data;
        } else {
          const resRespSimples = await this.client
            .from('forum_respostas')
            .select('*')
            .in('topico_id', topicoIds)
            .order('criado_em', { ascending: true });

          if (resRespSimples.data) {
            const respAutorIds = [...new Set(resRespSimples.data.map((r: any) => r.autor_id).filter(Boolean))];
            const respAutoresMap: Record<string, any> = {};
            if (respAutorIds.length > 0) {
              const { data: respAutores } = await this.client
                .from('profissionais')
                .select('id, full_name, professional_title')
                .in('id', respAutorIds);
              (respAutores || []).forEach((a: any) => { respAutoresMap[a.id] = a; });
            }
            respostas = resRespSimples.data.map((r: any) => ({
              ...r,
              autor: respAutoresMap[r.autor_id] || null
            }));
          }
        }
      }

      const { data: curtidasTopicos } = await this.client
        .from('forum_curtidas')
        .select('*')
        .eq('alvo_tipo', 'topico')
        .in('alvo_id', topicoIds);

      const respostaIds = respostas.map((r: any) => r.id);
      const { data: curtidasRespostas } = respostaIds.length > 0
        ? await this.client.from('forum_curtidas').select('*').eq('alvo_tipo', 'resposta').in('alvo_id', respostaIds)
        : { data: [] };

      const session = await this.getSession();
      const meuId = session?.user?.id;

      return topicos.map((t: any) => {
        const curtidasDoTopico = (curtidasTopicos || []).filter((c: any) => c.alvo_id === t.id);
        const respostasDoTopico = (respostas || [])
          .filter((r: any) => r.topico_id === t.id)
          .map((r: any) => {
            const curtidasDaResposta = (curtidasRespostas || []).filter((c: any) => c.alvo_id === r.id);
            return {
              ...r,
              curtidas: curtidasDaResposta.length,
              curtidoPorMim: curtidasDaResposta.some((c: any) => c.profissional_id === meuId),
            };
          });
        return {
          ...t,
          curtidas: curtidasDoTopico.length,
          curtidoPorMim: curtidasDoTopico.some((c: any) => c.profissional_id === meuId),
          respostas: respostasDoTopico,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar tópicos do fórum:', e?.message || e);
      return [];
    }
  }

  async criarForumTopico(titulo: string, categoria: string, conteudo: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { error } = await this.client
        .from('forum_topicos')
        .insert({ autor_id: session.user.id, titulo, categoria, conteudo });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async adicionarForumResposta(topicoId: string, texto: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { error } = await this.client
        .from('forum_respostas')
        .insert({ topico_id: topicoId, autor_id: session.user.id, texto });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async toggleForumCurtida(
    alvoTipo: 'topico' | 'resposta',
    alvoId: string,
    curtidoAtualmente: boolean
  ): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      if (curtidoAtualmente) {
        const { error } = await this.client
          .from('forum_curtidas')
          .delete()
          .eq('alvo_tipo', alvoTipo)
          .eq('alvo_id', alvoId)
          .eq('profissional_id', session.user.id);
        return { error };
      } else {
        const { error } = await this.client
          .from('forum_curtidas')
          .insert({ alvo_tipo: alvoTipo, alvo_id: alvoId, profissional_id: session.user.id });
        return { error };
      }
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // MENSAGENS PRIVADAS REAL
  // ----------------------------------------------------

  async listarMinhasConversas(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];
      const meuId = session.user.id;

      const { data: conversas, error } = await this.client
        .from('conversas')
        .select('*')
        .or(`participante_1.eq.${meuId},participante_2.eq.${meuId}`);
      if (error) { console.warn('Erro ao listar conversas:', error.message); return []; }

      const conversaIds = (conversas || []).map((c: any) => c.id);
      const outroParticipanteIds = (conversas || []).map((c: any) =>
        c.participante_1 === meuId ? c.participante_2 : c.participante_1
      );

      const { data: participantes } = outroParticipanteIds.length > 0
        ? await this.client.from('profissionais').select('id, full_name, professional_title').in('id', outroParticipanteIds)
        : { data: [] };

      const { data: ultimasMensagens } = conversaIds.length > 0
        ? await this.client.from('mensagens').select('*').in('conversa_id', conversaIds).order('criado_em', { ascending: false })
        : { data: [] };

      return (conversas || []).map((c: any) => {
        const outroId = c.participante_1 === meuId ? c.participante_2 : c.participante_1;
        const participante = (participantes || []).find((p: any) => p.id === outroId);
        const mensagensDaConversa = (ultimasMensagens || []).filter((m: any) => m.conversa_id === c.id);
        const naoLidas = mensagensDaConversa.filter((m: any) => !m.lida && m.remetente_id !== meuId).length;
        const ultimaMsg = mensagensDaConversa[0];
        return {
          ...c,
          outroId,
          nome: participante?.full_name || 'Membro da Comunidade',
          cargo: participante?.professional_title || '',
          ultimaMensagem: ultimaMsg?.texto || '',
          ultimaMensagemEm: ultimaMsg?.criado_em || c.criado_em,
          naoLidas,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar conversas:', e?.message || e);
      return [];
    }
  }

  async listarMensagensDaConversa(conversaId: string): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('criado_em', { ascending: true });
      if (error) { console.warn('Erro ao listar mensagens:', error.message); return []; }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar mensagens:', e?.message || e);
      return [];
    }
  }

  async enviarMensagem(conversaId: string, texto: string): Promise<{ error: Error | null; data?: any }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { data, error } = await this.client
        .from('mensagens')
        .insert({ conversa_id: conversaId, remetente_id: session.user.id, texto })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async marcarMensagensComoLidas(conversaId: string): Promise<void> {
    try {
      const session = await this.getSession();
      if (!session?.user) return;
      await this.client
        .from('mensagens')
        .update({ lida: true })
        .eq('conversa_id', conversaId)
        .neq('remetente_id', session.user.id)
        .eq('lida', false);
    } catch {
      // silencioso — marcar como lida não é crítico o suficiente para travar a UI
    }
  }
}

