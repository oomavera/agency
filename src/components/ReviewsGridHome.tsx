"use client";
import React from "react";
import Image from "next/image";

type Props = {
  images: string[];
};

export default function ReviewsGridHome({ images }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {images.map((imageSrc, i) => (
        <div key={i} className="relative py-2">
          <Image
            src={imageSrc}
            alt={`Customer review ${i + 1}`}
            width={600}
            height={600}
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 22vw"
            quality={70}
            className="w-full h-auto"
            loading="lazy"
            decoding="async"
            style={{
              filter: 'none',
              mixBlendMode: 'normal',
              opacity: 1,
              backdropFilter: 'none'
            }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src.endsWith('.avif')) {
                img.src = img.src.replace('.avif', '.webp');
              } else if (img.src.endsWith('.webp')) {
                img.src = img.src.replace('.webp', '.jpg');
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}


