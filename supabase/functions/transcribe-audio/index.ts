
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock transcription function - in a real app you'd use OpenAI Whisper or similar
async function transcribeAudio(audioData: string): Promise<string> {
  // For demo purposes, return a sample transcript
  // In production, you'd integrate with OpenAI Whisper API or similar service
  console.log('Mock transcription for audio data length:', audioData.length);
  
  return `This is a sample transcript generated from the uploaded audio/video content. 
  In this example, we're discussing the importance of transforming ideas into actionable results. 
  The key points covered include: systematic execution, overcoming common obstacles, 
  maintaining momentum, and measuring progress. The content emphasizes practical strategies 
  for turning conceptual thinking into tangible outcomes through disciplined implementation.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioData, url } = await req.json();
    
    console.log('Transcription request:', { 
      hasAudioData: !!audioData, 
      url: url?.substring(0, 50) + '...' 
    });

    let transcript: string;

    if (audioData) {
      // Process uploaded file
      transcript = await transcribeAudio(audioData);
    } else if (url) {
      // Process URL - in production you'd download and transcribe
      transcript = await transcribeAudio(url);
    } else {
      throw new Error('No audio data or URL provided');
    }

    console.log('Generated transcript:', transcript.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ transcript }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
