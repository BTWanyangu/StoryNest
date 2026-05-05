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
    'Hearing their own name in every story turns bedtime into a memory made just for them.',
  ],
  [
    BookOpen,
    'STORY LIBRARY',
    'Save favourite stories to a personal library you can return to anytime.',
  ],
  [
    Users,
    'MULTI-CHILD READY',
    'Pro supports up to 2 children. Pro Unlimited supports up to 6 children.',
  ],
  [
    Zap,
    'FAST GENERATION',
    'New bedtime stories in seconds, with an age-appropriate word to learn every night.',
  ],
  [
    Globe,
    'BILINGUAL MODE',
    'Create stories in different languages for learning and family heritage.',
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
          Moonspun helps parents replace screen time with calming,
          personalised bedtime stories made in seconds, with your child
          at the heart of every adventure.
        </motion.p>

        {/* CTA */}
        <div className="mb-12 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
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
        </div>

        {/* Features */}
        <div className="grid w-full max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map(([Icon, title, desc], index) => (
            <MotionCard
              key={title}
              delay={0.06 * index}
              className="group relative overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(36,34,82,0.96)_0%,rgba(24,22,60,0.96)_100%)] px-4 py-7 text-center shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
            >
              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-6 w-6 text-[#f5c85b]" />
                </div>
              </div>

              <h3 className="mb-2 text-[1.02rem] font-semibold tracking-tight text-white">
                {title}
              </h3>

              <p className="text-sm leading-6 text-slate-300">
                {desc}
              </p>
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

        {/* Pricing */}
        {/* Pricing */}
<section id="pricing" className="mt-14 w-full text-center">
  <h2 className="mb-2 font-display text-3xl text-moon">
    Choose your plan
  </h2>

  <p className="mb-8 text-white font-semibold">
    Both paid plans include a 3-day free trial. You are charged
    automatically after the trial unless you cancel.
  </p>

  <div className="flex flex-col items-center justify-center gap-6 lg:flex-row">
    {/* PRO */}
    <div
      onClick={() => choosePlanFromLanding('pro')}
      className="relative w-full max-w-[360px] cursor-pointer rounded-[22px] border-2 border-[#f5c85b] bg-[#1f2147] p-8 text-left"
    >
      {/* Badge */}
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
        <div>✓ 50 stories per month</div>
        <div>✓ Up to 2 child profiles</div>
        <div>✓ Bilingual mode</div>
        <div>✓ Auto next episodes</div>
        <div>✓ Voice narration</div>
        <div>✓ Save 50 stories to your library</div>
        <div>✓ 3-day free trial</div>
      </div>

      <p className="mt-6 text-xs text-gray-400 leading-5">
        Card required. You will be charged automatically after the
        3-day free trial ends, which you can cancel at any time.
      </p>

      <MotionButton
        onClick={(e) => {
          e.stopPropagation();
          choosePlanFromLanding('pro');
        }}
        className="mt-6 w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-extrabold text-white"
      >
        Start trial
      </MotionButton>
    </div>

    {/* PRO UNLIMITED */}
    <div
      onClick={() => choosePlanFromLanding('pro_unlimited')}
      className="relative w-full max-w-[360px] cursor-pointer rounded-[22px] border-2 border-[#f5c85b] bg-[#1f2147] p-8 text-left"
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
        <div>✓ Unlimited stories per month</div>
        <div>✓ Up to 6 child profiles</div>
        <div>✓ Bilingual mode</div>
        <div>✓ Story series library</div>
        <div>✓ Auto next episodes</div>
        <div>✓ Voice narration</div>
        <div>✓ Save unlimited stories to your library</div>
        <div>✓ 3-day free trial</div>
      </div>

      <p className="mt-6 text-xs text-gray-400 leading-5">
        Card required. You will be charged automatically after the
        3-day free trial ends, which you can cancel at any time.
      </p>

      <MotionButton
        onClick={(e) => {
          e.stopPropagation();
          choosePlanFromLanding('pro_unlimited');
        }}
        className="mt-6 w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-sm font-extrabold text-white"
      >
        Start trial
      </MotionButton>
    </div>
  </div>
</section>
      </main>

      <Review />
      <FAQs />
      <Footer
        setScreen={(screen) => {
          if (screen === 'privacy') location.href = '/privacy';
          if (screen === 'ToS') location.href = '/terms';
          if (screen === 'CookiePolicy')
            location.href = '/cookies';
        }}
      />
    </>
  );
}