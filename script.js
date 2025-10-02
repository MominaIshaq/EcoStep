// ===== GLOBAL VARIABLES =====
let currentQuestion = 1;
const totalQuestions = 5;
let quizAnswers = {
    transport: null,
    bottles: null,
    food: null,
    electricity: null,
    recycle: null
};
let lastScore = 0; // remember last score for 2050 projections

// ===== UTILITY FUNCTIONS =====

/**
 * Smooth scroll to a specific section
 * @param {string} elementId - The ID of the element to scroll to
 */
function scrollToSection(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== MISSING ASSET GUARD (non-intrusive) =====
document.addEventListener('DOMContentLoaded', () => {
    // Global SW registration (safe, idempotent)
    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (!reg) {
                    navigator.serviceWorker.register('./service-worker.js');
                }
            });
        } catch {}
    }
    // If the checklist link doesn't exist in the project, prevent 404 and inform the user
    const missingPdfLink = document.querySelector('a[href="assets/downloads/eco-checklist.pdf"]');
    if (missingPdfLink) {
        missingPdfLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Download will be available soon.', 'info');
        });
    }

    // Ensure mobile nav toggle works for static navbars
    try {
        document.querySelectorAll('nav.navbar .nav-container').forEach((container, idx) => {
            const menu = container.querySelector('.nav-menu');
            if (!menu) return;
            // Ensure menu has an id for aria-controls
            if (!menu.id) menu.id = `navMenu${idx+1}`;
            let toggle = container.querySelector('.nav-mobile-toggle');
            if (!toggle) {
                toggle = document.createElement('button');
                toggle.className = 'nav-mobile-toggle';
                toggle.setAttribute('aria-label', 'Toggle menu');
                toggle.innerHTML = '<i class="fas fa-bars"></i>';
                // Insert before the menu
                const logo = container.querySelector('.nav-logo');
                if (logo && logo.nextSibling) container.insertBefore(toggle, logo.nextSibling);
                else container.insertBefore(toggle, menu);
            }
            toggle.setAttribute('aria-controls', menu.id);
            toggle.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
            if (!toggle.__ecoBound) {
                toggle.__ecoBound = true;
                toggle.addEventListener('click', () => {
                    const isOpen = menu.classList.toggle('open');
                    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });
            }
        });
    } catch {}
});

// ===== SHARED LAYOUT (Navbar/Footer/Favicon/Title) =====
function renderSharedNavbar() {
    // Ensure a single navbar exists
    let nav = document.querySelector('nav.navbar');
    if (!nav) {
        nav = document.createElement('nav');
        nav.className = 'navbar';
        nav.setAttribute('role', 'navigation');
        document.body.prepend(nav);
    }
    const page = document.body.getAttribute('data-page') || '';
    const links = [
        { href: 'index.html', label: 'Home', key: 'home' },
        { href: 'about.html', label: 'About', key: 'about' },
        { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
        { href: 'results.html', label: 'Results', key: 'results' },
        { href: 'hub.html', label: 'Hub', key: 'hub' },
        { href: 'community.html', label: 'Community', key: 'community' },
    ];
    const menuHtml = links.map(l => `<li><a class="nav-link${page===l.key?' active':''}" href="${l.href}">${l.label}</a></li>`).join('');
    nav.innerHTML = `
        <div class="nav-container">
            <a class="nav-logo" href="index.html" aria-label="EcoStep Home">
                <i class="fas fa-leaf" aria-hidden="true"></i>
                <span>EcoStep</span>
            </a>
            <button class="nav-mobile-toggle" id="navMobileToggle" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
            <ul class="nav-menu" id="navMenu">${menuHtml}</ul>
            <div class="nav-actions"><div id="authControls"></div></div>
        </div>
    `;
    // Mobile toggle handler
    const toggle = nav.querySelector('#navMobileToggle');
    const menu = nav.querySelector('#navMenu');
    if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('open'));
}

