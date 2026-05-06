import { Injectable, inject } from '@angular/core';

import { buildCategoryNameById, mapArticles, mapCategories } from './articles.mapper';
import { ArticleCategory, ArticleData } from './articles.models';
import { ArticlesSupabaseApi } from './articles.supabase.api';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  private readonly supabaseApi = inject(ArticlesSupabaseApi);

  private articlesCache: Promise<ArticleData[]> | null = null;
  private categoriesCache: Promise<ArticleCategory[]> | null = null;
  private categoryNameByIdCache: Promise<ReadonlyMap<number, string>> | null = null;

  getAllArticles(): Promise<ArticleData[]> {
    if (!this.articlesCache) {
      this.articlesCache = this.fetchAndNormalizeArticles().catch((error: unknown) => {
        this.articlesCache = null;
        throw error;
      });
    }

    return this.articlesCache;
  }

  getAllCategories(): Promise<ArticleCategory[]> {
    if (!this.categoriesCache) {
      this.categoriesCache = this.supabaseApi
        .getCategories()
        .then((rows) => mapCategories(rows))
        .catch((error: unknown) => {
          this.categoriesCache = null;
          this.categoryNameByIdCache = null;
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

  private async fetchAndNormalizeArticles(): Promise<ArticleData[]> {
    const [rows, categoryNameById] = await Promise.all([
      this.supabaseApi.getArticles(),
      this.getCategoryNameById().catch(() => new Map<number, string>()),
    ]);

    return mapArticles(rows, categoryNameById);
  }

  private getCategoryNameById(): Promise<ReadonlyMap<number, string>> {
    if (!this.categoryNameByIdCache) {
      this.categoryNameByIdCache = this.getAllCategories()
        .then((categories) => buildCategoryNameById(categories))
        .catch((error: unknown) => {
          this.categoryNameByIdCache = null;
          throw error;
        });
    }

    return this.categoryNameByIdCache;
  }
}

export type { ArticleAuthor, ArticleCategory, ArticleData } from './articles.models';
