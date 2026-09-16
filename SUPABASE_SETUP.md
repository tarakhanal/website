# Supabase Setup Guide

Follow these steps to connect your wedding website to Supabase:

## 1. Create a Supabase Account
- Go to [https://supabase.com](https://supabase.com)
- Click "Start your project"
- Sign up with your email or GitHub account

## 2. Create a New Project
- Click "New project"
- Name it `wedding-website` (or your preferred name)
- Create a strong database password
- Choose a region closest to you
- Click "Create new project"

## 3. Create the `guest_codes` Table
- Once your project loads, click on the SQL Editor (left sidebar)
- Click "New Query"
- Copy and paste this SQL:

```sql
CREATE TABLE guest_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX idx_guest_codes_code ON guest_codes(code);
```

- Click "Run"
- You'll see the table created in the left sidebar under "Tables"

## 4. Add Your Guest Codes
- Click on the `guest_codes` table in the left sidebar
- Click the "+" button to add a new row
- Add your guest codes and names:
  - `code`: GUEST001, GUEST002, etc.
  - `name`: Guest name(s)
- Repeat for all guests

**Or** use the Admin Panel at `/admin` to manage codes (easier!)

## 5. Get Your Credentials
- Click on "Settings" in the left sidebar
- Click "API"
- Copy the following:
  - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
  - **Anon Key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. Add Environment Variables
- Open the `.env.local` file in your project root
- Replace the placeholder values with your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 7. Set Up Row Level Security (Optional but Recommended)
To make the admin panel more secure, you can enable RLS:

1. Go to the `guest_codes` table
2. Click the lock icon at the top right
3. Enable "Enable RLS"
4. For now, use the default permissive policy (you can add authentication later)

## 8. Test It!
1. Restart your dev server: `npm run dev`
2. Go to `/admin` 
3. Try adding a guest code
4. It should appear in Supabase immediately!
5. Share an invite link with a guest
6. The guest should see their personalized greeting

## Troubleshooting

**"Cannot find module '@/lib/supabase'"**
- Make sure the file exists at `/src/lib/supabase.ts`
- Check that your TypeScript paths are configured correctly in `tsconfig.json`

**"Failed to load guest codes. Make sure Supabase is configured."**
- Check your `.env.local` file has the correct URL and key
- Make sure the table name is exactly `guest_codes` (lowercase)
- Check your RLS policies if you enabled RLS

**Admin changes not showing on guest side**
- Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear localStorage: Open DevTools Console and run `localStorage.clear()`
- Make sure both admin and guest pages are making requests to the same Supabase project

## Managing Guest Codes

### Via Admin Panel ✨
Visit `/admin` on your wedding website to:
- View all guest codes
- Add new codes
- Edit existing codes
- Delete codes
- Copy invite links to clipboard

### Via Supabase Dashboard
1. Log into Supabase
2. Go to your project
3. Click on the `guest_codes` table
4. Manage directly from there

### Bulk Import (Advanced)
If you have many guests, you can use Supabase's CSV import feature:
1. Prepare a CSV file with columns: `code`, `name`
2. Go to the `guest_codes` table in Supabase
3. Click "Upload CSV"
4. Select your file and map the columns

## Privacy Notes
- Your Supabase project is public by default for reads
- The Anon Key used here only allows reading from the `guest_codes` table
- No sensitive information should be stored
- If you want to password-protect the admin panel, you'll need to add authentication

## Next Steps
- Customize your guest codes (make them memorable or random)
- Test invitations on iOS Safari to ensure everything works
- Consider adding code expiration or usage tracking later if needed
