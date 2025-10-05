import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import socket from './services/socket';

// Generate a cryptographically secure unique room ID
const generateRoomId = () => {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const randomString = Array.from(array, byte => byte.toString(36)).join('');
  const timestamp = Date.now().toString(36);
  return `${randomString}${timestamp}`;
};

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get or create session ID
    let sessionId = localStorage.getItem('mernverse-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('mernverse-session-id', sessionId);
    }

    // Request username from server with session ID
    socket.emit('get username', sessionId);

    // Join the room
    socket.emit('join room', roomId);

    // Load chat history for this room
    fetch(`/messages/${roomId}`)
      .then(res => res.json())
      .then(setMessages)
      .catch(console.error);

    // Listen for username assignment from server
    socket.on('username assigned', (assignedUsername) => {
      setUsername(assignedUsername);
    });

    socket.on('chat message', (msg) => {
      // Only add messages from this room
      if (msg.roomId === roomId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off('username assigned');
      socket.off('chat message');
    };
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { message: input, roomId };
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
      username={username}
      roomId={roomId}
    />
  );
}

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a new room ID and redirect
    const newRoomId = generateRoomId();
    navigate(`/room/${newRoomId}`);
  }, [navigate]);

  return <div>Creating room...</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<ChatRoom />} />
    </Routes>
  );
}

export default App;
