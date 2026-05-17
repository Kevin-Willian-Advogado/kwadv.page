import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ARTICLES_DATA_SOURCE } from '@core/articles/articles.data-source';
import { TransferStateArticlesDataSource } from '@core/articles/articles.transfer-state.data-source';

registerLocaleData(localePtBr, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideClientHydration(withEventReplay()),
    { provide: ARTICLES_DATA_SOURCE, useClass: TransferStateArticlesDataSource },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};
