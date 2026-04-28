import { Heart, BookOpen, PlaySquare, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const featureHighlights = [
  {
    title: "Safe & Secure",
    subtitle: "COPPA-compliant platform",
    icon: Heart,
  },
  {
    title: "AI-Powered Stories",
    subtitle: "Personalized for each child",
    icon: BookOpen,
  },
  {
    title: "Multilingual Support",
    subtitle: "Fluent before they know it",
    icon: Globe,
  },
];

export default function Footer({setScreen}) {
  return (
    <footer className="relative w-full text-white overflow-hidden">
      
      {/* 🔥 TOP GLOW DIVIDER */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-moon to-transparent opacity-70" />

      {/* 🌌 BACKGROUND ENHANCEMENT */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050816] to-[#02030a]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-7xl px-6 py-20 md:px-10 lg:px-12 xl:px-16"
      >
        {/* 🔥 MAIN SECTION */}
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
          
          {/* LEFT: LOGO + TEXT */}
          <div className="flex flex-col items-center text-center gap-6 md:flex-row md:text-left lg:flex-[1.2]">
            <img
              src={logo}
              alt="StoryNest Logo"
              className="h-20 md:h-24 w-auto object-contain shrink-0"
            />

            <p className="max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              Apps come and go. Moonspun stays, in the memories your child carries into adulthood of the nights they were the hero. Tonight thousands of children went to bed empowered, as the hero of their own unique story. Tomorrow night, yours can too.
            </p>
          </div>

          {/* RIGHT: FEATURES */}
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto lg:mx-0">
            {featureHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-950/60 border border-white/10">
                    <Icon className="h-7 w-7 text-indigo-300" strokeWidth={2} />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-moon md:text-xl">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-300 md:text-base">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 🔥 BOTTOM SECTION */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 text-slate-400 md:flex-row md:items-center md:justify-between">
            
            <p className="text-sm md:text-base text-center md:text-left">
              © 2026 Moonspun. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-8">
              <button onClick={() => setScreen('ToS')} className="text-sm transition hover:text-moon md:text-base">
                Terms of Service
              </button>
              <button onClick={() => setScreen('privacy')} className="text-sm transition hover:text-moon md:text-base">
                Privacy Policy
              </button>
              <a href="#" className="text-sm transition hover:text-moon md:text-base">
                Cookie Policy
              </a>
            </div>

          </div>
        </div>
      </motion.div>
    </footer>
  );
}