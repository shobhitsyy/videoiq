
-- Create a table for reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) to ensure data security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read reviews (public reviews)
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to create reviews
CREATE POLICY "Anyone can create reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for the reviews table so new reviews appear instantly
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.reviews;
