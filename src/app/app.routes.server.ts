import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

import { ArticlesService } from '@core/articles/articles.service';
import { SiteSettingsService } from '@core/site-settings/site-settings.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'artigos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'artigo/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      const siteSettingsService = inject(SiteSettingsService);
      const articlesService = inject(ArticlesService);
      const settings = await siteSettingsService.getSettings();
      if (!settings.articlesEnabled) {
        return [];
      }

      const articles = await articlesService.getAllArticles();
      return articles.map((article) => ({ slug: article.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
