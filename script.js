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

    // Dynamic Top Scroll Line (Glides Left-to-Right, Visible All The Time) & Navigation Styling
    const scrollProgressLine = document.getElementById('scrollProgressLine');
    const nav = document.querySelector('nav');

    let isScrollTick = false;
    const updateScrollProgress = () => {
        const docElem = document.documentElement;
        const scrollTotal = docElem.scrollHeight - window.innerHeight;
        const scrollFraction = scrollTotal > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollTotal)) : 0;
        
        if (scrollProgressLine) {
            const percentage = scrollFraction * 100;
            scrollProgressLine.style.width = `${percentage}%`;
        }

        // Navigation background opacity adjustment
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.padding = '1rem 8%';
                nav.style.background = 'rgba(3, 7, 18, 0.9)';
            } else {
                nav.style.padding = '1.5rem 8%';
                nav.style.background = 'rgba(3, 7, 18, 0.7)';
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

    // Reveal elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const segment = entry.target.querySelector('.section-segment');
            
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                if (segment) segment.classList.add('active-segment');
            } else {
                // Smooth retention: only remove active-segment if scrolled above viewport
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight) {
                    if (segment) segment.classList.remove('active-segment');
                }
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

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
    // ════════════════════════════════════════════════════════════
    const cosmicCanvas = document.getElementById('cosmicOceanCanvas');
    if (cosmicCanvas) {
        const ctx = cosmicCanvas.getContext('2d');
        let width = cosmicCanvas.width = window.innerWidth;
        let height = cosmicCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = cosmicCanvas.width = window.innerWidth;
            height = cosmicCanvas.height = window.innerHeight;
        }, { passive: true });

        // Cosmic Plankton / Stellar Star Particles (Midnight Blue + Electric Blue + Neon Cyan)
        const count = Math.min(85, Math.max(45, Math.floor((width * height) / 14000)));
        const particles = [];
        let mouseX = width / 2;
        let mouseY = height / 2;
        let isHovering = false;
        let hoverTimeout = null;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isHovering = true;
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => { isHovering = false; }, 2500);
        }, { passive: true });

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.2 + 0.8,
                baseAlpha: Math.random() * 0.45 + 0.2,
                alpha: Math.random() * 0.45 + 0.2,
                vx: (Math.random() - 0.5) * 0.35,
                vy: -(Math.random() * 0.45 + 0.15), // Gentle upward ocean / space float
                phase: Math.random() * Math.PI * 2,
                type: Math.random() > 0.4 ? 'cyan' : 'blue'
            });
        }

        let waveTime = 0;

        function animateCosmicOcean() {
            if (document.hidden) {
                requestAnimationFrame(animateCosmicOcean);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            // 1. Draw subtle deep-sea / cosmic current light band
            waveTime += 0.007;
            ctx.save();
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, 'rgba(0, 123, 255, 0.025)');
            grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.035)');
            grad.addColorStop(1, 'rgba(10, 25, 47, 0.015)');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(0, height * 0.4 + Math.sin(waveTime) * 35);
            ctx.bezierCurveTo(
                width * 0.3, height * 0.35 + Math.cos(waveTime) * 45,
                width * 0.7, height * 0.45 + Math.sin(waveTime * 1.2) * 55,
                width, height * 0.38 + Math.cos(waveTime) * 35
            );
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // 2. Render and update floating particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.x += Math.sin(waveTime + p.phase) * 0.18; // gentle sinusoidal drift

                // Wrap boundaries seamlessly
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                // Interactive reaction to cursor
                let extraAlpha = 0;
                if (isHovering) {
                    const dx = p.x - mouseX;
                    const dy = p.y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        p.x += (dx / dist) * force * 1.6;
                        p.y += (dy / dist) * force * 1.6;
                        extraAlpha = force * 0.45;
                    }
                }

                p.alpha = p.baseAlpha + Math.sin(waveTime * 2 + p.phase) * 0.2 + extraAlpha;
                p.alpha = Math.max(0.08, Math.min(0.95, p.alpha));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

                if (p.type === 'cyan') {
                    ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
                    ctx.shadowColor = 'rgba(0, 212, 255, 0.75)';
                } else {
                    ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
                    ctx.shadowColor = 'rgba(0, 123, 255, 0.75)';
                }
                ctx.shadowBlur = p.radius * 3.5;
                ctx.fill();
            }

            requestAnimationFrame(animateCosmicOcean);
        }

        animateCosmicOcean();
    }



    // ════════════════════════════════════════════════════════════════
    // ── PHOTOREALISTIC COSMIC DISINTEGRATION PORTRAIT ENGINE ──
    // ════════════════════════════════════════════════════════════════
    const starCanvas = document.getElementById('starPortraitCanvas');
    const photoEl = document.getElementById('profilePhotoFull');
    const photoFrame = document.getElementById('profilePhotoFrame');
    const holosphere = document.querySelector('.profile-card-holosphere');

    if (starCanvas && photoFrame) {
        const starCtx = starCanvas.getContext('2d');
        let frameWidth = photoFrame.offsetWidth || 270;
        let frameHeight = photoFrame.offsetHeight || 360;

        function resizeStarCanvas() {
            frameWidth = photoFrame.offsetWidth || 270;
            frameHeight = photoFrame.offsetHeight || 360;
            starCanvas.width = frameWidth;
            starCanvas.height = frameHeight;
            updateStarTargetCoordinates();
        }

        const EMBEDDED_B64 = "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S1GaNR0CTFGqWkYBT1HEelkBU1FAKyYBVlE6MS4BWVFyUEICWlHAinACXVHyw6oBX1HvsIsBYlHzt5MBZlHusY0BaVHSkXICalHfnH0CbFGwcFEBblGiZEsBclF5RjEBdVGATDwCdlG4gWgCeFGmcFoCeVHWj2oCfFHlnnkCfVHxrIUCf1HzrYQBgVHvoXcBhVHwq4MBiFH9ya0Bi1HupIECjlGzcVMCj1GfZUwCkVGeX0UBlFG8eVYBl1GiZkoBm1GtblQBnlG0dVcBoVG2d1oBpFG7fFsBp1GzeFsBqlG0fWIBrlHw29ICr1H46uICsVFbQDcCslGUYE0Cs1GQWEUCtFF2OSMCtlFyKx0Ct1G8fWgC9VEPjPAAAlMPjPAAN1MPjPAASlPfnYECS1TAZkQCTFOwX0sCTVTHc1kCT1PqnHgBU1O6iG0CVFSIUz8CVlNHOjYCV1RBNTICWVOdd2YCWlTmt6ACXVPnr5IBX1PzvJgBYlP0tZABZlP3vJoBaVP9yKQBbFP3wJ0BblP1uJUBclPjnXwCdVPsq4sBeFP2uZcBfFP6u5wBf1P2r4YBgVPupn4BhVP4sokBiFP4ybIBi1Pik28CjlPCeloCj1SzclICkVOXX0UBlFOsbVIBl1PJgmABm1PEeFcBnlPJgGABoVPCe1kBpFPEe1sBp1O5eFoBqlOyeFkBrlPo0MICr1T2598CsVOUa10CslSCSDMCs1OaYk8BtlOHPiUCt1TBjHUCulMPjPAA6FMPjPAAKlYPjPAAMFYPjPAAN1YPjPAASlbMurYCS1bTnokCTFamVEACTVbGeV8CT1bZiWYBU1aPSS8BVlanalICV1bnspUCWVbBl4QCWlbtwKoCXVb1xKoBX1bnqIYBYlbopH8BZlb1sIcBaVb1tY8BbFb9xaQBblbysZYBclb4uZkBdVb5vJ0BeFb5wKIBfFbtqogBf1bonXQBgVbooXwBhVb7wZ8BiFb3yrIBi1bxrokBjlbXiWQBkVabZEwBlFavcFUBl1bAeFsBm1bajWkBnlbQg2MBoVbLgGABpFbAfF0Bp1azdFkBqlayeV4BrlbStKUCr1bw39UCsVaFWE8CslZjKxsCs1aZZVABtlaXV0ECt1bSv7cCxlYPjPAA3FYPjPAAEVgPjPAAIVgPjPAAPVgPjPAAQ1gPjPAASlgPjPAATFitWUACTVmrW0gCT1jdjHACU1idTzwCVFnPg2sCVlj3vpgBWVi7lIICXVjxwKcBX1jwtZYBYljejm8BZljyrosBaVj5uJYBbFj8wqUBblj6wKIBclj6vqEBdVj2vJ8BeFj4u5sBfFjkmHoCfVndlHkCf1jjmnUBgVj9wKEBhVj+yKUBiFj/3cgBi1jwnXcCjljgkWoBkVi5dlgBlFi4c1gClVm2dFYCl1jBfV4Bm1jViWUBnljZjGkBoVjMgWEBpFi3dlgBp1ipblQBqli2fmIBrljauqoCr1nr1ckCsVh4TUICslltOyYCs1iXZVIBtli+kH4Ct1nJx8gCN1oPjPAAR1oPjPAATFrWkXcCTVu7ZkwCT1rpo4UBU1rBbVECVFvgi28CVlrgkWoCV1valHACWVrIpJIBXVrqtZcBX1rnrosBYlrxsY0BZlr3uJUBaVr5u5kBbFrxro0Bblr9waQBclr6v6EBdVr1s5UBeFr3t5QBfFr2t5gBf1r9vZ0BgVr+v58BhVrYhV8CiFrokWcBi1rZhWEBjlrShWIBkVq6d1kBlFrPh2gBl1qvblIBm1rLf14BnlrShmIBoVrEfV4BpFq8elsBp1qob1UBqlqxe2IBrlrXsaACr1vfwrYCsVq6jHkCsluVZlYCs1pTJRUBtlrUxcICt1vAxMwCxFoPjPAA01oPjPAA31oPjPAA6FoPjPAABV0PjPAADl0PjPAAT12pXEUCUF6rYUMCU13bmHoCVF7yrIgCVl2vZEgCV16cWj0CWV3VqI4BXV3Zpo0BX13vtpgBYl3sspABZl3ppH0BaV3upoABbF31uJUBbl36vJgBcl37tJIBdV3upIQBeF3up4cBfF3tsZQCfV70spkCf13UhGACgF6zZk0CgV2GSC8Cgl5MJBoChV0JAAACiF2PWD8CiV6qbFUCi12vbVABjl1sQzECj15uRzcCkV1hMiACkl5sQTAClF2dZ08ClV6LU0ACl12qblMBm13AelkBnl25clIBoV3FgGABpF2ycVYBp12qcVcBql2oc18Brl3cwrQBsV2GWEYCsl6BVEUCs11/SjUCtF6laU4Ctl0PjPAAwF0PjPAAxl0PjPAAzV0PjPAA2V0PjPAA9V0PjPAAGF8PjPAAJF8PjPAAT1/on4ACUGDtsZUCU1/fnHgCVGDQgV4CVl/2p30BWV/hqYoBXV/RpZABX1/cpYkBYl/qsZMBZl/gl3UBaV/hlXIBbF/onXQBbl/hkm0Bcl/llnUBdV/to4IBeF/xs5ECfF/+yKkBf1/tspkCgGDtrpUCgV9tOCsCgmCra1oChV+wc14BiF+RWEMBi1+UXUUBjl91TT8BkV9nPCwBlF+WXEoBl1+nak4Bm1+4dFMBnl+7dlcBoV+wb1EBpF+kalABp1+ncFkBql/GmYMBrl/Ut6oBsV+ga1UBs1+pcFwB2V8PjPAABWEPjPAAKmEPjPAAU2HvqoYBVmHWl3cBWWHRgVkCWmK3b1MCXWHPqJEBX2HirZEBYmHgoYUBZmHQjGcBaWHimG8BbGHjmHEBbmHXiGcBcmHcknABdWHtqoUBeGH7waQBfGH6vp8Bf2Hzr5IBgWHQkHcCgmKhcV4ChWGGWksChmJuSTkCiGGMWUQBi2GVXkoBjmFQNCcBkWE9JhoBlGF+UkEBl2GOWUIBm2Gyc1UBnmG4d1cBoWGpbFABpGGjalABp2Gtdl8BqmG5i3UBrmHexrgBsWGqZkYCsmK+qKACs2HRtKoCtGLEx8wC0GEPjPAA32EPjPAANGQPjPAATGQPjPAAU2TvoXsCVmTihV4CV2W1gmgCWWSAVEQCWmU/MiwCXWTMqI4BX2TftJkBYmTfpYkBZmTGiGgBaWTNhWIBbGTMg2ABbmTOhGEBcmTIfGABdWTcknUBeGTXl3gCeWWteF4CfGTGinACfWWebFoCf2SibFcCgGWHXE0CgWR9VkcChWRsRTkBiGRzRjYCiWWaXkkCi2SQW0kBjmRyRTcCj2WRWUgCkWRAKSEBlGQ7JBsBl2RELSABm2RUOS0BnmR1TT0Cn2VnRDUCoWSmbVIBpGSRX0oBp2SncVkBqmS+kn0BrmTMtK4BtmQPjPAAHmYPjPAAWWawrrMCWmfBw8cCXWbtz7oBX2bbs5oBYmbWp40BZmbQlHMBaWbOjm0BbGbMgl8BbmbakGsBcma+e2ACdWaIW0gCdmdUOC0CeGZkQjkBfGZuSTkBf2aPYFECgGetc2ICgWaTXksBhWaraVcChmeXW08CiGa1Z1ECi2bQgWgCjmadX04Cj2eQW04CkWaLWkYBlGZ1STsBl2Z6TDsCmGeNX0wCm2ZLNCcBnmZDMCQBoWZ9UjoBpGahbFMBp2awfmcBqmbDm4QBrma4rasBC2gPjPAAWWitqq4CWmmOjY0CXWjFqZgCXmnz18YCX2jSqJABYmjVpo0BZmi7hGcBaWjJjXABbGjQh2MBbmjUimUBcmiTXEkBdWhILycBeGhVOCoBfGiaZE8Bf2iJVUgCgWiPX04BhWiPWUwBiGifY1YBi2ihY1UBjmiJVUkBkWiFWkoBlGh3UUQBl2hjQDUCmGkwFg4Cm2hLMicBnmhNMigBoWiIXUoBpGiodV0Bp2iyhW8BqmjCnYUByWgPjPAA+2gPjPAAGGoPjPAAPWoPjPAATGoPjPAAXWpwZ2YCXmuSe3ACX2rVqpIBYmrRoogBZmrEj3EBaWq/iW0BbGrNimgBbmrQi2UBcmqFVD8BdWpbOCwCeGpQMScCeWuHVUQCfGpgNzECfWucZFkCf2qfZFoCgGuqaF4CgWranZcCgmvPjYQChWrMjYwChmvmm48CiGqya2ICiWvWiX0Ci2qHRD0CjGvUfXICjmqqXVUCj2u/cGMCkWqhZ1wBlGqDWU0Bl2p+Uj0CmGuXZk4Cm2p5TjsBnmp6TjoBoWqhaU4BpGq9jnQBp2qyiHEBqmq6lH8BxmoPjPAA3GoPjPAA42oPjPAA72oPjPAA+2oPjPAACG0PjPAALW0PjPAAOm0PjPAAXW22t7oCXm6rrbECX23av68CYG7auaQCYm3FlXwBZm28hmwBaW25fmIBbG3Aim8Bbm3IjG0Bcm23eFkBdW24e10BeG3MiWkBfG3WjmwBf23YiGsBgW3JfWwCgm7RhHAChW2pZFwBiG2wY1gBi228cGIBjm28cGIBkW2cXk4BlG23f2YBl22udVgBm22jaU8Bnm2eZ00BoW2seWICom69jncCpG2uf2gBp22idF8Bqm3KrJsCq26+vr4CsW0PjPAAKm8PjPAALW8PjPAAQ28PjPAAX2+cmZwCYHDCuLQCYm/EnosCY3DCm4gCZm+1f2YBaW+vemABbG+0e2MBbm+6gGQBcm+1dVoBdW/Be14BeG/UiWkBfG/UhGYBf2/DgGEBgW+2eV0BhW+jaFQChnBuRjYCiG+NVEUCiXBcOi4Ci2+QXE4CjHBdPCwCjm+aZFMCj3B5UT8CkW+IXUQBlG+uc1oBl2/EhGgBm2+pb1cBnm+ja1ABoW++jngBpG+jdV0Bp2+ofWsBqm/GxckB9W8PjPAAJHEPjPAAYnHdvKcBZnGxgWwBaXGhcVsBbHGkbVQBbnGveFsBcnHLkHIBdXHJg2IBeHHKfl8BfHHDeFsBf3HJfV4BgXGuY0wBhXGQVUEBiHGFU0ABi3F7UUABjnGFV0MBkXGraFEBlHGvbVUBl3GnaVABm3GvdFgBnnGreGACn3LMookCoXHClXwBpHGug24Bp3HFubYCqHLGyMwCGHQPjPAAN3QPjPAAWXQPjPAAZnSqh3UBaXSZcF0BbHSldV8BbnSnclgBcnS3fWIBdXTHi2oBeHTSjWwBfHTXhWkBf3TXim0BgXTbk3cBhXTTk3sBiHS+d2ICiXXFfGYCi3SraVYBjnSqZlIBkXSwa1EBlHSqZk0Bl3SsbFIBm3SZYUcBnnTBlH8BoXS2i3YBpHTBnYkBrnQPjPAAs3QPjPAAunQPjPAAxnQPjPAA0HQPjPAA3HQPjPAA9XQPjPAACHYPjPAAFXYPjPAAGHYPjPAAKHYPjPAALXYPjPAASnYPjPAATHYPjPAAT3YPjPAAZna7hmwBaXaIZFYBbHaTbFwCbnaPZVABcnapd2ABdXbGkncBeHbLiWkBfHbRh2QBf3bglXUBgXbhmHcBhXbQiHABiHbFfWQBi3axcFgBjnapZ1ABkXayb1UBlHatbVIBl3aeZUoBm3a1hmwCnHe5lXwCnnaviHYBoXarinkCpHbHnIQCpXfUx8ACwHYPjPAAKngPjPAANHgPjPAAZnjOk3QBaXiocVcBbHh7VEQBbnhhQjcBcniSaFYBdXiMYE0BeHigb1kBfHjKhmYBf3jDfGABgXi9d1sBhXitZ08BiHi1clYBi3ivblUBjnipaVABkXibY04BlHiPXEQBl3iQYUkBm3iviHMBnnibeWYCn3l+VEECoXiNY08BpHjNpI8CpXnSxcMCtngPjPAA43gPjPAA+HgPjPAAGnsPjPAAJHsPjPAAKHsPjPAAKnsPjPAAX3uwtMICYHw/Q1sCYnswLDUCY3zhzcQCZnvZlHUBaXvKimgBbHuucVIBbnuRXEYBcntnQzUBdXtUODABeHtmSj4BfHuKYU8Bf3t2UUABgXt+VkEBhXuHWkkBiHuIXEoBi3tySjcBjnuAV0QBkXtoSTkBlHtgRDYCl3uBZlgCmHxbQjUCm3thRjkBnnuQX0kBoXuaZkwBpHvVr50CpXz46OUCp3vKytICqHzFxc0CC30PjPAAHn0PjPAAKH0PjPAAWX0PjPAAXX2/w8oCXn5fZIICX31FR10CYH40NUgCYn3b3OQCY3779vMCZn3Sk3EBaX3KhWQBbH3Bf2ABbn2ublEBcn2JVkABdX1mRDUCdn52TToCeH1PNSwBfH1CMCYBf31PNi0BgX1XOzABhX1ZQDQBiH1KMycCiX4+KB8Ci31CLCQBjn06JBwBkX00JR8BlH1CLyQBl31jRjoBm32KWEABnn2UYEUBoX2UYEYBpH3ZtaQBp32urrUCqH5UVmICqn2/vsgCq367v8UCxH0PjPAA0H0PjPAA9X0PjPAABYAPjPAADoAPjPAALYAPjPAAQIAPjPAAXYBXXXoCXoBLUWgCX4A6PVIBYoD///8CZoDZmHYBaYDQimcBbIDKhGEBboDKhWMBcoDAfFoCc4DNjGkCdYCpb1UBeICJVkECeYCZY0gCfIBlPy4Cf4BUNCkBgYA/KCABhYBLLyQBiIBDLSMBi4BCKSACjoBMMigBkYBbOikBlIBzSzkBl4CJWkQBm4CYYEcBnoCTXUMBoYCVYUcBpIDXsJ0Bp4DbxLgCqID68+8CqoAQER8Cq4AeICwCFYIPjPAAWYJiaYcCWoNbZoUCXYJJT2cBX4IzNUsCYIOqqbQCYoIPjPAAZoLfm3oBaYLelG0BbILbkWoBboLKhF8BcoLQi2QBdYLQimQBeILBfV0BfIKzdlwBf4KJVD0BgYJ6TDcBhYJqQi8BiIJqQjABi4JoRDIBjoJpQi8BkYKGWEIBlIKVY0kBl4KfaEwBm4KcZEkBnoKcZEkBoYKaZEgBpIKsgW4CpYM0HxkCp4KPbV8CqIPBpJoCqoLd3+ICq4NrbnYCroI1OEkCr4NMT2MCs4IPjPAA0IIPjPAAC4QPjPAAKIQPjPAAQIQPjPAAR4QPjPAAVoRvdJMCV4VQWHgCWYRcYn4BXYRBRl0BX4Q2OU8CYIXFxMwCZoS1e10CZ4XOiWcCaYTelW4BbITbk2kBboTckmsBcoTYjWcBdYTWjGUBeITRi2QBfITJhmMBf4Sxc1UCgIW4eFsCgYSUWUIBhYSIVD4BiIR+TjoBi4SBUzsBjoSLWEMBkYSdZ04BlISiaEoBl4SobE4Bm4SobU8BnoShZkgBoYSfZ0wBpISAU0ECpYUuGRMCp4R6XVQCqIWykocCqoT18fICq4X9/P8CroQkJzQBsYSVmqkCsoWoq7sCyYQPjPAAC4cPjPAANIcPjPAAOocPjPAAU4dWXHwCVIdVXXwCVodUXXsBWYdKUW0BXYdBRl0BX4c6PVMCYIfFxdACZoe6o58CZ4dySDcCaYfTimUBbIfck2oBbofflW4Bcofdk2wBdYfWimQBeIfTiWQBfIfMhmABf4fEgF4BgYexb1IBhYecXkQBiIeUWkIBi4eVYEQBjoegZ0wBkYeeZUkBlIekakwBl4emak0Bm4epblABnoekaUsBoYeeZksBpIdjOysCpYcpFQ0Cp4dvUlACqIerjIcCqofi29gCq4f49fUCrocnJjEBsYc7PlECsodHTGECs4eborICtIeFi6ACxIcPjPAA5ocPjPAAC4kPjPAAHokPjPAAR4nKzM0BSomqrbsCS4lLUXACTIlKUG8CTYlia4kCT4lmcJMBU4lUXXgBVolJUm8BWYlGTWcBXYlGTWQBX4k5PVICYImnp7MCZon//v0CZ4nn29UCaYmoaUoCaom+d1cCbInXjWIBbonbkWYBcondkmoBdYnSh18BeInTiGEBfInNhmABf4nJhGABgYnDfVwBhYm5b1ABiImtbE0Bi4meYkgBjomgZEoBkYmgZEoBlImnakwBl4mubU8Bm4mpbE4BnomcY0YBoYmOWj8BpIlQLR8CpYksFxACp4ljTEYCqIm/pZ8Cqonk3dwCrokVFB4Cr4kgHykCsYkrLDoBs4laYXwBtoleZYECt4lRV3ICxIkPjPAAQIymqrwCQYxaY4YCQ4xbYoACRIxRVnICR4xHTWMBSow+RVoBTIxWXXkBT4xLUm8BU4xZYH0BVoxQV3QBWYxLUmwBXYxCSWEBX4w0OE0CYIxpaXgCaYx+XlECaoxfNSMCbIy2cU8CbYy2cE4CbozXi2MBcozZjmQBdYzaj2UBeIzVimMBfIzQiGIBf4zIf1wBgYy+elgBhYy1cFIBiIypaUoBi4ylZkkBjoyoaUwBkYyvb04BlIyycVEBl4ywbk4Bm4ynak0BnoyZYEQBoYyEUDoBpIxOKx0Bp4yJcGsCqIzHsK0Cqozm4OEBroxIR04Cr4wdHCkCsYwmKDMBs4xBR1sBtoxUWnQBuoxLT2gBvYxmaoECvoxPVWwCwIy6wMgCwYyOkqMCzYwPjPAA+4wPjPAAAo4PjPAAHo4PjPAAN47KysoBOo6boLcCO45ncpQCPY5dZoUBQI5QVW8BQ45DR10BR44+RFcBSo5cYX8BTI5MVG0BT45PVnIBU45RWHUBVo5OVXEBWY5DSWQBXY5GSmUBX442O1EBYo7//f4BaY738vACao7VwrwCbI6ESTMCbY6NUDYCbo7CeVMBco7Ui2MBdY7ZjmQBeI7Wi2MBfI7QhV0Bf47MglwBgY7FfVoBhY6ybUwBiI6xb08Bi460c1MBjo60c1MBkY62dVQBlI6zclIBl46tbEwBm46hZUgBno6QWD8BoY5/TTcBpI5JKRkBp46tlpYCqI7g0dMCqo7l4uIBro6Xlp0Cr44kIzACsY4kJjMBs449P1ABto5OUmwBuo5ESV0BvY4/RFkBwI5LUGQBxI5RV28CxI5KT2cCxo6nq7oCx45wdYsCyY7Ix8oB+44PjPAAMJC+wMwCMZBxfJoCNJBtdpkCNZBja40CN5BmcJIBOpBkbooBPZBFS2IBQJA3PFMBQ5AxNkoBR5BCSF0CSJBMUmwCSpBITWkBTJBDS2QBT5BHTmsBU5BMU3EBVpBIT2sBWZBHTWcBXZBBRWABX5A1O1EBYpD//v8CY5D8/v4CbJBwRzQCbZBtOSUCbpCYWTwCb5CdX0ACcpDEeVUBdZDWiWIBeJDVimIBfJDPhFwBf5DKf1kBgZC+dFEBhZC9c1MBiJC0cFABi5CwcFABjpCvbk4BkZCxcFQBlJCycVIBl5CtbEwBm5CfY0UBnpCPVj0BoZB6STMBpJBULyEBp5DXxcQCqJDd19gCrpC5uL8Cr5ArKjUCsZAkJjIBs5AyNEQBtpBFSmABupA9QlYBvZA6P1IBwJAzOUsBxJArLj4BxpA4O00Cx5AwM0UCyZBSWHQBzZCGjKMCzpBVWnkC0JDJys4C0ZCusr8C1ZAPjPAA5pAPjPAAApMPjPAABZMPjPAACJMPjPAAIZMPjPAAKJOZn7ICKZNpdZoCKpNodZgCLZNmdI8BMJNdZIMBNJNdZoMBN5NPVnIBOpNARl8BPZMwNUkBQJMuM0cBQ5MsMUUBR5M+QlwBSpM/RV8BTJNGTGYBT5NESmQBU5NFTGgBVpNJUGwBWZNBR2EBXZM9RVwBX5M2Ok4BYpPp5+4CY5P9/f8CbJPu5uYCbZPo1dACbpN7SDEBcpOfYEICdZPGfFkBeJPPhF4BfJPDd1MBf5PBeFYBgZO6dFQBhZO2b08BiJOwa0wBi5O0b1ABjpOvbk4BkZOvb08BlJOwb04Bl5OpaUwBm5OWXEIBnpOOWD8BoZN8SzQBpJNXMB0CpZPGrqcCrpPc298Cr5NVVF8CsZMnKTYBs5MsLj4BtpM3PU0BupM6P1MBvZM2OUwBwJMxNEcBxJMuMUIBxpMlKDkByZMpKz0BzZMvMkQB0JNDR2IB05NGT2sB1ZNZXXwC1pNOVHEC2ZPFx80C2pOipK0CDpUPjPAAHpW+w8oCH5V5gaICIZWHkKsCIpVqdZkCJJVpdJoBKJVgaYgBKpVaYX4BLZVPVnMBMJVNVHEBNJVJUGwBN5VDR2EBOpU5PlMBPZUoLUEBQJUpLkEBQ5U7QFoCRJVOVG4CR5U5P1YBSpU5P1cBTJVAR2ABT5VFTGgBU5VES2cBVpVHTmoBWZVFTGgBXZU3O1QBX5U8QFkBYpW0s78CY5X+/P8CbJXy7vABbpWEWUgCb5VvPioCcpWRVjsBdZWqZ0YBeJXBd1MBfJXJfVgBf5W4clABgZWwbU0BhZWtbUwBiJWuaUsBi5WraEcBjpW0cVABkZW2cVABlJWyb08Bl5WgY0YBm5WSWT8BnpWNVj4BoZV4RzEBpJWde3MCpZXs4uYCrpXq6u4Cr5VjYWoCsZUkJjMBs5UuMEABtpU0N0gBupU2O08BvZUzOEsBwJUsMUQBxJUuMUIBxpU2OUwByZUmKToBzZUnKjsB0JUtMEMB05U5PlIB1ZVKT2cB2ZVLUW0B3JVNUm4C3ZVNVHEC35WgorAC4JVtcYkCGJejqbsCGZhpdJkCGpdye5sBHpdtd5cBIZdkbY4BJJdbZIMBKJdQV3QBKpdNVG8BLZdGTWgBMJdLUm0BNJc6QVkBN5c3PFEBOpcsMUQBPZcmKz8BQJctM0cBQ5dLUW0BR5cwNk0BSpc6PlcBTJc8Q18BT5dBSGQBU5dIT2sBVpdESmUBWZc3PlYCXZc+QlsBX5dCRV4BYpd0dYoCY5jl4u0Cbpfs3twCb5jNsqoCcpeFTzUBdZeYXD4BeJe5cFEBfJfCd1MBf5e/d1QBgZexa0sBhZeqZkYBiJe1b04Bi5fAeFUBjpe+dVMBkZe8dVMBlJeta0wBl5ebXkIBm5eZXkMBnpePVz4BoZd8TDcBpJfw4uACpZjo4ecCp5fs6OsBrpfy8fUCr5h6eIECsZckJzMBs5ckJTYBtpcyNUcBupcxNkoBvZcxNkkBwJcsMUQBxJcsL0ABxpcpLD4ByZc3OkwBzZclKDsB0JcnKj0B05csMEMB1ZcyNkkB2ZdARFgB3JdFSGIB35dJUGcB45dKUG8C5JhLUWwC5peLj6cC5phiaIkC6JfCxskC6ZixtMAC+5cPjPAAC5rHyswBDpqcobcCD5pncJICEZpncpQCEpplb40CFZpocZEBGJpiaosBGppWX3sBHppPWHMBIZpLVG8BJJpKU24BKJpGTWkBKpo+RV8BLZo/RmABMJo8Q10BNJo3PVQBN5ovNEgBOpopLkIBPZorMEQBQJpWXHcCQZpITWUCQ5pARmEBR5oyOE4BSpo7P1kBTJpAR2IBT5pKUG0BU5o/RWECVpo0OlABWZo5P1cBXZo+QlsBX5o8QFkBYpo4OlACY5qcnqwCbprx7fABcpqNVTsBdZqYWz8BeJq2cFABfJrHflgBf5rIflcBgZq8dVEBhZq5cU4BiJq/dU8Bi5rOgVoBjprPglsBkZq8dlQBlJqnZUcBl5qcYEQBm5qeYkUBnpqTW0ABoZqDTzgBrpr08/YCr5qTkZoCsZofIS4Bs5oiJDQBtpohJDQBupo0OEsBvZo4PFABwJowNkkBxJotMEEBxporLj8ByZotMEIBzZorLkECzponKj0C0JomKTwB05omKTwB1ZooLD8B2ZowNUgB3JozOEsB35o7QFMB45o/Q1cB5ppER18B6JpSV28B7JpZYYEB75qUl6cC8JpqcY8CBZy5vMUCBp1oc5MCCJxrdJoCCZ1pcZICC5xlco8BDpxpcpEBEZxhaokBFZxZYoIBGJxPWXUBGpxHTmoBHpxES2cBIZxFTGcBJJxDSmQBKJw+RV8BKpw/RmABLZw4P1kBMJw2PFYBNJwxNkwBN5wtMkYBOpwrMEQBPZwsMUUBQJwgIzQBQ5wnKzsCRJ0UGiYCR5xARVwBSpxBSGEBTJxKUGoBT5w4P1QCUJ0zOFECU5w6QFYBVpw5PVYBWZw5PVYBXZw5PVYBX5w8QFkBYpwxNlACY51zdYMCbJwPjPAAbpz///8BcpyTZE0Cc52ZXEECdZyqakkBeJyycE8BfJzNhF8Bf5zKf1kBgZzBeFUBhZzEe1kBiJzNglwBi5zdkmkBjpzYjmUBkZy5cVABlJymZUcBl5ymZkgBm5ytbVABnpyiZ0kBoZyHUToBpJzz7fEBp5z//v8Brpz39/gCr52enKQCsZwhJDMBs5wiJTQBtpwgIzIBupwhJDUBvZwyN0sBwJw8QVUBxJwwM0YBxpwsL0AByZwpLD0BzZwoKzwB0JwiJTUB05whJDYB1ZwnKz0B2ZwrMEMB3JwuM0cB35wtMkYB45wzOEwB5pw3PFAB6Jw7QFYB7JxITmYB75xRWXQB8pxeZIMB9Zx8gpsC9p1jaokCAp5xeZ4BBZ5lbo4BCJ5aY4MBC55aY4MBDp5TXHkBEZ5VXXoBFZ5NVHEBGJ5JT2wBGp49RF4BHp4/RmABIZ5BSGIBJJ48Q10BKJ4+RV8BKp45P1oBLZ44PlUBMJ43PFIBNJ4sMUUBN54tMkYBOp4sMUUBPZ4wNUkBQJ4wNUkBQ54gJjYCR54MDxoBSp4qLj4CS58VFiYCTJ40OFEBT546PlcBU541OVIBVp41OVIBWZ4zOVEBXZ46PlcBX542OlMBYp4xNk0BbJ7Bt7cCbZ+/r64Ccp706usCc5/PsaMCdZ60clQBeJ7EgF4BfJ7LhWABf57KglwBgZ7KgFsBhZ7Ng14BiJ7dk2wBi57jmG4Bjp7fkGcBkZ7GflsBlJ7EfVoBl56+eVYBm560bU8Bnp6kaU8BoZ7Fo5QCop/y9PUCpJ709fQCpZ+nmZgCp56ZhoABqp6DcGwBrp708PICr5+npKwCsZ4hJDMBs54eITABtp4hJDMBup4iJTYBvZ4kJzgBwJ4oKzsBxJ45PE8Bxp4wNEQByZ4mJzgBzZ4MDBUB0J4gIzIB054jJjkB1Z4mKTwB2Z4mKz4B3J4qL0IB354qL0MB454tMkYB5p4yN0sB6J42O08B7J43PFAB754/Q1sB8p5FSWEB9Z5MUWwB+J5dY4YB+557fpcC/J9dZ4cCAqBGT2kCA6FVXHkCBaBSW3cBCKBNVXMBC6BKUnABDqBJUm4BEaBGTWkBFaBDSmUBGKA/RmABGqA9RF4BHqA7QlwBIaA9RF4BJKA/RmABKKA7QlwBKqA6P1kBLaA1O1IBMKA0OU8BNKAqL0MBN6AsMUUBOqAsMUUBPaAwNUkBQKAwNUsBQ6AwNk0BR6AsMkgBSqA5QVYBTKA3PFQBT6A1OVEBU6A0OVEBVqA1OlIBWaA4PlYBXaA5PVYBX6A2OlMBYqA5PlQBaaDb0tACaqGgjIcCbKCum5YBcqDs7O4Cc6Hw7fMCdaC2g2wCdqHCiHACeKDHfV4BfKDJgl4Bf6DOg14BgaDNgl0BhaDakGgBiKDimXIBi6Dnn3QBjqDckWgBkaDajGQBlKDViGABl6DOhF4Bm6DBeVQBnqDCi3MCn6H3+PkCpKCwnZ8CpaGnlZMCp6CXh4EBqqCbiYUBrqDy7/EBsaAlKDgBs6AmKTkBtqAhJDQBuqAeITEBvaAgIzQBwKAiJTYBxKAiJTUBxqAZGiMCx6EFBwgCyaAICg8BzaAdIzMB0KAkKDoB06AjJzoB1aAkKDsB2aApLkAB3KAnLD8B36AmKz8B46ArMEQB5qAuM0cB6KAuM0cB7KAxNkoB76A1Ok4B8qA5PlIB9aA8P1QB+KBCR14B+6BKUmcBAqMzOU4BBaNFTGkBCKNFTGkBC6NFTGkBDqNDSmYBEaM/RmABFaM8Q10BGKM9RF4BGqM7QlwBHqNAR2EBIaM5QFoBJKM7QlwBKKM2PVcBKqM2OlMBLaMsMEkBMKMvNEoBNKMvNEgBN6MtMkYBOqMvNEgBPaMvNEoBQKMvNEoBQ6M5P1YBR6M0OlIBSqMyOFABTKMxNkwBT6M3PVMBU6M1O1EBVqM2PFQBWaM0OFEBXaM3O1QBX6M0OFEBYqMzOEwBZqP7+vsCZ6Sqnp0CaaO1oaABbKO1oaEBbqPDuboBdaPt6+kBeKPJoI0CeaS9fl4CfKPJgF0Bf6PMhF0BgaPSimQBhaPflG0BiKPnm3cBi6PnnHQBjqPglW0BkaPonXUBlKPek2sBl6Pbj2oBm6PPhGACnKT15eICoaPOx8gCoqTDtLUCpKOvnZsBp6Otm5kBqqOsmpgBrqPv6+wBsaMjJjcBs6MmKToBtqMjJjcBuqMgIzIBvaMfIjMBwKMhJDUBxKMkJzgBxqMkJzoByaMlKj0BzaMjKToB0KMjKDsB06MkKTwB1aMjKDsB2aMlKj0B3KMmKz8B36MpLkIB46MrMEQB5qMrMEQB6KMuM0cB7KMuM0cB76MuM0cB8qMvNEgB9aMyN0sB+KMyN0oB+6M3PE8BAqU2O1UBBaU+RWIBCKU8Q14BC6U6QVsBDqVBSGIBEaU7QlwBFaU9Q10BGKU+RF4BGqU7QVsBHqU5P1kBIaU7QVsBJKU5P1kBKKU0OlIBKqUyN00BLaUuM0kBMKUuM0cBNKUtMkYBN6UtMkYBOqUwNUkBPaUxNU0BQKU4PFUBQ6U1OVIBR6UyNk8BSqUxNU4BTKUwNk4BT6U3PVUBU6U0OlIBVqU2OlMBWaU4PFUBXaU0OU8BX6U1OlABYqU2O1ABZqWikpIBaaXBtbcBbKXHu7wBcqXd09ABdaXe1tYBeKXu7fQBfKXDf14Bf6XIflwBgaXPhmMBhaXdkmwBiKXjmHEBi6XjlW4BjqXll3ABkaXmnHUBlKXil3ABl6XakWkBm6X87egCnKb09fcCnqXU0NEBpKXFubkBp6W9sbEBqqW0pqYBrqXVy80Cr6a0sbkCsaUiJTQBs6UlKDcBtqUjKTkBuqUfJTUBvaUhJzcBwKUjKTkBxKUhJDUBxqUiJTgByaUhJjkBzaUpLkEB0KUhJjkB06UjKDsB1aUkKTwB2aUlKj4B3KUlKj4B36UoLUEB46UpLkIB5qUrMEQB6KUtMkYB7KUuM0cB76UrMEQB8qUsMUUB9aUtMkYB+KUzOEwB+6U1Ok4BAqc1O1QBBac2PFICCKc9RF4BC6c7QlwBDqc3PlgBEac+RF4BFac9Q10BGKc8QlwBGqc4PlgBHqc5P1cBIac6QFcBJKc3PVUBKKcvNEoBKqcwNUsBLactMkgBMKcwNUsBNKcuM0kBN6cxNkwBOqcyN00BPacvNEcBQKc1O1ABQ6cyN08BR6cyNk8BSqcvM0wBTKc2OlMBT6c1OFEBU6c3O1QBVqc0OU8BWaczOE4BXaczOE4BX6c0OE4BYqcvNEkBZqexpqgCZ6ixpqoCaafGu8IBbqfWz9EBfKfAdVQBf6fEf10BgafWjGkBhafbknABiKfimXIBi6fglHABjqfglHABkafglnEBlKfglnEBl6fbkG8Bm6ft7O4CnKjg3t4CqqfAtbkBrqevoaMBsacfJjYBs6ciKDgBtqchJzcBuqcfJTUBvachJjkBwKchJjkBxKchJjkBxqchJjkByaciJzoBzaclKj0B0KcmKz4B06cuM0cB1ackKTkB2acnKj4B3KcmKz8B36cnLEAB46cnLEAB5qcpLkIB6KcsMUUB7KctMkYB76crMEQB8qcsMUQB9actMkUB+KcrMEQB+6cpLkIBAqo3PVgBBaofJTgBCKo7QVsBC6o4PlgBDqo4PlgBEaozOVMBFao3PVcBGKo4PlgBGqo5P1gBHqo4PFUBIao1OlIBJKoyN04BKKoxNkwBKqouM0kBLaovNEoBMKowNUsBNKozOVEBN6ozOVEBOqozOVEBPaofJDgBQKo5P1kBQ6o2PFQBR6o1O1MBSqoxN08BTKo1OVIBT6ozN1ABU6ozN1ABVqozN1ABWao0OFEBXao1OlABX6o1OlABYqoxNkoBZqqfmaMCZ6vBt70CaarNx84BeKr18/gBfKry8O4Bf6rCh24CgKvHknoCgarRimsBharXjmwBiKrZj2wBi6rekm4BjqrglHABkarilnIBlKrglnIBl6rXimMBrqq0qq8BsaohJzgBs6ohJzcBtqogJjYBuqohJjkBvaohJjkBwKolKj0BxKojKDsBxqojKDsByaokKT0BzaokKT0B0KokKT0B06omLD8B1aoYHSsB2aomKz8B3KonLEAB36olKj4B46onLEAB5qopLkIB6KorMEQB7KoqL0MB76osMUQB8qoqL0IB9aorMEMB+KosMUQB+6oqL0IBAqw3PVgBBawiJzsBCKw5P1kBC6w1O1UBDqw5P1kBEaw3PVcBFawzOVMBGKw4PlgBGqw0OlIBHqwzN1ABIawwNEwBJKwwNUsBKKwuM0oBKqwvNEoBLawvNEoBMKwvNEoBNKwyOFABN6wyOFABOqwxN08BPawqL0MBQKw7QVsBQ6w1O1QBR6wzOVEBSqw2PFQBTKw3O1QBT6w1OVIBU6w0OFEBVqwzN1ABWaw4O1QBXawzOE4BX6wyN00BYqwuM0gBZqyCe4UCZ63Ty9ECcqzw6+8BfKwPjPAAgazWtKMCgq3fvq8ChazNhGMBiKzUimcBi6zWiWUBjqzglHABkazkmHQBlKzclXQBl6zkxLkCmK35+/8Cnqzi3eEBrqy6sLgCr614doYCsawiKTkBs6wiKDgBtqwfJTUBuqwgJTgBvawiJzoBwKwkKTwBxKweJDEBxqwkKTwByawpLkIBzawlKj4B0KwoLUEB06woLkEB1awYHCoB2awkKT0B3KwmKz8B36wnLEAB46wpLkIB5qwoLUEB6KwoLUEB7KwmKz8B76wmLD8B8qwpL0IB9awkKTwB+KwnLD8B+6wqL0IBAq43PVcBBa4sNEoBCK42PVcBC646QFoBDq43PVcBEa4yOFIBFa41O1UBGK42PFYBGq4zOVEBHq4zOVEBIa4vNUwBJK4tMkgBKK4wNUkBKq4uM0kBLa4vNEoBMK4zOE4BNK41O1MBN64zOVEBOq42PFQBPa4tMkYBQK4wNk0CQa88Ql0CQ641PFYBR64zOVIBSq4zOVEBTK4zOVEBT64zOVEBU640OFEBVq4zOVEBWa4zOVEBXa4xNkwBX64zOE8BYq4vNEgBZq5GR1MCZ6+/usACda7r6OsBeK7u6e0Bha7Nl38Chq/IkX4CiK7Oh2UBi67YjGwBjq7Zjm4Bka7flHMBlK7dj2oBnq7Z1NgBrq7QzNQCr69jYnMCsa4mLD4Bs64kKTwBtq4jKDsBuq4lKj0Bva4lKj0BwK4jKDsBxK4mKz4Bxq4lKz0Bya4eIzYBza4mKz8B0K4qL0MB064qL0MB1a4ZHCsB2a4mKz8B3K4nLEAB364pLkIB464nLEAB5q4oLUEB6K4mKz8B7K4kKT0B764oLD8B8q4qLUAB9a4lKj0B+K4nLD8B+64mKj0BArEwNlABBbEzN1EBCLE0OVMBC7E1O1UBDrEyOFABEbExN08BFbEzOVEBGLEzOVABGrExNU4BHrEvNEcBIbEsMUUBJLErMEQBKLEwNUkBKrEwNUsBLbExNkwBMLEwNUsBNLEyOFABN7E1O1MBOrE0OlMBPbEsMkgBQLEaHjEBQ7E1PVQBR7EyOFABSrE2PFQBTLE3PVUBT7EzOVABU7E1OlABVrExNkwBWbE0OU8BXbEzOE4BX7EwNUsBYrEyN0sBZrEgJjgCZ7J4d4ICgbEPjPAAiLHLopACibK9gnACi7HMhmYBjrHWjGkBkbHThWEBlLH6/PwCp7EPjPAArrHTz9sCr7JUVWgCsbEnLEABs7EkKT0BtrEkKT0BurEjKDwBvbEkKTwBwLEkKTwBxLElKj4BxrEnLEABybElKj4BzbElKj4B0LEnLEAB07EiJjQB1bEdITQB2bElKj4B3LEmKz8B37EpLkIB47ElKj4B5rEoLUEB6LEiJzoB7LEjKDsB77ElKDsB8rEoKz4B9bEmKz4B+LElKj0B+7EkKDoBArM1OlMBBbMwNU4BCLMwNkwBC7MyOFEBDrM0OFEBEbMxN08BFbMyN08BGLMyN08BGrMtMkkBHrMrMEQBIbMpLkIBJLMsMUUBKLMwNUoBKrMvNEoBLbMvNEoBMLMwNUsBNLM0OlIBN7MzOVEBOrMzOVEBPbMrMEYBQLMhJjkBQ7M3PVcBR7MwNk0BSrM2PFQBTLM1O1EBT7MxNkwBU7MxNkwBVrMyN00BWbMzOE4BXbMwNUsBX7MwNUsBYrMwNUkBZrMjKT0BhbMPjPAAi7PFfmABjrPJg2MBkbPYrqICkrT7//8Cl7MPjPAAm7PW0tICnLTQysoCrrPJyNQCr7RFSFwCsbMsMUUBs7MnLEABtrMjKDsBurMjKDwBvbMkKT0BwLMoLUEBxLMnLEABxrMlKj4BybMkKT0BzbMnLEAB0LMmKz8B07MVGSYB1bMgJDYB2bMkKT0B3LMqL0MB37MoLUEB47MnLEAB5rMmKz8B6LMlKj0B7LMkKDsB77MkKDsB8rMlKj0B9bMhJjkB+LMlKj0B+7MkKDsBArU1OVIBBbUwN04BCLUeJDkBC7UxN08BDrU0OFEBEbUxNk4BFbUxNk4BGLUwNE0BGrUrMEYBHrUsMUUBIbUtMkYBJLUuM0cBKLUvNEoBKrUxNkwBLbUyN00BMLUzOE4BNLU2PFQBN7U0OlIBOrUxN08BPbUtMkgBQLUnLEABQ7UzOVMBR7UxN00BSrUvNU0BTLU1OlABT7UuM0kBU7UzOE4BVrUuM0kBWbUxNkwBXbUzOE4BX7UwNUoBYrUxNkoBZrUqL0MBabXf2d8CarbZ1NoCi7W5kH4CjLaxdFwCjrXJh2kBl7Xe29sCmLbUztACnrUPjPAArrXBwcsCr7Y5PFECsbUqL0MBs7UjKDwBtrUlKj0BurUiJzsBvbUjKDwBwLUlKj4BxLUoLUEBxrUnLEABybUoLUEBzbUnLEAB0LUoLUEB07UOEh4B1bUgJDcB2bUoLUEB3LUnLEAB37UpLkIB47UnLEAB5rUlKj4B6LUgJTgB7LUhJDcB77UgJDcB8rUgJTgB9bUgJTgB+LUgJTgB+7UfJTcBArcyNk8BBbcxNkwBCLcXGiwBC7c0OlQBDrcxNU4BEbcxNU4BFbcxNU4BGLcvM0wBGrcsMUcBHrcsMUUBIbcpLkIBJLcuM0cBKLcwNkwBKrcxN00BLbc0OlABMLczOVEBNLc1O1MBN7czOVEBOrcxN1ABPbcuM0kBQLcrMEUBQ7cgJTgBR7czOE0BSrctMkgBTLcxNkwBT7cvNEoBU7cwNUsBVrcuM0kBWbcvNEoBXbcuM0kBX7cyN00BYrcxNkoBZrcwNEYBabfQytICarjX0dgCi7f48vMCjLjJqKICjrescFQCj7j38O4ClLfg3d8Brreur70Cr7guM0cCsbctMkYBs7cmKz8BtrcjKDsBurcjKDwBvbcmKz8BwLcnLEABxLcnLEABxrcoLUEBybcoLUEBzbcpLkIB0LcqL0MB07cSFSAB1bchJjkB2bcjKDwB3LcjKDwB37cnLEAB47clKj4B5rclKj4B6LcjJjkB7LchJDUB77chJTgB8rceIzYB9bchJDUB+LchJDQB+7ciJTYBArowNE0BBbotMUoBCLoiJTgBC7osMkkBDrouMksBEbovNEoBFboxNkwBGLorMEYBGroqL0MBHrorMEQBIborMEUBJLowNUsBKLoxN00BKrozOVEBLboxN08BMLovNU0BNLozOVEBN7o3PVMBOrosM0gBPbowNUsBQLosMUYBQ7olKTwBR7o2PVIBSrovNEoBTLowNUsBT7ovNEoBU7oxNkwBVrovNEoBWboxNkwBXbozOE4BX7oyN00BYrowNUkBZrosMUQBabqRj5kCarvZ09oCbroPjPAAjrr///8Cj7vm5OgCrrqKj6ACr7skK0QCsbonLEABs7onLEABtrolKj0BurolKj4BvbooLUEBwLonLEABxLomKz8BxronLEABybonLEABzbonLUEB0LopLT8B07oXGygB1boiJjkB2bomKz8B3LomKz8B37ooLUEB47olKj4B5rohJjoB6LohJDUB7LofIjMB77ocHzAB8rofIjIB9bofIjMB+LoiJTYB+7ofIzEBArwuMksBBbwqL0YBCLwkKToBC7woLUMBDrwwNU0BEbwsMUcBFbwvNEkBGLwrMEUBGrwqL0MBHrwrMEQBIbwtMkcBJLwyN00BKLwyN00BKrwwNU4BLbwwNU4BMLwyOE8BNLwyN04BN7wzOU8BOrwvNUsBPbwrMEcBQLwqL0UBQ7wpLUEBR7w7QFYBSrwzN08BTLwyN00BT7wxNkwBU7wxNkwBVrwuM0kBWbwtMkgBXbwvNEkBX7wwNUoBYrwzOEwBZrwuM0cBabxWVmECar3DwMcCfLwPjPAAjrzg4N0BobwPjPAArrxobH4Cr70pLkYCsbwpLkIBs7wkKT0BtrwlKj4BurwmKz8BvbwmKz8BwLwpLkIBxLwmKz8BxrwlKj8BybwnLEABzbwoLUEB0LwcIDAB07waHywB1bwlKj4B2bwoLUEB3LwqL0MB37woLUEB47wlKj0B5rwiJzsB6LwjJjcB7LweITIB77wcHzAB8rweITIB9bwdITMB+LweIzMB+7wfIjIBAr8tMUoBBb8rMEQBCL8iKDwBC78YHC0BDr8uM0kBEb8tM0gBFb8pLkIBGL8qL0MBGr8nLEABHr8pLkQBIb8rMEYBJL8wNUsBKL8tMkgBKr8wNUkBLb8xNkoBML8uM0kBNL8vNEoBN78uM0kBOr8wNUsBPb8wNk4BQL8tMkcBQ78pLkIBR78uMkgBSr8yNk8BTL8uM0kBT78wNUsBU78wNUsBVr8wNUsBWb8uM0kBXb8vNEgBX78wNUkBYr8wNUkBZr8uM0cBab8rLj8Car+amKMCi7/39/kBp78PjPAArr9RVWgCr78sMUkCsb8rMEQBs78lKj4Btr8mKz8Bur8iJzsBvb8mKz8BwL8nLEABxL8mKz8Bxr8qL0UByb8pLkIBzb8oLkEB0L8RFiUB078eJDUB1b8kKT4B2b8nLEAB3L8oLUEB378mKz8B478gJTgB5r8hJjkB6L8fIjMB7L8gIzQB778eITIB8r8gIzQB9b8dIjUB+L8eJDQB+78cIDEBAsEsMUcBBcEvNEoBCMEkKz0BC8ETFiQBDsExNksBEcEtMUoBFcEwNEwBGMErMEYBGsEpLkIBHsEoLUEBIcErMEQBJMEtMkgBKMExNkwBKsEwNUkBLcEyNk8BMME1OVIBNMExNkwBN8EuM0kBOsEwNUsBPcExNkwBQMErMEYBQ8EsMUcBR8EgJTkBSsEyN00BTMEuM0YBT8EuM0cBU8EtMkYBVsEyN00BWcEvNEoBXcEvNEoBX8ExNk0BYsEvNEgBZsEvNEgBacEkKT0BfMEPjPAAl8EPjPAAocEPjPAArsE1OlECr8IsMkkCscEoLUEBs8ElKj4BtsEjKDwBusElKj4BvcEnLEABwMEoLUEBxMEpLkIBxsEoLUEBycEpLkIBzcEpLkMB0METFiIB08EhJjoB1cEkKT0B2cEkKT0B3MEmKz8B38EmKz8B48EjKDsB5sEeJDcB6MEeITIB7MEeITAB78EeITEB8sEhJDUB9cEhJDUB+MEfIjMB+8EXGigBAsQtMkgBBcQrMEYBCMQlLEABC8QcIDEBDsQqLkQBEcQuMkoBFcQuMkoBGMQoLUMBGsQpLkIBHsQpLkIBIcQrMEQBJMQsMUUBKMQtMkgBKsQuM0kBLcQuM0kBMMQvNEoBNMQwNUsBN8QwNUsBOsQsMUcBPcQwNUsBQMQsMUcBQ8QqL0MBR8QnLEABSsQ2O1ABTMQvNEoBT8QsMUcBU8QwNUsBVsQxNkwBWcQyN00BXcQvNEgBX8QwNUkBYsQvNEgBZsQsMUUBacQoLD8BbMTl4OQCbcTe2+ACcsQPjPAAgcQPjPAAjsQPjPAAkcQPjPAArsQqMUkCr8QuM0kCscQqL0MBs8QjKDwBtsQjKDwBusQoLUEBvcQnLEABwMQnLEABxMQpLkIBxsQqL0MBycQqL0MBzcQqL0IB0MQWHCkB08QhJjoB1cQlKj4B2cQiJzsB3MQpLkEB38QmKz8B48QfJDcB5sQcIjUB6MQdIC8B7MQeITIB78QgIzQB8sQgIzQB9cQbITEB+MQeITEB+8QOFB4BAsYsMUcBBcYqL0UBCMYkKj4BC8YgIzUBDsYdITECD8YrLEYCEcYtMUoBFcYqL0YBGMYtMkgBGsYqL0MBHsYoLUEBIcYqL0MBJMYsMUYBKMYsMUcBKsYuM0kBLcYtMkgBMMYrMEYBNMYrMEYBN8YsMUcBOsYrMEYBPcYuM0kBQMYtMkgBQ8YrMEQBR8YnLEEBSsYoLUEBTMYwNUsBT8YuM0kBU8YvNEoBVsYuM0kBWcYuM0kBXcYtMkYBX8YrMEQBYsYtMkYBZsYrMEQBacYpLkEBbMbi3uECbcbg3eECqsYPjPAArsYqMEgCr8YuMkUCscYrMEQBs8YlKj4BtsYjKDwBusYnLEABvcYmKz8BwMYmKz8BxMYpLkIBxsYnLEABycYpLkIBzcYgJTcB0MYbIS4B08YiJzsB1cYjKDwB2cYkKT4B3MYiJzoB38YfJDkB48YfJTcB5sYbITMB6MYdIC8B7MYfIjMB78YfIjMB8sYgIzQB9cYeJDQB+MYbHi4B+8YTGCYBAsgvNEoBBcgmKz8BCMgmKz8BC8gcIjIBDsgNEBkBEcgmK0MBFcgrL0cBGMgsMUcBGsgmKz8BHsgoLUEBIcgnLEEBJMgoLUMBKMgvNEoBKsguM0kBLcgsMUcBMMgsMUcBNMguM0cBN8gpLkIBOsguM0cBPcgtMkYBQMgtMkYBQ8gqL0MBR8goLUEBSsghJjkBTMgxNkwBT8gtMkcBU8gsMUUBVsgtMkYBWcgvNEgBXcgtMkYBX8grMEQBYsgtMkYBZsgtMkYBacgpL0EBbMi6uLsCbcnq5+sCbsgPjPAAkcgPjPAArsgrL0gBscgqL0MBs8gmKz8BtsglKj4BusgmKz8BvcgmKz8BwMgnLEABxMgqL0MBxsgrMEQBycgnLkMBzcgOEh4B0MgdIzMB08gmKz8B1cghJjoB2cgkKT0B3MgiJzsB38ghJjkB48gfJTUB5sgeJDQB6MgfIjEB7MgfIjMB78geITIB8sgeITIB9cgaIDAB+MgZGysB+8ghJTQBAsssMUcBBcsrMEQBCMskKT0BC8sdJDQBDssTFSEBEcsnLEMBFcsvNEoBGMsqL0UBGssnLEABHsspLkIBIcsnLEEBJMstMkgBKMstMkgBKsssMUcBLcstMkgBMMswNUsBNMsyN0sBN8stMkYBOssqL0MBPcstMkgBQMstMkgBQ8ssMUcBR8soLUIBSssoLUEBTMssMUUBT8suM0gBU8stMkYBVssrMEQBWcssMUUBXcstMkYBX8srMEQBYsssMUUBZsstMkYBacsrL0EBbMt4eIQCbcvf3eECrssuM0wBscsrL0MBs8skKT0BtsskKT0BussmKz8BvcspLkIBwMslKj4BxMsnLEABxsspLkIBycsmLEEBzcsVGSQB0MsfJTcB08siJzsB1csiJzsB2csgJTkB3MseIzYB38sfIjIB48sbHi0B5ssdIC8B6MsdIC8B7MsfIjMB78seITIB8ssdIDEB9csdIC8B+MsUGCQB+8scITIBAs0tMkYBBc0mKz8BCM0jKDwBC80eJDQBDs0XGScBEc0bHi8BFc0qMEYBGM0sMUcBGs0oLUEBHs0nLEABIc0oLUEBJM0oLUMBKM0tMUoBKs0uM0kBLc0sMUcBMM0qL0UBNM0qL0UBN80pLkQBOs0sMUcBPc0tMkgBQM0uM0kBQ80tMkYBR80oLUEBSs0nLEABTM0cITUBT80tMkgBU80tMkgBVs0tMkYBWc0sMUUBXc0rMEQBX80uM0cBYs0tMkYBZs0sMUUBac0rL0QBbM1BQE0Cbc20r7cCpM0PjPAArs0sMUYBsc0nLEABs80lKj4Bts0kKT0Bus0kKT0Bvc0lKj4BwM0mKz8BxM0qL0MBxs0mKz8Byc0nLEIBzc0ZHCsB0M0fJDcB080iJzsB1c0gJTkB2c0hJjoB3M0hJjkB380fITAB480eITAB5s0dIC8B6M0cHy4B7M0dIC8B780eITAB8s0cHy4B9c0cHy4B+M0MDxsB+80cIDEBAs8sMUUBBc8pLkIBCM8mKz8BC88fJTUBDs8ZHCkBEc8IDRUBFc8mLEMBGM8sMUcBGs8qL0MBHs8oLUEBIc8sMUUBJM8uM0kBKM8tMUoBKs8wNUoBLc8tMkgBMM8qL0UBNM8rMEYBN88qL0UBOs8tMkgBPc8rMEYBQM8rMEYBQ88vNEgBR88pLkIBSs8rMEQBTM8cITUBT88yN00BU88tMkcBVs8tMkYBWc8nLEABXc8oLUEBX88rMEQBYs8sMUUBZs8tMkYBac8qMEMBbM8iJTkCbdB1dIICdc8PjPAAi88PjPAAjs8PjPAArs8tMkYBsc8oLUEBs88mKz8Bts8kKT0Bus8jKDwBvc8pLkIBwM8lKj4BxM8rMEQBxs8nLEAByc8jKDsBzc8gIjcB0M8gJTgB088hJjoB1c8fJDgB2c8eIzcB3M8fJDcB388eITAB488bHi0B5s8cHy4B6M8bHi0B7M8dIC8B788eITAB8s8cHy4B9c8bHi0B+M8QEh4B+88cIDEBAtIuM0cBBdIoLUEBCNIiJzsBC9IbIDQBDtIbHSwBEdIMCxQBFdIlKkABGNIpLkIBGtInLEABHtIsMUUBIdIsMkYBJNIuNEwBKNItM0kBKtIpLkQBLdIoLUMBMNInLEABNNIqL0MBN9IpLkIBOtIsMUUBPdIsMUUBQNIpLkIBQ9IoLUEBR9IpLkIBStIrMEQBTNInLEABT9ImKz8BU9ItMUgBVtIsMUUBWdImKz8BXdIrMEQBX9IsMUUBYtIsMUUBZtIpLkIBadIrMkUBbNIkJzkBbtLj3uUCctIPjPAAhdIPjPAAqtLp5usBrtIuM0cBsdInLEABs9IjKDwBttIjKDwButIlKj4BvdIqL0MBwNIpLkIBxNImKz8BxtInLEABydIUGCcBzdIfIjQB0NIgJTkB09IfJDcB1dIgJTgB2dIhJjkB3NIhJDUB39IcHy4B49IbHi0B5tIVGCcB6NIaHSwB7NIaHS4B79IdIDEB8tIdHzEB9dIWGiYB+NIaHCkB+9IYHSwBAtQsMUUBBdQlKj4BCNQfJDYBC9QXHS0BDtQVGCcBEdQMDhkBFdQlK0ABGNQsMUUBGtQoLUEBHtQlKj4BIdQqL0MBJNQuNEoBKNQrMEQBKtQtMkYBLdQpLkIBMNQnLEABNNQqL0MBN9QqL0MBOtQsMUUBPdQtMkYBQNQoLUEBQ9QoLUEBR9QsMUUBStQoLUEBTNQjKDwBT9QbIDMBU9QqMUUBVtQrMEQBWdQrMEQBXdQuM0cBX9QwNUkBYtQwNUkBZtQuM0cBadQrMEQBbNQmLD0BbtTi3eICb9Tk4+gCp9QPjPAAqtTs6u8Cq9SMjqECrtQvNEgBsdQpLkIBs9QmKz8BttQlKj4ButQkKT0BvdQpLkIBwNQpLkIBxNQrMEQBxtQnLEABydQOEhwBzdQiJTkB0NQgJTkB09QhJjoB1dQjKDsB2dQgJTcB3NQdIC8B39QeITAB49QaHSwB5tQXGikB6NQYGyoB7NQaHSwB79QbIC4B8tQYHiwB9dQVGCIB+NQbHi0B+9QaHSwBAtYoLUEBBdYjJzoBCNYbHi8BC9YeITABDtYVGCcBEdYQExwBFdYkJzsBGNYoLUEBGtYoLUEBHtYoLUEBIdYpLkIBJNYpLkMBKNYlKj4BKtYnLEABLdYnLEABMNYmKz8BNNYoLUEBN9YpLkIBOtYoLUEBPdYpLkIBQNYqL0MBQ9YoLUEBR9YqL0MBStYlKj4BTNYmKz8BT9YgJDgBU9YuNEkBVtYsMUUBWdYtMkYBXdYrMEQBX9YtMkYBYtYtMkYBZtYoLUEBadYkKT0BbNYpL0EBbtbV0dYCb9fl4eMCqtbj4+sCq9dYXHECrtYtMkYBsdYmKz8Bs9YkKT0BttYgJTkButYoLUEBvdYqL0MBwNYpLkIBxNYmKz8BxtYiJjcBydYRFiMBzdYfJDcB0NYhJjkB09YiJzoB1dYhJTgB2dYfIjMB3NYaHSwB39YZHCsB49YYGygB5tYWGicB6NYWGycB7NYbHi0B79YaHSwB8tYXGyoB9dYLDBYB+NYaHSwB+9YZHCsBAtkYHSwBBdkYGyoBCNkaHS0BC9kbHi8BDtkWGSgBEdkSFCMBFdkYGykCGNkoLUABGtkmKz8BHtkoLUEBIdkoLUEBJNkoLUEBKNklKj4BKtkjKDwBLdkmKz8BMNkmKz8BNNkmKz8BN9koLUEBOtkoLUEBPdkpLkIBQNkpLkIBQ9ktMkYBR9koLUEBStkpLkIBTNkjKDwBT9kiJjoBU9kpL0IBVtkrMEQBWdkoLUEBXdkpLkIBX9kqL0MBYtkrMEQBZtknLEABadkqL0IBbNkpLkEBbtmsqLICb9nj4OQCfNkPjPAAqtnCws8Cq9k2O1ICrtkrMEQBsdkjKDwBs9kgJTkBttkjKDwButkpLkIBvdknLEABwNkoLUEBxNkmKz8BxtkUGCYBydkWGicBzdkdITMB0NkeIjUB09kfIzYB1dkeITIB2dkcHy4B3NkZGykB39kUFiUB49kREBkB5tkJCBEB6NkUFyMC6dkjJjUC7NkXGikB79kaHSwB8tkWGigB9dkNDxgB+NkbHi0B+9kaHSwBAtsTFiUBBdsSFSQBCNsSFiIBC9sTFyMBDtsZHCsBEdsUGCQBFdsLDRYBGNsnLEABGtsnLEABHtsoLUEBIdslKj4BJNsjKDwBKNsiJzsBKtsiJzsBLdsnLEABMNspLkIBNNsrMEQBN9ssMUUBOtsoLUEBPdsoLUEBQNspLkIBQ9spLkIBR9spLkIBStsnLEABTNsnLEABT9skKT0BU9sdIjUBVtstMkYBWdsmKz8BXdspLkIBX9spLkIBYtspLkIBZtsnLEABadsoLUEBbNspLkIBbttwbXkCb9zV0dUCjtsPjPAAlNsPjPAAm9sPjPAAqtuVlKQCq9woLUMCrtsqL0MBsdsjKDwBs9skKT0BttskKT0ButsoLUEBvdsmKz8BwNsoLUEBxNsjKD0BxtsNEBwBydsWGiYBzdseITIB0NsfIjMB09saHS0B1dsTFyQB2dsOEh4B3NsVFyYB39siJDMB49sgIzIB5tsYHCsB6NseITAB7NsVGCcB79sZHCwB8tsUGSUB9dsSFB8B+NscHy4B+9sdIC8BAt0WHCsBBd0YHi0BCN0dIS4BC90UGCUBDt0TFSIBEd0SFCEBFd0EBAwBGN0kKkABGt0pLkIBHt0lKj4BId0lKj4BJN0kKT0BKN0iJzsBKt0hJjoBLd0lKj4BMN0oLUEBNN0rMEQBN90pLkIBOt0qL0MBPd0oLUEBQN0pLkIBQ90qL0MBR90qL0MBSt0lKj4BTN0lKj4BT90mKz8BU90aHy8BVt0tM0kBWd0pLkIBXd0kKT0BX90nLEABYt0qL0MBZt0pLkIBad0pLkIBbN0oLUEBbt1HSlgCb964tLsCdd0PjPAAqt1dYHgCq94pLkUCrt0rMEQBsd0jKDwBs90iJzsBtt0kKT0But0nLEABvd0mKz8BwN0pLkIBxN0pLkEBxt0MDhkByd0aHSwBzd0jJjcB0N0fIjEB090eITAB1d0cHy4B2d0bHi0B3N0bHi0B390ZHCsB490ZHCsB5t0bHi0B6N0aHSwB7N0WGSgB790XGikB8t0JCxMB9d0TFSAB+N0aHSwB+90cHy4BAuAnLD8BBeAkKT0BCOAjKDwBC+AiJzsBDuAaHSwBEeAQEB4BFeAIChIBGOAmKkEBGuAlKj4BHuAnLEABIeAiJzsBJOAiJzsBKOAlKj4BKuAlKj4BLeApLkIBMOAqL0MBNOAsMUcBN+AqL0MBOuAnLEABPeAqL0MBQOAqL0MBQ+AoLUEBR+AmKz8BSuAnLEABTOAmKz8BT+AkKT0BU+AeIzcBVuAlKzsBWeArL0MBXeAoLUEBX+AnLEABYuAoLUEBZuAqL0MBaeAoLUEBbOAlKj4BbuAiJDQCb+F3dX4CquAwNksCq+EtMkgCruAoLUEBseAkKT0Bs+AlKj4BtuAoLUEBuuAmKz8BveApLkIBwOAnLEABxOAcIC4BxuAYHCkByeAdIDEBzeAeITIB0OAdIDIB0+AdIC8B1eAcHy4B2eAcHy4B3OAcHy4B3+AcHy4B4+AbHi0B5uAcHy4B6OAaHSwB7OAYGyoB7+AYGykB8uAKCw4B9eAQEh8B+OAaHSwB++AdIjABAuIoLUMBBeImKz8BCOInLEABC+IgJToBDuIaHSwBEeIaHS4BFeITFSIBGOIfIzYBGuIlKj4BHuIiJzsBIeIhJjkBJOIeIzcBKOIgJTkBKuIkKT0BLeIlKj4BMOIpLkIBNOIpLkMBN+IoLUEBOuIoLUEBPeIoLUEBQOIoLUEBQ+InLEABR+InLEABSuIiJzsBTOInLEABT+IkKT0BU+IgJTkBVuITGSkBWeIqL0MBXeInLEABX+IoLUEBYuImKz8BZuIuM0cBaeIsMUUBbOImKz8BbuIgIjICf+IPjPAAquItMkgCq+MvNEsCruIlKj4BseIkKT0Bs+InLEABtuImKz8BuuIoLUEBveImKz8BwOIlKj4BxOIRFCIBxuIZHSkByeIcHzABzeIaHS4B0OIdIDEB0+IgIzIB1eIbHi0B2eIfIjEB3OIdIC8B3+IdIC8B4+IbHi0B5uIcHy4B6OIcHy4B7OIYGyoB7+IYGykB8uIJCg4B9eIREyAB+OIaHSwB++IdITABAuQmKz8BBeQnLEAB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";
        const rawB64 = (window.STAR_PORTRAIT_B64 && window.STAR_PORTRAIT_B64.length > 100)
            ? window.STAR_PORTRAIT_B64
            : EMBEDDED_B64;

        // Decode Base64 data (6 bytes per star: normX, normY, R, G, B, flag)
        const binStr = atob(rawB64);
        const binLen = binStr.length;
        const totalStars = Math.floor(binLen / 6);

        // High-performance typed arrays for 60 FPS animation
        const normX = new Float32Array(totalStars);
        const normY = new Float32Array(totalStars);
        const tgtX = new Float32Array(totalStars);
        const tgtY = new Float32Array(totalStars);
        const origX = new Float32Array(totalStars);
        const origY = new Float32Array(totalStars);
        const curX = new Float32Array(totalStars);
        const curY = new Float32Array(totalStars);
        const sDirX = new Float32Array(totalStars);
        const sDirY = new Float32Array(totalStars);
        const sDist = new Float32Array(totalStars);
        const radius = new Float32Array(totalStars);
        const baseAlpha = new Float32Array(totalStars);
        const phase = new Float32Array(totalStars);
        const speed = new Float32Array(totalStars);
        const isAnchor = new Uint8Array(totalStars);
        const isSubject = new Uint8Array(totalStars);
        const colorStrings = new Array(totalStars);

        const centerX = frameWidth / 2;
        const centerY = frameHeight / 2;

        let byteIdx = 0;
        for (let i = 0; i < totalStars; i++) {
            const nx = binStr.charCodeAt(byteIdx++) / 255;
            const ny = binStr.charCodeAt(byteIdx++) / 255;
            const r = binStr.charCodeAt(byteIdx++);
            const g = binStr.charCodeAt(byteIdx++);
            const b = binStr.charCodeAt(byteIdx++);
            const flag = binStr.charCodeAt(byteIdx++);

            normX[i] = nx;
            normY[i] = ny;

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (flag >= 1) {
                isSubject[i] = 1;
            }

            // Celestial star color tuning
            if (flag === 2) {
                // High contrast feature edge (eyes, lips, smile, facial contours)
                colorStrings[i] = `rgb(${Math.min(255, r + 45)},${Math.min(255, g + 45)},${Math.min(255, b + 60)})`;
                radius[i] = 1.35 + (lum / 255) * 0.95;
                baseAlpha[i] = 0.9;
                if (Math.random() < 0.045) isAnchor[i] = 1;
            } else if (flag === 1) {
                // Subject face, skin tones, suit, shirt
                if (lum > 175) {
                    // Crisp luminous highlights (shirt, eyes, teeth)
                    colorStrings[i] = `rgb(${Math.min(255, r + 35)},${Math.min(255, g + 45)},255)`;
                    radius[i] = 1.25 + (lum / 255) * 0.85;
                    baseAlpha[i] = 0.92;
                } else if (lum < 45) {
                    // Dark hair and navy blazer: deep electric starlight
                    colorStrings[i] = `rgb(${r + 20},${g + 35},${b + 80})`;
                    radius[i] = 1.1;
                    baseAlpha[i] = 0.82;
                } else {
                    // Natural glowing skin tones
                    colorStrings[i] = `rgb(${r},${g},${b})`;
                    radius[i] = 1.15 + (lum / 255) * 0.8;
                    baseAlpha[i] = 0.88;
                }
            } else {
                // Cosmic background ambient stars
                colorStrings[i] = Math.random() > 0.5 ? '#00D4FF' : '#007BFF';
                radius[i] = 0.85 + Math.random() * 0.6;
                baseAlpha[i] = 0.45 + Math.random() * 0.35;
            }

            // Radial scattering trajectories
            const targetX = nx * frameWidth;
            const targetY = ny * frameHeight;
            const angle = Math.atan2(targetY - centerY, targetX - centerX) + (Math.random() - 0.5) * 0.7;
            const distFromCenterNorm = Math.hypot(nx - 0.5, ny - 0.5);
            sDist[i] = (Math.random() * 320 + 160) * (0.8 + distFromCenterNorm);
            sDirX[i] = Math.cos(angle);
            sDirY[i] = Math.sin(angle);

            // Convergence origin (scattered in deep space outside frame)
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnDist = Math.random() * 480 + 260;
            origX[i] = centerX + Math.cos(spawnAngle) * spawnDist;
            origY[i] = centerY + Math.sin(spawnAngle) * spawnDist;
            curX[i] = origX[i];
            curY[i] = origY[i];

            phase[i] = Math.random() * Math.PI * 2;
            speed[i] = Math.random() * 0.04 + 0.025;
        }

        function updateStarTargetCoordinates() {
            for (let i = 0; i < totalStars; i++) {
                tgtX[i] = normX[i] * frameWidth;
                tgtY[i] = normY[i] * frameHeight;
            }
        }
        updateStarTargetCoordinates();
        window.addEventListener('resize', resizeStarCanvas, { passive: true });

        let assembleProgress = 0; // 0 (outer space) -> 1 (fully assembled portrait)
        let scatterProgress = 0;  // 0 (assembled) -> 1 (scattered into deep space)
        let starTime = 0;

        // Interactive mouse hover disturbance
        let starMouseX = -999;
        let starMouseY = -999;
        let isHoveringPhoto = false;

        photoFrame.addEventListener('mousemove', (e) => {
            const rect = photoFrame.getBoundingClientRect();
            starMouseX = e.clientX - rect.left;
            starMouseY = e.clientY - rect.top;
            isHoveringPhoto = true;
        }, { passive: true });

        photoFrame.addEventListener('mouseleave', () => {
            isHoveringPhoto = false;
            starMouseX = -999;
            starMouseY = -999;
        }, { passive: true });

        // Scroll listener: scatter portrait as user scrolls down
        function updateScatterFromScroll() {
            const scrollY = window.scrollY || window.pageYOffset;
            // Scatters progressively between 0px and 340px scroll
            scatterProgress = Math.min(1, Math.max(0, scrollY / 320));
        }
        window.addEventListener('scroll', updateScatterFromScroll, { passive: true });
        updateScatterFromScroll();

        // High-performance animation render loop (60 FPS)
        function renderStarPortrait() {
            if (document.hidden) {
                requestAnimationFrame(renderStarPortrait);
                return;
            }

            starCtx.clearRect(0, 0, frameWidth, frameHeight);
            starTime += 0.035;

            // Assembly ease-in on page load
            if (assembleProgress < 1) {
                assembleProgress += 0.024;
                if (assembleProgress > 1) assembleProgress = 1;
            }

            // Sync photo visibility and disintegration
            if (photoEl) {
                // Photo is 100% crisp and photorealistic at scroll=0, and dissolves on scroll
                const photoAlpha = Math.max(0, (1 - scatterProgress * 1.45) * assembleProgress);
                const photoBlur = scatterProgress * 14;
                const photoScale = 1 + scatterProgress * 0.08;
                photoEl.style.opacity = photoAlpha;
                photoEl.style.filter = `blur(${photoBlur}px) brightness(${1 + scatterProgress * 0.35}) contrast(${1 + scatterProgress * 0.2})`;
                photoEl.style.transform = `scale(${photoScale})`;
            }

            // Holosphere border glow reacts to assembly and scatter
            if (holosphere) {
                const glowAlpha = Math.max(0.15, 0.55 * (1 - scatterProgress * 0.75) * assembleProgress);
                holosphere.style.borderColor = `rgba(0, 212, 255, ${glowAlpha})`;
            }

            const hoverActive = isHoveringPhoto && scatterProgress < 0.25;

            // When at rest, we highlight anchor stars and subtle micro-twinkles over the photo.
            // As the user scrolls, all 5,851 stars ignite and shatter into outer space!
            const isScattering = scatterProgress > 0.02 || assembleProgress < 0.95;

            for (let i = 0; i < totalStars; i++) {
                // If at rest (scroll=0) and not an anchor or ambient star, skip drawing to let the crisp photo shine!
                if (!isScattering && isAnchor[i] !== 1 && Math.random() > 0.15) {
                    continue;
                }

                // 1. Initial convergence from deep space
                const ax = origX[i] + (tgtX[i] - origX[i]) * assembleProgress;
                const ay = origY[i] + (tgtY[i] - origY[i]) * assembleProgress;

                // 2. Scattering displacement on scroll
                const scatterOffsetX = sDirX[i] * sDist[i] * (scatterProgress * 1.55) + Math.sin(starTime + phase[i]) * (14 * scatterProgress);
                const scatterOffsetY = sDirY[i] * sDist[i] * (scatterProgress * 1.55) + Math.cos(starTime + phase[i]) * (14 * scatterProgress);

                let destX = ax + scatterOffsetX;
                let destY = ay + scatterOffsetY;

                // 3. Interactive mouse hover deflection
                if (hoverActive) {
                    const mdx = destX - starMouseX;
                    const mdy = destY - starMouseY;
                    const mdist = Math.hypot(mdx, mdy);
                    if (mdist < 65) {
                        const force = (1 - mdist / 65) * 22;
                        destX += (mdx / (mdist || 1)) * force;
                        destY += (mdy / (mdist || 1)) * force;
                    }
                }

                // Smooth spring physics (lerp)
                curX[i] += (destX - curX[i]) * 0.22;
                curY[i] += (destY - curY[i]) * 0.22;

                // Dynamic alpha: stars ignite brightly when scattering or assembling
                const twinkle = Math.sin(starTime * speed[i] * 35 + phase[i]) * 0.22;
                let alpha = (baseAlpha[i] + twinkle);
                if (isScattering) {
                    alpha = Math.min(1.0, alpha * Math.min(1.0, 0.45 + scatterProgress * 1.7)) * (1 - scatterProgress * 0.35);
                } else {
                    // At rest over photo: subtle glowing presence
                    alpha = Math.max(0.15, Math.min(0.85, (alpha * 0.65)));
                }

                const r = radius[i];
                const cx = curX[i];
                const cy = curY[i];

                if (cx < -10 || cx > frameWidth + 10 || cy < -10 || cy > frameHeight + 10) continue;

                // Draw star body
                starCtx.beginPath();
                starCtx.arc(cx, cy, r, 0, Math.PI * 2);
                starCtx.fillStyle = colorStrings[i];
                starCtx.globalAlpha = Math.max(0.05, Math.min(1.0, alpha));
                starCtx.fill();

                // Draw pulsing diamond crosshair flare on anchor stars
                if (isAnchor[i] === 1 && scatterProgress < 0.25) {
                    const flarePulse = 0.5 + Math.sin(starTime * 2.5 + phase[i]) * 0.5;
                    const flareLen = r * (3.8 + flarePulse * 2.2);
                    starCtx.strokeStyle = 'rgba(0, 212, 255, ' + (alpha * 0.85) + ')';
                    starCtx.lineWidth = 0.8;
                    starCtx.beginPath();
                    starCtx.moveTo(cx - flareLen, cy);
                    starCtx.lineTo(cx + flareLen, cy);
                    starCtx.moveTo(cx, cy - flareLen);
                    starCtx.lineTo(cx, cy + flareLen);
                    starCtx.stroke();
                }
            }

            starCtx.globalAlpha = 1.0;
            requestAnimationFrame(renderStarPortrait);
        }

        renderStarPortrait();
    }
});
