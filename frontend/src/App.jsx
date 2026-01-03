import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import socket from './services/socket';

// Generate a cryptographically secure 6-character alphanumeric room ID
const generateRoomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const [unreadCount, setUnreadCount] = useState(0);
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update document title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) MERNverse Chat`;
    } else {
      document.title = 'MERNverse Chat';
    }
  }, [unreadCount]);

  // Reset unread count when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
    fetch(`/api/messages/${roomId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setMessages)
      .catch(err => {
        console.error('Failed to load chat history:', err);
        setMessages([]); // Set empty array on error
      });

    // Listen for username assignment from server
    socket.on('username assigned', (assignedUsername) => {
      setUsername(assignedUsername);
    });

    socket.on('chat message', (msg) => {
      // Only add messages from this room
      if (msg.roomId === roomId) {
        setMessages(prev => [...prev, msg]);

        // Show notification if window is not focused and it's not the user's own message
        if (!document.hasFocus() && msg.name !== username) {
          // Increment unread count
          setUnreadCount(prev => prev + 1);

          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New message from ' + msg.name, {
              body: msg.message,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: 'mernverse-message'
            });

            // Close notification after 5 seconds
            setTimeout(() => notification.close(), 5000);

            // Focus window when notification is clicked
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }
        }
      }
    });

    return () => {
      socket.off('username assigned');
      socket.off('chat message');
    };
  }, [roomId, username]);

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
