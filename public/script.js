// ============================
// SIMON TRANSCENDENCE JS
// ============================

const app = document.getElementById("app");
let currentUser = null;
let gameSequence = [];
let userSequence = [];
let allowInput = false;
let squares = [];
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// API Configuration
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : window.location.origin;

// ============================
// GOOGLE OAUTH CALLBACK HANDLER
// ============================
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const user = params.get('user');
  const provider = params.get('provider');
  
  // If this is an OAuth callback
  if (user && provider === 'google') {
    currentUser = user;
    console.log(`✅ Logged in via Google: ${user}`);
    
    // Clear URL (remove query parameters)
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Load main game UI
    setTimeout(() => {
      loadMainUI();
    }, 100);
  }
});

// ============================
// Utility
// ============================
function playTone(freq, duration = 300) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  setTimeout(() => osc.stop(), duration);
}

function flashSquare(id) {
  const el = document.getElementById("sq" + id);
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 300);
}

function saveUsers(data) {
  // Save to backend via API
  Object.keys(data).forEach(username => {
    if (username === currentUser) {
      localStorage.setItem("simon_users", JSON.stringify(data));
    }
  });
}

function loadUsers() {
  return JSON.parse(localStorage.getItem("simon_users") || "{}");
}

// ============================
// LOGIN
// ============================
function showLogin() {
  app.innerHTML = `
    <div class="modal">
      <div class="modal-content">
        <h2>Welcome Back</h2>
        <p style="color: #666; margin-bottom: 20px;">Sign in to continue</p>
        
        <!-- OAuth Login Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <button id="googleLogin" class="oauth-btn" style="
            background: #fff;
            color: #333;
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 15px;
            font-weight: 500;
          ">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
          
          <button id="intra42Login" class="oauth-btn" style="
            background: #00babc;
            color: #fff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 15px;
            font-weight: 500;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.308L14.787 24l-2.089-2.09 6.248-6.247-6.248-6.247 2.09-2.09L24 12.308zM9.213 0L0 11.692l2.09 2.09 6.247-6.248 6.248 6.248 2.089-2.09L9.213 0z"/>
            </svg>
            Continue with 42 Intra
          </button>
        </div>
        
        <!-- Divider -->
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0;
          color: #999;
          font-size: 14px;
        ">
          <div style="flex: 1; height: 1px; background: #ddd;"></div>
          <span>or</span>
          <div style="flex: 1; height: 1px; background: #ddd;"></div>
        </div>
        
        <!-- Username Login -->
        <input 
          id="username" 
          placeholder="Username" 
          autocomplete="username"
          maxlength="20"
          style="
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            margin-bottom: 5px;
            box-sizing: border-box;
          "
        />
        <span id="errorMsg" style="color: #e74c3c; font-size: 14px; display: none; margin-bottom: 10px;"></span>
        <button id="loginBtn" style="
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Continue</button>
        <p style="color: #888; font-size: 13px; margin-top: 15px; text-align: center;">
          New users will be created automatically
        </p>
      </div>
    </div>
  `;

  // Add hover effects
  const style = document.createElement('style');
  style.textContent = `
    .oauth-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    #googleLogin:hover { background: #f8f9fa; }
    #intra42Login:hover { background: #009a9c; }
    #loginBtn:hover { background: #0056b3; }
    #loginBtn:disabled { background: #6c757d; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  const usernameInput = document.getElementById("username");
  const loginBtn = document.getElementById("loginBtn");
  const errorMsg = document.getElementById("errorMsg");
  const googleLoginBtn = document.getElementById("googleLogin");
  const intra42LoginBtn = document.getElementById("intra42Login");

  usernameInput.focus();

  usernameInput.addEventListener("input", () => {
    errorMsg.style.display = "none";
    usernameInput.style.borderColor = "#ddd";
  });

  usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });

  // Google OAuth Login (REAL)
  googleLoginBtn.onclick = () => {
    // Your Google Client ID - get from Google Console
    const clientId = '1035972626488-updcg2f1hj5kibvgc9053de9akfv2v5i.apps.googleusercontent.com'; // REPLACE WITH YOUR CLIENT ID
    
    if (!clientId) {
      alert('❌ Google Client ID not configured.\n\nTo enable Google login:\n1. Get Client ID from https://console.cloud.google.com/\n2. Add it to public/script.js line 186\n\nFor now, use username login below!');
      return;
    }
    
    // Generate random state for security
    const state = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('oauth_state', state);
    
    // OAuth parameters
    const clientId_encoded = encodeURIComponent(clientId);
    const redirectUri = encodeURIComponent('http://localhost:3000/oauth/google/callback');
    const scope = encodeURIComponent('profile email');
    
    // Redirect to Google OAuth
    window.location.href = 
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId_encoded}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}`;
  };

  // 42 Intra OAuth Login (Demo Mode)
  intra42LoginBtn.onclick = () => {
    handleOAuthLoginDemo("42");
  };

  // Username Login
  loginBtn.onclick = () => {
    const name = usernameInput.value.trim();
    
    if (!name) {
      showError("Please enter a username");
      return;
    }
    
    if (name.length < 3) {
      showError("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      showError("Username can only contain letters, numbers, and underscores");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Loading...";

    // Send login request to backend
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showError(data.error);
        loginBtn.disabled = false;
        loginBtn.textContent = "Continue";
        return;
      }
      
      currentUser = name;
      
      // Initialize local user data
      const users = loadUsers();
      if (!users[name]) {
        users[name] = { coins: 0, highscore: 0, provider: "local" };
        saveUsers(users);
        console.log(`Welcome, ${name}! Account created successfully.`);
      }
      
      loadMainUI();
    })
    .catch(error => {
      showError("Connection error. Please check if backend is running.");
      loginBtn.disabled = false;
      loginBtn.textContent = "Continue";
      console.error('Login error:', error);
    });
  };

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    usernameInput.style.borderColor = "#e74c3c";
    usernameInput.focus();
  }
}

