# Implementation Plan

## 1. Overall Architecture

The application follows a client-server architecture with a Node.js backend handling AI logic and data retrieval, and a frontend (in the `client/api` directory) interacting with this backend.

*   **Frontend Components:** (From `client/src`, `client/index.html`, `client/public` directory). These would be the user interface that sends queries to the backend.
*   **Backend Services:**
    *   **Node.js Server (`client/api/chat.js`):** The main entry point for your backend, which presumably exposes an API endpoint that calls `chatWithMandai`.
    *   **AI/Data Retrieval Logic (`client/api/chat.js`, `client/api/ingest.js`):**
        *   `ingest.js`: Responsible for processing raw data, chunking, generating embeddings, and uploading them to Pinecone. This runs as a standalone script.
        *   `chat.js`: Handles incoming user queries, retrieves relevant context from Pinecone, constructs a prompt, interacts with the Google Generative AI LLM, and manages user sessions.
*   **Database(s):**
    *   **Pinecone:** A vector database used for storing and retrieving vector embeddings of your Mandai Wildlife data.
    *   **Local JSON File (`user_sessions.json`):** Used to store user session information, including a summary of the last conversation, to provide continuity for returning users.
*   **External APIs or Services Used:**
    *   **Google Generative AI API:** Used for both generating embeddings (`models/gemini-embedding-2`) and for the main chat completions (`gemini-2.5-flash`).
    *   **Pinecone API:** Used for interacting with your Pinecone vector index.
    *   **Google Search Tool:** Integrated with the `gemini-2.5-flash` model for real-time information retrieval when the internal context is insufficient.
*   **Interaction Flow:**
    1.  **Data Ingestion (Offline):** The `ingest.js` script is run to process `data/mandai_data.md`, chunk it, embed it using `GoogleGenerativeAIEmbeddings`, and store these in Pinecone.
    2.  **User Query:** A user submits a query via the frontend to the backend server.
    3.  **Backend Processing (`chatWithMandai`):**
        *   Checks for existing user session data in `user_sessions.json`.
        *   Generates an embedding for the user's query using `GoogleGenerativeAIEmbeddings`.
        *   Performs a similarity search on the Pinecone index to retrieve relevant context.
        *   Constructs a comprehensive prompt, including system instructions, conversation history, user profile, and the retrieved context.
        *   Sends the prompt to the `gemini-2.5-flash` model via the Google Generative AI API.
        *   If the context is insufficient, the LLM is empowered to use the `googleSearch` tool.
        *   Receives the LLM's response.
        *   Updates the user's session in `user_sessions.json` with a summary of the last question.
        *   Returns the final answer to the frontend.

## 2. Prompt Engineering Choices

*   **LLM(s) Used:**
    *   **`gemini-2.5-flash`:** This is the primary model used for generating chat responses. It's configured to use the `googleSearch` tool.
*   **Role of the LLM:** The LLM acts as a "Mandai Wildlife Consultant," providing information and answering user questions about Mandai Wildlife.
*   **System Instructions/Context:**
    *   A primary system instruction sets the persona: "You are Barnaby, a Mandai Wildlife Guide."
    *   For returning users with session history, a personalized greeting is injected, acknowledging their last discussed topic.
    *   General instructions emphasize direct and concise answers, using bullet points for readability, summarizing long information into "Quick Facts," and providing a 2-3 sentence high-level summary if the user explicitly asks to "summarize."
    *   Crucially, the LLM is explicitly authorized to use the `googleSearch` tool if the provided context is insufficient or irrelevant, with a directive to provide citations or sources for findings from Google Search.
*   **Prompt Template Construction:** The `chatWithMandai` function constructs a detailed prompt including:
    *   The dynamic `greeting` (personalized for returning users).
    *   Explicit persona definition.
    *   Conversation history (`historyString`).
    *   User profile (`JSON.stringify(userProfile)`).
    *   Retrieved context from Pinecone (`contextText`).
    *   A clear set of `INSTRUCTIONS` for Barnaby's behavior.
    *   The user's `Question`.
