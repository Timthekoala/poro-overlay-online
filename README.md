# Riftbound Overlay System

A real-time streaming overlay system for OBS, controllable from anywhere via a browser.

---

## How It Works

```
[You, anywhere in the world]
        ↓ (browser)
[controller.html] ──→ [Railway Server] ←── [OBS Browser Sources]
                             ↓
                    [score-overlay.html]
                    [decklist-overlay.html]
```

The Node.js server on Render acts as the relay. The controller sends events to it, and the overlays (running as browser sources inside OBS) receive them in real time. Render is connected to your GitHub repo — every time you push, it redeploys automatically.

> ⚠️ **Free tier note:** Render spins the server down after 15 minutes of no traffic. The first request after that takes ~30 seconds to wake up. To avoid this during a stream, just open your controller URL a minute or two before you go live — that's enough to wake it up.

---

## One-Time Setup

### Step 1 — Add your image and font files

Copy your assets into `public/` so the structure looks like this:

```
public/
  images/
    Legends/
      cardnames.txt
      IreliaBlades.webp
      ...
    Battlefields/
      cardnames.txt
      ...
    Cards/
      Origins/
        cardnames.txt
        ...
      Spiritforged/
        ...
      Runes/
        ...
  fonts/
    Cinzel-VariableFont_wght.ttf
```

### Step 2 — Create a GitHub repo

1. Go to https://github.com/new and create a new repository (can be private)
2. In this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 3 — Deploy on Render

1. Create a free account at https://render.com
2. Click **New → Web Service**
3. Click **Connect a repository** and select your GitHub repo
4. Fill in the settings:
   - **Name:** poro-overlay (or whatever you like)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Click **Create Web Service**
6. Render will build and deploy — takes about 2 minutes the first time
7. Your URL will be shown at the top: `https://your-app.onrender.com`

### Step 4 — Set your room password

In Render dashboard → your service → **Environment** tab → **Add Environment Variable**:
```
ROOM_PASSWORD = your_secret_password_here
```
(Default if not set: `riftbound2025`)

Click **Save Changes** — Render will redeploy automatically.

### Step 5 — Set up OBS Browser Sources

Add two browser sources in OBS pointing to your Render URL:

| Source | URL |
|--------|-----|
| Score Overlay | `https://your-app.onrender.com/score-overlay.html` |
| P1 Decklist Overlay | `https://your-app.onrender.com/player1-decklist.html` |
| P2 Decklist Overlay | `https://your-app.onrender.com/player2-decklist.html` |

Set both to **1920×1080**. These only need to be set up once — they'll always load the latest version automatically.

### Step 6 — Use the controller

Open `https://your-app.onrender.com/controller.html` in any browser, from anywhere in the world. Enter your room password and you're live.

---

## Ongoing Updates

Any time you add new card art, update overlays, or change anything:

```bash
./deploy.sh "added new card set"
```

Or manually:
```bash
git add .
git commit -m "your message"
git push
```

Render detects the push and redeploys automatically. Your Render URL never changes.

---

## Local Development

```bash
npm install
node server.js
```

Then open `http://localhost:3000/controller.html`

---

## File Size Notes

GitHub handles files up to 100MB each. For large collections of card images, keep individual files as compressed WebP (which you're already doing). If your total repo ever exceeds ~2GB, look into Git LFS — but for typical card art this won't be an issue.
