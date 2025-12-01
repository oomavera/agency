"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import logo from "../../../public/Gallery/LogoTransparent.png";
import GlassCard from "../../components/ui/GlassCard";
import PastelBlob from "../../components/ui/PastelBlob";
import PillButton from "../../components/ui/PillButton";
// Swiper - dynamically imported for performance
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
// Defer Aurora to idle
const DynamicAurora = dynamic(() => import("../../components/ui/ParallaxAurora"), { ssr: false });

// QuickEstimateForm is SSR to avoid layout shifts
const QuickEstimateForm = dynamic(() => import("../../components/QuickEstimateForm"), { ssr: false });
const ScrollPopupForm = dynamic(() => import("../../components/ScrollPopupForm"), { ssr: false });

export default function OfferPage() {

	// Removed Cal.com

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

	// Photo gallery images
	const galleryImages = [
		'/Gallery/images/fin1.png',
		'/Gallery/images/fin2.png',
		'/Gallery/images/fin3.png',
		'/Gallery/images/fin4.png',
		'/Gallery/images/fin7.jpg',
	];

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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	

	// Removed wide video window to improve performance

	return (
		<div id="main-content" className="min-h-screen w-full font-nhd text-midnight">
			{/* ABOVE THE FOLD + HERO AREA (white background) */}
			<div className="bg-hero-night text-white">
				{/* HERO SECTION - ABOVE THE FOLD */}
				<section className="relative bg-transparent min-h-screen lg:min-h-0 flex flex-col overflow-visible lg:pt-2">
				{showAurora && <DynamicAurora />}
					{/* Header */}
					<header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 sm:py-3">
						{/* Mobile header (centered logo) */}
						<div className="flex items-center justify-center sm:hidden">
							<Image src={logo} alt="Scaling Home Services" width={128} height={32} style={{ height: '26px', width: 'auto', objectFit: 'contain', opacity: 0.95, filter: 'invert(1) brightness(1.6)' }} />
						</div>

						{/* Desktop header (centered logo) */}
						<div className="hidden sm:flex items-center justify-center">
							<Image src={logo} alt="Scaling Home Services" width={192} height={48} style={{ height: '38px', width: 'auto', objectFit: 'contain', opacity: 0.95, filter: 'invert(1) brightness(1.6)' }} />
						</div>
					</header>

				{/* Main Content */}
			<div className="flex-1 flex flex-col justify-center lg:justify-start px-0 sm:px-8 max-w-7xl mx-auto w-full mt-0 sm:mt-5 lg:mt-2">
					{/* Hero Text */}
						<div className="relative z-20 text-center mb-3 sm:mb-6 lg:mb-4 no-blend">
						<h1 className="font-hero text-2xl xs:text-3xl md:text-4xl xl:text-5xl mb-4 leading-[1.75] text-white font-medium tracking-[0.04em]">
							In <span className="underline">30 days</span> We Will Get You <span className="underline">10 Closed Bookings</span> - <span className="underline">Completely Done-With-You</span>
						</h1>
						<div className="font-hero-sub text-sm xs:text-base md:text-lg text-sky-100 mt-2">
							We handle everything from front-end offer, ad campaign, sales process &amp; sales training completely done-for-you. <strong>All you have to do is let us teach you how to close deals on the phone.</strong>
						</div>
					</div>


					{/* Logos Section */}
						<div className="flex flex-col justify-center items-center gap-2 mb-4 sm:mb-6 lg:mb-4">
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
								<QuickEstimateForm title="Claim Your Free Voucher" submitLabel="Get 10 Closed Bookings Free" showEmail={true} openCalendarOnSuccess={false} page="offer" />
							</GlassCard>
						</div>
					</div>

					</div>
					</section>

					{/* Scroll-triggered Lead Form Popup */}
					<ScrollPopupForm triggerElement="#testimonial" callout="Wait! Get your FREE cleaning voucher!" buttonClassName="bg-black text-white" page="offer" />
			</div>

			{/* BELOW: Pure white from reviews to footer */}
			<div className="bg-white text-midnight pt-6 sm:pt-10">
					{/* Testimonial Spotlight */}
				<section id="testimonial" className="py-4 sm:py-8 lg:py-4 relative z-10 bg-white text-midnight">
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

				{/* LARGE CALL TO ACTION SECTION */}
					<section className="py-6 sm:py-8 text-center">
						<button 
							onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}
							className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-midnight px-14 py-10 rounded-full text-3xl sm:text-4xl font-extrabold shadow-lg hover:bg-white/30 border-brand/30 hover:border-brand/50 hover:text-brand transform scale-120 hover:scale-125 transition-all duration-300"
						>
							<span>CLAIM FREE VOUCHER!</span>
						</button>
					</section>

				{/* SERVICE AREA SECTION - moved below CTA and styled like cards */}
				<section className="py-12 flex flex-col items-center">
					<GlassCard className="mb-12 w-full max-w-4xl p-4 sm:p-10 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
						
						<h3 className="font-hero-sub text-3xl mb-6 text-midnight text-center">Serving All of Seminole County</h3>
						<p className="text-lg text-mountain mb-8 font-light leading-relaxed text-center">
							We proudly serve every city and community in Seminole County. If you live in Seminole, you&apos;re covered.
						</p>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-base text-midnight">
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 col-span-2 md:col-span-3 text-center">
								<strong>All of Seminole County</strong>
									</div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Altamonte Springs, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Casselberry, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Lake Mary, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Longwood, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Oviedo, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Sanford, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Winter Springs, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Heathrow, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Wekiwa Springs, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Fern Park, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Chuluota, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Geneva, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Goldenrod, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Midway, FL</strong></div>
							<div className="p-4 bg-white rounded-lg shadow-sm border border-slopes/20 text-center"><strong>Black Hammock, FL</strong></div>
						</div>
					</GlassCard>
					</section>

				{/* COMPANY DESCRIPTION SECTION - moved to bottom */}

					{/* PACKAGES SECTION */}
					<section id="packages" className="py-12 flex flex-col items-center">
						{/* Standard Cleaning Card */}
						<GlassCard className="mb-12 w-full max-w-2xl p-4 sm:p-10 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
						
							<h2 className="font-hero-sub text-2xl sm:text-3xl tracking-[0.2em] text-center mb-4 sm:mb-6 text-brand font-bold">STANDARD HOUSE CLEANING</h2>
						<ul className="text-base sm:text-lg text-black flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-10 leading-snug sm:leading-relaxed" style={{ fontWeight: 300 }}>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Dusting all surfaces (furniture, shelves)</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Vacuuming carpets and rugs</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Sweeping and mopping floors</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Cleaning and disinfecting bathroom(s): toilet, sink, shower/tub, mirrors)</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Wiping kitchen counters and exterior of appliances (fridge, oven, microwave)</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Emptying trash bins and replacing liners</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Making beds (not changing linens)</span></li>
							</ul>
						<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-12">
						<PillButton onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}>Get Free Voucher Now</PillButton>
						</div>
						</GlassCard>
						{/* Deep Clean Card */}
						<GlassCard className="mb-12 w-full max-w-2xl p-4 sm:p-10 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
						
							<h2 className="font-hero-sub text-2xl sm:text-3xl tracking-[0.2em] text-center mb-4 sm:mb-6 text-brand font-bold">DEEP CLEANING SERVICES</h2>
						<ul className="text-base sm:text-lg text-black flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-10 leading-snug sm:leading-relaxed" style={{ fontWeight: 300 }}>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">+</span><span className="text-black">All Standard Services plus</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Inside Microwave</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Exterior of Kitchen Cabinets</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Dust Very High / Cluttered Shelves</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Change Bed Linens</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Inside Fridge</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Inside Oven</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Ceiling Fans</span></li>
							<li className="flex items-start gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-black bg-white border border-gray-300 shadow-sm">✓</span><span className="text-black">Interior Windows</span></li>
							</ul>
						<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-12">
						<PillButton onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}>Get Free Voucher Now</PillButton>
						</div>
						</GlassCard>
						{/* Add-ons Card */}
						<GlassCard className="mb-12 w-full max-w-2xl p-4 sm:p-10 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
						
							<h2 className="font-hero-sub text-2xl sm:text-3xl tracking-[0.2em] text-center mb-4 sm:mb-6 text-brand font-bold">ADD-ONS</h2>
						<ul className="text-base sm:text-lg text-black flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-10 leading-snug sm:leading-relaxed" style={{ fontWeight: 300 }}>
							<li className="flex items-start gap-3"><span className="text-black">Laundry</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Spot Cleaning Walls</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Hand Scrubbing</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Vacuum Dusting</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Eco-friendly Consumables</span></li>
							<li className="flex items-start gap-3"><span className="text-black">QC Photos</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Air Freshener</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Reset Fridge</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Deodorizer</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Paper Towel Reset</span></li>
							<li className="flex items-start gap-3"><span className="text-black">Swap Sponges</span></li>
							</ul>
						<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-12">
						<PillButton onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}>Get Free Voucher Now</PillButton>
						</div>
						</GlassCard>

					{/* WITHOUT US / WITH US SECTION REMOVED */}
					</section>

				{/* SERVICE AREA SECTION */}
				{/* Moved above; original removed to avoid duplicate */}

					{/* ESTIMATE SECTION REMOVED TO REDUCE CLUTTER */}

					{/* CONTACT & FOOTER SECTION - simplified */}
					<footer className="flex flex-col items-center gap-4 py-8 border-t border-gray-200 mt-12">
						<button 
							onClick={() => window.dispatchEvent(new Event("open-lead-popup"))}
							className="px-8 py-4 rounded-full text-lg font-bold bg-midnight text-white hover:bg-black transition-colors"
						>
							CLAIM FREE VOUCHER
						</button>
						<div className="text-xs text-mountain">© Scaling Home Services</div>
					</footer>
				</div>

					{/* Cal.com removed */}

		</div>
	);
}
