import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export async function chatWithMandai(query, history, attempt = 1) {
  console.log("DEBUG: Starting chatWithMandai with query:", query);
  
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
    const results = await vectorStore.similaritySearch(query, 2);

    // 2. GENERATION LOGIC STARTS HERE
    console.log("DEBUG: Generating response with Gemini...");
    
    const contextText = results.map(doc => doc.pageContent).join("\n");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful Mandai Wildlife Consultant.
    Here is the conversation history:
    ${historyString}
    
    Answer the user's latest question using the context provided below:
    ${contextText}
    
    Question: ${query}`;

    const result = await model.generateContent(prompt);
    const finalAnswer = result.response.text();
    console.log("\nCONSULTANT:", finalAnswer);
    // GENERATION LOGIC ENDS HERE
    return finalAnswer;

  } catch (err) {
    // If it's a 429 error and we haven't tried too many times
    if (err.status === 429 && attempt <= 3) {
      console.log(`Rate limit hit! Waiting ${attempt * 10} seconds to retry...`);
      await sleep(attempt * 10000); // Wait 10s, 20s, 30s
      return chatWithMandai(query, history, attempt + 1);
    }
    
    console.error("DEBUG: Permanent error:", err);
    return "The park is currently experiencing high visitor traffic. Please ask me again in a few seconds!";
  }
}

const userQuery = process.argv[2] || "What is Mandai?";
// chatWithMandai(userQuery);