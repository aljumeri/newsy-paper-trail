-- Add unsubscribe_token column to subscribers table
ALTER TABLE "public"."subscribers"
ADD COLUMN IF NOT EXISTS "unsubscribe_token" text;

-- Create index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS "subscribers_unsubscribe_token_idx" ON "public"."subscribers" ("unsubscribe_token");

-- Update existing subscribers to have a token
UPDATE "public"."subscribers"
SET unsubscribe_token = encode(gen_random_bytes(32), 'hex')
WHERE unsubscribe_token IS NULL; 