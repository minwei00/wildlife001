import 'dotenv/config'
console.log("DEBUG: Server script is starting...");
import express from 'express';
import path from 'path';
import cors from 'cors';
import { chatWithMandai } from './chat.js'; 

const app = express();
app.use(cors());
app.use(express.json());
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'dist' folder (which will be created in 'client/')
app.use(express.static(path.join(__dirname, '../dist')));

// IMPORTANT: This handles React Router/Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
// This is in-memory store keeps your state alive while the server runs.
let chatHistory = [];

app.post('/api/chat', async (req, res) => {
  try {
    // Extracting fields from body
    const { userId, message, history, userProfile } = req.body;

    // 1. CLEAN INPUTS
    const userQuery = typeof message === 'string' ? message : message.content;
    const currentHistory = history || chatHistory; 

    console.log("Received message:", userQuery);
    console.log("For user:", userId);

    // 2. CALL AGENTIC WORKFLOW
    const response = await chatWithMandai(userId, userQuery, currentHistory, 1, userProfile);
    
    console.log("Gemini response:", response);

    // 3. UPDATE MEMORY
    currentHistory.push({ role: "user", content: userQuery });
    currentHistory.push({ role: "assistant", content: response });
    chatHistory = currentHistory;

    res.json({ answer: response });

  } catch (error) { 
    console.error("--- DETAILED GEMINI ERROR LOG ---");

    const errorDetails = error.error || error;
    const reason = errorDetails.errors ? errorDetails.errors[0].reason : "No reason provided";
    const message = errorDetails.message || error.message || "No message";

    console.error(`Error Code: ${errorDetails.code || error.status}`);
    console.error(`Reason: ${reason}`);
    console.error(`Full Message: ${message}`);

    if (error.status === 429 || (errorDetails && errorDetails.code === 429)) {
        console.warn(`DEBUG: Quota limit hit! Reason: ${reason}`);
        
        return res.status(429).json({ 
            error: "Quota exceeded",
            reason: reason,
            details: message
        });
    }

    res.status(500).json({ error: "Server error: Unable to process request." });
  }
}); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});