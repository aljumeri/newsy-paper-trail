-- Create a database function to add subscribers securely
-- This function bypasses RLS and allows direct inserts
CREATE OR REPLACE FUNCTION public.add_subscriber(subscriber_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.subscribers WHERE email = subscriber_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email already exists');
  END IF;

  -- Insert the new subscriber
  INSERT INTO public.subscribers (email)
  VALUES (subscriber_email)
  RETURNING id INTO result;
  
  RETURN jsonb_build_object('success', true, 'subscriber_id', result);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email already exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Grant execute permission to the anonymous role
GRANT EXECUTE ON FUNCTION public.add_subscriber(TEXT) TO anon;

-- Enable Row Level Security on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all subscribers
CREATE POLICY "Allow authenticated users to read subscribers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a simple implementation - you might want to check against an admin table
  -- or specific user attributes in a production environment
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@solo4ai.com'
  );
END;
$$;
