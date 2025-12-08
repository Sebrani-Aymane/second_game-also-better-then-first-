# 🎮 Multiplayer Turn-Based Gameplay Guide

## Overview

The game now supports **turn-based multiplayer** for both local (same device) and online (server) play. Each player takes turns attempting to complete the Simon sequence, and scores are accumulated based on successful completions.

---

## Game Mechanics

### How Turns Work

1. **Player Takes Turn**: The current player's name is displayed at the top
2. **Sequence Display**: The game shows the full sequence the player must repeat
3. **Player Input**: The player clicks/presses squares to match the sequence
4. **Scoring**: 
   - ✅ **Correct**: +1 point, sequence extends by 1 element, same player continues
   - ❌ **Wrong**: Turn ends, move to next player, sequence resets
5. **Next Player**: After a mistake or completion, control passes to the next player in the rotation

### Player Count

- **Local Multiplayer**: 2-4 players on the same device
- **Online Multiplayer**: Up to 4 players in a room

---

## Local Multiplayer (2-4 Players, Same Device)

### Setup

1. Click **"Multiplayer"** from the main menu
2. Select **"Local Multiplayer (2-4 Players)"**
3. Choose your player count: **2, 3, or 4 players**

### How to Play

Each player will take turns clicking the colored squares on the screen.

**Turn Order**: Player 1 → Player 2 → Player 3 (if 3+) → Player 4 (if 4) → back to Player 1

**Scoring System**:
- Each successful sequence completion = +1 point
- Mistakes end the turn
- Final scores shown at the end

### Player Information Display

```
┌─────────────┐  ┌─────────────┐
│  Player 1   │  │  Player 2   │
│    Score    │  │    Score    │
└─────────────┘  └─────────────┘
```

Each player's name and current score is displayed with a colored background.

### Example Gameplay

```
Round 1:
- Player 1's Turn: Sequence [2] → Player 1 clicks square 2 → Correct! Score: 1
- Sequence extends: [2, 7]
- Player 1 clicks 2, 7 → Correct! Score: 2
- Sequence extends: [2, 7, 4]
- Player 1 clicks 2, 7, 4 → Correct! Score: 3
- Sequence extends: [2, 7, 4, 9]
- Player 1 clicks 2, 7, 4... and clicks wrong square
- ❌ Player 1 made a mistake!

Round 2:
- Player 2's Turn: New sequence starts [5] → Player 2 plays...
```

---

## Online Multiplayer (Up to 4 Players, Server-Based)

### Setup

1. Click **"Multiplayer"** from the main menu
2. Select **"Online Multiplayer (Turn-Based)"**
3. **Create Room**: Enter a room name and click "Create Room"
   - OR **Join Room**: Select an available room from the list
4. Wait for other players to join (up to 4 total)
5. Click **"Start Game"** to begin

### How to Play

1. **Room Lobby**: See all connected players
2. **Game Start**: First player to join gets the first turn
3. **Take Your Turn**: When it's your turn, click the squares to match the sequence
4. **Real-Time Updates**: Other players see your moves and scores update live
5. **Turn Rotation**: After your turn (correct or mistake), the next player goes

### Real-Time Synchronization

- **Move Broadcast**: Your clicks are sent to all players in real-time
- **Score Updates**: When you complete a sequence, your score updates for everyone
- **Turn Indicator**: Shows whose turn it is
- **Notifications**: Alerts when players join/leave or make mistakes

### Real-Time Events (Socket.IO)

```
multiplayer_join_room → Player joins and is added to room
player_joined → All players notified
multiplayer_move → Player's move sent to others
multiplayer_score_update → Score updated on server and broadcast
player_left → Player disconnects or leaves
```

---

## Features

### Visual Feedback

- ✅ Squares flash when clicked
- 🔊 Unique tone plays for each square
- 📊 Live score tracking for all players
- 🎯 Current turn indicator
- 💬 Notifications for key events

### Game States

| State | Description |
|-------|-------------|
| **Waiting** | Waiting for players to join |
| **Active** | Game in progress, player taking turn |
| **Mistake** | Player made wrong move, transitioning to next player |
| **Sequence Growing** | Player completed sequence, it's growing |
| **Game Over** | All players finished (optional end condition) |

---

## Scoring

### Points Awarded

- **+1 point** = Successfully complete one full sequence element
- **Multiple points** = Accumulate by completing increasingly long sequences

### Example Score Progression

```
Player 1:
Seq [3] → Correct → Score: 1
Seq [3,5] → Correct → Score: 2
Seq [3,5,1] → Correct → Score: 3
Seq [3,5,1,8] → Wrong at 3rd element → Score stays 3
```

### Leaderboard (Online Only)

Scores are tracked on the server:
- Sent via `/api/multiplayer/update-score` endpoint
- Updated in real-time for all players
- Persistent for the game session

---

## Controls

### Clicking
- **Mouse/Touch**: Click any square to select it
- **Keyboard** (Local only, future enhancement)

### Navigation
- **Back Button**: Return to main menu
- **Leave Room** (Online): Exit multiplayer, return to menu

---

## Technical Details

### Backend Endpoints

```
GET  /api/multiplayer/rooms              # List available rooms
POST /api/multiplayer/create-room        # Create new room
POST /api/multiplayer/join-room          # Join existing room
POST /api/multiplayer/start-game         # Start game in room
GET  /api/multiplayer/room/:roomId       # Get room details
POST /api/multiplayer/update-score       # Update player score
POST /api/multiplayer/end-game           # End game session
DELETE /api/multiplayer/room/:roomId     # Leave/delete room
```

### WebSocket Events (Socket.IO)

```
multiplayer_join_room       # Emit: Player joins
player_joined               # Receive: Player joined notification
multiplayer_move            # Emit: Player makes a move
multiplayer_score_update    # Emit: Score update
scores_updated              # Receive: Scores broadcast
player_round_end            # Receive: Player turn ended
player_left                 # Receive: Player left
multiplayer_leave_room      # Emit: Player leaving
multiplayer_chat            # Emit/Receive: Chat messages
```

---

## Tips & Tricks

1. **Quick Recognition**: Focus on the flashing pattern, not just memory
2. **Pace Yourself**: Take your time clicking each square
3. **Watch Others**: Learn patterns by watching other players
4. **Communication**: Use chat to coordinate strategies (online)
5. **Practice**: Single-player mode is great for warming up

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Room not loading | Refresh page and rejoin |
| Clicks not registering | Wait for your turn indicator |
| Score not updating | Check internet connection |
| Game freezes | Reload page and rejoin room |

---

## Future Enhancements

- 🎯 Difficulty levels (slow, normal, fast)
- 🏆 Global leaderboards
- ⏱️ Timed challenges
- 👥 Teams mode (2v2)
- 🎵 Custom soundtracks
- 🎨 Theme customization

---

## FAQ

**Q: Can I play with more than 4 players?**
A: Currently limited to 4 players per room for gameplay clarity. Multiple rooms supported!

**Q: What happens if a player disconnects?**
A: They're removed from the room, and if the room becomes empty, it's deleted from the server.

**Q: How long does a game session last?**
A: As long as players want! No time limit.

**Q: Can I save my score?**
A: Scores are tracked during the session. Integrate with user profiles in the future!

---

Enjoy turn-based multiplayer! 🎮✨
