// i18n.js
(function(){
    const translations = {
        en: {
            home_title: 'EcoStep',
            home_tagline: 'Your Personal Carbon Footprint Tracker',
            nav_home: 'Home', nav_quiz: 'Quiz', nav_results: 'Results', nav_tips: 'Eco Tips', nav_future: '2050 Mode', nav_community: 'Community', nav_about: 'About',
        },
        ur: {
            home_title: 'ایکو اسٹیپ',
            home_tagline: 'آپ کا ذاتی کاربن فٹ پرنٹ ٹریکر',
            nav_home: 'ہوم', nav_quiz: 'کوئز', nav_results: 'نتائج', nav_tips: 'مشورے', nav_future: '2050 موڈ', nav_community: 'کمیونٹی', nav_about: 'متعلق',
        }
    };

    function getLang(){ return localStorage.getItem('eco_lang') || 'en'; }
    function setLang(lang){ localStorage.setItem('eco_lang', lang); applyTranslations(); }

    function applyTranslations(){
        const lang = getLang();
        const dict = translations[lang] || translations.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
    }

    function renderLangSwitcher(){
        const container = document.getElementById('langSwitcher');
        if (!container) return;
        container.innerHTML = `
            <select id="langSelect" aria-label="Language">
                <option value="en">English</option>
                <option value="ur">اردو</option>
            </select>
        `;
        const sel = container.querySelector('#langSelect');
        sel.value = getLang();
        sel.addEventListener('change', (e)=> setLang(e.target.value));
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        renderLangSwitcher();
        applyTranslations();
    });

    window.EcoI18n = { applyTranslations, setLang, getLang };
})(); 