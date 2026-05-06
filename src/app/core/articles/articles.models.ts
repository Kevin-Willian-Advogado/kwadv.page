export interface ArticleAuthor {
  id: number;
  name: string;
  profileImageUrl: string | null;
  headline: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
}

export interface ArticleCategory {
  id: number;
  name: string;
}

export interface ArticleData {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  coverImageUrl: string;
  content: string;
  metaDescription: string;
  publishedAt: Date | null;
  categoryId: number | null;
  categoryName: string;
  highlights: boolean;
  authors: ArticleAuthor[];
  relatedArticles: ArticleData[];
}
