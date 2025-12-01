"use client";
import React from "react";

type Props = { className?: string; style?: React.CSSProperties };

export default function PastelBlob({ className = "", style }: Props) {
	return (
		<div
			className={`pointer-events-none absolute -z-10 blur-3xl rounded-full opacity-70 ${className}`}
			style={{
				background:
					"radial-gradient(600px 400px at 30% 20%, rgba(0,0,240,0.20), transparent 60%), radial-gradient(600px 400px at 70% 30%, rgba(0,0,240,0.12), transparent 60%), radial-gradient(500px 350px at 50% 80%, rgba(0,0,240,0.08), transparent 60%)",
				...style,
			}}
		/>
	);
}
