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
    initDynamicStats();
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
    const delay = force ? Math.max(0, 1400 - elapsed) : 2200;
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

    contactForm.addEventListener('submit', async function (event) {
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

        const submitButton = contactForm.querySelector('.submit-btn');
        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(new FormData(contactForm).entries()))
            });

            if (!response.ok) throw new Error('Unable to send message');

            showAlert('Email Sent Successfully!', 'Thank you for your message. I will respond soon.', true);
            contactForm.reset();
            contactForm.querySelectorAll('.form-group').forEach(group => group.classList.remove('is-focused'));
        } catch (error) {
            showAlert('Message Not Sent', 'Please try again later or email me directly at tanvir.cse2004@gmail.com.', false);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
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
   DYNAMIC STATS
   Counts real records on their source pages so the
   homepage numbers can't drift out of date.
   ============================================ */

function initDynamicStats() {
    document.querySelectorAll('.stat-number[data-source]').forEach(async statEl => {
        const source = statEl.getAttribute('data-source');
        const selector = statEl.getAttribute('data-selector');

        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error('Unable to load ' + source);

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const count = doc.querySelectorAll(selector).length;

            if (count > 0) statEl.textContent = String(count);
        } catch (error) {
            // Keep the static fallback already in the markup (e.g. opened via file://).
        }
    });
}

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
