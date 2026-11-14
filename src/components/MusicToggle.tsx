'use client';

type Props = {
  isMuted: boolean;
  onToggle: () => void;
  testId: string;
};

// Gold "now playing" equalizer: bars dance while music plays, rest with a soft slash when muted.
export default function MusicToggle({ isMuted, onToggle, testId }: Props) {
  const label = isMuted ? 'Play background music' : 'Mute background music';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={!isMuted}
      title={label}
      data-testid={testId}
      className={`music-toggle relative flex h-10 w-10 items-center justify-center rounded-full border bg-white/85 backdrop-blur-sm transition-[transform,border-color,background-color] duration-200 hover:bg-white active:scale-90 ${
        isMuted ? 'border-[#E8DDD5]' : 'border-[#D4AF85]/70 music-toggle-on'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <span className={`flex h-4 items-end gap-[3px] ${isMuted ? 'is-muted' : ''}`} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="music-eq-bar w-[3px] rounded-full" />
        ))}
      </span>
      <span
        aria-hidden="true"
        className={`absolute h-[2px] w-6 -rotate-45 rounded-full bg-[#B08A5E] transition-[opacity,transform] duration-300 ${
          isMuted ? 'scale-100 opacity-80' : 'scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