function renderSharedFooter() {
    // Ensure a single footer exists
    let footer = document.querySelector('footer.footer');
    if (!footer) {
        footer = document.createElement('footer');
        footer.className = 'footer';
        document.body.appendChild(footer);
    }
    footer.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo"><i class="fas fa-leaf" aria-hidden="true"></i><span>EcoStep</span></div>
            <p class="footer-description">Making the world greener, one step at a time.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="dashboard.html">Dashboard</a></li>
              <li><a href="hub.html">Hub</a></li>
              <li><a href="community.html">Community</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Follow Us</h4>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
              <a href="#" class="social-link" aria-label="X / Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 EcoStep. All rights reserved.</p>
        </div>
      </div>`;
}

function injectBrandingHead() {
    // Favicon
    if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = 'favicon.svg';
        document.head.appendChild(link);
    }
    // Google Fonts (Inter + Poppins)
    if (!document.getElementById('gf-preconnect-1')) {
        const pc1 = document.createElement('link'); pc1.id='gf-preconnect-1'; pc1.rel='preconnect'; pc1.href='https://fonts.googleapis.com'; document.head.appendChild(pc1);
        const pc2 = document.createElement('link'); pc2.id='gf-preconnect-2'; pc2.rel='preconnect'; pc2.href='https://fonts.gstatic.com'; pc2.crossOrigin=''; document.head.appendChild(pc2);
        const gf = document.createElement('link'); gf.id='gf-inter-poppins'; gf.rel='stylesheet'; gf.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap'; document.head.appendChild(gf);
    }
    // Title standardization
    const page = document.body.getAttribute('data-page') || '';
    const map = { home:'Home', about:'About', dashboard:'Dashboard', results:'Results', hub:'Hub', community:'Community', tips:'Tips', quiz:'Quiz', students:'Students' };
    const suffix = map[page] ? ` • ${map[page]}` : '';
    if (!document.title || !document.title.startsWith('EcoStep')) document.title = `EcoStep${suffix}`;
}

function removeEmojisFromDOM(root=document.body) {
    if (!root) return;
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u2600-\u27BF]/gu;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { if (emojiRegex.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(emojiRegex, '').replace(/\s{2,}/g,' ').trim(); });
}

// integrate auth preference syncing
function syncDarkPreferenceToProfile(){
    try { if (window.EcoAuth) EcoAuth.savePreferences({ darkMode: document.body.classList.contains('dark') }); } catch {}
}

// ===== AUTH UI OVERRIDES (Navbar + Redirects) =====
function installAuthOverrides() {
    if (!window.EcoAuth || window.__ecoAuthOverridesInstalled) return;
    window.__ecoAuthOverridesInstalled = true;

    const originalOpen = EcoAuth.openAuthModal;

    function escapeHtml(str){
        return String(str || '').replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    }

    function renderNavAuth() {
        const el = document.getElementById('authControls');
        if (!el) return;
        const user = EcoAuth.getCurrentUser && EcoAuth.getCurrentUser();
        if (user) {
            el.innerHTML = `
                <span class="welcome-msg" aria-live="polite">👉 Welcome, ${escapeHtml(user.name)}!</span>
                <a class="nav-toggle" href="profile.html" aria-label="Profile"><i class="fas fa-user-circle"></i></a>
                <button class="nav-toggle" id="navLogoutBtn" aria-label="Logout"><i class="fas fa-sign-out-alt"></i></button>
            `;
            const btn = el.querySelector('#navLogoutBtn');
            if (btn) btn.addEventListener('click', () => { try { EcoAuth.logout(); } finally { window.location.href = 'index.html'; } });
        } else {
            el.innerHTML = `
                <button class="nav-toggle" id="navLoginBtn" aria-label="Login"><i class="fas fa-right-to-bracket"></i></button>
                <button class="nav-toggle" id="navSignupBtn" aria-label="Sign Up"><i class="fas fa-user-plus"></i></button>
            `;
            const login = el.querySelector('#navLoginBtn');
            const signup = el.querySelector('#navSignupBtn');
            if (login) login.addEventListener('click', () => EcoAuth.openAuthModal('login'));
            if (signup) signup.addEventListener('click', () => EcoAuth.openAuthModal('signup'));
        }
    }

    // override renderAuthUI to our navbar renderer
    EcoAuth.renderAuthUI = renderNavAuth;

    // override openAuthModal to set tab and redirect to home after success
    EcoAuth.openAuthModal = function(initialTab){
        // call original to build modal if available
        if (typeof originalOpen === 'function') originalOpen(initialTab);
        // ensure desired tab
        try {
            if (initialTab) {
                const tabBtn = document.querySelector(`#authModal .tab[data-tab="${initialTab}"]`);
                if (tabBtn) tabBtn.click();
            }
        } catch {}
        // swap submit handlers to redirect
        setTimeout(() => {
            const loginForm = document.querySelector('#authModal #loginForm');
            const signupForm = document.querySelector('#authModal #signupForm');
            if (loginForm && !loginForm.__ecoBound) {
                loginForm.__ecoBound = true;
                loginForm.addEventListener('submit', function onLoginSubmit(){
                    // after auth.js handles, redirect home
                    setTimeout(() => { window.location.href = 'index.html'; }, 0);
                }, { once: true });
            }
            if (signupForm && !signupForm.__ecoBound) {
                signupForm.__ecoBound = true;
                signupForm.addEventListener('submit', function onSignupSubmit(){
                    setTimeout(() => { window.location.href = 'index.html'; }, 0);
                }, { once: true });
            }
        }, 0);
    };

    // initial render if container exists
    renderNavAuth();
}

