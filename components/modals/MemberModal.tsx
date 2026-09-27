"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
}

/** Lossless-audio membership upsell — demo UI only, no real payment. */
export default function MemberModal({ open, onClose }: MemberModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="member-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="paper-card relative w-full max-w-sm rounded-lg p-7"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-brown/85 hover:text-ink"
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            <h2 className="handwritten text-center text-3xl leading-tight text-ink">
              让这一刻，
              <br />
              听得更完整。
            </h2>
            <p className="mt-2 text-center text-sm text-brown">
              开通豪华绿钻，解锁无损音质与专属手账皮肤。
            </p>

            {/* membership card visual */}
            <div className="mt-5 rounded-lg bg-gradient-to-br from-olive via-[#6f7d58] to-[#4f5a3e] p-4 shadow-[0_6px_18px_rgba(80,90,60,0.35)]">
              <div className="flex items-center justify-between">
                <span className="handwritten text-2xl text-paper-light">豪华绿钻</span>
                <Gem size={26} className="text-cream" fill="rgba(228,199,120,0.4)" />
              </div>
              <div className="mt-6 h-1.5 w-2/3 rounded-full bg-paper-light/30" />
              <div className="mt-2 h-1.5 w-1/3 rounded-full bg-paper-light/20" />
              <p className="mt-4 text-xs tracking-[0.2em] text-paper-light/70">CIKE MUSIC · LOSSLESS</p>
            </div>

            <button
              type="button"
              onClick={() => {
                trackEvent("member_modal_click", { plan: "luxury_green_diamond" });
                 
                console.log("[demo] open membership checkout");
                onClose();
              }}
              className="mt-5 w-full rounded-md bg-brick py-3 text-sm font-semibold text-paper-light transition-transform hover:scale-[1.02]"
            >
              开通豪华绿钻 →
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-md py-2 text-sm text-brown transition-colors hover:text-ink"
            >
              以后再说
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
