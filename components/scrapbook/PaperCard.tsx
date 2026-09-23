import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Tape from "./Tape";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  /** static rotation in degrees */
  rotation?: number;
  /** render a washi tape strip on top */
  tape?: boolean;
  tapeColor?: string;
}

/** The base scrapbook paper container. */
export default function PaperCard({
  children,
  className,
  rotation = 0,
  tape = false,
  tapeColor,
}: PaperCardProps) {
  return (
    <div
      className={cn("paper-card relative rounded-md", className)}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      {tape && <Tape color={tapeColor} />}
      {children}
    </div>
  );
}
