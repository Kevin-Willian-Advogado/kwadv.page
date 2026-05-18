import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';

import { Layout } from "@layout/layout";
import { LandingPage } from "@pages/landing-page/landing-page";
import { Articles } from "@pages/articles/articles";
import { Article } from "@pages/article/article";
import { ArticleCategory, ArticleData, ArticlesService } from '@core/articles/articles.service';
import { SiteSettings } from '@core/site-settings/site-settings.models';
import { SiteSettingsService } from '@core/site-settings/site-settings.service';

const allArticlesResolver: ResolveFn<ArticleData[]> = async () => {
  const siteSettingsService = inject(SiteSettingsService);
  const articlesService = inject(ArticlesService);
  const settings = await siteSettingsService.getSettings();
  return settings.articlesEnabled ? articlesService.getAllArticles() : [];
};

const allCategoriesResolver: ResolveFn<ArticleCategory[]> = async () => {
  const siteSettingsService = inject(SiteSettingsService);
  const articlesService = inject(ArticlesService);
  const settings = await siteSettingsService.getSettings();
  return settings.articlesEnabled ? articlesService.getAllCategories().catch(() => []) : [];
};

const articleBySlugResolver: ResolveFn<ArticleData | null> = async (route) => {
  const siteSettingsService = inject(SiteSettingsService);
  const articlesService = inject(ArticlesService);
  const settings = await siteSettingsService.getSettings();
  if (!settings.articlesEnabled) {
    return null;
  }

  const slug = route.paramMap.get('slug') ?? '';
  return articlesService.getArticleBySlug(slug);
};

const siteSettingsResolver: ResolveFn<SiteSettings> = async () => {
  return inject(SiteSettingsService).getSettings();
};

export const routes: Routes = [
    {
        path: '', 
        component: Layout,
        resolve: { siteSettings: siteSettingsResolver },
        children: [
            { path: '', component: LandingPage, resolve: { siteSettings: siteSettingsResolver, articles: allArticlesResolver } },
            { path: 'artigos', component: Articles, resolve: { siteSettings: siteSettingsResolver, articles: allArticlesResolver, categories: allCategoriesResolver } },
            { path: 'artigo/:slug', component: Article, resolve: { siteSettings: siteSettingsResolver, article: articleBySlugResolver } }
        ]
    },
    { path: '**', redirectTo: '' }
];
