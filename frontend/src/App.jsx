import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the backend through Nginx using relative path
const socket = io('/'); // This works because Nginx proxies WebSocket traffic

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Load chat history when component mounts
  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // Listen for real-time incoming messages
  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off('chat message');
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { username: 'MERNverse', message: input };
      socket.emit('chat message', msg);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>MERNverse Chat</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((msg, idx) => (
          <li key={idx}><strong>{msg.username}:</strong> {msg.message}</li>
        ))}
      </ul>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '80%', padding: '10px', marginRight: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px' }}>Send</button>
    </div>
  );
}

export default App;
