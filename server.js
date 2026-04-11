const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Serve everything in /public (images, fonts, overlays, controller)
app.use(express.static(path.join(__dirname, 'public')));

// ── Riftcodex card cache ──────────────────────────────────────────────────────
let cachedCards = [];
let cacheReady = false;
let cacheError = null;

async function warmCardCache() {
    console.log('Fetching cards from Riftcodex API...');
    try {
        let page = 1, totalPages = 1;
        const all = [];
        while (page <= totalPages) {
            const res = await fetch(`https://api.riftcodex.com/cards?page=${page}`, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
                redirect: 'follow'
            });
            if (!res.ok) throw new Error(`Upstream HTTP ${res.status} on page ${page}`);
            const data = await res.json();
            if (data.items && data.items.length) all.push(...data.items);
            totalPages = data.pages || 1;
            page++;
        }
        cachedCards = all;
        cacheReady = true;
        cacheError = null;
        console.log(`Card cache ready: ${all.length} cards loaded.`);
    } catch (e) {
        cacheError = e.message;
        console.error('Failed to warm card cache:', e.message);
    }
}

warmCardCache().then(() => {
    server.listen(PORT, () => {
        console.log(`Riftbound Overlay Server running on port ${PORT}`);
    });
}).catch(() => {
    // Start anyway even if warm failed — browser will get 503 and retry
    server.listen(PORT, () => {
        console.log(`Riftbound Overlay Server running on port ${PORT} (cache failed)`);
    });
});

// Serve cached cards — paginated to match the API shape the browser expects
app.get('/api/cards', (req, res) => {
    if (!cacheReady) {
        return res.status(503).json({ error: 'Card cache not ready yet, please retry in a few seconds.', detail: cacheError });
    }
    const pageSize = 200;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const totalPages = Math.max(1, Math.ceil(cachedCards.length / pageSize));
    const items = cachedCards.slice((page - 1) * pageSize, page * pageSize);
    res.json({ items, page, pages: totalPages, total: cachedCards.length });
});

// Simple auth — change this to whatever you want
const ROOM_PASSWORD = process.env.ROOM_PASSWORD || 'riftbound2025';

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Controller joins and authenticates
    socket.on('auth', (password, callback) => {
        if (password === ROOM_PASSWORD) {
            socket.join('overlay-room');
            console.log('Controller authenticated:', socket.id);
            callback({ success: true });
        } else {
            callback({ success: false, message: 'Wrong password' });
        }
    });

    // Overlays join without auth (they're running inside OBS on your machine)
    socket.on('join-overlay', () => {
        socket.join('overlay-room');
        console.log('Overlay connected:', socket.id);
    });

    // Controller sends an event → broadcast to everyone in the room (including other overlays)
    socket.on('overlay-event', (data) => {
        socket.to('overlay-room').emit('overlay-event', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
