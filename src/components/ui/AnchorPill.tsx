"use client";
import React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	variant?: "primary" | "ghost";
};

export default function AnchorPill({ variant = "primary", className = "", ...rest }: Props) {
	const base =
		"inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2";
	const styles =
		variant === "primary"
			? "bg-white/80 text-midnight border border-white/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(0,0,0,0.08)] hover:bg-white/90 active:shadow-inner focus-visible:ring-white/70"
			: "bg-white/10 text-snow border border-white/30 backdrop-blur-xl hover:bg-white/15 active:shadow-inner focus-visible:ring-white/40";
	return <a className={`${base} ${styles} ${className}`} {...rest} />;
}
