import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterOutlet } from '@angular/router';
import {
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  buildSiteContactViewModel,
} from '@core/site-settings/site-settings.models';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly whatsappBubbleStorageKey = 'kwadv.whatsappBubbleClosed';
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  menuAberto = false;
  isScrolled = false;
  showWhatsappBubble = false;

  get siteSettings(): SiteSettings {
    return (this.routeData()['siteSettings'] as SiteSettings | null | undefined) ?? DEFAULT_SITE_SETTINGS;
  }

  get contact() {
    return buildSiteContactViewModel(this.siteSettings);
  }

  get articlesEnabled(): boolean {
    return this.siteSettings.articlesEnabled;
  }

  get primaryContactUrl(): string {
    return this.contact.whatsappUrl || '/#contato';
  }

  get primaryContactTarget(): string | null {
    return this.contact.whatsappUrl ? '_blank' : null;
  }

  get primaryContactRel(): string | null {
    return this.contact.whatsappUrl ? 'noopener noreferrer' : null;
  }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    this.showWhatsappBubble =
      sessionStorage.getItem(this.whatsappBubbleStorageKey) !== 'true';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 80;
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    if (window.innerWidth >= 768 && this.menuAberto) {
      this.fecharMenu();
    }
  }

  toggleMenu() {
    this.menuAberto = !this.menuAberto;

    if (this.menuAberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  fecharMenu() {
    this.menuAberto = false;
    document.body.style.overflow = 'auto';
  }

  navegarParaSecao(event: Event, fragment: string) {
    event.preventDefault();
    this.fecharMenu();

    if (!this.isBrowser) {
      return;
    }

    void this.router.navigate(['/'], { fragment }).then(() => {
      window.setTimeout(() => this.viewportScroller.scrollToAnchor(fragment));
    });
  }

  navegarParaArtigos(event: Event) {
    event.preventDefault();
    this.fecharMenu();

    void this.router.navigate(['/artigos']);
  }

  fecharWhatsappBubble() {
    this.showWhatsappBubble = false;

    if (this.isBrowser) {
      sessionStorage.setItem(this.whatsappBubbleStorageKey, 'true');
    }
  }
}
