'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import PageHeader from '@/components/PageHeader';
import NameModal from '@/components/NameModal';
import NewSongToasts, { type NewSongToast } from '@/components/NewSongToasts';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Music, ThumbsUp, Plus, Sparkles, X, Search, Play, Pause, Check, Crown, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSongsPage, getNewestSongs, getVotesSince, SONGS_PAGE_SIZE, addSongToDb, submitSongVote, removeSongVote, getGuestVoteStatus, getSongVotersBySongIds, saveSongPreviewUrl, normalizeText, type SongData } from '@/lib/songs';

type LocalSong = {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  albumName: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  createdAt: string | null;
};

// Postgres `timestamp` columns come back without a zone; they are stored in UTC.
const parseDbTime = (value: string | null): number =>
  value ? Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`) : NaN;

const toLocalSong = (song: SongData): LocalSong => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  suggestedBy: song.suggested_by,
  votes: song.vote_count,
  albumName: song.album_name || null,
  artworkUrl: song.artwork_url || null,
  previewUrl: song.preview_url || null,
  createdAt: song.created_at || null,
});

type SongSuggestion = {
  id: string;
  trackName: string;
  artistName: string;
  albumName: string;
  artworkUrl: string;
  previewUrl: string;
};

type SongMetadata = {
  albumName: string;
  artworkUrl: string;
  previewUrl: string;
};

type ItunesTrack = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
};

// Tells BackgroundMusic to pause while a song preview plays (and resume after).
const PREVIEW_START_EVENT = 'wedding-preview-start';
const PREVIEW_STOP_EVENT = 'wedding-preview-stop';
const MAX_VOTES = 5;
const LIVE_REFRESH_MS = 6000;
const FRESH_SONG_WINDOW_MS = 2 * 60 * 1000;
const FRESH_GLOW_MS = 5000;
const TOAST_MS = 5000;
const JUMP_TOP_AFTER_PX = 600;

// Kept outside the component: plain DOM audio element handling.
const startPreviewAudio = (audio: HTMLAudioElement, url: string): Promise<void> => {
  audio.pause();
  audio.src = url;
  audio.currentTime = 0;
  return audio.play();
};

const resetPreviewAudio = (audio: HTMLAudioElement | null) => {
  if (!audio) return;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
};

const getHighResArtwork = (url: string): string =>
  url.replace(/\d+x\d+bb/, '300x300bb');

// NOTE: do not add `media=music` here. With an iPhone/iPad user agent Apple answers
// `media=music` searches with a 301 redirect to `musics://…` (the Music app), which
// fetch() cannot follow — so the song search silently returned nothing on iOS.
const buildItunesSearchUrl = (term: string, limit: number): string =>
  `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;

// Safari (Private Browsing, "Block All Cookies", some in-app browsers) can throw on
// localStorage access. Never let storage errors break the page.
const safeStorageGet = (key: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[music] Could not save "${key}" to localStorage:`, error);
  }
};

const VOTER_ID_KEY = 'userId';
const VOTER_ID_COOKIE = 'wedding_voter_id';

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  let cookies = '';
  try {
    cookies = document.cookie;
  } catch {
    return null;
  }
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookies.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookieValue = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore — cookies blocked
  }
};

const getOrCreateVoterId = (): string => {
  if (typeof window === 'undefined') return '';

  const fromLocalStorage = safeStorageGet(VOTER_ID_KEY);
  const fromCookie = getCookieValue(VOTER_ID_COOKIE);
  const resolved = fromCookie || fromLocalStorage;

  if (resolved) {
    if (fromLocalStorage !== resolved) {
      safeStorageSet(VOTER_ID_KEY, resolved);
    }
    if (fromCookie !== resolved) {
      setCookieValue(VOTER_ID_COOKIE, resolved);
    }
    return resolved;
  }

  const generated = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  safeStorageSet(VOTER_ID_KEY, generated);
  setCookieValue(VOTER_ID_COOKIE, generated);
  return generated;
};

const fetchSongMetadata = async (title: string, artist: string): Promise<SongMetadata | null> => {
  const query = `${title} ${artist}`.trim();
  if (!query) return null;

  try {
    const response = await fetch(buildItunesSearchUrl(query, 1));

    if (!response.ok) return null;

    const data: { results?: ItunesTrack[] } = await response.json();
    const item = data.results?.[0];
    if (!item) return null;

    return {
      albumName: item.collectionName || 'Unknown Album',
      artworkUrl: item.artworkUrl100 ? getHighResArtwork(item.artworkUrl100) : '',
      previewUrl: item.previewUrl || '',
    };
  } catch {
    return null;
  }
};

