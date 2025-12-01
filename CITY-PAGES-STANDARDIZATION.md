# City Pages Standardization Task List

## Overview
Transform all city-specific pages to match the landing page aesthetic while preserving SEO content. Each page should have consistent layout, typography, and user experience while maintaining unique city-specific content.

**Status**: ✅ Oviedo page completed as template
**Remaining**: Winter Park, Lake Mary, Orlando, Longwood

## Phase 1: Component Structure Setup

### 1.1 Create Reusable Hero Section Component
- **File**: `src/components/CityHero.tsx`
- **Purpose**: Extract hero section from landing page for reuse
- **Features**:
  - Configurable H1, subtitle, CTA button
  - Consistent typography and spacing
  - Responsive design
  - City-specific content injection

### 1.2 Standardize Header Component
- **Status**: ✅ Complete (`CityPageHeader.tsx`)
- **Verify**: Logo sizing, phone number positioning, CTA button styling

### 1.3 Create City-Specific Layout Template
- **File**: `src/components/CityPageLayout.tsx`
- **Status**: ✅ Complete (`CityPageLayout.tsx`)
- **Verify**: Container spacing, hero integration, SEO metadata handling
- **Features**:
  - Consistent section spacing (mb-12)
  - Standardized max-width containers (max-w-4xl)
  - Reusable section wrapper components
  - SEO metadata handling

## Phase 2: Content Structure Standardization

### 2.1 Hero Section Template
```typescript
// Template structure
H1: "House Cleaning [CITY] FL | Agency"
Subtitle: "Licensed, insured cleaners serving [CITY] and surrounding areas - book in 60 seconds"
CTA: "Get Your Instant Quote"
```
- **Status**: ✅ Complete (`CityHero.tsx`)
- **Verify**: Renders H1, subtitle, and CTA correctly
- **Usage**: Integrated in `CityPageLayout.tsx` and applied in `src/app/house-cleaning-oviedo-fl/page.tsx`

### 2.2 Calculator Section
- **Status**: ✅ Complete (`QuoteCalculator.tsx`)
- **Verify**: Positioned below hero and styled consistently as on landing page

### 2.3 Content Sections (Standard Order)
1. **Intro Section**: 2-3 paragraphs about city-specific benefits
2. **Quick Answer Box**: Blue background, city-specific value proposition
3. **Photo Gallery**: City-specific images with consistent carousel
4. **Why Choose Us**: 6 bullet points with city-specific examples
5. **Services**: 3 service types with city-specific details
6. **Pricing**: City-specific pricing information
7. **Service Areas**: ZIP codes and neighborhoods
8. **FAQ**: 6 questions with city-specific answers
9. **CTAs**: 2 call-to-action boxes
- **Status**: ✅ Complete for Oviedo template
- **Verify**: All 9 sections present in `src/app/house-cleaning-oviedo-fl/page.tsx`

## Phase 3: SEO Content Standardization

### 3.1 Meta Data Template
```typescript
// Template for each city
title: "House Cleaning [CITY] FL | Agency"
description: "House cleaning [CITY] FL families trust. Flat-rate pricing (avg $[PRICE]), eco-friendly options, and $25 off your first clean."
```
- **Status**: ✅ Complete (`layout.tsx`)
- **Verify**: Title, meta description, and OpenGraph tags correctly rendered in city layout
- **Usage**: Metadata exported in `src/app/house-cleaning-oviedo-fl/layout.tsx`

### 3.2 Schema Markup Standardization
- **LocalBusiness schema** for each city
- **FAQPage schema** with city-specific questions
- **Service schema** with city-specific offers
- **Location-specific data** (ZIP codes, landmarks)
- **Status**: ✅ Complete (`page.tsx` components)
- **Verify**: JSON-LD scripts validate without errors in Rich Results Test
- **Usage**: Inline `<script type="application/ld+json">` in each city page component

### 3.3 Internal Linking Strategy
- Link to other city pages
- Link to main services pages
- Consistent anchor text patterns
- Proper link distribution
- **Status**: ✅ Complete (Oviedo page)
- **Verify**: Links present and correct in “Areas We Serve” section of Oviedo page
- **Usage**: Implemented via JSX anchor tags in city page components

## Phase 4: City-Specific Customization

### 4.1 Content Personalization Matrix

| Element | Oviedo ✅ | Winter Park | Lake Mary | Orlando | Longwood |
|---------|-----------|-------------|-----------|---------|----------|
| H1 | "House Cleaning Oviedo FL" | "House Cleaning Winter Park FL" | "House Cleaning Lake Mary FL" | "House Cleaning Orlando FL" | "House Cleaning Longwood FL" |
| Primary Keyword | "house cleaning Oviedo FL" | "house cleaning Winter Park FL" | "house cleaning Lake Mary FL" | "house cleaning Orlando FL" | "house cleaning Longwood FL" |
| Average Price | $205 | $210 | $200 | $215 | $195 |
| Key Neighborhoods | Alafaya Woods, Kingsbridge East | College Park, Baldwin Park | Heathrow, Lake Mary | Thornton Park, Mills 50 | Longwood Village, Wekiva |
| Landmarks | Oviedo on the Park, Lukas Nursery | Park Avenue, Rollins College | Heathrow Business Park | Lake Eola, Thornton Park | Wekiva Springs, Longwood Village |