// ============================
// OAUTH HANDLERS (DEMO MODE)
// ============================
function handleOAuthLoginDemo(provider) {
  // Demo mode - simulates OAuth flow without real credentials
  const demoUsers = {
    google: {
      id: Math.random().toString(36).substr(2, 9),
      email: "user@gmail.com",
      name: "Google User",
      avatar: "https://via.placeholder.com/100/4285F4/ffffff?text=G"
    },
    "42": {
      id: Math.random().toString(36).substr(2, 9),
      email: "user@student.42.fr",
      name: "42 Student",
      avatar: "https://via.placeholder.com/100/00babc/ffffff?text=42"
    }
  };

  // Show loading modal
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div class="modal" style="z-index: 1000;">
      <div class="modal-content" style="text-align: center;">
        <h3>Authenticating with ${provider === "42" ? "42 Intra" : "Google"}...</h3>
        <div style="margin: 20px 0;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid ${provider === "42" ? "#00babc" : "#4285F4"};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          "></div>
        </div>
        <p style="color: #666;">This is demo mode - no real OAuth credentials needed</p>
      </div>
    </div>
  `;
  
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinStyle);
  document.body.appendChild(modal);

  // Simulate OAuth delay
  setTimeout(() => {
    document.body.removeChild(modal);
    
    const userData = demoUsers[provider];
    
    // Prompt for username (since this is demo mode)
    const username = prompt(
      `Enter a username for your ${provider === "42" ? "42 Intra" : "Google"} account:`,
      `${provider}_${userData.id.substr(0, 6)}`
    );
    
    if (!username || username.trim().length < 3) {
      alert("Invalid username. Login cancelled.");
      return;
    }

    try {
      const users = loadUsers();
      const cleanUsername = username.trim();
      const isNewUser = !users[cleanUsername];
      
      if (!users[cleanUsername]) {
        users[cleanUsername] = {
          coins: 0,
          highscore: 0,
          provider: provider,
          email: userData.email,
          displayName: userData.name,
          avatar: userData.avatar
        };
      }
      
      saveUsers(users);
      currentUser = cleanUsername;
      
      if (isNewUser) {
        console.log(`Welcome, ${userData.name}! Account created via ${provider}.`);
      }
      
      loadMainUI();
    } catch (error) {
      console.error("OAuth demo error:", error);
      alert("Login failed. Please try again.");
    }
  }, 1500);
}

// ============================
// PRODUCTION OAUTH SETUP
// ============================
/*
For production OAuth implementation, follow these steps:

1. GET OAUTH CREDENTIALS:
   - Google: https://console.cloud.google.com/
     * Create project → Enable Google+ API
     * Create OAuth 2.0 credentials
     * Add authorized redirect URIs
   
   - 42 Intra: https://profile.intra.42.fr/oauth/applications
     * Create new application
     * Set redirect URI
     * Copy Client ID and Secret

2. CREATE BACKEND ENDPOINT:
   Example Node.js/Express endpoint:

   app.post('/api/oauth/exchange', async (req, res) => {
     const { code, provider } = req.body;
     
     const config = {
       google: {
         tokenUrl: 'https://oauth2.googleapis.com/token',
         userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET
       },
       '42': {
         tokenUrl: 'https://api.intra.42.fr/oauth/token',
         userInfoUrl: 'https://api.intra.42.fr/v2/me',
         clientId: process.env.INTRA42_CLIENT_ID,
         clientSecret: process.env.INTRA42_CLIENT_SECRET
       }
     };
     
     try {
       // Exchange code for access token
       const tokenResponse = await fetch(config[provider].tokenUrl, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           grant_type: 'authorization_code',
           code: code,
           client_id: config[provider].clientId,
           client_secret: config[provider].clientSecret,
           redirect_uri: YOUR_REDIRECT_URI
         })
       });
       
       const { access_token } = await tokenResponse.json();
       
       // Get user info
       const userResponse = await fetch(config[provider].userInfoUrl, {
         headers: { Authorization: `Bearer ${access_token}` }
       });
       
       const userData = await userResponse.json();
       
       res.json({
         id: userData.id,
         email: userData.email,
         name: userData.name || userData.login,
         avatar: userData.picture || userData.image?.link
       });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

3. REPLACE handleOAuthLoginDemo() WITH REAL OAUTH:
   See previous artifact for production OAuth implementation

4. CREATE CALLBACK PAGE (callback.html):
   <!DOCTYPE html>
   <html>
   <head><title>Authenticating...</title></head>
   <body>
     <script>
       const params = new URLSearchParams(window.location.search);
       const code = params.get('code');
       const state = params.get('state');
       const error = params.get('error');
       
       if (error) {
         window.opener.postMessage({ type: 'oauth_error', error }, window.location.origin);
         window.close();
       } else if (code && state) {
         fetch('/api/oauth/exchange', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ code, provider: state })
         })
         .then(res => res.json())
         .then(userData => {
           window.opener.postMessage({
             type: 'oauth_success',
             provider: state,
             userData
           }, window.location.origin);
           window.close();
         })
         .catch(err => {
           window.opener.postMessage({
             type: 'oauth_error',
             error: err.message
           }, window.location.origin);
           window.close();
         });
       }
     </script>
   </body>
   </html>
*/

// ============================
// MULTIPLAYER VARIABLES & SETUP
// ============================
let socket = null;
let currentRoom = null;
let multiplayerPlayers = {};
let multiplayerMode = null; // 'single', 'local', or 'server'
let localPlayer = 1; // 1 or 2 for local multiplayer

// Initialize Socket.IO connection
function initializeSocket() {
  if (!socket) {
    socket = io(API_URL);
    setupSocketEvents();
  }
}

function setupSocketEvents() {
  socket.on('connect', () => {
    console.log('✅ Connected to multiplayer server');
  });

  socket.on('player_joined', (data) => {
    console.log(`👤 ${data.username} joined the room`);
    multiplayerPlayers = data.players.reduce((acc, p) => {
      acc[p] = { name: p, score: 0 };
      return acc;
    }, {});
    updatePlayerList();
    showNotification(`${data.username} joined!`);
  });

  socket.on('opponent_move', (data) => {
    // Visualize opponent pressing a square
    const { move, username } = data;
    const el = document.getElementById('sq' + move);
    if (el) {
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 300);
    }
    console.log(`🎮 ${username} pressed ${move}`);
  });

  // Shared-sequence round grew
  socket.on('new_round', (data) => {
    // Update UI to reflect new sequence length
    const info = document.getElementById('sequenceInfo');
    if (info) info.textContent = `Round: ${data.round + 1} | Sequence Length: ${data.sequenceLength}`;
    showNotification(`🎉 Round ${data.round + 1} — sequence length ${data.sequenceLength}`);
  });

  // Turn changed notification
  socket.on('turn_changed', (data) => {
    const turnEl = document.getElementById('currentTurn');
    if (turnEl) turnEl.textContent = `🎯 ${data.currentPlayer}'s Turn`;
  });

  socket.on('scores_updated', (data) => {
    multiplayerPlayers = {};
    Object.keys(data.scores).forEach(username => {
      multiplayerPlayers[username] = { name: username, score: data.scores[username] };
    });
    updatePlayerList();
    showNotification(data.message);
  });

  socket.on('player_left', (data) => {
    console.log(`👋 ${data.username} left the game`);
    delete multiplayerPlayers[data.username];
    updatePlayerList();
    showNotification(`${data.username} left!`);
  });

  socket.on('chat_message', (data) => {
    console.log(`💬 [${data.username}]: ${data.message}`);
    showNotification(`${data.username}: ${data.message}`);
  });
}

