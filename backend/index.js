const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const Joi = require('joi');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { RANDOM_NAMES } = require('./constants/usernames');

// Import Routes
const healthRoutes = require('./routes/health');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'mernverse-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Connect to MongoDB
connectDB();

// Swagger Setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MERNverse API',
      version: '1.0.0',
      description: 'API documentation for MERNverse backend'
    },
  },
  apis: ['./routes/*.js', './index.js'], // Scan route files and index.js
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use Routes
app.use('/health', healthRoutes);
app.use('/messages', messageRoutes);

// Socket.IO setup with session support
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Track connected users and their sessions
const connectedUsers = new Map(); // socketId -> username
const sessionToUsername = new Map(); // sessionId -> username
const activeConnections = new Map(); // username -> count of active connections

// Define Joi validation schema
const messageSchema = Joi.object({
  username: Joi.string().trim().max(50).required(),
  message: Joi.string().trim().max(500).required(),
  roomId: Joi.string().trim().required()
});

// Function to generate a unique room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Function to get a random unused name
const getRandomUsername = () => {
  // Get all assigned usernames (from sessions)
  const assignedUsernames = new Set(sessionToUsername.values());

  // Filter out names that are already assigned to a session
  const availableNames = RANDOM_NAMES.filter(name => !assignedUsernames.has(name));

  if (availableNames.length === 0) {
    // If all names are used, add a number suffix
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const suffix = Math.floor(Math.random() * 1000);
    return `${randomName}${suffix}`;
  }

  const randomIndex = Math.floor(Math.random() * availableNames.length);
  return availableNames[randomIndex];
};

io.on('connection', (socket) => {
  let username;
  let sessionId;
  let currentRoom;

  // Handle username retrieval or assignment
  socket.on('get username', (clientSessionId) => {
    sessionId = clientSessionId;

    // Check if this session already has a username
    if (sessionId && sessionToUsername.has(sessionId)) {
      username = sessionToUsername.get(sessionId);
    } else {
      // Assign a new random username
      username = getRandomUsername();
      if (sessionId) {
        sessionToUsername.set(sessionId, username);
      }
    }

    // Track active connections for this username
    const currentCount = activeConnections.get(username) || 0;
    activeConnections.set(username, currentCount + 1);

    connectedUsers.set(socket.id, username);
    console.log(`${username} connected (${socket.id}) - Active connections: ${activeConnections.get(username)}`);

    // Send the username back to the client
    socket.emit('username assigned', username);
  });

  // Handle joining a room
  socket.on('join room', (roomId) => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }
    currentRoom = roomId;
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
  });

  socket.on('chat message', async (msg) => {
    try {
      // Override username with the server-assigned one
      const messageData = {
        username: connectedUsers.get(socket.id) || 'Anonymous',
        message: msg.message,
        roomId: msg.roomId || currentRoom
      };

      // Validate message with Joi
      const { error, value } = messageSchema.validate(messageData);

      if (error) {
        console.warn('Validation failed:', error.details);
        socket.emit('error', { error: 'Invalid message format.' });
        return;
      }

      // Save validated message
      const newMessage = new Message(value);
      await newMessage.save();

      // Broadcast sanitized message to room only
      io.to(value.roomId).emit('chat message', value);

    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('error', { error: 'Failed to save message.' });
    }
  });

  socket.on('disconnect', () => {
    const username = connectedUsers.get(socket.id);
    if (username) {
      // Decrement active connection count
      const currentCount = activeConnections.get(username) || 0;
      const newCount = currentCount - 1;

      if (newCount <= 0) {
        activeConnections.delete(username);
        console.log(`${username} disconnected (${socket.id}) - No active connections`);
      } else {
        activeConnections.set(username, newCount);
        console.log(`${username} disconnected (${socket.id}) - Active connections: ${newCount}`);
      }

      connectedUsers.delete(socket.id);
    }
    // Keep sessionToUsername mapping - we want to preserve the name for when they reconnect
  });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
