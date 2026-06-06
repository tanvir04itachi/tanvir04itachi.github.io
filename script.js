const SITE_LAUNCH_STARTED = performance.now();

/* ============================================
   GLOBAL INTERACTIVITY & JAVASCRIPT
   Portfolio Website for Tanvir Ahmed
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initNavigation();
    setActiveNavLink();
    initSmoothAnchors();
    initContactForm();
    initCertificateModal();
    initCursorGlow();
    initParticles();
    initTypingEffect();
    initRevealAnimations();
    initCounters();
    initSkillMeters();
    initParallax();
    initCardTilt();
    hideLoadingScreen();
});

window.addEventListener('load', function () {
    hideLoadingScreen(true);
});

/* ============================================
   LOADING SCREEN
   ============================================ */

function hideLoadingScreen(force) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    const elapsed = performance.now() - SITE_LAUNCH_STARTED;
    const delay = force ? Math.max(0, 1300 - elapsed) : 2600;
    setTimeout(function () {
        loadingScreen.classList.add('hidden');
    }, delay);
}

/* ============================================
   THEME TOGGLE
   ============================================ */

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const defaultTheme = 'dark';
    const savedTheme = localStorage.getItem('portfolio-theme');
    const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : defaultTheme;

    applyTheme(initialTheme);

    window.addEventListener('storage', function (event) {
        if (event.key !== 'portfolio-theme') return;
        const syncedTheme = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : defaultTheme;
        applyTheme(syncedTheme);
    });

    if (!themeToggle) return;

    themeToggle.setAttribute('aria-label', 'Toggle color theme');
    themeToggle.addEventListener('click', function () {
        const currentTheme = htmlElement.getAttribute('data-theme') || defaultTheme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        localStorage.setItem('portfolio-theme', newTheme);
        applyTheme(newTheme);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleIcon(theme);
}

function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

/* ============================================
   NAVIGATION
   ============================================ */

function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navMenu) {
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (event) {
            const isClickOnNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);

            if (!isClickOnNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    window.addEventListener('scroll', throttle(function () {
        if (!navbar) return;
        navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    }, 80));
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active-nav', href === currentPage || href.split('/').pop() === currentPage);
    });
}

function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* ============================================
   HERO AND BACKGROUND EFFECTS
   ============================================ */

function initCursorGlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;

    document.addEventListener('pointermove', function (event) {
        targetX = event.clientX;
        targetY = event.clientY;
    });

    function animateGlow() {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

function initParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'particle-layer';
    layer.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 20; index += 1) {
        const particle = document.createElement('span');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${10 + Math.random() * 12}s`;
        layer.appendChild(particle);
    }

    document.body.appendChild(layer);
}

function initTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const text = subtitle.textContent.trim();
    subtitle.dataset.fullText = text;
    subtitle.textContent = '';
    subtitle.classList.add('typing-active');

    let index = 0;
    const type = function () {
        subtitle.textContent = text.slice(0, index);
        index += 1;

        if (index <= text.length) {
            setTimeout(type, 32);
        } else {
            subtitle.classList.remove('typing-active');
        }
    };

    setTimeout(type, 500);
}

/* ============================================
   SCROLL REVEALS, COUNTERS, SKILLS
   ============================================ */

function initRevealAnimations() {
    const elements = document.querySelectorAll(
        '.hero-image, .hero-text, .stat-card, .about-text, .skill-category, .project-card, .timeline-item, .certification-card, .contact-form-wrapper, .contact-info-wrapper, .section-title, .section-subtitle, .subsection-title'
    );

    elements.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index * 45, 320)}ms`);
    });

    if (!('IntersectionObserver' in window)) {
        elements.forEach(element => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.14,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => observer.observe(element));
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const animateCounter = function (counter) {
        const rawValue = counter.textContent.trim();
        const numericValue = parseFloat(rawValue.replace(/[^\d.]/g, ''));
        const suffix = rawValue.replace(/[\d.]/g, '');

        if (Number.isNaN(numericValue)) return;

        let startTime = null;
        const duration = 1200;

        function frame(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = numericValue * eased;

            counter.textContent = rawValue.includes('.')
                ? `${current.toFixed(2)}${suffix}`
                : `${Math.round(current)}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                counter.textContent = rawValue;
            }
        }

        requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function initSkillMeters() {
    const skillScores = {
        Python: 82,
        PHP: 88,
        Java: 80,
        'C++': 78,
        'C#': 76,
        HTML: 92,
        CSS: 90,
        JavaScript: 86,
        AJAX: 78,
        JSON: 84,
        MySQL: 88,
        'Oracle Database': 74,
        'SQL Server': 76,
        SQL: 86,
        Git: 84,
        'Google Colab': 78,
        'VS Code': 92,
        Figma: 82,
        'Scrum/Agile': 86,
        Jira: 80,
        Trello: 78,
        Notion: 82,
        OpenGL: 72,
        UML: 78,
        AutoCAD: 70,
        Multisim: 68,
        'Office Suite': 84
    };

    document.querySelectorAll('.skill-badge').forEach(badge => {
        const label = badge.textContent.trim();
        const score = skillScores[label] || 75;
        badge.style.setProperty('--skill-level', `${score}%`);
        badge.setAttribute('title', `${label} - ${score}% familiarity`);
    });
}

/* ============================================
   INTERACTIVE SURFACES
   ============================================ */

function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroImage = document.querySelector('.hero-image');
    const heroText = document.querySelector('.hero-text');

    window.addEventListener('scroll', throttle(function () {
        const scrollY = window.scrollY;
        if (heroImage) heroImage.style.transform = `translate3d(0, ${scrollY * 0.035}px, 0)`;
        if (heroText) heroText.style.transform = `translate3d(0, ${scrollY * -0.018}px, 0)`;
    }, 16));
}

function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.project-card, .certification-card, .skill-category, .stat-card, .contact-info');

    cards.forEach(card => {
        card.addEventListener('pointermove', function (event) {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -5;
            const rotateY = ((x / rect.width) - 0.5) * 5;

            card.style.setProperty('--spot-x', `${x}px`);
            card.style.setProperty('--spot-y', `${y}px`);
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('pointerleave', function () {
            card.style.transform = '';
        });
    });
}

/* ============================================
   CERTIFICATE MODAL
   ============================================ */

function initCertificateModal() {
    const certModal = document.getElementById('certModal');
    const certModalImage = document.getElementById('certModalImage');
    const certModalClose = document.getElementById('certModalClose');

    if (!certModal || !certModalImage) return;

    document.querySelectorAll('.cert-link').forEach(link => {
        link.addEventListener('click', function (event) {
            const card = this.closest('.certification-card');
            const image = card ? card.querySelector('.cert-image') : null;

            if (!image) return;
            event.preventDefault();

            certModalImage.src = image.src;
            certModalImage.alt = image.alt || 'Certificate';
            certModal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    });

    const closeModal = function () {
        certModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    if (certModalClose) certModalClose.addEventListener('click', closeModal);
    certModal.addEventListener('click', event => {
        if (event.target === certModal) closeModal();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && certModal.classList.contains('active')) closeModal();
    });
}

/* ============================================
   CONTACT FORM
   ============================================ */

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('focus', function () {
            field.closest('.form-group').classList.add('is-focused');
        });

        field.addEventListener('blur', function () {
            field.closest('.form-group').classList.toggle('is-focused', Boolean(field.value.trim()));
        });
    });

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            showAlert('Validation Error', 'Please fill in all fields before submitting.', false);
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Invalid Email', 'Please enter a valid email address.', false);
            return;
        }

        showAlert('Success!', 'Thank you for your message. I will get back to you soon!', true);
        contactForm.reset();
        contactForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('is-focused'));
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAlert(title, message, isSuccess) {
    let modal = document.getElementById('alertModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'alertModal';
        modal.className = 'alert-modal';
        modal.innerHTML = `
            <div class="alert-content">
                <h3 id="alertTitle"></h3>
                <p id="alertMessage"></p>
                <button class="alert-btn" type="button">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.alert-btn').addEventListener('click', closeAlert);
        modal.addEventListener('click', event => {
            if (event.target === modal) closeAlert();
        });
    }

    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertContent = modal.querySelector('.alert-content');

    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertContent.classList.toggle('is-success', isSuccess);
    alertContent.classList.toggle('is-error', !isSuccess);
    modal.classList.add('active');
}

function closeAlert() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.classList.remove('active');
}

document.addEventListener('keydown', function (event) {
    const modal = document.getElementById('alertModal');
    if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeAlert();
    }
});

/* ============================================
   PERFORMANCE HELPERS
   ============================================ */

function throttle(func, limit) {
    let inThrottle = false;
    return function throttledFunction(...args) {
        if (inThrottle) return;
        func.apply(this, args);
        inThrottle = true;
        setTimeout(function () {
            inThrottle = false;
        }, limit);
    };
}
