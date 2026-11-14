'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import NameModal from '@/components/NameModal';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Music, ThumbsUp, Plus, Sparkles, X, Search, Play, Pause, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAllSongs, addSongToDb, submitSongVote, removeSongVote, getGuestVoteStatus, getSongVotersBySongIds, saveSongPreviewUrl, normalizeText, type SongData } from '@/lib/songs';

type LocalSong = {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  votes: number;
  albumName: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
};

const toLocalSong = (song: SongData): LocalSong => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  suggestedBy: song.suggested_by,
  votes: song.vote_count,
  albumName: song.album_name || null,
  artworkUrl: song.artwork_url || null,
  previewUrl: song.preview_url || null,
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
  const [realtimeStatus, setRealtimeStatus] = useState<'realtime' | 'polling'>('polling');
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
  const songIdsRef = useRef<string[]>([]);
  const listSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    songIdsRef.current = localSongs.map((song) => song.id);
  }, [localSongs]);

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

  const refreshSongsFromDb = useCallback(async () => {
    const dbSongs = await getAllSongs();
    const formattedSongs = dbSongs.map(toLocalSong);
    setLocalSongs(formattedSongs);
    await refreshSongVoters(formattedSongs.map((song) => song.id));
  }, [refreshSongVoters]);

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

  // Load songs and vote credits from Supabase on mount
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    
    const loadSongs = async () => {
      try {
        setErrorMessage(null);
        if (!isMounted) return;

    await Promise.all([refreshSongsFromDb(), refreshVoteCredits()]);

        if (!isMounted) return;

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load songs:', error);
        if (isMounted) {
          setErrorMessage('Could not load songs right now. Please refresh and try again.');
          setIsLoading(false);
        }
      }
    };

    loadSongs();
    
    return () => {
      isMounted = false; // Cleanup
    };
  }, [refreshSongsFromDb, refreshVoteCredits]);

  // Realtime sync across tabs/devices for songs + vote counts
  useEffect(() => {
    const channel = supabase
      .channel('songs-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'songs' },
        async () => {
          await refreshSongsFromDb();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'song_votes' },
        async () => {
          const currentSongIds = songIdsRef.current;
          if (currentSongIds.length > 0) {
            await Promise.all([refreshSongVoters(currentSongIds), refreshVoteCredits()]);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('realtime');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('polling');
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshSongsFromDb, refreshSongVoters, refreshVoteCredits]);

  // Fallback sync for environments where realtime may be unavailable
  useEffect(() => {
    if (realtimeStatus === 'realtime') return;

    const intervalId = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      await Promise.all([refreshSongsFromDb(), refreshVoteCredits()]);
    }, 10000);

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
  }, [refreshSongsFromDb, realtimeStatus, refreshVoteCredits]);

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

  // Sort songs by votes
  const sortedSongs = useMemo(
    () => [...localSongs].sort((a, b) => b.votes - a.votes),
    [localSongs]
  );

  const filteredSongs = useMemo(() => {
    const normalizedQuery = songSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return sortedSongs;

    return sortedSongs.filter((song) => {
      const haystack = `${song.title} ${song.artist} ${song.suggestedBy}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [songSearchQuery, sortedSongs]);

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

      <NameModal
        isOpen={showNameModal}
        onSubmit={handleNameModalSubmit}
        onCancel={() => {
          setShowNameModal(false);
          setPendingVoteSongId(null);
        }}
      />

      {/* Header */}
      <section className="relative overflow-hidden pt-32 pb-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#D4AF85]/20 blur-3xl" />
          <div className="absolute -bottom-20 right-8 h-44 w-44 rounded-full bg-[#8B7355]/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8DDD5] bg-white/80 px-4 py-2 text-sm font-medium text-[#8B7355] shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#D4AF85]" />
            Build our reception playlist together
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="rounded-full bg-white/80 p-2 shadow-sm">
              <Music className="w-7 h-7 text-[#D4AF85]" />
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold text-[#3D3D3D] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Reception Music
            </h1>
          </div>
          <p className="text-lg md:text-xl text-[#7E6A55] font-light max-w-2xl mx-auto leading-relaxed">
            Help us create the perfect playlist! Suggest songs and vote for your
            favorites. The songs with the most votes will be played at our reception.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-xl border border-[#E8DDD5] bg-white/75 px-4 py-2 text-sm shadow-sm">
              <span className="font-semibold text-[#8B7355]">{sortedSongs.length}</span>{' '}
              <span className="text-[#7E6A55]">suggested songs</span>
            </div>
            <div className="rounded-xl border border-[#E8DDD5] bg-white/85 px-4 py-2 text-sm shadow-sm">
              <span className="font-semibold text-[#8B7355]">
                {typeof votesLeft === 'number' ? votesLeft : '--'}
              </span>{' '}
              <span className="text-[#7E6A55]">votes left</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Add Song Form */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={handleSuggestSongClick}
            className="w-full mb-7 px-7 py-4 bg-[#D4AF85] text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#D4AF85]/30 hover:bg-[#C1A78C] transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ touchAction: 'manipulation' }}
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
                className="bg-white/90 backdrop-blur-sm border border-[#E8DDD5] p-7 sm:p-8 rounded-2xl shadow-lg mb-8"
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#8B7355] mb-2">
                      Song Title *
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
                      placeholder="Enter song title"
                      className="w-full px-4 py-3 border border-[#E8DDD5] rounded-xl focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20 bg-white"
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

                                <div className="min-w-0">
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
                    <label className="block text-sm font-semibold text-[#8B7355] mb-2">
                      Artist *
                    </label>
                    <input
                      type="text"
                      value={newArtist}
                      onChange={(e) => setNewArtist(e.target.value)}
                      placeholder="Enter artist name"
                      className="w-full px-4 py-3 border border-[#E8DDD5] rounded-xl focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20 bg-white"
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
                        <div>
                          <p className="text-xs text-[#8B7355] font-medium">Artwork preview</p>
                          {selectedAlbumName && (
                            <p className="text-[11px] text-[#A08A76] truncate max-w-[200px]">{selectedAlbumName}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      disabled={isAddingSong}
                      className="flex-1 px-5 py-3 bg-[#8B7355] text-white rounded-xl font-semibold hover:bg-[#6B5345] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                      style={{ touchAction: 'manipulation' }}
                    >
                      {isAddingSong ? 'Adding…' : 'Add Song'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      className="flex-1 px-5 py-3 border border-[#D4AF85] text-[#8B7355] rounded-xl font-semibold hover:bg-[#F5F1ED] transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ touchAction: 'manipulation' }}
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
                <p>{errorMessage}</p>
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
                <p>{successMessage}</p>
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
      <section ref={listSectionRef} className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-3xl font-bold text-[#8B7355]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Suggested Songs
            </motion.h2>
            <span className="rounded-full border border-[#E8DDD5] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8B7355]">
              {realtimeStatus === 'realtime' ? 'Live votes • realtime' : 'Live votes • auto-sync'}
            </span>
          </div>

          <div className="mb-6 rounded-2xl border border-[#E8DDD5] bg-white/80 p-3 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={songSearchDraft}
                onChange={(e) => setSongSearchDraft(e.target.value)}
                placeholder="Search by song or artist"
                className="w-full rounded-xl border border-[#E8DDD5] bg-white px-3 py-2 text-sm text-[#5D4A38] focus:outline-none focus:border-[#D4AF85] focus:ring-2 focus:ring-[#D4AF85]/20"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSongSearch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B7355] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6B5345]"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
                {songSearchQuery && (
                  <button
                    type="button"
                    onClick={clearSongSearch}
                    className="rounded-xl border border-[#D8C8B8] px-4 py-2 text-sm font-semibold text-[#8B7355] hover:bg-[#F6F1EB]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {songSearchQuery && (
              <p className="mt-2 text-xs text-[#8B7355]">
                Showing {filteredSongs.length} result{filteredSongs.length === 1 ? '' : 's'} for “{songSearchQuery}”
              </p>
            )}
          </div>

          {isLoading ? (
            <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-lg">Loading songs...</p>
            </motion.div>
          ) : sortedSongs.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-lg">
                No songs suggested yet. Be the first to suggest one!
              </p>
            </motion.div>
          ) : filteredSongs.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-10 bg-white/70 border border-[#E8DDD5] rounded-2xl shadow-sm">
              <p className="text-[#8B7355] text-base">
                No matching songs found. Try a different title or artist.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {filteredSongs.map((song, index) => {
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
                      className="group bg-white/92 border border-[#E8DDD5] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-sm md:text-base font-bold text-[#D4AF85] w-7 flex-shrink-0">
                              #{index + 1}
                            </span>

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

                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-[#6D5744] truncate">
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
                              <div className="mt-1 text-[10px] text-[#8B7355]/90">
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
              </div>
            </AnimatePresence>
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
