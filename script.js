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
        }, { passive: true }
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

const CURRENT_USER_STORAGE_KEY = 'currentUser';
const PENDING_PORTFOLIO_STOCK_KEY = 'pendingPortfolioStock';

function getStoredUser() {
    const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY) || sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!stored) return null;
    try {
        const user = JSON.parse(stored);
        user.portfolio = normalizePortfolio(user.portfolio);
        user.savedStocks = normalizePortfolio(user.savedStocks);
        if (user.dateOfBirth == null) user.dateOfBirth = '';
        if (user.plan == null) user.plan = '';
        return user;
    } catch (error) {
        console.warn('Clearing invalid saved session:', error);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        return null;
    }
}

function persistUser(user) {
    try {
        const value = JSON.stringify(user);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, value);
        sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, value);
    } catch (e) {
        console.warn('Unable to persist user session:', e);
    }
}

function getPortfolioStorageKey(user) {
    return user ? `portfolio_${user.email || user.id}` : 'portfolio_guest';
}

function savePortfolioFallback(portfolio, user) {
    try {
        localStorage.setItem(getPortfolioStorageKey(user), JSON.stringify(normalizePortfolio(portfolio)));
    } catch (error) {
        console.warn('Unable to save portfolio fallback:', error);
    }
}

function getPortfolioFallback(user) {
    const stored = localStorage.getItem(getPortfolioStorageKey(user));
    return normalizePortfolio(stored);
}

function getSavedPortfolioForUser(user) {
    const serverPortfolio = normalizePortfolio(user.portfolio);
    if (serverPortfolio.length) return serverPortfolio;
    return getPortfolioFallback(user);
}

function getStockBySymbol(symbol) {
    const normalizedSymbol = String(symbol || '').toUpperCase();
    return stocksData.find(s => s.symbol === normalizedSymbol);
}

function setPendingPortfolioStock(symbol) {
    try {
        sessionStorage.setItem(PENDING_PORTFOLIO_STOCK_KEY, String(symbol || '').toUpperCase());
    } catch (error) {
        localStorage.setItem(PENDING_PORTFOLIO_STOCK_KEY, String(symbol || '').toUpperCase());
    }
}

function getPendingPortfolioStock() {
    return sessionStorage.getItem(PENDING_PORTFOLIO_STOCK_KEY) || localStorage.getItem(PENDING_PORTFOLIO_STOCK_KEY);
}

function clearPendingPortfolioStock() {
    sessionStorage.removeItem(PENDING_PORTFOLIO_STOCK_KEY);
    localStorage.removeItem(PENDING_PORTFOLIO_STOCK_KEY);
}

function normalizePortfolioItem(item) {
    if (!item) return null;
    if (typeof item === 'string') {
        return { symbol: item };
    }
    if (typeof item === 'object' && item.symbol) {
        return item;
    }
    return null;
}

function resolvePortfolioStock(rawItem) {
    const item = normalizePortfolioItem(rawItem);
    if (!item) return null;
    const symbol = String(item.symbol || '').toUpperCase();
    if (!symbol) return null;
    const liveStock = stocksData.find(s => s.symbol === symbol || s.ticker === symbol);
    return {
        symbol,
        name: item.name || (liveStock ? liveStock.name : symbol),
        market: item.market || (liveStock ? liveStock.market : 'NSE'),
        price: item.price != null ? Number(item.price) : (liveStock ? liveStock.price : 0),
        change: item.change != null ? Number(item.change) : (liveStock ? liveStock.change : 0),
        changePercent: item.changePercent != null ? Number(item.changePercent) : (liveStock ? liveStock.changePercent : 0)
    };
}

// Session management
class SessionManager {
    constructor() {
        this.currentUser = this.loadSession();
    }

    saveSession(user) {
        let prev = getStoredUser() || {};
        const merged = {...prev, ...user };
        const normalizedUser = {
            ...merged,
            portfolio: normalizePortfolio(merged.portfolio),
            savedStocks: normalizePortfolio(merged.savedStocks),
            dateOfBirth: merged.dateOfBirth != null ? String(merged.dateOfBirth) : '',
            plan: merged.plan != null ? String(merged.plan) : ''
        };

        persistUser(normalizedUser);
        savePortfolioFallback(normalizedUser.portfolio, normalizedUser);
        this.currentUser = normalizedUser;
        this.updateUI();
        refreshPortfolioGrid();
    }

