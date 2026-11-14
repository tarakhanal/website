-- =====================================================================
-- MUSIC_VOTE_FIX.sql  —  fixes "Vote limits are not fully configured yet"
-- =====================================================================
-- Root cause: the vote functions were created with `SET search_path = public`,
-- but on Supabase the pgcrypto extension (which provides `digest()`) lives in
-- the `extensions` schema. Every call failed with
--   "function digest(text, unknown) does not exist"
-- so no guest could vote and the "votes left" counter showed "--".
--
-- What this script does (safe to run more than once):
--   * makes sure pgcrypto is installed (in the `extensions` schema),
--   * recreates the vote functions with `search_path = public, extensions`,
--   * computes the IP hash inside the error-handled block so failures come
--     back as a readable reason instead of a raw database error,
--   * updates songs.vote_count in the same transaction as the vote row,
--   * resyncs every song's vote_count with its actual vote rows.
--
-- Vote rules are unchanged:
--   * one vote per guest per song (by voter id and by name),
--   * max 1 vote per IP per song within 24 hours,
--   * max 5 votes per IP per UTC day.
--
-- How to run: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER TABLE public.song_votes
  ADD COLUMN IF NOT EXISTS voter_name TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_song_votes_song_ip_created_at
  ON public.song_votes(song_id, ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_song_votes_ip_created_at
  ON public.song_votes(ip_hash, created_at DESC);

-- ---------------------------------------------------------------------
-- Hash of the caller's IP (falls back to user-agent when no IP header)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_request_ip_hash()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_headers_raw TEXT := NULLIF(current_setting('request.headers', true), '');
  v_headers_json JSONB := COALESCE(v_headers_raw, '{}')::JSONB;
  v_forwarded_for TEXT := COALESCE(v_headers_json ->> 'x-forwarded-for', '');
  v_real_ip TEXT := COALESCE(v_headers_json ->> 'x-real-ip', '');
  v_user_agent TEXT := COALESCE(v_headers_json ->> 'user-agent', '');
  v_ip_source TEXT;
BEGIN
  v_ip_source := NULLIF(BTRIM(split_part(v_forwarded_for, ',', 1)), '');

  IF v_ip_source IS NULL THEN
    v_ip_source := NULLIF(BTRIM(v_real_ip), '');
  END IF;

  IF v_ip_source IS NULL THEN
    v_ip_source := 'ua:' || v_user_agent;
  END IF;

  RETURN encode(digest(v_ip_source, 'sha256'::TEXT), 'hex');
END;
$$;

-- ---------------------------------------------------------------------
-- Submit a vote (all checks + vote row + vote_count in one transaction)
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
  v_song_votes_24h INTEGER;
  v_ip_votes_today INTEGER := 0;
  v_votes_left INTEGER;
BEGIN
  IF p_song_id IS NULL OR p_user_id IS NULL OR BTRIM(p_user_id) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_message', 'missing song id or voter id');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM songs WHERE id = p_song_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'song_not_found', 'votes_left', NULL);
  END IF;

  v_ip_hash := get_request_ip_hash();

  SELECT COUNT(*)::INTEGER
  INTO v_ip_votes_today
  FROM song_votes
  WHERE ip_hash = v_ip_hash
    AND created_at >= date_trunc('day', timezone('utc', now()));

  v_votes_left := GREATEST(0, 5 - v_ip_votes_today);

  IF EXISTS (
    SELECT 1 FROM song_votes
    WHERE song_id = p_song_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', v_votes_left);
  END IF;

  IF v_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM song_votes
    WHERE song_id = p_song_id
      AND lower(COALESCE(voter_name, '')) = lower(v_name)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_name', 'votes_left', v_votes_left);
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_song_votes_24h
  FROM song_votes
  WHERE song_id = p_song_id
    AND ip_hash = v_ip_hash
    AND created_at >= (timezone('utc', now()) - INTERVAL '24 hours');

  IF v_song_votes_24h >= 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limit_song_24h', 'votes_left', v_votes_left);
  END IF;

  IF v_ip_votes_today >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limit_day', 'votes_left', 0);
  END IF;

  INSERT INTO song_votes (song_id, user_id, voter_name, ip_hash)
  VALUES (p_song_id, p_user_id, v_name, v_ip_hash);

  -- Keep the song's vote count in step with the vote row (same transaction).
  UPDATE songs
  SET vote_count = COALESCE(vote_count, 0) + 1
  WHERE id = p_song_id;

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
-- Votes left today for the caller's IP
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_vote_credits_remaining()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ip_hash TEXT := get_request_ip_hash();
  v_ip_votes_today INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER
  INTO v_ip_votes_today
  FROM song_votes
  WHERE ip_hash = v_ip_hash
    AND created_at >= date_trunc('day', timezone('utc', now()));

  RETURN jsonb_build_object('remaining', GREATEST(0, 5 - v_ip_votes_today));
END;
$$;

-- ---------------------------------------------------------------------
-- One-time resync: vote_count = actual number of vote rows per song
-- ---------------------------------------------------------------------
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

GRANT EXECUTE ON FUNCTION public.submit_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vote_credits_remaining() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_ip_hash() TO anon, authenticated;

-- Quick check (should return {"remaining": 5} or fewer, NOT an error):
SELECT public.get_vote_credits_remaining() AS check_votes_left;
