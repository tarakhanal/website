# Admin Panel Password Protection

The `/admin` page is now password protected.

## Login Details

**Password:** `TaraBandana27`

(Change this in your `.env.local` file if you want a different password)

## How It Works

1. Visit `/admin`
2. Enter your admin password
3. You'll see the guest code management panel
4. Click "Logout" when done

## Changing the Password

### Local Development
Edit `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=your_new_password
```

### Production (Vercel)
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Edit or add: `NEXT_PUBLIC_ADMIN_PASSWORD=your_new_password`
4. Redeploy

## Security Note

⚠️ Since the password is in a `NEXT_PUBLIC_` variable, it's visible in the client-side code. For a high-security solution, you would need a backend authentication system.

However, for a wedding website, this is reasonable because:
- Only you know the password
- It prevents casual guests from accessing admin features
- It deters accidental changes

If you want more security later, we can add proper authentication with Supabase Auth.
