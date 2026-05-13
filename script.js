/* =====================================================
   ZEROFY - Stock Market Analysis Website
   JavaScript File
   ===================================================== */

// ===== INTERACTIVE MONEY BACKGROUND (canvas) =====

(function initInteractiveMoneyBackground() {
    const canvas = document.getElementById('stockBackground');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, active: false };

    const CURRENCY_SYMBOLS = ['$', '₹', '€', '£', '¥', '₿', '¢', '¤'];
    const MARKET_MARKS = ['+', '%', '≈', '∑'];

    let pieces = [];
    let repelRadius = 160;

    function moneyCountForViewport() {
        const w = window.innerWidth;
        if (w < 480) return 34;
        if (w < 768) return 46;
        if (w < 1200) return 58;
        return 72;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        repelRadius = canvas.width < 520 ? 128 : 168;
        ctx.fillStyle = '#060809';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        rebuildPieces();
    }

    function rebuildPieces() {
        const n = moneyCountForViewport();
        pieces = [];
        for (let i = 0; i < n; i++) {
            pieces.push(new MoneyPiece());
        }
    }

    function pickGlyph() {
        const r = Math.random();
        if (r < 0.72) return { kind: 'symbol', char: CURRENCY_SYMBOLS[Math.floor(Math.random() * CURRENCY_SYMBOLS.length)] };
        if (r < 0.9) return { kind: 'symbol', char: MARKET_MARKS[Math.floor(Math.random() * MARKET_MARKS.length)] };
        return { kind: 'note' };
    }

    class MoneyPiece {
        constructor() {
            const g = pickGlyph();
            this.kind = g.kind;
            this.char = g.char || '$';
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.0035;
            this.phase = Math.random() * Math.PI * 2;
            if (this.kind === 'note') {
                this.fontSize = 12 + Math.random() * 8;
                this.opacity = 0.18 + Math.random() * 0.22;
            } else {
                this.fontSize = 16 + Math.random() * 28;
                this.opacity = 0.14 + Math.random() * 0.32;
            }
            this.tint = Math.random() > 0.42 ? 'green' : 'gold';
        }

        update() {
            const pw = canvas.width;
            const ph = canvas.height;
            const t = Date.now() * 0.001;

            if (pointer.active) {
                const dx = this.x - pointer.x;
                const dy = this.y - pointer.y;
                const distSq = dx * dx + dy * dy;
                const r = repelRadius;
                if (distSq < r * r && distSq > 1) {
                    const dist = Math.sqrt(distSq);
                    const strength = (r - dist) / r;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const push = strength * 1.02;
                    this.vx += nx * push * 0.16;
                    this.vy += ny * push * 0.16;
                    this.spin += strength * (nx * this.vy - ny * this.vx) * 0.000045;
                }
            }

            this.vx += Math.sin(t * 0.85 + this.phase) * 0.016;
            this.vy += Math.cos(t * 0.7 + this.phase * 1.2) * 0.016;
            this.vx += (Math.random() - 0.5) * 0.01;
            this.vy += (Math.random() - 0.5) * 0.01;

            this.vx *= 0.987;
            this.vy *= 0.987;
            this.spin *= 0.993;

            this.rotation += this.spin;
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -40) this.x = pw + 40;
            else if (this.x > pw + 40) this.x = -40;
            if (this.y < -40) this.y = ph + 40;
            else if (this.y > ph + 40) this.y = -40;
        }

        draw() {
            let boost = 0;
            if (pointer.active) {
                const d = Math.hypot(this.x - pointer.x, this.y - pointer.y);
                if (d < 200) boost = (1 - d / 200) * 0.42;
            }
            const alpha = Math.min(0.92, this.opacity + boost);

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.kind === 'symbol') {
                const fs = this.fontSize;
                ctx.font = `700 ${fs}px "Segoe UI", "Helvetica Neue", system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (this.tint === 'gold') {
                    ctx.fillStyle = `rgba(230, 196, 95, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(0, 208, 132, ${alpha})`;
                }
                if (boost > 0.06) {
                    ctx.shadowColor = 'rgba(0, 208, 132, 0.55)';
                    ctx.shadowBlur = 10 + boost * 22;
                }
                ctx.fillText(this.char, 0, 0);
                ctx.shadowBlur = 0;
            } else {
                const w = this.fontSize * 2.35;
                const h = this.fontSize * 1.15;
                const rr = 4;
                ctx.fillStyle = `rgba(6, 18, 12, ${Math.min(0.88, alpha + 0.05)})`;
                ctx.strokeStyle = `rgba(0, 208, 132, ${alpha})`;
                ctx.lineWidth = 1.25;
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(-w / 2, -h / 2, w, h, rr);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                    ctx.strokeRect(-w / 2, -h / 2, w, h);
                }
                ctx.fillStyle = `rgba(0, 208, 132, ${alpha * 0.9})`;
                ctx.font = `600 ${Math.max(10, this.fontSize * 0.5)}px "Segoe UI", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('₹', 0, 0);
                ctx.fillStyle = `rgba(255,255,255,${alpha * 0.12})`;
                ctx.fillRect(-w / 2 + 4, -h / 2 + 3, w * 0.22, h - 6);
            }

            ctx.restore();
        }
    }

    function tick() {
        ctx.fillStyle = 'rgba(6, 8, 10, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => p.update());
        pieces.forEach(p => {
            if (p.kind === 'note') p.draw();
        });
        pieces.forEach(p => {
            if (p.kind !== 'note') p.draw();
        });

        requestAnimationFrame(tick);
    }

    let pointerIdleTimer;
    window.addEventListener(
        'pointermove',
        e => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            pointer.active = true;
            clearTimeout(pointerIdleTimer);
            pointerIdleTimer = window.setTimeout(() => {
                pointer.active = false;
            }, 2200);
        },
        { passive: true }
    );

    window.addEventListener('blur', () => {
        pointer.active = false;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pointer.active = false;
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    requestAnimationFrame(tick);
})();

