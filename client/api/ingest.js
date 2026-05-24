import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; 
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

// INITIALIZE PINECONE

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(process.env.PINECONE_INDEX);

// INGEST FUNCTION

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

    //CREATE EMBEDDINGS (GEMINI)

        console.log("\nInitializing Google Gemini embeddings...");

        const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "models/gemini-embedding-2",
        apiKey: process.env.GOOGLE_API_KEY,
        });
        try {
        const testVec = await embeddings.embedQuery("hello");
        console.log("Successfully generated embedding of size:", testVec.length);
        } catch (e) {
        console.error("Embedding generation failed. Check your GOOGLE_API_KEY.");
        throw e;
        }
       // UPLOAD TO PINECONE

    console.log("\nUploading embeddings to Pinecone...");

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });

    console.log("\n Ingestion complete!");
  } catch (error) {
    console.error("\n Error during ingestion:");
    console.error(error);
  }
};

run();