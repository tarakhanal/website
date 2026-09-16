# Music Voting System - Complete Implementation Guide

## What Changed

You now have a complete music voting system with the following features:

### ✅ Database Tables (Supabase)
- **songs** table: Stores song suggestions with vote counts and suggester names
- **song_votes** table: Tracks individual votes to prevent duplicates

### ✅ Components
- **NameModal.tsx** - NEW: Asks for guest name if they don't have one
- Updated **music/page.tsx** - Now handles guest names and voting

### ✅ Functions
- **songs.ts** - NEW: Database functions for songs
  - `getAllSongs()` - Fetch all songs sorted by votes
  - `addSongToDb(title, artist, suggestedBy)` - Add song with suggester name
  - `voteSong(songId, userId)` - Record individual vote
  - `hasUserVotedForSong(songId, userId)` - Check if user already voted
  - `removeSongVote(songId, userId)` - Remove a vote

### ✅ Store Updates
- **songStore.ts** - Updated to include:
  - `suggestedBy` field for each song
  - `updateSongVotes()` function

## Setup Instructions

### Step 1: Create Supabase Tables and Functions

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **qbnkrrpgmpgdzozjkwcz**
3. Go to **SQL Editor** → **New Query**
4. Copy the entire SQL from `MUSIC_DATABASE_SETUP.md` (Step 1)
5. Run it - you should see "Success"

This creates:
- `songs` table with `suggested_by`, `vote_count` fields
- `song_votes` table with UNIQUE constraint on (song_id, user_id)
- Helper functions `increment_song_votes()` and `decrement_song_votes()`
- Row Level Security policies for public access

### Step 2: Test Locally

```bash
cd /Users/tara/Desktop/Wedding\ Stuff/website

# Clear build cache
rm -rf .next

# Start dev server
npm run dev
```

Test the flow:

1. **Without Guest Link:**
   - Visit `http://localhost:3000/music`
   - Click "Suggest a Song"
   - Should show Name Modal
   - Enter name → Form appears
   - Add song → Should show "Suggested by [Your Name]"

2. **With Guest Link:**
   - Visit `http://localhost:3000?code=GUEST001` (or any code from your database)
   - Go to `/music`
   - Name should be pre-filled from envelope
   - Click "Suggest a Song" → Form appears immediately (no modal)
   - Add song → Shows "Suggested by Tara & Bandana"

3. **Voting:**
   - Click thumbs up button → Vote count increases
   - Try clicking again on same song → Button stays disabled
   - Refresh page → Vote persists (stored in database)
   - Songs re-sort by vote count

### Step 3: Monitor for Build Errors

When you run `npm run dev`, TypeScript might complain about missing `@/lib/supabase`. If this happens:

1. Clear cache: `rm -rf .next node_modules/.cache`
2. Restart dev server
3. If error persists, check that `/src/lib/supabase.ts` file exists and has proper exports

## Data Flow

```
User visits /music
  ↓
Load guest_name from localStorage (set by envelope landing page)
  ↓
Fetch all songs from database (getAllSongs)
  ↓
Display songs sorted by vote_count DESC
  ↓
User clicks "Suggest Song"
  ├─ If NO guest_name → Show NameModal
  │                    → User enters name
  │                    → Save to localStorage & state
  └─ Open song form
  ↓
User submits song
  ↓
Call addSongToDb(title, artist, guest_name)
  → Insert into songs with suggested_by = guest_name
  ↓
Song appears in list immediately (added to local store)
  ↓
User clicks vote button
  ↓
Check hasUserVotedForSong(songId, userId)
  ├─ Already voted → Disable button, show nothing
  └─ Not voted → Call voteSong()
     → Insert into song_votes
     → Call increment_song_votes() RPC
     → Update local store
     → Vote count increases
     → Button disables
  ↓
Page refresh → All data persists
```

## Guest Name Storage

Guest names are stored in two ways:

1. **From Unique Link** (Persistent)
   - User visits `http://yoursite.com?code=GUESTCODE`
   - Envelope page fetches name from Supabase `guest_codes` table
   - Stores in localStorage as `guest_name`
   - Name pre-fills on music page

2. **Direct Visit to Music** (New)
   - User visits `/music` without code
   - No name in localStorage
   - Music page shows NameModal when trying to suggest
   - User enters name manually
   - Stored in localStorage as `guest_name`
   - Used for current and future suggestions

Both methods save `guest_name` to localStorage and `suggested_by` to database.

## Vote Tracking

Each user has a unique `userId` (generated and stored in localStorage):
- Generated as: `user_${timestamp}_${random}`
- Prevents the same device voting twice on same song
- Enforced both client-side and database-side (UNIQUE constraint)

## Important Notes

⚠️ **Before Going Live:**

1. Verify all Supabase SQL ran successfully
2. Test adding a song via music page
3. Test voting (verify vote persists on refresh)
4. Test adding 2 different songs from different "users" (incognito browser)
5. Check that names display correctly

⚠️ **iOS Safari Compatibility:**

- Test on actual iPhone/Safari if possible
- Check that:
  - NameModal displays and submits correctly
  - Vote buttons are tappable (minimum 44px)
  - Songs list scrolls smoothly
  - No console errors in Safari Web Inspector

⚠️ **Vercel Deployment:**

1. Add environment variables to Vercel project:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_ADMIN_PASSWORD

2. Deploy and test on live site
3. Songs should load immediately (no errors in Network tab)

## Troubleshooting

**Issue:** "Cannot find module '@/lib/supabase'"
- Solution: Clear `.next` folder and restart dev server
- `rm -rf .next && npm run dev`

**Issue:** Songs show but vote button doesn't work
- Check browser console for errors
- Verify `song_votes` table exists in Supabase
- Verify RLS policies are correct

**Issue:** Name modal won't go away
- Check that `handleNameModalSubmit` is being called
- Verify `guest_name` is being set to state and localStorage
- Check browser console for errors

**Issue:** Votes reset on refresh
- This is WRONG - verify `song_votes` table exists
- Refresh should reload songs with same vote counts
- Check that database functions exist: `increment_song_votes`, `decrement_song_votes`

**Issue:** Can vote twice on same song
- Verify UNIQUE constraint exists on (song_id, user_id)
- Run in SQL Editor: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='song_votes';`
- Should show a UNIQUE constraint

## File Summary

| File | Status | Purpose |
|------|--------|---------|
| `/src/lib/songs.ts` | ✅ NEW | Database functions for songs |
| `/src/components/NameModal.tsx` | ✅ NEW | Modal to ask for guest name |
| `/src/app/music/page.tsx` | ✅ UPDATED | Music voting page with name modal |
| `/src/store/songStore.ts` | ✅ UPDATED | Added suggestedBy field |
| `MUSIC_DATABASE_SETUP.md` | ✅ NEW | SQL and setup instructions |

## Next Steps (Optional)

1. **Admin Panel Enhancement:**
   - Add song management to `/admin` page
   - View all suggested songs
   - Delete inappropriate songs
   - Export final playlist

2. **Analytics:**
   - Track which users suggest most songs
   - View voting patterns
   - See which genres are most popular

3. **Auto-Sort:**
   - Implement real-time sorting as votes come in
   - Show "Top Songs This Hour"

Questions? Check the browser console first - errors are usually there!
