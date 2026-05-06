import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  menuAberto = false;
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 80; // Ponto de gatilho mais suave
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
}
