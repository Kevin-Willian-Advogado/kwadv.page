import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { Contacts } from '@shareds/component/contacts/contacts';
import { ArticleData } from '@core/articles/articles.service';

@Component({
  selector: 'app-landing-page',
  imports: [Contacts, DatePipe],
  templateUrl: './landing-page.html',
})
export class LandingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  get allArticles(): ArticleData[] {
    return (this.routeData()['articles'] as ArticleData[] | undefined) ?? [];
  }

  get featuredArticles(): ArticleData[] {
    return this.allArticles.filter((article) => article.highlights).slice(0, 3);
  }

  hideBrokenImage(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    image?.classList.add('hidden');
  }
}
