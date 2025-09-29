// dashboard.js
(function(){
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.EcoAuth) return;
        EcoAuth.renderAuthUI();
        const user = EcoAuth.getCurrentUser();
        const history = user?.history || [];
        const latest = history[history.length-1];
        const best = history.length ? Math.min(...history.map(h=> h.score)) : null;
        setText('statScore', latest ? String(latest.score) : '—');
        setText('statBest', best !== null ? String(best) : '—');
        setText('statStreak', `${user?.streak?.days||0} days`);
        setText('statBadges', String(user?.badges?.length||0));
        renderHistoryChart(history);
        renderBreakdownChart(history);
        const list = document.getElementById('historyList');
        if (list) list.innerHTML = history.slice(-8).reverse().map(h=> `<li style="display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px dashed #e2e8f0"><span>${new Date(h.ts).toLocaleString()}</span><span>${h.score}/${h.max}</span></li>`).join('') || '<p>No results yet.</p>';
        renderBadges(user||{ badges: [] });
        updateAvatar(latest);
        updateImpact(latest);
    });

    function setText(id, text){ const el = document.getElementById(id); if (el) el.textContent = text; }

    function renderHistoryChart(history){
        const ctx = document.getElementById('historyChart'); if (!ctx) return;
        const data = history.slice(-12);
        const labels = data.map(d=> new Date(d.ts).toLocaleDateString());
        const scores = data.map(d=> d.score);
        new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Score (lower is better)', data: scores, borderColor: '#38a169', backgroundColor: 'rgba(56,161,105,0.15)', tension: 0.35, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
    }

    function renderBreakdownChart(history){
        const ctx = document.getElementById('breakdownChart'); if (!ctx) return;
        const latest = history[history.length-1];
        const categories = latest?.categories || { transport: 0, bottles: 0, food: 0, electricity: 0, recycle: 0 };
        new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(categories), datasets: [{ data: Object.values(categories), backgroundColor: ['#38a169','#63b3ed','#f6ad55','#ed64a6','#a0aec0'] }] }, options: { responsive: true, maintainAspectRatio: false } });
    }

    function renderBadges(user){
        const el = document.getElementById('badgesList'); if (!el) return;
        const badges = user.badges && user.badges.length ? user.badges : [];
        el.innerHTML = badges.length ? badges.map(b=> `<span class="badge">${b}</span>`).join(' ') : '<p>No badges yet. Take the quiz to earn some!</p>';
    }

    function updateAvatar(latest){
        const img = document.getElementById('carbonAvatar');
        const stateEl = document.getElementById('avatarState');
        if (!img || !stateEl) return;
        if (!latest) { img.src = 'assets/avatars/neutral.png'; stateEl.textContent = 'Neutral'; return; }
        const score = latest.score; // max 15
        let state = 'neutral', file = 'neutral.png';
        if (score <= 5) { state = 'happy'; file = 'happy.png'; }
        else if (score >= 11) { state = 'sad'; file = 'sad.png'; }
        img.src = `assets/avatars/${file}`;
        stateEl.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    }

    function updateImpact(latest){
        const treesEl = document.getElementById('impactTrees');
        const waterEl = document.getElementById('impactWater');
        const kmEl = document.getElementById('impactKm');
        if (!treesEl || !waterEl || !kmEl) return;
        const score = latest?.score ?? 10;
        const max = latest?.max ?? 15;
        const ecoFactor = Math.max(0, max - score);
        const trees = ecoFactor * 2; // approximate mapping
        const water = ecoFactor * 1200;
        const km = ecoFactor * 6; // km avoided proxy
        treesEl.textContent = String(trees);
        waterEl.textContent = String(water);
        kmEl.textContent = String(km);
    }
})(); 