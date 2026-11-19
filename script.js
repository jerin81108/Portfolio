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
    // ── 100% PURE STAR CONSTELLATION PORTRAIT ENGINE ──
    // ── (PHOTO CONSTRUCTED EXCLUSIVELY BY ~14,000 STARS) ──
    // ════════════════════════════════════════════════════════════════
    const starCanvas = document.getElementById('starPortraitCanvas');
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

        const EMBEDDED_B64 = "TAEPjPAAVwEPjPAAewEPjPAAiQEPjPAAkgEPjPAAlgEPjPAAmQEPjPAAnwEPjPAAwQEPjPAA7gEPjPAA9AEPjPAAFgMPjPAAMQMPjPAAYwMPjPAAFAQPjPAAGgQPjPAAKwQPjPAAUwQPjPAArQQPjPAA7gQPjPAA8gQPjPAADgYPjPAAawYPjPAA0gcPjPAA5AcPjPAAEggPjPAAMQgPjPAAVQgPjPAAqggPjPAAxggPjPAABgwPjPAATQwPjPAAVQwPjPAAnwwPjPAArwwPjPAAwQwPjPAA5AwPjPAA9wwPjPAA/AwPjPAAPA8PjPAATQ8PjPAAUw8PjPAAcw+kmZQCdQ9xYVwCdw9qWlICeQ+dh3sCew+ah3sCfQ99aV4Cfw+LfngCgA+mnZoC3g8PjPAAbRCjoaQBbhClmZICcRBMNzABcxCTgnoCdRCIdW4CdxBhTEQBeRBvXlYCexBnVlICfRBUSkYCfxBgT0gCgBBYR0ACghB2a2EChRCtpKMChxCmoaICjxAPjPAAkBAPjPAAshAPjPAA5hAPjPAAXhIPjPAAbRKfj4UCbhJoVk8CcRKdiH8CcxJ+amMCdRJzYlsBdxKGdGwCeRKMdm8BexKSe24BfRKYfXQBfxKNeHEBgBKGcWoBghKPdG8BhRKDbmQBhxKPdm8BiRKOeG8BixKBd3ACjRKWioYC3hIPjPAA5BIPjPAA9BIPjPAAMRMPjPAAPxMPjPAAShMPjPAAUxMPjPAAaROimpYCaxOYh38CbRNbRTwBbhN/amUCcRNjVE8CcxN+bWcBdRN+bGUCdxN3ZV4CeROFcmgBexOSe3EBfROei4ECfxOpkoYCgBOTfHABghOCbWUBhRN3YV0ChxNVRkABiRNnVU0CixN9aGACjRNiT0YBjxNTRToCkBM0Jx8CkhN2Z18ClBOdkowClhOHf3sCyBMPjPAA9BMPjPAAaRVcSkACaxVDMCgBbRVcTEQCbhVpV00CcRWKdGoCcxWch3wBdRWGcGcBdxWDbmQCeRVQPjUCexVMPDgCfRVMPjkBfxVFOjgBgBVANDICghVhTEgChRWKdmwChxWHb2MBiRVsWFABixV4ZF0CjRWEb2kCjxVRPzoCkBUxJiMCkhVBMy4ClBVFMiwClhWMdmwBmRWYgnkCmxWhj4gCnRWcjocCnxWpn5oC7BUPjPAAYRYPjPAAZRaDfHoCZxYzIx8CaRZ9cGoCaxaQfncCbRa/p50BbhaegnYBcRaJdGoCcxZsWVICdRZqWFABdxZsWlQBeRZmWFMBexZXSUYBfRZXSkcBfxZDOjgCgBZLQUACghZgVVAChRapmZMChxaQf3sCiRZmVVEBixZxZGABjRZoWlYCjxZcTkYBkBaCcGsCkhafiYQBlBZiT0oClhZVRD8BmRZjUUgCmxZ/aFwCnRZ+Y1gBnxZ+aV0CoRaCbF8CwxYPjPAAxhYPjPAAGhgPjPAAWRiek5ECXhiaj4oCXxi4qaACYRi6ppgCYxink4YCZRiXhXgCZxiZg3gCaRidhnoCaxh3ZVsBbRh4aGECbhh8bGYCcRhwYVoCcxh6a2QBdRiBcWoBdxiVg30BeRiKeHICexh9a2QCfRhxX1cCfxh3ZV0CgBiYhn0CghiLenMChRhmVU8ChxhvXFYCiRh+aWMCixiCbmQCjRhcTUcCjxhGNzQBkBhrXVoCkhhIOzcClBhcT0kClhiajYcCmRh1Z2ACmxhfUk0BnRhWSUMCnxhtWFECoRh6ZF0CohhhTUYCpBhdST8Cphi8sKsCqBiqpqQBxhgPjPAA5BgPjPAAOhoPjPAAVRqpoJwCVxp3b2YCWRqQh4ECWxqplowBXhqNeG4CXxp4ZV0CYRo/MCgCYxo5LSgCZRqAc2sBZxpbSD4BaRqCbGABaxpkU0sCbRpHOzcCbho9NDMCcRoiHRwCcxotJCECdRpORkECdxo3LywBeRpTSUYCexqVhH4CfRpUSEMCfxpbUUwCgBqJfHcBghpxZWIChRpMQj8ChxopISICiRo/NC4CixpHOTICjRppV04Cjxp8aF0BkBppWE8Bkhp1ZFsClBpyYlsClhpKPjwCmRpkVlACmxplWFQCnRpDOjUCnxqUgHoBoRpoVlECohp3YVkCpBp6YFMBphpzV0sBqBqbkIkCyhoPjPAAzhoPjPAAJhsPjPAALxsPjPAAOhsPjPAATBsPjPAAVRuHe3QBVxvEs6gCWRudhHUCWxt/amECXht3aWICXxtGOjQCYRtMQj8BYxtHPDgCZRtkV00CZxtaS0QCaRtaTUoCaxshFxYCbRtNREICbhsQDAkCcRsjHh4CcxsGAwMBdRsQDAsCdxtUS0gCeRuAdnQCexuGeXQCfRt8bGMCfxuFdW4CgBtyYFkCght+aWMChRt8bGUChxuEcWcBiRuFbWQCixtzW04BjRucf3ICjxuMbmICkBt6XlMCkhuAZlwBlBuFal8BlhuBaF4CmRsrISABmxs/NC8CnRtaTUcCnxsyKygCoRtRREABohtHOzgBpBs9MC0CphtMOTICqBt6XE4CqhuWg3gCrRucmJgB6hsPjPAA9BsPjPAAUxyyp58CVRx/aV8CVxxCMS0CWRxMQDsBWxxnWlYBXhwgGBQCXxw3LywCYRxSSEQCYxxKPDgCZRyAcGoCZxxVSUYCaRxPQ0ACaxyJfnsCbRwjGhcCbhwgGhcCcRxSSkgBcxwgGRcCdRwYExECdxwrJCECeRw1KycCexxHOzYBfRxMQj8CfxxJPjcCgBxYTUYCghxhVE0ChRx1XlgBhxx5ZFwBiRx4ZV0BixxuX1kCjRxxXlUBjxx8YVgCkBx8XlMCkhyRcmYBlBxZQjsBlhxLPDgCmRxmWFUBmxweFRECnRwvJSICnxwsIh8CoRw0KikCohwtIyMBpBwuJCIBphw5MS8BqBweFxUBqhwxIyECrRyMem4CvhwPjPAA2BwPjPAA8BwPjPAAUR59cm0CUx5xYFYCVR46LykCVx5AODQBWR5eUk8CWx4wJSECXh5OQz4CXx5iUU4CYR5GOzUCYx5jVFABZR48MCsCZx58b2oCaR6jlY8Cax6BdXABbR50amgBbh5BODYCcR5VS0kCcx5PRUMCdR6BdnYCdx4/NDMCeR5DNTMCex5URkACfR5nWlQBfx5XRT4BgB51Y10Bgh5vXVQChR6VfHEBhx57aWICiR5dSkMBix5KPDYCjR49MSkCjx5gUUoBkB5TQjsCkh5kTkMClB57YVcBlh5bRz0CmR5EODECmx48LywCnR5QREACnx4kHRgBoR4dFRMCoh4QDQkBpB4mHhsCph4zLCkBqB4ZEhABqh4/NTQBrR47LigCrx6Me3QCyh4PjPAAFh8PjPAATx+BdXIBUR+ol44CUx9uV0wCVR9sXVcCVx9yYVoBWR9gUEwCWx9YR0MBXh9PQDsCXx8kHRUCYR9fU1ACYx+ShIICZR++sq0CZx+3qaECaR9zY1wCax+IenUCbR9iVlICbh9QRkIBcR9USUYCcx93a2cCdR98bmgCdx9uXlYCeR+ZhXsBex+Pe3YBfR9wXlcCfx9iU04CgB9nWFMCgh9hUkwBhR9QPTgChx9zXVECiR+AZ1wBix+Ib2MBjR9yXFQCjx9JODEBkB9MPjcBkh89MCoBlB9BLygClh9sVkwCmR9fTEUCmx80JyECnR8xJSABnx9JOzgBoR8+MzEBoh83Mi4BpB8vJicCph8ZExICqB8hHRkCqh8aFRIBrR8/NzIBrx9LOTIBsR+Xj4YCPSEPjPAATSGuopgCTyHLvrgCUSF6ZlgCUyFdTEMBVSFJQDkBVyEvJyICWSE6LCkBWyFKPDkCXiGCdHEBXyGGeHUBYSGqnJkCYyGPgH4CZSFQRT8CZyGNgXsCaSF9cW0BayFlWlYBbSFpXloBbiGShoACcSF2ZF0CcyF7Z2ACdSF7ZV0CdyGDcGgBeSFqWlUCeyFoWFIBfSFqXVYBfyF4bGYCgCFfU04CgiFYSEMChSF1XlYBhyFaR0ABiSFZSEECiyF0X1QCjSFgS0UBjyFQQDcBkCFdS0IBkiFcSEEClCFYSEACliFOPzcCmSFQPDICmyFqVUoBnSF0X1YBnyFSQDkCoSFAMywCoiEYEAsCpCEZFBECpiEwJSQCqCEyKykCqiETDwwCrSEjGxgCryFlVk4BsSEbEA0B7iEPjPAABCIPjPAAFCIPjPAAOiIPjPAASCJ+dHMCSiKXiH8CTCKijX8CTSJrXFMCTyKNeHECUSKIaloCUyJyYFYCVSIpHBcCVyJGPDgCWSItHxwBWyKShIECXiJIOjcCXyJgUk8CYSJWSEUCYyJqXFkBZSJqXVsBZyJmWlcBaSJ0aWUCayJANTECbSJIPTcCbiJQQToCcSJ2Zl4CcyJkVVABdSJRREECdyJcT0wCeSJxYl0CeyJlV1QBfSJpV1UBfyJ3ZF0CgCJiT0gBgiJwWFIChSI/MCoChyI1KyYBiSJGNTMBiyI5KyYCjSJQPjkCjyJiTEYBkCJZRT4CkiJPPTUClCJGNC0BliJcS0MBmSKBaFwCmyJWRDoCnSIyKCEBnyIaEAsCoSJeS0QBoiJVSEEBpCIwKigCpiIQDgoBqCIdFBMCqiIqJCECrSIrIyQBryJAMSYCsSI6LzACsiJJPTQCviIPjPAADiMPjPAASCN7dXIBSiOIenMBTCNrWlMBTSObjoYCTyOgg3UCUSNbRz0CUyNfTkcCVSNyXFMCVyOFdm4CWSNJPzoCWyNAODQCXiM5MjABXyMoIB4CYSMxLSoBYyNDOzoCZSNhWFMCZyNTSkUCaSNFOzgBayNFOzkBbSM9MzEBbiNBNjICcSM3KycCcyM2KiYCdSNNQj0BdyNYS0UCeSNhU0oCeyNrXFQCfSNqV1ABfyNfTUkBgCNbTEcBgiM7MCwChSMlGBUBhyNKOjcCiSM4KSYCiyMlGxgBjSNLPjgBjyNDNTECkCMxJiIBkiMzKSMBlCM4KyUCliM3KCICmSNbRTsCmyOFZ1gCnSNOPjYCnyMyJyQCoSMYEA4BoiNTQToCpCNOPTgCpiMxKScBqCMyKycCqiMfFBECrSMaFBABryMrIh0CsSNgTUQBsiM6LSgBtCOIfnoCzCMPjPAASCVnXl0BSiVyYFwCTCWXiIACTSWVdmcCTyWEbF0CUSVTQDkCUyVbRz8CVSVJOzMCVyVvZmACWSXBsqoCWyV7b2kCXiVBOTcCXyUzLCkBYSU+OTYCYyVUS0oBZSVGPjwBZyVDOzkBaSVBNzUBayVJPzwCbSUrIiACbiUWEA8CcSUnHx0BcyUyKicBdSUiGhgBdyU2LCkBeSUtIh0BeyUbEA0CfSVQQ0EBfyVCNS4BgCVSPzsBgiVIOzcBhSU2KSYBhyVUREEBiSVOPjsBiyVGNzACjSU3KycBjyUqIh8BkCUpHhwBkiVANTMBlCU9Mi8BliU9Ly0BmSUiGhcBmyU8KiECnSWwm44CnyVENjACoSUcFRIBoiUsHx4CpCVdSkIBpiUrIR0CqCUvJiABqiVFOTQCrSU0KiQBryUjHRoBsSVQPjcCsiVGNi8CtCV9aWACHScPjPAAOCcPjPAAQScPjPAARSd8bmgCSCdgU00CSiegi34CTCdsV00CTSdwW1ECTyc6KSIBUSdPQDgCUye4q6UCVSeEd3ACVydvYV0CWSc4LiwCWyckGRgBXicjGxgBXyclHRoCYScwKygBYycgHRgCZScTDQ0BZycYExIBaScOCgkBaycOCwkBbSclIR8CbicxKygCcScqJSECcyczKigCdScmHBoCdycuJCIBeSciGBYBeyc/NjEBfSc0KiUBfycsIx4BgCdCOTQBgidGOjkBhScyJiQChyceFhQBiSceGxcBiycMCgcCjScTDgsCjyc6MTABkCc6MC8Bkic4Li0BlCc0LCkBlickGxkCmSdFOjYCmyc6KyYBnSdXRDsCnydNPzgBoSc8LyoCoic5LCkBpCdGMywCpidaRj4CqCcVEAwBqicdGhYBrScWEA0BrycxKCMCsScQCQYCsidwXlUCtCePeGsCtieCc2cCvicPjPAA1icPjPAA9icPjPAAPCgPjPAAQSgPjPAAQyielpQCRSh6Z18CSCiPf3YCSii4ppoCTChZRz8BTShDLycCTyhRQjsBUShzZ14CUyhbUEoCVShGOzcCVyhGPDoCWSg7MS8BWyhWTEoBXihLQkABXyg4MC4CYShfUU0BYyg4MiwCZSg/NjMCZyhEOzgCaShGPTsCayg1LCoCbShPRUMCbihPREIBcSgsIyEBcyhXTUsBdSgsISACdyhANjQBeShMQkACeyhBOTYBfShDOzgBfyhEOTcCgCg3LCoBgig6MC4ChSgmHBkBhygLCQcCiSgJBAMBiygZFRUBjSgfGBoBjygeFBMCkCg6MC8Bkig1KyoBlCgtIyEBlig2LCoBmShBNTECmyhNPDkCnShiU0gBnyhnUkkBoShcSD8Coig/MisCpCgrIBoCpihbSD0CqCgnHhoCqigoIR8BrSgNCggBrygUDgsCsShPPzkCsihkST0CtCiCbGABtiiZiHwC4CgPjPAADioPjPAAIioPjPAAKCoPjPAAQyp8dXQCRSqdlJECSCpnVEwCSiqSfnMCTCo+LiQCTSpSRD0CTypZRj4CUSo3KiUBUypAODUCVSofFxUCVyo4MS8BWSpGPDoBWypDOTcBXipcUk8BXypiVVMBYSpdUUoBYypiVU8BZSpyZ2IBZypgVVACaSpXTEgBaypKPzsCbSo0KSUBbipBODUBcSpSSEYBcypbUE4BdSpbUk4BdypPREACeSplVlMBeypTR0MBfSpIPDgBfypEOzcCgCoaEAwCgioPCwgBhSoWEg8BhyodFRMBiSouJSMBiyodFxcBjSoeHRsCjyoLCAYBkCoUDA0CkipBNjYBlCowJiYBliowJiUBmSo5Li0Bmyo0JiQBnSpBMy4BnypaSUICoSpIOTICoiomHBcBpCoxJyYBpiouIhsBqCpINy8CqioOCQcBrSohGBYCryo4KiQCsSpjTEEBsip2YFUCtCqLdmsCtip9Y1QBuCqpnZkCECsPjPAAQSuBfXwCQyuNiIgCRSu4sa8CSCt1Zl8CSitjUUgCTCtPPTkCTStbRj0CTys9MiwCUSsvJyQCUysNCgcBVSsuJSMBVyscFBIBWSsvJSQCWys0KigBXis5MS8BXysmGhkCYSsfFBMCYyshFxUCZStHPToCZytFOjcCaStkWVUCaytaT0sBbStNQj4BbitaT00BcStdT04BcytXSUgBdStYS0kBdytPREACeSs8Mi4CeytEOTUBfSseEw8CfysaERACgCs9NDICgis0KikBhSsxJiUBhysuJiQBiSsnHx0BiysiGRsBjSskHx8BjysdGRgBkCskIB8BkisSDAsClCssIiEBlisjGRgBmSsrIh8BmysnHhwBnSsxKCQBnysyJiABoStNQD0CoissJCECpCs3KykCpis+MzIBqCsoHRcBqitPQToCrStbSUIBrytiTUIBsStzXFEBsitDMSoCtCtYR0ACtitoT0ABuCuxpqACvisPjPAA3isPjPAA5isPjPAA7CsPjPAABC0PjPAAEC0PjPAAQS2De3kCQy2hmJUCRS2hl5MBSC2Cc2oBSi1pWFABTC1hTkYCTS1CNC4BTy0lGhgBUS0eFRABUy0xLCYBVS0eGRUBVy0UDwsBWS1ANjECWy09MzICXi0mHxsCXy0NCggBYS0VEg0BYy0tJiMCZS0tIR0CZy0wJiUCaS0xJyUCay06MC8BbS1PREMCbi1bUE4BcS1PQj8Ccy0/Mi8CdS01KCUCdy02KycCeS0rIB0Cey0RCQYCfS0aExABfy0nHRwBgC0uJCMBgi0fFRQBhS0RBwYBhy0TCwkBiS0aEg8Biy0eGBcBjS0WEA8Bjy0eFRMBkC0oHx0Cki0qIR8BlC0iGhgBli0cFBIBmS0cFBIBmy0iGRcCnS0cEQ8Bny0vJSMCoS0tIx4Boi0tJh8BpC0hGhgBpi0lHxsBqC0wJSMCqi00KCQCrS0vIh0Cry1hSz8BsS1TPjQCsi0tIx8BtC0jGhkBti1zY1wCuC14YVgCDi4PjPAAQS6TiYUCQy54bWcCRS6tnpYCSC62pZ4BSi5qVU8BTC5VQzsCTS5NQDoCTy4jGBYBUS5MQT0BUy4wJyICVS5QRUMBVy5HPDoBWS5FOjYBWy4oHhwCXi4CAQIBXy4HBAMCYS4fFRMCYy4fGBUBZS4eFhQCZy45LywCaS5LQD4Bay5LQT8BbS5LQj8Cbi4zKSYCcS4RCwgCcy4IAwABdS4MBgMBdy4RCggBeS4RCggBey4aEQ4BfS4eFBIBfy4dExIBgC4OBAMBgi4zKSgBhS4fFRQBhy4fFBABiS4hFRIBiy4VDAkBjS4fFxQBjy4tJCMBkC4qIB8Cki4eFxUClC4SDgsBli4gHBkBmS4cFBIBmy4fFxUBnS4YEA0Bny4rIiABoS4aEhABoi4ZFBEBpC4dGBUBpi4PCQcCqC4yKigCqi42KygBrS5ZRz4Bry5NPTUBsS46LSoCsi4dFRMCtC4UEA0Bti49MisCuC6Zi4ECui6flJQCvi4PjPAA0C4PjPAA4C4PjPAA5C4PjPAAAi8PjPAAQS+YjYkCQy9cTkkCRS9pXVcCSC+ag3YCSi91XVYCTC82JiEBTS9VRj8BTy9RQzkBUS9ANjMCUy86MS4BVS88MSwBVy9DOjcCWS8PDQsCWy8CAQABXi8JBgYBXy8qIRsCYS85KioCYy8qIB4BZS8dEhICZy8vIyEBaS8tIx0Bay8eFhQBbS8wIyEBbi8wJyUBcS8ZERABcy8UDQsBdS8aEA4Bdy8dERABeS8UDAoBey8YDAsBfS8pFw4Bfy8uIh0BgC8wJycBgi8RCwsChS8uIyEBhy8sHRwBiS8nFxYBiy8gFxUBjS8jFxcBjy8gFhUBkC8bEQ8Bki8JBgcBlC8DAgIBli8IBgYBmS8eFxcBmy8hGRgBnS8qIiABny8eFhQBoS8bEQ8Boi8rIR8CpC8fFRMBpi85LSsBqC9AMiwBqi9PPzcBrS9rVk0Bry9eSkACsS8WDgwCsi8PCggBtC8XEw8Bti80KCQCuC+pmZECCTEPjPAAPDGemZgCPzGck5MCQTGxqqYCQzF1aWMCRTG5q6MCSDGnjoQCSjFBMysCTDFQPjoBTTFBMS0CTzEwJSECUTEaFBICUzElGxgBVTEyKSYBVzEiHBkBWTEODgwCWzEEAwMBXjEQDAsBXzFBMy8CYTE7LCUCYzE5KSIBZTFALSQBZzE+LCUBaTE+KyQCazEnGhkBbTEgFhUBbjEoHhwBcTEUDQoBczEXDgsBdTEfEAoBdzEvGhMBeTExHBYCezEqHRkBfTFJKSABfzFFJhkBgDErHBcBgjEjFhMBhTEYEA0BhzERDAkBiTEXEQ4BizEXEQ4BjTEdFBIBjzEPBwUBkDESCQQBkjEOCgoBlDEMCQgBljEEAQEBmTEUDg4BmzEeFhUBnTESCggBnzEkHBoBoTEwKCUBojE/NzQBpDE3LScCpjEvIx0BqDEuIh8CqjE4KiQBrTFBMisBrzFtWU0BsTEuJB8BsjE9MSwCtDESDgwCtjEcFhMCuDEuIxsCujGbjYgCPDKVkY8CPTJrYFoCPzKWiogCQTKCc3EBQzKaiIMBRTKqmJACSDKcioICSjIzKCIBTDIzJiECTTIhGBQCTzIZExEBUTIIAwECUzJCOjUBVTIXEhECVzIBAAABWTIBAQIBWzIEAgIBXjIwJSACXzJTOzMCYTJVPTYBYzJGLykBZTJjQjYCZzJ1T0MCaTJgQzoBazJMNi8CbTI7LSUBbjIxJiIBcTItIR8BczIoGxcBdTIyHxgBdzJEKSABeTJNLSYBezI+KB4BfTJlQDABfzJQLyYBgDJRNCcCgjIiDwQBhTIOCAYBhzITDQsBiTISDAsBizIJBAIBjTISCQUBjzIgEQoBkDIkFQ8BkjIaEA4BlDISCggBljITDAkBmTISCwkBmzIVDw0BnTIfGBcBnzITDQwBoTISDgwBojIWDg0BpDIHBQIBpjIRDAkBqDI1JyICqjIzJiABrTIlGhQCrzJjTUEBsTJAMioBsjI5LCYBtDImHhwBtjIXDgwBuDIgFxEBujJ8bGICxDIPjPAAKjQPjPAAOjQPjPAAPTRtYl0CPzRgUkwCQTR1ZF0BQzR6aGACRTSCb2gCSDR/bWUCSjQ7LyoCTDQuJCEBTTQaEhABTzQOCgoBUTQSDgwCUzQbFRECVTQHAwMBVzQHBgQBWTQDAgMBWzQGAwIBXjRGMCUCXzRoRzkCYTRdRkEBYzReSUABZTRxUkYBZzSGYE4BaTRkSDsBazRfQjsBbTRFMCwBbjRFMSoBcTRCLy0BczQ5KCcBdTQuIB8BdzRAKiQBeTRdPC4BezRsQzYBfTQ4IBcCfzRrQTECgDRYNysCgjQnFhMChTQPDgkBhzQNBwgBiTQLBgYBizQKBQMBjTQWCwoBjzQzHBYBkDQ0IBUBkjQmFQoBlDQYCwYBljQSCAcBmTQOBwUBmzQUDw0BnTQHAQEBnzQUDg4BoTQlIB0BojQjGxkBpDQoHh0BpjQqHhwBqDQ0KCMBqjQ3KCIBrTQ9LSYCrzRdSD0BsTREMywCsjQyJyIBtDQpIB0BtjQpHxwBuDQ0KCMCujSbioEC9jQPjPAAPDafnZ4CPTaVhn8BPzZ7aGEBQTZvXVUCQzZfTkYBRTZPPzcCSDZKOjQBSjYxIx4CTDYtIiABTTYTDgoBTzYGAwIBUTYTDQ0CUzYUDg4CVTYUDwwBVzYTDwwBWTYjGxkBWzYmHBgBXjZcQTQCXzZWOC0CYTZDMi0CYzZdSD4BZTZeQTgBZzZbPjUBaTalb1sBazZfQTgBbTZ4UEICbjYsHx0BcTZePzQBczY5JyIBdTYmHBkBdzYoHRsBeTYkGhgBezYNCQYCfTYPCwgBfzYTDQsBgDYJBwQBgjYcEAoChTZfNiYChzY0GxECiTYxHxYCizYvFw8BjTYrHRQBjzYSDQkBkDYkFBABkjYbCwoBlDYXDQoBljYgEQsBmTYUCQcBmzYPBwQBnTYUDQwBnzYPBwgBoTYTDAkBojYcEBEBpDYSCggBpjYfFRICqDY5KyUCqjZDLykBrTZALSQBrzZMOzQBsTZGNSsBsjYnHhsBtDY1KCACtjZJOTUCuDY9LykCujZ/a10C4DYPjPAALTcPjPAAPTd7cG0CPzeGenQCQTd3aGABQzdhT0gCRTdlVEwBSDdZSkIBSjdYS0UBTDcpIR0CTTcSDQoBTzcVDw8BUTckHh4BUzcjHR0BVTcoHh0BVzc4LSwBWTclHhsBWzcyKiUBXjc3JBwBXzcqGxQCYTcyHxgCYzddPzMBZTdcRD0BZzdGLyoBaTdYOzUCazehcVsCbTdYOS0CbjeEWUYBcTciFg8CczcoGhUBdTctIR0BdzcZEAsBeTcXDQgBezcdERABfTchEg0BfzccDQsCgDchEQoCgjdeNicChTdnPC0ChzeKVkICiTeCUDsCizd2RS8CjTdtPzECjzdhNyYCkDc5IRcCkjceDwoBlDdKLB0CljdJJBkBmTcmEQoBmzcoGRMBnTcXDAcBnzcbEg4BoTcqHxwBojcfFhMBpDchFxUBpjcyJSABqDcrHBcBqjdINC0BrTdLOTIBrzcxJR8CsTc+MiwCsjceFhMBtDdbS0IBtjdFMywBuDc1Jh8CujeCbmEB8jcPjPAACzkPjPAAPTllYFwCPzmdlJECQTliVE0BQzl1YlwCRTlgTUQCSDlbSUABSjlCNC0CTDkZEQ4BTTkXEA0BTzkeGBcBUTkcFhQBUzkfGhgBVTk0LCoBVzkkHBoBWTkxKScBWzkoIB4BXjkbFRACXzkQCAYBYTlXNCQCYzm1d18CZTmzdmACZzmKXk0CaTlcPzQCazkoFAoBbTlSNCkCbjlhPDUCcTlDKR4CczliPDACdTl1Sj0CdzlNLSMCeTkpEw4Cezk0GhECfTlVLyMCfzlgNSQCgDmGUT8Cgjl1SzwChTlmOy4ChzmWY04CiTmbYUoCizmKVEICjTl0RTIBjzloOyoCkDlvQzMCkjllNyQClDlLJxkCljk1HA8BmTlEKB0BmzkpEgsBnTkvGRIBnzk5JRoBoTknFg8CojkXDgoBpDkeFRIBpjklFxIBqDkqHRgBqjk3Jh4BrTklGhQBrzklHhoBsTkOCggBsjkmGhgBtDlCNC0CtjleTEIBuDlVRD0BujloVUsCGjoPjPAALzoPjPAAPTqal5cCPzpLQ0ACQTo1KSMCQzq1pJwCRTqYhHkCSDpbSkIBSjoyJSECTDotIyEBTTokHBoBTzoqJSQBUTolIB0BUzoTDgsBVTohGRcBVzoUDAoBWTofFxUBWzofFxUBXjolFhECXzpXNysCYTqxclsCYzrMjWwBZTrUkXMBZzrPjG4BaTrTlnoCazrHi3MCbTqseGMCbjqTYk0CcTquclkCczqydl0CdTqkaVQCdzqeY04CeTqfYksCezqwblYCfTq8emACfzrEgWYCgDrPjXABgjrTjG8ChTq/f2IChzrDfV8CiTq6eF4Cizq9fF4CjTrDf2QCjzqpaE4CkDqeXkQCkjqmZkoClDqdW0ACljqNUToCmTpgOSoCmzo0HRMCnToxGg8CnzpFKB0BoTpUNiYBojpUMycCpDo/KB8CpjoXDQsCqDo4JCACqjoiEwkBrToiFxIBrzoaExABsTorHRoBsjo5LicCtDpIODMBtjpwXlMCuDpUQzsBujqHdWsC+ToPjPAABDwPjPAADjwPjPAAIjwPjPAAPzyZlZQCQTx6b2sCQzx7bGMCRTx7Z1oBSDw+MCkBSjwoHRkCTDwrIh8CTTwkHRoBTzwhGxoBUTwmIB0BUzwpIyEBVTwlHRwBVzwsIyIBWTwaEhABWzwaEhABXjxUMiUCXzy0dlsCYTzMiWsCYzzTj3QBZTzdm3oBZzzenH8BaTzenIEBazzgp4kBbTzipIYBbjziooIBcTzUlHkBczzXmn0BdTzcnn4BdzzipoQCeTzpqYkCezzjooICfTzdl3gBfzzfnHoBgDzelHQBgjzaknEBhTzZk3ABhzzdlnYCiTzYkm4BizzbkXIBjTzSiWcBjzzTi2kBkDzLg2EBkjzGe1oBlDzIe1sBljy7d1UBmTyOVTwCmzx2Qy8BnTxwQzABnzxtRjMBoTxxSDcBojxtRjMBpDxfOSoBpjxPMyYCqDwOCAYCqjweFRICrTwdEw4BrzwVCwgCsTwlHBsBsjwiFxYCtDw2KyYCtjxgT0UCuDx5Zl0CujyEdGsC7jwPjPAAPz2TkpUCQT2upqMCQz1lV1EBRT13Y1kCSD1XSEICSj1HOjYBTD0uKCUCTT0cFxQBTz0iHBkBUT0eFhQBUz0vJyUBVT0nICABVz0aExMCWT0PCAgBWz0RCQQBXj1+UDoCXz2/f2ECYT3YlHIBYz3YlHUBZT3bmXkBZz3ko4UBaT3lqIsBaz3ipokBbT3hpIcBbj3sr5IBcT3rsJIBcz3usZQBdT3sr5IBdz33wKIBeT35wKIBez3xtpcBfT31tJQBfz3ztpUBgD3qoH8Bgj3rpoQBhT3rp4QBhz3wqogBiT3po4EBiz3lnHkBjT3mnXoBjz3mnHgBkD3XjWkBkj3ViWQBlD3VimcBlj3LhWMBmT2tcFMBmz2VYEgCnT1/Uj0Bnz1xSzkBoT1vRjUBoj10SjkBpD1uRzQBpj1sRjMBqD1VOCkCqj06JRwCrT0eFA4Brz0uJSMBsT0VEA8Bsj0LBgYBtD0aEQ8Ctj05KiICuD15Z10Cuj1KOTEBvD2ppaQCzD0PjPAA5D0PjPAA5j0PjPAA+T0PjPAACT4PjPAAQT6LhYQCQz6toZoBRT5rV00CSD5GODICSj5IPDgBTD4lHhwCTT4bFhMBTz4gGhcBUT4gGBYBUz4YEA4BVT4PCwoBVz4HAwIBWT4FAwMBWz4iEw0CXj6rb1ICXz7RiGcBYT7WkG0BYz7ak3MBZT7cmnoBZz7gn4EBaT7nrI8Baz7pr5EBbT72vZ8Bbj7ttZgBcT7qtZUBcz7ttpcBdT73vqABdz73xKQBeT71vqABez73vaABfT7ztZgBfz7xqIgBgD7rpn8Bgj7non0BhT7spoEBhz7uqIYBiT7uqIYBiz7mnXoBjT7poH0Bjz7nnHYBkD7ZjWYBkj7RhF4BlD7Og2ABlj7EfVwBmT6vdFgBmz6icFYBnT6NX0oBnz57VkMBoT5rTDoBoj5dPy0BpD5hPi8Cpj57VEMBqD5xTT4Cqj5xSzkCrT4uIBoCrz4NCgkBsT4GBQMBsj4LCgkBtD4ZExABtj4/MikCuD5FODACuj5wXFMCvD6jn54CwT4PjPAAQUCBfXwCQ0BfTUQCRUBgTUIBSEBwYVkCSkAfFRECTEAvKScBTUAtJyUCT0AdFxUBUUAfGRkBU0ATDQ0BVUAHAwIBV0ASDg0BWUARDAcBW0A0IBkCXkDEgmEBX0DPjGkBYUDck3ABY0DYk3EBZUDcmnoBZ0DrrY8BaUDrspUBa0DwuZwBbUDtup0BbkD1waYBcUDxwKUBc0Dzv6EBdUDxt5oBd0DxtpcBeUDsro0Be0Dwso8BfUDnon8Bf0DsonwBgEDckmwBgkDhl3IBhUDmoXoBh0DnnXoBiUDlm3gBi0Dfm3QBjUDkm3MBj0DklXABkEDdkWsBkkDIhGIBlECmak8ClkChaVEBmUCSZlACm0B8WEYCnUBjRjYCn0BXPjIBoUBiSTwCokBMNC0BpEBHMicBpkBGMCYCqEBuTT0CqkB+VUIBrUAvHhgCr0AQDQoBsUAHBwYBskAPDgoBtEASEAwBtkBeUEcCuEA3KyUCukB7amECP0EPjPAAQUGTkpUCQ0FhVlICRUFtW1MBSEFKOzMCSkFQRkMBTEEmHRsBTUE2LCoBT0EZERABUUEcFhYBU0ETDQ0BVUEVERABV0EXExMBWUEkGhUBW0FHKR4CXkHKhGABX0HXk3EBYUHalHIBY0HYl3cBZUHmpYIBZ0HstZcBaUHQnoYCa0HVpY4CbUHaq5MCbkHcqY8CcUHfrpUCc0HcpYwCdUHmrZACd0HRmHgCeUHOk3ECe0HJiGcBfUHbmHUBf0HVimUBgEHbkmwBgkHfm3MBhUHjmHMBh0HlmnQBiUHdk2wBi0HbjmoBjUHZj24Cj0HIfV4BkEG8d1kCkkGbY00ClEF/VUQClkFxUUECmUFNNy0Cm0E7KyQCnUE1Jh8Bn0E3JyEBoUE6KSMBokEzJh8BpEFNOjIBpkE9LicBqEFCMSkBqkFsTT0CrUE/Jh0Cr0EYEhABsUEQDg0BskEVEQ4BtEEcEw8CtkGQfncCuEFCNjMCukGJeG4CvEGjn54C7EEPjPAAG0MPjPAAQ0N+cW4CRUODdG0BSENXSEICSkNeUU0CTEMpIB4CTUMkHBoBT0MZEQ8BUUMpIR8BU0MiGhgBVUMhGxsBV0MQCgoBWUM0IhsCW0N6SzwCXkPQiWgBX0PXlXIBYUPYmXoBY0PbmnsBZUPcnIACZ0O1inUCaUOPb18Ca0OWdmcCbUOGZVYCbkOQbV0CcUOPa1kCc0N/W0wCdUN5VUQCd0N7VUQCeUOGXUsCe0OQYUwCfUOialECf0O/g2YCgEPPiGkCgkPXjmoBhUPck3ABh0Pdk2wBiUPJf1sBi0PQhmMBjUPBe18Cj0OnbVECkEOKW0gCkkNfQDEClEM4JyIClkMoIh4CmUMcGBkBm0MYExUBnUMdFhQBn0MxJyEBoUM0JyABokM4KB8BpENINy0BpkNQPDABqENZQjgBqkNeSkICrUNUNiYCr0MRDg4BsUMaFhIBskMoIBoBtENTSUICtkNaT0sCuENfT0YCukOdkYsCIkQPjPAAPUQPjPAAQ0R2cXECRUR2amcCSERaS0UBSkRXSkcBTEQlHBsCTUQ3Ly0CT0QkHBoBUUQtJSMBU0QtJCIBVUQRDAsCV0QTDg4BWUQ4IRUCW0SiaVECXkTWkm8BX0TcnXoBYUTYm34BY0TCk30CZUSBYVQCZ0R6XVMBaURyWE0Ca0RtU0cBbURwV0oCbkRYRDsCcUQ+NC8Cc0Q8MjABdUQ/NzMCd0QtJCECeUQrHxoCe0Q9KSECfURhQTICf0R/VUICgESqcVcBgkS8dFYChUTZj2wBh0TLg2IBiUS5dlsBi0S1clQBjUSXW0QCj0R/UD0CkERQNywCkkQxIRoBlEQaEhEBlkQXDw0BmUQVDw0Bm0QZFBACnUQYEQ0Cn0QgFhICoUQvIRkCokRGNi0CpERVPDECpkRbQDQBqERmSDkCqkSkiHsCrURjRDQCr0QHBQQBsUQjGhgBskQ2LCgCtERQRj8CtkQ1KiYBuESCb2cCukR8cGgCOkYPjPAAQUYPjPAARUaGgIACSEZYS0MCSkZcT0kBTEYzKCQBTUY+NTICT0YZEhEBUUYbExQBU0YiGhsBVUYSDg0BV0YdFRYBWUZBKh8CW0a8g2QCXkbnp4QBX0bWm3gBYUa2hm8CY0aWbV0CZUZ6V0sBZ0ZrTkQBaUZZQjkBa0ZINCsBbUY5KCIBbkYnHBYCcUYVDAcCc0YcEw4CdUYcFA8Bd0YWDgkCeUYVDQgCe0YeEw4BfUYoGRABf0ZILCABgEZzSzcCgkaeZksChUaxcVQBh0afYUgBiUacY04Bi0aob1IBjUaRYkoCj0ZcPSwBkEZZOSsBkkZfPC0ClEZzSDQClkZlQjACmUZCJhkBm0ZPMiUCnUZXOCoCn0ZePC0CoUZrRDABokZ8U0ACpEaaZ1ICpkaZbFUBqEalfGkBqkbHppMCrUaffW4Cr0YQCgcCsUYiHBcBskY3LCcCtEZTSkUCtkZYS0UCuEZUQzsCukaJfXgCxEYPjPAAKEgPjPAASEiYi4MBSkhqXVcCTEhANTEBTUg7MjABT0giHhsCUUgLBwYBU0gWEhEBVUgTDw4BV0gZEBIBWUg8Jh4CW0jOjG0CXkjmqYcBX0jfp4YBYUi6hWwCY0iWaFYCZUiDVkEBZ0h7VEMBaUh6UUACa0iJXUkCbUiVZEwCbkiXZEsBcUiRY0sBc0h1TDkBdUhePCsBd0hjPCkBeUh+TjgBe0hxRTECfUhlOigCf0hbNiQCgEhrRDIBgkh8STIBhUjHhWUCh0jGh2kCiUicY0kCi0ibZkwBjUiWZkwBj0hySTMBkEiCVT0Bkkh5TDYClEgwGQsClkgyHRUBmUggEgwBm0gVDgkBnUgLBAABn0gaEAwCoUg9KSACokhtTEACpEhWOysCpkh2TTwCqEi7iG8Cqkjbt6IBrUi1koQCr0giFRECsUgNCQYBskgvJiMCtEgzKiUBtkg9MCoCuEhVRj4CukiNg38C0EgPjPAASElpWlICSkl5a2MCTEkzKiMBTUkzKSUCT0kSDgsBUUkWEhEBU0kSDg0BVUkKBwUBV0khHBkBWUlCLCQCW0nMkXMCXknlsZMBX0ndo4UBYUnRmXwBY0nBim8BZUmvemACZ0moblABaUmbYkoCa0luRC0CbUldOSkCbklTNywCcUkiFAsBc0kWDAkCdUklFREBd0k5IRYBeUlBIxkBe0lQKx0CfUlwRC8Cf0mCTzcBgEmNVT4BgkmYX0YChUntr48Ch0nrspQCiUnSiWgCi0m4d1kBjUmTXkMCj0mCVTsBkElsRTACkklQMCEBlElCJxwBlklRPTUCmUlDMi4Cm0kTExgCnUlJOToCn0lPPzkCoUnDqJoCoklBMCwCpEk+KiECpklzU0cBqEmCV0ECqknGnoYCrUnFpJMCr0kiEw8CsUkPDAwBsklANTACtElEOTUCtkklGxoBuEloVkwCxEkPjPAASEp9bmYBSkpuYFgCTEooIBkBTUo2KycBT0okIB0BUUoWEhEBU0oUEA8BVUogHRwBV0oOCgcBWUpbQDMCW0rOknQCXkrntJQBX0rlrYwCYUrJi2oBY0rEiWoBZUqzeVoCZ0pjOikCaUpqRzYBa0pHLSgCbUo5KiACbkorGxUCcUo5ODoCc0orJykCdUpKNDACd0qVfXECeUo6HRUCe0pPKyABfUpeOCsCf0ptQjABgEqRWj8CgkrBeFoChUrvpIECh0rvq44BiUrjkG0Bi0qya0sBjUqNWEABj0pkPCoBkEphPCwBkkpUMCQClEpTMyoClkqPdGkCmUoaCQECm0pzY1wCnUphTkQBn0qkiX4CoUrVsqECokpzQjkCpEpIKyACpko1IxsCqEpwSjkCqkqdb1MCrUrewrUCr0o1IhwCsUolIBoBskpHOjMCtEo1KykBtkpWSkUCuEp2ZFsC9EoPjPAAEEwPjPAAFEwPjPAASExTRz8CSkyxm4wCTEwzKiYCTUwzJyYBT0wVEw8BUUwZFBMBU0wMCQgBVUwUDwwBV0wWEg4BWUxvUUMCW0zepIcCXkzmrY4BX0zmqYMBYUzRj2oBY0yxc1gCZUx3RzQCZ0xqRzgBaUw9JBoCa0xhQjwCbUzJkoECbkySdW8CcUxIOTQCc0xHLicBdUyLbF0Cd0ysgnECeUxtRToCe0xSKR4BfUxxSDsCf0yZaFMCgEyUWkABgkzEelsChUzqnnkBh0zzs5MBiUzmnn8Ci0y8clYCjUyFTzkBj0xoOioBkEx5UToCkkw4Fw4ClExCIRgClkxOLiQBmUxwTD0Cm0xjQDMCnUxrRjkCn0xzRzoCoUxwQzUBokxiQDECpEx7WUYBpkx/W0cBqEyQY04BqkyYZkwBrUzjx7oBr0xnTEUCsUwnIBwBskxBMzACtExkW1kCtkxBLSMCuExiVE4C5kwPjPAASE0/OzYCSk3Yp5ECTE1xV08CTU00JyICT00aFRIBUU0gGBYBU00UDwwBVU0fGhgBV00gHBgBWU1vUUICW03fpYgCXk3fpIUBX03np4MBYU3fnXkCY02ycFICZU2lalQCZ02ygGsCaU2hcV4Ca02TY1MCbU2ye2kBbk2ncWACcU1/XE4Cc017VEYCdU1+U0MCd018UD4BeU1iPS8Be01lPzYBfU2BVkYCf02xeGABgE2sak0Bgk3TgVwBhU3tn3kCh03+yK4BiU3vrZACi03LfFkCjU2aWkECj01yRC4CkE1vRDEBkk11UkQBlE1uSj0Blk1eOi0BmU1vQTMBm01/Tz0BnU2GVD8Bn02UYUkCoU2ibVgBok2VY08BpE2JXUoBpk2PYEoBqE2VaVABqk2fbVYBrU3pzsACr029qZ8CsU1DNC8Bsk1XSUQBtE1JJx8Btk1YLyQCuE2djYcCvE0PjPAAxE0PjPAASE98ensCSk/JgWMCTE+NRzcBTU96VkkCT08sIBgCUU86LisBU08qJCABVU8sJiUBV088My8BWU9qSz8CW0/QlHUCXk/ut5kBX0/urYYBYU/oqIABY0/rrogCZU/tr40BZ0/ZnHoBaU/IiWoCa0/JiGoBbU/FhmkBbk+5fGEBcU+cZVIBc0+UYE4BdU9/Tz4Bd09qOywBeU9pOSwBe09qRTkCfU+ibVcCf0/FgmIBgE+9clIBgk/mmG8ChU/3sYkBh0/9x6oBiU/0tJgBi0/gkWwCjU+4clQBj0+KUzwCkE99STQBkk95SjQBlE97UkQBlk9+UT8CmU9uQDABm095SDYBnU+IVD4Bn0+PXEYBoU+PX0oBok+KXUYBpE+QY0wBpk+dbFIBqE+Yak4Bqk+semEBrU/ixrgCr0/q2M8CsU9ALysCsk95XEwCtE97NB8Btk97NB4CuE/PwLkCEFAPjPAANFAPjPAASlDXhGECTFCnSzYBTVClXUQCT1C5e2ICUVA1Jx0CU1A3KCYBVVA+NTEBV1A9MzABWVBqST0CW1DVmnwCXlDvvKABX1DysosBYVDwsIoBY1D1u5YBZVDxtZEBZ1DlpoMBaVDQkHABa1DLimwBbVDCgGIBblCyclUBcVCZX0gCc1CGTjoCdVByPioBd1BrPS4CeVCTY1MCe1C0e2QCfVDbkGwCf1Dmm3IBgFDnlmsBglDwonsBhVD0r4cBh1D7wJ4BiVD8wKIBi1DlnHgCjVC9d1UCj1CZXkMBkFCRVz0BklCmZkkBlFCaXUICllCZYksBmVCcZk8Bm1CaZE4CnVCTXUYCn1CSXUQCoVCaY0wColCkbFICpFCmbFABplCsdFcBqFCsdlkBqlCyfmMBrVDauagCr1D4598CsVBOOzMCslCcaVYBtFCBNyEBtlB2KBUCuFDPtawCBlEPjPAANlEPjPAASlHPgGQCTFGmRDEBTVG2ZkoCT1HTh2MCUVGibFoCU1FHMScCVVFENS0CV1EzKygBWVGDX1ACW1HfpokCXlHot5sBX1HvsIwBYVH0tI8BY1HxtpEBZVHrr4sBZ1HztJEBaVHpp4cCa1HPjW0CbVG2dFcCblGcYUcCcVGKVj8Cc1GTXkkCdVGsd2ECd1HDiW0CeVHWj2oCe1H0sIwCfVHxrIUBf1H3tY0BgFHwqoEBglHtoHkBhVH0rocBh1H+xqgBiVH4xKcBi1HwooACjVHPgl8Bj1GfZUwBkFGTW0QBklGlZEkBlFHEgF0BllG9elgCmVGycFEBm1G4dVYBnVG4dlcBn1HAfl0BoVHGgV8BolHPiGYBpFHCf10BplG2eFgBqFGydlkBqlGyel8BrVHTrZgCr1H46uICsVFqRz0CslGpbFQBtFF2OSMCtlF6OCkCuFHXwLYC2lEPjPAA5FEPjPAA8lEPjPAASlPfnYECTFOXOiUBTVO/bFECT1PqnHgBUVPflnQBU1O6iG0CVVNjST8CV1M0LCoBWVOdd2YCW1PuvqMBXlPyu50BX1PzvJgBYVP1tY8BY1P2tpEBZVPytJEBZ1P2wZ4BaVP9yKQBa1P3wJ0BbVP6wZ4BblP1uJUCcVPnpYICc1PooIACdVPsq4sCd1PytJQBeVP4u5kBe1P6vZ8BfVP3tZMBf1P2r4YBgFPwqoEBglPqnXUBhVP4sokBh1Pzw6cBiVP9zbIBi1Pik28CjVPbjWgCj1OhY0YCkFObY0oBklOZXkQBlFOsbVICllPIgWEBmVPOhGQBm1PEeFcBnVPJf18Bn1O+dVYBoVPCe1kBolPGfl0BpFPEe1sBplO7d1oBqFO4e1sBqlOyeFkBrVPKoIwCr1P46+MBsVOUa10CslOTW0UBtFODQi4CtlOHPiUCuFPNw7wCxlMPjPAA/FMPjPAAL1UPjPAAPFUPjPAASlXOqZkCTFWeRi4CTVXMe2ACT1XZhmIBUVW7akoBU1WSSS8CVVVlKx0BV1ViQzUCWVW5kn4CW1X2y7cBXlXxu5oBX1XrrYoBYVXqpoIBY1Xvq4QBZVXzr4gBZ1X0sIkBaVX3to4Ba1X3t5IBbVX8v58BblX2uJoBcVX7vJkBc1X5u5sBdVX4upkBd1X4vJ0BeVX3v6EBe1X0sZEBfVX1sI8Bf1XtpoABgFXwpX0BglXupX0BhVX4vpoBh1X4x64BiVX/0roBi1Xyr4oCjVXfkGgBj1XJgmEBkFWia1EBklWYYUsBlFWublEBllW4c1EBmVXQhGIBm1XVh2MBnVXQhGEBn1XPhGMBoVXNgmIBolXNg2IBpFW8elwBplW0dlsBqFWtcFMBqlW2e2EBrVXOoo0Cr1Xv3dMBsVWIWVACslWOU0ACtFV5RC8CtlWNSTMCBFYPjPAAEFYPjPAANFYPjPAAP1YPjPAATFa5ZEgCTVbGeV8CT1bVhmYCUValWj4CU1aQSzMBVVaWUj0CV1bnspUCWVbBlIMCW1byzrgBXlbpsZIBX1bipYUBYVbmoH4BY1bpoHsBZVbyrYQBZ1bxrIIBaVbzsYsBa1b8vJkBbVb4vqABblb4t5wBcVb2upsBc1b4wKIBdVb+xagBd1bzuJkBeVb6vZ4Be1btqIYBfVbxpoQBf1blmXUBgFbmmngBglbxpoAChVb7wKABh1b808ABiVb60boBi1b1q4YCjVbnlWwBj1bMg2ABkFapbFABklana08BlFaeZUsBllawbVEBmVbMgmABm1bajWoBnVbFeVkBn1bQg2UBoVbQhGQBolbLgmEBpFbIgmEBpla5eFwBqFavc1cBqlavdlsBrVbMnYoCr1bw39UBsVaLX1YCslZ9RC8CtFZ1QC4CtlajaVMC4FYPjPAA5FYPjPAATFjVlXwCTVizZlACT1jdjHACUVicSzUBU1idTzwCVVjlp4wCV1jssosCWVi7lIICW1j1zLcBXljutJgBX1jwtZYBYVjjmXgCY1jypYICZVjxrYkBZ1jyrIoBaVj5uJYBa1j7v6ABbVj4wKQBblj6wKIBcVj+wKIBc1j7xKYBdVj2vJ8Bd1j1u5wBeVjwsJABe1j1r48CfVjaj3MBf1jjmnUBgFj6upkCglj6upcBhVj+yKUBh1j/3MQBiVj+y7ACi1jwnXcCjVjnlWsBj1jXi2gBkFjCgGEBkli/dlYBlFi4c1gCllizdVcBmVjNg2IBm1jViWUBnVjWiGYBn1jViWYBoVjMgWEBoljMg2IBpFi3dlgBplikZUwBqFiuclYBqli2fmIBrVi5iHQCr1jt3dEBsVh4TUICslh7RS8CtFhyPC0Ctli+kH4C7FgPjPAAJFkPjPAATFncuaoCTVmnVT8BT1nhlXYBUVmpUzkCU1nAa1ACVVnrqIUCV1njn3YBWVnMp5UBW1npwKsBXlnor5MBX1nutZMBYVnrqYYBY1nzs40BZVn1s5ABZ1ntq4oBaVn6u5kBa1n4vJ4BbVn9v6IBbln0vaABcVn4u50Bc1n3wKMBdVn2uJoBd1n5vJsBeVn0sZABe1nyqocBfVnoooUBf1n+waUBgFn+ya4Bgln9w6ABhVntnXYCh1npmHECiVnvlGgCi1nhiWQBjVnkkWwBj1nIfl4BkFm8eV0BklnAeVkBlFnNg2UBllmsbVEBmVnFfFwBm1nMfl4BnVnUh2UBn1nQhGABoVnJgF8BolnGf2EBpFm8elsBplmrbFIBqFmwd14Bqlm2gGUBrVnKnIcCr1ns1MkBsVmUaVcCslmLXEkCtFlkLhwCtlnXvbQC3lkPjPAAIFsPjPAATVu7ZkwCT1vop4kBUVumUDgCU1vEclgCVVvYf2ICV1valHACWVvOq5gBW1vatZ4BXlvstJYBX1vmrYkBYVvvrosBY1vxsowBZVv0rokBZ1v3tZEBaVv1uJUBa1v5u5sBbVv5s5IBblvxro8BcVv3tZUBc1v5vZ8BdVv4tJUBd1v2t5UBeVv0sY4Be1vwrowBfVvuq4sBf1v3qoQBgFv3qIMBglvqmHIChVvEdlQCh1vekmsBiVvfj2kBi1vZimcBjVvTiWYBj1u9fV4BkFurb1MCklvFgV4BlFvMhWYBllutcVQBmVu/eFoBm1vJfV4BnVvUimgBn1vMgl4BoVvBe1wBolu2c1YBpFu7eFoBplu2d1wBqFujalMBqlurdFwBrVu4j3wBr1vfwrYBsVu3hnICsltnOCkCtFuBRzIC4FsPjPAAJFwPjPAAJlwPjPAANFwPjPAAPVwPjPAATVzelncCT1zVjHMCUVy1ZEcCU1yoXEICVVzMfWICV1zfl3kBWVzasZkBW1zRqpUBXlzlrpMBX1zoro8BYVzoqYcBY1zsr4oBZVzsqIEBZ1zspn8BaVzwqIQBa1zxq4kBbVz0so8Bblz9v5wBcVz5uJkBc1z3t5QBdVzvp4YBd1zyrYwBeVzsqogBe1z3u5sBfVzhmXQBf1zrmnEBgFzbiGICglyqbVIChVwfDQwCh1yVYksCiVzPg2MBi1zEfFwCjVzRjmoBj1xOMScCkFwsDQYCklx1PykClFy8f2ICllyZY0sBmVy2dVUBm1zCfFsBnVzHfl4Bn1zEfFwBoVzIgWABolzAfV4BpFyzcVUBplyrb1MBqFypcFgBqlyye2gBrVzMqJgCr1zTvrECsVyRY1ACslxvQzABtFzNmoUCPV4PjPAASF4PjPAATV7YtaMCT16sYEYCUV7TimwCU17/yqoCVV7Ke1sCV16cWj0BWV7WpIkCW17OpZABXl7grJMCX17mr5EBYV7prYwBY17hp4QBZV7opHwBZ17gmnMBaV7on3oBa17wp4EBbV72sIgBbl7xrYkBcV7vo38Bc170r4wBdV7tpIQBd17vqYkBeV70so8Ce175xqoBfV70spkCf162bFACgF6YVj8Cgl5MJBoBhV5QJhgCh157TT0CiV6qbFUCi16paVEBjV6TXUYCj15uRzcCkF6LWkUBkl5sQTABlF58STYCll6bY08CmV66eVkBm169d1gBnV7BfF0Bn17Ae1wBoV69elsBol60clYBpF60dVoBpl6ob1UBqF63gGgBql6odGACrV7Xs6ICr17Zw7YCsV6EVkQCsl6GWkgCtF6laU4C0F4PjPAAGF8PjPAAT1/on4ACUV+ua1IBU1/fnHgCVV/wo3kCV1/pnHYBWV/hqYoBW1/FpJABXl/InIMBX1/cpYkBYV/foIMBY1/mro8CZV/knXkBZ1/hl3QBaV/hlXIBa1/lmnMBbV/toXkBbl/hkm0BcV/gkG8Bc1/nnHoBdV/to4IBd1/upoMBeV/9xqgBe1/5xKQBfV/9yKkBf1/tspkCgF+KUD8Cgl9oNiYChV+wc14Bh1+aYUwCiV+PWEIBi1+UXUUBjV+DV0YBj194UUECkF9gNyYBkl9yRzYClF+WXEoBll+gYkoBmV+6dVcBm1+4dFMBnV+6dVYBn1+4dFUBoV+wb1EBol+xclYBpF+kalABpl+gaE8BqF+2g20Bql/GmYMBrV/Vs6ECr1/KraICsV+ga1UCsl+eZVIBtF+8gGYCvF8PjPAACGAPjPAARWAPjPAATWAPjPAAT2D+2cUBUWDkooACU2DhmnoCVWDkqIQCV2Ddk3ICWWDZkmwCW2DJoYkBXmDbq5MBX2DhrI8BYWDcnX8CY2Deo4YBZWDWk20BZ2DlnnsBaWDqn3gBa2DroHoBbWDYi2kBbmDajGoBcWDYi2kBc2DnnnsBdWDnon0Bd2D6vJ0CeWD7xaUBe2D+w6UBfWD6v6ABf2D2uZwBgGDsqY8BgmDPjHkChWCZaFUBh2CaZVABiWCka1IBi2CXYEwBjWBlPy8Cj2BILyIBkGBVOCwBkmBcOiwClGCGVUEBlmCZYkoBmWCvb1QBm2C3d1gBnWC4d1cBn2C2dVUBoWCpa08BomCpbVIBpGCla08BpmCka1MBqGC1gWsBqmC1h3EBrWDOpZcBr2C/n5ECsWCqaE0BsmC4c1UCtGDYu6oCuGAPjPAAwWAPjPAAyGAPjPAACGIPjPAAMWIPjPAAT2Lo0cUBUWLxr4wCU2LtqoUBVWLgpYkBV2L1tY4BWWLKdEwCW2LQp5ACXmLWqJABX2LktJsBYWLlrI4BY2Lan30BZWLalnIBZ2LblXABaWLbj2gBa2LdkGoBbWLUhmICbmLQg2IBcWLajm4Bc2Lpnn4BdWLtqocBd2L4upgBeWL9u5wBe2L3uJgBfWLyt5gBf2LspYcCgGLJjHMCgmKhcV4ChWJhQDIBh2J7UUECiWKJU0IBi2KYX0sBjWJpRTQCj2JCKSEBkGJALCEBkmI9JRoBlGJnRTkClmJySzoCmWKcY0sBm2KfZUwCnWKzc1cBn2Kvc1QBoWKqbFABomKUX0kBpGKZZlABpmKibVUBqGKyf2cBqmK4jHcBrWLZt6cCr2LCsasCsWK0k4UCHWQPjPAASGQPjPAAUWTkooEBU2TvoXsCVWTnjmUCV2TQeVMCWWSAVEQCW2SxiXgCXmTInoUBX2TftJkBYWTIk3wBY2TXmHcBZWTLjW8BZ2TZmXgBaWTNhWIBa2TNhGEBbWTIflsBbmTOhGEBcWTXim4Cc2TbkHMBdWTcknUBd2TVknMCeWTRk3YCe2TQkncCfWS7gGcCf2SibFcCgGSSZ1cCgmR2VEcBhWRsRTkBh2RsQDICiWSCU0ABi2SQW0kCjWSSXE0Cj2RZOCoCkGRHLCEBkmQ9Jx8BlGQ7JBsBlmRCLCQBmWQyHhcBm2RUOS0CnWRqRjcCn2R9U0ACoWSmbVIBomSdaE0BpGSRX0oBpmSbZk8BqGSxfmYBqmS+kn0BrWTWtqkB8GQPjPAASGUPjPAAT2UPjPAAU2XNurYCVWXFsKwCWWWDfX8CW2ViUUcCXmXOp5IBX2XespkBYWXYpYoBY2XXn4QBZWXOknMBZ2XQkGwBaWXMimgBa2XQh2QBbWXAeFkBbmXWjGkBcWXMfl8Bc2XTknMCdWWxdV0Cd2WLXVECeWWGXUsCe2WWalYCfWV8U0QCf2WCWkoBgGWMY1IBgmWDWksChWW7f2sCh2XbkHUBiWXQf2QBi2XSh2wCjWXKg2YBj2WsaVcBkGWSW0sCkmV0SjsClGVTMSYClmVoQzUCmWVKMSUCm2U+KiABnWVIMSgBn2VeQDMCoWWHWkEComWlbFEBpGWga1IBpmWpc1kBqGW4h3IBqmXBmIIBrWXZv7IBxGUPjPAAW2eRjYwCXmfhvaoBX2fetZ4BYWfQookBY2fXpYsBZWe7h2gBZ2fJiWkBaWfNjW4Ba2fUimUBbWfTiGQBbmfdk20BcWepak4Cc2ebZ1ICdWdkQjUCd2dcQDUBeWdlRDoBe2doRDUBfWeHW0oCf2eiaFgCgGejaFgCgmeTW0gBhWeYXE4Bh2eZXVABiWegXU4Bi2eqZFEBjWeYWkwBj2eQW04BkGeOWkwBkmeGVkYBlGeBVkcBlmeRYlIBmWd6UkIBm2doSDsBnWdLMykBn2dFMSQCoWeBVT8ComenclgBpGemcFcBpme3gmgCqGe7kXgBqmfHn4gBrWfSu68BGGgPjPAAJGgPjPAAW2ikoaICXmjmxK8BX2jSqJABYWjbrJUBY2jKmX4BZWjAi24BZ2jJjnEBaWjJjXABa2jRjW0BbWjYjGYBbmjUimUBcWiGVTwCc2h0SzoCdWhILycBd2hPNCYBeWhsRjUCe2iUZFACfWibZFECf2iJVUgCgGiIWkwBgmiXZFUBhWiPWUwBh2icX1IBiWiYXE8Bi2ihY1UBjWiKU0YBj2iMWlEBkGiKXE4CkmiFWksBlGh3UUQBlmh1TkEBmWgfDQgBm2hLMicBnWhKLiQBn2hOMicCoWiIXUoBomirc1kBpGiodV0BpmixgGkBqGi6j3cBqmjCnYUBrWjHu7YBymgPjPAA7GgPjPAA+WgPjPAAW2p8fHsCXmrgx7gCX2rVrZYBYWrSo4sBY2rSoYYBZWrJkncBZ2rHkXIBaWq/iWsBa2rEh2YBbWrSjmgBbmrSjGYBcWqNV0MCc2pySTcCdWpRMicBd2pGKh8BeWo4HBYBe2okCQUBfWppPzQCf2p0QzsBgGqDUEgCgmqPWVAChWp/RD0Ch2qMT0QCiWqNUUUBi2pxPDEBjWpwPTcCj2pvNS4CkGqDSUMCkmqHU0wClGp+VUkBlmpwSDwBmWpwTT0Cm2pnQC8BnWpqQzIBn2p1TDsCoWqYZkwBomqzfWQCpGq6iG8Bpmq3iHEBqGrDmYMBqmq9loECKGsPjPAAL2sPjPAAOmsPjPAAXmuSe3ACX2vdspkBYWvOn4YBY2vRn4MBZWvGkXYBZ2u+iG0BaWvBiG0Ba2vKkHEBbWvQj20BbmvOjGgBcWuqbFACc2uFVkIBdWt3TT0Cd2t1SjgCeWuHVUQCe2usa1kCfWucZFkCf2umaWUBgGu3cGMCgmvPjYQChWvhnJQCh2vjlooBiWvWiX0Ci2vYi38CjWvVfnIBj2u/cGMBkGuoZloBkmuXYlkBlGt8UUQBlmuMXEoCmWuVY0kBm2uSX0kBnWuMWEMBn2uQXEYBoWufaU8Bomu4h28BpGu0hW0Bpmuwg2wBqGu1jXoBqmu+l4UC2GsPjPAA92sPjPAAV2wPjPAAXmxnXlsBX2zpyLUCYWzUqpECY2zDj3cCZWzAjHIBZ2y1fmUBaWzAhWoBa2y+iGkBbWzIjXABbmzNjm4BcWy9elgBc2yfZEoCdWymbFICd2y8fWIBeWzCf2MCe2zTi2gBfWzSg2YBf2zYinUBgGy9d2wCgmyfXVMBhWy5bmEBh2y5aVsBiWy3Z1kBi2zBbGEBjWzCcGIBj2yxaV0BkGyiY1cBkmyQV0gBlGypc10ClmytdVsBmWytcVYBm2yobVQBnWycY0gBn2ybY0gBoWyhblYComy6jHUBpGywgWoBpmysf2oBqGyvgm0BqmzBnowCK24PjPAAX26/qJ0CYW7RqpMCY269i3UBZW65hmwBZ261fWQBaW62fWEBa269h2sBbW6+hmwBbm7Bh2oBcW63d1cBc26xc1cBdW67e14Bd27JhGQBeW7bknABe27hmngBfW7XjWoBf27UimoBgG7ajW4Bgm7RhHAChW6vZVoBh26jW1ABiW6iW1EBi26xalwBjW65bF0Bj26mYVABkG6walcCkm62emMBlG6pcVcBlm6sc1cBmW66fmEBm26YX0gBnW6kbVMBn26gbVMBoW6ygWsCom7DlYABpG6tfWYBpm6neWQBqG6qgG8Cqm7Qu68CrW4PjPAA3G4PjPAALW8PjPAAX2+cmZwCYW/YuKYBY2+5jXkBZW+0gWsBZ2+6gmgBaW+vemABa2+pclkCbW+wd14Bbm+6gGQBcW+7fmECc2+yclQBdW/Be14Bd2/Hfl4BeW/VimgBe2/Sg2QBfW/Id1oBf2/DgGEBgG+1eFsBgm+tcFYChW+jaFQCh2+SWUYCiW+PWEgCi2+QXE4CjW+MXEoCj2+YYE8CkG+JXkYCkm+RX0YBlG+uc1oBlm+8f2MBmW+sb1UBm2+pb1cBnW+nblIBn2+pdl0BoW++jngBom/BkXsBpG+jdV0Bpm+jeWcBqG+vh3UCtm8PjPAA1m8PjPAAOHEPjPAAWXEPjPAAYXHWwbcBY3HLppMCZXG5iHMBZ3G8hm4BaXGhb1cBa3GmcVoBbXGtd14BbnGxd1sBcXG9g2gBc3HFhWcBdXHFfl8Bd3HKgmEBeXHRh2UBe3HMgmEBfXHHdloBf3HIfl0BgHHAdF0CgnGgXEkBhXF6STcBh3FuRDQBiXFwSDsCi3FrSDgCjXF3SzsCj3GEWEUBkHGkZ1IBknG0dFgBlHGwcFUBlnGsbFEBmXGlaE8Bm3Gwc1cBnXGqb1MBn3GpemQCoXG/j3kBonG6inQCpHGhdWABpnGlgG0CvHEPjPAABnMPjPAAJnMPjPAARXMPjPAATHMPjPAAY3PfuaYBZXOti3cCZ3O3jHgBaXOhcl4Ba3OjcVsBbXO2f2YBbnOzemABcXPEi28Bc3PHiWsBdXPMi2kBd3PSjGsBeXPPg2QBe3PDdl0BfXPLfmQBf3PHfl0BgHO6dFgBgnOuaVEBhXOPVEABh3OIUEECiXN2QjcBi3NjOzEBjXNqQDMBj3OHVUMBkHOUWkYBknOmZU4BlHOlY0sBlnOubFQBmXOkaE4Bm3OhaE4BnXOkblYCn3PLoYoBoXPBk3wBonOyincBpHPDnIgBunMPjPAA9HMPjPAA93MPjPAAY3Tgtp4CZXTCnIsBZ3Slg3EBaXSZcF0Ba3SabFgBbXS0gmsBbnSnclgBcXS0emABc3TDiGsBdXTHi2oBd3TMiWgBeXTHgGACe3TCb1MBfXTdi20Bf3TXim0BgHTZknUCgnTaknUChXTTk3sBh3TMhW4CiXS5cl8Ci3SraVYBjXSrZlMBj3SmZ1EBkHSxblYBknSzbVQBlHSqZk0BlnSubFMBmXSma1ABm3SZYUcBnXS1hG4Cn3TDmYMBoXS2i3YBonSwjHkBpHTBnYkCunQPjPAA1nQPjPAA3HQPjPAAOHYPjPAAY3bqwakCZXbGlHgCZ3akfWkBaXaHZFcBa3aZcV8BbXakd2ACbnagcloBcXaseGABc3a4gmcBdXbMk3cBd3bNiWwBeXbKhGQBe3bRhWMBfXbajWkBf3bZjm8BgHbfl3cBgnbpo4QBhXbZlXwBh3bKgmoBiXa4cFgBi3awb1sBjXasa1cBj3apaFIBkHaxb1YBkna1cVcBlHa1clgBlnagYkgBmXalbVIBm3apdVwCnXbJoYwBn3a+mIQBoXa0kYABonasiXcBpHbBmIECwXYPjPAA5HYPjPAAOHcPjPAAQXcPjPAAQ3cPjPAAY3fsxrEBZXfNmH0CZ3e3gWUCaXeTaVcCa3d7V0kBbXd9W04CbneTbFkBcXeXaVMBc3eicVoCdXe1hWsCd3fBiGoBeXfIiGUBe3fJhWQBfXfViWkBf3fjmXcBgHfUh2cCgnfhnXsBhXfFe2MBh3e6c1kBiXe6clgBi3e+fGEBjXexb1MBj3esalMBkHeubFQBknesalABlHemaE8BlnecY0sBmXebaVABm3e7j3UBnXe3lH8Bn3esh3QBoXebeGUBonepfWcBpHfNoooCr3cPjPAAxncPjPAAyncPjPAA3HcPjPAA3ncPjPAA8ncPjPAAFHgPjPAAG3gPjPAAOngPjPAAPXgPjPAAYXgPjPAAY3jszbcBZXjRmnsBZ3jGimsBaXiocVcCa3iLXUoBbXh0UUMBbnhhQjcBcXiRaFcBc3iUaVYBdXiMYE0Bd3iYa1kBeXiye2EBe3jLimoBfXi/eVcBf3jDfGABgHi7dFgBgni4d1sChXitZ08Ch3iraU8BiXi/el4Bi3ivblUBjXira1IBj3iqalIBkHifZE4BknifaVIBlHiPXEQBlniMXEYBmXijd2ECm3iviHMBnXiqh3YBn3iJZVECoXiNY08Bonidb1gCpHjNpI8CxHgPjPAAzngPjPAA8HgPjPAAFnoPjPAAL3oPjPAAOnoPjPAAY3riw7UCZXrZnX0CZ3rJiWgBaXq3d1wBa3qqb1UBbXqVY0sCbnp3UT8BcXpkRDgBc3p+W04CdXp1UUQCd3p6V0kCeXqablgCe3qlclkBfXqqcVgBf3qpblUBgHqobVQCgnqfZFABhXqeZkoBh3qfZlIBiXqeY0wBi3qYXksBjXqOXUcBj3qRXkcBkHqFWkcBknptRTUBlHqCV0QBlnp0TzwBmXqZdGMBm3qWdWYCnXp0U0QCn3qHWkYBoXqSX0cBonqjcVoBpHrMo44C7noPjPAAGnsPjPAAJnsPjPAAX3uwtMICYXsxNEgCY3vDp50CZXvfooQCZ3vQi2kBaXvKimgBa3uzdVYCbXunbE8CbnuRXEYCcXtsRTUBc3taOi8BdXtUODABd3tiST0BeXttTkIBe3t7VkUCfXuEWUcCf3t2UUABgHt9VUIBgnt/V0QBhXuHWkkBh3uFWUkBiXuIXEgBi3tySjcBjXuHXksBj3t5U0MBkHtvTj4CknthRTcBlHtgRDYClntzVEUCmXtyWEsCm3thRjkBnXuEXEkCn3uSW0QBoXuaZkwBonucalMBpHvVr50CWX0PjPAAX31JTWYCYX0nJTYCY33/9e4CZX3ao4MCZ33SkG0BaX3NhmUBa33Lh2YBbX3CgGABbn2tblEBcX2HVUIBc31uSTkCdX1QMygBd31JMykBeX1ONS4Be31bQzYCfX1aQzcCf31UNy4BgH1kRjsBgn1fRDgBhX1fQDUBh31sSD0CiX1cQDUCi31eQTcCjX1WOS8Cj31ROC4BkH1HMysBkn1BMCkBlH1INy8Bln1JNi0CmX10UkECm32BVkEBnX2QYEgBn32XYUYBoX2SXkQBon2jcFoBpH3Ys6ICpn3h2dgCqH1oaHYCEn4PjPAAKH4PjPAAXn5fZIICX347QFMCYX57e4kCY3779vMCZX7ZooIBZ37SjmwBaX7NiGgBa37Cf10BbX7FgV8Bbn68eloBcX6rbVACc36TYEcCdX6BVT8Cd35rRjUCeX5WOS8Ce35ELScBfX4yIB0Bf347KyMBgH5BLCMBgn5ALiQBhX5GMCQBh35CLSQCiX4+KB8Bi34+LCYBjX4rGxcBj345KCEBkH4yIRsBkn43JRsClH5aPzECln5qSDoBmX6JXUUBm36VYEcBnX6WYEYBn36aZEoBoX6TX0UBon6hb1gCpH7ZtqIBpn68n5QCqH5UVmICqn5paHQCr34PjPAAzH4PjPAA0H4PjPAA3n4PjPAAFoAPjPAAVYAPjPAAW4C9wc4CXoBOVG0BX4A6PVIBYYDQ0dgCY4D+/fwCZYDZooYCZ4DYlXIBaYDQimcBa4DOiWYBbYDIgl8BboDKhWMBcYDLhmMBc4CzclMCdYCpb1UCd4CSXUYCeYCBUDsCe4BxSDUCfYBkQDACf4BUNCkCgIBBKB8BgoA+Jh0BhYBLLyQBh4A+KR4BiYA8JxwBi4BCKSACjYBBKSECj4BKMCYCkIBUNigBkoBiPi0BlIBzSzkBloCAVEEBmYCZZEgBm4CYYEcBnYCZY0kBn4CVX0UBoYCVYUcBooChb1gBpIDXsJ0BpoCHZlgCqID48/ICqoAQER8C1oAPjPAABoIPjPAACIIPjPAAK4IPjPAAWYKZnq8CW4JYYYMBXoJGS2MBX4I0NkwCYYL///8CY4L///4BZYLeqpMCZ4LYlHABaYLakWgBa4LakGkBbYLUjGUBboLNh2MBcYLLhmIBc4LLhmEBdYLMiGQBd4K9fl4CeYKtcFQBe4Kkak4CfYKRXkkCf4KFVkEBgIJ1TDgCgoJnQC8BhYJgPioBh4JfOikBiYJfOyoBi4JjPjABjYJpQzEBj4J1STkBkIJ5TTsBkoKEV0EBlIKPX0cBloKTYUYBmYKbZUoBm4KcZUoBnYKYYEYBn4KcZEkBoYKaZEoBooKhbVUBpIK/lIECpoJAKiMCqILSvLQCqoKTlZwCrYIsMEAC8oIPjPAA9IIPjPAABoMPjPAAKIMPjPAAL4MPjPAAV4O1usgCWYNZYYIBW4NUXnsBXoNARV0BX4M0NkwCYYP///8CY4P+//8BZYPOoZICZ4PblG4BaYPakWoBa4PflW4BbYPZkGgBboPQi2QBcYPSi2UBc4PRimMBdYPWjmYBd4PKhF0BeYPHgmABe4O/eloCfYOlaU4Bf4OeYkoBgIOPWEEBgoN/TjoBhYN1RzMBh4NyRTMBiYNxRDEBi4NrQjABjYN0STQBj4OBUTwCkIOQX0kBkoONW0IBlIOfak4BloOkbE4BmYOeZkkBm4OfZ0oBnYOgaUwBn4OeZ0kBoYOaZUcBooOhb1MBpIOZa1oCpoMjFhICqIPBpJoCqoP///8CrYMjJDEBr4NMT2MCVYStscACV4RXYYMCWYRcYn4BW4RMUWsBXoQ4PVMBX4Q2OU8CYYT///8CY4T+//8BZYTVwboCZ4TimXICaYTelW4Ba4TckmsBbYTbkmkBboTckmsBcYTXjGUBc4TYjmcBdYTWjGUBd4TVjWgBeYTQi2QBe4TMiGQBfYTJh2QBf4Sxc1UCgISbX0UBgoSPWD8BhYSIVD4Bh4R8TDgBiYSCUj4Bi4SBUzsBjYSGVT8Bj4SPWUEBkISTXUQBkoSfaEwBlISiaEoBloSobE4BmYSlakwBm4SobU8BnYSiZ0kBn4SjaEoBoYSfZ0wBooScaU8BpISAU0ECpoQgExICqIS5mo4CqoT18fICrYQcHioCr4QzN0QCsYSVmqkC1oQPjPAAFIYPjPAAU4aana0CVYZRW3sCV4ZQV3YBWYZLUm4BW4ZHTGYBXoY9QlgBX4Y7PlQCYYb///8CY4b+/v4BZYb9+/kCZ4aoaE4CaYbSiGMBa4bakGkBbYbflW0BbobakGkBcYbflW4Bc4bTiWIBdYbTiWMBd4bVimYBeYbVjmcBe4bPiGIBfYbLhmIBf4a/fVsBgIaycVUBgoakaEwChYaMUzkBh4aGUjoBiYaJVT0Bi4aMWkABjYaXYEgBj4adZUsBkIaeZksBkoahaU0BlIaka00BloakaEsBmYakaUsBm4anbE4BnYajaEoBn4ala00BoYafZ0wBooaQXkMBpIZvRTQCpoYfFRUCqIati4ICqobl4N0CrYYeHSgCr4YpKjYBsYZHTWYCsoakqLkC2oYPjPAA+YYPjPAAOIcPjPAAT4ext8ICUYd0fZICU4dOV3gBVYdUW3kBV4dNVnQBWYdLUmwBW4dFTGYBXoc8QVgBX4c9QVcCYYf///8CY4f///8BZYf///8CZ4dySDcCaYfWi2QCa4fXjWYBbYfelWsBboflnXMBcYfWjGQBc4fXjGQBdYfaj2gBd4fXjGYBeYfXjGUBe4fPhmABfYfPiWUBf4fJh2EBgIe8eVcBgoeycFEBhYelY0gBh4ehYUcBiYegYkoBi4eeY0kBjYegZUoBj4efY0kBkIefY0gBkoedY0gBlIekaUwBloenakwBmYerbU4Bm4ena00BnYeiZ0oBn4egZ0kBoYeYYUQBooeGVz8BpIdYNCYCpoccEA0CqIerjIcCqofg2NUCrYdMSlACr4cjIy4BsYcvMkACsodfZ4ICtIeFi6ACyIcPjPAA3IcPjPAA7IcPjPAAGokPjPAASomqrbsCTIljaoMCTYlGTm8CT4lmcJMBUYlfaIcBU4lUXXgBVYlNVnMBV4lIUW4BWYlGTWcBW4lIT2kBXok/RVwBX4k5PVICYYn///8CY4n+/v4BZYn8//4BZ4m7qJ4CaYmoaUoCa4nVi2IBbYnajmIBbonbkWYBcYnbkGgBc4nYjWUBdYnSh18Bd4nTiGEBeYnSh2ABe4nNg14BfYnLhWEBf4nJhGABgInLhWQBgonCelcBhYm5b1ABh4mvbk0BiYmrbE0Bi4meYkgBjYmdYUcBj4mgZEoBkImfY0kBkomiZksBlImnakwBlomrbEwBmYmub1ABm4mpbE4BnYmfZEgBn4maYkQBoYmOWj8Bool4SzUBpIlQLR8CpokYCwcCqIm5npgCqonk3dwCrYmDgYcCr4khISsBsYkrLDoBsolPVWsCtIldZoQBtoleZYECMYoPjPAARYqcoLQCSIpYYYMCSopWXHkBTIpYXnsCTYpnb4sBT4pTW3gBUYpQWHUBU4pTXHkBVYpPWHUBV4pNVXIBWYpJUGoBW4pIT2kBXopBR14BX4o3PFECYYr///8CY4r9/f4BZYr//f4BZ4r99/cCaYptOyoBa4rGe1YCbYrQglgBborbj2UBcYrfk2sBc4rbkGcBdYrXjGQBd4rbkGkBeYrJflcBe4rOhl8BfYrGgFsBf4rIgF0BgIq/eVcBgoq9eFUBhYq8dlcBh4qzb1ABiYqnaEwBi4qkZ00BjYqfYkgBj4qkaE0BkIqkaE0BkoqlZ0oBlIqtbk4BloqzclIBmYqucFEBm4qjZkkBnYqdYkUBn4qVXUEBoYqJVDwBoopyRjEBpIpRLSACpooaCgUCqIq9paACqork4d4BrYq2s7kCr4odHSgBsYomJzQBsopCRlkCtIpSWXQBtopZX3kBuIpRVnICuop2e4wCPYwPjPAAQYx/haMCQ4xbYoACRYxSV3QBSIxHTmEBSow+RVoBTIxgZ4IBTYxUW3cBT4xLUm8BUYxQV3QBU4xZYH0BVYxSWXcBV4xKUW0BWYxLUmwBW4xGTWcBXow/RVwBX4w0OE0CYYz5+PwCY4z9/f8BZYz9//8BZ4z+/v4BaYx+XlECa4yXWTwCbYzJgFgCbozXi2MBcYzZjmQBc4zckWcBdYzaj2UBd4zSh18BeYzXjGUBe4zVi2QBfYzJglwBf4zIf1wBgIzBfFoBgoy8eFUBhYy1cFIBh4yta0oBiYykaEoBi4ylZkkBjYylZUkBj4yoa04BkIyra00Bkoywb08BlIyycVEBloytbEwBmYyqbE0Bm4ynak0BnYydYkYBn4ySWT8BoYyEUDoBooxqPSoBpIxOKx0BpowqFg8CqIzAqaUCqozm4OEBrYzj4eUCr4weHioBsYwmKDMBsow2Ok0BtIxHTGYBtoxUWnQBuIxPVG0BuoxLT2gBvIxLUGkCvoyChpkC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tLgnLD8BtrglKj0BuLghJjkBurglKj4BvLgkKT0BvrgkKT0BwbgmKz8Bw7gnLEABxLgnLEABxrgpLkIByLgqL0MByrgpLkIBzLgpLkIBzrgoLUEB0LgpLkIB0rgSFSEB1LgdIjMB1rgkKT0B2LgmKz8B2rgjKDwB3LglKj4B3rglKj4B4LgnLEAB4rgnLEAB5LglKj4B5rglKj4B6LgiJTgB6rghJDYB7LghJDUB7rgiJTYB8LggJTgB8rggJTgB9LggIzQB9rghJDUB97giJTYB+bggIzQB/LgfIjEBArozN1ABBLoyNk8BBrouMkkBCLooLUEBCboWGSkBC7ovNUwBDrouMksBELosMEkBErowNUwBFLowNUwBFrowNUsBGLosMUgBGropLkIBG7oqL0QBHbosMUUBILopLkIBIropLkQBJLouM0gBJroxN00BKLovNUsBKrouNEoBK7oxN08BLbowNk0BL7oxN08BMbo1O1MBNLozOVEBNro1O1MBOLo0OlABOrovNUwBPLovM0kBPbovNEoBP7osMUgBQbotMkYBQ7ohJjkBRboyN00CSLo0OU8BSrosMUcBTLouM0kBTboxNkwBT7owNUsBUboxNkwBU7owNUsBVbovNEoBV7ovNEoBWbowNUsBW7ozOE4BXroyN00BX7oyN00BYbo0OU0BY7oxNkoBZbotMkYBZ7osMUMBabqloqsCa7rY1NoBbbrm4+cBbrrx7/QBcbr18/YBc7r29PcBdbr39fgBd7r39fgBebr18/YBe7r08vcBfbr18/gBf7rz8/UBgLr7+/0Bgrr9/fwBhbr6+f0Bh7r7+/4Bibr9/f0Bi7r+//8BjbqkfHQCj7r///8BkLrk4uUCkrrj4eMBlLrj4eMBlrrY0tYBmbrZ1NgBm7rY09YBnbrc2NsBn7rj4eUBobrn5ekBorro5usBpLrp5+wBprrt6/ABqLrr6e4Bqrro5eoBrbrt6/ACr7omLEQCsbooLkEBsrooLUEBtLomKz4BtrooLUABuLomKz4BurolKj4BvLomKz8BvronLEABwbokKT0Bw7onLEABxLooLUEBxrooLUEByLooLUEByrooLUEBzLopLkIBzromLUAB0LopLUAB0roRFSAB1LohJTcB1rojKD0B2LolKj4B2rolKj4B3LolKj4B3rokKT0B4LopLkIB4romKz8B5LolKj4B5roiJzsB6LogIzQB6roeITIB7LogIzQB7roeITIB8LodITIB8rogJDUB9LohJDUB9rogIzQB97ogIzQB+bogIzQB/LogIzIBArszN1ABBLssMEkBBrsoLUQBCLsmKz8BCbsVGSgBC7srMEcBDrstMUoBELsxNU4BErszOE4BFLsvNEoBFrssMUcBGLsmK0EBGrsnLEEBG7srMEQBHbsrMEQBILsrMEQBIrsrMEYBJLsxNkwBJrswNkwBKLsxN00BKrsuNEsBK7svNU0BLbsyOFABL7sxN08BMbsxN08BNLs1O1MBNrs1O1MBOLsyOE4BOrssMkgBPLsvNEoBPbszOE4BP7swNUsBQbsnLEABQ7snKz4BRbskKj8CSLsxNkwBSrsuM0kBTLsuM0kBTbsxNkwBT7swNUsBUbsxNkwBU7swNUsBVbsuM0kBV7suM0kBWbsxNkwBW7svNEoBXrswNUsBX7syN00BYbs1Ok4BY7suM0cBZbssMUUBZ7srMUMBabt9e4UCa7vV0NYBbbvi3uMBbrvu7PEBcbv29PcBc7v29PcBdbv18/YBd7v29PcBebv18/YBe7v08vcBfbv29PkBf7v09PYBgLv6+vwBgrv8/PwBhbv4+PcBh7v5+fgBibv9/f4Bi7v9/PsBjbv8//8Cj7vm5OgCkLvl4+YBkrvl4+YBlLvl4+YBlrvZ09cBmbva1dkBm7vc1toBnbvl4eQBn7vq6ewBobvs6u8Borvr6e4BpLvs6u8Bprvu7PEBqLvt6/ABqrvp5+wBrbvt7PACr7skK0QCsbspLkIBsrsmKz8BtLskKT0BtrsmKz4BuLslKj0BursnLEABvLsoLUEBvrsnLEABwbspLkIBw7soLUEBxLsmKz8BxrsmKz8ByLsmKz8ByrsnLEABzLspLkIBzrsqMUQB0LsmKjwC0rsRFSAB1LsiJTcB1rslKj8B2LsnLEAB2rsoLUEB3LsnLEAB3rsoLUEB4LsoLUEB4rsmKz8B5LskKT0B5rshJjoB6LsiJTYB6rsdIDEB7LseITIB7rsdIDEB8LsdIDEB8rsfIjMB9LsfIjMB9rsgIzQB97sgIzQB+bsfIjMB/LseITABAr0xNU4BBL0qL0QBBr0pLkEBCL0kKT0BCb0eIjIBC70jJzoCDr0tMkcBEL0vNEoBEr0rMEYBFL0rMEYBFr0rMEMBGL0oLUEBGr0nLEABG70oLUEBHb0pLkMBIL0uM0kBIr0sMUcBJL0vNEoBJr0wNUsBKL0yN00BKr0wNUwBK70wNE0BLb0xNU4BL70yN00BMb0vNEoBNL0zOE4BNr00OU8BOL01OlABOr0wNUsBPL0uNEwBPb0tM0wBP70tMkgBQb0uM0kBQ70oLUIBRb0fJDgBSL00N1EBSr0zN1ABTL0uMkkBTb0vNEoBT70vNEoBUb0zOE4BU70yN00BVb0wNUsBV70uM0kBWb0uM0kBW70xNkwBXr0wNUkBX70wNUkBYb0zOEwBY70zOEwBZb0wNUoBZ70uMkYBab1CR1QCa73T0NQBbb3f2eIBbr3v7fIBcb329PYBc7339fgBdb339fgBd7329vgBeb329vgBe7319fcBfb309PYBf7329PcBgL36+PsBgr38+/sBhb359e8Bh73z8OkBib359PQBi739/v8Bjb3m5OQCj73k4eQBkL3n5egBkr3n5ekBlL3m5eoBlr3c190Bmb3i3eEBm73l4uUBnb3s6u0Bn73w7vEBob3u7PEBor3v7fIBpL3v7fIBpr3w7vMBqL3v7fIBqr3r6e4Brb3k4+0Cr70pLkYCsb0oLUEBsr0kKT0BtL0kKT0Btr0lKj4BuL0lKj4Bur0kKT0BvL0nLEABvr0nLEABwb0pLkIBw70oLUEBxL0pLkIBxr0oLUQByL0nLEIByr0pLkEBzL0qLkMBzr0nLUEB0L0WGyoB0r0WHCsB1L0jKDwB1r0mKz8B2L0lKj4B2r0pLkIB3L0pLkIB3r0nLEAB4L0lKj4B4r0kKTwB5L0kKTwB5r0jKDsB6L0jJjcB6r0fIjMB7L0eITIB7r0fIjMB8L0fIjMB8r0iJDUB9L0eIzcB9r0fJDcB970dIzQB+b0cIjIB/L0ZHSkBAr8tMUoBBL8sMUYBBr8pLkIBCL8lKj4BCb8hJTgBC78YHC0CDr8uM0kBEL8tMkgBEr8rMEYBFL8sMkgBFr8rMEQBGL8qL0MBGr8qL0MBG78nLEABHb8rMEYBIL8sMUcBIr8vNEoBJL8wNUsBJr8vNEoBKL8tMkgBKr8sMUcBK78tMkcBLb8xNkoBL78uM0kBMb8xN0wBNL8vNEoBNr8wNUsBOL8vNEoBOr8wNUsBPL8vNU0BPb8wNk4BP78wNUsBQb8tMkgBQ78pLkIBRb8kKT0BSL83O1QBSr8yNk8BTL8tMUgBTb8uM0kBT78wNUsBUb8sMUcBU78wNUsBVb8vNEoBV78xNkwBWb8uM0kBW78wNUsBXr8vNEgBX78wNUkBYb8vNEgBY78yN0sBZb8yN0wBZ78rMEMBab8rLj8Ca7/X1NkCbb/d2N8Bbr/u7PEBcb/29PYBc7/39fgBdb/39vgBd7/29vgBeb/09PYBe7/19fcBfb/19fcBf7/08vUBgL/7+fwBgr/+/f0Bhb/w7OYBh7/x7ucBib/z7+4Bi7/39/kBjb/k4uIBj7/m5OYBkL/o5ukBkr/p5+sBlL/o5+sBlr/g2+EBmb/m4eUBm7/s6ewBnb/z8fQBn7/x7/IBob/x7/UBor/x7/QBpL/w7vMBpr/x7/QBqL/x7/QBqr/q6O0Brb/c2+UCr78rL0cBsb8rMEQBsr8nLEABtL8kKT0Btr8mKz8BuL8kKT0Bur8iJzsBvL8mKz8Bvr8oLUEBwb8pLkIBw78rMEQBxL8qL0MBxr8qL0UByL8qL0UByr8qL0MBzL8pLkIBzr8nLkEB0L8RFiUB0r8aIC8B1L8lKj0B1r8lKj4B2L8pLkIB2r8pLkIB3L8oLUEB3r8oLUEB4L8lKj4B4r8hJjoB5L8hJjkB5r8hJjkB6L8fIjMB6r8fIjMB7L8gIzQB7r8fIjMB8L8eITIB8r8gIzQB9L8cIjUB9r8dIjUB978eJDQB+b8dIzMB/L8TFiIBAsAxNkwBBMAtMkgBBsAtMkYBCMAkKTwBCcAdIzUBC8AQEyEBDsAsMUcBEMAzOE4BEsAwNE0BFMAtMUoBFsAoLUIBGMArMEYBGsAnLEABG8AsMUUBHcApLkIBIMAqL0MBIsAvNEoBJMAuM0kBJsAsMUcBKMAtMkgBKsAsMUcBK8AuM0gBLcAwNU0BL8AwNE0BMcAyNk8BNMAyN00BNsAvNEoBOMAvNEoBOsAxNkwBPMAwNUwBPcAvNEoBP8AtMkgBQcAtMkgBQ8AqL0UBRcAlKj4BSMA0OU8BSsAwNUsBTMAuM0gBTcAtMkYBT8AsMUUBUcAvNEgBU8AuM0cBVcAuM0kBV8AuM0kBWcAwNUsBW8AyN00BXsAyN00BX8AtMkkBYcAwNUkBY8AwNUkBZcAwNUkBZ8AuM0cBacAiJjoCa8Da190CbcDe2t8BbsDt6/ABccD08/YBc8D09PYBdcD19fcBd8D29vgBecD19fcBe8D08vUBfcD19PYBf8D08vUBgMD6+PsBgsD9/fwBhcDy8vEBh8Du7ekBicDx7+wBi8Dt6+4BjcDn5egBj8Dp5+oBkMDp5+oBksDp5+sBlMDs6u8BlsDi3+QBmcDr6ewBm8Dz8fQBncD08vUBn8Dx7/IBocDz8fQBosDz8fQBpMDx7/UBpsDx7/QBqMDw7vMBqsDp5+wBrcDMzNkCr8AtM0oBscApLkIBssApLkIBtMAkKT0BtsAkKT0BuMAkKT0BusAkKT0BvMAmKz8BvsAoLUEBwcAnLEABw8AoLUEBxMAoLUEBxsAnLEAByMApLkIBysAqL0MBzMAqL0MBzsAlKTsB0MAQEx8B0sAYHTAB1MAkKT0B1sAjKDwB2MAmKz8B2sAnLEAB3MApLkIB3sAoLUEB4MAnLEAB4sAjKDwB5MAiJzoB5sAfJDcB6MAgIzQB6sAgIzQB7MAeITAB7sAeITAB8MAfIjMB8sAdIDEB9MAfIjMB9sAgIzUB98AfIjMB+cAeIjIB/MAPER8BAsEsMUcBBMEsMUcBBsEsMUUBCMEpLkEBCcEjKTsBC8ETFiQBDsExNksBEMErMEYBEsEtMUoBFMEyNk8BFsEvNEoBGMErMEYBGsErMEQBG8EoLUEBHcEoLUEBIMEpLkIBIsEsMUgBJMEtMkgBJsEwNUsBKMExNkwBKsEvNEkBK8EyN0wBLcEyNk8BL8EwNE0BMcE3OlQBNMExNkwBNsExNkwBOMEtMkgBOsEwNUsBPMExNkwBPcExNkwBP8EsMUcBQcEqL0UBQ8EsMUcBRcEmK0ABSMEoLUMBSsEyN00BTMExNkoBTcErMEQBT8EuM0cBUcEtMkYBU8EtMkYBVcEwNUsBV8EvNEoBWcEvNEoBW8EvNEoBXsEzOE4BX8ExNk0BYcE0OUwBY8EwNUkBZcEvNEgBZ8EqL0MBacEkKT0Ca8HW0tgCbcHg3OIBbsHt6/ABccHz8vUBc8H39/kBdcH39/kBd8H39/kBecH09PYBe8Hz8PQBfcHz8fQBf8Hz8fQBgMH18/YBgsH9/f0BhcH8/PwBh8H59voBicH8+v0Bi8Hr6ewBjcHq6OsBj8Hq6OsBkMHr6ewBksHs6u4BlMHt6/ABlsHm5OkBmcHw7vEBm8H29PcBncH18/YBn8Hx7/IBocH08vUBosH08vUBpMHy8PUBpsHy8PUBqMHw7vMBqsHr6e4BrcG5usgCr8EsM0kBscEoLUEBssEnLEABtMEkKT0BtsEjKDwBuMEkKT0BusElKj4BvMEmKz8BvsEmKz8BwcEnLEABw8EpLkIBxMEqL0MBxsEoLUEByMEoLUEBysEpLkIBzMEoLUEBzsElKTsB0METFiIB0sEcITUB1MEhJjoB1sEkKT0B2MEjKDwB2sElKj4B3MEmKz8B3sEmKz8B4MEjKDwB4sEjKDwB5MEiJzoB5sEeJDcB6MEeITIB6sEcHzAB7MEeITAB7sEdIC8B8MEfIjMB8sEhJDUB9MEhJDUB9sEhJDUB98EfIjMB+cEfIjMB/MESFCEBAsMqL0UBBMMoLUMBBsMoLUIBCMMpLkIBCcMhJzkBC8MaHS0BDsMrL0YBEMMtMkgBEsMtMUoBFMMwNE0BFsMtMkgBGMMuM0kBGsMqL0MBG8MnLEABHcMsMUUBIMMrMEQBIsMsMUYBJMMsMUYBJsMtMkgBKMMwNUsBKsMrMEYBK8MtMkcBLcMvM0sBL8MvNEsBMcMyN04BNMMxNkwBNsMxNkwBOMMwNUsBOsMtMkgBPMMvNEoBPcMuM0kBP8MtMkgBQcMsMUcBQ8MpLkQBRcMpLkIBSMMeIzgBSsM0OU8BTMMxNksBTcMvNEkBT8MtMkcBUcMuM0gBU8MsMUYBVcMvNEoBV8MwNUsBWcMyN00BW8MvNEoBXsMvNEkBX8M0OU4BYcMvNEgBY8MvNEgBZcMuM0cBZ8MrMEQBacMoLEABa8PEwskCbcPe2+ABbsPs6u8BccP08vYBc8P39vgBdcP49/kBd8P39/kBecPz8/UBe8Py8PMBfcPy8PMBf8Px7/IBgMPy8PMBgsP9/f4BhcP5+voBh8P59/kBicPx7/ABi8Ps6u0BjcPr6ewBj8Pt7O4BkMPu7e8BksPw7/IBlMPy8fQBlsPs6+8BmcP19PcBm8P59/oBncP08vUBn8Pw7vEBocP08vUBosP18/YBpMPz8fUBpsPy8PQBqMPw7vMBqsPp5+wBrcOio7MCr8MsMkcBscMoLUEBssMkKT0BtMMkKT0BtsMkKT0BuMMnLEABusMmKz8BvMMlKj4BvsMnLEABwcMlKj4Bw8MpLkIBxMMpLkIBxsMqL0MByMMoLUEB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m9T4+PoBndT4+PoBn9T39/kBodT18/YBotT08vUBpNT08vcBptTw7vMBqNTq5+0BqtTr6u4CrdQuM0cBr9QpLkIBsdQmKz8BstQnLEABtNQjKDwBttQkKT0BuNQjKDwButQnLEABvNQpLkIBvtQpLkIBwdQpLkIBw9QpLkIBxNQnLEABxtQmKz8ByNQRFCEBytQWGiYBzNQeITMBztQiJzsB0NQhJjoB0tQiJzsB1NQfJDgB1tQfJDcB2NQgJTkB2tQdITAB3NQZHCsB3tQcHy4B4NQdIC8B4tQbHi0B5NQXGikB5tQXGikB6NQZHCsB6tQbHi0B7NQbHi0B7tQcHy4B8NQXHiwB8tQYHiwB9NQXGigB9tQHChEB99QbHy0B+dQaHSwB/NQdIC8BAtYoLUEBBNYkKTwBBtYiJjkBCNYeIjUBCdYdIC8BC9YeITABDtYVGCcBENYSFiQBEtYMDBQBFNYREh4CFtYjKDwBGNYoLUEBGtYnLEABG9YmKz8BHdYmKz8BINYnLEABItYrMEQBJNYpLkMBJtYsMUUBKNYlKj4BKtYkKT0BK9YmKz8BLdYnLEABL9YnLEABMdYpLkIBNNYoLUEBNtYoLUEBONYoLUEBOtYoLUEBPNYpLkIBPdYpLkIBP9YoLUEBQdYpLkIBQ9YoLUEBRdYqL0MBSNYqL0MBStYlKj4BTNYkKT0BTdYlKj4BT9YgJDgBUdYjKDkCU9YuNEkBVdYrMEQBV9YrMEQBWdYtMkYBW9YpLkIBXtYtMkYBX9YtMkYBYdYwNUkBY9YrMEQBZdYrMEQBZ9YnLEABadYkKT0Ba9YpLkABbdYhJzgCbtbV0dYCcdbx7/IBc9bz8fQBddb18/YBd9bw7vEBedbv7fABe9bx7/QBfdby8PUBf9bx7/QBgNbz8fYBgtb39/kBhdb6+vwBh9b6+vwBidb6+vwBi9b6+vwBjdb7+/0Bj9b6+vwBkNb6+vwBktb6+vwBlNb39/kBltbz8/UBmdb39/kBm9b19PcBndb18/YBn9b08vUBodb18/YBotbz8fQBpNby8PUBptbv7fIBqNbn5eoBqtbj4+sCrdYyN0sBr9YnLEABsdYmKz8BstYlKj4BtNYhJjoBttYgJTkBuNYlKj4ButYoLUEBvNYmKz8BvtYoLUEBwdYoLUEBw9YqL0MBxNYlKj4BxtYiJjcByNYPER4BytYXHSsBzNYeIzUBztYfJDcB0NYhJjkB0tYhJjkB1NYiJzoB1tYhJDYB2NYfIzQB2tYeITAB3NYaHSwB3tYbHi0B4NYZHCsB4tYZHCsB5NYVGSYB5tYWGicB6NYWGycB6tYaHy0B7NYbHi0B7tYeITAB8NYaHSwB8tYXGyoB9NYTFyIB9tYMDRcB99YZHCwB+dYaHSwB/NYaHSwBAtchJzkBBNceIzIBBtccHzABCNcgIzQBCdcbHiwBC9cbHi0BDtcVGCcBENcQEyIBEtcNDRgBFNcICRIBFtcmLEABGNcoLUEBGtcmKz8BG9coLUEBHdcmKz8BINcoLUEBItcsMUUBJNcpLkIBJtcpLkIBKNcnLEABKtcmKz8BK9cmKz8BLdclKj4BL9cpLkIBMdcnLEABNNcrMEQBNtcpLkIBONcqL0MBOtcoLUEBPNcpLkIBPdcqL0MBP9cqL0MBQdcsMUUBQ9crMEQBRdcqL0MBSNcqL0MBStcoLUEBTNcmKz8BTdcjKDwBT9chJjkBUdcYHS0BU9cuNEkBVdcsMUQBV9crMEQBWdcoLUEBW9cpLkIBXtcsMUUBX9csMUUBYdcuM0cBY9ctMkYBZdcrMEQBZ9cqL0MBadcmKz4Ba9cnLD8BbdcjKTsBbtfFwMgCcdfy8PMBc9fy8PMBddfz8fQBd9fy8PMBedfv7fABe9fu7PEBfdfz8fYBf9fy8PUBgNf08fcBgtf29vgBhdf7+/0Bh9f6+vwBidf6+vwBi9f6+vwBjdf4+PoBj9f4+PoBkNf4+PoBktf4+PoBlNf09PYBltf09PYBmdf29vgBm9f19PcBndf18/YBn9f18/YBodf08vUBotf08vUBpNfy8PUBptfx7vMBqNfo5usBqtfU1N4CrdctMkYBr9cqL0MBsdcmKz8BstclKj4BtNchJjoBttciJzsBuNckKT0ButcoLUEBvNcoLUEBvtclKj4BwdcqL0MBw9cnLEABxNcmKz8BxtccITAByNcTFSIBytcXHSwBzNcdIjQBztcfJDcB0NcdIjUB0tcgJTgB1NcdIjUB1tcgIzQB2NcfIjMB2tccHy4B3NccHy4B3tcZHCsB4NcXGikB4tcVGScB5NcREx8B5tcQEh4B6NcXGigB6tccHy8B7NccHy4B7tcXGikB8NcZHCsB8tcWGSgB9NcNERsB9tcSEx4B99cbHi0B+dcaHSwB/NcZHCsBAtkVFyYBBNkVFyYBBtkUFyYBCNkXGykBCdkaHS0BC9kbHi4BDtkZHCsBENkWGSgBEtkOEBwBFNkGBgsBFtklKkMBGNklKj0BGtkkKT0BG9koLUEBHdkoLUEBINkmKz8BItkoLUEBJNklKj4BJtkkKT0BKNkmKz8BKtkiJzsBK9klKj4BLdklKj4BL9koLUEBMdkoLUEBNNknLEABNtkpLkIBONkqL0MBOtkqL0MBPNkqL0MBPdksMUUBP9krMEQBQdkqL0MBQ9ksMUUBRdkqL0MBSNkpLkIBStknLEABTNknLEABTdklKj4BT9kkKTwBUdkdIjUBU9koLT8BVdksMUUBV9koLUEBWdknLEABW9kpLkIBXtkqL0MBX9kpLkIBYdkrMEQBY9kqL0MBZdkrMEQBZ9knLEABadkpLkMBa9knLEABbdklKj0BbtmYlqICcdnv7fIBc9nw7vMBddnw7vMBd9nz8fQBednw7vEBe9nt6/ABfdnt6/ABf9ny8PUBgNnz8fYBgtn09PYBhdn7+/0Bh9n6+vwBidn5+fsBi9n4+PoBjdn39/kBj9n39/kBkNn4+PoBktn4+PoBlNn09PYBltn39/kBmdn29vgBm9n29vgBndn19fcBn9n19vgBodn08vUBotn18/YBpNn08vcBptnx7/QBqNno5ukBqtm3tscCrdktMkYBr9kjKDwBsdkkKT0BstkhJjoBtNkhJjoBttkjKDwBuNkmKz8ButkoLUEBvNkmKz8BvtknLEABwdkpLkIBw9klKj4BxNkkKT0BxtkREx8ByNkUGSQBytkZHCoBzNkcHy8BztkfIjMB0NkeITEB0tkfIjQB1NkeITQB1tkcHy4B2NkaHiwB2tkYGicB3NkVFyQB3tkUFSEB4NkQERwB4tkMDRgB5NkJChMB5tkUFR8C6NklKDgB6tkeITAB7NkVGCcB7tkZHCsB8NkZHCsB8tkYHSgB9NkHCBAB9tkUFyQB99kaHSwB+dkcHy4B/NkdIC8BAtsTFiUBBNsSFSQBBtsRFCMBCNsSFSQBCdsTFyMBC9sTFyMBDtsZHCsBENsXGikBEtsQEh4BFNsICA0BFtshJjsCGNsnLEABGtsnLEABG9snLEABHdspLkIBINsmKz8BItsnLEABJNsjKDwBJtsiJzsBKNsiJzsBKtsgJTkBK9shJjoBLdsnLEABL9soLUEBMdsqL0MBNNsrMEQBNtssMUUBONsrMEQBOtsoLUEBPNssMUUBPdsoLUEBP9spLkIBQdspLkIBQ9spLkIBRdspLkIBSNsoLUEBStsnLEABTNslKj4BTdsnLEABT9skKT0BUdsjKDsBU9sdIjUBVdssMUUBV9ssMUUBWdsmKz8BW9soLUEBXtsqL0MBX9spLkIBYdsoLUEBY9sqL0MBZdspLkIBZ9soLUEBadsoLUEBa9srMEQBbdsoLD8BbttwbXkCcdvq6O0Bc9vv7fIBddvv7fEBd9vx7/IBedvx7/IBe9vu7PEBfdvs6u8Bf9vx7/QBgNvy8PUBgtv09PYBhdv7+/0Bh9v5+fsBidv29vgBi9v39/kBjdv39/kBj9v39/kBkNv5+fsBktv7+/0BlNv19fcBltv29vgBmdv29vgBm9v39/kBndv39/kBn9v29vgBodv08vUBotvy8PMBpNvy8PUBptvu7PEBqNvj4eUBqtuVlKQCrdstMkYBr9spLkIBsdsjKDwBstskKT0BtNsiJzsBttskKT0BuNskKT0ButsoLUEBvNsmKz8BvtsmKz8BwdspLkIBw9slKj4BxNskKj0BxtsNEBwByNsUGSQBytsYGykBzNseITIBztsfIjMB0NsfIjMB0tseITAB1NsWGSgB1tsRFSAB2NsMEBsB2tsQEiAB3NsVFyYB3tsbHSwB4NshIzIB4tsjJjUB5NsdIDAB5tsYHCsB6NseITAB6tsaHSwB7NsVGCcB7tsZHCsB8NsYGysB8tsUGSUB9NsMDBQB9tsWGSYB99saHSwB+dsdIC8B/NsdIC8BAtwUGigBBNwVGygBBtwTGScBCNwSGCYBCdwUGCMBC9wOEh0BDtwVFyQBENwVFigBEtwSFB8BFNwKCRIBFtwbHy8CGNwmLEMBGtwnLEEBG9wnLEABHdwnLEABINwkKT0BItwmKz8BJNwjKDwBJtwlKj4BKNwkKT0BKtwhJjoBK9whJjoBLdwnLEABL9wmKz8BMdwoLUEBNNwvNEgBNtwsMUUBONwpLkIBOtwwNUkBPNwtMkYBPdwrMEQBP9woLUEBQdwnLEABQ9wnLEABRdwoLUEBSNwmKz8BStwlKj4BTNwlKj4BTdwnLEABT9wmKz8BUdwjKDsBU9wZHy8BVdwzOE0BV9wsMkgBWdwoLUEBW9wkKT0BXtwnLEABX9woLUEBYdwsMUUBY9wrMEQBZdwpLkIBZ9woLUEBadwmKz8Ba9woLUEBbdwnKz4BbtxTVmMCcdzk4OYBc9zu6e8Bddzv6/ABd9zt6+4Bedzv7fABe9zt6/ABfdzs6u8Bf9zt6/ABgNzw7vMBgtzz8/UBhdz7+/0Bh9z4+PoBidz29vgBi9z09PYBjdz39/kBj9z5+fsBkNz8/P4Bktz9/f8BlNzy8vQBltz29vgBmdz4+PoBm9z5+PsBndz59/oBn9zy8PMBodzx7/IBotzy8PMBpNzz8/QBptzn5OoBqNzf3eABqtxtcIcCrdwpLkIBr9wnLEABsdwjKDwBstwjKDwBtNwkKT0BttwkKT0BuNwlKj4ButwmKz8BvNwnLEABvtwmKz8BwdwpLkMBw9wnLEABxNwjKDgCxtwICxUByNwOEB0BytwSFSMBzNwXGygBztwbHi4B0NwgIzIB0twgIzUB1NwjJjoB1twiJTUB2NwhJDQB2twcHi4B3NwcHi4B3twYGyoB4NwZHCsB4twaHSwB5NwYGyoB5twaHCsB6NwcHy4B6twXGikB7NwXGikB7twZHCsB8NwYGykB8twNDxgB9NwPEBoB9twVGCQB99wZHCsB+dwbHi0B/NwcHy4BAt4bIDEBBN4bITEBBt4dIjMBCN4eJDQBCd4fITIBC94cHi8BDt4UFiQBEN4PER8BEt4PEh0BFN4MCxQBFt4OEh8CGN4lKz8BGt4oLUEBG94pLkIBHd4mKz8BIN4jKDwBIt4iJzsBJN4hJjoBJt4jKDwBKN4lKj4BKt4hJjoBK94iJzsBLd4oLUEBL94nLEABMd4nLEABNN4qL0MBNt4oLUEBON4qL0MBOt4nLEABPN4vNEgBPd4oLUEBP94nLEABQd4nLEABQ94oLUEBRd4nLEABSN4lKj4BSt4lKj4BTN4mKz8BTd4lKj4BT94lKj4BUd4iJjoBU94cIjIBVd4kKT0CV94nL0IBWd4mKz8BW94lKj4BXt4oLUEBX94pLkIBYd4qL0MBY94oLUEBZd4oLUEBZ94oLUEBad4pLkIBa94oLUEBbd4nKz0Bbt4xNEICcd7c2N4Bc97o4+kBdd7p5uoBd97r6ewBed7s6u0Be97s6u8Bfd7s6u8Bf97s6u8BgN7u7PEBgt709PYBhd75+fsBh9719fcBid7z8/UBi9719fcBjd76+vwBj979/f8BkN7+/v8Bkt78/P4BlN7x8fMBlt709PYBmd75+fsBm9749/oBnd718/YBn97v7fABod7x7/IBot7z8fQBpN7t7e4Bpt7b190BqN7d294Bqt5UVm4Crd4rMEMBr94mKz8Bsd4kKT0Bst4iJzsBtN4jKDwBtt4kKT0BuN4lKj4But4oLUEBvN4pLkIBvt4lKj4Bwd4nLEEBw94mKz4BxN4ZHi0Bxt4YGicByN4eIS8Byt4eITMBzN4eITMBzt4dIC8B0N4dIC8B0t4eIi4B1N4bHysB1t4dIDAB2N4aHSwB2t4bHi0B3N4aHSwB3t4aHSwB4N4aHSwB4t4bHi0B5N4bHi0B5t4bHi0B6N4cHy4B6t4XGikB7N4VGCcB7t4WGSgB8N4XGicB8t4FBg8B9N4PEBkB9t4TFiMB994YGyoB+d4aHSwB/N4cHy4BAt8hJjkBBN8iJzoBBt8iJzsBCN8hJjoBCd8jJzsBC98hJTkBDt8XGSgBEN8PEh8BEt8ODhoBFN8MDBUBFt8LDhkBGN8iKDwBGt8lKj4BG98nLEABHd8mKz8BIN8jKDwBIt8gJTkBJN8hJjoBJt8gJTkBKN8fJDgBKt8kKT0BK98mKz8BLd8oLUEBL98nLEABMd8nLEABNN8sMUYBNt8rMEYBON8rMEQBOt8oLUEBPN8pLkIBPd8pLkIBP98oLUEBQd8mKz8BQ98mKz8BRd8kKT0BSN8nLEABSt8oLUEBTN8mKz8BTd8lKj4BT98kKT0BUd8oLUEBU98cIjQBVd8XGywBV98tM0cBWd8nLEABW98lKj4BXt8nLEABX98oLUEBYd8pLkIBY98sMUUBZd8qL0MBZ98oLUEBad8pLkIBa98oLUEBbd8jKDsBbt8gIzICcd/Z09kBc9/k4OYBdd/q5+wBd9/r6ewBed/r6ewBe9/s6u8Bfd/s6u8Bf9/s6u8BgN/s6u8Bgt/29vgBhd/29vgBh9/y8vQBid/09PYBi9/19fcBjd/7+/0Bj9/8/P4BkN/7+/0Bkt/5+fsBlN/u7vABlt/4+PoBmd/39vkBm9/x7/IBnd/r6ewBn9/t6+4Bod/y8PMBot/08vUBpN/o5+sBpt/h3+QBqN/r6OwBqt86PlUCrd8nLEABr98nLEABsd8kKT0Bst8lKj4BtN8jKDwBtt8mKz8BuN8kKT0But8oLUEBvN8nLEABvt8oLUEBwd8mLEABw98oLT4BxN8SFiQBxt8ZHCoByN8eIDEByt8dIC8BzN8bHi0Bzt8eITEB0N8dIDEB0t8dIDAB1N8cHy4B1t8bHi0B2N8bHi0B2t8bHi0B3N8dIC8B3t8bHi0B4N8bHi0B4t8cHy4B5N8bHi0B5t8bHi0B6N8YGyoB6t8WGSgB7N8XGikB7t8YGyoB8N8YGycB8t8JChAB9N8OEBsB9t8UFyMB998YGyoB+d8ZHCsB/N8aHy0BAuEnLEABBOEoLUEBBuEjKDwBCOEjKDwBCeElKj4BC+EhJjsBDuEZHCsBEOEUFyYBEuEQEh8BFOEKDBgBFuELDRkBGOEhJToBGuEjKDwBG+EjKDwBHeEoLUEBIOEjKDwBIuEeIzcBJOEgJTkBJuEiJzsBKOEmKz8BKuEjKDwBK+EmKz8BLeEpLkIBL+EpLkIBMeEpLkIBNOErMEYBNuEpLkQBOOEpLkIBOuEnLEABPOEnLEABPeEpLkIBP+EqL0MBQeEoLUEBQ+EmKz8BReEoLUEBSOEmKz8BSuEmKz8BTOElKj4BTeElKj4BT+EjKDwBUeEiJzsBU+EdIjYBVeEYHCwBV+EvNkkBWeEqL0MBW+EoLUEBXuErMEQBX+ErMEQBYeEoLUEBY+EpLkIBZeErMEQBZ+ErMEQBaeEoLUEBa+EoLUEBbeEmKj4BbuEhJDMCceHW0NUBc+Hf3OEBdeHn5uoBd+Hm5OcBeeHm5OcBe+Ho5usBfeHp5+wBf+Hq6O0BgOHp5+wBguH39/kBheH19fcBh+H09PYBieH09PYBi+H19fcBjeH5+fsBj+H39/kBkOH39/kBkuH39/kBlOHr6+0BluH39/kBmeH08vUBm+Hu7O8BneHs6u0Bn+Hw7vEBoeHz8fQBouHz8fMBpOHp5+wBpuHh3+QBqOHp5uwCquErMEUCreEqL0MBr+EmKz8BseElKj4BsuEjKDwBtOEmKz8BtuEjKDwBuOEnLEABuuEpLkIBvOEoLUEBvuEoLUEBweEnLUEBw+EiKDkBxOEQFB8BxuEYHCgByOEcHy4ByuEdIDEBzOEdIDEBzuEeITIB0OEdIDEB0uEeITAB1OEeITAB1uEaHSwB2OEbHi0B2uEcHy4B3OEcHy4B3uEdIC8B4OEcHy4B4uEcHy4B5OEbHi0B5uEaHSwB6OEcHy4B6uEVGCcB7OEYGyoB7uEXGikB8OESFR8B8uEJCg4B9OEODxsB9uEUFyQB9+EYGyoB+eEaHSwB/OEaIS8BAuIoLUMBBOImK0EBBuIlKj4BCOIiJzsBCeIkKT0BC+IgJToBDuIaHSwBEOIaHSwBEuIZHCwBFOIVGSUBFuIQER4BGOIfIzYBGuIlKj4BG+IkKT0BHeIjKDwBIOIgJTkBIuIhJjoBJOIeIzcBJuIfJDcBKOIgJTkBKuIjKDwBK+InLEABLeIlKj4BL+InLEEBMeIpLkIBNOIpLkMBNuIpLkQBOOIoLUEBOuIoLUEBPOInLEABPeIoLUEBP+IqL0MBQeIoLUEBQ+InLEABReIpLkIBSOIlKj4BSuIiJzsBTOIlKj4BTeIlKj4BT+IkKT0BUeIhJjoBU+IgJTkBVeIYHCwBV+IgJjkCWeIqL0MBW+IpLkIBXuImKz8BX+IoLUEBYeIrMEQBY+IoLUEBZeIpLkIBZ+IqL0MBaeIsMUUBa+IlKj4BbeImKz8BbuIgIjICceLW0NUBc+Lc2d8BdeLm5ekBd+Lq6OwBeeLq6OsBe+Lo5usBfeLo5usBf+Ln5eoBgOLo5uwBguL4+PoBheL5+foBh+L29vgBieLz8/QBi+L08/UBjeL09PYBj+L19fcBkOL39/kBkuL4+PoBlOLw8PIBluL29fgBmeLt6+8Bm+Lq6OsBneLw7vEBn+L08vUBoeL18/cBouLy8PMBpOLm4+gBpuLe2+EBqOLl4+gCquItMkgCreImKz4Br+IlKj4BseIkKT0BsuInLEABtOIlKj4BtuImKz8BuOIlKj4BuuIoLUEBvOIoLUEBvuInLEABweIkKj4Bw+IdIjEBxOIUFyMBxuIZHSkByOIdIDAByuIcHzABzOIcHzABzuIcHzAB0OIdIDEB0uIfIjEB1OIdIC8B1uIdIC8B2OIhJDMB2uIeITAB3OIdIC8B3uIdIC8B4OIcHy4B4uIeITAB5OIcHy4B5uIcHy4B6OIcHy4B6uIVGCcB7OIYGyoB7uIXGikB8OINEBkB8uIJCg4B9OIPEBwB9uIUFyQB9+IZHCsB+eIZHCsB/OIdIzEBAuMqL0QBBOMoLUIBBuMjKDwBCOMjKDwBCeMiJzsBC+MjKDwBDuMcITQBEOMeIzYBEuMfJDcBFOMXGScBFuMIBg8BGOMgJDUBGuMjKDwBG+MmKz8BHeMiJzsBIOMeIzcBIuMeIzYBJOMbIDMBJuMeIzcBKOMfJDgBKuMgJTkBK+MjKDwBLeMoLUEBL+MoLUMBMeMqL0YBNOMqL0MBNuMoLUEBOOMoLUEBOuMpLkIBPOMmKz8BPeMoLUEBP+MnLEABQeMoLUEBQ+MrMEQBReMrMEQBSOMnLEABSuMkKT0BTOMmKz8BTeMnLEABT+MkKT0BUeMkKT0BU+MiJzsBVeMbITEBV+MTGSkBWeMtMkYBW+MoLUEBXuMmKz8BX+MkKT0BYeMqL0MBY+MnLEABZeMqL0MBZ+MpLkIBaeMpLkIBa+MqL0MBbeMmKz4BbuMeITUBcePX0NYBc+PZ1tsBdePn5usBd+Pr6e4BeePs6u8Be+Pt6/ABfePr6e4Bf+Pq6O0BgOPk4ucBguP7+/sBheP7+/sBh+Pu7O0BieP08/ABi+Py7u0BjeP08/EBj+P7+/0BkOP8/P4BkuP8+/4BlOPx7/QBluPz8fYBmePs6u8Bm+Pt6+8BnePx7/IBn+P18/YBoePz8fYBouPt7PEBpOPl4OYBpuPZ1NoBqOPb2+QCquMsL0gCreMoLUABr+MjKDwBseMjKDwBsuMlKj4BtOMlKj4BtuMnLEABuOMlKj4BuuMoLUEBvOMnLEABvuMlKj4BweMjKD0Bw+MUGCQBxOMVFyQBxuMbHi0ByOMdIC8ByuMbHi0BzOMcHy4BzuMdIDEB0OMcHzAB0uMdIDAB1OMhJDMB1uMcHy4B2OMeITAB2uMcHy4B3OMdIC8B3uMdIC8B4OMdIC8B4uMZHCsB5OMaHSwB5uMVGCcB6OMcHy4B6uMVGCcB7OMXGikB7uMWGigB8OMHBw8B8uMLChAB9OMPEBwB9uMUFyQB9+MZHCsB+eMbHi0B/OMcHy4BAuUiJzoBBOUlKj0BBuUmKz8BCOUlKj4BCeUmKz8BC+UnLEABDuUhJjsBEOUgJToBEuUXHC8BFOUJDBUBFuUCAQQBGOUYHC4BGuUgJTkBG+UhJjoBHeUjKDwBIOUdIjYBIuUfJDcBJOUdIjUBJuUgJTkBKOUiJzsBKuUjKDwBK+UnLEABLeUqL0MBL+UqL0UBMeUoLUQBNOUnLEABNuUqL0MBOOUpLkIBOuUpLkIBPOUpLkIBPeUpLkIBP+UmKz8BQeUmKz8BQ+UmKz8BReUlKj4BSOUkKT0BSuUmKz8BTOUlKj4BTeUkKT0BT+UiJzsBUeUkKT0BU+UhJjoBVeUcIjIBV+UUGikBWeUrMEUBW+UrL0MBXuUmKz8BX+UlKj4BYeUoLUEBY+UpLkIBZeUpLkIBZ+UpLkIBaeUoLUEBa+UqL0MBbeUoLUABbuUjJjkBceXX0NYCc+XZ1twBdeXn5usBd+Xs6u8BeeXs6u8Be+Xu7PEBfeXu7PEBf+Xr6e4BgOXm5OkBguX8/PwBheX5+foBh+Xs5+MBieXw7eYBi+Xu6eMBjeXv7OYBj+X7+/wBkOX8/P4BkuX7+/0BlOXy8PYBluXx7/QBmeXu7PEBm+Xz8fUBneX18vYBn+X39PgBoeXz8fYBouXr6u4BpOXf2d8BpuXY09kBqOXHxtQCquUtMUcBreUnLEABr+UmKz8BseUkKT0BsuUlKj4BtOUlKj4BtuUmKz8BuOUnLEABuuUmKz8BvOUpLkIBvuUkKT0BweUlKj8Bw+UOEh4BxOUWGCUBxuUZHCsByOUcHy4ByuUbHi0BzOUdIC8BzuUeITIB0OUeITIB0uUdIC8B1OUeIDAB1uUdIC8B2OUeIC8B2uUdIC8B3OUWGSgB3uUXGikB4OUXGikB4uUdIC8B5OUhJDMB5uUfIjEB6OUYGyoB6uUXGikB7OUWGSgB7uUWGigB8OUCAwsB8uULChAB9OUREh4B9uUVGSUB9+UbHi0B+eUaHSwB/OUbHi0BAuYaHzIBBOYfJDcBBuYmKz8BCOYmKz8BCeYlKj4BC+YkKT0BDuYfIzcBEOYXHC0BEuYRER0BFOYIBwwBFuYCAQMBGOYbHS0CGuYgJjoBG+YfJDgBHeYhJjoBIOYdIjYBIuYeIzYBJOYdIjUBJuYgJTcBKOYgJTgBKuYoLUMBK+YoLUEBLeYrMEQBL+YrMEQBMeYpLkIBNOYpLkIBNuYoLUEBOOYoLUEBOuYnLEABPOYoLUEBPeYkKT0BP+YiJzsBQeYjKDwBQ+YkKT0BReYjKDwBSOYnLEABSuYnLEABTOYjKDwBTeYmKz8BT+YjKDwBUeYhJjoBU+YhJjoBVeYaHzMBV+YWHC8BWeYfITMBW+YnLUIBXuYpLkIBX+YpLkIBYeYpLkIBY+YpLkIBZeYsMUUBZ+YoLUEBaeYnLEABa+YoLUEBbeYpLkEBbuYmKTsBcebY09kCc+bY09kBdebl4eYBd+br6e4Beebv7fIBe+bv7fIBfebv7fIBf+bx7/QBgObs6u8Bgub6+vwBheb19fcBh+br6+cBiebt6uIBi+bm49sBjebz8u0Bj+b8/P4BkOb8/P4Bkub5+PoBlObz8fMBlubv7vABmeby8vQBm+bz8/UBneb19fcBn+bz8/UBoebx7/QBoubq6O0BpObb1twBpubc19wBqOalqLYCquYzOE0BreYqL0MBr+YmKz8BseYlKj4BsuYmKz8BtOYnLEABtuYmKz8BuOYnLEABuuYmKz8BvOYmK0ABvuYnLEABweYfIjEBw+YSFCABxOYVFyYBxuYZHCsByOYcHy4ByuYeITABzOYcIC8BzuYaITAB0OYXHSwB0uYWHCkB1OYTGSYB1uYYHiwB2OYYHiwB2uYZHSwB3OYgIzIB3uYcHy4B4OYbHi0B4uYcHy8B5OYaHSwB5uYaHSwB6OYXGikB6uYYGykB7OYXGycB7uYUGCMB8OYAAQUB8uYKChIB9OYOER0B9uYVFyQB9+YbHi0B+eYaHSwB/OYZHy8BAugpLkIBBOgnLEABBuglKj8BCOgjKDwBCegiJzsBC+ggJTkBDugUFyQBEOgJChQBEugGCAsBFOgFBAkBFugEBAYBGOgTFSUCGuggJTkBG+geIzcBHegiJzsBIOggJTkBIugfJDcBJOggJTgBJugfJDYBKOgjKDsBKugqL0QBK+gsMUQBLegoLUEBL+gmKz8BMegoLUEBNOgnLEABNugkKT0BOOgmKz8BOugoLUEBPOgnLEABPegnLEABP+goLUEBQegrMEQBQ+gmKz8BRegpLkIBSOgpLkIBSuglKj4BTOgnLEABTeglKj4BT+gkKT0BUeghJjoBU+gjKDwBVegeIzcBV+gaHzMBWegXGioBW+guNUgBXugsMUUBX+gnLEABYegpLkIBY+goLUEBZegnLEABZ+gpLkIBaegpLkIBa+goLUEBbegmKz4BbugkJzkBcejRzNICc+jSzdMBdejf2+ABd+jm4+gBeejr6O0Be+js6u8Bfeju7PEBf+jy8PUBgOjr6e4Bguj4+PoBhejy8vQBh+ju7PABiejz8O4Bi+jm4+IBjejz8vMCj+j7+/4BkOj5+fsBkuj29vgBlOjx8PMBlujz8vQBmej39/kBm+j29vgBnej29vgBn+jy8fQBoeju7PEBoujo5usBpOjX0tgBpuji3OMBqOhxdYgCqugwNUkBregpLkIBr+gmKz8BseglKj4BsugnLEABtOglKj4BtugoLUEBuOgoLUEBuugnLEABvOgqMEQBvuglKj4BwegPEiABw+gOERoBxOgTFSIBxugbHi0ByOgfIjEByughJTUBzOgiJjYBzuggJDgB0OgeIjYB0ugeIzQB1OgaITAB1ugaIC4B2OgXHSsB2ugYGyoB3OgYGyoB3ugYGykB4OgZHCkB4ugaHSoB5OgaHSwB5ugYGyoB6OgYGyoB6ugXGikB7OgWGSYB7ugKDRYB8OgHCAsB8ugMDBQB9OgPER0B9ugSFCEB9+gUFyYB+egYGyoB/OgbITEBAuowNk4BBOouNEsBBuosMUcBCOosMUcBCeokKj0BC+ocHzEBDuoMDxgBEOoKCxABEuoICQ0BFOoHCAwBFuoGBQoBGOoREh8CGuoiJzwBG+ohJjoBHeofJDgBIOogJTkBIuogJTkBJOojKDwBJuokKT0BKOolKj4BKuosMUUBK+orMEQBLeopLkIBL+okKT0BMeolKj4BNOomKz8BNuolKj4BOOonLEABOuoqL0MBPOonLEABPeomKz8BP+olKj4BQeojKDwBQ+olKj4BReooLUEBSOonLEABSuolKj4BTOolKj4BTeokKT0BT+ojKDwBUeofJDgBU+ojKDwBVeogJTkBV+obITUBWeoYHCkBW+ofJTYCXuooLUEBX+onLEABYeooLUEBY+onLEABZeomKz8BZ+opLkIBaeoqL0MBa+oqL0MBbeonLD8BbuonKz0Bceq+usECc+rPytABderf2uABd+rm4ecBeerr5+wBe+rr6e4Bferu7PEBf+rv7fIBgOrt6/ABgur4+PoBhery8vQBh+rx8fMBier39/kBi+r5+fsBjer8/P4Bj+r7+/0BkOr6+vwBkur39/kBlOrx8fMBlur29vgBmer39/kBm+r29vgBner09PYBn+rw8PIBoerq6O0Bourm5OkBpOrW0dcBpurWz9gBqOpOU2cCquouM0cBreomKz8Br+olKj4BseomKz8BsuokKT0BtOojKDwBtuomKz8BuOooLUEBuuooLUEBvOopL0MBvuokKT0BweoNDxwBw+oTFSIBxOoYGicBxuodIC8ByOodIC8ByuoaIC4BzOobIi8BzuodHzAB0OoaHS4B0uobIS8B1OoZHy0B1uobHi0B2OoaHSwB2uoYGyoB3OoaHSwB3uoYGyoB4OoYGyoB4uobHi0B5OoaHSwB5uoaHSwB6OoYGyoB6uoVGCgB7OoUFyMB7uoHCA4B8OoJCg4B8uoODhkB9OoQEx8B9uoWGCYB9+oVGCcB+eoZHCsB/OobHi8BAusyOFABBOszOVABBuswNUsBCOspLkQBCesfJTYBC+sYHCsBDusMDxoBEOsPDxwBEusODhUBFOsKChIBFusIBw4BGOsMDhkCGuseIzgBG+sfJDgBHesfJDgBIOsfJDgBIusgJTkBJOskKT0BJusmKz8BKOsrMEQBKustMkYBK+stMkYBLesqL0MBL+smKz8BMesnLEABNOsjKDwBNuslKj4BOOsoLUEBOusnLEABPOsnLEABPeskKT0BP+skKT0BQesnLEABQ+sjKDwBResjKDwBSOsmKz8BSuslKj4BTOsnLEABTeskKT0BT+siJzsBUeshJjoBU+siJzsBVesfJDgBV+sdIzcBWesbHiwBW+sVGiwBXusrMEQBX+sqL0MBYesnLEABY+snLEABZesoLUEBZ+spLkIBaesqL0MBa+snLEABbespLkEBbusmKjwBceugnaQCc+vNyM4Bdevc190Bd+vk3+UBeevo4+kBe+vr6e4Bfevr6e4Bf+vs6u8BgOvs6u8Bguv4+PoBhev29vgBh+v39/kBiev5+fsBi+v5+fsBjev6+vwBj+v6+vwBkOv6+vwBkuv39/kBlOv09PYBluv29vgBmev39/kBm+v29vgBnevy8vQBn+vu7vABoevn5eoBouvi4OUBpOvX0dcBpuvTzdYCqOs2O08CqustMkYBresmKz8Br+slKj4BseskKT0BsusiJzsBtOsjKDwBtuspLkIBuOsnLEABuusnLEABvOslKj4BvusjKTsBwesPEh0Bw+sVFyQBxOsYGygBxusbHi0ByOsfIjEByusZHy0BzOsbIS8BzuseITIB0OsdIDEB0usaIC4B1OscIzAB1usbHi0B2OsaHSwB2usYGyoB3OsZHCsB3usaHSwB4OsaHSwB4usaHSwB5OsYGyoB5usYGyoB6OsWGSgB6usVGCYB7OsTFiAB7usBAgUB8OsKCxAB8usPDxoB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r/ImKz8BsfInLEABsvIoLUEBtPInLEABtvIoLUEBuPInLUABuvIlKkABvPIcHzECvvIQExwBwfIUFyUBw/IZHCsBxPIZHCoBxvIbHi0ByPIdIC8ByvIdIzMBzPIaIDABzvIcHzAB0PIdITEB0vIdIDAB1PIcHy4B1vIbHi0B2PIcHy4B2vIZHCsB3PIYGyoB3vIYGyoB4PIZHCsB4vIYGyoB5PIaHSwB5vIXGikB6PITFSEB6vIREx4B7PIBAgcB7vIHCA4B8PIMDBUB8vIODhoB9PIQFCEB9vIVGSUB9/IVGCcB+fIVGCcB/PIYHiwBAvQTFyUBBPQVGCcBBvQWGioBCPQYHCwBCfQbHi0BC/QYGyoBDvQWGSkBEPQXGioBEvQVGCcBFPQQFCIBFvQNDxcBGPQDAwYBGvQRFiMCG/QdJDYBHfQgJjoBIPQlKj4BIvQlKj4BJPQkKT0BJvQkKT0BKPQkKT0BKvQjKDwBK/QiJzsBLfQkKT0BL/QjKDwBMfQlKj4BNPQlKj4BNvQnLEABOPQkKT0BOvQmKz8BPPQjKDwBPfQlKj4BP/QiJzsBQfQeIzcBQ/QgJTkBRfQiJzsBSPQfJDgBSvQgJTkBTPQgJTkBTfQiJzsBT/QjKDwBUfQjKDwBU/QjKDwBVfQjKDwBV/QhJjoBWfQeIzYBW/QaIC8BXvQUGCMBX/QbHi0CYfQqL0MBY/QpLkIBZfQoLUEBZ/QmKz8BafQoLUEBa/QoLUEBbfQmKz8BbvQkKTwBcfQcHy8Cc/TNycwCdfTGv8cBd/TTz9UBefTg3uMBe/Tn5eoBffTq6O0Bf/Tq6O0BgPTx7/UBgvT39/kBhfT29vgBh/T29vgBifT39/kBi/T29vgBjfT29vgBj/T39/kBkPT39/kBkvTx8fQBlPT08/gBlvTz8vcBmfTx8PUBm/Tv7fIBnfTr6e4Bn/Tf3OIBofTV0NYBovTUz9QBpPTIxc0BpvRzdYgCqPQuM0cBqvQqL0MBrfQoLUEBr/QlKj4BsfQmKz8BsvQqL0MBtPQpLkIBtvQpLkIBuPQmLD8BuvQlKT4BvPQRFR8BvvQTFR8BwfQWGScBw/QYGyoBxPQZHCsBxvQbHi0ByPQcHy4ByvQaIDABzPQbIjEBzvQcHzAB0PQcHzAB0vQcHy4B1PQcHy4B1vQaHSwB2PQbHi0B2vQbHi0B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";
        const rawB64 = (window.STAR_PORTRAIT_B64 && window.STAR_PORTRAIT_B64.length > 100)
            ? window.STAR_PORTRAIT_B64
            : EMBEDDED_B64;

        // Decode Base64 data (6 bytes per star: normX, normY, R, G, B, flag)
        const binStr = atob(rawB64);
        const binLen = binStr.length;
        const totalStars = Math.floor(binLen / 6);

        // High-performance typed arrays for ultra-fast 60 FPS animation
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

            // Micro-star color tuning: accurate facial tones with luminous celestial starlight
            if (flag === 2) {
                // High contrast feature edge (eyes, pupils, smile, nose, jawline, hair border)
                colorStrings[i] = `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 35)},${Math.min(255, b + 50)})`;
                radius[i] = 1.25 + (lum / 255) * 0.85;
                baseAlpha[i] = 0.94;
                if (Math.random() < 0.02) isAnchor[i] = 1;
            } else if (flag === 1) {
                // Subject face, skin tones, suit, shirt
                if (lum > 175) {
                    // Bright highlights (eyes, teeth, collar shirt)
                    colorStrings[i] = `rgb(${Math.min(255, r + 25)},${Math.min(255, g + 35)},255)`;
                    radius[i] = 1.2 + (lum / 255) * 0.8;
                    baseAlpha[i] = 0.96;
                } else if (lum < 45) {
                    // Dark hair and navy blazer: rich electric & midnight starlight
                    colorStrings[i] = `rgb(${r + 15},${g + 25},${b + 65})`;
                    radius[i] = 1.05;
                    baseAlpha[i] = 0.85;
                } else {
                    // Natural warm skin tones
                    colorStrings[i] = `rgb(${r},${g},${b})`;
                    radius[i] = 1.1 + (lum / 255) * 0.75;
                    baseAlpha[i] = 0.90;
                }
            } else {
                // Faint ambient space dust
                colorStrings[i] = Math.random() > 0.5 ? '#00D4FF' : '#007BFF';
                radius[i] = 0.75 + Math.random() * 0.5;
                baseAlpha[i] = 0.35 + Math.random() * 0.25;
            }

            // Radial scattering trajectories
            const targetX = nx * frameWidth;
            const targetY = ny * frameHeight;
            const angle = Math.atan2(targetY - centerY, targetX - centerX) + (Math.random() - 0.5) * 0.75;
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

            // Holosphere border glow reacts to assembly and scatter
            if (holosphere) {
                const glowAlpha = Math.max(0.15, 0.55 * (1 - scatterProgress * 0.75) * assembleProgress);
                holosphere.style.borderColor = `rgba(0, 212, 255, ${glowAlpha})`;
            }

            const hoverActive = isHoveringPhoto && scatterProgress < 0.25;
            const drawAnchorFlares = scatterProgress < 0.25 && assembleProgress > 0.85;

            // Render all ~14,000 micro-stars that construct Jerin's portrait
            for (let i = 0; i < totalStars; i++) {
                // 1. Initial convergence from deep space
                const ax = origX[i] + (tgtX[i] - origX[i]) * assembleProgress;
                const ay = origY[i] + (tgtY[i] - origY[i]) * assembleProgress;

                // 2. Scattering displacement on scroll
                const scatterOffsetX = sDirX[i] * sDist[i] * (scatterProgress * 1.55) + Math.sin(starTime + phase[i]) * (12 * scatterProgress);
                const scatterOffsetY = sDirY[i] * sDist[i] * (scatterProgress * 1.55) + Math.cos(starTime + phase[i]) * (12 * scatterProgress);

                let destX = ax + scatterOffsetX;
                let destY = ay + scatterOffsetY;

                // 3. Interactive mouse hover deflection
                if (hoverActive) {
                    const mdx = destX - starMouseX;
                    const mdy = destY - starMouseY;
                    const mdist = Math.hypot(mdx, mdy);
                    if (mdist < 65) {
                        const force = (1 - mdist / 65) * 20;
                        destX += (mdx / (mdist || 1)) * force;
                        destY += (mdy / (mdist || 1)) * force;
                    }
                }

                // Smooth spring physics (lerp)
                curX[i] += (destX - curX[i]) * 0.22;
                curY[i] += (destY - curY[i]) * 0.22;

                // Twinkle shimmer across the starlight portrait
                const twinkle = Math.sin(starTime * speed[i] * 30 + phase[i]) * 0.16;
                const alpha = Math.max(0.08, Math.min(1.0, (baseAlpha[i] + twinkle) * (1 - scatterProgress * 0.4)));

                const r = radius[i];
                const cx = curX[i];
                const cy = curY[i];

                if (cx < -10 || cx > frameWidth + 10 || cy < -10 || cy > frameHeight + 10) continue;

                // Draw micro-star body
                starCtx.beginPath();
                starCtx.arc(cx, cy, r, 0, Math.PI * 2);
                starCtx.fillStyle = colorStrings[i];
                starCtx.globalAlpha = alpha;
                starCtx.fill();

                // Draw pulsing diamond crosshair flare on anchor stars
                if (drawAnchorFlares && isAnchor[i] === 1) {
                    const flarePulse = 0.5 + Math.sin(starTime * 2.2 + phase[i]) * 0.5;
                    const flareLen = r * (3.5 + flarePulse * 2.0);
                    starCtx.strokeStyle = 'rgba(0, 212, 255, ' + (alpha * 0.8) + ')';
                    starCtx.lineWidth = 0.75;
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
