-- =====================================================================
-- MUSIC_VOTES_V2.sql — per-guest votes, remove/reallocate, song previews
-- =====================================================================
-- Run once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once. Requires MUSIC_VOTE_FIX.sql to have been run
-- (pgcrypto in the `extensions` schema).
--
-- New vote rules:
--   * Each guest holds up to 5 votes AT A TIME. Removing a vote frees it to
--     be used on another song.
--   * A guest = their device's voter id + their name. If a guest clears their
--     browser and re-enters the same name, their earlier votes are recognised
--     again (they count toward the 5 and can be removed).
--   * One vote per guest per song.
--   * One vote per song per network (IP address) — most guests use mobile
--     data. If that vote is removed, the song is open to that network again.
--   * Safety cap: at most 50 new votes per day per network.
--
-- Also:
--   * turns on Supabase Realtime for songs + song_votes (live vote updates),
--   * songs.preview_url stores the 30-second Apple Music preview clip link.
--   * Votes can now only be added/removed through these functions (direct
--     table inserts/deletes by the public are no longer allowed), so the
--     limits can't be bypassed.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS preview_url TEXT;

ALTER TABLE public.song_votes
  ADD COLUMN IF NOT EXISTS voter_name TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_song_votes_user_id ON public.song_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_song_votes_voter_name_lower ON public.song_votes(lower(voter_name));
