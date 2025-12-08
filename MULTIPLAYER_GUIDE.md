# 🎮 Multiplayer Guide - Simon Transcendence

## Overview

Your Simon Transcendence game now supports **three game modes**:

1. **Single Player** - Classic solo gameplay (original mode)
2. **Local Multiplayer** - Two players on the same device
3. **Online Multiplayer** - Play against others on the server in real-time

---

## 🎯 How to Play

### Main Menu

After logging in, you'll see the main game screen with these options:

- **Start** - Play single-player mode
- **Multiplayer** - Access multiplayer options
- **Shop** - Buy upgrades and cosmetics
- **Logout** - Sign out

---

## 1️⃣ Single Player Mode

**How to Start:**
1. Click "Start" button
2. Press any square to begin
3. The game will generate a sequence
4. Repeat the sequence correctly to advance
5. Each round adds one more step

**Goal:** Complete as many rounds as possible without making a mistake!

---

## 2️⃣ Local Multiplayer (Same Device)

**Perfect for:** Playing with a friend on the same computer

**How to Start:**
1. Click "Multiplayer" button
2. Select "Local Multiplayer (2 Players)"
3. Click "Start Game"

**Player Controls:**

| Player 1 | Player 2 |
|----------|----------|
| Keys: 1, 2, 3, 4, 5 | Keys: Q, W, E, R, T |
| Top 5 squares | Bottom 5 squares |

**Game Flow:**
- Both players share the same sequence
- Players take turns
- Each player tries to extend/complete the sequence
- One mistake ends that player's turn
- The player who makes the fewest mistakes wins

**Scoring:**
- Each turn you complete correctly = +1 point
- Mistakes add to your mistake count
- Game continues until both players decide to quit

---

## 3️⃣ Online Multiplayer (Server)

**Play Against Others:** Connect to the server and compete with other players globally!

### Starting Online Multiplayer

**Step 1: Connect**
1. Click "Multiplayer" button
2. Select "Online Multiplayer"
3. You'll automatically connect to the server

**Step 2: Create or Join a Room**

#### Creating a Room:
1. Enter a room name (e.g., "Epic Battle" or "Speed Run")
2. Click "Create Room"
3. Share the room ID with friends
4. Wait for other players to join

#### Joining a Room:
1. Browse available rooms in the list
2. Click "Join" next to the room you want
3. You'll enter the room lobby

### Room Features:

- **Player List** - See all players in your room
- **Start Game** - Begin the game when ready (creator can start)
- **Real-time Scores** - Watch scores update as players complete sequences
- **Chat** - Send messages to other players (future feature)
- **Leave Room** - Exit anytime without penalty

### Online Game Rules:

1. **Shared Sequence** - All players see the same Simon sequence
2. **Independent Turns** - Each player gets their own turn
3. **Real-time Updates** - See other players' moves and scores instantly
4. **Winner** - Whoever completes the longest sequence wins the round

---

## 📊 Scoring System

### Single Player
- Points = Number of rounds completed
- Your score is saved to your profile

### Local Multiplayer
- **Player 1 Score** - Rounds completed before mistake
- **Player 2 Score** - Rounds completed before mistake
- Winner = Higher score

### Online Multiplayer
- **Round Score** - Points for completing the sequence
- **Total Score** - Accumulated across all games
- **Leaderboard** - Ranked against other players globally

---

## 🔌 Server Requirements

**To play online multiplayer, ensure:**
- Backend server is running: `npm run dev` (in backend folder)
- Frontend is accessible at `http://localhost:3000`
- Internet connection is stable
- Other players have the same game running

---

## 🎮 Game Mechanics

### Sequence Rules
- Sequence starts with 1 element
- After each correct completion, add 1 element
- Maximum sequence display: ~50 elements (game gets very hard!)

### Input Rules
- You can only input after the sequence finishes playing
- All inputs must match the sequence exactly
- One mistake = Game over or turn over

### Timing
- Each square lights up for 300ms
- 300ms pause between squares
- Varies based on round number

---

## 🌟 Tips & Tricks

1. **Concentration** - Focus on the pattern, don't rush
2. **Rhythm** - Try to remember the beat/pattern of the sequence
3. **Local Play** - Practice locally before trying online
4. **Multiplayer Strategy** - Watch what others do, learn from mistakes
5. **Score Chasing** - Try different difficulty levels in the shop

---

## 🔧 API Endpoints (Backend)

If you're integrating with other systems:

### Multiplayer Endpoints

```
POST   /api/multiplayer/create-room      - Create a new game room
GET    /api/multiplayer/rooms            - List all available rooms
POST   /api/multiplayer/join-room        - Join an existing room
POST   /api/multiplayer/start-game       - Start game in a room
GET    /api/multiplayer/room/:roomId     - Get room details
POST   /api/multiplayer/update-score     - Update player score
POST   /api/multiplayer/end-game         - End game and save results
DELETE /api/multiplayer/room/:roomId     - Delete/leave room
GET    /api/multiplayer/games            - Get all completed games
```

---

## 🔗 WebSocket Events (Real-time)

```javascript
// Client Events (send to server)
socket.emit('multiplayer_join_room', {roomId, username})
socket.emit('multiplayer_move', {roomId, username, sequenceIndex, isCorrect})
socket.emit('multiplayer_score_update', {roomId, username, score})
socket.emit('multiplayer_round_end', {roomId, username, roundScore})
socket.emit('multiplayer_leave_room', {roomId, username})
socket.emit('multiplayer_chat', {roomId, username, message})

// Server Events (receive from server)
socket.on('player_joined', data)           // New player joined
socket.on('opponent_move', data)           // Player made a move
socket.on('scores_updated', data)          // Scores changed
socket.on('player_left', data)             // Player left
socket.on('chat_message', data)            // Chat message received
```

---

## 🐛 Troubleshooting

### Can't see online rooms?
- Check that backend server is running: `npm run dev` in `/backend`
- Verify `http://localhost:3000` is accessible
- Refresh the page (F5)

### Games feel laggy?
- Check your internet connection
- Close other applications using bandwidth
- Try a room with fewer players

### Can't join a room?
- Room might be full or already started
- Try creating your own room
- Ensure you're logged in

### Score not updating?
- Refresh the page
- Try leaving and re-joining the room
- Check backend server console for errors

---

## 🚀 Features Roadmap

Coming soon:
- ✅ Online multiplayer rooms
- ✅ Local 2-player mode
- ⏳ Chat messaging
- ⏳ Friend lists
- ⏳ Tournaments
- ⏳ Power-ups in multiplayer
- ⏳ Mobile support

---

## 📝 Notes

- All multiplayer data is stored on the server temporarily
- Games are stored in server memory (reset on server restart)
- Scores can be synced to database for persistence
- Local multiplayer doesn't require internet

---

## 🎉 Have Fun!

Whether you're playing solo, with friends locally, or competing globally online, Simon Transcendence is ready to challenge you.

**Best of luck, and may your sequences be long!** 🚀

---

*For technical support or bugs, check the backend console logs.*
