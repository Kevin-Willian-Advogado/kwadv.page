import { Injectable, inject } from '@angular/core';

import { SITE_SETTINGS_DATA_SOURCE } from './site-settings.data-source';
import { SiteSettings } from './site-settings.models';

@Injectable({
  providedIn: 'root',
})
export class SiteSettingsService {
  private readonly dataSource = inject(SITE_SETTINGS_DATA_SOURCE);
  private settingsCache: Promise<SiteSettings> | null = null;

  getSettings(): Promise<SiteSettings> {
    if (!this.settingsCache) {
      this.settingsCache = this.dataSource.getSettings().catch((error: unknown) => {
        this.settingsCache = null;
        throw error;
      });
    }

    return this.settingsCache;
  }
}
