import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { LangChainAdapter } from "ai";
import { brandingKnowledge, brandingPrompt } from "./branding-knowledge";

export const generatePrompt = async (searches: any[], question: string) => {
  let context = "";
  searches.forEach((search) => {
    context = context + "\n\n" + search.pageContent;
  });

  const prompt = PromptTemplate.fromTemplate(`
    ${brandingPrompt}

    CONHECIMENTO BASE SOBRE BRANDING:
    ${brandingKnowledge}

    CONTEXTO DO DOCUMENTO:
    ${context}

    PERGUNTA DO USUÁRIO:
    ${question}

    Por favor, analise o contexto fornecido e responda à pergunta do usuário, aplicando os princípios de branding e considerando:
    1. O contexto específico da marca
    2. As melhores práticas de branding
    3. Oportunidades de melhoria
    4. Recomendações práticas

    Resposta:
  `);

  const formattedPrompt = await prompt.format({
    context: context,
    question: question,
  });
  return formattedPrompt;
}

export const generateOutput = async (prompt: string) => {
  const ollamaLlm = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3.2", // Default value
  });

  const response = await ollamaLlm.invoke(prompt);
  return response;
}