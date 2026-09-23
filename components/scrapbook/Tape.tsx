import { cn } from "@/lib/utils";

interface TapeProps {
  color?: string;
  rotation?: number;
  /** override absolute positioning, e.g. { top: -10, left: 20 } */
  style?: React.CSSProperties;
  className?: string;
}

/** A semi-transparent washi-tape strip pinned onto paper. */
export default function Tape({
  color = "rgba(228, 199, 120, 0.6)",
  rotation = -3,
  style,
  className,
}: TapeProps) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute block h-6 w-20 shadow-[0_1px_2px_rgba(48,43,39,0.12)]", className)}
      style={{
        background: color,
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    />
  );
}
