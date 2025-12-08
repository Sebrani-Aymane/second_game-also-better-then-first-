# Simon Transcendence - API Reference

## Base URL
```
http://localhost:3000
```

---

## REST API Endpoints

### 🔐 Authentication

#### Login or Register User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "player1"
}

Response (200):
{
  "success": true,
  "user": {
    "username": "player1",
    "coins": 0,
    "highscore": 0
  }
}

Response (400 - Error):
{
  "error": "Username must be at least 3 characters"
}
```

---

### 👤 User Data

#### Get User Information
```
GET /api/user/:username

Response (200):
{
  "username": "player1",
  "coins": 100,
  "highscore": 25,
  "provider": "local"
}

Response (404):
{
  "error": "User not found"
}
```

#### Award Coins
```
POST /api/user/:username/award-coins
Content-Type: application/json

Request Body:
{
  "amount": 5,
  "score": 15
}

Response (200):
{
  "success": true,
  "coins": 105,
  "highscore": 25
}

Response (404):
{
  "error": "User not found"
}
```

---

### 🛍️ Shop

#### Purchase Item
```
POST /api/user/:username/buy
Content-Type: application/json

Request Body:
{
  "item": "avatar1",
  "price": 20
}

Response (200):
{
  "success": true,
  "coins": 80,
  "items": ["avatar1"]
}

Response (400):
{
  "error": "Not enough coins"
}

Response (404):
{
  "error": "User not found"
}
```

---

### 📊 Leaderboard

#### Get Top Players
```
GET /api/leaderboard

Response (200):
[
  {
    "username": "champion",
    "coins": 5000,
    "highscore": 150
  },
  {
    "username": "player1",
    "coins": 2500,
    "highscore": 85
  },
  ...
]
```

Returns top 100 users sorted by highscore (descending)

---

### ❤️ Health Check

#### Server Status
```
GET /api/health

Response (200):
{
  "status": "ok",
  "timestamp": "2025-12-08T10:30:45.123Z",
  "activeUsers": 3
}
```

---

## WebSocket Events (Socket.IO)

### Connection Setup
```javascript
const socket = io('http://localhost:3000');
```

### Client → Server Events

#### User Joins
```javascript
socket.emit('user_join', {
  username: 'player1'
});
```

#### Game Ends
```javascript
socket.emit('game_ended', {
  username: 'player1',
  score: 15,
  coinsEarned: 75
});
```

#### Game State Sync
```javascript
socket.emit('game_state', {
  username: 'player1',
  gameSequence: [1, 3, 2, 5],
  userSequence: [1, 3]
});
```

---

### Server → Client Events

#### Users Online Update
```javascript
socket.on('users_online', (data) => {
  console.log('Online users:', data.count);
  console.log('Users:', data.users); // ['player1', 'player2']
});
```

#### Leaderboard Update
```javascript
socket.on('leaderboard_update', (data) => {
  console.log('Updated user:', data.username);
  console.log('New coins:', data.coins);
  console.log('New highscore:', data.highscore);
});
```

#### Game State Update
```javascript
socket.on('game_state_update', (data) => {
  console.log('Other player state:', data);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Username must be at least 3 characters"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Usage Examples

### JavaScript/Fetch

#### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'player1' })
});
const data = await response.json();
```

#### Award Coins
```javascript
const response = await fetch('/api/user/player1/award-coins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 5, score: 15 })
});
const data = await response.json();
```

#### Get Leaderboard
```javascript
const response = await fetch('/api/leaderboard');
const leaderboard = await response.json();
console.log(leaderboard);
```

---

### cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1"}'
```

#### Get User
```bash
curl http://localhost:3000/api/user/player1
```

#### Award Coins
```bash
curl -X POST http://localhost:3000/api/user/player1/award-coins \
  -H "Content-Type: application/json" \
  -d '{"amount":5,"score":15}'
```

#### Leaderboard
```bash
curl http://localhost:3000/api/leaderboard
```

---

## Rate Limiting
Currently not implemented. Add in production deployment.

## Authentication
Currently using simple username validation. Use JWT tokens in production.

## CORS
Enabled for all origins. Restrict in production deployment.

---

## Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or insufficient coins |
| 404 | Not Found | User or endpoint not found |
| 500 | Server Error | Internal server error |

---

**Last Updated**: December 8, 2025
**Version**: 1.0.0
