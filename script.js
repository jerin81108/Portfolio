document.addEventListener('DOMContentLoaded', () => {
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
});
