-- Add new admin email to approved list
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Updated implementation with new admin email
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      email LIKE '%@solo4ai.com' OR
      email = 'aljumeri@gmail.com' OR
      email = 'su.alshehri.ai@gmail.com' OR
      email = 'admin@example.com' OR
      email = 'test@example.com' OR
      email = 'padebayo236@gmail.com'
    )
  );
END;
$$;

-- Fix has_role function if it exists or create it
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _role = 'admin' THEN
    RETURN public.is_admin_user(_user_id);
  ELSE
    -- For other roles, check user_roles table if it exists
    -- This is a simple implementation that could be expanded
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role::text = _role
    );
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, text) TO authenticated;

-- Update subscriber management policy to include new admin
DROP POLICY IF EXISTS "Allow admin users to manage subscribers" ON public.subscribers;
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
      email = 'test@example.com' OR
      email = 'padebayo236@gmail.com'
    )
  ))
); 