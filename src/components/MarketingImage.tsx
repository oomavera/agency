"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MarketingImage() {
  return (
    <motion.div 
      className="group relative"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="bg-arctic/40 backdrop-blur-sm border border-slopes/30 rounded-2xl flex flex-col justify-center items-center p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.01]">
        <div className="text-center w-full">
          {/* Hero Image */}
          <div className="relative bg-gradient-to-br from-snow to-arctic/80 rounded-xl p-4 border border-slopes/20 shadow-inner mb-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image 
                src="/Gallery/cleans/IMG_2538.webp" 
                alt="Professional house cleaning service" 
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-snow">
                <h3 className="text-lg font-semibold">Professional Cleaning</h3>
                <p className="text-sm opacity-90">Licensed • Insured • 5-Star Rated</p>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="p-4 bg-gradient-to-br from-arctic/60 to-slopes/30 rounded-xl border border-slopes/20">
            <div className="grid grid-cols-5 gap-4 justify-center items-center">
              <div className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arctic to-slopes border-2 border-apres-ski/30 mx-auto mb-2 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-lg">🛡️</span>
                </div>
                <div className="text-xs font-semibold text-midnight">1M$ Insured</div>
                <div className="text-xs text-apres-ski">Bonded Pros</div>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arctic to-slopes border-2 border-apres-ski/30 mx-auto mb-2 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-lg">✓</span>
                </div>
                <div className="text-xs font-semibold text-midnight">Background</div>
                <div className="text-xs text-apres-ski">Verified</div>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arctic to-slopes border-2 border-apres-ski/30 mx-auto mb-2 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-lg">💯</span>
                </div>
                <div className="text-xs font-semibold text-midnight">Satisfaction</div>
                <div className="text-xs text-apres-ski">Guaranteed</div>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arctic to-slopes border-2 border-apres-ski/30 mx-auto mb-2 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-lg">💰</span>
                </div>
                <div className="text-xs font-semibold text-midnight">No Hidden</div>
                <div className="text-xs text-apres-ski">Fees</div>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arctic to-slopes border-2 border-apres-ski/30 mx-auto mb-2 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-lg">⭐</span>
                </div>
                <div className="text-xs font-semibold text-midnight">5 Star</div>
                <div className="text-xs text-apres-ski">Google Reviews</div>
              </div>
            </div>
          </div>

          {/* Service Areas Quick List */}
          <div className="mt-4 text-center">
            <h4 className="text-sm font-semibold text-midnight mb-2">Serving All of Seminole County</h4>
            <div className="text-xs text-mountain space-y-1">
              <div>Altamonte Springs • Casselberry • Lake Mary • Longwood • Oviedo • Sanford</div>
              <div>Winter Springs • Heathrow • Wekiwa Springs • Fern Park • Chuluota</div>
              <div>Geneva • Goldenrod • Midway • Black Hammock</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}