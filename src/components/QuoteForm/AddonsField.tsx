"use client";

import { AddonId, AddonOption } from "../../types/quote";
import { CONFIG } from "../../lib/config";
import { useState, useRef, useEffect } from "react";

interface AddonsFieldProps {
  value: AddonId[];
  onChange: (addons: AddonId[]) => void;
  error?: string;
}

const ADDON_OPTIONS: AddonOption[] = [
  { id: "oven", label: "Oven", description: "Interior oven cleaning" },
  { id: "ceilingFans", label: "Ceiling Fans", description: "Dust and wipe blades" },
  { id: "fridge", label: "Fridge", description: "Interior refrigerator cleaning" },
  { id: "sheets", label: "Sheets / Bed Linens", description: "Change and wash linens" },
  { id: "windows", label: "Windows (Interior)", description: "Interior window cleaning" }
];

export default function AddonsField({ value, onChange, error }: AddonsFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (addonId: AddonId) => {
    if (value.includes(addonId)) {
      // Remove addon
      onChange(value.filter(id => id !== addonId));
    } else {
      // Add addon (max 5)
      if (value.length < 5) {
        onChange([...value, addonId]);
      }
    }
  };

  const getButtonText = () => {
    if (value.length === 0) {
      return "Select add-ons (optional)";
    }
    if (value.length === 1) {
      const selectedAddon = ADDON_OPTIONS.find(addon => addon.id === value[0]);
      return selectedAddon?.label || "1 add-on selected";
    }
    return `${value.length} add-ons selected`;
  };

  const getSelectedAddonNames = () => {
    return value
      .map(id => ADDON_OPTIONS.find(addon => addon.id === id)?.label)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-midnight font-light">
        {CONFIG.COPY.addonsLabel}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-left border rounded-md text-xs font-light ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-mountain/30 focus:ring-midnight focus:border-midnight'
          } bg-snow hover:bg-arctic/40 focus:outline-none focus:ring-1`}
        >
          <span className={value.length === 0 ? 'text-mountain' : 'text-midnight'}>
            {getButtonText()}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform text-mountain ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-snow border border-mountain/30 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {ADDON_OPTIONS.map((addon) => {
                const isSelected = value.includes(addon.id);
                const isDisabled = !isSelected && value.length >= 5;
                
                return (
                  <label
                    key={addon.id}
                    className={`flex cursor-pointer items-center space-x-2 px-3 py-2 hover:bg-arctic/40 font-light ${
                      isDisabled ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(addon.id)}
                      disabled={isDisabled}
                      className="h-3 w-3 rounded border-mountain/50 text-midnight focus:ring-midnight focus:ring-offset-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-midnight">
                        {addon.label}
                        <span className="ml-1 text-mountain">+$30</span>
                      </div>
                      {addon.description && (
                        <div className="text-xs text-mountain">{addon.description}</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            
            {value.length >= 5 && (
              <div className="px-3 py-2 border-t border-mountain/20 bg-arctic/30">
                <p className="text-xs text-mountain font-light">Maximum 5 add-ons selected</p>
              </div>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="text-xs text-mountain font-light">
          Selected: {getSelectedAddonNames()}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 