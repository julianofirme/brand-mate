import { streamText, Message as VercelMessage } from 'ai';
import { brandingPrompt, brandingKnowledge } from '@/lib/branding-knowledge';
import { groq } from '@ai-sdk/groq';
import { searchVectorDB } from '@/lib/vector-store';
import { db } from '@/db';
import { plans } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function buildChatContext(businessId: string | undefined) {
  let context = `${brandingPrompt}\n\nCONHECIMENTO BASE SOBRE MARKETING DIGITAL:\n${brandingKnowledge}\n\n`;

  if (businessId) {
    try {
      // Buscar informações da marca no banco
      const planData = await db.select()
        .from(plans)
        .where(eq(plans.id, businessId))
        .limit(1);

      if (planData && planData[0]) {
        const { businessData } = JSON.parse(planData[0].content);
        context += `\nINFORMAÇÕES DA MARCA:
          - Nome: ${businessData.negocio}
          - Segmento: ${businessData.segmento}
          - Público-alvo: ${businessData.publicoAlvo}
          - Objetivos: ${businessData.objetivos}
          - Orçamento: ${businessData.orcamento}\n\n
        `;

        // Buscar documentos relevantes do PDF no vector store
        const relevantDocs = await searchVectorDB(
          businessId,
          "informações importantes da marca contexto geral"
        );

        if (relevantDocs && relevantDocs.length > 0) {
          context += `CONTEXTO DO DOCUMENTO DA MARCA:\n${relevantDocs
            .map(doc => doc.pageContent)
            .join('\n\n')}\n\n`;
        }
      }
    } catch (error) {
      console.error('Error building chat context:', error);
    }
  }

  return context;
}

export async function POST(req: Request) {
  const { messages, businessId } = await req.json();

  const chatContext = await buildChatContext(businessId);

  const response = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: chatContext,
    messages: [
      ...messages.map((message: VercelMessage) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  });

  return response.toDataStreamResponse();
}
