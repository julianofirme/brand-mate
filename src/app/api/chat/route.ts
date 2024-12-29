import { NextRequest, NextResponse } from 'next/server'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { AIMessage, HumanMessage } from '@langchain/core/messages'

const model = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama2",
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const chatHistory = messages.map((msg: { role: string; content: string }) =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    )

    const response = await model.call(chatHistory)

    return NextResponse.json({ response: response.content })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Error in chat' }, { status: 500 })
  }
}

