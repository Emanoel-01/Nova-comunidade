import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

interface RouteSeo {
  route: string;
  title: string;
  description: string;
  canonicalPath: string;
}

const PUBLIC_ROUTES_SEO: RouteSeo[] = [
  {
    route: '/',
    title: 'AmorimTech | Engenharia Diagnóstica, Tecnologia e Formação',
    description: 'Consultoria em engenharia diagnóstica, o SaaS Predial 4.0 para laudos de vistoria predial, e a Amorim Academy — formação em engenharia diagnóstica com mentoria e comunidade.',
    canonicalPath: '/',
  },
  {
    route: '/amorim-arquitetura',
    title: 'Amorim Arquitetura | Engenharia Diagnóstica e Consultiva em Pernambuco',
    description: 'Excelência técnica para proteger o seu patrimônio. Engenharia condominial e diagnóstica em Pernambuco, unindo o rigor técnico das normas ABNT com a Construção 4.0.',
    canonicalPath: '/amorim-arquitetura',
  },
  {
    route: '/amorim-tech',
    title: 'Amorim Tech | Predial 4.0 — SaaS de Inspeção Predial com IA',
    description: 'Plataforma de gestão e inteligência predial avançada. Laudos técnicos, vistoria cautelar e diagnóstico por inteligência artificial para engenheiros, arquitetos e síndicos.',
    canonicalPath: '/amorim-tech',
  },
  {
    route: '/amorim-academy',
    title: 'Amorim Academy | Formação, Mercado e Mentoria em Engenharia Diagnóstica',
    description: 'Curso Predial 4.0, Incubadora Profissional e Mentor Anjo — formação técnica com corresponsabilidade, inserção no mercado e mentoria individualizada.',
    canonicalPath: '/amorim-academy',
  },
  {
    route: '/blog',
    title: 'Blog | AmorimTech',
    description: 'Artigos técnicos sobre engenharia diagnóstica, inspeção predial, gestão condominial e tecnologia aplicada à construção civil.',
    canonicalPath: '/blog',
  },
  {
    route: '/contato',
    title: 'Contato | AmorimTech',
    description: 'Fale com a AmorimTech — consultoria, laudos técnicos e formação em engenharia diagnóstica.',
    canonicalPath: '/contato',
  },
  {
    route: '/links',
    title: 'Emanoel Amorim · Links e Contatos',
    description: 'Acesse os canais oficiais, soluções em engenharia diagnóstica, plataformas e formações do ecossistema Emanoel Amorim.',
    canonicalPath: '/links',
  },
];

function staticPrerenderPlugin(): Plugin {
  const baseUrl = 'https://emanoelamorim.com';

  return {
    name: 'vite:prerender-seo-pages',
    apply: 'build',
    enforce: 'post',
    closeBundle: async () => {
      const distDir = path.join(process.cwd(), 'dist');
      const baseIndexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(baseIndexPath)) {
        console.warn('[prerender] dist/index.html não encontrado.');
        return;
      }

      const templateHtml = fs.readFileSync(baseIndexPath, 'utf-8');

      for (const item of PUBLIC_ROUTES_SEO) {
        const fullCanonicalUrl = `${baseUrl}${item.canonicalPath}`;
        
        let html = templateHtml;

        // Atualizar <title>
        if (/<title>.*?<\/title>/i.test(html)) {
          html = html.replace(/<title>.*?<\/title>/i, `<title>${item.title}</title>`);
        } else {
          html = html.replace('</head>', `  <title>${item.title}</title>\n</head>`);
        }

        // Bloco de tags SEO para injeção
        const seoTags = `
    <!-- SEO Meta Tags Prerendered -->
    <meta name="description" content="${item.description}">
    <link rel="canonical" href="${fullCanonicalUrl}">
    <meta property="og:title" content="${item.title}">
    <meta property="og:description" content="${item.description}">
    <meta property="og:url" content="${fullCanonicalUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${item.title}">
    <meta name="twitter:description" content="${item.description}">
  `;

        // Remover meta tags de descrição/og pré-existentes se houver para evitar duplicatas
        html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
        html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
        html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
        html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

        // Injetar antes de </head>
        html = html.replace('</head>', `${seoTags}\n</head>`);

        if (item.route === '/') {
          fs.writeFileSync(baseIndexPath, html, 'utf-8');
          console.log(`[prerender] Rota / renderizada em dist/index.html`);
        } else {
          const targetDir = path.join(distDir, item.route.replace(/^\//, ''));
          fs.mkdirSync(targetDir, { recursive: true });
          const targetFile = path.join(targetDir, 'index.html');
          fs.writeFileSync(targetFile, html, 'utf-8');
          console.log(`[prerender] Rota ${item.route} renderizada em dist${item.route}/index.html`);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isProd = process.env.NODE_ENV === 'production' || mode === 'production';

  return {
    plugins: [
      angular({
        jit: true,
        tsconfig: './tsconfig.app.json',
      }),
      tailwindcss(),
      ...(isProd ? [staticPrerenderPlugin()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
