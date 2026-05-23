import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; 
import './App.css';
import RobotCanvas from './components/Robot'; 

function App() {
  
  const [response, setResponse] = useState("Hello! I am your Mandai Wildlife Consultant. How can I help you today?");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [background, setBackground] = useState('morning.png');
  // const callGemini = async (userInput) => {
  //   if (!userInput.trim()) return;
    
  //   setLoading(true);
  //   try {
  //     const res = await fetch("http://localhost:5000/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message: userInput }),
  //     });
      
  //     const data = await res.json();
  //     setResponse(data.reply);
  //     setInput("");
  //   } catch (err) {
  //     setResponse("I'm having trouble connecting to the park database!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const callGemini = async (userInput) => {
    if (!userInput.trim()) return;
    
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
      setResponse(data.reply);
      setInput("");
    } catch (err) {
      setResponse("I'm having trouble connecting!");
    } finally {
      setLoading(false);
    }
  };
  return (
    // Flex container to center everything on the screen

<div className="main-app-container">
  <h1>Mandai Wildlife Consultant</h1>
  
  {/* Existing Chat Bubble section */}
  <div className="chat-bubble">
    <ReactMarkdown>{response}</ReactMarkdown>
  </div>

  {/* NEW: Wrapper for Bear + Input Field */}
<div className="input-and-bear-wrapper">
    <div className="bear-avatar-small">
      <RobotCanvas />
    </div>
    
    <div className="input-area">
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Ask me anything..."
      />
      <button onClick={() => callGemini(input)}>Send</button>
    </div>
  </div>
</div>
    //     <div className="main-app-container" style={{ 
    //       minHeight: '100vh',         // Correct: camelCase and string value
    //       width: '100vw',             // Correct
    //       backgroundImage: "url('/morning.png')", // Correct
    //       backgroundSize: 'cover',    // Correct
    //       backgroundPosition: 'center', 
    //       backgroundAttachment: 'fixed', 
    //       backgroundRepeat: 'no-repeat',
    //       display: 'flex',
    //       flexDirection: 'column',
    //       alignItems: 'center',
    //       overflow: 'hidden', 
    //       margin: 0,                  // Numbers don't need quotes
    //       padding: 0 
    //     }}>
    //     <h1>Mandai Wildlife Consultant</h1>

    //     {/* This is the new Presentation Partner section */}
    //     <div className="chat-presentation-wrapper">
    //       <div className="bear-avatar">
    //         <RobotCanvas />
    //       </div>
    //       <div className="chat-bubble">
    //         <ReactMarkdown>{response}</ReactMarkdown>
    //       </div>
    //     </div>

    //     {/* The Input Area */}
    //     <div className="input-area" style={{ marginTop: '20px' }}>
    //       <input 
    //         value={input} 
    //         onChange={(e) => setInput(e.target.value)} 
    //         placeholder="Ask me anything..."
    //       />
    //       <button onClick={() => callGemini(input)}>Send</button>
    //     </div>
    //   </div>
    // );
    //     <div style={{ 
//       display: 'flex', 
//       flexDirection: 'column', 
//       alignItems: 'center', 
//       justifyContent: 'center', 
//       minHeight: '100vh', 
//       fontFamily: 'sans-serif',
//       padding: '20px',
//       backgroundImage: `url('/${background}')`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       backgroundRepeat: 'no-repeat',
//       transition: 'background-image 0.5s ease-in-out'
//     }}>
//       <h1>Mandai Wildlife Consultant</h1>
      
//       {/* Robot container: Centered and fixed size */}
//       <div style={{ width: '100%', maxWidth: '500px', height: '400px' }}>
//         <RobotCanvas />
//       </div>

//       <div style={{ width: '100%', maxWidth: '600px', margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
//         {loading ? (
//           <p>Ranger is thinking...</p>
//         ) : (
//           <div className="chat-message">
//             <ReactMarkdown>
//               {response}
//             </ReactMarkdown>
//           </div>
//         )}
//       </div>

//       <div>
//         <input 
//           type="text" 
//           value={input} 
//           onChange={(e) => setInput(e.target.value)} 
//           placeholder="Ask me anything..."
//           disabled={loading}
//           style={{ padding: '8px', width: '250px' }}
//         />
        
//         <button 
//           disabled={loading} 
//           onClick={() => callGemini(input)}
//           style={{ padding: '8px 16px', marginLeft: '10px' }}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
  )
  }

export default App;