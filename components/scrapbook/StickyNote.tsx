import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyNoteProps {
  children: ReactNode;
  /** background color — defaults to cream sticky yellow */
  color?: string;
  rotation?: number;
  className?: string;
}

/** A small paper sticky note with a soft shadow. */
export default function StickyNote({
  children,
  color = "rgba(228, 199, 120, 0.55)",
  rotation = -1.5,
  className,
}: StickyNoteProps) {
  return (
    <div
      className={cn(
        "relative rounded-sm p-4 shadow-[0_2px_6px_rgba(48,43,39,0.12)]",
        className
      )}
      style={{ background: color, transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </div>
  );
}
