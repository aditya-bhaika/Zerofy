# ZEROFY Configuration & Customization Guide

## 🎨 Customization Guide

### Quick Customization

#### 1. Change Brand Name
In `index.html`, replace "ZEROFY" with your name:
```html
<!-- Line 15: Logo -->
<div class="navbar-logo">
    <a href="#home">YOUR_BRAND_NAME</a>
    <span class="logo-subtitle">Your Subtitle</span>
</div>

<!-- Line 173: Hero Section -->
<h1>Welcome to YOUR_BRAND_NAME</h1>
```

#### 2. Change Colors
In `styles.css`, modify the CSS variables (lines 11-18):
```css
:root {
    --primary-color: #000000;      /* Main black */
    --secondary-color: #ffffff;    /* Main white */
    --accent-color: #1a1a1a;       /* Dark gray */
    --light-gray: #f0f0f0;         /* Light backgrounds */
    --dark-gray: #333333;          /* Text color */
    --green: #00d084;              /* Accent green */
    --red: #ff3333;                /* Error red */
}
```

**Alternative Color Schemes:**

Blue Theme:
```css
--green: #0066ff;           /* Blue accent */
--accent-color: #001a4d;    /* Dark blue */
```

Purple Theme:
```css
--green: #9d4edd;           /* Purple accent */
--accent-color: #240046;    /* Dark purple */
```

Orange Theme:
```css
--green: #ff9500;           /* Orange accent */
--accent-color: #4d2600;    /* Dark orange */
```

#### 3. Change Content
Edit section headings and descriptions in `index.html`:

```html
<!-- About Section (Line 237) -->
<h2>Why ZEROFY?</h2>

<!-- Floater Titles & Descriptions (Lines 240-280) -->
<h3>What is Stock Market?</h3>
<p>Your custom description here...</p>
```

#### 4. Add More Stocks
In `script.js`, add to the `stocksData` array (lines 220-230):

```javascript
const stocksData = [
    // ... existing stocks ...
    { symbol: 'IBM', name: 'IBM Corporation', price: 165.30, change: 2.10, changePercent: 1.29 },
    { symbol: 'INTEL', name: 'Intel Corp.', price: 42.15, change: -1.25, changePercent: -2.88 }
];
```

#### 5. Change Contact Information
In `index.html`, update footer (Lines 420-450):

```html
<div class="footer-section">
    <h4>Contact</h4>
    <p>Email: your-email@yoursite.com</p>
    <p>Phone: +1 (555) 000-0000</p>
</div>
```

#### 6. Modify Premium Plans
In `index.html`, update pricing section (Lines 368-405):

```html
<div class="premium-card pro">
    <h3>Your Plan Name</h3>
    <p class="price">$YOUR_PRICE<span>/month</span></p>
    <ul class="features-list">
        <li>✓ Your Feature 1</li>
        <li>✓ Your Feature 2</li>
        <li>✗ Unavailable Feature</li>
    </ul>
</div>
```

---

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Site Configuration
SITE_NAME=ZEROFY
SITE_DESCRIPTION=Stock Market Analysis Firm
SITE_URL=https://zerofy.com

# API Configuration
API_BASE_URL=http://localhost:3000/api
STOCK_API_KEY=your_api_key_here
STOCK_API_URL=https://api.example.com

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id

# Security
JWT_SECRET=your_jwt_secret_key
SESSION_TIMEOUT=3600

# Features
ENABLE_TRADING=false
ENABLE_SOCIAL=false
ENABLE_NOTIFICATIONS=true
```

Load in JavaScript:
```javascript
const config = {
    siteName: process.env.SITE_NAME,
    apiUrl: process.env.API_BASE_URL,
    jwtSecret: process.env.JWT_SECRET
};
```

### Theme Configuration

Create `theme-config.js`:

```javascript
const THEME_CONFIG = {
    colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#00d084',
        success: '#00d084',
        error: '#ff3333',
        warning: '#ffa500'
    },
    
    typography: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        baseFontSize: '16px'
    },
    
    spacing: {
        navbarHeight: '70px',
        sectionMinHeight: '100vh',
        maxWidth: '1200px'
    },
    
    animation: {
        duration: '0.3s',
        easing: 'ease',
        transition: 'all 0.3s ease'
    }
};
```

Use in CSS:
```css
:root {
    --primary-color: #000000;
    --transition: all 0.3s ease;
}
```

---

## 📱 Responsive Design Customization

### Current Breakpoints
```css
/* Tablet and below */
@media (max-width: 768px) { }

/* Small mobile */
@media (max-width: 480px) { }
```

### Add Custom Breakpoint
```css
/* Large screens */
@media (min-width: 1400px) {
    .section {
        padding: 5rem 4rem;
    }
}

/* Tablets landscape */
@media (max-width: 1024px) and (orientation: landscape) {
    .section {
        min-height: auto;
    }
}
```

---

## 🎬 Animation Customization

### Modify Particle Animation
In `script.js`, change animation parameters:

```javascript
// Line 50: Particle class
class Particle {
    constructor() {
        this.size = Math.random() * 3 + 1;           // Particle size
        this.speedX = Math.random() * 1 - 0.5;       // X speed
        this.speedY = Math.random() * 1 - 0.5;       // Y speed
        this.opacity = Math.random() * 0.7 + 0.3;    // Opacity
        this.float = Math.random() * 3 + 1;          // Float wave
    }
}

// Number of particles
for (let i = 0; i < 150; i++) {  // Change from 100 to 150
    particles.push(new Particle());
}