// ===== GOOGLE SHEETS BACKEND INTEGRATION =====

const SHEETS_API = 'https://script.google.com/macros/s/AKfycbyvO2TBg3mfDiDeo58VeiB0m8NDBN8jJiUguRaXHRg72XZvgg0Y63hvbtpy47_TuQjT/exec';
const BACKEND_ACCESS_ERROR = 'Signup is blocked because the Google Sheets backend is not public yet. In Apps Script, deploy the web app with "Execute as: Me" and "Who has access: Anyone", then use the latest /exec URL.';

function normalizePortfolio(portfolio) {
    if (Array.isArray(portfolio)) return portfolio;
    if (!portfolio) return [];

    try {
        const parsed = typeof portfolio === 'string' ? JSON.parse(portfolio) : portfolio;
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Unable to parse portfolio from backend:', error);
        return [];
    }
}

async function postToSheets(action, payload = {}) {
    let response;

    try {
        response = await fetch(SHEETS_API, {
            method: 'POST',
            headers: {
                // Avoids an Apps Script CORS preflight while still sending JSON.
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({ action, ...payload })
        });
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(BACKEND_ACCESS_ERROR);
        }

        throw error;
    }

    const rawText = await response.text();
    let data;

    if (response.status === 401 || response.status === 403) {
        throw new Error(BACKEND_ACCESS_ERROR);
    }

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        throw new Error('Google Sheets returned an invalid response.');
    }

    if (!response.ok) {
        throw new Error(data.message || 'Google Sheets request failed.');
    }

    return data;
}

// ===== USER AUTHENTICATION & DATABASE =====

// Session management
class SessionManager {
    constructor() {
        this.currentUser = this.loadSession();
    }

    saveSession(user) {
        const normalizedUser = {
            ...user,
            portfolio: normalizePortfolio(user.portfolio),
            savedStocks: normalizePortfolio(user.savedStocks)
        };

        sessionStorage.setItem('currentUser', JSON.stringify(normalizedUser));
        this.currentUser = normalizedUser;
        this.updateUI();
    }

