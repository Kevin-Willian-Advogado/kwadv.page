import { InjectionToken } from '@angular/core';

import { ArticleCategory, ArticleData } from './articles.models';

export interface ArticlesDataSource {
  getAllArticles(): Promise<ArticleData[]>;
  getAllCategories(): Promise<ArticleCategory[]>;
}

export const ARTICLES_DATA_SOURCE = new InjectionToken<ArticlesDataSource>(
  'ARTICLES_DATA_SOURCE',
);
