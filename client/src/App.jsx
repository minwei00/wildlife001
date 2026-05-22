import React, { useState } from 'react';

function App() {
  const [response, setResponse] = useState("Hello! I am your Mandai Wildlife Consultant. How can I help you today?");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(""); // 1. Track what you type

  const callGemini = async (userInput) => {
    if (!userInput.trim()) return; // Don't send empty questions
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      
      const data = await res.json();
      setResponse(data.reply);
      setInput(""); // 2. Clear input after sending
    } catch (err) {
      setResponse("I'm having trouble connecting to the park database!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mandai Wildlife Consultant</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>{loading ? "Ranger is thinking..." : response}</p>
      </div>

      {/* 3. The new input field */}
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Ask me anything..."
        disabled={loading}
      />
      
      <button 
        disabled={loading} 
        onClick={() => callGemini(input)}
      >
        Send
      </button>
    </div>
  );
}

export default App;