    loadSession() {
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                this.currentUser.portfolio = normalizePortfolio(this.currentUser.portfolio);
                this.currentUser.savedStocks = normalizePortfolio(this.currentUser.savedStocks);
                this.updateUI();
                return this.currentUser;
            } catch (error) {
                console.warn('Clearing invalid saved session:', error);
                sessionStorage.removeItem('currentUser');
            }
        }
        return null;
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI();
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getSession() {
        return this.currentUser;
    }

    updateUI() {
        const loginItem = document.getElementById('loginItem');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            loginItem.style.display = 'none';
            userProfile.style.display = 'flex';
            userProfile.style.gap = '1rem';
            userProfile.style.alignItems = 'center';
            userName.textContent = (this.currentUser.name || this.currentUser.email || 'User').split(' ')[0];
        } else {
            loginItem.style.display = 'block';
            userProfile.style.display = 'none';
        }
    }
}

const sessionManager = new SessionManager();

function isAboutStandalonePage() {
    return /about\.html$/i.test(window.location.pathname || '');
}

// Login handler (Google Sheets)
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
        const data = await postToSheets('login', { email, password });

        if (data.success) {
            sessionManager.saveSession({
                id: data.id,
                name: data.name,
                email: data.email || email,
                portfolio: data.portfolio,
                savedStocks: data.savedStocks
            });
            closeLoginModal();
            document.getElementById('loginForm').reset();
            alert('Login successful!');
            if (isAboutStandalonePage()) {
                window.location.href = 'index.html#home';
            } else {
                showPage('home');
                window.scrollTo(0, 0);
            }
        } else {
            alert(data.message || 'Login failed!');
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert(error.message || 'Network error. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

// Signup handler (Google Sheets)
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const submitButton = event.target.querySelector('button[type="submit"]');

    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';

    try {
        const data = await postToSheets('signup', { name, email, password });

        if (data.success) {
            sessionManager.saveSession({
                id: data.id,
                name: data.name || name,
                email: data.email || email,
                portfolio: data.portfolio,
                savedStocks: data.savedStocks
            });
            closeSignupModal();
            document.getElementById('signupForm').reset();
            alert('Signup successful!');
            if (isAboutStandalonePage()) {
                window.location.href = 'index.html#home';
            } else {
                showPage('home');
                window.scrollTo(0, 0);
            }
        } else {
            alert(data.message || 'Signup failed!');
        }
    } catch (error) {
        console.error('Signup failed:', error);
        alert(error.message || 'Network error. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
    }
}

async function addToPortfolio(symbol) {
    if (!sessionManager.isLoggedIn()) {
        alert('Please login to add stocks to your portfolio!');
        openLoginModal();
        return;
    }

    const stock = stocksData.find(s => s.symbol === symbol);
    const user = sessionManager.getSession();

    // Check if stock already in portfolio (client-side only)
    if (user.portfolio && user.portfolio.some(s => s.symbol === symbol)) {
        alert(`${symbol} is already in your portfolio!`);
        return;
    }

    try {
        const data = await postToSheets('addPortfolio', { id: user.id, stock });

        if (data.success) {
            user.portfolio = data.portfolio !== undefined
                ? normalizePortfolio(data.portfolio)
                : normalizePortfolio(user.portfolio);
            if (!user.portfolio.some(s => s.symbol === symbol)) {
                user.portfolio.push(stock);
            }
            sessionManager.saveSession(user);
            alert(`${symbol} added to your portfolio!`);
        } else {
            alert(data.message || 'Failed to add stock!');
        }
    } catch (error) {
        console.error('Portfolio update failed:', error);
        alert(error.message || 'Network error. Please try again.');
    }
}

// ===== LOGIN/SIGNUP MODALS =====

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

// ===== STOCK DATA =====

const stocksData = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 2.5, changePercent: 1.33 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 375.20, change: 5.10, changePercent: 1.38 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: 3.20, changePercent: 2.29 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.50, change: -2.30, changePercent: -1.27 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.30, change: 8.50, changePercent: 3.58 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.60, change: -5.40, changePercent: -1.10 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.20, change: 12.30, changePercent: 2.84 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, change: 25.80, changePercent: 3.04 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 158.90, change: 2.10, changePercent: 1.33 },
    { symbol: 'V', name: 'Visa Inc.', price: 265.30, change: 3.50, changePercent: 1.33 }
];

