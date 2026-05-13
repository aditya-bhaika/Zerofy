/* =====================================================
   ZEROFY - Stock Market Analysis Website
   JavaScript File
   ===================================================== */

// ===== INTERACTIVE BACKGROUND CANVAS =====

const canvas = document.getElementById('stockBackground');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle system for animated background
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.float = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY + Math.sin(Date.now() / this.float) * 0.2;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

// Draw connecting lines between particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.strokeStyle = `rgba(0, 208, 132, ${0.2 * (1 - distance / 100)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Stock market chart animation
let chartY = [];
const chartPoints = 150;
for (let i = 0; i < chartPoints; i++) {
    chartY.push(Math.random() * 200 + 100);
}

function drawChart() {
    const chartHeight = canvas.height * 0.3;
    const chartX = canvas.width * 0.05;
    const chartStartY = canvas.height * 0.7;
    const spacing = (canvas.width * 0.9) / chartPoints;

    ctx.strokeStyle = 'rgba(0, 208, 132, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < chartPoints; i++) {
        const x = chartX + i * spacing;
        const y = chartStartY - (chartY[i] / 300) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    // Shift chart data
    chartY.shift();
    chartY.push(Math.random() * 200 + 80);
}

// Animation loop
function animateBackground() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    drawConnections();

    // Draw stock chart
    drawChart();

    requestAnimationFrame(animateBackground);
}

animateBackground();

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

// ===== HAMBURGER MENU =====

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

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
