import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { SeoService } from '../services/seo.service';
import { detectarVideoEmbed, VideoEmbedInfo } from '../utils/video-embed.util';

export interface BlogTag {
  id: string;
  nome: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug?: string | null;
  resumo?: string | null;
  conteudo: string;
  categoria: string;
  imagem_capa_url?: string | null;
  galeria_urls?: string[] | null;
  video_url?: string | null;
  publicado: boolean;
  criado_em: string;
  atualizado_em?: string;
  autor_id?: string | null;
  tags?: BlogTag[];
  totalCurtidas?: number;
  curtidoPorMim?: boolean;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      
      <!-- Cabeçalho do Blog -->
      <section class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 py-10 lg:py-14 space-y-8">
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider max-w-full">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span class="break-words">Artigos e Insights</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Blog Mundo 4.0
              </h1>
              <p class="text-sm sm:text-base text-slate-600 max-w-2xl">
                Conteúdo aprofundado sobre Construção 4.0, Gestão e Tecnologia.
              </p>
            </div>

            <!-- Campo de Busca -->
            <div class="w-full md:w-80">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="busca-blog"
                  [value]="termoBusca()"
                  (input)="onBuscaInput($event)"
                  placeholder="Buscar artigos..."
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Banner de Newsletter -->
          <div class="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-indigo-900/50">
            @if (!inscricaoConfirmada()) {
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div class="lg:col-span-6 space-y-2">
                  <div class="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>NEWSLETTER</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Receba os melhores conteúdos
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Resumos semanais sobre Construção 4.0, Gestão e Tecnologia direto no seu e-mail.
                  </p>
                </div>

                <div class="lg:col-span-6">
                  <form (submit)="inscreverNewsletter($event)" class="flex flex-col sm:flex-row gap-2.5" id="form-newsletter-blog">
                    <input
                      type="text"
                      [value]="nomeNewsletter()"
                      (input)="onNomeNewsletterInput($event)"
                      placeholder="Seu nome"
                      class="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:flex-1"
                    />
                    <input
                      type="email"
                      [value]="emailNewsletter()"
                      (input)="onEmailNewsletterInput($event)"
                      placeholder="seu@email.com"
                      required
                      class="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:flex-1"
                    />
                    <button
                      type="submit"
                      id="btn-inscrever-newsletter"
                      [disabled]="inscrevendo()"
                      class="py-2.5 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.99] disabled:opacity-50"
                    >
                      @if (inscrevendo()) {
                        <span>Inscrevendo...</span>
                      } @else {
                        <span>Inscrever-se</span>
                      }
                    </button>
                  </form>
                  @if (erroNewsletter()) {
                    <p class="text-xs text-rose-300 mt-2 font-medium">{{ erroNewsletter() }}</p>
                  }
                </div>
              </div>
            } @else {
              <!-- Estado de Sucesso da Newsletter -->
              <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left py-2">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="space-y-0.5">
                  <h3 class="text-lg font-bold text-white">
                    {{ mensagemSucessoNewsletter() }} 🎉
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-300">
                    Você receberá os próximos resumos do Blog Mundo 4.0 no seu e-mail.
                  </p>
                </div>
              </div>
            }
          </div>

        </div>
      </section>

      <!-- Corpo Principal (Categorias + Lista de Artigos) -->
      <section id="lista-artigos-blog" class="max-w-7xl mx-auto px-6 py-10 lg:py-12 space-y-6">
        
        <!-- Filtro de Categorias Horizontal com rolagem -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          @for (categoria of categorias; track categoria) {
            <button
              type="button"
              (click)="selecionarCategoria(categoria)"
              [class]="categoriaAtiva() === categoria
                ? 'bg-slate-900 text-white shadow-sm font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 font-medium'"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer"
            >
              {{ categoria }}
            </button>
          }
        </div>

