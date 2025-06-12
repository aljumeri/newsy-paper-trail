-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS "public"."subscribers";

-- Create the subscribers table
CREATE TABLE "public"."subscribers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "vendor" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscribers_email_key" UNIQUE ("email")
);

-- Create index on email for faster lookups
CREATE INDEX "subscribers_email_idx" ON "public"."subscribers" ("email");

-- Enable Row Level Security
ALTER TABLE "public"."subscribers" ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create a policy for public subscription
CREATE POLICY "Enable insert for public subscription"
ON "public"."subscribers"
FOR INSERT
TO anon
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON "public"."subscribers" TO authenticated;
GRANT ALL ON "public"."subscribers" TO service_role;
GRANT INSERT ON "public"."subscribers" TO anon;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON "public"."subscribers"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 