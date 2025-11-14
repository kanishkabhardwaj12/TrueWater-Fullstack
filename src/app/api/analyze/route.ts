import { NextResponse } from 'next/server';
// We use the @ alias to point to src/
import { getAlgaeInsightFlow } from '@/ai/dev'; 

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Send image to Python Microservice
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);
    
    // Ensure your Python server is running on port 8000!
    const pythonResponse = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python model error: ${pythonResponse.statusText}`);
    }

    const algaeCounts = await pythonResponse.json();
    
    // 2. Send data to Genkit AI
    // We call the flow function directly.
    const aiInsight = await getAlgaeInsightFlow(algaeCounts);

    return NextResponse.json({
      counts: algaeCounts,
      insight: aiInsight,
    });

  } catch (error: any) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}