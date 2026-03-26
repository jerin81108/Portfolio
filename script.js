document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    const blobBg = document.querySelector('.blob-bg');
    const links = document.querySelectorAll('a, button, .project-card, .cert-card, .logo');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Parallax effect for background
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        if (blobBg) {
            blobBg.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${window.scrollY / 10}deg)`;
        }
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 50);
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            follower.classList.add('follower-hover');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            follower.classList.remove('follower-hover');
        });
    });

    // Scroll Progress
    const scrollProgress = document.querySelector('.scroll-progress');
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.width = scrolled + '%';
        
        // Navigation background opacity adjustment
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.padding = '1rem 8%';
            nav.style.background = 'rgba(3, 7, 18, 0.9)';
        } else {
            nav.style.padding = '1.5rem 8%';
            nav.style.background = 'rgba(3, 7, 18, 0.7)';
        }
    });

    // Reveal elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the appear class
                entry.target.classList.add('appear');

                // Stop observing once animated to avoid re-triggering
                observer.unobserve(entry.target);
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
            const message = document.getElementById('message-input').value;
            if (message.trim()) {
                alert('Thank you for your message! Jerin will get back to you soon.');
                contactForm.reset();
            }
        });
    }
  
    // Continuous Dynamic Name/Degree transition
    const dynamicName = document.getElementById('dynamic-name');
    if (dynamicName) {
        let isName = true;
        setInterval(() => {
            dynamicName.classList.add('fade-out');
            setTimeout(() => {
                isName = !isName;
                dynamicName.textContent = isName ? 'JERIN J' : 'B.Tech AI&DS Student';
                dynamicName.classList.remove('fade-out');
            }, 600);
        }, 4000); // Toggle every 4 seconds
    }

    // Theme Changer / Asteroid Impact Logic
    const themeBtn = document.getElementById('theme-changer');
    const flashOverlay = document.getElementById('flash-overlay');

    if (themeBtn && flashOverlay) {
        function triggerLightning() {
            for (let i = 0; i < 8; i++) {
                const lightning = document.createElement('div');
                lightning.className = 'lightning';
                const isVertical = Math.random() > 0.5;
                
                if (isVertical) {
                    lightning.style.width = '2px';
                    lightning.style.height = '100vh';
                    lightning.style.left = `${Math.random() * 100}vw`;
                    lightning.style.top = '0';
                } else {
                    lightning.style.width = '100vw';
                    lightning.style.height = '2px';
                    lightning.style.top = `${Math.random() * 100}vh`;
                    lightning.style.left = '0';
                }
                
                document.body.appendChild(lightning);
                lightning.classList.add('animate-lightning');
                setTimeout(() => lightning.remove(), 500);
            }
        }

        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Start the asteroid animation
            const asteroid = document.createElement('div');
            asteroid.className = 'massive-asteroid';
            document.body.appendChild(asteroid);

            const startX = window.innerWidth + 100;
            const startY = -100;
            asteroid.style.left = `${startX}px`;
            asteroid.style.top = `${startY}px`;

            // Target the center of the screen
            const targetX = window.innerWidth / 2 - 40;
            const targetY = window.innerHeight / 2 - 40;

            const animation = asteroid.animate([
                { left: `${startX}px`, top: `${startY}px`, transform: 'rotate(0deg) scale(1.5)' },
                { left: `${targetX}px`, top: `${targetY}px`, transform: 'rotate(20deg) scale(1)' }
            ], {
                duration: 1500,
                easing: 'cubic-bezier(.47,.01,.42,.99)'
            });

            animation.onfinish = () => {
                asteroid.remove();
                triggerLightning(); // EPIC!
                flashOverlay.classList.add('animate-flash');
                
                setTimeout(() => {
                    // Redirect to the AOT portfolio
                    window.location.href = 'portfolio/index.html';
                }, 800);
            };
        });
    }
});
