"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PaperCard from "@/components/scrapbook/PaperCard";

interface AIRegenerationProps {
  visible: boolean;
  onComplete: () => void;
  /**
   * Real chips coming from the /api/feedback diff — the styles that
   * were newly excluded, and the mood / BPM band that changed.
   * These used to be hardcoded ("− 高人声 / + 治愈"), which made the
   * most trust-critical screen in the product show invented data.
   */
  excluded: string[];
  /** New preferences after re-understanding. */
  added: string[];
}

/**
 * Paper-shuffle animation triggered by negative feedback (skips).
 * Steps are pinned one by one over ~3.5s, then onComplete fires.
 */
export default function AIRegeneration({
  visible,
  onComplete,
  excluded,
  added,
}: AIRegenerationProps) {
  // step: 0 hidden, 1..6 visible lines, 7 finished
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) {
      // reset timeline when hidden
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(0);
      return;
    }
    // start the paper-shuffle timeline
     
    setStep(1);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (at: number, fn: () => void) => {
      timers.push(setTimeout(fn, at));
    };
    schedule(650, () => setStep(2));
    schedule(1250, () => setStep(3));
    schedule(2000, () => setStep(4));
    schedule(2600, () => setStep(5));
    schedule(3200, () => setStep(6));
    schedule(3700, () => {
      setStep(7);
      onComplete();
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="regen"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <PaperCard rotation={-0.8} className="mx-auto max-w-md p-7">
            <div className="flex min-h-[180px] flex-col justify-center gap-3">
              {step >= 1 && (
                <Line delay={0.05}>
                  <span className="handwritten text-2xl text-ink">✦ 我好像发现了什么</span>
                </Line>
              )}
              {step >= 2 && (
                <Line delay={0.05}>
                  <span className="text-sm text-brown">你似乎不太喜欢刚才的风格。</span>
                </Line>
              )}
              {step >= 3 && excluded.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {excluded.map((label, i) => (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, x: -24, rotate: -6 }}
                      animate={{ opacity: 1, x: 0, rotate: -3 }}
                      transition={{ delay: i * 0.18, type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-full bg-paper-dark px-2.5 py-1 text-xs text-brown line-through"
                    >
                      − {label}
                    </motion.span>
                  ))}
                </div>
              ) : null}
              {step >= 4 && (
                <Line delay={0.05}>
                  <span className="handwritten text-xl text-brown">
                    我正在重新理解你的这一刻……
                  </span>
                </Line>
              )}
              {step >= 5 && added.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {added.map((label, i) => (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, x: 24, rotate: 5 }}
                      animate={{ opacity: 1, x: 0, rotate: -2 }}
                      transition={{ delay: i * 0.18, type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-full bg-olive px-2.5 py-1 text-xs text-paper-light"
                    >
                      + {label}
                    </motion.span>
                  ))}
                </div>
              ) : null}
              {step >= 5 && added.length === 0 ? (
                <Line delay={0.05}>
                  <span className="text-sm text-brown">这次已经换过方向了。</span>
                </Line>
              ) : null}
              {step >= 6 && (
                <Line delay={0.05}>
                  <span className="handwritten text-2xl text-olive">调整完成 ✓</span>
                </Line>
              )}
            </div>
          </PaperCard>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Line({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
