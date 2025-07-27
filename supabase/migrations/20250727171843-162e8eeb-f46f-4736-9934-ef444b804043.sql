-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anonymous sessions table for tracking non-logged-in users
CREATE TABLE public.anonymous_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  video_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Create video processing logs table
CREATE TABLE public.video_processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id UUID REFERENCES public.anonymous_sessions(id) ON DELETE SET NULL,
  file_name TEXT,
  file_size BIGINT,
  processing_type TEXT NOT NULL CHECK (processing_type IN ('transcribe', 'summarize', 'qna', 'social_content')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processing_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user usage stats table
CREATE TABLE public.user_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  video_count INTEGER NOT NULL DEFAULT 0,
  transcription_count INTEGER NOT NULL DEFAULT 0,
  summary_count INTEGER NOT NULL DEFAULT 0,
  qna_count INTEGER NOT NULL DEFAULT 0,
  social_content_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for anonymous sessions (public access for session management)
CREATE POLICY "Anyone can create anonymous sessions" 
ON public.anonymous_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own session" 
ON public.anonymous_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update their own session" 
ON public.anonymous_sessions 
FOR UPDATE 
USING (true);

-- Create policies for video processing logs
CREATE POLICY "Users can view their own logs" 
ON public.video_processing_logs 
FOR SELECT 
USING (auth.uid() = user_id OR anonymous_session_id IS NOT NULL);

CREATE POLICY "Anyone can insert processing logs" 
ON public.video_processing_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update processing logs" 
ON public.video_processing_logs 
FOR UPDATE 
USING (true);

-- Create policies for user usage stats
CREATE POLICY "Users can view their own stats" 
ON public.user_usage_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_usage_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_usage_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_usage_stats_updated_at
  BEFORE UPDATE ON public.user_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to clean up expired anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_sessions 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_anonymous_sessions_session_id ON public.anonymous_sessions(session_id);
CREATE INDEX idx_video_processing_logs_user_id ON public.video_processing_logs(user_id);
CREATE INDEX idx_video_processing_logs_anonymous_session_id ON public.video_processing_logs(anonymous_session_id);
CREATE INDEX idx_video_processing_logs_created_at ON public.video_processing_logs(created_at);
CREATE INDEX idx_user_usage_stats_user_date ON public.user_usage_stats(user_id, date);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);