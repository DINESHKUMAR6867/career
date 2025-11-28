-- SQL Migration: Add Credit System for NetworkNote
-- This migration implements a credit-based system where:
-- 1. Each successful payment grants 3 credits
-- 2. Each recording creation consumes 1 credit
-- 3. Users cannot create recordings when credits = 0
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Add credits_remaining column to profiles
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS credits_remaining integer NOT NULL DEFAULT 0;

-- Add index for faster queries on credits
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON public.profiles(credits_remaining);

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.credits_remaining IS 'Number of remaining recording credits. Each payment grants 3 credits, each recording consumes 1 credit.';

-- =====================================================
-- STEP 2: Create trigger to grant 3 credits on payment success
-- =====================================================

-- Function to grant credits when payment is completed
CREATE OR REPLACE FUNCTION grant_credits_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only grant credits when payment status changes to 'completed'
  -- Check both that NEW status is 'completed' AND OLD status was not 'completed'
  -- This prevents duplicate credit grants if the row is updated again
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Add 3 credits to the user's profile
    UPDATE public.profiles
    SET 
      credits_remaining = credits_remaining + 3,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Log the credit grant (optional, for debugging)
    RAISE NOTICE 'Granted 3 credits to user % for payment %', NEW.user_id, NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on payment_details table
DROP TRIGGER IF EXISTS payment_completed_grant_credits ON public.payment_details;

CREATE TRIGGER payment_completed_grant_credits
AFTER UPDATE ON public.payment_details
FOR EACH ROW
EXECUTE FUNCTION grant_credits_on_payment();

-- Add comment to document the trigger
COMMENT ON TRIGGER payment_completed_grant_credits ON public.payment_details IS 'Automatically grants 3 credits to user when payment status changes to completed';

-- =====================================================
-- STEP 3: Create trigger to consume 1 credit on recording creation
-- =====================================================

-- Function to consume credits when a recording is created
CREATE OR REPLACE FUNCTION consume_credit_on_recording()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_credits integer;
BEGIN
  -- Get user_id from the job_request that this recording belongs to
  SELECT user_id INTO v_user_id
  FROM public.job_requests
  WHERE id = NEW.job_request_id;
  
  -- If we couldn't find the user_id, raise an error
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot create recording: job_request_id % not found', NEW.job_request_id;
  END IF;
  
  -- Get current credits for this user
  SELECT credits_remaining INTO v_credits
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Check if user has sufficient credits
  IF v_credits IS NULL OR v_credits <= 0 THEN
    RAISE EXCEPTION 'Insufficient credits. You need to purchase more credits to create a recording. Current credits: %', COALESCE(v_credits, 0)
      USING HINT = 'Please visit the billing page to purchase a credit pack.';
  END IF;
  
  -- Consume 1 credit
  UPDATE public.profiles
  SET 
    credits_remaining = credits_remaining - 1,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Log the credit consumption (optional, for debugging)
  RAISE NOTICE 'Consumed 1 credit for user %. Remaining credits: %', v_user_id, v_credits - 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on recordings table
DROP TRIGGER IF EXISTS recording_consume_credit ON public.recordings;

CREATE TRIGGER recording_consume_credit
BEFORE INSERT ON public.recordings
FOR EACH ROW
EXECUTE FUNCTION consume_credit_on_recording();

-- Add comment to document the trigger
COMMENT ON TRIGGER recording_consume_credit ON public.recordings IS 'Automatically consumes 1 credit when a recording is created. Blocks creation if credits = 0.';

-- =====================================================
-- STEP 4: Optional - Grant initial credits to existing users
-- =====================================================

-- Uncomment the following if you want to grant credits to existing premium users
-- This is optional and depends on your business requirements

/*
UPDATE public.profiles
SET credits_remaining = 3
WHERE plan_tier = 'premium' 
  AND plan_status = 'active'
  AND credits_remaining = 0;
*/

-- =====================================================
-- STEP 5: Create helper function to check user credits
-- =====================================================

-- This function can be called from the frontend to check credits before recording
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_credits integer;
BEGIN
  SELECT credits_remaining INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_credits(uuid) TO authenticated;

COMMENT ON FUNCTION get_user_credits(uuid) IS 'Returns the number of remaining credits for a user';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these queries after migration to verify everything is set up correctly:

-- 1. Check if credits_remaining column exists
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'credits_remaining';

-- 2. Check if triggers exist
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name IN ('payment_completed_grant_credits', 'recording_consume_credit');

-- 3. Check if functions exist
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name IN ('grant_credits_on_payment', 'consume_credit_on_recording', 'get_user_credits');

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

-- Uncomment and run these commands if you need to rollback this migration:

/*
-- Drop triggers
DROP TRIGGER IF EXISTS payment_completed_grant_credits ON public.payment_details;
DROP TRIGGER IF EXISTS recording_consume_credit ON public.recordings;

-- Drop functions
DROP FUNCTION IF EXISTS grant_credits_on_payment();
DROP FUNCTION IF EXISTS consume_credit_on_recording();
DROP FUNCTION IF EXISTS get_user_credits(uuid);

-- Drop column (WARNING: This will delete all credit data)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS credits_remaining;

-- Drop index
DROP INDEX IF EXISTS idx_profiles_credits;
*/
