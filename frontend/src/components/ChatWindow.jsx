import { useEffect, useState, useRef } from 'react';

function ChatWindow({ messages, input, setInput, sendMessage, username, roomId }) {
    const [isDarkMode, setIsDarkMode] = useState(
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const messagesEndRef = useRef(null);

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Generate consistent color for each user
    const getUserColor = (user) => {
      let hash = 0;
      for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 70%, ${isDarkMode ? '60%' : '45%'})`;
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    return (
      <div style={{
        maxWidth: '900px',
        width: '90%',
        margin: '20px auto',
        padding: '24px',
        border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        borderRadius: '12px',
        boxShadow: isDarkMode
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          flexShrink: 0
        }}>
          <h1 style={{
            color: isDarkMode ? '#fff' : '#1a1a1a',
            fontSize: '1.5em',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            MERNverse Chat
          </h1>
          <span style={{
            fontSize: '0.9em',
            color: getUserColor(username),
            fontWeight: '500'
          }}>
            {username}
          </span>
        </div>

        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: isDarkMode ? '#0d0d0d' : '#fafafa',
          border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
          borderRadius: '8px'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {messages.map((msg, idx) => {
              const isCurrentUser = msg.username === username;
              return (
                <li key={idx} style={{
                  marginBottom: '12px',
                  padding: '12px 16px',
                  backgroundColor: isCurrentUser
                    ? (isDarkMode ? '#1a2f1a' : '#e8f5e9')
                    : (isDarkMode ? '#1a1a1a' : '#ffffff'),
                  borderRadius: '8px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  borderLeft: `3px solid ${getUserColor(msg.username)}`,
                  boxShadow: isDarkMode
                    ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                    : '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <strong style={{
                    color: getUserColor(msg.username),
                    fontSize: '0.9em',
                    marginRight: '8px'
                  }}>
                    {msg.username}
                  </strong>
                  <span style={{ color: isDarkMode ? '#e0e0e0' : '#333' }}>
                    {msg.message}
                  </span>
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1,
              minWidth: 0,
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? '#333' : '#d0d0d0'}`,
              backgroundColor: isDarkMode ? '#0d0d0d' : '#ffffff',
              color: isDarkMode ? '#fff' : '#1a1a1a',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = isDarkMode ? '#555' : '#999'}
            onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#333' : '#d0d0d0'}
          />
          <button onClick={sendMessage} style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Send
          </button>
        </div>
      </div>
    );
  }
  
  export default ChatWindow;
  