function updatePlayerList() {
  const playerList = document.getElementById('playerList');
  if (!playerList) return;

  playerList.innerHTML = Object.keys(multiplayerPlayers).map(username => `
    <div style="padding: 8px; background: rgba(0,255,255,0.1); border-radius: 4px; margin: 5px 0;">
      <strong>${username}</strong>: ${multiplayerPlayers[username].score} points
    </div>
  `).join('');
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 255, 255, 0.9);
    color: #000;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================
// MULTIPLAYER SCREENS
// ============================
function showGameModeSelection() {
  app.innerHTML = `
    <div class="panel">
      <h2>Game Mode</h2>
      <p style="color: #aaa; margin-bottom: 20px;">Choose how you want to play</p>
      
      <button id="singleBtn" style="width: 100%; padding: 15px; margin: 10px 0; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
        🎮 Single Player
      </button>
      
      <button id="localBtn" style="width: 100%; padding: 15px; margin: 10px 0; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
        👥 Local Multiplayer (2-4 Players)
      </button>
      
      <button id="serverBtn" style="width: 100%; padding: 15px; margin: 10px 0; background: #17a2b8; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
        🌐 Online Multiplayer (Turn-Based)
      </button>
      
      <button id="backBtn" style="width: 100%; padding: 12px; margin-top: 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Back
      </button>
    </div>
  `;

  document.getElementById('singleBtn').onclick = () => {
    multiplayerMode = 'single';
    loadMainUI();
  };

  document.getElementById('localBtn').onclick = () => {
    multiplayerMode = 'local';
    showLocalMultiplayer();
  };

  document.getElementById('serverBtn').onclick = () => {
    multiplayerMode = 'server';
    initializeSocket();
    showOnlineMultiplayer();
  };

  document.getElementById('backBtn').onclick = loadMainUI;
}

