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

The Node.js server on Railway acts as the relay. The controller sends events to it, and the overlays (running as browser sources inside OBS) receive them in real time. Railway is connected to your GitHub repo — every time you push, it redeploys automatically.

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

### Step 3 — Connect Railway to GitHub

1. Create a free account at https://railway.app
2. Click **New Project → Deploy from GitHub repo**
3. Authorise Railway and select your repo
4. Railway will detect the Node.js app and deploy it automatically

### Step 4 — Configure Railway

In your Railway project dashboard:

**Generate a public URL:**
Settings → Networking → Generate Domain
→ You'll get something like `https://your-app.up.railway.app`

**Set your room password:**
Variables → Add New Variable:
```
ROOM_PASSWORD = your_secret_password_here
```
(Default if not set: `riftbound2025`)

### Step 5 — Set up OBS Browser Sources

Add two browser sources in OBS pointing to your Railway URL:

| Source | URL |
|--------|-----|
| Score Overlay | `https://your-app.up.railway.app/score-overlay.html` |
| Decklist Overlay | `https://your-app.up.railway.app/decklist-overlay.html` |

Set both to **1920×1080**. These only need to be set up once — they'll always load the latest version automatically.

### Step 6 — Use the controller

Open `https://your-app.up.railway.app/controller.html` in any browser, from anywhere in the world. Enter your room password and you're live.

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

Railway detects the push and redeploys in ~30 seconds. Your Railway URL never changes.

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
