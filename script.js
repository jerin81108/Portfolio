document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a, button, .project-card, .cert-card, .logo');

    // Window Metrics Cache (Prevents Layout Thrashing)
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;
    let currentScrollY = window.scrollY;

    window.addEventListener('resize', () => {
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
    }, { passive: true });

    window.addEventListener('scroll', () => {
        currentScrollY = window.scrollY;
    }, { passive: true });

    links.forEach(link => {
        // Torch Effect for cards (Throttled/Optimized)
        if (link.classList.contains('project-card') || link.classList.contains('lib-item') || link.classList.contains('cert-card')) {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                link.style.setProperty('--mouse-x', `${x}px`);
                link.style.setProperty('--mouse-y', `${y}px`);
            });
        }
    });

    // Dynamic Top Scroll Line & Navigation Styling (Cached, No Reflow)
    const scrollProgressLine = document.getElementById('scrollProgressLine');
    const nav = document.querySelector('nav');
    let cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let navIsScrolled = false;

    window.addEventListener('resize', () => {
        cachedScrollTotal = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }, { passive: true });

    let isScrollTick = false;
    const updateScrollProgress = () => {
        const scrollFraction = cachedScrollTotal > 0 ? Math.min(1, Math.max(0, window.scrollY / cachedScrollTotal)) : 0;
        
        if (scrollProgressLine && !window.lenis) {
            scrollProgressLine.style.width = `${scrollFraction * 100}%`;
        }

        // Navigation state toggle without layout recalculation
        if (nav) {
            const shouldBeScrolled = window.scrollY > 50;
            if (shouldBeScrolled !== navIsScrolled) {
                navIsScrolled = shouldBeScrolled;
                if (navIsScrolled) {
                    nav.style.padding = '1rem 8%';
                    nav.style.background = 'rgba(3, 7, 18, 0.9)';
                } else {
                    nav.style.padding = '1.5rem 8%';
                    nav.style.background = 'rgba(3, 7, 18, 0.7)';
                }
            }
        }

        isScrollTick = false;
    };

    window.addEventListener('scroll', () => {
        if (!isScrollTick) {
            window.requestAnimationFrame(updateScrollProgress);
            isScrollTick = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (!isScrollTick) {
            window.requestAnimationFrame(updateScrollProgress);
            isScrollTick = true;
        }
    }, { passive: true });

    // Initial sync
    updateScrollProgress();

    // Reveal elements on scroll & initial load
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px 50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const segment = entry.target.querySelector('.section-segment');
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                if (segment) segment.classList.add('active-segment');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.5) {
            el.classList.add('appear');
        }
        observer.observe(el);
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetId = href.substring(href.indexOf('#'));
            
            // Check if it's an internal link on the current page
            const isInternal = href.startsWith('#') || 
                             (href.includes(window.location.pathname.split('/').pop()) && href.includes('#'));

            if (isInternal && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('sender-name').value;
            const id = document.getElementById('sender-id').value;
            const message = document.getElementById('message-input').value;

            if (message.trim() && name.trim() && id.trim()) {
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;

                fetch("https://formsubmit.co/ajax/jerin81108@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email_or_id: id,
                        message: message
                    })
                })
                .then(async response => {
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Thank you for your message! Jerin will get back to you soon.');
                    contactForm.reset();
                })
                .catch(error => {
                    console.error("FormSubmit Error:", error);
                    alert('Error sending message via server. Redirecting to your email client...');
                    // Fallback to mailto
                    window.location.href = `mailto:jerin81108@gmail.com?subject=Portfolio Inquiry from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${id}`;
                })
                .finally(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                });
            }
        });
    }
  

    // Typing Effect for Professional Roles
    const dynamicName = document.getElementById('dynamic-name');
    if (dynamicName) {
        const roles = ['JERIN J', 'AI & Data Science Specialist', 'Full-Stack Developer', 'Creative Thinker'];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            // Prevent the typing effect from changing screen height and bouncing the page
            // while the user is actively trying to read the About Me or other lower sections!
            if (window.scrollY > 300) {
                setTimeout(type, 1000); // Check again in 1 second
                return;
            }

            const currentRole = roles[roleIndex];
            if (isDeleting) {
                dynamicName.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                dynamicName.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }
        
        type();
    }

    // Typing Effect for CGPA (Identical effect)
    const dynamicCgpa = document.getElementById('dynamic-cgpa');
    if (dynamicCgpa) {
        const cgpaPhrases = ['8.55 CGPA', 'High Distinction', 'Top Academic Standing'];
        let cgpaRoleIndex = 0;
        let cgpaCharIndex = 0;
        let cgpaIsDeleting = false;
        let cgpaTypeSpeed = 120;

        function typeCgpa() {
            const currentPhrase = cgpaPhrases[cgpaRoleIndex];
            if (cgpaIsDeleting) {
                dynamicCgpa.textContent = currentPhrase.substring(0, cgpaCharIndex - 1);
                cgpaCharIndex--;
                cgpaTypeSpeed = 50;
            } else {
                dynamicCgpa.textContent = currentPhrase.substring(0, cgpaCharIndex + 1);
                cgpaCharIndex++;
                cgpaTypeSpeed = 120;
            }

            if (!cgpaIsDeleting && cgpaCharIndex === currentPhrase.length) {
                cgpaIsDeleting = true;
                cgpaTypeSpeed = 2500; // Admire the number
            } else if (cgpaIsDeleting && cgpaCharIndex === 0) {
                cgpaIsDeleting = false;
                cgpaRoleIndex = (cgpaRoleIndex + 1) % cgpaPhrases.length;
                cgpaTypeSpeed = 500;
            }

            setTimeout(typeCgpa, cgpaTypeSpeed);
        }
        
        typeCgpa();
    }

    // Theme Changer - Seamless Cyber Quantum Mode Switch (Unified Theme)
    const themeBtn = document.getElementById('theme-changer');
    const flashOverlay = document.getElementById('flash-overlay');

    if (themeBtn) {
        const themes = ['cyber', 'emerald', 'violet'];
        const savedTheme = localStorage.getItem('jerin_portfolio_theme') || 'cyber';
        if (savedTheme !== 'cyber') {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'cyber';
            const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
            const nextTheme = themes[nextIndex];

            // Trigger theme-aligned Quantum Warp Pulse
            const warp = document.createElement('div');
            warp.className = 'quantum-warp';
            document.body.appendChild(warp);

            if (flashOverlay) {
                flashOverlay.classList.remove('animate-flash');
                void flashOverlay.offsetWidth; // re-trigger
                flashOverlay.classList.add('animate-flash');
            }

            setTimeout(() => {
                if (nextTheme === 'cyber') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', nextTheme);
                }
                localStorage.setItem('jerin_portfolio_theme', nextTheme);
            }, 200);

            setTimeout(() => warp.remove(), 650);
        });
    }

    // Dashboard Interactivity
    const dashToggle = document.getElementById('dashboard-toggle');
    const floatingDash = document.getElementById('floating-dashboard');
    if (dashToggle && floatingDash) {
        dashToggle.addEventListener('click', () => {
            floatingDash.classList.toggle('active');
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && floatingDash.classList.contains('active')) {
                floatingDash.classList.remove('active');
            }
        });
    }

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scroll-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Custom Cursor Refinement (If cursor elements exist)
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });

        document.querySelectorAll('a, button, .project-card, .cert-card, .lib-item').forEach(el => {
            el.addEventListener('mouseenter', () => follower.style.transform += ' scale(2)');
            el.addEventListener('mouseleave', () => follower.style.transform = follower.style.transform.replace(' scale(2)', ''));
        });
    }

    // High-Speed Preloader Dismissal (Instant Render, Zero Lag)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        let isPreloaderDismissed = false;
        const dismissPreloader = () => {
            if (isPreloaderDismissed) return;
            isPreloaderDismissed = true;
            preloader.classList.add('fade-out');
            setTimeout(() => {
                if (preloader && preloader.parentNode) preloader.remove();
            }, 300);
        };

        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            setTimeout(dismissPreloader, 60);
        } else {
            document.addEventListener('DOMContentLoaded', () => setTimeout(dismissPreloader, 60));
        }
        window.addEventListener('load', dismissPreloader);
        setTimeout(dismissPreloader, 300); // Strict safety ceiling: never trap the user
    }


    
    // Global Project Card Category Filtering
    const projectFilterBtns = document.querySelectorAll('.filter-btn');
    const allProjectCards = document.querySelectorAll('.project-card');
    if (projectFilterBtns.length > 0 && allProjectCards.length > 0) {
        projectFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                projectFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter || 'all';
                allProjectCards.forEach(card => {
                    const cat = card.dataset.category || '';
                    if (filter === 'all' || cat.split(' ').includes(filter)) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });
    }

    // Dynamic Copyright Year
    const footerP = document.querySelector('footer p');
    if (footerP) {
        const currentYear = new Date().getFullYear();
        footerP.innerHTML = footerP.innerHTML.replace('2026', currentYear);
    }


    // ════════════════════════════════════════════════════════════
    // ── COSMIC OCEAN & DEEP SPACE AMBIENT PARTICLE ENGINE ──
    // ═══════════════════════════════════════════════════════════════════════════
    // ── CINEMATIC DEEP-SPACE ENVIRONMENT ENGINE ──
    // ═══════════════════════════════════════════════════════════════════════════
    const spaceCanvas = document.getElementById('cosmicOceanCanvas');
    const spaceBase = document.getElementById('spaceBaseGradient');
    const nebulaPurple = document.getElementById('nebulaPurple');
    const nebulaCyan = document.getElementById('nebulaCyan');
    const nebulaMagenta = document.getElementById('nebulaMagenta');
    const planetSystem = document.getElementById('spacePlanetSystem');

    if (spaceCanvas) {
        const ctx = spaceCanvas.getContext('2d');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let deepSpaceMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

        function resizeSpaceCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            deepSpaceMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            spaceCanvas.width = width * dpr;
            spaceCanvas.height = height * dpr;
            spaceCanvas.style.width = width + 'px';
            spaceCanvas.style.height = height + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            buildStarLayers();
        }

        // ── 1. THREE-LAYER STAR FIELD (Parallax Depth) ──
        // Colors: pure white, pale blue (#aee3ff), warm gold (#ffe9a8)
        const starPalette = ['#FFFFFF', '#aee3ff', '#ffe9a8', '#e0f2fe', '#fef3c7'];
        let farStars = [];
        let midStars = [];
        let nearStars = [];
        let dustParticles = [];

        function buildStarLayers() {
            const isMobile = width < 768;
            const farCount = isMobile ? 120 : 200;
            const midCount = isMobile ? 55 : 100;
            const nearCount = isMobile ? 22 : 40;
            const dustCount = isMobile ? 18 : 35;

            // Far Layer: ~200 tiny dim stars (1px), moves very slowly with scroll
            farStars = [];
            for (let i = 0; i < farCount; i++) {
                farStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 0.4 + 0.6,
                    baseAlpha: Math.random() * 0.35 + 0.2,
                    color: starPalette[Math.floor(Math.random() * starPalette.length)],
                    parallaxSpeed: 0.035
                });
            }

            // Mid Layer: ~100 stars (1.5px) with soft twinkle
            midStars = [];
            for (let i = 0; i < midCount; i++) {
                midStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 0.5 + 1.2,
                    baseAlpha: Math.random() * 0.4 + 0.45,
                    color: starPalette[Math.floor(Math.random() * starPalette.length)],
                    twinkleSpeed: Math.random() * 0.035 + 0.015,
                    phase: Math.random() * Math.PI * 2,
                    parallaxSpeed: 0.10
                });
            }

            // Near Layer: ~40 larger stars (2–3px) with glow, moves fastest with scroll
            nearStars = [];
            for (let i = 0; i < nearCount; i++) {
                nearStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 0.9 + 2.0,
                    baseAlpha: Math.random() * 0.35 + 0.65,
                    color: starPalette[Math.floor(Math.random() * starPalette.length)],
                    twinkleSpeed: Math.random() * 0.04 + 0.02,
                    phase: Math.random() * Math.PI * 2,
                    parallaxSpeed: 0.24
                });
            }

            // Faint upward-drifting cosmic dust particles
            dustParticles = [];
            for (let i = 0; i < dustCount; i++) {
                dustParticles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.2 + 0.5,
                    baseAlpha: Math.random() * 0.25 + 0.12,
                    vy: -(Math.random() * 0.3 + 0.12),
                    driftPhase: Math.random() * Math.PI * 2,
                    driftSpeed: Math.random() * 0.02 + 0.01
                });
            }
        }

        resizeSpaceCanvas();
        window.addEventListener('resize', resizeSpaceCanvas, { passive: true });

        // ── 2. SPACE EVENTS: SHOOTING STARS ──
        let shootingStars = [];

        function spawnShootingStar() {
            if (prefersReducedMotion || document.hidden) return;

            // Spawn at random position in upper screen
            const startX = Math.random() * width * 0.85;
            const startY = Math.random() * height * 0.45;
            const angle = (Math.random() * 25 + 25) * (Math.PI / 180); // ~25 to 50 degrees down-right
            const speed = Math.random() * 8 + 14;
            const length = Math.random() * 70 + 90;

            shootingStars.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: length,
                alpha: 1.0,
                decay: Math.random() * 0.022 + 0.018
            });

            // Schedule next shooting star in 4 to 8 seconds
            const nextDelay = Math.random() * 4000 + 4000;
            setTimeout(spawnShootingStar, nextDelay);
        }
        setTimeout(spawnShootingStar, 3500);

        // ── 3. GLOWING CURSOR TRAIL OF TINY STARS ──
        const cursorStars = [];
        const MAX_CURSOR_STARS = 24;

        // ── 4. MOUSE PARALLAX TRACKING (2-3% shift) ──
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX - width / 2) / (width / 2);
            targetMouseY = (e.clientY - height / 2) / (height / 2);

            // Spawn subtle cursor star trail
            if (!prefersReducedMotion && cursorStars.length < MAX_CURSOR_STARS) {
                cursorStars.push({
                    x: e.clientX + (Math.random() - 0.5) * 8,
                    y: e.clientY + (Math.random() - 0.5) * 8,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8 - 0.3,
                    radius: Math.random() * 1.1 + 0.6,
                    color: starPalette[Math.floor(Math.random() * starPalette.length)],
                    alpha: 0.85,
                    decay: 0.04
                });
            }
        }, { passive: true });

        // ── 5. SCROLL PARALLAX & SECTION HUE SHIFTING ──
        let scrollY = 0;
        let targetScrollY = 0;

        // Space regions: colors shift hue from violet to deep blue to teal per section
        const spaceRegions = [
            { center: [26, 15, 61],   mid: [11, 15, 42] },   // Hero: Violet / Deep Indigo
            { center: [9, 22, 59],    mid: [5, 14, 38] },    // About: Deep Sapphire Blue
            { center: [14, 13, 48],   mid: [7, 6, 31] },     // Excellence: Deep Indigo
            { center: [3, 33, 47],    mid: [2, 16, 25] },    // Projects: Deep Teal / Cyan Abyss
            { center: [5, 18, 40],    mid: [2, 6, 18] },     // Library: Dark Cosmic Navy
            { center: [24, 8, 46],    mid: [8, 3, 21] }      // Contact: Deep Amethyst / Void
        ];

        function updateScrollState() {
            targetScrollY = window.scrollY || window.pageYOffset;
        }
        window.addEventListener('scroll', updateScrollState, { passive: true });
        updateScrollState();

        // ── 6. UNIFIED 60 FPS RENDER LOOP ──
        let spaceTime = 0;

        function animateDeepSpace() {
            if (document.hidden) {
                requestAnimationFrame(animateDeepSpace);
                return;
            }

            ctx.clearRect(0, 0, width, height);
            spaceTime += 0.025;

            // Smooth interpolation for mouse parallax & scroll
            if (!prefersReducedMotion) {
                mouseX += (targetMouseX - mouseX) * 0.06;
                mouseY += (targetMouseY - mouseY) * 0.06;
                scrollY += (targetScrollY - scrollY) * 0.12;
            } else {
                mouseX = 0;
                mouseY = 0;
                scrollY = targetScrollY;
            }

            const mouseOffsetX = mouseX * 22; // ~2% parallax shift
            const mouseOffsetY = mouseY * 16;

            // A. Update Nebula Parallax on Scroll & Mouse
            if (nebulaPurple && !prefersReducedMotion) {
                const py = (scrollY * 0.04) + (mouseOffsetY * 0.8);
                const px = mouseOffsetX * 0.8;
                nebulaPurple.style.transform = `translate3d(${px}px, ${py}px, 0)`;
            }
            if (nebulaCyan && !prefersReducedMotion) {
                const cy = (scrollY * 0.07) + (mouseOffsetY * 1.2);
                const cx = mouseOffsetX * 1.1;
                nebulaCyan.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
            }
            if (nebulaMagenta && !prefersReducedMotion) {
                const my = (scrollY * 0.05) + (mouseOffsetY * 0.9);
                const mx = mouseOffsetX * 0.9;
                nebulaMagenta.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
            }

            // B. Planet Parallax (2-3% shift)
            if (planetSystem && !prefersReducedMotion) {
                const planetX = -mouseOffsetX * 1.3;
                const planetY = (scrollY * 0.03) - (mouseOffsetY * 1.1);
                planetSystem.style.transform = `translate3d(${planetX}px, ${planetY}px, 0)`;
            }

            // C. Dynamic Background Hue Shift across Sections (Zero Reflow & Memoized)
            if (spaceBase) {
                const progress = Math.min(1, Math.max(0, scrollY / (deepSpaceMaxScroll || 1)));
                const totalStages = spaceRegions.length - 1;
                const stage = progress * totalStages;
                const idx = Math.min(totalStages - 1, Math.floor(stage));
                const frac = stage - idx;

                const c1 = spaceRegions[idx].center;
                const c2 = spaceRegions[idx + 1].center;
                const m1 = spaceRegions[idx].mid;
                const m2 = spaceRegions[idx + 1].mid;

                const curCenter = [
                    Math.round(c1[0] + (c2[0] - c1[0]) * frac),
                    Math.round(c1[1] + (c2[1] - c1[1]) * frac),
                    Math.round(c1[2] + (c2[2] - c1[2]) * frac)
                ];
                const curMid = [
                    Math.round(m1[0] + (m2[0] - m1[0]) * frac),
                    Math.round(m1[1] + (m2[1] - m1[1]) * frac),
                    Math.round(m1[2] + (m2[2] - m1[2]) * frac)
                ];

                const centerStr = `rgb(${curCenter[0]}, ${curCenter[1]}, ${curCenter[2]})`;
                const midStr = `rgb(${curMid[0]}, ${curMid[1]}, ${curMid[2]})`;
                if (spaceBase._lastCenter !== centerStr) {
                    spaceBase.style.setProperty('--space-center', centerStr);
                    spaceBase._lastCenter = centerStr;
                }
                if (spaceBase._lastMid !== midStr) {
                    spaceBase.style.setProperty('--space-mid', midStr);
                    spaceBase._lastMid = midStr;
                }
            }

            // D. Render 1: Far Star Layer (200 tiny dim stars, 1px)
            for (let i = 0; i < farStars.length; i++) {
                const s = farStars[i];
                let sx = (s.x + mouseOffsetX * 0.4) % width;
                if (sx < 0) sx += width;
                let sy = (s.y - scrollY * s.parallaxSpeed) % height;
                if (sy < 0) sy += height;

                ctx.globalAlpha = s.baseAlpha;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // E. Render 2: Mid Star Layer (100 stars, 1.5px, twinkling)
            for (let i = 0; i < midStars.length; i++) {
                const s = midStars[i];
                let sx = (s.x + mouseOffsetX * 0.9) % width;
                if (sx < 0) sx += width;
                let sy = (s.y - scrollY * s.parallaxSpeed) % height;
                if (sy < 0) sy += height;

                const twinkle = Math.sin(spaceTime * 25 * s.twinkleSpeed + s.phase) * 0.22;
                ctx.globalAlpha = Math.max(0.12, Math.min(1.0, s.baseAlpha + twinkle));
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // F. Render 3: Near Star Layer (40 larger stars, 2-3px with glow)
            for (let i = 0; i < nearStars.length; i++) {
                const s = nearStars[i];
                let sx = (s.x + mouseOffsetX * 1.6) % width;
                if (sx < 0) sx += width;
                let sy = (s.y - scrollY * s.parallaxSpeed) % height;
                if (sy < 0) sy += height;

                const twinkle = Math.sin(spaceTime * 30 * s.twinkleSpeed + s.phase) * 0.25;
                const alpha = Math.max(0.2, Math.min(1.0, s.baseAlpha + twinkle));

                ctx.globalAlpha = alpha;
                ctx.fillStyle = s.color;
                ctx.shadowColor = s.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0; // Reset shadow

            // G. Render 4: Floating Upward Cosmic Dust
            for (let i = 0; i < dustParticles.length; i++) {
                const d = dustParticles[i];
                if (!prefersReducedMotion) {
                    d.y += d.vy;
                    d.x += Math.sin(spaceTime + d.driftPhase) * 0.35;
                    if (d.y < -10) {
                        d.y = height + 10;
                        d.x = Math.random() * width;
                    }
                }

                ctx.globalAlpha = d.baseAlpha;
                ctx.fillStyle = '#00d4ff';
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // H. Render 5: Shooting Stars (Space Events)
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const st = shootingStars[i];
                st.x += st.vx;
                st.y += st.vy;
                st.alpha -= st.decay;

                if (st.alpha <= 0 || st.x > width + 100 || st.y > height + 100) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                const tailX = st.x - (st.vx / (Math.hypot(st.vx, st.vy) || 1)) * st.length;
                const tailY = st.y - (st.vy / (Math.hypot(st.vx, st.vy) || 1)) * st.length;

                const starGrad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
                starGrad.addColorStop(0, `rgba(255, 255, 255, ${st.alpha})`);
                starGrad.addColorStop(0.3, `rgba(174, 227, 255, ${st.alpha * 0.8})`);
                starGrad.addColorStop(0.7, `rgba(0, 212, 255, ${st.alpha * 0.4})`);
                starGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');

                ctx.strokeStyle = starGrad;
                ctx.lineWidth = 1.8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(st.x, st.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();

                // Bright head glint
                ctx.globalAlpha = st.alpha;
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(st.x, st.y, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // I. Render 6: Glowing Cursor Trail of Tiny Stars
            for (let i = cursorStars.length - 1; i >= 0; i--) {
                const cs = cursorStars[i];
                cs.x += cs.vx;
                cs.y += cs.vy;
                cs.alpha -= cs.decay;

                if (cs.alpha <= 0) {
                    cursorStars.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = cs.alpha;
                ctx.fillStyle = cs.color;
                ctx.beginPath();
                ctx.arc(cs.x, cs.y, cs.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
            requestAnimationFrame(animateDeepSpace);
        }

        animateDeepSpace();

        // ── 7. INTERSECTION OBSERVER FOR FADE-AND-RISE ANIMATIONS ──
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.12 });

            document.querySelectorAll('.fade-in, .section-segment, .card, .project-card, .service-card, .lib-item, .contact-item').forEach((el) => {
                observer.observe(el);
            });
        }
    }



    
});
