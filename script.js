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
    initBinaryWave();
    initScrollProgress();
    initSkillsSummary();
    initCopyButtons();
    initSeamlessPageFlow();
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

function initSmoothAnchors(root) {
    (root || document).querySelectorAll('a[href^="#"]').forEach(anchor => {
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

function initCertificateModal(root) {
    const scope = root || document;
    const certModal = scope.querySelector('#certModal');
    const certModalImage = scope.querySelector('#certModalImage');
    const certModalClose = scope.querySelector('#certModalClose');

    if (!certModal || !certModalImage) return;

    scope.querySelectorAll('.cert-link').forEach(link => {
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

function initContactForm(root) {
    const contactForm = (root || document).querySelector('#contactForm');
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

        const name = contactForm.querySelector('#name').value.trim();
        const email = contactForm.querySelector('#email').value.trim();
        const subject = contactForm.querySelector('#subject').value.trim();
        const message = contactForm.querySelector('#message').value.trim();

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
   BINARY WAVE BACKGROUND
   A ripple of 0s and 1s that follows the cursor —
   silent otherwise, so it reads as a response to
   the visitor rather than ambient decoration.
   ============================================ */

function initBinaryWave() {
    const canvas = document.getElementById('binaryWave');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const CELL = 24;
    const RADIUS = 240;

    let width, height, dpr, cells;
    let mouseX = -9999;
    let mouseY = -9999;
    let inkColor = [124, 135, 144];

    function readInkColor() {
        const hex = getComputedStyle(document.documentElement).getPropertyValue('--ink-faint').trim();
        const parts = hex.replace('#', '').match(/.{1,2}/g);
        if (parts && parts.length === 3) {
            inkColor = parts.map(part => parseInt(part, 16));
        }
    }

    function buildGrid() {
        const cols = Math.ceil(width / CELL) + 1;
        const rows = Math.ceil(height / CELL) + 1;
        cells = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                cells.push({
                    x: c * CELL,
                    y: r * CELL,
                    char: Math.random() > 0.5 ? '1' : '0'
                });
            }
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = "14px 'IBM Plex Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        buildGrid();
    }

    readInkColor();
    resize();

    window.addEventListener('resize', throttle(resize, 200));
    window.addEventListener('pointermove', function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    window.addEventListener('pointerleave', function () {
        mouseX = -9999;
        mouseY = -9999;
    });

    new MutationObserver(readInkColor).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    function frame(time) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < cells.length; i += 1) {
            const cell = cells[i];
            const dx = cell.x - mouseX;
            const dy = cell.y - mouseY;
            const dist = Math.sqrt((dx * dx) + (dy * dy));

            if (dist > RADIUS) continue;

            const wave = (Math.sin((dist * 0.05) - (time * 0.004)) * 0.5) + 0.5;
            const falloff = 1 - (dist / RADIUS);
            const opacity = wave * falloff * 0.55;

            if (opacity < 0.02) continue;

            if (falloff > 0.45 && Math.random() < 0.01) {
                cell.char = cell.char === '1' ? '0' : '1';
            }

            ctx.fillStyle = `rgba(${inkColor[0]}, ${inkColor[1]}, ${inkColor[2]}, ${opacity.toFixed(3)})`;
            ctx.fillText(cell.char, cell.x, cell.y);
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

/* ============================================
   SCROLL PROGRESS
   ============================================ */

function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    function update() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    window.addEventListener('scroll', throttle(update, 50));
    window.addEventListener('resize', throttle(update, 200));
    update();
}

/* ============================================
   SKILLS SUMMARY
   Counts the categories and badges already on
   the page rather than hardcoding totals that
   drift as skills are added.
   ============================================ */

function initSkillsSummary(root) {
    const scope = root || document;
    const summary = scope.querySelector('#skillsSummary');
    if (!summary) return;

    const categories = scope.querySelectorAll('.skill-category').length;
    const technologies = scope.querySelectorAll('.skill-badge').length;

    if (categories && technologies) {
        summary.textContent = categories + ' categories, ' + technologies + ' technologies tracked below.';
    }
}

/* ============================================
   COPY BUTTONS
   ============================================ */

function initCopyButtons(root) {
    (root || document).querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', async function () {
            const text = button.getAttribute('data-copy');
            const originalText = button.textContent;

            try {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied';
                button.disabled = true;

                setTimeout(function () {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 1500);
            } catch (error) {
                // Clipboard API unavailable — the mailto/tel link still works.
            }
        });
    });
}

/* ============================================
   DYNAMIC STATS
   Counts real records on their source pages so the
   homepage numbers can't drift out of date.
   ============================================ */

function initDynamicStats(root) {
    (root || document).querySelectorAll('.stat-number[data-source]').forEach(async statEl => {
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
   SEAMLESS PAGE FLOW
   Scrolling past the end of a page fetches the next
   page in the site's nav order and splices its
   sections straight into the current document, ahead
   of time, so there is no click, no reload, and no
   loading-screen replay between pages.
   ============================================ */

const PAGE_FLOW_SEQUENCE = ['index.html', 'about.html', 'projects.html', 'experience.html', 'contact.html'];

function initSeamlessPageFlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const footer = document.querySelector('footer.footer');
    if (!footer) return;

    const currentFile = location.pathname.split('/').pop() || 'index.html';
    let sequenceIndex = PAGE_FLOW_SEQUENCE.indexOf(currentFile);
    if (sequenceIndex === -1) return;

    let isFetching = false;

    // Tracks the nav/URL/title for every page currently spliced into the
    // document, so the nav bar follows whichever page is actually on
    // screen whether the visitor scrolls down into new pages or back up
    // into ones already loaded — not just the first time each one loads.
    const firstOwnSection = document.querySelector('body > section');
    const pageRecords = firstOwnSection
        ? [{ el: firstOwnSection, file: currentFile, title: document.title }]
        : [];

    const scrollSpy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const record = pageRecords.find(r => r.el === entry.target);
            if (!record) return;

            history.replaceState({ page: record.file }, '', record.file);
            document.title = record.title;
            setActiveNavLink();
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    if (firstOwnSection) scrollSpy.observe(firstOwnSection);

    const trigger = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting || isFetching) return;
        loadNextPage();
    }, { rootMargin: '1200px 0px 1200px 0px' });

    trigger.observe(footer);

    async function loadNextPage() {
        const nextFile = PAGE_FLOW_SEQUENCE[sequenceIndex + 1];
        if (!nextFile) {
            trigger.disconnect();
            return;
        }

        isFetching = true;

        try {
            const response = await fetch(nextFile);
            if (!response.ok) throw new Error('Unable to load ' + nextFile);

            const html = await response.text();
            const nextDoc = new DOMParser().parseFromString(html, 'text/html');
            const nodes = extractPageFlowContent(nextDoc);
            if (!nodes.length) {
                trigger.disconnect();
                return;
            }

            const fragment = document.createDocumentFragment();
            nodes.forEach(node => fragment.appendChild(document.importNode(node, true)));

            const firstSection = fragment.querySelector('section');
            if (firstSection) firstSection.classList.add('is-continued-section');

            initSmoothAnchors(fragment);
            initContactForm(fragment);
            initCertificateModal(fragment);
            initSkillsSummary(fragment);
            initCopyButtons(fragment);
            initDynamicStats(fragment);

            const pageTitle = nextDoc.title;
            const entryMarker = fragment.firstElementChild;

            footer.parentNode.insertBefore(fragment, footer);
            sequenceIndex += 1;

            if (entryMarker) {
                pageRecords.push({ el: entryMarker, file: nextFile, title: pageTitle });
                scrollSpy.observe(entryMarker);
            }
        } catch (error) {
            trigger.disconnect();
        } finally {
            isFetching = false;
        }
    }
}

function extractPageFlowContent(doc) {
    const skipTags = ['NAV', 'FOOTER', 'SCRIPT'];
    const skipIds = ['loadingScreen', 'binaryWave'];

    return Array.from(doc.body.children).filter(function (node) {
        if (skipTags.indexOf(node.tagName) !== -1) return false;
        if (skipIds.indexOf(node.id) !== -1) return false;
        return true;
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
