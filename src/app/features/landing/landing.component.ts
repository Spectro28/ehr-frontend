import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
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

    // ── Mapa interactivo: click en país ───────────────────────────
    // Usamos delegación de eventos en el SVG para evitar problemas con onclick inline
    const mapSvg = document.getElementById('latam-map');
    if (mapSvg) {
      mapSvg.addEventListener('click', (e: Event) => {
        const target = e.target as SVGElement;
        // Subir el árbol hasta encontrar el grupo con data-pais
        const group = target.closest('[data-pais]') as SVGElement | null;
        if (!group) return;
        const pais = group.getAttribute('data-pais');
        if (pais) this.selectPais(pais);
      });
    }
  }

  selectPais(pais: string): void {
    // Ocultar todos los info-cards
    document.querySelectorAll('.info-card').forEach(c => c.classList.add('hidden'));

    // Mostrar el del país seleccionado
    const card = document.getElementById('info-' + pais);
    if (card) card.classList.remove('hidden');

    // Resetear todos los paths al color base
    document.querySelectorAll('.pais-path').forEach((p: Element) => {
      const path = p as SVGPathElement;
      path.style.fill = '#051a12';
      path.style.opacity = '0.85';
    });

    // Ecuador tiene su propio color base más oscuro
    const ecuadorPath = document.querySelector('[data-pais="ecuador"] .pais-path') as SVGPathElement | null;
    if (ecuadorPath) {
      ecuadorPath.style.fill = '#0a3d2e';
      ecuadorPath.style.opacity = '1';
    }

    // Highlight del país seleccionado
    const selectedPath = document.querySelector(`[data-pais="${pais}"] .pais-path`) as SVGPathElement | null;
    if (selectedPath) {
      selectedPath.style.fill = pais === 'ecuador' ? '#0f5535' : '#0a3020';
      selectedPath.style.opacity = '1';
    }

    // Actualizar dot activo
    document.querySelectorAll('.pais-dot').forEach(d => d.classList.remove('dot-active'));
    const dot = document.querySelector(`[data-pais="${pais}"] .pais-dot`);
    if (dot) dot.classList.add('dot-active');
  }
}