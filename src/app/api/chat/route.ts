import {streamText, Message as VercelMessage} from "ai";
import {groq} from "@ai-sdk/groq";
import {searchVectorDB} from "@/lib/vector-store";
import {db} from "@/db";
import {plans} from "@/db/schema";
import {eq} from "drizzle-orm";
import {
  BASE_SYSTEM_PROMPT,
  EXPERTISE_FRAMEWORK,
  DYNAMIC_CONTEXT_TEMPLATE,
  BRAND_CONTEXT_TEMPLATE,
  DOCUMENT_INSIGHTS_TEMPLATE,
} from "@/lib/prompt-templates";

// Security function to sanitize user input
function sanitizeInput(input: string): string {
  return input
    .replace(/[\\`*{}[\]()#+\-.!]/g, '') // Remove special characters
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();
}

// Security function to validate message content
function validateMessage(message: VercelMessage): boolean {
  if (!message.content || typeof message.content !== 'string') return false;
  if (message.content.length > 1000) return false; // Limit message length
  if (message.role !== 'user' && message.role !== 'assistant') return false;
  return true;
}

interface BrandData {
  negocio: string;
  segmento: string;
  publicoAlvo: string;
  objetivos: string;
  orcamento: string;
}

async function getBrandContext(
  businessId: string,
  validatedMessages: any[]
): Promise<{brandData?: BrandData; documents?: string}> {
  try {
    const planData = await db
    .select()
    .from(plans)
    .where(eq(plans.id, businessId))
    .limit(1);
    
    if (!planData?.[0]) return {};

    const {businessData} = JSON.parse(planData[0].content);

    const generalDocs = await searchVectorDB(businessId, `${businessData.segmento}, 
      ${businessData.publicoAlvo}, ${businessData.negocio}, ${businessData.objetivos}, 
      ${businessData.orcamento}`
    );

    // Combine and deduplicate documents
    const allDocs = [...generalDocs];
    const uniqueDocs = Array.from(
      new Set(allDocs.map((doc) => doc.pageContent))
    );

    return {
      brandData: businessData,
      documents: uniqueDocs.join("\n\n"),
    };
  } catch (error) {
    console.error("Error getting brand context:", error);
    return {};
  }
}

function formatBrandContext(brandData?: BrandData, documents?: string): string {
  if (!brandData) return "";

  let context = BRAND_CONTEXT_TEMPLATE
    .replace(/{negocio}/g, brandData.negocio)
    .replace(/{segmento}/g, brandData.segmento)
    .replace(/{publicoAlvo}/g, brandData.publicoAlvo)
    .replace(/{objetivos}/g, brandData.objetivos)
    .replace(/{orcamento}/g, brandData.orcamento);

  if (documents) {
    context += DOCUMENT_INSIGHTS_TEMPLATE.replace('{documents}', documents);
  }

  return context;
}

function getCurrentQuestion(messages: VercelMessage[]): string {
  if (messages.length === 0) return "";

  // Get the last 3 messages for better context
  const recentMessages = messages.slice(-3);

  // Format conversation flow with thought process
  return recentMessages
    .map((msg, index) => {
      if (msg.role === "user") {
        return `Pergunta do Cliente: ${msg.content}`;
      } else {
        const nextMsg = messages[index + 1];
        if (nextMsg && nextMsg.role === "user") {
          return `Minha Última Resposta: ${msg.content}\n\nNova Dúvida do Cliente: ${nextMsg.content}`;
        }
        return `Minha Resposta: ${msg.content}`;
      }
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const {messages, businessId} = await req.json();
    console.log("🚀 ~ businessId:", businessId)

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Validate and sanitize all messages
    const validatedMessages = messages.filter(validateMessage)
      .map(msg => ({
        ...msg,
        content: sanitizeInput(msg.content)
      }));

    if (validatedMessages.length === 0) {
      return new Response('No valid messages provided', { status: 400 });
    }

    // Get brand-specific context if businessId is provided
    const {brandData, documents} = businessId
    ? await getBrandContext(businessId, validatedMessages)
    : {};

    // Format the context sections
    const brandContext = formatBrandContext(brandData, documents);
    const currentQuestion = getCurrentQuestion(validatedMessages);

    // Build the final system prompt with security measures
    const dynamicContext = DYNAMIC_CONTEXT_TEMPLATE
      .replace("{brandContext}", brandContext || '')
      .replace("{currentQuestion}", currentQuestion);

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${EXPERTISE_FRAMEWORK}\n\n${dynamicContext}\n\nMensagens antigas: ${validatedMessages[0].content}\n\nResponda de forma natural e sem ser no formato markdown, seja mais sucinto como numa conversa natural`;

    const response = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: validatedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.7,
      maxTokens: 1500,
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
