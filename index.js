require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
console.log(process.env.CLIENT_URL);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(process.env.MONGO_URI)
        console.log('MongoDB Connected');
  console.log(process.env.CLIENT_URL);

    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

// Placeholder Routes
app.get('/', (req, res) => {
    res.send('GigFlow API Running');
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join', (userId) => {
        socket.join(userId); // Join a room with their User ID
        console.log(`User ${userId} joined room ${userId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('io', io); // Make io accessible in controllers

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));

const PORT = process.env.PORT || 5000;

// Start Server (Connect DB first if URI is present, else just start)
if (process.env.MONGO_URI) {
    connectDB().then(() => {
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
} else {
    console.log(process.env);
    console.warn('MONGO_URI not found in .env, starting server without DB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
