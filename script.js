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

                fetch("https://formsubmit.co/ajax/jerin81108loco@gmail.com", {
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
                .then(response => response.json())
                .then(data => {
                    alert('Thank you for your message! Jerin will get back to you soon.');
                    contactForm.reset();
                })
                .catch(error => {
                    alert('There was an error sending your message. Please try again.');
                    console.error(error);
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
        const cgpaPhrases = ['8.63 CGPA', 'High Distinction', 'Top Academic Standing'];
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
                    // Smart Redirect: Get the current page name (e.g., certificates.html)
                    const pathParts = window.location.pathname.split('/');
                    const currentPage = pathParts.pop() || 'index.html';
                    window.location.href = 'portfolio/' + currentPage;
                }, 800);
            };
        });
    }
});
