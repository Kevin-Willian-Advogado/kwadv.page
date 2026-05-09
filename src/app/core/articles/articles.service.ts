import { Injectable, inject } from '@angular/core';

import { ARTICLES_DATA_SOURCE } from './articles.data-source';
import { ArticleCategory, ArticleData } from './articles.models';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  private readonly dataSource = inject(ARTICLES_DATA_SOURCE);

  private articlesCache: Promise<ArticleData[]> | null = null;
  private categoriesCache: Promise<ArticleCategory[]> | null = null;

  getAllArticles(): Promise<ArticleData[]> {
    if (!this.articlesCache) {
      this.articlesCache = this.dataSource.getAllArticles().catch((error: unknown) => {
        this.articlesCache = null;
        throw error;
      });
    }

    return this.articlesCache;
  }

  getAllCategories(): Promise<ArticleCategory[]> {
    if (!this.categoriesCache) {
      this.categoriesCache = this.dataSource.getAllCategories().catch((error: unknown) => {
        this.categoriesCache = null;
        throw error;
      });
    }

    return this.categoriesCache;
  }

  async getArticleBySlug(slug: string): Promise<ArticleData | null> {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return null;
    }

    const articles = await this.getAllArticles();
    return articles.find((article) => article.slug === normalizedSlug) ?? null;
  }
}

export type { ArticleAuthor, ArticleCategory, ArticleData } from './articles.models';
