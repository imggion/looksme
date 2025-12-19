-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tagname TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist)
CREATE POLICY "Allow anyone to insert waitlist" 
  ON public.waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to check if tagname exists (for validation)
CREATE POLICY "Allow anyone to select for validation" 
  ON public.waitlist 
  FOR SELECT 
  USING (true);

-- Create index for faster tagname lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_tagname ON public.waitlist(tagname);
