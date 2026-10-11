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
            const container = scrollProgressLine.parentElement;
            const containerWidth = container ? container.clientWidth : window.innerWidth;
            const lineWidth = scrollProgressLine.offsetWidth || 130;
            const maxTravel = Math.max(0, containerWidth - lineWidth);
            // At top (scrollFraction = 0): positioned at far left (0)
            // At bottom (scrollFraction = 1): positioned at far right (maxTravel)
            const currentX = scrollFraction * maxTravel;
            scrollProgressLine.style.transform = `translate3d(${currentX}px, 0, 0)`;
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
                if (segment) segment.classList.remove('active-segment');
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


    // Dynamic Copyright Year
    const footerP = document.querySelector('footer p');
    if (footerP) {
        const currentYear = new Date().getFullYear();
        footerP.innerHTML = footerP.innerHTML.replace('2026', currentYear);
    }
});
