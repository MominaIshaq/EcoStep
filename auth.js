// auth.js - simple client-side auth and user profiles using localStorage

(function(){
    const STORAGE_KEYS = {
        users: 'eco_users',
        session: 'eco_session',
    };

    function readUsers() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); } catch { return []; }
    }
    function writeUsers(users) {
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    }
    function setSession(email) {
        localStorage.setItem(STORAGE_KEYS.session, email || '');
    }
    function getSessionEmail() {
        return localStorage.getItem(STORAGE_KEYS.session) || '';
    }

    function hashPassword(pw) {
        // lightweight hash substitute (NOT SECURE, demo only)
        let h = 0; for (let i = 0; i < pw.length; i++) { h = ((h<<5)-h) + pw.charCodeAt(i); h |= 0; }
        return String(h);
    }

    function findUser(email) {
        const users = readUsers();
        return users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    }

    function signup({ name, email, password }) {
        if (!name || !email || !password) throw new Error('All fields are required');
        const users = readUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Email already registered');
        }
        const user = {
            id: cryptoRandomId(),
            name,
            email,
            passwordHash: hashPassword(password),
            createdAt: Date.now(),
            preferences: { darkMode: localStorage.getItem('eco_dark') === '1', notifications: false, language: 'en' },
            history: [], // { ts, score, max, categories }
            goals: [],   // { id, title, target, period, progress, startTs }
            badges: [],  // strings
            streak: { days: 0, lastTs: 0 },
        };
        users.push(user);
        writeUsers(users);
        setSession(email);
        return sanitizeUser(user);
    }

    function login({ email, password }) {
        if (!email || !password) throw new Error('Email and password required');
        const user = findUser(email);
        if (!user || user.passwordHash !== hashPassword(password)) throw new Error('Invalid credentials');
        setSession(user.email);
        return sanitizeUser(user);
    }

    function logout() { setSession(''); }

    function getCurrentUser() {
        const email = getSessionEmail();
        if (!email) return null;
        const user = findUser(email);
        return user ? sanitizeUser(user) : null;
    }

    function getCurrentUserMutable() {
        const email = getSessionEmail();
        if (!email) return null;
        const users = readUsers();
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx === -1) return null;
        return { users, idx };
    }

    function savePreferences(prefs) {
        const ctx = getCurrentUserMutable();
        if (!ctx) throw new Error('Not logged in');
        ctx.users[ctx.idx].preferences = { ...ctx.users[ctx.idx].preferences, ...prefs };
        writeUsers(ctx.users);
        return sanitizeUser(ctx.users[ctx.idx]);
    }

    function saveResult({ score, max, categories }) {
        const ctx = getCurrentUserMutable();
        if (!ctx) return false; // allow anonymous
        const entry = { ts: Date.now(), score, max, categories: categories || {} };
        ctx.users[ctx.idx].history.push(entry);
        // update streak
        const streak = ctx.users[ctx.idx].streak || { days: 0, lastTs: 0 };
        const now = new Date();
        const last = streak.lastTs ? new Date(streak.lastTs) : null;
        const isNewDay = !last || now.toDateString() !== last.toDateString();
        if (isNewDay) {
            const diffDays = last ? Math.floor((now - last) / 86400000) : 0;
            streak.days = diffDays === 1 ? (streak.days + 1) : 1;
            streak.lastTs = now.getTime();
            ctx.users[ctx.idx].streak = streak;
        }
        // award simple badges
        if (ctx.users[ctx.idx].history.length === 1 && !ctx.users[ctx.idx].badges.includes('Eco Novice')) ctx.users[ctx.idx].badges.push('Eco Novice');
        if (score <= Math.floor(max/3) && !ctx.users[ctx.idx].badges.includes('Eco Warrior')) ctx.users[ctx.idx].badges.push('Eco Warrior');
        writeUsers(ctx.users);
        return true;
    }

    function getHistory() {
        const user = getCurrentUser();
        return user ? (user.history || []) : [];
    }

    function cryptoRandomId() {
        try { return (crypto.randomUUID && crypto.randomUUID()) || [...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join(''); }
        catch { return 'id-' + Math.random().toString(36).slice(2); }
    }

    function sanitizeUser(u){
        const { passwordHash, ...safe } = u; return safe;
    }

    // UI helpers
    function renderAuthUI() {
        const container = document.getElementById('authControls');
        if (!container) return;
        const user = getCurrentUser();
        if (user) {
            container.innerHTML = `
                <button class="nav-toggle" id="goDashboardBtn" aria-label="Open dashboard" onclick="window.location.href='dashboard.html'"><i class="fas fa-chart-line"></i></button>
                <button class="nav-toggle" id="logoutBtn" aria-label="Logout"><i class="fas fa-sign-out-alt"></i></button>
            `;
            const logoutBtn = container.querySelector('#logoutBtn');
            logoutBtn.addEventListener('click', () => { logout(); location.reload(); });
        } else {
            container.innerHTML = `
                <button class="nav-toggle" id="openLoginBtn" aria-label="Login"><i class="fas fa-user"></i></button>
            `;
            const btn = container.querySelector('#openLoginBtn');
            btn.addEventListener('click', openAuthModal);
        }
    }

    function openAuthModal() {
        if (document.getElementById('authModal')) { document.getElementById('authModal').classList.add('open'); return; }
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal">
                <button class="modal-close" aria-label="Close">×</button>
                <h3>Welcome to EcoStep</h3>
                <div class="tabs">
                    <button class="tab active" data-tab="login">Login</button>
                    <button class="tab" data-tab="signup">Sign Up</button>
                </div>
                <div class="tab-content" id="tab-login">
                    <form id="loginForm">
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit" class="nav-btn" style="width:100%">Login</button>
                    </form>
                </div>
                <div class="tab-content hidden" id="tab-signup">
                    <form id="signupForm">
                        <input type="text" name="name" placeholder="Full name" required />
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit" class="nav-btn" style="width:100%">Create account</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').addEventListener('click', ()=> modal.remove());
        modal.querySelector('.modal-backdrop').addEventListener('click', ()=> modal.remove());
        modal.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', ()=> switchTab(tab.dataset.tab)));
        modal.querySelector('#loginForm').addEventListener('submit', (e)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            try { login({ email: fd.get('email'), password: fd.get('password') }); location.reload(); }
            catch(err){ alert(err.message); }
        });
        modal.querySelector('#signupForm').addEventListener('submit', (e)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            try { signup({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }); location.reload(); }
            catch(err){ alert(err.message); }
        });
        injectAuthStyles();
    }

    function switchTab(name){
        document.querySelectorAll('#authModal .tab').forEach(t=> t.classList.toggle('active', t.dataset.tab===name));
        document.querySelector('#tab-login').classList.toggle('hidden', name!== 'login');
        document.querySelector('#tab-signup').classList.toggle('hidden', name!== 'signup');
    }

    function injectAuthStyles(){
        if (document.getElementById('authStyles')) return;
        const s = document.createElement('style'); s.id = 'authStyles';
        s.textContent = `
        #authModal{position:fixed;inset:0;z-index:10000;display:block}
        #authModal .modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5)}
        #authModal .modal{position:relative;margin:8vh auto 0;max-width:420px;background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 20px 60px rgba(0,0,0,.25)}
        body.dark #authModal .modal{background:#1a202c;color:#edf2f7}
        #authModal .modal-close{position:absolute;right:.75rem;top:.5rem;background:none;border:none;font-size:1.25rem;cursor:pointer}
        #authModal .tabs{display:flex;gap:.5rem;margin:.5rem 0 1rem}
        #authModal .tab{flex:1;padding:.5rem;border-radius:999px;border:1px solid #e2e8f0;background:#f7fafc;cursor:pointer}
        #authModal .tab.active{background:#38a169;color:#fff;border-color:#2f855a}
        #authModal .tab-content.hidden{display:none}
        #authModal input{width:100%;margin:.5rem 0;padding:.75rem;border-radius:10px;border:1px solid #cbd5e0;background:#fff}
        body.dark #authModal input{background:#2d3748;color:#e2e8f0;border-color:#4a5568}
        `;
        document.head.appendChild(s);
    }

    // expose
    window.EcoAuth = {
        signup, login, logout, getCurrentUser, savePreferences, saveResult, getHistory, renderAuthUI, openAuthModal
    };
})(); 