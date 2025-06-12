-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."subscribers";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."subscribers";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."subscribers";

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on subscribers table
ALTER TABLE "public"."subscribers" ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Enable read access for admins"
ON "public"."subscribers"
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Enable insert for admins"
ON "public"."subscribers"
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Enable delete for admins"
ON "public"."subscribers"
FOR DELETE
TO authenticated
USING (is_admin());

-- Create sequence if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'subscribers_id_seq') THEN
    CREATE SEQUENCE public.subscribers_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON "public"."subscribers" TO authenticated;
GRANT USAGE ON SEQUENCE "public"."subscribers_id_seq" TO authenticated;

-- Create a trigger to automatically set created_at
CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_subscribers_created_at ON "public"."subscribers";
CREATE TRIGGER set_subscribers_created_at
  BEFORE INSERT ON "public"."subscribers"
  FOR EACH ROW
  EXECUTE FUNCTION set_created_at(); 