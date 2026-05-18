import { makeStateKey } from '@angular/core';

import { SiteSettings } from './site-settings.models';

export const SITE_SETTINGS_STATE_KEY = makeStateKey<SiteSettings>('kwadv.site-settings');
