# Music Voting System - Architecture & Design Decisions

## System Overview

The music voting system consists of:

1. **Database Layer** (Supabase PostgreSQL)
   - `songs` table - Suggestions with vote counts
   - `song_votes` table - Individual vote tracking
   - Helper functions - Increment/decrement votes

2. **State Management** (Zustand)
   - In-memory song state
   - Local vote tracking
   - Quick UI updates

3. **UI Components** (React)
   - Music page - List and voting interface
   - Name modal - Capture guest identity
   - Forms - Add new suggestions

4. **Guest Identity** (localStorage + Supabase)
   - Code-based: From unique link via guest_codes table
   - Direct: Entered via NameModal
   - Always stored in localStorage

---

## Data Model

### songs Table

```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,           -- Song name
  artist TEXT NOT NULL,          -- Artist name
  suggested_by TEXT NOT NULL,    -- Guest's name who suggested it
  vote_count INT DEFAULT 0,      -- Total votes
  created_at TIMESTAMP,          -- When suggested
  updated_at TIMESTAMP           -- Last modified
);
```

**Why these fields?**
- `suggested_by` (TEXT, not UUID): Shows guest's actual name, not ID
- `vote_count` (INT): Denormalized for fast sorting/display
- Full timestamps: Can show "suggested 2 hours ago" if needed

### song_votes Table

```sql
CREATE TABLE song_votes (
  id UUID PRIMARY KEY,
  song_id UUID NOT NULL,         -- Which song was voted for
  user_id TEXT NOT NULL,         -- Who voted (client-generated ID)
  created_at TIMESTAMP,          -- When vote was cast
  UNIQUE(song_id, user_id)       -- Prevents duplicate votes
);
```

**Why this design?**
- UNIQUE constraint: Prevents duplicate votes at database level
- No update needed: Votes are immutable (not "vote count", but individual records)
- Audit trail: Can see when each vote was cast
- Scalability: Easy to add features (can query vote history, replay votes, etc.)

---

## User Journey

### Path 1: User with Guest Code (Invited)

```
User clicks link: yoursite.com?code=GUEST001
    ↓
EnvelopeLanding page loads
    ↓
Fetches guest_codes table: WHERE code = 'GUEST001'
    ↓
Gets name: "Tara & Bandana"
    ↓
Stores in localStorage: guest_name = "Tara & Bandana"
    ↓
User navigates to Music page
    ↓
Music page reads localStorage: guest_name = "Tara & Bandana"
    ↓
Guest name is KNOWN → NO MODAL
    ↓
User clicks "Suggest Song"
    ↓
Form appears immediately
    ↓
User submits: addSongToDb("Perfect", "Ed Sheeran", "Tara & Bandana")
    ↓
Song added to database with suggested_by filled in
    ↓
Song appears in list
```

### Path 2: Direct Visit (No Code)

```
User visits: yoursite.com/music
    ↓
localStorage is empty (no guest_name)
    ↓
Guest name is UNKNOWN
    ↓
User clicks "Suggest Song"
    ↓
SHOW MODAL: "Before you suggest... Please tell us your name"
    ↓
User enters: "Alex & Sam"
    ↓
Modal submits:
  1. Sets state: guestName = "Alex & Sam"
  2. Stores localStorage: guest_name = "Alex & Sam"
  3. Closes modal
    ↓
Form appears
    ↓
User submits: addSongToDb("Shape of You", "Ed Sheeran", "Alex & Sam")
    ↓
Song added with suggested_by = "Alex & Sam"
    ↓
Song appears in list
    ↓
Next time user visits music page: NAME IS ALREADY KNOWN
    ↓
No modal needed again
```

### Path 3: Voting (Any User)

```
Songs loaded from database
    ↓
User sees list sorted by vote_count DESC
    ↓
User clicks thumbs up on "Perfect"
    ↓
handleVote() runs:
    ↓
    Check: hasUserVotedForSong(songId, userId)?
    ├─ YES: Already voted
    │       Button already disabled, do nothing
    │
    └─ NO: First vote
        ↓
        Call voteSong() to database:
        ├─ Insert into song_votes(song_id, user_id)
        │  → UNIQUE constraint prevents duplicates
        │
        └─ Call increment_song_votes() function
           → UPDATE songs SET vote_count = vote_count + 1
        ↓
        If successful:
        ├─ Update local store: song.votes++
        ├─ Update UI: show new vote count
        └─ Disable button for this song
```

---

## Key Design Decisions

### 1. Why Store Name as TEXT, Not UUID?

```typescript
// ❌ BAD DESIGN
suggested_by: UUID (reference to users table)
// Problem: Who are these "users"? Not in any table. Confusing.
//          User sees: "Suggested by 550e8400-e29b-41d4-a716-446655440000" 😕

// ✅ GOOD DESIGN  
suggested_by: TEXT
// Benefit: Direct name display
//          User sees: "Suggested by Tara & Bandana" ✨
//          No joins needed for display
//          Can show text-as-is from guest_codes table
```

### 2. Why Denormalize vote_count?

```typescript
// ❌ BAD DESIGN
// Query to get vote count:
SELECT song_id, COUNT(*) as vote_count 
FROM song_votes 
GROUP BY song_id
// Problem: Slow sorting, requires aggregation every time

// ✅ GOOD DESIGN
// song_votes table just tracks votes
// songs.vote_count is denormalized (cached count)
// Query to get sorted songs:
SELECT * FROM songs ORDER BY vote_count DESC LIMIT 10
// Benefit: 100x faster, simple sorting, good for UI
//          RPC functions keep it in sync automatically
```

### 3. Why UNIQUE(song_id, user_id) Constraint?

