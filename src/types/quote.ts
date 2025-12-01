export type Frequency = "once" | "monthly" | "biWeekly" | "weekly";

export type AddonId =
  | "oven"
  | "ceilingFans"
  | "fridge"
  | "sheets"
  | "windows";

export interface QuoteInput {
  frequency: Frequency;
  bedrooms: number;    // min 2, max QUOTE_MAX_BEDROOMS
  bathrooms: number;   // min 1, max QUOTE_MAX_BATHROOMS
  addons: AddonId[];   // unique; no quantities
}

export interface Quote {
  input: QuoteInput;
  subtotal: number; // USD decimal, 2 dp, tax excluded
}

export interface LeadForm {
  name: string;
  phone: string;   // E.164 normalizer
  email: string;
  address: {
    street: string;
    city: string;
    state?: string;
    zip?: string;
  };
}

export interface LeadPayload extends LeadForm {
  quote: Quote;
}

export interface AddonOption {
  id: AddonId;
  label: string;
  description?: string;
} 