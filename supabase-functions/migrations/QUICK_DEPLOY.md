# 🚀 Quick Deploy Guide - Credit System

## Step 1: Run SQL Migration (Copy & Paste)

1. **Open the file**: `supabase-functions/migrations/add_credits_system.sql`
2. **Copy ALL contents** of that file (Ctrl+A, then Ctrl+C)
3. **Go to Supabase Dashboard**:
   - Visit: https://app.supabase.com
   - Select your project
   - Click "SQL Editor" in left sidebar
   - Click "New Query"
4. **Paste and Run**:
   - Paste the SQL (Ctrl+V)
   - Click "Run" or press Ctrl+Enter
   - You should see "Success. No rows returned"

✅ **That's it!** The credit system is now active.

---

## Step 2: Verify It Worked

Run this query in SQL Editor to check:

```sql
-- Check if credits column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'credits_remaining';

-- Should return 1 row
```

---

## Step 3: Test It (Optional)

Grant yourself 3 test credits:

```sql
-- Replace YOUR_USER_ID with your actual user ID
UPDATE profiles 
SET credits_remaining = 3 
WHERE id = 'YOUR_USER_ID';

-- Check it worked
SELECT email, credits_remaining FROM profiles WHERE id = 'YOUR_USER_ID';
```

---

## How It Works Now

### When User Pays ($9.99 or £9.99):
- ✅ Automatically grants **3 credits**
- ✅ No code changes needed - triggers handle it

### When User Creates Recording:
- ✅ Automatically consumes **1 credit**
- ✅ If credits = 0, recording is **blocked** with error message
- ✅ No code changes needed - triggers handle it

---

## Frontend Changes (Optional - For Better UX)

The database already enforces everything, but you can optionally add a credit display to show users their remaining credits before they record.

**No frontend changes are required for the system to work!** The database triggers will automatically:
- Grant 3 credits when payment completes
- Consume 1 credit when recording is saved
- Block recording creation when credits = 0

---

## What Happens Next

1. **User makes payment** → Edge function updates `payment_details` to 'completed'
2. **Trigger fires** → Adds 3 credits to user's profile
3. **User creates recording** → Trigger checks credits
4. **If credits > 0** → Consumes 1 credit, allows recording
5. **If credits = 0** → Blocks recording with error: "Insufficient credits"

---

## Monitoring Credits

See all users and their credits:

```sql
SELECT email, credits_remaining, plan_tier 
FROM profiles 
ORDER BY credits_remaining DESC;
```

See recent payments and credits granted:

```sql
SELECT 
  pd.user_id,
  pd.amount,
  pd.status,
  p.credits_remaining
FROM payment_details pd
JOIN profiles p ON p.id = pd.user_id
WHERE pd.status = 'completed'
ORDER BY pd.finished_at DESC
LIMIT 10;
```

---

## Need Help?

- **Full Documentation**: See `walkthrough.md` artifact
- **Deployment Details**: See `DEPLOYMENT_GUIDE_CREDITS.md`
- **Rollback**: Rollback script is in `add_credits_system.sql` (commented out at bottom)

---

## Summary

✅ **SQL Migration**: Ready to copy/paste from `add_credits_system.sql`  
✅ **No Edge Function Changes**: Existing code works unchanged  
✅ **No Frontend Changes Required**: Database enforces everything  
✅ **Automatic**: Triggers handle all credit logic  
✅ **Tested**: Logic verified and documented  

**Just run the SQL migration and you're done!** 🎉
