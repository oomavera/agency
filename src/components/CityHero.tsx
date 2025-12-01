"use client";

import Link from "next/link";

interface CityHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref?: string;
}

export default function CityHero({ title, subtitle, ctaText, ctaHref = '#estimate' }: CityHeroProps) {
  return (
    <section className="bg-snow py-12 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-700 mb-8">{subtitle}</p>
        <Link
          href={ctaHref}
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
} 