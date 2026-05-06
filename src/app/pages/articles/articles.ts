import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ArticleCategory, ArticleData } from '@core/articles/articles.service';

@Component({
  selector: 'app-articles',
  imports: [DatePipe],
  templateUrl: './articles.html',
  styleUrl: './articles.css',
})
export class Articles {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  searchQuery = '';
  selectedCategory = 'Todas';
  currentBannerIndex = 0;

  onSearch(value: string): void {
    this.searchQuery = value.trim();
  }

  get allArticles(): ArticleData[] {
    return (this.routeData()['articles'] as ArticleData[] | undefined) ?? [];
  }

  get featuredArticles(): ArticleData[] {
    return this.allArticles.filter((article) => article.highlights).slice(0, 3);
  }

  get allCategories(): ArticleCategory[] {
    return (this.routeData()['categories'] as ArticleCategory[] | undefined) ?? [];
  }

  get categories(): string[] {
    const dynamicCategories = Array.from(new Set([
      ...this.allCategories.map((category) => category.name),
      ...this.allArticles.map((article) => article.categoryName),
    ].filter((category) => !!category)));

    return ['Todas', ...dynamicCategories];
  }

  get filteredArticles(): ArticleData[] {
    const normalizedSearch = this.searchQuery.toLowerCase();

    return this.allArticles.filter((article) => {
      const matchesCategory =
        this.selectedCategory === 'Todas' || article.categoryName === this.selectedCategory;
      const matchesSearch = article.title.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }

  nextBanner(): void {
    const total = this.featuredArticles.length;
    if (total === 0) {
      return;
    }

    this.currentBannerIndex = (this.currentBannerIndex + 1) % total;
  }

  prevBanner(): void {
    const total = this.featuredArticles.length;
    if (total === 0) {
      return;
    }

    this.currentBannerIndex = (this.currentBannerIndex - 1 + total) % total;
  }

  hideBrokenImage(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    image?.classList.add('hidden');
  }
}
