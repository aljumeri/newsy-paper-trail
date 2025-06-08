-- Add new columns to newsletters table
ALTER TABLE "public"."newsletters"
ADD COLUMN IF NOT EXISTS "recipients_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed'));

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS "newsletters_status_idx" ON "public"."newsletters" ("status");

-- Update existing newsletters to have default values
UPDATE "public"."newsletters"
SET 
    recipients_count = 0,
    status = CASE 
        WHEN sent_at IS NOT NULL THEN 'sent'
        ELSE 'draft'
    END
WHERE recipients_count IS NULL OR status IS NULL; 