CREATE INDEX IF NOT EXISTS idx_song_votes_ip_created_at ON public.song_votes(ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_song_votes_song_ip ON public.song_votes(song_id, ip_hash);

-- Votes only through the functions below.
DROP POLICY IF EXISTS "Allow public insert votes" ON public.song_votes;
DROP POLICY IF EXISTS "Allow public delete votes" ON public.song_votes;

-- ---------------------------------------------------------------------
-- Guest name used for matching votes across devices. Blank and the
-- generic "Guest" placeholder never match other people's votes.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_guest_name(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(BTRIM(COALESCE(p_name, ''))) IN ('', 'guest') THEN NULL
    ELSE lower(BTRIM(p_name))
  END;
$$;

-- ---------------------------------------------------------------------
-- Votes currently held by a guest (device id OR same name)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guest_active_votes(p_user_id TEXT, p_voter_name TEXT)
RETURNS TABLE (vote_id UUID, song_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT v.id, v.song_id
  FROM song_votes v
  WHERE v.user_id = p_user_id
     OR (normalize_guest_name(p_voter_name) IS NOT NULL
         AND lower(BTRIM(COALESCE(v.voter_name, ''))) = normalize_guest_name(p_voter_name));
$$;

-- ---------------------------------------------------------------------
-- Status for the music page: votes left + which songs this guest voted for
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_guest_vote_status(p_user_id TEXT, p_voter_name TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_song_ids UUID[];
BEGIN
  SELECT COALESCE(array_agg(DISTINCT g.song_id), ARRAY[]::UUID[])
  INTO v_song_ids
  FROM guest_active_votes(p_user_id, p_voter_name) g;

  RETURN jsonb_build_object(
    'remaining', GREATEST(0, 5 - COALESCE(array_length(v_song_ids, 1), 0)),
    'max_votes', 5,
    'voted_song_ids', to_jsonb(v_song_ids)
  );
END;
$$;

-- ---------------------------------------------------------------------
-- Submit a vote
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_song_vote(
  p_song_id UUID,
  p_user_id TEXT,
  p_voter_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ip_hash TEXT;
  v_name TEXT := NULLIF(BTRIM(COALESCE(p_voter_name, '')), '');
  v_active INTEGER := 0;
  v_network_today INTEGER;
  v_votes_left INTEGER;
BEGIN
  IF p_song_id IS NULL OR p_user_id IS NULL OR BTRIM(p_user_id) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_message', 'missing song id or voter id');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM songs WHERE id = p_song_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'song_not_found', 'votes_left', NULL);
  END IF;

  -- Serialise concurrent votes from the same device so the 5-vote cap holds.
  PERFORM pg_advisory_xact_lock(hashtext('song_vote:' || p_user_id));

  SELECT COUNT(DISTINCT g.song_id)::INTEGER INTO v_active
  FROM guest_active_votes(p_user_id, v_name) g;

  v_votes_left := GREATEST(0, 5 - v_active);

  IF EXISTS (SELECT 1 FROM song_votes WHERE song_id = p_song_id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', v_votes_left);
  END IF;

  IF normalize_guest_name(v_name) IS NOT NULL AND EXISTS (
    SELECT 1 FROM song_votes
    WHERE song_id = p_song_id
      AND lower(BTRIM(COALESCE(voter_name, ''))) = normalize_guest_name(v_name)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_name', 'votes_left', v_votes_left);
  END IF;

  IF v_active >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'guest_limit', 'votes_left', 0);
  END IF;

  v_ip_hash := get_request_ip_hash();

  IF EXISTS (SELECT 1 FROM song_votes WHERE song_id = p_song_id AND ip_hash = v_ip_hash) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'network_song_limit', 'votes_left', v_votes_left);
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_network_today
  FROM song_votes
  WHERE ip_hash = v_ip_hash
    AND created_at >= date_trunc('day', timezone('utc', now()));

  IF v_network_today >= 50 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limit_network', 'votes_left', v_votes_left);
  END IF;

  INSERT INTO song_votes (song_id, user_id, voter_name, ip_hash)
  VALUES (p_song_id, p_user_id, v_name, v_ip_hash);

  UPDATE songs SET vote_count = COALESCE(vote_count, 0) + 1 WHERE id = p_song_id;

  RETURN jsonb_build_object('ok', true, 'reason', 'success', 'votes_left', GREATEST(0, v_votes_left - 1));
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', v_votes_left);
  WHEN OTHERS THEN
    RAISE LOG 'submit_song_vote error: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', v_votes_left,
                              'error_code', SQLSTATE, 'error_message', SQLERRM);
END;
$$;

-- ---------------------------------------------------------------------
-- Remove a vote (frees it to be used on another song)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.remove_song_vote(
  p_song_id UUID,
  p_user_id TEXT,
  p_voter_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_deleted INTEGER;
  v_active INTEGER;
BEGIN
  IF p_song_id IS NULL OR p_user_id IS NULL OR BTRIM(p_user_id) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_message', 'missing song id or voter id');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('song_vote:' || p_user_id));

  WITH removed AS (
    DELETE FROM song_votes v
    USING guest_active_votes(p_user_id, p_voter_name) g
    WHERE v.id = g.vote_id AND v.song_id = p_song_id
    RETURNING v.id
  )
  SELECT COUNT(*)::INTEGER INTO v_deleted FROM removed;

  IF v_deleted > 0 THEN
    UPDATE songs
    SET vote_count = GREATEST(0, COALESCE(vote_count, 0) - v_deleted)
    WHERE id = p_song_id;
  END IF;

  SELECT COUNT(DISTINCT g.song_id)::INTEGER INTO v_active
  FROM guest_active_votes(p_user_id, p_voter_name) g;

  RETURN jsonb_build_object(
    'ok', v_deleted > 0,
    'reason', CASE WHEN v_deleted > 0 THEN 'removed' ELSE 'not_voted' END,
    'votes_left', GREATEST(0, 5 - v_active)
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'remove_song_vote error: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_code', SQLSTATE, 'error_message', SQLERRM);
END;
$$;

-- Internal helper: only the functions above need it.
REVOKE EXECUTE ON FUNCTION public.guest_active_votes(TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_guest_vote_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- Live updates: send song/vote changes to open Music pages instantly.
-- (Without this, Supabase Realtime connects but never delivers events.)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'songs'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'song_votes'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.song_votes;
    END IF;
  END IF;
END
$$;

-- Resync vote counts with actual vote rows (no-op if already correct).
UPDATE public.songs s
SET vote_count = sub.cnt
FROM (
  SELECT s2.id, COUNT(v.id)::INT AS cnt
  FROM public.songs s2
  LEFT JOIN public.song_votes v ON v.song_id = s2.id
  GROUP BY s2.id
) sub
WHERE sub.id = s.id
  AND s.vote_count IS DISTINCT FROM sub.cnt;

-- Quick check (should show remaining 5 and an empty list):
SELECT public.get_guest_vote_status('sql-editor-check', NULL) AS check_status;
