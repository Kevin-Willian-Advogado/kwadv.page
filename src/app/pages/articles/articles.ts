import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-articles',
  imports: [DatePipe],
  templateUrl: './articles.html',
  styleUrl: './articles.css',
})
export class Articles {
searchQuery: string = '';
  onSearch(value: string) { this.searchQuery = value.trim(); }

  get featuredArticles() {
    return this.allArticles.filter(a => a.highlights).slice(0, 3);
  }

  currentBannerIndex: number = 0;

  nextBanner() {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.featuredArticles.length;
  }

  prevBanner() {
    this.currentBannerIndex = (this.currentBannerIndex - 1 + this.featuredArticles.length) % this.featuredArticles.length;
  }

  selectedCategory: string = 'Todas';
  categories: string[] = ['Todas', 'Trabalhista', 'Previdenciário', 'Tecnologia'];

  get filteredArticles() {
    return this.allArticles.filter(article => {
      const matchesCategory = this.selectedCategory === 'Todas' || article.categoryName === this.selectedCategory;
      const matchesSearch = article.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  allArticles: any[] = [] 
  
  // private api = inject(ArticleService);

  // ngOnInit() {
  //   this.api.getAll().subscribe(res => {
  //     this.allArticles = res;
  //   });
  // }
}
