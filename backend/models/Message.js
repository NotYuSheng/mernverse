const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  roomId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
