-- Revert default credits to 0
-- We want credits to be granted ONLY by payment, not by default.
-- The SignupPage now handles creating the profile with 0 credits, and the payment trigger adds 3.

ALTER TABLE public.profiles 
ALTER COLUMN credits_remaining SET DEFAULT 0;
