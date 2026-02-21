import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Contacts } from '@shareds/component/contacts/contacts';

@Component({
  selector: 'app-landing-page',
  imports: [Contacts, DatePipe],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  allArticles: any[] = [] 
}
