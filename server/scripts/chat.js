import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
// 1. ADD THIS IMPORT
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function chatWithMandai(query) {
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

    console.log("DEBUG: Searching Pinecone...");
    const results = await vectorStore.similaritySearch(query, 2);

    // 2. GENERATION LOGIC STARTS HERE
    console.log("DEBUG: Generating response with Gemini...");
    
    const contextText = results.map(doc => doc.pageContent).join("\n");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful Mandai Wildlife Consultant. 
    Answer the user question using ONLY the context provided below.
    If the answer isn't in the context, say you don't know.
    
    Context:
    ${contextText}
    
    Question: ${query}`;

    const result = await model.generateContent(prompt);
    console.log("\nCONSULTANT:", result.response.text());
    // GENERATION LOGIC ENDS HERE

  } catch (err) {
    console.error("DEBUG: Caught an error!");
    console.error(err);
  }
}

const userQuery = process.argv[2] || "What is Mandai?";
chatWithMandai(userQuery);