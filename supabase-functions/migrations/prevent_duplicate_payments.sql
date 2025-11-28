-- Prevent duplicate payments by adding a unique constraint to paypal_order_id
-- This ensures that if the frontend accidentally submits the same payment twice, only one record is created.

-- Step 1: Remove existing duplicates (if any), keeping the earliest record
DELETE FROM public.payment_details a USING public.payment_details b
WHERE a.id > b.id 
AND a.paypal_order_id = b.paypal_order_id 
AND a.paypal_order_id IS NOT NULL;

-- Step 2: Add the unique constraint
ALTER TABLE public.payment_details 
ADD CONSTRAINT payment_details_paypal_order_id_key UNIQUE (paypal_order_id);