function showOnlineMultiplayer() {
  app.innerHTML = `
    <div class="panel">
      <h2>Online Multiplayer</h2>
      <p style="color: #aaa; margin-bottom: 15px;">Create or join a game room</p>
      
      <input type="text" id="roomName" placeholder="Room name" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #444; border-radius: 4px; background: #222; color: #0ff;">
      
      <button id="createRoomBtn" style="width: 100%; padding: 12px; margin: 10px 0; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
        ➕ Create Room
      </button>
      
      <h3 style="color: #0ff; margin-top: 20px;">Available Rooms</h3>
      <div id="roomList" style="max-height: 300px; overflow-y: auto; margin: 10px 0;">
        <p style="color: #aaa;">Loading rooms...</p>
      </div>
      
      <button id="backBtn" style="width: 100%; padding: 12px; margin-top: 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Back
      </button>
    </div>
  `;

  document.getElementById('createRoomBtn').onclick = createRoom;
  document.getElementById('backBtn').onclick = showGameModeSelection;
  
  loadAvailableRooms();
}

function loadAvailableRooms() {
  fetch(`${API_URL}/api/multiplayer/rooms`)
    .then(res => res.json())
    .then(rooms => {
      const roomList = document.getElementById('roomList');
      if (rooms.length === 0) {
        roomList.innerHTML = '<p style="color: #aaa;">No available rooms. Create one!</p>';
      } else {
        roomList.innerHTML = rooms.map(room => `
          <div style="padding: 10px; background: rgba(0,255,255,0.1); border-radius: 4px; margin: 5px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${room.name || 'Room ' + room.id}</strong><br>
              <small style="color: #aaa;">Players: ${room.players.length}</small>
            </div>
            <button onclick="joinRoom('${room.id}')" style="padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Join
            </button>
          </div>
        `).join('');
      }
    })
    .catch(err => console.error('Error loading rooms:', err));
}

