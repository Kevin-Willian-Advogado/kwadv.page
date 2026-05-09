import { makeStateKey } from '@angular/core';

import { ArticleAuthor, ArticleCategory, ArticleData } from './articles.models';

export interface SerializedArticleData {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  coverImageUrl: string;
  content: string;
  metaDescription: string;
  publishedAt: string | null;
  categoryId: number | null;
  categoryName: string;
  highlights: boolean;
  authors: ArticleAuthor[];
  relatedArticles: SerializedArticleData[];
}

export const ARTICLES_STATE_KEY =
  makeStateKey<SerializedArticleData[]>('kwadv.articles');

export const ARTICLE_CATEGORIES_STATE_KEY =
  makeStateKey<ArticleCategory[]>('kwadv.article-categories');

export function serializeArticles(articles: ArticleData[]): SerializedArticleData[] {
  return articles.map((article) => serializeArticle(article));
}

export function deserializeArticles(articles: SerializedArticleData[]): ArticleData[] {
  return articles.map((article) => deserializeArticle(article));
}

function serializeArticle(article: ArticleData): SerializedArticleData {
  return {
    ...article,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    relatedArticles: serializeArticles(article.relatedArticles),
  };
}

function deserializeArticle(article: SerializedArticleData): ArticleData {
  return {
    ...article,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    relatedArticles: deserializeArticles(article.relatedArticles),
  };
}
