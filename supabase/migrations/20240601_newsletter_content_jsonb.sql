-- Ensure the 'content' column exists and is of type JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='newsletters' AND column_name='content'
  ) THEN
    ALTER TABLE public.newsletters ADD COLUMN content JSONB;
  ELSE
    BEGIN
      ALTER TABLE public.newsletters ALTER COLUMN content TYPE JSONB USING content::jsonb;
    EXCEPTION WHEN others THEN
      -- If conversion fails, drop and recreate as JSONB (data loss warning)
      ALTER TABLE public.newsletters DROP COLUMN content;
      ALTER TABLE public.newsletters ADD COLUMN content JSONB;
    END;
  END IF;
END $$; 