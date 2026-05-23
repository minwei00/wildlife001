import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function debugModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  // Use v1 instead of v1beta, as v1 is more stable for production
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  console.log("Checking API Key exists:", !!apiKey);
  console.log("Fetching from:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Print everything to see if the structure is what we expect
    console.log("Response status:", response.status);
    console.log("Data returned:", JSON.stringify(data, null, 2));

    if (data.models) {
      const embeddingModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes("embedContent")
      );
      console.log("\nModels supporting embedContent:", embeddingModels.map(m => m.name));
    } else {
      console.log("No 'models' array found in the response.");
    }
  } catch (error) {
    console.error("Critical Fetch Error:", error);
  }
}

debugModels();