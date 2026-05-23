import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; 
import RobotCanvas from './components/Robot'; 

function App() {
  const [response, setResponse] = useState("Hello! I am your Mandai Wildlife Consultant. How can I help you today?");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const callGemini = async (userInput) => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      
      const data = await res.json();
      setResponse(data.reply);
      setInput("");
    } catch (err) {
      setResponse("I'm having trouble connecting to the park database!");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Flex container to center everything on the screen
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif',
      padding: '20px' 
    }}>
      <h1>Mandai Wildlife Consultant</h1>
      
      {/* Robot container: Centered and fixed size */}
      <div style={{ width: '100%', maxWidth: '500px', height: '400px' }}>
        <RobotCanvas />
      </div>

      <div style={{ width: '100%', maxWidth: '600px', margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        {loading ? (
          <p>Ranger is thinking...</p>
        ) : (
          <div className="chat-message">
            <ReactMarkdown>
              {response}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask me anything..."
          disabled={loading}
          style={{ padding: '8px', width: '250px' }}
        />
        
        <button 
          disabled={loading} 
          onClick={() => callGemini(input)}
          style={{ padding: '8px 16px', marginLeft: '10px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;