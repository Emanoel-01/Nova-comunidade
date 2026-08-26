# Sistema de Design Tipográfico e Escala — Grupo Amorim

Este documento formaliza as decisões de tipografia, escala tipográfica e boas práticas de responsividade (Mobile-First) aplicadas em todo o projeto `Nova-comunidade`.

## 1. Fonte Tipográfica Principal

- **Família:** `Manrope` (Google Fonts)
- **Pesos Carregados:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Justificativa:** Manrope é uma sans-serif contemporânea geométrica de alta legibilidade, com excelente equilíbrio entre precisão técnica (ideal para engenharia diagnóstica, perícias e arquitetura) e acessibilidade editorial.
- **Configuração:** Definida como `--font-sans` em `@theme` no `src/index.css` e aplicada globalmente no `html/body`.

## 2. Escala Tipográfica Padronizada

| Nível / Função | Mobile (<640px) | Tablet / Desktop (sm: / lg:) | Peso Recomendado | Uso Pretendido |
|---|---|---|---|---|
| **H1 (Título de Página / Hero)** | `text-2xl` a `text-3xl` | `text-4xl` a `text-5xl` | `font-extrabold` / `font-black` | Título principal da página ou Hero |
| **H2 (Título de Seção)** | `text-xl` a `text-2xl` | `text-2xl` a `text-3xl` | `font-bold` | Título de seções e blocos mestres |
| **H3 (Subtítulo / Destaque)** | `text-base` a `text-lg` | `text-lg` a `text-xl` | `font-bold` / `font-semibold` | Subtítulo de seções, cabeçalhos de grupos |
| **Título de Card / Item** | `text-sm` a `text-base` | `text-base` a `text-lg` | `font-bold` / `font-semibold` | Nomes de cursos, posts, produtos, features |
| **Corpo de Texto (Parágrafos)** | `text-xs` a `text-sm` | `text-sm` a `text-base` | `font-normal` (`text-slate-600` / `700`) | Textos institucionais, descrições, artigos (`text-justify hyphens-auto`) |
| **Texto de Apoio / Legenda** | `text-[11px]` a `text-xs` | `text-xs` a `text-sm` | `font-medium` (`text-slate-500`) | Metadados, datas, contadores, notas |
| **Badge / Tag / Label Curto** | `text-[10px]` a `text-xs` | `text-xs` | `font-bold` / `font-semibold` | Categorias, status, etiquetas |

## 3. Diretrizes de Justificação e Hifenação

- Todo texto corrido com mais de 1 linha (institucional, descrições, posts de blog, ementas) utiliza `text-justify` (com classe CSS global configurada para `text-justify: inter-word` e `hyphens: auto`).
- Textos curtos de 1 linha, badges, botões, títulos e campos de formulário permanecem alinhados naturalmente (`text-left` ou `text-center`).

## 4. Diretrizes de Espaçamento e Densidade Mobile (Mobile-First)

- **Padding Vertical de Seções:**
  - Seções de destaque: `py-10 sm:py-16 lg:py-20` (nunca `py-20` ou `py-28` fixo no mobile).
  - Seções normais: `py-8 sm:py-12 lg:py-16`.
  - Seções compactas (ex: instituições, chamadas rápidas): `py-6 sm:py-10`.
- **Grids e Colunas:**
  - Logos e parcerias: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` com padding e gaps enxutos no mobile.
  - Cards de conteúdo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` com `gap-4 sm:gap-6`.
- **Áreas de Toque (Touch Targets):**
  - Mínimo de 44px de altura em botões interativos e links chave.
