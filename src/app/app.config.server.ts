import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ARTICLES_DATA_SOURCE } from '@core/articles/articles.data-source';
import { SupabaseArticlesDataSource } from '@core/articles/articles.supabase.data-source';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: ARTICLES_DATA_SOURCE, useClass: SupabaseArticlesDataSource },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
