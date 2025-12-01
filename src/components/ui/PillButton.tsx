"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "ghost" | "inverse";
	animated?: boolean;
};

export default function PillButton({ variant = "primary", className = "", animated = false, ...rest }: Props) {
	const base =
		"rounded-full px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 relative overflow-hidden";
	
	const styles =
		variant === "primary"
			? "bg-black text-white border border-black/10 shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:bg-black/90 focus-visible:ring-black/30"
			: variant === "inverse"
				? "bg-white text-black border border-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.10)] hover:bg-white/95 focus-visible:ring-white/50"
				: "bg-black text-white border border-black/10 shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:bg-black/90 focus-visible:ring-black/30";

	return (
		<button data-animated={animated ? "true" : "false"} className={`${base} ${styles} ${className}`} {...rest}>
			{rest.children}
		</button>
	);
}
