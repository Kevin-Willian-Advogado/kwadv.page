import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';

import { ArticlesService } from '@core/articles/articles.service';

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
    async getPrerenderParams() {
      const articles = await inject(ArticlesService).getAllArticles();
      return articles.map((article) => ({ slug: article.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
