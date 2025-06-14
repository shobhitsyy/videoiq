
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function summarizeWithGemini(transcript: string, metadata: any): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not found');
    return null;
  }

  try {
    const prompt = `
    Analyze this transcript and provide:

    1. A comprehensive summary (3-4 paragraphs) covering the main content
    2. Key takeaways as bullet points (5-8 important points)

    Title: ${metadata.title || 'Unknown'} (${metadata.duration || 'Unknown duration'})

    Transcript:
    ${transcript}

    Format response as:
    SUMMARY:
    [Summary text]

    KEY POINTS:
    • [Point 1]
    • [Point 2]
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
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini summarization failed:', error);
    return null;
  }
}

async function summarizeWithGroq(transcript: string, metadata: any): Promise<string | null> {
  if (!GROQ_API_KEY) {
    console.log('Groq API key not found');
    return null;
  }

  try {
    const prompt = `
    Analyze this transcript and create:

    1. A detailed summary (3-4 paragraphs) that captures the essence and main flow
    2. Key insights as bullet points (5-8 most important takeaways)

    Title: "${metadata.title || 'Unknown'}" (${metadata.duration || 'Unknown duration'})

    Transcript:
    ${transcript}

    Response format:
    SUMMARY:
    [Your comprehensive summary]

    KEY POINTS:
    • [Key insight 1]
    • [Key insight 2]
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
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq summarization failed:', error);
    return null;
  }
}

function parseAIResponse(responseText: string): { summary: string; keyPoints: string[] } {
  try {
    const sections = responseText.split('\n');
    let summary = "";
    const keyPoints: string[] = [];
    let currentSection: string | null = null;

    for (const line of sections) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.toUpperCase().includes('SUMMARY') || trimmedLine.toUpperCase().includes('OVERVIEW')) {
        currentSection = 'summary';
        continue;
      } else if (trimmedLine.toUpperCase().includes('KEY POINTS') || trimmedLine.toUpperCase().includes('TAKEAWAYS')) {
        currentSection = 'points';
        continue;
      }

      if (currentSection === 'summary') {
        summary += trimmedLine + " ";
      } else if (currentSection === 'points') {
        const cleanPoint = trimmedLine.replace(/^[•\-\*\d+\.]\s*/, '');
        if (cleanPoint) {
          keyPoints.push(cleanPoint);
        }
      }
    }

    // Fallback parsing
    if (!summary && !keyPoints.length) {
      const lines = responseText.split('\n');
      const summaryLines: string[] = [];
      const pointLines: string[] = [];
      let isPointsSection = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          isPointsSection = true;
          const cleanPoint = trimmedLine.replace(/^[•\-\*]\s*/, '');
          if (cleanPoint) {
            pointLines.push(cleanPoint);
          }
        } else if (!isPointsSection && trimmedLine) {
          summaryLines.push(trimmedLine);
        }
      }

      summary = summaryLines.join(' ');
      keyPoints.push(...pointLines);
    }

    return { summary: summary.trim(), keyPoints };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return { summary: responseText.substring(0, 500) + "...", keyPoints: [] };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, metadata, preferredProvider } = await req.json();
    
    console.log('Summarization request:', { 
      transcriptLength: transcript?.length,
      preferredProvider,
      metadata: metadata?.title 
    });

    if (!transcript) {
      throw new Error('No transcript provided');
    }

    let result = null;
    const providers = preferredProvider === 'groq' ? ['groq', 'gemini'] : ['gemini', 'groq'];
    
    for (const provider of providers) {
      console.log(`Trying ${provider.toUpperCase()}...`);
      
      if (provider === 'gemini') {
        result = await summarizeWithGemini(transcript, metadata || {});
      } else if (provider === 'groq') {
        result = await summarizeWithGroq(transcript, metadata || {});
      }
      
      if (result) {
        console.log(`Success with ${provider.toUpperCase()}`);
        break;
      }
    }

    if (!result) {
      throw new Error('All AI providers failed to generate summary');
    }

    const { summary, keyPoints } = parseAIResponse(result);

    return new Response(
      JSON.stringify({ 
        summary,
        keyPoints,
        provider: providers[0] // The successful provider
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in summarize-content function:', error);
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
