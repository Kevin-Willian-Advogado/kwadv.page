import { Injectable, TransferState, inject } from '@angular/core';

import { ArticlesDataSource } from './articles.data-source';
import { ArticleCategory, ArticleData } from './articles.models';
import {
  ARTICLE_CATEGORIES_STATE_KEY,
  ARTICLES_STATE_KEY,
  deserializeArticles,
} from './articles.transfer-state';

@Injectable()
export class TransferStateArticlesDataSource implements ArticlesDataSource {
  private readonly transferState = inject(TransferState);

  getAllArticles(): Promise<ArticleData[]> {
    const serializedArticles = this.transferState.get(ARTICLES_STATE_KEY, []);
    return Promise.resolve(deserializeArticles(serializedArticles));
  }

  getAllCategories(): Promise<ArticleCategory[]> {
    return Promise.resolve(this.transferState.get(ARTICLE_CATEGORIES_STATE_KEY, []));
  }
}
