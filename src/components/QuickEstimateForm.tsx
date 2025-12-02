"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PillButton from "./ui/PillButton";
import { track } from "../lib/ga4";
import { dispatchLead } from "../lib/leadSubmit";
import SurveyModal, { SurveyAnswers } from "./SurveyModal";

interface QuickEstimateFormProps {
	onSubmitSuccess?: () => void;
	title?: string;
	submitLabel?: string;
	trackMetaLead?: boolean;
	metaEventName?: string;
	showEmail?: boolean;
	openCalendarOnSuccess?: boolean;
	page?: string; // Add page identifier (e.g., "home" or "offer")
	buttonClassName?: string;
	redirectPath?: string;
}

export default function QuickEstimateForm({ onSubmitSuccess, title = "Sign Up Free Now!", submitLabel = "Get 10 Closed Bookings Free", trackMetaLead = false, metaEventName = "Lead", showEmail = true, page, buttonClassName = "", redirectPath = "/Demonstration" }: QuickEstimateFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const [leadDispatched, setLeadDispatched] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setError(null);
    setLeadDispatched(false);

		// Generate a deduplication event_id to share with server-side CAPI
		const eventId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		// Build a lightweight external_id (sha256 will be applied on server if needed)
		const externalId = formData.email || formData.phone || formData.name || undefined;

    const basePayload = {
      ...formData,
      source: 'Landing Page',
      page, // Add page identifier
      eventId,
      externalId,
      suppressMeta: true,
    };
    setPendingPayload(basePayload);
    setShowSurvey(true);

		// GA4 event: lead submit (main form)
		try { track({ name: 'lead_submit', params: { form: 'offer_main' } }); } catch {}

		// Meta Pixel conversion (only when enabled)
		if (trackMetaLead && typeof window !== 'undefined') {
			const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq;
			try {
				fbq?.('track', metaEventName, {
					event_id: eventId,
					content_name: 'Offer Lead',
					event_source: 'offer',
					lead_source: 'main_form'
				});
			} catch {}
		}
    setIsSubmitting(false);
	};

  const dispatchWithSurvey = (answers?: SurveyAnswers) => {
    if (!pendingPayload) return;
    const payload = answers ? { ...pendingPayload, survey: answers } : pendingPayload;
    dispatchLead(payload);
    setLeadDispatched(true);
  };

  const handleSurveyComplete = (answers: SurveyAnswers) => {
    dispatchWithSurvey(answers);
    setShowSurvey(false);
    setSuccess(true);
    if (typeof window !== 'undefined') {
      window.location.assign(redirectPath);
      return;
    }
    onSubmitSuccess?.();
  };

  const handleSurveyClose = () => {
    if (!leadDispatched) {
      dispatchWithSurvey();
    }
    setShowSurvey(false);
    setIsSubmitting(false);
  };

	if (success) {
		return (
			<motion.div 
				className="bg-arctic/40 backdrop-blur-sm border border-slopes/30 rounded-xl p-5 shadow-xl text-center"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div className="text-green-600 mb-3">
					<svg className="w-14 h-14 mx-auto" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-white mb-1">Thank you!</h3>
				<p className="text-sm text-white mb-3">
					You&apos;re all set. Our phones are open — call now, or we&apos;ll call you within 5 minutes.
				</p>
				<PillButton 
					onClick={() => { window.location.href = 'tel:+14074701780'; }} 
					className="w-full justify-center"
				>
					Call Now
				</PillButton>
				<div className="text-xs text-white mt-2">We will call you from 407-470-1780</div>
				<button
					onClick={() => {
						setSuccess(false);
						setFormData({ name: "", phone: "", email: "" });
					}}
					className="text-white hover:text-sky-100 transition-colors text-sm underline mt-3"
				>
					Submit another request
				</button>
			</motion.div>
		);
	}

	return (
    <>
      <SurveyModal open={showSurvey} onClose={handleSurveyClose} onComplete={handleSurveyComplete} />
		<motion.div 
			className="relative overflow-hidden text-white border border-sky-200/30 rounded-[10px] sm:rounded-lg p-2 sm:rounded-lg sm:p-4 shadow-[0_16px_36px_rgba(0,0,0,0.35)] bg-[#0a1324] ring-[0.5px] ring-sky-300/30"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className="relative z-10">
			<div className="text-center mb-4 flex justify-center">
				<div className="flex items-center justify-center h-12 px-8 bg-white/16 rounded-full border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.25),0_0_24px_rgba(56,189,248,0.25)] backdrop-blur-xl">
					<h2 className="m-0 text-base font-semibold text-white tracking-wide whitespace-nowrap leading-none text-center">{title}</h2>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-2.5">
				<div>
					<label htmlFor="name" className="block text-xs font-medium text-white mb-1.5">
						Full Name *
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						required
						className="px-4 py-3 w-full rounded-full bg-[#0c1d37] border border-[#1f365d]/80 text-white placeholder-sky-100/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
						placeholder="Enter your full name"
					/>
				</div>

				<div>
					<label htmlFor="phone" className="block text-xs font-medium text-white mb-1.5">
						Phone Number *
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={formData.phone}
						onChange={handleInputChange}
						required
						className="px-4 py-3 w-full rounded-full bg-[#0c1d37] border border-[#1f365d]/80 text-white placeholder-sky-100/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
						placeholder="(407) 123-4567"
					/>
				</div>

				{showEmail && (
					<div>
						<label htmlFor="email" className="block text-xs font-medium text-white mb-1.5">
							Email Address *
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							required
							className="px-4 py-3 w-full rounded-full bg-[#0c1d37] border border-[#1f365d]/80 text-white placeholder-sky-100/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
							placeholder="your@email.com"
						/>
					</div>
				)}

				{error && (
					<div className="p-2 bg-red-900/60 border border-red-500/60 rounded-lg">
						<p className="text-xs text-white">{error}</p>
					</div>
				)}

				<PillButton
					type="submit"
					disabled={isSubmitting}
					className={`w-full text-xl sm:text-2xl py-6 sm:py-7 px-0 sm:px-2 rounded-[6px] sm:rounded-full ${buttonClassName}`}
					animated={!isSubmitting}
				>
					{isSubmitting ? (
						<span className="flex items-center justify-center gap-2">
							<div className="w-4 h-4 border-2 border-arctic border-t-transparent rounded-full animate-spin"></div>
							Submitting...
						</span>
					) : (
						submitLabel
					)}
				</PillButton>
			</form>
			</div>
		</motion.div>
    </>
	);
}
