import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  private readonly defaultImage = '/assets/og_social_preview.jpg';
  private readonly defaultSiteName = 'Garaje Familiar';
  private readonly baseUrl = 'https://controlador-gasoil.vercel.app';

  public setSeo(config: SeoConfig): void {
    const fullTitle = `${config.title} | ${this.defaultSiteName}`;
    const pageUrl = config.url ? `${this.baseUrl}${config.url}` : this.baseUrl;
    const imageUrl = config.image ? (config.image.startsWith('http') ? config.image : `${this.baseUrl}${config.image}`) : `${this.baseUrl}${this.defaultImage}`;

    // Document Title
    this.titleService.setTitle(fullTitle);

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    } else {
      this.metaService.updateTag({ name: 'keywords', content: 'gasoil, vehiculos familiares, control de gastos, mantenimiento de coche, itv, repostajes, ahorro combustible' });
    }

    // OpenGraph Meta Tags
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: this.defaultSiteName });

    // Twitter Card Meta Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });
  }

  public injectJsonLd(schemaData: Record<string, any>, schemaId: string = 'app-json-ld'): void {
    let scriptElement = document.getElementById(schemaId) as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = schemaId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.text = JSON.stringify(schemaData);
  }
}
