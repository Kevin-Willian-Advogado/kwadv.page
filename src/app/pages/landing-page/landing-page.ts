import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { Contacts } from '@shareds/component/contacts/contacts';
import { ArticleData } from '@core/articles/articles.service';
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  buildWhatsappUrl,
  buildSiteContactViewModel,
} from '@core/site-settings/site-settings.models';

@Component({
  selector: 'app-landing-page',
  imports: [Contacts, DatePipe],
  templateUrl: './landing-page.html',
})
export class LandingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  get allArticles(): ArticleData[] {
    return (this.routeData()['articles'] as ArticleData[] | undefined) ?? [];
  }

  get siteSettings(): SiteSettings {
    return (this.routeData()['siteSettings'] as SiteSettings | null | undefined) ?? DEFAULT_SITE_SETTINGS;
  }

  get contact() {
    return buildSiteContactViewModel(this.siteSettings);
  }

  get articlesEnabled(): boolean {
    return this.siteSettings.articlesEnabled;
  }

  get primaryContactUrl(): string {
    return buildWhatsappUrl(
      this.siteSettings,
      'Ola, vim pela pagina inicial e gostaria de agendar uma consulta online.',
    ) || '#contato';
  }

  get primaryContactTarget(): string | null {
    return this.contact.whatsappUrl ? '_blank' : null;
  }

  get primaryContactRel(): string | null {
    return this.contact.whatsappUrl ? 'noopener noreferrer' : null;
  }

  get featuredArticles(): ArticleData[] {
    const highlightedArticles = this.allArticles.filter((article) => article.highlights).slice(0, 3);
    return highlightedArticles.length >= 3 ? highlightedArticles : this.allArticles.slice(0, 3);
  }

  hideBrokenImage(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    image?.classList.add('hidden');
  }
}
