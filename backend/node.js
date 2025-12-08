// ============================
// SIMON TRANSCENDENCE SERVER
// ============================

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ============================
// GOOGLE OAUTH SETUP
// ============================
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth/google/callback'
);

// ============================
// IN-MEMORY DATABASE
// ============================
const users = {};
const activeSessions = {};
const gameRooms = {}; // For multiplayer games
let roomCounter = 0;  // Auto-increment room IDs

// ============================
// REST API ENDPOINTS
// ============================

// Login/Register endpoint
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  const cleanUsername = username.trim();

  if (!users[cleanUsername]) {
    users[cleanUsername] = {
      coins: 0,
      highscore: 0,
      provider: 'local',
      createdAt: new Date()
    };
    console.log(`[AUTH] New user registered: ${cleanUsername}`);
  } else {
    console.log(`[AUTH] User logged in: ${cleanUsername}`);
  }

  res.json({
    success: true,
    user: {
      username: cleanUsername,
      coins: users[cleanUsername].coins,
      highscore: users[cleanUsername].highscore
    }
  });
});

// Get user data
app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;

  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    username,
    coins: users[username].coins,
    highscore: users[username].highscore,
    provider: users[username].provider
  });
});

// Update user coins (shop purchase)
app.post('/api/user/:username/buy', (req, res) => {
  const { username } = req.params;
  const { item, price } = req.body;

  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (users[username].coins < price) {
    return res.status(400).json({ error: 'Not enough coins' });
  }

  users[username].coins -= price;
  if (!users[username].items) users[username].items = [];
  users[username].items.push(item);

  res.json({
    success: true,
    coins: users[username].coins,
    items: users[username].items
  });
});

// ============================
// GOOGLE OAUTH CALLBACK
// ============================
app.get('/oauth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('❌ Authorization code not provided');
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Clean username from email (remove domain)
    const username = email.split('@')[0] + '_google';

    // Create user if doesn't exist
    if (!users[username]) {
      users[username] = {
        coins: 0,
        highscore: 0,
        provider: 'google',
        email: email,
        displayName: name,
        avatar: picture,
        createdAt: new Date()
      };
      console.log(`[GOOGLE AUTH] ✅ New user created: ${username}`);
    } else {
      console.log(`[GOOGLE AUTH] ✅ User logged in: ${username}`);
    }

    // Redirect to frontend with user data
    res.redirect(`/?user=${username}&provider=google`);
  } catch (error) {
    console.error('[GOOGLE AUTH] ❌ Error:', error.message);
    res.status(401).send(`❌ Authentication failed: ${error.message}`);
  }
});

// Award coins endpoint
app.post('/api/user/:username/award-coins', (req, res) => {
  const { username } = req.params;
  const { amount, score } = req.body;

  if (!users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[username].coins += amount;
  
  if (score && score > users[username].highscore) {
    users[username].highscore = score;
  }

  res.json({
    success: true,
    coins: users[username].coins,
    highscore: users[username].highscore
  });
});

// ============================
// MULTIPLAYER ENDPOINTS
// ============================

// Create a new multiplayer game room
app.post('/api/multiplayer/create-room', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const roomId = `room_${++roomCounter}`;
  gameRooms[roomId] = {
    id: roomId,
    createdBy: username,
    players: [username],
    status: 'waiting', // waiting, playing, finished
    gameData: {
      sequences: [],
      scores: {}
    },
    createdAt: new Date()
  };

  res.json({
    success: true,
    roomId: roomId,
    message: `Room ${roomId} created by ${username}`
  });
});

// Get available rooms
app.get('/api/multiplayer/rooms', (req, res) => {
  const availableRooms = Object.entries(gameRooms)
    .filter(([_, room]) => room.status === 'waiting' && room.players.length < 4)
    .map(([_, room]) => ({
      roomId: room.id,
      createdBy: room.createdBy,
      playerCount: room.players.length,
      maxPlayers: 4,
      createdAt: room.createdAt
    }));

  res.json(availableRooms);
});

