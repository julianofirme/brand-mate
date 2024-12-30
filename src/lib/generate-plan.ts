import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import {
  BASE_SYSTEM_PROMPT,
  EXPERTISE_FRAMEWORK,
} from "@/lib/prompt-templates";

export const generatePrompt = async (contextDocs: Document[], question: string) => {
  // Format the context from vector store documents
  const context = contextDocs
    .map(doc => doc.pageContent)
    .join("\n\n");

  const prompt = PromptTemplate.fromTemplate(`
    ${BASE_SYSTEM_PROMPT}

    CONHECIMENTO BASE SOBRE BRANDING:
    ${EXPERTISE_FRAMEWORK}

    ${context ? `CONTEXTO ESPECÍFICO DA MARCA:
    ${context}` : ''}

    INSTRUÇÃO:
    ${question}

    Por favor, gere uma resposta detalhada considerando:
    1. O contexto específico da marca (se fornecido)
    2. As melhores práticas de branding
    3. Oportunidades de melhoria
    4. Recomendações práticas e acionáveis

    Mantenha o formato solicitado na instrução e certifique-se de que a resposta seja específica para o negócio em questão.

    Resposta:
  `);

  const formattedPrompt = await prompt.format({
    context: context,
    question: question,
  });

  return formattedPrompt;
}

const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${EXPERTISE_FRAMEWORK}`;

export const generateOutput = async (prompt: string) => {
  const chatCompletion = await generateText({
    messages: [
      { 
        role: 'system', 
        content: systemPrompt 
      },
      { 
        role: 'user', 
        content: prompt 
      }
    ],
    model: groq('llama-3.3-70b-versatile'),
    temperature: 0.7,
  });

  return chatCompletion.text;
}