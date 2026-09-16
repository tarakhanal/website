-- Music voting rate-limit hardening
-- Applies two limits:
-- 1) Max 1 vote per IP per song within 24 hours
-- 2) Max 5 votes per IP per day (UTC day)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE song_votes
  ADD COLUMN IF NOT EXISTS voter_name TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_song_votes_song_ip_created_at
  ON song_votes(song_id, ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_song_votes_ip_created_at
  ON song_votes(ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION get_request_ip_hash()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers_json JSONB := COALESCE(current_setting('request.headers', true), '{}')::JSONB;
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

  RETURN encode(digest(v_ip_source, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION submit_song_vote(
  p_song_id UUID,
  p_user_id TEXT,
  p_voter_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip_hash TEXT := get_request_ip_hash();
  v_name TEXT := NULLIF(BTRIM(COALESCE(p_voter_name, '')), '');
  v_song_votes_24h INTEGER;
  v_ip_votes_today INTEGER;
  v_votes_left INTEGER;
BEGIN
  IF p_song_id IS NULL OR p_user_id IS NULL OR BTRIM(p_user_id) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL);
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_ip_votes_today
  FROM song_votes
  WHERE ip_hash = v_ip_hash
    AND created_at >= date_trunc('day', timezone('utc', now()));

  v_votes_left := GREATEST(0, 5 - v_ip_votes_today);

  IF EXISTS (
    SELECT 1
    FROM song_votes
    WHERE song_id = p_song_id
      AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', v_votes_left);
  END IF;

  IF v_name IS NOT NULL AND EXISTS (
    SELECT 1
    FROM song_votes
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

  PERFORM increment_song_votes(p_song_id);

  RETURN jsonb_build_object('ok', true, 'reason', 'success', 'votes_left', GREATEST(0, v_votes_left - 1));
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', v_votes_left);
  WHEN OTHERS THEN
    RAISE LOG 'submit_song_vote error: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL);
END;
$$;

CREATE OR REPLACE FUNCTION get_vote_credits_remaining()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION get_music_usage_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_songs_count BIGINT;
  v_song_votes_count BIGINT;
  v_songs_bytes BIGINT;
  v_song_votes_bytes BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_songs_count FROM songs;
  SELECT COUNT(*) INTO v_song_votes_count FROM song_votes;

  SELECT pg_total_relation_size('public.songs') INTO v_songs_bytes;
  SELECT pg_total_relation_size('public.song_votes') INTO v_song_votes_bytes;

  RETURN jsonb_build_object(
    'songs_count', COALESCE(v_songs_count, 0),
    'song_votes_count', COALESCE(v_song_votes_count, 0),
    'songs_table_bytes', COALESCE(v_songs_bytes, 0),
    'song_votes_table_bytes', COALESCE(v_song_votes_bytes, 0),
    'total_music_bytes', COALESCE(v_songs_bytes, 0) + COALESCE(v_song_votes_bytes, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_vote_credits_remaining() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_request_ip_hash() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_music_usage_stats() TO anon, authenticated;
