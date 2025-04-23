function ChatWindow({ messages, input, setInput, sendMessage }) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', fontSize: '1.8em' }}>MERNverse Chat</h1>
  
        <div style={{
          height: '400px',
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {messages.map((msg, idx) => (
              <li key={idx} style={{
                marginBottom: '10px',
                padding: '8px',
                backgroundColor: '#e6f7ff',
                borderRadius: '5px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal'
              }}>
                <strong style={{ color: '#0056b3' }}>{msg.username}:</strong> {msg.message}
              </li>
            ))}
          </ul>
        </div>
  
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginRight: '10px',
              fontSize: '14px'
            }}
          />
          <button onClick={sendMessage} style={{
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#28a745',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Send
          </button>
        </div>
      </div>
    );
  }
  
  export default ChatWindow;
  