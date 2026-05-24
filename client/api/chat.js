import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
const SESSIONS_FILE = './user_sessions.json';

function saveSession(userId, profile, lastSummary) {
  let sessions = {};
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  }
  sessions[userId] = { profile, lastSummary, timestamp: Date.now() };
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// Helper to get session
function getSession(userId) {
  if (!fs.existsSync(SESSIONS_FILE)) return null;
  const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  return sessions[userId] || null;
}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export async function chatWithMandai(userId,query, history, attempt = 1, userProfile= {}) {
  console.log("DEBUG: Starting chatWithMandai with query:", query);
  const session = getSession(userId);
  
  // GREETING LOGIC: If it's a returning user, inject the summary into the prompt
  let greeting = "";
  if (session && (!history || history.length === 0)) {
    greeting = `System Instruction: You are a Mandai Wildlife Consultant. The user has visited before and last discussed: "${session.lastSummary}". 
    Greet them warmly acknowledging this, then answer the following question.`;
  } else {
    greeting = "System Instruction: You are a Mandai Wildlife Consultant. Answer the following question directly and concisely without conversational filler.";
  }
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "models/gemini-embedding-2",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    const historyString = history
    .map(msg => `${msg.role}: ${msg.content}`)
    .join("\n");

    console.log("DEBUG: Searching Pinecone...");
    const results = await vectorStore.similaritySearch(query, 5);

    // 2. GENERATION LOGIC STARTS HERE
    console.log("DEBUG: Generating response with Gemini...");
    
    const contextText = results.map(doc => doc.pageContent).join("\n");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  // Change your model initialization to this:
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }] // Use 'googleSearch', not 'googleSearchRetrieval'
    });

    const prompt = `
    You are Barnaby, a friendly, intelligent, and slightly playful bear who serves as the official Mandai Wildlife Consultant.
    ${greeting}
    Conversation history: ${historyString}
    User Profile: ${JSON.stringify(userProfile)}
    Context: ${contextText}

    INSTRUCTIONS:
    - Personality: You are Barnaby. Use a warm, welcoming tone. Feel free to use light "bear" puns or nature-themed language (e.g., "paws-itively," "let's prowl through the facts," "from the den").
    - Expert Knowledge: You are a Mandai Wildlife expert. You love sharing facts about animals and helping visitors have a great time.
    - Formatting: 
        - Keep responses concise and friendly.
        - Use bullet points for readability when listing wildlife info or tips.
        - If the answer is long, summarize it into a "Quick Facts" section at the end.
        - If the user asks for a "summary," provide a 2-3 sentence high-level summary only.
    - Knowledge Source:
        - If the CONTEXT contains enough information, answer directly in your bear persona.
        - If the CONTEXT is insufficient, use your 'googleSearch' tool to find real-time info.
        - Always provide citations or sources for findings if you search the web.
    - Constraints: Maintain your role as a professional consultant—don't drift into being *just* a cartoon bear; you are a highly informed guide who happens to be a bear.
        
    Question: ${query}`;

    const result = await model.generateContent(prompt);
    const finalAnswer = result.response.text();
    console.log("\nCONSULTANT:", finalAnswer);
    const newSummary = `the user's last question was about: "${query}"`;
    saveSession(userId, userProfile, newSummary);
    // GENERATION LOGIC ENDS HERE
    return finalAnswer;

  } catch (err) {
    // 1. Handle Rate Limit Retries
    if (err.status === 429 && attempt <= 3) {
        console.log(`Rate limit hit! Waiting ${attempt * 10} seconds to retry...`);
        await sleep(attempt * 10000); 
        return chatWithMandai(userId, query, history, attempt + 1, userProfile);
    }
    
    console.error("DEBUG: Permanent error:", err);

    // 2. Distinguish the final user message based on the error type
    if (err.status === 429) {
        // True quota/traffic issue after 3 failed retries
        return "The park is currently experiencing high visitor traffic. Please ask me again in a few seconds!";
    } else {
        // System, network, or authentication issues
        return "The AI consultant is currently facing connection issues. Please try again later.";
    }
}}

const userQuery = process.argv[2] || "What is Mandai?";
// chatWithMandai(userQuery);