function createRoom() {
  const roomName = document.getElementById('roomName').value.trim();
  if (!roomName) {
    showNotification('Please enter a room name');
    return;
  }

  fetch(`${API_URL}/api/multiplayer/create-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: roomName, createdBy: currentUser })
  })
    .then(res => res.json())
    .then(room => {
      currentRoom = room;
      showNotification(`Room created: ${room.name}`);
      enterMultiplayerGame(room.id);
    })
    .catch(err => {
      console.error('Error creating room:', err);
      showNotification('Failed to create room');
    });
}

function joinRoom(roomId) {
  fetch(`${API_URL}/api/multiplayer/join-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, username: currentUser })
  })
    .then(res => res.json())
    .then(room => {
      currentRoom = room;
      showNotification(`Joined room!`);
      enterMultiplayerGame(roomId);
    })
    .catch(err => {
      console.error('Error joining room:', err);
      showNotification('Failed to join room');
    });
}

function enterMultiplayerGame(roomId) {
  app.innerHTML = `
    <div class="panel">
      <h2>🎮 Room: ${currentRoom.name || 'Game ' + roomId}</h2>
      <p style="color: #aaa; margin-bottom: 15px;">Turn-based multiplayer (up to 4 players)</p>
      
      <button id="startGameBtn" style="width: 100%; padding: 12px; margin: 10px 0; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        ▶️ Start Game
      </button>
      
      <h3 style="color: #0ff; margin-top: 20px;">Players in Room</h3>
      <div id="playerList" style="max-height: 200px; overflow-y: auto; margin: 10px 0; padding: 10px; background: rgba(0,255,255,0.05); border-radius: 4px;">
      </div>
      
      <button id="leaveBtn" style="width: 100%; padding: 12px; margin-top: 20px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Leave Room
      </button>
    </div>

    <div class="panel">
      <h3 style="color: #0ff;">Game Board</h3>
      <div id="gameContainer" style="display: none;">
        <div style="text-align: center; margin: 15px 0; padding: 12px; background: rgba(0,255,255,0.1); border-radius: 4px;">
          <div id="currentTurn" style="font-size: 18px; color: #0ff; font-weight: bold;">Waiting for players...</div>
          <div id="sequenceInfo" style="font-size: 12px; color: #aaa; margin-top: 8px;">Sequence Length: 1</div>
        </div>
        <div class="grid" id="grid"></div>
      </div>
    </div>
  `;

  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'square';
    d.id = 'sq' + i;
    d.onclick = () => handleOnlineMultiplayerPress(i);
    grid.appendChild(d);
  }

  document.getElementById('startGameBtn').onclick = startMultiplayerGame;
  document.getElementById('leaveBtn').onclick = leaveMultiplayerRoom;
  updatePlayerList();
}

