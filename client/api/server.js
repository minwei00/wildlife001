import express from 'express';
import path from 'path';
import cors from 'cors';
import { chatWithMandai } from './chat.js'; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd()));

// In a real production app, use a database. 
// For now, this in-memory store keeps your state alive while the server runs.
let chatHistory = [];

app.post('/api/chat', async (req, res) => {
  try {
    // Extracting fields from body
    const { userId, message, history, userProfile } = req.body;

    // 1. CLEAN INPUTS: Ensure message is treated as a string and history as an array
    const userQuery = typeof message === 'string' ? message : message.content;
    const currentHistory = history || chatHistory; 

    console.log("Received message:", userQuery);
    console.log("For user:", userId);

    // 2. CALL AGENTIC WORKFLOW: Passing all required parameters
    const response = await chatWithMandai(userId, userQuery, currentHistory, 1, userProfile);
    
    console.log("Gemini response:", response);

    // 3. UPDATE MEMORY: Keep track of the conversation
    currentHistory.push({ role: "user", content: userQuery });
    currentHistory.push({ role: "assistant", content: response });
    
    // Update global state if not using a DB
    chatHistory = currentHistory;

    res.json({ answer: response });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Server error: Unable to process request." });
  }
});
// module.exports = app;
//app.listen(5000, () => console.log("Backend running on port 5000"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});