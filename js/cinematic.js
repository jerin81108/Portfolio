/**
 * cinematic.js — Global cinematic layer for every page.
 *
 * ─── CDN TAGS TO ADD TO EVERY HTML PAGE (before this script) ───────────────
 *
 * <!-- Lenis smooth scroll -->
 * <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
 *
 * <!-- GSAP 3.12.5 + ScrollTrigger (required for GSAP ticker integration) -->
 * <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
 *
 * <!-- This file -->
 * <script src="js/cinematic.js" defer></script>
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* =========================================================================
   * UTILITY — prefers-reduced-motion check
   * ========================================================================= */
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
   * 1. LENIS SMOOTH SCROLL (Unified Global Instance)
   * ========================================================================= */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.0,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
    });
    window.lenis = lenis;

    // Connect Lenis to ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // High performance ticker integration with GSAP
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    }

    // Connect Lenis to scroll progress bar (cached, zero layout thrashing)
    let cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.addEventListener('resize', () => {
      cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }, { passive: true });

    const scrollLine = document.getElementById('scrollProgressLine');
    if (scrollLine) {
      lenis.on('scroll', (e) => {
        const scrollPos = (typeof e.scroll === 'number') ? e.scroll : window.scrollY;
        const pct = Math.min(100, Math.max(0, (scrollPos / cachedScrollTotal) * 100));
        scrollLine.style.width = pct + '%';
      });
    }
  }

  /* =========================================================================
   * 9. SCROLL PROGRESS FALLBACK (if Lenis not available)
   * ========================================================================= */
  if (typeof Lenis === 'undefined') {
    let cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.addEventListener('resize', () => {
      cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }, { passive: true });

    const el = document.getElementById('scrollProgressLine');
    if (el) {
      window.addEventListener('scroll', () => {
        const pct = Math.min(100, Math.max(0, (window.scrollY / cachedScrollTotal) * 100));
        el.style.width = pct + '%';
      }, { passive: true });
    }
  }

  /* =========================================================================
   * ALL ANIMATION FEATURES — gated by prefers-reduced-motion
   * ========================================================================= */
  if (!reduced()) {

    /* -----------------------------------------------------------------------
     * 2. VIEW TRANSITIONS (Native Declarative)
     * --------------------------------------------------------------------- */
    if (!document.getElementById('vt-styles')) {
      const vtStyle = document.createElement('style');
      vtStyle.id = 'vt-styles';
      vtStyle.textContent = `
        @supports (view-transition-name: none) {
          @view-transition { navigation: auto; }
          ::view-transition-old(root) { animation: vtFadeOut 0.35s ease both; }
          ::view-transition-new(root) { animation: vtZoomIn 0.45s ease both; }
          @keyframes vtFadeOut {
            to { opacity: 0; transform: scale(1.04); }
          }
          @keyframes vtZoomIn {
            from { opacity: 0; transform: scale(0.96); }
          }
        }
      `;
      document.head.appendChild(vtStyle);
    }

    /* -----------------------------------------------------------------------
     * 4. FILM GRAIN + VIGNETTE (Optimized GPU Pattern — 0% CPU Overhead)
     * --------------------------------------------------------------------- */
    (function initFilmGrain() {
      // Vignette
      const vignette = document.createElement('div');
      vignette.id = 'vignette';
      vignette.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);';
      document.body.appendChild(vignette);

      // Lightweight 128x128 noise pattern canvas (generated ONCE, GPU-tiled across viewport)
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      const nCtx = noiseCanvas.getContext('2d');
      if (nCtx) {
        const imgData = nCtx.createImageData(128, 128);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = 20; // 8% opacity in texture
        }
        nCtx.putImageData(imgData, 0, 0);

        const grain = document.createElement('div');
        grain.id = 'film-grain';
        grain.style.cssText = `position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;opacity:0.04;background-image:url(${noiseCanvas.toDataURL()});background-repeat:repeat;`;
        document.body.appendChild(grain);

        // Hardware-accelerated position shifting without reallocating memory
        let gx = 0, gy = 0;
        setInterval(() => {
          gx = (gx + 19) % 128;
          gy = (gy + 29) % 128;
          grain.style.backgroundPosition = `${gx}px ${gy}px`;
        }, 120);
      }
    })();

    /* -----------------------------------------------------------------------
     * 5. STAR-TRAIL CURSOR
     * --------------------------------------------------------------------- */
    (function initCursor() {
      const isTouch = () => window.matchMedia('(hover: none)').matches;
      if (isTouch()) return;

      // Hide default cursor
      const cursorStyle = document.createElement('style');
      cursorStyle.textContent = 'body.cursor-active { cursor: none; }';
      document.head.appendChild(cursorStyle);
      document.body.classList.add('cursor-active');

      // Primary dot
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      dot.style.cssText = 'position:fixed;width:10px;height:10px;border-radius:50%;background:var(--accent-1,#4a90e2);pointer-events:none;z-index:99998;transform:translate(-50%,-50%);mix-blend-mode:screen;left:-20px;top:-20px;';
      document.body.appendChild(dot);

      let mouseX = -100, mouseY = -100;
      let dotX = -100, dotY = -100;

      window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Star pool
      const POOL_SIZE = 20;
      const stars = Array.from({ length: POOL_SIZE }, () => {
        const s = document.createElement('div');
        s.className = 'cursor-star';
        s.style.cssText = 'position:fixed;width:3px;height:3px;border-radius:50%;background:white;pointer-events:none;z-index:99996;transform:translate(-50%,-50%);opacity:0;left:-10px;top:-10px;';
        document.body.appendChild(s);
        return s;
      });

      let starIndex = 0;

      window.addEventListener('mousemove', e => {
        const star = stars[starIndex % POOL_SIZE];
        starIndex++;
        star.style.left = e.clientX + 'px';
        star.style.top = e.clientY + 'px';
        star.style.opacity = '1';
        star.style.transform = 'translate(-50%,-50%) scale(1)';
        star.style.transition = 'none';

        requestAnimationFrame(() => {
          star.style.transition = 'opacity 600ms ease, transform 600ms ease';
          star.style.opacity = '0';
          star.style.transform = 'translate(-50%,-50%) scale(0.2)';
        });
      });

      // Lerp dot to cursor
      function lerp(a, b, t) { return a + (b - a) * t; }

      function animateDot() {
        dotX = lerp(dotX, mouseX, 0.18);
        dotY = lerp(dotY, mouseY, 0.18);
        dot.style.left = dotX + 'px';
        dot.style.top = dotY + 'px';
        requestAnimationFrame(animateDot);
      }
      animateDot();
    })();

    /* -----------------------------------------------------------------------
     * 6. MAGNETIC BUTTONS
     * --------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
      const magneticSelectors = '.cta-button, .cta-button-outline, .featured-repo-btn';
      const buttons = document.querySelectorAll(magneticSelectors);

      buttons.forEach(btn => {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.23,1,0.32,1)';

        btn.addEventListener('mousemove', e => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);

          if (dist < 80) {
            const t = 1 - dist / 80;
            const tx = dx * t * 0.4;
            const ty = dy * t * 0.4;
            const clampedX = Math.max(-15, Math.min(15, tx));
            const clampedY = Math.max(-15, Math.min(15, ty));
            btn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
          }
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0,0)';
        });
      });
    });

    /* -----------------------------------------------------------------------
     * 7. LETTERBOX BARS (first page load only)
     * --------------------------------------------------------------------- */
    (function initLetterbox() {
      if (sessionStorage.getItem('letterbox-shown')) return;
      sessionStorage.setItem('letterbox-shown', '1');

      const top = document.createElement('div');
      top.className = 'letterbox-bar letterbox-top';
      top.style.cssText = 'position:fixed;left:0;right:0;top:0;height:60px;background:#000;z-index:99000;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease;';

      const bottom = document.createElement('div');
      bottom.className = 'letterbox-bar letterbox-bottom';
      bottom.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:60px;background:#000;z-index:99000;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease;';

      document.body.appendChild(top);
      document.body.appendChild(bottom);

      setTimeout(() => {
        top.style.transform = 'translateY(-100%)';
        bottom.style.transform = 'translateY(100%)';

        setTimeout(() => {
          top.style.opacity = '0';
          bottom.style.opacity = '0';
          setTimeout(() => {
            top.remove();
            bottom.remove();
          }, 400);
        }, 600);
      }, 1200);
    })();

    /* -----------------------------------------------------------------------
     * 8. SPLIT-TEXT SECTION TITLES
     * --------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
      const headings = document.querySelectorAll('h2.fade-in');

      headings.forEach(h2 => {
        const text = h2.textContent;
        h2.textContent = '';
        h2.setAttribute('aria-label', text);

        [...text].forEach(char => {
          const span = document.createElement('span');
          span.style.cssText = 'display:inline-block;transform:translateZ(-40px) translateY(30px);opacity:0;transition:transform 0.5s ease, opacity 0.5s ease;';
          span.textContent = char === ' ' ? '\u00A0' : char;
          h2.appendChild(span);
        });

        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const spans = entry.target.querySelectorAll('span');
              spans.forEach((span, i) => {
                setTimeout(() => {
                  span.style.transform = 'translateZ(0) translateY(0)';
                  span.style.opacity = '1';
                }, i * 30);
              });
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        observer.observe(h2);
      });
    });

  } // end if (!reduced())

})();
