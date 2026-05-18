import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ARTICLES_DATA_SOURCE } from '@core/articles/articles.data-source';
import { SupabaseArticlesDataSource } from '@core/articles/articles.supabase.data-source';
import { SITE_SETTINGS_DATA_SOURCE } from '@core/site-settings/site-settings.data-source';
import { SupabaseSiteSettingsDataSource } from '@core/site-settings/site-settings.supabase.data-source';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: ARTICLES_DATA_SOURCE, useClass: SupabaseArticlesDataSource },
    { provide: SITE_SETTINGS_DATA_SOURCE, useClass: SupabaseSiteSettingsDataSource },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
