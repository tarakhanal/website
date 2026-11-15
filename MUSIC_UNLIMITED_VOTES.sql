-- Unlimited votes: guests may vote on any number of songs, once per song.
-- Run this in the Supabase SQL editor (replaces the 3 vote functions).

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
    'remaining', 999,
    'max_votes', 999,
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
  v_network_today INTEGER;
BEGIN
  IF p_song_id IS NULL OR p_user_id IS NULL OR BTRIM(p_user_id) = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_message', 'missing song id or voter id');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM songs WHERE id = p_song_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'song_not_found', 'votes_left', NULL);
  END IF;

  -- Serialise concurrent votes from the same device so double-taps cannot create duplicate votes.
  PERFORM pg_advisory_xact_lock(hashtext('song_vote:' || p_user_id));

  IF EXISTS (SELECT 1 FROM song_votes WHERE song_id = p_song_id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', NULL);
  END IF;

  IF normalize_guest_name(v_name) IS NOT NULL AND EXISTS (
    SELECT 1 FROM song_votes
    WHERE song_id = p_song_id
      AND lower(BTRIM(COALESCE(voter_name, ''))) = normalize_guest_name(v_name)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_name', 'votes_left', NULL);
  END IF;

  v_ip_hash := get_request_ip_hash();

  IF EXISTS (SELECT 1 FROM song_votes WHERE song_id = p_song_id AND ip_hash = v_ip_hash) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'network_song_limit', 'votes_left', NULL);
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_network_today
  FROM song_votes
  WHERE ip_hash = v_ip_hash
    AND created_at >= date_trunc('day', timezone('utc', now()));

  IF v_network_today >= 50 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'rate_limit_network', 'votes_left', NULL);
  END IF;

  INSERT INTO song_votes (song_id, user_id, voter_name, ip_hash)
  VALUES (p_song_id, p_user_id, v_name, v_ip_hash);

  UPDATE songs SET vote_count = COALESCE(vote_count, 0) + 1 WHERE id = p_song_id;

  RETURN jsonb_build_object('ok', true, 'reason', 'success', 'votes_left', NULL);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'duplicate_user', 'votes_left', NULL);
  WHEN OTHERS THEN
    RAISE LOG 'submit_song_vote error: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_code', SQLSTATE, 'error_message', SQLERRM);
END;
$$;

-- ---------------------------------------------------------------------
-- Remove a vote
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

  RETURN jsonb_build_object(
    'ok', v_deleted > 0,
    'reason', CASE WHEN v_deleted > 0 THEN 'removed' ELSE 'not_voted' END,
    'votes_left', NULL
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'remove_song_vote error: % %', SQLSTATE, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'reason', 'error', 'votes_left', NULL,
                              'error_code', SQLSTATE, 'error_message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_guest_vote_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.remove_song_vote(UUID, TEXT, TEXT) TO anon, authenticated;