// Connection distance
if (distance < 150) {  // Change from 100 to 150
    // Draw connection
}
```

### Create New Animation
```javascript
// Add new keyframe animation in CSS
@keyframes customAnimation {
    0% {
        opacity: 0;
        transform: scale(0.8) rotate(0deg);
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: scale(1.2) rotate(360deg);
    }
}

// Apply to element
.my-element {
    animation: customAnimation 3s ease-in-out infinite;
}
```

---

## 🔐 Security Configuration

### Password Requirements
Modify in `script.js`:

```javascript
// Change from 6 to desired length
if (password.length < 8) {
    alert('Password must be at least 8 characters!');
    return;
}

// Add regex validation
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
if (!passwordRegex.test(password)) {
    alert('Password must contain uppercase, number, and special character!');
    return;
}
```

### Rate Limiting
```javascript
const loginAttempts = {};

function handleLogin(event) {
    const email = document.getElementById('email').value;
    
    // Check attempts
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, timestamp: Date.now() };
    }
    
    const attempt = loginAttempts[email];
    
    // Reset after 15 minutes
    if (Date.now() - attempt.timestamp > 900000) {
        attempt.count = 0;
    }
    
    // Allow 5 attempts
    if (attempt.count >= 5) {
        alert('Too many login attempts. Try again later.');
        return;
    }
    
    attempt.count++;
    // ... continue with login
}
```

---

## 📊 Stock Data Configuration

### Add Historical Data
```javascript
const stocksData = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 189.45,
        change: 2.5,
        changePercent: 1.33,
        open: 187.20,
        high: 191.50,
        low: 186.80,
        volume: 52341200,
        marketCap: 2980000000000,
        pe: 28.5,
        dividend: 0.94
    },
    // ... more stocks
];
```

### Market Data
```javascript
const marketData = {
    sAndP500: { value: 5200.50, change: 25.30 },
    nasdaq: { value: 15430.20, change: -10.50 },
    dow: { value: 39200.15, change: 100.80 }
};
```

---

## 🎯 Feature Toggles

### Enable/Disable Features
```javascript
const FEATURE_FLAGS = {
    ENABLE_PORTFOLIO: true,
    ENABLE_TRADING: false,
    ENABLE_SOCIAL: false,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_PREMIUM_PLANS: true,
    ENABLE_STOCK_ALERTS: false,
    DEBUG_MODE: false
};

// Use in code
if (FEATURE_FLAGS.ENABLE_PORTFOLIO) {
    showPortfolioFeature();
}
```

### Maintenance Mode
```javascript
const MAINTENANCE_MODE = false;

if (MAINTENANCE_MODE) {
    document.body.innerHTML = '<h1>Site Under Maintenance</h1>';
}
```

---

## 📈 Analytics Configuration

### Setup Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_ID');
</script>
```

### Custom Event Tracking
```javascript
function trackEvent(eventName, eventData = {}) {
    gtag('event', eventName, {
        ...eventData,
        timestamp: new Date().toISOString()
    });
    
    // Also log locally
    console.log(`Event: ${eventName}`, eventData);
}

// Track stock addition
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('stock-btn')) {
        trackEvent('stock_added', {
            stock_symbol: e.target.dataset.stock
        });
    }
});
```

---

## 🔌 API Integration Template

### Fetch Real Stock Data
```javascript
async function updateStockData() {
    try {
        const response = await fetch(`${API_URL}/stocks`);
        const data = await response.json();
        
        stocksData = data.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent
        }));
        
        populateStocks();
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        // Use fallback data
    }
}

// Update every 5 minutes
setInterval(updateStockData, 5 * 60 * 1000);
```

---

## 🌐 Localization

### Multi-language Support
```javascript
const TRANSLATIONS = {
    en: {
        welcome: 'Welcome to ZEROFY',
        login: 'Login',
        signup: 'Sign Up',
        portfolio: 'Portfolio'
    },
    es: {
        welcome: 'Bienvenido a ZEROFY',
        login: 'Iniciar sesión',
        signup: 'Registrarse',
        portfolio: 'Cartera'
    },
    fr: {
        welcome: 'Bienvenue sur ZEROFY',
        login: 'Connexion',
        signup: 'S\'inscrire',
        portfolio: 'Portefeuille'
    }
};

// Usage
function t(key) {
    const lang = navigator.language.split('-')[0] || 'en';
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];
}
```

---

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load modules
const analyticsModule = import('./analytics.js');
const chartModule = import('./charts.js');
```

### Image Optimization
```html
<!-- Use WebP with fallback -->
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.png" alt="Description">
</picture>
```

### CSS Minification
```bash
# Using cssnano or similar tool
npx cssnano styles.css -o styles.min.css
```

---

## 🔄 Version Management

```javascript
const APP_VERSION = '1.0.0';

function checkVersion() {
    const storedVersion = localStorage.getItem('appVersion');
    
    if (storedVersion !== APP_VERSION) {
        // Clear old data or migrate
        localStorage.clear();
        localStorage.setItem('appVersion', APP_VERSION);
        console.log('App updated to version ' + APP_VERSION);
    }
}
```

---

## 📝 Configuration Checklist

- [ ] Brand name updated
- [ ] Colors customized
- [ ] Contact info updated
- [ ] Stock data configured
- [ ] Premium plans modified
- [ ] Security settings configured
- [ ] Analytics enabled
- [ ] API endpoints configured
- [ ] Feature flags set
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] SEO configured
- [ ] Backups configured
- [ ] Monitoring enabled

---

**Ready to customize ZEROFY? Start with the simple changes and work your way to advanced configurations!** 🎨✨

Last Updated: May 13, 2026