function startMultiplayerGame() {
  const gameContainer = document.getElementById('gameContainer');
  gameContainer.style.display = 'block';

  const playerNames = Object.keys(multiplayerPlayers);
  const scores = {};
  const playerColors = ['#ff00ff', '#00ff00', '#ff9900', '#00ffff'];

  playerNames.forEach((name, idx) => {
    scores[name] = 0;
  });

  let currentPlayerIndex = 0;
  let gameSequence = [];
  let userSequence = [];
  let allowInput = false;

  fetch(`${API_URL}/api/multiplayer/start-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: currentRoom.id })
  })
    .then(res => res.json())
    .then(() => {
      showNotification('Game started! ' + playerNames[0] + ' goes first');
      
      // Emit to socket that game started
      if (socket) {
        socket.emit('multiplayer_game_started', {
          roomId: currentRoom.id,
          players: playerNames
        });
      }
      
      startPlayerTurn();
    })
    .catch(err => {
      console.error('Error starting game:', err);
      showNotification('Failed to start game');
    });

  window.handleOnlineMultiplayerPress = function(id) {
    if (!allowInput) return;

    const el = document.getElementById('sq' + id);
    el.classList.add('active');
    playTone(200 + id * 20);
    setTimeout(() => el.classList.remove('active'), 300);

    userSequence.push(id);

    // Emit move to other players
    if (socket) {
      socket.emit('multiplayer_move', {
        roomId: currentRoom.id,
        username: currentUser,
        move: id,
        sequenceIndex: userSequence.length - 1
      });
    }

    // Check if correct
    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] !== gameSequence[i]) {
        // Wrong! End turn
        allowInput = false;
        const currentPlayer = playerNames[currentPlayerIndex];
        showNotification(`❌ ${currentPlayer} made a mistake!`);
        
        // Update score on backend
        fetch(`${API_URL}/api/multiplayer/update-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: currentRoom.id,
            username: currentUser,
            score: scores[currentUser]
          })
        }).catch(err => console.error('Error updating score:', err));
        
        // Move to next player
        currentPlayerIndex = (currentPlayerIndex + 1) % playerNames.length;
        setTimeout(() => {
          gameSequence = [];
          userSequence = [];
          startPlayerTurn();
        }, 1500);
        return;
      }
    }

    // Correct sequence completed - continue
    if (userSequence.length === gameSequence.length) {
      scores[playerNames[currentPlayerIndex]]++;
      
      // Update score on backend
      fetch(`${API_URL}/api/multiplayer/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom.id,
          username: currentUser,
          score: scores[currentUser]
        })
      }).catch(err => console.error('Error updating score:', err));
      
      setTimeout(() => {
        gameSequence = [];
        userSequence = [];
        playNextSequenceElement();
      }, 800);
    }
  };

  function playSequence() {
    allowInput = false;
    let i = 0;
    const interval = setInterval(() => {
      const id = gameSequence[i];
      const el = document.getElementById('sq' + id);
      el.classList.add('active');
      playTone(200 + id * 20);
      setTimeout(() => el.classList.remove('active'), 300);
      i++;
      if (i >= gameSequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          allowInput = true;
        }, 500);
      }
    }, 600);
  }

  function playNextSequenceElement() {
    gameSequence.push(Math.floor(Math.random() * 10));
    playSequence();
  }

  function startPlayerTurn() {
    const currentPlayer = playerNames[currentPlayerIndex];
    document.getElementById('currentTurn').textContent = `🎯 ${currentPlayer}'s Turn`;
    document.getElementById('sequenceInfo').textContent = `Sequence Length: ${gameSequence.length + 1}`;
    
    userSequence = [];
    playNextSequenceElement();
  }
}

function leaveMultiplayerRoom() {
  if (!currentRoom) return;

  fetch(`${API_URL}/api/multiplayer/room/${currentRoom.id}`, { method: 'DELETE' })
    .then(() => {
      showNotification('Left room');
      currentRoom = null;
      showGameModeSelection();
    })
    .catch(err => console.error('Error leaving room:', err));
}

function showLocalMultiplayer() {
  app.innerHTML = `
    <div class="panel">
      <h2>Local Multiplayer - Select Players</h2>
      <p style="color: #aaa; margin-bottom: 20px;">Each player takes turns. How many players?</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
        <button id="players2" style="padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;">
          👥 2 Players
        </button>
        <button id="players3" style="padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;">
          👥👥 3 Players
        </button>
        <button id="players4" style="padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;">
          👥👥👥 4 Players
        </button>
      </div>
      
      <button id="backBtn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Back
      </button>
    </div>
  `;

  document.getElementById('players2').onclick = () => startLocalMultiplayerGame(2);
  document.getElementById('players3').onclick = () => startLocalMultiplayerGame(3);
  document.getElementById('players4').onclick = () => startLocalMultiplayerGame(4);
  document.getElementById('backBtn').onclick = showGameModeSelection;
}

