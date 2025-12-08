# Simon Transcendence - Game Setup Guide

A futuristic Simon Says game with a backend server, real-time features, and shop system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies (if needed)
```bash
cd public
npm install
```

### Running the Game

#### Option A: Start Backend Server Only
```bash
cd backend
npm start
```
The server will run on `http://localhost:3000`

#### Option B: Development Mode with Auto-Reload
```bash
cd backend
npm install --save-dev nodemon
npm run dev
```

#### Open in Browser
Once the backend is running, open your browser and go to:
```
http://localhost:3000
```

## 📁 Project Structure

```
second_game-also-better-then-first-/
├── backend/
│   ├── node.js              # Express server with Socket.IO
│   ├── package.json         # Backend dependencies
│   └── README.md            # This file
├── public/
│   ├── index.html           # Main HTML file
│   ├── script.js            # Game logic and API integration
│   ├── style.css            # Futuristic styling
│   └── package.json         # Frontend dependencies (if any)
└── package.json             # Root package file
```

## 🎮 Game Features

- **User Authentication**: Create/login with username
- **Simon Game**: Memory sequence pattern game (10 squares)
- **Coin System**: Earn coins for completing rounds
- **Shop System**: Buy avatars and items with coins
- **Leaderboard**: Track high scores
- **Real-time Updates**: Socket.IO for live multiplayer features
- **OAuth Support**: Demo mode for Google and 42 Intra login

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login/Register user
  - Body: `{ username: "string" }`

### User Data
- `GET /api/user/:username` - Get user information
- `POST /api/user/:username/award-coins` - Award coins to user
  - Body: `{ amount: number, score: number }`
- `POST /api/user/:username/buy` - Purchase item
  - Body: `{ item: "string", price: number }`

### Leaderboard
- `GET /api/leaderboard` - Get top 100 users by high score

### System
- `GET /api/health` - Server health check

## 🔌 WebSocket Events

### Client → Server
- `user_join` - User connects to game
  - Data: `{ username: "string" }`
- `game_ended` - Game session ends
  - Data: `{ username: "string", score: number, coinsEarned: number }`
- `game_state` - Sync game state (for multiplayer)

### Server → Client
- `users_online` - Online user count update
  - Data: `{ count: number, users: string[] }`
- `leaderboard_update` - Leaderboard changed
  - Data: `{ username: "string", coins: number, highscore: number }`
- `game_state_update` - Game state sync

## 🛠️ Configuration

The backend automatically uses:
- **Port**: 3000 (or `process.env.PORT` if set)
- **CORS**: Enabled for all origins
- **Static Files**: Served from `../public/`

To run on a different port:
```bash
PORT=5000 npm start
```

## 🔧 Troubleshooting

### "Cannot GET /" error
Make sure backend is running and public files are accessible.

### Connection refused on localhost:3000
Check if port 3000 is already in use:
```bash
# On Linux/Mac
lsof -i :3000

# On Windows
netstat -ano | findstr :3000
```

### CORS errors
The backend has CORS enabled for all origins. If issues persist, check browser console for details.

### Missing dependencies
If you get "Cannot find module" errors:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User profiles with avatars
- [ ] Real multiplayer games
- [ ] Production OAuth integration
- [ ] Game statistics and analytics
- [ ] Chat/messaging system
- [ ] Tournaments and seasons
- [ ] Mobile app

## 🐛 Issues & Fixes Applied

✅ Fixed: Removed placeholder text from HTML app div
✅ Fixed: Integrated frontend with backend API
✅ Fixed: Added proper coin/score tracking
✅ Fixed: Implemented user authentication flow
✅ Fixed: Added CORS support for API calls

## 📧 Support

For issues or questions, check the console output for error messages and ensure:
1. Backend server is running
2. Browser can reach `http://localhost:3000`
3. Network tab shows successful API calls
4. JavaScript console shows no errors

## 📄 License

ISC
