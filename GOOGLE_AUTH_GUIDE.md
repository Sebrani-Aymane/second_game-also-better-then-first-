# 🔐 Google OAuth Setup Guide

## The Problem
Currently, Google OAuth is running in **demo mode**, which means:
- ❌ It doesn't connect to real Google servers
- ❌ It requires you to enter a username manually
- ✅ But it's safe for testing!

## Option 1: Use Demo Mode (EASIEST - Current Setup)
**This is currently enabled and working!**

Google login currently prompts you to set a username. This is completely functional for testing.

### How to Use Demo Google Login:
1. Click "Continue with Google" button
2. Wait for authentication (simulated)
3. Enter a username when prompted
4. You're logged in!

**This is perfect for development/testing.**

---

## Option 2: Enable Real Google OAuth (PRODUCTION)

To use **real Google OAuth**, follow these steps:

### Step 1: Get Google Credentials
1. Go to: https://console.cloud.google.com/
2. Click "Select a Project" → "NEW PROJECT"
3. Name it "Simon Transcendence"
4. Click "Create"

### Step 2: Enable Google+ API
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click it → Click "ENABLE"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Choose "Web application"
4. Name: "Simon Transcendence"
5. Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost (for testing)
6. Authorized redirect URIs:
   - http://localhost:3000/oauth/google/callback
7. Click "CREATE"
8. Copy your Client ID and Client Secret

### Step 4: Configure Backend

Create a `.env` file in the `backend` folder:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback
```

### Step 5: Add OAuth Library to Backend

```bash
cd backend
npm install google-auth-library
```

---

## Option 3: Quick Fix - Just Use Username Login

If you want to skip OAuth entirely (recommended for now):
- Just use the **"Continue"** button with a username
- It works perfectly without any setup
- No credentials needed
- No configuration required

---

## Common Issues

### "Google login doesn't work"
**Current behavior**: This is normal! It's in demo mode. It shows a loading screen then prompts for username.

### "I need real Google login"
Follow Option 2 above to set up real OAuth.

### "Should I use OAuth now?"
**Recommendation**: 
- **For testing**: Use current demo mode or username login
- **For production**: Set up real OAuth following Option 2

---

## What to Do Right Now

### Easiest Solution (RECOMMENDED)
Just use the **username login** instead of Google:
1. Click the username input field
2. Enter any username (3+ characters)
3. Click "Continue"
4. Done! You're logged in

### If You Really Need Google Auth
Follow these steps in order:
1. Get Google Client ID (Option 2, Steps 1-3)
2. Add .env file to backend folder (Option 2, Step 4)
3. Restart server
4. Google login will be enabled

---

## Summary

| Method | Setup Time | Works Now | Best For |
|--------|-----------|-----------|----------|
| **Username** | 0 min | ✅ YES | Testing/Development |
| **Google Demo** | 0 min | ✅ YES | Demo/Testing |
| **Real Google** | 20 min | ⏳ Needs setup | Production |

**My recommendation**: Use username login for now. It's the quickest and works perfectly!
