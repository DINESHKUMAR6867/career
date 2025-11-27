# Supabase Edge Functions Deployment Guide

## Overview
This guide will help you deploy the PayPal payment integration Edge Functions to your Supabase project.

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project created
3. PayPal Developer account with Client ID and Secret

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-functions/migrations/add_plan_dates.sql`
4. Paste and run the SQL in the editor

## Step 2: Set Environment Variables

In your Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add the following secrets:

```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com  # Use https://api-m.paypal.com for production
```

## Step 3: Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

1. Login to Supabase:
```bash
supabase login
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Deploy the create-order function:
```bash
supabase functions deploy create-order --no-verify-jwt
```

4. Deploy the capture-order function:
```bash
supabase functions deploy capture-order --no-verify-jwt
```

### Option B: Manual Deployment via Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. Name it `create-order`
4. Copy the code from `supabase-functions/create-order/index.ts`
5. Paste and deploy
6. Repeat for `capture-order`

## Step 4: Update Frontend Environment Variables

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-ref.supabase.co/functions/v1
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Billing page
3. Try to make a payment
4. Check the browser console for any errors
5. Verify the payment record in Supabase **payment_details** table

## Troubleshooting

### Error: "You must be logged in to make a payment"
- Make sure the user is authenticated
- Check that the `x-user-token` header is being sent

### Error: "supabase_insert_failed"
- Run the database migration SQL
- Check that the `payment_details` table has all required columns
- Verify the foreign key constraint on `email` column

### Error: "PayPal order creation failed"
- Verify PayPal credentials are correct
- Check that PAYPAL_API_BASE is set correctly (sandbox vs production)
- Ensure PayPal account is in good standing

## Database Schema

### payment_details Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `email`: TEXT (Foreign Key to profiles.email)
- `amount`: NUMERIC
- `amount_paid_usd`: NUMERIC
- `currency`: TEXT (USD or GBP)
- `status`: TEXT (created, pending, completed, failed)
- `transaction_id`: TEXT
- `paypal_order_id`: TEXT
- `paypal_capture_id`: TEXT
- `payer_email`: TEXT
- `payer_name`: TEXT
- `payment_mode`: TEXT (paypal, card, wallet)
- `plan_type`: TEXT (premium_monthly)
- `plan_started_at`: TIMESTAMPTZ
- `plan_ends_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ
- `finished_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## How It Works

1. **User Authentication Check**: 
   - When user clicks "Pay", the frontend calls `create-order`
   - Edge function verifies user exists in `auth.users`
   - If user doesn't exist, returns 401 error

2. **Profile Creation**:
   - If user exists but no profile, creates one automatically
   - This prevents foreign key constraint violations

3. **PayPal Order Creation**:
   - Creates PayPal order with amount (9.99 USD or GBP)
   - Stores payment record with status "created"
   - Calculates plan dates (start: now, end: +1 month)

4. **Payment Capture**:
   - User completes payment on PayPal
   - Frontend calls `capture-order`
   - Updates payment status to "completed"
   - Updates user profile with premium plan and renewal date

5. **Plan Management**:
   - `plan_started_at`: When the subscription started
   - `plan_ends_at`: When it will renew (1 month later)
   - `plan_renews_at` in profiles: Same as plan_ends_at

## Support

If you encounter any issues:
1. Check Supabase Edge Function logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database migration was run successfully
