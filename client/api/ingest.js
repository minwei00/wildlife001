import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// 1. REMOVED: OpenAIEmbeddings
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // ADDED
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

/* =========================================================
   LOAD ENV VARIABLES
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

console.log("ENV PATH:", envPath);
console.log("Checking Pinecone API Key:", process.env.PINECONE_API_KEY ? "Found!" : "Missing!");
console.log("Checking Google API Key:", process.env.GOOGLE_API_KEY ? "Found!" : "Missing!"); // UPDATED
console.log("Checking Pinecone Index:", process.env.PINECONE_INDEX ? "Found!" : "Missing!");

/* =========================================================
   VALIDATE ENV VARIABLES
========================================================= */

if (!process.env.PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY");
if (!process.env.GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY"); // UPDATED
if (!process.env.PINECONE_INDEX) throw new Error("Missing PINECONE_INDEX");

/* =========================================================
   INITIALIZE PINECONE
========================================================= */

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX);

/* =========================================================
   INGEST FUNCTION
========================================================= */

const run = async () => {
  try {
    console.log("\nReading markdown file...");
    const dataPath = path.resolve(__dirname, "../../data/mandai_data.md");
    const text = fs.readFileSync(dataPath, "utf8");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    console.log(`Successfully created ${docs.length} chunks.`);

    /* =====================================================
       CREATE EMBEDDINGS (GEMINI)
    ===================================================== */

    // console.log("\nInitializing Google Gemini embeddings...");

    // // 2. USE GoogleGenerativeAIEmbeddings
    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //   modelName: "embedding-001", 
    //   apiKey: process.env.GOOGLE_API_KEY,
    // });
        console.log("\nInitializing Google Gemini embeddings...");

        const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "models/gemini-embedding-2",
        apiKey: process.env.GOOGLE_API_KEY,
        // REMOVE outputDimensionality: 768 entirely. 
        // Let the model use its native 3072.
        });
        // Test the model specifically
        try {
        const testVec = await embeddings.embedQuery("hello");
        console.log("Successfully generated embedding of size:", testVec.length);
        } catch (e) {
        console.error("Embedding generation failed. Check your GOOGLE_API_KEY.");
        throw e;
        }
    /* =====================================================
       UPLOAD TO PINECONE
    ===================================================== */

    console.log("\nUploading embeddings to Pinecone...");

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });

    console.log("\n✅ Ingestion complete!");
  } catch (error) {
    console.error("\n❌ Error during ingestion:");
    console.error(error);
  }
};

run();