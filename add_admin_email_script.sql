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