# Music System - Setup Checklist ✓

## BEFORE YOU START
- [ ] I have access to Supabase dashboard
- [ ] I'm logged into project **qbnkrrpgmpgdzozjkwcz**
- [ ] Browser is open to [Supabase SQL Editor](https://app.supabase.com/project/qbnkrrpgmpgdzozjkwcz/sql)

## STEP 1: CREATE DATABASE TABLES (5 minutes)

1. [ ] Open SQL Editor in Supabase
2. [ ] Click "New Query"
3. [ ] Open file: `MUSIC_DATABASE_SETUP.md` in your editor
4. [ ] Copy the SQL from "Step 1" section (all the CREATE TABLE, CREATE FUNCTION, etc. code)
5. [ ] Paste into Supabase SQL Editor
6. [ ] Click "Run" button (or press Cmd+Enter)
7. [ ] ✅ Verify: See "Success" message at top right

## STEP 2: VERIFY TABLES CREATED

1. [ ] In Supabase, go to **Table Editor** (left sidebar)
2. [ ] Look for these tables:
   - [ ] `songs` table exists
   - [ ] `song_votes` table exists
3. [ ] Click on `songs` table, verify columns:
   - [ ] id (UUID)
   - [ ] title (text)
   - [ ] artist (text)
   - [ ] suggested_by (text)
   - [ ] vote_count (integer)
   - [ ] created_at (timestamp)
   - [ ] updated_at (timestamp)
4. [ ] Click on `song_votes` table, verify columns:
   - [ ] id (UUID)
   - [ ] song_id (UUID)
   - [ ] user_id (text)
   - [ ] created_at (timestamp)

## STEP 3: TEST LOCALLY (10 minutes)

1. [ ] Terminal: `cd /Users/tara/Desktop/Wedding\ Stuff/website`
2. [ ] Terminal: `rm -rf .next` (clear cache)
3. [ ] Terminal: `npm run dev` (start server)
4. [ ] Browser: `http://localhost:3000/music`

### Test Scenario A: Without Guest Code

- [ ] Click "Suggest a Song"
- [ ] ✅ Name modal should appear asking "Before you suggest..."
- [ ] Enter your name in modal
- [ ] ✅ Modal closes, song form appears
- [ ] Enter song: Title="Test Song", Artist="Test Artist"
- [ ] Click "Add Song"
- [ ] ✅ Song appears in list
- [ ] ✅ Says "Suggested by [Your Name]"
- [ ] ✅ Vote count shows "0"
- [ ] Click thumbs up button
- [ ] ✅ Vote count changes to "1"
- [ ] Click thumbs up again
- [ ] ✅ Button should be disabled (no double voting)
- [ ] Refresh page (Cmd+R)
- [ ] ✅ Song still shows vote count = 1
- [ ] ✅ Vote button still disabled
- [ ] ✅ "Suggested by [Your Name]" still shows

### Test Scenario B: With Guest Code

- [ ] Browser: `http://localhost:3000?code=GUEST001` 
  - (Make sure GUEST001 exists in your guest_codes table)
- [ ] Go to `/music` (navigation menu)
- [ ] ✅ Name should be pre-filled (from envelope page)
- [ ] ✅ Click "Suggest a Song" → Form appears IMMEDIATELY (no modal)
- [ ] Add another song
- [ ] ✅ Should show "Suggested by Tara & Bandana" or whatever guest name is

### Test Scenario C: Voting Logic

- [ ] Incognito window: `http://localhost:3000/music`
- [ ] Suggestion modal appears with different user
- [ ] Enter different name
- [ ] Add a song
- [ ] Back to first browser tab
- [ ] Refresh page
- [ ] ✅ See songs from BOTH users
- [ ] Vote on Song A from user 1
- [ ] Vote on Song B from user 2
- [ ] All votes show correctly
- [ ] Each user should only vote once per song

## STEP 4: CHECK FOR ERRORS

- [ ] Open browser console (F12 → Console tab)
- [ ] No red error messages
- [ ] Network tab shows successful requests to Supabase
- [ ] If errors exist: 
  - [ ] Copy error message
  - [ ] Check `MUSIC_IMPLEMENTATION_GUIDE.md` Troubleshooting section

## STEP 5: iOS SAFARI TEST (if available)

- [ ] Get device IP: `ipconfig getifaddr en0` or check System Settings
- [ ] On iPhone Safari: `http://<YOUR_IP>:3000/music`
- [ ] Name modal appears
- [ ] Can tap and type name
- [ ] Form appears after name entry
- [ ] Can add songs
- [ ] Vote buttons are easily tappable
- [ ] No layout issues
- [ ] No console errors (Safari → Develop → [Your Computer Name])

## STEP 6: FINAL VERIFICATION

- [ ] Look at Supabase Table Editor → `songs` table
- [ ] ✅ See songs you added
- [ ] ✅ See `suggested_by` field is filled with names
- [ ] ✅ See `vote_count` field updated
- [ ] Look at Supabase Table Editor → `song_votes` table
- [ ] ✅ See multiple vote records
- [ ] ✅ No duplicate rows for same song_id + user_id combo

## SUCCESS! 🎉

All boxes checked? You're ready to share with guests!

### What Guests Will See:
1. Visit `/music` page
2. Get asked for their name (if no guest code)
3. See "Suggest a Song" form
4. Add favorite songs
5. See songs from other guests
6. Vote on songs they like
7. See vote counts and who suggested each song
8. See songs re-sort by vote count
9. Vote persists even after refresh/close browser

### What You Can Do:
1. Monitor songs being suggested (Supabase Table Editor)
2. Delete inappropriate songs if needed
3. See final voting results
4. Create playlist based on top-voted songs

---

**Having issues?** 

1. Check Supabase SQL ran successfully
2. Check browser console for errors (F12)
3. Check `MUSIC_IMPLEMENTATION_GUIDE.md` Troubleshooting section
4. Clear .next folder: `rm -rf .next`
5. Restart dev server: `npm run dev`
