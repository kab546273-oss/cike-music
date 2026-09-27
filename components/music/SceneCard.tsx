"use client";

import { motion } from "framer-motion";
import type { ScenePreset } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SceneIcon } from "@/components/scrapbook/DoodleIcons";

interface SceneCardProps {
  scene: ScenePreset;
  onClick: () => void;
  selected?: boolean;
}

/** A scrapbook-style scene card. */
export default function SceneCard({ scene, onClick, selected }: SceneCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      style={{ rotate: scene.rotation }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "paper-card group relative flex flex-col items-center gap-2 rounded-md px-4 py-4 text-center",
        selected && "ring-2 ring-brick"
      )}
    >
      <SceneIcon id={scene.id} size={30} />
      <span className="handwritten text-2xl leading-tight text-ink">{scene.label}</span>
    </motion.button>
  );
}
