-- Remove unsubscribe_token column as we'll use email-only unsubscribe
ALTER TABLE subscribers DROP COLUMN IF EXISTS unsubscribe_token; 