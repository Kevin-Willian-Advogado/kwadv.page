import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ArticleCategory, ArticleData } from '@core/articles/articles.service';
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  buildSiteContactViewModel,
} from '@core/site-settings/site-settings.models';

@Component({
  selector: 'app-articles',
  imports: [DatePipe],
  templateUrl: './articles.html',
})
export class Articles {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  searchQuery = '';
  selectedCategory = 'Todas';
  currentBannerIndex = 0;
  isCategoryFilterOpen = false;

  onSearch(value: string): void {
    this.searchQuery = value.trim();
  }

  toggleCategoryFilter(): void {
    this.isCategoryFilterOpen = !this.isCategoryFilterOpen;
  }

  closeCategoryFilter(): void {
    this.isCategoryFilterOpen = false;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.isCategoryFilterOpen = false;
  }

  get allArticles(): ArticleData[] {
    return (this.routeData()['articles'] as ArticleData[] | undefined) ?? [];
  }

  get siteSettings(): SiteSettings {
    return (this.routeData()['siteSettings'] as SiteSettings | null | undefined) ?? DEFAULT_SITE_SETTINGS;
  }

  get contact() {
    return buildSiteContactViewModel(this.siteSettings);
  }

  get articlesEnabled(): boolean {
    return this.siteSettings.articlesEnabled;
  }

  get primaryContactUrl(): string {
    return this.contact.whatsappUrl || '/#contato';
  }

  get primaryContactTarget(): string | null {
    return this.contact.whatsappUrl ? '_blank' : null;
  }

  get primaryContactRel(): string | null {
    return this.contact.whatsappUrl ? 'noopener noreferrer' : null;
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