// ===== GO TO TOP BUTTON =====
function injectGoTopButton() {
    if (document.querySelector('.go-top')) return; // already exists
    const btn = document.createElement('button');
    btn.className = 'go-top';
    btn.setAttribute('aria-label', 'Go to top');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
}

// ===== 3D TILT HOVER EFFECT =====
function initTiltEffects() {
    const selectors = ['.tip-card', '.viz-card', '.question-card'];
    const els = document.querySelectorAll(selectors.join(','));
    els.forEach(el => {
        el.classList.add('tilt');
        let rafId = null;
        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const rx = (+15 * dy) / (rect.height / 2);
            const ry = (-15 * dx) / (rect.width / 2);
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
            });
        };
        const onLeave = () => {
            if (rafId) cancelAnimationFrame(rafId);
            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', () => el.style.transition = 'transform .12s');
        el.addEventListener('mouseleave', () => el.style.transition = 'transform .25s');
    });
}

// ===== MULTI-PAGE RESULTS LOADER =====
function loadResultsFromStorage() {
    const scoreStr = localStorage.getItem('eco_score');
    const maxStr = localStorage.getItem('eco_max');
    if (!scoreStr || !maxStr) {
        const resultTitle = document.getElementById('resultTitle');
        const resultDescription = document.getElementById('resultDescription');
        if (resultTitle) resultTitle.textContent = 'No Results Yet';
        if (resultDescription) resultDescription.textContent = 'Take the quiz first to see your personalized results.';
        return;
    }
    const score = parseInt(scoreStr, 10) || 0;
    const maxScore = parseInt(maxStr, 10) || 15;
    lastScore = score;
    displayResults(score, maxScore);
}

/**
 * Scroll to quiz section from hero button
 */
function scrollToQuiz() {
    scrollToSection('quiz');
}

/**
 * Scroll to tips section from results
 */
function scrollToTips() {
    scrollToSection('tips');
}

/**
 * Add fade-in animation to elements when they come into view
 */
function observeElements() {
    // Fade-in on view
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('fade-in');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.tip-card').forEach(card => fadeObserver.observe(card));

    // Reveal slide-up elements
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal, .viz-card').forEach(el => revealObserver.observe(el));
}

// ===== QUIZ FUNCTIONALITY =====

/**
 * Move to the next question in the quiz
 */
function nextQuestion() {
    const currentCard = document.querySelector(`[data-question="${currentQuestion}"]`);
    const slider = currentCard.querySelector('.quiz-slider');

    // Require user interaction on slider
    if (!slider || !slider.dataset.chosen) {
        showNotification('Please choose a value using the slider before proceeding.', 'warning');
        return;
    }

    // Save answer
    const questionName = slider.getAttribute('data-name');
    quizAnswers[questionName] = parseInt(slider.value);

    // Move to next
    currentCard.classList.remove('active');
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        const nextCard = document.querySelector(`[data-question="${currentQuestion}"]`);
        nextCard.classList.add('active');
        document.querySelector('.current-question').textContent = currentQuestion;
        updateNavigationButtons();
        updateQuizProgress();
    }
}

/**
 * Move to the previous question in the quiz
 */
function previousQuestion() {
    if (currentQuestion > 1) {
        // Hide current question
        const currentCard = document.querySelector(`[data-question="${currentQuestion}"]`);
        currentCard.classList.remove('active');
        
        // Show previous question
        currentQuestion--;
        const prevCard = document.querySelector(`[data-question="${currentQuestion}"]`);
        prevCard.classList.add('active');
        
        // Update progress indicator
        document.querySelector('.current-question').textContent = currentQuestion;
        
        // Update navigation buttons
        updateNavigationButtons();
        updateQuizProgress();
    }
}

