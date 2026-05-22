import express from 'express';
import cors from 'cors';
import { chatWithMandai } from './scripts/chat.js'; 

const app = express();
app.use(cors()); // Crucial: Allows the client to talk to this server
app.use(express.json());

let chatHistory = [];

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    // Add user message to history
    chatHistory.push({ role: "user", content: message });
    console.log("Received message:", message); // Debugging
    
    const response = await chatWithMandai(message, chatHistory);
    console.log("Gemini response:", response); // Debugging
    chatHistory.push({ role: "assistant", content: response });
    res.json({ reply: response });
  } catch (error) {
    console.error("Backend Error:", error); // Debugging
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));