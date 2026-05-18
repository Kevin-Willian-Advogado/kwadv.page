import { Injectable, TransferState, inject } from '@angular/core';

import { SiteSettingsDataSource } from './site-settings.data-source';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from './site-settings.models';
import { SITE_SETTINGS_STATE_KEY } from './site-settings.transfer-state';

@Injectable()
export class TransferStateSiteSettingsDataSource implements SiteSettingsDataSource {
  private readonly transferState = inject(TransferState);

  getSettings(): Promise<SiteSettings> {
    return Promise.resolve(this.transferState.get(SITE_SETTINGS_STATE_KEY, DEFAULT_SITE_SETTINGS));
  }
}
