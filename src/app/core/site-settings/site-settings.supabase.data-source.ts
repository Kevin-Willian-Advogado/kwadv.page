import { Injectable, TransferState, inject } from '@angular/core';

import { SiteSettingsDataSource } from './site-settings.data-source';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from './site-settings.models';
import { SITE_SETTINGS_STATE_KEY } from './site-settings.transfer-state';

const SUPABASE_BASE_URL = 'https://wwwntzwmvjvivputmlqg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EREcwSKRXkRIRknqHOMh0g_FyIU7He0';
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']?.trim() ?? '';

interface SupabaseSiteSettingsRow {
  articles_enabled?: boolean | null;
  contact_phone_whatsapp?: string | null;
  contact_email?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
}

@Injectable()
export class SupabaseSiteSettingsDataSource implements SiteSettingsDataSource {
  private readonly transferState = inject(TransferState);
  private settingsCache: Promise<SiteSettings> | null = null;

  getSettings(): Promise<SiteSettings> {
    if (!this.settingsCache) {
      this.settingsCache = this.fetchSettings()
        .catch((error: unknown) => {
          console.warn('Nao foi possivel carregar site_settings no build:', error);
          return DEFAULT_SITE_SETTINGS;
        })
        .then((settings) => {
          this.transferState.set(SITE_SETTINGS_STATE_KEY, settings);
          return settings;
        });
    }

    return this.settingsCache;
  }

  private async fetchSettings(): Promise<SiteSettings> {
    const rows = await this.request<SupabaseSiteSettingsRow[]>('/rest/v1/site_settings', {
      select: 'articles_enabled,contact_phone_whatsapp,contact_email,instagram_url,linkedin_url',
      id: 'eq.1',
      limit: '1',
    });

    return this.mapSettings(rows[0]);
  }

  private async request<T>(path: string, query: Record<string, string>): Promise<T> {
    const url = new URL(path, SUPABASE_BASE_URL);
    const apiKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLISHABLE_KEY;

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const details = await this.readErrorDetails(response);
      throw new Error(
        `Erro ao consultar ${path} no Supabase: ${response.status} ${response.statusText}${details}`,
      );
    }

    return (await response.json()) as T;
  }

  private mapSettings(row: SupabaseSiteSettingsRow | undefined): SiteSettings {
    if (!row) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      articlesEnabled: row.articles_enabled !== false,
      contactPhoneWhatsapp: this.parseText(row.contact_phone_whatsapp),
      contactEmail: this.parseText(row.contact_email),
      instagramUrl: this.parseText(row.instagram_url),
      linkedinUrl: this.parseText(row.linkedin_url),
    };
  }

  private parseText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private async readErrorDetails(response: Response): Promise<string> {
    try {
      const body = (await response.text()).trim();
      if (!body) {
        return '';
      }

      const maxLength = 240;
      const normalized = body.length > maxLength ? `${body.slice(0, maxLength)}...` : body;
      return ` - ${normalized}`;
    } catch {
      return '';
    }
  }
}