        <!-- Filtro secundário de Tags (aparece só se houver tags nos posts carregados) -->
        @if (tagsDisponiveis().length > 0) {
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            @for (tag of tagsDisponiveis(); track tag.slug) {
              <button
                type="button"
                (click)="selecionarTag(tag.slug)"
                [class]="tagAtiva() === tag.slug
                  ? 'bg-orange-600 text-white shadow-sm font-bold'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-medium'"
                class="px-3 py-1.5 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-all cursor-pointer"
              >
                #{{ tag.nome }}
              </button>
            }
          </div>
        }

        <!-- Lista de Artigos: Carregando -->
        @if (carregando()) {
          <div class="space-y-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 animate-pulse">
                <div class="h-5 bg-slate-200 rounded w-1/4"></div>
                <div class="h-6 bg-slate-200 rounded w-3/4"></div>
                <div class="h-4 bg-slate-100 rounded w-full"></div>
              </div>
            }
          </div>
        } @else if (postsFiltrados().length === 0) {
          <!-- Lista de Artigos: Estado Vazio -->
          <div class="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-8 h-8 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="space-y-1">
              <h3 class="text-lg sm:text-xl font-bold text-slate-500">
                Nenhum artigo encontrado.
              </h3>
              <p class="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                {{ termoBusca() ? 'Tente buscar por outros termos ou selecionar outra categoria.' : 'Novos artigos técnicos e publicações serão disponibilizados em breve.' }}
              </p>
            </div>
          </div>
        } @else {
          <!-- Barra de Controle: Contagem de Artigos + Seletor de Quantidade por Página -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div class="text-xs sm:text-sm font-medium text-slate-600">
              Mostrando <span class="font-bold text-slate-900">{{ itemInicio() }}–{{ itemFim() }}</span> de <span class="font-bold text-slate-900">{{ postsFiltrados().length }}</span> artigos
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <label for="select-itens-por-pagina" class="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Exibir por página:
              </label>
              <select
                id="select-itens-por-pagina"
                [value]="itensPorPagina()"
                (change)="alterarItensPorPagina($event)"
                class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
              </select>
            </div>
          </div>

          <!-- Lista de Artigos Reais (Paginados) -->
          <div class="space-y-6">
            @for (post of postsPaginados(); track post.id) {
              <article class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row group">
                @if (post.imagem_capa_url) {
                  <div class="md:w-72 lg:w-80 h-52 md:h-auto bg-slate-100 shrink-0 overflow-hidden">
                    <img
                      [src]="post.imagem_capa_url"
                      [alt]="post.titulo"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerpolicy="no-referrer"
                    />
                  </div>
                }

                <div class="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                        {{ post.categoria }}
                      </span>
                      @if (post.video_url && obterVideoEmbed(post.video_url); as cardVideo) {
                        @if (cardVideo.plataforma === 'instagram') {
                          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 inline-flex items-center gap-1 max-w-full">
                            <svg class="w-3 h-3 text-fuchsia-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span class="break-words">Instagram</span>
                          </span>
                        }
                      }
                      <span class="text-xs text-slate-400">
                        {{ post.criado_em | date:'dd/MM/yyyy' }}
                      </span>
                    </div>

                    <h2 class="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {{ post.titulo }}
                    </h2>

                    @if (post.resumo) {
                      <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed text-justify">
                        {{ post.resumo }}
                      </p>
                    }

                    @if (post.tags && post.tags.length > 0) {
                      <div class="flex flex-wrap items-center gap-1.5 pt-1">
                        @for (tag of post.tags; track tag.slug) {
                          <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{{ tag.nome }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <div class="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      (click)="abrirLeitura(post)"
                      class="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Ler artigo completo</span>
                      <span class="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>

                    <div class="flex items-center gap-1 relative">
                      <button
                        type="button"
                        (click)="alternarCurtida(post, $event)"
                        [class]="post.curtidoPorMim ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'"
                        class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <svg class="w-4 h-4" [attr.fill]="post.curtidoPorMim ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{{ post.totalCurtidas || 0 }}</span>
                      </button>

                      <button
                        type="button"
                        (click)="compartilharPost(post, $event)"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                        title="Compartilhar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342a3 3 0 100-2.684l-6-3.5a3 3 0 100 2.684l6 3.5zm0 0l6 3.5a3 3 0 105.316-1.842 3 3 0 00-5.316 1.842z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5a3 3 0 11.001 6.001A3 3 0 0115 5zM6 12a3 3 0 11-6 0 3 3 0 016 0zM15 19a3 3 0 106-.001A3 3 0 0015 19z" />
                        </svg>
                      </button>

                      @if (menuCompartilharAbertoId() === post.id) {
                        <div class="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 p-2 flex items-center gap-1 z-10" (click)="$event.stopPropagation()">
                          <a [href]="linkCompartilhamento(post, 'whatsapp')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-emerald-600" title="WhatsApp">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.457h.005c9.66 0 15.263-9.29 12.457-16.356zM12.06 21.658h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.238c0-5.46 4.444-9.902 9.914-9.902 2.646 0 5.132 1.032 7.001 2.901a9.828 9.828 0 012.897 6.994c-.003 5.46-4.447 9.878-9.928 9.878z"/></svg>
                          </a>
                          <a [href]="linkCompartilhamento(post, 'linkedin')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-sky-700" title="LinkedIn">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                          <a [href]="linkCompartilhamento(post, 'x')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-slate-900" title="X">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                          <button type="button" (click)="copiarLinkPost(post)" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Copiar link">
                            @if (linkCopiadoId() === post.id) {
                              <span class="text-[10px] font-bold text-emerald-600 px-1">Copiado!</span>
                            } @else {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                            }
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- Paginação Numérica (Rodapé da Lista) -->
          @if (totalPaginas() > 1) {
            <nav class="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2" aria-label="Navegação da paginação do blog">
              <!-- Botão Anterior -->
              <button
                type="button"
                (click)="paginaAnterior()"
                [disabled]="paginaAtual() === 1"
                class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                [class]="paginaAtual() === 1 ? 'border-slate-200 text-slate-400 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'"
                aria-label="Página anterior"
              >
                <span>‹</span>
                <span class="hidden sm:inline">Anterior</span>
              </button>

              <!-- Números de Página e Reticências -->
              @for (item of paginasVisiveis(); track $index) {
                @if (item === '...') {
                  <span class="px-2 py-1 text-slate-400 text-xs sm:text-sm font-bold select-none">
                    …
                  </span>
                } @else {
                  <button
                    type="button"
                    (click)="irParaPagina(+item)"
                    class="min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
                    [class]="paginaAtual() === item
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'"
                    [attr.aria-current]="paginaAtual() === item ? 'page' : null"
                  >
                    {{ item }}
                  </button>
                }
              }

              <!-- Botão Próxima -->
              <button
                type="button"
                (click)="proximaPagina()"
                [disabled]="paginaAtual() === totalPaginas()"
                class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                [class]="paginaAtual() === totalPaginas() ? 'border-slate-200 text-slate-400 bg-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'"
                aria-label="Próxima página"
              >
                <span class="hidden sm:inline">Próxima</span>
                <span>›</span>
              </button>
            </nav>
          }
        }

      </section>

      <!-- Modal de Leitura Completa do Artigo -->
      @if (postSelecionado()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div class="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-scaleUp">
            
            @if (postSelecionado()?.imagem_capa_url) {
              <div class="h-64 sm:h-80 w-full bg-slate-100 relative">
                <img
                  [src]="postSelecionado()?.imagem_capa_url"
                  [alt]="postSelecionado()?.titulo"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer"
                />
                <button
                  type="button"
                  (click)="fecharLeitura()"
                  class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            } @else {
              <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  {{ postSelecionado()?.categoria }}
                </span>
                <button
                  type="button"
                  (click)="fecharLeitura()"
                  class="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            }

            <div class="p-6 sm:p-10 space-y-6 flex-1">
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  <span class="font-bold text-orange-600">{{ postSelecionado()?.categoria }}</span>
                  <span>•</span>
                  <span>{{ postSelecionado()?.criado_em | date:'dd/MM/yyyy' }}</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {{ postSelecionado()?.titulo }}
                </h1>
                @if (postSelecionado()?.resumo) {
                  <p class="text-base text-slate-600 font-medium italic border-l-4 border-indigo-500 pl-4 py-1 text-justify">
                    {{ postSelecionado()?.resumo }}
                  </p>
                }
                @if (postSelecionado()?.tags && postSelecionado()!.tags!.length > 0) {
                  <div class="flex flex-wrap items-center gap-1.5 pt-1">
                    @for (tag of postSelecionado()!.tags!; track tag.slug) {
                      <span class="text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-md">
                        #{{ tag.nome }}
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- Conteúdo Formatado com Suporte a Rich HTML -->
              <div
                class="blog-content leading-relaxed text-justify space-y-4"
                [innerHTML]="conteudoFormatado(postSelecionado()?.conteudo)"
              ></div>

              <!-- Galeria de Fotos (Carrossel Horizontal) -->
              @if (postSelecionado()?.galeria_urls && postSelecionado()!.galeria_urls!.length > 0) {
                <div class="space-y-3 pt-4 border-t border-slate-100">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                      <h3 class="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Galeria de Fotos
                      </h3>
                    </div>
                    <span class="text-xs font-semibold text-slate-400">
                      {{ postSelecionado()!.galeria_urls!.length }} {{ postSelecionado()!.galeria_urls!.length === 1 ? 'imagem' : 'imagens' }}
                    </span>
                  </div>

                  <!-- Carrossel com Scroll Horizontal e Efeito Snap -->
                  <div class="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin">
                    @for (foto of postSelecionado()!.galeria_urls!; track $index) {
                      <div class="snap-center shrink-0 w-72 sm:w-80 md:w-96 aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 relative group">
                        <img
                          [src]="foto"
                          [alt]="'Foto ' + ($index + 1) + ' da galeria'"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerpolicy="no-referrer"
                        />
                        <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-bold">
                          {{ $index + 1 }} / {{ postSelecionado()!.galeria_urls!.length }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Vídeo / Post Embutido (YouTube, Vimeo ou Instagram) -->
              @if (postSelecionado()?.video_url && obterVideoEmbed(postSelecionado()?.video_url); as videoInfo) {
                @if (videoInfo.plataforma === 'instagram') {
                  <div class="space-y-3 pt-4 border-t border-slate-100">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                      <h3 class="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Publicado no Instagram
                      </h3>
                    </div>
                    <div class="flex justify-center">
                      <blockquote
                        class="instagram-media"
                        [attr.data-instgrm-permalink]="videoInfo.permalink"
                        data-instgrm-version="14"
                        style="background:#FFF; border:0; border-radius:1rem; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.08); margin:0; max-width:540px; min-width:326px; padding:0; width:100%;"
                      ></blockquote>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-3 pt-4 border-t border-slate-100">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" [class]="videoInfo.plataforma === 'youtube' ? 'bg-red-500' : 'bg-sky-500'"></span>
                      <h3 class="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Vídeo Explicativo
                      </h3>
                    </div>

                    <div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950">
                      <iframe
                        [src]="sanitizarUrlVideo(videoInfo.embedUrl)"
                        class="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                }
              }
            </div>

            <div class="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              @if (postSelecionado(); as post) {
                <div class="flex items-center gap-1 relative">
                  <button
                    type="button"
                    (click)="alternarCurtida(post, $event)"
                    [class]="post.curtidoPorMim ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-rose-500 bg-white'"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-colors border border-slate-200"
                  >
                    <svg class="w-4 h-4" [attr.fill]="post.curtidoPorMim ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ post.totalCurtidas || 0 }} curtida{{ (post.totalCurtidas || 0) === 1 ? '' : 's' }}</span>
                  </button>

                  <button
                    type="button"
                    (click)="compartilharPost(post, $event)"
                    class="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 cursor-pointer transition-colors"
                    title="Compartilhar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342a3 3 0 100-2.684l-6-3.5a3 3 0 100 2.684l6 3.5zm0 0l6 3.5a3 3 0 105.316-1.842 3 3 0 00-5.316 1.842z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5a3 3 0 11.001 6.001A3 3 0 0115 5zM6 12a3 3 0 11-6 0 3 3 0 016 0zM15 19a3 3 0 106-.001A3 3 0 0015 19z" />
                    </svg>
                  </button>

                  @if (menuCompartilharAbertoId() === post.id) {
                    <div class="absolute left-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-slate-200 p-2 flex items-center gap-1 z-10" (click)="$event.stopPropagation()">
                      <a [href]="linkCompartilhamento(post, 'whatsapp')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-emerald-600" title="WhatsApp">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.457h.005c9.66 0 15.263-9.29 12.457-16.356zM12.06 21.658h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.238c0-5.46 4.444-9.902 9.914-9.902 2.646 0 5.132 1.032 7.001 2.901a9.828 9.828 0 012.897 6.994c-.003 5.46-4.447 9.878-9.928 9.878z"/></svg>
                      </a>
                      <a [href]="linkCompartilhamento(post, 'linkedin')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-sky-700" title="LinkedIn">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                      <a [href]="linkCompartilhamento(post, 'x')" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-slate-100 text-slate-900" title="X">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      <button type="button" (click)="copiarLinkPost(post)" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Copiar link">
                        @if (linkCopiadoId() === post.id) {
                          <span class="text-[10px] font-bold text-emerald-600 px-1">Copiado!</span>
                        } @else {
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        }
                      </button>
                    </div>
                  }
                </div>
              }
              <button
                type="button"
                (click)="fecharLeitura()"
                class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors"
              >
                Fechar Artigo
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class BlogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  conteudoFormatado(conteudo: string | null | undefined): SafeHtml {
    if (!conteudo) return '';
    let html = conteudo.trim();
    // Suporte retrocompatível: se for texto puro legado sem tags HTML, formata quebras de linha em parágrafos
    if (!/<[a-z][\s\S]*>/i.test(html)) {
      html = html
        .split(/\n{2,}/)
        .map(paragrafo => `<p>${paragrafo.replace(/\n/g, '<br/>')}</p>`)
        .join('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obterVideoEmbed(url: string | null | undefined): VideoEmbedInfo | null {
    return detectarVideoEmbed(url);
  }

  sanitizarUrlVideo(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private scriptInstagramCarregado = false;

  private carregarScriptInstagram(): void {
    if (typeof window === 'undefined') return;

    if (this.scriptInstagramCarregado || (window as any).instgrm || document.getElementById('instagram-embed-script')) {
      this.scriptInstagramCarregado = true;
      setTimeout(() => {
        (window as any).instgrm?.Embeds?.process();
      }, 50);
      return;
    }

    this.scriptInstagramCarregado = true;
    const script = document.createElement('script');
    script.id = 'instagram-embed-script';
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        (window as any).instgrm?.Embeds?.process();
      }, 50);
    };
    document.head.appendChild(script);
  }

  private processarEmbedInstagramSeNecessario(post: BlogPost | null): void {
    if (!post?.video_url) return;
    const info = this.obterVideoEmbed(post.video_url);
    if (info?.plataforma === 'instagram') {
      this.carregarScriptInstagram();
    }
  }

  readonly termoBusca = signal('');
  readonly nomeNewsletter = signal('');
  readonly emailNewsletter = signal('');
  readonly inscricaoConfirmada = signal(false);
  readonly mensagemSucessoNewsletter = signal('Inscrição confirmada!');
  readonly inscrevendo = signal(false);
  readonly erroNewsletter = signal<string | null>(null);

  readonly categorias: string[] = [
    'Todos',
    'Gestão 4.0',
    'Manutenção Predial',
    'Tecnologia BIM',
    'Engenharia Legal',
    'Carreira',
    'Amorim Academy',
    'Amorim Arquitetura',
    'Amorim Tech'
  ];

  readonly categoriaAtiva = signal('Todos');
  readonly tagAtiva = signal<string | null>(null); // filtra por slug da tag, null = sem filtro de tag
  readonly posts = signal<BlogPost[]>([]);
  readonly carregando = signal(true);
  readonly postSelecionado = signal<BlogPost | null>(null);

  readonly itensPorPagina = signal<number>(10); // opções: 5, 10, 20
  readonly paginaAtual = signal<number>(1);

  // Tags únicas presentes nos posts carregados, para montar o filtro secundário dinamicamente
  readonly tagsDisponiveis = computed(() => {
    const mapa = new Map<string, BlogTag>();
    for (const post of this.posts()) {
      for (const tag of post.tags || []) {
        mapa.set(tag.slug, tag);
      }
    }
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly postsFiltrados = computed(() => {
    let lista = this.posts();
    const cat = this.categoriaAtiva();
    if (cat !== 'Todos') {
      lista = lista.filter(p => p.categoria === cat);
    }
    const tag = this.tagAtiva();
    if (tag) {
      lista = lista.filter(p => (p.tags || []).some(t => t.slug === tag));
    }
    const busca = this.termoBusca().trim().toLowerCase();
    if (busca) {
      lista = lista.filter(p =>
        p.titulo.toLowerCase().includes(busca) ||
        (p.resumo && p.resumo.toLowerCase().includes(busca)) ||
        p.conteudo.toLowerCase().includes(busca)
      );
    }
    return lista;
  });

  readonly totalPaginas = computed(() => {
    const total = this.postsFiltrados().length;
    return Math.max(1, Math.ceil(total / this.itensPorPagina()));
  });

  readonly postsPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.postsFiltrados().slice(inicio, inicio + this.itensPorPagina());
  });

  readonly itemInicio = computed(() => {
    const total = this.postsFiltrados().length;
    if (total === 0) return 0;
    return (this.paginaAtual() - 1) * this.itensPorPagina() + 1;
  });

  readonly itemFim = computed(() => {
    const total = this.postsFiltrados().length;
    return Math.min(this.paginaAtual() * this.itensPorPagina(), total);
  });

  readonly paginasVisiveis = computed<(number | '...')[]>(() => {
    const total = this.totalPaginas();
    const atual = this.paginaAtual();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (atual <= 3) {
      return [1, 2, 3, 4, '...', total];
    }

    if (atual >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }

    return [1, '...', atual - 1, atual, atual + 1, '...', total];
  });

  selecionarTag(slug: string): void {
    this.tagAtiva.set(this.tagAtiva() === slug ? null : slug);
    this.paginaAtual.set(1);
  }

  readonly curtindoAgora = signal<string | null>(null); // id do post em processamento, evita duplo-clique

  async alternarCurtida(post: BlogPost, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (this.curtindoAgora() === post.id) return;

    const curtidoAntes = !!post.curtidoPorMim;
    const totalAntes = post.totalCurtidas || 0;

    // Atualização otimista: reflete na tela antes da confirmação do servidor
    post.curtidoPorMim = !curtidoAntes;
    post.totalCurtidas = curtidoAntes ? totalAntes - 1 : totalAntes + 1;
    this.posts.set([...this.posts()]);

    this.curtindoAgora.set(post.id);
    try {
      const { error } = await this.supabaseService.toggleCurtidaBlogPost(post.id, curtidoAntes);
      if (error) {
        // Reverte em caso de erro
        post.curtidoPorMim = curtidoAntes;
        post.totalCurtidas = totalAntes;
        this.posts.set([...this.posts()]);
      }
    } finally {
      this.curtindoAgora.set(null);
    }
  }

  readonly menuCompartilharAbertoId = signal<string | null>(null);

  async compartilharNativo(post: BlogPost | any): Promise<boolean> {
    if (typeof navigator === 'undefined' || !(navigator as any).share) return false;
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://emanoelamorim.com';
    const routeSlug = post.slug || post.id;
    const url = `${origin}/blog/${encodeURIComponent(routeSlug)}`;
    try {
      await (navigator as any).share({
        title: post.titulo,
        text: post.resumo || post.titulo,
        url,
      });
      return true;
    } catch {
      // Usuário cancelou o compartilhamento nativo — não é erro, não mostrar fallback nesse caso
      return true;
    }
  }

  async compartilharPost(post: BlogPost, event?: Event): Promise<void> {
    event?.stopPropagation();
    const nativoUsado = await this.compartilharNativo(post);
    if (!nativoUsado) {
      // Fallback: menu com ícones fixos (desktop, navegadores sem suporte nativo)
      this.menuCompartilharAbertoId.set(this.menuCompartilharAbertoId() === post.id ? null : post.id);
    }
  }

  fecharMenuCompartilhar(): void {
    this.menuCompartilharAbertoId.set(null);
  }

  linkCompartilhamento(post: BlogPost, rede: 'whatsapp' | 'linkedin' | 'x'): string {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://emanoelamorim.com';
    const routeSlug = post.slug || post.id;
    const url = `${origin}/blog/${encodeURIComponent(routeSlug)}`;
    const texto = encodeURIComponent(post.titulo);
    switch (rede) {
      case 'whatsapp':
        return `https://wa.me/?text=${texto}%20${encodeURIComponent(url)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      case 'x':
        return `https://twitter.com/intent/tweet?text=${texto}&url=${encodeURIComponent(url)}`;
    }
  }

  async copiarLinkPost(post: BlogPost): Promise<void> {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://emanoelamorim.com';
    const routeSlug = post.slug || post.id;
    const url = `${origin}/blog/${encodeURIComponent(routeSlug)}`;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopiadoId.set(post.id);
      setTimeout(() => this.linkCopiadoId.set(null), 2000);
    } catch {
      // Clipboard indisponível — usuário pode copiar manualmente do menu aberto
    }
  }

  readonly linkCopiadoId = signal<string | null>(null);

  private processarRotaEQuery(): void {
    const routeSlug = this.route.snapshot.paramMap.get('slug');
    const queryPostId = this.route.snapshot.queryParamMap.get('post');

    if (routeSlug) {
      const post = this.posts().find(p => p.slug === routeSlug || p.id === routeSlug);
      if (post) {
        if (this.postSelecionado()?.id !== post.id) {
          this.postSelecionado.set(post);
          this.atualizarSeoPost(post);
          this.processarEmbedInstagramSeNecessario(post);
          // Registra visualização não-bloqueante via URL direta
          this.supabaseService.registrarVisualizacaoPost(post.id);
          this.supabaseService.creditarPontosLeituraArtigo(post.id, post.titulo);
        }
      }
    } else if (queryPostId) {
      const post = this.posts().find(p => p.id === queryPostId || p.slug === queryPostId);
      if (post) {
        this.postSelecionado.set(post);
        this.atualizarSeoPost(post);
        this.processarEmbedInstagramSeNecessario(post);
        this.supabaseService.registrarVisualizacaoPost(post.id);
        this.supabaseService.creditarPontosLeituraArtigo(post.id, post.titulo);
        // Redireciona links legados ?post= para a URL limpa /blog/:slug
        this.router.navigate(['/blog', post.slug || post.id], { replaceUrl: true });
      }
    } else {
      if (this.postSelecionado()) {
        this.postSelecionado.set(null);
        this.restaurarSeoPadrao();
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.restaurarSeoPadrao();
    await this.carregarPosts();

    // Sincronizar leitura tanto com /blog/:slug quanto com o queryParam legado ?post=
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(() => {
      this.processarRotaEQuery();
    });
  }

  restaurarSeoPadrao(): void {
    this.seoService.atualizar({
      title: 'Blog | AmorimTech',
      description: 'Artigos técnicos sobre engenharia diagnóstica, inspeção predial, gestão condominial e tecnologia aplicada à construção civil.',
      canonicalPath: '/blog',
    });
  }

  atualizarSeoPost(post: BlogPost): void {
    const routeSlug = post.slug || post.id;
    this.seoService.atualizar({
      title: `${post.titulo} | Blog AmorimTech`,
      description: post.resumo || 'Artigo técnico sobre engenharia diagnóstica, inspeção predial, gestão condominial e tecnologia aplicada à construção civil.',
      ogImage: post.imagem_capa_url || undefined,
      canonicalPath: `/blog/${encodeURIComponent(routeSlug)}`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.titulo,
        description: post.resumo || undefined,
        image: post.imagem_capa_url || undefined,
        datePublished: post.criado_em,
        dateModified: post.atualizado_em || post.criado_em,
        url: `https://emanoelamorim.com/blog/${encodeURIComponent(routeSlug)}`,
        publisher: {
          '@type': 'Organization',
          '@id': 'https://emanoelamorim.com/#organization',
          name: 'AmorimTech',
        },
      },
    });
  }

  async carregarPosts(): Promise<void> {
    this.carregando.set(true);
    try {
      const data = await this.supabaseService.listarPostsPublicados();
      this.posts.set(data || []);
      this.processarRotaEQuery();
    } catch (e) {
      console.warn('Erro ao carregar posts do blog:', e);
    } finally {
      this.carregando.set(false);
    }
  }

  onBuscaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.termoBusca.set(target.value);
    this.paginaAtual.set(1);
  }

  onNomeNewsletterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nomeNewsletter.set(target.value);
  }

  onEmailNewsletterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailNewsletter.set(target.value);
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaAtiva.set(categoria);
    this.paginaAtual.set(1);
  }

  alterarItensPorPagina(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const valor = parseInt(target.value, 10);
    if (!isNaN(valor) && [5, 10, 20].includes(valor)) {
      this.itensPorPagina.set(valor);
      this.paginaAtual.set(1);
      this.rolarParaLista();
    }
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.paginaAtual()) return;
    this.paginaAtual.set(pagina);
    this.rolarParaLista();
  }

  paginaAnterior(): void {
    if (this.paginaAtual() > 1) {
      this.paginaAtual.update(p => p - 1);
      this.rolarParaLista();
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual() < this.totalPaginas()) {
      this.paginaAtual.update(p => p + 1);
      this.rolarParaLista();
    }
  }

  rolarParaLista(): void {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('lista-artigos-blog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  abrirLeitura(post: BlogPost): void {
    this.postSelecionado.set(post);
    this.atualizarSeoPost(post);
    this.processarEmbedInstagramSeNecessario(post);
    // Registra visualização não-bloqueante no clique do post
    this.supabaseService.registrarVisualizacaoPost(post.id);
    this.supabaseService.creditarPontosLeituraArtigo(post.id, post.titulo);
    this.router.navigate(['/blog', post.slug || post.id]);
  }

  fecharLeitura(): void {
    this.postSelecionado.set(null);
    this.restaurarSeoPadrao();
    this.router.navigate(['/blog']);
  }

  async inscreverNewsletter(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.emailNewsletter().trim();
    if (!email) {
      return;
    }

    this.inscrevendo.set(true);
    this.erroNewsletter.set(null);

    try {
      const res = await this.supabaseService.inscreverNewsletter(this.nomeNewsletter(), email);
      if (res.error) {
        this.erroNewsletter.set('Ocorreu um erro ao realizar sua inscrição. Tente novamente.');
        return;
      }

      if (res.alreadySubscribed) {
        this.mensagemSucessoNewsletter.set('Você já está inscrito na nossa newsletter!');
      } else {
        this.mensagemSucessoNewsletter.set('Inscrição confirmada!');
      }

      this.inscricaoConfirmada.set(true);
    } catch (e: any) {
      this.erroNewsletter.set('Erro ao conectar ao servidor.');
    } finally {
      this.inscrevendo.set(false);
    }
  }
}
