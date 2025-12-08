# 🔑 Real Google OAuth Implementation

## Quick Start (What You Need to Do)

### Option A: Keep Current Demo (No Changes Needed)
The demo mode currently works! Just click "Continue with Google" and enter a username when prompted.

### Option B: Enable Real Google OAuth (Advanced)

---

## Step-by-Step Implementation

### 1️⃣ Get Google OAuth Credentials

**Visit**: https://console.cloud.google.com/

1. Click "Select a Project" 
2. Click "NEW PROJECT"
3. Name: `Simon Transcendence`
4. Click "Create"
5. Wait for project to be created

**Now enable Google+ API:**
1. Go to "APIs & Services" → "Library"
2. Search: `Google+ API`
3. Click "ENABLE"

**Create OAuth credentials:**
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `Simon Transcendence`

**Add URIs:**
- Authorized JavaScript origins:
  - `http://localhost:3000`
- Authorized redirect URIs:
  - `http://localhost:3000/oauth/google/callback`

5. Click "CREATE"
6. Copy "Client ID" - you'll need this!

---

### 2️⃣ Create Environment File

Create file: `backend/.env`

```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID from Step 1.

---

### 3️⃣ Install OAuth Library

```bash
cd backend
npm install dotenv google-auth-library axios
npm install
```

---

### 4️⃣ Update Backend Server

Update `backend/node.js` to add OAuth endpoint.

Add this at the top (after other requires):

```javascript
require('dotenv').config();
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth/google/callback'
);
```

Add this endpoint (before the health check endpoint):

```javascript
// Google OAuth callback
app.get('/oauth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Clean username from email
    const username = email.split('@')[0] + '_google';

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
      console.log(`[GOOGLE AUTH] New user: ${username}`);
    }

    // Redirect to frontend with token
    res.redirect(`/?user=${username}&provider=google&token=${tokens.access_token}`);
  } catch (error) {
    console.error('[GOOGLE AUTH] Error:', error);
    res.status(401).send('Authentication failed');
  }
});
```

---

### 5️⃣ Update Frontend Script

Update the Google login handler in `public/script.js`.

Find this section:
```javascript
// Google OAuth Login (Demo Mode)
googleLoginBtn.onclick = () => {
  handleOAuthLoginDemo("google");
};
```

Replace with:

```javascript
// Google OAuth Login (Real)
googleLoginBtn.onclick = () => {
  const clientId = 'YOUR_CLIENT_ID_HERE'; // Add your Client ID
  
  // Generate random state for security
  const state = Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('oauth_state', state);
  
  // Redirect to Google auth
  const redirectUri = encodeURIComponent('http://localhost:3000/oauth/google/callback');
  const scope = encodeURIComponent('profile email');
  
  window.location.href = 
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `state=${state}`;
};
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID.

---

### 6️⃣ Update Frontend Callback Handler

Add this to `public/script.js` (at the top, after other init code):

```javascript
// Handle OAuth callback
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const user = params.get('user');
  const provider = params.get('provider');
  
  if (user && provider === 'google') {
    currentUser = user;
    // Clear URL
    window.history.replaceState({}, document.title, window.location.pathname);
    loadMainUI();
  }
});
```

---

## Testing

### 1. Restart Backend
```bash
cd backend
npm install  # Install new packages
npm start
```

### 2. Test Google Login
1. Open http://localhost:3000
2. Click "Continue with Google"
3. Login with your Google account
4. You should be redirected back to the game
5. You're logged in!

---

## Troubleshooting

### "Redirect URI mismatch"
- Make sure your Backend redirect matches exactly: `http://localhost:3000/oauth/google/callback`
- Check Google Console → Credentials for exact URI

### "Client ID not working"
- Copy Client ID again from Google Console
- Make sure it's in your backend code AND in public/script.js

### "Module not found: dotenv"
```bash
cd backend
npm install dotenv
```

### ".env file not being read"
- Make sure `.env` is in `backend/` folder (not root)
- Restart server after creating `.env`

---

## Useful Commands

```bash
# Test if backend sees env variables
cd backend
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID)"

# Clear browser storage
# Open DevTools → Application → Clear Site Data

# Check logs
npm start  # Watch terminal output
```

---

## For Production

When deploying to production:

1. Update redirect URI in Google Console:
   - Add: `https://yourdomain.com/oauth/google/callback`

2. Update .env on server:
   ```
   GOOGLE_CLIENT_ID=prod_client_id
   GOOGLE_CLIENT_SECRET=prod_client_secret
   ```

3. Update frontend redirect URL in script.js

---

## Still Having Issues?

### Simple Solution: Skip OAuth for Now
Just use username login - it works perfectly without any setup!

### Need Help?
1. Check console (F12) for JavaScript errors
2. Check terminal for backend errors
3. Verify credentials in Google Console
4. Verify .env file exists and has correct values

---

## Summary

- ✅ Current demo mode works fine
- ⏳ Real OAuth needs 20 minutes to set up
- 🎮 Username login works immediately, no setup needed
- 🚀 Recommendation: Use username login for now, add real OAuth later
