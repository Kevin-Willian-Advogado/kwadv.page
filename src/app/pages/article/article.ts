import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-article',
  imports: [DatePipe],
  templateUrl: './article.html',
  styleUrl: './article.css',
})
export class Article {
  article?: any
}