/**
 * Update the state of navigation buttons based on current question
 */
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const calculateBtn = document.querySelector('.calculate-btn');
    
    // Previous button
    prevBtn.disabled = currentQuestion === 1;
    
    // Next/Calculate button
    if (currentQuestion === totalQuestions) {
        nextBtn.style.display = 'none';
        calculateBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        calculateBtn.style.display = 'none';
    }
}

/**
 * Update visual quiz progress based on answered questions
 */
function updateQuizProgress() {
    const answered = Object.values(quizAnswers).filter(v => v !== null && v !== "").length;
    const percent = Math.round((answered / totalQuestions) * 100);
    const fill = document.getElementById('quizProgressFill');
    const text = document.getElementById('quizProgressText');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}%`;
}

/**
 * Calculate carbon footprint based on quiz answers
 */
function calculateFootprint() {
    const currentCard = document.querySelector(`[data-question="${currentQuestion}"]`);
    const slider = currentCard.querySelector('.quiz-slider');
    if (!slider || !slider.dataset.chosen) {
        showNotification('Please choose a value using the slider before calculating.', 'warning');
        return;
    }
    // Save last answer
    const questionName = slider.getAttribute('data-name');
    quizAnswers[questionName] = parseInt(slider.value);

    // Calculate totals
    const totalScore = Object.values(quizAnswers).reduce((sum, value) => sum + (parseInt(value)||0), 0);
    const maxScore = 15; // 3 points × 5 questions
    lastScore = totalScore;

    // Persist to localStorage for multipage results
    try {
        localStorage.setItem('eco_answers', JSON.stringify(quizAnswers));
        localStorage.setItem('eco_score', String(totalScore));
        localStorage.setItem('eco_max', String(maxScore));
    } catch (e) { console.warn('LocalStorage not available', e); }

    // Navigate to results page with transition
    performPageTransition(() => { window.location.href = 'results.html'; });
}

/**
 * Display animated results based on the calculated score
 * @param {number} score - The calculated carbon footprint score
 * @param {number} maxScore - The maximum possible score
 */
function displayResults(score, maxScore) {
    const scoreNumber = document.getElementById('scoreNumber');
    const progressFill = document.getElementById('progressFill');
    const resultTitle = document.getElementById('resultTitle');
    const resultDescription = document.getElementById('resultDescription');
    const treeVisualization = document.getElementById('treeVisualization');
    const circular = document.getElementById('circularProgress');
    const circularPercent = document.getElementById('circularPercent');

    // Calculate percentage (lower score is better)
    const percentage = ((maxScore - score) / maxScore) * 100;

    // Animate score counter
    animateCounter(scoreNumber, 0, score, 2000);

    // Animate progress bar
    setTimeout(() => {
        progressFill.style.width = `${percentage}%`;
    }, 500);

    // Animate circular meter using stroke-dashoffset
    if (circular) {
        const r = 54; // radius matches CSS
        const circumference = 2 * Math.PI * r;
        const progress = (percentage / 100) * circumference;
        circular.style.strokeDasharray = `${circumference}`;
        circular.style.strokeDashoffset = `${circumference}`;
        setTimeout(() => {
            circular.style.strokeDashoffset = `${circumference - progress}`;
        }, 300);
    }
    if (circularPercent) animateCounter(circularPercent, 0, Math.round(percentage), 1800, '%');

    // Determine result category and message
    let category, message, trees, color;
    
    if (score <= 3) {
        category = "Eco Champion!";
        message = "Excellent! Your carbon footprint is very low. You're already making great choices for our planet. Keep up the amazing work!";
        trees = Math.floor(Math.random() * 3) + 8; // 8-10 trees
        color = "#38a169";
    } else if (score <= 7) {
        category = "Green Warrior!";
        message = "Good job! You're on the right track with eco-friendly habits. A few small changes could make you an Eco Champion!";
        trees = Math.floor(Math.random() * 3) + 5; // 5-7 trees
        color = "#68d391";
    } else if (score <= 11) {
        category = "Getting Started";
        message = "You're beginning your eco journey! There's room for improvement, but every small step counts. Check out our tips below!";
        trees = Math.floor(Math.random() * 3) + 2; // 2-4 trees
        color = "#f6ad55";
    } else {
        category = "Time for Change!";
        message = "Your carbon footprint is quite high, but don't worry! Small changes can make a big difference. Start with one tip and build from there.";
        trees = 1;
        color = "#fc8181";
    }
    
    // Update result display
    setTimeout(() => {
        resultTitle.textContent = category;
        resultTitle.style.color = color;
        resultDescription.textContent = message;
        updateAvatarAndTitle(category);
        
        // Create tree visualization
        createTreeVisualization(trees, treeVisualization);
        spawnLeaves(10);
        updateVisualizationCounters(score, maxScore);
        updateFutureProjections();
    }, 1000);
}

/**
 * Animate a number counter from start to end
 * @param {HTMLElement} element - The element to animate
 * @param {number} start - Starting number
 * @param {number} end - Ending number
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = `${current}${suffix}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Create animated tree visualization
 * @param {number} treeCount - Number of trees to display
 * @param {HTMLElement} container - Container element for trees
 */
