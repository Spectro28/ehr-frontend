import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing',
    imports: [RouterLink],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    encapsulation: ViewEncapsulation.None
})
export class LandingComponent implements OnInit {

  ngOnInit(): void {
    // ── Scroll reveal ──────────────────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('reveal-active');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // ── Navbar shrink on scroll ────────────────────────────────────
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.navbar') as HTMLElement | null;
      if (!nav) return;
      if (window.scrollY > 50) {
        nav.style.padding = '1rem 6%';
        nav.style.background = 'rgba(2, 8, 6, 0.97)';
      } else {
        nav.style.padding = '1.5rem 6%';
        nav.style.background = 'transparent';
      }
    });

    // ── Mapa interactivo ──────────────────────────────────────────
    // Click en zonas invisibles (polígonos)
    document.querySelectorAll('.pais-zona').forEach(zona => {
      zona.addEventListener('click', (e: Event) => {
        const el = e.currentTarget as SVGElement;
        const id = el.id.replace('zona-', '');
        this.selectPais(id);
      });
    });

    // Click en grupos de capital (puntos)
    document.querySelectorAll('.capital-group').forEach(group => {
      group.addEventListener('click', (e: Event) => {
        const el = e.currentTarget as SVGElement;
        const id = el.id.replace('dot-', '');
        this.selectPais(id);
      });
    });

    // Ecuador seleccionado por defecto
    this.selectPais('ecuador');
  }

  selectPais(pais: string): void {
    // Ocultar todos los info-cards
    document.querySelectorAll('.info-card').forEach(c => c.classList.add('hidden'));

    // Quitar estado activo de todos los grupos de capital
    document.querySelectorAll('.capital-group').forEach(g => g.classList.remove('sel'));

    // Mostrar tarjeta del país seleccionado
    const card = document.getElementById('info-' + pais);
    if (card) card.classList.remove('hidden');

    // Marcar el punto del país seleccionado
    const dot = document.getElementById('dot-' + pais);
    if (dot) dot.classList.add('sel');
  }
}