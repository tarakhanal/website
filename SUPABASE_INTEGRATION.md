# Supabase Integration Summary

## What Changed

### New Files Created
1. **`/src/lib/supabase.ts`** - Supabase client and database functions
2. **`.env.local`** - Environment variables (you need to fill these in)
3. **`SUPABASE_SETUP.md`** - Step-by-step setup guide

### Updated Files
1. **`/src/app/admin/page.tsx`** - Now reads/writes to Supabase instead of localStorage
2. **`/src/components/EnvelopeLanding.tsx`** - Now fetches guest names from Supabase

## Architecture

```
Guest visits with ?code=GUEST001
           ↓
EnvelopeLanding fetches name from Supabase
           ↓
Guest sees personalized greeting
           ↓
Admin can update name in /admin or Supabase dashboard
           ↓
On next visit, guest sees updated name automatically
```

## Key Features

✅ **Real-time updates** - Changes in admin panel appear on guest side immediately  
✅ **Scalable** - Supports unlimited guests  
✅ **Secure** - Uses Supabase's Row Level Security  
✅ **Simple admin UI** - `/admin` page to manage all codes  
✅ **Fallback support** - Works with local `guestCodes.json` if Supabase isn't configured  
✅ **Mobile-friendly** - Full iOS Safari support  

## Installed Dependencies
- `@supabase/supabase-js` - Supabase client library

## Next Steps

1. **Follow the SUPABASE_SETUP.md guide** to:
   - Create a Supabase account
   - Set up the `guest_codes` table
   - Get your credentials
   - Add them to `.env.local`

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Test everything**:
   - Visit `/admin` to add guest codes
   - Share an invite link
   - Verify guest sees their name
   - Edit a guest name in admin
   - Guest refreshes and sees updated name

## Costs
Supabase free tier includes:
- Up to 500MB database storage
- Unlimited API requests
- Perfect for a wedding website!

## Questions?
- See SUPABASE_SETUP.md for detailed troubleshooting
- Supabase docs: https://supabase.com/docs
