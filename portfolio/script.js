document.addEventListener('DOMContentLoaded', () => {
    // Reveal elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const links = document.querySelectorAll('a, button, .project-card, .cert-card, .logo');

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

    // Continuous Dynamic Name/Degree transition (Starts after impact)
    const dynamicName = document.getElementById('dynamic-name');
    function startNameRotation() {
        if (dynamicName) {
            const aotTitles = ['JERIN J', 'The Rumbling Initiator', 'Survey Corps Captain', 'Hope of Humanity'];
            let currentIndex = 0;
            
            setInterval(() => {
                dynamicName.classList.add('fade-out');
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % aotTitles.length;
                    dynamicName.textContent = aotTitles[currentIndex];
                    dynamicName.classList.remove('fade-out');
                }, 600);
            }, 4000); 
        }
    }

    // --- RUMBLING THEME LOGIC ---

    // 1. Walking Colossal Titans (Scroll-Locked)
    const titansBg = document.getElementById('titans-bg');
    if (titansBg) {
        let isScrolling = false;
        let walkTimeout;

        function spawnTitan() {
            if (document.hidden) return;
            const titan = document.createElement('div');
            titan.className = 'titan-silhouette';
            
            const scale = 0.8 + Math.random() * 0.7;
            const speed = 15 + Math.random() * 10;
            const opacity = 0.15 + Math.random() * 0.25;
            
            titan.style.transform = `scale(${scale})`;
            titan.style.animationDuration = `${speed}s`;
            titan.style.opacity = opacity;
            titan.style.left = `-${200 * scale}px`;
            
            // Set initial state
            if (isScrolling) titan.style.animationPlayState = 'running';
            
            titansBg.appendChild(titan);
            setTimeout(() => titan.remove(), speed * 1000);
        }

        // Control animation state based on scroll
        window.addEventListener('scroll', () => {
            isScrolling = true;
            const titans = document.querySelectorAll('.titan-silhouette');
            titans.forEach(t => t.style.animationPlayState = 'running');
            
            clearTimeout(walkTimeout);
            walkTimeout = setTimeout(() => {
                isScrolling = false;
                const activeTitans = document.querySelectorAll('.titan-silhouette');
                activeTitans.forEach(t => t.style.animationPlayState = 'paused');
            }, 100); // Stop walking shortly after scroll stops
        });

        // Spawn titans periodically
        setInterval(spawnTitan, 4000);
        for(let i=0; i<4; i++) spawnTitan(); 
    }

    // 2. Cinematic Impact Setup (Used if needed)
    const impactTarget = document.getElementById('impact-target');
    const flashOverlay = document.getElementById('flash-overlay');
    
    if (impactTarget && flashOverlay) {
        // Start the catchy reveal immediately as it was "hit" during the transition
        impactTarget.textContent = 'JERIN J';
        impactTarget.classList.add('impacted-subtitle');
        
        if (dynamicName) {
            dynamicName.textContent = 'Special Operations Squad';
            startNameRotation();
        }
    }

    // 3. ODM Gear士兵 (Soldiers Chasing Titans)
    if (titansBg) {
        function spawnSoldier() {
            if (document.hidden) return;
            const soldier = document.createElement('div');
            soldier.className = 'soldier';
            
            const startX = Math.random() > 0.5 ? -50 : window.innerWidth + 50;
            const startY = Math.random() * window.innerHeight;
            
            soldier.style.left = `${startX}px`;
            soldier.style.top = `${startY}px`;
            
            // Wire
            const wire = document.createElement('div');
            wire.className = 'odm-wire';
            
            titansBg.appendChild(wire);
            titansBg.appendChild(soldier);
            
            // Random target near bottom (where titans walk)
            const targetX = Math.random() * window.innerWidth;
            const targetY = window.innerHeight - (Math.random() * 200);
            
            // Animate Soldier
            const duration = 1200 + Math.random() * 1000; // Slower for visibility
            const animation = soldier.animate([
                { left: `${startX}px`, top: `${startY}px`, transform: `scale(1.5) rotate(${startX < targetX ? 90 : -90}deg)` },
                { left: `${targetX}px`, top: `${targetY}px`, transform: `scale(1.5) rotate(${startX < targetX ? 90 : -90}deg)` }
            ], {
                duration: duration,
                easing: 'ease-in-out'
            });

            // Update Wire position repeatedly
            const wireInterval = setInterval(() => {
                const sRect = soldier.getBoundingClientRect();
                const dist = Math.hypot(targetX - sRect.left, targetY - sRect.top);
                const angle = Math.atan2(targetY - sRect.top, targetX - sRect.left);
                
                wire.style.width = `${dist}px`;
                wire.style.left = `${sRect.left + 7}px`;
                wire.style.top = `${sRect.top + 7}px`;
                wire.style.transform = `rotate(${angle}rad)`;
            }, 16);

            animation.onfinish = () => {
                clearInterval(wireInterval);
                soldier.remove();
                wire.remove();
            };
        }

        setInterval(spawnSoldier, 2500);
    }

    // 3. Asteroid / Debris Particle System (Regular small ones)
    const asteroidsContainer = document.getElementById('asteroids-container');
    if (asteroidsContainer) {
        function createAsteroid() {
            if (document.hidden) return;
            
            const asteroid = document.createElement('div');
            asteroid.className = 'asteroid';
            
            const size = Math.random() * 5 + 2;
            const startX = Math.random() * 100;
            const duration = Math.random() * 4 + 2;
            const opacity = Math.random() * 0.6 + 0.3;
            
            asteroid.style.width = `${size}px`;
            asteroid.style.height = `${size}px`;
            asteroid.style.left = `${startX}vw`;
            asteroid.style.top = `-20px`;
            asteroid.style.opacity = opacity;
            asteroid.style.background = `linear-gradient(135deg, #ff4d00, #ff0000)`;
            asteroid.style.position = 'absolute';
            asteroid.style.borderRadius = '50%';
            asteroid.style.boxShadow = `0 0 ${size * 3}px #ff4d00`;
            asteroid.style.filter = `blur(1px)`;
            
            asteroidsContainer.appendChild(asteroid);
            
            const animation = asteroid.animate([
                { transform: `translate(0, 0) scale(1)`, opacity: opacity },
                { transform: `translate(${Math.random() * 400 - 200}px, 120vh) scale(0)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });
            
            animation.onfinish = () => asteroid.remove();
        }

        setInterval(createAsteroid, 250);
    }

    // Mouse Parallax for Alter Ego
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) / 30;
        const moveY = (e.clientY - window.innerHeight / 2) / 30;
        
        if (titansBg) titansBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        const asteroidsContainer = document.getElementById('asteroids-container');
        if (asteroidsContainer) asteroidsContainer.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
    });

    const revertBtn = document.getElementById('revert-theme');
    if (revertBtn) {
        revertBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Optional: dramatic exit flash
            const flashOverlay = document.getElementById('flash-overlay');
            if (flashOverlay) {
                flashOverlay.classList.add('animate-flash');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 800);
            } else {
                window.location.href = '../index.html';
            }
        });
    }
});
