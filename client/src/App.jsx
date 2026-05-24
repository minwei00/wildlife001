import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import RobotCanvas from './components/robot';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Barnaby! Your Mandai Wildlife Guide. How can I help you today?' }
  ]);
  const botSound = useRef(new Audio('/bot-reply.mp4'));
  useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.sender === 'bot' && messages.length > 1) {
    botSound.current.play().catch(e => console.error("Audio playback failed:", e));
  }
  }, [messages]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

 const callGemini = async (userInput) => {
  if (!userInput.trim()) return;

  const newUserMessage = { id: Date.now(), sender: 'user', text: userInput };
  
  // Update state using functional approach
  setMessages(prev => [...prev, newUserMessage]);
  setInput("");
  setLoading(true);

  try {
      // Use the dynamic URL to handle local vs production environments
      const BACKEND_URL = import.meta.env.MODE === 'development' 
        ? "http://localhost:3000" 
        : ""; 

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, userId: "guest_user" }),
      });

      const data = await res.json();
      console.log("Data received from backend:", data);

      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + Math.random(), 
          sender: 'bot', 
          text: data.answer 
        }
      ]);
      
    } catch (err) {
      console.error("Fetch error:", err);
      // Optional: Add a friendly error message to the chat so the user knows something happened
      setMessages(prev => [
        ...prev, 
        { id: Date.now(), sender: 'bot', text: "Sorry, Barnaby is having trouble connecting to the server!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

//   try {
//     const res = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userInput, userId: "guest_user" }),
//     });

//     const data = await res.json();
//     console.log("Data received from backend:", data); // Check F12 Console for this!

//     // Force a fresh array reference to guarantee a re-render
//     setMessages(prev => {
//       const nextMessages = [...prev, { 
//         id: Date.now() + Math.random(), 
//         sender: 'bot', 
//         text: data.answer
//       }];
//       return nextMessages;
//     });
    
//   } catch (err) {
//     console.error("Fetch error:", err);
//   } finally {
//     setLoading(false);
//   }
// };

  return (
    <div className="main-app-container">
      <h1>Ask Barnaby!</h1>

      <div className="main-chat-layout">
        {/* Scrollable History: Show everything except the absolute latest message */}
        <div className="chat-history-container">
          {messages.slice(0, -1).map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
        </div>

        {/* Latest Message Bear Row: Only shows if the last message is from the bot */}
        {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
          <div className="bear-and-response-row">
            <div className="bear-avatar-full">
              <RobotCanvas />
            </div>
            <div className="chat-bubble bot">
              <ReactMarkdown>{messages[messages.length - 1].text}</ReactMarkdown>
            </div>
          </div>
        )}
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
          <button 
          onClick={() => callGemini(input)} 
          disabled={loading}
        >
          {loading ? "Barnaby is thinking..." : "Ask Barnaby!"}
        </button>
        </div>
      </div>
    </div>
  );
}

export default App;