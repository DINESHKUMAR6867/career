-- Change default credits to 3 for new users
-- This ensures that when a user signs up (via trigger or manually), they start with 3 credits.

ALTER TABLE public.profiles 
ALTER COLUMN credits_remaining SET DEFAULT 3;

-- Optional: Grant 3 credits to any existing users who have 0 credits and are on the 'free' plan (assuming they are new/stuck)
-- You can comment this out if you don't want to affect existing users
/*
UPDATE public.profiles
SET credits_remaining = 3
WHERE credits_remaining = 0 AND plan_tier = 'free';
*/