*   **Tool Usage:** The `gemini-2.5-flash` model is configured with `tools: [{ googleSearch: {} }]`, enabling it to perform real-time web searches.

## 3. Data Retrieval Strategy (RAG - Retrieval Augmented Generation)

### a. Data Sources
*   The primary data source is a local Markdown file: `mandai_data.md`, located in the `data/` directory.

### b. Chunking Strategy
*   **Text Splitter:** `RecursiveCharacterTextSplitter` from `@langchain/textsplitters` is used.
*   **Chunk Size:** `1000` characters.
*   **Chunk Overlap:** `200` characters.
*   **Rationale:** The recursive splitter attempts to split by various characters to keep paragraphs and sentences together where possible. The `chunkSize` and `chunkOverlap` are chosen to:
    *   Ensure that chunks are small enough to fit within the context window of the embedding model and the LLM.
    *   Provide sufficient overlap between chunks to maintain semantic continuity, preventing loss of context at chunk boundaries when retrieving information.

### c. Embeddings
*   **Embedding Model:** `GoogleGenerativeAIEmbeddings` from `@langchain/google-genai` is used, specifically with the model name `"models/gemini-embedding-2"`.
*   **Generation Process:** For each text chunk generated by the splitter, an embedding (a numerical vector representation) is created using this model.

### d. Vector Storage
*   **Vector Database:** **Pinecone** is utilized.
*   **Index Initialization:** A `Pinecone` client is initialized with `PINECONE_API_KEY`, and an index is accessed via `pinecone.Index(process.env.PINECONE_INDEX)`.
*   **Data Indexing:**
    *   During ingestion (`ingest.js`), `PineconeStore.fromDocuments` is used to efficiently upload the text `docs` (chunks) and their `embeddings` to the specified Pinecone index.
    *   During retrieval (`chat.js`), `PineconeStore.fromExistingIndex` is used to connect to the pre-existing Pinecone index with the `embeddings` model.
*   **Specific Configurations:** The Pinecone index name and API key are managed via environment variables (`PINECONE_INDEX`, `PINECONE_API_KEY`).

### e. Retrieval Process
*   **Querying the Vector Store:** When a user submits a `query`, an embedding of that `query` is generated using `GoogleGenerativeAIEmbeddings`.
*   **Similarity Search:** A `vectorStore.similaritySearch(query, 5)` is performed on the Pinecone index. This retrieves the top 5 most semantically similar document chunks to the user's query.
*   **Similarity Metric:** (Implicitly handled by Pinecone and the embedding model) - Cosine similarity is a common default for vector databases when searching for semantic similarity, which is likely being used here.
*   **Number of Results:** `5` top results are retrieved.
*   **Integration into LLM's Prompt:** The `pageContent` of the retrieved document chunks are joined together with newline characters (`join("\n")`) to form the `contextText`. This `contextText` is then injected directly into the LLM's prompt, providing relevant background information for the LLM to formulate its answer.


## 4. Environment Requirements
* Node.js: v18.x or higher
* npm: v9.x or higher
* Required Environment Variables (.env):
    * `GOOGLE_API_KEY`: For Gemini model and embeddings.
    * `PINECONE_API_KEY`: For vector storage access.
    * `PINECONE_INDEX`: The name of your index.

## 5. Getting Started

```bash
-- Installation
# 1. Move into the project directory
cd client

# 2. Install all dependencies (frontend & backend)
npm install

--  Running the Project
# 1. Run the ingestion script (if needed)
cd client/api
node ingest.js

# 2. Start the backend server
# From the root directory
cd client/api
node server.js

# 3. In a separate terminal, start the frontend
# From the root directory
cd client
npm run dev


# Copy the Local link to test on browser
  ➜  Local:   http://localhost:5173/

## 6. Note
Production Link : https://mandai-ai-consultant-copy.onrender.com/
## Attention ## 
if get "The park is currently experiencing high visitor traffic. Please ask me again in a few seconds!" means API quota is already reached. I use free tier. 