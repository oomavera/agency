"use client";

import { Frequency } from "../../types/quote";

interface FrequencyFieldProps {
  value: Frequency;
  onChange: (frequency: Frequency) => void;
  error?: string;
}

const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: "once", label: "One Time", description: "Single cleaning" },
  { value: "monthly", label: "Monthly", description: "Save 20%" },
  { value: "biWeekly", label: "Every 2 Weeks", description: "Save 30%" },
  { value: "weekly", label: "Weekly", description: "Save 40%" }
];

export default function FrequencyField({ value, onChange, error }: FrequencyFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-midnight">
        How often?
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        {FREQUENCY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`relative flex cursor-pointer rounded-md border p-2 focus:outline-none font-light ${
              value === option.value
                ? 'border-midnight bg-midnight text-snow'
                : 'border-slopes/30 bg-snow text-midnight hover:bg-arctic/40 hover:border-apres-ski/50'
            }`}
          >
            <input
              type="radio"
              name="frequency"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as Frequency)}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div className="text-xs">
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs ${value === option.value ? 'text-arctic' : 'text-apres-ski'}`}>
                    {option.description}
                  </div>
                </div>
              </div>
              <div
                className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                  value === option.value
                    ? 'border-snow bg-snow'
                    : 'border-slopes'
                }`}
              >
                {value === option.value && (
                  <div className="h-1.5 w-1.5 rounded-full bg-midnight"></div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 