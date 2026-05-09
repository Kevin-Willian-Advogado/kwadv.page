import { Injectable, TransferState, inject } from '@angular/core';

import { ArticlesDataSource } from './articles.data-source';
import { buildCategoryNameById, mapArticles, mapCategories } from './articles.mapper';
import { ArticleAuthor, ArticleCategory, ArticleData } from './articles.models';
import { ArticlesSupabaseApi } from './articles.supabase.api';
import {
  ARTICLE_CATEGORIES_STATE_KEY,
  ARTICLES_STATE_KEY,
  serializeArticles,
} from './articles.transfer-state';

@Injectable()
export class SupabaseArticlesDataSource implements ArticlesDataSource {
  private readonly supabaseApi = inject(ArticlesSupabaseApi);
  private readonly transferState = inject(TransferState);

  private articlesCache: Promise<ArticleData[]> | null = null;
  private categoriesCache: Promise<ArticleCategory[]> | null = null;
  private categoryNameByIdCache: Promise<ReadonlyMap<number, string>> | null = null;
  private staticAssetUrlCache = new Map<string, Promise<string>>();

  getAllArticles(): Promise<ArticleData[]> {
    if (!this.articlesCache) {
      this.articlesCache = this.fetchAndNormalizeArticles()
        .then((articles) => {
          this.transferState.set(ARTICLES_STATE_KEY, serializeArticles(articles));
          return articles;
        })
        .catch((error: unknown) => {
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
        .then((categories) => {
          this.transferState.set(ARTICLE_CATEGORIES_STATE_KEY, categories);
          return categories;
        })
        .catch((error: unknown) => {
          this.categoriesCache = null;
          this.categoryNameByIdCache = null;
          throw error;
        });
    }

    return this.categoriesCache;
  }

  private async fetchAndNormalizeArticles(): Promise<ArticleData[]> {
    const [rows, categoryNameById] = await Promise.all([
      this.supabaseApi.getArticles(),
      this.getCategoryNameById().catch(() => new Map<number, string>()),
    ]);

    return this.prepareArticlesForStaticRuntime(mapArticles(rows, categoryNameById));
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

  private async prepareArticlesForStaticRuntime(
    articles: ArticleData[],
  ): Promise<ArticleData[]> {
    return Promise.all(articles.map((article) => this.prepareArticleForStaticRuntime(article)));
  }

  private async prepareArticleForStaticRuntime(article: ArticleData): Promise<ArticleData> {
    const [coverImageUrl, content, authors, relatedArticles] = await Promise.all([
      this.toStaticAssetUrl(article.coverImageUrl),
      this.prepareHtmlContentForStaticRuntime(article.content),
      this.prepareAuthorsForStaticRuntime(article.authors),
      this.prepareArticlesForStaticRuntime(article.relatedArticles),
    ]);

    return {
      ...article,
      coverImageUrl,
      content,
      authors,
      relatedArticles,
    };
  }

  private async prepareAuthorsForStaticRuntime(
    authors: ArticleAuthor[],
  ): Promise<ArticleAuthor[]> {
    return Promise.all(
      authors.map(async (author) => ({
        ...author,
        profileImageUrl: await this.toStaticAssetUrl(author.profileImageUrl),
      })),
    );
  }

  private async prepareHtmlContentForStaticRuntime(content: string): Promise<string> {
    const imageSourceMatches = Array.from(
      content.matchAll(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi),
    );

    if (imageSourceMatches.length === 0) {
      return content;
    }

    let preparedContent = content;
    const sourceReplacements = new Map<string, string>();

    for (const match of imageSourceMatches) {
      const sourceUrl = match[2];
      if (!sourceUrl || sourceReplacements.has(sourceUrl)) {
        continue;
      }

      sourceReplacements.set(sourceUrl, await this.toStaticAssetUrl(sourceUrl));
    }

    for (const [sourceUrl, staticUrl] of sourceReplacements) {
      preparedContent = preparedContent.split(sourceUrl).join(staticUrl);
    }

    return preparedContent;
  }

  private toStaticAssetUrl(url: string): Promise<string>;
  private toStaticAssetUrl(url: string | null): Promise<string | null>;
  private async toStaticAssetUrl(url: string | null): Promise<string | null> {
    const normalizedUrl = url?.trim() ?? '';

    if (!normalizedUrl) {
      return url;
    }

    const parsedUrl = this.parseUrl(normalizedUrl);
    if (!parsedUrl) {
      return normalizedUrl;
    }

    if (this.isLocalDevelopmentUrl(parsedUrl)) {
      return '';
    }

    if (!this.isSupabaseStorageUrl(parsedUrl)) {
      return normalizedUrl;
    }

    let cachedStaticUrl = this.staticAssetUrlCache.get(normalizedUrl);
    if (!cachedStaticUrl) {
      cachedStaticUrl = this.fetchDataUrl(normalizedUrl);
      this.staticAssetUrlCache.set(normalizedUrl, cachedStaticUrl);
    }

    return cachedStaticUrl;
  }

  private parseUrl(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }

  private isLocalDevelopmentUrl(url: URL): boolean {
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  }

  private isSupabaseStorageUrl(url: URL): boolean {
    return (
      url.hostname === 'wwwntzwmvjvivputmlqg.supabase.co' &&
      url.pathname.startsWith('/storage/v1/object/public/')
    );
  }

  private async fetchDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Erro ao baixar asset estatico ${url}: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  }
}
