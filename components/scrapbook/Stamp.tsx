import { cn } from "@/lib/utils";

interface StampProps {
  text: string;
  rotation?: number;
  className?: string;
}

/** A dashed-border postage stamp / ink stamp look. */
export default function Stamp({ text, rotation = -6, className }: StampProps) {
  return (
    <span
      className={cn(
        "inline-block border-2 border-dashed border-brick px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brick",
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {text}
    </span>
  );
}