function createTreeVisualization(treeCount, container) {
    container.innerHTML = '';
    
    for (let i = 0; i < treeCount; i++) {
        const tree = document.createElement('span');
        tree.className = 'tree';
        tree.innerHTML = '<i class="fas fa-tree"></i>';
        tree.style.animationDelay = `${i * 0.2}s`;
        container.appendChild(tree);
    }
    
    // Add descriptive text
    const description = document.createElement('p');
    description.style.marginTop = '1rem';
    description.style.color = '#38a169';
    description.style.fontWeight = 'bold';
    description.textContent = `Your daily habits impact is equivalent to ${treeCount} tree${treeCount !== 1 ? 's' : ''}`;
    container.appendChild(description);
}

/**
 * Spawn animated leaves for ambience
 */
function spawnLeaves(count = 8) {
    const field = document.getElementById('leafField');
    if (!field) return;
    field.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'leaf';
        leaf.innerHTML = '<i class="fas fa-leaf"></i>';
        leaf.style.left = `${Math.random() * 90 + 5}%`;
        leaf.style.animationDelay = `${Math.random() * 1.2}s`;
        field.appendChild(leaf);
    }
}

/**
 * Initialize quiz sliders to mark as chosen on interaction and update progress
 */
function initializeSliders() {
    document.querySelectorAll('.quiz-slider').forEach(slider => {
        // When user moves the slider, mark it chosen and store temporary answer for progress
        const name = slider.getAttribute('data-name');
        const handler = () => {
            slider.dataset.chosen = '1';
            quizAnswers[name] = parseInt(slider.value);
            updateQuizProgress();
        };
        slider.addEventListener('input', handler);
        slider.addEventListener('change', handler);
    });
}

/**
 * Update visualization counters (trees, water, energy)
 */
function updateVisualizationCounters(score, maxScore) {
    const ecoFactor = Math.max(0, maxScore - score); // more eco => higher factor
    const trees = ecoFactor * 2;           // trees per year estimate
    const water = ecoFactor * 1200;        // liters saved
    const energy = ecoFactor * 40;         // kWh saved

    const treesEl = document.getElementById('vizTrees');
    const waterEl = document.getElementById('vizWater');
    const energyEl = document.getElementById('vizEnergy');

    if (treesEl) animateCounter(treesEl, 0, trees, 1500);
    if (waterEl) animateCounter(waterEl, 0, water, 1500);
    if (energyEl) animateCounter(energyEl, 0, energy, 1500);
}

/**
 * Reset quiz to start over
 */
function retakeQuiz() {
    // Reset variables
    currentQuestion = 1;
    quizAnswers = {
        transport: null,
        bottles: null,
        food: null,
        electricity: null,
        recycle: null
    };
    
    // Reset all sliders to empty (no value) visually by clearing value attribute
    document.querySelectorAll('.quiz-slider').forEach(slider => {
        slider.value = "";
    });
    
    // Reset question display
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector('[data-question="1"]').classList.add('active');
    
    // Reset progress indicator
    document.querySelector('.current-question').textContent = '1';
    
    // Reset navigation buttons
    updateNavigationButtons();
    updateQuizProgress();
    
    // Show quiz section and hide results
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Scroll to quiz
    scrollToSection('quiz');
    
    showNotification('Quiz reset! Ready to start again?', 'success');
}

// ===== NOTIFICATION SYSTEM =====

/**
 * Show a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'warning', 'error')
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * Get appropriate icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Font Awesome icon name
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Get appropriate color for notification type
 * @param {string} type - Notification type
 * @returns {string} CSS color value
 */
function getNotificationColor(type) {
    const colors = {
        success: '#38a169',
        warning: '#ed8936',
        error: '#e53e3e',
        info: '#3182ce'
    };
    return colors[type] || colors.info;
}

// ===== SMOOTH SCROLLING FOR NAVIGATION =====

