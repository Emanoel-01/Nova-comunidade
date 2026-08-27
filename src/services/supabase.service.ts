import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { gerarCodigoVerificacaoCertificado } from '../app/services/certificado-pdf.service';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public readonly client: SupabaseClient;

  private authCallbacks: Array<(session: Session | null) => void> = [];

  constructor() {
    this.client = createClient(
      environment.supabaseUrl || 'https://qtrypzzcjebvfcihiynt.supabase.co',
      environment.supabaseAnonKey || 'placeholder-key'
    );
  }

  isConfigurado(): boolean {
    return (
      !!environment.supabaseUrl &&
      environment.supabaseUrl !== 'https://placeholder.supabase.co' &&
      !!environment.supabaseAnonKey &&
      environment.supabaseAnonKey !== 'placeholder-key' &&
      environment.supabaseAnonKey !== ''
    );
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data } = await this.client.auth.getSession();
      if (data?.session) {
        return data.session;
      }
    } catch (err) {
      console.warn('Aviso ao buscar sessão Supabase:', err);
    }
    return null;
  }

  async signInWithPassword(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.auth.signInWithPassword({ email, password });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
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
    try {
      await this.client.auth.signOut();
    } catch {}
    this.authCallbacks.forEach((cb) => {
      try {
        cb(null);
      } catch {}
    });
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    this.authCallbacks.push(callback);
    const sub = this.client.auth.onAuthStateChange((_event, session) => callback(session));
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.authCallbacks = this.authCallbacks.filter((cb) => cb !== callback);
            sub?.data?.subscription?.unsubscribe?.();
          },
        },
      },
    };
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

  async buscarProfissionalPorEmail(email: string): Promise<any | null> {
    try {
      const emailNormalizado = (email || '').trim().toLowerCase();
      if (!emailNormalizado) return null;
      const { data, error } = await this.client
        .from('profissionais')
        .select('*')
        .ilike('email', emailNormalizado)
        .maybeSingle();
      if (error) {
        console.warn('Aviso ao buscar profissional por e-mail no Supabase:', error.message || error);
        return null;
      }
      return data;
    } catch (e: any) {
      console.warn('Exceção ao buscar profissional por e-mail:', e?.message || e);
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
    licenca_tipo?: string | null;
    licenca_validade?: string | null;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client
        .from('profissionais')
        .insert({
          full_name: dados.full_name,
          email: dados.email,
          nivel_atual: dados.nivel_atual || 'Membro Trainee',
          ...(dados.licenca_tipo ? { licenca_tipo: dados.licenca_tipo } : {}),
          ...(dados.licenca_validade ? { licenca_validade: dados.licenca_validade } : {}),
        })
        .select()
        .single();

      if (error || !data) return { data, error };

      // Base automática: todo membro aprovado já recebe estes 4 módulos da Comunidade
      const MODULOS_BASE = ['forum', 'vagas', 'materiais', 'eventos'];
      const permissoesBase = MODULOS_BASE.map(modulo => ({
        profissional_id: data.id,
        produto: 'comunidade' as const,
        modulo,
        liberado: true,
      }));

      const { error: erroPermissoes } = await this.client
        .from('permissoes_acesso')
        .insert(permissoesBase);

      if (erroPermissoes) {
        console.warn('Profissional criado, mas houve erro ao liberar a base de módulos automática:', erroPermissoes.message);
        // Não falhar o cadastro inteiro por causa disso — o profissional já existe e aparece
        // em Gestão de Usuários; o admin pode liberar manualmente se a base automática falhar.
      }

      return { data, error: null };
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
        body: {
          email: dados.email,
          full_name: dados.full_name,
          ...(dados.password ? { password: dados.password } : {}),
          ...(dados.nivel_atual ? { nivel_atual: dados.nivel_atual } : {}),
        },
      });

      if (error) {
        let msg = error.message || 'Erro ao invocar função criar-usuario-admin';
        if (data?.error) {
          msg = data.error;
        }
        return { error: new Error(msg) };
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
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async criarContaViaEdgeFunction(dados: {
    email: string;
    full_name: string;
    password?: string;
    nivel_atual?: string;
  }): Promise<{ data?: any; error: Error | null; senhaProvisoria?: string }> {
    return this.criarUsuarioAdminViaFunction(dados);
  }

  async atualizarProfissionalAdmin(
    id: string,
    dados: {
      nivel_atual?: string;
      licenca_tipo?: string | null;
      licenca_validade?: string | null;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const updatePayload: Record<string, any> = {};
      if (dados.nivel_atual !== undefined) updatePayload.nivel_atual = dados.nivel_atual;
      if (dados.licenca_tipo !== undefined) updatePayload.licenca_tipo = dados.licenca_tipo;
      if (dados.licenca_validade !== undefined) updatePayload.licenca_validade = dados.licenca_validade;

      const { error } = await this.client
        .from('profissionais')
        .update(updatePayload)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarNivelProfissional(
    id: string,
    nivelAtual: string
  ): Promise<{ error: Error | null }> {
    return this.atualizarProfissionalAdmin(id, { nivel_atual: nivelAtual });
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

  async criarLeadSindico(dados: {
    nome: string;
    telefone: string;
    email: string;
    condominio?: string;
    nome_condominio?: string;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const valorCondominio = dados.nome_condominio?.trim() || dados.condominio?.trim() || null;
      const { data, error } = await this.client
        .from('alo_sindico_leads')
        .insert({
          nome: dados.nome.trim(),
          telefone: dados.telefone.trim(),
          email: dados.email.trim().toLowerCase(),
          nome_condominio: valorCondominio,
          status: 'novo',
        })
        .select('*')
        .single();
      if (error) return { error };
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async enviarMensagemAloSindico(
    leadId: string,
    historico: Array<{ role: string; parts: { text: string }[] }>
  ): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client.functions.invoke('diagnostico-ia', {
        body: { operation: 'chat-sindico', historico, leadId },
      });
      if (error) return { error };
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarLeadsSindico(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('alo_sindico_leads')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        // Tenta fallback com created_at caso o banco use nomenclatura padrão
        const { data: dataFallback, error: errorFallback } = await this.client
          .from('alo_sindico_leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (errorFallback) {
          console.warn('Aviso ao listar leads Alô Síndico:', error.message || error);
          return [];
        }
        return dataFallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar leads Alô Síndico:', e?.message || e);
      return [];
    }
  }

  async obterMensagensLeadSindico(leadId: string): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('alo_sindico_mensagens')
        .select('*')
        .eq('lead_id', leadId)
        .order('criado_em', { ascending: true });
      if (error) {
        const { data: dataFallback, error: errorFallback } = await this.client
          .from('alo_sindico_mensagens')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: true });
        if (errorFallback) {
          console.warn('Aviso ao obter mensagens do lead:', error.message || error);
          return [];
        }
        return dataFallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao obter mensagens do lead:', e?.message || e);
      return [];
    }
  }

  async atualizarStatusLeadSindico(
    leadId: string,
    status: 'novo' | 'em_atendimento' | 'concluido' | 'descartado'
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('alo_sindico_leads')
        .update({ status })
        .eq('id', leadId);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async contarLeadsSindicoNovos(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('alo_sindico_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'novo');
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }

  // ----------------------------------------------------
  // EVENTOS & WEBINARS (BLOCO 3)
  // ----------------------------------------------------

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
    } catch (e) {
      console.warn('Erro ao verificar permissão de módulo:', e);
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

  async listarTodasVagas(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('vagas')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar todas as vagas (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar todas as vagas (admin):', e?.message || e);
      return [];
    }
  }

  async criarVaga(vaga: {
    titulo: string;
    empresa?: string;
    descricao: string;
    localizacao?: string;
    tipo_contrato?: string;
    remuneracao?: string;
    requisitos?: string;
    beneficios?: string;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const payload: any = {
        titulo: vaga.titulo,
        empresa: vaga.empresa || '',
        descricao: vaga.descricao || '',
        localizacao: vaga.localizacao || '',
        tipo_contrato: vaga.tipo_contrato || 'CLT',
        ativa: true
      };
      if (vaga.remuneracao !== undefined) payload.remuneracao = vaga.remuneracao;
      if (vaga.requisitos !== undefined) payload.requisitos = vaga.requisitos;
      if (vaga.beneficios !== undefined) payload.beneficios = vaga.beneficios;

      const { data, error } = await this.client.from('vagas').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarVaga(
    id: string,
    dados: Partial<{
      titulo: string;
      empresa: string;
      descricao: string;
      localizacao: string;
      tipo_contrato: string;
      remuneracao: string;
      requisitos: string;
      beneficios: string;
      ativa: boolean;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('vagas').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirVaga(id: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('vagas_candidaturas').delete().eq('vaga_id', id);
      const { error } = await this.client.from('vagas').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarCandidaturasDaVaga(vagaId: string): Promise<any[]> {
    try {
      const res = await this.client
        .from('vagas_candidaturas')
        .select('*, candidato:profissionais!vagas_candidaturas_profissional_id_fkey(id, full_name, professional_title, email)')
        .eq('vaga_id', vagaId)
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) {
        return res.data;
      }

      const resFallback = await this.client
        .from('vagas_candidaturas')
        .select('*, candidato:profissionais(id, full_name, professional_title, email)')
        .eq('vaga_id', vagaId)
        .order('criado_em', { ascending: false });

      if (!resFallback.error && resFallback.data) {
        return resFallback.data;
      }

      const resSimples = await this.client
        .from('vagas_candidaturas')
        .select('*')
        .eq('vaga_id', vagaId)
        .order('criado_em', { ascending: false });

      if (resSimples.data) {
        const candidatoIds = [...new Set(resSimples.data.map((c: any) => c.profissional_id).filter(Boolean))];
        const candidatosMap: Record<string, any> = {};
        if (candidatoIds.length > 0) {
          const { data: profs } = await this.client
            .from('profissionais')
            .select('id, full_name, professional_title, email')
            .in('id', candidatoIds);
          (profs || []).forEach((p: any) => { candidatosMap[p.id] = p; });
        }
        return resSimples.data.map((c: any) => ({
          ...c,
          candidato: candidatosMap[c.profissional_id] || null
        }));
      }

      return [];
    } catch (e: any) {
      console.warn('Exceção ao listar candidaturas:', e?.message || e);
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

  async listarTodosMateriais(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('materiais')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar todos os materiais (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar todos os materiais (admin):', e?.message || e);
      return [];
    }
  }

  async criarMaterial(material: {
    titulo: string;
    descricao?: string;
    categoria: string;
    formato?: string;
    tamanho?: string;
    url_arquivo?: string;
    ativo?: boolean;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const payload: any = {
        titulo: material.titulo,
        descricao: material.descricao || '',
        categoria: material.categoria,
        formato: material.formato || 'PDF',
        tamanho: material.tamanho || 'Arquivo',
        url_arquivo: material.url_arquivo || '',
        ativo: material.ativo !== undefined ? material.ativo : true,
      };
      const { data, error } = await this.client.from('materiais').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarMaterial(
    id: string,
    dados: Partial<{
      titulo: string;
      descricao: string;
      categoria: string;
      formato: string;
      tamanho: string;
      url_arquivo: string;
      ativo: boolean;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('materiais').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirMaterial(id: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('materiais_downloads').delete().eq('material_id', id);
      const { error } = await this.client.from('materiais').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async contarDownloadsDoMaterial(materialId: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('materiais_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('material_id', materialId);
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }

  async registrarDownloadMaterial(materialId: string): Promise<{ error: Error | null; urlArquivo?: string | null }> {
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

  async uploadArquivoMaterial(
    file: File,
    categoria: string = 'Geral'
  ): Promise<{ error: Error | null; signedUrl?: string | null; path?: string; formato?: string; tamanho?: string }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Limite de 20 MB (20 * 1024 * 1024)
      const maxBytes = 20 * 1024 * 1024;
      if (file.size > maxBytes) {
        return { error: new Error('O arquivo excede o limite máximo permitido de 20 MB.') };
      }

      // Sanitiza slug da categoria e nome do arquivo
      const catSlug = (categoria || 'geral')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-');

      const cleanName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const path = `${catSlug}/${Date.now()}_${cleanName}`;

      // Upload para o bucket materiais-comunidade
      const { error: uploadError } = await this.client.storage
        .from('materiais-comunidade')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { error: uploadError };
      }

      // Gera signed URL de longa duração (10 anos = 315360000s)
      const { data: signedData, error: signedError } = await this.client.storage
        .from('materiais-comunidade')
        .createSignedUrl(path, 315360000);

      if (signedError) {
        return { error: signedError, path };
      }

      // Detecta formato a partir da extensão
      const ext = file.name.split('.').pop()?.toUpperCase() || 'ARQUIVO';

      // Formata tamanho em KB ou MB
      let tamanhoStr = '';
      if (file.size >= 1024 * 1024) {
        tamanhoStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      } else {
        tamanhoStr = Math.round(file.size / 1024) + ' KB';
      }

      return {
        error: null,
        signedUrl: signedData?.signedUrl || null,
        path,
        formato: ext,
        tamanho: tamanhoStr
      };
    } catch (err: any) {
      return { error: err };
    }
  }

  async solicitarDownloadMaterial(materialId: string): Promise<{ error: Error | null; urlArquivo?: string | null }> {
    return this.registrarDownloadMaterial(materialId);
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

  async listarTodosEventosAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('eventos')
        .select('*')
        .order('data_hora', { ascending: false });
      if (error) {
        console.warn('Erro ao listar eventos (admin):', error.message);
        return [];
      }

      const eventoIds = (data || []).map((e: any) => e.id);
      let inscricoes: any[] = [];
      if (eventoIds.length > 0) {
        const { data: inscricoesData } = await this.client
          .from('eventos_inscricoes')
          .select('*')
          .in('evento_id', eventoIds);
        inscricoes = inscricoesData || [];
      }

      return (data || []).map((e: any) => ({
        ...e,
        total_inscritos: inscricoes.filter((i: any) => i.evento_id === e.id).length,
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar eventos (admin):', e?.message || e);
      return [];
    }
  }

  async criarEvento(evento: {
    titulo: string;
    descricao?: string;
    data_hora: string;
    tag?: string;
    plataforma?: string;
    palestrante?: string;
    cargo_palestrante?: string;
    link_transmissao?: string;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const payload: any = {
        titulo: evento.titulo,
        data_hora: evento.data_hora,
      };
      if (evento.descricao !== undefined) payload.descricao = evento.descricao;
      if (evento.tag !== undefined) payload.tag = evento.tag;
      if (evento.plataforma !== undefined) payload.plataforma = evento.plataforma;
      if (evento.palestrante !== undefined) payload.palestrante = evento.palestrante;
      if (evento.cargo_palestrante !== undefined) payload.cargo_palestrante = evento.cargo_palestrante;
      if (evento.link_transmissao !== undefined) payload.link_transmissao = evento.link_transmissao;

      const { data, error } = await this.client.from('eventos').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarEvento(
    id: string,
    dados: Partial<{
      titulo: string;
      descricao: string;
      data_hora: string;
      tag: string;
      plataforma: string;
      palestrante: string;
      cargo_palestrante: string;
      link_transmissao: string;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('eventos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirEvento(id: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('eventos_inscricoes').delete().eq('evento_id', id);
      const { error } = await this.client.from('eventos').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarInscritosDoEvento(eventoId: string): Promise<any[]> {
    try {
      const res = await this.client
        .from('eventos_inscricoes')
        .select('*, inscrito:profissionais!eventos_inscricoes_profissional_id_fkey(id, full_name, professional_title, email)')
        .eq('evento_id', eventoId);

      if (!res.error && res.data) {
        return res.data;
      }

      const resFallback = await this.client
        .from('eventos_inscricoes')
        .select('*, inscrito:profissionais(id, full_name, professional_title, email)')
        .eq('evento_id', eventoId);

      if (!resFallback.error && resFallback.data) {
        return resFallback.data;
      }

      // Fallback manual se join falhar
      const { data: inscricoes } = await this.client
        .from('eventos_inscricoes')
        .select('*')
        .eq('evento_id', eventoId);

      if (!inscricoes || inscricoes.length === 0) return [];
      const profIds = inscricoes.map((i: any) => i.profissional_id).filter(Boolean);
      let profsMap: Record<string, any> = {};
      if (profIds.length > 0) {
        const { data: profs } = await this.client
          .from('profissionais')
          .select('id, full_name, professional_title, email')
          .in('id', profIds);
        (profs || []).forEach((p: any) => { profsMap[p.id] = p; });
      }

      return inscricoes.map((i: any) => ({
        ...i,
        inscrito: profsMap[i.profissional_id] || null,
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar inscritos do evento:', e?.message || e);
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

  async listarTodosTopicosForum(): Promise<any[]> {
    try {
      let topicos: any[] | null = null;
      const res = await this.client
        .from('forum_topicos')
        .select('*, autor:profissionais!forum_topicos_autor_id_fkey(id, full_name, professional_title, email)')
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) {
        topicos = res.data;
      } else {
        const resFallback = await this.client
          .from('forum_topicos')
          .select('*, autor:profissionais(id, full_name, professional_title, email)')
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
                .select('id, full_name, professional_title, email')
                .in('id', autorIds);
              (autores || []).forEach((a: any) => { autoresMap[a.id] = a; });
            }
            topicos = resSimples.data.map((t: any) => ({
              ...t,
              autor: autoresMap[t.autor_id] || null
            }));
          } else {
            console.warn('Erro ao listar tópicos do fórum (admin):', res.error?.message || resFallback.error?.message);
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
        .select('*, autor:profissionais!forum_respostas_autor_id_fkey(id, full_name, professional_title, email)')
        .in('topico_id', topicoIds)
        .order('criado_em', { ascending: true });

      if (!resResp.error && resResp.data) {
        respostas = resResp.data;
      } else {
        const resRespFallback = await this.client
          .from('forum_respostas')
          .select('*, autor:profissionais(id, full_name, professional_title, email)')
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
                .select('id, full_name, professional_title, email')
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

      return topicos.map((t: any) => ({
        ...t,
        respostas: (respostas || []).filter((r: any) => r.topico_id === t.id)
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar tópicos do fórum (admin):', e?.message || e);
      return [];
    }
  }

  async excluirTopicoForum(topicoId: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('forum_respostas').delete().eq('topico_id', topicoId);
      await this.client.from('forum_curtidas').delete().eq('alvo_id', topicoId);
      const { error } = await this.client.from('forum_topicos').delete().eq('id', topicoId);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirRespostaForum(respostaId: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('forum_curtidas').delete().eq('alvo_id', respostaId);
      const { error } = await this.client.from('forum_respostas').delete().eq('id', respostaId);
      return { error };
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

  async buscarMembrosParaConversa(termo: string): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user || !termo.trim()) return [];
      const { data, error } = await this.client
        .from('profissionais')
        .select('id, full_name, professional_title')
        .neq('id', session.user.id)
        .ilike('full_name', `%${termo.trim()}%`)
        .limit(10);
      if (error) { console.warn('Erro ao buscar membros:', error.message); return []; }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao buscar membros:', e?.message || e);
      return [];
    }
  }

  async obterOuCriarConversa(outroProfissionalId: string): Promise<{ conversaId: string | null; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { conversaId: null, error: new Error('Não autenticado.') };
      const meuId = session.user.id;

      const [p1, p2] = [meuId, outroProfissionalId].sort();

      const { data: existente } = await this.client
        .from('conversas')
        .select('id')
        .eq('participante_1', p1)
        .eq('participante_2', p2)
        .maybeSingle();

      if (existente?.id) {
        return { conversaId: existente.id, error: null };
      }

      const { data: nova, error } = await this.client
        .from('conversas')
        .insert({ participante_1: p1, participante_2: p2 })
        .select('id')
        .single();

      if (error) return { conversaId: null, error };
      return { conversaId: nova.id, error: null };
    } catch (e: any) {
      return { conversaId: null, error: e };
    }
  }

  // ----------------------------------------------------
  // GESTÃO DE CURSOS (ADMIN)
  // ----------------------------------------------------

  async listarTodosCursosAdmin(): Promise<any[]> {
    try {
      const { data: cursos, error } = await this.client
        .from('cursos')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar cursos (admin):', error.message);
        return [];
      }

      const cursoIds = (cursos || []).map((c: any) => c.id);
      const { data: modulos } = cursoIds.length > 0
        ? await this.client.from('cursos_modulos').select('*').in('curso_id', cursoIds).order('ordem', { ascending: true })
        : { data: [] };

      const { data: matriculas } = cursoIds.length > 0
        ? await this.client.from('cursos_matriculas').select('*').in('curso_id', cursoIds)
        : { data: [] };

      return (cursos || []).map((c: any) => ({
        ...c,
        modulos: (modulos || []).filter((m: any) => m.curso_id === c.id),
        totalMatriculados: (matriculas || []).filter((mt: any) => mt.curso_id === c.id).length,
        totalCertificados: (matriculas || []).filter((mt: any) => mt.curso_id === c.id && mt.certificado_emitido_em).length,
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar cursos (admin):', e?.message || e);
      return [];
    }
  }

  async criarCurso(curso: {
    titulo: string;
    descricao?: string;
    categoria?: string;
    modulo_predial_vinculado?: string | null;
    texto_certificado?: string | null;
    carga_horaria_certificado?: string | null;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const payload: any = {
        titulo: curso.titulo,
        ativo: true,
      };
      if (curso.descricao !== undefined) payload.descricao = curso.descricao;
      if (curso.categoria !== undefined) payload.categoria = curso.categoria;
      if (curso.modulo_predial_vinculado !== undefined) payload.modulo_predial_vinculado = curso.modulo_predial_vinculado;
      if (curso.texto_certificado !== undefined) payload.texto_certificado = curso.texto_certificado;
      if (curso.carga_horaria_certificado !== undefined) payload.carga_horaria_certificado = curso.carga_horaria_certificado;

      const { data, error } = await this.client.from('cursos').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarCurso(id: string, dados: Record<string, any>): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('cursos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirCurso(id: string): Promise<{ error: Error | null }> {
    try {
      await this.client.from('cursos_matriculas').delete().eq('curso_id', id);
      await this.client.from('cursos_modulos').delete().eq('curso_id', id);
      const { error } = await this.client.from('cursos').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async criarModuloCurso(modulo: {
    curso_id: string;
    titulo: string;
    descricao?: string;
    duracao?: string;
    vimeo_id?: string;
    ordem: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const payload: any = {
        curso_id: modulo.curso_id,
        titulo: modulo.titulo,
        ordem: modulo.ordem,
      };
      if (modulo.descricao !== undefined) payload.descricao = modulo.descricao;
      if (modulo.duracao !== undefined) payload.duracao = modulo.duracao;
      if (modulo.vimeo_id !== undefined) payload.vimeo_id = modulo.vimeo_id;

      const { data, error } = await this.client.from('cursos_modulos').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarModuloCurso(
    id: string,
    dados: Partial<{ titulo: string; descricao: string; duracao: string; vimeo_id: string; ordem: number }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('cursos_modulos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirModuloCurso(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('cursos_modulos').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarMatriculadosDoCurso(cursoId: string): Promise<any[]> {
    try {
      const res = await this.client
        .from('cursos_matriculas')
        .select('*, aluno:profissionais!cursos_matriculas_profissional_id_fkey(id, full_name, professional_title, email)')
        .eq('curso_id', cursoId)
        .order('atualizado_em', { ascending: false });

      if (!res.error && res.data) return res.data;

      const resFallback = await this.client
        .from('cursos_matriculas')
        .select('*, aluno:profissionais(id, full_name, professional_title, email)')
        .eq('curso_id', cursoId)
        .order('atualizado_em', { ascending: false });

      if (!resFallback.error && resFallback.data) return resFallback.data;

      // Fallback manual se join falhar
      const { data: matriculas } = await this.client
        .from('cursos_matriculas')
        .select('*')
        .eq('curso_id', cursoId)
        .order('atualizado_em', { ascending: false });

      if (!matriculas || matriculas.length === 0) return [];
      const profIds = matriculas.map((m: any) => m.profissional_id).filter(Boolean);
      let profsMap: Record<string, any> = {};
      if (profIds.length > 0) {
        const { data: profs } = await this.client
          .from('profissionais')
          .select('id, full_name, professional_title, email')
          .in('id', profIds);
        (profs || []).forEach((p: any) => { profsMap[p.id] = p; });
      }

      return matriculas.map((m: any) => ({
        ...m,
        aluno: profsMap[m.profissional_id] || null,
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar matriculados do curso:', e?.message || e);
      return [];
    }
  }

  async listarCursosAtivos(): Promise<{ id: string; titulo: string; categoria?: string; ativo?: boolean }[]> {
    try {
      const { data, error } = await this.client
        .from('cursos')
        .select('id, titulo, categoria, ativo')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar cursos ativos:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar cursos ativos:', e?.message || e);
      return [];
    }
  }

  async liberarAcessoCurso(
    profissionalId: string,
    cursoId: string,
    liberado: boolean,
    validade?: string | null
  ): Promise<{ error: Error | null }> {
    try {
      const payload: any = {
        profissional_id: profissionalId,
        produto: 'comunidade',
        modulo: cursoId,
        liberado,
        atualizado_em: new Date().toISOString(),
      };
      if (validade !== undefined) {
        payload.validade = validade || null;
      }
      const { error } = await this.client
        .from('permissoes_acesso')
        .upsert(payload, { onConflict: 'profissional_id,produto,modulo' });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarAcessosEMatriculasDoCurso(cursoId: string): Promise<any[]> {
    try {
      const [profsRes, permsRes, matsRes] = await Promise.all([
        this.client.from('profissionais').select('id, full_name, professional_title, email, nivel_atual').order('full_name', { ascending: true }),
        this.client.from('permissoes_acesso').select('*').eq('produto', 'comunidade').eq('modulo', cursoId),
        this.listarMatriculadosDoCurso(cursoId),
      ]);

      const profs = profsRes.data || [];
      const perms = permsRes.data || [];
      const mats = matsRes || [];

      const permsMap = new Map<string, any>();
      perms.forEach((p: any) => permsMap.set(p.profissional_id, p));

      const matsMap = new Map<string, any>();
      mats.forEach((m: any) => matsMap.set(m.profissional_id, m));

      return profs.map((prof: any) => {
        const perm = permsMap.get(prof.id);
        const mat = matsMap.get(prof.id);
        return {
          profissional: prof,
          liberado: perm ? !!perm.liberado : false,
          validade: perm?.validade || null,
          matriculado: !!mat,
          matricula: mat || null,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar acessos e matrículas do curso:', e?.message || e);
      return [];
    }
  }

  // ----------------------------------------------------
  // CURSOS DO ALUNO (PROGRESSO, AVALIAÇÃO, CERTIFICADO)
  // ----------------------------------------------------

  async listarCursosParaAluno(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];
      const meuId = session.user.id;

      const { data: cursos, error } = await this.client
        .from('cursos')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar cursos:', error.message);
        return [];
      }

      const cursoIds = (cursos || []).map((c: any) => c.id);

      const { data: modulos } = cursoIds.length > 0
        ? await this.client.from('cursos_modulos').select('*').in('curso_id', cursoIds).order('ordem', { ascending: true })
        : { data: [] };

      const { data: matriculas } = cursoIds.length > 0
        ? await this.client.from('cursos_matriculas').select('*').eq('profissional_id', meuId).in('curso_id', cursoIds)
        : { data: [] };

      // Verifica a permissão específica por curso (id do curso como chave do módulo na comunidade)
      const permissoesPorCurso = await Promise.all(
        cursoIds.map(async (id: string) => [id, await this.temPermissaoModulo('comunidade', id)] as const)
      );
      const mapaPermissoes = Object.fromEntries(permissoesPorCurso);

      return (cursos || []).map((c: any) => {
        const modulosDoCurso = (modulos || []).filter((m: any) => m.curso_id === c.id);
        const matricula = (matriculas || []).find((mt: any) => mt.curso_id === c.id);
        const modulosConcluidos: string[] = matricula?.modulos_concluidos || [];
        const totalModulos = modulosDoCurso.length;
        const progresso = totalModulos > 0 ? Math.round((modulosConcluidos.length / totalModulos) * 100) : 0;

        return {
          ...c,
          matriculaId: matricula?.id || null,
          modulos: modulosDoCurso,
          temAcesso: !!mapaPermissoes[c.id],
          matriculado: !!matricula,
          modulosConcluidos,
          progresso,
          avaliacaoAprovado: matricula?.avaliacao_aprovado || false,
          certificadoEmitidoEm: matricula?.certificado_emitido_em || null,
          codigo_verificacao: matricula?.codigo_verificacao || null,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar cursos para aluno:', e?.message || e);
      return [];
    }
  }

  async marcarModuloConcluido(cursoId: string, moduloId: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const meuId = session.user.id;

      const { data: existente } = await this.client
        .from('cursos_matriculas')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('profissional_id', meuId)
        .maybeSingle();

      const modulosAtuais: string[] = existente?.modulos_concluidos || [];
      if (modulosAtuais.includes(moduloId)) {
        return { error: null };
      }
      const novosModulos = [...modulosAtuais, moduloId];

      const { error } = await this.client
        .from('cursos_matriculas')
        .upsert({
          curso_id: cursoId,
          profissional_id: meuId,
          modulos_concluidos: novosModulos,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'curso_id,profissional_id' });

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async emitirCertificado(cursoId: string): Promise<{ error: Error | null; codigo_verificacao?: string }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Verifica se já existe código salvo
      const { data: matExistente } = await this.client
        .from('cursos_matriculas')
        .select('id, codigo_verificacao, certificado_emitido_em')
        .eq('curso_id', cursoId)
        .eq('profissional_id', session.user.id)
        .maybeSingle();

      let codigo = matExistente?.codigo_verificacao;
      if (!codigo) {
        codigo = gerarCodigoVerificacaoCertificado();
      }

      const { error } = await this.client
        .from('cursos_matriculas')
        .update({
          certificado_emitido_em: matExistente?.certificado_emitido_em || new Date().toISOString(),
          avaliacao_aprovado: true,
          codigo_verificacao: codigo,
          atualizado_em: new Date().toISOString(),
        })
        .eq('curso_id', cursoId)
        .eq('profissional_id', session.user.id);

      return { error, codigo_verificacao: codigo };
    } catch (e: any) {
      return { error: e };
    }
  }

  /**
   * Garante que uma matrícula com certificado emitido possua código persistido (lazy backfill)
   */
  async garantirCodigoVerificacaoMatricula(matriculaId: string): Promise<string> {
    try {
      const { data: mat } = await this.client
        .from('cursos_matriculas')
        .select('id, codigo_verificacao, certificado_emitido_em')
        .eq('id', matriculaId)
        .maybeSingle();

      if (mat?.codigo_verificacao) {
        return mat.codigo_verificacao;
      }

      const novoCodigo = gerarCodigoVerificacaoCertificado();
      await this.client
        .from('cursos_matriculas')
        .update({ codigo_verificacao: novoCodigo })
        .eq('id', matriculaId);

      return novoCodigo;
    } catch (e: any) {
      console.warn('Erro ao garantir código de verificação:', e);
      return gerarCodigoVerificacaoCertificado();
    }
  }

  /**
   * Consulta pública e segura de autenticidade de certificado
   */
  async verificarCertificadoPublico(codigo: string): Promise<{
    valido: boolean;
    mensagem?: string;
    codigo_verificacao?: string;
    nome_aluno?: string;
    nome_curso?: string;
    data_emissao?: string;
    carga_horaria?: string;
    texto_normativo?: string;
    modulo_predial?: string;
  }> {
    const cod = (codigo || '').trim().toUpperCase();
    if (!cod) {
      return { valido: false, mensagem: 'Código de verificação não informado.' };
    }

    try {
      // 1. Tenta invocar a função RPC segura do Supabase (SECURITY DEFINER)
      const { data, error } = await this.client.rpc('verificar_certificado_publico', { p_codigo: cod });
      if (!error && data) {
        const res = typeof data === 'string' ? JSON.parse(data) : data;
        return res;
      }

      // 2. Fallback resiliente via select direto caso o RPC ainda não tenha sido aplicado no Supabase remoto
      const { data: mat, error: matErr } = await this.client
        .from('cursos_matriculas')
        .select(`
          codigo_verificacao,
          certificado_emitido_em,
          curso:cursos(titulo, carga_horaria_certificado, texto_certificado, modulo_predial_vinculado),
          aluno:profissionais(full_name)
        `)
        .eq('codigo_verificacao', cod)
        .not('certificado_emitido_em', 'is', null)
        .maybeSingle();

      if (mat) {
        const item = mat as any;
        return {
          valido: true,
          codigo_verificacao: item.codigo_verificacao,
          nome_aluno: item.aluno?.full_name || 'Membro da Comunidade',
          nome_curso: item.curso?.titulo || 'Curso de Engenharia Diagnóstica',
          data_emissao: item.certificado_emitido_em,
          carga_horaria: item.curso?.carga_horaria_certificado || '',
          texto_normativo: item.curso?.texto_certificado || '',
          modulo_predial: item.curso?.modulo_predial_vinculado || '',
        };
      }

      return {
        valido: false,
        mensagem: 'Código não encontrado. Verifique se digitou corretamente.',
      };
    } catch (e: any) {
      console.warn('Exceção ao verificar certificado público:', e?.message || e);
      return {
        valido: false,
        mensagem: 'Código não encontrado. Verifique se digitou corretamente.',
      };
    }
  }

  async contarMembrosAtivos(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('profissionais')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.warn('Erro ao contar membros ativos:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e: any) {
      console.warn('Exceção ao contar membros ativos:', e?.message || e);
      return 0;
    }
  }

  async contarPostsPublicados(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('feed_posts')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.warn('Erro ao contar posts publicados:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e: any) {
      console.warn('Exceção ao contar posts publicados:', e?.message || e);
      return 0;
    }
  }

  async contarVagasAbertas(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('vagas')
        .select('*', { count: 'exact', head: true })
        .eq('ativa', true);
      if (error) {
        console.warn('Erro ao contar vagas abertas:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e: any) {
      console.warn('Exceção ao contar vagas abertas:', e?.message || e);
      return 0;
    }
  }

  // ----------------------------------------------------
  // DEPOIMENTOS (BLOCO 6)
  // ----------------------------------------------------

  async listarDepoimentosAtivos(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('depoimentos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar depoimentos:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar depoimentos:', e?.message || e);
      return [];
    }
  }

  async listarTodosDepoimentosAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('depoimentos')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar depoimentos (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar depoimentos (admin):', e?.message || e);
      return [];
    }
  }

  async criarDepoimento(depoimento: {
    nome: string;
    cargo_ou_papel?: string;
    tipo: 'imagem' | 'video';
    imagem_url?: string;
    vimeo_id?: string;
    ordem?: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('depoimentos')
        .insert({ ...depoimento, ativo: true })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarDepoimento(
    id: string,
    dados: Partial<{ nome: string; cargo_ou_papel: string; tipo: 'imagem' | 'video'; imagem_url: string; vimeo_id: string; ordem: number; ativo: boolean }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('depoimentos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirDepoimento(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('depoimentos').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // BLOG & NEWSLETTER (BLOCO 5)
  // ----------------------------------------------------

  async listarTodosPostsAdmin(): Promise<any[]> {
    try {
      const res = await this.client
        .from('blog_posts')
        .select('*, autor:profissionais!blog_posts_autor_id_fkey(id, full_name)')
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) return res.data;

      const resFallback = await this.client
        .from('blog_posts')
        .select('*, autor:profissionais(id, full_name)')
        .order('criado_em', { ascending: false });

      return resFallback.data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar posts (admin):', e?.message || e);
      return [];
    }
  }

  async listarPostsPublicados(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('blog_posts')
        .select('*')
        .eq('publicado', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar posts publicados:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar posts publicados:', e?.message || e);
      return [];
    }
  }

  async criarPost(post: {
    titulo: string;
    resumo?: string;
    conteudo: string;
    categoria: string;
    imagem_capa_url?: string;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const session = await this.getSession();
      const payload = { ...post, autor_id: session?.user?.id || null, publicado: false };
      const { data, error } = await this.client.from('blog_posts').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarPost(
    id: string,
    dados: Partial<{
      titulo: string;
      resumo: string;
      conteudo: string;
      categoria: string;
      imagem_capa_url: string;
      publicado: boolean;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('blog_posts')
        .update({ ...dados, atualizado_em: new Date().toISOString() })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirPost(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('blog_posts').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async uploadImagemBlog(file: File): Promise<{ error: Error | null; url?: string | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Limite de 15 MB
      const maxBytes = 15 * 1024 * 1024;
      if (file.size > maxBytes) {
        return { error: new Error('A imagem excede o limite máximo permitido de 15 MB.') };
      }

      const cleanName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const path = `blog_conteudo/${Date.now()}_${cleanName}`;

      // Upload para o bucket materiais-comunidade
      const { error: uploadError } = await this.client.storage
        .from('materiais-comunidade')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { error: uploadError };
      }

      // Gera signed URL de longa duração (10 anos = 315360000s)
      const { data: signedData, error: signedError } = await this.client.storage
        .from('materiais-comunidade')
        .createSignedUrl(path, 315360000);

      if (signedError) {
        const { data: pubData } = this.client.storage
          .from('materiais-comunidade')
          .getPublicUrl(path);
        return { error: null, url: pubData?.publicUrl || null };
      }

      return { error: null, url: signedData?.signedUrl || null };
    } catch (err: any) {
      return { error: err };
    }
  }

  async inscreverNewsletter(nome: string, email: string): Promise<{ error: Error | null; alreadySubscribed?: boolean }> {
    try {
      const emailLimpo = (email || '').trim().toLowerCase();
      const { error } = await this.client.from('newsletter_assinantes').insert({ nome: (nome || '').trim() || null, email: emailLimpo });
      if (error) {
        // Código 23505 = Postgres unique_violation
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('already exists')) {
          return { error: null, alreadySubscribed: true };
        }
        return { error };
      }
      return { error: null, alreadySubscribed: false };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarAssinantesNewsletter(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('newsletter_assinantes')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar assinantes da newsletter:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar assinantes da newsletter:', e?.message || e);
      return [];
    }
  }

  async removerAssinanteNewsletter(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('newsletter_assinantes').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async exportarEmailsNewsletter(): Promise<string[]> {
    try {
      const { data } = await this.client.from('newsletter_assinantes').select('email').eq('ativo', true);
      return (data || []).map((r: any) => r.email);
    } catch {
      return [];
    }
  }

  // ----------------------------------------------------
  // BLOG ANALYTICS & MÉTRICAS
  // ----------------------------------------------------

  async registrarVisualizacaoPost(postId: string): Promise<void> {
    try {
      if (!postId) return;
      const { error } = await this.client
        .from('blog_analytics')
        .insert([{ post_id: postId }]);
      if (error) {
        console.warn('Falha ao registrar métrica em blog_analytics:', error.message);
      }
    } catch (err: any) {
      console.warn('Exceção ao registrar visualização do blog:', err?.message || err);
    }
  }

  async obterAnalyticsBlog(): Promise<{
    totalVisualizacoes: number;
    totalPostsPublicados: number;
    totalPostsGeral: number;
    mediaVisualizacoesPorPost: number;
    rankingPosts: Array<{
      id: string;
      titulo: string;
      categoria: string;
      publicado: boolean;
      criado_em: string;
      totalVisualizacoes: number;
    }>;
  }> {
    try {
      // 1. Busca todos os posts
      const { data: posts, error: postsError } = await this.client
        .from('blog_posts')
        .select('id, titulo, categoria, publicado, criado_em')
        .order('criado_em', { ascending: false });

      if (postsError) {
        console.warn('Erro ao buscar posts para analytics:', postsError.message);
      }

      // 2. Busca todos os registros de visualizações
      const { data: views, error: viewsError } = await this.client
        .from('blog_analytics')
        .select('id, post_id, criado_em');

      if (viewsError) {
        console.warn('Erro ao buscar registros de blog_analytics:', viewsError.message);
      }

      const listaPosts = posts || [];
      const listaViews = views || [];

      // 3. Agrupamento de contagens por post_id
      const contagemPorPost: Record<string, number> = {};
      for (const v of listaViews) {
        if (v.post_id) {
          contagemPorPost[v.post_id] = (contagemPorPost[v.post_id] || 0) + 1;
        }
      }

      const rankingPosts = listaPosts.map((p: any) => ({
        id: p.id,
        titulo: p.titulo || 'Sem título',
        categoria: p.categoria || 'Geral',
        publicado: Boolean(p.publicado),
        criado_em: p.criado_em,
        totalVisualizacoes: contagemPorPost[p.id] || 0,
      })).sort((a, b) => b.totalVisualizacoes - a.totalVisualizacoes);

      const totalVisualizacoes = listaViews.length;
      const totalPostsPublicados = listaPosts.filter((p: any) => p.publicado).length;
      const totalPostsGeral = listaPosts.length;
      const mediaVisualizacoesPorPost = totalPostsPublicados > 0
        ? parseFloat((totalVisualizacoes / totalPostsPublicados).toFixed(1))
        : 0;

      return {
        totalVisualizacoes,
        totalPostsPublicados,
        totalPostsGeral,
        mediaVisualizacoesPorPost,
        rankingPosts,
      };
    } catch (err: any) {
      console.warn('Exceção ao obter analytics do blog:', err?.message || err);
      return {
        totalVisualizacoes: 0,
        totalPostsPublicados: 0,
        totalPostsGeral: 0,
        mediaVisualizacoesPorPost: 0,
        rankingPosts: [],
      };
    }
  }

  // ----------------------------------------------------
  // NOTIFICAÇÕES (BLOCO 6 PARTE 2)
  // ----------------------------------------------------

  async enviarNotificacao(titulo: string, mensagem: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      const { error } = await this.client
        .from('notificacoes')
        .insert({ titulo, mensagem, criado_por: session?.user?.id || null });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarNotificacoesEnviadas(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('notificacoes')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar notificações enviadas:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar notificações enviadas:', e?.message || e);
      return [];
    }
  }

  async excluirNotificacao(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('notificacoes').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarNotificacoesParaMim(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      const { data: notificacoes, error } = await this.client
        .from('notificacoes')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(30);
      if (error) {
        console.warn('Erro ao listar notificações para o usuário:', error.message);
        return [];
      }

      const { data: leituras } = await this.client
        .from('notificacoes_leituras')
        .select('notificacao_id')
        .eq('profissional_id', session.user.id);

      const idsLidos = new Set((leituras || []).map((l: any) => l.notificacao_id));

      return (notificacoes || []).map((n: any) => ({ ...n, lida: idsLidos.has(n.id) }));
    } catch (e: any) {
      console.warn('Exceção ao listar notificações para o usuário:', e?.message || e);
      return [];
    }
  }

  async marcarNotificacaoComoLida(notificacaoId: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { error } = await this.client
        .from('notificacoes_leituras')
        .upsert({ notificacao_id: notificacaoId, profissional_id: session.user.id }, { onConflict: 'notificacao_id,profissional_id' });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  /* ==========================================================================
     PORTFÓLIO DE PROJETOS (AMORIM ARQUITETURA)
     ========================================================================== */

  async listarPortfolioAtivo(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('portfolio_projetos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar portfólio:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar portfólio:', e?.message || e);
      return [];
    }
  }

  async contarProjetosPortfolio(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('portfolio_projetos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }

  async listarTodoPortfolioAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('portfolio_projetos')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar portfólio (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar portfólio (admin):', e?.message || e);
      return [];
    }
  }

  async criarProjetoPortfolio(projeto: {
    titulo: string;
    ano?: string;
    cliente?: string;
    local?: string;
    imagem_url: string;
    ordem?: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('portfolio_projetos')
        .insert({ ...projeto, ativo: true })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarProjetoPortfolio(
    id: string,
    dados: Partial<{
      titulo: string;
      ano: string;
      cliente: string;
      local: string;
      imagem_url: string;
      ordem: number;
      ativo: boolean;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('portfolio_projetos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirProjetoPortfolio(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('portfolio_projetos').delete().eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }
}

