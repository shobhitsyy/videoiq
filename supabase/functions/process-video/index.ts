
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, platforms, style } = await req.json();
    
    console.log('Processing request:', { transcript: transcript?.substring(0, 100) + '...', platforms, style });

    if (!transcript || !platforms || platforms.length === 0) {
      throw new Error('Missing required parameters: transcript and platforms');
    }

    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key not configured. Please add GOOGLE_API_KEY to your Supabase secrets.');
    }

    // Create platform-specific prompts
    const platformPrompts = {
      blog: `Create a comprehensive blog article based on this transcript. Make it engaging, well-structured with headings, and suitable for a blog audience. Style: ${style}`,
      twitter: `Create a Twitter thread (max 280 chars per tweet) based on this transcript. Use engaging hooks and numbered tweets. Style: ${style}`,
      linkedin: `Create a professional LinkedIn post based on this transcript. Make it engaging for a professional audience with relevant hashtags. Style: ${style}`,
      instagram: `Create an Instagram caption based on this transcript. Include emojis, engaging copy, and relevant hashtags. Style: ${style}`
    };

    const generatedContent: Record<string, string> = {};

    // Generate content for each platform
    for (const platform of platforms) {
      const prompt = platformPrompts[platform as keyof typeof platformPrompts];
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${prompt}\n\nTranscript:\n${transcript}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Google API error for ${platform}:`, errorData);
          
          // Check for specific error types
          if (errorData.error?.message?.includes('quota') || 
              errorData.error?.message?.includes('limit')) {
            throw new Error('Google API quota exceeded. Please check your API limits at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com');
          }
          
          throw new Error(`Failed to generate content for ${platform}: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        generatedContent[platform] = data.candidates[0].content.parts[0].text;
        
        console.log(`Generated content for ${platform}:`, data.candidates[0].content.parts[0].text.substring(0, 100) + '...');
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        // If one platform fails, continue with others but include error info
        generatedContent[platform] = `Error generating content for ${platform}: ${error.message}`;
      }
    }

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in process-video function:', error);
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