/**
 * Handle navigation link clicks for smooth scrolling
 */
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            // External or page navigation
            if (href.endsWith('.html')) {
                e.preventDefault();
                performPageTransition(() => { window.location.href = href; });
                return;
            }
            // In-page anchor
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                performPageTransition(() => scrollToSection(targetId));
            }
        });
    });
}

// ===== KEYBOARD NAVIGATION =====

/**
 * Handle keyboard navigation for quiz
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Only handle keyboard navigation when quiz is visible
        const quizSection = document.getElementById('quiz');
        if (quizSection.style.display === 'none') return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'Enter':
                e.preventDefault();
                if (currentQuestion < totalQuestions) {
                    nextQuestion();
                } else {
                    calculateFootprint();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                e.preventDefault();
                // set current slider quickly
                setSliderValue(parseInt(e.key) - 1);
                break;
        }
    });
}

/**
 * Select an option by index (for keyboard navigation)
 * @param {number} index - The index of the option to select (0-based)
 */
function setSliderValue(index) {
    const currentCard = document.querySelector(`[data-question="${currentQuestion}"]`);
    const slider = currentCard.querySelector('.quiz-slider');
    if (!slider) return;
    // Clamp index 0..3 to slider value 0..3
    const value = Math.max(0, Math.min(3, index));
    slider.value = value;
    // little feedback pulse
    slider.style.transition = 'transform 0.15s';
    slider.style.transform = 'scale(1.02)';
    setTimeout(() => slider.style.transform = 'scale(1)', 150);
}

// ===== ACCESSIBILITY IMPROVEMENTS =====

/**
 * Add ARIA labels and improve accessibility
 */
function improveAccessibility() {
    // Add ARIA labels to quiz navigation
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const calculateBtn = document.querySelector('.calculate-btn');
    
    if (prevBtn) prevBtn.setAttribute('aria-label', 'Go to previous question');
    if (nextBtn) nextBtn.setAttribute('aria-label', 'Go to next question');
    if (calculateBtn) calculateBtn.setAttribute('aria-label', 'Calculate carbon footprint');
    
    // Add focus management for better keyboard navigation
    // Make slider containers focusable
    document.querySelectorAll('.slider-control').forEach(ctrl => {
        ctrl.setAttribute('tabindex', '0');
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====

/**
 * Lazy load images and optimize performance
 */
function optimizePerformance() {
    // Preload critical images
    const criticalImages = [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(handleScroll, 16); // ~60fps
    });
}

/**
 * Handle scroll events for navbar transparency and animations
 */
function handleScroll() {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.scrollY;
    
    // Maintain navbar background; guard if navbar is missing
    if (navbar) navbar.style.background = 'rgba(255, 255, 255, 0.95)';

    // Parallax effect for hero background
    const hero = document.querySelector('[data-parallax] .hero-background');
    if (hero) {
        const speed = 0.3;
        hero.style.transform = `translateY(${scrollY * speed}px)`;
    }

    // Toggle Go To Top visibility
    const goTop = document.querySelector('.go-top');
    if (goTop) {
        if (scrollY > 400) goTop.classList.add('visible');
        else goTop.classList.remove('visible');
    }
}

// ===== PAGE TRANSITIONS =====
/**
 * Brief overlay fade to make section transitions feel smoother
 */
function performPageTransition(callback) {
    const overlay = document.getElementById('pageTransition');
    if (!overlay) { if (typeof callback === 'function') callback(); return; }
    overlay.classList.add('active');
    setTimeout(() => {
        try { if (typeof callback === 'function') callback(); } finally {
            setTimeout(() => overlay.classList.remove('active'), 250);
        }
    }, 250);
}

// ===== PARTICLES BACKGROUND =====
/**
 * Lightweight particles (leaves, bubbles) floating subtly in the background
 */
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const count = Math.min(80, Math.floor((width * height) / 25000)); // scale with area

    function rand(min, max) { return Math.random() * (max - min) + min; }
    function reset(p) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.vx = rand(-0.15, 0.15);
        p.vy = rand(0.05, 0.25);
        p.size = rand(1.2, 3.2);
        p.type = Math.random() < 0.5 ? 'leaf' : (Math.random() < 0.5 ? 'water' : 'bubble');
        p.alpha = rand(0.35, 0.75);
    }
    for (let i = 0; i < count; i++) { const p = {}; reset(p); particles.push(p); }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            ctx.globalAlpha = p.alpha;
            if (p.type === 'leaf') ctx.fillStyle = '#68d391';
            else if (p.type === 'water') ctx.fillStyle = '#63b3ed';
            else ctx.fillStyle = '#a0aec0';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            // move
            p.x += p.vx; p.y += p.vy;
            if (p.y - p.size > height) { p.y = -p.size; }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();

    // handle resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// ===== THEME SWITCH WITH SCROLL (SECTION/TIMELINE) =====
function initThemeScroll() {
    const themes = ['theme-forest','theme-water','theme-city','theme-future'];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const t = el.getAttribute('data-theme');
            if (!t) return;
            // remove previous themes and apply new one
            themes.forEach(cls => document.body.classList.remove(cls));
            document.body.classList.add(`theme-${t}`);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-theme]').forEach(el => observer.observe(el));
}

