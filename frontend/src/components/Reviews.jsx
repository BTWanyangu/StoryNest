import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Pause, Play, Quote, Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Laura S.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    text: `My daughter had a tough day at school on Tuesday, a falling out with her best friend. I typed what happened into Moonspun and that night her story was about a girl who found a way to mend something that felt broken. She didn't know I did it. She just said it was the best story she'd ever heard. I cried.`,
  },
  {
    id: 2,
    name: "Charlotte T.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: `My son is seven. I know that in a few years he will think bedtime stories are babyish. So every single night right now matters more than I can explain. Moonspun means I never run out of stories, I never repeat one, and I never have to say 'not tonight.' I am not wasting a single night of this window.`,
  },
  {
    id: 3,
    name: "Dani K.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
    text: `I am a single mum working full time. By 7:30pm I have nothing left. I used to feel so guilty putting my daughter to bed without a proper story. Now I type three words into Moonspun and sixty seconds later she is hearing an adventure about herself that I could never have invented on my best day. It did not fix my exhaustion. It just made sure she does not feel it.`,
  },
  {
    id: 4,
    name: "Jason B.",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80",
    text: `I travel for work three weeks out of four. I miss bedtime more than I miss anything else in my life. My wife sets up Moonspun before I land, puts in something I told her about our daughter's week, and by the time I call to say goodnight she has already heard a story that has a piece of me in it somehow. It is not the same as being there. But it is the closest thing I have and really appreciate.`,
  },
  {
    id: 5,
    name: "Maria L.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    text: `My mother only speaks Spanish and my children are growing up in English. I set Moonspun to bilingual mode and now every story has both. Last week my daughter used a Spanish word at dinner that she had only ever heard in her Moonspun story. My mother cried. I cannot put a price on that.`,
  },
  {
    id: 6,
    name: "Hazel R.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    text: `I went down a rabbit hole at 2am reading about blue light and children's developing eyes. What I found scared me. Children's eyes cannot filter blue light the way adult eyes can. The damage to the photoreceptors in a developing retina is cumulative and irreversible. My son had been falling asleep to his tablet every night for two years. I cancelled his screen time that night and found Moonspun the next morning. I have not felt guilty about bedtime since.`,
  },
  {
    id: 7,
    name: "Jackie D.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    text: `My son is four. The first time he heard his own name in a Moonspun story he went completely still and stared at me. Then he whispered - Mummy, it knows me. I have never in my life wanted to freeze a moment more than that one. We have used it every night for two months and he still gets that look. Every single time.`,
  },
  {
    id: 8,
    name: "Olivia M.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    text: `We made every screen time mistake with our first child and watched him struggle with sleep, concentration, and anxiety for years before we connected it to his evening tablet habit. By the time our daughter came along we were not making the same mistakes. No screens after six. Moonspun every night instead. She is three, she sleeps ten hours straight, and she wakes up asking what adventure is coming tonight.`,
  },
  {
    id: 9,
    name: "Luna K.",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    text: `My son's teacher called me in to discuss his concentration levels in class. He was bright but could not focus past the first hour of the morning. She asked about his sleep. I described our evenings, dinner, tablet, bed. We switched to Moonspun that night. His teacher commented on the change within three weeks. I cried in the car on the way home.`,
  },
  {
    id: 10,
    name: "Ruoxi Q.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    text: `Our paediatrician told us at our daughter's four-year well-child check-up that the blue light from her tablet before bed was suppressing her melatonin production so significantly that her brain was not entering deep sleep until almost midnight. We cut screens at bedtime immediately and started Moonspun the same week. Within ten days she was sleeping through.`,
  },
];

function ReviewCard({ review }) {
  return (
    <motion.article
      whileHover={{
        scale: 1.04,
        y: -10,
        transition: { duration: 0.25 },
      }}
      className="group w-[320px] shrink-0 rounded-3xl border border-moon bg-card p-6 shadow-[0_14px_30px_rgba(139,92,246,0.10)] transition-all duration-300 hover:border-violet-400 hover:shadow-[0_22px_45px_rgba(139,92,246,0.18)] sm:w-[360px] lg:w-[400px] lg:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex gap-1 text-yellow-400">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className="h-5 w-5 fill-current"
                strokeWidth={1.5}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.08 }}
              src={review.image}
              alt={review.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-violet-200/40"
            />

            <div className="min-w-0">
              <h4 className="truncate text-base font-bold text-xl text-white">
                {review.name}
              </h4>
              <p className="truncate text-xs text-slate-500"></p>
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.12, rotate: 8 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Quote className="h-8 w-8 text-violet-200" />
        </motion.div>
      </div>

      <p className="mt-6 text-base leading-8 text-white sm:text-lg">
        {review.text}
      </p>
    </motion.article>
  );
}

export default function Review() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [isPaused, setIsPaused] = useState(false);

  const beltReviews = [...reviews, ...reviews];

  return (
    <section ref={sectionRef} className="w-full overflow-hidden px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-600"
          >
            <Star className="h-4 w-4" />
            Trusted by Thousands of Families
          </motion.div>

          <h2 className="mt-8 text-4xl font-bold leading-tight text-moon md:text-6xl">
            Reviews from Our
          </h2>

          <h3 className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
            Happy Readers
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-purple-500 md:text-xl">
            Join thousands of satisfied families who are making the switch to
            Moonspun.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-16"
        >
          <div className="mb-8 flex justify-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-5 py-3 text-sm font-semibold text-violet-600 shadow-md backdrop-blur"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Play Reviews
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause Reviews
                </>
              )}
            </motion.button>
          </div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#0f0a1f] to-transparent sm:w-24" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#0f0a1f] to-transparent sm:w-24" />

            <div
              className="flex w-max gap-6 animate-reviews-marquee"
              style={{
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {beltReviews.map((review, index) => (
                <ReviewCard key={`${review.id}-${index}`} review={review} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-slate-600"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 text-base md:text-lg"
          >
            <BookOpen className="h-5 w-5 text-violet-600" />
            <span className="text-white">30,000+ Stories Generated</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 text-base md:text-lg"
          >
            <Quote className="h-5 w-5 text-violet-600" />
            <span className="text-white">5,000+ Happy Families</span>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes reviews-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-reviews-marquee {
          animation: reviews-marquee 100s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}