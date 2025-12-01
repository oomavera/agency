"use client";

import { useState, useMemo } from "react";
import { QuoteInput } from "../types/quote";
import { computeQuote, validateQuoteInput } from "../lib/quote";
import FrequencyField from "./QuoteForm/FrequencyField";
import NumberField from "./QuoteForm/NumberField";
import AddonsField from "./QuoteForm/AddonsField";
import EstimateBar from "./QuoteForm/EstimateBar";
import dynamic from "next/dynamic";

const DynamicLeadForm = dynamic(() => import("./LeadModal/LeadForm"), { ssr: false });

export default function QuoteCalculator() {
  const [quoteInput, setQuoteInput] = useState<QuoteInput>({
    frequency: "monthly",
    bedrooms: 3,
    bathrooms: 2,
    addons: [],
  });

  const [showLeadModal, setShowLeadModal] = useState(false);

  // Compute quote from input
  const quote = useMemo(() => computeQuote(quoteInput), [quoteInput]);
  
  // Validate quote input
  const validation = useMemo(() => validateQuoteInput(quoteInput), [quoteInput]);

  const handleQuoteInputChange = <K extends keyof QuoteInput>(field: K, value: QuoteInput[K]) => {
    setQuoteInput(prev => ({ ...prev, [field]: value }));
  };

  const handleBookNow = () => {
    if (!validation.isValid) return;
    setShowLeadModal(true);
  };

  const handleLeadCancel = () => {
    setShowLeadModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Get Your Instant Quote</h2>
      
      <div className="space-y-6">
        <FrequencyField
          value={quoteInput.frequency}
          onChange={(value) => handleQuoteInputChange("frequency", value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberField
            label="Bedrooms"
            value={quoteInput.bedrooms}
            onChange={(value) => handleQuoteInputChange("bedrooms", value)}
            min={1}
            max={8}
          />
          <NumberField
            label="Bathrooms"
            value={quoteInput.bathrooms}
            onChange={(value) => handleQuoteInputChange("bathrooms", value)}
            min={1}
            max={8}
          />
        </div>

        <AddonsField
          value={quoteInput.addons}
          onChange={(value) => handleQuoteInputChange("addons", value)}
        />

        <EstimateBar
          subtotal={quote.subtotal}
          isValid={validation.isValid}
          onBookNow={handleBookNow}
          isSubmitting={false}
          frequency={quoteInput.frequency}
        />
      </div>

      {showLeadModal && (
        <DynamicLeadForm
          quote={quote}
          onCancel={handleLeadCancel}
          isSubmitting={false}
        />
      )}
    </div>
  );
} 