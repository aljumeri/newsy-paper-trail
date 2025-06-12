-- Drop the column if it exists to start fresh
ALTER TABLE "public"."subscribers" DROP COLUMN IF EXISTS "unsubscribe_token";

-- Add unsubscribe_token column with NOT NULL constraint
ALTER TABLE "public"."subscribers"
ADD COLUMN "unsubscribe_token" text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');

-- Create index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS "subscribers_unsubscribe_token_idx" ON "public"."subscribers" ("unsubscribe_token");

-- Remove the default after adding the column
ALTER TABLE "public"."subscribers" ALTER COLUMN "unsubscribe_token" DROP DEFAULT; 