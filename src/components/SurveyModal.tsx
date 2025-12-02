"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SurveyAnswers {
  businessType: string;
  website: string;
  revenueRange: string;
}

interface SurveyModalProps {
  open: boolean;
  onClose: (reason: 'dismissed') => void;
  onComplete: (answers: SurveyAnswers) => void;
}

const businessOptions = [
  { label: "A: House Cleaning", value: "House Cleaning" },
  { label: "B: Lawn/Landscaping", value: "Lawn/Landscaping" },
  { label: "C: Junk Removal", value: "Junk Removal" },
  { label: "D: Pressure Washing", value: "Pressure Washing" },
  { label: "E: Window Cleaning", value: "Window Cleaning" },
  { label: "F: Other", value: "Other" },
];

const revenueOptions = [
  { label: "A: $0-$5k/mo", value: "$0-$5k/mo" },
  { label: "B: $5k-$10k/mo", value: "$5k-$10k/mo" },
  { label: "C: $10k-$20k/mo", value: "$10k-$20k/mo" },
  { label: "D: $20k-$30k/mo", value: "$20k-$30k/mo" },
  { label: "E: $30k-$40k/mo", value: "$30k-$40k/mo" },
  { label: "F: $40k-$50k/mo", value: "$40k-$50k/mo" },
  { label: "G: $50k-$60k/mo", value: "$50k-$60k/mo" },
  { label: "H: $75k+", value: "$75k+" },
];

export default function SurveyModal({ open, onClose, onComplete }: SurveyModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});

  const handleBusinessSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, businessType: value }));
    setStep(1);
  };

  const handleWebsiteNext = (website: string) => {
    setAnswers(prev => ({ ...prev, website }));
    setStep(2);
  };

  const handleRevenueSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, revenueRange: value }));
  };

  const handleFinish = () => {
    if (!answers.businessType || !answers.website || !answers.revenueRange) return;
    onComplete({
      businessType: answers.businessType,
      website: answers.website,
      revenueRange: answers.revenueRange,
    });
    setStep(0);
    setAnswers({});
  };

  const headline = [
    "What type of business are you?",
    "What is your website named?",
    "What is your CURRENT monthly revenue?",
  ][step];

  const subtext = [
    "We explicitly work with home service businesses that sell to homeowners. If you're not selling services to homeowners do not move forward.",
    "Please provide your website URL or business name.",
    "Select the current revenue range that best describes your business.",
  ][step];

  const canFinish = Boolean(answers.businessType && answers.website && answers.revenueRange);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={e => {
            if (e.target === e.currentTarget) onClose('dismissed');
          }}
        >
          <motion.div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 relative"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
              onClick={() => onClose('dismissed')}
              aria-label="Close survey"
            >
              ✕
            </button>

            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-midnight">{headline}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{subtext}</p>
            </div>

            {step === 0 && (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleBusinessSelect(option.value)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white transition shadow-sm"
                  >
                    <span className="block text-midnight font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="mt-5 space-y-4">
                <input
                  type="text"
                  defaultValue={answers.website || ""}
                  onChange={e => setAnswers(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="yourwebsite.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleWebsiteNext((answers.website || "").trim())}
                    disabled={!answers.website?.trim()}
                    className="px-5 py-2 rounded-lg bg-midnight text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move forward
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {revenueOptions.map(option => {
                    const active = answers.revenueRange === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleRevenueSelect(option.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border ${
                          active ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white"
                        } transition shadow-sm`}
                      >
                        <span className="block text-midnight font-semibold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={!canFinish}
                    className="px-5 py-2 rounded-lg bg-midnight text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Move forward
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
