import { NextRequest, NextResponse } from 'next/server'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { storeDocumentInVectorDB } from '@/lib/vector-store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create a temporary Blob from the buffer
    const blob = new Blob([buffer], { type: 'application/pdf' })

    // Load and process the PDF
    const loader = new PDFLoader(blob)
    const docs = await loader.load()

    // Generate a unique ID for this business document set
    const businessId = uuidv4();

    // Store documents in vector database
    await storeDocumentInVectorDB(docs, businessId);

    return NextResponse.json({ 
      businessId // Return the businessId to be used in plan generation
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 })
  }
}
