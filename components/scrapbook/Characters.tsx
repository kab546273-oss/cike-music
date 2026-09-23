// ============================================================
// components/scrapbook/Characters.tsx
// A pool of tiny hand-drawn sticker characters that walk along
// the music progress path. Warm brown pencil outlines, muted
// vintage fills, slightly wobbly lines — like doodles in a
// music journal.
// ============================================================

interface CharProps {
  size?: number;
  className?: string;
}

const ink = "#5a4a3a";
const olive = "#84906B";
const brick = "#B86F5E";
const cream = "#D4B96A";
const brown = "#8a7058";
const pink = "#C9907E";
const soft = "#E8DCC8";

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    className,
    "aria-hidden": true as const,
  };
}

/* 1. Cat — sitting, side glance */
export function CharCat({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* body */}
      <path d="M8 24c0-4 2-7 6-7s6 3 6 7" fill={cream} fillOpacity="0.4" />
      {/* head */}
      <circle cx="20" cy="13" r="5.5" fill={cream} fillOpacity="0.4" />
      {/* ears */}
      <path d="M16 9l-1.5-4 3 2M24 9l1.5-4-3 2" fill={cream} fillOpacity="0.3" />
      {/* eye */}
      <circle cx="21.5" cy="12.5" r="0.8" fill={ink} />
      {/* nose + mouth */}
      <path d="M23 14.5l.8.5M23 14.5l-.8.5" />
      {/* tail */}
      <path d="M8 22c-3 0-4-2-3.5-4.5" />
      {/* whiskers */}
      <path d="M16 14h-2M16 15.5h-2" strokeWidth="0.8" />
    </svg>
  );
}

/* 2. Rabbit — sitting with long ears */
export function CharRabbit({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* body */}
      <ellipse cx="16" cy="23" rx="6" ry="5" fill={pink} fillOpacity="0.35" />
      {/* head */}
      <circle cx="16" cy="14" r="5" fill={pink} fillOpacity="0.35" />
      {/* long ears */}
      <ellipse cx="13" cy="6.5" rx="1.8" ry="4.5" fill={pink} fillOpacity="0.3" transform="rotate(-8 13 6.5)" />
      <ellipse cx="19" cy="6.5" rx="1.8" ry="4.5" fill={pink} fillOpacity="0.3" transform="rotate(8 19 6.5)" />
      {/* eyes */}
      <circle cx="14" cy="13.5" r="0.7" fill={ink} />
      <circle cx="18" cy="13.5" r="0.7" fill={ink} />
      {/* nose */}
      <path d="M15.3 15.5h1.4l-.7 1Z" fill={brick} fillOpacity="0.5" />
      {/* mouth */}
      <path d="M16 16.5v1M16 17.5c-.8.5-1.5.3-2-.2M16 17.5c.8.5 1.5.3 2-.2" strokeWidth="0.9" />
      {/* feet */}
      <ellipse cx="12" cy="27.5" rx="2" ry="1" fill={pink} fillOpacity="0.3" />
      <ellipse cx="20" cy="27.5" rx="2" ry="1" fill={pink} fillOpacity="0.3" />
    </svg>
  );
}

/* 3. Bird — round little bird */
export function CharBird({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* body */}
      <ellipse cx="16" cy="18" rx="7" ry="6" fill={olive} fillOpacity="0.35" />
      {/* head */}
      <circle cx="21" cy="12" r="4.5" fill={olive} fillOpacity="0.35" />
      {/* beak */}
      <path d="M25 11.5l3 1-3 1.5Z" fill={cream} />
      {/* eye */}
      <circle cx="22" cy="11" r="0.8" fill={ink} />
      {/* wing */}
      <path d="M12 17c-2-1-3.5 0-4 2 1.5.5 3 0 4-1Z" fill={olive} fillOpacity="0.3" />
      {/* tail */}
      <path d="M9 18l-4-1.5 1 3 3-1Z" fill={olive} fillOpacity="0.3" />
      {/* feet */}
      <path d="M14 24v2M18 24v2M13 26h2M17 26h2" strokeWidth="1" />
      {/* cheek */}
      <circle cx="23.5" cy="13" r="1" fill={pink} fillOpacity="0.4" />
    </svg>
  );
}

/* 4. Person — tiny walking figure */
export function CharPerson({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* head */}
      <circle cx="16" cy="8" r="3.5" fill={cream} fillOpacity="0.4" />
      {/* hair */}
      <path d="M12.5 7c.5-2 2.5-3 3.5-3s3 1 3.5 3" fill={brown} fillOpacity="0.3" />
      {/* eye */}
      <circle cx="17" cy="8" r="0.6" fill={ink} />
      {/* body */}
      <path d="M16 11.5v8" />
      {/* arms */}
      <path d="M16 14l-4 2M16 14l4 1.5" />
      {/* legs — walking pose */}
      <path d="M16 19.5l-3 5M16 19.5l3.5 4.5" />
      {/* scarf */}
      <path d="M13 11.5h6l-1 2-4 0Z" fill={brick} fillOpacity="0.4" />
    </svg>
  );
}

/* 5. Paper plane — folded, flying */
export function CharPaperPlane({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16L28 6l-7 20-4-8-13-2Z" fill={soft} fillOpacity="0.8" />
      <path d="M17 18l7 8M17 18L4 16" />
      <path d="M17 18l-2-6" strokeWidth="0.9" />
      {/* tiny trail dots */}
      <circle cx="3" cy="22" r="0.6" fill={ink} fillOpacity="0.3" />
      <circle cx="5.5" cy="25" r="0.5" fill={ink} fillOpacity="0.2" />
    </svg>
  );
}

/* 6. Note character — eighth note with a tiny face */
export function CharNote({ size = 24, className }: CharProps) {
  return (
    <svg {...base(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* note head */}
      <ellipse cx="12" cy="22" rx="4" ry="3" transform="rotate(-15 12 22)" fill={brick} fillOpacity="0.45" />
      {/* stem */}
      <path d="M15.5 20.5V8" />
      {/* flag */}
      <path d="M15.5 8c4 1 6 3 6 6-3-1-5-2.5-6-4Z" fill={brick} fillOpacity="0.3" />
      {/* tiny face on note head */}
      <circle cx="11" cy="21.5" r="0.5" fill={ink} />
      <path d="M12.5 22.5c.5.3 1 .3 1.5 0" strokeWidth="0.7" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* Registry & deterministic assignment                         */
/* ---------------------------------------------------------- */

export const CHARACTERS = [
  CharCat,
  CharRabbit,
  CharBird,
  CharPerson,
  CharPaperPlane,
  CharNote,
] as const;

export const CHARACTER_NAMES = ["cat", "rabbit", "bird", "person", "paper-plane", "note"] as const;

/** Deterministically pick a character index from a song id. */
export function pickCharacter(songId: string): number {
  let h = 2166136261;
  for (let i = 0; i < songId.length; i++) {
    h ^= songId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) % CHARACTERS.length;
}
