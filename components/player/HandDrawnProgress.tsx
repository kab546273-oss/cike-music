"use client";

// ============================================================
// components/player/HandDrawnProgress.tsx
// A hand-drawn pencil path that doubles as the music progress
// bar. A tiny doodle character walks along the path as the song
// plays. Click or drag to seek.
// ============================================================

import { useCallback, useRef, useState } from "react";
import { CHARACTERS, pickCharacter } from "@/components/scrapbook/Characters";
import { formatTime } from "@/lib/utils";

interface HandDrawnProgressProps {
  /** 0 ~ 1 */
  progress: number;
  isPlaying: boolean;
  /** song id for deterministic character assignment */
  songId: string;
  /** called with the target time (seconds) when user seeks */
  onSeek: (time: number) => void;
  /** total duration in seconds — needed to convert click position */
  duration: number;
  /** compact mode for mobile (smaller, no time labels) */
  compact?: boolean;
}

/**
 * A gentle hand-drawn wavy path. The same path string is used for
 * both the played (colored) and unplayed (faint dashed) layers,
 * with strokeDasharray controlling how much is "drawn".
 */
const PATH_D = "M6,16 C40,10 80,20 120,15 S200,10 240,16 S320,20 360,14 S390,16 394,15";

// Tiny decorative marks along the path — stars, dots, leaves.
// Positions are x-coordinates in the 400-wide viewBox.
const DECOR = [
  { x: 60, y: 8, type: "dot", color: "#D4B96A" },
  { x: 140, y: 22, type: "star", color: "#84906B" },
  { x: 220, y: 7, type: "dot", color: "#C9907E" },
  { x: 300, y: 23, type: "leaf", color: "#84906B" },
  { x: 370, y: 8, type: "dot", color: "#D4B96A" },
];

function DecorMark({ x, y, type, color }: { x: number; y: number; type: string; color: string }) {
  if (type === "star") {
    return (
      <path
        d={`M${x},${y - 2.5}l.6,1.5 1.6,.2-1.2,1.1.3,1.6-1.3-.7-1.3,.7.3-1.6-1.2-1.1 1.6-.2Z`}
        fill={color}
        fillOpacity="0.5"
        stroke="#5a4a3a"
        strokeWidth="0.5"
      />
    );
  }
  if (type === "leaf") {
    return (
      <path
        d={`M${x},${y}c1.5,-1.5 3.5,-1 3.5,1c0,1.5-1.5,2.5-3,2c-1,-.5-1.5,-2-.5-3Z`}
        fill={color}
        fillOpacity="0.4"
        stroke="#5a4a3a"
        strokeWidth="0.5"
      />
    );
  }
  return <circle cx={x} cy={y} r="1.3" fill={color} fillOpacity="0.45" />;
}

export default function HandDrawnProgress({
  progress,
  isPlaying,
  songId,
  onSeek,
  duration,
  compact = false,
}: HandDrawnProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  // State (not a ref) — the transition rules below are read during render,
  // and React forbids touching refs in render (react-hooks/refs).
  const [dragging, setDragging] = useState(false);

  const charIdx = pickCharacter(songId);
  const Char = CHARACTERS[charIdx];

  /** Convert a pointer x-coordinate to a seek time. */
  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el || duration <= 0) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      seekFromClientX(e.clientX);
    },
    [seekFromClientX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      seekFromClientX(e.clientX);
    },
    [dragging, seekFromClientX]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  /** 键盘可操作：← → 微调，Shift 加大步长，Home / End 跳首尾。 */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (duration <= 0) return;
      const step = e.shiftKey ? 0.1 : 0.02;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onSeek(Math.min(duration, (progress + step) * duration));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSeek(Math.max(0, (progress - step) * duration));
      } else if (e.key === "Home") {
        e.preventDefault();
        onSeek(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onSeek(duration);
      }
    },
    [duration, onSeek, progress]
  );

  const charSize = compact ? 18 : 22;
  const barHeight = compact ? 22 : 30;

  return (
    <div
      ref={barRef}
      className="relative w-full cursor-pointer select-none touch-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/50"
      style={{ height: barHeight }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${formatTime(progress * duration)} / ${formatTime(duration)}`}
      aria-label="播放进度"
    >
      <svg
        viewBox="0 0 400 30"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* unplayed path — faint pencil dashed line */}
        <path
          d={PATH_D}
          stroke="#b5a48c"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
        />

        {/* played path — warm colored pencil stroke */}
        <path
          d={PATH_D}
          stroke="#B86F5E"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={`${Math.max(0.001, progress)} 1`}
          style={{ transition: dragging ? "none" : "stroke-dasharray 0.3s linear" }}
        />

        {/* decorative marks */}
        {DECOR.map((d, i) => (
          <DecorMark key={i} {...d} />
        ))}
      </svg>

      {/* walking character */}
      <div
        className="pointer-events-none absolute top-1/2"
        style={{
          left: `${progress * 100}%`,
          transform: `translate(-50%, -55%)`,
          transition: dragging ? "none" : "left 0.3s linear",
        }}
      >
        <div
          className={isPlaying ? "char-walk" : "char-idle"}
          style={{
            // slight tilt based on progress for organic feel
            transform: `rotate(${Math.sin(progress * Math.PI * 4) * 2}deg)`,
          }}
        >
          <Char size={charSize} />
        </div>
        {/* tiny dust dots under character when playing */}
        {isPlaying && (
          <div className="char-dust absolute -bottom-0.5 left-1/2 -translate-x-1/2">
            <span className="dust-dot" style={{ left: -4 }} />
            <span className="dust-dot" style={{ left: 0, animationDelay: "0.15s" }} />
            <span className="dust-dot" style={{ left: 4, animationDelay: "0.3s" }} />
          </div>
        )}
      </div>

      {/* inline keyframes — scoped to this component */}
      <style jsx>{`
        .char-walk {
          animation: charWalk 0.7s ease-in-out infinite;
        }
        .char-idle {
          animation: charIdle 2.5s ease-in-out infinite;
        }
        @keyframes charWalk {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          25% { transform: translateY(-2.5px) rotate(1deg); }
          50% { transform: translateY(-1px) rotate(2deg); }
          75% { transform: translateY(-3px) rotate(-1deg); }
        }
        @keyframes charIdle {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-1.5px) rotate(1deg); }
        }
        .char-dust {
          width: 0;
          height: 0;
        }
        .dust-dot {
          position: absolute;
          bottom: 0;
          width: 2.5px;
          height: 2.5px;
          border-radius: 50%;
          background: #b5a48c;
          opacity: 0;
          animation: dustFade 0.8s ease-out infinite;
        }
        @keyframes dustFade {
          0% { opacity: 0.5; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(3px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}
