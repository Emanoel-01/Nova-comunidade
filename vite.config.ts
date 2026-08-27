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
  schema?: object;
}

const PUBLIC_ROUTES_SEO: RouteSeo[] = [
  {
    route: '/',
    title: 'AmorimTech | Engenharia Diagnóstica, Tecnologia e Formação',
    description: 'Consultoria em engenharia diagnóstica, o SaaS Predial 4.0 para laudos de vistoria predial, e a Amorim Academy — formação em engenharia diagnóstica com mentoria e comunidade.',
    canonicalPath: '/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://emanoelamorim.com/#emanoel-amorim',
      name: 'Emanoel Silva de Amorim',
      jobTitle: 'Arquiteto e Urbanista, Especialista em Engenharia Diagnóstica',
      url: 'https://emanoelamorim.com',
      sameAs: [
        'https://www.instagram.com/oemanoelamorim/',
        'http://linkedin.com/in/emanoel-amorim-43025b65',
        'https://www.youtube.com/@emaamo',
        'https://www.researchgate.net/profile/Emanoel-Amorim',
        'http://lattes.cnpq.br/8865037855941412',
      ],
      worksFor: {
        '@type': 'Organization',
        '@id': 'https://emanoelamorim.com/#organization',
        name: 'AmorimTech',
      },
    },
  },
  {
    route: '/amorim-arquitetura',
    title: 'Amorim Arquitetura | Engenharia Diagnóstica e Consultiva em Pernambuco',
    description: 'Excelência técnica para proteger o seu patrimônio. Engenharia condominial e diagnóstica em Pernambuco, unindo o rigor técnico das normas ABNT com a Construção 4.0.',
    canonicalPath: '/amorim-arquitetura',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Amorim Arquitetura — Engenharia Diagnóstica e Consultiva',
      description: 'Excelência técnica para proteger o seu patrimônio. Engenharia condominial e diagnóstica em Pernambuco, unindo o rigor técnico das normas ABNT com a Construção 4.0.',
      url: 'https://emanoelamorim.com/amorim-arquitetura',
      serviceType: 'Engenharia Diagnóstica, Inspeção Predial e Vistoria Cautelar',
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Pernambuco',
      },
      provider: {
        '@type': 'Organization',
        '@id': 'https://emanoelamorim.com/#organization',
        name: 'AmorimTech',
      },
    },
  },
  {
    route: '/amorim-tech',
    title: 'Amorim Tech | Predial 4.0 — SaaS de Inspeção Predial com IA',
    description: 'Plataforma de gestão e inteligência predial avançada. Laudos técnicos, vistoria cautelar e diagnóstico por inteligência artificial para engenheiros, arquitetos e síndicos.',
    canonicalPath: '/amorim-tech',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Predial 4.0 — SaaS de Inspeção Predial com IA',
      description: 'Plataforma de gestão e inteligência predial avançada. Laudos técnicos, vistoria cautelar e diagnóstico por inteligência artificial para engenheiros, arquitetos e síndicos.',
      url: 'https://emanoelamorim.com/amorim-tech',
      serviceType: 'Software de Gestão e Vistoria Predial com IA',
      provider: {
        '@type': 'Organization',
        '@id': 'https://emanoelamorim.com/#organization',
        name: 'AmorimTech',
      },
    },
  },
  {
    route: '/amorim-academy',
    title: 'Amorim Academy | Formação, Mercado e Mentoria em Engenharia Diagnóstica',
    description: 'Curso Predial 4.0, Incubadora Profissional e Mentor Anjo — formação técnica com corresponsabilidade, inserção no mercado e mentoria individualizada.',
    canonicalPath: '/amorim-academy',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Amorim Academy — Formação e Mentoria em Engenharia Diagnóstica',
      description: 'Curso Predial 4.0, Incubadora Profissional e Mentor Anjo — formação técnica com corresponsabilidade, inserção no mercado e mentoria individualizada.',
      url: 'https://emanoelamorim.com/amorim-academy',
      serviceType: 'Formação e Mentoria Profissional em Engenharia Diagnóstica',
      provider: {
        '@type': 'Organization',
        '@id': 'https://emanoelamorim.com/#organization',
        name: 'AmorimTech',
      },
    },
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
        const schemaTag = item.schema
          ? `\n    <!-- Schema.org Specific Route Data -->\n    <script type="application/ld+json" id="dynamic-jsonld">\n${JSON.stringify(item.schema, null, 2)}\n    </script>`
          : '';

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
    <meta name="twitter:description" content="${item.description}">${schemaTag}
  `;

        // Remover meta tags de descrição/og pré-existentes se houver para evitar duplicatas
        html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
        html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
        html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
        html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
        html = html.replace(/<script\s+type="application\/ld\+json"\s+id="dynamic-jsonld"[^>]*>[\s\S]*?<\/script>/gi, '');

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

      // Atualizar / gerar sitemap.xml com entradas dinâmicas do blog se houver
      try {
        const supabaseUrl = 'https://kvesxatnmgvflqzuqgrz.supabase.co';
        const supabaseKey = 'sb_publishable_w1BVDyfby4kHakiBvO05ZA_R9Xgk3mu';
        const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts?publicado=eq.true&select=id,titulo,slug,criado_em,atualizado_em`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (res.ok) {
          const posts = (await res.json()) as Array<{ id: string; titulo?: string; slug?: string; criado_em?: string; atualizado_em?: string }>;
          const sitemapDistPath = path.join(distDir, 'sitemap.xml');
          let sitemapXml = fs.existsSync(sitemapDistPath)
            ? fs.readFileSync(sitemapDistPath, 'utf-8')
            : fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf-8');

          if (Array.isArray(posts) && posts.length > 0) {
            const blogEntries = posts
              .map((p) => {
                const routeSlug = p.slug || p.id;
                const lastmod = (p.atualizado_em || p.criado_em || new Date().toISOString()).split('T')[0];
                return `  <url>\n    <loc>${baseUrl}/blog?post=${encodeURIComponent(routeSlug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
              })
              .join('\n');

            sitemapXml = sitemapXml.replace('</urlset>', `${blogEntries}\n</urlset>`);
            fs.writeFileSync(sitemapDistPath, sitemapXml, 'utf-8');
            console.log(`[sitemap] Adicionados ${posts.length} posts do blog ao sitemap.xml.`);
          }
        }
      } catch (err) {
        console.warn('[sitemap] Não foi possível consultar posts do blog dinamicamente:', err);
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