    loadSession() {
        const user = getStoredUser();
        if (user) {
            this.currentUser = user;
            this.updateUI();
            refreshPortfolioGrid();
            return user;
        }
        return null;
    }

    logout() {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        this.currentUser = null;
        this.updateUI();
    }

    logout() {
        localStorage.removeItem('currentUser');
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
        const profileNavItem = document.getElementById('profileNavItem');
        const premiumNavItem = document.getElementById('premiumNavItem');

        const hasPremium = this.currentUser && this.currentUser.plan && !['free', 'trial'].includes(String(this.currentUser.plan).toLowerCase());

        if (this.currentUser) {
            if (loginItem) loginItem.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
            if (profileNavItem) profileNavItem.style.display = 'list-item';
        } else {
            if (loginItem) loginItem.style.display = 'list-item';
            if (userProfile) userProfile.style.display = 'none';
            if (profileNavItem) profileNavItem.style.display = 'none';
        }

        if (premiumNavItem) {
            premiumNavItem.style.display = hasPremium ? 'none' : 'list-item';
        }
    }
}

const sessionManager = new SessionManager();

function getLoginReturnUrl() {
    try {
        const raw = new URLSearchParams(window.location.search).get('return');
        if (raw && /^(?:[a-z0-9_-]+\.html(?:#[\w-]*)?)$/i.test(raw)) {
            return raw.startsWith('http') ? 'index.html#home' : raw;
        }
    } catch (e) {
        /* ignore */
    }
    return 'index.html#home';
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
            const portalUser = {
                id: data.id,
                name: data.name,
                email: data.email || email,
                portfolio: getSavedPortfolioForUser({
                    ...data,
                    email: data.email || email,
                    id: data.id
                }),
                savedStocks: normalizePortfolio(data.savedStocks)
            };

            sessionManager.saveSession(portalUser);
            const pendingStockAdded = await processPendingPortfolioAdd();
            closeLoginModal();
            const lf = document.getElementById('loginForm');
            if (lf) lf.reset();
            alert(pendingStockAdded ? 'Login successful! Your portfolio is ready.' : 'Login successful!');
            window.location.href = pendingStockAdded ? 'portfolio.html' : getLoginReturnUrl();
        } else {
            alert(data.message || 'Login failed!');
        }
    } catch (error) {
        console.error('user name or password is incorrect:', error);
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
            const guestSavedPortfolio = getPortfolioFallback(null);
            sessionManager.saveSession({
                id: data.id,
                name: data.name || name,
                email: data.email || email,
                portfolio: normalizePortfolio(data.portfolio).length ? normalizePortfolio(data.portfolio) : guestSavedPortfolio,
                savedStocks: normalizePortfolio(data.savedStocks)
            });
            const pendingStockAdded = await processPendingPortfolioAdd();
            closeSignupModal();
            const sf = document.getElementById('signupForm');
            if (sf) sf.reset();
            setStoredUserCount(getStoredUserCount() + 1);
            updateUserCountFloater();
            alert(pendingStockAdded ? 'Signup successful! Your portfolio is ready.' : 'Signup successful!');
            window.location.href = pendingStockAdded ? 'portfolio.html' : getLoginReturnUrl();
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

function showForgotPassword(event) {
    if (event) event.preventDefault();
    const panel = document.getElementById('forgotPasswordPanel');
    if (panel) {
        panel.hidden = false;
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden', 'false');
    }
}

function hideForgotPassword(event) {
    if (event) event.preventDefault();
    const panel = document.getElementById('forgotPasswordPanel');
    if (panel) {
        panel.hidden = true;
        panel.style.display = 'none';
        panel.setAttribute('aria-hidden', 'true');
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    const resetEmailInput = document.getElementById('resetEmail');
    const email = resetEmailInput ? resetEmailInput.value.trim() : '';
    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    alert(`If an account exists for ${email}, password reset instructions will be sent to that email.`);
    hideForgotPassword();
}

function getStoredUserCount() {
    const stored = localStorage.getItem('zerofyUserCount');
    if (stored !== null && !Number.isNaN(Number(stored))) {
        return Number(stored);
    }
    const initialCount = 18000 + Math.floor(Math.random() * 12000);
    localStorage.setItem('zerofyUserCount', String(initialCount));
    return initialCount;
}

function setStoredUserCount(value) {
    localStorage.setItem('zerofyUserCount', String(value));
}

function updateUserCountFloater() {
    const countEl = document.getElementById('userCountValue');
    if (!countEl) return;
    countEl.textContent = getStoredUserCount().toLocaleString('en-IN');
}

function animateUserCountFloater() {
    const currentCount = getStoredUserCount();
    const nextCount = currentCount + 1 + Math.floor(Math.random() * 3);
    setStoredUserCount(nextCount);
    updateUserCountFloater();
}

function initUserCountFloater() {
    if (!document.getElementById('userCountFloater')) return;
    updateUserCountFloater();
    window.setInterval(animateUserCountFloater, 12000);
}

async function addToPortfolio(symbol) {
    const stock = getStockBySymbol(symbol);
    if (!stock) {
        alert('Unable to find stock details for ' + symbol);
        return;
    }

    if (!sessionManager.isLoggedIn()) {
        setPendingPortfolioStock(symbol);
        window.location.href = 'login.html?return=portfolio.html';
        return;
    }

    const added = await addStockToLoggedInPortfolio(symbol);
    if (added && !/portfolio\.html$/i.test(window.location.pathname)) {
        window.location.href = 'portfolio.html';
    }
}

async function addStockToLoggedInPortfolio(symbol, options = {}) {
    const { showAlerts = true } = options;
    const stock = getStockBySymbol(symbol);
    if (!stock) {
        if (showAlerts) alert('Unable to find stock details for ' + symbol);
        return false;
    }

    if (!sessionManager.isLoggedIn()) {
        setPendingPortfolioStock(symbol);
        window.location.href = 'login.html?return=portfolio.html';
        return false;
    }

    const user = sessionManager.getSession();
    user.portfolio = normalizePortfolio(user.portfolio);

    // Check if stock already in portfolio (client-side only)
    if (user.portfolio.some(s => s.symbol === symbol)) {
        if (showAlerts) alert(`${symbol} is already in your portfolio!`);
        return true;
    }

    try {
        const data = await postToSheets('addPortfolio', { id: user.id, stock });

        if (data.success) {
            user.portfolio = data.portfolio !== undefined ?
                normalizePortfolio(data.portfolio) :
                normalizePortfolio(user.portfolio);
            if (!user.portfolio.some(s => s.symbol === symbol)) {
                user.portfolio.push(stock);
            }
            sessionManager.saveSession(user);
            refreshPortfolioGrid();
            if (showAlerts) alert(`${symbol} added to your portfolio!`);
            return true;
        } else {
            if (showAlerts) alert(data.message || 'Failed to add stock!');
            return false;
        }
    } catch (error) {
        console.error('Portfolio update failed:', error);

        const currentUser = sessionManager.getSession();
        if (currentUser) {
            currentUser.portfolio = normalizePortfolio(currentUser.portfolio);
            if (!currentUser.portfolio.some(s => s.symbol === symbol)) {
                currentUser.portfolio.push(stock);
            }
            sessionManager.saveSession(currentUser);
            localStorage.setItem(`portfolio_${currentUser.email || currentUser.id}`, JSON.stringify(currentUser.portfolio));
            if (showAlerts) alert(`${symbol} added to your portfolio locally.`);
            return true;
        }

        if (showAlerts) alert(error.message || 'Network error. Please try again.');
        return false;
    }
}

async function processPendingPortfolioAdd() {
    const pendingSymbol = getPendingPortfolioStock();
    if (!pendingSymbol || !sessionManager.isLoggedIn()) return false;

    const added = await addStockToLoggedInPortfolio(pendingSymbol, { showAlerts: false });
    if (added) {
        clearPendingPortfolioStock();
        return true;
    }

    return false;
}

// ===== LOGIN/SIGNUP MODALS =====

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        return;
    }
    window.location.href = 'login.html';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function openSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'block';
        return;
    }
    const sec = document.getElementById('signup-section');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) modal.style.display = 'none';
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    const loginSec = document.getElementById('login-section');
    if (loginSec) {
        loginSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    openLoginModal();
}