// ===== AVATAR + TITLE (GAMIFICATION) =====
function updateAvatarAndTitle(category) {
    const avatar = document.getElementById('ecoAvatar');
    const title = document.getElementById('ecoTitle');
    if (!avatar || !title) return;
    avatar.classList.remove('happy','neutral','sad','glow');
    let t = 'Eco Explorer';
    if (category.includes('Champion')) { avatar.classList.add('happy','glow'); t = 'Eco Guardian'; }
    else if (category.includes('Green Warrior')) { avatar.classList.add('happy'); t = 'Green Warrior'; }
    else if (category.includes('Getting Started')) { avatar.classList.add('neutral'); t = 'Tree Saver'; }
    else { avatar.classList.add('sad'); t = 'Time for Change'; }
    title.textContent = t;
}

// ===== THEME TOGGLES =====
// Removed dark/light and 2050 UI toggles per requirements

function updateFutureProjections() {
    // Simple projections based on lastScore
    const factor = Math.max(1, 16 - lastScore); // higher when more eco
    const water = 3000 * factor;  // liters by 2050
    const energy = 80 * factor;   // kWh extra/less
    const trees = 10 * factor;    // trees saved
    const wEl = document.getElementById('futureWater');
    const eEl = document.getElementById('futureEnergy');
    const tEl = document.getElementById('futureTrees');
    if (wEl) wEl.textContent = `By 2050, you may waste ${water.toLocaleString()} liters of water.`;
    if (eEl) eEl.textContent = `By 2050, you may consume ${energy.toLocaleString()} kWh extra energy.`;
    if (tEl) tEl.textContent = `By 2050, you may save ${trees.toLocaleString()} trees.`;
}

// ===== INITIALIZATION =====

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('EcoStep Carbon Footprint Tracker Initialized');
    // Shared branding + layout first
    injectBrandingHead();
    renderSharedNavbar();
    renderSharedFooter();
    removeEmojisFromDOM();
    
    initializeNavigation();
    improveAccessibility();
    optimizePerformance();
    observeElements();
    initParticles();
    initThemeScroll();
    injectGoTopButton();
    initTiltEffects();

    installAuthOverrides();
    if (window.EcoAuth) { try { EcoAuth.renderAuthUI(); } catch {} }
    const page = document.body.getAttribute('data-page') || '';

    if (page === 'quiz') {
        const logged = window.EcoAuth && EcoAuth.getCurrentUser();
        if (!logged) {
            showNotification('You can try the quiz now. Login to save your results.', 'info');
            setTimeout(()=>{ if (window.EcoAuth) EcoAuth.openAuthModal(); }, 300);
        }
        initializeKeyboardNavigation();
        initializeSliders();
        updateQuizProgress();
        updateNavigationButtons();
    }

    if (page === 'results') {
        loadResultsFromStorage();
        updateFutureProjections();
    }

    if (page === 'tips') {
        const tips = [
            'Carry a reusable bottle to cut plastic waste and save money!',
            'Switch to LED bulbs to save up to 80% energy.',
            'Plan meals and store food properly to reduce waste.',
            'Use public transport or carpool once a week.',
            'Unplug devices when not in use to reduce phantom power.',
            'Bring your own shopping bags to replace plastic.'
        ];
        const tipEl = document.getElementById('dailyTipText');
        const btn = document.getElementById('dailyTipBtn');
        const shuffle = () => {
            const pick = tips[Math.floor(Math.random() * tips.length)];
            if (tipEl) tipEl.textContent = pick;
        };
        if (btn) btn.addEventListener('click', shuffle);
        shuffle();
    }

    if (page === 'future') { updateFutureProjections(); }
    if (page === 'community') { initCommunity(); }
    if (page === 'profile') { initProfile(); }

    if (page === 'quiz') updateNavigationButtons();

    if (page === 'home') {
        setTimeout(() => {
            // keep welcome toast minimal
            showNotification('Welcome to EcoStep! Take our quiz to discover your carbon footprint.', 'success');
        }, 800);
    }

    const style = document.createElement('style');
    style.textContent = `@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}.notification-content{display:flex;align-items:center;gap:.5rem}.notification-close{background:none;border:none;color:#fff;cursor:pointer;padding:.25rem;margin-left:auto}.notification-close:hover{opacity:.7}`;
    document.head.appendChild(style);

    // Inject minimal navbar welcome styles for consistency
    if (!document.getElementById('authWelcomeStyles')) {
        const s = document.createElement('style');
        s.id = 'authWelcomeStyles';
        s.textContent = `
            .welcome-msg{color:#2d3748;font-weight:600;background:#f0fff4;border:1px solid #b2f5ea;border-radius:999px;padding:.3rem .6rem;margin-right:.25rem}
            body.dark .welcome-msg{color:#e2e8f0;background:#0b3d2d;border-color:#1b6b55}
            .hide-sm{display:inline}
            @media(max-width:768px){.hide-sm{display:none}.welcome-msg{display:none}}
        `;
        document.head.appendChild(s);
    }
});

