"use client";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import QuickEstimateForm from "./QuickEstimateForm";
import logo from "../../public/Gallery/LogoTransparent.png";
import GlassCard from "./ui/GlassCard";
import PastelBlob from "./ui/PastelBlob";
import PillButton from "./ui/PillButton";
// Swiper - dynamically imported for performance
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
// Defer Aurora to idle
const DynamicAurora = dynamic(() => import("./ui/ParallaxAurora"), { ssr: false });

// QuickEstimateForm is SSR to avoid layout shifts
const ScrollPopupForm = dynamic(() => import("./ScrollPopupForm"), { ssr: false });

// Photo gallery images for hero slideshow
const galleryImages = [
	'/Gallery/images/fin1.png',
	'/Gallery/images/fin2.png',
	'/Gallery/images/fin3.png',
	'/Gallery/images/fin4.png',
	'/Gallery/images/fin7.jpg',
];

const DEFAULT_HERO_TITLE = (
	<>
		In <span className="underline">30 days</span> We Will Get You <span className="underline">10 Closed Bookings</span> - <span className="underline">Completely Done-With-You</span>
	</>
);
const DEFAULT_HERO_SUBTITLE = (
	<>
		We handle everything from front-end offer, ad campaign, sales process &amp; sales training completely done-for-you. <strong>All you have to do is let us teach you how to close deals on the phone.</strong>
	</>
);
const DEFAULT_FORM_TITLE = "Sign Up Free Now!";
const DEFAULT_FORM_SUBMIT = "Get 10 Closed Bookings Free";
const DEFAULT_POPUP_CALLOUT = "Sign Up Free Now!";
const DEFAULT_POPUP_SUBMIT = "Get 10 Closed Bookings Free";
const GLOW_BUTTON_CLASSES = "btn-glow-blue bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white ring-2 ring-sky-300/60 shadow-[0_12px_36px_rgba(56,189,248,0.35)] hover:shadow-[0_18px_44px_rgba(37,99,235,0.5)] hover:ring-4 transition-all duration-300";

interface HomeLandingPageProps {
	formPage?: string;
	heroTitle?: ReactNode;
	heroSubtitle?: ReactNode;
	formTitle?: string;
	formSubmitLabel?: string;
	popupCallout?: string;
	popupSubmitLabel?: string;
	formButtonClassName?: string;
	popupButtonClassName?: string;
	introContent?: ReactNode;
	formRedirectPath?: string;
	popupRedirectPath?: string;
}