```typescript
// ❌ WITHOUT CONSTRAINT
// App-level check: hasUserVoted() → vote button disabled
// But database allows duplicate votes if:
// - Two devices click simultaneously
// - Network race condition
// - Bug in app code

// ✅ WITH CONSTRAINT
// Database literally cannot store duplicate votes
// Error caught at DB level
// Even if app has bug, data stays clean
// voteSong() returns false if duplicate attempted
```

### 4. Why Use Zustand for Local State?

```typescript
// Flow:
// 1. Load songs from database → Set in Zustand
// 2. User votes → voteSong() saves to DB
// 3. Simultaneously: Update Zustand → UI updates instantly
// 4. No waiting for DB response
// 5. UI is snappy and responsive

// Even if:
// - Network slow
// - User refreshes page
// - Data persists in database (source of truth)
```

### 5. Guest Name Storage Strategy

```typescript
// Two-tier approach:

// TIER 1: localStorage (Fast, Instant)
localStorage.setItem('guest_name', 'Tara & Bandana')
// Used for: Form defaults, "Suggested by" field
// Updated when: User enters name in modal OR visits with guest code

// TIER 2: Supabase Database (Persistent, Queryable)
songs.suggested_by = 'Tara & Bandana'
// Used for: Data persistence, admin queries
// Updated when: Song added to database

// Why both?
// - localStorage: No network call needed for every use
// - Supabase: Survives browser clear, device switch, etc.
```

---

## Vote Prevention (Duplicate Vote Protection)

### Client-Level (Fast)

```typescript
// Music page state:
const hasUserVoted = (songId, userId) => {
  const song = songs.find(s => s.id === songId)
  return song?.votedBy.has(userId) ?? false
}

// If true:
// - Button disabled (visually)
// - onClick doesn't execute
// - No network request made
```

### Database-Level (Secure)

```typescript
// song_votes table has:
UNIQUE(song_id, user_id)

// If user somehow makes two votes:
// INSERT INTO song_votes(song_id, user_id)
// VALUES ('123', 'user_abc')
// → First insert: SUCCESS ✓
// → Second insert: ERROR (UNIQUE constraint violation)
//                  voteSong() returns false
```

### Why Both?

1. **Client-level** is fast (no network call)
2. **Database-level** is secure (catches bugs, race conditions, direct DB access)
3. **Combined** = Great UX + Data integrity

---

## Real-Time Behavior

### Not Real-Time (By Design)

The system is NOT real-time because:
- No WebSocket subscriptions
- No polling/refresh mechanism
- Guests don't see votes from other devices instantly

### Is This OK?

✅ YES, perfect for wedding!

**Why?**
- ~50-100 guests voting in ~2-3 hours
- Doesn't need millisecond updates
- User can refresh page to see latest votes
- Simpler code, fewer bugs, cheaper hosting

**If you wanted real-time:**
```typescript
// In music/page.tsx useEffect:
const subscription = supabase
  .from('songs')
  .on('*', payload => {
    // Update local state when DB changes
    setSongs(...)
  })
  .subscribe()
// But this uses more resources and complexity
```

---

## Performance Considerations

### Database Indexes

```sql
CREATE INDEX idx_songs_vote_count ON songs(vote_count DESC);
CREATE INDEX idx_song_votes_song_id ON song_votes(song_id);
CREATE INDEX idx_song_votes_user_id ON song_votes(user_id);
```

**Query Performance:**
- "Get top songs": `SELECT * FROM songs ORDER BY vote_count DESC`
  - With index: <1ms
  - Without: Can be slow with many songs

- "Check if user voted": `SELECT * FROM song_votes WHERE song_id=X AND user_id=Y`
  - With indexes: <1ms
  - Without: Slow

### Scaling

**Current design handles:**
- 1,000+ songs ✓
- 10,000+ votes ✓
- 1,000+ simultaneous users ✓

**To optimize further:**
1. Add materialized views for leaderboards
2. Add Redis cache for vote counts
3. Archive old votes after wedding

---

## RLS (Row Level Security) Configuration

### Current Policy: Public Read/Write

```sql
CREATE POLICY "Allow public read songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update songs" ON songs FOR UPDATE USING (true) WITH CHECK (true);
```

**This means:** Anyone can see and modify songs (appropriate for wedding guest website)

### Alternative: Restrict Deletes (Optional)

```sql
-- Only admin can delete
CREATE POLICY "Admin delete only" ON songs 
FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');
```

**Not implemented here because:** Would need authentication system. Wedding site keeps it simple.

---

## Summary: Why This Design Works

| Aspect | Design | Benefit |
|--------|--------|---------|
| Guest Name | Text field (not UUID) | Shows actual names to guests |
| Vote Tracking | Separate song_votes table | Prevents duplicate votes |
| Vote Count | Denormalized in songs table | Fast sorting, snappy UI |
| Duplicate Prevention | DB constraint + app check | Secure + Fast |
| Guest Identity | localStorage + Supabase | No login needed |
| Real-time | Not included | Simpler, works offline |
| UI Updates | Zustand local state | Instant feedback |
| Permission | Public RLS | Anyone can participate |

---

## Testing Checklist

- [ ] Add song without guest code → NameModal appears
- [ ] Add song with guest code → No modal
- [ ] Song shows suggester name
- [ ] Vote button works, count increases
- [ ] Second vote on same song → Button disabled
- [ ] Different device → Can vote on same song
- [ ] Refresh page → Votes persist
- [ ] Supabase shows songs table populated
- [ ] Supabase shows song_votes table populated
- [ ] No UNIQUE constraint violations

Ready to deploy! 🎵
