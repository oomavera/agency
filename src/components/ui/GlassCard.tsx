"use client";
import React from "react";

type Props = React.PropsWithChildren<{ className?: string; withShadow?: boolean; withEdgeGlow?: boolean }>;

export default function GlassCard({ className = "", withShadow = true, withEdgeGlow = true, children }: Props) {
	return (
		<div className={`relative rounded-[28px] border border-white/60 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${className}`}>
			{withEdgeGlow && null}
			{children}
			{withShadow && null}
		</div>
	);
}
