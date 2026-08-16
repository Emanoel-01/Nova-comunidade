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
}
