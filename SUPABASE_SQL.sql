-- Run this in Supabase SQL Editor

-- Add id_type column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS id_type TEXT DEFAULT 'Ghana Card';

-- Make sure all needed columns exist
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS id_front_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS id_back_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS nia_verified BOOLEAN DEFAULT false;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS verification_tier TEXT DEFAULT 'basic';

-- Make sure profiles has is_admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reg_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_organisation BOOLEAN DEFAULT false;

-- Set admin
UPDATE profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'jefferyofosu1@gmail.com');

-- Create storage bucket for ID documents (run once)
-- Go to Supabase Storage → New bucket → "campaign-docs" → Public: YES