function startLocalMultiplayerGame(numPlayers) {
  // Initialize players
  const players = [];
  const scores = {};
  const playerColors = ['#ff00ff', '#00ff00', '#ff9900', '#00ffff'];
  const keyMappings = [
    { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 },
    { 'q': 5, 'w': 6, 'e': 7, 'r': 8, 't': 9 },
    { 'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4 },
    { 'z': 5, 'x': 6, 'c': 7, 'v': 8, 'b': 9 }
  ];

  for (let i = 0; i < numPlayers; i++) {
    players.push(`Player ${i + 1}`);
    scores[`Player ${i + 1}`] = 0;
  }

  let currentPlayerIndex = 0;
  let gameSequence = [];
  let userSequence = [];
  let allowInput = false;

  // Build player score display
  const playerScoresHTML = players.map((player, idx) => `
    <div style="flex: 1; padding: 12px; background: rgba(${playerColors[idx] === '#ff00ff' ? '255,0,255' : playerColors[idx] === '#00ff00' ? '0,255,0' : playerColors[idx] === '#ff9900' ? '255,153,0' : '0,255,255'},0.1); border-radius: 8px; border: 2px solid ${playerColors[idx]};">
      <h3 style="color: ${playerColors[idx]}; margin: 0;">${player}</h3>
      <div id="p${idx}Score" style="font-size: 24px; color: #0ff; margin: 10px 0;">0</div>
      <small id="p${idx}Status" style="color: #aaa;"></small>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="panel">
      <h2>🎮 Local Multiplayer - ${numPlayers} Players</h2>
      <div style="display: grid; grid-template-columns: repeat(${Math.min(numPlayers, 2)}, 1fr); gap: 10px; margin: 20px 0;">
        ${playerScoresHTML}
      </div>
      
      <div style="text-align: center; margin: 20px 0; padding: 15px; background: rgba(0,255,255,0.1); border-radius: 8px;">
        <div id="currentTurn" style="font-size: 20px; color: #0ff; font-weight: bold;">
          🎯 ${players[0]}'s Turn
        </div>
        <div id="attemptCount" style="font-size: 14px; color: #aaa; margin-top: 10px;">
          Sequence Length: 1 | Attempts: ∞
        </div>
      </div>
      
      <div class="grid" id="grid" style="margin: 20px 0;"></div>
      
      <button id="backBtn" style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Back to Menu
      </button>
    </div>
  `;

  // Setup grid
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'square';
    d.id = 'sq' + i;
    d.onclick = () => handleTurnBasedPress(i);
    grid.appendChild(d);
  }

  // Game functions
  window.handleTurnBasedPress = function(id) {
    if (!allowInput) return;

    const el = document.getElementById('sq' + id);
    el.classList.add('active');
    playTone(200 + id * 20);
    setTimeout(() => el.classList.remove('active'), 300);

    userSequence.push(id);

    // Check if correct
    for (let i = 0; i < userSequence.length; i++) {
      if (userSequence[i] !== gameSequence[i]) {
        // Wrong! End turn
        allowInput = false;
        const currentPlayer = players[currentPlayerIndex];
        showNotification(`❌ ${currentPlayer} made a mistake!`);
        
        // Move to next player
        currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
        setTimeout(() => {
          gameSequence = [];
          userSequence = [];
          startPlayerTurn();
        }, 1500);
        return;
      }
    }

    // Correct sequence completed - continue
    if (userSequence.length === gameSequence.length) {
      scores[players[currentPlayerIndex]]++;
      updatePlayerScores();
      
      setTimeout(() => {
        gameSequence = [];
        userSequence = [];
        playNextSequenceElement();
      }, 800);
    }
  };

  function playSequence() {
    allowInput = false;
    let i = 0;
    const interval = setInterval(() => {
      const id = gameSequence[i];
      const el = document.getElementById('sq' + id);
      el.classList.add('active');
      playTone(200 + id * 20);
      setTimeout(() => el.classList.remove('active'), 300);
      i++;
      if (i >= gameSequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          allowInput = true;
        }, 500);
      }
    }, 600);
  }

  function playNextSequenceElement() {
    gameSequence.push(Math.floor(Math.random() * 10));
    playSequence();
  }

  function startPlayerTurn() {
    userSequence = [];
    document.getElementById('currentTurn').textContent = `🎯 ${players[currentPlayerIndex]}'s Turn`;
    document.getElementById('attemptCount').textContent = `Sequence Length: ${gameSequence.length + 1} | Attempts: ∞`;
    playNextSequenceElement();
  }

  function updatePlayerScores() {
    for (let i = 0; i < numPlayers; i++) {
      document.getElementById(`p${i}Score`).textContent = scores[players[i]];
    }
    document.getElementById('attemptCount').textContent = `Sequence Length: ${gameSequence.length} | Attempts: ∞`;
  }

  document.getElementById('backBtn').onclick = showGameModeSelection;

  // Start game
  startPlayerTurn();
}