// ===== STOCK DATA =====

const stocksData = [
    { symbol: 'TCS', ticker: 'TCS.NS', market: 'NSE', name: 'Tata Consultancy Services', price: 3350.00, change: 0.00, changePercent: 0.00 },
    { symbol: 'RELIANCE', ticker: 'RELIANCE.NS', market: 'NSE', name: 'Reliance Industries', price: 2628.00, change: 0.00, changePercent: 0.00 },
    { symbol: 'INFY', ticker: 'INFY.NS', market: 'NSE', name: 'Infosys', price: 1855.50, change: 0.00, changePercent: 0.00 },
    { symbol: 'HDFC', ticker: 'HDFC.NS', market: 'NSE', name: 'HDFC Bank', price: 1625.20, change: 0.00, changePercent: 0.00 },
    { symbol: 'ICICIBANK', ticker: 'ICICIBANK.NS', market: 'NSE', name: 'ICICI Bank', price: 940.70, change: 0.00, changePercent: 0.00 },
    { symbol: 'BHARTIARTL', ticker: 'BHARTIARTL.NS', market: 'NSE', name: 'Bharti Airtel', price: 930.00, change: 0.00, changePercent: 0.00 },
    { symbol: 'LT', ticker: 'LT.NS', market: 'NSE', name: 'Larsen & Toubro', price: 2255.00, change: 0.00, changePercent: 0.00 },
    { symbol: 'NESTLEIND', ticker: 'NESTLEIND.NS', market: 'NSE', name: 'Nestle India', price: 19750.00, change: 0.00, changePercent: 0.00 }
];

