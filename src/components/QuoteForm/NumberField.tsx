"use client";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  error?: string;
}

export default function NumberField({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  error 
}: NumberFieldProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-midnight font-light">
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium ${
            value <= min
              ? 'border-slopes/50 text-slopes cursor-not-allowed'
              : 'border-mountain/50 text-mountain hover:border-midnight hover:text-midnight hover:bg-arctic/40'
          }`}
        >
          −
        </button>
        
        <div className="flex-1 max-w-[60px]">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="block w-full rounded-md border border-mountain/30 bg-snow px-2 py-1 text-center text-sm font-medium text-midnight focus:border-midnight focus:outline-none focus:ring-1 focus:ring-midnight font-light"
          />
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium ${
            value >= max
              ? 'border-slopes/50 text-slopes cursor-not-allowed'
              : 'border-mountain/50 text-mountain hover:border-midnight hover:text-midnight hover:bg-arctic/40'
          }`}
        >
          +
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 