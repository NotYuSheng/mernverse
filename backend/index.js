const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const Joi = require('joi');
const connectDB = require('./config/db');

// Import Routes
const healthRoutes = require('./routes/health');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

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

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Define Joi validation schema
const messageSchema = Joi.object({
  username: Joi.string().trim().max(50).required(),
  message: Joi.string().trim().max(500).required()
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', async (msg) => {
    try {
      // Validate message with Joi
      const { error, value } = messageSchema.validate(msg);

      if (error) {
        console.warn('Validation failed:', error.details);
        socket.emit('error', { error: 'Invalid message format.' });
        return;
      }

      // Save validated message
      const newMessage = new Message(value);
      await newMessage.save();

      // Broadcast sanitized message
      io.emit('chat message', value);

    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('error', { error: 'Failed to save message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
