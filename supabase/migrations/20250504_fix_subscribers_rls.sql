-- Enable Row Level Security on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow anonymous users to insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow admin users to manage subscribers" ON public.subscribers;

-- Create policy to allow authenticated users to read all subscribers
CREATE POLICY "Allow authenticated users to read subscribers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow anonymous users to insert subscribers
CREATE POLICY "Allow anonymous users to insert subscribers"
ON public.subscribers
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to insert subscribers
CREATE POLICY "Allow authenticated users to insert subscribers"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow admin users to manage subscribers (update, delete)
CREATE POLICY "Allow admin users to manage subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (
  (SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      email LIKE '%@solo4ai.com' OR
      email = 'aljumeri@gmail.com' OR
      email = 'su.alshehri.ai@gmail.com' OR
      email = 'admin@example.com' OR
      email = 'test@example.com'
    )
  ))
); 