// Join a multiplayer room
app.post('/api/multiplayer/join-room', (req, res) => {
  const { roomId, username } = req.body;

  if (!roomId || !username) {
    return res.status(400).json({ error: 'Room ID and username required' });
  }

  const room = gameRooms[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.status === 'playing') {
    return res.status(400).json({ error: 'Game already in progress' });
  }

  if (room.players.includes(username)) {
    return res.status(400).json({ error: 'Player already in room' });
  }

  if (room.players.length >= 4) {
    return res.status(400).json({ error: 'Room is full' });
  }

  room.players.push(username);
  room.gameData.scores[username] = 0;

  res.json({
    success: true,
    roomId: roomId,
    players: room.players,
    message: `${username} joined ${roomId}`
  });
});

// Start a multiplayer game
app.post('/api/multiplayer/start-game', (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID required' });
  }

  const room = gameRooms[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.players.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 players' });
  }

  room.status = 'playing';
  room.startedAt = new Date();

  res.json({
    success: true,
    roomId: roomId,
    players: room.players,
    message: 'Game started!'
  });
});

// Get room status
app.get('/api/multiplayer/room/:roomId', (req, res) => {
  const { roomId } = req.params;

  const room = gameRooms[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomId: room.id,
    createdBy: room.createdBy,
    players: room.players,
    status: room.status,
    scores: room.gameData.scores,
    createdAt: room.createdAt,
    startedAt: room.startedAt
  });
});

// Update player score in a room
app.post('/api/multiplayer/update-score', (req, res) => {
  const { roomId, username, score } = req.body;

  if (!roomId || !username || score === undefined) {
    return res.status(400).json({ error: 'Room ID, username, and score required' });
  }

  const room = gameRooms[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!room.players.includes(username)) {
    return res.status(400).json({ error: 'Player not in room' });
  }

  room.gameData.scores[username] = score;

  res.json({
    success: true,
    scores: room.gameData.scores,
    message: `${username} score updated to ${score}`
  });
});

// End a multiplayer game
app.post('/api/multiplayer/end-game', (req, res) => {
  const { roomId, scores } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'Room ID required' });
  }

  const room = gameRooms[roomId];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.status = 'finished';
  room.endedAt = new Date();
  if (scores) room.gameData.scores = scores;

  // Award coins to all players based on their scores
  const winner = Object.entries(room.gameData.scores)
    .sort(([_, a], [__, b]) => b - a)[0];

  if (winner) {
    const [winnerUsername, winnerScore] = winner;
    const coinsWon = Math.floor(winnerScore * 5); // 5 coins per point
    
    if (users[winnerUsername]) {
      users[winnerUsername].coins += coinsWon;
      console.log(`[MULTIPLAYER] ${winnerUsername} won ${coinsWon} coins!`);
    }
  }

  res.json({
    success: true,
    roomId: roomId,
    winner: winner ? winner[0] : null,
    finalScores: room.gameData.scores,
    message: 'Game ended'
  });
});

// Delete a room
app.delete('/api/multiplayer/room/:roomId', (req, res) => {
  const { roomId } = req.params;

  if (!gameRooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  delete gameRooms[roomId];
  res.json({ success: true, message: `Room ${roomId} deleted` });
});

// Get all multiplayer games
app.get('/api/multiplayer/games', (req, res) => {
  const games = Object.values(gameRooms).map(room => ({
    roomId: room.id,
    createdBy: room.createdBy,
    players: room.players,
    status: room.status,
    playerCount: room.players.length,
    scores: room.gameData.scores
  }));

  res.json(games);
});

// Get all users leaderboard
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Object.entries(users)
    .map(([username, data]) => ({
      username,
      coins: data.coins,
      highscore: data.highscore
    }))
    .sort((a, b) => b.highscore - a.highscore)
    .slice(0, 100);

  res.json(leaderboard);
});

// ============================
// WEBSOCKET / SOCKET.IO EVENTS
// ============================

