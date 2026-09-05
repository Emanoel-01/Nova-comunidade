import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { gerarCodigoVerificacaoCertificado } from '../app/services/certificado-pdf.service';
import { obterVisitanteId } from '../app/utils/visitante-id.util';

export interface DocumentoCredito {
  id: string;
  projeto_credito_id: string;
  profissional_id: string;
  documento_id: string;
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
  enviado_em: string;
}

export interface DadosDocumentaisTecnicos {
  full_name: string;
  professional_title?: string;
  categoria_profissional?: string;
  crea_cau?: string;
  company_name?: string;
  razao_social?: string;
  cpf_responsavel?: string;
  company_position?: string;
  company_cnpj?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_site?: string;
  social_network_label?: string;
  social_network_url?: string;
  company_logo_url?: string | null;
  dados_documentais_confirmados?: boolean;
}

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
      let pessoas: any[] = [];
      // Tenta consultar a função RPC com rastreio de último acesso (last_sign_in_at do Supabase Auth) e contagem de reenvios
      const { data: pessoasRpc, error: erroRpc } = await this.client.rpc('listar_profissionais_com_ultimo_acesso');
      
      if (!erroRpc && pessoasRpc && Array.isArray(pessoasRpc)) {
        pessoas = pessoasRpc;
      } else {
        // Fallback para consulta direta na tabela profissionais caso a RPC não esteja disponível
        const { data: pessoasDireto, error: erroPessoas } = await this.client
          .from('profissionais')
          .select('*')
          .order('full_name', { ascending: true });
        
        if (erroPessoas) {
          console.warn('Erro ao buscar profissionais:', erroPessoas.message);
          return [];
        }
        pessoas = pessoasDireto || [];
      }

      // Buscar permissões modulares
      const { data: permissoes, error: erroPermissoes } = await this.client
        .from('permissoes_acesso')
        .select('*');
      if (erroPermissoes) {
        console.warn('Aviso ao buscar permissões_acesso:', erroPermissoes.message);
      }

      // Se a RPC não retornou total_reenvios (ex: fallback direto), tentar buscar contagem em reenvios_convite
      let mapaReenvios: Record<string, { total: number; ultimo?: string }> = {};
      try {
        const { data: reenviosData } = await this.client
          .from('reenvios_convite')
          .select('profissional_id, enviado_em')
          .order('enviado_em', { ascending: true });

        if (reenviosData && Array.isArray(reenviosData)) {
          reenviosData.forEach((r: any) => {
            if (r.profissional_id) {
              if (!mapaReenvios[r.profissional_id]) {
                mapaReenvios[r.profissional_id] = { total: 0, ultimo: r.enviado_em };
              }
              mapaReenvios[r.profissional_id].total += 1;
              mapaReenvios[r.profissional_id].ultimo = r.enviado_em;
            }
          });
        }
      } catch {
        // Tabela reenvios_convite pode não estar criada ainda
      }

      return (pessoas || []).map((p: any) => {
        const infoReenvio = mapaReenvios[p.id];
        const totalReenvios = p.total_reenvios !== undefined && p.total_reenvios !== null
          ? Number(p.total_reenvios)
          : (infoReenvio ? infoReenvio.total : 0);

        const ultimoReenvio = p.ultimo_reenvio_em || infoReenvio?.ultimo || null;

        return {
          ...p,
          total_reenvios: totalReenvios,
          ultimo_reenvio_em: ultimoReenvio,
          permissoes: (permissoes || []).filter((perm: any) => perm.profissional_id === p.id),
        };
      });
    } catch (e: any) {
      console.warn('Erro ao listar profissionais com permissões:', e?.message || e);
      return [];
    }
  }

  async listarProfissionaisAdmin(): Promise<any[]> {
    return this.listarProfissionaisComPermissoes();
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
    perfil_nome?: string;
    perfil_id?: string;
    enviar_email?: boolean;
  }): Promise<{ data?: any; error: Error | null; senhaProvisoria?: string; perfilAplicado?: string | null }> {
    try {
      const { data, error } = await this.client.functions.invoke('criar-usuario-admin', {
        body: {
          email: dados.email,
          full_name: dados.full_name,
          ...(dados.password ? { password: dados.password } : {}),
          ...(dados.nivel_atual ? { nivel_atual: dados.nivel_atual } : {}),
          ...(dados.perfil_nome ? { perfil_nome: dados.perfil_nome } : {}),
          ...(dados.perfil_id ? { perfil_id: dados.perfil_id } : {}),
          enviar_email: dados.enviar_email !== false,
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
        perfilAplicado: data?.perfilAplicado,
        error: null,
      };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async criarUsuariosEmMassaViaFunction(
    usuarios: Array<{
      full_name: string;
      email: string;
      password?: string;
      nivel_atual?: string;
      perfil_nome?: string;
    }>,
    enviarEmail: boolean = true
  ): Promise<{
    sucesso: boolean;
    totalProcessados: number;
    totalSucesso: number;
    totalFalhas: number;
    resultados: Array<{
      full_name: string;
      email: string;
      sucesso: boolean;
      senhaProvisoria?: string;
      perfilAplicado?: string | null;
      error?: string;
      userId?: string;
    }>;
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.client.functions.invoke('criar-usuario-admin', {
        body: {
          usuarios,
          enviar_email: enviarEmail,
        },
      });

      if (error) {
        let msg = error.message || 'Erro ao processar criação de usuários em massa.';
        if (data?.error) msg = data.error;
        return {
          sucesso: false,
          totalProcessados: usuarios.length,
          totalSucesso: 0,
          totalFalhas: usuarios.length,
          resultados: [],
          error: new Error(msg),
        };
      }

      if (data?.error) {
        return {
          sucesso: false,
          totalProcessados: usuarios.length,
          totalSucesso: 0,
          totalFalhas: usuarios.length,
          resultados: [],
          error: new Error(data.error),
        };
      }

      return {
        sucesso: true,
        totalProcessados: data?.totalProcessados || usuarios.length,
        totalSucesso: data?.totalSucesso || 0,
        totalFalhas: data?.totalFalhas || 0,
        resultados: data?.resultados || [],
        error: null,
      };
    } catch (e: any) {
      return {
        sucesso: false,
        totalProcessados: usuarios.length,
        totalSucesso: 0,
        totalFalhas: usuarios.length,
        resultados: [],
        error: e instanceof Error ? e : new Error(String(e)),
      };
    }
  }

  async excluirUsuarioAdminViaFunction(userId: string): Promise<{ error: Error | null; mensagem?: string }> {
    try {
      const { data, error } = await this.client.functions.invoke('excluir-usuario-admin', {
        body: { userId },
      });

      if (error) {
        let msg = error.message || 'Erro ao invocar função excluir-usuario-admin';
        if (data?.error) msg = data.error;
        return { error: new Error(msg) };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      return { error: null, mensagem: data?.mensagem };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async reenviarConviteUsuarioViaFunction(dados: {
    userId?: string;
    email?: string;
    templateChave?: string;
  }): Promise<{
    sucesso: boolean;
    error: Error | null;
    senhaProvisoria?: string;
    email?: string;
    nome?: string;
    userId?: string;
  }> {
    try {
      const { data, error } = await this.client.functions.invoke('reenviar-convite-usuario', {
        body: {
          userId: dados.userId,
          email: dados.email,
          template_chave: dados.templateChave,
        },
      });

      if (error) {
        let msg = error.message || 'Erro ao invocar função reenviar-convite-usuario';
        if (data?.error) msg = data.error;
        return { sucesso: false, error: new Error(msg) };
      }

      if (data?.error) {
        return { sucesso: false, error: new Error(data.error) };
      }

      return {
        sucesso: Boolean(data?.sucesso),
        senhaProvisoria: data?.senhaProvisoria,
        email: data?.email,
        nome: data?.nome,
        userId: data?.userId,
        error: null,
      };
    } catch (e: any) {
      return { sucesso: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async reenviarConvitesLoteViaFunction(dados: {
    profissionalIds: string[];
    templateChave?: string;
  }): Promise<{
    sucesso: boolean;
    error: Error | null;
    totalProcessados: number;
    totalSucesso: number;
    totalFalhas: number;
    resultados: Array<{
      userId: string;
      email: string;
      nome: string;
      sucesso: boolean;
      senhaProvisoria?: string;
      error?: string;
      reenvioId?: string;
    }>;
  }> {
    try {
      const { data, error } = await this.client.functions.invoke('reenviar-convite-usuario', {
        body: {
          profissionalIds: dados.profissionalIds,
          template_chave: dados.templateChave,
        },
      });

      if (error) {
        let msg = error.message || 'Erro ao invocar função reenviar-convite-usuario em lote';
        if (data?.error) msg = data.error;
        return {
          sucesso: false,
          error: new Error(msg),
          totalProcessados: dados.profissionalIds.length,
          totalSucesso: 0,
          totalFalhas: dados.profissionalIds.length,
          resultados: [],
        };
      }

      if (data?.error && !data.resultados) {
        return {
          sucesso: false,
          error: new Error(data.error),
          totalProcessados: dados.profissionalIds.length,
          totalSucesso: 0,
          totalFalhas: dados.profissionalIds.length,
          resultados: [],
        };
      }

      const resultados = Array.isArray(data?.resultados) ? data.resultados : [];
      return {
        sucesso: Boolean(data?.sucesso),
        totalProcessados: data?.totalProcessados || dados.profissionalIds.length,
        totalSucesso: data?.totalSucesso || resultados.filter((r: any) => r.sucesso).length,
        totalFalhas: data?.totalFalhas || resultados.filter((r: any) => !r.sucesso).length,
        resultados,
        error: null,
      };
    } catch (e: any) {
      return {
        sucesso: false,
        error: e instanceof Error ? e : new Error(String(e)),
        totalProcessados: dados.profissionalIds.length,
        totalSucesso: 0,
        totalFalhas: dados.profissionalIds.length,
        resultados: [],
      };
    }
  }

  // ----------------------------------------------------
  // PERFIS DE ACESSO (MOLDES DE PERMISSÃO)
  // ----------------------------------------------------

  async listarPerfisAcesso(): Promise<Array<{
    id: string;
    nome: string;
    descricao?: string | null;
    modulos: Array<{ produto: 'predial4' | 'comunidade'; modulo: string }>;
    criado_em?: string;
    atualizado_em?: string;
  }>> {
    try {
      const { data, error } = await this.client
        .from('perfis_acesso')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.warn('Erro ao listar perfis_acesso:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar perfis_acesso:', e?.message || e);
      return [];
    }
  }

  async criarPerfilAcesso(perfil: {
    nome: string;
    descricao?: string | null;
    modulos: Array<{ produto: 'predial4' | 'comunidade'; modulo: string }>;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client
        .from('perfis_acesso')
        .insert({
          nome: perfil.nome.trim(),
          descricao: perfil.descricao ? perfil.descricao.trim() : null,
          modulos: perfil.modulos,
        })
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async atualizarPerfilAcesso(
    id: string,
    dados: Partial<{
      nome: string;
      descricao: string | null;
      modulos: Array<{ produto: 'predial4' | 'comunidade'; modulo: string }>;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('perfis_acesso')
        .update({
          ...dados,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async excluirPerfilAcesso(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('perfis_acesso')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  // ----------------------------------------------------
  // DISPARO DE E-MAILS VIA RESEND
  // ----------------------------------------------------

  async enviarEmailViaFunction(dados: {
    tipo?: 'boas-vindas' | 'notificacao' | 'personalizado';
    destinatarios: string[];
    assunto?: string;
    mensagem?: string;
    titulo?: string;
    html?: string;
    nome?: string;
    senhaProvisoria?: string;
    perfilNome?: string;
  }): Promise<{ sucesso: boolean; error: Error | null; totalEnviados?: number; totalFalhas?: number }> {
    try {
      const { data, error } = await this.client.functions.invoke('enviar-email', {
        body: dados,
      });

      if (error) {
        let msg = error.message || 'Erro ao invocar função enviar-email';
        if (data?.error) msg = data.error;
        return { sucesso: false, error: new Error(msg) };
      }

      if (data?.error) {
        return { sucesso: false, error: new Error(data.error) };
      }

      return {
        sucesso: Boolean(data?.sucesso),
        totalEnviados: data?.totalEnviados || 0,
        totalFalhas: data?.totalFalhas || 0,
        error: null,
      };
    } catch (e: any) {
      return { sucesso: false, error: e instanceof Error ? e : new Error(String(e)) };
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
      full_name?: string;
      nivel_atual?: string;
      licenca_tipo?: string | null;
      licenca_validade?: string | null;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const updatePayload: Record<string, any> = {};
      if (dados.full_name !== undefined) updatePayload.full_name = dados.full_name;
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

  async atualizarNomeUsuarioAdmin(id: string, novoNome: string): Promise<{ error: Error | null }> {
    try {
      const nomeLimpo = (novoNome || '').trim();
      if (!id) return { error: new Error('ID do usuário não fornecido.') };
      if (!nomeLimpo) return { error: new Error('O nome do usuário não pode ficar vazio.') };

      const { error } = await this.client
        .from('profissionais')
        .update({
          full_name: nomeLimpo,
          updated_at: new Date().toISOString(),
        })
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
  // MÉTODOS DE DADOS PARA DOCUMENTOS TÉCNICOS & LAUDOS
  // ----------------------------------------------------

  async salvarDadosDocumentaisUsuario(
    dados: Partial<DadosDocumentaisTecnicos>,
    confirmar: boolean = false
  ): Promise<{ error: Error | null; confirmados?: boolean }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Sessão inválida ou não autenticado.') };

      // 1. Verificar se o registro já está travado no banco (checagem de segurança preventiva)
      const { data: usuarioAtual, error: erroConsulta } = await this.client
        .from('profissionais')
        .select('id, dados_documentais_confirmados')
        .eq('id', session.user.id)
        .maybeSingle();

      if (erroConsulta) {
        return { error: erroConsulta };
      }

      if (usuarioAtual?.dados_documentais_confirmados === true) {
        return {
          error: new Error('Seus dados para documentos técnicos já foram confirmados e estão bloqueados para edição. Solicite alteração a um administrador caso precise corrigir.')
        };
      }

      // 2. Montar payload do update
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (dados.full_name !== undefined) updatePayload.full_name = dados.full_name.trim();
      if (dados.professional_title !== undefined) updatePayload.professional_title = dados.professional_title.trim();
      if (dados.categoria_profissional !== undefined) updatePayload.categoria_profissional = dados.categoria_profissional.trim();
      if (dados.crea_cau !== undefined) updatePayload.crea_cau = dados.crea_cau.trim();
      if (dados.company_name !== undefined) updatePayload.company_name = dados.company_name.trim();
      if (dados.razao_social !== undefined) updatePayload.razao_social = dados.razao_social.trim();
      if (dados.cpf_responsavel !== undefined) updatePayload.cpf_responsavel = dados.cpf_responsavel.trim();
      if (dados.company_position !== undefined) updatePayload.company_position = dados.company_position.trim();
      if (dados.company_cnpj !== undefined) updatePayload.company_cnpj = dados.company_cnpj.trim();
      if (dados.company_address !== undefined) updatePayload.company_address = dados.company_address.trim();
      if (dados.company_phone !== undefined) updatePayload.company_phone = dados.company_phone.trim();
      if (dados.company_email !== undefined) updatePayload.company_email = dados.company_email.trim();
      if (dados.company_site !== undefined) updatePayload.company_site = dados.company_site.trim();
      if (dados.social_network_label !== undefined) updatePayload.social_network_label = dados.social_network_label.trim();
      if (dados.social_network_url !== undefined) updatePayload.social_network_url = dados.social_network_url.trim();
      if (dados.company_logo_url !== undefined) updatePayload.company_logo_url = dados.company_logo_url;

      if (confirmar || dados.dados_documentais_confirmados === true) {
        updatePayload.dados_documentais_confirmados = true;
      }

      // 3. Execução protegida no banco: só atualiza se dados_documentais_confirmados for false
      const { data, error } = await this.client
        .from('profissionais')
        .update(updatePayload)
        .eq('id', session.user.id)
        .eq('dados_documentais_confirmados', false)
        .select('id, dados_documentais_confirmados');

      if (error) {
        return { error };
      }

      if (!data || data.length === 0) {
        return {
          error: new Error('Não foi possível salvar os dados. Os dados documentais já estavam confirmados ou foram bloqueados.')
        };
      }

      return { error: null, confirmados: Boolean(data[0]?.dados_documentais_confirmados) };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async solicitarAlteracaoDadosDocumentais(
    motivo: string,
    dadosAtuais?: Partial<DadosDocumentaisTecnicos>
  ): Promise<{ sucesso: boolean; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { sucesso: false, error: new Error('Sessão expirada. Faça login novamente.') };

      const perfil = await this.obterMeuPerfilCompleto();
      const nomeSolicitante = perfil?.full_name || session.user.user_metadata?.full_name || 'Membro da Comunidade';
      const emailSolicitante = session.user.email || perfil?.email || 'E-mail não identificado';

      const d = { ...perfil, ...dadosAtuais };

      const dadosFormatadosHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; color: #334155;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 35%;">Nome para Documentos:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${d.full_name || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Título Profissional:</td>
              <td style="padding: 8px 0;">${d.professional_title || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Categoria Profissional:</td>
              <td style="padding: 8px 0;">${d.categoria_profissional || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Registro CREA / CAU:</td>
              <td style="padding: 8px 0;">${d.crea_cau || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Nome da Empresa:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${d.company_name || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Cargo:</td>
              <td style="padding: 8px 0;">${d.company_position || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">CNPJ da Empresa:</td>
              <td style="padding: 8px 0;">${d.company_cnpj || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Endereço:</td>
              <td style="padding: 8px 0;">${d.company_address || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Telefone:</td>
              <td style="padding: 8px 0;">${d.company_phone || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">E-mail Institucional:</td>
              <td style="padding: 8px 0;">${d.company_email || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Site:</td>
              <td style="padding: 8px 0;">${d.company_site || '—'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Rede Social:</td>
              <td style="padding: 8px 0;">${d.social_network_label ? `${d.social_network_label}: ${d.social_network_url || ''}` : (d.social_network_url || '—')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Logomarca:</td>
              <td style="padding: 8px 0;">${d.company_logo_url ? `<a href="${d.company_logo_url}" target="_blank" style="color: #132A41; font-weight: bold;">Visualizar Logo Cadastrada</a>` : 'Não enviada'}</td>
            </tr>
          </tbody>
        </table>
      `;

      const htmlConteudo = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #132A41; padding: 24px; text-align: center; border-bottom: 3px solid #B5642A;">
            <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">AMORIM ACADEMY</h2>
            <p style="margin: 4px 0 0 0; color: #B5642A; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">Solicitação de Alteração de Dados Documentais</p>
          </div>
          
          <div style="padding: 28px 24px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b;">
              O membro <strong>${nomeSolicitante}</strong> (<code>${emailSolicitante}</code>) solicitou a alteração dos seus <strong>Dados para Documentos Técnicos</strong> que estavam confirmados/travados.
            </p>
            
            <div style="margin: 20px 0; padding: 16px 20px; background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #B5642A; border-radius: 8px;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Motivo informado pelo membro:</p>
              <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: 600; white-space: pre-wrap; line-height: 1.5;">${motivo}</p>
            </div>

            <div style="margin: 24px 0; padding: 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: bold; color: #132A41; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Dados Documentais Atuais Cadastrados:
              </h4>
              ${dadosFormatadosHtml}
            </div>

            <div style="margin: 24px 0 10px 0; padding: 14px 16px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #475569;">
                Para aplicar as alterações, acesse a área <strong>Admin → Usuários</strong> na plataforma e edite os dados do usuário.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Plataforma Amorim Academy · Notificação Automática de Suporte
          </div>
        </div>
      `;

      const resultado = await this.enviarEmailViaFunction({
        tipo: 'personalizado',
        destinatarios: ['emanoel.s.amorim@gmail.com'],
        assunto: `Solicitação de alteração de dados documentais — ${nomeSolicitante}`,
        html: htmlConteudo,
        nome: nomeSolicitante,
      });

      return {
        sucesso: resultado.sucesso,
        error: resultado.error
      };
    } catch (e: any) {
      return { sucesso: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async atualizarDadosDocumentaisAdmin(
    userId: string,
    dados: Partial<DadosDocumentaisTecnicos> & { dados_documentais_confirmados?: boolean }
  ): Promise<{ error: Error | null }> {
    try {
      if (!userId) return { error: new Error('ID do usuário não informado.') };

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (dados.full_name !== undefined) updatePayload.full_name = dados.full_name.trim();
      if (dados.professional_title !== undefined) updatePayload.professional_title = dados.professional_title.trim();
      if (dados.categoria_profissional !== undefined) updatePayload.categoria_profissional = dados.categoria_profissional.trim();
      if (dados.crea_cau !== undefined) updatePayload.crea_cau = dados.crea_cau.trim();
      if (dados.company_name !== undefined) updatePayload.company_name = dados.company_name.trim();
      if (dados.razao_social !== undefined) updatePayload.razao_social = dados.razao_social.trim();
      if (dados.cpf_responsavel !== undefined) updatePayload.cpf_responsavel = dados.cpf_responsavel.trim();
      if (dados.company_position !== undefined) updatePayload.company_position = dados.company_position.trim();
      if (dados.company_cnpj !== undefined) updatePayload.company_cnpj = dados.company_cnpj.trim();
      if (dados.company_address !== undefined) updatePayload.company_address = dados.company_address.trim();
      if (dados.company_phone !== undefined) updatePayload.company_phone = dados.company_phone.trim();
      if (dados.company_email !== undefined) updatePayload.company_email = dados.company_email.trim();
      if (dados.company_site !== undefined) updatePayload.company_site = dados.company_site.trim();
      if (dados.social_network_label !== undefined) updatePayload.social_network_label = dados.social_network_label.trim();
      if (dados.social_network_url !== undefined) updatePayload.social_network_url = dados.social_network_url.trim();
      if (dados.company_logo_url !== undefined) updatePayload.company_logo_url = dados.company_logo_url;
      if (dados.dados_documentais_confirmados !== undefined) updatePayload.dados_documentais_confirmados = dados.dados_documentais_confirmados;

      const { error } = await this.client
        .from('profissionais')
        .update(updatePayload)
        .eq('id', userId);

      return { error };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  // ----------------------------------------------------
  // MÉTODOS DO FEED REAL (feed_posts, feed_curtidas, feed_comentarios)
  // ----------------------------------------------------

  async listarFeedPosts(): Promise<any[]> {
    try {
      let { data: posts, error } = await this.client
        .from('feed_posts')
        .select('*, autor:profissionais_publico!feed_posts_autor_id_fkey(id, full_name, professional_title, avatar_url)')
        .order('criado_em', { ascending: false })
        .limit(50);

      if (error) {
        // Fallback 1: sem FK constraint explícita
        const resFallback = await this.client
          .from('feed_posts')
          .select('*, autor:profissionais_publico(id, full_name, professional_title, avatar_url)')
          .order('criado_em', { ascending: false })
          .limit(50);

        if (!resFallback.error && resFallback.data) {
          posts = resFallback.data;
          error = null;
        } else {
          // Fallback 2: busca direta e join manual com profissionais_publico
          const resSimples = await this.client
            .from('feed_posts')
            .select('*')
            .order('criado_em', { ascending: false })
            .limit(50);

          if (!resSimples.error && resSimples.data) {
            const autorIds = [...new Set(resSimples.data.map((p: any) => p.autor_id).filter(Boolean))];
            const autoresMap: Record<string, any> = {};
            if (autorIds.length > 0) {
              let { data: autores } = await this.client
                .from('profissionais_publico')
                .select('id, full_name, professional_title, avatar_url')
                .in('id', autorIds);
              if (!autores || autores.length === 0) {
                const resAutores = await this.client
                  .from('profissionais')
                  .select('id, full_name, professional_title, avatar_url')
                  .in('id', autorIds);
                autores = resAutores.data || [];
              }
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
        .select('*, autor:profissionais_publico!feed_comentarios_autor_id_fkey(id, full_name, professional_title, avatar_url)')
        .in('post_id', postIds)
        .order('criado_em', { ascending: true });

      if (!comentarios) {
        const resComFallback = await this.client
          .from('feed_comentarios')
          .select('*, autor:profissionais_publico(id, full_name, professional_title, avatar_url)')
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
              let { data: comAutores } = await this.client
                .from('profissionais_publico')
                .select('id, full_name, professional_title, avatar_url')
                .in('id', comAutorIds);
              if (!comAutores || comAutores.length === 0) {
                const resComAutores = await this.client
                  .from('profissionais')
                  .select('id, full_name, professional_title, avatar_url')
                  .in('id', comAutorIds);
                comAutores = resComAutores.data || [];
              }
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

  async uploadFotoFeed(file: File): Promise<{ url?: string; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { error: new Error('Não autenticado.') };
      }

      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
      const uniqueName = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);
      const nomeArquivo = `${Date.now()}-${uniqueName}.${ext}`;
      const caminho = `${session.user.id}/${nomeArquivo}`;

      const { error: uploadError } = await this.client.storage
        .from('feed-fotos')
        .upload(caminho, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return { error: new Error(uploadError.message || 'Erro no upload da foto.') };
      }

      const { data: pubData } = this.client.storage
        .from('feed-fotos')
        .getPublicUrl(caminho);

      return { url: pubData?.publicUrl || '', error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  async criarFeedPost(conteudo: string, tag?: string, fotosUrls?: string[]): Promise<{ data?: any; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const { data, error } = await this.client
        .from('feed_posts')
        .insert({
          autor_id: session.user.id,
          conteudo,
          tag: tag || null,
          tipo: 'post',
          fotos_urls: fotosUrls && fotosUrls.length > 0 ? fotosUrls : null,
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
    avatarUrl?: string | null;
    bannerUrl?: string | null;
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
          avatar_url: dados.avatarUrl !== undefined ? dados.avatarUrl : undefined,
          banner_url: dados.bannerUrl !== undefined ? dados.bannerUrl : undefined,
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
  // ACERVO DE MATERIAIS REAL & ACESSOS POR ITEM
  // ----------------------------------------------------

  async listarAcessosItemDoUsuario(tipoItem: 'material' | 'agente'): Promise<string[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];
      const meuId = session.user.id;

      const { data, error } = await this.client
        .from('acessos_item')
        .select('item_id')
        .eq('profissional_id', meuId)
        .eq('tipo_item', tipoItem);

      if (error) {
        console.warn(`Erro ao listar acessos do item (${tipoItem}):`, error.message);
        return [];
      }
      return (data || []).map((r: any) => r.item_id).filter(Boolean);
    } catch (e: any) {
      console.warn(`Exceção ao listar acessos do item (${tipoItem}):`, e?.message || e);
      return [];
    }
  }

  async listarMateriais(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('materiais_visiveis')
        .select('*')
        .or('exclusivo_curso.is.null,exclusivo_curso.eq.false')
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
    pago?: boolean;
    exibir_valor?: boolean;
    valor?: number | null;
    sku?: string | null;
    tipo_arquivo_real?: string | null;
    exclusivo_curso?: boolean;
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
      if (material.pago !== undefined) payload.pago = material.pago;
      if (material.exibir_valor !== undefined) payload.exibir_valor = material.exibir_valor;
      if (material.valor !== undefined) payload.valor = material.valor;
      if (material.sku !== undefined) payload.sku = material.sku;
      if (material.tipo_arquivo_real !== undefined) payload.tipo_arquivo_real = material.tipo_arquivo_real;
      if (material.exclusivo_curso !== undefined) payload.exclusivo_curso = material.exclusivo_curso;

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
      pago: boolean;
      exibir_valor: boolean;
      valor: number | null;
      sku: string | null;
      tipo_arquivo_real: string | null;
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

      // CORREÇÃO DE SEGURANÇA (05/09/2026): não usamos mais o url_arquivo salvo
      // (link assinado de 10 anos, reutilizável para sempre por quem o receber
      // fora do app). Buscamos o storage_path puro e geramos um signed URL novo,
      // de curta duração, a cada clique de download.
      const { data } = await this.client
        .from('materiais')
        .select('url_arquivo, storage_path')
        .eq('id', materialId)
        .maybeSingle();

      if (data?.storage_path) {
        const { data: signedData, error: signedError } = await this.client.storage
          .from('materiais-comunidade')
          .createSignedUrl(data.storage_path, 3600); // 1 hora

        if (!signedError && signedData?.signedUrl) {
          return { error: null, urlArquivo: signedData.signedUrl };
        }
        // Se a geração sob demanda falhar por qualquer motivo, cai no fallback
        // abaixo (url_arquivo legado) para não travar o download do usuário.
      }

      return { error: null, urlArquivo: data?.url_arquivo || null };
    } catch (e: any) {
      return { error: e };
    }
  }

  /**
   * Gera um signed URL de curta duração (padrão 1h) para um anexo de material
   * (tabela material_anexos), a partir do storage_path salvo. Substitui o uso
   * direto de anexo.url_arquivo (que antes guardava um link de 10 anos).
   * Se o anexo não tiver storage_path (registro legado), cai no url_arquivo salvo.
   */
  async gerarUrlDownloadAnexo(anexo: { url_arquivo?: string; storage_path?: string }): Promise<string | null> {
    try {
      if (anexo?.storage_path) {
        const { data, error } = await this.client.storage
          .from('materiais-comunidade')
          .createSignedUrl(anexo.storage_path, 3600);
        if (!error && data?.signedUrl) return data.signedUrl;
      }
      return anexo?.url_arquivo || null;
    } catch {
      return anexo?.url_arquivo || null;
    }
  }

  async uploadArquivoMaterial(
    file: File,
    categoria: string = 'Geral'
  ): Promise<{ error: Error | null; signedUrl?: string | null; path?: string; formato?: string; tamanho?: string; tipoArquivoReal?: string }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Limite de 50 MB (50 * 1024 * 1024) — alinhado ao file_size_limit
      // do bucket materiais-comunidade no Supabase Storage
      const maxBytes = 50 * 1024 * 1024;
      if (file.size > maxBytes) {
        return { error: new Error('O arquivo excede o limite máximo permitido de 50 MB.') };
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

      // CORREÇÃO DE SEGURANÇA (05/09/2026): não geramos mais signed URL de longa
      // duração para salvar permanentemente no banco — um link assim, uma vez
      // vazado (print, WhatsApp, e-mail), fica válido para sempre. O path puro
      // do arquivo é salvo em storage_path; o signed URL correto (curto) é
      // gerado sob demanda a cada download via gerarUrlDownloadMaterial().
      // Ainda geramos um signed URL de curta duração aqui só para permitir a
      // pré-visualização imediata no admin logo após o upload.
      const { data: signedData, error: signedError } = await this.client.storage
        .from('materiais-comunidade')
        .createSignedUrl(path, 3600);

      if (signedError) {
        return { error: signedError, path };
      }

      // Detecta formato a partir da extensão
      const rawExt = file.name.split('.').pop() || '';
      const ext = rawExt.toUpperCase() || 'ARQUIVO';

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
        tamanho: tamanhoStr,
        tipoArquivoReal: rawExt.toLowerCase()
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
        .select('*, autor:profissionais_publico!forum_topicos_autor_id_fkey(id, full_name, professional_title, avatar_url)')
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) {
        topicos = res.data;
      } else {
        const resFallback = await this.client
          .from('forum_topicos')
          .select('*, autor:profissionais_publico(id, full_name, professional_title, avatar_url)')
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
              let { data: autores } = await this.client
                .from('profissionais_publico')
                .select('id, full_name, professional_title, avatar_url')
                .in('id', autorIds);
              if (!autores || autores.length === 0) {
                const resAutores = await this.client
                  .from('profissionais')
                  .select('id, full_name, professional_title, avatar_url')
                  .in('id', autorIds);
                autores = resAutores.data || [];
              }
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
        .select('*, autor:profissionais_publico!forum_respostas_autor_id_fkey(id, full_name, professional_title, avatar_url)')
        .in('topico_id', topicoIds)
        .order('criado_em', { ascending: true });

      if (!resResp.error && resResp.data) {
        respostas = resResp.data;
      } else {
        const resRespFallback = await this.client
          .from('forum_respostas')
          .select('*, autor:profissionais_publico(id, full_name, professional_title, avatar_url)')
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
              let { data: respAutores } = await this.client
                .from('profissionais_publico')
                .select('id, full_name, professional_title, avatar_url')
                .in('id', respAutorIds);
              if (!respAutores || respAutores.length === 0) {
                const resRespAutores = await this.client
                  .from('profissionais')
                  .select('id, full_name, professional_title, avatar_url')
                  .in('id', respAutorIds);
                respAutores = resRespAutores.data || [];
              }
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
        .select('*, autor:profissionais!forum_topicos_autor_id_fkey(id, full_name, professional_title, email, avatar_url)')
        .order('criado_em', { ascending: false });

      if (!res.error && res.data) {
        topicos = res.data;
      } else {
        const resFallback = await this.client
          .from('forum_topicos')
          .select('*, autor:profissionais(id, full_name, professional_title, email, avatar_url)')
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
                .select('id, full_name, professional_title, email, avatar_url')
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
        .select('*, autor:profissionais!forum_respostas_autor_id_fkey(id, full_name, professional_title, email, avatar_url)')
        .in('topico_id', topicoIds)
        .order('criado_em', { ascending: true });

      if (!resResp.error && resResp.data) {
        respostas = resResp.data;
      } else {
        const resRespFallback = await this.client
          .from('forum_respostas')
          .select('*, autor:profissionais(id, full_name, professional_title, email, avatar_url)')
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
                .select('id, full_name, professional_title, email, avatar_url')
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
        ? await this.client.from('profissionais_publico').select('id, full_name, professional_title, avatar_url').in('id', outroParticipanteIds)
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
          avatarUrl: participante?.avatar_url || null,
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
        .from('profissionais_publico')
        .select('id, full_name, professional_title, avatar_url')
        .neq('id', session.user.id)
        .ilike('full_name', `%${termo.trim()}%`)
        .limit(15);
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
  // REDE DE MEMBROS E CONEXÕES (SEGUIR / SEGUIDORES)
  // ----------------------------------------------------

  async listarMembrosComunidade(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('profissionais_publico')
        .select('id, full_name, professional_title, avatar_url')
        .order('full_name', { ascending: true });

      if (error) {
        const fallback = await this.client
          .from('profissionais')
          .select('id, full_name, professional_title, avatar_url')
          .order('full_name', { ascending: true });
        if (fallback.data) return fallback.data;
        console.warn('Erro ao listar membros da comunidade:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar membros da comunidade:', e?.message || e);
      return [];
    }
  }

  async obterMinhasConexoes(): Promise<{ seguindoIds: string[]; seguidoresIds: string[] }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { seguindoIds: [], seguidoresIds: [] };
      const meuId = session.user.id;

      const [seguindoRes, seguidoresRes] = await Promise.all([
        this.client
          .from('conexoes_comunidade')
          .select('seguido_id')
          .eq('seguidor_id', meuId),
        this.client
          .from('conexoes_comunidade')
          .select('seguidor_id')
          .eq('seguido_id', meuId),
      ]);

      const seguindoIds = (seguindoRes.data || []).map((r: any) => r.seguido_id).filter(Boolean);
      const seguidoresIds = (seguidoresRes.data || []).map((r: any) => r.seguidor_id).filter(Boolean);

      return { seguindoIds, seguidoresIds };
    } catch (e: any) {
      console.warn('Exceção ao obter conexões do usuário:', e?.message || e);
      return { seguindoIds: [], seguidoresIds: [] };
    }
  }

  async obterContadoresConexoes(userId: string): Promise<{ totalSeguidores: number; totalSeguindo: number }> {
    try {
      const [seguidoresRes, seguindoRes] = await Promise.all([
        this.client
          .from('conexoes_comunidade')
          .select('*', { count: 'exact', head: true })
          .eq('seguido_id', userId),
        this.client
          .from('conexoes_comunidade')
          .select('*', { count: 'exact', head: true })
          .eq('seguidor_id', userId),
      ]);

      return {
        totalSeguidores: seguidoresRes.count || 0,
        totalSeguindo: seguindoRes.count || 0,
      };
    } catch (e: any) {
      console.warn('Exceção ao obter contadores de conexões:', e?.message || e);
      return { totalSeguidores: 0, totalSeguindo: 0 };
    }
  }

  async seguirMembro(seguidoId: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const meuId = session.user.id;

      if (meuId === seguidoId) {
        return { error: new Error('Você não pode seguir a si mesmo.') };
      }

      const { error } = await this.client
        .from('conexoes_comunidade')
        .insert({
          seguidor_id: meuId,
          seguido_id: seguidoId,
        });

      if (error) {
        // Se já seguir (duplicado), considerar sucesso idempontente
        if (error.code === '23505' || error.message.includes('unique') || error.message.includes('already exists')) {
          return { error: null };
        }
        return { error };
      }
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async deixarDeSeguirMembro(seguidoId: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };
      const meuId = session.user.id;

      const { error } = await this.client
        .from('conexoes_comunidade')
        .delete()
        .eq('seguidor_id', meuId)
        .eq('seguido_id', seguidoId);

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarMembrosQueSigo(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];
      const meuId = session.user.id;

      const { data: conexoes, error: conexoesErr } = await this.client
        .from('conexoes_comunidade')
        .select('seguido_id, criado_em')
        .eq('seguidor_id', meuId)
        .order('criado_em', { ascending: false });

      if (conexoesErr || !conexoes || conexoes.length === 0) {
        return [];
      }

      const seguidoIds = conexoes.map((c: any) => c.seguido_id).filter(Boolean);
      if (seguidoIds.length === 0) return [];

      let { data: profs, error: profsErr } = await this.client
        .from('profissionais_publico')
        .select('id, full_name, professional_title, avatar_url')
        .in('id', seguidoIds);

      if (profsErr || !profs || profs.length === 0) {
        const fallback = await this.client
          .from('profissionais')
          .select('id, full_name, professional_title, avatar_url')
          .in('id', seguidoIds);
        if (fallback.data) profs = fallback.data;
      }

      if (!profs) return [];

      const profsMap = new Map<string, any>();
      profs.forEach((p: any) => profsMap.set(p.id, p));

      return seguidoIds.map((id: string) => profsMap.get(id)).filter(Boolean);
    } catch (e: any) {
      console.warn('Exceção ao listar membros seguidos:', e?.message || e);
      return [];
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
    instrutor_nome?: string | null;
    instrutor_qualificacao?: string | null;
    tem_avaliacao_por_modulo?: boolean;
    nota_minima_avaliacao_modulo?: number;
    nota_minima_avaliacao_final?: number;
    tem_prazo?: boolean;
    prazo_dias?: number;
    data_inicio?: string | null;
    data_fim?: string | null;
    formato?: string | null;
    local?: string | null;
    imagem_capa_url?: string | null;
    exibir_na_agenda?: boolean;
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
      if (curso.instrutor_nome !== undefined) payload.instrutor_nome = curso.instrutor_nome;
      if (curso.instrutor_qualificacao !== undefined) payload.instrutor_qualificacao = curso.instrutor_qualificacao;
      if (curso.tem_avaliacao_por_modulo !== undefined) payload.tem_avaliacao_por_modulo = curso.tem_avaliacao_por_modulo;
      if (curso.nota_minima_avaliacao_modulo !== undefined) payload.nota_minima_avaliacao_modulo = curso.nota_minima_avaliacao_modulo;
      if (curso.nota_minima_avaliacao_final !== undefined) payload.nota_minima_avaliacao_final = curso.nota_minima_avaliacao_final;
      if (curso.tem_prazo !== undefined) payload.tem_prazo = curso.tem_prazo;
      if (curso.prazo_dias !== undefined) payload.prazo_dias = curso.prazo_dias;
      if (curso.data_inicio !== undefined) payload.data_inicio = curso.data_inicio;
      if (curso.data_fim !== undefined) payload.data_fim = curso.data_fim;
      if (curso.formato !== undefined) payload.formato = curso.formato;
      if (curso.local !== undefined) payload.local = curso.local;
      if (curso.imagem_capa_url !== undefined) payload.imagem_capa_url = curso.imagem_capa_url;
      if (curso.exibir_na_agenda !== undefined) payload.exibir_na_agenda = curso.exibir_na_agenda;

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
    youtube_id?: string;
    ordem: number;
    exige_avaliacao?: boolean;
    trava_proximo_modulo?: boolean;
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
      if (modulo.youtube_id !== undefined) payload.youtube_id = modulo.youtube_id;
      if (modulo.exige_avaliacao !== undefined) payload.exige_avaliacao = modulo.exige_avaliacao;
      if (modulo.trava_proximo_modulo !== undefined) payload.trava_proximo_modulo = modulo.trava_proximo_modulo;

      const { data, error } = await this.client.from('cursos_modulos').insert(payload).select().single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarModuloCurso(
    id: string,
    dados: Partial<{
      titulo: string;
      descricao: string;
      duracao: string;
      vimeo_id: string;
      youtube_id: string;
      ordem: number;
      exige_avaliacao: boolean;
      trava_proximo_modulo: boolean;
    }>
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
      await this.client.from('cursos_modulos_materiais').delete().eq('modulo_id', id);
      await this.client.from('cursos_modulos_avaliacoes').delete().eq('modulo_id', id);
      await this.client.from('cursos_progresso_modulo').delete().eq('modulo_id', id);
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
          prazo_final_calculado: matricula?.prazo_final_calculado || null,
          tem_prazo: c.tem_prazo || false,
          prazo_dias: c.prazo_dias || null,
          tem_avaliacao_por_modulo: c.tem_avaliacao_por_modulo || false,
          nota_minima_avaliacao_modulo: c.nota_minima_avaliacao_modulo != null ? Number(c.nota_minima_avaliacao_modulo) : 70,
          nota_minima_avaliacao_final: c.nota_minima_avaliacao_final != null ? Number(c.nota_minima_avaliacao_final) : 70,
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar cursos para aluno:', e?.message || e);
      return [];
    }
  }

  async buscarProgressoModulos(matriculaId: string): Promise<any[]> {
    try {
      if (!matriculaId) return [];
      const { data, error } = await this.client
        .from('cursos_progresso_modulo')
        .select('*')
        .eq('matricula_id', matriculaId);

      if (error) {
        console.warn('Aviso ao buscar progresso dos módulos:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao buscar progresso dos módulos:', e?.message || e);
      return [];
    }
  }

  async moduloEstaLiberado(matriculaId: string, moduloId: string): Promise<boolean> {
    try {
      if (!matriculaId || !moduloId) return true;
      const { data, error } = await this.client.rpc('modulo_curso_liberado', {
        p_matricula_id: matriculaId,
        p_modulo_id: moduloId
      });

      if (!error && typeof data === 'boolean') {
        return data;
      }
      return true;
    } catch (e: any) {
      console.warn('Exceção ao consultar liberação do módulo via RPC:', e?.message || e);
      return true;
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
      const novosModulos = modulosAtuais.includes(moduloId) ? modulosAtuais : [...modulosAtuais, moduloId];

      const { data: upsertData, error } = await this.client
        .from('cursos_matriculas')
        .upsert({
          curso_id: cursoId,
          profissional_id: meuId,
          modulos_concluidos: novosModulos,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'curso_id,profissional_id' })
        .select('id')
        .single();

      if (error) {
        return { error };
      }

      const matId = existente?.id || upsertData?.id;
      if (matId) {
        // Registra também na tabela cursos_progresso_modulo com colunas reais
        const { error: erroProgresso } = await this.client
          .from('cursos_progresso_modulo')
          .upsert({
            matricula_id: matId,
            modulo_id: moduloId,
            video_concluido: true,
            video_concluido_em: new Date().toISOString(),
            avaliacao_modulo_aprovada: true,
            avaliacao_modulo_nota: 100,
          }, { onConflict: 'matricula_id,modulo_id' });

        if (erroProgresso) {
          console.warn('Falha ao registrar progresso do módulo (video_concluido):', erroProgresso.message);
          return { error: erroProgresso };
        }
      } else {
        console.warn('marcarModuloConcluido: matId não obtido após upsert em cursos_matriculas — progresso não registrado.');
        return { error: new Error('Não foi possível confirmar a matrícula. Recarregue a página e tente novamente.') };
      }

      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarMateriaisDoModulo(moduloId: string): Promise<any[]> {
    try {
      if (!moduloId) return [];

      const res = await this.client
        .from('cursos_modulos_materiais')
        .select('*, material:materiais(*)')
        .eq('modulo_id', moduloId);

      if (!res.error && res.data && res.data.length > 0 && res.data[0].material) {
        return res.data;
      }

      // Fallback em caso de foreign key não resolvida no Supabase schema cache
      const { data: vinculos, error: errVinculos } = await this.client
        .from('cursos_modulos_materiais')
        .select('*')
        .eq('modulo_id', moduloId);

      if (errVinculos || !vinculos || vinculos.length === 0) return [];

      const matIds = vinculos.map((v: any) => v.material_id).filter(Boolean);
      if (matIds.length === 0) return [];

      const { data: mats } = await this.client
        .from('materiais')
        .select('*')
        .in('id', matIds);

      const matsMap = new Map<string, any>();
      (mats || []).forEach((m: any) => matsMap.set(m.id, m));

      return vinculos.map((v: any) => ({
        ...v,
        material: matsMap.get(v.material_id) || null
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar materiais do módulo:', e?.message || e);
      return [];
    }
  }

  async vincularMaterialAoModulo(
    moduloId: string,
    materialId: string,
    obrigatorio: boolean = false
  ): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('cursos_modulos_materiais')
        .upsert({
          modulo_id: moduloId,
          material_id: materialId,
          obrigatorio: !!obrigatorio,
        }, { onConflict: 'modulo_id,material_id' })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async desvincularMaterialDoModulo(moduloId: string, materialId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('cursos_modulos_materiais')
        .delete()
        .eq('modulo_id', moduloId)
        .eq('material_id', materialId);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async buscarAvaliacaoModulo(moduloId: string): Promise<any[]> {
    try {
      if (!moduloId) return [];
      const { data, error } = await this.client
        .from('cursos_modulos_avaliacoes')
        .select('*')
        .eq('modulo_id', moduloId)
        .order('ordem', { ascending: true });

      if (error) {
        console.warn('Aviso ao buscar avaliação do módulo:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao buscar avaliação do módulo:', e?.message || e);
      return [];
    }
  }

  async listarAvaliacoesDoModulo(moduloId: string): Promise<any[]> {
    return this.buscarAvaliacaoModulo(moduloId);
  }

  async salvarQuestoesAvaliacaoModulo(moduloId: string, questoes: any[]): Promise<{ error: Error | null }> {
    try {
      if (!moduloId) return { error: new Error('Módulo não informado.') };

      // Deleta as anteriores
      await this.client
        .from('cursos_modulos_avaliacoes')
        .delete()
        .eq('modulo_id', moduloId);

      if (questoes.length === 0) {
        return { error: null };
      }

      const payload = questoes.map((q, idx) => ({
        modulo_id: moduloId,
        pergunta: q.pergunta?.trim() || '',
        alternativas: q.alternativas && typeof q.alternativas === 'object' ? q.alternativas : [],
        resposta_correta: q.resposta_correta,
        ordem: q.ordem !== undefined ? q.ordem : (idx + 1)
      }));

      const { error } = await this.client
        .from('cursos_modulos_avaliacoes')
        .insert(payload);

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async submeterAvaliacaoModulo(
    matriculaId: string,
    moduloId: string,
    respostas: Record<string, any>,
    cursoId?: string
  ): Promise<{
    error: Error | null;
    nota: number;
    aprovado: boolean;
    totalQuestoes: number;
    acertos: number;
    notaMinimaExigida: number;
  }> {
    try {
      const questoes = await this.buscarAvaliacaoModulo(moduloId);
      if (questoes.length === 0) {
        if (cursoId) {
          await this.marcarModuloConcluido(cursoId, moduloId);
        }
        return {
          error: null,
          nota: 100,
          aprovado: true,
          totalQuestoes: 0,
          acertos: 0,
          notaMinimaExigida: 70
        };
      }

      let acertos = 0;
      questoes.forEach(q => {
        const respUser = respostas[q.id];
        if (respUser !== undefined && respUser !== null) {
          if (String(respUser).trim().toLowerCase() === String(q.resposta_correta).trim().toLowerCase()) {
            acertos++;
          }
        }
      });

      const totalQuestoes = questoes.length;
      const nota = Math.round((acertos / totalQuestoes) * 100);

      let notaMinima = 70;
      if (cursoId) {
        const { data: curso } = await this.client
          .from('cursos')
          .select('nota_minima_avaliacao_modulo')
          .eq('id', cursoId)
          .maybeSingle();
        if (curso?.nota_minima_avaliacao_modulo != null) {
          notaMinima = Number(curso.nota_minima_avaliacao_modulo);
        }
      }

      const aprovado = nota >= notaMinima;

      // Upsert no progresso do módulo — nomes de coluna corrigidos para
      // bater com o schema real de cursos_progresso_modulo, que é o que
      // modulo_curso_liberado() lê para decidir a liberação do próximo módulo.
      const { error } = await this.client
        .from('cursos_progresso_modulo')
        .upsert({
          matricula_id: matriculaId,
          modulo_id: moduloId,
          video_concluido: true,
          video_concluido_em: new Date().toISOString(),
          avaliacao_modulo_aprovada: aprovado,
          avaliacao_modulo_nota: nota,
        }, { onConflict: 'matricula_id,modulo_id' });

      if (error) {
        console.warn('Erro ao atualizar cursos_progresso_modulo:', error.message);
      }

      if (aprovado && cursoId) {
        await this.marcarModuloConcluido(cursoId, moduloId);
      }

      return {
        error: null,
        nota,
        aprovado,
        totalQuestoes,
        acertos,
        notaMinimaExigida: notaMinima
      };
    } catch (e: any) {
      return {
        error: e,
        nota: 0,
        aprovado: false,
        totalQuestoes: 0,
        acertos: 0,
        notaMinimaExigida: 70
      };
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
      let { count, error } = await this.client
        .from('profissionais_publico')
        .select('*', { count: 'exact', head: true });
      if (error || count === null) {
        const fallback = await this.client
          .from('profissionais')
          .select('*', { count: 'exact', head: true });
        return fallback.count || 0;
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
        .select('*, autor:profissionais!blog_posts_autor_id_fkey(id, full_name), blog_post_tags(blog_tags(id, nome, slug))')
        .order('criado_em', { ascending: false });

      const bruto = (!res.error && res.data) ? res.data : (
        await this.client
          .from('blog_posts')
          .select('*, autor:profissionais(id, full_name), blog_post_tags(blog_tags(id, nome, slug))')
          .order('criado_em', { ascending: false })
      ).data || [];

      return bruto.map((post: any) => ({
        ...post,
        tags: (post.blog_post_tags || []).map((pt: any) => pt.blog_tags).filter(Boolean),
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar posts (admin):', e?.message || e);
      return [];
    }
  }

  async listarPostsPublicados(): Promise<any[]> {
    try {
      const session = await this.getSession();
      const meuId = session?.user?.id;
      const meuVisitanteId = meuId ? null : obterVisitanteId();
      const { data, error } = await this.client
        .from('blog_posts')
        .select('*, blog_post_tags(blog_tags(id, nome, slug)), blog_curtidas(profissional_id, visitante_id)')
        .eq('publicado', true)
        .order('criado_em', { ascending: false });
      if (error) {
        console.warn('Erro ao listar posts publicados:', error.message);
        return [];
      }
      return (data || []).map((post: any) => {
        const curtidas = post.blog_curtidas || [];
        return {
          ...post,
          tags: (post.blog_post_tags || []).map((pt: any) => pt.blog_tags).filter(Boolean),
          totalCurtidas: curtidas.length,
          curtidoPorMim: meuId
            ? curtidas.some((c: any) => c.profissional_id === meuId)
            : curtidas.some((c: any) => c.visitante_id === meuVisitanteId),
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar posts publicados:', e?.message || e);
      return [];
    }
  }

  async toggleCurtidaBlogPost(postId: string, curtidoAtualmente: boolean): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      const usuarioLogado = session?.user?.id ?? null;
      const visitanteId = usuarioLogado ? null : obterVisitanteId();

      if (curtidoAtualmente) {
        const query = this.client.from('blog_curtidas').delete().eq('post_id', postId);
        const { error } = usuarioLogado
          ? await query.eq('profissional_id', usuarioLogado)
          : await query.eq('visitante_id', visitanteId);
        return { error };
      } else {
        const { error } = await this.client
          .from('blog_curtidas')
          .insert(
            usuarioLogado
              ? { post_id: postId, profissional_id: usuarioLogado }
              : { post_id: postId, visitante_id: visitanteId }
          );
        return { error };
      }
    } catch (e: any) {
      return { error: e };
    }
  }

  async gerarAnaliseEvte(
    tipologiasIds: string[],
    restricoes: Record<string, any>
  ): Promise<{ data?: any; error: Error | null; codigo?: string; usoAtual?: number; limite?: number }> {
    try {
      const { data, error } = await this.client.functions.invoke('evte-analise', {
        body: { tipologiasIds, restricoes },
      });
      if (error) {
        // Tenta extrair a mensagem estruturada do corpo do erro, quando disponível
        const contexto = (error as any)?.context;
        if (contexto && typeof contexto.json === 'function') {
          try {
            const corpo = await contexto.json();
            return { error: new Error(corpo.error || error.message), codigo: corpo.codigo, usoAtual: corpo.usoAtual, limite: corpo.limite };
          } catch {
            // segue para o retorno genérico abaixo
          }
        }
        return { error };
      }
      return { data, error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarHistoricoEvte(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('evte_analises')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(20);
      if (error) {
        console.warn('Erro ao listar histórico EVTE:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar histórico EVTE:', e?.message || e);
      return [];
    }
  }

  async listarTipologiasPrediais(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('tipologias_prediais')
        .select('*')
        .order('numero', { ascending: true });
      if (error) {
        console.warn('Erro ao listar tipologias prediais:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar tipologias prediais:', e?.message || e);
      return [];
    }
  }

  async listarTodasTags(): Promise<{ id: string; nome: string; slug: string }[]> {
    try {
      const { data, error } = await this.client
        .from('blog_tags')
        .select('id, nome, slug')
        .order('nome', { ascending: true });
      if (error) {
        console.warn('Erro ao listar tags:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar tags:', e?.message || e);
      return [];
    }
  }

  async definirTagsDoPost(postId: string, tagIds: string[]): Promise<{ error: Error | null }> {
    try {
      const del = await this.client.from('blog_post_tags').delete().eq('post_id', postId);
      if (del.error) return { error: del.error };
      if (tagIds.length === 0) return { error: null };
      const payload = tagIds.map(tagId => ({ post_id: postId, tag_id: tagId }));
      const ins = await this.client.from('blog_post_tags').insert(payload);
      return { error: ins.error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async criarPost(post: {
    titulo: string;
    resumo?: string;
    conteudo: string;
    categoria: string;
    imagem_capa_url?: string;
    galeria_urls?: string[];
    video_url?: string | null;
    data_agendada?: string | null;
    tagIds?: string[];
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { tagIds, ...postSemTags } = post;
      const session = await this.getSession();
      const payload: Record<string, any> = {
        ...postSemTags,
        autor_id: session?.user?.id || null,
        publicado: false,
      };
      const { data, error } = await this.client.from('blog_posts').insert(payload).select().single();
      if (error || !data) return { error, data };

      if (tagIds && tagIds.length > 0) {
        const tagResult = await this.definirTagsDoPost(data.id, tagIds);
        if (tagResult.error) {
          console.warn('Post criado, mas houve erro ao gravar tags:', tagResult.error.message);
        }
      }
      return { error: null, data };
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
      galeria_urls: string[];
      video_url: string | null;
      data_agendada: string | null;
      publicado: boolean;
      tagIds: string[];
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { tagIds, ...dadosSemTags } = dados;
      const { error } = await this.client
        .from('blog_posts')
        .update({ ...dadosSemTags, atualizado_em: new Date().toISOString() })
        .eq('id', id);
      if (error) return { error };

      if (tagIds !== undefined) {
        const tagResult = await this.definirTagsDoPost(id, tagIds);
        if (tagResult.error) return { error: tagResult.error };
      }
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  }

  async agendarPost(id: string, dataAgendada: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('blog_posts')
        .update({
          data_agendada: dataAgendada,
          publicado: false,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async cancelarAgendamento(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('blog_posts')
        .update({
          data_agendada: null,
          publicado: false,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async publicarAgora(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('blog_posts')
        .update({
          publicado: true,
          atualizado_em: new Date().toISOString(),
        })
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

  async uploadImagemPerfil(
    tipo: 'avatar' | 'banner' | 'logo',
    file: File
  ): Promise<{ error: Error | null; url?: string | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Validação de formato
      const formatosValidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!formatosValidos.includes(file.type.toLowerCase())) {
        return {
          error: new Error('Formato não suportado. Utilize imagens no formato JPG, PNG ou WebP.')
        };
      }

      // Validação de tamanho: Avatar máx 2MB, Banner máx 5MB, Logo máx 5MB
      const maxBytes = tipo === 'avatar' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      const limiteTexto = tipo === 'avatar' ? '2 MB' : '5 MB';
      if (file.size > maxBytes) {
        const rotulo = tipo === 'avatar' ? 'a foto de perfil' : (tipo === 'banner' ? 'o banner' : 'a logomarca da empresa');
        return {
          error: new Error(`O arquivo excede o limite máximo permitido de ${limiteTexto} para ${rotulo}.`)
        };
      }

      const cleanName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      const subpasta = tipo === 'avatar' ? 'avatares' : (tipo === 'banner' ? 'banners' : 'logos');
      const path = `perfil/${subpasta}/${session.user.id}_${Date.now()}_${cleanName}`;

      // Upload para o bucket materiais-comunidade
      const { error: uploadError } = await this.client.storage
        .from('materiais-comunidade')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return { error: uploadError };
      }

      // Signed URL de longa duração (10 anos = 315360000s)
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

  async creditarPontosLeituraArtigo(postId: string, tituloPost?: string): Promise<void> {
    try {
      const session = await this.getSession();
      if (!session?.user || !postId) return;

      // A verificação de duplicidade e a validação do usuário agora
      // acontecem dentro da função RPC (via auth.uid()), não é mais
      // necessário checar aqui antes de chamar.
      const { error } = await this.client.rpc('creditar_pontos_leitura_artigo', {
        p_post_id: postId,
        p_titulo: tituloPost || null,
      });

      if (error) {
        console.warn('Falha ao creditar pontos de leitura de artigo:', error.message);
      }
    } catch (err: any) {
      console.warn('Exceção ao creditar pontos de leitura de artigo:', err?.message || err);
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
  // NOTIFICAÇÕES (BLOCO 6 PARTE 2 - SEGMENTAÇÃO & CANAIS)
  // ----------------------------------------------------

  async enviarNotificacao(
    titulo: string,
    mensagem: string,
    enviarPorEmail: boolean = false
  ): Promise<{ error: Error | null; totalEmailsEnviados?: number; totalEmailsFalhas?: number }> {
    return this.enviarNotificacaoSegmentada({
      titulo,
      mensagem,
      modoDestinatario: 'todos',
      canalSino: true,
      canalEmail: enviarPorEmail,
      canalPredial: false,
    });
  }

  async enviarNotificacaoSegmentada(dados: {
    titulo: string;
    mensagem: string;
    modoDestinatario: 'todos' | 'perfil' | 'modulo' | 'individual';
    perfilNome?: string;
    moduloNome?: string;
    destinatariosIds?: string[]; // modo individual
    canalSino: boolean;
    canalEmail: boolean;
    canalPredial: boolean;
  }): Promise<{
    error: Error | null;
    totalDestinatarios?: number;
    totalEmailsEnviados?: number;
    jsonPredial?: string;
  }> {
    try {
      const session = await this.getSession();

      // 1. Resolver lista de destinatários conforme modoDestinatario
      let idsDestino: string[] = [];
      let emailsDestino: string[] = [];

      if (dados.modoDestinatario === 'todos') {
        // Broadcast total: destinatario_id = null
      } else if (dados.modoDestinatario === 'perfil') {
        const { data } = await this.client
          .from('profissionais')
          .select('id, email')
          .eq('nivel_atual', dados.perfilNome || '');
        idsDestino = (data || []).map((p: any) => p.id).filter(Boolean);
        emailsDestino = (data || [])
          .map((p: any) => p.email?.trim()?.toLowerCase())
          .filter((e: string) => Boolean(e) && e.includes('@'));
      } else if (dados.modoDestinatario === 'modulo') {
        const { data } = await this.client
          .from('permissoes_acesso')
          .select('profissional_id, liberado')
          .eq('modulo', dados.moduloNome || '')
          .eq('liberado', true);
        idsDestino = [...new Set((data || []).map((p: any) => p.profissional_id).filter(Boolean))];
        if (idsDestino.length > 0) {
          const { data: profs } = await this.client
            .from('profissionais')
            .select('email')
            .in('id', idsDestino);
          emailsDestino = (profs || [])
            .map((p: any) => p.email?.trim()?.toLowerCase())
            .filter((e: string) => Boolean(e) && e.includes('@'));
        }
      } else if (dados.modoDestinatario === 'individual') {
        idsDestino = dados.destinatariosIds || [];
        if (idsDestino.length > 0) {
          const { data } = await this.client
            .from('profissionais')
            .select('email')
            .in('id', idsDestino);
          emailsDestino = (data || [])
            .map((p: any) => p.email?.trim()?.toLowerCase())
            .filter((e: string) => Boolean(e) && e.includes('@'));
        }
      }

      // 2. Canal Sino da Comunidade
      if (dados.canalSino) {
        if (dados.modoDestinatario === 'todos') {
          const { error: errSino } = await this.client.from('notificacoes').insert({
            titulo: dados.titulo,
            mensagem: dados.mensagem,
            destinatario_id: null,
            tipo: 'geral',
            criado_por: session?.user?.id || null,
          });
          if (errSino) return { error: errSino };
        } else {
          const linhas = idsDestino.map((id) => ({
            titulo: dados.titulo,
            mensagem: dados.mensagem,
            destinatario_id: id,
            tipo: 'geral',
            criado_por: session?.user?.id || null,
          }));
          if (linhas.length > 0) {
            const { error: errSino } = await this.client.from('notificacoes').insert(linhas);
            if (errSino) return { error: errSino };
          }
        }
      }

      // 3. Canal E-mail via Resend
      let totalEmailsEnviados = 0;
      if (dados.canalEmail) {
        let listaEmails: string[] = [];
        if (dados.modoDestinatario === 'todos') {
          const { data: todos } = await this.client
            .from('profissionais')
            .select('email')
            .not('email', 'is', null);
          listaEmails = (todos || [])
            .map((p: any) => p.email?.trim()?.toLowerCase())
            .filter((e: string) => Boolean(e) && e.includes('@'));
        } else {
          listaEmails = emailsDestino;
        }

        const emailsUnicos = [...new Set(listaEmails)] as string[];
        if (emailsUnicos.length > 0) {
          const res = await this.enviarEmailViaFunction({
            tipo: 'notificacao',
            destinatarios: emailsUnicos,
            titulo: dados.titulo,
            mensagem: dados.mensagem,
          });
          totalEmailsEnviados = res.totalEnviados || 0;
        }
      }

      // 4. Canal Predial 4.0 — JSON pronto para copiar
      let jsonPredial: string | undefined;
      if (dados.canalPredial) {
        jsonPredial = JSON.stringify(
          {
            titulo: dados.titulo,
            mensagem: dados.mensagem,
            data: new Date().toISOString(),
          },
          null,
          2
        );
      }

      return {
        error: null,
        totalDestinatarios: dados.modoDestinatario === 'todos' ? undefined : idsDestino.length,
        totalEmailsEnviados,
        jsonPredial,
      };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async listarModulosDistintosPermissoes(): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('permissoes_acesso')
        .select('modulo')
        .order('modulo', { ascending: true });
      if (error) {
        console.warn('Aviso ao listar módulos de permissoes_acesso:', error.message);
        return [];
      }
      const modulos = (data || []).map((d: any) => d.modulo).filter(Boolean);
      return [...new Set(modulos)] as string[];
    } catch (e: any) {
      console.warn('Exceção ao listar módulos distintos:', e?.message || e);
      return [];
    }
  }

  async buscarProfissionaisParaNotificacao(termo: string): Promise<any[]> {
    try {
      const termoLimpo = (termo || '').trim();
      if (!termoLimpo) return [];
      const { data, error } = await this.client
        .from('profissionais')
        .select('id, full_name, email, avatar_url, professional_title, nivel_atual')
        .or(`full_name.ilike.%${termoLimpo}%,email.ilike.%${termoLimpo}%`)
        .limit(15);
      if (error) {
        const { data: fallback } = await this.client
          .from('profissionais')
          .select('id, full_name, email, avatar_url, professional_title, nivel_atual')
          .ilike('full_name', `%${termoLimpo}%`)
          .limit(15);
        return fallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao buscar profissionais para notificação:', e?.message || e);
      return [];
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

  async registrarAtividadeDiaria(tipo: 'acesso' | 'agente_ia'): Promise<void> {
    try {
      // Fire-and-forget: chama RPC registrar_atividade_diaria sem travar UI
      Promise.resolve(this.client.rpc('registrar_atividade_diaria', { p_tipo: tipo }))
        .then((res: any) => {
          if (res?.error) {
            console.warn(`Aviso ao registrar atividade diária (${tipo}):`, res.error.message);
          }
        })
        .catch((err: any) => {
          console.warn(`Erro na chamada RPC registrar atividade diária (${tipo}):`, err);
        });
    } catch (e: any) {
      console.warn('Exceção ao disparar registrar atividade:', e);
    }
  }

  async listarNotificacoesParaMim(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      let query = this.client
        .from('notificacoes')
        .select('*')
        .or(`destinatario_id.is.null,destinatario_id.eq.${session.user.id}`)
        .order('criado_em', { ascending: false })
        .limit(30);

      const { data: notificacoes, error } = await query;
      if (error) {
        // Fallback: busca geral caso a coluna/filtro or apresente restrição
        const resFallback = await this.client
          .from('notificacoes')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(30);

        if (resFallback.error) {
          console.warn('Erro ao listar notificações para o usuário:', error.message || resFallback.error.message);
          return [];
        }

        const { data: leituras } = await this.client
          .from('notificacoes_leituras')
          .select('notificacao_id')
          .eq('profissional_id', session.user.id);

        const idsLidos = new Set((leituras || []).map((l: any) => l.notificacao_id));

        return (resFallback.data || []).map((n: any) => ({
          ...n,
          lida: n.lida === true || idsLidos.has(n.id),
        }));
      }

      const { data: leituras } = await this.client
        .from('notificacoes_leituras')
        .select('notificacao_id')
        .eq('profissional_id', session.user.id);

      const idsLidos = new Set((leituras || []).map((l: any) => l.notificacao_id));

      return (notificacoes || []).map((n: any) => ({
        ...n,
        lida: n.lida === true || idsLidos.has(n.id),
      }));
    } catch (e: any) {
      console.warn('Exceção ao listar notificações para o usuário:', e?.message || e);
      return [];
    }
  }

  async marcarNotificacaoComoLida(notificacaoId: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) return { error: new Error('Não autenticado.') };

      // Se a notificação for pessoal (destinatario_id = me), atualiza também diretamente na tabela se possível
      try {
        await this.client
          .from('notificacoes')
          .update({ lida: true })
          .eq('id', notificacaoId)
          .eq('destinatario_id', session.user.id);
      } catch {
        // ignora se for notificação geral
      }

      const { error } = await this.client
        .from('notificacoes_leituras')
        .upsert({ notificacao_id: notificacaoId, profissional_id: session.user.id }, { onConflict: 'notificacao_id,profissional_id' });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  /* ==========================================================================
     GAMIFICAÇÃO & HALL DA FAMA (PREMIAÇÕES E HISTÓRICO)
     ========================================================================== */

  async listarPremiosGamificacao(mes?: number, ano?: number, apenasAtivos: boolean = false): Promise<any[]> {
    try {
      let query = this.client
        .from('gamificacao_premios')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .order('posicao', { ascending: true });

      if (ano !== undefined && ano !== null) {
        query = query.eq('ano', ano);
      }
      if (mes !== undefined && mes !== null) {
        query = query.eq('mes', mes);
      }
      if (apenasAtivos) {
        query = query.eq('ativo', true);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Aviso ao listar prêmios de gamificação:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar prêmios de gamificação:', e?.message || e);
      return [];
    }
  }

  async criarPremioGamificacao(premio: {
    mes: number;
    ano: number;
    posicao: number;
    titulo: string;
    descricao?: string;
    imagem_url?: string;
    ativo?: boolean;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('gamificacao_premios')
        .insert({
          mes: premio.mes,
          ano: premio.ano,
          posicao: premio.posicao,
          titulo: premio.titulo,
          descricao: premio.descricao || null,
          imagem_url: premio.imagem_url || null,
          ativo: premio.ativo !== false,
        })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarPremioGamificacao(
    id: string,
    dados: Partial<{
      mes: number;
      ano: number;
      posicao: number;
      titulo: string;
      descricao: string;
      imagem_url: string;
      ativo: boolean;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('gamificacao_premios')
        .update(dados)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirPremioGamificacao(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('gamificacao_premios')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarHistoricoVencedores(ano?: number, mes?: number): Promise<any[]> {
    try {
      let query = this.client
        .from('gamificacao_historico_vencedores')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .order('posicao', { ascending: true });

      if (ano !== undefined && ano !== null) {
        query = query.eq('ano', ano);
      }
      if (mes !== undefined && mes !== null) {
        query = query.eq('mes', mes);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Aviso ao listar histórico de vencedores:', error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Enriquecer dados dos profissionais
      const userIds = [...new Set(data.map((d: any) => d.user_id || d.profissional_id).filter(Boolean))];
      const profsMap: Record<string, any> = {};
      if (userIds.length > 0) {
        let { data: profs } = await this.client
          .from('profissionais_publico')
          .select('id, full_name, avatar_url, professional_title')
          .in('id', userIds);
        if (!profs || profs.length === 0) {
          const fallback = await this.client
            .from('profissionais')
            .select('id, full_name, avatar_url, professional_title, nivel_atual')
            .in('id', userIds);
          profs = fallback.data || [];
        }
        (profs || []).forEach((p: any) => {
          profsMap[p.id] = p;
        });
      }

      return data.map((d: any) => {
        const p = profsMap[d.user_id || d.profissional_id];
        return {
          ...d,
          nome_exibicao: d.nome_exibicao || d.nome || p?.full_name || 'Membro da Comunidade',
          avatar_url: d.avatar_url || p?.avatar_url || null,
          professional_title: d.professional_title || p?.professional_title || null,
          nivel_atual: d.nivel_atual || p?.nivel_atual || 'Membro Ativo',
        };
      });
    } catch (e: any) {
      console.warn('Exceção ao listar histórico de vencedores:', e?.message || e);
      return [];
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

  // ----------------------------------------------------
  // CURSOS — AGENDA PÚBLICA & PARCEIROS (DOCENTES / SOFTWARES / EMPRESAS)
  // ----------------------------------------------------

  async listarCursosAgenda(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('cursos')
        .select('*')
        .eq('exibir_na_agenda', true)
        .order('data_inicio', { ascending: true, nullsFirst: false });
      if (error) {
        console.warn('Erro ao listar cursos da agenda pública:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar cursos da agenda pública:', e?.message || e);
      return [];
    }
  }

  /**
   * Lista os módulos de um curso público (exibir_na_agenda = true) para
   * exibição no balão de detalhes da Amorim Academy. Retorna apenas
   * título, duração e ordem — nunca vimeo_id/youtube_id, que não devem
   * ser expostos a visitantes anônimos.
   */
  async listarModulosPublicosDoCurso(cursoId: string): Promise<Array<{ titulo: string; duracao: string | null; ordem: number }>> {
    try {
      const { data, error } = await this.client
        .from('cursos_modulos')
        .select('titulo, duracao, ordem')
        .eq('curso_id', cursoId)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar módulos públicos do curso:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar módulos públicos do curso:', e?.message || e);
      return [];
    }
  }

  async atualizarCampoAgendaCurso(
    id: string,
    dados: {
      data_inicio?: string | null;
      data_fim?: string | null;
      formato?: string | null;
      local?: string | null;
      imagem_capa_url?: string | null;
      exibir_na_agenda?: boolean;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.from('cursos').update(dados).eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // --- PROFESSORES PARCEIROS ---

  async listarProfessoresParceirosAtivos(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('professores_parceiros')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar professores parceiros ativos:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar professores parceiros:', e?.message || e);
      return [];
    }
  }

  async listarTodosProfessoresParceirosAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('professores_parceiros')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar professores parceiros (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar professores parceiros (admin):', e?.message || e);
      return [];
    }
  }

  async criarProfessorParceiro(dados: {
    nome: string;
    disciplina_area?: string | null;
    foto_url?: string | null;
    mini_bio?: string | null;
    link_instagram?: string | null;
    link_linkedin?: string | null;
    link_site?: string | null;
    ativo?: boolean;
    ordem?: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('professores_parceiros')
        .insert({
          nome: dados.nome.trim(),
          disciplina_area: dados.disciplina_area?.trim() || null,
          foto_url: dados.foto_url?.trim() || null,
          mini_bio: dados.mini_bio?.trim() || null,
          link_instagram: dados.link_instagram?.trim() || null,
          link_linkedin: dados.link_linkedin?.trim() || null,
          link_site: dados.link_site?.trim() || null,
          ativo: dados.ativo ?? true,
          ordem: dados.ordem ?? 0,
        })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarProfessorParceiro(
    id: string,
    dados: Partial<{
      nome: string;
      disciplina_area: string | null;
      foto_url: string | null;
      mini_bio: string | null;
      link_instagram: string | null;
      link_linkedin: string | null;
      link_site: string | null;
      ativo: boolean;
      ordem: number;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('professores_parceiros')
        .update(dados)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirProfessorParceiro(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('professores_parceiros')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // --- SOFTWARES PARCEIROS ---

  async listarSoftwaresParceirosAtivos(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('softwares_parceiros')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar softwares parceiros ativos:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar softwares parceiros:', e?.message || e);
      return [];
    }
  }

  async listarTodosSoftwaresParceirosAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('softwares_parceiros')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar softwares parceiros (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar softwares parceiros (admin):', e?.message || e);
      return [];
    }
  }

  async criarSoftwareParceiro(dados: {
    nome: string;
    logo_url?: string | null;
    link_site?: string | null;
    link_instagram?: string | null;
    link_linkedin?: string | null;
    ativo?: boolean;
    ordem?: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('softwares_parceiros')
        .insert({
          nome: dados.nome.trim(),
          logo_url: dados.logo_url?.trim() || null,
          link_site: dados.link_site?.trim() || null,
          link_instagram: dados.link_instagram?.trim() || null,
          link_linkedin: dados.link_linkedin?.trim() || null,
          ativo: dados.ativo ?? true,
          ordem: dados.ordem ?? 0,
        })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarSoftwareParceiro(
    id: string,
    dados: Partial<{
      nome: string;
      logo_url: string | null;
      link_site: string | null;
      link_instagram: string | null;
      link_linkedin: string | null;
      ativo: boolean;
      ordem: number;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('softwares_parceiros')
        .update(dados)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirSoftwareParceiro(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('softwares_parceiros')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // --- EMPRESAS PARCEIRAS ---

  async listarEmpresasParceirasAtivas(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('empresas_parceiras')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar empresas parceiras ativas:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar empresas parceiras:', e?.message || e);
      return [];
    }
  }

  async listarTodasEmpresasParceirasAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('empresas_parceiras')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) {
        console.warn('Erro ao listar empresas parceiras (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar empresas parceiras (admin):', e?.message || e);
      return [];
    }
  }

  async criarEmpresaParceira(dados: {
    nome: string;
    logo_url?: string | null;
    link_site?: string | null;
    link_instagram?: string | null;
    link_linkedin?: string | null;
    ativo?: boolean;
    ordem?: number;
  }): Promise<{ error: Error | null; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('empresas_parceiras')
        .insert({
          nome: dados.nome.trim(),
          logo_url: dados.logo_url?.trim() || null,
          link_site: dados.link_site?.trim() || null,
          link_instagram: dados.link_instagram?.trim() || null,
          link_linkedin: dados.link_linkedin?.trim() || null,
          ativo: dados.ativo ?? true,
          ordem: dados.ordem ?? 0,
        })
        .select()
        .single();
      return { error, data };
    } catch (e: any) {
      return { error: e };
    }
  }

  async atualizarEmpresaParceira(
    id: string,
    dados: Partial<{
      nome: string;
      logo_url: string | null;
      link_site: string | null;
      link_instagram: string | null;
      link_linkedin: string | null;
      ativo: boolean;
      ordem: number;
    }>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('empresas_parceiras')
        .update(dados)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirEmpresaParceira(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('empresas_parceiras')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // FINANCEIRO PESSOAL (QUANTO CUSTA & CONSTRUIR VS ALUGAR)
  // ----------------------------------------------------

  async listarSimulacoesFinanceiroPessoal(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      const { data, error } = await this.client
        .from('simulacoes_financeiro_pessoal')
        .select('*')
        .eq('profissional_id', session.user.id)
        .order('criado_em', { ascending: false });

      if (error) {
        // Tenta fallback com created_at caso o banco use nomenclatura padrão
        const { data: dataFallback, error: errorFallback } = await this.client
          .from('simulacoes_financeiro_pessoal')
          .select('*')
          .eq('profissional_id', session.user.id)
          .order('created_at', { ascending: false });

        if (errorFallback) {
          console.warn('Aviso ao listar simulações financeiro pessoal:', error.message);
          return [];
        }
        return dataFallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar simulações financeiro pessoal:', e?.message || e);
      return [];
    }
  }

  async excluirSimulacaoFinanceiroPessoal(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('simulacoes_financeiro_pessoal')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // VIABILIZA IA (ASSESSORIA DE CRÉDITO IMOBILIÁRIO)
  // ----------------------------------------------------

  async listarLinhasCreditoAtivas(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('linhas_credito')
        .select('*')
        .eq('ativo', true)
        .order('ordem_prioridade', { ascending: false });

      if (error) {
        console.warn('Aviso ao listar linhas de crédito ativas:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar linhas de crédito ativas:', e?.message || e);
      return [];
    }
  }

  async listarTodasLinhasCreditoAdmin(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('linhas_credito')
        .select('*')
        .order('ordem_prioridade', { ascending: false });

      if (error) {
        console.warn('Aviso ao listar todas linhas de crédito (admin):', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar todas linhas de crédito (admin):', e?.message || e);
      return [];
    }
  }

  async criarLinhaCredito(linha: any): Promise<{ data: any | null; error: Error | null }> {
    try {
      const { data, error } = await this.client
        .from('linhas_credito')
        .insert(linha)
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }

  async atualizarLinhaCredito(id: string, linha: any): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('linhas_credito')
        .update(linha)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirLinhaCredito(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('linhas_credito')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarMeusProjetosCredito(): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      const { data, error } = await this.client
        .from('projetos_credito')
        .select('*')
        .eq('profissional_id', session.user.id)
        .order('atualizado_em', { ascending: false });

      if (error) {
        // Fallback se coluna for updated_at ou criado_em
        const { data: dataFallback, error: errFallback } = await this.client
          .from('projetos_credito')
          .select('*')
          .eq('profissional_id', session.user.id)
          .order('created_at', { ascending: false });

        if (errFallback) {
          console.warn('Aviso ao listar projetos de crédito:', error.message);
          return [];
        }
        return dataFallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar projetos de crédito:', e?.message || e);
      return [];
    }
  }

  async obterProjetoCredito(id: string): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('projetos_credito')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.warn('Aviso ao obter projeto de crédito:', error.message);
        return null;
      }
      return data;
    } catch (e: any) {
      console.warn('Exceção ao obter projeto de crédito:', e?.message || e);
      return null;
    }
  }

  async criarProjetoCredito(projeto: any): Promise<{ data: any | null; error: Error | null }> {
    try {
      const session = await this.getSession();
      const payload = {
        ...projeto,
        profissional_id: session?.user?.id || projeto.profissional_id,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('projetos_credito')
        .insert(payload)
        .select()
        .single();
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }

  async atualizarProjetoCredito(id: string, projeto: any): Promise<{ error: Error | null }> {
    try {
      const payload = {
        ...projeto,
        atualizado_em: new Date().toISOString()
      };

      const { error } = await this.client
        .from('projetos_credito')
        .update(payload)
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirProjetoCredito(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('projetos_credito')
        .delete()
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async uploadDocumentoCredito(
    projetoId: string,
    documentoId: string,
    file: File
  ): Promise<{ data: DocumentoCredito | null; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { data: null, error: new Error('Usuário não autenticado.') };
      }

      const maxBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxBytes) {
        return { data: null, error: new Error('O arquivo excede o limite máximo permitido de 10 MB.') };
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const cleanDocId = documentoId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const path = `${session.user.id}/${projetoId}/${cleanDocId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await this.client.storage
        .from('documentos-credito')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      const { data, error: dbError } = await this.client
        .from('documentos_credito')
        .insert({
          projeto_credito_id: projetoId,
          profissional_id: session.user.id,
          documento_id: documentoId,
          nome_arquivo: file.name,
          caminho_storage: path,
          tamanho_bytes: file.size,
          tipo_mime: file.type || 'application/octet-stream',
          enviado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        return { data: null, error: dbError };
      }

      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }

  async listarDocumentosCredito(projetoId: string): Promise<DocumentoCredito[]> {
    try {
      const { data, error } = await this.client
        .from('documentos_credito')
        .select('*')
        .eq('projeto_credito_id', projetoId)
        .order('enviado_em', { ascending: false });

      if (error) {
        console.warn('Aviso ao listar documentos de crédito:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar documentos de crédito:', e?.message || e);
      return [];
    }
  }

  async excluirDocumentoCredito(id: string, caminhoStorage?: string): Promise<{ error: Error | null }> {
    try {
      if (caminhoStorage) {
        await this.client.storage
          .from('documentos-credito')
          .remove([caminhoStorage]);
      } else {
        const { data: doc } = await this.client
          .from('documentos_credito')
          .select('caminho_storage')
          .eq('id', id)
          .maybeSingle();
        if (doc?.caminho_storage) {
          await this.client.storage
            .from('documentos-credito')
            .remove([doc.caminho_storage]);
        }
      }

      const { error } = await this.client
        .from('documentos_credito')
        .delete()
        .eq('id', id);

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async baixarArquivoDocumentoCredito(caminhoStorage: string): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.storage
        .from('documentos-credito')
        .download(caminhoStorage);
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  }

  async obterUrlAssinadaDocumentoCredito(caminhoStorage: string, segundosExpiracao: number = 3600): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.storage
        .from('documentos-credito')
        .createSignedUrl(caminhoStorage, segundosExpiracao);
      return { url: data?.signedUrl || null, error };
    } catch (e: any) {
      return { url: null, error: e };
    }
  }

  async solicitarAssessoriaCredito(dados: {
    projetoId: string;
    nome: string;
    email: string;
    telefone: string;
    mensagem: string;
  }): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      const { error } = await this.client
        .from('solicitacoes_assessoria_credito')
        .insert({
          projeto_credito_id: dados.projetoId,
          profissional_id: session?.user?.id || null,
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          mensagem: dados.mensagem,
          canal: 'formulario',
          status: 'novo',
          criado_em: new Date().toISOString()
        });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarSolicitacoesAssessoriaAdmin(statusFiltro?: string): Promise<any[]> {
    try {
      let query = this.client
        .from('solicitacoes_assessoria_credito')
        .select('*, projetos_credito(nome_projeto, tipo_operacao, custo_total_estimado, valor_financiavel, parcela_estimada)')
        .order('criado_em', { ascending: false });

      if (statusFiltro && statusFiltro !== 'todos') {
        query = query.eq('status', statusFiltro);
      }

      const { data, error } = await query;
      if (error) {
        // Fallback se join simples
        const { data: fallback, error: errFallback } = await this.client
          .from('solicitacoes_assessoria_credito')
          .select('*')
          .order('criado_em', { ascending: false });
        if (errFallback) {
          console.warn('Aviso ao listar solicitações de assessoria:', error.message);
          return [];
        }
        return fallback || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar solicitações de assessoria:', e?.message || e);
      return [];
    }
  }

  async atualizarStatusSolicitacaoAssessoria(id: string, status: 'novo' | 'contatado' | 'finalizado'): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('solicitacoes_assessoria_credito')
        .update({
          status,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // CUB POR ESTADO (GESTÃO E ESTIMATIVAS)
  // ----------------------------------------------------

  async listarCubPorEstado(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('cub_por_estado')
        .select('*')
        .order('uf', { ascending: true });
      if (error) {
        console.warn('Aviso ao listar CUB por estado:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar CUB por estado:', e?.message || e);
      return [];
    }
  }

  async listarCubsTodosEstados(): Promise<any[]> {
    return this.listarCubPorEstado();
  }

  async obterCubEstado(
    uf: string,
    tipologia = 'Padrão Residenciais',
    padrao = 'Padrão Normal',
    subtipo?: string
  ): Promise<any | null> {
    try {
      let query = this.client
        .from('cub_por_estado')
        .select('valor_m2, mes_referencia, ano_referencia, sinduscon_responsavel, nome_estado, uf, tipologia, padrao, subtipo')
        .eq('uf', uf)
        .eq('tipologia', tipologia)
        .eq('padrao', padrao);

      if (subtipo) {
        query = query.eq('subtipo', subtipo);
      }

      const { data, error } = await query.maybeSingle();
      if (error) {
        console.warn('Aviso ao obter CUB do estado:', error.message);
        return null;
      }
      return data;
    } catch (e: any) {
      console.warn('Exceção ao obter CUB do estado:', e?.message || e);
      return null;
    }
  }

  async atualizarCubEstado(
    uf: string,
    dados: {
      valor_m2: number;
      mes_referencia?: number;
      ano_referencia?: number;
      sinduscon_responsavel?: string;
      mes_ano_referencia?: string | null;
      observacao?: string | null;
      [key: string]: any;
    },
    padrao = 'R8-N'
  ): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      const payload = {
        ...dados,
        atualizado_por: session?.user?.id || null,
        atualizado_em: new Date().toISOString()
      };
      const { error } = await this.client
        .from('cub_por_estado')
        .update(payload)
        .eq('uf', uf)
        .eq('padrao', padrao);
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async listarIndicesSinaenco(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('indices_sinaenco')
        .select('id, coluna, ano, mes, valor, atualizado_em, atualizado_por')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) {
        console.warn('Aviso ao listar índices SINAENCO:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar índices SINAENCO:', e?.message || e);
      return [];
    }
  }

  async adicionarIndiceMensal(dados: {
    coluna: 'coluna35' | 'coluna39';
    ano: number;
    mes: number;
    valor: number;
  }): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      const payload = {
        coluna: dados.coluna,
        ano: dados.ano,
        mes: dados.mes,
        valor: dados.valor,
        atualizado_por: session?.user?.id || null,
        atualizado_em: new Date().toISOString()
      };

      const { error } = await this.client
        .from('indices_sinaenco')
        .upsert(payload, { onConflict: 'coluna,ano,mes' });

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  async excluirIndiceSinaenco(
    coluna: string,
    ano: number,
    mes: number
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('indices_sinaenco')
        .delete()
        .eq('coluna', coluna)
        .eq('ano', ano)
        .eq('mes', mes);

      return { error };
    } catch (e: any) {
      return { error: e };
    }
  }

  // ----------------------------------------------------
  // TEMPLATES DE E-MAIL (CRUD & LISTAGEM)
  // ----------------------------------------------------

  async listarTemplatesEmail(): Promise<Array<{
    id: string;
    chave: string;
    nome: string;
    assunto: string;
    html: string;
    padrao_sistema: boolean;
    criado_em?: string;
    atualizado_em?: string;
  }>> {
    try {
      const { data, error } = await this.client
        .from('templates_email')
        .select('*')
        .order('padrao_sistema', { ascending: false })
        .order('nome', { ascending: true });

      if (error) {
        console.warn('Erro ao listar templates_email:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar templates_email:', e?.message || e);
      return [];
    }
  }

  async criarTemplateEmail(template: {
    chave?: string;
    nome: string;
    assunto: string;
    html: string;
    padrao_sistema?: boolean;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const chaveFinal =
        template.chave?.trim() ||
        template.nome
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const { data, error } = await this.client
        .from('templates_email')
        .insert({
          chave: chaveFinal,
          nome: template.nome.trim(),
          assunto: template.assunto.trim(),
          html: template.html,
          padrao_sistema: false,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async atualizarTemplateEmail(
    id: string,
    dados: {
      nome?: string;
      assunto?: string;
      html?: string;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const payload: Record<string, any> = {
        atualizado_em: new Date().toISOString(),
      };
      if (dados.nome !== undefined) payload.nome = dados.nome.trim();
      if (dados.assunto !== undefined) payload.assunto = dados.assunto.trim();
      if (dados.html !== undefined) payload.html = dados.html;

      const { error } = await this.client
        .from('templates_email')
        .update(payload)
        .eq('id', id)
        .eq('padrao_sistema', false);

      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async excluirTemplateEmail(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client
        .from('templates_email')
        .delete()
        .eq('id', id)
        .eq('padrao_sistema', false);

      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  // =========================================================================
  // PROJETOS SALVOS DOS AGENTES (Canteiro, Reajuste, Viabilidade e Quantitativos)
  // =========================================================================

  async salvarProjeto(
    tipoAgente: 'canteiro' | 'reajuste' | 'viabilidade' | 'quantitativos' | string,
    nomeProjeto: string,
    dadosFormulario: any
  ): Promise<{ error: Error | null; id?: string }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { error: new Error('Você precisa estar autenticado para salvar projetos.') };
      }

      const { data, error } = await this.client
        .from('projetos_salvos')
        .insert({
          profissional_id: session.user.id,
          tipo_agente: tipoAgente,
          nome_projeto: nomeProjeto.trim(),
          dados_formulario: dadosFormulario
        })
        .select('id')
        .single();

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null, id: data?.id };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async atualizarProjeto(
    id: string,
    nomeProjeto: string,
    dadosFormulario: any
  ): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { error: new Error('Você precisa estar autenticado para atualizar projetos.') };
      }

      const { error } = await this.client
        .from('projetos_salvos')
        .update({
          nome_projeto: nomeProjeto.trim(),
          dados_formulario: dadosFormulario
        })
        .eq('id', id)
        .eq('profissional_id', session.user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async listarMeusProjetos(
    tipoAgente: 'canteiro' | 'reajuste' | 'viabilidade' | 'quantitativos' | string
  ): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      const { data, error } = await this.client
        .from('projetos_salvos')
        .select('id, profissional_id, tipo_agente, nome_projeto, dados_formulario, criado_em, atualizado_em')
        .eq('tipo_agente', tipoAgente)
        .eq('profissional_id', session.user.id)
        .order('atualizado_em', { ascending: false });

      if (error) {
        console.warn('Erro ao listar projetos salvos:', error.message);
        return [];
      }

      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar projetos salvos:', e);
      return [];
    }
  }

  async excluirProjeto(id: string): Promise<{ error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { error: new Error('Você precisa estar autenticado para excluir projetos.') };
      }

      const { error } = await this.client
        .from('projetos_salvos')
        .delete()
        .eq('id', id)
        .eq('profissional_id', session.user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  // =========================================================================
  // MÓDULO LICITAÇÃO IA (Lei 14.133/2021) — Pacotes A/B, Análises e Chat
  // =========================================================================

  async obterStatusPacotesLicitacao(profissionalId?: string): Promise<{
    temPacoteA: boolean;
    temPacoteB: boolean;
    pacotesAtivos: any[];
    limiteAnalisesMes: number;
    analisesUsadasMes: number;
    analisesRestantesMes: number;
    limiteMensagensChatMes: number;
    mensagensChatUsadasMes: number;
    mensagensChatRestantesMes: number;
    error: Error | null;
  }> {
    try {
      let targetId = profissionalId;
      if (!targetId) {
        const session = await this.getSession();
        targetId = session?.user?.id;
      }

      if (!targetId) {
        return {
          temPacoteA: false,
          temPacoteB: false,
          pacotesAtivos: [],
          limiteAnalisesMes: 0,
          analisesUsadasMes: 0,
          analisesRestantesMes: 0,
          limiteMensagensChatMes: 35,
          mensagensChatUsadasMes: 0,
          mensagensChatRestantesMes: 35,
          error: null,
        };
      }

      const hojeStr = new Date().toISOString().split('T')[0];
      const { data: pacotes, error: pacotesErr } = await this.client
        .from('pacotes_licitacao')
        .select('*')
        .eq('profissional_id', targetId)
        .eq('ativo', true);

      if (pacotesErr) {
        console.warn('Aviso ao consultar pacotes_licitacao:', pacotesErr.message);
      }

      const pacotesValidos = (pacotes || []).filter(p => !p.data_expiracao || p.data_expiracao >= hojeStr);
      const temA = pacotesValidos.some(p => p.pacote === 'A');
      const temB = pacotesValidos.some(p => p.pacote === 'B');

      const limiteAnalises = (temA && temB) ? 10 : (temA ? 5 : (temB ? 5 : 0));
      const limiteChat = 35;

      // Contagem de análises no mês corrente
      let analisesUsadas = 0;
      try {
        const { data: rpcCount, error: rpcErr } = await this.client.rpc('contar_analises_licitacao_mes_atual', {
          p_profissional_id: targetId,
        });
        if (!rpcErr && typeof rpcCount === 'number') {
          analisesUsadas = rpcCount;
        } else {
          const inicioMes = new Date();
          inicioMes.setDate(1);
          inicioMes.setHours(0, 0, 0, 0);

          const { count } = await this.client
            .from('analises_licitacao')
            .select('id', { count: 'exact', head: true })
            .eq('profissional_id', targetId)
            .gte('criado_em', inicioMes.toISOString());

          if (count !== null) analisesUsadas = count;
        }
      } catch (e) {
        console.warn('Erro ao contar análises de licitação:', e);
      }

      // Contagem de mensagens de chat no mês corrente (apenas papel 'usuario')
      let mensagensChatUsadas = 0;
      try {
        const { data: rpcChatCount, error: rpcChatErr } = await this.client.rpc('contar_mensagens_chat_licitacao_mes_atual', {
          p_profissional_id: targetId,
        });
        if (!rpcChatErr && typeof rpcChatCount === 'number') {
          mensagensChatUsadas = rpcChatCount;
        } else {
          const inicioMes = new Date();
          inicioMes.setDate(1);
          inicioMes.setHours(0, 0, 0, 0);

          const { count } = await this.client
            .from('chat_licitacao_mensagens')
            .select('id', { count: 'exact', head: true })
            .eq('profissional_id', targetId)
            .eq('papel', 'usuario')
            .gte('criado_em', inicioMes.toISOString());

          if (count !== null) mensagensChatUsadas = count;
        }
      } catch (e) {
        console.warn('Erro ao contar mensagens de chat licitação:', e);
      }

      return {
        temPacoteA: temA,
        temPacoteB: temB,
        pacotesAtivos: pacotesValidos,
        limiteAnalisesMes: limiteAnalises,
        analisesUsadasMes: analisesUsadas,
        analisesRestantesMes: Math.max(0, limiteAnalises - analisesUsadas),
        limiteMensagensChatMes: limiteChat,
        mensagensChatUsadasMes: mensagensChatUsadas,
        mensagensChatRestantesMes: Math.max(0, limiteChat - mensagensChatUsadas),
        error: null,
      };
    } catch (e: any) {
      return {
        temPacoteA: false,
        temPacoteB: false,
        pacotesAtivos: [],
        limiteAnalisesMes: 0,
        analisesUsadasMes: 0,
        analisesRestantesMes: 0,
        limiteMensagensChatMes: 35,
        mensagensChatUsadasMes: 0,
        mensagensChatRestantesMes: 35,
        error: e,
      };
    }
  }

  async executarAnaliseLicitacaoViaFunction(dados: {
    tipo: 'edital' | 'documentacao';
    nomeEdital?: string;
    textoEdital?: string;
    arquivos?: Array<{ nome: string; url?: string; caminhoStorage?: string; tipoMime?: string; itemId?: string; descricao?: string }>;
    analisePreviaId?: string;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client.functions.invoke('analisar-licitacao', {
        body: dados,
      });

      if (error) {
        let msg = error.message || 'Erro ao processar análise de licitação';
        try {
          if ((error as any).context?.json) {
            const errJson = await (error as any).context.json();
            if (errJson?.error) msg = errJson.error;
          }
        } catch (_) {}
        return { error: new Error(msg) };
      }

      return { data, error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async enviarMensagemChatLicitacaoViaFunction(dados: {
    sessaoId: string;
    mensagem: string;
    analiseLicitacaoId?: string;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const { data, error } = await this.client.functions.invoke('chat-licitacao', {
        body: dados,
      });

      if (error) {
        let msg = error.message || 'Erro no chat especialista de licitação';
        try {
          if ((error as any).context?.json) {
            const errJson = await (error as any).context.json();
            if (errJson?.error) msg = errJson.error;
          }
        } catch (_) {}
        return { error: new Error(msg) };
      }

      return { data, error: null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async analisarLicitacaoComIA(dados: {
    tipo: 'edital' | 'documentacao';
    nomeEdital?: string;
    textoEdital?: string;
    caminhoStorageEdital?: string;
    arquivosEdital?: Array<{ nomeArquivo?: string; nome?: string; caminhoStorage: string }>;
    linkEdital?: string;
    itensMarcados?: string[];
    documentosHospedados?: Array<{ itemId: string; nomeArquivo: string; caminhoStorage: string }>;
    analisePreviaId?: string;
  }): Promise<{ data?: any; analiseId?: string; error: string | null }> {
    try {
      const arquivosMapeados: Array<{ nome: string; caminhoStorage?: string; itemId?: string }> = [];
      if (dados.arquivosEdital && dados.arquivosEdital.length > 0) {
        dados.arquivosEdital.forEach((ae, idx) => {
          arquivosMapeados.push({
            nome: ae.nomeArquivo || ae.nome || `Edital Arquivo ${idx + 1}`,
            caminhoStorage: ae.caminhoStorage
          });
        });
      } else if (dados.caminhoStorageEdital) {
        arquivosMapeados.push({
          nome: dados.nomeEdital || 'Edital',
          caminhoStorage: dados.caminhoStorageEdital
        });
      }
      if (dados.documentosHospedados) {
        dados.documentosHospedados.forEach(d => {
          arquivosMapeados.push({
            nome: d.nomeArquivo,
            caminhoStorage: d.caminhoStorage,
            itemId: d.itemId
          });
        });
      }

      const res = await this.executarAnaliseLicitacaoViaFunction({
        tipo: dados.tipo,
        nomeEdital: dados.nomeEdital,
        textoEdital: dados.textoEdital,
        arquivos: arquivosMapeados.length > 0 ? arquivosMapeados : undefined,
        analisePreviaId: dados.analisePreviaId
      });

      if (res.error) {
        return { error: res.error.message || 'Erro na análise de licitação' };
      }

      return {
        data: res.data?.resultado_analise || res.data,
        analiseId: res.data?.analise_id || res.data?.id,
        error: null
      };
    } catch (e: any) {
      return { error: e?.message || String(e) };
    }
  }

  async consultarChatLicitacaoComIA(dados: {
    mensagem: string;
    sessaoId: string;
    editalNome?: string;
    historicoMensagens?: Array<{ role: 'user' | 'assistant'; content: string }>;
    contextoAdicional?: string;
  }): Promise<{ resposta?: string; error: string | null }> {
    try {
      const res = await this.enviarMensagemChatLicitacaoViaFunction({
        sessaoId: dados.sessaoId,
        mensagem: dados.mensagem,
        analiseLicitacaoId: undefined
      });

      if (res.error) {
        return { error: res.error.message || 'Erro no chat especialista de licitação' };
      }

      const respostaTexto = res.data?.resposta || res.data?.conteudo || res.data?.message || 'Resposta processada.';
      return { resposta: respostaTexto, error: null };
    } catch (e: any) {
      return { error: e?.message || String(e) };
    }
  }

  async listarAnalisesLicitacao(profissionalId?: string): Promise<any[]> {
    try {
      let targetId = profissionalId;
      if (!targetId) {
        const session = await this.getSession();
        targetId = session?.user?.id;
      }
      if (!targetId) return [];

      const { data, error } = await this.client
        .from('analises_licitacao')
        .select('*')
        .eq('profissional_id', targetId)
        .order('criado_em', { ascending: false });

      if (error) {
        console.warn('Erro ao listar análises de licitação:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar análises de licitação:', e);
      return [];
    }
  }

  async listarMensagensChatLicitacao(sessaoId: string): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      const { data, error } = await this.client
        .from('chat_licitacao_mensagens')
        .select('*')
        .eq('sessao_id', sessaoId)
        .eq('profissional_id', session.user.id)
        .order('criado_em', { ascending: true });

      if (error) {
        console.warn('Erro ao listar mensagens do chat de licitação:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar histórico do chat:', e);
      return [];
    }
  }

  async uploadArquivoLicitacao(
    arquivo: File,
    subpasta: string = 'geral'
  ): Promise<{ caminhoStorage: string | null; urlAssinada: string | null; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { caminhoStorage: null, urlAssinada: null, error: new Error('Sessão expirada. Faça login novamente.') };
      }

      const ext = arquivo.name.split('.').pop()?.toLowerCase() || 'pdf';
      const cleanSubpasta = subpasta.replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanFileName = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const caminho = `${session.user.id}/licitacao/${cleanSubpasta}/${Date.now()}-${cleanFileName}`;

      const { error: uploadError } = await this.client.storage
        .from('documentos-credito')
        .upload(caminho, arquivo, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { caminhoStorage: null, urlAssinada: null, error: new Error(uploadError.message) };
      }

      const { url } = await this.obterUrlAssinadaDocumentoCredito(caminho, 86400); // 24h
      return { caminhoStorage: caminho, urlAssinada: url, error: null };
    } catch (e: any) {
      return { caminhoStorage: null, urlAssinada: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async excluirArquivoLicitacao(caminhoStorage: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.storage
        .from('documentos-credito')
        .remove([caminhoStorage]);

      return { error: error ? new Error(error.message) : null };
    } catch (e: any) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }

  async salvarDocumentoGeradoLicitacao(dados: {
    analiseId?: string;
    tipoDoc: 'declaracao' | 'declaracoes_lote' | 'capa_proposta' | 'envelope';
    titulo: string;
    nomeArquivo: string;
    formato: 'docx' | 'pdf';
    conteudoTexto?: string;
    meta?: any;
  }): Promise<{ data?: any; error: Error | null }> {
    try {
      const session = await this.getSession();
      if (!session?.user) {
        return { error: new Error('Sessão expirada. Faça login novamente.') };
      }

      const payload = {
        profissional_id: session.user.id,
        analise_licitacao_id: dados.analiseId || null,
        tipo_documento: dados.tipoDoc,
        titulo: dados.titulo,
        nome_arquivo: dados.nomeArquivo,
        formato: dados.formato,
        conteudo_texto: dados.conteudoTexto || null,
        meta_dados: dados.meta || null,
        criado_em: new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('documentos_gerados_licitacao')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        // Não travar o fluxo se a tabela ainda não tiver sido criada ou falhar; retornar registro em memória
        console.warn('Aviso ao persistir documento gerado no Supabase:', error.message);
        return { data: { id: crypto.randomUUID(), ...payload }, error: null };
      }

      return { data, error: null };
    } catch (e: any) {
      console.warn('Exceção ao salvar documento gerado de licitação:', e);
      return { error: null };
    }
  }

  async listarDocumentosGeradosLicitacao(analiseId?: string): Promise<any[]> {
    try {
      const session = await this.getSession();
      if (!session?.user) return [];

      let query = this.client
        .from('documentos_gerados_licitacao')
        .select('*')
        .eq('profissional_id', session.user.id);

      if (analiseId) {
        query = query.eq('analise_licitacao_id', analiseId);
      }

      const { data, error } = await query.order('criado_em', { ascending: false });

      if (error) {
        console.warn('Aviso ao listar documentos gerados da licitação:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('Exceção ao listar documentos gerados da licitação:', e);
      return [];
    }
  }
}



