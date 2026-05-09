import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly whatsappBubbleStorageKey = 'kwadv.whatsappBubbleClosed';
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);

  menuAberto = false;
  isScrolled = false;
  showWhatsappBubble = false;

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    this.showWhatsappBubble =
      sessionStorage.getItem(this.whatsappBubbleStorageKey) !== 'true';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 80; // Ponto de gatilho mais suave
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    if (window.innerWidth >= 768 && this.menuAberto) {
      this.fecharMenu();
    }
  }

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
    // Trava o scroll do body quando o menu abre
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
