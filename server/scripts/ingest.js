// server/scripts/ingest.js
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import * as fs from "fs";
import "dotenv/config";

const run = async () => {
  try {
    // 1. Read your text file
    const text = fs.readFileSync("mandai_data.txt", "utf8");

    // 2. Split the text into manageable chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.createDocuments([text]);

    // 3. Initialize Pinecone and OpenAI
    const pinecone = new Pinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    const embeddings = new OpenAIEmbeddings();

    // 4. Upsert (upload) the data to Pinecone
    console.log("Uploading to Pinecone...");
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
    });
    
    console.log("Ingestion complete!");
  } catch (error) {
    console.error("Error during ingestion:", error);
  }
};

run();