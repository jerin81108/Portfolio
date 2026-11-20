/**
 * cylinder-certs.js — 3D Glass Panel Gallery & Cylinder Carousel for Certificates
 *
 * CDN Dependencies (loaded in certificates.html <head>):
 *   <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
   * 1. LENIS & SCROLL PROGRESS: Handled globally by cinematic.js
   * ========================================================================= */

  /* =========================================================================
   * 3. INJECT FILTER BAR STYLES & 3D CYLINDER STYLES
   * ========================================================================= */
  const certStyle = document.createElement('style');
  certStyle.id = 'cylinder-certs-style';
  certStyle.textContent = `
    .cert-filter-bar {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
      margin: 0 auto 3rem;
      padding: 0 5%;
      max-width: 900px;
    }
    .cert-filter-btn {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(74, 144, 226, 0.25);
      color: rgba(255, 255, 255, 0.65);
      padding: 0.45rem 1.25rem;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      outline: none;
    }
    .cert-filter-btn:hover,
    .cert-filter-btn.active {
      background: rgba(74, 144, 226, 0.15);
      border-color: rgba(74, 144, 226, 0.6);
      color: var(--accent-1, #4a90e2);
      box-shadow: 0 0 15px rgba(74, 144, 226, 0.25);
      transform: translateY(-1px);
    }
    .cert-featured-badge {
      position: absolute;
      top: -1px;
      left: 1.2rem;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 0.2rem 0.75rem;
      background: linear-gradient(135deg, #4a90e2, #9333ea);
      color: #fff;
      border-radius: 0 0 8px 8px;
      z-index: 20;
      box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
    }
    .cert-shimmer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.35s ease;
      z-index: 5;
    }
    .cert-info-card {
      perspective: 1000px;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .cert-info-card.is-hidden {
      display: none !important;
    }
    /* 3D Fly-in Modal Polish */
    #cert-modal.open .modal-frame {
      animation: modal3DFly 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modal3DFly {
      0% {
        opacity: 0;
        transform: perspective(1000px) rotateX(15deg) translateY(40px) scale(0.92);
      }
      100% {
        opacity: 1;
        transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(certStyle);

  /* =========================================================================
   * 4. MAIN DOM READY
   * ========================================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.cert-info-card'));
    const container = document.querySelector('.cert-unified-section');

    if (!cards.length || !container) return;

    // Set 3D perspective on the main certificates grid container
    container.style.perspective = '1400px';

    /* ─── A. Inject Filter Bar ─── */
    const hero = document.querySelector('.cert-page-hero');
    if (hero) {
      const filterBar = document.createElement('div');
      filterBar.className = 'cert-filter-bar';
      filterBar.innerHTML = `
        <button class="cert-filter-btn active" data-filter="all">All (${cards.length})</button>
        <button class="cert-filter-btn" data-filter="hackathon">Hackathons</button>
        <button class="cert-filter-btn" data-filter="workshop">Workshops &amp; Labs</button>
        <button class="cert-filter-btn" data-filter="course">Certifications</button>
        <button class="cert-filter-btn" data-filter="recognition">Awards &amp; Honors</button>
      `;
      hero.parentNode.insertBefore(filterBar, hero.nextSibling);

      // Category mapper
      function getCategory(tagText) {
        const t = (tagText || '').toLowerCase();
        if (t.includes('hackathon')) return 'hackathon';
        if (t.includes('workshop') || t.includes('design') || t.includes('internship') || t.includes('troubleshooting')) return 'workshop';
        if (t.includes('hackerrank') || t.includes('certification') || t.includes('assessment') || t.includes('c#') || t.includes('sql') || t.includes('nptel')) return 'course';
        return 'recognition'; // innovation, appreciation, academic, recognition, core, achievement
      }

      // Filter click handling
      filterBar.querySelectorAll('.cert-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          filterBar.querySelectorAll('.cert-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;

          cards.forEach(card => {
            const tag = card.querySelector('.card-tag')?.textContent || '';
            const cat = getCategory(tag);
            const matches = filter === 'all' || cat === filter;

            if (matches) {
              card.classList.remove('is-hidden');
              if (!reducedMotion && typeof gsap !== 'undefined') {
                gsap.fromTo(card, 
                  { opacity: 0, scale: 0.94, y: 15 },
                  { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                );
              } else {
                card.style.opacity = '1';
                card.style.transform = '';
              }
            } else {
              card.classList.add('is-hidden');
            }
          });

          // Also hide/show empty era blocks if all cards within them are hidden
          document.querySelectorAll('.cert-era-block').forEach(block => {
            const visibleCards = block.querySelectorAll('.cert-info-card:not(.is-hidden)');
            block.style.display = visibleCards.length === 0 ? 'none' : 'block';
          });
        });
      });
    }

    /* ─── B. Inject Top Featured Badges & Shimmer ─── */
    cards.slice(0, 3).forEach(card => {
      if (!card.querySelector('.cert-featured-badge')) {
        const badge = document.createElement('span');
        badge.className = 'cert-featured-badge';
        badge.textContent = '★ Flagship Achievement';
        card.appendChild(badge);
      }
    });

    /* ─── C. 3D Tilt & Glass Shimmer per Card ─── */
    cards.forEach(card => {
      // Add shimmer layer
      const shimmer = document.createElement('div');
      shimmer.className = 'cert-shimmer';
      card.appendChild(shimmer);

      if (!reducedMotion) {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const dx = (x - rect.width / 2) / (rect.width / 2);
          const dy = (y - rect.height / 2) / (rect.height / 2);

          // 3D tilt with depth translateZ
          card.style.transform = `perspective(1000px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg) translateZ(12px)`;

          // Radial light shimmer following cursor
          shimmer.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(74, 144, 226, 0.18) 0%, transparent 60%)`;
          shimmer.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.transform = '';
          shimmer.style.opacity = '0';
          setTimeout(() => { card.style.transition = ''; }, 500);
        });
      }
    });

    // Ensure all certificate cards are visible immediately
    cards.forEach(card => {
      card.classList.add('appear');
      card.style.opacity = '1';
    });

    /* ─── D. GSAP Entrance Animation (Safe, clearProps ensures visibility) ─── */
    if (!reducedMotion && typeof gsap !== 'undefined') {
      gsap.fromTo(cards, 
        { opacity: 0.2, y: 25 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.03, 
          duration: 0.5, 
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        }
      );
    }
  });
})();
