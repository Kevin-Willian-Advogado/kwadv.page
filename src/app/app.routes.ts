import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';

import { Layout } from "@layout/layout";
import { LandingPage } from "@pages/landing-page/landing-page";
import { Articles } from "@pages/articles/articles";
import { Article } from "@pages/article/article";
import { ArticleCategory, ArticleData, ArticlesService } from '@core/articles/articles.service';

const allArticlesResolver: ResolveFn<ArticleData[]> = async () => {
  return inject(ArticlesService).getAllArticles();
};

const allCategoriesResolver: ResolveFn<ArticleCategory[]> = async () => {
  return inject(ArticlesService).getAllCategories().catch(() => []);
};

const articleBySlugResolver: ResolveFn<ArticleData | null> = async (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(ArticlesService).getArticleBySlug(slug);
};

export const routes: Routes = [
    {
        path: '', 
        component: Layout,
        children: [
            { path: '', component: LandingPage, resolve: { articles: allArticlesResolver } },
            { path: 'artigos', component: Articles, resolve: { articles: allArticlesResolver, categories: allCategoriesResolver } },
            { path: 'artigo/:slug', component: Article, resolve: { article: articleBySlugResolver } }
        ]
    }
];
