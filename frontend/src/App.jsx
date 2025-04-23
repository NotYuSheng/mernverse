import { useEffect, useState } from 'react';
import ChatWindow from './components/ChatWindow';
import { fetchMessages } from './api/messages';
import socket from './services/socket';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Load chat history
  useEffect(() => {
    fetchMessages()
      .then(setMessages)
      .catch(console.error);
  }, []);

  // WebSocket handling
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
    <ChatWindow
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
    />
  );
}

export default App;
