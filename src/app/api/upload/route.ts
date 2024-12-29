import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const loadAndSplitTheDocs = async (file_path: string) => {
  // load the uploaded file data
  const loader = new PDFLoader(file_path);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
  });
  const allSplits = await textSplitter.splitDocuments(docs);
  return allSplits;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer())
    const tempFilePath = path.join(process.cwd(), 'tmp', pdfFile.name)

    await fs.mkdir(path.dirname(tempFilePath), { recursive: true })
    await fs.writeFile(tempFilePath, buffer)

    const sessionId = uuidv4()
    await loadAndSplitTheDocs(tempFilePath)

    await fs.unlink(tempFilePath)

    return NextResponse.json({ 
      sessionId,
      message: 'PDF processed successfully' 
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 })
  }
}
