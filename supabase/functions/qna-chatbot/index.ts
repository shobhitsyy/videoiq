
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function askGemini(transcript: string, question: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not found');
    return null;
  }

  try {
    const prompt = `
    Here's a transcript:
    ---
    ${transcript}
    ---

    Question: ${question}

    Please answer the question based on the transcript. If the information isn't directly available in the transcript,
    you can use your general knowledge but please indicate that you're doing so by starting with "Based on general knowledge:"
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

async function askGroq(transcript: string, question: string): Promise<string | null> {
  if (!GROQ_API_KEY) {
    console.log('Groq API key not found');
    return null;
  }

  try {
    const prompt = `
    Here's a transcript:
    ---
    ${transcript}
    ---

    Question: ${question}

    Please answer the question based on the transcript. If the information isn't directly available in the transcript,
    you can use your general knowledge but please indicate that you're doing so by starting with "Based on general knowledge:"
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, question, preferredProvider } = await req.json();
    
    console.log('Q&A request:', { 
      transcriptLength: transcript?.length,
      question: question?.substring(0, 50) + '...',
      preferredProvider 
    });

    if (!transcript || !question) {
      throw new Error('Transcript and question are required');
    }

    let answer = null;
    let usedProvider = '';

    if (preferredProvider === 'gemini') {
      console.log('Using Gemini API (manual mode)...');
      answer = await askGemini(transcript, question);
      usedProvider = 'gemini';
    } else if (preferredProvider === 'groq') {
      console.log('Using Groq API (manual mode)...');
      answer = await askGroq(transcript, question);
      usedProvider = 'groq';
    } else {
      // Fallback mode: try Gemini first, then Groq
      console.log('Trying Gemini API...');
      answer = await askGemini(transcript, question);
      
      if (answer) {
        console.log('Response from Gemini');
        usedProvider = 'gemini';
      } else {
        console.log('Gemini failed, trying Groq API as fallback...');
        answer = await askGroq(transcript, question);
        if (answer) {
          console.log('Response from Groq (fallback)');
          usedProvider = 'groq';
        }
      }
    }

    if (!answer) {
      throw new Error('Both AI providers failed to generate an answer');
    }

    return new Response(
      JSON.stringify({ 
        answer,
        provider: usedProvider,
        question 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in qna-chatbot function:', error);
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
