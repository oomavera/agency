"use client";
import React from "react";

export default function CircleIconButton({ className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`h-12 w-12 rounded-full bg-white/20 text-snow border border-white/30 backdrop-blur-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.45)] hover:bg-white/25 active:shadow-inner ${className}`}
			{...rest}
			aria-label="Action"
			title="Action"
		>
			<span className="text-xl leading-none">↑</span>
		</button>
	);
}
