# Mandai Wildlife Consultant AI (Barnaby)
Welcome to the Mandai Wildlife Consultant AI! This project is an intelligent, RAG-powered chatbot ("Barnaby") designed to provide wildlife insights and guidance for Mandai Wildlife Reserve.

1. **Live Application**:
You can interact with Barnaby live at:
https://mandai-ai-consultant-copy.onrender.com/

2. **Project Documentation**:

    For a detailed look at the system architecture, prompt engineering strategies, and Retrieval-Augmented Generation (RAG) implementation, please refer to the design.md file in this repository.

3. **⚠️ Project Status & Limitations**

    ***Important Note on Performance***

    This application is powered by the Google Gemini API (Free Tier). Because of this, please be aware of the following:

    🚀 Cold Starts: If the application has been inactive, it may take 30–60 seconds to "wake up" upon your first visit.

    ⏳ API Quotas: If you see the message: "The park is currently experiencing high visitor traffic. Please ask me again in a few seconds!", it simply means the API limit has been reached. Please wait a brief moment and try again.

4. **Getting Started**

**Prerequisites**:
Before running the project locally, ensure you have:

* **Google AI Studio API Key:** [Get one here](https://aistudio.google.com/app/apikey)

* **Pinecone Account:** Create a free index at [pinecone.io](https://www.pinecone.io/).

* **Environment Variables:** Create a `.env` file in the **root directory** with the following content:

```text
GOOGLE_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=your_index_name
```


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


# Copy the Local link found in terminal to test on browser, it looks like this:-
  ➜  Local:   http://localhost:5173/
