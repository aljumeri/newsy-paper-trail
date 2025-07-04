-- Add newsletter header fields if they don't exist
ALTER TABLE "public"."newsletters"
ADD COLUMN IF NOT EXISTS "main_title" text,
ADD COLUMN IF NOT EXISTS "sub_title" text,
ADD COLUMN IF NOT EXISTS "date" text;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN "public"."newsletters"."main_title" IS 'Main title of the newsletter (displayed prominently)';
COMMENT ON COLUMN "public"."newsletters"."sub_title" IS 'Subtitle of the newsletter (displayed below main title)';
COMMENT ON COLUMN "public"."newsletters"."date" IS 'Publication date of the newsletter (can be Hijri date)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "newsletters_main_title_idx" ON "public"."newsletters" ("main_title");
CREATE INDEX IF NOT EXISTS "newsletters_date_idx" ON "public"."newsletters" ("date"); 