function initializeStockHistory() {
    stocksData.forEach(stock => {
        if (!stock.history || !stock.history.length) {
            const history = [];
            const base = stock.price;
            for (let i = 20; i > 0; i--) {
                history.push(base * (1 + (Math.sin(i / 3) * 0.005) + (Math.random() - 0.5) * 0.004));
            }
            stock.history = history;
        }
    });
}

function updateStockPrice(stock, newPrice, change, changePercent) {
    const previousPrice = stock.price;
    const roundedPrice = Number(newPrice.toFixed(2));
    stock.change = change !== undefined ? change : roundedPrice - previousPrice;
    stock.changePercent = changePercent !== undefined ? changePercent : previousPrice ? ((roundedPrice - previousPrice) / previousPrice) * 100 : 0;
    stock.price = roundedPrice;
    stock.history = (stock.history || []).slice(-19).concat(roundedPrice);
}

function drawStockSparkline(canvas, history, positive) {
    if (!canvas || !canvas.getContext || !history || !history.length) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 260;
    const height = canvas.clientHeight || 80;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = Math.max(max - min, max * 0.01, 1);
    const padding = 10;
    const points = history.map((value, index) => {
        const x = padding + ((width - padding * 2) * index) / (history.length - 1);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return { x, y };
    });

    const lineColor = positive ? 'rgba(0, 255, 153, 0.95)' : 'rgba(255, 103, 109, 0.95)';
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, positive ? 'rgba(0, 255, 153, 0.18)' : 'rgba(255, 103, 109, 0.18)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    const lastPoint = points[points.length - 1];
    ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
}

function fillStocksGrid(grid) {
    if (!grid) return;
    grid.innerHTML = '';

    stocksData.forEach(stock => {
        const isPositive = stock.change >= 0;
        const stockCard = document.createElement('div');
        stockCard.className = 'stock-card';
        stockCard.dataset.symbol = stock.symbol;
        stockCard.innerHTML = `
            <div class="stock-symbol">${stock.symbol}</div>
            <div class="stock-name">${stock.name} · ${stock.market}</div>
            <div class="stock-price">₹${stock.price.toFixed(2)}</div>
            <div class="stock-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)} (${stock.changePercent.toFixed(2)}%)
            </div>
            <canvas class="stock-sparkline" aria-hidden="true"></canvas>
            <button class="stock-btn" onclick="addToPortfolio('${stock.symbol}')">Add to Portfolio</button>
        `;
        grid.appendChild(stockCard);
        const canvas = stockCard.querySelector('.stock-sparkline');
        drawStockSparkline(canvas, stock.history, isPositive);
    });
}

function refreshStocksGrid() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;

    stocksData.forEach(stock => {
        const stockCard = grid.querySelector(`[data-symbol="${stock.symbol}"]`);
        if (!stockCard) return;
        const isPositive = stock.change >= 0;
        const priceEl = stockCard.querySelector('.stock-price');
        const changeEl = stockCard.querySelector('.stock-change');
        const canvas = stockCard.querySelector('.stock-sparkline');

        if (priceEl) priceEl.textContent = `₹${stock.price.toFixed(2)}`;
        if (changeEl) {
            changeEl.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
            changeEl.textContent = `${isPositive ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)} (${stock.changePercent.toFixed(2)}%)`;
        }
        drawStockSparkline(canvas, stock.history, isPositive);
    });
}