io.on('connection', (socket) => {
  console.log(`[SOCKET] New connection: ${socket.id}`);

  // User joins
  socket.on('user_join', (data) => {
    const { username } = data;
    activeSessions[socket.id] = username;
    console.log(`[SOCKET] ${username} joined (${socket.id})`);

    // Broadcast online users count
    io.emit('users_online', {
      count: Object.keys(activeSessions).length,
      users: Object.values(activeSessions)
    });
  });

  // Game ended - update stats
  socket.on('game_ended', (data) => {
    const { username, score, coinsEarned } = data;

    if (users[username]) {
      users[username].coins += coinsEarned;
      if (score > users[username].highscore) {
        users[username].highscore = score;
      }

      // Broadcast leaderboard update
      io.emit('leaderboard_update', {
        username,
        coins: users[username].coins,
        highscore: users[username].highscore
      });

      console.log(`[GAME] ${username} scored ${score} points, earned ${coinsEarned} coins`);
    }
  });

  // Real-time game sync (optional - for multiplayer features)
  socket.on('game_state', (data) => {
    // Broadcast game state to other players if needed
    socket.broadcast.emit('game_state_update', data);
  });

  // ============================
  // MULTIPLAYER WEBSOCKET EVENTS
  // ============================

  // Join multiplayer room
  socket.on('multiplayer_join_room', (data) => {
    const { roomId, username } = data;
    
    if (gameRooms[roomId]) {
      socket.join(roomId);
      
      // Notify all players in room
      io.to(roomId).emit('player_joined', {
        username: username,
        players: gameRooms[roomId].players,
        message: `${username} joined the game!`
      });
      
      console.log(`[MULTIPLAYER] ${username} joined room ${roomId}`);
    }
  });

  // Player made a move in multiplayer
  socket.on('multiplayer_move', (data) => {
    const { roomId, username, sequenceIndex, isCorrect } = data;
    
    if (gameRooms[roomId]) {
      // Broadcast move to other players
      socket.to(roomId).emit('opponent_move', {
        username: username,
        sequenceIndex: sequenceIndex,
        isCorrect: isCorrect
      });
    }
  });

  // Update score in real-time
  socket.on('multiplayer_score_update', (data) => {
    const { roomId, username, score } = data;
    
    if (gameRooms[roomId]) {
      gameRooms[roomId].gameData.scores[username] = score;
      
      // Broadcast updated scores to all players
      io.to(roomId).emit('scores_updated', {
        scores: gameRooms[roomId].gameData.scores,
        message: `${username} scored ${score}!`
      });
    }
  });

  // Player finished their round
  socket.on('multiplayer_round_end', (data) => {
    const { roomId, username, roundScore } = data;
    
    if (gameRooms[roomId]) {
      io.to(roomId).emit('player_round_end', {
        username: username,
        roundScore: roundScore,
        allScores: gameRooms[roomId].gameData.scores
      });
    }
  });

  // Player wants to leave room
  socket.on('multiplayer_leave_room', (data) => {
    const { roomId, username } = data;
    
    if (gameRooms[roomId]) {
      const index = gameRooms[roomId].players.indexOf(username);
      if (index > -1) {
        gameRooms[roomId].players.splice(index, 1);
        delete gameRooms[roomId].gameData.scores[username];
      }
      
      socket.leave(roomId);
      
      // Notify remaining players
      io.to(roomId).emit('player_left', {
        username: username,
        remainingPlayers: gameRooms[roomId].players,
        message: `${username} left the game`
      });
      
      // Delete room if empty
      if (gameRooms[roomId].players.length === 0) {
        delete gameRooms[roomId];
        console.log(`[MULTIPLAYER] Room ${roomId} deleted (empty)`);
      }
    }
  });

  // Chat message in multiplayer
  socket.on('multiplayer_chat', (data) => {
    const { roomId, username, message } = data;
    
    if (gameRooms[roomId]) {
      io.to(roomId).emit('chat_message', {
        username: username,
        message: message,
        timestamp: new Date()
      });
      
      console.log(`[CHAT] ${username} in ${roomId}: ${message}`);
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    const username = activeSessions[socket.id];
    delete activeSessions[socket.id];

    console.log(`[SOCKET] ${username} disconnected (${socket.id})`);

    io.emit('users_online', {
      count: Object.keys(activeSessions).length,
      users: Object.values(activeSessions)
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`[SOCKET] Error from ${socket.id}:`, error);
  });
});

// ============================
// ROUTES
// ============================

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    activeUsers: Object.keys(activeSessions).length
  });
});

// ============================
// ERROR HANDLING
// ============================

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================
// START SERVER
// ============================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Simon Transcendence Server running on http://localhost:${PORT}`);
  console.log(`📊 Socket.IO ready for real-time connections`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});