function fillStocksGrid(grid) {
    if (!grid) return;
    grid.innerHTML = '';

    stocksData.forEach(stock => {
        const isPositive = stock.change >= 0;
        const stockCard = document.createElement('div');
        stockCard.className = 'stock-card';
        stockCard.innerHTML = `
            <div class="stock-symbol">${stock.symbol}</div>
            <div class="stock-name">${stock.name}</div>
            <div class="stock-price">$${stock.price.toFixed(2)}</div>
            <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)} (${stock.changePercent.toFixed(2)}%)
            </div>
            <button class="stock-btn" onclick="addToPortfolio('${stock.symbol}')">Add to Portfolio</button>
        `;
        grid.appendChild(stockCard);
    });
}

// ===== SPA NAVIGATION (navbar + full-page views) =====

const SPA_ROUTE_IDS = ['home', 'stocks', 'analyse', 'premium'];

function showPage(page) {
    document.querySelectorAll('.page-section').forEach(el => {
        el.style.display = 'none';
    });

    if (page === 'home') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.style.display = '';
        document.querySelectorAll('main > section').forEach(sec => {
            sec.style.display = '';
        });
        window.scrollTo(0, 0);
        return;
    }

    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.display = 'none';
    document.querySelectorAll('main > section').forEach(sec => {
        sec.style.display = 'none';
    });

    const pageEl = document.getElementById(page + 'Page');
    if (!pageEl) {
        if (mainEl) mainEl.style.display = '';
        document.querySelectorAll('main > section').forEach(sec => {
            sec.style.display = '';
        });
        return;
    }

    pageEl.style.display = 'block';
    window.scrollTo(0, 0);

    if (page === 'stocks') {
        fillStocksGrid(document.getElementById('stocksGridPage'));
    }
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    sessionManager.logout();
    if (document.getElementById('logoutPage')) {
        showPage('logout');
    } else {
        window.location.href = 'index.html#home';
    }
}

// ===== POPULATE STOCKS SECTION =====

function populateStocks() {
    fillStocksGrid(document.getElementById('stocksGrid'));
}

// ===== SMOOTH SCROLLING =====

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== MOBILE NAV (drawer + backdrop) =====

(function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');

    if (!hamburger || !navMenu) return;

    function setMobileNavOpen(open) {
        const isOpen = Boolean(open);
        navMenu.classList.toggle('active', isOpen);
        document.body.classList.toggle('nav-menu-open', isOpen);
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        if (navBackdrop) {
            navBackdrop.setAttribute('aria-hidden', String(!isOpen));
        }
    }

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        setMobileNavOpen(!navMenu.classList.contains('active'));
    });

    if (navBackdrop) {
        navBackdrop.addEventListener('click', () => setMobileNavOpen(false));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            setMobileNavOpen(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            setMobileNavOpen(false);
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => setMobileNavOpen(false));
    });

    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => setMobileNavOpen(false));
    });
})();

// ===== INITIALIZE ON PAGE LOAD =====

function applyInitialHashRoute() {
    const raw = window.location.hash;
    if (!raw || raw.length < 2) return;
    const id = raw.slice(1).split('&')[0];
    if (SPA_ROUTE_IDS.includes(id)) {
        showPage(id);
    }
}

