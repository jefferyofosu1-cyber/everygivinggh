-- Enable RLS on campaigns table and allow public read access to approved campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for approved campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view all approved campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Enable select for all users" ON public.campaigns;

-- Create policy allowing anyone (authenticated or anon) to read approved/active/live campaigns
CREATE POLICY "Enable select for all users on public campaigns"
  ON public.campaigns
  FOR SELECT
  USING (status IN ('approved', 'active', 'live'));

-- Allow authenticated users to insert/update their own campaigns
CREATE POLICY "Users can create and manage their own campaigns"
  ON public.campaigns
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
