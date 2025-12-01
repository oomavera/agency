"use client";

import { useState } from "react";
import { dispatchLead } from "../../lib/leadSubmit";
import { LeadForm as LeadFormType, Quote } from "../../types/quote";
// Using API route for database writes to centralize validation and schema handling

interface LeadFormProps {
  quote: Quote;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Standard cleaning services list
const STANDARD_SERVICES = [
  "Dusting all surfaces and furniture",
  "Vacuum and mop all floors", 
  "Clean and sanitize bathrooms",
  "Kitchen cleaning and appliance wipe-down",
  "Empty trash and replace liners",
  "Make beds and tidy rooms",
  "Clean mirrors and glass surfaces",
  "Sanitize frequently touched surfaces"
];

export default function LeadForm({ quote, onCancel, isSubmitting }: LeadFormProps) {
  const [step, setStep] = useState<'contact' | 'estimate'>(  'contact');
  const [formData, setFormData] = useState<Partial<LeadFormType>>({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: 'Oviedo',
      state: 'FL',
      zip: ''
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleShowEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate just the basic contact info
    const basicValidation = {
      isValid: true,
      errors: {} as Record<string, string>
    };
    
    if (!formData.name?.trim()) {
      basicValidation.errors.name = 'Name is required';
      basicValidation.isValid = false;
    }
    
    if (!formData.email?.trim()) {
      basicValidation.errors.email = 'Email is required';
      basicValidation.isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      basicValidation.errors.email = 'Please enter a valid email';
      basicValidation.isValid = false;
    }
    
    if (!formData.phone?.trim()) {
      basicValidation.errors.phone = 'Phone is required';
      basicValidation.isValid = false;
    }
    
    if (!basicValidation.isValid) {
      setErrors(basicValidation.errors);
      return;
    }
    
    // Send to API which handles Supabase insert and schema compatibility
    try {
      const eventId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const externalId = formData.email || formData.phone || formData.name || undefined;
      dispatchLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: 'estimate_request',
        eventId,
        externalId,
        quote: {
          input: quote.input,
          subtotal: quote.subtotal,
        }
      });
    } catch (err) {
      console.error('Unexpected error starting lead dispatch on Show Estimate (API):', err);
    }
    // On success, route visitors to /schedule
    if (typeof window !== 'undefined') {
      window.location.assign('/schedule');
      return;
    }
    setStep('estimate');
    setErrors({});
  };

  // Book Now now routes to internal schedule page (no Cal.com)
  const handleBookNow = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/schedule');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-midnight/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-snow lead-form-black rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slopes/20">
        <div className="p-6">
          {step === 'contact' ? (
            <>
              {/* Step 1: Contact Information */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-midnight">
                  Get Free Closed Bookings
                </h2>
                <button
                  onClick={onCancel}
                  className="text-mountain hover:text-midnight transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-mountain mb-6 font-light leading-relaxed">
                Enter your details to see your personalized cleaning estimate
              </p>

              <form onSubmit={handleShowEstimate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slopes/30 rounded-lg bg-snow text-midnight focus:outline-none focus:ring-2 focus:ring-mountain focus:border-transparent font-light"
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slopes/30 rounded-lg bg-snow text-midnight focus:outline-none focus:ring-2 focus:ring-mountain focus:border-transparent font-light"
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slopes/30 rounded-lg bg-snow text-midnight focus:outline-none focus:ring-2 focus:ring-mountain focus:border-transparent font-light"
                    placeholder="(407) 555-0123"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-mountain transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get 10 Free Closed Bookings!
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Step 2: Estimate Reveal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-midnight">
                  Your Cleaning Estimate
                </h2>
                <button
                  onClick={onCancel}
                  className="text-mountain hover:text-midnight transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Price Display */}
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-snow border border-green-100 rounded-2xl shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="text-sm text-mountain font-light mb-3">Price</div>
                  {(['monthly', 'weekly', 'biWeekly'].includes(quote.input.frequency)) ? (
                    <>
                      <div className="flex flex-col items-center gap-2 w-full">
                        <span className="text-lg text-midnight font-light line-through opacity-60">${quote.subtotal.toFixed(0)}</span>
                        <span className="flex items-center gap-1 text-base font-semibold text-green-600">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          - $100
                        </span>
                        <span className="block w-10 border-t border-dashed border-green-200 my-1"></span>
                        <span className="text-5xl font-extrabold text-green-700 drop-shadow">${(quote.subtotal - 100).toFixed(0)}</span>
                      </div>
                      <div className="mt-3 mb-1">
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          You are receiving $100 off your first recurring clean.
                        </span>
                      </div>
                      <div className="w-full border-t border-snow/60 my-3"></div>
                      <div className="text-xs text-mountain font-light">
                        {quote.input.bedrooms} bed, {quote.input.bathrooms} bath • {quote.input.frequency} cleaning
                        {quote.input.addons.length > 0 && ` • ${quote.input.addons.length} add-ons`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-extrabold text-midnight mb-1">${quote.subtotal.toFixed(0)}</div>
                      <div className="text-xs text-mountain font-light mt-2">
                        {quote.input.bedrooms} bed, {quote.input.bathrooms} bath • {quote.input.frequency} cleaning
                        {quote.input.addons.length > 0 && ` • ${quote.input.addons.length} add-ons`}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Services Included */}
              <div className="mb-6">
                <h3 className="text-lg font-light text-midnight mb-3">What&apos;s Included:</h3>
                <ul className="space-y-2">
                  {STANDARD_SERVICES.map((service, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-mountain font-light">
                      <span className="text-mountain mt-0.5">✓</span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={isSubmitting}
                data-cal-link="agency/intro-call"
                data-cal-namespace="firstclean"
                data-cal-config='{"layout":"month_view","theme":"light"}'
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-mountain transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-snow border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Book Now'
                )}
              </button>

              <p className="text-xs text-mountain text-center mt-3 font-light">
                You&apos;ll be redirected to schedule your first cleaning
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
