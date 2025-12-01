import { QuoteInput, Quote, Frequency } from "../types/quote";

// Pricing constants
const PRICE_PER_BEDROOM = 35;
const PRICE_PER_BATHROOM = 50;
const PRICE_PER_ADDON = 30;

const FREQ_FACTOR: Record<Frequency, number> = {
  once: 1.00,
  monthly: 0.80,   // -20%
  biWeekly: 0.70,  // -30%
  weekly: 0.60     // -40%
};

export function computeQuote(input: QuoteInput): Quote {
  const { frequency, bedrooms, bathrooms, addons } = input;

  const core = bedrooms * PRICE_PER_BEDROOM + bathrooms * PRICE_PER_BATHROOM;
  const extras = (addons?.length ?? 0) * PRICE_PER_ADDON;

  // Apply frequency discount to both core and addons (bundled discount)
  const subtotal = (core + extras) * FREQ_FACTOR[frequency];

  // Round to 2 decimal places for currency
  const priced = +subtotal.toFixed(2);

  return { input, subtotal: priced };
}

export function validateQuoteInput(input: Partial<QuoteInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Frequency validation
  if (!input.frequency) {
    errors.frequency = "Please select a frequency";
  }

  // Bedrooms validation
  if (!input.bedrooms || input.bedrooms < 2) {
    errors.bedrooms = "Select at least 2 bedrooms";
  } else if (input.bedrooms > 7) {
    errors.bedrooms = "Too many bedrooms for online quote. Please call.";
  }

  // Bathrooms validation
  if (!input.bathrooms || input.bathrooms < 1) {
    errors.bathrooms = "Need at least 1 bathroom";
  } else if (input.bathrooms > 6) {
    errors.bathrooms = "Too many bathrooms for online quote. Please call.";
  }

  // Addons validation (optional, but max 5)
  if (input.addons && input.addons.length > 5) {
    errors.addons = "Too many add-ons selected";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 