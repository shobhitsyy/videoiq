import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { sessionId, processingType, fileName, fileSize } = await req.json();
    
    // Get user from auth header
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
      // Authenticated user - track in user_usage_stats and video_processing_logs
      const today = new Date().toISOString().split('T')[0];
      
      // Update user usage stats
      const { error: statsError } = await supabaseClient
        .from('user_usage_stats')
        .upsert({
          user_id: user.id,
          date: today,
          video_count: 1, // This will be incremented in the database
          [`${processingType}_count`]: 1
        }, {
          onConflict: 'user_id,date'
        });

      if (statsError) {
        console.error('Error updating user stats:', statsError);
      }

      // Log the processing
      const { error: logError } = await supabaseClient
        .from('video_processing_logs')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_size: fileSize,
          processing_type: processingType,
          status: 'pending'
        });

      if (logError) {
        console.error('Error logging processing:', logError);
      }

      return new Response(
        JSON.stringify({ success: true, canProceed: true, unlimited: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Anonymous user - check session limits
      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('anonymous_sessions')
        .select('video_count')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Error checking session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const currentCount = sessionData?.video_count || 0;
      
      if (currentCount >= 3) {
        return new Response(
          JSON.stringify({ success: false, canProceed: false, videosRemaining: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update session count
      const newCount = currentCount + 1;
      const { error: updateError } = await supabaseClient
        .from('anonymous_sessions')
        .upsert({
          session_id: sessionId,
          video_count: newCount,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });

      if (updateError) {
        console.error('Error updating session:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the processing
      const { data: sessionRecord } = await supabaseClient
        .from('anonymous_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (sessionRecord) {
        await supabaseClient
          .from('video_processing_logs')
          .insert({
            anonymous_session_id: sessionRecord.id,
            file_name: fileName,
            file_size: fileSize,
            processing_type: processingType,
            status: 'pending'
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          canProceed: true, 
          videosUsed: newCount,
          videosRemaining: 3 - newCount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in track-usage function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});