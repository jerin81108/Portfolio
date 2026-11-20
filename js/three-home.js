/**
 * three-home.js — High-performance Three.js star-field + particle portrait for HOME page.
 * Optimized for silky smooth 60/120 FPS scrolling with zero CPU layout thrashing.
 */

(function () {
  'use strict';

  const homeSection = document.getElementById('home');
  if (!homeSection || typeof THREE === 'undefined') return;

  try {
    /* =======================================================================
     * CANVAS SETUP
     * ===================================================================== */
    const threeCanvas = document.createElement('canvas');
    threeCanvas.id = 'threeCanvas';
    threeCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    homeSection.insertBefore(threeCanvas, homeSection.firstChild);

    /* =======================================================================
     * RENDERER, SCENE, CAMERA
     * ===================================================================== */
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(homeSection.offsetWidth, homeSection.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      homeSection.offsetWidth / homeSection.offsetHeight,
      0.1,
      2000
    );
    camera.position.z = 5;

    let targetCamX = 0;
    let targetCamY = 0;

    /* =======================================================================
     * STAR FIELD
     * ===================================================================== */
    const isMobile = window.innerWidth <= 768;
    const starCount = isMobile ? 1200 : 4000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 60 + Math.random() * 740;
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: isMobile ? 1.0 : 1.3,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    /* =======================================================================
     * PARTICLE PORTRAIT WITH PRECOMPUTED VECTORS (Zero Trig on Scroll)
     * ===================================================================== */
    let portraitPoints = null;
    let basePositions = null;
    let cachedCos = null;
    let cachedSin = null;
    let cachedDist = null;
    let cachedRnd = null;
    let particleCount = 0;

    const loader = new THREE.TextureLoader();
    loader.load(
      'images/pic.jpeg',
      (texture) => {
        const SIZE = isMobile ? 140 : 180;
        const offscreen = document.createElement('canvas');
        offscreen.width = SIZE;
        offscreen.height = SIZE;
        const octx = offscreen.getContext('2d');
        octx.drawImage(texture.image, 0, 0, SIZE, SIZE);

        const imageData = octx.getImageData(0, 0, SIZE, SIZE);
        const pixels = imageData.data;

        const rawPositions = [];
        const cosList = [];
        const sinList = [];
        const distList = [];
        const rndList = [];

        const step = isMobile ? 3 : 2;
        for (let py = 0; py < SIZE; py += step) {
          for (let px = 0; px < SIZE; px += step) {
            const idx = (py * SIZE + px) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const a = pixels[idx + 3];
            const brightness = (r + g + b) / 3;

            if (a > 120 && brightness > 55) {
              const worldX = (px / SIZE - 0.5) * 4;
              const worldY = -(py / SIZE - 0.5) * 4;
              const worldZ = 0;

              rawPositions.push(worldX, worldY, worldZ);

              const angle = Math.atan2(worldY, worldX);
              const dist = Math.hypot(worldX, worldY);
              cosList.push(Math.cos(angle));
              sinList.push(Math.sin(angle));
              distList.push(dist);
              rndList.push(Math.random() * 0.5 + 0.75);
            }
          }
        }

        particleCount = rawPositions.length / 3;
        basePositions = new Float32Array(rawPositions);
        cachedCos = new Float32Array(cosList);
        cachedSin = new Float32Array(sinList);
        cachedDist = new Float32Array(distList);
        cachedRnd = new Float32Array(rndList);

        const portraitGeometry = new THREE.BufferGeometry();
        portraitGeometry.setAttribute('position', new THREE.BufferAttribute(basePositions.slice(), 3));

        const portraitMaterial = new THREE.PointsMaterial({
          color: 0x38bdf8,
          size: isMobile ? 0.035 : 0.026,
          transparent: true,
          opacity: 0.95,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        portraitPoints = new THREE.Points(portraitGeometry, portraitMaterial);
        portraitPoints.position.set(0, 0, 0);
        scene.add(portraitPoints);
      },
      undefined,
      (err) => {
        console.warn('[three-home.js] Could not load particle portrait image:', err);
      }
    );

    /* =======================================================================
     * PASSIVE SCROLL POSITION TRACKER (Zero Geometry Updates in Listener)
     * ===================================================================== */
    let heroHeight = homeSection.offsetHeight || window.innerHeight;
    let targetScrollFraction = 0;
    let currentScrollFraction = 0;

    function updateScrollFraction() {
      if (heroHeight > 0) {
        targetScrollFraction = window.scrollY / heroHeight;
      }
    }
    window.addEventListener('scroll', updateScrollFraction, { passive: true });
    updateScrollFraction();

    /* =======================================================================
     * MOUSE PARALLAX (Normalized coordinates)
     * ===================================================================== */
    window.addEventListener('mousemove', (e) => {
      targetCamX = (e.clientX / window.innerWidth - 0.5) * 1.2;
      targetCamY = -(e.clientY / window.innerHeight - 0.5) * 0.8;
    }, { passive: true });

    /* =======================================================================
     * UNIFIED RENDER LOOP (Decoupled & Throttled to Viewport)
     * ===================================================================== */
    let isVisible = true;
    let isInViewport = true;
    let lastRenderedFraction = -999;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible || !isInViewport) return;

      // Slow star field rotation
      scene.rotation.y += 0.00012;

      // Smooth camera parallax
      camera.position.x = lerp(camera.position.x, targetCamX, 0.05);
      camera.position.y = lerp(camera.position.y, targetCamY, 0.05);

      // Smooth camera Z flight through stars during scroll
      currentScrollFraction = lerp(currentScrollFraction, targetScrollFraction, 0.12);
      const clampedFraction = Math.min(1.4, Math.max(0, currentScrollFraction));
      camera.position.z = 5 - clampedFraction * 40;
      camera.lookAt(0, 0, 0);

      // Update particle scatter only if hero is active and visible
      if (portraitPoints && basePositions && targetScrollFraction < 1.15) {
        portraitPoints.visible = true;

        if (Math.abs(currentScrollFraction - lastRenderedFraction) > 0.002) {
          lastRenderedFraction = currentScrollFraction;

          const scatter = clampedFraction * 1.8;
          portraitPoints.material.opacity = Math.max(0.1, 1 - clampedFraction * 1.5);

          const posAttr = portraitPoints.geometry.getAttribute('position');
          const posArray = posAttr.array;

          // Pure linear math with cached vectors (fast typed-array loop)
          for (let i = 0; i < particleCount; i++) {
            const sc = cachedDist[i] * scatter * cachedRnd[i];
            posArray[i * 3]     = basePositions[i * 3] + cachedCos[i] * sc;
            posArray[i * 3 + 1] = basePositions[i * 3 + 1] + cachedSin[i] * sc;
          }
          posAttr.needsUpdate = true;
        }
      } else if (portraitPoints && targetScrollFraction >= 1.15) {
        // Complete GPU bypass when user scrolls down to other sections
        portraitPoints.visible = false;
      }

      renderer.render(scene, camera);
    }
    animate();

    /* =======================================================================
     * VIEWPORT OBSERVER (Zero GPU work when scrolled past Hero)
     * ===================================================================== */
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    const viewportObserver = new IntersectionObserver((entries) => {
      isInViewport = entries[0].isIntersecting;
    }, { threshold: 0.02 });
    viewportObserver.observe(homeSection);

    /* =======================================================================
     * RESIZE HANDLER
     * ===================================================================== */
    window.addEventListener('resize', () => {
      heroHeight = homeSection.offsetHeight || window.innerHeight;
      const w = homeSection.offsetWidth;
      const h = homeSection.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, { passive: true });

  } catch (err) {
    console.warn('[three-home.js] Three.js initialization caught exception:', err);
  }

})();
