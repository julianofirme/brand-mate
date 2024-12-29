import { PromptTemplate } from "@langchain/core/prompts";
import { brandingKnowledge, brandingPrompt } from "./branding-knowledge";
import { groqClient } from "./groq";

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
  const chatCompletion = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }, { role: 'system', content: brandingPrompt }],
    model: 'llama-3.3-70b-versatile',
  });

  return chatCompletion.choices[0].message
}