import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gerarLinkWhatsapp } from '../utils/whatsapp.util';
import { SeoService } from '../services/seo.service';

interface FaqItem {
  pergunta: string;
  resposta: string;
}

@Component({
  selector: 'app-como-funciona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full bg-slate-50 py-6 sm:py-10 lg:py-16 px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-20">
      <div class="max-w-7xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20">

        <!-- ========================================================================= -->
        <!-- HERO: COMO FUNCIONA O ACESSO                                              -->
        <!-- ========================================================================= -->
        <section class="relative rounded-3xl overflow-hidden shadow-sm" style="background: linear-gradient(160deg, #041B2D 0%, #0B2E47 55%, #0E3D52 100%);">
          <div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px); background-size: 22px 22px;"></div>
          <div class="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%);"></div>
          <div class="absolute -bottom-40 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 70%);"></div>

          <div class="relative z-10 px-5 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-20 max-w-4xl space-y-5 sm:space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-[11px] sm:text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
              <span>COMO FUNCIONA O ACESSO</span>
            </div>

            <h1 class="text-3xl min-[360px]:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Você paga pelo que usa, na área em que atua.
            </h1>

            <p class="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl">
              Sem plano único, sem pacote obrigatório. Habilite-se no módulo da sua especialidade, licencie a ferramenta e pague a emissão conforme o trabalho que entrega.
            </p>

            <div class="flex flex-wrap gap-3 pt-2">
              <a
                [href]="linkWhatsapp"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px] shadow-sm cursor-pointer"
              >
                <span>Falar com um consultor</span>
                <span>→</span>
              </a>
              <a
                routerLink="/amorim-academy"
                class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px] cursor-pointer"
              >
                Conhecer as certificações
              </a>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 1: OS TRÊS PILARES                                                 -->
        <!-- ========================================================================= -->
        <section class="space-y-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs uppercase tracking-wider font-bold text-cyan-600 block">Estrutura Comercial</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Os três pilares do ecossistema
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Card 1: Certificação -->
            <div class="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                  1
                </div>
                <div class="text-xs font-black uppercase tracking-wider text-indigo-600">Pilar 1</div>
                <h3 class="text-xl font-bold text-slate-900">CERTIFICAÇÃO</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  A formação que habilita você a operar o módulo. Paga uma vez, vinculada ao seu CPF.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Habilitação técnica pessoal e vitalícia
              </div>
            </div>

            <!-- Card 2: Licença Anual -->
            <div class="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 font-black text-sm">
                  2
                </div>
                <div class="text-xs font-black uppercase tracking-wider text-cyan-700">Pilar 2</div>
                <h3 class="text-xl font-bold text-slate-900">LICENÇA ANUAL</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  O acesso à plataforma e ao módulo. Base única por conta, mais a licença de cada módulo.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                12 meses de acesso, ferramentas e acervo
              </div>
            </div>

            <!-- Card 3: Taxa de Emissão -->
            <div class="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">
                  3
                </div>
                <div class="text-xs font-black uppercase tracking-wider text-amber-700">Pilar 3</div>
                <h3 class="text-xl font-bold text-slate-900">TAXA DE EMISSÃO</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Cobrada a cada documento emitido, proporcional ao trabalho. Não emitiu, não paga.
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Sem franquias abusivas, com teto em todos os módulos
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 2: A CERTIFICAÇÃO                                                  -->
        <!-- ========================================================================= -->
        <section class="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-xs space-y-8">
          <div class="max-w-3xl space-y-4">
            <span class="text-xs uppercase tracking-wider font-bold text-indigo-600 block">Pilar 1 em Detalhes</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              A Certificação: Por que ela é obrigatória
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              Antes de emitir qualquer documento pelo sistema, você conclui a certificação daquele módulo. São 20 horas sobre a norma técnica aplicável, a metodologia de campo e o uso da ferramenta.
            </p>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              Isso não é burocracia comercial. Um laudo emitido sem domínio da norma é um laudo contestável — e quem responde por ele é você, com a sua ART ou RRT. A certificação existe para que todo documento que sai da plataforma tenha um responsável técnico que sabe o que está assinando.
            </p>
          </div>

          <!-- Caixa de destaque: O que vem junto -->
          <div class="rounded-2xl p-6 sm:p-8 text-white space-y-4" style="background: linear-gradient(135deg, #1E1B4B, #312E81);">
            <div class="flex items-center gap-2">
              <span class="text-amber-300 font-bold text-xs uppercase tracking-wider">Benefícios Inclusos</span>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-white">
              O que vem junto com cada certificação:
            </h3>
            <p class="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-3xl">
              <strong class="text-white">1 laudo com taxa de emissão cortesia</strong>, para usar em até 60 dias. <strong class="text-white">1 hora de mentoria individual</strong> com o responsável pela formação. E <strong class="text-white">acesso às lives semanais de dúvidas técnicas</strong>, sem prazo.
            </p>
          </div>

          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed border-l-2 border-indigo-400 pl-4">
            A certificação é pessoal e intransferível. Ela acompanha o profissional, não a empresa — se você mudar de escritório, sua habilitação vai com você. E tem preço único: não há desconto por já ser licenciado.
          </p>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 3: A LICENÇA ANUAL                                                 -->
        <!-- ========================================================================= -->
        <section class="space-y-8">
          <div class="space-y-4 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-cyan-700 block">Pilar 2 em Detalhes</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              A Licença Anual: Como o preço se forma
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              A licença tem duas partes que se somam: a base da conta, cobrada uma única vez por ano independente de quantos módulos você tenha, e a licença de cada módulo que você contratar.
            </p>
          </div>

          <!-- Caixa de destaque: Base da Conta -->
          <div class="bg-gradient-to-r from-cyan-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-cyan-800/40 shadow-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-xs uppercase font-bold text-cyan-300 tracking-wider block">Base da Conta</span>
                <div class="text-2xl sm:text-3xl font-black text-white mt-1">R$ 1.000 <span class="text-sm font-medium text-slate-300">/ ano</span></div>
              </div>
              <p class="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed">
                Cobrada uma vez só, não importa se você licencia um módulo ou cinco. Ela mantém ativa a sua conta e desbloqueia agentes de produtividade e acervo contínuo.
              </p>
            </div>
          </div>

          <!-- Duas colunas lado a lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Coluna A: Agentes de Produtividade -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <h3 class="text-lg font-bold text-slate-900">Agentes de produtividade</h3>
              </div>
              <p class="text-xs text-slate-500">Ferramentas de IA e automação técnica inclusas na base:</p>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Reajuste de contrato pelas séries FGV</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Levantamento de quantitativos</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Custos e viabilidade pela NBR 12.721</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Plano de canteiro pela NR-18</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Bíblia da Edificação — 41 tipologias</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Biblioteca com 369 comandos técnicos</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Checklist de habilitação em licitações</span>
                </li>
              </ul>
            </div>

            <!-- Coluna B: Cursos do Acervo -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <h3 class="text-lg font-bold text-slate-900">Cursos do acervo</h3>
              </div>
              <p class="text-xs text-slate-500">Capacitação permanente para você e sua equipe:</p>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Conceitos, Técnicas e Ferramentas do Profissional 4.0</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Agentes de IA para Engenharia e Arquitetura</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>IA para Escritórios de Arquitetura — Módulo Claude</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Desmistificando o Orçamento de Obras</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Desmistificando o Planejamento e Controle de Obras</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>Todos os cursos livres do catálogo</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Caixa de desconto adicional -->
          <div class="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 sm:p-8 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-indigo-700 font-bold text-xs uppercase tracking-wider">Vantagem Exclusiva de Licenciado</span>
            </div>
            <h4 class="text-base sm:text-lg font-bold text-slate-900">
              E 30% de desconto no que fica de fora
            </h4>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              Quem é licenciado tem <strong>30% de desconto</strong> nas imersões, nas turmas com professor convidado e nos cursos vendidos à parte. A licença se paga em uma única inscrição.
            </p>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 4: TABELA DOS MÓDULOS                                              -->
        <!-- ========================================================================= -->
        <section class="space-y-6">
          <div class="space-y-3">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500 block">Valores Oficiais</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tabela dos Módulos
            </h2>
            <p class="text-slate-600 text-xs sm:text-sm">
              Consulte a formação técnica e a licença anual de cada especialidade.
            </p>
          </div>

          <!-- Tabela Responsiva com Scroll Horizontal Seguro -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse min-w-[620px]">
                <thead>
                  <tr class="bg-slate-900 text-white text-xs uppercase tracking-wider border-b border-slate-800">
                    <th class="py-4 px-6 font-bold">Módulo</th>
                    <th class="py-4 px-6 font-bold">Certificação</th>
                    <th class="py-4 px-6 font-bold">Licença do Módulo</th>
                    <th class="py-4 px-6 font-bold bg-slate-800/80">Base + Módulo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-bold text-slate-900">
                      Inspeção Predial <span class="text-xs font-normal text-slate-500">(NBR 16747)</span>
                    </td>
                    <td class="py-4 px-6 font-medium">R$ 850</td>
                    <td class="py-4 px-6 font-medium">R$ 2.500</td>
                    <td class="py-4 px-6 font-black text-slate-900 bg-slate-50/50">R$ 3.500</td>
                  </tr>
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-bold text-slate-900">
                      Vistoria Cautelar <span class="text-xs font-normal text-slate-500">(NBR 13752 · IBAPE/SP)</span>
                    </td>
                    <td class="py-4 px-6 font-medium">R$ 850</td>
                    <td class="py-4 px-6 font-medium">R$ 1.500</td>
                    <td class="py-4 px-6 font-black text-slate-900 bg-slate-50/50">R$ 2.500</td>
                  </tr>
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-bold text-slate-900">
                      Engenharia Condominial
                    </td>
                    <td class="py-4 px-6 font-medium">R$ 1.500</td>
                    <td class="py-4 px-6 font-medium">R$ 2.500</td>
                    <td class="py-4 px-6 font-black text-slate-900 bg-slate-50/50">R$ 3.500</td>
                  </tr>
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-bold text-slate-900">
                      Laudo de Garantia
                    </td>
                    <td class="py-4 px-6 font-medium">R$ 750</td>
                    <td class="py-4 px-6 font-medium">R$ 2.000</td>
                    <td class="py-4 px-6 font-black text-slate-900 bg-slate-50/50">R$ 3.000</td>
                  </tr>
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-4 px-6 font-bold text-slate-900">
                      Acessibilidade <span class="text-xs font-normal text-slate-500">(NBR 9050)</span>
                    </td>
                    <td class="py-4 px-6 font-medium">R$ 750</td>
                    <td class="py-4 px-6 font-medium">R$ 1.000</td>
                    <td class="py-4 px-6 font-black text-slate-900 bg-slate-50/50">R$ 2.000</td>
                  </tr>
                  <!-- Previstos para 2028: itálico e cor secundária, sem valores -->
                  <tr class="bg-slate-50/30 text-slate-400 italic">
                    <td class="py-4 px-6 font-medium">Recebimento de Obras e Imóveis</td>
                    <td colspan="3" class="py-4 px-6 text-slate-400 not-italic font-semibold text-xs">
                      Previsto para 2028
                    </td>
                  </tr>
                  <tr class="bg-slate-50/30 text-slate-400 italic">
                    <td class="py-4 px-6 font-medium">Perícia Judicial</td>
                    <td colspan="3" class="py-4 px-6 text-slate-400 not-italic font-semibold text-xs">
                      Previsto para 2028
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
              <strong>Nota:</strong> A coluna da direita é o que você paga no primeiro ano se licenciar aquele módulo sozinho — já com a base incluída.
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 5: O SEGUNDO MÓDULO                                                -->
        <!-- ========================================================================= -->
        <section class="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-xs space-y-8">
          <div class="max-w-3xl space-y-4">
            <span class="text-xs uppercase tracking-wider font-bold text-emerald-600 block">Expansão Econômica</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              O Segundo Módulo: Você não paga a base de novo
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              Ao adicionar um segundo módulo, paga apenas a licença dele. Os agentes, os cursos e a comunidade já foram pagos na base, e a base vale para a conta inteira.
            </p>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              Como ela é cobrada uma vez só, a ordem em que você contrata não muda o total. Inspeção primeiro e Acessibilidade depois custa o mesmo que o caminho inverso.
            </p>
          </div>

          <!-- Caixa de Cálculo: Exemplo Prático -->
          <div class="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 max-w-2xl border border-slate-800 space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-wider text-cyan-300">
              Exemplo — quem já tem Inspeção Predial e adiciona Vistoria Cautelar:
            </h3>

            <div class="space-y-2 text-xs sm:text-sm font-mono divide-y divide-slate-800">
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-300">Base da conta</span>
                <span class="text-emerald-400 font-bold">já paga</span>
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-300">Licença de Inspeção Predial (contratada)</span>
                <span class="text-slate-100 font-bold">R$ 2.500</span>
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-300">Licença de Vistoria Cautelar</span>
                <span class="text-slate-100 font-bold">R$ 1.500</span>
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-300">Certificação Parte 2</span>
                <span class="text-slate-100 font-bold">R$ 850</span>
              </div>
              <div class="flex justify-between items-center pt-3 text-sm sm:text-base font-sans font-black border-t-2 border-cyan-500">
                <span class="text-cyan-300">Investimento das duas licenças no ano</span>
                <span class="text-white">R$ 5.000</span>
              </div>
            </div>
          </div>

          <div class="space-y-2 max-w-3xl pt-2">
            <h4 class="text-base font-bold text-slate-900">Se adicionar no meio do ano</h4>
            <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
              A licença do módulo novo é cobrada proporcional aos meses restantes até o aniversário da sua conta. Quem contratou em dezembro e adiciona um módulo em março paga nove doze avos daquela licença — e, na renovação, tudo vence junto, numa data só.
            </p>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 6: PESSOA FÍSICA E PESSOA JURÍDICA                                 -->
        <!-- ========================================================================= -->
        <section class="space-y-10">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500 block">Modelos de Uso</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Pessoa Física e Pessoa Jurídica
            </h2>
            <p class="text-slate-600 text-sm">
              Flexibilidade pensada para o engenheiro autônomo e para a operação estruturada de construtoras e escritórios.
            </p>
          </div>

          <!-- Dois cards lado a lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card PF -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                Pessoa Física
              </div>
              <h3 class="text-xl font-black text-slate-900">Profissional autônomo</h3>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Base da conta mais os módulos que usar</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Laudos emitidos sob sua própria responsabilidade técnica</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Certificação vinculada ao seu CPF</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-cyan-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Um acesso, sem assentos adicionais</span>
                </li>
              </ul>
            </div>

            <!-- Card PJ -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold">
                Pessoa Jurídica
              </div>
              <h3 class="text-xl font-black text-slate-900">Escritório ou empresa</h3>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Mesma base e mesmas licenças de módulo</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Assentos por módulo para vários responsáveis técnicos</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Laudos emitidos com o CNPJ da empresa e o CPF do RT que assina</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>Faturamento e gestão unificados</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Subtítulo: Como funcionam os assentos -->
          <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div class="max-w-3xl space-y-3">
              <h3 class="text-xl font-black text-slate-900">Como funcionam os assentos</h3>
              <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                A licença de cada módulo já vem com um assento incluído. Se mais profissionais precisam operar aquele módulo, a empresa contrata assentos adicionais — e paga apenas por quem de fato opera.
              </p>
              <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                O assento é por módulo, não pela conta. Uma empresa com cinco técnicos em inspeção predial e dois em engenharia condominial contrata cinco assentos de um e dois do outro. Não paga por capacidade que não usa.
              </p>
            </div>

            <!-- Tabela de assentos -->
            <div class="max-w-xl overflow-hidden rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-900 text-white font-bold">
                    <th class="py-3 px-4">Módulo</th>
                    <th class="py-3 px-4 text-right">Assento adicional por ano</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td class="py-3 px-4 font-semibold text-slate-900">Inspeção Predial</td>
                    <td class="py-3 px-4 font-bold text-slate-800 text-right">R$ 1.750</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 font-semibold text-slate-900">Engenharia Condominial</td>
                    <td class="py-3 px-4 font-bold text-slate-800 text-right">R$ 1.750</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 font-semibold text-slate-900">Laudo de Garantia</td>
                    <td class="py-3 px-4 font-bold text-slate-800 text-right">R$ 1.400</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 font-semibold text-slate-900">Vistoria Cautelar</td>
                    <td class="py-3 px-4 font-bold text-slate-800 text-right">R$ 1.050</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 font-semibold text-slate-900">Acessibilidade</td>
                    <td class="py-3 px-4 font-bold text-slate-800 text-right">R$ 700</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Caixa: Contratou alguém já certificado? -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
              <h4 class="text-base font-bold text-emerald-950">
                Contratou alguém já certificado? O assento é imediato.
              </h4>
              <p class="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Como a certificação pertence ao profissional e não à empresa, contratar um técnico que já concluiu a formação significa vincular o assento na hora, sem pagar certificação nova.
              </p>
              <p class="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                O mesmo vale na saída: a empresa desvincula o assento e realoca para outro profissional. Se o substituto já for certificado, a troca não tem custo. Se ainda não for, a empresa arca apenas com a certificação dele.
              </p>
            </div>

            <!-- Subtítulo: O assento é a cadeira da empresa -->
            <div class="space-y-3 pt-2">
              <h4 class="text-base sm:text-lg font-bold text-slate-900">O assento é a cadeira da empresa</h4>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed">
                Quem compra o assento é a empresa, e é dela que ele continua sendo. O responsável técnico senta nessa cadeira, preenche os próprios dados — nome, CPF e registro no CAU ou CREA — e a partir daí o perfil trava.
              </p>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed">
                A trava existe por um motivo prático: o assento não pode virar login rotativo. Todo documento precisa dizer, sem ambiguidade, emitido pela empresa, assinado por este profissional. Um laudo sem dono não se sustenta em nenhuma discussão técnica.
              </p>
            </div>

            <!-- Caixa: A regra que organiza tudo -->
            <div class="bg-slate-900 text-white rounded-2xl p-6 space-y-2">
              <span class="text-xs font-black uppercase tracking-wider text-amber-300">Regra de Segurança</span>
              <h4 class="text-base font-bold text-white">A regra que organiza tudo</h4>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Um CNPJ emitente existe em uma única conta no sistema. Se o laudo precisa sair com o timbre e o faturamento de uma empresa, ele é emitido dentro do ambiente dessa empresa. Não há como emitir em nome de terceiro a partir de uma conta pessoal.
              </p>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 7: DOIS AMBIENTES                                                  -->
        <!-- ========================================================================= -->
        <section class="space-y-8">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-indigo-600 block">Flexibilidade Profissional</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Trabalha por conta própria e também para uma empresa?
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              São dois ambientes, e a diferença entre eles é simples: de quem é o trabalho.
            </p>
          </div>

          <!-- Dois cards de ambiente -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card Seu Ambiente -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="text-xs font-black uppercase tracking-wider text-cyan-700">Espaço Particular</div>
              <h3 class="text-lg sm:text-xl font-black text-slate-900">Seu ambiente — A sua conta</h3>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li class="flex items-center gap-2">
                  <span class="text-cyan-600 font-bold">✓</span>
                  <span>Seus clientes particulares</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-cyan-600 font-bold">✓</span>
                  <span>Laudos com o seu CNPJ ou como autônomo</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-cyan-600 font-bold">✓</span>
                  <span>Licença que você paga</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-cyan-600 font-bold">✓</span>
                  <span>Seus rascunhos e vistorias</span>
                </li>
              </ul>
            </div>

            <!-- Card Ambiente da Empresa -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div class="text-xs font-black uppercase tracking-wider text-indigo-700">Espaço Corporativo</div>
              <h3 class="text-lg sm:text-xl font-black text-slate-900">Ambiente da empresa — O assento</h3>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>Clientes da empresa</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>Laudos com o CNPJ e o timbre dela</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>Licença que a empresa paga</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>Vistorias e fotos pertencem à empresa</span>
                </li>
              </ul>
            </div>
          </div>

          <p class="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Você não precisa escolher entre os dois. Se atende clientes próprios e também produz para uma contratante, mantém sua conta e ocupa o assento — cada trabalho no lugar a que pertence.
          </p>

          <!-- Caixa: A sua certificação é sua, para sempre -->
          <div class="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-3 border border-indigo-900">
            <h4 class="text-base sm:text-lg font-bold text-amber-300">
              A sua certificação é sua, para sempre
            </h4>
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Ela fica no seu CPF e não depende de emprego, de empresa ou de licença ativa. Se você sai da contratante, a habilitação continua sendo sua: a empresa apenas desvincula o assento e coloca outro técnico.
            </p>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O que muda é só onde você emite. Quem já tinha conta própria segue trabalhando normalmente. Quem só usava a ferramenta pelo assento da empresa passa a precisar de uma licença própria para emitir por conta própria — mas nunca refaz a formação.
            </p>
          </div>

          <!-- Caixa: E a comunidade continua -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
            <h4 class="text-base sm:text-lg font-bold text-slate-900">
              E a comunidade continua
            </h4>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Estando no seu ambiente ou no assento da empresa, você é a mesma pessoa na plataforma: o mesmo nome, o mesmo registro, o mesmo histórico. Participa do fórum, aparece no diretório de membros, troca mensagens, concorre no Hall da Fama e vê as vagas.
            </p>
            <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
              O assento define por quem o laudo é emitido. Não define quem você é. Aqui um ajuda o outro, e isso vale igual para quem é autônomo e para quem está dentro de um escritório.
            </p>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 8: A COMUNIDADE                                                    -->
        <!-- ========================================================================= -->
        <section class="space-y-6">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500 block">Rede Técnica</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A Comunidade
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              A plataforma não é só ferramenta. É um espaço onde profissionais da mesma área trocam dúvida de norma, indicação de trabalho e experiência de campo.
            </p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden max-w-3xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm border-collapse min-w-[480px]">
                <thead>
                  <tr class="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                    <th class="py-3.5 px-6">Área</th>
                    <th class="py-3.5 px-6 text-center">Licenciado</th>
                    <th class="py-3.5 px-6 text-center">Visitante cadastrado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Fórum — discussões técnicas</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Eventos — agenda e lives</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Feed — publicações e atualizações</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Membros — diretório de profissionais</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Mensagens — conversa direta</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Vagas — oportunidades de trabalho</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Materiais — acervo para download</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-6 font-semibold text-slate-900">Hall da Fama — reconhecimento</td>
                    <td class="py-3 px-6 text-center text-emerald-600 font-bold">Sim</td>
                    <td class="py-3 px-6 text-center text-slate-400 font-bold">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500">
              <strong>Nota:</strong> Quem compra um curso avulso acessa a área de aulas e emite seu certificado normalmente, com ou sem licença.
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 9: A TAXA DE EMISSÃO                                               -->
        <!-- ========================================================================= -->
        <section class="space-y-6">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-amber-700 block">Pilar 3 em Detalhes</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              A Taxa de Emissão: Você paga por documento entregue
            </h2>
            <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
              Nenhuma licença traz laudos embutidos. A taxa é cobrada quando o documento é emitido, e cada módulo tem a métrica que faz sentido para o tipo de trabalho que produz.
            </p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm border-collapse min-w-[560px]">
                <thead>
                  <tr class="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                    <th class="py-4 px-6 w-1/3">Módulo</th>
                    <th class="py-4 px-6">Como é calculada</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  <tr class="hover:bg-slate-50/70">
                    <td class="py-4 px-6 font-bold text-slate-900 align-top">
                      Inspeção Predial
                    </td>
                    <td class="py-4 px-6 leading-relaxed">
                      Escalonada pelo valor do serviço na ART ou RRT: até R$ 3.000 → <strong class="text-slate-900">piso de R$ 250</strong>; de R$ 3.000 a R$ 16.000 → proporcional crescente; de R$ 16.000 a R$ 25.000 → R$ 2.000; acima de R$ 25.000 → <strong class="text-slate-900">teto de R$ 3.000</strong>.
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50/70">
                    <td class="py-4 px-6 font-bold text-slate-900 align-top">
                      Vistoria Cautelar
                    </td>
                    <td class="py-4 px-6 leading-relaxed">
                      R$ 500 por bloco de 5 imóveis confrontantes. Até 5 → R$ 500; de 6 a 10 → R$ 1.000; de 11 a 15 → R$ 1.500, e assim por diante, com <strong class="text-slate-900">teto de R$ 5.000</strong>.
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50/70">
                    <td class="py-4 px-6 font-bold text-slate-900 align-top">
                      Engenharia Condominial
                    </td>
                    <td class="py-4 px-6 leading-relaxed">
                      R$ 1.000 pelo pacote técnico — memorial descritivo, caderno de encargos e plano de ação. R$ 1.000 pela planilha orçamentária paramétrica.
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50/70">
                    <td class="py-4 px-6 font-bold text-slate-900 align-top">
                      Acessibilidade
                    </td>
                    <td class="py-4 px-6 leading-relaxed font-semibold text-slate-900">
                      R$ 1.000 fixos por laudo emitido.
                    </td>
                  </tr>
                  <tr class="hover:bg-slate-50/70">
                    <td class="py-4 px-6 font-bold text-slate-900 align-top">
                      Laudo de Garantia
                    </td>
                    <td class="py-4 px-6 leading-relaxed font-semibold text-slate-900">
                      R$ 1.000 fixos por laudo emitido.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs sm:text-sm text-amber-950 leading-relaxed max-w-4xl">
            A taxa acompanha o porte do trabalho, e todo módulo tem teto. Em uma inspeção pequena, o piso é de R$ 250 — em um contrato grande, a taxa cresce, mas o teto protege você de que ela cresça indefinidamente.
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 10: EXEMPLOS PRÁTICOS                                              -->
        <!-- ========================================================================= -->
        <section class="space-y-8">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500 block">Simulações Reais</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Exemplos de Investimento
            </h2>
            <p class="text-slate-600 text-xs sm:text-sm">
              Veja na prática como a composição se aplica a diferentes perfis de atuação.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Exemplo 1: Autônomo Inspeção -->
            <div class="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <span class="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full inline-block border border-cyan-800/60">
                  Perfil 1
                </span>
                <h3 class="text-lg font-bold text-white leading-snug">
                  Engenheiro autônomo — só inspeção predial
                </h3>

                <div class="space-y-2 text-xs font-mono divide-y divide-slate-800 pt-2">
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Certificação Parte 1</span>
                    <span class="text-slate-200 font-bold">R$ 850</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Base da conta</span>
                    <span class="text-slate-200 font-bold">R$ 1.000</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Licença de Inspeção Predial</span>
                    <span class="text-slate-200 font-bold">R$ 2.500</span>
                  </div>
                  <div class="flex justify-between pt-3 text-sm font-sans font-black border-t-2 border-cyan-500 text-white">
                    <span>Primeiro ano, antes das emissões</span>
                    <span class="text-cyan-300">R$ 4.350</span>
                  </div>
                </div>
              </div>

              <div class="bg-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed border border-slate-700/60">
                A partir do segundo ano, sem a certificação: <strong>R$ 3.500</strong>. O primeiro laudo tem taxa cortesia.
              </div>
            </div>

            <!-- Exemplo 2: Arquiteto Acessibilidade -->
            <div class="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <span class="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full inline-block border border-indigo-800/60">
                  Perfil 2
                </span>
                <h3 class="text-lg font-bold text-white leading-snug">
                  Arquiteto — só laudos de acessibilidade
                </h3>

                <div class="space-y-2 text-xs font-mono divide-y divide-slate-800 pt-2">
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Certificação Parte 4</span>
                    <span class="text-slate-200 font-bold">R$ 750</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Base da conta</span>
                    <span class="text-slate-200 font-bold">R$ 1.000</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Licença de Acessibilidade</span>
                    <span class="text-slate-200 font-bold">R$ 1.000</span>
                  </div>
                  <div class="flex justify-between pt-3 text-sm font-sans font-black border-t-2 border-indigo-500 text-white">
                    <span>Primeiro ano, antes das emissões</span>
                    <span class="text-indigo-300">R$ 2.750</span>
                  </div>
                </div>
              </div>

              <div class="bg-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed border border-slate-700/60">
                Quem atua em uma especialidade só paga por ela — não pelo catálogo inteiro.
              </div>
            </div>

            <!-- Exemplo 3: Escritório com 3 RTs -->
            <div class="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <span class="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full inline-block border border-amber-800/60">
                  Perfil 3
                </span>
                <h3 class="text-lg font-bold text-white leading-snug">
                  Escritório — inspeção predial com 3 responsáveis técnicos
                </h3>

                <div class="space-y-2 text-xs font-mono divide-y divide-slate-800 pt-2">
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">3 certificações Parte 1</span>
                    <span class="text-slate-200 font-bold">R$ 2.550</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Base da conta</span>
                    <span class="text-slate-200 font-bold">R$ 1.000</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">Licença de Inspeção (1 assento inc.)</span>
                    <span class="text-slate-200 font-bold">R$ 2.500</span>
                  </div>
                  <div class="flex justify-between py-1.5">
                    <span class="text-slate-400">2 assentos adicionais</span>
                    <span class="text-slate-200 font-bold">R$ 3.500</span>
                  </div>
                  <div class="flex justify-between pt-3 text-sm font-sans font-black border-t-2 border-amber-500 text-white">
                    <span>Primeiro ano, antes das emissões</span>
                    <span class="text-amber-300">R$ 9.550</span>
                  </div>
                </div>
              </div>

              <div class="bg-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed border border-slate-700/60">
                Se os três já forem certificados, a linha das certificações não existe e o primeiro ano fica em <strong>R$ 7.000</strong>.
              </div>
            </div>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SEÇÃO 11: PERGUNTAS FREQUENTES                                           -->
        <!-- ========================================================================= -->
        <section class="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-xs space-y-8">
          <div class="space-y-3 max-w-3xl">
            <span class="text-xs uppercase tracking-wider font-bold text-slate-500 block">Tire Suas Dúvidas</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Perguntas Frequentes
            </h2>
            <p class="text-slate-600 text-xs sm:text-sm">
              Tudo o que você precisa saber sobre o modelo de habilitação, licenças e assentos.
            </p>
          </div>

          <div class="space-y-3">
            @for (faq of faqs; track $index) {
              <div class="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  (click)="toggleFaq($index)"
                  class="w-full text-left p-5 sm:p-6 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <span class="font-bold text-slate-900 text-sm sm:text-base">
                    {{ faq.pergunta }}
                  </span>
                  <span class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-sm">
                    {{ faqAberta() === $index ? '−' : '+' }}
                  </span>
                </button>

                @if (faqAberta() === $index) {
                  <div class="px-5 sm:px-6 pb-6 pt-1 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    {{ faq.resposta }}
                  </div>
                }
              </div>
            }
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- CHAMADA FINAL                                                            -->
        <!-- ========================================================================= -->
        <section class="rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white space-y-6 shadow-md" style="background: linear-gradient(160deg, #041B2D 0%, #0B2E47 55%, #0E3D52 100%);">
          <div class="max-w-2xl mx-auto space-y-3">
            <span class="text-xs font-black uppercase tracking-wider text-cyan-300">Pronto para começar?</span>
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Habilite seu perfil técnico e tenha o copiloto definitivo em campo.
            </h2>
            <p class="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
              Fale com nossa equipe técnica para tirar dúvidas sobre assentos ou conhecer a grade das próximas turmas de certificação.
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3 pt-2">
            <a
              [href]="linkWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px] shadow-sm cursor-pointer"
            >
              <span>Falar com a equipe</span>
              <span>→</span>
            </a>
            <a
              routerLink="/amorim-academy"
              class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl transition-colors text-xs sm:text-sm min-h-[44px] cursor-pointer"
            >
              Conhecer as certificações
            </a>
          </div>
        </section>

        <!-- ========================================================================= -->
        <!-- RODAPÉ DA PÁGINA (NOTA DE VIGÊNCIA E REGRAS NORMATIVAS)                   -->
        <!-- ========================================================================= -->
        <section class="border-t border-slate-200 pt-8 pb-4 text-center">
          <p class="text-xs text-slate-500 max-w-4xl mx-auto leading-relaxed">
            Módulos de Inspeção Predial e Vistoria Cautelar de Vizinhança em operação a partir de dezembro de 2026. Engenharia Condominial previsto para fevereiro de 2027, Acessibilidade para maio de 2027 e Laudo de Garantia para setembro de 2027. Recebimento de Obras e Perícia Judicial previstos para 2028, com condições a definir. Valores em reais, referentes a doze meses de licenciamento.
          </p>
        </section>

      </div>
    </div>
  `
})
export class ComoFuncionaComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly linkWhatsapp = gerarLinkWhatsapp('como-funciona');

  readonly faqAberta = signal<number | null>(0);

  readonly faqs: FaqItem[] = [
    {
      pergunta: 'Preciso de certificação e de licença?',
      resposta: 'Sim. A certificação habilita você tecnicamente; a licença dá acesso à ferramenta. Concluir o curso sem licença ativa não permite emitir — e ter licença sem certificação também não.'
    },
    {
      pergunta: 'A licença vale por ano civil?',
      resposta: 'Não. São doze meses contados da sua contratação. Quem assina em setembro tem acesso até setembro do ano seguinte.'
    },
    {
      pergunta: 'Quantos laudos posso emitir?',
      resposta: 'Quantos quiser. Não há limite nem franquia — cada emissão tem sua taxa, conforme a tabela do módulo.'
    },
    {
      pergunta: 'Se eu não emitir nada, pago alguma coisa além da licença?',
      resposta: 'Não. A taxa só existe quando um documento é emitido.'
    },
    {
      pergunta: 'Contratei um profissional que já é certificado. Preciso pagar a formação de novo?',
      resposta: 'Não. A certificação é dele e continua valendo. Basta vincular um assento e ele começa a produzir imediatamente.'
    },
    {
      pergunta: 'Meu técnico saiu da empresa. O que acontece com o assento?',
      resposta: 'A empresa desvincula e realoca para outro profissional. Se o novo já for certificado, a troca não tem custo.'
    },
    {
      pergunta: 'Trabalho por uma empresa e também atendo por conta própria. Como fica?',
      resposta: 'São dois ambientes. Na sua conta você emite para seus clientes, com seu CNPJ ou como autônomo, usando a licença que você paga. No assento da empresa você produz para os clientes dela, e os laudos saem com o CNPJ e o timbre dela. Cada CNPJ emitente pertence a uma única conta no sistema.'
    },
    {
      pergunta: 'Se eu sair da empresa, perco a certificação ou o meu histórico?',
      resposta: 'Não. A certificação é do seu CPF e vale para sempre, independente de onde você trabalhe. A empresa desvincula o assento e realoca para outro técnico. Se você já tinha conta própria, segue trabalhando normalmente; se usava só o assento, precisará de uma licença própria para emitir por conta própria — mas não refaz a formação.'
    },
    {
      pergunta: 'Posso começar por um módulo e crescer depois?',
      resposta: 'É exatamente para isso que o modelo foi desenhado. Cada módulo adicionado paga só a própria licença, proporcional aos meses restantes até o aniversário da sua conta.'
    },
    {
      pergunta: 'A certificação tem desconto para quem já é licenciado?',
      resposta: 'Não. A certificação tem preço único para todos, porque é a habilitação técnica que sustenta a validade do laudo. O desconto de 30% do licenciado vale para imersões, turmas com professor convidado e cursos vendidos à parte.'
    }
  ];

  ngOnInit(): void {
    this.seoService.atualizar({
      title: 'Como Funciona o Acesso e Precificação | Emanoel Amorim',
      description: 'Entenda o modelo de acesso: certificação profissional, licença anual e taxa de emissão por laudo. Sem pacotes obrigatórios, pague pelo que usa.',
      canonicalPath: '/como-funciona'
    });
  }

  toggleFaq(index: number): void {
    this.faqAberta.update(atual => (atual === index ? null : index));
  }
}