export default function MusicPage() {
  // Local state for songs - don't rely on Zustand for rendering
  const [localSongs, setLocalSongs] = useState<LocalSong[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [userId] = useState(() => getOrCreateVoterId());
  const [guestName, setGuestName] = useState(() => {
    return safeStorageGet('guest_name') || '';
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [songSuggestions, setSongSuggestions] = useState<SongSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsUnavailable, setSuggestionsUnavailable] = useState(false);
  const [selectedArtworkUrl, setSelectedArtworkUrl] = useState<string | null>(null);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string | null>(null);
  const [songMetadataById, setSongMetadataById] = useState<Record<string, SongMetadata | null>>({});
  const [songVotersById, setSongVotersById] = useState<Record<string, string[]>>({});
  const [openVotersSongId, setOpenVotersSongId] = useState<string | null>(null);
  const [pendingVoteSongId, setPendingVoteSongId] = useState<string | null>(null);
  const [votesLeft, setVotesLeft] = useState<number | null>(null);
  const [votedSongIds, setVotedSongIds] = useState<Set<string>>(() => new Set());
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const playingSongIdRef = useRef<string | null>(null);
  const guestNameRef = useRef(guestName);
  const [songSearchDraft, setSongSearchDraft] = useState('');
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const listSectionRef = useRef<HTMLElement | null>(null);
  const [totalSongs, setTotalSongs] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // How many songs the list window shows; live refreshes re-fetch this whole window.
  const loadedCountRef = useRef(SONGS_PAGE_SIZE);
  const reachedEndRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const searchQueryRef = useRef('');
  const requestSeqRef = useRef(0);
  const liveRefreshTimerRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [freshSongIds, setFreshSongIds] = useState<Set<string>>(() => new Set());
  const [showJumpTop, setShowJumpTop] = useState(false);
  const [storedTopSongIds, setStoredTopSongIds] = useState<string[]>([]);
  const knownSongIdsRef = useRef<Set<string>>(new Set());
  const ownAddedSongIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedOnceRef = useRef(false);
  const [newSongToasts, setNewSongToasts] = useState<NewSongToast[]>([]);
  const prevTotalRef = useRef<number | null>(null);
  const announcedSongIdsRef = useRef<Set<string>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setNewSongToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: NewSongToast) => {
    setNewSongToasts((prev) => [...prev.filter((t) => t.id !== toast.id), toast].slice(-3));
    window.setTimeout(() => dismissToast(toast.id), TOAST_MS);
  }, [dismissToast]);

  // undefined = baseline not loaded yet; null = no votes exist yet.
  const lastVoteSeenAtRef = useRef<string | null | undefined>(undefined);
  const checkingVotesRef = useRef(false);

  // Announce votes other guests cast since the last check.
  const announceNewVotes = useCallback(async () => {
    if (checkingVotesRef.current) return;
    checkingVotesRef.current = true;
    try {
      if (lastVoteSeenAtRef.current === undefined) {
        const latest = await getVotesSince(null, 1, true);
        if (latest) lastVoteSeenAtRef.current = latest[0]?.created_at ?? null;
        return;
      }
      const votes = await getVotesSince(lastVoteSeenAtRef.current, 5);
      if (!votes || votes.length === 0) return;
      lastVoteSeenAtRef.current = votes[votes.length - 1].created_at;

      const myName = normalizeText(guestNameRef.current).toLowerCase();
      votes
        .filter(
          (vote) =>
            vote.user_id !== userId &&
            !(myName && normalizeText(vote.voter_name).toLowerCase() === myName) &&
            vote.songs?.title
        )
        .slice(-3)
        .forEach((vote) =>
          pushToast({
            id: `vote-${vote.id}`,
            name: normalizeText(vote.voter_name) || 'A guest',
            action: 'voted for',
            title: vote.songs!.title,
          })
        );
    } finally {
      checkingVotesRef.current = false;
    }
  }, [pushToast, userId]);

  // The total went up: announce the newest songs unless this guest added them.
  const announceNewSongs = useCallback(async (count: number) => {
    const newest = await getNewestSongs(Math.min(count, 3));
    const myName = normalizeText(guestNameRef.current).toLowerCase();
    const toShow = newest.filter(
      (song) =>
        !announcedSongIdsRef.current.has(song.id) &&
        !ownAddedSongIdsRef.current.has(song.id) &&
        normalizeText(song.suggested_by).toLowerCase() !== myName
    );
    newest.forEach((song) => announcedSongIdsRef.current.add(song.id));

    toShow.reverse().forEach((song) =>
      pushToast({ id: song.id, name: song.suggested_by || 'A guest', action: 'suggested', title: song.title })
    );
  }, [pushToast]);

  // Songs other guests added in the last couple of minutes glow briefly when they first appear.
  const markFreshSongs = useCallback((songs: LocalSong[]) => {
    const known = knownSongIdsRef.current;
    const now = Date.now();
    const fresh = hasLoadedOnceRef.current
      ? songs
          .filter(
            (song) =>
              !known.has(song.id) &&
              !ownAddedSongIdsRef.current.has(song.id) &&
              now - parseDbTime(song.createdAt) < FRESH_SONG_WINDOW_MS
          )
          .map((song) => song.id)
      : [];
    songs.forEach((song) => known.add(song.id));
    hasLoadedOnceRef.current = true;
    if (fresh.length === 0) return;

    setFreshSongIds((prev) => new Set([...prev, ...fresh]));
    window.setTimeout(() => {
      setFreshSongIds((prev) => {
        const next = new Set(prev);
        fresh.forEach((id) => next.delete(id));
        return next;
      });
    }, FRESH_GLOW_MS);
  }, []);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setSongSearchQuery(songSearchDraft.trim());
    }, 260);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [songSearchDraft]);

  const refreshSongVoters = useCallback(async (songIds: string[]) => {
    const votersById = await getSongVotersBySongIds(songIds);
    setSongVotersById(votersById);
  }, []);

  useEffect(() => {
    guestNameRef.current = guestName;
  }, [guestName]);

  // Votes left + which songs this guest has voted for (by device id or same name).
  const refreshVoteCredits = useCallback(async () => {
    const status = await getGuestVoteStatus(userId, guestNameRef.current);
    if (!status) {
      setVotesLeft(null);
      return;
    }
    setVotesLeft(status.remaining);
    setVotedSongIds(new Set(status.votedSongIds));
  }, [userId]);

  // Returns false when the request failed. Once the end is reached, peek one page further
  // so songs added live (0 votes → placed last) still show up.
  const refreshSongsFromDb = useCallback(async (): Promise<boolean> => {
    const seq = ++requestSeqRef.current;
    const search = searchQueryRef.current;
    const limit = loadedCountRef.current + (reachedEndRef.current ? SONGS_PAGE_SIZE : 0);
    const page = await getSongsPage(0, limit, search);
    void announceNewVotes();
    if (seq !== requestSeqRef.current) return true;
    if (!page) return false;

    const formattedSongs = page.songs.map(toLocalSong);
    loadedCountRef.current = Math.max(loadedCountRef.current, formattedSongs.length);
    reachedEndRef.current = formattedSongs.length >= page.total;
    markFreshSongs(formattedSongs);
    setLocalSongs(formattedSongs);
    setTotalMatches(page.total);
    if (!search) {
      setTotalSongs(page.total);
      setStoredTopSongIds(formattedSongs.filter((song) => song.votes > 0).slice(0, 3).map((song) => song.id));
      const prevTotal = prevTotalRef.current;
      prevTotalRef.current = page.total;
      if (prevTotal !== null && page.total > prevTotal) void announceNewSongs(page.total - prevTotal);
    }
    await refreshSongVoters(formattedSongs.map((song) => song.id));
    return true;
  }, [refreshSongVoters, markFreshSongs, announceNewSongs, announceNewVotes]);

  const loadMoreSongs = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    loadedCountRef.current += SONGS_PAGE_SIZE;
    try {
      await refreshSongsFromDb();
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [refreshSongsFromDb]);

  useEffect(() => {
    const query = newTitle.trim();

    if (!isFormVisible || query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const debounceId = window.setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true);

        const response = await fetch(buildItunesSearchUrl(query, 8), { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Suggestion request failed with status ${response.status}`);
        }

        const data: { results?: ItunesTrack[] } = await response.json();
        const suggestions: SongSuggestion[] = (data.results || []).map((item) => ({
          id: String(item.trackId ?? `${item.trackName || 'track'}-${item.artistName || 'artist'}`),
          trackName: item.trackName || '',
          artistName: item.artistName || '',
          albumName: item.collectionName || 'Unknown Album',
          artworkUrl: item.artworkUrl100 ? getHighResArtwork(item.artworkUrl100) : '',
          previewUrl: item.previewUrl || '',
        }));

        setSongSuggestions(suggestions.filter((item) => item.trackName && item.artistName));
        setSuggestionsUnavailable(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('[music] Song search failed:', error);
          setSongSuggestions([]);
          setSuggestionsUnavailable(true);
        }
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(debounceId);
    };
  }, [newTitle, isFormVisible]);

  useEffect(() => {
    const songsNeedingMetadata = localSongs.filter(
      (song) =>
        ((!song.albumName && !song.artworkUrl) || !song.previewUrl) &&
        songMetadataById[song.id] === undefined
    );
    if (songsNeedingMetadata.length === 0) return;

    let isCancelled = false;

    const loadMetadata = async () => {
      // 4 songs at a time (Apple allows ~20 searches per minute per visitor). Each
      // batch is stored right away; the state update re-runs this effect for the next batch.
      const batch = songsNeedingMetadata.slice(0, 4);
      const entries = await Promise.all(
        batch.map(async (song) => [song, await fetchSongMetadata(song.title, song.artist)] as const)
      );
      if (isCancelled) return;

      for (const [song, metadata] of entries) {
        if (!song.previewUrl && metadata?.previewUrl) {
          void saveSongPreviewUrl(song.id, metadata.previewUrl);
        }
      }

      setSongMetadataById((prev) => {
        const next = { ...prev };
        for (const [song, metadata] of entries) {
          next[song.id] = metadata;
        }
        return next;
      });
    };

    loadMetadata();

    return () => {
      isCancelled = true;
    };
  }, [localSongs, songMetadataById]);

  useEffect(() => {
    void refreshVoteCredits();
  }, [refreshVoteCredits]);

  // First page on mount, and again (from the top) whenever the search changes.
  useEffect(() => {
    let isMounted = true;
    searchQueryRef.current = songSearchQuery;
    loadedCountRef.current = SONGS_PAGE_SIZE;
    reachedEndRef.current = false;
    scrollContainerRef.current?.scrollTo({ top: 0 });

    refreshSongsFromDb().then((ok) => {
      if (!isMounted) return;
      if (!ok) setErrorMessage('Could not load songs right now. Please refresh and try again.');
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [songSearchQuery, refreshSongsFromDb]);

  // Bursts of realtime events (a vote touches songs + song_votes) collapse into one refresh.
  const scheduleLiveRefresh = useCallback(() => {
    if (liveRefreshTimerRef.current !== null) return;
    liveRefreshTimerRef.current = window.setTimeout(() => {
      liveRefreshTimerRef.current = null;
      void Promise.all([refreshSongsFromDb(), refreshVoteCredits()]);
    }, 400);
  }, [refreshSongsFromDb, refreshVoteCredits]);

  // Realtime sync across tabs/devices for songs + vote counts
  useEffect(() => {
    const channel = supabase
      .channel('songs-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, scheduleLiveRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'song_votes' }, scheduleLiveRefresh)
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[music] Realtime channel issue, relying on auto-refresh:', status, err);
        }
      });

    return () => {
      if (liveRefreshTimerRef.current !== null) {
        window.clearTimeout(liveRefreshTimerRef.current);
        liveRefreshTimerRef.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [scheduleLiveRefresh]);

  // Auto-refresh. Always on: a realtime channel can report SUBSCRIBED yet never
  // deliver events (e.g. tables not added to the supabase_realtime publication),
  // which previously froze vote counts until a page reload.
  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      await Promise.all([refreshSongsFromDb(), refreshVoteCredits()]);
    }, LIVE_REFRESH_MS);

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        await Promise.all([refreshSongsFromDb(), refreshVoteCredits()]);
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshSongsFromDb, refreshVoteCredits]);

  const handleSuggestSongClick = () => {
    if (!guestName) {
      setPendingVoteSongId(null);
      setShowNameModal(true);
    } else {
      setIsFormVisible(true);
    }
  };

  const handleNameModalSubmit = (name: string) => {
    setGuestName(name);
    guestNameRef.current = name;
    safeStorageSet('guest_name', name);
    setShowNameModal(false);
    // A returning guest (e.g. after clearing their browser) gets their earlier votes back.
    void refreshVoteCredits();

    if (pendingVoteSongId) {
      const songIdToVote = pendingVoteSongId;
      setPendingVoteSongId(null);
      void handleVote(songIdToVote, name);
      return;
    }

    setIsFormVisible(true);
  };

  const handleSuggestionSelect = (suggestion: SongSuggestion) => {
    setNewTitle(suggestion.trackName);
    setNewArtist(suggestion.artistName);
    setSelectedArtworkUrl(suggestion.artworkUrl || null);
    setSelectedAlbumName(suggestion.albumName || null);
    setSelectedPreviewUrl(suggestion.previewUrl || null);
    setShowSuggestions(false);
    setSongSuggestions([]);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingSong) return;

    const normalizedTitle = normalizeText(newTitle);
    const normalizedArtist = normalizeText(newArtist);

    if (!normalizedTitle || !normalizedArtist) {
      setErrorMessage(
        !normalizedTitle ? 'Please enter the song title.' : 'Please enter the artist name.'
      );
      return;
    }

    if (!guestName) {
      // Name was lost (e.g. Safari Private Browsing) — ask again instead of failing silently.
      setPendingVoteSongId(null);
      setShowNameModal(true);
      return;
    }

    {

      // Check for duplicate song (same title and artist, case-insensitive)
      const isDuplicate = localSongs.some(
        (song) =>
          normalizeText(song.title).toLowerCase() === normalizedTitle.toLowerCase() &&
          normalizeText(song.artist).toLowerCase() === normalizedArtist.toLowerCase()
      );

      if (isDuplicate) {
        const searchPhrase = `${normalizedTitle} ${normalizedArtist}`.trim();
        setSongSearchDraft(searchPhrase);
        setSongSearchQuery(searchPhrase);
        setErrorMessage('This song already exists — use search below to find and vote for it.');
        listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      try {
        setErrorMessage(null);
        setIsAddingSong(true);

        // Save to Supabase with guest name
        const result = await addSongToDb(normalizedTitle, normalizedArtist, guestName, {
          albumName: selectedAlbumName,
          artworkUrl: selectedArtworkUrl,
          previewUrl: selectedPreviewUrl,
        });

        if (result.ok) {
          ownAddedSongIdsRef.current.add(result.song.id);
          await refreshSongsFromDb();
          setSuccessMessage('Song added to the playlist ✨');

          setNewTitle('');
          setNewArtist('');
          setSelectedArtworkUrl(null);
          setSelectedAlbumName(null);
          setSelectedPreviewUrl(null);
          setSongSuggestions([]);
          setShowSuggestions(false);
          setIsFormVisible(false);
        } else if (result.reason === 'duplicate') {
          setSongSearchDraft(normalizedTitle);
          setSongSearchQuery(normalizedTitle);
          setErrorMessage('This song has already been suggested — find it in the list below and vote for it.');
        } else {
          setErrorMessage('Could not add your song — please check your connection and try again.');
        }
      } catch (error) {
        console.error('[music] Failed to add song:', error);
        setErrorMessage('Could not add your song — please check your connection and try again.');
      } finally {
        setIsAddingSong(false);
      }
    }
  };

  const handleVote = async (songId: string, providedGuestName?: string) => {
    if (votingStates[songId]) return;

    const resolvedGuestName = (providedGuestName ?? guestName).trim();
    if (!resolvedGuestName) {
      setPendingVoteSongId(songId);
      setShowNameModal(true);
      return;
    }

    try {
      setErrorMessage(null);

      const normalizedGuestName = resolvedGuestName;

      // Mark as voting
      setVotingStates((prev) => ({ ...prev, [songId]: true }));

      const voteResult = await submitSongVote(songId, userId, normalizedGuestName || 'Guest');

      if (typeof voteResult.votesLeft === 'number') {
        setVotesLeft(voteResult.votesLeft);
      }

      if (voteResult.ok) {
        setLocalSongs((prevSongs) =>
          prevSongs.map((song) => (song.id === songId ? { ...song, votes: song.votes + 1 } : song))
        );
        setVotedSongIds((prev) => new Set(prev).add(songId));
        setSongVotersById((prev) => {
          const current = prev[songId] || [];
          const name = normalizedGuestName || 'Guest';
          if (current.includes(name)) return prev;
          return {
            ...prev,
            [songId]: [...current, name],
          };
        });
        setSuccessMessage(
          typeof voteResult.votesLeft === 'number' && voteResult.votesLeft === 0
            ? 'Vote counted 💛 That was your last one — tap a voted song to move a vote.'
            : 'Vote counted 💛'
        );
      } else {
        if (voteResult.reason === 'guest_limit' || voteResult.reason === 'rate_limit_day') {
          setErrorMessage(
            `You've used all ${MAX_VOTES} votes. Tap a song you voted for to take that vote back, then vote here.`
          );
        } else if (voteResult.reason === 'network_song_limit') {
          setErrorMessage('Someone on this Wi-Fi already voted for this song. Switch to mobile data to add your vote.');
        } else if (voteResult.reason === 'rate_limit_network') {
          setErrorMessage('Lots of votes from this Wi-Fi today! Please try again tomorrow or switch to mobile data.');
        } else if (voteResult.reason === 'rate_limit_song_24h') {
          setErrorMessage('You already used a vote on this song.');
        } else if (voteResult.reason === 'duplicate_user' || voteResult.reason === 'duplicate_name') {
          setErrorMessage('You already voted for this song.');
          void refreshVoteCredits();
        } else if (voteResult.reason === 'song_not_found') {
          setErrorMessage('That song was removed from the playlist.');
          void refreshSongsFromDb();
        } else if (voteResult.reason === 'setup_required') {
          setErrorMessage('Voting is temporarily unavailable — we are fixing it. Please try again later.');
        } else {
          setErrorMessage('Could not register your vote — please check your connection and try again.');
        }
      }
    } catch (error) {
      console.error('[music] Failed to vote for song:', error);
      setErrorMessage('Could not register your vote — please check your connection and try again.');
    } finally {
      setVotingStates((prev) => ({ ...prev, [songId]: false }));
    }
  };

  const handleRemoveVote = async (songId: string) => {
    if (votingStates[songId]) return;

    try {
      setErrorMessage(null);
      setVotingStates((prev) => ({ ...prev, [songId]: true }));

      const result = await removeSongVote(songId, userId, guestName || null);

      if (typeof result.votesLeft === 'number') {
        setVotesLeft(result.votesLeft);
      }

      if (result.ok) {
        setLocalSongs((prevSongs) =>
          prevSongs.map((song) => (song.id === songId ? { ...song, votes: Math.max(0, song.votes - 1) } : song))
        );
        setVotedSongIds((prev) => {
          const next = new Set(prev);
          next.delete(songId);
          return next;
        });
        setSongVotersById((prev) => {
          const current = prev[songId] || [];
          const name = (guestName || '').trim().toLowerCase();
          const index = current.findIndex((voter) => voter.trim().toLowerCase() === name);
          if (index === -1) return prev;
          return { ...prev, [songId]: [...current.slice(0, index), ...current.slice(index + 1)] };
        });
        setSuccessMessage('Vote removed — you can use it on another song.');
      } else if (result.reason === 'not_voted') {
        void refreshVoteCredits();
        void refreshSongsFromDb();
      } else if (result.reason === 'setup_required') {
        setErrorMessage('Changing votes is not available yet. Please try again later.');
      } else {
        setErrorMessage('Could not remove your vote — please check your connection and try again.');
      }
    } catch (error) {
      console.error('[music] Failed to remove vote:', error);
      setErrorMessage('Could not remove your vote — please check your connection and try again.');
    } finally {
      setVotingStates((prev) => ({ ...prev, [songId]: false }));
    }
  };

  // ── 30-second song previews (one at a time) ───────────────────────────
  const stopPreview = useCallback(() => {
    resetPreviewAudio(previewAudioRef.current);
    if (playingSongIdRef.current) {
      document.dispatchEvent(new Event(PREVIEW_STOP_EVENT));
    }
    playingSongIdRef.current = null;
    setPlayingSongId(null);
    setPreviewProgress(0);
  }, []);

  const togglePreview = (songId: string, previewUrl: string) => {
    if (playingSongId === songId) {
      stopPreview();
      return;
    }

    if (!previewAudioRef.current) {
      const created = new Audio();
      created.preload = 'none';
      created.addEventListener('timeupdate', () => {
        if (created.duration > 0) setPreviewProgress(created.currentTime / created.duration);
      });
      created.addEventListener('ended', () => stopPreview());
      previewAudioRef.current = created;
    }

    setPreviewProgress(0);
    if (!playingSongIdRef.current) document.dispatchEvent(new Event(PREVIEW_START_EVENT));
    playingSongIdRef.current = songId;
    setPlayingSongId(songId);
    // play() must run synchronously inside the tap for iOS Safari to allow it.
    startPreviewAudio(previewAudioRef.current, previewUrl).catch((error) => {
      console.error('[music] Preview playback failed:', error);
      setErrorMessage('Could not play this preview right now.');
      stopPreview();
    });
  };

  useEffect(() => () => stopPreview(), [stopPreview]);

  // Stable sort keeps the server's tie order (oldest first) after optimistic vote changes.
  const sortedSongs = useMemo(
    () => [...localSongs].sort((a, b) => b.votes - a.votes),
    [localSongs]
  );

  const hasMoreSongs = localSongs.length < totalMatches;

  // Top 3 by votes across all songs (kept from the last unfiltered load while searching).
  const topSongIds = useMemo(
    () =>
      songSearchQuery
        ? storedTopSongIds
        : sortedSongs.filter((song) => song.votes > 0).slice(0, 3).map((song) => song.id),
    [songSearchQuery, storedTopSongIds, sortedSongs]
  );

  // Infinite scroll: load the next page when the end of the list nears.
  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasMoreSongs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMoreSongs();
      },
      { root, rootMargin: '0px 0px 240px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreSongs, loadMoreSongs, localSongs.length, isLoading]);

  const handleSongSearch = () => {
    setSongSearchQuery(songSearchDraft.trim());
  };

  const clearSongSearch = () => {
    setSongSearchDraft('');
    setSongSearchQuery('');
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const songVariants = {
    hidden: { opacity: 1, x: 0 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FCFBF8] via-[#F9F6F2] to-[#F4EEE8] text-[#3D3D3D]">
      <Navigation />

      <NewSongToasts toasts={newSongToasts} onDismiss={dismissToast} />

      <NameModal
        isOpen={showNameModal}
        onSubmit={handleNameModalSubmit}
        onCancel={() => {
          setShowNameModal(false);
          setPendingVoteSongId(null);
        }}
      />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#D4AF85]/20 blur-3xl" />
          <div className="absolute -bottom-20 right-8 h-44 w-44 rounded-full bg-[#8B7355]/10 blur-3xl" />
        </div>
        <div className="relative">
          <PageHeader
            title="Reception Music"
            eyebrow={
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD5] bg-white/80 px-4 py-2 text-sm font-medium text-[#8B7355] shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-[#D4AF85]" />
                Build our reception playlist together
              </span>
            }
            subtitle="Help us create the perfect playlist! Suggest songs and vote for your favorites. The songs with the most votes will be played at our reception."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-[#E8DDD5] bg-white/80 px-5 py-2.5 text-sm shadow-sm" data-testid="songs-count">
                <span className="font-semibold text-[#8B7355]">{totalSongs}</span>{' '}
                <span className="text-[#7E6A55]">suggested songs</span>
              </div>
              <div className="rounded-full border border-[#E8DDD5] bg-white/90 px-5 py-2.5 text-sm shadow-sm" data-testid="votes-left">
                <span className="font-semibold text-[#8B7355]">
                  {typeof votesLeft === 'number' ? votesLeft : '--'}
                </span>{' '}
                <span className="text-[#7E6A55]">votes left</span>
              </div>
            </div>
          </PageHeader>
        </div>
      </div>

      {/* Add Song Form */}
      <section className="pt-2 pb-4 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={handleSuggestSongClick}
            className="ui-btn ui-btn-accent w-full h-14 mb-6 text-base"
            data-testid="suggest-song-button"
          >
            <Plus className="w-5 h-5" />
            Suggest a Song
          </button>

          <AnimatePresence>
            {isFormVisible && (
              <motion.form
                initial={{ opacity: 1, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleAddSong}
                className="mb-8 overflow-hidden rounded-3xl border border-[#E8DDD5] bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(61,50,41,0.45)] backdrop-blur-sm sm:p-8"
              >
                <div className="space-y-6">
                  <div>
                    <label htmlFor="song-title-input" className="ui-label">
                      Song title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewTitle(value);
                        setSelectedArtworkUrl(null);
                        setSelectedAlbumName(null);
                        if (value.trim().length < 2) {
                          setSongSuggestions([]);
                          setShowSuggestions(false);
                          setIsFetchingSuggestions(false);
                        } else {
                          setShowSuggestions(true);
                        }
                      }}
                      onFocus={() => {
                        if (songSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setShowSuggestions(false), 150);
                      }}
                      id="song-title-input"
                      placeholder="Enter song title"
                      className="ui-input"
                      autoComplete="off"
                      required
                    />

                    {isFetchingSuggestions && (
                      <p className="mt-2 text-xs text-[#8B7355]">Searching songs...</p>
                    )}

                    {!isFetchingSuggestions && suggestionsUnavailable && newTitle.trim().length >= 2 && (
                      <p className="mt-2 text-xs text-[#8B7355]">
                        Song search isn&apos;t available right now — just type the title and artist yourself.
                      </p>
                    )}

                    {showSuggestions && songSuggestions.length > 0 && (
                      <div className="mt-3 rounded-2xl border border-[#E8DDD5] bg-white shadow-lg overflow-hidden">
                        <ul className="max-h-72 overflow-y-auto">
                          {songSuggestions.map((suggestion) => (
                            <li key={suggestion.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#F9F4EE] transition-colors"
                                style={{ touchAction: 'manipulation' }}
                              >
                                {suggestion.artworkUrl ? (
                                  <Image
                                    src={suggestion.artworkUrl}
                                    alt={`${suggestion.trackName} album art`}
                                    width={48}
                                    height={48}
                                    sizes="48px"
                                    className="h-12 w-12 rounded-lg object-cover border border-[#E8DDD5]"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-[#F3ECE5] border border-[#E8DDD5] flex items-center justify-center">
                                    <Music className="h-5 w-5 text-[#B89B7A]" />
                                  </div>
                                )}

                                <div className="min-w-0 [&_p]:mb-0">
                                  <p className="text-sm font-semibold text-[#6D5744] truncate">{suggestion.trackName}</p>
                                  <p className="text-xs text-[#8B7355] truncate">{suggestion.artistName}</p>
                                  <p className="text-[11px] text-[#A08A76] truncate">{suggestion.albumName}</p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="song-artist-input" className="ui-label">
                      Artist
                    </label>
                    <input
                      type="text"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      id="song-artist-input"
                      placeholder="Enter artist name"
                      className="ui-input"
                      required
                    />

                    {selectedArtworkUrl && (
                      <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-[#E8DDD5] bg-[#FCFAF6] px-3 py-2">
                        <Image
                          src={selectedArtworkUrl}
                          alt="Selected song artwork"
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-10 w-10 rounded-md object-cover border border-[#E8DDD5]"
                        />
                        <div className="[&_p]:mb-0">
                          <p className="text-xs text-[#8B7355] font-medium">Artwork preview</p>
                          {selectedAlbumName && (
                            <p className="text-[11px] text-[#A08A76] truncate max-w-[200px]">{selectedAlbumName}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isAddingSong}
                      className="ui-btn ui-btn-primary w-full sm:w-auto sm:flex-1"
                      data-testid="add-song-submit"
                    >
                      {isAddingSong ? 'Adding…' : 'Add Song'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      className="ui-btn ui-btn-ghost w-full sm:w-auto sm:flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 rounded-2xl border border-[#C07C7C] bg-[#FFF5F5] px-4 py-3 text-sm text-[#8B3A3A] shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="mb-0 text-sm">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-[#8B3A3A]/80 hover:text-[#8B3A3A]"
                  aria-label="Dismiss error message"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 rounded-2xl border border-[#B8CFA6] bg-[#F4FAEF] px-4 py-3 text-sm text-[#4A6B37] shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="mb-0 text-sm">{successMessage}</p>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-[#4A6B37]/80 hover:text-[#4A6B37]"
                  aria-label="Dismiss success message"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Songs List */}
      <section ref={listSectionRef} className="pt-6 pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-3xl font-bold text-[#8B7355]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Suggested Songs
            </motion.h2>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD5] bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8B7355]"
              data-testid="live-votes-badge"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8FB573] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6E9A55]" />
              </span>
              Live votes
            </span>
          </div>

          <div className="mb-6">
            <form
              role="search"
              className="ui-search"
              onSubmit={(e) => {
                e.preventDefault();
                handleSongSearch();
              }}
            >
              <Search aria-hidden="true" />
              <input
                type="search"
                value={songSearchDraft}
                onChange={(e) => setSongSearchDraft(e.target.value)}
                placeholder="Search songs or artists"
                aria-label="Search songs or artists"
                className="ui-input [&::-webkit-search-cancel-button]:hidden"
                data-testid="song-search-input"
                enterKeyHint="search"
              />
              {songSearchDraft && (
                <button
                  type="button"
                  onClick={clearSongSearch}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8B7355] transition-colors hover:bg-[#F3ECE5]"
                  style={{ touchAction: 'manipulation' }}
                  data-testid="song-search-clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
            {songSearchQuery && (
              <p className="mt-2 px-1 text-xs text-[#8B7355]">
                Showing {totalMatches} result{totalMatches === 1 ? '' : 's'} for “{songSearchQuery}”
              </p>
            )}
          </div>

          {isLoading ? (
            <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-lg">Loading songs...</p>
            </motion.div>
          ) : sortedSongs.length === 0 && !songSearchQuery ? (
            <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-lg">
                No songs suggested yet. Be the first to suggest one!
              </p>
            </motion.div>
          ) : sortedSongs.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-10 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-base">
                No matching songs found. Try a different title or artist.
              </p>
            </motion.div>
          ) : (
            <div className="relative">
            <AnimatePresence mode="popLayout">
              <div
                ref={scrollContainerRef}
                onScroll={(e) => setShowJumpTop(e.currentTarget.scrollTop > JUMP_TOP_AFTER_PX)}
                className="max-h-[460px] space-y-3 overflow-y-auto overscroll-contain pr-1"
                data-testid="songs-list"
              >
                {sortedSongs.map((song, index) => {
                  const hasVoted = votedSongIds.has(song.id);
                  const metadata = songMetadataById[song.id];
                  const previewUrl = song.previewUrl || metadata?.previewUrl || '';
                  const isPlaying = playingSongId === song.id;
                  const voters = songVotersById[song.id] || [];
                  const displayedVoters = voters.slice(-2);
                  const remainingVoters = Math.max(0, voters.length - displayedVoters.length);
                  const artworkUrl = song.artworkUrl || metadata?.artworkUrl || '';
                  const albumName = song.albumName || metadata?.albumName || 'Album information loading...';
                  return (
                    <motion.div
                      key={song.id}
                      variants={songVariants}
                      layout
                      className={`group bg-white/92 border border-[#E8DDD5] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all ${
                        freshSongIds.has(song.id) ? 'song-fresh-glow' : ''
                      }`}
                      data-testid={`song-card-${song.id}`}
                      data-fresh={freshSongIds.has(song.id) || undefined}
                    >
                      <div className="flex items-start justify-between gap-3.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            {topSongIds.includes(song.id) ? (
                              <span
                                className="flex w-7 flex-shrink-0 flex-col items-center leading-none"
                                aria-label={`Top ${topSongIds.indexOf(song.id) + 1} song`}
                                data-testid={`top-song-crown-${song.id}`}
                              >
                                <Crown className="h-4 w-4 fill-[#E9C46A] text-[#C9A227] drop-shadow-[0_1px_2px_rgba(201,162,39,0.45)]" />
                                <span className="mt-0.5 text-[11px] font-bold text-[#C9A227]">#{index + 1}</span>
                              </span>
                            ) : (
                              <span className="text-sm md:text-base font-bold text-[#D4AF85] w-7 flex-shrink-0">
                                #{index + 1}
                              </span>
                            )}

                            <div className="relative h-12 w-12 flex-shrink-0">
                              {artworkUrl ? (
                                <Image
                                  src={artworkUrl}
                                  alt={`${song.title} album art`}
                                  width={48}
                                  height={48}
                                  sizes="48px"
                                  className="h-12 w-12 rounded-lg object-cover border border-[#E8DDD5] shadow-sm"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-[#F3ECE5] border border-[#E8DDD5] flex items-center justify-center">
                                  <Music className="h-4 w-4 text-[#B89B7A]" />
                                </div>
                              )}
                              {previewUrl && (
                                <button
                                  type="button"
                                  onClick={() => togglePreview(song.id, previewUrl)}
                                  aria-label={isPlaying ? `Stop preview of ${song.title}` : `Play 30-second preview of ${song.title}`}
                                  data-testid={`preview-button-${song.id}`}
                                  className={`absolute inset-0 flex items-center justify-center rounded-lg transition-colors ${
                                    isPlaying ? 'bg-black/45' : 'bg-black/20 hover:bg-black/35'
                                  }`}
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow">
                                    {isPlaying ? (
                                      <Pause className="h-3.5 w-3.5 text-[#6D5744]" />
                                    ) : (
                                      <Play className="ml-0.5 h-3.5 w-3.5 text-[#6D5744]" />
                                    )}
                                  </span>
                                </button>
                              )}
                            </div>

                            <div className="min-w-0 [&_h3]:mb-0 [&_p]:mb-0">
                              <h3 className="text-base font-semibold leading-snug text-[#6D5744] truncate">
                                {song.title}
                              </h3>
                              <p className="text-xs text-[#4B4B4B] truncate">
                                by {song.artist}
                              </p>
                              <p className="text-[11px] text-[#9B866F] mt-0.5 truncate">
                                {albumName}
                              </p>
                              {isPlaying && (
                                <div
                                  className="mt-1 h-1 w-28 overflow-hidden rounded-full bg-[#EFE5DC]"
                                  aria-label="Preview progress"
                                >
                                  <div
                                    className="h-full bg-[#D4AF85] transition-[width] duration-200"
                                    style={{ width: `${Math.round(previewProgress * 100)}%` }}
                                  />
                                </div>
                              )}
                              <p className="text-[11px] text-[#8B7355] mt-1 tracking-wide">
                                Suggested by {song.suggestedBy}
                              </p>
                              <div className="mt-1 text-[11px] text-[#8B7355]/90 [&_p]:text-[11px]">
                                {voters.length > 0 ? (
                                  <p className="truncate">
                                    Liked by: {displayedVoters.join(', ')}
                                    {remainingVoters > 0 && (
                                      <>
                                        {', and '}
                                        <button
                                          type="button"
                                          onClick={() => setOpenVotersSongId(song.id)}
                                          className="font-semibold text-[#8B7355] underline underline-offset-2 hover:text-[#6D5744]"
                                          style={{ touchAction: 'manipulation' }}
                                        >
                                          {remainingVoters} more
                                        </button>
                                      </>
                                    )}
                                  </p>
                                ) : (
                                  <p>No votes yet</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-0.5 mr-0.5 flex flex-col items-end gap-1 flex-shrink-0">
                          <button
                            onClick={() => (hasVoted ? handleRemoveVote(song.id) : handleVote(song.id))}
                            disabled={votingStates[song.id]}
                            aria-pressed={hasVoted}
                            aria-label={hasVoted ? `Remove your vote for ${song.title}` : `Vote for ${song.title}`}
                            data-testid={`vote-button-${song.id}`}
                            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all min-w-[86px] active:scale-95 disabled:opacity-60 ${
                              hasVoted
                                ? 'bg-white text-[#8B7355] border-2 border-[#D4AF85]'
                                : 'bg-[#D4AF85] text-white hover:bg-[#C1A78C] shadow-md shadow-[#D4AF85]/30'
                            }`}
                            style={{ touchAction: 'manipulation' }}
                          >
                            {hasVoted ? <Check className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                            <span className="text-sm font-bold">{song.votes}</span>
                          </button>
                          {hasVoted && (
                            <span className="text-[10px] text-[#9B866F]">Tap to remove</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {hasMoreSongs && (
                  <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-3 text-xs text-[#8B7355]"
                    data-testid="songs-load-more"
                  >
                    {isLoadingMore ? 'Loading more songs…' : 'Scroll for more songs'}
                  </div>
                )}
              </div>
            </AnimatePresence>
            <AnimatePresence>
              {showJumpTop && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                  aria-label="Back to top of the song list"
                  data-testid="songs-back-to-top"
                  className="absolute bottom-3 left-1/2 z-10 -ml-[52px] inline-flex w-[104px] items-center justify-center gap-1.5 rounded-full border border-[#E8DDD5] bg-white/95 py-2 text-xs font-semibold text-[#8B7355] shadow-lg shadow-[#8B7355]/15 backdrop-blur-sm transition-colors hover:bg-[#FCFAF6] active:scale-95"
                  style={{ touchAction: 'manipulation' }}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  Top
                </motion.button>
              )}
            </AnimatePresence>
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-[#9B866F]">
            Tap the album art to hear a 30-second preview · Previews courtesy of{' '}
            <a
              href="https://music.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[#6D5744]"
            >
              Apple Music
            </a>
          </p>
        </motion.div>
      </section>

      {/* Info Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#8B7355]/10 border-t border-[#E8DDD5]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <h2
            className="text-2xl md:text-3xl font-bold text-[#8B7355] mb-7 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center rounded-2xl border border-[#E8DDD5] bg-white/80 p-5 shadow-sm">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">1</div>
              <p className="text-[#3D3D3D] leading-relaxed">
                <span className="font-semibold">Suggest</span> your favorite songs
              </p>
            </div>
            <div className="text-center rounded-2xl border border-[#E8DDD5] bg-white/80 p-5 shadow-sm">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">2</div>
              <p className="text-[#3D3D3D] leading-relaxed">
<span className="font-semibold">Vote</span> for up to 5 songs you love — tap again to move a vote
              </p>
            </div>
            <div className="text-center rounded-2xl border border-[#E8DDD5] bg-white/80 p-5 shadow-sm">
              <div className="text-3xl font-bold text-[#D4AF85] mb-2">3</div>
              <p className="text-[#3D3D3D] leading-relaxed">
                <span className="font-semibold">Enjoy</span> the top-voted songs at our reception!
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {openVotersSongId && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4"
          onClick={() => setOpenVotersSongId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#E8DDD5] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-[#6D5744]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                People who liked this song
              </h3>
              <button
                type="button"
                onClick={() => setOpenVotersSongId(null)}
                className="rounded-lg p-1 text-[#8B7355] hover:bg-[#F5F1ED]"
                aria-label="Close voters list"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {(songVotersById[openVotersSongId] || []).map((name, idx) => (
                <li
                  key={`${name}-${idx}`}
                  className="rounded-xl border border-[#EFE5DC] bg-[#FCFAF6] px-3 py-2 text-sm text-[#6D5744]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
