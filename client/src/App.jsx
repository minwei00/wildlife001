import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import RobotCanvas from './components/Robot';

function App() {
  // const [response, setResponse] = useState("Hello! I am your Mandai Wildlife Consultant. How can I help you today?");
  const [messages, setMessages] = useState([
  { id: 1, sender: 'bot', text: 'Hello! I am your Mandai Wildlife Consultant. How can I help you today?' }
]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const callGemini = async (userInput) => {
    if (!userInput.trim()) return;

    // 1. Add user message to UI immediately
    const newUserMessage = { id: Date.now(), sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setInput(""); // Clear input bar
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userInput,
          userId: "guest_user" 
        }),
      });

      if (!res.ok) throw new Error("Server error");
      
      const data = await res.json();
      
      // 2. Add bot reply to UI
      const newBotMessage = { id: Date.now() + 1, sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, newBotMessage]);

    } catch (err) {
      console.error("Fetch error:", err);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "I'm having trouble connecting to the zoo server!" }]);
    } finally {
      setLoading(false);
    }
  };
//   return (
//     <div className="main-app-container">
//       <h1>Mandai Wildlife Consultant</h1>

//       {/* Main Layout Container */}
//       <div className="main-chat-layout">
        
// {/* 1. Scrollable History */}
//       <div className="chat-history-container">
//         {messages.slice(0, -1).map((msg) => (
//           <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
//             <ReactMarkdown>{msg.text}</ReactMarkdown>
//           </div>
//         ))}
//       </div>

//       {/* 2. Fixed Bear + Latest Message */}
//       <div className="bear-and-response-row">
//         <div className="bear-avatar-full">
//           <RobotCanvas />
//         </div>
//         {/* Add conditional class here: if it's the user, hide the bear or style differently */}
//         <div className={`chat-bubble ${messages[messages.length - 1].sender}`}>
//           <ReactMarkdown>
//             {messages[messages.length - 1].text}
//           </ReactMarkdown>
//         </div>
//       </div>
//     </div>
//       {/* Bottom Input Area */}
//       <div className="input-area-wrapper">
//         <div className="input-area">
//           <input 
//             value={input} 
//             onChange={(e) => setInput(e.target.value)} 
//             onKeyDown={(e) => e.key === 'Enter' && callGemini(input)}
//             placeholder="Ask me anything..."
//           />
//           <button onClick={() => callGemini(input)}>Send</button>
//         </div>
//       </div>
//     </div>
//   );
return (
    <div className="main-app-container">
      <h1>Mandai Wildlife Consultant</h1>

      {/* Main Layout Container */}
      <div className="main-chat-layout">
        
        {/* 1. Scrollable History: Show ONLY previous messages (exclude the last one) */}
        <div className="chat-history-container">
          {messages.slice(0, -1).map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
        </div>

        {/* 2. Fixed Bear Row: This ONLY shows the last message if it's from the bot */}
        {messages[messages.length - 1].sender === 'bot' && (
          <div className="bear-and-response-row">
            <div className="bear-avatar-full">
              <RobotCanvas />
            </div>
            <div className="chat-bubble bot">
              <ReactMarkdown>
                {messages[messages.length - 1].text}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="input-area-wrapper">
        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && callGemini(input)}
            placeholder="Ask me anything..."
          />
          <button onClick={() => callGemini(input)}>Send</button>
        </div>
      </div>
    </div>
  );
 }
export default App;