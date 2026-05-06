import { Injectable } from '@angular/core';

const SUPABASE_BASE_URL = 'https://wwwntzwmvjvivputmlqg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EREcwSKRXkRIRknqHOMh0g_FyIU7He0';
const PUBLISHED_ARTICLE_STATUS = 'eq.1';
const ARTICLES_SELECT =
  '*,authors(*),article_related!fk_article_related_links_articles_article_id(articles!fk_article_related_links_articles_related_articles_id(*))';

export interface SupabaseAuthorRow {
  id: number;
  name: string | null;
  profile_image_url: string | null;
  headline?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
}

export interface SupabaseArticleRelatedRow {
  articles?: SupabaseArticleRow | null;
}

export interface SupabaseArticleRow {
  id: number;
  title: string | null;
  subtitle: string | null;
  slug: string | null;
  cover_image_url: string | null;
  content: string | null;
  meta_description: string | null;
  published_at: string | null;
  category_id: number | null;
  category_name?: string | null;
  status: number | null;
  highlights: boolean | null;
  authors?: SupabaseAuthorRow[] | null;
  article_related?: SupabaseArticleRelatedRow[] | null;
}

export interface SupabaseCategoryRow {
  id: number;
  name: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ArticlesSupabaseApi {
  getArticles(): Promise<SupabaseArticleRow[]> {
    return this.request<SupabaseArticleRow[]>('/rest/v1/articles', {
      select: ARTICLES_SELECT,
      status: PUBLISHED_ARTICLE_STATUS,
      published_at: 'not.is.null',
      order: 'published_at.desc',
    });
  }

  getCategories(): Promise<SupabaseCategoryRow[]> {
    return this.request<SupabaseCategoryRow[]>('/rest/v1/categories', {
      select: '*',
    });
  }

  private async request<T>(path: string, query: Record<string, string>): Promise<T> {
    const url = new URL(path, SUPABASE_BASE_URL);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(
        `Erro ao consultar ${path} no Supabase: ${response.status} ${response.statusText}${details}`,
      );
    }

    return (await response.json()) as T;
  }

  private async readErrorDetails(response: Response): Promise<string> {
    try {
      const body = (await response.text()).trim();
      if (!body) {
        return '';
      }

      const maxLength = 240;
      const normalized = body.length > maxLength ? `${body.slice(0, maxLength)}...` : body;
      return ` - ${normalized}`;
    } catch {
      return '';
    }
  }
}
