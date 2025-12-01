"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { track } from "../lib/ga4";

/**
 * Desktop-only pinned countdown CTA rendered via a portal to avoid stacking/transform issues.
 */
export default function PinnedCountdownDesktopQuickEstimate() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [done, setDone] = useState(false);
  // Time-based message state
  const [isBusinessHours, setIsBusinessHours] = useState(true);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if current time is between 6am-7pm
  useEffect(() => {
    const checkBusinessHours = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsBusinessHours(hour >= 6 && hour < 19); // 6am to 7pm
    };
    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (done) return;
    if (countdown <= 0) {
      setDone(true);
      return;
    }
    const id = setTimeout(() => setCountdown(v => v - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, done]);

  const totalSeconds = 10;
  const progress = done ? 100 : Math.min(100, ((totalSeconds - countdown) / totalSeconds) * 100);

  useEffect(() => {
    let running = true;
    const calc = () => {
      const btn = buttonRef.current;
      const label = labelRef.current;
      const bar = barRef.current;
      if (!btn || !label || !bar) return;
      // Reserved for any dynamic sizing/measurement if needed
    };
    const loop = () => {
      if (!running) return;
      calc();
      requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", calc);
    return () => { running = false; window.removeEventListener("resize", calc); };
  }, [done]);

  if (!mounted || typeof document === "undefined") return null;

  const card = (
    <div className="fixed inset-x-0 bottom-8 z-[2147483647] hidden md:block pointer-events-none" data-debug="desktop-pinned-card-portal">
      <div className="px-6 pointer-events-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.18)] border border-black/5 ring-1 ring-black/5">
          <div className="px-6 pt-5 text-center text-midnight text-sm leading-snug font-nhd font-medium">
            "Before you get your quick estimate... Check out what people like you had to say!"
          </div>
          <div className="p-5 pt-3">
            <button
              ref={buttonRef}
              className={`relative w-full overflow-hidden rounded-full h-14 px-6 py-0 text-lg font-extrabold tracking-tight transition-colors ${!done ? 'opacity-70 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
              style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.12)' }}
              disabled={!done}
              onClick={() => { if (done) { try { track({ name: 'reviews_move_forward_click', params: { device: 'desktop' } }); } catch {}; router.push('/schedule'); } }}
            >
              <span
                ref={barRef}
                className="absolute inset-y-0 left-0 z-10 pointer-events-none bg-sky-300"
                style={{ width: `${progress}%`, transition: 'width 1s linear' }}
              />
              <span className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <span ref={labelRef} className="text-midnight">
                  {done ? 'Move Forward' : countdown}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center text-white"
                  style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                >
                  {done ? 'Move Forward' : countdown}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(card, document.body);
}