// Reduce noisy global alerts: log to console only
window.addEventListener('error', function(e) {
    const detail = e?.error?.message || e?.message || 'Unknown error';
    console.warn('EcoStep Error:', detail);
});
window.addEventListener('unhandledrejection', function(e) {
    const detail = (e && e.reason && (e.reason.message || String(e.reason))) || 'Unknown reason';
    console.warn('EcoStep Promise Rejection:', detail);
});

// ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
// These functions are called from HTML onclick attributes
window.scrollToQuiz = scrollToQuiz;
window.scrollToTips = scrollToTips;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.calculateFootprint = calculateFootprint;
window.retakeQuiz = retakeQuiz;

// ===== COMMUNITY PAGE LOGIC =====
function initCommunity() {
    // Mock feed
    const feed = [
        { user: 'Aisha', text: 'Switched to a reusable bottle this week!', icon: 'fa-bottle-water' },
        { user: 'Omar', text: 'Biked to school 3 days in a row', icon: 'fa-bicycle' },
        { user: 'Sara', text: 'Replaced all bulbs with LEDs', icon: 'fa-lightbulb' }
    ];
    const feedEl = document.getElementById('communityFeed');
    if (feedEl) {
        feedEl.innerHTML = feed.map(p => `
            <div class="post">
                <div class="post-icon"><i class="fas ${p.icon}"></i></div>
                <div class="post-content"><strong>${p.user}</strong> <span>${p.text}</span></div>
            </div>
        `).join('');
    }

    // Leaderboard from stored scores (mock fallback)
    const lbEl = document.getElementById('leaderboard');
    const youScore = parseInt(localStorage.getItem('eco_score') || '0', 10);
    const board = [
        { name: 'You', score: youScore },
        { name: 'Alex', score: 6 },
        { name: 'Jordan', score: 4 },
        { name: 'Taylor', score: 9 }
    ].sort((a,b) => a.score - b.score).slice(0,5);
    if (lbEl) {
        lbEl.innerHTML = board.map((r,i)=>`<li><span>#${i+1} ${r.name}</span><span>${r.score} pts</span></li>`).join('');
    }

    // Pledge wall
    const pledgeForm = document.getElementById('pledgeForm');
    const pledgeList = document.getElementById('pledgeList');
    function renderPledges() {
        const pledges = JSON.parse(localStorage.getItem('eco_pledges') || '[]');
        if (pledgeList) pledgeList.innerHTML = pledges.map(p => `<li><i class="fas fa-leaf"></i> <strong>${p.name}</strong>: ${p.text}</li>`).join('');
    }
    if (pledgeForm) {
        pledgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = pledgeForm.querySelector('[name="name"]').value.trim() || 'Guest';
            const text = pledgeForm.querySelector('[name="pledge"]').value.trim();
            if (!text) { showNotification('Please enter a pledge.', 'warning'); return; }
            const pledges = JSON.parse(localStorage.getItem('eco_pledges') || '[]');
            pledges.unshift({ name, text, ts: Date.now() });
            localStorage.setItem('eco_pledges', JSON.stringify(pledges));
            pledgeForm.reset();
            renderPledges();
            showNotification('Pledge added!', 'success');
        });
    }
    renderPledges();
}
