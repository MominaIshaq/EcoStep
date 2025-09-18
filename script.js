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
        category = "Eco Champion! 🌟";
        message = "Excellent! Your carbon footprint is very low. You're already making great choices for our planet. Keep up the amazing work!";
        trees = Math.floor(Math.random() * 3) + 8; // 8-10 trees
        color = "#38a169";
    } else if (score <= 7) {
        category = "Green Warrior! 🌱";
        message = "Good job! You're on the right track with eco-friendly habits. A few small changes could make you an Eco Champion!";
        trees = Math.floor(Math.random() * 3) + 5; // 5-7 trees
        color = "#68d391";
    } else if (score <= 11) {
        category = "Getting Started 🌿";
        message = "You're beginning your eco journey! There's room for improvement, but every small step counts. Check out our tips below!";
        trees = Math.floor(Math.random() * 3) + 2; // 2-4 trees
        color = "#f6ad55";
    } else {
        category = "Time for Change! 🌍";
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
    
    // Add/remove navbar background based on scroll position
    if (scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }

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
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('eco_dark', document.body.classList.contains('dark') ? '1' : '0');
}

function toggleMode2050() {
    document.body.classList.toggle('mode-2050');
    localStorage.setItem('eco_2050', document.body.classList.contains('mode-2050') ? '1' : '0');
    updateFutureProjections();
}

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
    console.log('🌱 EcoStep Carbon Footprint Tracker Initialized');
    
    // Initialize global/shared features
    initializeNavigation();
    improveAccessibility();
    optimizePerformance();
    observeElements();
    initParticles();
    initThemeScroll();
    injectGoTopButton();
    initTiltEffects();

    const page = document.body.getAttribute('data-page') || '';

    // Page: Home (no special init required)

    // Page: Quiz
    if (page === 'quiz') {
        initializeKeyboardNavigation();
        initializeSliders();
        updateQuizProgress();
        updateNavigationButtons();
    }

    // Page: Results
    if (page === 'results') {
        loadResultsFromStorage();
        updateFutureProjections();
    }

    // Page: Tips (daily tip generator)
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

    // Page: Future
    if (page === 'future') {
        updateFutureProjections();
    }

    // Page: Community
    if (page === 'community') {
        initCommunity();
    }
    // restore theme preferences
    if (localStorage.getItem('eco_dark') === '1') document.body.classList.add('dark');
    if (localStorage.getItem('eco_2050') === '1') document.body.classList.add('mode-2050');
    
    // Set up initial quiz state if quiz page
    if (page === 'quiz') updateNavigationButtons();
    
    // Add welcome message on home only
    if (page === 'home') {
        setTimeout(() => {
            showNotification('Welcome to EcoStep! Take our quiz to discover your carbon footprint.', 'success');
        }, 800);
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            margin-left: auto;
        }
        
        .notification-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
});

// ===== ERROR HANDLING =====

/**
 * Global error handler for better user experience
 */
window.addEventListener('error', function(e) {
    const detail = e?.error?.message || e?.message || 'Unknown error';
    console.error('EcoStep Error:', detail);
    // Avoid spamming identical notifications
    showNotification('Something went wrong. Please refresh the page and try again.', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(e) {
    const detail = (e && e.reason && (e.reason.message || String(e.reason))) || 'Unknown reason';
    console.error('EcoStep Promise Rejection:', detail);
    showNotification('An unexpected error occurred. Please try again.', 'error');
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
        { user: 'Aisha', text: 'Switched to a reusable bottle this week! 🌊', icon: 'fa-bottle-water' },
        { user: 'Omar', text: 'Biked to school 3 days in a row 🚲', icon: 'fa-bicycle' },
        { user: 'Sara', text: 'Replaced all bulbs with LEDs 💡', icon: 'fa-lightbulb' }
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
            showNotification('Pledge added! 🌱', 'success');
        });
    }
    renderPledges();
}