export default function HomeLandingPage({
	formPage = "home",
	heroTitle = DEFAULT_HERO_TITLE,
	heroSubtitle = DEFAULT_HERO_SUBTITLE,
	formTitle = DEFAULT_FORM_TITLE,
	formSubmitLabel = DEFAULT_FORM_SUBMIT,
	popupCallout = DEFAULT_POPUP_CALLOUT,
	popupSubmitLabel = DEFAULT_POPUP_SUBMIT,
	formButtonClassName = GLOW_BUTTON_CLASSES,
	popupButtonClassName = GLOW_BUTTON_CLASSES,
	introContent = null,
	formRedirectPath = "/Demonstration",
	popupRedirectPath = "/reviews",
}: HomeLandingPageProps) {

	// Initialize Cal.com calendar widget (defer to idle)
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const w = window as Window & { Cal?: unknown; requestIdleCallback?: (cb: () => void) => number };
		if (typeof w.Cal !== 'undefined') return;
    // removed Cal.com
  }, []);

	// Idle-mount ParallaxAurora
	const [showAurora, setShowAurora] = useState(false);
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const cb = () => setShowAurora(true);
		const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
		if (w.requestIdleCallback) {
			w.requestIdleCallback(cb);
		} else {
			setTimeout(cb, 1);
		}
	}, []);

	// Preload first gallery image for LCP optimization
	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = galleryImages[0];
		document.head.appendChild(link);
		return () => {
			document.head.removeChild(link);
		};
	}, []);

	return (
		<div id="main-content" className="min-h-screen w-full font-nhd text-midnight">
			{/* ABOVE THE FOLD */}
			<div className="bg-hero-night text-white">
				{/* HERO SECTION - ABOVE THE FOLD */}
				<section className="relative bg-transparent min-h-screen lg:min-h-0 flex flex-col overflow-visible lg:pt-2">
					{showAurora && <DynamicAurora />}
					{/* Header */}
					<header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-6">
						{/* Mobile header (Apple-like) */}
						<div className="flex items-center justify-center">
							<Image src={logo} alt="Scaling Home Services" width={256} height={64} priority fetchPriority="high" sizes="320px" decoding="async" style={{ height: '52px', width: 'auto', objectFit: 'contain', opacity: 0.95, filter: 'invert(1) brightness(1.6)' }} />
						</div>
						<div className="hidden sm:flex items-center justify-center">
							<Image src={logo} alt="Scaling Home Services" width={384} height={96} priority fetchPriority="high" sizes="448px" decoding="async" style={{ height: '76px', width: 'auto', objectFit: 'contain', opacity: 0.95, filter: 'invert(1) brightness(1.6)' }} />
						</div>
					</header>

					{/* Main Content */}
					<div className="flex-1 flex flex-col justify-center lg:justify-start px-0 sm:px-8 max-w-7xl mx-auto w-full mt-1 sm:mt-8 lg:mt-2">
						{/* Hero Text */}
						<div className="relative z-20 text-center mb-3 sm:mb-8 lg:mb-4 no-blend">
							<h1 className="font-hero text-2xl xs:text-3xl md:text-4xl xl:text-5xl mb-4 leading-[1.75] text-white font-medium tracking-[0.04em]">
								{heroTitle}
							</h1>
							<div className="font-hero-sub text-sm xs:text-base md:text-lg text-sky-100 mt-2">
								{heroSubtitle}
							</div>
						</div>

						{/* Logos Section */}
						<div className="flex flex-col justify-center items-center gap-3 mb-4 sm:mb-6 lg:mb-4">
						<div className="flex items-center gap-5 sm:gap-8">
							<Image
								src="/Gallery/logos/328-3285377_how-to-apply-trustpilot-5-star-logo-clipart (1).png"
								alt="Trustpilot 5-Star"
								width={160}
									height={64}
									className="h-10 sm:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
								/>
								<Image
									src="/Gallery/logos/chamber1.png"
									alt="Chamber Partner"
									width={230}
									height={92}
									className="h-14 sm:h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
								/>
								<Image
									src="/Gallery/logos/chamber2.png"
									alt="Local Chamber"
									width={192}
									height={76}
									className="h-12 sm:h-14 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
								/>
							</div>
							{/* Partner badge removed for compactness */}
						</div>

					{/* Main Sections */}
					<div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-center md:items-start">
						{/* Photo Gallery - Desktop: Left, Mobile: Below form */}
						<div className="order-2 md:order-1 w-full md:w-[420px]">
							<div className="aspect-square overflow-hidden rounded-2xl shadow-lg relative bg-white">
								<Swiper
									modules={[Autoplay, EffectFade]}
									effect="fade"
									autoplay={{
										delay: 1600,
										disableOnInteraction: false,
									}}
									loop={true}
									speed={900}
									className="w-full h-full"
									aria-label="Photo gallery showcasing our professional cleaning services"
								>
									{galleryImages.map((img, index) => (
										<SwiperSlide key={index}>
											<Image
												src={img}
												alt={`Professional cleaning service result ${index + 1}`}
												width={420}
												height={420}
												quality={75}
												priority={index === 0}
												className="w-full h-full object-cover"
												sizes="(max-width: 768px) 100vw, 420px"
											/>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
						</div>

						{/* Lead Form - Desktop: Right, Mobile: Above photo */}
						<div
							className="order-1 md:order-2 w-full md:flex-1 max-w-none md:max-w-lg relative mt-0 -mx-7 sm:mx-0 overflow-hidden rounded-[10px] sm:rounded-xl"
							style={{
								backgroundImage: `
									radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 28%),
									radial-gradient(circle at 80% 0%, rgba(0,180,255,0.12), transparent 32%),
									linear-gradient(180deg, rgba(5,12,24,0.92), rgba(6,18,36,0.96))
								`
							}}
						>
							<PastelBlob className="w-[520px] h-[420px]" style={{ left: "-10%", top: "-10%" }} />
							<GlassCard className="p-1 sm:p-4 min-h-[420px] rounded-[8px] sm:rounded-xl bg-[#071426] !bg-[#071426] border border-[#0a1324]/90 !border-[#0a1324]/90 text-white">
								<QuickEstimateForm page={formPage} title={formTitle} submitLabel={formSubmitLabel} buttonClassName={formButtonClassName} redirectPath={formRedirectPath} />
							</GlassCard>
							{introContent && (
								<div className="sm:hidden text-base text-mountain leading-relaxed mt-5 font-nhd">
									{introContent}
								</div>
							)}
						</div>
					</div>
				</div>
				{introContent && (
					<div className="hidden sm:block px-8 max-w-3xl mx-auto text-base sm:text-lg text-mountain leading-relaxed mt-6 font-nhd">
						{introContent}
					</div>
				)}
				</section>
			</div>

			{/* BELOW (pure white) */}
			<div className="bg-white text-midnight pt-6 sm:pt-10 relative">
				<div className="absolute -top-8 left-0 right-0 h-16 bg-gradient-to-b from-[#02050d]/70 via-white/70 to-white pointer-events-none"></div>
				{/* Scroll-triggered Lead Form Popup */}
					<ScrollPopupForm triggerElement="#testimonial" callout={popupCallout} page={formPage} submitLabel={popupSubmitLabel} buttonClassName={popupButtonClassName} redirectPath={popupRedirectPath} />

				{/* Testimonial Spotlight */}
				<section id="testimonial" className="py-6 sm:py-10 relative z-10 bg-white text-midnight">
					<div className="max-w-7xl mx-auto px-4">
						<div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-3 sm:gap-4 mb-5">
							<h2 className="text-2xl sm:text-3xl font-semibold text-midnight leading-snug">
								We&apos;ve Built &amp; Scaled Sales Process&apos;s For Sucessful Home Service Business&apos;s Throughout The USA
							</h2>
						</div>
						<div className="mx-auto max-w-xl">
							<GlassCard className="p-6 sm:p-8 text-white rounded-2xl shadow-lg border border-sky-400/50 bg-white/5 backdrop-blur-xl">
								<div className="flex flex-col items-center text-center gap-4 sm:gap-5">
									<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/80 shadow-lg">
										<Image
											src="/Gallery/testimonials/angelica2.jpg"
											alt="Angelica Crane"
											fill
											sizes="112px"
											className="object-cover"
										/>
									</div>
									<div className="space-y-1">
										<h3 className="text-xl font-semibold text-midnight">Angelica Crane</h3>
										<p className="text-sm text-mountain">Operator - Curated Cleanings</p>
									</div>
									<p className="text-base text-midnight leading-relaxed">
										Angelica, the owner of Curated Cleanings was able to close 400% more deals in 4 weeks working with us. We trained her sales team &amp; Converted 5X the leads with Deep Cleans closing as high as $700 into Recurring Bi-weekly clients. All within a 4 week period!
									</p>
									<div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-7 w-full text-center">
										<span className="px-12 py-7 rounded-3xl bg-white border border-sky-300 text-midnight font-black text-4xl sm:text-6xl shadow-lg">400% Revenue Growth</span>
										<span className="px-12 py-7 rounded-3xl bg-white border border-sky-300 text-midnight font-black text-4xl sm:text-6xl shadow-lg">5X Deals Closed</span>
										<span className="px-12 py-7 rounded-3xl bg-white border border-sky-300 text-midnight font-black text-4xl sm:text-6xl shadow-lg">$8.95 per lead</span>
									</div>
								</div>
							</GlassCard>
						</div>
						<div className="mt-6 flex justify-center w-full sm:w-auto">
							<PillButton
								onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}
								className={`w-full sm:w-auto text-xl sm:text-2xl py-6 sm:py-7 px-0 sm:px-2 rounded-[6px] sm:rounded-full ${GLOW_BUTTON_CLASSES}`}
							>
								Get 10 Closed Bookings Free
							</PillButton>
						</div>
					</div>
				</section>
				<div className="h-14 bg-gradient-to-b from-white via-white/70 to-[#02050d] pointer-events-none" />

			</div>

            {/* Cal.com removed */}

		</div>
	);
}
