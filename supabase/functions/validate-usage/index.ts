import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UsageRequest {
  sessionId?: string;
  userId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, userId }: UsageRequest = await req.json();

    // Authenticated users have unlimited access
    if (userId) {
      return new Response(
        JSON.stringify({ 
          canProcess: true, 
          videosProcessed: 0, 
          videosRemaining: Infinity 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Anonymous users - check session limit
    if (sessionId) {
      const { data: session, error } = await supabaseClient
        .from('anonymous_sessions')
        .select('video_count')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching session:', error);
        throw error;
      }

      const videoCount = session?.video_count || 0;
      const canProcess = videoCount < 3;
      const videosRemaining = Math.max(0, 3 - videoCount);

      return new Response(
        JSON.stringify({ 
          canProcess, 
          videosProcessed: videoCount, 
          videosRemaining 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        canProcess: true, 
        videosProcessed: 0, 
        videosRemaining: 3 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in validate-usage function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});