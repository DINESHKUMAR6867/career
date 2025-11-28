-- =====================================================
-- DEPLOYMENT INSTRUCTIONS FOR CREDIT SYSTEM
-- =====================================================

/**
 * This guide explains how to deploy the credit system to your Supabase database.
 * 
 * IMPORTANT: Run these SQL commands in the Supabase SQL Editor in the exact order shown below.
 */

-- =====================================================
-- STEP 1: Run the main migration
-- =====================================================

/**
 * Navigate to your Supabase Dashboard:
 * 1. Go to https://app.supabase.com
 * 2. Select your project
 * 3. Go to the SQL Editor
 * 4. Open `supabase-functions/migrations/add_credits_system.sql`
 * 5. Copy and paste the content into the SQL Editor and run it.
 */

-- =====================================================
-- STEP 1.1: Fix the Payment Trigger (CRITICAL)
-- =====================================================

/**
 * 1. Open `supabase-functions/migrations/fix_credits_trigger.sql`
 * 2. Copy and paste the content into the SQL Editor and run it.
 *    (This ensures credits are granted correctly when payments are inserted)
 */

-- =====================================================
-- STEP 1.2: Set Default Credits to 3 (CRITICAL)
-- =====================================================

/**
 * 1. Open `supabase-functions/migrations/set_default_credits_to_3.sql`
 * 2. Copy and paste the content into the SQL Editor and run it.
 *    (This ensures new users start with 3 credits automatically)
 */
 * 3. Click on "SQL Editor" in the left sidebar
 * 4. Click "New Query"
 * 5. Copy and paste the ENTIRE contents of `add_credits_system.sql`
 * 6. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
 * 
 * Expected result: You should see "Success. No rows returned" message
 */

-- =====================================================
-- STEP 2: Verify the migration
-- =====================================================

-- Run these verification queries one by one to ensure everything is set up correctly:

-- 2.1: Check if credits_remaining column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'credits_remaining';
-- Expected: Should return 1 row showing the column details

-- 2.2: Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('payment_completed_grant_credits', 'recording_consume_credit');
-- Expected: Should return 2 rows (one for each trigger)

-- 2.3: Check if functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('grant_credits_on_payment', 'consume_credit_on_recording', 'get_user_credits');
-- Expected: Should return 3 rows (one for each function)

-- =====================================================
-- STEP 3: Test the credit system
-- =====================================================

-- 3.1: Grant test credits to a user (replace 'YOUR_USER_ID' with an actual user ID from auth.users)
UPDATE public.profiles
SET credits_remaining = 3
WHERE id = 'YOUR_USER_ID';

-- 3.2: Check the user's credits
SELECT id, email, credits_remaining 
FROM public.profiles 
WHERE id = 'YOUR_USER_ID';
-- Expected: Should show credits_remaining = 3

-- 3.3: Test the helper function
SELECT get_user_credits('YOUR_USER_ID');
-- Expected: Should return 3

-- =====================================================
-- STEP 4: Test payment trigger (Optional)
-- =====================================================

/**
 * To test the payment trigger, you can manually update a payment record:
 * 
 * 1. First, find a test payment record or create one
 * 2. Update its status to 'completed'
 * 3. Check if credits were granted
 * 
 * WARNING: Only do this in a development/staging environment!
 */

-- Example (DO NOT RUN IN PRODUCTION):
/*
-- Find a payment record
SELECT id, user_id, status FROM payment_details LIMIT 1;

-- Update it to completed (this will trigger the credit grant)
UPDATE payment_details 
SET status = 'completed' 
WHERE id = 'PAYMENT_ID_HERE';

-- Check if credits were granted
SELECT credits_remaining FROM profiles WHERE id = 'USER_ID_HERE';
*/

-- =====================================================
-- STEP 5: Monitor credit usage
-- =====================================================

-- Query to see all users and their current credits
SELECT 
  p.id,
  p.email,
  p.credits_remaining,
  p.plan_tier,
  p.plan_status,
  COUNT(jr.id) as total_recordings
FROM profiles p
LEFT JOIN job_requests jr ON jr.user_id = p.id
GROUP BY p.id, p.email, p.credits_remaining, p.plan_tier, p.plan_status
ORDER BY p.credits_remaining DESC;

-- Query to see recent credit grants (via payments)
SELECT 
  pd.id,
  pd.user_id,
  pd.status,
  pd.amount,
  pd.currency,
  pd.created_at,
  pd.finished_at,
  p.credits_remaining as current_credits
FROM payment_details pd
JOIN profiles p ON p.id = pd.user_id
WHERE pd.status = 'completed'
ORDER BY pd.finished_at DESC
LIMIT 10;

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

/**
 * Issue: Trigger not firing when payment is completed
 * Solution: Check if the trigger exists and is enabled
 */
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'payment_completed_grant_credits';

/**
 * Issue: Recording creation not consuming credits
 * Solution: Check if the trigger exists and is enabled
 */
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'recording_consume_credit';

/**
 * Issue: User can't create recordings even with credits > 0
 * Solution: Check the trigger function logs
 */
-- Enable logging for debugging (run in SQL Editor)
SET client_min_messages TO NOTICE;

-- Then try creating a recording and check the logs

/**
 * Issue: Need to manually adjust a user's credits
 * Solution: Update the credits_remaining column directly
 */
UPDATE profiles 
SET credits_remaining = 5  -- Set desired amount
WHERE id = 'USER_ID_HERE';

-- =====================================================
-- ROLLBACK (Emergency Only)
-- =====================================================

/**
 * If you need to rollback the migration, run these commands:
 * WARNING: This will delete all credit data!
 */

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

-- =====================================================
-- NEXT STEPS
-- =====================================================

/**
 * After successfully deploying the migration:
 * 
 * 1. Test the payment flow:
 *    - Make a test payment through your app
 *    - Verify that 3 credits are added to the user's account
 * 
 * 2. Test the recording flow:
 *    - Create a recording through your app
 *    - Verify that 1 credit is consumed
 *    - Try creating a recording with 0 credits and verify it's blocked
 * 
 * 3. Update your frontend (optional but recommended):
 *    - Add credit display in the user dashboard
 *    - Show remaining credits before recording
 *    - Display "out of credits" message when credits = 0
 * 
 * 4. Update your pricing/marketing materials:
 *    - Change from "monthly subscription" to "credit pack"
 *    - Clearly state "3 NetworkNote Credits per purchase"
 *    - Explain that it's a one-time purchase, not a subscription
 */
