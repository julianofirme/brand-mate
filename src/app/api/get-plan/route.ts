import { NextResponse } from 'next/server'
import { db } from '@/db'
import { plans } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID do plano não fornecido' }, { status: 400 })
  }

  try {
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1)

    if (!plan[0]) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Parse o conteúdo do plano
    const content = JSON.parse(plan[0].content)
    
    // Retorna no formato esperado pelo frontend
    return NextResponse.json({
      plan: content.marketingPlan
    })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json({ error: 'Erro ao buscar o plano' }, { status: 500 })
  }
}