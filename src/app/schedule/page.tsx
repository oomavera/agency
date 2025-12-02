"use client";
import { useEffect, useState } from "react";
import { track } from "../../lib/ga4";
// Removed Cal.com embed
import dynamic from "next/dynamic";
// Removed @calcom/embed-react; using iframe embed instead

// Defer Aurora to idle
const DynamicAurora = dynamic(() => import("../../components/ui/ParallaxAurora"), { ssr: false });

// Reviews grid removed from /schedule

export default function SchedulePage() {

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

	// Fire Meta Pixel Lead event on /schedule load
	useEffect(() => {
		if (typeof window === 'undefined') return;
		
		const fireLeadEvent = () => {
			const w = window as Window & { fbq?: (...args: unknown[]) => void };
			if (w.fbq && typeof w.fbq === 'function') {
				try {
					const eventId = `schedule-lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
					w.fbq('track', 'Lead', {
						event_id: eventId,
						content_name: 'Schedule Page Load',
						event_source: 'schedule_page'
					});
					console.log('Meta Pixel Lead event fired for /schedule page');
				} catch (error) {
					console.error('Error firing Meta Pixel Lead event:', error);
				}
			}
		};

		// Try immediately, then retry if needed
		fireLeadEvent();
		
		// Retry after a short delay if fbq wasn't ready
		const retryTimer = setTimeout(() => {
			const w = window as Window & { fbq?: (...args: unknown[]) => void };
			if (w.fbq && typeof w.fbq === 'function') {
				fireLeadEvent();
			}
		}, 500);

		// GA4 funnel step: arrived schedule page
		try { track({ name: 'schedule_page_view' }); } catch {}
		
		return () => clearTimeout(retryTimer);
	}, []);



    // Reviews grid removed; no shuffle required

    const smsHref = (prefill?: string) => {
        const body = prefill ? encodeURIComponent(prefill) : undefined;
        return body ? `sms:+14072700379?&body=${body}` : `sms:+14072700379`;
    };


    return (
        <div id="main-content" className="min-h-screen w-full font-nhd text-midnight">
            {/* HERO SECTION - ABOVE THE FOLD */}
            <section className="relative bg-white min-h-screen flex flex-col overflow-visible">
                {showAurora && (
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <DynamicAurora />
                    </div>
                )}
                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 max-w-3xl mx-auto w-full mt-2 sm:mt-6 gap-6">
                    <div className="relative z-20 text-center mb-4 sm:mb-6 no-blend">
                        <h1 className="font-hero-title text-4xl xs:text-5xl md:text-6xl xl:text-7xl mb-3 leading-[1.05] text-solid-black tracking-tight">
                            ONE LAST STEP!
                        </h1>
                        <div className="text-xl xs:text-2xl md:text-3xl xl:text-4xl font-light text-solid-black space-y-1.5 leading-[1.25]">
                            <p><span className="font-extrabold underline">Text Elias</span> what time you can take a phone call to schedule at</p>
                            <p className="font-black text-4xl xs:text-5xl md:text-6xl">
                                <a
                                    href={smsHref("Hi Elias! I can take a call at [time] to schedule my clean.")}
                                    className="text-solid-black hover:opacity-90 focus:outline-none focus:ring-4 ring-white/60 ring-offset-2 ring-offset-white/40"
                                    aria-label="Text 407-270-0379"
                                >
                                    407-270-0379
                                </a>
                            </p>
                            <p>Chose a time between 7am - 7pm</p>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-3">
						<a
                                href={smsHref("Hi Elias! I can take a call at [time] to schedule my clean.")}
							className="relative inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-5 sm:py-6 rounded-full text-2xl sm:text-3xl font-black w-full max-w-xl glow-pulse
                                bg-white/60 text-midnight border border-white/70 backdrop-blur-2xl overflow-hidden
                                shadow-[0_20px_60px_rgba(2,6,23,0.18),0_6px_14px_rgba(2,6,23,0.14)] hover:shadow-[0_28px_80px_rgba(2,6,23,0.28),0_12px_24px_rgba(2,6,23,0.18)]
                                drop-shadow-[0_30px_40px_rgba(2,6,23,0.25)] hover:drop-shadow-[0_40px_60px_rgba(2,6,23,0.35)]
                                hover:-translate-y-0.5 transition-all duration-300
                                focus:outline-none focus:ring-4 ring-white/60 ring-offset-2 ring-offset-white/40"
                            >
                                {/* Iridescent glow */}
                                <span aria-hidden className="pointer-events-none absolute -inset-6 rounded-full opacity-25 blur-2xl
                                    bg-[conic-gradient(from_210deg_at_50%_50%,#fde68a_0%,#fbcfe8_25%,#c7d2fe_50%,#a7f3d0_75%,#fde68a_100%)]"></span>
                                {/* Top highlight for glass depth */}
                                <span aria-hidden className="pointer-events-none absolute inset-[1px] rounded-full bg-gradient-to-b from-white/80 to-white/10 opacity-70 mix-blend-screen"></span>
                                {/* Bottom ambient shadow inside button for curvature illusion */}
                                <span aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[85%] h-10 rounded-full bg-slate-900/20 blur-2xl opacity-40"></span>
                                <span className="relative z-10">Text now</span>
						</a>
                        </div>
                    </div>

                    {/* Calendar embed removed */}

                    {/* Gallery moved below reviews for /schedule */}

                    {/* Reviews section removed */}

                    {/* Photo gallery removed */}

                    {/* Footer removed for minimalist landing */}
                </div>
            </section>
        </div>
    );
}
