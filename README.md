# BrandMate

A modern web application designed for collaborative branding discussions, enabling users to upload and interact with PDF documents in real-time using AI. Built with Next.js, TypeScript, and integrated with Groq API for intelligent, context-aware branding insights. BrandMate streamlines branding strategies by automatically extracting key details from documents and facilitating focused, interactive conversations.

## 🌟 Features

- PDF document processing and chunking
- Vector-based semantic search using ChromaDB
- Interactive Chat Interface
- AI-Powered Document Analysis with Llama 3.3 70B
- Efficient document chunking with RecursiveCharacterTextSplitter
- Context-Aware Responses
- Real-time Processing

## 🚀 Getting Started

### Prerequisites

- Node.js
- Docker (for Qdrant)
- [Groq](groq.com) API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/julianofirme/brand-mate.git
cd brand-mate
```

2. Install dependencies:
```bash
npm install
```

3. Make sure GROQ_API_KEY is defined

4. Start Qdrant using Docker:
```bash
docker-compose up -d
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How It Works

1. **Brand information**: Users fills out a form about the brand
2. **Document Processing**: The application splits the PDF into manageable chunks using LangChain's text splitter
3. **Vector Storage**: Document chunks are embedded and stored in Qdrant for efficient retrieval
4. **Chat Interface**: Users can ask questions about the uploaded document
5. **AI Processing**: The application uses Llama 3.3 70B to generate context-aware responses based on the document content

## 🛠 Tech Stack

- **Frontend**: Next.js
- **UI Components**: Shadcn/ui
- **AI/ML**: 
  - Groq API for LLM capabilities
  - LangChain for document processing
  - Qdrant for vector storage

## License

This project is licensed under the MIT License
