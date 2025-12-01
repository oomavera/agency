import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "../utils/usePrefersReducedMotion";

interface PhotoCarouselProps {
  images: Array<{ src: string; alt: string }>;
}

const AUTO_SCROLL_INTERVAL = 2000;

export default function PhotoCarousel({ images }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Auto-scroll on mobile
  useEffect(() => {
    if (prefersReducedMotion) return;
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, AUTO_SCROLL_INTERVAL);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    } else {
      return () => {};
    }
  }, [current, images.length, prefersReducedMotion]);

  const goTo = (idx: number) => {
    setCurrent((idx + images.length) % images.length);
  };

  // Swipe support
  const startX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current !== null) {
      const dx = e.changedTouches[0].clientX - startX.current;
      if (dx > 50) goTo(current - 1);
      if (dx < -50) goTo(current + 1);
    }
    startX.current = null;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      <div
        className="w-full aspect-[16/9] bg-snow rounded-xl overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[current].src}
          alt={images[current].alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 800px"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="rounded-full bg-arctic px-3 py-1 text-lg font-bold text-mountain hover:bg-mountain hover:text-snow transition"
          onClick={() => goTo(current - 1)}
          aria-label="Previous photo"
        >
          &#8592;
        </button>
        <button
          className="rounded-full bg-arctic px-3 py-1 text-lg font-bold text-mountain hover:bg-mountain hover:text-snow transition"
          onClick={() => goTo(current + 1)}
          aria-label="Next photo"
        >
          &#8594;
        </button>
      </div>
      <div className="flex gap-1 mt-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full ${i === current ? "bg-mountain" : "bg-arctic"}`}
          />
        ))}
      </div>
    </div>
  );
} 