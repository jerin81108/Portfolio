/**
 * galaxy-projects.js — 3D depth effects for the Projects page
 *
 * CDN dependencies (already added to projects.html <head>):
 *   <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
   * 6. LENIS & SCROLL PROGRESS: Handled globally by cinematic.js
   * ───────────────────────────────────────────── */

  /* ─────────────────────────────────────────────
   * STATUS BADGE + GLARE ELEMENT INJECTION (CSS)
   * ───────────────────────────────────────────── */
  const badgeStyle = document.createElement('style');
  badgeStyle.textContent = `
    .project-status-badge {
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: 12px;
      z-index: 20;
    }
    .project-status-badge.live {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }
    .project-status-badge.research {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #818cf8;
    }
    .project-status-badge.prototype {
      background: rgba(234, 179, 8, 0.12);
      border: 1px solid rgba(234, 179, 8, 0.35);
      color: #eab308;
    }
    .card-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s;
    }
  `;
  document.head.appendChild(badgeStyle);

  /* ─────────────────────────────────────────────
   * DOMCONTENTLOADED — main setup
   * ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const grid = document.getElementById('projects-grid');

    if (!cards.length) return;

    /* ── Set perspective on grid ── */
    if (grid) grid.style.perspective = '1200px';

    /* ─────────────────────────────────────────────
     * 4. STATUS BADGES + card positioning
     * ───────────────────────────────────────────── */
    cards.forEach(card => {
      card.style.position = 'relative';
      card.style.overflow = 'hidden';

      const category = (card.dataset.category || '').toLowerCase();
      const hasLiveLink = card.querySelector('a.live-link') !== null;

      let badgeClass = 'prototype';
      let badgeText = 'Prototype';

      if (hasLiveLink) {
        badgeClass = 'live';
        badgeText = 'Live';
      } else if (category.includes('ai') || category.includes('digital-twin')) {
        badgeClass = 'research';
        badgeText = 'Research';
      }

      const badge = document.createElement('span');
      badge.className = `project-status-badge ${badgeClass}`;
      badge.textContent = badgeText;
      card.appendChild(badge);

      /* ─────────────────────────────────────────────
       * 3. GLARE EFFECT element per card
       * ───────────────────────────────────────────── */
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    });

    /* ─────────────────────────────────────────────
     * 2. 3D CARD TILT ENHANCEMENT + 3. GLARE EFFECT
     * ───────────────────────────────────────────── */
    cards.forEach(card => {
      const glare = card.querySelector('.card-glare');

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;

        card.style.transition = '';
        card.style.transform =
          `perspective(1000px) rotateX(${-dy * 12}deg) rotateY(${dx * 12}deg) translateZ(8px)`;

        /* Glare */
        if (glare) {
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          glare.style.background =
            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
          glare.style.opacity = '1';
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        card.style.transform = '';
        if (glare) glare.style.opacity = '0';

        /* After spring-back, remove transition so vanilla-tilt retakes control */
        setTimeout(() => {
          card.style.transition = '';
        }, 600);
      });
    });

    // Ensure all cards are visible immediately
    cards.forEach(card => {
      card.classList.add('appear');
      card.style.opacity = '1';
    });

    if (reducedMotion) return; // skip GSAP animations for reduced-motion users

    /* ─────────────────────────────────────────────
     * 1. GSAP ENTRANCE ANIMATION (ClearProps ensures no stuck opacity)
     * ───────────────────────────────────────────── */
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(cards, 
        { opacity: 0.2, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.04, 
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        }
      );
    }
  });
})();