function getFinBotReply(text) {
    const t = text.toLowerCase().trim();
    if (!t) {
        return 'Type a question and I will share a quick, analysis-style tip.';
    }
    if (/^(hi|hello|hey)\b/.test(t)) {
        return 'Hello! I am FinBot. Ask about stocks, risk, diversification, or commodities — I will keep it practical.';
    }
    if (/\b(stock|stocks|aapl|nvda|msft|market|invest|equity|ticker)\b/.test(t)) {
        return 'For equities, look at earnings trend, balance sheet strength, and how the name fits your time horizon. Diversify across sectors — our Trending Stocks area is a good place to compare symbols.';
    }
    if (/\b(risk|volatile|volatility|crash|drawdown)\b/.test(t)) {
        return 'Risk is normal in markets. Size positions sensibly, avoid going all-in on one ticker, and keep liquidity outside equities. When volatility spikes, revisit allocation instead of panic-trading.';
    }
    if (/\b(portfolio|diversify|allocation|rebalance)\b/.test(t)) {
        return 'Think in layers: core quality holdings, a few satellite ideas, and optional diversifiers like gold when uncertainty rises. Rebalance when any sleeve drifts far from your plan.';
    }
    if (/\b(gold|silver|commodit|inflation)\b/.test(t)) {
        return 'Commodities often move differently from stocks. Gold is often viewed as a store of value in inflation or stress; silver blends industrial demand with investment flows. See our Gold & Silver section on the home page for context.';
    }
    if (/\b(zerofy|about|team|founder)\b/.test(t)) {
        return 'ZEROFY is built to make analysis clearer. Meet our co-founders on the About Us page — linked from the home hero.';
    }
    if (/\b(thanks|thank you|bye|goodbye)\b/.test(t)) {
        return 'You are welcome — happy analyzing!';
    }
    return 'I am a guided assistant (not personalized financial advice). Try words like stocks, risk, gold, or portfolio, or explore Premium tools on the main site for deeper workflows.';
}

function initFinBot() {
    const root = document.getElementById('finbot');
    if (!root) return;

    const toggle = document.getElementById('finbotToggle');
    const panel = document.getElementById('finbotPanel');
    const closeBtn = document.getElementById('finbotClose');
    const form = document.getElementById('finbotForm');
    const input = document.getElementById('finbotInput');
    const messages = document.getElementById('finbotMessages');

    if (!toggle || !panel || !closeBtn || !form || !input || !messages) return;

    function appendMsg(text, role) {
        const div = document.createElement('div');
        div.className = `finbot-msg finbot-msg--${role}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function openPanel() {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        input.focus();
    }

    function closePanel() {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    }

    function seedWelcome() {
        if (messages.dataset.seeded) return;
        appendMsg('Hi! I am FinBot. Ask me about market analysis basics — stocks, risk, or commodities.', 'bot');
        messages.dataset.seeded = '1';
    }

    toggle.addEventListener('click', () => {
        if (panel.hidden) {
            seedWelcome();
            openPanel();
        } else {
            closePanel();
        }
    });

    closeBtn.addEventListener('click', closePanel);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        appendMsg(text, 'user');
        input.value = '';
        const reply = getFinBotReply(text);
        window.setTimeout(() => appendMsg(reply, 'bot'), 320);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateStocks();
    sessionManager.loadSession();
    applyInitialHashRoute();
    initFinBot();

    const loginLink = document.querySelector('.login-btn');
    if (loginLink) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            openLoginModal();
        });
    }

    // Hash links: SPA routes vs in-page scroll targets
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href.length < 2) return;

            const id = href.slice(1);

            if (SPA_ROUTE_IDS.includes(id)) {
                e.preventDefault();
                showPage(id);
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ===== ANALYTICS TRACKING (Optional) =====

function trackEvent(eventName, eventData) {
    console.log(`Event: ${eventName}`, eventData);
    // In production, send to analytics service
}

// Track user interactions
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('stock-btn')) {
        trackEvent('stock_added', { stock: e.target.textContent });
    }
});

// ===== RESPONSIVE NAVBAR ADJUSTMENTS =====

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(255, 255, 255, 0.1)';
    }
});

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    // In production, send error logs to server
});

// ===== CONSOLE MESSAGE =====

console.log('%c Welcome to ZEROFY! 📈', 'color: #00d084; font-size: 20px; font-weight: bold;');
console.log('%c Making stock market analysis simple and accessible.', 'color: #ffffff; font-size: 14px;');
