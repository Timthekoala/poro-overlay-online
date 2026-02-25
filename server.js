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
server.listen(PORT, () => {
    console.log(`Riftbound Overlay Server running on port ${PORT}`);
});
