export interface SiteSettings {
  articlesEnabled: boolean;
  contactPhoneWhatsapp: string;
  contactEmail: string;
  instagramUrl: string;
  linkedinUrl: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  articlesEnabled: true,
  contactPhoneWhatsapp: '',
  contactEmail: '',
  instagramUrl: '',
  linkedinUrl: '',
};

export interface SiteContactViewModel {
  phoneDisplay: string;
  whatsappUrl: string;
  email: string;
  emailUrl: string;
  instagramLabel: string;
  instagramUrl: string;
  linkedinLabel: string;
  linkedinUrl: string;
}

export function buildSiteContactViewModel(settings: SiteSettings): SiteContactViewModel {
  const whatsappDigits = settings.contactPhoneWhatsapp.replace(/\D/g, '');
  const email = settings.contactEmail.trim();
  const instagramUrl = settings.instagramUrl.trim();
  const linkedinUrl = settings.linkedinUrl.trim();

  return {
    phoneDisplay: settings.contactPhoneWhatsapp.trim(),
    whatsappUrl: whatsappDigits
      ? buildWhatsappUrl(settings, 'Ola, vim pelo site e gostaria de atendimento juridico.')
      : '',
    email,
    emailUrl: email ? `mailto:${email}` : '',
    instagramLabel: toSocialLabel(instagramUrl, 'instagram.com'),
    instagramUrl,
    linkedinLabel: toSocialLabel(linkedinUrl, 'linkedin.com'),
    linkedinUrl,
  };
}

export function buildWhatsappUrl(settings: SiteSettings, message: string): string {
  const whatsappDigits = settings.contactPhoneWhatsapp.replace(/\D/g, '');

  if (!whatsappDigits) {
    return '';
  }

  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return `https://wa.me/${whatsappDigits}`;
  }

  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(normalizedMessage)}`;
}

function toSocialLabel(value: string, marker: string): string {
  if (!value) {
    return '';
  }

  if (value.startsWith('@')) {
    return value;
  }

  try {
    const url = new URL(value);
    const normalizedPath = url.pathname.replace(/^\/+|\/+$/g, '');

    if (!normalizedPath) {
      return url.hostname;
    }

    if (url.hostname.includes('instagram.com')) {
      return `@${normalizedPath.split('/')[0]}`;
    }

    if (url.hostname.includes('linkedin.com')) {
      return `linkedin.com/${normalizedPath}`;
    }

    return `${marker}/${normalizedPath.split('/')[0]}`;
  } catch {
    return value;
  }
}
