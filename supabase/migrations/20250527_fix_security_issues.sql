-- Fix the search_path parameter for admin functions to prevent SQL injection
-- This addresses the "Function Search Path Mutable" security warning

-- Fix create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the user into the admin_users table if they don't already exist
  INSERT INTO public.admin_users (id)
  VALUES (user_id)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Fix get_admin_status function
CREATE OR REPLACE FUNCTION public.get_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = user_id
  );
END;
$$;

-- Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This is a simple implementation - you might want to check against an admin table
  -- or specific user attributes in a production environment
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      email LIKE '%@solo4ai.com' OR
      email = 'aljumeri@gmail.com' OR
      email = 'su.alshehri.ai@gmail.com' OR
      email = 'admin@example.com' OR
      email = 'test@example.com'
    )
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- Enable leaked password protection in Auth settings
-- This addresses the "Leaked Password Protection Disabled" warning
-- Note: This change must also be made in the Supabase dashboard under Auth settings
-- or via the Supabase API as SQL migrations can't directly modify auth settings 