### 4.2 Image Optimization
- **Create city-specific image sets**: ✅ Defined `galleryImages` with src & alt in Oviedo page
- **Optimize all images to <200KB**: 🔄 Placeholders created; manual compression needed
- **Convert to WebP format**: ✅ Using `.webp` in gallery images
- **Add proper alt text for each city**: ✅ Integrated alt text in `PhotoCarousel` & page
- **Implement lazy loading**: ✅ Provided by `next/image` component

## Phase 5: Implementation Tasks

### 5.1 Create Remaining City Pages
- [ ] `/house-cleaning-winter-park-fl/page.tsx`
- [ ] `/house-cleaning-lake-mary-fl/page.tsx`
- [ ] `/house-cleaning-orlando-fl/page.tsx`
- [ ] `/house-cleaning-longwood-fl/page.tsx`

### 5.2 Layout Files for Each City
- [ ] Create `layout.tsx` for each city with proper metadata
- [ ] Ensure consistent structure across all pages
- [ ] Implement proper SEO metadata

### 5.3 Content Population
- [ ] Use existing YAML data from `/content/cities/`
- [ ] Populate city-specific content from generated HTML files
- [ ] Maintain SEO keyword density (5-12 occurrences)
- [ ] Ensure unique content across cities (<30% overlap)

## Phase 6: Quality Assurance

### 6.1 Visual Consistency Check
- [ ] Verify header positioning across all pages
- [ ] Check calculator alignment and styling
- [ ] Ensure consistent spacing and typography
- [ ] Test responsive design on mobile/tablet
- [ ] Verify color scheme consistency

### 6.2 SEO Validation
- [ ] Run each page through Google Rich Results Test
- [ ] Verify schema markup validity
- [ ] Check meta description length (150-160 characters)
- [ ] Ensure proper heading hierarchy (H1 → H2 → H3)
- [ ] Validate JSON-LD structure

### 6.3 Performance Testing
- [ ] Lighthouse scores for each page
- [ ] Core Web Vitals optimization
- [ ] Image loading performance
- [ ] First Contentful Paint optimization
- [ ] Mobile usability scores

## Phase 7: Deployment & Monitoring

### 7.1 Update Sitemap
- [ ] Add all new city URLs to `sitemap.ts`
- [ ] Set appropriate priority and change frequency
- [ ] Submit to Google Search Console
- [ ] Update robots.txt if needed

### 7.2 Internal Link Audit
- [ ] Verify all internal links work
- [ ] Check for broken links
- [ ] Ensure proper anchor text distribution
- [ ] Test cross-linking between city pages

### 7.3 Post-Launch Monitoring
- [ ] Monitor Google Search Console for indexing
- [ ] Track page performance metrics
- [ ] Monitor for any 404 errors
- [ ] Check mobile usability scores
- [ ] Monitor Core Web Vitals

## Implementation Priority

### High Priority (Week 1)
1. Tasks 1.1-1.3 (Core structure)
2. Tasks 2.1-2.3 (Content structure)
3. Tasks 5.1-5.2 (Page creation)

### Medium Priority (Week 2)
1. Tasks 3.1-3.3 (SEO standardization)
2. Tasks 4.1-4.2 (Customization)
3. Tasks 5.3 (Content population)

### Low Priority (Week 3)
1. Tasks 6.1-6.3 (QA)
2. Tasks 7.1-7.3 (Deployment & monitoring)

## Success Criteria

### Visual Consistency
- [ ] All pages have identical header layout
- [ ] Calculator positioning is consistent
- [ ] Typography matches landing page
- [ ] Color scheme is uniform
- [ ] Spacing and margins are standardized

### SEO Performance
- [ ] Each page has unique, valuable content
- [ ] Keyword density is optimal (5-12 occurrences)
- [ ] Schema markup validates correctly
- [ ] Meta descriptions are compelling
- [ ] Internal linking is strategic

### User Experience
- [ ] Pages load quickly (<3 seconds)
- [ ] Mobile experience is excellent
- [ ] Navigation is intuitive
- [ ] CTAs are prominent and clear
- [ ] Content is scannable and engaging

## Notes

- **Content Source**: Use existing YAML files and generated HTML content
- **Design Reference**: Match landing page aesthetic exactly
- **SEO Preservation**: Maintain all existing SEO value while improving UX
- [ ] Testing: Test each page individually and as part of the site
- [ ] Documentation: Update any relevant documentation after completion

## Files to Create/Modify

### New Files
- `src/components/CityHero.tsx`
- `src/components/CityPageLayout.tsx`