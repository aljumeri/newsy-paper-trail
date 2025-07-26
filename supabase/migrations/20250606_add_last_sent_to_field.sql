-- Add field to track how many subscribers received the newsletter when it was last sent
ALTER TABLE "public"."newsletters"
ADD COLUMN IF NOT EXISTS "last_sent_to" integer DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "newsletters_last_sent_to_idx" ON "public"."newsletters" ("last_sent_to");

-- Update existing newsletters to set last_sent_to based on recipients_count
UPDATE "public"."newsletters"
SET last_sent_to = recipients_count
WHERE sent_at IS NOT NULL AND last_sent_to = 0; 