# Music Database Setup

## Overview
The music section uses Supabase with two tables:
1. **songs** - Stores song suggestions with vote counts and who suggested them
2. **song_votes** - Tracks individual votes to prevent duplicates and ensure each user can only vote once per song

Follow these steps to set up the database tables.

## Step 1: Create the Songs and Votes Tables

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **qbnkrrpgmpgdzozjkwcz**
3. Navigate to **SQL Editor** (in left sidebar)
4. Click **New Query** or **New Snippet**
5. Copy and paste this SQL:

```sql
-- Create songs table
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  suggested_by TEXT NOT NULL,
  vote_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create song_votes table to track individual votes
CREATE TABLE song_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(song_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_songs_vote_count ON songs(vote_count DESC);
CREATE INDEX idx_song_votes_song_id ON song_votes(song_id);
CREATE INDEX idx_song_votes_user_id ON song_votes(user_id);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access on songs
CREATE POLICY "Allow public read songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update songs" ON songs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete songs" ON songs FOR DELETE USING (true);

-- Create policies for public read/write access on song_votes
CREATE POLICY "Allow public read votes" ON song_votes FOR SELECT USING (true);
CREATE POLICY "Allow public insert votes" ON song_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete votes" ON song_votes FOR DELETE USING (true);

-- Create helper functions for incrementing/decrementing votes
CREATE OR REPLACE FUNCTION increment_song_votes(p_song_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE songs SET vote_count = vote_count + 1 WHERE id = p_song_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_song_votes(p_song_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE songs SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = p_song_id;
END;
$$ LANGUAGE plpgsql;
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success" message

## Step 2: Verify the Tables

1. In Supabase, go to **Table Editor**
2. You should see two new tables:

### `songs` table structure:
   - `id` (UUID, Primary Key, auto-generated)
   - `title` (text) - Song title
   - `artist` (text) - Artist name
   - `suggested_by` (text) - Name of person who suggested it
   - `vote_count` (integer, defaults to 0) - Total votes
   - `created_at` (timestamp) - When suggested
   - `updated_at` (timestamp) - Last modified

### `song_votes` table structure:
   - `id` (UUID, Primary Key, auto-generated)
   - `song_id` (UUID, Foreign Key to songs)
   - `user_id` (text) - Unique ID of voter
   - `created_at` (timestamp) - When vote cast
   - **UNIQUE constraint** on (song_id, user_id) - Prevents duplicate votes

## Step 3: Test the Setup

The music page is now configured to:
1. **Load songs** from Supabase when the page loads
2. **Check guest name** - If user came via unique code link, use their name
3. **Prompt for name** - If user has no name, show modal before allowing song suggestion
4. **Add songs** with suggested_by name tracked
5. **Vote tracking** - Each vote is recorded, preventing duplicate votes per user
6. **Vote display** - Songs sorted by vote count (highest first), showing who suggested it

To test:
1. Run the website locally: `npm run dev`
2. Visit http://localhost:3000/music (without code) → Add song → Should show name modal
3. Submit name → Song added to database with your name as suggester
4. Vote on songs → Vote count increases
5. Try voting twice on same song → Should prevent duplicate vote
6. Visit with code (e.g., http://localhost:3000?code=GUEST001) → Name pre-filled, no modal needed
7. Refresh page → All songs and votes persist

## Step 4: Enable Anti-Abuse Vote Limits (Recommended)

To enforce stricter voting limits server-side, run the SQL script in:

- `MUSIC_RATE_LIMIT_SETUP.sql`

This adds a secure RPC (`submit_song_vote`) that applies:

- **1 vote per IP per song within 24 hours**
- **5 votes total per IP per UTC day**

After running it, the music page will show clear messages when a guest hits either limit.

## Database Functions

Updated functions in `/src/lib/songs.ts`:

- **`getAllSongs()`** - Fetches all songs ordered by votes (highest first), includes suggester name
- **`addSongToDb(title, artist, suggestedBy)`** - Adds song with suggester name
- **`voteSong(songId, userId)`** - Records individual vote, returns boolean (success/duplicate)
- **`hasUserVotedForSong(songId, userId)`** - Checks if user already voted on this song
- **`removeSongVote(songId, userId)`** - Allows removing a vote if needed
- **`deleteSong(id)`** - Removes a song entirely

## Integration Details

### Music Page (`/src/app/music/page.tsx`)
- Fetches guest name from localStorage/Supabase (from envelope landing)
- Shows "Name Modal" popup if no name when user tries to suggest song
- Calls `addSongToDb(title, artist, suggestedBy)` with the name
- Shows vote count next to each song
- Shows who suggested each song
- Checks `hasUserVotedForSong()` before allowing vote
- Updates local vote count immediately, syncs to DB
- Songs sorted by vote_count DESC automatically

### Song Store (`/src/store/songStore.ts`)
- `setSongs(songs)` - Loads songs from database into Zustand
- `addSong(title, artist, suggestedBy)` - Adds song to in-memory store
- `voteSong(songId, userId)` - Records vote locally AND to database
- `getSortedSongs()` - Returns songs sorted by votes (highest first)
- `hasUserVoted(songId, userId)` - Checks if user already voted
- Songs now include: id, title, artist, suggestedBy, votes, votedBy Set

## Data Flow

```
User visits /music (with or without ?code=GUEST001)
    ↓
Check for guest_name in state (from envelope landing)
    ↓
Load all songs from database (GET /songs)
    ↓
User clicks "Suggest Song"
    ↓
    If NO name → Show modal asking for name
    If YES name → Open song form
    ↓
User submits song form
    ↓
Call addSongToDb(title, artist, name) 
    → Inserts into songs table with suggested_by
    → Returns new song
    ↓
Song appears in list immediately
    ↓
User clicks vote button
    ↓
Check hasUserVotedForSong() 
    If already voted → Show "You already voted"
    If not voted → voteSong()
    ↓
voteSong() does:
    1. Insert into song_votes (song_id, user_id)
    2. Increment vote_count on songs table
    3. Update local store
    ↓
Song moves up in list (sorted by votes)
    ↓
Refresh page → All data persists ✓
```

## Troubleshooting

**Songs don't appear after adding:**
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Ensure RLS policies were created successfully
- Verify both tables exist: songs and song_votes

**Cannot vote twice:**
- This is correct! UNIQUE constraint on (song_id, user_id) prevents duplicates
- Show message: "You already voted for this song"

**"Cannot find module '@/lib/songs'":**
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

## File Structure

```
/src/
├── lib/
│   ├── supabase.ts          # Supabase client + guest functions
│   └── songs.ts             # NEW: Song database functions with voting
├── store/
│   └── songStore.ts         # Zustand store (enhanced for voting)
├── components/
│   └── NameModal.tsx        # NEW: Modal to ask for name if missing
└── app/
    └── music/
        └── page.tsx         # Music page (updated with name modal + voting)
```

## Security Notes

- Row Level Security policies allow public read/write (appropriate for a wedding website)
- User voting is tracked by client-generated userID stored in localStorage
- Vote UNIQUE constraint prevents duplicate votes automatically at DB level
- Suggester name is stored and displayed (transparency)
- No authentication required (matches the guest code system)
- In production, ensure Supabase Project has appropriate security settings
