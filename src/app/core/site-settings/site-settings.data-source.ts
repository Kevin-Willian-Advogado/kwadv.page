import { InjectionToken } from '@angular/core';

import { SiteSettings } from './site-settings.models';

export interface SiteSettingsDataSource {
  getSettings(): Promise<SiteSettings>;
}

export const SITE_SETTINGS_DATA_SOURCE = new InjectionToken<SiteSettingsDataSource>(
  'SITE_SETTINGS_DATA_SOURCE',
);
