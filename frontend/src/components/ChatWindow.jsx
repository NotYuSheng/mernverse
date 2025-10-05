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
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5'
      }}>
        <div style={{
          padding: '20px 24px',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderBottom: `1px solid ${isDarkMode ? '#2a2a2a' : '#e5e5e5'}`,
          flexShrink: 0
        }}>
          <h1 style={{
            color: isDarkMode ? '#ffffff' : '#111111',
            fontSize: '20px',
            margin: '0 0 4px 0',
            fontWeight: '600',
            letterSpacing: '-0.01em'
          }}>
            MERNverse Chat
          </h1>
          <div style={{
            fontSize: '14px',
            color: isDarkMode ? '#888' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>Logged in as</span>
            <span style={{
              color: getUserColor(username),
              fontWeight: '600'
            }}>
              {username}
            </span>
          </div>
        </div>

        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {messages.map((msg, idx) => {
              const isCurrentUser = msg.username === username;
              return (
                <li key={idx} style={{
                  marginBottom: '16px',
                  maxWidth: '100%'
                }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '75%',
                    padding: '12px 16px',
                    backgroundColor: isCurrentUser
                      ? (isDarkMode ? '#2563eb' : '#2563eb')
                      : (isDarkMode ? '#1e1e1e' : '#ffffff'),
                    borderRadius: '12px',
                    boxShadow: isDarkMode
                      ? '0 1px 2px rgba(0, 0, 0, 0.4)'
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: isCurrentUser
                        ? 'rgba(255, 255, 255, 0.9)'
                        : getUserColor(msg.username),
                      opacity: 0.9
                    }}>
                      {msg.username}
                    </div>
                    <div style={{
                      color: isCurrentUser
                        ? '#ffffff'
                        : (isDarkMode ? '#e5e5e5' : '#1a1a1a'),
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {msg.message}
                    </div>
                  </div>
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
        </div>

        <div style={{
          padding: '16px 24px',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderTop: `1px solid ${isDarkMode ? '#2a2a2a' : '#e5e5e5'}`,
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: `1px solid ${isDarkMode ? '#2a2a2a' : '#e0e0e0'}`,
                backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f5',
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.backgroundColor = isDarkMode ? '#0f0f0f' : '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkMode ? '#2a2a2a' : '#e0e0e0';
                e.target.style.backgroundColor = isDarkMode ? '#0a0a0a' : '#f5f5f5';
              }}
            />
            <button onClick={sendMessage} style={{
              padding: '12px 28px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default ChatWindow;
  