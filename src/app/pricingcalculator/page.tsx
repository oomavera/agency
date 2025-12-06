import type { Metadata } from "next";
import PricingCalculatorClient from "./PricingCalculatorClient";

export const metadata: Metadata = {
  title: "Pricing Calculator | Cleaning Matrix Lead Magnet",
  description: "Unlock the cleaning pricing matrix, upload your own spreadsheet, and get instant predictions using your data.",
  alternates: { canonical: "/pricingcalculator" },
};

export default function PricingCalculatorPage() {
  return <PricingCalculatorClient />;
}
