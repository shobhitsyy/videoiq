import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface UsageTracking {
  canProcessVideo: boolean;
  videosProcessed: number;
  videosRemaining: number;
  isLoading: boolean;
  trackVideoProcessing: () => Promise<boolean>;
}

export const useUsageTracking = (): UsageTracking => {
  const { user } = useAuth();
  const [videosProcessed, setVideosProcessed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate or retrieve session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('videoiq_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('videoiq_session_id', sessionId);
    }
    return sessionId;
  };

  const loadUsageData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // For authenticated users, count today's videos
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('user_usage_stats')
          .select('video_count')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user usage:', error);
        }
        setVideosProcessed(data?.video_count || 0);
      } else {
        // For anonymous users, check session
        const sessionId = getSessionId();
        const { data, error } = await supabase
          .from('anonymous_sessions')
          .select('video_count')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading anonymous usage:', error);
        }
        setVideosProcessed(data?.video_count || 0);
      }
    } catch (error) {
      console.error('Error in loadUsageData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackVideoProcessing = async (): Promise<boolean> => {
    try {
      if (user) {
        // For authenticated users - unlimited usage
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
          .from('user_usage_stats')
          .upsert({
            user_id: user.id,
            date: today,
            video_count: videosProcessed + 1
          }, {
            onConflict: 'user_id,date'
          });

        if (error) {
          console.error('Error updating user usage:', error);
          return false;
        }
        setVideosProcessed(prev => prev + 1);
        return true;
      } else {
        // For anonymous users - check 3 video limit
        if (videosProcessed >= 3) {
          return false;
        }

        const sessionId = getSessionId();
        const { error } = await supabase
          .from('anonymous_sessions')
          .upsert({
            session_id: sessionId,
            video_count: videosProcessed + 1,
            last_used_at: new Date().toISOString()
          }, {
            onConflict: 'session_id'
          });

        if (error) {
          console.error('Error updating anonymous usage:', error);
          return false;
        }
        setVideosProcessed(prev => prev + 1);
        return true;
      }
    } catch (error) {
      console.error('Error in trackVideoProcessing:', error);
      return false;
    }
  };

  useEffect(() => {
    loadUsageData();
  }, [user]);

  const canProcessVideo = user ? true : videosProcessed < 3;
  const videosRemaining = user ? Infinity : Math.max(0, 3 - videosProcessed);

  return {
    canProcessVideo,
    videosProcessed,
    videosRemaining,
    isLoading,
    trackVideoProcessing,
  };
};