// ============================================================
// components/scrapbook/Doodles.tsx
// A collection of hand-drawn sticker-style SVG illustrations
// for song covers. Wobbly lines, muted vintage colors, organic
// shapes — like doodles drawn in a music journal with pencil
// and colored pencil.
// ============================================================

interface DoodleProps {
  size?: number;
  className?: string;
  /** 卡带专用：让两个卷盘转起来（默认关闭，封面里的卡带不受影响） */
  spinning?: boolean;
}

const ink = "#5a4a3a";
const olive = "#84906B";
const brick = "#B86F5E";
const cream = "#D4B96A";
const blue = "#7A8FA6";
const pink = "#C9907E";
const soft = "#E8DCC8";

function baseProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    className,
    "aria-hidden": true as const,
  };
}

/* ---------------------------------------------------------- */
/* 1. Headphones                                              */
/* ---------------------------------------------------------- */
export function DoodleHeadphones({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 28v-6c0-8 6.5-13 14-13s14 5 14 13v6" />
      <rect x="7" y="26" width="7" height="12" rx="3" fill={olive} fillOpacity="0.35" />
      <rect x="34" y="26" width="7" height="12" rx="3" fill={olive} fillOpacity="0.35" />
      <path d="M9 32c1.5.8 3 .8 4.5 0M34.5 32c1.5.8 3 .8 4.5 0" strokeWidth="1" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 2. Cassette tape                                           */
/* ---------------------------------------------------------- */
export function DoodleCassette({ size = 48, className, spinning = false }: DoodleProps) {
  /** 卷盘：spinning 时包一层可旋转的 g，并加两根辐条让转动看得出来 */
  const reel = (cx: number, reverse: boolean) => (
    <g
      className={
        spinning ? (reverse ? "reel-spin-reverse" : "reel-spin") : undefined
      }
    >
      <circle cx={cx} cy="31" r="3.5" fill={cream} />
      <circle cx={cx} cy="31" r="1" fill={ink} />
      {spinning ? (
        <path d={`M${cx} 28.6 v4.8 M${cx - 2.4} 31 h4.8`} strokeWidth="0.8" />
      ) : null}
    </g>
  );

  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="12" width="36" height="26" rx="2.5" fill={soft} fillOpacity="0.6" />
      <rect x="10" y="17" width="28" height="8" rx="1" fill={cream} fillOpacity="0.4" />
      {reel(17, false)}
      {reel(31, true)}
      <path d="M14 13.5h20" strokeWidth="1" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 3. Vinyl record                                           */
/* ---------------------------------------------------------- */
export function DoodleVinyl({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round">
      <path d="M24 6c9.9 0 18 8.1 18 18s-8.1 18-18 18S6 33.9 6 24 14.1 6 24 6Z" fill="#3a332e" />
      <circle cx="24" cy="24" r="13" stroke="#5a4a3a" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="24" cy="24" r="6" fill={brick} fillOpacity="0.7" />
      <circle cx="24" cy="24" r="1.5" fill={soft} />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 4. Music note                                              */
/* ---------------------------------------------------------- */
export function DoodleNote({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="15" cy="36" rx="5" ry="3.8" transform="rotate(-15 15 36)" fill={brick} fillOpacity="0.5" />
      <ellipse cx="34" cy="32" rx="5" ry="3.8" transform="rotate(-15 34 32)" fill={olive} fillOpacity="0.5" />
      <path d="M19 36V14l18-3v19" />
      <path d="M19 14c0 3 4 5 8 4" strokeWidth="1.2" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 5. Small radio                                            */
/* ---------------------------------------------------------- */
export function DoodleRadio({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="16" width="34" height="22" rx="3" fill={soft} fillOpacity="0.6" />
      <rect x="11" y="22" width="14" height="8" rx="1" fill={cream} fillOpacity="0.4" />
      <circle cx="31" cy="25" r="3" fill={olive} fillOpacity="0.4" />
      <circle cx="31" cy="32" r="2" fill={brick} fillOpacity="0.4" />
      <path d="M24 16V8l8-4" />
      <circle cx="32" cy="4.5" r="1.5" fill={brick} />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 6. Microphone                                             */
/* ---------------------------------------------------------- */
export function DoodleMic({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="6" width="12" height="18" rx="6" fill={brick} fillOpacity="0.35" />
      <path d="M12 22c0 6 5 10 12 10s12-4 12-10" />
      <path d="M24 32v6M18 42h12M21 38h6" />
      <path d="M20 11h8M20 15h8" strokeWidth="1" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 7. Coffee cup                                              */
/* ---------------------------------------------------------- */
export function DoodleCoffee({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 18h20l-2 18c0 2-1.5 3-3.5 3h-9c-2 0-3.5-1-3.5-3l-2-18Z" fill={cream} fillOpacity="0.35" />
      <path d="M33 21h3c2.5 0 4 1.5 4 3.5S38.5 28 36 28h-3" />
      <path d="M19 12c0-2 2-2 2-4M24 12c0-2 2-2 2-4M29 12c0-2 2-2 2-4" strokeWidth="1.3" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 8. Flower                                                  */
/* ---------------------------------------------------------- */
export function DoodleFlower({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="18" r="4" fill={cream} />
      <ellipse cx="24" cy="10" rx="3.5" ry="5" fill={pink} fillOpacity="0.5" />
      <ellipse cx="24" cy="26" rx="3.5" ry="5" fill={pink} fillOpacity="0.5" />
      <ellipse cx="16" cy="18" rx="5" ry="3.5" fill={pink} fillOpacity="0.5" />
      <ellipse cx="32" cy="18" rx="5" ry="3.5" fill={pink} fillOpacity="0.5" />
      <path d="M24 22v18M24 34c-3-1-5-3-5-6" />
      <path d="M24 38c2 0 4-1 5-3" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 9. Star                                                    */
/* ---------------------------------------------------------- */
export function DoodleStar({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 8l4.5 9.5L39 19l-7.5 7 2 10.5L24 31l-9.5 5.5 2-10.5L9 19l10.5-1.5L24 8Z" fill={cream} fillOpacity="0.55" />
      <path d="M40 8l1.2 2.5L44 11l-2.5 1.2L40 15l-1.2-2.8L36 11l2.8-1.5L40 8Z" fill={brick} fillOpacity="0.4" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 10. Moon                                                   */
/* ---------------------------------------------------------- */
export function DoodleMoon({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 8c-9 2-15 10-15 19 0 3 .8 6 2 8.5C13 33 11 29 11 24c0-10 8-18 19-18Z" fill={cream} fillOpacity="0.5" />
      <path d="M36 14l.8 1.8 2 .2-1.5 1.4.5 2-1.8-1-1.8 1 .5-2-1.5-1.4 2-.2.8-1.8Z" fill={brick} fillOpacity="0.4" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 11. Cloud                                                  */
/* ---------------------------------------------------------- */
export function DoodleCloud({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 34c-3 0-5-2-5-5 0-2 1-4 3-5 0-4 3-7 7-7 2-3 6-4 9-2 3 1 5 4 5 7 2 0 4 2 4 5 0 3-2 5-5 5H14Z" fill={soft} fillOpacity="0.8" />
      <path d="M18 38l-1.5 3M25 38l-1.5 3M32 38l-1.5 3" stroke={blue} strokeWidth="1.5" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 12. Sun                                                    */
/* ---------------------------------------------------------- */
export function DoodleSun({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="9" fill={cream} fillOpacity="0.5" />
      <path d="M24 8V4M24 44v-4M8 24H4M44 24h-4M12.7 12.7l-2.8-2.8M38.1 38.1l-2.8-2.8M35.3 12.7l2.8-2.8M9.9 38.1l2.8-2.8" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 13. Heart                                                  */
/* ---------------------------------------------------------- */
export function DoodleHeart({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 40C14 32 8 26 8 19c0-5 4-9 9-9 3 0 6 2 7 4 1-2 4-4 7-4 5 0 9 4 9 9 0 7-6 13-16 21Z" fill={brick} fillOpacity="0.45" />
      <path d="M17 17c1.5-1 3-1.5 4.5-1" strokeWidth="1.2" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 14. Bow                                                    */
/* ---------------------------------------------------------- */
export function DoodleBow({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 24L10 14c-2-1.5-4 0-4 2v16c0 2 2 3.5 4 2l14-10Z" fill={olive} fillOpacity="0.4" />
      <path d="M24 24l14-10c2-1.5 4 0 4 2v16c0 2-2 3.5-4 2L24 24Z" fill={olive} fillOpacity="0.4" />
      <circle cx="24" cy="24" r="3.5" fill={brick} fillOpacity="0.5" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 15. Butterfly                                              */
/* ---------------------------------------------------------- */
export function DoodleButterfly({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="15" cy="18" rx="7" ry="6" fill={pink} fillOpacity="0.4" />
      <ellipse cx="33" cy="18" rx="7" ry="6" fill={pink} fillOpacity="0.4" />
      <ellipse cx="16" cy="32" rx="5" ry="5" fill={blue} fillOpacity="0.35" />
      <ellipse cx="32" cy="32" rx="5" ry="5" fill={blue} fillOpacity="0.35" />
      <path d="M24 12v24" strokeWidth="2" />
      <path d="M21 11c0-2 1.5-3 3-3s3 1 3 3" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 16. Camera                                                 */
/* ---------------------------------------------------------- */
export function DoodleCamera({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="15" width="34" height="22" rx="3" fill={soft} fillOpacity="0.6" />
      <path d="M17 15l3-5h8l3 5" />
      <circle cx="24" cy="26" r="6" fill={blue} fillOpacity="0.3" />
      <circle cx="24" cy="26" r="2.5" />
      <circle cx="34" cy="19" r="1.5" fill={brick} />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 17. Cat                                                    */
/* ---------------------------------------------------------- */
export function DoodleCat({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20l-2-8 7 4M36 20l2-8-7 4" fill={soft} fillOpacity="0.5" />
      <circle cx="24" cy="26" r="13" fill={soft} fillOpacity="0.5" />
      <circle cx="19" cy="24" r="1.3" fill={ink} />
      <circle cx="29" cy="24" r="1.3" fill={ink} />
      <path d="M22 29c.8.6 1.5.6 2 0 .5.6 1.2.6 2 0" strokeWidth="1.2" />
      <path d="M16 28l-3-.5M16 30l-3 .5M32 28l3-.5M32 30l3 .5" strokeWidth="1" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* 18. Sparkles                                               */
/* ---------------------------------------------------------- */
export function DoodleSparkles({ size = 48, className }: DoodleProps) {
  return (
    <svg {...baseProps(size, className)} stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill={cream} fillOpacity="0.5" />
      <path d="M34 24l1.5 4.5L40 30.5l-4.5 1.5L34 36.5l-1.5-4.5L28 30.5l4.5-1.5L34 24Z" fill={olive} fillOpacity="0.4" />
      <path d="M14 34l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" fill={brick} fillOpacity="0.35" />
    </svg>
  );
}

/* ---------------------------------------------------------- */
/* Registry                                                   */
/* ---------------------------------------------------------- */

export const DOODLES = [
  DoodleHeadphones,
  DoodleCassette,
  DoodleVinyl,
  DoodleNote,
  DoodleRadio,
  DoodleMic,
  DoodleCoffee,
  DoodleFlower,
  DoodleStar,
  DoodleMoon,
  DoodleCloud,
  DoodleSun,
  DoodleHeart,
  DoodleBow,
  DoodleButterfly,
  DoodleCamera,
  DoodleCat,
  DoodleSparkles,
] as const;

export const DOODLE_NAMES = [
  "headphones", "cassette", "vinyl", "note", "radio", "mic",
  "coffee", "flower", "star", "moon", "cloud", "sun",
  "heart", "bow", "butterfly", "camera", "cat", "sparkles",
] as const;
