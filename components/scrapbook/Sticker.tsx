import { cn } from "@/lib/utils";

interface StickerProps {
  emoji: string;
  label?: string;
  rotation?: number;
  className?: string;
}

/** A round-ish sticker with an emoji and optional handwritten label. */
export default function Sticker({ emoji, label, rotation = 0, className }: StickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-paper-light px-2 py-1 text-sm shadow-[0_1px_2px_rgba(48,43,39,0.1)]",
        className
      )}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      <span aria-hidden className="text-base leading-none">
        {emoji}
      </span>
      {label ? <span className="handwritten text-base text-brown">{label}</span> : null}
    </span>
  );
}
