# ZEROFY Database Documentation

## Overview
This document outlines the data structure and database schema for the ZEROFY stock market analysis platform.

## Current Implementation
**Storage Method**: Browser's localStorage (JSON-based)
**Location**: Browser Local Storage
**Capacity**: ~5-10MB per domain

## Database Schema

### Users Collection
Stores all registered user information.

```json
{
  "id": 1715517600000,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Zm9vYmFy",
  "createdAt": "2026-05-13T10:00:00.000Z",
  "portfolio": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 189.45,
      "change": 2.5,
      "changePercent": 1.33
    }
  ],
  "savedStocks": []
}
```

### Field Descriptions

#### User Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | Number | Unique user identifier (timestamp) | 1715517600000 |
| name | String | Full name of user | "John Doe" |
| email | String | Email address (unique) | "john@example.com" |
| password | String | Hashed password (Base64 encoded) | "Zm9vYmFy" |
| createdAt | String | Account creation timestamp (ISO 8601) | "2026-05-13T10:00:00.000Z" |
| portfolio | Array | Array of stock objects in user's portfolio | [...] |
| savedStocks | Array | Array of saved/watchlisted stocks | [...] |

#### Stock Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| symbol | String | Stock ticker symbol | "AAPL" |
| name | String | Company name | "Apple Inc." |
| price | Number | Current stock price | 189.45 |
| change | Number | Price change in dollars | 2.5 |
| changePercent | Number | Percentage change | 1.33 |

### Session Storage Schema

```json
{
  "currentUser": {
    "id": 1715517600000,
    "name": "John Doe",
    "email": "john@example.com",
    "portfolio": [...],
    "savedStocks": [...]
  }
}
```

## API Data Structure (For Future Integration)

### Stock Quote Response (Expected Format)
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "price": 189.45,
  "previousClose": 186.95,
  "open": 187.20,
  "high": 191.50,
  "low": 186.80,
  "volume": 52341200,
  "marketCap": 2980000000000,
  "pe": 28.5,
  "dividend": 0.94,
  "change": 2.5,
  "changePercent": 1.33,
  "timestamp": "2026-05-13T16:00:00Z"
}
```

### User Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1715517600000,
    "name": "John Doe",
    "email": "john@example.com",
    "portfolio": [...],
    "token": "jwt_token_here"
  }
}
```

### Portfolio Entry
```json
{
  "id": "portfolio_123",
  "userId": 1715517600000,
  "stocks": [
    {
      "symbol": "AAPL",
      "quantity": 10,
      "buyPrice": 150.00,
      "buyDate": "2026-01-15",
      "currentPrice": 189.45,
      "totalValue": 1894.50,
      "gain": 394.50,
      "gainPercent": 26.30
    }
  ],
  "totalValue": 1894.50,
  "totalGain": 394.50,
  "lastUpdated": "2026-05-13T16:00:00Z"
}
```

## Data Persistence Methods

### Current (Browser Storage)
```javascript
// Saving
localStorage.setItem('zerofyUsers', JSON.stringify(usersArray));

// Loading
const users = JSON.parse(localStorage.getItem('zerofyUsers'));
```

## Recommended Production Database

### Firebase Realtime Database
```javascript
// User reference structure
/users/{userId}/
  - name: "John Doe"
  - email: "john@example.com"
  - createdAt: 1715517600000
  - portfolio: {...}
```

### MongoDB Schema
```javascript
db.users.insertOne({
  _id: ObjectId(),
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  createdAt: new Date(),
  portfolio: [],
  savedStocks: []
})
```

### PostgreSQL Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stock_symbol VARCHAR(10),
  quantity INTEGER,
  buy_price DECIMAL(10, 2),
  buy_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Data Validation Rules

### User Registration
- Name: Non-empty string, 2-100 characters
- Email: Valid email format, unique in database
- Password: Minimum 6 characters, contain uppercase and numbers (recommended)

### Stock Data
- Symbol: 1-5 character uppercase string
- Price: Positive decimal number
- Change: Can be positive or negative
- Percentage: -100 to 100

## Security Considerations

### Current
- ✓ Password stored as Base64 (for demo only)
- ✓ Session stored in sessionStorage (cleared on browser close)
- ✓ Local storage isolated per domain

### Recommended for Production
- ✓ Password hashing: bcrypt, argon2
- ✓ SSL/TLS encryption in transit
- ✓ JWT tokens with expiration
- ✓ Salted password hashing
- ✓ Input validation and sanitization
- ✓ SQL injection prevention
- ✓ XSS attack prevention
- ✓ CORS configuration
- ✓ Rate limiting
- ✓ Two-factor authentication

## Backup & Recovery

### Manual Backup (Browser)
```javascript
// Export user data
const backup = localStorage.getItem('zerofyUsers');
console.log(backup);

// Import user data
localStorage.setItem('zerofyUsers', backupData);
```

### Recommended Backups for Production
- Daily automated backups
- Redundant storage (multiple regions)
- Point-in-time recovery capability
- Disaster recovery plan

## Data Migration Guide

### From localStorage to Firebase
1. Export all data from localStorage
2. Transform to Firebase schema
3. Upload to Firebase Realtime Database
4. Update JavaScript references
5. Test authentication flow
6. Clear localStorage after verification

## Performance Optimization

### Current Database
- Fast local access (no network latency)
- Limited to single device
- No synchronization across devices

### Production Optimization
- Database indexing on email field
- Caching frequently accessed data
- Pagination for large result sets
- Connection pooling
- Query optimization

## Monitoring & Analytics

### Recommended Metrics to Track
- User registration rate
- Login success/failure ratio
- Average portfolio size
- Most viewed stocks
- Premium plan conversion rate
- User retention rate
- System uptime
- API response time

## Future Enhancements

### Phase 2
- Trading history tracking
- Transaction logs
- User preferences/settings
- Notification preferences

### Phase 3
- Real-time price updates
- Chat/messaging system
- Social features
- Advanced analytics

### Phase 4
- Machine learning predictions
- Robo-advisor features
- Integration with brokers
- Mobile app backend

## Compliance & Regulations

- GDPR: Data privacy and user consent
- CCPA: California Privacy Rights
- HIPAA: Not applicable
- SOC 2: Recommended security compliance
- PCI-DSS: Not applicable (no payment processing)

---

**Version**: 1.0  
**Last Updated**: May 13, 2026  
**Maintained By**: ZEROFY Development Team
