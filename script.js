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

// ===== USER AUTHENTICATION & DATABASE =====

// Session management
class SessionManager {
    constructor() {
        this.currentUser = this.loadSession();
    }

    saveSession(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
        this.updateUI();
    }

    loadSession() {
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            this.updateUI();
            return JSON.parse(stored);
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
            userName.textContent = this.currentUser.name.split(' ')[0];
        } else {
            loginItem.style.display = 'block';
            userProfile.style.display = 'none';
        }
    }
}

const sessionManager = new SessionManager();

// Login handler (Google Sheets)
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch(SHEETS_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionManager.saveSession({ id: data.id, name: data.name, email: data.email, portfolio: [], savedStocks: [] });
                closeLoginModal();
                document.getElementById('loginForm').reset();
                alert('Login successful!');
            } else {
                alert(data.message || 'Login failed!');
            }
        })
        .catch(() => alert('Network error. Please try again.'));
}

// Signup handler (Google Sheets)
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    fetch(SHEETS_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'signup', name, email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionManager.saveSession({ id: data.id, name, email, portfolio: [], savedStocks: [] });
                closeSignupModal();
                document.getElementById('signupForm').reset();
                alert('Signup successful!');
            } else {
                alert(data.message || 'Signup failed!');
            }
        })
        .catch(() => alert('Network error. Please try again.'));
}

function addToPortfolio(symbol) {
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

    fetch(SHEETS_API, {
            method: 'POST',
            body: JSON.stringify({ action: 'addPortfolio', id: user.id, stock })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Update session portfolio (client-side only)
                if (!user.portfolio) user.portfolio = [];
                user.portfolio.push(stock);
                sessionManager.saveSession(user);
                alert(`${symbol} added to your portfolio!`);
            } else {
                alert(data.message || 'Failed to add stock!');
            }
        })
        .catch(() => alert('Network error. Please try again.'));
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

// ===== POPULATE STOCKS SECTION =====

function populateStocks() {
    const stocksGrid = document.getElementById('stocksGrid');
    stocksGrid.innerHTML = '';

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
        stocksGrid.appendChild(stockCard);
    });
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

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== INITIALIZE ON PAGE LOAD =====

document.addEventListener('DOMContentLoaded', () => {
    populateStocks();
    sessionManager.loadSession();

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
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