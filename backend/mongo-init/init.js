db = db.getSiblingDB('mernverse'); // Switch to mernverse DB

db.messages.insertMany([
  { username: 'MERNverse', message: 'Welcome to the chat!', timestamp: new Date() },
  { username: 'MERNverse', message: 'This is a preloaded message.', timestamp: new Date() },
  { username: 'MERNverse', message: 'Start typing to join the conversation!', timestamp: new Date() }
]);