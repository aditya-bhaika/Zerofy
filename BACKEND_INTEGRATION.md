# ZEROFY - Backend Integration Guide

## 🔗 Connecting to a Real Database

This guide helps you migrate from local storage to a production-ready backend using Google Sheets (no server required).

---

## Option: Google Sheets as Backend (No Server Required)

### Overview
Use Google Sheets as a simple backend for user data and portfolio management. This is ideal for prototypes, hackathons, or when you want zero server maintenance. All logic runs via Google Apps Script and REST API calls from your frontend.

---

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new sheet (name it "ZEROFY Users").
2. Add columns: `id`, `name`, `email`, `password`, `createdAt`, `portfolio`, `savedStocks`.

---

### Step 2: Add Google Apps Script Backend
1. In your sheet, click **Extensions > Apps Script**.
2. Replace the code with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var data = JSON.parse(e.postData.contents);
  var action = data.action;

  if (action === 'signup') {
    var id = Utilities.getUuid();
    sheet.appendRow([
      id,
      data.name,
      data.email,
      Utilities.base64Encode(data.password),
      new Date().toISOString(),
      JSON.stringify([]),
      JSON.stringify([])
    ]);
    return ContentService.createTextOutput(JSON.stringify({success:true, id:id})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'login') {
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (values[i][2] === data.email && Utilities.base64Encode(data.password) === values[i][3]) {
        return ContentService.createTextOutput(JSON.stringify({success:true, id:values[i][0], name:values[i][1], email:values[i][2]})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success:false, message:'Invalid credentials'})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'addPortfolio') {
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        var portfolio = JSON.parse(values[i][5] || '[]');
        portfolio.push(data.stock);
        sheet.getRange(i+1, 6).setValue(JSON.stringify(portfolio));
        return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({success:false, message:'User not found'})).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({success:false, message:'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}
```

3. Save and **Deploy**:
   - Click **Deploy > New deployment**
   - Select **Web app**
   - Set access to **Anyone**
   - Copy the Web App URL (e.g., `https://script.google.com/macros/s/AKfy.../exec`)

---

### Step 3: Update Frontend (`script.js`)

Replace backend calls with fetches to your Apps Script URL:

```javascript
const SHEETS_API = 'YOUR_WEB_APP_URL';

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  fetch(SHEETS_API, {
    method: 'POST',
    body: JSON.stringify({ action: 'signup', name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        sessionManager.saveSession({ id: data.id, name, email });
        closeSignupModal();
        alert('Signup successful!');
      } else {
        alert(data.message);
      }
    });
}

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
        sessionManager.saveSession({ id: data.id, name: data.name, email: data.email });
        closeLoginModal();
        alert('Login successful!');
      } else {
        alert(data.message);
      }
    });
}

function addToPortfolio(stock) {
  const user = sessionManager.getSession();
  if (!user) return alert('Login required!');
  fetch(SHEETS_API, {
    method: 'POST',
    body: JSON.stringify({ action: 'addPortfolio', id: user.id, stock })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Stock added to portfolio!');
      } else {
        alert(data.message);
      }
    });
}
```

---

### Security Note
- Passwords are base64-encoded for demo only. For real apps, use OAuth or a secure backend.
- Google Sheets is not suitable for production or sensitive data.

---

**Now you can use Google Sheets as your backend!**

---

## Deployment Checklist

- [ ] Database setup and migration
- [ ] Backend server configured
- [ ] API endpoints tested
- [ ] Frontend updated to use backend
- [ ] Authentication tokens working
- [ ] Portfolio data persisting
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] SSL/TLS certificate installed
- [ ] Backup strategy implemented
- [ ] Monitoring/logging enabled
- [ ] Performance optimized

---

## Environment Variables

Create `.env` file in your backend:

```env
# Firebase
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain

# MongoDB
MONGODB_URL=mongodb://user:password@host:27017

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/zerofy

# JWT
JWT_SECRET=your_super_secret_key

# Server
PORT=3000
NODE_ENV=production
```

---

## Testing the Integration

### Using Postman or cURL

```bash
# Sign Up
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Add to Portfolio
curl -X POST http://localhost:3000/api/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"symbol":"AAPL","name":"Apple","price":189.45}'
```

---

## Real Stock Data Integration

### Using Alpha Vantage API

```javascript
const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY';

async function getStockPrice(symbol) {
    const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    const data = await response.json();
    return {
        price: parseFloat(data['Global Quote']['05. price']),
        change: parseFloat(data['Global Quote']['09. change']),
        changePercent: parseFloat(data['Global Quote']['10. change percent'].replace('%', ''))
    };
}
```

---

## Production Deployment

### Deploy on Heroku

```bash
# Login
heroku login

# Create app
heroku create zerofy-app

# Push code
git push heroku main

# View logs
heroku logs --tail
```

### Deploy on AWS

1. Use Elastic Beanstalk for backend
2. Use S3 for frontend hosting
3. Use RDS for database
4. Use CloudFront for CDN

### Deploy on DigitalOcean

1. Create Droplet
2. Install dependencies
3. Configure Nginx
4. Setup SSL with Let's Encrypt
5. Deploy application

---

**Ready to go live? Choose your option and follow the steps!** 🚀

Last Updated: May 13, 2026
