// src/pages/LandingPage.jsx

import { motion } from 'framer-motion';
import { BookOpen, Globe, Sparkles, Users, Zap } from 'lucide-react';
import FAQs from '../components/FAQs';
import Stats from '../components/Stats';
import Footer from '../components/Footer';
import Review from '../components/Reviews';
import { MotionButton, MotionCard } from '../components/shared/UI';
import { useApp } from '../app/AppContext';

const features = [
  [
    Sparkles,
    'PERSONALIZED',
    'Hearing their own name in every story sparks excitement and turns each moment into a memory you’ll never forget. Every child deserves a story that was made for no one else but them.',
  ],
  [
    BookOpen,
    'STORY LIBRARY',
    'Save their favourite stories to a personal library, you can return to anytime.',
  ],
  [
    Users,
    'MULTI-CHILD READY',
    'So every child feels included and is part of the magical experience. Pro supports up to 2 children, Pro Unlimited supports up to 6 children.',
  ],
  [
    Zap,
    'FAST GENERATION',
    'New bedtime stories in 10–20 seconds. Plus a new age appropriate word for your child to learn every night to increase their vocabulary.',
  ],
  [
    Globe,
    'BILINGUAL MODE',
    'For parents who want their children to learn different languages or to retain their family heritage language.',
  ],
];

