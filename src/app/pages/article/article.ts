import { Component, ViewEncapsulation, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ArticleData } from '@core/articles/articles.service';

@Component({
  selector: 'app-article',
  imports: [DatePipe],
  templateUrl: './article.html',
  encapsulation: ViewEncapsulation.None,
})
export class Article {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  get article(): ArticleData | null {
    return (this.routeData()['article'] as ArticleData | null | undefined) ?? null;
  }

  get relatedArticles(): ArticleData[] {
    return (this.article?.relatedArticles ?? []).slice(0, 3);
  }

  get relatedArticlesCount(): number {
    return this.relatedArticles.length;
  }

  hideBrokenImage(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    image?.classList.add('hidden');
  }

  useAvatarFallback(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith('/images/avatar-placeholder.png')) {
      return;
    }

    image.src = '/images/avatar-placeholder.png';
  }
}
