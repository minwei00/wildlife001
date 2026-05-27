import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import RobotCanvas from './components/robot';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Barnaby! Your Mandai Wildlife Guide. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);
  const botSound = useRef(new Audio('/bot-reply.mp4'));

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio logic
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'bot' && messages.length > 1) {
      botSound.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [messages]);

  const callGemini = async (userInput) => {
    if (!userInput.trim()) return;

    const newUserMessage = { id: Date.now(), sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const BACKEND_URL = import.meta.env.MODE === 'development' ? "http://localhost:3000" : ""; 
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, userId: "guest_user" }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Sorry, Barnaby is having trouble connecting to the server!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-app-container">
      <h1>Ask Barnaby!</h1>
      
      <div className="main-chat-layout">
        <div className="chat-history-container">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.sender === 'bot' ? "bear-and-response-row" : "user-message-row"}>
              {msg.sender === 'bot' && (
                <div className="bear-avatar-full">
                  <RobotCanvas />
                </div>
              )}
              <div className={`chat-bubble ${msg.sender}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {/* This empty div is the anchor for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area-wrapper">
        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && !loading && callGemini(input)}
            placeholder={loading ? "Barnaby is thinking..." : "Ask me anything..."}
            disabled={loading}
          />
          <button onClick={() => callGemini(input)} disabled={loading}>
            {loading ? "Thinking..." : "Ask Barnaby!"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;