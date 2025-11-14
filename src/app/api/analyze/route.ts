import { NextResponse } from 'next/server';
import { getAlgaeInsight } from '@/ai/actions';

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
      const errorText = await pythonResponse.text();
      throw new Error(`Python model error: ${pythonResponse.statusText} - ${errorText}`);
    }

    const algaeCounts = await pythonResponse.json();

    if (algaeCounts.status === 'error') {
      throw new Error(`Python analysis failed: ${algaeCounts.message}`);
    }

    // 2. Send data to our new Genkit Server Action
    const aiInsight = await getAlgaeInsight(algaeCounts);

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
