
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