async function fetchLiveStockQuotes() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;
    const symbols = stocksData.map(stock => stock.ticker).join(',');
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`);
        if (!response.ok) throw new Error('Failed to fetch stock quotes');
        const data = await response.json();
        if (!data.quoteResponse || !Array.isArray(data.quoteResponse.result)) throw new Error('Invalid quote data');

        data.quoteResponse.result.forEach(result => {
            const stock = stocksData.find(s => s.ticker === result.symbol);
            if (!stock) return;
            const price = Number(result.regularMarketPrice) || stock.price;
            const change = Number(result.regularMarketChange) || price - stock.price;
            const changePercent = Number(result.regularMarketChangePercent) || (stock.price ? ((price - stock.price) / stock.price) * 100 : 0);
            updateStockPrice(stock, price, change, changePercent);
        });

        refreshStocksGrid();
        refreshPortfolioGrid();
    } catch (error) {
        simulateLiveStockUpdate();
    }
}

function simulateLiveStockUpdate() {
    stocksData.forEach(stock => {
        const drift = stock.price * ((Math.random() - 0.5) * 0.006);
        const newPrice = Math.max(20, stock.price + drift);
        const change = newPrice - stock.price;
        const changePercent = stock.price ? (change / stock.price) * 100 : 0;
        updateStockPrice(stock, newPrice, change, changePercent);
    });
    refreshStocksGrid();
    refreshPortfolioGrid();
}

function initStockUpdates() {
    initializeStockHistory();
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;

    fillStocksGrid(grid);
    fetchLiveStockQuotes();
    window.setInterval(fetchLiveStockQuotes, 10000);
}

function refreshPortfolioGrid() {
    const grid = document.getElementById('portfolioGrid');
    const status = document.getElementById('portfolioStatus');
    if (!grid || !status) return;

    const loggedIn = sessionManager.isLoggedIn();
    const user = loggedIn ? sessionManager.getSession() : null;
    const portfolio = loggedIn ? normalizePortfolio(user.portfolio) : [];
    const fallbackPortfolio = getPortfolioFallback(user);
    const activePortfolio = portfolio.length ? portfolio : fallbackPortfolio;

    if (!activePortfolio.length) {
        const message = loggedIn ?
            'Your portfolio is empty. Add stocks from the Stocks page.' :
            'Login to view your portfolio.';

        status.textContent = message;
        grid.innerHTML = `
            <div class="portfolio-empty">
                <p>${message}</p>
                <a href="stocks.html" class="cta-button">Browse Stocks</a>
            </div>
        `;
        return;
    }

    const displayItems = activePortfolio.map(resolvePortfolioStock).filter(Boolean);

    status.textContent = `${displayItems.length} stock${displayItems.length === 1 ? '' : 's'} in your portfolio`;
    grid.innerHTML = displayItems.map(stock => {
        const trendClass = stock.change >= 0 ? 'positive' : 'negative';

        return `
            <div class="portfolio-card">
                <div class="portfolio-card-head">
                    <div>
                        <h3>${stock.name || stock.symbol}</h3>
                        <span class="portfolio-symbol">${stock.symbol}</span>
                    </div>
                    <span class="portfolio-change ${trendClass}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)</span>
                </div>
                <div class="portfolio-card-body">
                    <span class="portfolio-price">₹${stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>`;
    }).join('');
}

function populatePortfolio() {
    sessionManager.loadSession();
    refreshPortfolioGrid();
}

// ===== SPA NAVIGATION (navbar + full-page views) =====
const SPA_ROUTE_IDS = ['home'];

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

    if (page === 'logout') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.style.display = 'none';
        document.querySelectorAll('main > section').forEach(sec => {
            sec.style.display = 'none';
        });
        const lp = document.getElementById('logoutPage');
        if (lp) {
            lp.style.display = 'block';
            window.scrollTo(0, 0);
        }
        return;
    }

    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.display = '';
    document.querySelectorAll('main > section').forEach(sec => {
        sec.style.display = '';
    });
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

function upgradePlan(plan) {
    if (!sessionManager.isLoggedIn()) {
        window.location.href = 'login.html?return=premium.html';
        return;
    }

    const normalizedPlan = String(plan || 'free').toLowerCase();
    const current = sessionManager.getSession();
    const currentPlan = String(current.plan || 'free').toLowerCase();

    if (currentPlan === normalizedPlan) {
        alert(`You already have the ${normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1)} plan.`);
        return;
    }

    sessionManager.saveSession({
        ...current,
        plan: normalizedPlan
    });
    applyPremiumPageState();
    alert(`Your plan has been updated to ${normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1)}.`);
}

function applyPremiumPageState() {
    const user = sessionManager.getSession();
    const plan = user ? (user.plan || 'free') : 'free';
    const label = plan === 'free' ? 'Free' : plan.charAt(0).toUpperCase() + plan.slice(1);

    document.querySelectorAll('.current-plan-label').forEach(el => {
        el.textContent = label;
    });

    const freeButton = document.getElementById('planFreeBtn');
    const proButton = document.getElementById('planProBtn');
    const eliteButton = document.getElementById('planEliteBtn');

    if (freeButton) {
        freeButton.textContent = plan === 'free' ? 'Current Plan' : 'Choose Free';
        freeButton.disabled = plan === 'free';
    }
    if (proButton) {
        proButton.textContent = plan === 'pro' ? 'Current Plan' : 'Upgrade Now';
        proButton.disabled = plan === 'pro';
    }
    if (eliteButton) {
        eliteButton.textContent = plan === 'elite' ? 'Current Plan' : 'Upgrade Now';
        eliteButton.disabled = plan === 'elite';
    }
}

function initScrollAnimations() {
    const targets = document.querySelectorAll('.animate-on-scroll');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    targets.forEach(el => observer.observe(el));
}

// ===== POPULATE STOCKS SECTION =====


function populateStocks() {
    initStockUpdates();
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

function initProfilePage() {
    const form = document.getElementById('profileForm');
    if (!form || form.dataset.profileBound === '1') return;

    if (!sessionManager.isLoggedIn()) {
        window.location.replace('login.html?return=profile.html');
        return;
    }

    const user = sessionManager.getSession();
    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileDisplayEmail');
    const idEl = document.getElementById('profileDisplayId');
    const dobEl = document.getElementById('profileDob');
    const planEl = document.getElementById('profilePlan');

    if (nameEl) nameEl.textContent = user.name || '—';
    if (emailEl) emailEl.textContent = user.email || '—';
    if (idEl) idEl.textContent = user.id != null ? String(user.id) : '—';
    if (dobEl) dobEl.value = user.dateOfBirth || '';
    if (planEl) planEl.value = user.plan || 'free';
    const currentPlanEl = document.getElementById('profileCurrentPlan');
    if (currentPlanEl) currentPlanEl.textContent = user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';

    form.addEventListener('submit', e => {
        e.preventDefault();
        const dob = dobEl ? dobEl.value : '';
        const plan = planEl ? planEl.value : '';
        sessionManager.saveSession({
            ...sessionManager.getSession(),
            dateOfBirth: dob,
            plan
        });
        const currentPlanEl = document.getElementById('profileCurrentPlan');
        if (currentPlanEl) currentPlanEl.textContent = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free';
        applyPremiumPageState();
        alert('Your profile has been updated.');
    });
    form.dataset.profileBound = '1';
}

document.addEventListener('DOMContentLoaded', () => {
    populateStocks();
    sessionManager.loadSession();
    applyPremiumPageState();
    applyInitialHashRoute();
    initFinBot();
    initScrollAnimations();
    initProfilePage();
    initUserCountFloater();
    populatePortfolio();

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

let finbotScrollTimeout = null;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(255, 255, 255, 0.1)';
        }
    }

    const finbot = document.getElementById('finbot');
    if (finbot) {
        const delta = window.scrollY - lastScrollY;
        const offset = Math.max(-6, Math.min(6, delta * 0.5));
        finbot.style.setProperty('--finbot-scroll-offset', `${offset}px`);

        clearTimeout(finbotScrollTimeout);
        finbotScrollTimeout = window.setTimeout(() => {
            finbot.style.setProperty('--finbot-scroll-offset', '0px');
        }, 120);
    }

    lastScrollY = window.scrollY;
});

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
    // In production, send error logs to server
});

// ===== CONSOLE MESSAGE =====

console.log('%c Welcome to ZEROFY! 📈', 'color: #00d084; font-size: 20px; font-weight: bold;');
console.log('%c Making stock market analysis simple and accessible.', 'color: #ffffff; font-size: 14px;');
