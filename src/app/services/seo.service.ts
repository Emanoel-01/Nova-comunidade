import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly baseUrl = 'https://emanoelamorim.com';

  atualizar(dados: SeoData): void {
    this.titleService.setTitle(dados.title);
    this.metaService.updateTag({ name: 'description', content: dados.description });
    this.metaService.updateTag({ property: 'og:title', content: dados.title });
    this.metaService.updateTag({ property: 'og:description', content: dados.description });
    this.metaService.updateTag({ property: 'og:url', content: `${this.baseUrl}${dados.canonicalPath}` });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    if (dados.ogImage) {
      this.metaService.updateTag({ property: 'og:image', content: dados.ogImage });
    }
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: dados.title });
    this.metaService.updateTag({ name: 'twitter:description', content: dados.description });

    if (typeof document !== 'undefined') {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', `${this.baseUrl}${dados.canonicalPath}`);
    }
  }
}
