import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { plans } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'
import { generateOutput, generatePrompt, searchVectorDB } from '@/lib/generate-plan'
import { Document } from 'langchain/document'

async function generateMarketingPlan(businessData: any) {
  const resumo = `${businessData.negocio} é uma empresa no segmento de ${businessData.segmento} focada em ${businessData.publicoAlvo}. Seu objetivo principal é ${businessData.objetivos}, com um orçamento mensal de ${businessData.orcamento}.`

  // Helper function to process AI responses with vector search context
  const processAIResponse = async (section: string, prompt: string) => {
    try {
      // Get relevant context from vector store if businessId exists
      let contextDocs: Document[] = [];
      if (businessData.businessId) {
        contextDocs = await searchVectorDB(businessData.businessId, `${section} ${businessData.segmento} ${businessData.publicoAlvo}`);
      }

      const formattedPrompt = await generatePrompt(contextDocs, `Para ${businessData.negocio}, gere exatamente 4 estratégias de ${section}. 
      Para cada estratégia, use o formato exato:
      
      **Estratégia 1:** [título da estratégia]
      [descrição detalhada]
      
      **Estratégia 2:** [título da estratégia]
      [descrição detalhada]
      
      E assim por diante.
      
      Informações importantes:
      ${prompt}`);

      const response = await generateOutput(formattedPrompt);
      
      if (!response) {
        throw new Error(`Failed to generate content for ${section}`);
      }

      // Split by strategy headers and remove empty entries
      const topics = String(response)
        .split(/(?=\*\*Estratégia \d+:)/)
        .filter(topic => topic.trim().length > 0)
        .map(topic => topic.trim());

      // Validate that we have exactly 4 strategies
      if (topics.length !== 4) {
        console.warn(`Warning: Expected 4 strategies for ${section}, got ${topics.length}`);
        // Pad or trim the array to exactly 4 items
        while (topics.length < 4) {
          topics.push(`**Estratégia ${topics.length + 1}:** Estratégia adicional para ${section}`);
        }
        if (topics.length > 4) {
          topics.length = 4;
        }
      }
      
      return topics;
    } catch (error) {
      console.error(`Error processing ${section}:`, error);
      // Return fallback content in case of error
      return [
        `**Estratégia 1:** Estratégia padrão para ${section}`,
        `**Estratégia 2:** Estratégia padrão para ${section}`,
        `**Estratégia 3:** Estratégia padrão para ${section}`,
        `**Estratégia 4:** Estratégia padrão para ${section}`
      ];
    }
  };

  // Generate AI content for each section with optimized prompts
  const [socialMedia, campanhasPagas, contentMarketing, emailMarketing, kpis] = await Promise.all([
    processAIResponse('social media', `
      - Segmento: ${businessData.segmento}
      - Público-alvo: ${businessData.publicoAlvo}
      - Foque em estratégias mensuráveis e acionáveis
      - Inclua táticas específicas para cada rede social relevante
      - Considere o tom de voz e personalidade da marca
      - Priorize engajamento e conversão`),

    processAIResponse('campanhas pagas', `
      - Orçamento mensal: ${businessData.orcamento}
      - Segmento: ${businessData.segmento}
      - Público-alvo: ${businessData.publicoAlvo}
      - Especifique plataformas e tipos de anúncios
      - Inclua métricas de ROI esperado
      - Foque em estratégias de conversão e otimização`),

    processAIResponse('marketing de conteúdo', `
      - Segmento: ${businessData.segmento}
      - Público-alvo: ${businessData.publicoAlvo}
      - Objetivos: ${businessData.objetivos}
      - Priorize conteúdo que gere autoridade no setor
      - Inclua diferentes formatos de conteúdo
      - Foque em estratégias de SEO e distribuição`),

    processAIResponse('email marketing', `
      - Segmento: ${businessData.segmento}
      - Público-alvo: ${businessData.publicoAlvo}
      - Inclua estratégias de segmentação e personalização
      - Especifique jornadas de email específicas
      - Foque em automação e nurturing
      - Considere métricas de engajamento e conversão`),

    processAIResponse('KPIs', `
      - Segmento: ${businessData.segmento}
      - Objetivos principais: ${businessData.objetivos}
      - Orçamento disponível: ${businessData.orcamento}
      - Inclua métricas de diferentes canais
      - Defina metas numéricas específicas
      - Estabeleça prazos claros para cada KPI`)
  ]);

  return {
    resumoNegocio: resumo,
    socialMedia: socialMedia,
    campanhasPagas: campanhasPagas,
    contentMarketing: contentMarketing,
    emailMarketing: emailMarketing,
    kpis: kpis
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, businessData } = await req.json()

    // Gerar o plano de marketing
    const marketingPlan = await generateMarketingPlan(businessData)

    // Salvar no banco
    const plan = await db.insert(plans).values({
      id: uuidv4(),
      title,
      content: JSON.stringify({
        businessData,
        marketingPlan
      }),
      status: 'completed'
    }).returning()

    return NextResponse.json(plan[0])
  } catch (error) {
    console.error('Error generating plan:', error)
    return NextResponse.json({ error: 'Error generating plan' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const planId = url.searchParams.get('planId') ?? ""

  try {
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1)
    
    if (!plan[0]) {
      return NextResponse.json(null)
    }

    const content = JSON.parse(plan[0].content)
    return NextResponse.json({
      id: plan[0].id,
      plan: content.marketingPlan
    })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json({ error: 'Error fetching plan' }, { status: 500 })
  }
}