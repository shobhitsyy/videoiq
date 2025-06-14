
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `${prompt}\n\nTranscript:\n${transcript}`
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Anthropic API error for ${platform}:`, errorText);
        throw new Error(`Failed to generate content for ${platform}: ${errorText}`);
      }

      const data = await response.json();
      generatedContent[platform] = data.content[0].text;
      
      console.log(`Generated content for ${platform}:`, data.content[0].text.substring(0, 100) + '...');
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
