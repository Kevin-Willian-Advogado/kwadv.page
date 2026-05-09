import { ArticleAuthor, ArticleCategory, ArticleData } from './articles.models';
import {
  SupabaseArticleRow,
  SupabaseAuthorRow,
  SupabaseCategoryRow,
} from './articles.supabase.api';

const DEFAULT_CATEGORY_NAME = 'Geral';
const PUBLISHED_ARTICLE_STATUS = 1;
const PROCESSING_ARTICLE_STATUS = 0;

export function mapCategories(rows: SupabaseCategoryRow[]): ArticleCategory[] {
  const categoryNameById = new Map<number, string>();

  for (const row of rows) {
    const normalizedName = row.name?.trim() ?? '';
    if (!normalizedName) {
      continue;
    }

    categoryNameById.set(row.id, normalizedName);
  }

  return Array.from(categoryNameById, ([id, name]) => ({ id, name })).sort((left, right) =>
    left.name.localeCompare(right.name, 'pt-BR'),
  );
}

export function buildCategoryNameById(
  categories: ArticleCategory[],
): ReadonlyMap<number, string> {
  return new Map(categories.map((category) => [category.id, category.name] as const));
}

export function mapArticles(
  rows: SupabaseArticleRow[],
  categoryNameById: ReadonlyMap<number, string>,
): ArticleData[] {
  return rows
    .filter(isPublicationEligibleArticleRow)
    .map((row) => mapArticle(row, categoryNameById))
    .filter((article): article is ArticleData => article.slug.length > 0)
    .sort(sortByPublishedAtDesc);
}

function mapArticle(
  row: SupabaseArticleRow,
  categoryNameById: ReadonlyMap<number, string>,
): ArticleData {
  const relatedArticles = (row.article_related ?? [])
    .map((item) => item.articles)
    .filter((related): related is SupabaseArticleRow => !!related)
    .filter(isPublishedArticleRow)
    .map((related) => mapArticleWithoutRelations(related, categoryNameById))
    .filter((article) => article.slug.length > 0);

  return {
    ...mapArticleBase(row, categoryNameById),
    authors: mapAuthors(row.authors ?? []),
    relatedArticles,
  };
}

function mapArticleWithoutRelations(
  row: SupabaseArticleRow,
  categoryNameById: ReadonlyMap<number, string>,
): ArticleData {
  return {
    ...mapArticleBase(row, categoryNameById),
    authors: [],
    relatedArticles: [],
  };
}

function mapArticleBase(
  row: SupabaseArticleRow,
  categoryNameById: ReadonlyMap<number, string>,
): Omit<ArticleData, 'authors' | 'relatedArticles'> {
  return {
    id: row.id,
    title: row.title?.trim() ?? '',
    subtitle: row.subtitle?.trim() ?? '',
    slug: row.slug?.trim() ?? '',
    coverImageUrl: row.cover_image_url?.trim() ?? '',
    content: row.content ?? '',
    metaDescription: row.meta_description?.trim() ?? '',
    publishedAt: normalizeDate(row.published_at),
    categoryId: row.category_id,
    categoryName: resolveCategoryName(row.category_name, row.category_id, categoryNameById),
    highlights: !!row.highlights,
  };
}

function mapAuthors(authors: SupabaseAuthorRow[]): ArticleAuthor[] {
  return authors.map((author) => ({
    id: author.id,
    name: author.name?.trim() ?? '',
    profileImageUrl: author.profile_image_url,
    headline: author.headline ?? null,
    websiteUrl: author.website_url ?? null,
    linkedinUrl: author.linkedin_url ?? null,
  }));
}

function sortByPublishedAtDesc(left: ArticleData, right: ArticleData): number {
  const leftPublishedAt = left.publishedAt?.getTime();
  const rightPublishedAt = right.publishedAt?.getTime();

  if (leftPublishedAt === undefined && rightPublishedAt === undefined) {
    return 0;
  }

  if (leftPublishedAt === undefined) {
    return 1;
  }

  if (rightPublishedAt === undefined) {
    return -1;
  }

  return rightPublishedAt - leftPublishedAt;
}

function resolveCategoryName(
  categoryNameFromApi: string | null | undefined,
  categoryId: number | null,
  categoryNameById: ReadonlyMap<number, string>,
): string {
  if (categoryNameFromApi && categoryNameFromApi.trim().length > 0) {
    return categoryNameFromApi.trim();
  }

  if (categoryId !== null) {
    const resolvedName = categoryNameById.get(categoryId);
    if (resolvedName) {
      return resolvedName;
    }
  }

  return DEFAULT_CATEGORY_NAME;
}

function normalizeDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.replace(/(\.\d{3})\d+(?=[+-]\d{2}:\d{2}$)/, '$1');
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isPublicationEligibleArticleRow(row: SupabaseArticleRow): boolean {
  return (
    (row.status === PUBLISHED_ARTICLE_STATUS || row.status === PROCESSING_ARTICLE_STATUS) &&
    !!normalizeDate(row.published_at)
  );
}

function isPublishedArticleRow(row: SupabaseArticleRow): boolean {
  return row.status === PUBLISHED_ARTICLE_STATUS && !!normalizeDate(row.published_at);
}
