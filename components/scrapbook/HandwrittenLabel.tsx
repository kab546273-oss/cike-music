import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HandwrittenLabelProps {
  children: ReactNode;
  className?: string;
}

/** Caveat handwritten label. Use only for headings / notes / decoration. */
export default function HandwrittenLabel({ children, className }: HandwrittenLabelProps) {
  return (
    <span className={cn("handwritten text-brown", className)}>{children}</span>
  );
}