export default function LandingPage() {
  const { choosePlanFromLanding } = useApp();

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 md:py-14 lg:px-8">
        {/* Hero */}
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 block text-6xl animate-floaty sm:text-7xl md:text-8xl"
        >
          🌙
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 max-w-5xl text-3xl leading-tight text-moon sm:text-4xl md:text-5xl lg:text-6xl"
        >
          They won’t stay little forever so make{' '}
          <em className="text-purple3">bedtime count</em> together.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8 md:text-[1.05rem]"
        >
          86% of working parents feel they’re missing precious moments with
          their children - as excessive screen time quietly takes over.{' '}
          <span className="font-bold text-white">
            Moonspun helps you take those moments back, turning bedtime into
            magical, calming experiences you share together. Personalised
            stories, made in seconds, with your child at the heart of every
            adventure.
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row"
        >
          <MotionButton
            onClick={() => choosePlanFromLanding('pro')}
            className="rounded-full bg-gradient-to-br from-moon2 to-moon px-8 py-4 text-base font-extrabold text-night shadow-moon"
          >
            Start 3-day trial
          </MotionButton>

          <MotionButton
            onClick={() =>
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="rounded-full border border-white/20 px-8 py-4 text-base font-bold text-text transition hover:border-purple2 hover:text-purple3"
          >
            See pricing
          </MotionButton>
        </motion.div>

        {/* Features */}
        <div className="grid w-full max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map(([Icon, title, desc], index) => (
            <MotionCard
              key={title}
              delay={0.06 * index}
              className="group relative overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(36,34,82,0.96)_0%,rgba(24,22,60,0.96)_100%)] px-4 py-7 text-center shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#f5c85b]/45 hover:shadow-[0_18px_40px_rgba(11,10,40,0.42)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />
              <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#f5c85b]/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner shadow-white/5 transition duration-300 group-hover:scale-105 group-hover:border-[#f5c85b]/30 group-hover:bg-[#f5c85b]/[0.08]">
                  <Icon className="h-6 w-6 text-[#f5c85b]" strokeWidth={2.1} />
                </div>
              </div>

              <h3 className="mb-2 text-[1.02rem] font-semibold tracking-tight text-white">
                {title}
              </h3>

              <p className="text-sm leading-6 text-slate-300">{desc}</p>
            </MotionCard>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 w-full overflow-hidden rounded-[28px] border border-white/10 bg-card/30 px-2 py-4 sm:px-4"
        >
          <Stats />
        </motion.div>

        {/* Better bedtime section */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 w-full max-w-5xl rounded-[28px] border border-white/12 bg-card/80 px-6 py-8 text-left shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:px-8 md:px-10"
        >
          <div className="mb-4 inline-flex rounded-full border border-moon/25 bg-moon/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-moon">
            Better bedtime starts tonight
          </div>

          <h2 className="mb-5 font-display text-2xl leading-tight text-moon sm:text-3xl md:text-4xl">
            Join thousands of parents who have already made the switch.
          </h2>

          <p className="mb-5 text-base leading-8 text-text/90">
            74% of children are addicted to screens before bedtime, often
            falling asleep to blue light that actively damages developing eyes
            and suppresses melatonin. They fall asleep eventually yes, but
            their brain doesn’t rest the way it should. It doesn’t happen
            overnight but it’s happening every night.
          </p>

          <p className="text-base leading-8 text-text/90">
            Moonspun was created to address this globally increasing health
            concern in young developing children, by replacing screen time
            before bedtime with the one thing your child needs the most, your
            voice reading to them. Replace a screen with a deeper bond with your
            child tonight.
          </p>
        </motion.section>

        {/* Pricing */}
        <motion.section
          id="pricing"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 w-full text-center"
        >
          <h2 className="mb-2 font-display text-3xl text-moon">
            Choose your plan
          </h2>

          <p className="mb-8 font-semibold text-white">
            Both paid plans include a 3-day free trial. You are then charged automatically for the plan you have selected, after the free trial has ended, which you can cancel in your account at any time.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 lg:flex-row">
            {/* Pro */}
            <MotionCard
              role="button"
              tabIndex={0}
              onClick={() => choosePlanFromLanding('pro')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  choosePlanFromLanding('pro');
                }
              }}
              className="relative w-full max-w-[360px] cursor-pointer rounded-[22px] border-2 border-[#f5c85b] bg-[#1f2147] p-8 text-left transition hover:border-star hover:shadow-moon"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#f5c85b] px-4 py-1 text-xs font-extrabold text-black">
                MOST POPULAR
              </div>

              <div className="mb-3 text-lg font-bold text-white">Pro</div>

              <div className="mb-6 text-4xl font-extrabold text-[#f5c85b]">
                $8.99
                <span className="ml-1 text-sm font-normal text-gray-300">
                  /month
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-200">
                <div>
                  <span className="font-bold text-moon">✓</span> 50 stories per
                  month
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Up to 2 child
                  profiles
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Bilingual mode
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Auto next
                  episodes
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Voice narration
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Save 50 stories
                  to your library
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> 3-day free
                  trial
                </div>
              </div>

              <p className="mt-6 text-xs leading-5 text-gray-400">
                Card required. You will be charged automatically after the 3-day
                free trial ends, which you can cancel at any time.
              </p>

              <MotionButton
                onClick={(event) => {
                  event.stopPropagation();
                  choosePlanFromLanding('pro');
                }}
                className="mt-6 w-full rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-extrabold text-night shadow-moon"
              >
                Start Pro trial
              </MotionButton>
            </MotionCard>

            {/* Pro Unlimited */}
            <MotionCard
              role="button"
              tabIndex={0}
              onClick={() => choosePlanFromLanding('pro_unlimited')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  choosePlanFromLanding('pro_unlimited');
                }
              }}
              className="relative w-full max-w-[360px] cursor-pointer rounded-[22px] border-2 border-[#f5c85b] bg-[#1f2147] p-8 text-left transition hover:border-star hover:shadow-moon"
            >
              <div className="mb-3 text-lg font-bold text-white">
                Pro Unlimited
              </div>

              <div className="mb-6 text-4xl font-extrabold text-[#f5c85b]">
                $14.99
                <span className="ml-1 text-sm font-normal text-gray-300">
                  /month
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-200">
                <div>
                  <span className="font-bold text-moon">✓</span> Unlimited
                  stories per month
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Up to 6 child
                  profiles
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Bilingual mode
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Story series
                  library
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Auto next
                  episodes
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Voice narration
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> Save unlimited
                  stories to your library
                </div>
                <div>
                  <span className="font-bold text-moon">✓</span> 3-day free
                  trial
                </div>
              </div>

              <p className="mt-6 text-xs leading-5 text-gray-400">
                Card required. You will be charged automatically after the 3-day
                free trial ends, which you can cancel at any time.
              </p>

              <MotionButton
                onClick={(event) => {
                  event.stopPropagation();
                  choosePlanFromLanding('pro_unlimited');
                }}
                className="mt-6 w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-extrabold text-white shadow-purple"
              >
                Start Pro Unlimited trial
              </MotionButton>
            </MotionCard>
          </div>
        </motion.section>
      </main>

      <Review />
      <FAQs />

      <Footer
        setScreen={(screen) => {
          if (screen === 'privacy') window.location.href = '/privacy';
          if (screen === 'ToS') window.location.href = '/terms';
          if (screen === 'CookiePolicy') window.location.href = '/cookies';
        }}
      />
    </>
  );
}