// ============================
// MAIN UI
// ============================
function loadMainUI() {
  app.innerHTML = `
    <div class="panel">
      <h2>Welcome, ${currentUser}</h2>
      <button id="startBtn">Start</button>
      <button id="multiplayerBtn">Multiplayer</button>
      <button id="shopBtn">Shop</button>
      <button id="logoutBtn">Logout</button>
    </div>

    <div class="panel">
      <div class="grid" id="grid"></div>
    </div>
  `;

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "square";
    d.id = "sq" + i;
    d.onclick = () => handleUserPress(i);
    grid.appendChild(d);
    squares.push(d);
  }

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("multiplayerBtn").onclick = showGameModeSelection;
  document.getElementById("shopBtn").onclick = openShop;
  document.getElementById("logoutBtn").onclick = () => location.reload();
}

// ============================
// GAME LOGIC
// ============================
function startGame() {
  gameSequence = [];
  nextRound();
}

function nextRound() {
  allowInput = false;
  userSequence = [];
  const next = Math.floor(Math.random() * 10);
  gameSequence.push(next);
  playSequence();
}

function playSequence() {
  let i = 0;
  const interval = setInterval(() => {
    flashSquare(gameSequence[i]);
    playTone(200 + gameSequence[i] * 20);
    i++;
    if (i >= gameSequence.length) {
      clearInterval(interval);
      allowInput = true;
    }
  }, 600);
}

function handleUserPress(id) {
  if (!allowInput) return;

  flashSquare(id);
  playTone(200 + id * 20);
  userSequence.push(id);

  for (let i = 0; i < userSequence.length; i++) {
    if (userSequence[i] !== gameSequence[i]) {
      gameOver();
      return;
    }
  }

  if (userSequence.length === gameSequence.length) {
    awardCoins(5);
    nextRound();
  }
}

function awardCoins(amount) {
  const users = loadUsers();
  users[currentUser].coins += amount;
  if (gameSequence.length > users[currentUser].highscore)
    users[currentUser].highscore = gameSequence.length;
  saveUsers(users);

  // Also send to backend
  fetch(`${API_URL}/api/user/${currentUser}/award-coins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: amount,
      score: gameSequence.length
    })
  })
  .then(res => res.json())
  .catch(err => console.error('Error awarding coins:', err));
}

function gameOver() {
  allowInput = false;
  alert("Game Over! Score: " + gameSequence.length);
}

// ============================
// SHOP
// ============================
function openShop() {
  const users = loadUsers();
  const u = users[currentUser];

  app.innerHTML = `
    <div class="panel">
      <h2>Shop</h2>
      <p>Coins: ${u.coins}</p>
      <button id="backBtn">Back</button>
    </div>
    <div class="panel">
      <h3>Avatars</h3>
      <button onclick="buy('avatar1',20)">Avatar 1 (20)</button>
      <button onclick="buy('avatar2',20)">Avatar 2 (20)</button>
    </div>
  `;

  document.getElementById("backBtn").onclick = loadMainUI;
}

function buy(item, price) {
  const users = loadUsers();
  const u = users[currentUser];
  if (u.coins < price) {
    alert("Not enough coins!");
    return;
  }

  // Send purchase to backend
  fetch(`${API_URL}/api/user/${currentUser}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item, price })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
      return;
    }
    
    // Update local data
    u.coins = data.coins;
    u[item] = true;
    saveUsers(users);
    alert("Purchased " + item + "!");
    openShop();
  })
  .catch(err => {
    console.error('Purchase error:', err);
    alert('Purchase failed. Please try again.');
  });
}

// ============================
// INIT
// ============================
showLogin();
