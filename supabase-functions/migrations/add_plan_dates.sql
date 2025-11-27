-- SQL Migration: Update payment_details table to include plan dates
-- Run this in your Supabase SQL Editor

-- Add new columns to payment_details table if they don't exist
ALTER TABLE payment_details 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'premium_monthly',
ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payer_name TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_details_user_status ON payment_details(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_details_plan_dates ON payment_details(plan_started_at, plan_ends_at);

-- Update existing records to have plan dates (if any exist)
UPDATE payment_details 
SET 
  plan_started_at = created_at,
  plan_ends_at = created_at + INTERVAL '1 month',
  updated_at = NOW()
WHERE plan_started_at IS NULL AND status = 'completed';

-- Add comment to table
COMMENT ON COLUMN payment_details.plan_type IS 'Type of subscription plan (e.g., premium_monthly)';
COMMENT ON COLUMN payment_details.plan_started_at IS 'When the subscription plan started';
COMMENT ON COLUMN payment_details.plan_ends_at IS 'When the subscription plan ends/renews';
COMMENT ON COLUMN payment_details.payer_name IS 'Name of the person who made the payment';

-- Ensure profiles table has the necessary columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_renews_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.plan_renews_at IS 'When the current plan will renew or expire';
