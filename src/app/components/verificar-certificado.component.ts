import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../services/seo.service';

interface ResultadoVerificacao {
  valido: boolean;
  mensagem?: string;
  codigo_verificacao?: string;
  nome_aluno?: string;
  nome_curso?: string;
  data_emissao?: string;
  carga_horaria?: string;
  texto_normativo?: string;
  modulo_predial?: string;
}

@Component({
  selector: 'app-verificar-certificado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div class="max-w-4xl mx-auto w-full space-y-8">
        
        <!-- Cabeçalho Institucional AmorimTech / Amorim Academy -->
        <header class="text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[#132A41] text-xs sm:text-sm font-semibold tracking-wide">
            <span class="w-2 h-2 rounded-full bg-[#B5642A]"></span>
            <span>AMORIM ACADEMY · ECOSSISTEMA DE FORMAÇÃO 4.0</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#132A41] tracking-tight">
            Verificação de Autenticidade de Certificados
          </h1>

          <p class="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Consulte a validade e a integridade de certificados técnicos emitidos pela Amorim Academy. Insira o código alfanumérico constante no rodapé do documento.
          </p>
        </header>

        <!-- Formulário de Consulta -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <form (submit)="onSubmeter($event)" class="space-y-4">
            <div class="space-y-2">
              <label for="codigoInput" class="block text-xs font-bold uppercase tracking-wider text-[#132A41]">
                Código do Certificado (ex: AMTECH-7K2M9XQP)
              </label>
              
              <div class="relative flex flex-col sm:flex-row gap-3">
                <input
                  id="codigoInput"
                  type="text"
                  [value]="codigoInput()"
                  (input)="onInputCodigo($event)"
                  placeholder="AMTECH-XXXXXXXX"
                  maxlength="20"
                  class="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#132A41] font-mono text-base font-bold uppercase placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#132A41] transition-all"
                />

                <button
                  type="submit"
                  [disabled]="consultando() || !codigoInput().trim()"
                  class="px-6 py-3.5 rounded-2xl bg-[#132A41] hover:bg-[#1b3b5c] text-white font-bold text-sm tracking-wide shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (consultando()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Consultando...</span>
                  } @else {
                    <svg class="w-4 h-4 text-[#B5642A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Verificar</span>
                  }
                </button>
              </div>
            </div>
          </form>

          <!-- Feedback de Erro / Não Encontrado -->
          @if (erroMensagem()) {
            <div class="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-1">
              <div class="flex items-center gap-2 font-bold text-rose-900">
                <svg class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Certificado Não Localizado</span>
              </div>
              <p class="text-rose-700 pl-7">
                {{ erroMensagem() }}
              </p>
            </div>
          }

          <!-- Resultado Positivo de Certificado Autêntico -->
          @if (resultado(); as res) {
            @if (res.valido) {
              <div class="mt-8 rounded-3xl bg-[#FEFCF8] border-2 border-[#132A41] p-6 sm:p-10 relative overflow-hidden shadow-md space-y-6">
                <!-- Borda interna cobre sutil -->
                <div class="absolute inset-2 border border-[#B5642A]/40 rounded-2xl pointer-events-none"></div>

                <!-- Selo de Status Autêntico -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-[11px] uppercase tracking-wider font-bold text-emerald-800">
                        Registro Oficial Autêntico & Válido
                      </div>
                      <h3 class="text-lg font-bold text-[#132A41]">
                        Certificado Técnico Reconhecido
                      </h3>
                    </div>
                  </div>

                  <div class="text-left sm:text-right">
                    <span class="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Código de Autenticidade</span>
                    <span class="text-sm sm:text-base font-mono font-black text-[#132A41] bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                      {{ res.codigo_verificacao }}
                    </span>
                  </div>
                </div>

                <!-- Informações do Titular e Formação -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div class="space-y-1">
                    <span class="text-[11px] uppercase tracking-wider text-[#B5642A] font-bold">Aluno Certificado</span>
                    <div class="text-xl sm:text-2xl font-serif font-bold text-[#132A41]">
                      {{ res.nome_aluno }}
                    </div>
                  </div>

                  <div class="space-y-1">
                    <span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Data de Emissão</span>
                    <div class="text-sm sm:text-base font-semibold text-slate-800">
                      {{ formatarDataExtenso(res.data_emissao) }}
                    </div>
                  </div>

                  <div class="space-y-1 md:col-span-2">
                    <span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Curso / Capacitação Concluída</span>
                    <div class="text-base sm:text-lg font-extrabold text-[#132A41]">
                      “{{ res.nome_curso }}”
                    </div>
                  </div>

                  @if (res.carga_horaria) {
                    <div class="space-y-1">
                      <span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Carga Horária Registrada</span>
                      <div class="text-xs sm:text-sm font-semibold text-slate-800">
                        {{ res.carga_horaria }}
                      </div>
                    </div>
                  }

                  @if (res.modulo_predial) {
                    <div class="space-y-1">
                      <span class="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Vínculo Operacional</span>
                      <div class="text-xs sm:text-sm font-semibold text-slate-800">
                        Módulo {{ res.modulo_predial }} (Predial 4.0)
                      </div>
                    </div>
                  }

                  @if (res.texto_normativo) {
                    <div class="space-y-1 md:col-span-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                      <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Diretrizes & Normas Técnicas</span>
                      <p class="text-xs text-slate-600 leading-relaxed italic">
                        {{ res.texto_normativo }}
                      </p>
                    </div>
                  }
                </div>

                <!-- Rodapé Institucional do Emissor -->
                <div class="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-1.5">
                  <div class="font-bold text-[#132A41]">
                    Emissor: Amorim Arquitetura, Tech & Academy
                  </div>
                  <div>
                    CNPJ: 35.673.731/0001-82 · Rua Leonardo Bezerra Cavalcante, nº 672, Sala 06, Parnamirim, CEP 52.060-035, Recife/PE
                  </div>
                  <div>
                    Responsável Técnico: Emanoel Silva de Amorim · CAU A133593-6
                  </div>
                </div>

              </div>
            }
          }
        </div>

        <!-- Links de Apoio -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <a
            routerLink="/amorim-academy"
            class="hover:text-[#132A41] font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Conhecer os Cursos da Amorim Academy</span>
          </a>

          <a
            routerLink="/"
            class="hover:text-[#132A41] transition-colors"
          >
            Voltar para o Início
          </a>
        </div>

      </div>
    </div>
  `
})
export class VerificarCertificadoComponent implements OnInit {
  private readonly supabaseService = inject(SupabaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  readonly codigoInput = signal<string>('');
  readonly consultando = signal(false);
  readonly resultado = signal<ResultadoVerificacao | null>(null);
  readonly erroMensagem = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Verificar Autenticidade de Certificado | Amorim Academy',
      description: 'Validação pública de autenticidade para certificados técnicos emitidos pela Amorim Academy e AmorimTech.',
      canonicalPath: '/verificar-certificado'
    });

    // Lê código pela query param ?codigo=AMTECH-XXXX se presente
    this.route.queryParams.subscribe(params => {
      const codigoParam = params['codigo'] || params['c'] || params['code'];
      if (codigoParam && typeof codigoParam === 'string') {
        const codigoFormatado = codigoParam.trim().toUpperCase();
        this.codigoInput.set(codigoFormatado);
        this.consultarCertificado();
      }
    });
  }

  onInputCodigo(event: Event): void {
    const val = (event.target as HTMLInputElement).value || '';
    this.codigoInput.set(val.toUpperCase());
  }

  onSubmeter(event: Event): void {
    event.preventDefault();
    this.consultarCertificado();
  }

  formatarDataExtenso(dataStr?: string | null): string {
    if (!dataStr) return 'Data não informada';
    try {
      const d = new Date(dataStr);
      if (isNaN(d.getTime())) return dataStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dataStr;
    }
  }

  async consultarCertificado(): Promise<void> {
    const codigo = this.codigoInput().trim().toUpperCase();

    if (!codigo) {
      this.erroMensagem.set('Por favor, digite o código de verificação do certificado.');
      this.resultado.set(null);
      return;
    }

    this.consultando.set(true);
    this.erroMensagem.set(null);
    this.resultado.set(null);

    try {
      const res = await this.supabaseService.verificarCertificadoPublico(codigo);

      if (res && res.valido) {
        this.resultado.set(res);
      } else {
        this.erroMensagem.set(res?.mensagem || 'Código não encontrado. Verifique se digitou corretamente.');
      }
    } catch (e: any) {
      this.erroMensagem.set('Código não encontrado. Verifique se digitou corretamente.');
    } finally {
      this.consultando.set(false);
    }
  }
}
