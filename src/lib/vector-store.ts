import { Document } from '@langchain/core/documents';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OllamaEmbeddings } from "@langchain/ollama";
import { QdrantVectorStore } from '@langchain/qdrant';

const client = new QdrantClient({
  url: 'http://localhost:6333',
});

const embeddings = new OllamaEmbeddings();

export async function storeDocumentInVectorDB(docs: Document[], businessId: string) {
  const vectorStore = await QdrantVectorStore.fromDocuments(
    docs,
    embeddings,
    {
      client,
      collectionName: businessId,
    }
  );

  return vectorStore;
}

export async function searchVectorDB(businessId: string, query: string) {
  const vectorStore = new QdrantVectorStore(embeddings, {
    client,
    collectionName: businessId,
  });

  const results = await vectorStore.similaritySearch(query, 5);
  return results;
}
