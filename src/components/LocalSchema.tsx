import React from 'react';

const LocalSchema = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://scalinghomeservices.com/#business",
    "name": "Scaling Home Services",
    "alternateName": "Scaling Home Services Cleaning",
    "description": "Professional house cleaning services in Oviedo, Florida. We provide standard and deep cleaning packages for residential properties. Top-rated cleaning service in Oviedo, Winter Park, Casselberry, and surrounding areas.",
    "url": "https://scalinghomeservices.com",
    "telephone": "(407) 470-1780",
    "email": "admin@scalinghomeservices.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address",
      "addressLocality": "Oviedo",
      "addressRegion": "FL",
      "addressCountry": "US",
      "postalCode": "32765"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.6661",
      "longitude": "-81.2084"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Oviedo",
        "sameAs": "https://en.wikipedia.org/wiki/Oviedo,_Florida"
      },
      {
        "@type": "City", 
        "name": "Winter Park",
        "sameAs": "https://en.wikipedia.org/wiki/Winter_Park,_Florida"
      },
      {
        "@type": "City",
        "name": "Casselberry", 
        "sameAs": "https://en.wikipedia.org/wiki/Casselberry,_Florida"
      },
      {
        "@type": "City",
        "name": "Winter Springs",
        "sameAs": "https://en.wikipedia.org/wiki/Winter_Springs,_Florida"
      },
      {
        "@type": "City",
        "name": "Altamonte Springs",
        "sameAs": "https://en.wikipedia.org/wiki/Altamonte_Springs,_Florida"
      },
      {
        "@type": "City",
        "name": "Longwood",
        "sameAs": "https://en.wikipedia.org/wiki/Longwood,_Florida"
      }
    ],
    "serviceType": [
      "House Cleaning",
      "Residential Cleaning", 
      "Deep Cleaning",
      "Standard Cleaning",
      "Maid Service",
      "Move In Cleaning",
      "Move Out Cleaning",
      "Weekly Cleaning",
      "Biweekly Cleaning",
      "One Time Cleaning"
    ],
    "priceRange": "$125-$200",
    "paymentAccepted": "Cash, Check, Credit Card, Venmo, Zelle",
    "currenciesAccepted": "USD",
    "openingHours": "Mo-Sa 08:00-18:00",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "25",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Deja J."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Absolutely amazing service! My first cleaning was completely free and my bathroom looks spectacular! Will definitely be booking more cleanings with Scaling Home Services! Best cleaning service in Oviedo!"
      },
      {
        "@type": "Review", 
        "author": {
          "@type": "Person",
          "name": "Hani S."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Angelica's service is 10/10. After her service my place smelled so good and everything was cleaned to perfection. Will definitely reach out again for services. Highly recommend for Oviedo residents!"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cleaning Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Standard Cleaning",
            "description": "A light clean, thorough clean including dusting, vacuuming, mopping, bathroom cleaning, and kitchen cleaning. Perfect for regular maintenance."
          },
          "price": "125",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Deep Cleaning",
            "description": "Comprehensive deep scrubbing including everything in standard cleaning plus baseboards, back of toilet, inside microwave, and cabinet exteriors. Perfect for move-in/move-out or seasonal cleaning."
          },
          "price": "150",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Move In/Out Cleaning",
            "description": "Comprehensive cleaning for move-in or move-out situations. Includes deep cleaning of all areas, appliances, and detailed attention to detail."
          },
          "price": "200",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default LocalSchema; 
