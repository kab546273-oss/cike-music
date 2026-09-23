"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Heart, ListMusic, MapPin, Mic } from "lucide-react";
import PaperCard from "@/components/scrapbook/PaperCard";
import Tape from "@/components/scrapbook/Tape";

interface AIThinkingProps {
  visible: boolean;
}

const STEPS = [
  { icon: Mic, text: "正在听你说……" },
  { icon: MapPin, text: "找到你的场景……" },
  { icon: Heart, text: "理解你的情绪……" },
  { icon: Activity, text: "调整节奏……" },
  { icon: ListMusic, text: "为你整理音乐……" },
];

/** Paper-note-by-note parsing animation. */
export default function AIThinking({ visible }: AIThinkingProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="thinking"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <PaperCard tape rotation={-0.6} className="mx-auto max-w-md p-6">
            <Tape color="rgba(132,144,107,0.55)" />
            <motion.ul
              className="flex flex-col gap-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.55 } },
              }}
            >
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={step.text}
                    variants={{
                      hidden: { opacity: 0, y: 10, rotate: -1.5 },
                      show: { opacity: 1, y: 0, rotate: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="flex items-center gap-3 text-sm text-ink"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-dark text-brown">
                      <Icon size={15} className="animate-pulse-soft" />
                    </span>
                    <span className="handwritten text-xl text-brown">{step.text}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </PaperCard>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
