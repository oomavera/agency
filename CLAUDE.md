# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 website for Agency, a house cleaning service business in Oviedo, FL. The site is heavily optimized for local SEO and includes multiple city-specific landing pages, a quote calculator, and lead generation forms. The project uses TypeScript, Tailwind CSS, and includes Supabase integration for data storage.

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lhci         # Run Lighthouse CI (full audit)
npm run lhci:collect # Collect Lighthouse data only
npm run lhci:assert  # Assert Lighthouse thresholds only
```

## Architecture & Key Components

### App Structure (Next.js App Router)
- `/src/app/` - App Router pages and layouts
- `/src/app/layout.tsx` - Root layout with SEO metadata and Local Schema
- `/src/app/page.tsx` - Homepage with quote calculator
- `/src/app/house-cleaning-{city}-fl/` - City-specific landing pages
- `/src/app/estimate/` - Quote calculator page

### Core Components
- `QuoteCalculator.tsx` - Interactive pricing calculator (main CTA)
- `CityPageLayout.tsx` - Template for city landing pages
- `LocalSchema.tsx` - JSON-LD structured data for local SEO
- `PhotoCarousel.tsx` - Image gallery component
- `LeadModal/LeadForm.tsx` - Lead capture forms

### Configuration & Data
- `/src/lib/config.ts` - App-wide configuration constants
- `/content/cities/` - YAML files for city data and keywords
- `/content/specs/city-template.yaml` - Template for new city pages

### SEO Infrastructure
- Automated sitemap generation (`/src/app/sitemap.ts`)
- Robots.txt configuration (`/src/app/robots.ts`)
- Local business schema markup in root layout
- Lighthouse CI with performance thresholds (.lighthouserc.js)

## City Page System
The site uses a template-driven approach for city pages:
1. City data stored in `/content/cities/{city}.yaml`
2. SERP analysis data in `/content/cities/serp-{city}.json`
3. Keyword research in `/content/cities/keywords-{city}.json`
4. Pages follow naming convention: `/house-cleaning-{city}-fl/`

## Performance & SEO Standards
- Lighthouse CI enforces minimum scores: Performance 90%, Accessibility 95%, SEO 90%
- Images optimized to WebP format
- Local Schema markup for Google My Business integration
- Core Web Vitals optimization priority

## Database Integration
- Supabase integration for lead storage (`/src/lib/supabase.ts`)
- Lead capture forms submit to Supabase tables
- Test utilities in `/src/utils/testSupabase.ts`

## Development Notes
- Uses Framer Motion for animations with reduced motion support
- Three.js integration for 3D house visualization
- Tailwind CSS for styling with custom color palette
- TypeScript strict mode enabled
- All images should be optimized for web (WebP preferred)